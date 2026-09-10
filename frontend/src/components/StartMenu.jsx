import React, { useState } from "react";
import { Search, Folder, Globe, Terminal, FileText, Calculator, Settings, Power, UserCircle, Trash2, CalendarDays, Music2, Image as ImageIcon, Bot, ShieldCheck } from "lucide-react";

const apps = [
  {id:"files",title:"Files",icon:Folder,x:180,y:105},
  {id:"browser",title:"Browser",icon:Globe,x:260,y:130},
  {id:"terminal",title:"Terminal",icon:Terminal,x:300,y:155},
  {id:"notes",title:"Notes",icon:FileText,x:340,y:180},
  {id:"calculator",title:"Calculator",icon:Calculator,x:380,y:205},
  {id:"settings",title:"Settings",icon:Settings,x:420,y:230},
  {id:"trash",title:"Trash",icon:Trash2,x:460,y:255},
  {id:"calendar",title:"Calendar",icon:CalendarDays,x:500,y:280},
  {id:"music",title:"Music",icon:Music2,x:540,y:305},
  {id:"image-viewer",title:"Image Viewer",icon:ImageIcon,x:580,y:330},
  {id:"ai-assistant",title:"AI Assistant",icon:Bot,x:620,y:355},
  {id:"account",title:"Account",icon:ShieldCheck,x:660,y:380}
];

function StartMenu({onOpen}) {
  const [query, setQuery] = useState("");
  const filtered = apps.filter(app => app.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="absolute bottom-[78px] left-2 z-[100] max-h-[calc(100vh-94px)] w-[min(390px,calc(100vw-16px))] overflow-y-auto rounded-2xl border border-white/15 bg-slate-950/90 p-[18px] shadow-2xl backdrop-blur-2xl" onClick={e=>e.stopPropagation()}>
      <div className="flex h-[42px] items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 text-white/70">
        <Search size={17}/>
        <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search apps..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"/>
      </div>
      <div className="mb-3 mt-5 flex items-center justify-between px-1">
        <span className="text-sm font-semibold">All apps</span><small className="text-[11px] text-white/50">{filtered.length} apps</small>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {filtered.map(app => { const Icon=app.icon; return (
          <button key={app.id} onClick={()=>onOpen(app)} className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl text-white hover:bg-white/10">
            <span className="grid h-[42px] w-[42px] place-items-center rounded-xl bg-white/10"><Icon size={24}/></span>
            <label className="cursor-pointer text-xs">{app.title}</label>
          </button>
        );})}
        {!filtered.length && <div className="col-span-3 py-10 text-center text-xs text-white/50">No apps found</div>}
      </div>
      <div className="mt-[18px] flex items-center justify-between border-t border-white/10 pt-3">
        <div className="flex items-center gap-2 text-sm"><UserCircle size={22}/>Yash</div>
        <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10"><Power size={19}/></button>
      </div>
    </div>
  );
}
export default StartMenu;
