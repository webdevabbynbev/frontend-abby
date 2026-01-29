function isValidNode(node) {
  return Array.isArray(node.children) && node.children.length > 0;
}

function walk(node, rootSlug, parentSlug = null) {
  if (!node || node.deletedAt) return null;

  const children = (node.children || [])
    .map((child) => walk(child, rootSlug, node.slug))
    .filter(Boolean)
    .sort((a, b) => a.id - b.id); // Sort by id ASC

  return {
    id: node.id,
    name: node.name,
    slug: node.slug,
    rootSlug, // ✅ TANAM ROOT
    parentSlug, // ✅ TANAM PARENT untuk level 3
    children,
  };
}

export function categoryAdapter(raw = []) {
  return raw
    .sort((a, b) => a.id - b.id) // Sort root categories by id ASC
    .map((root) => {
      if (!isValidNode(root)) return null;

      const children = root.children
        .map((child) => walk(child, root.slug))
        .filter(Boolean)
        .sort((a, b) => a.id - b.id); // Sort level 2 by id ASC

      if (!children.length) return null;

      // Buat items dengan struktur level 2 dan level 3
      const items = [];
      
      children.forEach((level2) => {
        if (level2.children?.length > 0) {
          // Level 2 yang punya children level 3
          items.push({
            ...level2,
            isGroup: true, // Marker untuk group di megadropdown
            subItems: level2.children.sort((a, b) => a.id - b.id), // Sort level 3 by id ASC
          });
        } else {
          // Level 2 tanpa children
          items.push({
            ...level2,
            isGroup: false,
          });
        }
      });

      return {
        key: root.slug,
        label: root.name,
        items,
      };
    })
    .filter(Boolean);
}

export function categoryHref(item) {
  if (!item?.slug || !item?.rootSlug) return "#";
  
  // Jika ada parentSlug, berarti ini level 3 subcategory
  if (item.parentSlug) {
    return `/best-seller?category=${item.rootSlug}&subcategory=${item.parentSlug}&subsubcategory=${item.slug}`;
  }
  
  // Level 2 subcategory
  return `/best-seller?category=${item.rootSlug}&subcategory=${item.slug}`;
}
