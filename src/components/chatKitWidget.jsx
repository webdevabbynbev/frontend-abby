"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";
import { FaSprayCanSparkles } from "react-icons/fa6";
import { BtnIcon, Button, RegularCard, TxtField } from ".";

// ==============================
// Storage keys
// ==============================
const LS_SESSION_KEY = "abby_chat_session_id";
const LS_PREV_KEY = "abby_chat_previous_response_id";

// ==============================
// Helpers
// ==============================
const getOrCreateSessionId = () => {
  if (typeof window === "undefined") return `session_${Date.now()}`;
  const existing = window.localStorage.getItem(LS_SESSION_KEY);
  if (existing) return existing;

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `session_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(LS_SESSION_KEY, id);
  return id;
};

const getPrevResponseId = () => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(LS_PREV_KEY) || "";
};

const setPrevResponseId = (id) => {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(LS_PREV_KEY, id);
};

const clearChatSession = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LS_PREV_KEY);
};

// ==============================
// Parsing: expected format
// REKOMENDASI
// - Nama — Harga — alasan
//
// TIPS
// - ...
//
// PERTANYAAN LANJUTAN
// - ...
// ==============================
const parseStructuredOutput = (text = "") => {
  const out = {
    rekomendasi: [], // {name, price, reason, rawLine, product}
    tips: [],
    questions: [],
    fallbackText: "",
  };

  const normalized = String(text || "").trim();
  if (!normalized) return out;

  const lines = normalized.split("\n").map((l) => l.trim());
  let section = "fallback";

  const isHeader = (l) =>
    /^REKOMENDASI$/i.test(l) ||
    /^TIPS$/i.test(l) ||
    /^PERTANYAAN LANJUTAN$/i.test(l);

  const parseRecoLine = (l) => {
    // Expected: "- Nama — Harga — alasan"
    // Also tolerate "-" / "•" and "-" dash variants.
    const s = l.replace(/^[-•]\s*/, "").trim();
    // split by em dash / en dash / hyphen used as separator
    const parts = s.split(/\s*(?:—|–|-)\s*/).map((p) => p.trim()).filter(Boolean);

    // Minimal: name only
    const name = parts[0] || "";
    const price = parts[1] || "";
    const reason = parts.slice(2).join(" — ").trim();

    return { name, price, reason, rawLine: l };
  };

  for (const l of lines) {
    if (!l) continue;

    if (/^REKOMENDASI$/i.test(l)) {
      section = "rekomendasi";
      continue;
    }
    if (/^TIPS$/i.test(l)) {
      section = "tips";
      continue;
    }
    if (/^PERTANYAAN LANJUTAN$/i.test(l)) {
      section = "questions";
      continue;
    }

    // Bullet lines
    if (/^[-•]\s+/.test(l)) {
      if (section === "rekomendasi") {
        const item = parseRecoLine(l);
        if (item.name) out.rekomendasi.push(item);
        continue;
      }
      if (section === "tips") {
        out.tips.push(l.replace(/^[-•]\s*/, "").trim());
        continue;
      }
      if (section === "questions") {
        out.questions.push(l.replace(/^[-•]\s*/, "").trim());
        continue;
      }
    }

    // If the model didn't follow structure, keep as fallback
    // or accumulate non-bullets inside a section.
    if (section === "fallback") {
      out.fallbackText += (out.fallbackText ? "\n" : "") + l;
    } else {
      // allow non-bullets inside section: append to fallbackText
      // (optional) you can also attach to the last item; keep simple.
      if (!isHeader(l)) {
        out.fallbackText += (out.fallbackText ? "\n" : "") + l;
      }
    }
  }

  return out;
};

// Optional: enrich recommendation items with real product data from your FE API route
const fetchProductByName = async (name) => {
  try {
    const res = await fetch(
      `/api/products/search?q=${encodeURIComponent(name)}&limit=1`
    );
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data[0] : null;
  } catch (e) {
    console.error("Product lookup error:", e);
    return null;
  }
};

export function ChatkitWidget() {
  const sessionId = useMemo(() => getOrCreateSessionId(), []);
  const apiUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_CHATKIT_API_BASE;
    if (!base) throw new Error("NEXT_PUBLIC_CHATKIT_API_BASE is not set");
    return `${base.replace(/\/+$/, "")}/api/v1/chatkit`;
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // message schema:
  // { role:"assistant"|"user", text?:string, structured?:{...}, recommendations?:[] }
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi bestie! Mau tanya makeup, skincare, atau info toko hari ini?",
    },
  ]);

  // keep latest messages snapshot (avoid stale closure)
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setInput("");

    // append user message first
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);

    try {
      const previous_response_id = getPrevResponseId();

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          session_id: sessionId,
          previous_response_id: previous_response_id || undefined,
        }),
      });

      if (!res.ok) {
        let errorMessage = `HTTP ${res.status}`;
        try {
          const err = await res.json();
          errorMessage =
            (typeof err?.message === "string" && err.message) ||
            (typeof err?.error === "string" && err.error) ||
            JSON.stringify(err);
        } catch {
          errorMessage = await res.text().catch(() => errorMessage);
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();

      // IMPORTANT: store the new previous_response_id for next turn
      if (data?.previous_response_id) setPrevResponseId(data.previous_response_id);

      const outputText = data?.output_text || "Maaf bestie, coba lagi ya.";

      // Parse the structured text
      const structured = parseStructuredOutput(outputText);

      // (Optional) attach product cards for rekomendasi items by name
      let recoWithProducts = structured.rekomendasi;
      if (Array.isArray(recoWithProducts) && recoWithProducts.length > 0) {
        const products = await Promise.all(
          recoWithProducts.map((r) => fetchProductByName(r.name))
        );
        recoWithProducts = recoWithProducts.map((r, idx) => ({
          ...r,
          product: products[idx] || null,
        }));
      }

      // Build assistant message
      const assistantMsg = {
        role: "assistant",
        structured: {
          ...structured,
          rekomendasi: recoWithProducts,
        },
        // keep raw as fallback display
        text: structured.fallbackText ? structured.fallbackText : "",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chat send error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            error?.message ||
            "Maaf bestie, lagi ada kendala. Coba lagi sebentar ya.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 h-auto">
      {isOpen ? (
        <div className="w-100 rounded-2xl bg-primary-50 shadow-xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-primary-500 via-primary-200 to-secondary-200 text-white">
            <div>
              <p className="text-sm font-semibold">Abby n Bev AI</p>
              <p className="text-xs text-white/70">Beauty Assistant</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-xs uppercase tracking-wide"
                onClick={() => {
                  clearChatSession(); // reset only previous_response_id
                  setMessages([
                    {
                      role: "assistant",
                      text: "Hi bestie! Mau tanya makeup, skincare, atau info toko hari ini?",
                    },
                  ]);
                }}
              >
                Reset
              </button>
              <button
                type="button"
                className="text-xs uppercase tracking-wide"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto max-h-96">
            {messages.map((message, index) => {
              const structured = message?.structured;

              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-2xl px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-black text-white ml-auto"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {message.text && (
                    <p className="whitespace-pre-line">{message.text}</p>
                  )}

                  {/* Structured renderer */}
                  {message.role === "assistant" && structured && (
                    <div className="mt-2 space-y-3">
                      {/* REKOMENDASI */}
                      {Array.isArray(structured.rekomendasi) &&
                        structured.rekomendasi.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Rekomendasi
                            </p>

                            <div className="space-y-4">
                              {structured.rekomendasi.map((item, i) => (
                                <div key={`${item.name}-${i}`} className="space-y-1">
                                  <p className="font-semibold">
                                    {i + 1}. {item.name}
                                  </p>

                                  {(item.price || item.reason) && (
                                    <p className="text-xs text-slate-600 whitespace-pre-line">
                                      {item.price ? `Harga: ${item.price}` : ""}
                                      {item.price && item.reason ? "\n" : ""}
                                      {item.reason ? item.reason : ""}
                                    </p>
                                  )}

                                  {item.product ? (
                                    <div className="max-w-55 mt-2">
                                      <RegularCard product={item.product} />
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* TIPS */}
                      {Array.isArray(structured.tips) && structured.tips.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Tips
                          </p>
                          <ul className="list-disc pl-5 text-sm space-y-1">
                            {structured.tips.map((t, i) => (
                              <li key={`tip-${i}`}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* PERTANYAAN LANJUTAN */}
                      {Array.isArray(structured.questions) &&
                        structured.questions.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Pertanyaan lanjutan
                            </p>
                            <ul className="list-disc pl-5 text-sm space-y-1">
                              {structured.questions.map((q, i) => (
                                <li key={`q-${i}`}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div className="p-4 mx-auto justify-center items-center">
                <Bouncy size="40" speed="1.2" color="#AE2D68" />
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 px-4 py-3 flex items-center gap-2">
            <TxtField
              variant="outline"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
              placeholder="Tulis pertanyaan kamu..."
              className="flex-1 text-sm rounded-full border border-slate-200 px-3 py-2 focus:outline-none"
            />
            <BtnIcon
              variant="primary"
              size="sm"
              iconName="ArrowUpLong"
              onClick={sendMessage}
              disabled={isSending}
            />
          </div>
        </div>
      ) : (
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsOpen(true)}
          className="bg-black text-white rounded-full px-5 py-3 shadow-lg text-sm font-semibold"
        >
          <div className="flex flex-row items-center gap-2">
            <FaSprayCanSparkles className="h-5 w-5" /> Your Beauty Assistant here!
          </div>
        </Button>
      )}
    </div>
  );
}