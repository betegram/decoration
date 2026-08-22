import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { renderThemeCss, getThemeRecipe } from "./theme-engine.js";
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
  --fill: rgba(255, 255, 255, 0.04);
  --fill-2: rgba(255, 255, 255, 0.07);
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
  --gutter-x: 1.25rem;
  --page-pad-top: calc(var(--section-gap) * 0.04rem + 0.5rem);
  --page-pad-bottom: 3rem;
  --shell-gap: calc(var(--card-gap) * 0.08rem + 0.5rem);
  --fab-clearance: 5.5rem;
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

.page-shell {
  max-width: min(var(--layout-max), 100%);
  grid-template-columns: minmax(0, 1fr) var(--ticket-width);
  gap: var(--shell-gap);
  padding: var(--page-pad-top) var(--gutter-x) var(--page-pad-bottom);
}

.ticket {
  max-width: 100%;
}

.layout {
  display: block;
  min-width: 0;
}

.cards {
  grid-template-columns: repeat(${c.layout.cardColumns}, minmax(0, 1fr));
  gap: calc(var(--card-gap) * 0.06rem + 0.35rem);
}

.section-head h2 { font-size: calc(var(--font-heading) * 0.062rem); }

body.density-compact {
  --font-base: calc(${c.typography.baseSize}px - 1px);
  --page-pad-top: calc(var(--section-gap) * 0.04rem + 0.4rem);
  --shell-gap: calc(var(--card-gap) * 0.06rem + 0.4rem);
}
body.density-spacious {
  --font-base: calc(${c.typography.baseSize}px + 1px);
  --section-gap: calc(${c.structure.sectionGap}px + 8px);
  --page-pad-top: calc(var(--section-gap) * 0.04rem + 0.65rem);
  --page-pad-bottom: 3.25rem;
}

body.layout-compact .page-shell { max-width: 1200px; }
body.layout-wide .page-shell { max-width: 1680px; grid-template-columns: minmax(0, 1fr) calc(var(--ticket-width) + 40px); }
body.layout-feed .page-shell { grid-template-columns: minmax(0, 1fr); }
body.layout-feed .ticket { display: none !important; }
body.layout-feed .fab { display: none !important; }
body.layout-minimal .featured { display: none !important; }
body.layout-minimal .cards { grid-template-columns: 1fr !important; }

body.hide-featured .featured { display: none !important; }
body.hide-ticket .page-shell { grid-template-columns: minmax(0, 1fr); }
body.hide-ticket .ticket { display: none !important; }

@media (min-width: 1101px) {
  body:not(.hide-ticket):not(.layout-feed) .ticket {
    display: flex !important;
    position: sticky !important;
    top: var(--ticket-sticky-top) !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    grid-column: 2 !important;
    width: 100% !important;
    max-width: 100% !important;
    max-height: calc(100vh - var(--ticket-sticky-top) - 1.5rem) !important;
    z-index: 1 !important;
    border-radius: var(--r-lg) !important;
    transform: none !important;
    box-shadow: var(--surface-shadow, var(--shadow)) !important;
  }
  .ticket-backdrop,
  .fab {
    display: none !important;
  }
  body:not(.hide-ticket):not(.layout-feed) #ticketToggle {
    display: none !important;
  }
}

@media (max-width: 1100px) {
  .page-shell {
    grid-template-columns: minmax(0, 1fr) !important;
    padding-bottom: calc(var(--fab-clearance) + env(safe-area-inset-bottom, 0px)) !important;
    gap: 0 !important;
  }
  .ticket {
    display: none !important;
    position: fixed !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    top: auto !important;
    width: 100% !important;
    max-width: none !important;
    grid-column: auto !important;
    align-self: auto !important;
    z-index: 46 !important;
    border-radius: 22px 22px 0 0 !important;
    max-height: min(75dvh, 520px) !important;
    padding-bottom: env(safe-area-inset-bottom, 0px) !important;
    box-shadow: 0 -16px 48px rgba(0, 0, 0, 0.45) !important;
    transform: none !important;
  }
  .ticket.is-open {
    display: flex !important;
    flex-direction: column !important;
  }
  .ticket-backdrop {
    display: block;
  }
  .fab {
    display: inline-flex !important;
    z-index: 44 !important;
    bottom: calc(16px + env(safe-area-inset-bottom, 0px)) !important;
    right: calc(16px + env(safe-area-inset-right, 0px)) !important;
  }
  body.layout-feed .fab {
    display: inline-flex !important;
  }
  body.is-ticket-open .fab {
    opacity: 0;
    pointer-events: none;
    transform: translateY(12px);
  }
  body.hide-ticket .fab,
  body.hide-ticket .ticket-backdrop {
    display: none !important;
  }
  .cards { grid-template-columns: 1fr !important; }
  .skeletons { grid-template-columns: 1fr !important; }
}

