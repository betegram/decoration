/**
 * Theme Engine — complete design systems, not color presets.
 *
 * Each theme is a full recipe controlling: material (surface/opacity/blur/
 * shadow/highlight), geometry (radii, control shape), depth (elevation model),
 * motion (duration/easing/interaction), and per-component behavior (nav, cards,
 * buttons, inputs, chips, ticket, modal, fab, skeletons, scrollbar, states).
 *
 * A recipe is expanded by one generator into CSS scoped to `body.theme-<id>`,
 * so the SAME markup renders with a completely different visual language.
 *
 * Design principle:  Theme = Visual Language + Material Physics + Geometry +
 * Interaction Behavior + Motion Personality + Depth System + Environment.
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
  if (hex.startsWith("rgba") || hex.startsWith("rgb") || hex.startsWith("var")) return hex;
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Recipe defaults. Every theme inherits these then overrides.
 * Values may reference base custom props (--blue, --ink, --bg, --line …) which
 * are generated from the color config, so color stays data-driven while the
 * design system (geometry/material/motion) is theme-owned.
 */
const BASE_RECIPE = {
  family: "Modern",
  // ── Material ───────────────────────────────────────────────
  cardBg: "var(--panel)",
  cardBg2: "var(--panel-2)",
  cardBorder: "var(--line)",
  cardBorderStrong: "var(--line-2)",
  surfaceBlur: "blur(18px)",
  chromeBg: "var(--bg-2)",
  chromeBgLight: "var(--bg-2)",
  headerBg: "rgba(8, 9, 13, 0.72)",
  chromeBlur: "blur(22px) saturate(1.4)",
  fill: "rgba(255, 255, 255, 0.04)",
  fill2: "rgba(255, 255, 255, 0.07)",
  // ── Depth ──────────────────────────────────────────────────
  cardShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
  cardHoverShadow: "0 18px 48px rgba(0, 0, 0, 0.45)",
  cardHoverTransform: "translateY(-2px)",
  cardHoverBorder: "var(--line-2)",
  logoShadow: "0 0 16px var(--blue-soft)",
  fabShadow: "0 12px 30px var(--blue-soft)",
  // ── Geometry ───────────────────────────────────────────────
  cardRadius: "var(--r-lg)",
  mktRadius: "12px",
  btnRadius: "999px",
  inputRadius: "10px",
  chipRadius: "999px",
  modalRadius: "0px",
  // ── Motion ─────────────────────────────────────────────────
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
  durFast: "120ms",
  dur: "180ms",
  activeScale: "0.97",
  // ── Environment ────────────────────────────────────────────
  ambientFilter: "none",
  ambient: null,
  // ── Components ─────────────────────────────────────────────
  nav: "block", // block | pill | underline | segmented
  headingTransform: "none",
  headingSpacing: "-0.02em",
  // market outcome buttons
  mktBg: "var(--fill)",
  mktBorder: "1px solid var(--line)",
  mktHoverBg: "var(--blue-soft)",
  mktHoverBorder: "rgba(10,132,255,0.45)",
  mktHoverTransform: "none",
  mktOnBg: "var(--blue)",
  mktOnColor: "#fff",
  mktOnShadow: "0 8px 20px var(--blue-soft)",
  mktStateLayer: false,
  // chips / active pills
  chipOnBg: "var(--blue)",
  chipOnColor: "#fff",
  chipOnShadow: "0 6px 18px var(--blue-soft)",
  // primary / fab
  primaryBg: "linear-gradient(180deg, var(--blue-2), var(--blue))",
  primaryColor: "#fff",
  primaryShadow: "0 10px 24px var(--blue-soft)",
  fabBg: "linear-gradient(180deg, var(--blue-2), var(--blue))",
  fabColor: "#fff",
  // inputs
  inputBg: "var(--fill)",
  inputBorder: "1px solid var(--line)",
  inputFocusBorder: "rgba(10,132,255,0.5)",
  inputFocusShadow: "0 0 0 3px var(--blue-soft)",
  inputInset: false,
  // modal (event desk sheet)
  modalBg: "#0b0d13",
  modalBorderLeft: "1px solid var(--line-2)",
  modalShadow: "-20px 0 60px rgba(0,0,0,0.45)",
  modalAnim: "deskSlide",
  // focus ring
  focusRing: "0 0 0 3px var(--blue-soft)",
  // scrollbar
  scrollThumb: "rgba(255,255,255,0.16)",
  // freeform signature CSS (function of id)
  signature: () => "",
};

