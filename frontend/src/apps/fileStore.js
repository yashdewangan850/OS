const FILES_KEY = "yashos_files_v1";

export const INITIAL_ITEMS = [
  { id: 1, name: "Documents", type: "folder", location: "Home" },
  { id: 2, name: "Downloads", type: "folder", location: "Home" },
  { id: 3, name: "Pictures", type: "folder", location: "Home" },
  { id: 4, name: "Projects", type: "folder", location: "Home" },
  { id: 5, name: "readme.txt", type: "file", location: "Home" },
];

export function loadFiles() {
  try {
    const saved = localStorage.getItem(FILES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  } catch {
    return INITIAL_ITEMS;
  }
}

export function saveFiles(items) {
  localStorage.setItem(FILES_KEY, JSON.stringify(items));
  import("../utils/sync").then(({ apiSync }) => apiSync("/sync/files", { files: items }).catch(() => {}));
  window.dispatchEvent(new CustomEvent("yashos-files-change", { detail: items }));
}

export function addFileItem(item) {
  const next = [...loadFiles(), item];
  saveFiles(next);
  return item;
}

export function updateFileItem(id, changes) {
  const next = loadFiles().map((item) => item.id === id ? { ...item, ...changes } : item);
  saveFiles(next);
  return next.find((item) => item.id === id);
}

export function removeFileItem(id) {
  const next = loadFiles().filter((item) => item.id !== id);
  saveFiles(next);
}

export function restoreFileItem(item) {
  const files = loadFiles();
  const exists = files.some(
    (file) => file.location === item.location && file.name.toLowerCase() === item.name.toLowerCase()
  );

  let restored = { ...item };
  if (exists) {
    const dot = item.name.lastIndexOf(".");
    const base = dot > 0 ? item.name.slice(0, dot) : item.name;
    const ext = dot > 0 ? item.name.slice(dot) : "";
    let n = 2;
    let candidate = `${base} (restored)${ext}`;
    while (files.some((file) => file.location === item.location && file.name.toLowerCase() === candidate.toLowerCase())) {
      candidate = `${base} (restored ${n})${ext}`;
      n += 1;
    }
    restored.name = candidate;
  }

  delete restored.deletedAt;
  delete restored.trashedAt;
  saveFiles([...files, restored]);
  return restored;
}
