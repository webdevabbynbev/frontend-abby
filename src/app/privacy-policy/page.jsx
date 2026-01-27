"use client";
import { useEffect, useState } from "react";
import { getApi } from "@/services/api/client";

export const dynamic = "force-dynamic";

export default function PrivacyPolicyPage() {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getApi("api/privacy-policy");
        setHtml(res?.serve?.value || "");
      } catch (e) {
        setErr(e?.message || "Gagal load privacy policy");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Privacy Policy</h1>

      {loading && <p>Loading...</p>}
      {!loading && err && <p className="text-red-600">{err}</p>}

      {!loading && !err && (
        html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p>Privacy policy belum tersedia.</p>
        )
      )}
    </div>
  );
}
