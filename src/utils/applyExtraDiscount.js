export function applyExtraDiscount(extraDiscount, price, variantId) {
  const p = Number(price);
  if (!extraDiscount || !Number.isFinite(p) || p <= 0) return p;

  // --- ambil rule per-variant jika ada (dari backend) ---
  const rulesByVariantId =
    extraDiscount.rulesByVariantId ?? extraDiscount.rules_by_variant_id ?? null;

  let rule = null;

  if (
    variantId !== null &&
    variantId !== undefined &&
    rulesByVariantId &&
    typeof rulesByVariantId === "object"
  ) {
    const keyStr = String(variantId);
    rule =
      rulesByVariantId[keyStr] ?? rulesByVariantId[Number(variantId)] ?? null;
  }

  // fallback ke representative rule kalau per-variant rule tidak ada
  const valueType = Number(
    rule?.valueType ??
      rule?.value_type ??
      extraDiscount.valueType ??
      extraDiscount.value_type ??
      1,
  );

  const value = Number(rule?.value ?? extraDiscount.value ?? 0);
  if (!Number.isFinite(value) || value <= 0) return p;

  const maxRaw =
    rule?.maxDiscount ??
    rule?.max_discount ??
    extraDiscount.maxDiscount ??
    extraDiscount.max_discount;

  const maxDiscount =
    maxRaw === null || maxRaw === undefined || maxRaw === ""
      ? null
      : Number(maxRaw);

  const maxCap =
    maxDiscount !== null && Number.isFinite(maxDiscount) && maxDiscount > 0
      ? maxDiscount
      : null;

  let disc = 0;

  if (valueType === 2) {
    // fixed
    disc = value;
  } else if (valueType === 1) {
    // percent
    const raw = (p * value) / 100;
    const capped = maxCap !== null ? Math.min(raw, maxCap) : raw;
    disc = capped;
  } else {
    return p;
  }

  disc = Math.min(Math.max(0, disc), p);
  return Math.max(0, p - disc);
}
