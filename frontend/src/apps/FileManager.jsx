import React, { useEffect, useMemo, useState } from "react";
import {
  Folder,
  FileText,
  Image,
  Download,
  HardDrive,
  Home,
  ChevronRight,
  MoreVertical,
  Search,
  Trash2,
  Pencil,
  FolderPlus,
} from "lucide-react";
import {
  addFileItem,
  loadFiles,
  removeFileItem,
  updateFileItem,
} from "./fileStore";
import { moveToTrash } from "./trashStore";

function FileManager() {
  const [items, setItems] = useState(loadFiles);
  const [current, setCurrent] = useState("Home");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const sync = (event) => setItems(event.detail || loadFiles());
    window.addEventListener("yashos-files-change", sync);
    return () => window.removeEventListener("yashos-files-change", sync);
  }, []);

  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          item.location === current &&
          item.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, current, query],
  );

  const openItem = (item) => {
    if (item.type === "folder") {
      setCurrent(item.name);
      setSelected(null);
      setQuery("");
    }
  };

  const createFolder = () => {
    const name = window.prompt("Enter folder name:");
    if (!name?.trim()) return;
    const cleanName = name.trim();
    const exists = items.some(
      (i) =>
        i.location === current &&
        i.name.toLowerCase() === cleanName.toLowerCase(),
    );
    if (exists)
      return window.alert("A file or folder with this name already exists.");

    addFileItem({
      id: `file-${Date.now()}`,
      name: cleanName,
      type: "folder",
      location: current,
    });
  };

  const rename = () => {
    if (!selected) return;
    const item = items.find((i) => i.id === selected);
    if (!item) return;
    const name = window.prompt("New name:", item.name);
    if (!name?.trim()) return;
    const cleanName = name.trim();
    const exists = items.some(
      (i) =>
        i.id !== selected &&
        i.location === current &&
        i.name.toLowerCase() === cleanName.toLowerCase(),
    );
    if (exists)
      return window.alert("A file or folder with this name already exists.");
    updateFileItem(selected, { name: cleanName });
  };

  const remove = () => {
    if (!selected) return;
    const item = items.find((i) => i.id === selected);
    if (!item) return;
    if (!window.confirm(`Move "${item.name}" to Trash?`)) return;
    moveToTrash(item);
    removeFileItem(item.id);
    setSelected(null);
  };

  const goHome = () => {
    setCurrent("Home");
    setSelected(null);
    setQuery("");
  };

  return (
    <div className="file-manager">
      <aside className="file-sidebar">
        <button
          className={current === "Home" ? "side-item active" : "side-item"}
          onClick={goHome}
        >
          <Home size={17} />
          Home
        </button>
        <button
          className={current === "Documents" ? "side-item active" : "side-item"}
          onClick={() => setCurrent("Documents")}
        >
          <FileText size={17} />
          Documents
        </button>
        <button
          className={current === "Downloads" ? "side-item active" : "side-item"}
          onClick={() => setCurrent("Downloads")}
        >
          <Download size={17} />
          Downloads
        </button>
        <button
          className={current === "Pictures" ? "side-item active" : "side-item"}
          onClick={() => setCurrent("Pictures")}
        >
          <Image size={17} />
          Pictures
        </button>
        <button
          className={current === "Projects" ? "side-item active" : "side-item"}
          onClick={() => setCurrent("Projects")}
        >
          <Folder size={17} />
          Projects
        </button>
        <div className="storage">
          <div>
            <HardDrive size={16} />
            <span>Local Storage</span>
          </div>
          <div className="storage-bar">
            <span />
          </div>
          <small>2.1 GB of 10 GB used</small>
        </div>
      </aside>

      <section className="file-main">
        <div className="file-toolbar">
          <div className="breadcrumbs">
            <button onClick={goHome}>Home</button>
            {current !== "Home" && (
              <>
                <ChevronRight size={15} />
                <span>{current}</span>
              </>
            )}
          </div>
          <div className="file-actions">
            <div className="file-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
              />
            </div>
            <button onClick={createFolder} title="New folder">
              <FolderPlus size={17} />
            </button>
            <button onClick={rename} disabled={!selected} title="Rename">
              <Pencil size={16} />
            </button>
            <button onClick={remove} disabled={!selected} title="Move to Trash">
              <Trash2 size={16} />
            </button>
            <button title="More">
              <MoreVertical size={17} />
            </button>
          </div>
        </div>

        <div className="file-header">
          <span>Name</span>
          <span>Type</span>
        </div>
        <div className="file-list">
          {visible.map((item) => {
            const Icon = item.type === "folder" ? Folder : FileText;
            return (
              <button
                key={item.id}
                className={`file-row ${selected === item.id ? "selected" : ""}`}
                onClick={() => setSelected(item.id)}
                onDoubleClick={() => openItem(item)}
              >
                <span className="file-name">
                  <Icon size={19} />
                  {item.name}
                </span>
                <span>{item.type === "folder" ? "Folder" : "Text File"}</span>
              </button>
            );
          })}
          {!visible.length && <div className="empty-files">No files found</div>}
        </div>

        <div className="file-status">
          {visible.length} item{visible.length === 1 ? "" : "s"}
        </div>
      </section>
    </div>
  );
}
export default FileManager;
