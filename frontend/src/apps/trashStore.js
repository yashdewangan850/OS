import { restoreFileItem } from "./fileStore";

const TRASH_KEY = "yashos_trash_v1";

export function loadTrash() {
  try {
    const saved = localStorage.getItem(TRASH_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveTrash(items) {
  localStorage.setItem(TRASH_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("yashos-trash-change", { detail: items }));
}

export function moveToTrash(item) {
  const trashItem = {
    ...item,
    id: `trash-${item.id || item.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    originalId: item.id,
    deletedAt: new Date().toISOString(),
  };
  const next = [trashItem, ...loadTrash()];
  saveTrash(next);
  return trashItem;
}

export function restoreFromTrash(id) {
  const trashItem = loadTrash().find((item) => item.id === id);
  if (!trashItem) return null;

  const restored = restoreFileItem({ ...trashItem, id: trashItem.originalId ?? Date.now() });
  const next = loadTrash().filter((item) => item.id !== id);
  saveTrash(next);
  return restored;
}

export function permanentlyDelete(id) {
  const next = loadTrash().filter((item) => item.id !== id);
  saveTrash(next);
}

export function emptyTrash() {
  saveTrash([]);
}
