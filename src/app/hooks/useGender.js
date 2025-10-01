"use client";
import { useEffect, useState } from "react";

const GENDER_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;

export function useGenders() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(GENDER_URL, { credentials: "include" });
        const raw = await res.json();

        let opts = [];
        if (Array.isArray(raw)) {
          // misalnya API balas: [{ id: 1, name: "MALE" }, { id: 2, name: "FEMALE" }]
          opts = raw.map((g) => ({
            value: String(g.id ?? g.value ?? g.code),
            label: String(g.name ?? g.label ?? g.title ?? g)
              .replaceAll("_", " ")
              .toLowerCase()
              .replace(/^\w/, (c) => c.toUpperCase()),
          }));
        } else if (raw && typeof raw === "object") {
          // misalnya API balas: { "1": "MALE", "2": "FEMALE" }
          opts = Object.entries(raw).map(([k, v]) => ({
            value: String(k),
            label: String(v)
              .replaceAll("_", " ")
              .toLowerCase()
              .replace(/^\w/, (c) => c.toUpperCase()),
          }));
        }

        if (alive) setOptions(opts);
      } catch (e) {
        if (alive) setError(e.message || "Failed to load genders");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { options, loading, error };
}