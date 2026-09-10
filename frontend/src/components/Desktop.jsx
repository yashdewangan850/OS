import React, { useEffect, useState } from "react";
import {
  Folder,
  Globe,
  Terminal,
  FileText,
  Calculator,
  Settings,
  Trash2,
  Search,
  CalendarDays,
  Music2,
  Image as ImageIcon,
  Bot,
  ShieldCheck,
  RefreshCw,
  MonitorCog,
} from "lucide-react";
import Taskbar from "./Taskbar";
import NotificationCenter from "./NotificationCenter";
import Window from "./Window";
import StartMenu from "./StartMenu";
import GlobalSearch from "./GlobalSearch";

const apps = [
  { id: "files", title: "Files", icon: Folder, x: 24, y: 24 },
  { id: "browser", title: "Browser", icon: Globe, x: 24, y: 116 },
  { id: "terminal", title: "Terminal", icon: Terminal, x: 24, y: 208 },
  { id: "notes", title: "Notes", icon: FileText, x: 24, y: 300 },
  { id: "calculator", title: "Calculator", icon: Calculator, x: 136, y: 24 },
  { id: "settings", title: "Settings", icon: Settings, x: 136, y: 116 },
  { id: "trash", title: "Trash", icon: Trash2, x: 136, y: 208 },
  { id: "calendar", title: "Calendar", icon: CalendarDays, x: 136, y: 300 },
  { id: "music", title: "Music", icon: Music2, x: 248, y: 24 },
  {
    id: "image-viewer",
    title: "Image Viewer",
    icon: ImageIcon,
    x: 248,
    y: 116,
  },
  { id: "ai-assistant", title: "AI Assistant", icon: Bot, x: 248, y: 208 },
  { id: "account", title: "Account", icon: ShieldCheck, x: 248, y: 300 },
];

const DESKTOP_POSITIONS_KEY = "yashos_desktop_icon_positions_v1";

function readIconPositions() {
  try {
    return JSON.parse(localStorage.getItem(DESKTOP_POSITIONS_KEY) || "{}");
  } catch {
    return {};
  }
}

