"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { getAddressByQuery, getUser } from "@/utils/auth";
import { AddressCard } from ".";

export function AddressList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { user } = await getUser();
        if (!user?.id) throw new Error("User ID not found");
        const addr = await getAddressByQuery(user.id);
        if (!alive) return;

        const data = Array.isArray(addr) ? addr : [];
        setList(data);

        // set pilihan awal (yang isActive === 2)
        const main = data.find((x) => x.isActive === 2);
        setSelectedId(main ? main.id : null);
      } catch (e) {
        if (alive) setErr(e?.message || "Gagal memuat alamat");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleSelect = async (id) => {
    if (saving || id == null || id === selectedId) return;
    setSaving(true);

    // Optimistic UI
    const prev = list;
    setSelectedId(id);
    setList((cur) => cur.map((a) => ({ ...a, isActive: a.id === id ? 2 : 1 })));

    try {
      await api.put("/addresses", { id, is_active: 2 });
      // jika backend masih minta lokasi, tambahkan field2 lokasi sesuai item terpilih
    } catch (err) {
      console.error("Select main address failed:", err?.response?.data || err);
      setList(prev);
      setSelectedId(prev.find((x) => x.isActive === 2)?.id ?? null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading addresses…</div>;
  if (err) return <div className="text-red-500">{err}</div>;
  if (!list.length) return <div className="text-neutral-500">Belum ada alamat.</div>;

  return (
    <div className="space-y-3">
      {list.map((a) => (
        <AddressCard
          key={a.id}
          id={a.id}
          benchmark={a.benchmark || "benchmark"}
          label={a.picLabel || "address"}
          line={a.address || ""}
          city={a.city || ""}
          province={a.province}
          postalCode={a.postalCode || a.postal_code}
          phone={a.phone || a.picPhone || a.pic_phone || (a.pic && a.pic.phone) || ""}
          // indikator & disabled terkontrol
          selected={a.id === selectedId}
          disabled={saving}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
