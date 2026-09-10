import React, { useEffect, useState } from "react";
import { Check, Moon, Monitor, Palette, RotateCcw, Sun } from "lucide-react";
import { DEFAULT_SETTINGS } from "../utils/theme";

const wallpapers = [
  { id: "gradient", name: "Aurora", className: "bg-gradient-to-br from-slate-950 via-blue-900 to-cyan-700" },
  { id: "sunset", name: "Sunset", className: "bg-gradient-to-br from-indigo-950 via-fuchsia-800 to-orange-500" },
  { id: "forest", name: "Forest", className: "bg-gradient-to-br from-emerald-950 via-green-800 to-lime-500" },
  { id: "ocean", name: "Ocean", className: "bg-gradient-to-br from-sky-950 via-blue-700 to-teal-400" },
];

const themes = [
  { id: "blue", name: "Blue", className: "bg-blue-600" },
  { id: "violet", name: "Violet", className: "bg-violet-600" },
  { id: "emerald", name: "Emerald", className: "bg-emerald-600" },
  { id: "rose", name: "Rose", className: "bg-rose-600" },
];

export default function Settings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("yashos_settings_v1");
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem("yashos_settings_v1", JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("yashos-settings-change", { detail: settings }));
  }, [settings]);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setSettings({ ...DEFAULT_SETTINGS });

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-5 text-slate-900 dark:bg-slate-900 dark:text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">System</p>
          <h2 className="mt-1 text-2xl font-bold">Settings</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Customize the YashOS desktop experience.
          </p>
        </div>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-3">
            <Monitor className="text-blue-500" size={20} />
            <div>
              <h3 className="font-semibold">Appearance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose the interface mode.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              ["light", "Light", Sun],
              ["dark", "Dark", Moon],
              ["system", "System", Monitor],
            ].map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => update("appearance", id)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                  settings.appearance === id
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700"
                }`}
              >
                <Icon size={16} />
                {label}
                {settings.appearance === id && <Check size={14} />}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-3">
            <Palette className="text-violet-500" size={20} />
            <div>
              <h3 className="font-semibold">Wallpaper</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select your desktop background.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {wallpapers.map((wallpaper) => (
              <button
                key={wallpaper.id}
                onClick={() => update("wallpaper", wallpaper.id)}
                className={`group overflow-hidden rounded-xl border-2 text-left ${
                  settings.wallpaper === wallpaper.id ? "border-blue-500" : "border-transparent"
                }`}
              >
                <div className={`h-20 ${wallpaper.className}`} />
                <div className="flex items-center justify-between bg-slate-100 px-2 py-2 text-xs font-medium dark:bg-slate-700">
                  {wallpaper.name}
                  {settings.wallpaper === wallpaper.id && <Check size={13} />}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-violet-500" />
            <div>
              <h3 className="font-semibold">Accent Color</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose a system accent.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => update("accent", theme.id)}
                aria-pressed={settings.accent === theme.id}
                className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${
                  settings.accent === theme.id
                    ? "border-slate-900 dark:border-white"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <span className={`h-4 w-4 rounded-full ${theme.className}`} />
                {theme.name}
                {settings.accent === theme.id && <Check size={13} />}
              </button>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div>
            <h3 className="font-semibold">Reset settings</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Restore YashOS default appearance.</p>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </section>
      </div>
    </div>
  );
}
