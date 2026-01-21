import { getImageUrl } from "@/utils/getImageUrl";

export function normalizeProduct(raw) {
  if (!raw) return null;

  const item = raw.product || raw;
  const productId =
    raw?.product?.id ??
    raw?.productId ??
    raw?.product_id ??
    item?.id ??
    null;

  // ✅ penting: pastikan extraDiscount kebawa (list biasanya raw.product.extraDiscount)
  const extraDiscount =
    item?.extraDiscount ??
    raw?.extraDiscount ??
    raw?.product?.extraDiscount ??
    null;

  const medias = Array.isArray(item.medias) ? item.medias : [];
  const variants = Array.isArray(item.variants) ? item.variants : [];

  const variantMediaList = variants
    .flatMap((variant) => {
      const mediasForVariant = Array.isArray(variant?.medias)
        ? variant.medias
        : [];
      return mediasForVariant.map((media) => ({
        url: media?.url,
        slot: media?.slot,
        variantId: variant?.id ?? null,
        updatedAt: media?.updatedAt ?? media?.updated_at,
      }));
    })
    .filter((media) => typeof media.url === "string");

  const sortedVariants = [...variants].sort((a, b) => {
    const priceDiff = Number(a?.price || 0) - Number(b?.price || 0);
    if (priceDiff !== 0) return priceDiff;
    return Number(a?.id || 0) - Number(b?.id || 0);
  });

  const mediaList = [...medias, ...variantMediaList]
    .map((media) => ({
      url: media?.url,
      slot: media?.slot,
      variantId:
        media?.variantId ??
        media?.variant_id ??
        media?.variant?.id ??
        null,
      updatedAt: media?.updatedAt ?? media?.updated_at,
    }))
    .filter((media) => typeof media.url === "string");

  const sortMedia = (a, b) => {
    const slotA = Number(a.slot ?? 0);
    const slotB = Number(b.slot ?? 0);
    if (Number.isFinite(slotA) && Number.isFinite(slotB) && slotA !== slotB) {
      return slotA - slotB;
    }
    const timeA = Date.parse(a.updatedAt ?? "") || 0;
    const timeB = Date.parse(b.updatedAt ?? "") || 0;
    return timeB - timeA;
  };

  const uniqueUrls = (items) => Array.from(new Set(items.map((m) => m.url)));

  const productImages = uniqueUrls(
    mediaList.filter((media) => !media.variantId).sort(sortMedia),
  );

  const brandName =
    item.brand?.name ??
    item.brand?.brandname ??
    item.brand_name ??
    item.brandName ??
    item.brand ??
    item.brandname ??
    "";

  const brandSlug =
    item.brand?.slug ?? item.brand_slug ?? item.brandSlug ?? "";

  const variantPrices = sortedVariants
    .map((variant) => Number(variant?.price))
    .filter((value) => Number.isFinite(value) && value > 0);

  const lowestVariantPrice = variantPrices.length
    ? Math.min(...variantPrices)
    : null;

  const variantItems = sortedVariants
    .map((variant) => {
      if (!variant) return null;

      const attrs = Array.isArray(variant.attributes)
        ? variant.attributes
        : [];

      const attrLabel = attrs
        .map(
          (attr) =>
            attr?.attribute_value ||
            attr?.label ||
            attr?.value ||
            attr?.attribute?.name ||
            "",
        )
        .filter(Boolean)
        .join(" / ");

      const fallbackLabel =
        variant?.name || variant?.sku || variant?.code || "";

      const variantImages = uniqueUrls(
        mediaList
          .filter((media) => String(media.variantId) === String(variant.id))
          .sort(sortMedia),
      );

      return {
        id: variant.id,
        label: attrLabel || fallbackLabel || `Varian ${variant.id}`,
        price: Number(variant.price || 0),
        stock: Number(variant.stock ?? 0),
        images: variantImages.map(getImageUrl),
      };
    })
    .filter(Boolean);

  return {
    ...item,
    id: raw.id || item.id,
    productId,
    name: item.name || "Unnamed Product",

    price: Number(
      lowestVariantPrice ??
        item.base_price ??
        item.basePrice ??
        item.price ??
        item.salePrice ??
        item.realprice ??
        0,
    ),

    image: getImageUrl(item.image || medias[0]?.url),
    images: productImages.map(getImageUrl),

    brand: brandName,
    brandSlug,

    category:
      item.categoryType?.name ??
      item.category_type?.name ??
      item.category?.name ??
      item.category?.categoryname ??
      item.category_name ??
      item.categoryName ??
      item.category ??
      item.categoryname ??
      "",

    slug: item.slug || item.path || "",
    variantItems,

    // ✅ ini yang bikin badge & harga diskon bisa muncul di UI
    extraDiscount,
  };
}

/* ============================= */

export function normalizeSaleProduct(raw) {
  const base = normalizeProduct(raw);
  if (!base) return null;

  const normalPrice = Number(raw?.price ?? base.price ?? 0);
  const salePrice = Number(raw?.salePrice ?? raw?.sale_price ?? 0);

  const isSale =
    Number.isFinite(salePrice) && salePrice > 0 && salePrice < normalPrice;

  return {
    ...base,
    price: isSale ? salePrice : normalPrice,
    realprice: isSale ? normalPrice : NaN,
    sale: isSale,
    salePrice: isSale ? salePrice : 0,
    stock: Number(raw?.stock ?? 0),
  };
}

/* ============================= */

export function normalizeFlashSaleItem(raw) {
  if (!raw) return raw;

  const source = raw.product ?? raw;

  const comparePrice = Number(
    source.realprice ??
      source.oldPrice ??
      source.original_price ??
      source.originalPrice ??
      0,
  );

  const currentPrice = Number(
    source.price ?? source.basePrice ?? source.base_price ?? 0,
  );

  let normalPrice = currentPrice;
  if (comparePrice > 0 && comparePrice > currentPrice) {
    normalPrice = comparePrice;
  }

  let salePrice = Number(
    source.flashPrice ??
      source.flash_price ??
      source.salePrice ??
      source.sale_price ??
      source.flashSalePrice ??
      source.flash_sale_price ??
      source.discountPrice ??
      source.discount_price ??
      0,
  );

  if (salePrice === 0 && comparePrice > 0 && comparePrice > currentPrice) {
    salePrice = currentPrice;
  }

  const isSale =
    Number.isFinite(salePrice) && salePrice > 0 && salePrice < normalPrice;

  if (!isSale) return raw;

  const normalizedProduct = {
    ...source,
    price: normalPrice,
    flashPrice: salePrice,
    realprice: normalPrice,
    sale: true,
    flashSaleId: raw.flashSaleId ?? source.flashSaleId,
  };

  if (raw.product) {
    return {
      ...raw,
      product: normalizedProduct,
    };
  }

  return normalizedProduct;
}
