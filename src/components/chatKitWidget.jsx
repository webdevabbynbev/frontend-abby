"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Metronome } from "ldrs/react";
import "ldrs/react/Metronome.css";
import { FaSprayCanSparkles } from "react-icons/fa6";
import {
  BtnIcon,
  Button,
  RegularCard,
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  TxtField,
} from ".";

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

    result.fallbackText += (result.fallbackText ? "\n" : "") + line;
  }

  return result;
};

// ==============================
// Component
// ==============================
export function ChatkitWidget({ variant = "floating", onClose }) {
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

  useEffect(() => {
    if (variant !== "floating") return undefined;
    const handleOpen = () => setIsOpen(true);
    if (typeof window === "undefined") return undefined;
    window.addEventListener("chatkit:open", handleOpen);
    return () => window.removeEventListener("chatkit:open", handleOpen);
  }, [variant]);

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

  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages]);

  const room = (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-b from-primary-50 to-white">
      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="min-h-full flex flex-col gap-3">
          {/* spacer */}
          <div className="flex-1" />

          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] shadow-sm ${
                m.role === "user"
                  ? "bg-primary-600 text-white ml-auto"
                  : "bg-white text-neutral-800 border border-neutral-100"
              }`}
            >
              {m.text && <p className="whitespace-pre-line leading-relaxed">{m.text}</p>}
            </div>
          ))}
          {isSending && (
            <div className="flex justify-center py-6">
              <Metronome size="40" speed="1.5" color="#c53d7f" />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 px-4 py-3 flex gap-2 shrink-0 bg-white shadow-lg">
        <TxtField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Tulis pertanyaan kamu..."
          className="flex-1"
        />
        <BtnIcon
          iconName="ArrowUp"
          variant="primary"
          size="md"
          onClick={sendMessage}
          disabled={isSending}
        />
      </div>
    </div>
  );

  if (variant === "sheet") {
    return room;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button className="rounded-full px-6 py-3 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <FaSprayCanSparkles className="mr-2 text-lg" />
            Your Beauty Assistant
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full max-w-md p-0 flex flex-col h-full"
        >
          <SheetHeader className="px-5 pt-5 pb-3 shrink-0 border-b border-neutral-100">
            <SheetTitle className="text-primary-700 text-xl font-bold">
              Chat dengan Abby
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">{room}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
