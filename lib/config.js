import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { themeEffectCss } from "./themes.js";
import { normalizeSiteConfig } from "./i18n.js";

export const FONT_STACKS = {
  system: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif',
  inter: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  roboto: '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
  georgia: 'Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
};

export const LAYOUT_PRESETS = {
  standard: {
    label: "Standard",
    desc: "Feed + ticket sidebar, featured strip",
    layout: { preset: "standard", maxWidth: 1400, ticketWidth: 320, cardColumns: 2, showFeatured: true, showTicket: true },
  },
  compact: {
    label: "Compact",
    desc: "Dense cards, narrower layout",
    layout: { preset: "compact", maxWidth: 1200, ticketWidth: 280, cardColumns: 2, showFeatured: true, showTicket: true },
  },
  wide: {
    label: "Wide desk",
    desc: "Wide feed, larger ticket panel",
    layout: { preset: "wide", maxWidth: 1680, ticketWidth: 380, cardColumns: 3, showFeatured: true, showTicket: true },
  },
  feed: {
    label: "Feed focus",
    desc: "No ticket sidebar on desktop",
    layout: { preset: "feed", maxWidth: 1400, ticketWidth: 320, cardColumns: 2, showFeatured: true, showTicket: false },
  },
  minimal: {
    label: "Minimal",
    desc: "Single column, no featured strip",
    layout: { preset: "minimal", maxWidth: 960, ticketWidth: 320, cardColumns: 1, showFeatured: false, showTicket: true },
  },
};

export const DEFAULT_CONFIG = JSON.parse(await readFile(new URL("../site-config.json", import.meta.url)));

export async function loadConfig(root) {
  const path = join(root, "site-config.json");
  if (!existsSync(path)) return structuredClone(DEFAULT_CONFIG);
  try {
    const raw = await readFile(path, "utf8");
    return mergeConfig(DEFAULT_CONFIG, JSON.parse(raw));
  } catch {
    return structuredClone(DEFAULT_CONFIG);
  }
}

export function mergeConfig(base, patch) {
  const out = structuredClone(base);
  for (const key of Object.keys(patch)) {
    if (key === "translations" && patch.translations && typeof patch.translations === "object") {
      out.translations = out.translations || {};
      for (const [loc, vals] of Object.entries(patch.translations)) {
        if (vals && typeof vals === "object") {
          out.translations[loc] = { ...(out.translations[loc] || {}), ...vals };
        }
      }
      continue;
    }
    if (patch[key] && typeof patch[key] === "object" && !Array.isArray(patch[key])) {
      out[key] = { ...out[key], ...patch[key] };
    } else {
      out[key] = patch[key];
    }
  }
  return normalizeSiteConfig(out);
}

