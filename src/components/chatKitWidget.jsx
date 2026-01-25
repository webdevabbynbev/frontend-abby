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

  const existing = localStorage.getItem(LS_SESSION_KEY);
  if (existing) return existing;

  const id =
    crypto?.randomUUID?.() ??
    `session_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  localStorage.setItem(LS_SESSION_KEY, id);
  return id;
};

const getPrevResponseId = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_PREV_KEY) || "";
};

const setPrevResponseId = (id) => {
  if (!id || typeof window === "undefined") return;
  localStorage.setItem(LS_PREV_KEY, id);
};

const clearChatSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_PREV_KEY);
};

// ==============================
// Parse AI structured output
// ==============================
const parseStructuredOutput = (text = "") => {
  const result = {
    rekomendasi: [],
    tips: [],
    questions: [],
    fallbackText: "",
  };

  if (!text) return result;

  const lines = text.split("\n").map((l) => l.trim());
  let section = "fallback";

  const parseReco = (l) => {
    const clean = l.replace(/^[-•]\s*/, "");
    const parts = clean.split(/\s*(?:—|–|-)\s*/);
    return {
      name: parts[0] || "",
      price: parts[1] || "",
      reason: parts.slice(2).join(" — "),
    };
  };

  for (const line of lines) {
    if (!line) continue;

    if (/^REKOMENDASI$/i.test(line)) {
      section = "rekomendasi";
      continue;
    }
    if (/^TIPS$/i.test(line)) {
      section = "tips";
      continue;
    }
    if (/^PERTANYAAN LANJUTAN$/i.test(line)) {
      section = "questions";
      continue;
    }

    if (/^[-•]\s+/.test(line)) {
      if (section === "rekomendasi") {
        const r = parseReco(line);
        if (r.name) result.rekomendasi.push(r);
        continue;
      }
      if (section === "tips") {
        result.tips.push(line.replace(/^[-•]\s*/, ""));
        continue;
      }
      if (section === "questions") {
        result.questions.push(line.replace(/^[-•]\s*/, ""));
        continue;
      }
    }

    result.fallbackText +=
      (result.fallbackText ? "\n" : "") + line;
  }

  return result;
};

// ==============================
// Component
// ==============================
export function ChatkitWidget() {
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  const apiUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_CHATKIT_API_BASE;
    if (!base) throw new Error("NEXT_PUBLIC_CHATKIT_API_BASE is missing");
    return `${base.replace(/\/+$/, "")}/api/v1/chatkit`;
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi bestie! Mau tanya makeup, skincare, atau info toko hari ini?",
    },
  ]);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setInput("");
    setIsSending(true);

    setMessages((prev) => [...prev, { role: "user", text }]);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          previous_response_id: getPrevResponseId() || undefined,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data?.previous_response_id) {
        setPrevResponseId(data.previous_response_id);
      }

      const structured = parseStructuredOutput(data?.output_text || "");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: structured.fallbackText,
          structured,
          products: data?.serve?.products || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Maaf bestie, sistem lagi sibuk. Coba lagi ya 🙏",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-96 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-black text-white flex justify-between">
            <div>
              <p className="text-sm font-semibold">Abby n Bev AI</p>
              <p className="text-xs opacity-70">Beauty Assistant</p>
            </div>
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>

          {/* Messages */}
          <div className="flex-1 px-4 py-3 space-y-4 overflow-y-auto max-h-96">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-black text-white ml-auto"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {m.text && (
                  <p className="whitespace-pre-line">{m.text}</p>
                )}

                {Array.isArray(m.products) &&
                  m.products.map((p) => (
                    <div key={p.id} className="mt-2">
                      <RegularCard product={p} />
                    </div>
                  ))}
              </div>
            ))}

            {isSending && (
              <div className="flex justify-center">
                <Bouncy size="40" color="#AE2D68" />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t px-3 py-2 flex gap-2">
            <TxtField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Tulis pertanyaan kamu..."
              className="flex-1"
            />
            <BtnIcon onClick={sendMessage} disabled={isSending} />
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full px-5 py-3"
        >
          <FaSprayCanSparkles className="mr-2" />
          Your Beauty Assistant
        </Button>
      )}
    </div>
  );
}