@media (max-width: 480px) {
  .cards { grid-template-columns: 1fr !important; }
  .mkt-btn { min-height: 44px !important; }
}

/* ── Active design system (complete theme engine layer) ── */
${renderThemeCss(preset, c)}
`;
}

/**
 * Board theme — restyles the proxied upstream SPA (`/markets/overview/*`) to
 * match the active design system. The SPA is fully CSS-variable driven, so we
 * (1) remap its entire theme-token contract to the selected theme, and
 * (2) apply the theme recipe's geometry / depth / material / motion to the
 * SPA's semantic component classes. Same source of truth as the designed UI
 * (`getThemeRecipe` + `config.colors`), so switching the theme in admin
 * restyles both surfaces consistently.
 */
export function boardCss(config) {
  const c = mergeConfig(DEFAULT_CONFIG, config);
  const preset = c.theme?.preset || "polymarket";
  const r = getThemeRecipe(preset);
  const font = FONT_STACKS[c.typography.fontFamily] || FONT_STACKS.system;
  const hx = (v) =>
    typeof v === "string" && v.length === 9 && v.startsWith("#")
      ? `#${v.slice(1, 7)}${v.slice(7)}`
      : v;
  const panelAlpha = Number(c.colors.panelOpacity ?? 82) / 100;
  const panel = c.colors.panel.startsWith("#")
    ? rgba(c.colors.panel, panelAlpha)
    : c.colors.panel;
  const line = hx(c.colors.border);
  const line2 = hx(c.colors.borderStrong);
  const glow = hx(c.colors.glowBlue);
  const onAccent = r.primaryColor || "#fff";
  const blur = r.surfaceBlur && r.surfaceBlur !== "none" ? r.surfaceBlur : "";

  // Outer card containers — get full material (radius + border + shadow).
  const outerCards = [
    ".live-card-outer", ".league-card", ".live-legaue-card", ".live_competitions_card",
    ".table-layout-card", ".promo-card-main", ".promotion-card-main", ".coupon-slider-item",
    ".my_bet_wrap", ".br-betslip-receipt", ".accordion-outer-coupon", ".sgltab_full_detail",
    '[class*="_banner"]', '[class*="-card-outer"]', '[class*="-card-main"]',
  ].join(",\n");
  // Inner / nested surfaces — geometry only (avoid stacked shadows).
  const innerCards = [
    ".live-card-inner", ".promo-card-inner", ".accordion-coupon", ".accordion-item-coupon",
    ".yello_card", ".live-card-content", ".table-layout-card_inner", '[class*="-card-inner"]',
  ].join(",\n");
  const buttons = [
    "button", ".btn-tab", ".top_filter_button", '[class*="-btn"]', '[class*="_button"]', '[class*="btn-"]',
  ].join(",\n");
  const oddsSel = '[class*="odd"], [class*="selection-price"], [class*="price-box"]';
  const inputs = "input, select, textarea, .multiselect__tags";

  const blurLayer = blur
    ? `
${[".header", '[class*="header"]', ".sports-left-sidebar", ".dashboard-left-sidebar",
   ".left-sidebar-dash", ".br-betslip-receipt", ".my_bet_wrap", ".live-card-outer",
   ".coupon-slider-item"].join(",\n")} {
  backdrop-filter: ${blur} !important;
  -webkit-backdrop-filter: ${blur} !important;
}`
    : "";

  const headingLayer =
    r.headingTransform && r.headingTransform !== "none"
      ? `
h1, h2, h3, .accordion-header, [class*="_title"], [class*="-title"], [class*="heading"] {
  text-transform: ${r.headingTransform} !important;
  letter-spacing: ${r.headingSpacing} !important;
}`
      : "";

  return `/* Board theme — proxied SPA restyled to design system: ${preset} */
:root {
  color-scheme: dark;
  /* base design-system vars (so theme recipe references resolve on this page) */
  --bg: ${c.colors.background};
  --bg-2: ${c.colors.backgroundSecondary};
  --panel: ${panel};
  --panel-2: ${rgba(c.colors.panel, Math.min(panelAlpha + 0.08, 1))};
  --line: ${line};
  --line-2: ${line2};
  --fill: rgba(255, 255, 255, 0.04);
  --fill-2: rgba(255, 255, 255, 0.07);
  --ink: ${c.colors.text};
  --muted: ${c.colors.textMuted};
  --blue: ${c.colors.accent};
  --blue-2: ${c.colors.accentBright};
  --blue-soft: ${glow};
  --green: ${c.colors.success};
  --red: ${c.colors.live};
  --r: ${c.structure.radius}px;
  --r-lg: ${c.structure.radiusLg}px;
  --board-ease: ${r.ease};
  --board-dur: ${r.dur};

  /* upstream SPA theme contract → active design system */
  --background-primary-color: ${c.colors.background} !important;
  --background-secondary-color: ${c.colors.backgroundSecondary} !important;
  --background-third-color: ${r.cardBg} !important;
  --container-color: ${c.colors.background} !important;
  --active-container: var(--fill-2) !important;
  --sportsbook-background-container: transparent !important;
  --selector-background-color: var(--fill-2) !important;

  --text-primary-color: ${c.colors.text} !important;
  --text-secondary-color: ${c.colors.textMuted} !important;
  --header-text-color: ${c.colors.text} !important;
  --scoreboard-text-color: ${c.colors.text} !important;
  --white: ${c.colors.text} !important;
  --tab-gray: ${c.colors.textMuted} !important;
  --border-light: ${line2} !important;

  --header-background-color: ${r.headerBg} !important;

  --button-color: ${c.colors.accent} !important;
  --button-color-hover: ${c.colors.accentBright} !important;
  --button-color-text: ${onAccent} !important;
  --button-color-text-hover: ${onAccent} !important;
  --primary: ${c.colors.accent} !important;
  --secondary: ${c.colors.accentBright} !important;
  --linear-gradient-primary-color: ${c.colors.accent} !important;
  --linear-gradient-secondary-color: ${c.colors.accentBright} !important;
  --sportsbook-navigation-button-color-hover: var(--fill-2) !important;

  --odd-background-color: ${r.mktBg} !important;
  --odd-selected-color: ${c.colors.accent} !important;
  --odd-color-text: ${c.colors.text} !important;
  --odd-price-up-color: ${c.colors.success} !important;
  --odd-price-down-color: ${c.colors.live} !important;

  --betsip-background: ${rgba(c.colors.panel, Math.min(panelAlpha + 0.04, 1))} !important;
  --betsip-container: ${panel} !important;
}

html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
body {
  background: ${c.colors.background} !important;
  font-family: ${font} !important;
  margin: 0;
  max-width: 100vw;
  overflow-x: hidden;
}
#app, #initial-loader { width: 100%; max-width: 100vw; overflow-x: hidden; }
#app { min-height: 100dvh; }
img, svg, video, iframe { max-width: 100%; }

/* ---- Design-system material / geometry (SPA bakes these into component CSS) ---- */
${outerCards} {
  border-radius: ${r.cardRadius} !important;
  border: 1px solid ${r.cardBorder} !important;
  box-shadow: ${r.cardShadow} !important;
  transition: transform var(--board-dur) var(--board-ease), box-shadow var(--board-dur) var(--board-ease), border-color var(--board-dur) var(--board-ease) !important;
}
${innerCards} {
  border-radius: ${r.mktRadius} !important;
}
${buttons} {
  border-radius: ${r.btnRadius} !important;
}
${oddsSel} {
  border-radius: ${r.mktRadius} !important;
}
${inputs} {
  border-radius: ${r.inputRadius} !important;
}

/* Motion personality */
a, button, [role="button"], ${oddsSel} {
  transition: background var(--board-dur) var(--board-ease), color var(--board-dur) var(--board-ease), box-shadow var(--board-dur) var(--board-ease), transform var(--board-dur) var(--board-ease);
}
${blurLayer}
${headingLayer}

/* Accent surfaces */
::selection { background: ${c.colors.accent}; color: ${onAccent}; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb { background: ${r.scrollThumb}; border-radius: 999px; }
::-webkit-scrollbar-track { background: transparent; }

@media (max-width: 900px) {
  body {
    padding-left: env(safe-area-inset-left, 0);
    padding-right: env(safe-area-inset-right, 0);
  }
  #app { padding-bottom: env(safe-area-inset-bottom, 0); }
  [class*="betslip"], [class*="bet-slip"], [class*="ticket"] { max-width: 100vw !important; }
}`;
}

export function sharedPath(sportId = 1) {
  return `/live-sports/overview/${sportId}`;
}
