import React, { useEffect, useMemo, useState } from "react";
import { FilePlus2, Search, Trash2, Save, StickyNote, Clock3 } from "lucide-react";
import { apiSync } from "../utils/sync";

const STORAGE_KEY = "yashos_notes_v1";

const seedNotes = [
  {
    id: 1,
    title: "Welcome to YashOS",
    content: "This is your first note. Start writing here...",
    updatedAt: Date.now()
  }
];

function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seedNotes;
  } catch {
    return seedNotes;
  }
}

function Notes() {
  const [notes, setNotes] = useState(loadNotes);
  const [activeId, setActiveId] = useState(notes[0]?.id ?? null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    apiSync("/sync/notes", { notes }).catch(() => {});
  }, [notes]);

  const activeNote = notes.find(note => note.id === activeId) || null;

  const filteredNotes = useMemo(
    () =>
      notes.filter(note =>
        `${note.title} ${note.content}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [notes, query]
  );

  const createNote = () => {
    const note = {
      id: Date.now(),
      title: "Untitled Note",
      content: "",
      updatedAt: Date.now()
    };
    setNotes(current => [note, ...current]);
    setActiveId(note.id);
    setQuery("");
  };

  const updateActive = (field, value) => {
    setNotes(current =>
      current.map(note =>
        note.id === activeId
          ? { ...note, [field]: value, updatedAt: Date.now() }
          : note
      )
    );
  };

  const deleteActive = () => {
    if (!activeNote) return;
    const remaining = notes.filter(note => note.id !== activeId);
    setNotes(remaining);
    setActiveId(remaining[0]?.id ?? null);
  };

  const formatTime = timestamp =>
    new Date(timestamp).toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

  return (
    <div className="notes-app">
      <aside className="notes-sidebar">
        <div className="notes-header">
          <div>
            <strong>Notes</strong>
            <small>{notes.length} note{notes.length === 1 ? "" : "s"}</small>
          </div>
          <button onClick={createNote} title="New note">
            <FilePlus2 size={17} />
          </button>
        </div>

        <div className="notes-search">
          <Search size={15} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search notes..."
          />
        </div>

        <div className="notes-list">
          {filteredNotes.map(note => (
            <button
              key={note.id}
              className={`note-item ${activeId === note.id ? "selected" : ""}`}
              onClick={() => setActiveId(note.id)}
            >
              <StickyNote size={17} />
              <span>
                <strong>{note.title || "Untitled Note"}</strong>
                <small>{note.content || "No content"}</small>
              </span>
            </button>
          ))}
          {!filteredNotes.length && (
            <div className="notes-empty">No notes found</div>
          )}
        </div>
      </aside>

      <section className="note-editor">
        {activeNote ? (
          <>
            <div className="note-toolbar">
              <span className="saved-status">
                <Save size={14} /> Saved locally + cloud
              </span>
              <button onClick={deleteActive} title="Delete note">
                <Trash2 size={16} />
              </button>
            </div>

            <input
              className="note-title-input"
              value={activeNote.title}
              onChange={e => updateActive("title", e.target.value)}
              placeholder="Note title"
            />

            <textarea
              className="note-content-input"
              value={activeNote.content}
              onChange={e => updateActive("content", e.target.value)}
              placeholder="Start writing..."
            />

            <div className="note-footer">
              <span>
                <Clock3 size={13} /> Updated {formatTime(activeNote.updatedAt)}
              </span>
              <span>{activeNote.content.length} characters</span>
            </div>
          </>
        ) : (
          <div className="no-active-note">
            <StickyNote size={45} />
            <h2>No note selected</h2>
            <button onClick={createNote}>Create a note</button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Notes;
