import React, { useEffect, useMemo, useState } from "react";
import { Rnd } from "react-rnd";
import ErrorBoundary from "./ErrorBoundary";
import {
  Minus,
  Square,
  X,
  Maximize2,
  Folder,
  Terminal as TerminalIcon,
  FileText,
  Calculator as CalculatorIcon,
  Globe,
  Settings as SettingsIcon,
  Trash2,
  CalendarDays,
  Music2,
  Image as ImageIcon,
  Bot,
  ShieldCheck,
} from "lucide-react";
import FileManager from "../apps/FileManager";
import Notes from "../apps/Notes";
import Calculator from "../apps/Calculator";
import Terminal from "../apps/Terminal";
import Browser from "../apps/Browser";
import Settings from "../apps/Settings";
import Trash from "../apps/Trash";
import Calendar from "../apps/Calendar";
import Music from "../apps/Music";
import ImageViewer from "../apps/ImageViewer";
import AIAssistant from "../apps/AIAssistant";
import Auth from "../apps/Auth";

const icons = {
  Files: Folder,
  Terminal: TerminalIcon,
  Notes: FileText,
  Calculator: CalculatorIcon,
  Browser: Globe,
  Settings: SettingsIcon,
  Trash: Trash2,
  Calendar: CalendarDays,
  Music: Music2,
  "Image Viewer": ImageIcon,
  "AI Assistant": Bot,
  Account: ShieldCheck,
};

const defaults = {
  Calendar: { width: 700, height: 650 },
  Music: { width: 820, height: 560 },
  "AI Assistant": { width: 700, height: 620 },
  Account: { width: 520, height: 620 },
  Files: { width: 820, height: 560 },
  Notes: { width: 820, height: 560 },
  Browser: { width: 900, height: 600 },
  "Image Viewer": { width: 760, height: 540 },
  default: { width: 620, height: 420 },
};

const MIN_WIDTH = 360;
const MIN_HEIGHT = 250;
const TOP_OFFSET = 64;
const TASKBAR_SPACE = 78;

function getDefaultSize(title, viewport) {
  const base = defaults[title] || defaults.default;
  return {
    width: Math.min(base.width, Math.max(MIN_WIDTH, viewport.width - 24)),
    height: Math.min(
      base.height,
      Math.max(MIN_HEIGHT, viewport.height - TOP_OFFSET - TASKBAR_SPACE - 12),
    ),
  };
}

