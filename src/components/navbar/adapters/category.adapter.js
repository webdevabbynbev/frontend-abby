export function categoryAdapter(categories = []) {
  return categories.map((root) => ({
    key: root.slug,
    label: root.name,
    items:
      root.children?.flatMap((c) => c.children || [])?.map((leaf) => ({
        id: leaf.id,
        name: leaf.name,
        slug: leaf.slug,
        rootSlug: root.slug,
      })) || [],
  }));
}

export function categoryHref(item) {
  return `/best-seller?category=${item.rootSlug}&subcategory=${item.slug}`;
}