/** All theme recipes. Ordered by design family. */
export const THEME_RECIPES = {
  // ── Glass / translucent ─────────────────────────────────────
  glassmorphism: {
    family: "Glass",
    cardBg: "rgba(255,255,255,0.06)",
    cardBg2: "rgba(255,255,255,0.09)",
    cardBorder: "rgba(255,255,255,0.16)",
    cardBorderStrong: "rgba(255,255,255,0.28)",
    surfaceBlur: "blur(30px) saturate(1.8)",
    chromeBg: "rgba(10,14,24,0.45)",
    chromeBgLight: "rgba(10,14,24,0.3)",
    headerBg: "rgba(10,14,24,0.4)",
    chromeBlur: "blur(30px) saturate(1.8)",
    fill: "rgba(255,255,255,0.08)",
    fill2: "rgba(255,255,255,0.14)",
    cardShadow: "0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.18)",
    cardHoverShadow: "0 16px 48px rgba(90,200,250,0.28), inset 0 1px 0 rgba(255,255,255,0.28)",
    cardHoverTransform: "translateY(-3px)",
    cardHoverBorder: "rgba(125,211,252,0.45)",
    cardRadius: "22px",
    mktRadius: "14px",
    inputRadius: "14px",
    modalRadius: "24px",
    logoShadow: "0 0 24px rgba(90,200,250,0.5)",
    fabShadow: "0 12px 36px rgba(90,200,250,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
    ambientFilter: "saturate(1.18) brightness(1.03)",
    ambient: `radial-gradient(90% 70% at 8% -15%, rgba(90,200,250,0.22), transparent 55%),
    radial-gradient(60% 50% at 95% 5%, rgba(167,139,250,0.16), transparent 50%),
    radial-gradient(50% 40% at 50% 100%, rgba(56,189,248,0.10), transparent 45%),
    linear-gradient(180deg, var(--bg-2), var(--bg) 42%)`,
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    dur: "260ms",
    nav: "pill",
    mktBg: "rgba(255,255,255,0.06)",
    mktBorder: "1px solid rgba(255,255,255,0.14)",
    mktHoverBg: "rgba(255,255,255,0.13)",
    mktHoverBorder: "rgba(125,211,252,0.5)",
    mktHoverTransform: "translateY(-1px)",
    mktOnBg: "linear-gradient(180deg, rgba(125,211,252,0.95), rgba(56,189,248,0.85))",
    mktOnColor: "#04121c",
    mktOnShadow: "0 8px 24px rgba(90,200,250,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
    chipOnBg: "linear-gradient(180deg, rgba(125,211,252,0.9), rgba(56,189,248,0.8))",
    chipOnColor: "#04121c",
    chipOnShadow: "0 6px 20px rgba(90,200,250,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
    primaryBg: "linear-gradient(180deg, rgba(125,211,252,0.95), rgba(56,189,248,0.9))",
    primaryColor: "#04121c",
    primaryShadow: "0 12px 30px rgba(90,200,250,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
    fabBg: "linear-gradient(180deg, rgba(125,211,252,0.95), rgba(56,189,248,0.9))",
    fabColor: "#04121c",
    inputBg: "rgba(255,255,255,0.07)",
    inputBorder: "1px solid rgba(255,255,255,0.16)",
    inputFocusBorder: "rgba(125,211,252,0.6)",
    inputFocusShadow: "0 0 0 3px rgba(125,211,252,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
    modalBg: "rgba(16,22,36,0.72)",
    modalBorderLeft: "1px solid rgba(255,255,255,0.18)",
    modalShadow: "-30px 0 80px rgba(0,0,0,0.5), inset 1px 0 0 rgba(255,255,255,0.16)",
    scrollThumb: "rgba(125,211,252,0.3)",
    signature: (id) => `
body.theme-${id} .topbar,
body.theme-${id} .filter-rail-wrap,
body.theme-${id} .date-rail-wrap,
body.theme-${id} .card,
body.theme-${id} .ticket,
body.theme-${id} .search input,
body.theme-${id} .mkt-btn,
body.theme-${id} .desk-panel {
  backdrop-filter: var(--surface-blur-filter) !important;
  -webkit-backdrop-filter: var(--surface-blur-filter) !important;
}
body.theme-${id} .card::before,
body.theme-${id} .ticket::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: linear-gradient(160deg, rgba(255,255,255,0.14), transparent 42%);
  opacity: 0.9;
}
body.theme-${id} .card { position: relative; }
body.theme-${id} .mkt-btn { backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
`,
  },

  apple: {
    family: "Apple",
    cardBg: "rgba(22,24,32,0.82)",
    cardBg2: "rgba(26,28,38,0.9)",
    cardBorder: "rgba(255,255,255,0.1)",
    cardBorderStrong: "rgba(255,255,255,0.2)",
    surfaceBlur: "blur(22px) saturate(1.5)",
    chromeBg: "rgba(12,14,20,0.72)",
    chromeBgLight: "rgba(12,14,20,0.6)",
    headerBg: "rgba(12,14,20,0.7)",
    chromeBlur: "blur(26px) saturate(1.6)",
    fill: "rgba(255,255,255,0.06)",
    fill2: "rgba(255,255,255,0.1)",
    cardShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
    cardHoverShadow: "0 10px 34px rgba(0,0,0,0.48)",
    cardHoverTransform: "translateY(-1px)",
    cardRadius: "20px",
    mktRadius: "13px",
    inputRadius: "12px",
    modalRadius: "26px",
    ambientFilter: "saturate(1.1)",
    ambient: `radial-gradient(80% 60% at 12% -10%, rgba(10,132,255,0.16), transparent 55%),
    radial-gradient(60% 50% at 100% 0%, rgba(94,92,230,0.1), transparent 50%),
    linear-gradient(180deg, var(--bg-2), var(--bg) 44%)`,
    ease: "cubic-bezier(0.32, 0.72, 0, 1)",
    dur: "340ms",
    durFast: "160ms",
    activeScale: "0.96",
    nav: "segmented",
    mktRadius2: true,
    mktHoverTransform: "translateY(-1px)",
    mktOnBg: "linear-gradient(180deg, var(--blue-2), var(--blue))",
    mktOnShadow: "0 8px 22px var(--blue-soft), inset 0 1px 0 rgba(255,255,255,0.25)",
    primaryShadow: "0 10px 26px var(--blue-soft), inset 0 1px 0 rgba(255,255,255,0.25)",
    inputFocusShadow: "0 0 0 4px var(--blue-soft)",
    modalBg: "rgba(18,20,28,0.86)",
    modalBorderLeft: "1px solid rgba(255,255,255,0.14)",
    modalShadow: "-24px 0 70px rgba(0,0,0,0.5)",
    modalAnim: "sheetRise",
    signature: (id) => `
body.theme-${id} .card,
body.theme-${id} .ticket,
body.theme-${id} .topbar,
body.theme-${id} .desk-panel {
  backdrop-filter: var(--surface-blur-filter) !important;
  -webkit-backdrop-filter: var(--surface-blur-filter) !important;
}
body.theme-${id} .mkt-btn:active:not(:disabled),
body.theme-${id} .primary:active:not(:disabled),
body.theme-${id} .chip:active { transform: scale(var(--active-scale)); }
body.theme-${id} .desk { align-items: flex-end; }
body.theme-${id} .desk-panel { top: auto; bottom: 0; height: 94vh; border-radius: 26px 26px 0 0; border-left: 0; left: 50%; transform: translateX(-50%); width: min(760px, 100%); }
`,
  },

  // ── Material ────────────────────────────────────────────────
  material3: {
    family: "Material",
    cardBg: "#23262f",
    cardBg2: "#282b35",
    cardBorder: "transparent",
    cardBorderStrong: "transparent",
    surfaceBlur: "none",
    chromeBg: "rgba(18,19,24,0.96)",
    chromeBgLight: "rgba(18,19,24,0.9)",
    headerBg: "rgba(18,19,24,0.94)",
    chromeBlur: "blur(0px)",
    fill: "rgba(208,188,255,0.08)",
    fill2: "rgba(208,188,255,0.14)",
    cardShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.24)",
    cardHoverShadow: "0 2px 6px rgba(0,0,0,0.4), 0 10px 20px rgba(0,0,0,0.32)",
    cardHoverTransform: "translateY(-2px)",
    cardHoverBorder: "transparent",
    cardRadius: "16px",
    mktRadius: "999px",
    inputRadius: "8px",
    chipRadius: "8px",
    modalRadius: "28px",
    ambient: `radial-gradient(70% 50% at 20% -10%, rgba(208,188,255,0.10), transparent 55%),
    linear-gradient(180deg, var(--bg-2), var(--bg) 45%)`,
    ease: "cubic-bezier(0.2, 0, 0, 1)",
    dur: "300ms",
    durFast: "150ms",
    nav: "pill",
    mktStateLayer: true,
    mktBg: "rgba(208,188,255,0.06)",
    mktBorder: "1px solid rgba(208,188,255,0.22)",
    mktHoverBg: "rgba(208,188,255,0.10)",
    mktHoverBorder: "rgba(208,188,255,0.35)",
    mktOnBg: "var(--blue)",
    mktOnColor: "#381e72",
    mktOnShadow: "none",
    chipOnBg: "var(--blue)",
    chipOnColor: "#381e72",
    chipOnShadow: "none",
    primaryBg: "var(--blue)",
    primaryColor: "#381e72",
    primaryShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.24)",
    fabBg: "var(--blue)",
    fabColor: "#381e72",
    inputBg: "rgba(208,188,255,0.06)",
    inputBorder: "1px solid rgba(208,188,255,0.3)",
    inputFocusBorder: "var(--blue)",
    inputFocusShadow: "0 0 0 2px var(--blue)",
    modalBg: "#23262f",
    modalBorderLeft: "0",
    modalShadow: "-16px 0 48px rgba(0,0,0,0.5)",
    modalAnim: "sheetRise",
    scrollThumb: "rgba(208,188,255,0.3)",
    signature: (id) => `
body.theme-${id} .mkt-btn,
body.theme-${id} .chip,
body.theme-${id} .primary,
body.theme-${id} .icon-btn { position: relative; overflow: hidden; }
body.theme-${id} .mkt-btn::after,
body.theme-${id} .chip::after,
body.theme-${id} .primary::after,
body.theme-${id} .icon-btn::after {
  content: ""; position: absolute; inset: 0; background: currentColor; opacity: 0;
  transition: opacity var(--dur) var(--ease); pointer-events: none;
}
body.theme-${id} .mkt-btn:hover:not(:disabled)::after,
body.theme-${id} .chip:hover::after,
body.theme-${id} .primary:hover:not(:disabled)::after,
body.theme-${id} .icon-btn:hover::after { opacity: 0.08; }
body.theme-${id} .mkt-btn:active:not(:disabled)::after,
body.theme-${id} .chip:active::after,
body.theme-${id} .primary:active:not(:disabled)::after { opacity: 0.16; }
body.theme-${id} .sport-nav button.is-active { background: rgba(208,188,255,0.16); color: var(--ink); }
body.theme-${id} .section-head h2 { font-weight: 500; }
`,
  },

  // ── Soft UI ─────────────────────────────────────────────────
  neomorphism: {
    family: "Soft UI",
    cardBg: "var(--panel)",
    cardBg2: "var(--panel-2)",
    cardBorder: "rgba(255,255,255,0.04)",
    cardBorderStrong: "rgba(255,255,255,0.06)",
    surfaceBlur: "none",
    chromeBg: "var(--bg)",
    chromeBgLight: "var(--bg)",
    headerBg: "var(--bg)",
    chromeBlur: "blur(0px)",
    fill: "var(--panel)",
    fill2: "var(--panel-2)",
    cardShadow: "9px 9px 20px rgba(0,0,0,0.4), -7px -7px 16px rgba(255,255,255,0.05)",
    cardHoverShadow: "12px 12px 26px rgba(0,0,0,0.45), -9px -9px 20px rgba(255,255,255,0.06)",
    cardHoverTransform: "none",
    cardHoverBorder: "rgba(255,255,255,0.05)",
    cardRadius: "24px",
    mktRadius: "16px",
    inputRadius: "14px",
    chipRadius: "999px",
    modalRadius: "28px",
    logoShadow: "4px 4px 10px rgba(0,0,0,0.4), -3px -3px 8px rgba(255,255,255,0.05)",
    fabShadow: "6px 6px 16px rgba(0,0,0,0.4), -4px -4px 12px rgba(255,255,255,0.06)",
    ambient: `linear-gradient(180deg, var(--bg-2), var(--bg) 50%)`,
    ease: "cubic-bezier(0.34, 1.4, 0.64, 1)",
    dur: "220ms",
    activeScale: "0.98",
    nav: "block",
    mktBg: "var(--panel)",
    mktBorder: "1px solid rgba(255,255,255,0.04)",
    mktHoverBg: "var(--panel)",
    mktHoverBorder: "rgba(255,255,255,0.06)",
    mktOnBg: "var(--panel)",
    mktOnColor: "var(--blue-2)",
    mktOnShadow: "inset 6px 6px 14px rgba(0,0,0,0.5), inset -4px -4px 10px rgba(255,255,255,0.05)",
    chipOnBg: "var(--panel)",
    chipOnColor: "var(--blue-2)",
    chipOnShadow: "inset 5px 5px 12px rgba(0,0,0,0.5), inset -3px -3px 8px rgba(255,255,255,0.05)",
    primaryBg: "var(--panel)",
    primaryColor: "var(--blue-2)",
    primaryShadow: "6px 6px 14px rgba(0,0,0,0.4), -4px -4px 10px rgba(255,255,255,0.05)",
    fabBg: "var(--panel)",
    fabColor: "var(--blue-2)",
    inputBg: "var(--panel)",
    inputBorder: "1px solid rgba(255,255,255,0.03)",
    inputFocusBorder: "rgba(255,255,255,0.04)",
    inputFocusShadow: "inset 5px 5px 12px rgba(0,0,0,0.5), inset -3px -3px 8px rgba(255,255,255,0.05)",
    inputInset: true,
    modalBg: "var(--bg)",
    modalBorderLeft: "0",
    modalShadow: "-16px 0 40px rgba(0,0,0,0.5)",
    scrollThumb: "rgba(255,255,255,0.08)",
    signature: (id) => `
body.theme-${id} .search input {
  box-shadow: inset 5px 5px 12px rgba(0,0,0,0.5), inset -3px -3px 8px rgba(255,255,255,0.05);
}
body.theme-${id} .mkt-btn:hover:not(:disabled) {
  box-shadow: 5px 5px 12px rgba(0,0,0,0.4), -3px -3px 8px rgba(255,255,255,0.05);
}
body.theme-${id} .mkt-btn:active:not(:disabled),
body.theme-${id} .primary:active:not(:disabled),
body.theme-${id} .chip:active {
  box-shadow: inset 5px 5px 12px rgba(0,0,0,0.5), inset -3px -3px 8px rgba(255,255,255,0.05);
}
body.theme-${id} .primary { border: 0; }
`,
  },

  // ── Enterprise ──────────────────────────────────────────────
  fluent: {
    family: "Enterprise",
    cardBg: "rgba(45,44,44,0.95)",
    cardBg2: "rgba(50,49,49,0.98)",
    cardBorder: "rgba(255,255,255,0.12)",
    cardBorderStrong: "rgba(255,255,255,0.2)",
    surfaceBlur: "blur(14px) saturate(1.2)",
    chromeBg: "rgba(27,26,25,0.92)",
    chromeBgLight: "rgba(27,26,25,0.85)",
    headerBg: "rgba(27,26,25,0.9)",
    chromeBlur: "blur(20px) saturate(1.2)",
    fill: "rgba(255,255,255,0.05)",
    fill2: "rgba(255,255,255,0.08)",
    cardShadow: "0 2px 8px rgba(0,0,0,0.32)",
    cardHoverShadow: "0 4px 16px rgba(40,153,245,0.16)",
    cardHoverTransform: "translateY(-1px)",
    cardHoverBorder: "rgba(40,153,245,0.5)",
    cardRadius: "8px",
    mktRadius: "6px",
    inputRadius: "6px",
    chipRadius: "6px",
    modalRadius: "8px",
    ambient: `linear-gradient(180deg, var(--bg-2), var(--bg) 55%)`,
    ease: "cubic-bezier(0.1, 0.9, 0.2, 1)",
    dur: "180ms",
    nav: "underline",
    mktHoverBorder: "rgba(40,153,245,0.5)",
    mktOnBg: "var(--blue)",
    mktOnShadow: "0 2px 8px rgba(40,153,245,0.3)",
    primaryShadow: "0 2px 8px rgba(40,153,245,0.3)",
    inputFocusShadow: "0 0 0 2px var(--blue-soft), inset 0 -2px 0 var(--blue)",
    signature: (id) => `
body.theme-${id} .topbar { border-bottom: 2px solid rgba(255,255,255,0.08); }
body.theme-${id} .search input:focus { border-bottom: 2px solid var(--blue); }
`,
  },

  bootstrap: {
    family: "Utility",
    cardBg: "#343a40",
    cardBg2: "#3a4045",
    cardBorder: "rgba(255,255,255,0.15)",
    cardBorderStrong: "rgba(255,255,255,0.25)",
    surfaceBlur: "none",
    chromeBg: "rgba(33,37,41,0.98)",
    chromeBgLight: "rgba(33,37,41,0.94)",
    headerBg: "rgba(33,37,41,0.98)",
    chromeBlur: "blur(0px)",
    cardShadow: "0 0.5rem 1rem rgba(0,0,0,0.35)",
    cardHoverShadow: "0 0.5rem 1rem rgba(0,0,0,0.5)",
    cardHoverTransform: "none",
    cardHoverBorder: "rgba(255,255,255,0.25)",
    cardRadius: "12px",
    mktRadius: "8px",
    btnRadius: "8px",
    inputRadius: "8px",
    chipRadius: "8px",
    modalRadius: "12px",
    ambient: `linear-gradient(180deg, var(--bg-2), var(--bg) 60%)`,
    ease: "ease-in-out",
    dur: "150ms",
    nav: "block",
    mktOnBg: "var(--blue)",
    mktOnColor: "#fff",
    mktOnShadow: "none",
    chipOnShadow: "none",
    primaryBg: "var(--blue)",
    primaryShadow: "none",
    fabBg: "var(--blue)",
    inputFocusShadow: "0 0 0 0.25rem var(--blue-soft)",
    signature: (id) => `
body.theme-${id} .primary { border: 1px solid var(--blue); }
body.theme-${id} .mkt-btn.is-on { border-color: var(--blue); }
`,
  },

  tailwind: {
    family: "SaaS",
    cardBg: "rgba(30,41,59,0.92)",
    cardBg2: "rgba(30,41,59,0.98)",
    cardBorder: "#334155",
    cardBorderStrong: "#475569",
    surfaceBlur: "none",
    chromeBg: "rgba(15,23,42,0.92)",
    chromeBgLight: "rgba(15,23,42,0.85)",
    headerBg: "rgba(15,23,42,0.9)",
    chromeBlur: "blur(12px)",
    cardShadow: "0 4px 16px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.02)",
    cardHoverShadow: "0 10px 28px rgba(0,0,0,0.4)",
    cardHoverTransform: "translateY(-1px)",
    cardHoverBorder: "#475569",
    cardRadius: "16px",
    mktRadius: "10px",
    btnRadius: "10px",
    inputRadius: "10px",
    chipRadius: "8px",
    modalRadius: "16px",
    ambient: `radial-gradient(60% 50% at 100% 0%, rgba(56,189,248,0.10), transparent 50%),
    linear-gradient(180deg, var(--bg-2), var(--bg) 55%)`,
    ease: "cubic-bezier(0.16, 1, 0.3, 1)",
    dur: "200ms",
    nav: "segmented",
    mktOnBg: "var(--blue)",
    mktOnShadow: "0 4px 14px var(--blue-soft)",
    inputFocusShadow: "0 0 0 3px var(--blue-soft)",
    signature: (id) => `
body.theme-${id} .sport-nav button.is-active { border: 1px solid var(--blue); background: var(--blue-soft); color: var(--ink); }
body.theme-${id} .card { --tw-ring: inset 0 1px 0 rgba(255,255,255,0.04); box-shadow: var(--surface-shadow), var(--tw-ring); }
`,
  },

  // ── Expressive / gaming ─────────────────────────────────────
  cyber: {
    family: "Gaming",
    cardBg: "rgba(12,12,22,0.9)",
    cardBg2: "rgba(16,16,28,0.94)",
    cardBorder: "rgba(255,0,170,0.3)",
    cardBorderStrong: "rgba(255,0,170,0.5)",
    surfaceBlur: "blur(8px)",
    chromeBg: "rgba(5,5,12,0.88)",
    chromeBgLight: "rgba(5,5,12,0.72)",
    headerBg: "rgba(5,5,12,0.85)",
    chromeBlur: "blur(18px)",
    fill: "rgba(0,255,255,0.06)",
    fill2: "rgba(255,0,170,0.1)",
    cardShadow: "0 0 24px rgba(255,0,170,0.14), inset 0 0 0 1px rgba(0,255,255,0.1)",
    cardHoverShadow: "0 0 34px rgba(255,0,170,0.35), inset 0 0 0 1px rgba(0,255,255,0.25)",
    cardHoverTransform: "translateY(-2px)",
    cardHoverBorder: "rgba(0,255,255,0.5)",
    cardRadius: "12px",
    mktRadius: "8px",
    inputRadius: "8px",
    chipRadius: "6px",
    modalRadius: "12px",
    logoShadow: "0 0 24px rgba(255,0,170,0.7)",
    fabShadow: "0 0 32px rgba(255,0,170,0.55)",
    ambientFilter: "saturate(1.25)",
    ambient: `radial-gradient(80% 50% at 0% 0%, rgba(255,0,170,0.16), transparent 50%),
    radial-gradient(60% 40% at 100% 0%, rgba(0,255,255,0.12), transparent 45%),
    linear-gradient(180deg, #050508, var(--bg) 50%)`,
    ease: "cubic-bezier(0.2, 0.9, 0.1, 1)",
    dur: "120ms",
    durFast: "80ms",
    activeScale: "0.95",
    nav: "segmented",
    headingTransform: "uppercase",
    headingSpacing: "0.08em",
    mktHoverBorder: "rgba(0,255,255,0.6)",
    mktHoverBg: "rgba(0,255,255,0.08)",
    mktOnBg: "linear-gradient(180deg, rgba(255,0,170,0.9), rgba(190,0,130,0.9))",
    mktOnColor: "#fff",
    mktOnShadow: "0 0 20px rgba(255,0,170,0.55), inset 0 0 0 1px rgba(0,255,255,0.3)",
    chipOnBg: "linear-gradient(180deg, rgba(255,0,170,0.9), rgba(190,0,130,0.9))",
    chipOnShadow: "0 0 18px rgba(255,0,170,0.5)",
    primaryBg: "linear-gradient(90deg, #ff00aa, #00e5ff)",
    primaryColor: "#04040a",
    primaryShadow: "0 0 24px rgba(255,0,170,0.45)",
    fabBg: "linear-gradient(135deg, #ff00aa, #00e5ff)",
    fabColor: "#04040a",
    inputFocusBorder: "rgba(0,255,255,0.6)",
    inputFocusShadow: "0 0 0 2px rgba(0,255,255,0.35), 0 0 18px rgba(255,0,170,0.3)",
    modalBg: "rgba(8,8,16,0.96)",
    modalBorderLeft: "1px solid rgba(255,0,170,0.4)",
    modalShadow: "-24px 0 60px rgba(255,0,170,0.2)",
    scrollThumb: "rgba(255,0,170,0.5)",
    signature: (id) => `
body.theme-${id} .topbar { border-bottom: 1px solid rgba(255,0,170,0.35); box-shadow: 0 0 24px rgba(255,0,170,0.08); }
body.theme-${id} .pill-live { text-shadow: 0 0 8px rgba(255,51,102,0.6); }
body.theme-${id} .word { letter-spacing: 0.16em; }
body.theme-${id} .chip.is-active,
body.theme-${id} .sport-nav button.is-active { text-shadow: 0 0 8px rgba(255,0,170,0.5); }
body.theme-${id} .card:hover .team b { text-shadow: 0 0 10px rgba(0,229,255,0.6); }
`,
  },

  luxury: {
    family: "Luxury",
    cardBg: "rgba(20,20,20,0.96)",
    cardBg2: "rgba(24,24,24,0.98)",
    cardBorder: "rgba(212,175,55,0.24)",
    cardBorderStrong: "rgba(212,175,55,0.42)",
    surfaceBlur: "none",
    chromeBg: "rgba(10,10,10,0.94)",
    chromeBgLight: "rgba(10,10,10,0.88)",
    headerBg: "rgba(10,10,10,0.92)",
    chromeBlur: "blur(12px)",
    fill: "rgba(212,175,55,0.06)",
    fill2: "rgba(212,175,55,0.1)",
    cardShadow: "0 16px 44px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.14)",
    cardHoverShadow: "0 22px 56px rgba(0,0,0,0.65), inset 0 1px 0 rgba(212,175,55,0.22)",
    cardHoverTransform: "translateY(-2px)",
    cardHoverBorder: "rgba(212,175,55,0.5)",
    cardRadius: "10px",
    mktRadius: "8px",
    btnRadius: "8px",
    inputRadius: "8px",
    chipRadius: "999px",
    modalRadius: "12px",
    logoShadow: "0 0 22px rgba(212,175,55,0.4)",
    fabShadow: "0 12px 32px rgba(212,175,55,0.35)",
    ambient: `radial-gradient(70% 50% at 50% -10%, rgba(212,175,55,0.14), transparent 55%),
    linear-gradient(180deg, #0f0f0f, var(--bg) 45%)`,
    ease: "cubic-bezier(0.4, 0, 0.1, 1)",
    dur: "420ms",
    durFast: "220ms",
    activeScale: "0.99",
    nav: "underline",
    headingSpacing: "0.02em",
    mktHoverBg: "rgba(212,175,55,0.1)",
    mktHoverBorder: "rgba(212,175,55,0.5)",
    mktOnBg: "linear-gradient(180deg, #f5d67a, #c8870f)",
    mktOnColor: "#1a1204",
    mktOnShadow: "0 8px 22px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
    chipOnBg: "linear-gradient(180deg, #f5d67a, #c8870f)",
    chipOnColor: "#1a1204",
    chipOnShadow: "0 6px 18px rgba(212,175,55,0.35)",
    primaryBg: "linear-gradient(180deg, #f5d67a, #c8870f)",
    primaryColor: "#1a1204",
    primaryShadow: "0 10px 26px rgba(212,175,55,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
    fabBg: "linear-gradient(180deg, #f5d67a, #c8870f)",
    fabColor: "#1a1204",
    inputFocusBorder: "rgba(212,175,55,0.6)",
    inputFocusShadow: "0 0 0 3px rgba(212,175,55,0.2)",
    modalBg: "#111111",
    modalBorderLeft: "1px solid rgba(212,175,55,0.3)",
    modalShadow: "-24px 0 60px rgba(0,0,0,0.6)",
    scrollThumb: "rgba(212,175,55,0.4)",
    signature: (id) => `
body.theme-${id} .word { color: #f5d67a; letter-spacing: 0.24em; font-weight: 700; }
body.theme-${id} .section-head h2,
body.theme-${id} .group-head h3 { letter-spacing: 0.06em; }
body.theme-${id} .card::after {
  content: ""; position: absolute; inset: 0 0 auto 0; height: 1px; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent);
}
body.theme-${id} .card { position: relative; }
`,
  },

  spotify: {
    family: "Media",
    cardBg: "#1a1a1a",
    cardBg2: "#1e1e1e",
    cardBorder: "transparent",
    cardBorderStrong: "rgba(255,255,255,0.12)",
    surfaceBlur: "none",
    chromeBg: "rgba(0,0,0,0.85)",
    chromeBgLight: "rgba(18,18,18,0.9)",
    headerBg: "rgba(0,0,0,0.7)",
    chromeBlur: "blur(16px)",
    fill: "rgba(255,255,255,0.07)",
    fill2: "rgba(255,255,255,0.12)",
    cardShadow: "0 8px 24px rgba(0,0,0,0.5)",
    cardHoverShadow: "0 12px 30px rgba(0,0,0,0.6)",
    cardHoverTransform: "translateY(-4px)",
    cardHoverBorder: "transparent",
    cardRadius: "10px",
    mktRadius: "999px",
    btnRadius: "999px",
    inputRadius: "6px",
    chipRadius: "999px",
    modalRadius: "12px",
    logoShadow: "0 0 16px rgba(29,185,84,0.5)",
    ambient: `radial-gradient(80% 55% at 15% -10%, rgba(29,185,84,0.14), transparent 55%),
    linear-gradient(180deg, #1c1c1c, var(--bg) 40%)`,
    ease: "cubic-bezier(0.3, 0, 0, 1)",
    dur: "200ms",
    activeScale: "0.96",
    nav: "pill",
    mktHoverBg: "rgba(255,255,255,0.1)",
    mktOnBg: "var(--blue)",
    mktOnColor: "#000",
    mktOnShadow: "none",
    chipOnBg: "#fff",
    chipOnColor: "#000",
    chipOnShadow: "none",
    primaryBg: "var(--blue)",
    primaryColor: "#000",
    primaryShadow: "none",
    fabBg: "var(--blue)",
    fabColor: "#000",
    signature: (id) => `
body.theme-${id} .card:hover { background: #282828 !important; }
body.theme-${id} .sport-nav button.is-active { background: var(--blue); color: #000; font-weight: 700; }
body.theme-${id} .primary:hover:not(:disabled),
body.theme-${id} .fab:hover { transform: scale(1.04); }
body.theme-${id} .more-btn { color: var(--blue); font-weight: 700; }
body.theme-${id} .section-head h2 { font-weight: 800; letter-spacing: -0.02em; }
`,
  },

  // ── Raw ─────────────────────────────────────────────────────
  brutalist: {
    family: "Brutalist",
    cardBg: "#141414",
    cardBg2: "#161616",
    cardBorder: "#ffffff",
    cardBorderStrong: "#ffffff",
    surfaceBlur: "none",
    chromeBg: "#0d0d0d",
    chromeBgLight: "#0d0d0d",
    headerBg: "#0d0d0d",
    chromeBlur: "blur(0px)",
    fill: "#1a1a1a",
    fill2: "#222222",
    cardShadow: "6px 6px 0 #ffffff",
    cardHoverShadow: "10px 10px 0 var(--blue)",
    cardHoverTransform: "translate(-2px, -2px)",
    cardHoverBorder: "#ffffff",
    cardRadius: "0px",
    mktRadius: "0px",
    btnRadius: "0px",
    inputRadius: "0px",
    chipRadius: "0px",
    modalRadius: "0px",
    logoShadow: "none",
    fabShadow: "6px 6px 0 var(--blue)",
    ambient: `linear-gradient(180deg, var(--bg), var(--bg))`,
    ease: "steps(1, end)",
    dur: "1ms",
    durFast: "1ms",
    activeScale: "1",
    nav: "block",
    headingTransform: "uppercase",
    headingSpacing: "0.06em",
    mktBg: "#1a1a1a",
    mktBorder: "2px solid #ffffff",
    mktHoverBg: "#ffffff",
    mktHoverBorder: "#ffffff",
    mktOnBg: "var(--blue)",
    mktOnColor: "#000",
    mktOnShadow: "none",
    chipOnBg: "var(--blue)",
    chipOnColor: "#000",
    chipOnShadow: "none",
    primaryBg: "var(--blue)",
    primaryColor: "#000",
    primaryShadow: "4px 4px 0 #ffffff",
    fabBg: "var(--blue)",
    fabColor: "#000",
    inputBg: "#0d0d0d",
    inputBorder: "2px solid #ffffff",
    inputFocusBorder: "var(--blue)",
    inputFocusShadow: "4px 4px 0 var(--blue)",
    modalBg: "#0d0d0d",
    modalBorderLeft: "3px solid #ffffff",
    modalShadow: "none",
    modalAnim: "none",
    scrollThumb: "#ffffff",
    signature: (id) => `
body.theme-${id} .topbar,
body.theme-${id} .card,
body.theme-${id} .ticket,
body.theme-${id} .chip,
body.theme-${id} .mkt-btn,
body.theme-${id} .search input,
body.theme-${id} .sport-nav button,
body.theme-${id} .date-rail button,
body.theme-${id} .icon-btn,
body.theme-${id} .primary,
body.theme-${id} .fab { border-radius: 0 !important; border-width: 2px !important; }
body.theme-${id} .mkt-btn:hover:not(:disabled) { color: #000; }
body.theme-${id} .section-head h2,
body.theme-${id} .group-head h3,
body.theme-${id} .word { text-transform: uppercase; font-weight: 800; }
body.theme-${id} .card:hover .team b { color: var(--blue); }
`,
  },

  polymarket: {
    family: "Fintech",
    cardBg: "var(--panel)",
    cardBg2: "var(--panel-2)",
    surfaceBlur: "blur(18px)",
    chromeBg: "rgba(8,9,13,0.78)",
    chromeBgLight: "rgba(8,9,13,0.55)",
    headerBg: "rgba(8,9,13,0.72)",
    chromeBlur: "blur(22px) saturate(1.4)",
    cardShadow: "0 12px 40px rgba(0,0,0,0.35)",
    cardHoverShadow: "0 16px 44px rgba(0,0,0,0.45)",
    cardHoverTransform: "translateY(-1px)",
    cardRadius: "var(--r-lg)",
    mktRadius: "12px",
    inputRadius: "10px",
    modalRadius: "0px",
    ambient: `radial-gradient(90% 60% at 10% -10%, var(--blue-soft), transparent 55%),
    radial-gradient(70% 50% at 100% 0%, rgba(94,92,230,0.08), transparent 50%),
    linear-gradient(180deg, var(--bg-2), var(--bg) 40%)`,
    dur: "160ms",
    nav: "block",
    mktHoverTransform: "translateY(-1px)",
    signature: (id) => `
body.theme-${id} .card,
body.theme-${id} .ticket {
  backdrop-filter: var(--surface-blur-filter);
  -webkit-backdrop-filter: var(--surface-blur-filter);
}
`,
  },
};

