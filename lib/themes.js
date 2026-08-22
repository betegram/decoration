/**
 * Predefined design-system themes — full config patches + visual effects.
 */

export const THEME_PRESETS = {
  glassmorphism: {
    label: "Glassmorphism",
    concept: "Liquid glass · blur & translucency",
    desc: "Frosted panels, soft blur, luminous depth — Apple-style glass layers.",
    config: {
      theme: { preset: "glassmorphism" },
      colors: {
        background: "#06080f",
        backgroundSecondary: "#0a0e18",
        panel: "#141a28",
        panelOpacity: 55,
        accent: "#5ac8fa",
        accentBright: "#7dd3fc",
        text: "#f4f7fb",
        textMuted: "#94a3b8",
        textFaint: "#64748b",
        live: "#ff6b6b",
        success: "#4ade80",
        border: "#ffffff18",
        borderStrong: "#ffffff30",
        glowBlue: "#5ac8fa30",
        glowPurple: "#a78bfa18",
      },
      typography: { fontFamily: "system", baseSize: "15", headingSize: "17", weight: "600" },
      structure: { radius: "20", radiusLg: "28", density: "normal", headerBlur: "28", cardGap: "14", sectionGap: "24" },
      board: { background: "#06080f", accent: "#5ac8fa", text: "#f4f7fb" },
    },
  },
  apple: {
    label: "Apple HIG",
    concept: "Human Interface · spatial dark",
    desc: "Calm graphite canvas, system blue accents, tight typography rhythm.",
    config: {
      theme: { preset: "apple" },
      colors: {
        background: "#08090d",
        backgroundSecondary: "#101218",
        panel: "#161820",
        panelOpacity: 88,
        accent: "#0a84ff",
        accentBright: "#409cff",
        text: "#f5f5f7",
        textMuted: "#98989d",
        textFaint: "#636366",
        live: "#ff453a",
        success: "#30d158",
        border: "#ffffff12",
        borderStrong: "#ffffff22",
        glowBlue: "#0a84ff22",
        glowPurple: "#5e5ce612",
      },
      typography: { fontFamily: "system", baseSize: "15", headingSize: "17", weight: "600" },
      structure: { radius: "16", radiusLg: "22", density: "normal", headerBlur: "22", cardGap: "12", sectionGap: "24" },
      board: { background: "#08090d", accent: "#0a84ff", text: "#f5f5f7" },
    },
  },
  material3: {
    label: "Material Design 3",
    concept: "Google M3 · tonal surfaces",
    desc: "Purple primary, rounded 12px shapes, elevation through surface tints.",
    config: {
      theme: { preset: "material3" },
      colors: {
        background: "#121318",
        backgroundSecondary: "#1a1c23",
        panel: "#23262f",
        panelOpacity: 100,
        accent: "#d0bcff",
        accentBright: "#e8def8",
        text: "#e6e1e5",
        textMuted: "#cac4d0",
        textFaint: "#938f99",
        live: "#f2b8b5",
        success: "#4caf50",
        border: "#ffffff14",
        borderStrong: "#ffffff28",
        glowBlue: "#d0bcff28",
        glowPurple: "#6750a428",
      },
      typography: { fontFamily: "roboto", baseSize: "15", headingSize: "18", weight: "500" },
      structure: { radius: "12", radiusLg: "16", density: "normal", headerBlur: "16", cardGap: "12", sectionGap: "20" },
      board: { background: "#121318", accent: "#d0bcff", text: "#e6e1e5" },
    },
  },
  neomorphism: {
    label: "Neomorphism",
    concept: "Soft UI · extruded surfaces",
    desc: "Muted monochrome, soft outer shadows, embossed card feel.",
    config: {
      theme: { preset: "neomorphism" },
      colors: {
        background: "#2d3250",
        backgroundSecondary: "#353b5c",
        panel: "#3d4468",
        panelOpacity: 100,
        accent: "#6c9bcf",
        accentBright: "#8bb4e8",
        text: "#e8ecf4",
        textMuted: "#b8c0d4",
        textFaint: "#8892ab",
        live: "#e57373",
        success: "#81c784",
        border: "#ffffff08",
        borderStrong: "#ffffff14",
        glowBlue: "#6c9bcf20",
        glowPurple: "#9b8cce15",
      },
      typography: { fontFamily: "inter", baseSize: "15", headingSize: "17", weight: "600" },
      structure: { radius: "20", radiusLg: "24", density: "spacious", headerBlur: "12", cardGap: "16", sectionGap: "28" },
      board: { background: "#2d3250", accent: "#6c9bcf", text: "#e8ecf4" },
    },
  },
  fluent: {
    label: "Fluent UI",
    concept: "Microsoft · acrylic & reveal",
    desc: "Cool blue-gray surfaces, crisp borders, enterprise clarity.",
    config: {
      theme: { preset: "fluent" },
      colors: {
        background: "#1b1a19",
        backgroundSecondary: "#252423",
        panel: "#2d2c2c",
        panelOpacity: 95,
        accent: "#2899f5",
        accentBright: "#4ba3f7",
        text: "#f3f2f1",
        textMuted: "#c8c6c4",
        textFaint: "#8a8886",
        live: "#d13438",
        success: "#107c10",
        border: "#ffffff1a",
        borderStrong: "#ffffff2e",
        glowBlue: "#2899f528",
        glowPurple: "#8764b820",
      },
      typography: { fontFamily: "system", baseSize: "14", headingSize: "16", weight: "600" },
      structure: { radius: "8", radiusLg: "12", density: "compact", headerBlur: "20", cardGap: "10", sectionGap: "20" },
      board: { background: "#1b1a19", accent: "#2899f5", text: "#f3f2f1" },
    },
  },
  bootstrap: {
    label: "Bootstrap",
    concept: "Corporate · clean utility",
    desc: "Familiar blue primary, white-on-dark readability, classic spacing.",
    config: {
      theme: { preset: "bootstrap" },
      colors: {
        background: "#212529",
        backgroundSecondary: "#2b3035",
        panel: "#343a40",
        panelOpacity: 100,
        accent: "#0d6efd",
        accentBright: "#3d8bfd",
        text: "#f8f9fa",
        textMuted: "#adb5bd",
        textFaint: "#6c757d",
        live: "#dc3545",
        success: "#198754",
        border: "#ffffff20",
        borderStrong: "#ffffff35",
        glowBlue: "#0d6efd25",
        glowPurple: "#6f42c115",
      },
      typography: { fontFamily: "system", baseSize: "16", headingSize: "18", weight: "600" },
      structure: { radius: "8", radiusLg: "12", density: "normal", headerBlur: "16", cardGap: "12", sectionGap: "24" },
      board: { background: "#212529", accent: "#0d6efd", text: "#f8f9fa" },
    },
  },
  tailwind: {
    label: "Tailwind Slate",
    concept: "Utility-first · slate scale",
    desc: "Slate 900 canvas, sky accents, tight fintech density.",
    config: {
      theme: { preset: "tailwind" },
      colors: {
        background: "#0f172a",
        backgroundSecondary: "#1e293b",
        panel: "#1e293b",
        panelOpacity: 92,
        accent: "#38bdf8",
        accentBright: "#7dd3fc",
        text: "#f1f5f9",
        textMuted: "#94a3b8",
        textFaint: "#64748b",
        live: "#f87171",
        success: "#34d399",
        border: "#ffffff14",
        borderStrong: "#ffffff24",
        glowBlue: "#38bdf822",
        glowPurple: "#818cf818",
      },
      typography: { fontFamily: "inter", baseSize: "14", headingSize: "16", weight: "600" },
      structure: { radius: "12", radiusLg: "16", density: "compact", headerBlur: "18", cardGap: "10", sectionGap: "20" },
      board: { background: "#0f172a", accent: "#38bdf8", text: "#f1f5f9" },
    },
  },
  cyber: {
    label: "Cyber iGaming",
    concept: "Neon casino · high energy",
    desc: "Deep void background, magenta/cyan neon, VIP operator feel.",
    config: {
      theme: { preset: "cyber" },
      colors: {
        background: "#050508",
        backgroundSecondary: "#0c0c14",
        panel: "#12121c",
        panelOpacity: 90,
        accent: "#ff00aa",
        accentBright: "#ff66cc",
        text: "#f0f0ff",
        textMuted: "#a0a0c0",
        textFaint: "#606080",
        live: "#ff3366",
        success: "#00ff88",
        border: "#ff00aa30",
        borderStrong: "#ff00aa50",
        glowBlue: "#00ffff25",
        glowPurple: "#ff00aa30",
      },
      typography: { fontFamily: "inter", baseSize: "15", headingSize: "18", weight: "700" },
      structure: { radius: "12", radiusLg: "16", density: "normal", headerBlur: "20", cardGap: "12", sectionGap: "22" },
      board: { background: "#050508", accent: "#ff00aa", text: "#f0f0ff" },
    },
  },
  luxury: {
    label: "Luxury Gold",
    concept: "VIP casino · gold & noir",
    desc: "Black velvet base, champagne gold accents, premium sports lounge.",
    config: {
      theme: { preset: "luxury" },
      colors: {
        background: "#0a0a0a",
        backgroundSecondary: "#141414",
        panel: "#1a1a1a",
        panelOpacity: 95,
        accent: "#d4af37",
        accentBright: "#f5c451",
        text: "#faf8f5",
        textMuted: "#b8a88a",
        textFaint: "#7a6f5c",
        live: "#e74c3c",
        success: "#2ecc71",
        border: "#d4af3730",
        borderStrong: "#d4af3750",
        glowBlue: "#d4af3720",
        glowPurple: "#d4af3715",
      },
      typography: { fontFamily: "georgia", baseSize: "15", headingSize: "18", weight: "600" },
      structure: { radius: "8", radiusLg: "12", density: "spacious", headerBlur: "16", cardGap: "14", sectionGap: "28" },
      board: { background: "#0a0a0a", accent: "#d4af37", text: "#faf8f5" },
    },
  },
  polymarket: {
    label: "Polymarket",
    concept: "Prediction markets · dense feed",
    desc: "Dark fintech density, electric blue, compact scanning UI.",
    config: {
      theme: { preset: "polymarket" },
      colors: {
        background: "#07080c",
        backgroundSecondary: "#0c0e14",
        panel: "#10121a",
        panelOpacity: 82,
        accent: "#0a84ff",
        accentBright: "#409cff",
        text: "#f0f0f5",
        textMuted: "#8c8c99",
        textFaint: "#575766",
        live: "#ff453a",
        success: "#30d158",
        border: "#ffffff14",
        borderStrong: "#ffffff24",
        glowBlue: "#409cff24",
        glowPurple: "#5e5ce614",
      },
      typography: { fontFamily: "inter", baseSize: "14", headingSize: "16", weight: "650" },
      structure: { radius: "16", radiusLg: "20", density: "compact", headerBlur: "22", cardGap: "10", sectionGap: "18" },
      board: { background: "#07080c", accent: "#0a84ff", text: "#f0f0f5" },
    },
  },
  spotify: {
    label: "Spotify Dark",
    concept: "Vibrant dark · green energy",
    desc: "Charcoal base, Spotify green highlights, bold contrast cards.",
    config: {
      theme: { preset: "spotify" },
      colors: {
        background: "#121212",
        backgroundSecondary: "#181818",
        panel: "#1e1e1e",
        panelOpacity: 100,
        accent: "#1db954",
        accentBright: "#1ed760",
        text: "#ffffff",
        textMuted: "#b3b3b3",
        textFaint: "#727272",
        live: "#ff4444",
        success: "#1db954",
        border: "#ffffff18",
        borderStrong: "#ffffff28",
        glowBlue: "#1db95422",
        glowPurple: "#1db95415",
      },
      typography: { fontFamily: "inter", baseSize: "15", headingSize: "18", weight: "700" },
      structure: { radius: "8", radiusLg: "12", density: "normal", headerBlur: "16", cardGap: "12", sectionGap: "22" },
      board: { background: "#121212", accent: "#1db954", text: "#ffffff" },
    },
  },
  brutalist: {
    label: "Brutalist",
    concept: "Stark · raw geometry",
    desc: "High contrast, square corners, yellow on black poster aesthetic.",
    config: {
      theme: { preset: "brutalist" },
      colors: {
        background: "#0d0d0d",
        backgroundSecondary: "#0d0d0d",
        panel: "#1a1a1a",
        panelOpacity: 100,
        accent: "#ffeb3b",
        accentBright: "#fff176",
        text: "#ffffff",
        textMuted: "#cccccc",
        textFaint: "#888888",
        live: "#ff0000",
        success: "#00ff00",
        border: "#ffffff40",
        borderStrong: "#ffffff60",
        glowBlue: "#ffeb3b15",
        glowPurple: "#ff000015",
      },
      typography: { fontFamily: "mono", baseSize: "14", headingSize: "18", weight: "700" },
      structure: { radius: "0", radiusLg: "0", density: "compact", headerBlur: "0", cardGap: "8", sectionGap: "16" },
      board: { background: "#0d0d0d", accent: "#ffeb3b", text: "#ffffff" },
    },
  },
};

