import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Globe, Home, RotateCw, Search, ShieldCheck, AlertTriangle } from "lucide-react";

const HOME_URL = "https://example.com";
const HISTORY_KEY = "yashos_browser_history_v1";
const QUICK_LINKS = [["Example", "https://example.com"], ["MDN", "https://developer.mozilla.org"], ["GitHub", "https://github.com"]];

function normalizeUrl(value) {
  const text = value.trim();
  if (!text) return HOME_URL;
  if (/^https?:\/\//i.test(text)) return text;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(text)) return `https://${text}`;
  return `https://www.google.com/search?q=${encodeURIComponent(text)}`;
}

export default function Browser() {
  const [input, setInput] = useState(HOME_URL);
  const [currentUrl, setCurrentUrl] = useState(HOME_URL);
  const [backStack, setBackStack] = useState([]);
  const [forwardStack, setForwardStack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}");
      if (Array.isArray(saved.back)) setBackStack(saved.back);
      if (Array.isArray(saved.forward)) setForwardStack(saved.forward);
      if (saved.current) { setCurrentUrl(saved.current); setInput(saved.current); }
    } catch {}
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify({ current: currentUrl, back: backStack.slice(-30), forward: forwardStack.slice(0,30) }));
  }, [currentUrl, backStack, forwardStack]);

  const navigate = (value, saveHistory = true) => {
    const next = normalizeUrl(value);
    if (next === currentUrl) { setLoading(true); setBlocked(false); setFrameKey(k => k + 1); return; }
    if (saveHistory) { setBackStack(prev => [...prev, currentUrl].slice(-30)); setForwardStack([]); }
    setCurrentUrl(next); setInput(next); setLoading(true); setBlocked(false);
  };

  const back = () => {
    if (!backStack.length) return;
    const previous = backStack[backStack.length - 1];
    setBackStack(prev => prev.slice(0, -1));
    setForwardStack(prev => [currentUrl, ...prev].slice(0,30));
    setCurrentUrl(previous); setInput(previous); setLoading(true); setBlocked(false); setFrameKey(k => k + 1);
  };

  const forward = () => {
    if (!forwardStack.length) return;
    const next = forwardStack[0];
    setForwardStack(prev => prev.slice(1));
    setBackStack(prev => [...prev, currentUrl].slice(-30));
    setCurrentUrl(next); setInput(next); setLoading(true); setBlocked(false); setFrameKey(k => k + 1);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && e.key === "ArrowLeft") { e.preventDefault(); back(); }
      if (e.altKey && e.key === "ArrowRight") { e.preventDefault(); forward(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") { e.preventDefault(); inputRef.current?.select(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentUrl, backStack, forwardStack]);

  return <div className="flex h-full min-h-0 flex-col bg-slate-100 text-slate-800">
    <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-2">
      <div className="flex items-center gap-1">
        <button onClick={back} disabled={!backStack.length} className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-30" title="Back (Alt+Left)"><ArrowLeft size={17}/></button>
        <button onClick={forward} disabled={!forwardStack.length} className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-30" title="Forward (Alt+Right)"><ArrowRight size={17}/></button>
        <button onClick={() => { setLoading(true); setBlocked(false); setFrameKey(k => k + 1); }} className="rounded-lg p-2 hover:bg-slate-100" title="Reload"><RotateCw size={16} className={loading ? "animate-spin" : ""}/></button>
        <button onClick={() => navigate(HOME_URL)} className="rounded-lg p-2 hover:bg-slate-100" title="Home"><Home size={16}/></button>
        <form onSubmit={e => { e.preventDefault(); navigate(input); }} className="ml-1 flex min-w-0 flex-1"><div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-400 focus-within:bg-white"><ShieldCheck size={15} className="shrink-0 text-emerald-500"/><input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search or enter website address" spellCheck="false"/><button type="submit" className="text-slate-400 hover:text-slate-700"><Search size={16}/></button></div></form>
        <a href={currentUrl} target="_blank" rel="noreferrer" className="rounded-lg p-2 hover:bg-slate-100" title="Open externally"><ExternalLink size={16}/></a>
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto">{QUICK_LINKS.map(([name,url]) => <button key={name} onClick={() => navigate(url)} className="flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium hover:bg-slate-200"><Globe size={12}/>{name}</button>)}</div>
    </div>
    <div className="relative min-h-0 flex-1 bg-white">
      {loading && <div className="absolute left-0 right-0 top-0 z-20 h-0.5 bg-slate-200"><div className="h-full w-1/3 animate-pulse bg-blue-500"/></div>}
      <iframe key={frameKey} title="YashOS Browser" src={currentUrl} className="h-full w-full border-0" onLoad={() => { setLoading(false); setBlocked(false); }} onError={() => { setLoading(false); setBlocked(true); }} referrerPolicy="no-referrer" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-scripts allow-same-origin"/>
      {blocked && <div className="absolute inset-0 grid place-items-center bg-white/95 p-6 text-center"><div className="max-w-sm"><AlertTriangle size={38} className="mx-auto mb-3 text-amber-500"/><h3 className="font-semibold">This site cannot be embedded</h3><p className="mt-2 text-xs leading-5 text-slate-500">The website blocked iframe access. Open it in your normal browser instead.</p><a href={currentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white"><ExternalLink size={14}/>Open website</a></div></div>}
    </div>
    <div className="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-500"><Globe size={12}/><span className="truncate">{currentUrl}</span><span className="ml-auto shrink-0">{backStack.length} history</span></div>
  </div>;
}