export async function saveConfig(root, config) {
  const clean = mergeConfig(DEFAULT_CONFIG, config);
  await writeFile(join(root, "site-config.json"), JSON.stringify(clean, null, 2));
  return clean;
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full.slice(0, 6), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgba(hex, alpha) {
  if (hex.startsWith("rgba") || hex.startsWith("rgb")) return hex;
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function themeCss(config) {
  const c = mergeConfig(DEFAULT_CONFIG, config);
  const preset = c.theme?.preset || "polymarket";
  const font = FONT_STACKS[c.typography.fontFamily] || FONT_STACKS.system;
  const panelAlpha = Number(c.colors.panelOpacity ?? 82) / 100;
  const panel = c.colors.panel.startsWith("#")
    ? rgba(c.colors.panel, panelAlpha)
    : c.colors.panel;

  return `/* Generated site theme — preset: ${preset} */
:root {
  --bg: ${c.colors.background};
  --bg-2: ${c.colors.backgroundSecondary};
  --panel: ${panel};
  --panel-2: ${rgba(c.colors.panel, Math.min(panelAlpha + 0.08, 1))};
  --line: ${c.colors.border.length === 9 ? `#${c.colors.border.slice(1, 7)}${c.colors.border.slice(7)}` : c.colors.border};
  --line-2: ${c.colors.borderStrong.length === 9 ? `#${c.colors.borderStrong.slice(1, 7)}${c.colors.borderStrong.slice(7)}` : c.colors.borderStrong};
  --fill: rgba(255,255,255,0.04);
  --fill-2: rgba(255,255,255,0.07);
  --ink: ${c.colors.text};
  --muted: ${c.colors.textMuted};
  --faint: ${c.colors.textFaint};
  --blue: ${c.colors.accent};
  --blue-2: ${c.colors.accentBright};
  --blue-soft: ${c.colors.glowBlue.length === 9 ? `#${c.colors.glowBlue.slice(1, 7)}${c.colors.glowBlue.slice(7)}` : c.colors.glowBlue};
  --green: ${c.colors.success};
  --red: ${c.colors.live};
  --live: ${c.colors.live};
  --r: ${c.structure.radius}px;
  --r-lg: ${c.structure.radiusLg}px;
  --r-pill: 999px;
  --font: ${font};
  --font-base: ${c.typography.baseSize}px;
  --font-heading: ${c.typography.headingSize}px;
  --font-label: ${c.typography.labelSize}px;
  --font-weight: ${c.typography.weight};
  --shadow: 0 12px 40px rgba(0,0,0,0.35);
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --layout-max: ${c.layout.maxWidth}px;
  --ticket-width: ${c.layout.ticketWidth}px;
  --card-gap: ${c.structure.cardGap}px;
  --section-gap: ${c.structure.sectionGap}px;
  --header-blur: ${c.structure.headerBlur}px;
}

body {
  font-size: var(--font-base);
  font-weight: var(--font-weight);
}

.ambient {
  background:
    radial-gradient(90% 60% at 10% -10%, ${c.colors.glowBlue.length === 9 ? `#${c.colors.glowBlue.slice(1, 7)}${c.colors.glowBlue.slice(7)}` : c.colors.glowBlue}, transparent 55%),
    radial-gradient(70% 50% at 100% 0%, ${c.colors.glowPurple.length === 9 ? `#${c.colors.glowPurple.slice(1, 7)}${c.colors.glowPurple.slice(7)}` : c.colors.glowPurple}, transparent 50%),
    linear-gradient(180deg, ${c.colors.backgroundSecondary}, var(--bg) 40%) !important;
}

.layout {
  max-width: var(--layout-max);
  grid-template-columns: minmax(0, 1fr) var(--ticket-width);
  gap: calc(var(--card-gap) * 0.08rem + 0.5rem);
  padding: calc(var(--section-gap) * 0.04rem + 0.5rem) 1.25rem 3rem;
}

.cards {
  grid-template-columns: repeat(${c.layout.cardColumns}, minmax(0, 1fr));
  gap: calc(var(--card-gap) * 0.06rem + 0.35rem);
}

.section-head h2 { font-size: calc(var(--font-heading) * 0.062rem); }

body.density-compact { --font-base: calc(${c.typography.baseSize}px - 1px); }
body.density-spacious { --font-base: calc(${c.typography.baseSize}px + 1px); --section-gap: calc(${c.structure.sectionGap}px + 8px); }

body.layout-compact .layout { max-width: 1200px; }
body.layout-wide .layout { max-width: 1680px; grid-template-columns: minmax(0, 1fr) calc(var(--ticket-width) + 40px); }
body.layout-feed .layout { grid-template-columns: 1fr; }
body.layout-feed .ticket { display: none !important; }
body.layout-feed .fab { display: inline-flex !important; }
body.layout-minimal .featured { display: none !important; }
body.layout-minimal .cards { grid-template-columns: 1fr !important; }

body.hide-featured .featured { display: none !important; }
body.hide-ticket .ticket { display: none !important; }
body.hide-ticket .layout { grid-template-columns: 1fr !important; }

@media (max-width: 1100px) {
  .layout {
    padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0px)) !important;
  }
  .ticket {
    padding-bottom: env(safe-area-inset-bottom, 0px) !important;
  }
  .fab {
    bottom: calc(16px + env(safe-area-inset-bottom, 0px)) !important;
    right: calc(16px + env(safe-area-inset-right, 0px)) !important;
  }
  .cards { grid-template-columns: 1fr !important; }
}

@media (max-width: 480px) {
  .cards { grid-template-columns: 1fr !important; }
  .mkt-btn { min-height: 44px !important; }
}

body.theme-${preset} { /* active design system */ }
${themeEffectCss(preset)}
`;
}

export function boardCss(config) {
  const c = mergeConfig(DEFAULT_CONFIG, config);
  return `:root {
  color-scheme: dark;
  --background-primary-color: ${c.board.background} !important;
  --background-secondary-color: ${c.colors.backgroundSecondary} !important;
  --text-primary-color: ${c.board.text} !important;
  --button-color: ${c.board.accent} !important;
  --button-color-hover: ${c.colors.accentBright} !important;
  --odd-selected-color: ${c.board.accent} !important;
  --primary: ${c.board.accent} !important;
  --secondary: ${c.colors.accentBright} !important;
}
body { background: ${c.board.background} !important; }

@media (max-width: 900px) {
  body {
    padding-left: env(safe-area-inset-left, 0);
    padding-right: env(safe-area-inset-right, 0);
  }
  #app { padding-bottom: env(safe-area-inset-bottom, 0); }
}`;
}

export function sharedPath(sportId = 1) {
  return `/live-sports/overview/${sportId}`;
}
