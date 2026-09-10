import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { apiSync } from "../utils/sync";

const EVENTS_KEY = "yashos_calendar_events_v1";
const pad = (n) => String(n).padStart(2, "0");
const dateKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function Calendar() {
  const today = new Date();
  const [view, setView] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selected, setSelected] = useState(dateKey(today));
  const [events, setEvents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(EVENTS_KEY)) || {};
    } catch {
      return {};
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    apiSync("/sync/events", { events }).catch(() => {});
  }, [events]);

  const days = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [view]);

  const selectedEvents = events[selected] || [];
  const monthName = view.toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (amount) =>
    setView(new Date(view.getFullYear(), view.getMonth() + amount, 1));
  const goToday = () => {
    setView(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(dateKey(today));
  };

  const addEvent = (e) => {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    setEvents((current) => ({
      ...current,
      [selected]: [
        ...(current[selected] || []),
        { id: Date.now(), title: value },
      ],
    }));
    setTitle("");
    setShowForm(false);
  };

  const removeEvent = (id) =>
    setEvents((current) => ({
      ...current,
      [selected]: (current[selected] || []).filter((event) => event.id !== id),
    }));

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950 text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={19} />
          <span className="font-semibold">{monthName}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => changeMonth(-1)}
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label="Previous month"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            onClick={goToday}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/10"
          >
            Today
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label="Next month"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-white/10 text-center text-[11px] text-white/45">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 grid-rows-6">
        {days.map((d) => {
          const key = dateKey(d);
          const inMonth = d.getMonth() === view.getMonth();
          const isToday = key === dateKey(today);
          const isSelected = key === selected;
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`relative min-h-0 border-b border-r border-white/5 p-2 text-left hover:bg-white/5 ${inMonth ? "text-white" : "text-white/25"} ${isSelected ? "bg-violet-500/15" : ""}`}
            >
              <span
                className={`inline-grid h-6 w-6 place-items-center rounded-full text-xs ${isToday ? "bg-violet-500 font-bold text-white" : ""}`}
              >
                {d.getDate()}
              </span>
              {events[key]?.length > 0 && (
                <span className="absolute bottom-1 left-2 right-2 truncate text-[9px] text-violet-300">
                  {events[key][0].title}
                  {events[key].length > 1 ? ` +${events[key].length - 1}` : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <aside className="border-t border-white/10 bg-white/[.03] p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/45">Selected date</p>
            <p className="text-sm font-semibold">
              {new Date(`${selected}T00:00:00`).toLocaleDateString([], {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-lg yashos-accent-bg px-3 py-2 text-xs font-semibold hover:bg-violet-400"
          >
            <Plus size={14} />
            Add event
          </button>
        </div>
        <div className="mt-2 space-y-1.5">
          {selectedEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs"
            >
              <span>{event.title}</span>
              <button
                onClick={() => removeEvent(event.id)}
                className="rounded p-1 text-white/40 hover:bg-red-500/20 hover:text-red-300"
                aria-label="Delete event"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {!selectedEvents.length && (
            <p className="text-xs text-white/35">No events for this date.</p>
          )}
        </div>
      </aside>
      {showForm && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/50 p-5">
          <form
            onSubmit={addEvent}
            className="w-full max-w-xs rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">New event</h3>
              <button type="button" onClick={() => setShowForm(false)}>
                <X size={16} />
              </button>
            </div>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-400"
            />
            <button className="mt-3 w-full rounded-lg yashos-accent-bg py-2 text-xs font-semibold hover:bg-violet-400">
              Save event
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
export default Calendar;
