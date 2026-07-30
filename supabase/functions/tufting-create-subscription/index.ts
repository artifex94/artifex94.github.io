// Edge Function: tufting-create-subscription
//
// Creates a MercadoPago preapproval (Suscripciones API) so a rug can be paid in
// automatic monthly debits instead of a single charge.
//
// WHY A DIFFERENT API THAN CHECKOUT PRO: "cuotas sin interés" inside Checkout
// Pro are funded by the seller — the financing cost runs from roughly 12% at
// three instalments up to 25-30% at twelve, deducted from the payout. Automatic
// debit does not work that way: each month is charged as it comes, so there is
// no advance to finance and the seller keeps the full price. That is exactly why
// this path carries NO discount: it is already the better channel for the shop.
//
// LA SEÑA ES LA PRIMERA CUOTA (modelo 2026-07-28): antes había un anticipo del
// 50%, pero Checkout Pro permite dividir cualquier pago único en cuotas, así
// que "señar la mitad" podía terminar en la mitad EN CUOTAS. Ahora el total se
// divide en N cuotas iguales; la primera que se debita hace de seña y arranca
// el trabajo, y las siguientes se debitan solas.
//
// Deploy: supabase functions deploy tufting-create-subscription --project-ref <ref>
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, json, readJsonBody } from '../_shared/http.ts';
import { priceQuote, INSTALMENT_OPTIONS, instalmentAmountArs } from '../_shared/pricing.ts';
const MP_API = 'https://api.mercadopago.com';
const SITE_URL = () => Deno.env.get('ALLOWED_ORIGIN')?.split(',')[0] ?? 'https://artifex.click';
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);
  const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!accessToken || !supabaseUrl || !serviceRoleKey) {
    return json(req, { error: 'Server misconfigured' }, 500);
  }
  const body = await readJsonBody(req);
  if (!body) return json(req, { error: 'Invalid or oversized body' }, 400);
  // La lista vive en _shared/pricing.ts, que es el mismo archivo que espeja el
  // sitio: si el select ofreciera una opción que acá no está, el cliente comería
  // un 400 justo al momento de pagar.
  const instalments = body.instalments ?? Math.max(...INSTALMENT_OPTIONS);
  if (!INSTALMENT_OPTIONS.includes(instalments)) {
    return json(req, { error: 'Cantidad de cuotas no disponible.' }, 400);
  }
  if (!body.payerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.payerEmail)) {
    return json(req, { error: 'Hace falta un email válido para el débito automático.' }, 400);
  }
  // Instalments carry no discount, so no codes are redeemed on this path.
  const quote = priceQuote(body, []);
  if (!quote) {
    return json(req, { error: 'Esas medidas no se pueden cotizar automáticamente.' }, 400);
  }
  // Cuotas iguales que cubren el total; la primera debitada es la seña.
  //
  // MercadoPago cobra un monto fijo en todas las repeticiones de un preapproval,
  // así que no hay forma de que la última cuota absorba el resto: las cuotas son
  // iguales y el redondeo deja el total apenas por encima del cotizado, a favor
  // del taller y por menos de INSTALMENT_STEP por cuota.
  const monthly = instalmentAmountArs(quote.amountArs, instalments);
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: saved, error: insertError } = await supabase
    .from('tufting_quotes')
    .insert({
      shape: body.shape,
      diameter_cm: body.diameterCm ?? null,
      width_cm: body.widthCm ?? null,
      height_cm: body.heightCm ?? null,
      area_m2: quote.areaM2,
      wool_ids: body.woolIds ?? [],
      amount_ars: quote.amountArs,
      list_amount_ars: quote.listAmountArs,
      discount_id: null,
      contact_name: body.contact?.name ?? null,
      contact_email: body.payerEmail,
      contact_phone: body.contact?.phone ?? null,
      payment_mode: 'subscription',
    })
    .select('id')
    .single();
  if (insertError || !saved) return json(req, { error: 'Could not store the quote' }, 500);
  const site = SITE_URL();
  const preapproval = {
    reason: `Alfombra de tufting ${body.shape} · ${quote.billableAreaM2.toFixed(2)} m2`,
    external_reference: saved.id,
    payer_email: body.payerEmail,
    back_url: `${site}/servicios/tufting/calculadora/gracias`,
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      // Bounded run: the debit stops on its own once the piece is paid off.
      repetitions: instalments,
      billing_day_proportional: false,
      transaction_amount: monthly,
      currency_id: 'ARS',
    },
    status: 'pending',
  };
  const response = await fetch(`${MP_API}/preapproval`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': saved.id,
    },
    body: JSON.stringify(preapproval),
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error('MP preapproval rejected', response.status, detail);
    // El débito automático (preapproval) exige que el pagador tenga cuenta en
    // MercadoPago. Cuando el email no corresponde a una cuenta MP, la API
    // responde "Both payer and collector must be real or test users". Ese caso
    // es del cliente, no del servidor: le damos un mensaje accionable en vez de
    // un error opaco. Para pagar sin cuenta MP está el botón "Pagar" (Checkout
    // Pro también permite cuotas con tarjeta).
    if (detail.includes('must be real or test users')) {
      return json(req, {
        error:
          'Para el débito automático necesitás el email de tu cuenta de MercadoPago. Si no tenés, usá "Pagar" (podés elegir cuotas con tu tarjeta) o escribime por WhatsApp.',
      }, 400);
    }
    return json(req, { error: 'MercadoPago rejected the subscription' }, 502);
  }
  const created = await response.json();
  await supabase.from('tufting_quotes').update({ mp_preapproval_id: created.id }).eq('id', saved.id);
  return json(req, {
    quoteId: saved.id,
    initPoint: created.init_point,
    // La primera cuota hace de seña; se mantiene depositArs por compat.
    firstInstalmentArs: monthly,
    depositArs: monthly,
    monthlyArs: monthly,
    instalments,
  });
});
