import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  Trash2,
  Sparkles,
  User,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

const STORAGE_KEY = "yashos_ai_chat_v2";
const initialMessages = [
  {
    id: 1,
    role: "assistant",
    text: "Hi! I'm YashOS AI Assistant. Ask me about YashOS, programming, or your workflow.",
  },
];
function getResponse(input) {
  const text = input.toLowerCase();
  if (text.includes("yashos"))
    return "YashOS is a browser-based desktop simulator built with React, Tailwind CSS, Node.js, Express and MongoDB.";
  if (text.includes("react"))
    return "React builds YashOS from reusable components and manages UI state such as windows, notes and app interactions.";
  if (text.includes("javascript") || text.includes("js"))
    return "JavaScript powers the application logic, events, state updates, browser APIs and client-side features.";
  if (text.includes("tailwind"))
    return "Tailwind CSS provides utility classes for responsive layouts, spacing, colors, typography and dark mode.";
  if (text.includes("bug") || text.includes("error"))
    return "Start with the browser console, reproduce the issue, identify the failing component, then fix the smallest responsible layer.";
  if (text.includes("hello") || text.includes("hi"))
    return "Hello! 👋 What would you like to build in YashOS?";
  if (text.includes("help"))
    return "Try: What is YashOS? • Explain React • Explain Tailwind • How do I debug a bug? • What should we build next?";
  return `I received: “${input}”. The current assistant uses a local response engine. A production version can call an AI API through the backend without exposing secrets in the browser.`;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialMessages;
    } catch {
      return initialMessages;
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const bottomRef = useRef(null);
  const chatRef = useRef(null);
  const timerRef = useRef(null);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    const el = chatRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );
  const sendMessage = () => {
    const value = input.trim();
    if (!value || loading) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: value },
    ]);
    setInput("");
    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: getResponse(value) },
      ]);
      setLoading(false);
      timerRef.current = null;
    }, 450);
  };
  const clearChat = () => {
    setMessages(initialMessages);
    setCopied(null);
  };
  const copy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  };
  const suggestions = [
    "What is YashOS?",
    "Explain React",
    "How does Tailwind work?",
    "How do I debug a bug?",
  ];
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-950 text-white">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-white/[.04] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/20 text-violet-300">
            <Bot size={22} />
          </span>
          <div>
            <h2 className="font-semibold">WebOS AI</h2>
            <p className="text-[11px] text-white/45">Local assistant • ready</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="rounded-lg p-2 text-white/55 hover:bg-white/10 hover:text-white"
          title="Clear chat"
        >
          <Trash2 size={17} />
        </button>
      </div>
      <div
        ref={chatRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-500/20 text-violet-300">
                  <Bot size={15} />
                </span>
              )}
              <div
                className={`group relative max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === "user" ? "yashos-accent-bg text-white" : "border border-white/10 bg-white/[.06] text-white/80"}`}
              >
                <span>{message.text}</span>
                {message.role === "assistant" && (
                  <button
                    onClick={() => copy(message.id, message.text)}
                    className="ml-2 inline-flex rounded p-1 text-white/30 opacity-0 transition group-hover:opacity-100 hover:text-white"
                    title="Copy"
                  >
                    <>
                      {copied === message.id ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                    </>
                  </button>
                )}
              </div>
              {message.role === "user" && (
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-white/60">
                  <User size={15} />
                </span>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-white/45">
              <Loader2 size={14} className="animate-spin" />
              Thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="shrink-0 border-t border-white/10 bg-slate-950 p-3">
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="shrink-0 rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[11px] text-white/60 hover:bg-white/10 hover:text-white"
            >
              <Sparkles size={11} className="mr-1 inline" />
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.05] p-1.5 focus-within:border-violet-400/40"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask YashOS AI..."
            className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-white/30"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg yashos-accent-bg text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
