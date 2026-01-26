"use client";

export const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const resolveLabel = (item = {}) =>
  item.label ||
  item.name ||
  item.concerns ||
  item.skinconcerns ||
  item.bodyconcerns ||
  item.hairconcerns ||
  "";

const resolveSlug = (item = {}, labelFallback = "") => {
  const raw = item.slug ?? item.id ?? labelFallback;
  const cleaned = slugify(raw);
  return cleaned || slugify(labelFallback);
};

export function buildconcernsItems(concerns = []) {
  const list = Array.isArray(concerns) ? concerns : [];

  const mapNode = (item) => {
    if (!item) return null;

    const label = resolveLabel(item);
    if (!label) return null;

    const children = Array.isArray(item.children)
      ? item.children.map(mapNode).filter(Boolean)
      : [];

    const slug = resolveSlug(item, label);
    const href = `/concerns/${encodeURIComponent(slug)}`;

    return children.length
      ? { label, children }
      : {
          label,
          href,
        };
  };

  return list.map(mapNode).filter(Boolean);
}

export function normalizeBrands(brands = []) {
  const list = Array.isArray(brands) ? brands : [];

  return list
    .map((brand, index) => {
      const name =
        brand?.brandname ||
        brand?.name ||
        brand?.label ||
        brand?.title ||
        "";
      if (!name) return null;

      const slug = brand?.slug || slugify(name);

      return {
        id: brand?.id ?? slug ?? index,
        name,
        slug,
        logo:
          brand?.logo ||
          brand?.logoUrl ||
          brand?.logo_public_id ||
          brand?.logoPublicId ||
          brand?.image ||
          null,
        isPopular: Boolean(brand?.isPopular ?? brand?.popular ?? brand?.featured),
      };
    })
    .filter(Boolean);
}
