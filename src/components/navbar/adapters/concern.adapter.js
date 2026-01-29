export function concernAdapter(concerns = []) {
  const groups = {
    1: { key: "skin", label: "Skin Concern", items: [] },
    2: { key: "body", label: "Body Concern", items: [] },
    3: { key: "hair", label: "Hair Concern", items: [] },
  };

  concerns.forEach((c) => {
    if (!c?.name || !groups[c.concernId]) return;

    groups[c.concernId].items.push({
      id: c.id,
      name: c.name,
      slug: c.slug,
      isGroup: false, // Tandai sebagai item biasa, bukan group
    });
  });

  // Sort items by id ASC dalam setiap group
  Object.values(groups).forEach((group) => {
    group.items.sort((a, b) => a.id - b.id);
  });

  return Object.values(groups).filter((g) => g.items.length);
}

export function concernHref(item) {
  if (!item?.slug) return "#";
  return `/best-seller?concern=${item.slug}`;
}

