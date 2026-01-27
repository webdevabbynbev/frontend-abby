export function concernAdapter(concerns = []) {
  const groups = {
    1: { key: "skin", label: "Skin Concern", items: [] },
    2: { key: "body", label: "Body Concern", items: [] },
    3: { key: "hair", label: "Hair Concern", items: [] },
  };

  concerns.forEach((c) => {
    if (!c?.name || !groups[c.concernId]) return;

    groups[c.concernId].items.push({
      id: `${groups[c.concernId].key}-${c.id}`, // ✅ KEY STABLE
      name: c.name,
      slug: c.slug,
    });
  });

  return Object.values(groups).filter((g) => g.items.length);
}

export function concernHref(item) {
  if (!item?.slug) return "#";
  return `/best-seller?concern=${item.slug}`;
}

