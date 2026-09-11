export const DEFAULT_SETTINGS = {
  appearance: "dark",
  wallpaper: "gradient",
  accent: "blue",
};
export const WALLPAPERS = {
  gradient:
    "radial-gradient(circle at 70% 20%, rgba(93,135,206,.75), transparent 35%), radial-gradient(ellipse at 50% 90%, rgba(24,65,72,.7), transparent 38%), linear-gradient(160deg,#52739e 0%,#304f72 48%,#101a2b 100%)",
  sunset:
    "radial-gradient(circle at 70% 20%, rgba(244,114,182,.65), transparent 35%), linear-gradient(145deg,#1e1b4b 0%,#86198f 48%,#f97316 100%)",
  forest:
    "radial-gradient(circle at 70% 20%, rgba(132,204,22,.55), transparent 35%), linear-gradient(145deg,#052e16 0%,#166534 50%,#65a30d 100%)",
  ocean:
    "radial-gradient(circle at 70% 20%, rgba(45,212,191,.55), transparent 35%), linear-gradient(145deg,#082f49 0%,#1d4ed8 50%,#0f766e 100%)",
};
export const ACCENTS = {
  blue: "#3b82f6",
  violet: "#8b5cf6",
  emerald: "#10b981",
  rose: "#f43f5e",
};

export function readSettings() {
  try {
    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(localStorage.getItem("yashos_settings_v1") || "{}"),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function applySettings(settings = readSettings()) {
  const root = document.documentElement;
  const appearance =
    settings.appearance === "system"
      ? window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : settings.appearance;
  root.classList.toggle("dark", appearance === "dark");
  root.dataset.yashosAppearance = appearance;
  root.dataset.yashosWallpaper = settings.wallpaper;
  root.dataset.yashosAccent = settings.accent;
  const wallpaper = WALLPAPERS[settings.wallpaper] || WALLPAPERS.gradient;
  root.style.setProperty("--yashos-wallpaper", wallpaper);
  root.style.setProperty(
    "--yashos-accent",
    ACCENTS[settings.accent] || ACCENTS.blue,
  );
  root.style.setProperty(
    "--yashos-accent-soft",
    `${ACCENTS[settings.accent] || ACCENTS.blue}22`,
  );
}
