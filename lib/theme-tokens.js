/**
 * Per-preset surface tokens — structural visual language beyond color swaps.
 * Consumed by themeCss() as :root variables; effects layer adds component rules.
 */

function hexToRgb(hex) {
  const h = String(hex || "#000").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 0, g: 0, b: 0 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgba(hex, alpha) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  if (hex.startsWith("rgba") || hex.startsWith("rgb")) return hex;
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Shared token defaults (polymarket-style fintech) */
const BASE = {
  chromeBg: "rgba(8, 9, 13, 0.78)",
  chromeBgLight: "rgba(8, 9, 13, 0.55)",
  headerBg: "rgba(8, 9, 13, 0.72)",
  chromeBlur: "blur(22px) saturate(1.4)",
  surfaceBlur: "blur(18px)",
  surfaceShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
  surfaceBorder: "var(--line)",
  surfaceBorderStrong: "var(--line-2)",
  fill: "rgba(255, 255, 255, 0.04)",
  fill2: "rgba(255, 255, 255, 0.07)",
  mktRadius: "12px",
  btnRadius: "var(--r-pill)",
  cardHover: "translateY(-1px)",
  ambientFilter: "none",
  logoShadow: "0 0 16px var(--blue-soft)",
  fabShadow: "0 12px 30px var(--blue-soft)",
};

export const THEME_TOKENS = {
  polymarket: {
    ...BASE,
    surfaceBlur: "blur(18px)",
    mktRadius: "12px",
    cardHover: "translateY(-1px)",
  },
  glassmorphism: {
    chromeBg: "rgba(10, 14, 24, 0.45)",
    chromeBgLight: "rgba(10, 14, 24, 0.32)",
    headerBg: "rgba(10, 14, 24, 0.48)",
    chromeBlur: "blur(28px) saturate(1.75)",
    surfaceBlur: "blur(28px) saturate(1.7)",
    surfaceShadow: "0 8px 32px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    surfaceBorder: "rgba(255, 255, 255, 0.14)",
    surfaceBorderStrong: "rgba(255, 255, 255, 0.22)",
    fill: "rgba(255, 255, 255, 0.07)",
    fill2: "rgba(255, 255, 255, 0.12)",
    mktRadius: "14px",
    btnRadius: "var(--r-pill)",
    cardHover: "translateY(-2px)",
    ambientFilter: "saturate(1.15) brightness(1.02)",
    logoShadow: "0 0 24px rgba(90, 200, 250, 0.45)",
    fabShadow: "0 12px 36px rgba(90, 200, 250, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
    surfaceBgAlpha: 0.38,
    surfaceBg2Alpha: 0.48,
  },
  apple: {
    chromeBg: "rgba(12, 14, 20, 0.82)",
    chromeBgLight: "rgba(12, 14, 20, 0.65)",
    headerBg: "rgba(12, 14, 20, 0.78)",
    chromeBlur: "blur(24px) saturate(1.5)",
    surfaceBlur: "blur(20px) saturate(1.4)",
    surfaceShadow: "0 4px 24px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
    fill: "rgba(255, 255, 255, 0.05)",
    fill2: "rgba(255, 255, 255, 0.09)",
    mktRadius: "12px",
    cardHover: "translateY(-1px)",
    ambientFilter: "saturate(1.1)",
    logoShadow: "0 0 18px rgba(10, 132, 255, 0.4)",
    surfaceBgAlpha: 0.88,
    surfaceBg2Alpha: 0.92,
  },
  material3: {
    chromeBg: "rgba(18, 19, 24, 0.94)",
    chromeBgLight: "rgba(18, 19, 24, 0.88)",
    headerBg: "rgba(18, 19, 24, 0.92)",
    chromeBlur: "blur(16px)",
    surfaceBlur: "none",
    surfaceShadow: "0 2px 6px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.28)",
    surfaceBorder: "rgba(255, 255, 255, 0.08)",
    fill: "rgba(208, 188, 255, 0.08)",
    fill2: "rgba(208, 188, 255, 0.14)",
    mktRadius: "12px",
    btnRadius: "999px",
    cardHover: "translateY(-2px)",
    ambientFilter: "none",
    surfaceBgAlpha: 1,
    surfaceBg2Alpha: 1,
  },
  neomorphism: {
    chromeBg: "rgba(45, 50, 80, 0.92)",
    chromeBgLight: "rgba(45, 50, 80, 0.85)",
    headerBg: "rgba(45, 50, 80, 0.9)",
    chromeBlur: "blur(12px)",
    surfaceBlur: "none",
    surfaceShadow: "8px 8px 18px rgba(0,0,0,0.38), -6px -6px 14px rgba(255,255,255,0.04)",
    surfaceBorder: "rgba(255, 255, 255, 0.04)",
    fill: "rgba(255, 255, 255, 0.06)",
    fill2: "rgba(255, 255, 255, 0.09)",
    mktRadius: "16px",
    cardHover: "none",
    ambientFilter: "none",
    surfaceBgAlpha: 1,
    surfaceBg2Alpha: 1,
  },
  fluent: {
    chromeBg: "rgba(27, 26, 25, 0.92)",
    chromeBgLight: "rgba(27, 26, 25, 0.85)",
    headerBg: "rgba(27, 26, 25, 0.9)",
    chromeBlur: "blur(20px) saturate(1.2)",
    surfaceBlur: "blur(12px)",
    surfaceShadow: "0 2px 8px rgba(0,0,0,0.32)",
    surfaceBorder: "rgba(255, 255, 255, 0.12)",
    fill: "rgba(255, 255, 255, 0.05)",
    mktRadius: "6px",
    btnRadius: "6px",
    cardHover: "translateY(-1px)",
    ambientFilter: "none",
    surfaceBgAlpha: 0.95,
    surfaceBg2Alpha: 0.98,
  },
  bootstrap: {
    chromeBg: "rgba(33, 37, 41, 0.96)",
    headerBg: "rgba(33, 37, 41, 0.96)",
    chromeBlur: "blur(16px)",
    surfaceBlur: "none",
    surfaceShadow: "0 0.125rem 0.25rem rgba(0,0,0,0.35)",
    mktRadius: "8px",
    btnRadius: "8px",
    cardHover: "none",
    ambientFilter: "none",
    surfaceBgAlpha: 1,
    surfaceBg2Alpha: 1,
  },
  tailwind: {
    chromeBg: "rgba(15, 23, 42, 0.92)",
    headerBg: "rgba(15, 23, 42, 0.9)",
    chromeBlur: "blur(18px)",
    surfaceBlur: "none",
    surfaceShadow: "0 4px 16px rgba(0,0,0,0.35)",
    surfaceBorder: "#334155",
    mktRadius: "10px",
    btnRadius: "10px",
    cardHover: "translateY(-1px)",
    ambientFilter: "none",
    surfaceBgAlpha: 0.92,
    surfaceBg2Alpha: 0.96,
  },
  cyber: {
    chromeBg: "rgba(5, 5, 12, 0.88)",
    chromeBgLight: "rgba(5, 5, 12, 0.75)",
    headerBg: "rgba(5, 5, 12, 0.85)",
    chromeBlur: "blur(20px)",
    surfaceBlur: "blur(8px)",
    surfaceShadow: "0 0 24px rgba(255, 0, 170, 0.12), inset 0 0 0 1px rgba(0, 255, 255, 0.08)",
    surfaceBorder: "rgba(255, 0, 170, 0.28)",
    surfaceBorderStrong: "rgba(255, 0, 170, 0.45)",
    fill: "rgba(0, 255, 255, 0.06)",
    fill2: "rgba(255, 0, 170, 0.1)",
    mktRadius: "10px",
    cardHover: "translateY(-1px)",
    ambientFilter: "saturate(1.2)",
    logoShadow: "0 0 24px rgba(255, 0, 170, 0.65)",
    fabShadow: "0 0 32px rgba(255, 0, 170, 0.5)",
    surfaceBgAlpha: 0.88,
    surfaceBg2Alpha: 0.92,
  },
  luxury: {
    chromeBg: "rgba(10, 10, 10, 0.92)",
    headerBg: "rgba(10, 10, 10, 0.9)",
    chromeBlur: "blur(16px)",
    surfaceBlur: "none",
    surfaceShadow: "0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.1)",
    surfaceBorder: "rgba(212, 175, 55, 0.22)",
    surfaceBorderStrong: "rgba(212, 175, 55, 0.38)",
    fill: "rgba(212, 175, 55, 0.06)",
    fill2: "rgba(212, 175, 55, 0.1)",
    mktRadius: "8px",
    btnRadius: "8px",
    cardHover: "translateY(-2px)",
    ambientFilter: "none",
    logoShadow: "0 0 20px rgba(212, 175, 55, 0.35)",
    fabShadow: "0 12px 32px rgba(212, 175, 55, 0.35)",
    surfaceBgAlpha: 0.95,
    surfaceBg2Alpha: 0.98,
  },
  spotify: {
    chromeBg: "rgba(18, 18, 18, 0.95)",
    headerBg: "rgba(18, 18, 18, 0.95)",
    chromeBlur: "blur(16px)",
    surfaceBlur: "none",
    surfaceShadow: "0 8px 24px rgba(0,0,0,0.45)",
    mktRadius: "8px",
    btnRadius: "999px",
    cardHover: "none",
    ambientFilter: "none",
    surfaceBgAlpha: 1,
    surfaceBg2Alpha: 1,
  },
  brutalist: {
    chromeBg: "#0d0d0d",
    chromeBgLight: "#0d0d0d",
    headerBg: "#0d0d0d",
    chromeBlur: "none",
    surfaceBlur: "none",
    surfaceShadow: "4px 4px 0 #ffffff",
    surfaceBorder: "#ffffff",
    surfaceBorderStrong: "#ffffff",
    fill: "#1a1a1a",
    fill2: "#222222",
    mktRadius: "0",
    btnRadius: "0",
    cardHover: "none",
    ambientFilter: "none",
    logoShadow: "none",
    fabShadow: "4px 4px 0 #ffeb3b",
    surfaceBgAlpha: 1,
    surfaceBg2Alpha: 1,
  },
};

export function themeTokenCss(preset, config) {
  const tokens = THEME_TOKENS[preset] || THEME_TOKENS.polymarket;
  const c = config.colors || {};
  const s = config.structure || {};
  const blurPx = Number(s.headerBlur || 22);
  const panelHex = c.panel || "#10121a";
  const pa = tokens.surfaceBgAlpha ?? Number(c.panelOpacity ?? 82) / 100;
  const pa2 = tokens.surfaceBg2Alpha ?? Math.min(pa + 0.08, 1);

  const surfaceBg =
    tokens.surfaceBg ||
    (preset === "glassmorphism" || preset === "apple"
      ? rgba(panelHex, pa)
      : "var(--panel)");
  const surfaceBg2 =
    tokens.surfaceBg2 ||
    (preset === "glassmorphism" || preset === "apple"
      ? rgba(panelHex, pa2)
      : "var(--panel-2)");

  const vars = {
    "--chrome-bg": tokens.chromeBg || BASE.chromeBg,
    "--chrome-bg-light": tokens.chromeBgLight || BASE.chromeBgLight,
    "--header-bg": tokens.headerBg || BASE.headerBg,
    "--chrome-blur": tokens.chromeBlur || `blur(${blurPx}px) saturate(1.4)`,
    "--surface-blur-filter": tokens.surfaceBlur === "none" ? "none" : tokens.surfaceBlur || BASE.surfaceBlur,
    "--surface-bg": surfaceBg,
    "--surface-bg-2": surfaceBg2,
    "--surface-shadow": tokens.surfaceShadow || BASE.surfaceShadow,
    "--surface-border": tokens.surfaceBorder || BASE.surfaceBorder,
    "--surface-border-strong": tokens.surfaceBorderStrong || BASE.surfaceBorderStrong,
    "--fill": tokens.fill || BASE.fill,
    "--fill-2": tokens.fill2 || BASE.fill2,
    "--mkt-radius": tokens.mktRadius || BASE.mktRadius,
    "--btn-radius": tokens.btnRadius || BASE.btnRadius,
    "--card-hover-transform": tokens.cardHover || BASE.cardHover,
    "--ambient-filter": tokens.ambientFilter || BASE.ambientFilter,
    "--logo-shadow": tokens.logoShadow || BASE.logoShadow,
    "--fab-shadow": tokens.fabShadow || BASE.fabShadow,
  };

  const lines = Object.entries(vars).map(([k, v]) => `${k}: ${v};`).join("\n  ");
  return `:root {\n  ${lines}\n}`;
}
