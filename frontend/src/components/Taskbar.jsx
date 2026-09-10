import React, { useEffect, useState } from "react";
import { Grid2X2, Search, Folder, Globe, Terminal, FileText, Settings, Trash2, CalendarDays, Music2, Image as ImageIcon, Bot, ShieldCheck } from "lucide-react";

function Taskbar({ windows, onOpen, onFocus, onMinimize, onStart, onSearch }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  const quick = [
    {id:"files",title:"Files",icon:Folder,x:180,y:105}, {id:"browser",title:"Browser",icon:Globe,x:260,y:130},
    {id:"terminal",title:"Terminal",icon:Terminal,x:300,y:155}, {id:"notes",title:"Notes",icon:FileText,x:340,y:180},
    {id:"settings",title:"Settings",icon:Settings,x:420,y:230}, {id:"trash",title:"Trash",icon:Trash2,x:460,y:255},
    {id:"calendar",title:"Calendar",icon:CalendarDays,x:500,y:280}, {id:"music",title:"Music",icon:Music2,x:540,y:305},
    {id:"image-viewer",title:"Image Viewer",icon:ImageIcon,x:580,y:330}, {id:"ai-assistant",title:"AI Assistant",icon:Bot,x:620,y:355},
    {id:"account",title:"Account",icon:ShieldCheck,x:660,y:380}
  ];
  const handleQuick = (app) => {
    const existing = windows.find(w => w.id === app.id);
    if (existing) existing.minimized ? onFocus(existing.id) : onMinimize(existing.id);
    else onOpen(app);
  };
  return <footer className="yashos-taskbar fixed bottom-0 left-0 right-0 z-[120] flex h-[68px] items-center border-t px-2 shadow-[0_-10px_35px_rgba(0,0,0,.18)] backdrop-blur-2xl sm:px-4">
    <div className="flex w-[190px] shrink-0 items-center gap-1 sm:w-[250px] sm:gap-2">
      <button className="yashos-taskbar-button flex h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold sm:px-3" onClick={onStart}><Grid2X2 size={21}/> <span className="hidden sm:inline">YashOS</span></button>
      <button className="yashos-taskbar-button grid h-11 w-11 shrink-0 place-items-center rounded-xl" onClick={onSearch} aria-label="Search"><Search size={21}/></button>
    </div>
    <div className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto px-1">
      {quick.map(app => { const Icon = app.icon; const active = windows.some(w => w.id === app.id && !w.minimized); return <button key={app.id} title={app.title} className={`yashos-taskbar-app grid h-11 w-11 shrink-0 place-items-center rounded-xl ${active ? "active" : ""}`} onClick={() => handleQuick(app)}><Icon size={21}/></button>; })}
    </div>
    <div className="yashos-system-tray hidden w-[210px] shrink-0 items-center justify-end gap-3 md:flex">
      <span className="text-white/50">⌁</span><span className="text-white/50">◖</span><span className="text-white/50">▣</span>
      <div className="flex flex-col items-end text-xs leading-tight"><span>{time.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span><small className="text-[10px] text-white/50">{time.toLocaleDateString([], {day:"2-digit",month:"short",year:"numeric"})}</small></div>
    </div>
  </footer>;
}
export default Taskbar;
