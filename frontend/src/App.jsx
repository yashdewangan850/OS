import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import Desktop from "./components/Desktop";
import { notify } from "./components/NotificationCenter";
import { applySettings, readSettings } from "./utils/theme";

function App() {
  const zCounter = useRef(10);
  const [windows, setWindows] = useState([]);
  const [startOpen, setStartOpen] = useState(false);

  const WINDOW_GEOMETRY_KEY = "yashos_window_geometry_v2";
  const readGeometry = () => {
    try { return JSON.parse(localStorage.getItem(WINDOW_GEOMETRY_KEY) || "{}"); }
    catch { return {}; }
  };
  const [savedGeometry] = useState(readGeometry);

  useEffect(() => {
    applySettings(readSettings());
    const handleSettings = (event) => applySettings(event.detail);
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handleSystemTheme = () => {
      if (readSettings().appearance === "system") applySettings(readSettings());
    };
    window.addEventListener("yashos-settings-change", handleSettings);
    media?.addEventListener?.("change", handleSystemTheme);
    return () => {
      window.removeEventListener("yashos-settings-change", handleSettings);
      media?.removeEventListener?.("change", handleSystemTheme);
    };
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem("yashos_welcome_notification_v1")) {
      notify({ title: "Welcome to YashOS", message: "Your desktop is ready.", type: "success" });
      sessionStorage.setItem("yashos_welcome_notification_v1", "1");
    }
  }, []);

  const nextZ = () => ++zCounter.current;

  const openWindow = (app) => {
    setWindows((current) => {
      const existing = current.find((win) => win.id === app.id);
      if (existing) {
        return current.map((win) =>
          win.id === app.id ? { ...win, minimized: false, z: nextZ() } : win
        );
      }
      const saved = savedGeometry[app.id] || {};
      const minWidth = 360;
      const minHeight = 250;
      const topOffset = 64;
      const taskbarSpace = 78;
      const availableWidth = Math.max(minWidth, window.innerWidth - 16);
      const availableHeight = Math.max(minHeight, window.innerHeight - topOffset - taskbarSpace - 12);
      const finite = (value) => Number.isFinite(Number(value));
      const width = Math.min(
        Math.max(finite(saved.width) ? Number(saved.width) : (Number(app.width) || 620), minWidth),
        availableWidth,
      );
      const height = Math.min(
        Math.max(finite(saved.height) ? Number(saved.height) : (Number(app.height) || 420), minHeight),
        availableHeight,
      );

      // Start new windows in the usable desktop area. Old geometry is ignored when
      // it contains invalid/off-canvas coordinates (the previous version could save 0,0).
      const hasUsableSavedPosition = finite(saved.x) && finite(saved.y) && Number(saved.y) >= topOffset - 4;
      const offset = (current.length % 5) * 28;
      const centeredX = Math.round((window.innerWidth - width) / 2) + offset;
      const centeredY = Math.round(topOffset + (availableHeight - height) / 2) + offset;
      const rawX = hasUsableSavedPosition ? Number(saved.x) : centeredX;
      const rawY = hasUsableSavedPosition ? Number(saved.y) : centeredY;
      const x = Math.max(8, Math.min(rawX, Math.max(8, window.innerWidth - width - 8)));
      const y = Math.max(topOffset, Math.min(rawY, Math.max(topOffset, window.innerHeight - taskbarSpace - height)));
      return [...current, { ...app, x, y, width, height, minimized: false, maximized: false, snap: null, z: nextZ() }];
    });
    setStartOpen(false);
  };

  const closeWindow = (id) => setWindows((current) => current.filter((win) => win.id !== id));
  const minimizeWindow = (id) => setWindows((current) => current.map((win) => win.id === id ? { ...win, minimized: true } : win));
  const maximizeWindow = (id, snap = null) => setWindows((current) => current.map((win) => {
    if (win.id !== id) return win;
    if (snap) return { ...win, maximized: true, snap, minimized: false, z: nextZ() };
    return { ...win, maximized: !win.maximized, snap: null, minimized: false, z: nextZ() };
  }));
  const focusWindow = (id) => setWindows((current) => current.map((win) => win.id === id ? { ...win, minimized: false, z: nextZ() } : win));

  const saveGeometry = (id, geometry) => {
    setWindows((current) => current.map((win) => win.id === id ? { ...win, ...geometry } : win));
    try {
      const saved = readGeometry();
      saved[id] = { ...(saved[id] || {}), ...geometry };
      localStorage.setItem(WINDOW_GEOMETRY_KEY, JSON.stringify(saved));
    } catch { /* localStorage can be unavailable */ }
  };

  return (
    <Desktop
      windows={windows}
      startOpen={startOpen}
      setStartOpen={setStartOpen}
      onOpen={openWindow}
      onClose={closeWindow}
      onMinimize={minimizeWindow}
      onMaximize={maximizeWindow}
      onFocus={focusWindow}
      onGeometryChange={saveGeometry}
    />
  );
}

export default App;
