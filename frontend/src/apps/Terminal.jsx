import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, Copy, Trash2, TerminalSquare } from "lucide-react";

const virtualFiles = [
  "Documents/",
  "Downloads/",
  "Pictures/",
  "Projects/",
  "readme.txt",
];

export default function Terminal() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState([
    { type: "system", text: "YashOS Terminal v2.0" },
    { type: "system", text: 'Type "help" to see commands.' },
  ]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalScrollRef = useRef(null);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    const el = terminalScrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [output]);

  const print = (lines) =>
    setOutput((prev) => [
      ...prev,
      ...lines.map((text) => ({ type: "output", text })),
    ]);
  const executeCommand = (raw) => {
    const command = raw.trim();
    if (!command) return;
    setCommandHistory((prev) =>
      [command, ...prev.filter((x) => x !== command)].slice(0, 50),
    );
    setHistoryIndex(-1);
    const parts = command.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    if (cmd === "clear" || cmd === "cls") {
      setOutput([]);
      setInput("");
      return;
    }
    let lines = [];
    switch (cmd) {
      case "help":
        lines = [
          "Available commands:",
          "  help              Show commands",
          "  clear / cls       Clear terminal",
          "  date / time       Current date/time",
          "  about             YashOS information",
          "  echo <text>       Print text",
          "  ls                List virtual files",
          "  pwd               Current directory",
          "  whoami            Current user",
          "  uname             System information",
          "  neofetch          System summary",
          "  history           Command history",
          "  cat readme.txt    Read the demo file",
          "  theme             Show current theme",
          "  open <app>        Open app (demo)",
        ];
        break;
      case "date":
        lines = [new Date().toLocaleDateString()];
        break;
      case "time":
        lines = [new Date().toLocaleTimeString()];
        break;
      case "about":
        lines = [
          "YashOS Web Desktop Simulator",
          "React + JavaScript + Tailwind CSS",
          "Frontend + Backend + MongoDB architecture",
        ];
        break;
      case "echo":
        lines = [args.join(" ")];
        break;
      case "ls":
        lines = virtualFiles;
        break;
      case "pwd":
        lines = ["/home/yash"];
        break;
      case "whoami":
        lines = ["yash"];
        break;
      case "uname":
        lines = [
          `YashOS ${navigator.platform} • Browser ${navigator.userAgent.split(" ").pop()}`,
        ];
        break;
      case "neofetch":
        lines = [
          "   __   __     YashOS",
          "  / /  / /     Web Desktop",
          " / /__/ /      React UI",
          "/____  /       Tailwind CSS",
          "     /_/       MongoDB backend",
        ];
        break;
      case "history":
        lines = commandHistory.length
          ? commandHistory.map((c, i) => `${commandHistory.length - i}  ${c}`)
          : ["No command history."];
        break;
      case "cat":
        lines =
          args.join(" ").toLowerCase() === "readme.txt"
            ? [
                "Welcome to YashOS.",
                "This is a safe virtual terminal; it does not execute host OS commands.",
              ]
            : [`cat: ${args.join(" ") || "missing file"}: No such file`];
        break;
      case "theme":
        lines = [
          `Appearance: ${document.documentElement.dataset.yashosAppearance || "dark"}`,
          `Accent: ${document.documentElement.dataset.yashosAccent || "blue"}`,
          `Wallpaper: ${document.documentElement.dataset.yashosWallpaper || "gradient"}`,
        ];
        break;
      case "open":
        lines = args[0]
          ? [`open: ${args[0]} is available from the desktop/taskbar.`]
          : ["Usage: open <app>"];
        break;
      default:
        lines = [
          `${cmd}: command not found. Type "help" for available commands.`,
        ];
    }
    setOutput((prev) => [
      ...prev,
      { type: "command", text: command },
      ...lines.map((text) => ({ type: "output", text })),
    ]);
    setInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") executeCommand(input);
    else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!commandHistory.length) return;
      const next = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(next);
      setInput(commandHistory[next]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        const next = historyIndex - 1;
        setHistoryIndex(next);
        setInput(commandHistory[next]);
      }
    } else if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      setOutput([]);
    }
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output.map((x) => x.text).join("\n"));
    } catch {}
  };

  return (
    <div
      className="flex h-full min-h-0 flex-col bg-slate-950 font-mono text-sm text-slate-100"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <TerminalSquare size={15} />
          <span>yash@YashOS:~</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={copyOutput}
            title="Copy output"
            className="rounded p-1.5 hover:bg-white/10"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => setOutput([])}
            title="Clear"
            className="rounded p-1.5 hover:bg-white/10"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <div
        ref={terminalScrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
        role="log"
      >
        {output.map((item, index) => (
          <div
            key={`${item.type}-${index}`}
            className={
              item.type === "command"
                ? "mt-2 whitespace-pre-wrap text-cyan-300"
                : item.type === "system"
                  ? "whitespace-pre-wrap text-emerald-400"
                  : "whitespace-pre-wrap text-slate-200"
            }
          >
            {item.type === "command" ? `$ ${item.text}` : item.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex shrink-0 items-center gap-2 border-t border-slate-800 bg-slate-900 px-4 py-3">
        <ChevronRight size={15} className="shrink-0 text-emerald-400" />
        <span className="hidden shrink-0 text-emerald-400 sm:inline">
          yash@YashOS:~$
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-600"
          placeholder="Type a command..."
          autoComplete="off"
          spellCheck="false"
          aria-label="Terminal command input"
        />
      </div>
    </div>
  );
}
