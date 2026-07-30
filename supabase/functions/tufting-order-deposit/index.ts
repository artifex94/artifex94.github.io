// Edge Function: tufting-order-deposit
//
// Creates a MercadoPago Checkout Pro preference for an existing manual tufting
// order, charging the full quoted amount.
//
// WHY FULL ONLY: the old 50% "seña" was removed on purpose. Checkout Pro lets
// the buyer split ANY single charge into card instalments, so a half deposit
// could end up as "half, in instalments" — broken logic. The web always charges
// the TOTAL; if the buyer wants 2 or 3 card instalments, the MercadoPago
// gateway itself offers that split, per the account configuration.
//
// THE RULE THAT MATTERS: the browser only chooses the order. The charged
// amount always comes from the stored quote on the server.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, json, readJsonBody } from '../_shared/http.ts';
const MP_API = 'https://api.mercadopago.com';
const SITE_URL = () => Deno.env.get('ALLOWED_ORIGIN')?.split(',')[0] ?? 'https://artifex.click';
const cleanText = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json(req, { error: 'Server misconfigured' }, 500);
  const body = await readJsonBody(req);
  const orderId = cleanText(body?.orderId);
  // 'half' queda rechazado a propósito: ver el comentario de cabecera.
  const portion = body?.portion ?? 'full';
  if (!orderId || portion !== 'full') {
    return json(req, { error: 'Invalid body' }, 400);
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: quote, error: quoteError } = await supabase
    .from('tufting_quotes')
    .select('id, amount_ars, status')
    .eq('id', orderId)
    .single();
  if (quoteError || !quote) return json(req, { error: 'no_encontrado' }, 404);
  const order = quote;
  if (order.status === 'approved') return json(req, { error: 'ya_pagado' }, 409);
  const charged = order.amount_ars;
  const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
  if (!accessToken) return json(req, { error: 'mp_unavailable' }, 503);
  const { error: updateError } = await supabase
    .from('tufting_quotes')
    .update({ deposit: false, deposit_amount_ars: charged })
    .eq('id', orderId);
  if (updateError) return json(req, { error: 'Could not update the order' }, 500);
  const site = SITE_URL();
  const preference = {
    items: [
      {
        title: 'Alfombra de tufting',
        quantity: 1,
        currency_id: 'ARS',
        // Server-owned quote price; the browser never supplies an amount.
        unit_price: charged,
      },
    ],
    external_reference: orderId,
    notification_url: `${supabaseUrl}/functions/v1/tufting-mp-webhook`,
    back_urls: {
      success: `${site}/servicios/tufting/calculadora/gracias`,
      pending: `${site}/servicios/tufting/calculadora/gracias`,
      failure: `${site}/servicios/tufting/calculadora`,
    },
    auto_return: 'approved',
  };
  const response = await fetch(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      // Keyed on order + portion so repeat clicks dedupe.
      'X-Idempotency-Key': `${orderId}:full`,
    },
    body: JSON.stringify(preference),
  });
  if (!response.ok) return json(req, { error: 'MercadoPago rejected the preference' }, 502);
  const created = await response.json();
  await supabase.from('tufting_quotes').update({ mp_preference_id: created.id }).eq('id', orderId);
  return json(req, { orderId, initPoint: created.init_point });
});
