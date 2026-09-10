import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  File,
  Folder,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  emptyTrash,
  loadTrash,
  permanentlyDelete,
  restoreFromTrash,
} from "./trashStore";

export default function Trash() {
  const [items, setItems] = useState(loadTrash);

  useEffect(() => {
    const sync = (event) => setItems(event.detail || loadTrash());
    window.addEventListener("yashos-trash-change", sync);
    return () => window.removeEventListener("yashos-trash-change", sync);
  }, []);

  const refresh = () => setItems(loadTrash());

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-800">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h2 className="font-semibold">Recycle Bin</h2>
          <p className="text-xs text-slate-500">
            {items.length} item{items.length === 1 ? "" : "s"} in Trash
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="rounded-lg p-2 hover:bg-slate-100"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => {
              if (
                items.length &&
                window.confirm("Permanently delete all items from Trash?")
              )
                emptyTrash();
            }}
            disabled={!items.length}
            className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={14} /> Empty Trash
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {!items.length ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
            <Trash2 size={48} strokeWidth={1.3} />
            <p className="mt-3 font-medium">Trash is empty</p>
            <p className="mt-1 text-xs">Deleted files will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {items.map((item) => {
              const Icon = item.type === "folder" ? Folder : File;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon size={20} className="shrink-0 text-blue-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.type || "file"} • Deleted{" "}
                        {new Date(item.deletedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => restoreFromTrash(item.id)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                    >
                      <RotateCcw size={14} /> Restore
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(`Permanently delete "${item.name}"?`)
                        )
                          permanentlyDelete(item.id);
                      }}
                      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-2 text-[11px] text-slate-400">
        <AlertTriangle size={12} />
        Restore returns the item to its original YashOS File Manager location.
      </div>
    </div>
  );
}
