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
/** Discount identifiers this module knows about. */
export type DiscountId = keyof typeof DISCOUNTS;

/** Raw measurements a client may send. Never an amount, never an area. */
export interface QuoteRequest {
  shape?: string;
  diameterCm?: number;
  ovalRatio?: number;
  widthCm?: number;
  heightCm?: number;
  payByTransfer?: boolean;
}

export interface PricedArea {
  areaM2: number;
  billableAreaM2: number;
  amountArs: number;
  listAmountArs: number;
  discountId: DiscountId | null;
  discountRate: number;
}

/** List price per square metre, solved backwards from the margin floor. */ export const LIST_PRICE_PER_M2 = MATERIAL_COST_PER_M2 * (1 + MIN_MARGIN) / (1 - MAX_DISCOUNT);
export const MIN_BILLABLE_M2 = 0.09;
export const MAX_QUOTABLE_M2 = 6;
export const ROUNDING_STEP = 1_000;
export const MIN_PRICE_ARS = 30_000;
/** Floor for the LIST price, applied before any discount. See the client file. */ export const MIN_LIST_PRICE_ARS = MIN_PRICE_ARS;
/** Minimum list total each discount requires. 0 = no minimum. */ export const DISCOUNT_MIN_LIST_ARS: Record<DiscountId, number> = {
  transferencia: 0,
  instagram: 150_000
};
export const MIN_DIMENSION_CM = 25;
export const MAX_DIMENSION_CM = 300;
const roundUpTo = (value: number, step: number): number =>Math.ceil(value / step - 1e-9) * step;
const isValidSide = (value: unknown): value is number =>typeof value === 'number' && Number.isFinite(value) && value >= MIN_DIMENSION_CM && value <= MAX_DIMENSION_CM;
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
 */ export const areaM2From = (request: QuoteRequest): number | null =>{
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
const isDiscountId = (value: unknown): value is DiscountId => typeof value === 'string' && value in DISCOUNTS;
const bestDiscount = (
  applicable: readonly DiscountId[],
  listTotalArs: number = Number.POSITIVE_INFINITY
): { discountId: DiscountId | null; discountRate: number } =>{
  let discountId: DiscountId | null = null;
  let discountRate = 0;
  for (const candidate of applicable){
    const rate = DISCOUNTS[candidate];
    if (typeof rate !== 'number') continue;
    // Some discounts only apply above a minimum list total.
    if (listTotalArs < (DISCOUNT_MIN_LIST_ARS[candidate] ?? 0)) continue;
    // Discounts never stack: the best applicable one wins.
    if (rate > discountRate) {
      discountId = candidate;
      discountRate = rate;
    }
  }
  return {
    discountId,
    discountRate
  };
};
const priceArea = (areaM2: number, applicable: readonly DiscountId[]): PricedArea | null =>{
  if (!Number.isFinite(areaM2) || areaM2 <= 0 || areaM2 > MAX_QUOTABLE_M2) return null;
  const billableAreaM2 = Math.max(areaM2, MIN_BILLABLE_M2);
  // Order matters: the floor applies to the base BEFORE discounting (applying it
  // last cancelled the discount on small pieces), and the list total is needed
  // before picking a discount because eligibility depends on it.
  const baseArs = Math.max(billableAreaM2 * LIST_PRICE_PER_M2, MIN_LIST_PRICE_ARS);
  const listAmountArs = roundUpTo(baseArs, ROUNDING_STEP);
  const { discountId, discountRate } = bestDiscount(applicable, listAmountArs);
  const amountArs = roundUpTo(baseArs * (1 - discountRate), ROUNDING_STEP);
  // Only report a discount that actually lowered the amount.
  const effective = amountArs < listAmountArs;
  return {
    areaM2,
    billableAreaM2,
    amountArs,
    listAmountArs,
    discountId: effective ? discountId : null,
    discountRate: effective ? discountRate : 0
  };
};
/**
 * Prices a client-declared area with the same formula as dimensional quotes.
 *
 * This exists only for quote requests: contoured pieces still cannot be paid
 * online because the server cannot independently verify the uploaded design's
 * measured area. The amount is useful as an estimate for the manual follow-up.
 */ export const priceFromArea = (
  areaM2: number,
  opts: { discountId?: string; payByTransfer?: boolean } = {}
): PricedArea | null =>{
  const applicable: DiscountId[] = [];
  if (isDiscountId(opts.discountId)) applicable.push(opts.discountId);
  if (opts.payByTransfer) applicable.push('transferencia');
  return priceArea(areaM2, applicable);
};
/**
 * Prices a request using only server-side constants.
 *
 * `instagram` is never a boolean the client can flip: it is granted only when a
 * redeemable code validated against the database is passed in as `grantedIds`.
 *
 * `payByTransfer` is deliberately IGNORED here. That discount exists because a
 * bank transfer carries no platform fee, so granting it on a card payment gave
 * away 10% and paid the fee on top. Anything priced through this function is
 * about to be charged online; transfers are settled over WhatsApp, where the
 * quote (priceFromArea) does honour the discount.
 */ export const priceQuote = (
  request: QuoteRequest,
  grantedIds: readonly DiscountId[] = []
): PricedArea | null =>{
  const areaM2 = areaM2From(request);
  if (areaM2 === null) return null;
  return priceArea(areaM2, [
    ...grantedIds
  ]);
};