const NAV_STYLES = {
  block: (id) => `
body.theme-${id} .sport-nav button.is-active { background: var(--fill-2); border-color: var(--surface-border-strong); color: var(--ink); }`,
  pill: (id) => `
body.theme-${id} .sport-nav button { border-radius: 999px; }
body.theme-${id} .sport-nav button.is-active { background: var(--fill-2); color: var(--ink); box-shadow: inset 0 0 0 1px var(--surface-border-strong); }`,
  underline: (id) => `
body.theme-${id} .sport-nav button { border-radius: 0; border-bottom: 2px solid transparent; }
body.theme-${id} .sport-nav button.is-active { background: transparent; border-bottom-color: var(--blue); color: var(--ink); }`,
  segmented: (id) => `
body.theme-${id} .sport-nav { gap: 0; padding: 0.55rem var(--gutter-x) 0.4rem; }
body.theme-${id} .sport-nav button { border-radius: 0; border: 1px solid var(--surface-border); margin-left: -1px; }
body.theme-${id} .sport-nav button:first-child { border-radius: 10px 0 0 10px; margin-left: 0; }
body.theme-${id} .sport-nav button:last-child { border-radius: 0 10px 10px 0; }
body.theme-${id} .sport-nav button.is-active { background: var(--fill-2); color: var(--ink); z-index: 1; }`,
};

