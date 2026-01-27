function isValidNode(node) {
  return Array.isArray(node.children) && node.children.length > 0;
}

function walk(node, rootSlug) {
  if (!node || node.deletedAt) return null;

  const children = (node.children || [])
    .map((child) => walk(child, rootSlug))
    .filter(Boolean);

  return {
    id: node.id,
    name: node.name,
    slug: node.slug,
    rootSlug, // ✅ TANAM ROOT
    children,
  };
}

export function categoryAdapter(raw = []) {
  return raw
    .map((root) => {
      if (!isValidNode(root)) return null;

      const children = root.children
        .map((child) => walk(child, root.slug))
        .filter(isValidNode);

      if (!children.length) return null;

      return {
        key: root.slug,
        label: root.name,
        items: children.flatMap((c) => (c.children?.length ? c.children : [c])),
      };
    })
    .filter(Boolean);
}

export function categoryHref(item) {
  if (!item?.slug || !item?.rootSlug) return "#";
  return `/best-seller?category=${item.rootSlug}&subcategory=${item.slug}`;
}