function DesktopIcon({ app, position, onOpen, onMove }) {
  const Icon = app.icon;
  const drag = React.useRef({
    active: false,
    moved: false,
    pointerId: null,
    offsetX: 0,
    offsetY: 0,
  });
  const suppressClickUntil = React.useRef(0);

  const start = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    drag.current = {
      active: true,
      moved: false,
      pointerId: e.pointerId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const move = (e) => {
    if (!drag.current.active) return;
    const canvas = e.currentTarget.parentElement.getBoundingClientRect();
    const width = 104;
    const height = 78;
    const nextX = Math.max(
      4,
      Math.min(
        canvas.width - width - 4,
        e.clientX - canvas.left - drag.current.offsetX,
      ),
    );
    const nextY = Math.max(
      4,
      Math.min(
        canvas.height - height - 4,
        e.clientY - canvas.top - drag.current.offsetY,
      ),
    );
    if (Math.abs(nextX - position.x) > 3 || Math.abs(nextY - position.y) > 3)
      drag.current.moved = true;
    onMove(app.id, { x: nextX, y: nextY });
  };

  const stop = (e) => {
    if (e.currentTarget.hasPointerCapture?.(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    const wasMoved = drag.current.moved;
    drag.current.active = false;
    if (wasMoved) suppressClickUntil.current = performance.now() + 350;
    if (!wasMoved && e.button === 0) e.currentTarget.focus();
  };

  return (
    <button
      className="desktop-icon pointer-events-auto group absolute flex w-[104px] select-none flex-col items-center gap-1 rounded-xl p-1.5 transition"
      style={{ left: position.x, top: position.y, touchAction: "none" }}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={stop}
      onPointerCancel={stop}
      onClick={() => {
        if (performance.now() >= suppressClickUntil.current) onOpen(app);
      }}
      title={`${app.title} • drag to move • double-click to open`}
      aria-label={app.title}
    >
      <span className="desktop-icon-tile grid h-12 w-12 place-items-center rounded-xl border shadow-lg backdrop-blur-md transition group-hover:scale-105">
        <Icon size={29} strokeWidth={1.8} />
      </span>
      <span className="desktop-icon-label w-full whitespace-normal break-words text-center text-xs font-medium leading-tight drop-shadow">
        {app.title}
      </span>
    </button>
  );
}

function Desktop({
  windows,
  startOpen,
  setStartOpen,
  onOpen,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [contextPos, setContextPos] = useState({ x: 12, y: 120 });
  const [iconPositions, setIconPositions] = useState(() => {
    const saved = readIconPositions();
    return Object.fromEntries(
      apps.map((app) => [app.id, saved[app.id] || { x: app.x, y: app.y }]),
    );
  });

  useEffect(() => {
    localStorage.setItem(DESKTOP_POSITIONS_KEY, JSON.stringify(iconPositions));
  }, [iconPositions]);

  useEffect(() => {
    const clampIcons = () => {
      const canvas = document.querySelector(".desktop-icon-canvas");
      if (!canvas) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      setIconPositions((current) => {
        const next = { ...current };
        let changed = false;
        apps.forEach((app) => {
          const p = current[app.id] || { x: app.x, y: app.y };
          const x = Math.max(4, Math.min(Math.max(4, width - 108), p.x));
          const y = Math.max(4, Math.min(Math.max(4, height - 82), p.y));
          if (x !== p.x || y !== p.y) {
            next[app.id] = { x, y };
            changed = true;
          }
        });
        return changed ? next : current;
      });
    };
    const id = requestAnimationFrame(clampIcons);
    window.addEventListener("resize", clampIcons);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", clampIcons);
    };
  }, []);

  const moveIcon = (id, next) =>
    setIconPositions((current) => ({ ...current, [id]: next }));
  const resetIconPositions = () => {
    const next = Object.fromEntries(
      apps.map((app) => [app.id, { x: app.x, y: app.y }]),
    );
    setIconPositions(next);
    setContextOpen(false);
  };
  useEffect(() => {
    const key = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setStartOpen(false);
        setContextOpen(false);
        return;
      }
      if (e.ctrlKey && e.altKey) {
        const shortcuts = {
          t: "terminal",
          b: "browser",
          n: "notes",
          s: "settings",
          a: "ai-assistant",
        };
        const id = shortcuts[e.key.toLowerCase()];
        if (id) {
          e.preventDefault();
          const app = apps.find((item) => item.id === id);
          if (app) onOpen(app);
          return;
        }
      }
      if (e.altKey && e.key === "F4") {
        e.preventDefault();
        const active = [...windows]
          .sort((a, b) => (b.z || 0) - (a.z || 0))
          .find((w) => !w.minimized);
        if (active) onClose(active.id);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose, onOpen, setStartOpen, windows]);

  return (
    <main
      className="yashos-desktop relative isolate h-screen w-screen overflow-hidden"
      onContextMenu={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          setContextPos({
            x: Math.min(e.clientX, window.innerWidth - 240),
            y: Math.min(e.clientY, window.innerHeight - 190),
          });
          setContextOpen(true);
          setStartOpen(false);
          setSearchOpen(false);
        }
      }}
      onClick={() => setContextOpen(false)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_60%,rgba(0,0,0,.25))]" />
      <header className="yashos-topbar relative z-[140] flex h-14 shrink-0 items-center justify-between border-b px-3 backdrop-blur-xl sm:h-16 sm:px-5">
        <div className="flex min-w-0 items-baseline gap-4">
          <strong className="yashos-brand text-[23px] tracking-tight">
            WebOS
          </strong>
          <span className="yashos-subtitle hidden text-xs md:inline">
            Work • Explore • Create
          </span>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="yashos-search-button hidden w-[330px] items-center gap-2 rounded-xl border px-3.5 py-2 text-left text-xs shadow-lg backdrop-blur md:flex"
        >
          <Search size={15} />
          <span>Search apps, files, web...</span>
          <kbd className="yashos-kbd ml-auto rounded border px-1.5 py-0.5 text-[9px]">
            Ctrl K
          </kbd>
        </button>
        <div className="yashos-user flex min-w-[150px] items-center justify-end gap-2 text-sm sm:gap-3">
          <NotificationCenter />
          <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-800 font-bold text-white">
            OS
          </span>
          <span className="hidden sm:inline">WebOS</span>
        </div>
      </header>
      <section
        className="desktop-icon-canvas pointer-events-none absolute bottom-[78px] left-0 right-0 top-[70px] z-20 overflow-hidden"
        aria-label="Desktop applications"
      >
        {apps.map((app) => (
          <DesktopIcon
            key={app.id}
            app={app}
            position={iconPositions[app.id] || { x: app.x, y: app.y }}
            onOpen={onOpen}
            onMove={moveIcon}
          />
        ))}
      </section>
      <div className="pointer-events-none absolute left-1/2 top-[42%] z-[5] hidden w-[min(480px,62vw)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-slate-950/20 p-8 text-center shadow-2xl backdrop-blur-md sm:block">
        <p className="mb-2 text-[11px] tracking-[2px] text-white/60">WELCOME</p>
        <h1 className="mb-2 text-5xl font-bold tracking-tight">WebOS</h1>
        <p className="text-sm leading-6 text-white/75">
          Your browser-based desktop environment.
        </p>
      </div>
      {windows.map(
        (app) =>
          !app.minimized && (
            <Window
              key={app.id}
              app={app}
              onClose={onClose}
              onMinimize={onMinimize}
              onMaximize={onMaximize}
              onFocus={onFocus}
            />
          ),
      )}
      {startOpen && (
        <StartMenu onOpen={onOpen} onClose={() => setStartOpen(false)} />
      )}
      {searchOpen && (
        <GlobalSearch onOpen={onOpen} onClose={() => setSearchOpen(false)} />
      )}
      {contextOpen && (
        <div
          style={{ left: contextPos.x, top: contextPos.y }}
          className="yashos-context-menu fixed z-[180] w-56 overflow-hidden rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs hover:bg-white/10"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={15} />
            Refresh desktop
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs hover:bg-white/10"
            onClick={() => onOpen(apps.find((a) => a.id === "settings"))}
          >
            <MonitorCog size={15} />
            Display settings
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs hover:bg-white/10"
            onClick={resetIconPositions}
          >
            <MonitorCog size={15} />
            Reset icon layout
          </button>
          <div className="my-1 border-t border-white/10" />
          <div className="px-3 py-2 text-[10px] text-white/35">
            Shortcuts: Ctrl+Alt+T Terminal • Ctrl+Alt+B Browser
          </div>
        </div>
      )}
      <Taskbar
        windows={windows}
        onOpen={onOpen}
        onFocus={onFocus}
        onMinimize={onMinimize}
        onStart={(e) => {
          e.stopPropagation();
          setStartOpen((v) => !v);
        }}
        onSearch={() => setSearchOpen(true)}
      />
    </main>
  );
}
export default Desktop;
