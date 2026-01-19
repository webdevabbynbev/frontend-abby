export function applyExtraDiscount(extraDiscount, price) {
  const p = Number(price);
  if (!extraDiscount || !Number.isFinite(p) || p <= 0) return p;

  const valueType = Number(
    extraDiscount.valueType ?? extraDiscount.value_type ?? 1,
  );
  const value = Number(extraDiscount.value ?? 0);
  if (!Number.isFinite(value) || value <= 0) return p;
  const maxRaw = extraDiscount.maxDiscount ?? extraDiscount.max_discount;
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
    disc = value;
  } else if (valueType === 1) {
    const raw = (p * value) / 100;
    const capped = maxCap !== null ? Math.min(raw, maxCap) : raw;
    disc = capped;
  } else {
    return p;
  }

  disc = Math.min(Math.max(0, disc), p);
  return Math.max(0, p - disc);
}
