export function getDiscountPercent(realprice, price) {
  if (!realprice || !price || realprice <= price) return 0;
  return Math.round(((realprice - price) / realprice) * 100);
}
