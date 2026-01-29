/**
 * Cart Helper Functions
 * Utility functions for cart item calculations and data extraction
 */

export const getStock = (item) => {
  // Lucid Model stores actual data in $attributes or $original
  const stock =
    Number(item?.variant?.$attributes?.stock) ||
    Number(item?.variant?.$original?.stock) ||
    Number(item?.variant?.stock) ||
    Number(item?.product?.$attributes?.stock) ||
    Number(item?.product?.$original?.stock) ||
    Number(item?.product?.stock);

  if (Number.isFinite(stock) && stock >= 0) return stock;

  // Fallback
  const candidates = [
    item?.stock,
    item?.available_stock,
    item?.stock_quantity,
    item?.max_stock,
    item?.maxStock,
  ];

  for (const v of candidates) {
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return 0;
};

export const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const getQuantity = (item) =>
  toNumber(item?.qtyCheckout ?? item?.qty ?? item?.quantity ?? 0);

export const getMaxQty = (item) => {
  // Gunakan getStock untuk consistency
  const stock = getStock(item);
  if (stock > 0) return stock;

  // Fallback ke maxStock candidates jika stock tidak ketemu
  const maxStock = toNumber(
    item?.max_stock ??
      item?.maxStock ??
      item?.product?.max_stock ??
      item?.product?.maxStock ??
      0,
    0,
  );
  if (maxStock > 0) return maxStock;
  return 100;
};

export const getUnitPrice = (item) =>
  toNumber(
    item?.unit_price ??
      item?.unitPrice ??
      item?.price ??
      item?.product?.price ??
      0,
  );

export const getLineTotal = (item) => getUnitPrice(item) * getQuantity(item);

export const getVariantDisplayName = (variant) => {
  if (!variant) return "-";

  // Try multiple paths to get attribute_values (Lucid Model structure)
  const attributes =
    variant.attribute_values ||
    variant.attributeValues ||
    variant.$preloaded?.attribute_values ||
    variant.$preloaded?.attributeValues ||
    variant.$sideloaded?.attribute_values ||
    variant.$sideloaded?.attributeValues ||
    variant.$attributes?.attribute_values ||
    variant.$attributes?.attributeValues ||
    variant.$original?.attribute_values ||
    variant.$original?.attributeValues;

  if (attributes && Array.isArray(attributes) && attributes.length > 0) {
    const displayValues = attributes
      .map((av) => av.value || av.name)
      .filter(Boolean);
    if (displayValues.length > 0) {
      return displayValues.join(" / ");
    }
  }

  // Fallback to SKU
  return (
    variant.name ||
    variant.label ||
    variant.sku ||
    variant.$attributes?.sku ||
    variant.$original?.sku ||
    "-"
  );
};

export const extractProductId = (item) => {
  return (
    item?.variant?.$attributes?.productId ||
    item?.variant?.$original?.productId ||
    item?.variant?.productId ||
    item?.product?.id ||
    item?.product?.$attributes?.id ||
    item?.product?.$original?.id ||
    item?.product_id ||
    item?.productId
  );
};

export const extractCurrentVariantId = (item) => {
  return (
    item?.variant?.id ||
    item?.variant?.$attributes?.id ||
    item?.variant_id
  );
};

export const extractProductSlug = (item) => {
  return (
    item?.product?.slug ||
    item?.product?.$attributes?.slug ||
    item?.product?.$original?.slug
  );
};

export const getAvailableVariants = (item, productVariants) => {
  const productId = extractProductId(item);
  
  return (
    productVariants[String(productId)] ||
    item?.product?.variants ||
    item?.product?.variantItems ||
    item?.product?.$preloaded?.variants ||
    item?.product?.$sideloaded?.variants ||
    []
  );
};