const KEYFRAMES = `
@keyframes deskSlide { from { transform: translateX(24px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes sheetRise { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pickIn { from { transform: translateY(6px); opacity: 0; } to { transform: none; opacity: 1; } }
`;

/** Merged recipe (defaults + theme overrides) for a preset. */
export function getThemeRecipe(preset) {
  const id = THEME_RECIPES[preset] ? preset : "polymarket";
  return { id, ...BASE_RECIPE, ...THEME_RECIPES[id] };
}

/** Build the complete design-system stylesheet for one theme. */
export function renderThemeCss(preset, config) {
  const id = THEME_RECIPES[preset] ? preset : "polymarket";
  const r = { ...BASE_RECIPE, ...THEME_RECIPES[id] };
  const navCss = (NAV_STYLES[r.nav] || NAV_STYLES.block)(id);
  const b = `body.theme-${id}`;
  // Avoid self-referential custom property when cardRadius === var(--r-lg)
  const cardRadiusVar = String(r.cardRadius).includes("--r-lg")
    ? ""
    : `\n  --r-lg: ${r.cardRadius};`;

  const tokens = `
${b} {
  --surface-bg: ${r.cardBg};
  --surface-bg-2: ${r.cardBg2};
  --surface-border: ${r.cardBorder};
  --surface-border-strong: ${r.cardBorderStrong};
  --surface-shadow: ${r.cardShadow};
  --surface-blur-filter: ${r.surfaceBlur};
  --chrome-bg: ${r.chromeBg};
  --chrome-bg-light: ${r.chromeBgLight};
  --header-bg: ${r.headerBg};
  --chrome-blur: ${r.chromeBlur};
  --fill: ${r.fill};
  --fill-2: ${r.fill2};
  --mkt-radius: ${r.mktRadius};
  --btn-radius: ${r.btnRadius};
  --card-hover-transform: ${r.cardHoverTransform};
  --ambient-filter: ${r.ambientFilter};
  --logo-shadow: ${r.logoShadow};
  --fab-shadow: ${r.fabShadow};
  --ease: ${r.ease};
  --dur: ${r.dur};
  --dur-fast: ${r.durFast};
  --active-scale: ${r.activeScale};
  --input-radius: ${r.inputRadius};${cardRadiusVar}
}`;

  const ambient = r.ambient
    ? `${b} .ambient { background: ${r.ambient} !important; filter: var(--ambient-filter) !important; }`
    : "";

  const components = `
/* Cards / surfaces */
${b} .card {
  background: var(--surface-bg);
  border: 1px solid var(--surface-border);
  border-radius: ${r.cardRadius};
  box-shadow: var(--surface-shadow);
  transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
${b} .card:hover {
  transform: var(--card-hover-transform);
  box-shadow: ${r.cardHoverShadow};
  border-color: ${r.cardHoverBorder};
}
${b} .ticket {
  background: var(--surface-bg-2);
  border: 1px solid var(--surface-border-strong);
  border-radius: ${r.cardRadius};
  box-shadow: var(--surface-shadow);
}

/* Navigation */
${navCss}

/* Market outcome buttons */
${b} .mkt-btn {
  background: ${r.mktBg};
  border: ${r.mktBorder};
  border-radius: ${r.mktRadius};
  transition: transform var(--dur-fast) var(--ease), background var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
${b} .mkt-btn:hover:not(:disabled) {
  background: ${r.mktHoverBg};
  border-color: ${r.mktHoverBorder};
  transform: ${r.mktHoverTransform};
}
${b} .mkt-btn.is-on {
  background: ${r.mktOnBg};
  color: ${r.mktOnColor};
  border-color: transparent;
  box-shadow: ${r.mktOnShadow};
}
${b} .mkt-btn.is-on span { color: ${r.mktOnColor}; opacity: 0.8; }

/* Chips / active pills */
${b} .chip { border-radius: ${r.chipRadius}; transition: background var(--dur) var(--ease), color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
${b} .chip.is-active {
  background: ${r.chipOnBg};
  color: ${r.chipOnColor};
  border-color: transparent;
  box-shadow: ${r.chipOnShadow};
}
${b} .date-rail button { border-radius: ${r.chipRadius}; }
${b} .date-rail button.is-active { background: ${r.chipOnBg}; color: ${r.chipOnColor}; border-color: transparent; }

/* Primary / FAB */
${b} .primary {
  background: ${r.primaryBg};
  color: ${r.primaryColor};
  box-shadow: ${r.primaryShadow};
  border-radius: ${r.btnRadius};
  transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), filter var(--dur) var(--ease);
}
${b} .primary:hover:not(:disabled) { filter: brightness(1.05); }
${b} .fab {
  background: ${r.fabBg};
  color: ${r.fabColor};
  box-shadow: var(--fab-shadow);
  border-radius: ${r.btnRadius};
}

/* Inputs */
${b} .search input,
${b} .stake input {
  background: ${r.inputBg};
  border: ${r.inputBorder};
  border-radius: ${r.inputRadius};
  transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}
${b} .search input:focus,
${b} .stake input:focus {
  border-color: ${r.inputFocusBorder};
  box-shadow: ${r.inputFocusShadow};
  outline: none;
}
${b} .icon-btn { border-radius: ${r.btnRadius}; }

/* Focus visibility (accessibility) */
${b} a:focus-visible,
${b} button:focus-visible,
${b} input:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}

/* Headings */
${b} .section-head h2 { letter-spacing: ${r.headingSpacing}; ${r.headingTransform !== "none" ? `text-transform: ${r.headingTransform};` : ""} }
${r.headingTransform !== "none" ? `${b} .group-head h3 { text-transform: ${r.headingTransform}; }` : ""}

/* Modal (event desk) */
${b} .desk-panel {
  background: ${r.modalBg};
  border-left: ${r.modalBorderLeft};
  box-shadow: ${r.modalShadow};
  border-radius: ${r.modalRadius} 0 0 ${r.modalRadius};
  animation: ${r.modalAnim === "none" ? "none" : `${r.modalAnim} var(--dur) var(--ease)`};
}

/* Ticket picks entrance */
${b} .pick { animation: pickIn var(--dur) var(--ease); }

/* Loading skeletons */
${b} .sk { border-radius: ${r.cardRadius}; }

/* Scrollbar */
${b} .featured-track::-webkit-scrollbar-thumb,
${b} .ticket-body::-webkit-scrollbar-thumb { background: ${r.scrollThumb}; border-radius: 999px; }
${b} .featured-track, ${b} .ticket-body { scrollbar-color: ${r.scrollThumb} transparent; }
`;

  const signature = typeof r.signature === "function" ? r.signature(id) : "";

  return `${KEYFRAMES}\n${tokens}\n${ambient}\n${components}\n${signature}`;
}

/** Ids of all available themes. */
export function themeIds() {
  return Object.keys(THEME_RECIPES);
}
