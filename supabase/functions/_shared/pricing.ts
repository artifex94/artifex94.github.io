// Tufting pricing — server-side source of truth.
//
// MIRROR OF: artifex94.github.io/src/data/tuftingPricing.ts
// If you change a constant here, change it there too. The site has a test
// (tuftingPricing.test.ts, "las constantes coinciden con el backend de pagos")
// that pins these exact values, so a one-sided edit fails CI instead of
// silently charging a different amount than the page displayed.
//
// Why duplicate it at all: the site is a static build on GitHub Pages and these
// functions run on Deno. There is no shared module system between them, and
// importing across repos at deploy time would couple two independent releases.
// A duplicated formula plus a pinning test is the honest trade-off — two copies
// drifting apart is the single most likely future bug in this feature.
export const MATERIAL_COST_PER_M2 = 75_000;
export const MIN_MARGIN = 0.5;
export const DISCOUNTS = {
  transferencia: 0.1,
  instagram: 0.05
};
export const MAX_DISCOUNT = Math.max(...Object.values(DISCOUNTS));
/** List price per square metre, solved backwards from the margin floor. */ export const LIST_PRICE_PER_M2 = MATERIAL_COST_PER_M2 * (1 + MIN_MARGIN) / (1 - MAX_DISCOUNT);
export const MIN_BILLABLE_M2 = 0.09;
export const MAX_QUOTABLE_M2 = 6;
export const ROUNDING_STEP = 1_000;
export const MIN_PRICE_ARS = 30_000;
export const MIN_DIMENSION_CM = 25;
export const MAX_DIMENSION_CM = 300;
const roundUpTo = (value, step)=>Math.ceil(value / step - 1e-9) * step;
const isValidSide = (value)=>typeof value === 'number' && Number.isFinite(value) && value >= MIN_DIMENSION_CM && value <= MAX_DIMENSION_CM;
/**
 * Recomputes the area from raw dimensions.
 *
 * The client NEVER sends an amount, and it does not send an area either: a
 * forged `areaM2: 0.01` would produce a cheap price just as effectively as a
 * forged total. Only raw dimensions are accepted, and only for the shapes whose
 * area follows from a closed formula the server can verify on its own.
 *
 * Contoured pieces are deliberately not sellable online: their area comes from
 * measuring an uploaded image, which the server cannot reproduce without also
 * receiving the mask. Those quotes are handed off to WhatsApp instead.
 */ export const areaM2From = (request)=>{
  if (request.shape === 'circular') {
    if (!isValidSide(request.diameterCm)) return null;
    // Óvalo: el eje menor sale del ovalRatio. Ambos ejes deben respetar el mínimo.
    const ovalRatio = request.ovalRatio && request.ovalRatio > 1 ? request.ovalRatio : 1;
    const minorCm = request.diameterCm / ovalRatio;
    if (minorCm < MIN_DIMENSION_CM) return null;
    return Math.PI * (request.diameterCm / 2) * (minorCm / 2) / 10_000;
  }
  if (request.shape === 'rectangular') {
    if (!isValidSide(request.widthCm) || !isValidSide(request.heightCm)) return null;
    return request.widthCm * request.heightCm / 10_000;
  }
  return null;
};
const isDiscountId = (value)=>typeof value === 'string' && value in DISCOUNTS;
const bestDiscount = (applicable)=>{
  let discountId = null;
  let discountRate = 0;
  for (const candidate of applicable){
    const rate = DISCOUNTS[candidate];
    // Discounts never stack: the best applicable one wins.
    if (typeof rate === 'number' && rate > discountRate) {
      discountId = candidate;
      discountRate = rate;
    }
  }
  return {
    discountId,
    discountRate
  };
};
const priceArea = (areaM2, applicable)=>{
  if (!Number.isFinite(areaM2) || areaM2 <= 0 || areaM2 > MAX_QUOTABLE_M2) return null;
  const billableAreaM2 = Math.max(areaM2, MIN_BILLABLE_M2);
  const { discountId, discountRate } = bestDiscount(applicable);
  // Piso de precio: ninguna pieza baja de MIN_PRICE_ARS (ni lista ni con descuento).
  const listAmountArs = Math.max(roundUpTo(billableAreaM2 * LIST_PRICE_PER_M2, ROUNDING_STEP), MIN_PRICE_ARS);
  const amountArs = Math.max(roundUpTo(billableAreaM2 * LIST_PRICE_PER_M2 * (1 - discountRate), ROUNDING_STEP), MIN_PRICE_ARS);
  return {
    areaM2,
    billableAreaM2,
    amountArs,
    listAmountArs,
    discountId,
    discountRate
  };
};
/**
 * Prices a client-declared area with the same formula as dimensional quotes.
 *
 * This exists only for quote requests: contoured pieces still cannot be paid
 * online because the server cannot independently verify the uploaded design's
 * measured area. The amount is useful as an estimate for the manual follow-up.
 */ export const priceFromArea = (areaM2, opts = {})=>{
  const applicable = [];
  if (isDiscountId(opts.discountId)) applicable.push(opts.discountId);
  if (opts.payByTransfer) applicable.push('transferencia');
  return priceArea(areaM2, applicable);
};
/**
 * Prices a request using only server-side constants.
 *
 * `instagram` is never a boolean the client can flip: it is granted only when a
 * redeemable code validated against the database is passed in as `grantedIds`.
 */ export const priceQuote = (request, grantedIds = [])=>{
  const areaM2 = areaM2From(request);
  if (areaM2 === null) return null;
  const applicable = [
    ...grantedIds
  ];
  if (request.payByTransfer) applicable.push('transferencia');
  return priceArea(areaM2, applicable);
};