function Window({
  app,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onGeometryChange,
}) {
  const Icon = icons[app.title] || Square;
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const defaultSize = useMemo(
    () => getDefaultSize(app.title, viewport),
    [app.title, viewport.width, viewport.height],
  );
  const [position, setPosition] = useState({
    x: Number.isFinite(Number(app.x)) ? Number(app.x) : 180,
    y: Number.isFinite(Number(app.y)) ? Number(app.y) : 90,
  });
  const [dimensions, setDimensions] = useState({
    width: app.width ?? defaultSize.width,
    height: app.height ?? defaultSize.height,
  });
  const [dragging, setDragging] = useState(false);
  const [snapPreview, setSnapPreview] = useState(null);

  useEffect(() => {
    const update = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (app.maximized) return;
    setPosition({
      x: Number.isFinite(Number(app.x))
        ? Number(app.x)
        : Math.round((viewport.width - defaultSize.width) / 2),
      y:
        Number.isFinite(Number(app.y)) && Number(app.y) >= TOP_OFFSET
          ? Number(app.y)
          : Math.max(
              TOP_OFFSET,
              Math.round(
                (viewport.height - defaultSize.height - TASKBAR_SPACE) / 2,
              ) +
                TOP_OFFSET / 2,
            ),
    });
    setDimensions({
      width: Number.isFinite(Number(app.width))
        ? Number(app.width)
        : defaultSize.width,
      height: Number.isFinite(Number(app.height))
        ? Number(app.height)
        : defaultSize.height,
    });
  }, [
    app.id,
    app.maximized,
    app.x,
    app.y,
    app.width,
    app.height,
    defaultSize.width,
    defaultSize.height,
  ]);

  const maxHeight = Math.max(
    MIN_HEIGHT,
    viewport.height - TOP_OFFSET - TASKBAR_SPACE,
  );
  const maxNormalWidth = Math.max(MIN_WIDTH, viewport.width - 16);
  const normalWidth = Math.min(
    Math.max(MIN_WIDTH, dimensions.width),
    maxNormalWidth,
  );
  const normalHeight = Math.min(
    Math.max(MIN_HEIGHT, dimensions.height),
    maxHeight,
  );

  const geometry = app.maximized
    ? app.snap === "left"
      ? {
          x: 0,
          y: TOP_OFFSET,
          width: Math.floor(viewport.width / 2),
          height: maxHeight,
        }
      : app.snap === "right"
        ? {
            x: Math.floor(viewport.width / 2),
            y: TOP_OFFSET,
            width: Math.ceil(viewport.width / 2),
            height: maxHeight,
          }
        : { x: 0, y: TOP_OFFSET, width: viewport.width, height: maxHeight }
    : {
        x: Math.max(8, Math.min(position.x, viewport.width - normalWidth - 8)),
        y: Math.max(
          TOP_OFFSET,
          Math.min(position.y, viewport.height - TASKBAR_SPACE - normalHeight),
        ),
        width: normalWidth,
        height: normalHeight,
      };

  const handleDragStart = () => {
    onFocus(app.id);
    setDragging(true);
  };

  const handleDrag = (_, data) => {
    if (app.maximized) return;
    setPosition({ x: data.x, y: data.y });
    const edge = 32;
    if (data.y <= TOP_OFFSET - 12) setSnapPreview("max");
    else if (data.x <= edge) setSnapPreview("left");
    else if (data.x + geometry.width >= viewport.width - edge)
      setSnapPreview("right");
    else setSnapPreview(null);
  };

  const handleDragStop = (_, data) => {
    setDragging(false);
    const edge = 32;
    const currentWidth = geometry.width;
    const currentHeight = geometry.height;

    if (data.y <= TOP_OFFSET - 12) {
      setSnapPreview(null);
      onMaximize(app.id);
      return;
    }
    if (data.x <= edge) {
      setSnapPreview(null);
      onMaximize(app.id, "left");
      return;
    }
    if (data.x + currentWidth >= viewport.width - edge) {
      setSnapPreview(null);
      onMaximize(app.id, "right");
      return;
    }

    const nextX = Math.max(
      8,
      Math.min(data.x, Math.max(8, viewport.width - currentWidth - 8)),
    );
    const nextY = Math.max(
      TOP_OFFSET,
      Math.min(
        data.y,
        Math.max(TOP_OFFSET, viewport.height - TASKBAR_SPACE - currentHeight),
      ),
    );
    setPosition({ x: nextX, y: nextY });
    onGeometryChange?.(app.id, { x: nextX, y: nextY });
    setSnapPreview(null);
  };

  const handleResizeStart = () => {
    onFocus(app.id);
    setDragging(true);
  };

  const handleResize = (_, __, ref, ___, nextPosition) => {
    const nextWidth = Math.min(
      Math.max(MIN_WIDTH, ref.offsetWidth),
      maxNormalWidth,
    );
    const nextHeight = Math.min(
      Math.max(MIN_HEIGHT, ref.offsetHeight),
      maxHeight,
    );
    const nextX = Math.max(
      8,
      Math.min(nextPosition.x, viewport.width - nextWidth - 8),
    );
    const nextY = Math.max(
      TOP_OFFSET,
      Math.min(nextPosition.y, viewport.height - TASKBAR_SPACE - nextHeight),
    );
    setDimensions({ width: nextWidth, height: nextHeight });
    setPosition({ x: nextX, y: nextY });
  };

  const handleResizeStop = (_, __, ref, ___, nextPosition) => {
    const nextWidth = Math.min(
      Math.max(MIN_WIDTH, ref.offsetWidth),
      maxNormalWidth,
    );
    const nextHeight = Math.min(
      Math.max(MIN_HEIGHT, ref.offsetHeight),
      maxHeight,
    );
    const nextX = Math.max(
      8,
      Math.min(nextPosition.x, viewport.width - nextWidth - 8),
    );
    const nextY = Math.max(
      TOP_OFFSET,
      Math.min(nextPosition.y, viewport.height - TASKBAR_SPACE - nextHeight),
    );
    setDragging(false);
    setDimensions({ width: nextWidth, height: nextHeight });
    setPosition({ x: nextX, y: nextY });
    onGeometryChange?.(app.id, {
      x: nextX,
      y: nextY,
      width: nextWidth,
      height: nextHeight,
    });
    onFocus(app.id);
  };

  let content;
  switch (app.title) {
    case "Files":
      content = <FileManager />;
      break;
    case "Notes":
      content = <Notes />;
      break;
    case "Calculator":
      content = <Calculator />;
      break;
    case "Terminal":
      content = <Terminal />;
      break;
    case "Browser":
      content = <Browser />;
      break;
    case "Settings":
      content = <Settings />;
      break;
    case "Trash":
      content = <Trash />;
      break;
    case "Calendar":
      content = <Calendar />;
      break;
    case "Music":
      content = <Music />;
      break;
    case "Image Viewer":
      content = <ImageViewer />;
      break;
    case "AI Assistant":
      content = <AIAssistant />;
      break;
    case "Account":
      content = <Auth />;
      break;
    default:
      content = (
        <div className="flex h-full items-center justify-center text-white/70">
          {app.title}
        </div>
      );
  }

  const snapClass =
    snapPreview === "max"
      ? "inset-x-2 top-16 bottom-[76px]"
      : snapPreview === "left"
        ? "left-2 top-16 bottom-[76px] w-[calc(50%-12px)]"
        : "right-2 top-16 bottom-[76px] w-[calc(50%-12px)]";

  const maximizeIcon = app.maximized ? (
    <Maximize2 size={14} className="mx-auto" />
  ) : (
    <Square size={14} className="mx-auto" />
  );

  return (
    <Rnd
      bounds="parent"
      position={{ x: geometry.x, y: geometry.y }}
      size={{ width: geometry.width, height: geometry.height }}
      minWidth={MIN_WIDTH}
      minHeight={MIN_HEIGHT}
      maxWidth={app.maximized ? viewport.width : maxNormalWidth}
      maxHeight={maxHeight}
      disableDragging={app.maximized}
      enableResizing={!app.maximized}
      dragHandleClassName="yashos-window-header"
      cancel=".yashos-window-controls,button,input,textarea,select,a"
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      enableUserSelectHack
      onMouseDown={() => onFocus(app.id)}
      className="!absolute z-[40]"
      style={{ zIndex: 40 + Math.min(Number(app.z) || 0, 70) }}
      resizeHandleClasses={{
        top: "yashos-resize-handle",
        right: "yashos-resize-handle",
        bottom: "yashos-resize-handle",
        left: "yashos-resize-handle",
        topRight: "yashos-resize-handle",
        bottomRight: "yashos-resize-handle",
        bottomLeft: "yashos-resize-handle",
        topLeft: "yashos-resize-handle",
      }}
    >
      <section className="yashos-window relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-900/95 text-white shadow-[0_25px_70px_rgba(0,0,0,.42)] backdrop-blur-xl">
        {snapPreview && !app.maximized && (
          <div
            className={`pointer-events-none fixed z-[500] ${snapClass} rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm`}
          />
        )}

        <header
          className={`yashos-window-header flex h-12 shrink-0 select-none items-center justify-between border-b pl-4 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          onDoubleClick={() => onMaximize(app.id)}
        >
          <div className="yashos-window-title flex min-w-0 items-center gap-2 text-sm font-semibold">
            <Icon size={17} />
            <span className="truncate">{app.title}</span>
          </div>

          <div className="yashos-window-controls flex h-full shrink-0">
            <button
              type="button"
              className="w-11 text-white hover:bg-white/10"
              onClick={() => onMinimize(app.id)}
              aria-label="Minimize"
            >
              <Minus size={16} className="mx-auto" />
            </button>
            <button
              type="button"
              className="w-11 text-white hover:bg-white/10"
              onClick={() => onMaximize(app.id)}
              aria-label={app.maximized ? "Restore" : "Maximize"}
            >
              {maximizeIcon}
            </button>
            <button
              type="button"
              className="w-11 text-white hover:bg-red-600"
              onClick={() => onClose(app.id)}
              aria-label="Close"
            >
              <X size={16} className="mx-auto" />
            </button>
          </div>
        </header>

        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <ErrorBoundary>{content}</ErrorBoundary>
        </div>
      </section>
    </Rnd>
  );
}

export default Window;