/** Deep-merge theme patch into existing config (keeps branding/layout unless theme overrides). */
export function applyThemePreset(presetId, baseConfig) {
  const preset = THEME_PRESETS[presetId];
  if (!preset) return baseConfig;
  const out = structuredClone(baseConfig);
  for (const [section, values] of Object.entries(preset.config)) {
    if (typeof values === "object" && !Array.isArray(values)) {
      out[section] = { ...(out[section] || {}), ...values };
    } else {
      out[section] = values;
    }
  }
  return out;
}

export const THEME_EFFECT_CSS = {
  glassmorphism: `
body.theme-glassmorphism .topbar,
body.theme-glassmorphism .filter-rail-wrap,
body.theme-glassmorphism .card,
body.theme-glassmorphism .ticket {
  backdrop-filter: blur(24px) saturate(1.6) !important;
  -webkit-backdrop-filter: blur(24px) saturate(1.6) !important;
  border: 1px solid rgba(255,255,255,0.12) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08) !important;
}
body.theme-glassmorphism .card { background: rgba(20,26,40,0.45) !important; }
`,
  neomorphism: `
body.theme-neomorphism .card,
body.theme-neomorphism .ticket,
body.theme-neomorphism .mkt-btn {
  box-shadow: 8px 8px 16px rgba(0,0,0,0.35), -4px -4px 12px rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.04) !important;
}
body.theme-neomorphism .mkt-btn.is-on {
  box-shadow: inset 4px 4px 10px rgba(0,0,0,0.4), inset -2px -2px 6px rgba(255,255,255,0.05) !important;
}
`,
  cyber: `
body.theme-cyber .topbar { border-bottom-color: rgba(255,0,170,0.35) !important; }
body.theme-cyber .card {
  box-shadow: 0 0 20px rgba(255,0,170,0.08), inset 0 0 0 1px rgba(0,255,255,0.06) !important;
}
body.theme-cyber .chip.is-active,
body.theme-cyber .mkt-btn.is-on {
  box-shadow: 0 0 24px rgba(255,0,170,0.45) !important;
}
body.theme-cyber .logo { box-shadow: 0 0 20px rgba(255,0,170,0.6) !important; }
`,
  luxury: `
body.theme-luxury .card,
body.theme-luxury .ticket {
  border-color: rgba(212,175,55,0.25) !important;
  box-shadow: 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.08) !important;
}
body.theme-luxury .word { color: #f5c451 !important; letter-spacing: 0.22em !important; }
body.theme-luxury .primary,
body.theme-luxury .chip.is-active { background: linear-gradient(180deg, #f5c451, #c8870f) !important; color: #1a1204 !important; }
`,
  brutalist: `
body.theme-brutalist .card,
body.theme-brutalist .ticket,
body.theme-brutalist .topbar {
  border-radius: 0 !important;
  border-width: 2px !important;
}
body.theme-brutalist .chip.is-active { background: #ffeb3b !important; color: #000 !important; }
body.theme-brutalist .section-head h2 { text-transform: uppercase; letter-spacing: 0.08em; }
`,
  material3: `
body.theme-material3 .card { box-shadow: 0 2px 6px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.25) !important; }
body.theme-material3 .chip.is-active { border-radius: 999px !important; }
`,
  fluent: `
body.theme-fluent .topbar { border-bottom: 1px solid rgba(255,255,255,0.12) !important; }
body.theme-fluent .card:hover { border-color: rgba(40,153,245,0.4) !important; }
`,
  polymarket: `
body.theme-polymarket .card { border-radius: var(--r-lg) !important; }
body.theme-polymarket .mkt-btn { min-height: 48px !important; }
`,
  spotify: `
body.theme-spotify .card:hover { background: #282828 !important; }
body.theme-spotify .sport-nav button.is-active { background: #1db954 !important; color: #000 !important; }
`,
  apple: `
body.theme-apple .ambient { filter: saturate(1.1) !important; }
body.theme-apple .card { backdrop-filter: blur(18px) !important; }
`,
  bootstrap: `
body.theme-bootstrap .primary { border-radius: 8px !important; }
body.theme-bootstrap .chip.is-active { border-radius: 8px !important; }
`,
  tailwind: `
body.theme-tailwind .card { border: 1px solid #334155 !important; }
body.theme-tailwind .chip.is-active { background: #0ea5e9 !important; }
`,
};

export function themeEffectCss(preset) {
  return THEME_EFFECT_CSS[preset] || "";
}
