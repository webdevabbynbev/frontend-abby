"use client";
import { useEffect, useState } from "react";
import { getAddressByQuery, getUser } from "@/utils/auth";
import { AddressCard } from ".";

export function AddressList() {
  const [userId, setUserId] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { user } = await getUser();
        if (!user?.id) throw new Error("User ID not found");
        if (alive) setUserId(userId);
        const addr = await getAddressByQuery(userId);
        if (alive) setList(Array.isArray(addr) ? addr : []);
      } catch (e) {
        if (alive) setErr(e?.message || "Gagal memuat alamat");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false };
  }, []);

  if (loading) return <div>Loading addresses…</div>;
  if (err) return <div className="text-red-500">{err}</div>;
  if (!list.length) return <div className="text-neutral-500">Belum ada alamat.</div>;

  return (
    <div className="space-y-3">
      {list.map((a) => (
        <AddressCard
          key={a.id}
          label={a.benchmark || "address"}
          line={a.address || ""}
          city={a.city || ""}
          province={a.province || ""}
          postalCode={a.postalCode || a.postal_code || ""}
          phone={a.pic?.phone || a.picPhone || ""}
          isActive={a.isActive}
        />
      ))}
    </div>
  );
}

