import React, { useEffect, useMemo, useState } from "react";
import { Search, X, Folder, FileText, CalendarDays, Settings, Terminal, Globe, Calculator, Trash2, Music2, Image as ImageIcon, Bot, ShieldCheck } from "lucide-react";

const apps = [
  { id: "files", title: "Files", icon: Folder, type: "App" },
  { id: "browser", title: "Browser", icon: Globe, type: "App" },
  { id: "terminal", title: "Terminal", icon: Terminal, type: "App" },
  { id: "notes", title: "Notes", icon: FileText, type: "App" },
  { id: "calculator", title: "Calculator", icon: Calculator, type: "App" },
  { id: "settings", title: "Settings", icon: Settings, type: "App" },
  { id: "trash", title: "Trash", icon: Trash2, type: "App" },
  { id: "calendar", title: "Calendar", icon: CalendarDays, type: "App" },
  { id: "music", title: "Music", icon: Music2, type: "App" },
  { id: "image-viewer", title: "Image Viewer", icon: ImageIcon, type: "App" },
  { id: "ai-assistant", title: "AI Assistant", icon: Bot, type: "App" },
  { id: "account", title: "Account", icon: ShieldCheck, type: "App" }
];

function read(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}

function buildIndex() {
  const results = apps.map(app => ({ ...app, searchable: app.title }));
  const files = read("yashos_files_v1", []);
  files.forEach(item => results.push({ id: `file-${item.id}`, title: item.name, subtitle: item.location || "Home", type: item.type === "folder" ? "Folder" : "File", icon: item.type === "folder" ? Folder : FileText, appId: "files", searchable: `${item.name} ${item.location || ""}` }));
  const notes = read("yashos_notes_v1", []);
  notes.forEach(note => results.push({ id: `note-${note.id}`, title: note.title || "Untitled Note", subtitle: note.content || "No content", type: "Note", icon: FileText, appId: "notes", searchable: `${note.title || ""} ${note.content || ""}` }));
  const events = read("yashos_calendar_events_v1", {});
  Object.entries(events).forEach(([date, dayEvents]) => dayEvents.forEach(event => results.push({ id: `event-${event.id}`, title: event.title, subtitle: date, type: "Event", icon: CalendarDays, appId: "calendar", searchable: `${event.title} ${date}` })));
  return results;
}

function GlobalSearch({ onOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(buildIndex);
  useEffect(() => { setTimeout(() => document.getElementById("yashos-global-search")?.focus(), 0); }, []);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 12);
    return index.filter(item => item.searchable.toLowerCase().includes(q)).slice(0, 30);
  }, [index, query]);
  const open = item => {
    const app = apps.find(a => a.id === (item.appId || item.id));
    if (app) onOpen({ ...app, x: 220, y: 105 });
    onClose();
  };
  return <div className="fixed inset-0 z-[200] bg-black/45 p-4 pt-[10vh] backdrop-blur-sm" onMouseDown={onClose}>
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-slate-950/95 shadow-2xl" onMouseDown={e => e.stopPropagation()}>
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <Search size={20} className="text-white/55" />
        <input id="yashos-global-search" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Escape") onClose(); }} placeholder="Search apps, files, notes, events..." className="flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/35" />
        <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Close search"><X size={18}/></button>
      </div>
      <div className="max-h-[55vh] overscroll-contain overflow-y-auto p-2">
        {results.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => open(item)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/10">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10"><Icon size={19}/></span>
          <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{item.title}</strong><small className="block truncate text-xs text-white/40">{item.subtitle || item.type}</small></span>
          <span className="text-[10px] text-white/30">{item.type}</span>
        </button>; })}
        {!results.length && <div className="px-4 py-12 text-center text-sm text-white/40">No results found for “{query}”</div>}
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[10px] text-white/35"><span>Search YashOS</span><button onClick={() => setIndex(buildIndex())} className="hover:text-white/70">Refresh index</button></div>
    </div>
  </div>;
}
export default GlobalSearch;
