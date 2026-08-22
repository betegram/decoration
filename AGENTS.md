# AURUM Markets — AI development guide

Instructions for AI agents and developers working in this repository (`betegram/decoration`).

**Production:** https://ui.kycland.xyz  
**Local:** `http://localhost:${PORT}` (see `.env`)

---

## Project purpose

Custom sports **market discovery UI** (themes, i18n, ticket) on the same origin as a **proxied upstream sportsbook SPA** for full trading in the event desk iframe.

| Path | Role |
|------|------|
| `/live-sports/overview/{sportId}` | **Primary — proxied upstream SPA** (full sportsbook, restyled to the active design system) |
| `/markets/overview/{sportId}` | **Designed UI** — `index.html`, `markets.js`, `styles.css`, `/api/theme.css` |
| `/admin` | ERP-style site config (themes, layout, i18n, AI translate) |
| `/api/bs/*` | Proxied sportsbook REST API |
| `/socket/` | Proxied Socket.IO (live overview, live sports nav) |

Upstream hosts: `bs-iframedev1.thesportslab.eu` (REST), `iframedev1.thesportslab.eu` (SPA). See `HOW_IT_WORKS.md` and `README.md`.

---

## Mandatory workflow for AI agents

1. **Investigate before changing** — Read relevant files and run commands; do not guess at API or layout behavior.
2. **Minimize scope** — Fix the root cause with the smallest correct diff. No drive-by refactors.
3. **Match existing conventions** — Naming, structure, and patterns in surrounding code.
4. **Commit and push after completed fixes** — Unless the user says otherwise, always commit and push to `main` when a task is done (not for exploratory-only or question-only work).
5. **Never commit secrets** — `.env`, credentials, API keys. Warn if asked to commit them.
6. **Deploy reminder** — After push, note: `git pull && docker compose up --build -d` on the server.

### Git

- Use clear commit messages focused on **why**, not file lists.
- Do not force-push `main`, skip hooks, or amend unless hooks auto-modified files after a successful commit.
- Do not update git config.

---

## Architecture phases (do not mix)

### Phase A — Proxy parity

Proxied routes must behave like upstream before cosmetic UI work.

- Skill: `.cursor/skills/proxy-parity-engineering/SKILL.md`
- Rule: `.cursor/rules/proxy-parity-phase-a.mdc`
- Tool: `node scripts/proxy-diff.mjs`
- Log: `docs/PROXY_PARITY_AUDIT.md`
- Debug: `PROXY_DEBUG=true`

**Do not** patch proxy/CSP/cookies blindly. Classify failures (COOKIE, WEBSOCKET, ASSET, etc.) and fix the first divergence.

### Phase B — Designed markets UI

Custom UI at `/markets/overview/*` only. Changes to `markets.js`, `styles.css`, `lib/config.js`, `lib/themes.js`, `index.html`, `admin/`.

**Live overview data**

- Today tab: WebSocket `join-liveSportOverview` / `liveSportOverview` (not REST daterange for overview markets).
- Tomorrow+: REST fixtures; pre-match odds may need `join-competitionFixtures` where applicable.
- All sports: use sport-specific market slugs (`match_result`, `totals`, `totals_new`, `handicap`, `handicap_new`, etc.) — not soccer-only defaults.

---

## UI / layout regulations

### Styles cascade

1. `styles.css` — base layout and components  
2. `/api/theme.css` — generated from `lib/config.js` + `lib/themes.js` (loads **after** base; can override with `!important`)

Desktop and mobile overrides must use explicit breakpoints (`min-width: 1101px` / `max-width: 1100px`).

### Desktop ticket (trade panel)

- Ticket is **inside** `page-shell` as grid column 2 (sibling of `.layout`).
- Desktop (>1100px): `page-shell` is a 2-col CSS grid; ticket is `position: sticky` in column 2 (no JS positioning).
- `body { overflow-x: clip }` — NOT `hidden`. `hidden` silently creates a scroll container that breaks `position: sticky`.
- Layout presets: `wide` widens the ticket column; `feed`/`hide-ticket` collapse to a single column.
- Mobile (≤1100px): grid collapses to 1 col; ticket becomes a bottom sheet (`display: none` until `.is-open`), FAB, backdrop; `setTicketOpen()` is mobile-only.

### Event cards

- Cards need `min-width: 0`, `overflow: hidden`, and container queries for tight market grids.
- Featured carousel: fixed column width; limit extra market rows in the strip.
- Test at ~1400px desktop and ~390px mobile; check heavy-shadow themes (neomorphism, brutalist, cyber).

### Themes — engine architecture

Themes are **complete design systems**, not color presets. They must be distinguishable in grayscale (geometry, depth/shadow model, motion, component construction).

- `lib/theme-engine.js` — `THEME_RECIPES` registry (one recipe per theme) + `renderThemeCss(preset, config)` generator. Each recipe controls material (surface/opacity/blur/shadow/highlight), geometry (radii, control shape), depth (elevation model), motion (duration/easing/interaction), and per-component recipes (nav, cards, market buttons, chips, inputs, primary/fab, modal, skeletons, scrollbar, focus/hover/active states).
- The generator emits CSS scoped to `body.theme-<id>` so the same markup renders in a different visual language.
- `lib/config.js` `themeCss()` = base `:root` (colors/fonts from config) + structural layout + the engine layer.
- `lib/themes.js` `THEME_PRESETS` = admin/server preset registry (label/concept/desc/config patch). Adding a theme means: add a preset in `THEME_PRESETS` and a recipe in `THEME_RECIPES` with the same id.
- Do NOT scatter `if (theme === …)` checks; add a recipe to the registry.
- Live switching: admin merges the preset config → `body.theme-<id>` class + `/api/theme.css` regenerate; no reload of the whole app needed.

### Proxied SPA theming (board)

The proxied upstream SPA (primary, at `/live-sports/overview/*`, plus the event-view desk) is restyled to the **same active design system** via injected CSS — it shares the theme source of truth, so switching the theme restyles both surfaces.

- `boardCss(config)` in `lib/config.js` → served at `/api/board-theme.css`, injected (with `/board.css`) into every proxied page by `boardInjection()` in `server.js`.
- It uses `getThemeRecipe(preset)` + `config.colors` to (1) remap the SPA's full CSS-variable contract (`--background-*-color`, `--text-*-color`, `--odd-*`, `--button-*`, `--linear-gradient-*`, `--betsip-*`, …) to the theme, and (2) apply the recipe's geometry/depth/material/motion (`cardRadius`, `cardShadow`, `btnRadius`, `mktRadius`, `surfaceBlur`, `ease`/`dur`) to the SPA's **semantic** component classes (`.live-card-outer`, `.league-card`, `.coupon-slider-item`, odds/buttons/inputs, …).
- `board.css` is **theme-free** (structural helpers only) — it loads after `board-theme.css`, so keep theme tokens out of it or they will override the generated theme.

---

## Code style

- **JavaScript** — Plain Node/browser JS (no TypeScript). Prefer existing functions over new abstractions.
- **CSS** — CSS variables for layout rhythm (`--gutter-x`, `--ticket-width`, `--shell-gap`, chrome metrics).
- **Comments** — Only for non-obvious business or protocol logic.
- **Tests** — Add only when they cover real behavior the user cares about; avoid trivial assertions.
- **i18n** — User-facing strings via `lib/i18n.js` catalog + `tr()` / `data-i18n`; admin Languages for edits and AI translate.

---

## Key files

| File | Role |
|------|------|
| `server.js` | HTTP server, proxy, admin API, theme CSS route |
| `index.html` | Markets shell (feed + ticket + desk modal) |
| `markets.js` | Feed, socket, ticket, chrome metrics, config apply |
| `styles.css` | Base UI layout and responsive rules |
| `lib/config.js` | Config merge, `themeCss()` generator |
| `lib/themes.js` | Theme presets and effect CSS |
| `lib/store.js` | MongoDB / file persistence |
| `site-config.json` | Default/fallback config |
| `admin/` | Admin ERP UI |

---

## Run and deploy

**Host requires Docker only** — no Node/npm on production server.

```bash
cp .env.example .env
docker compose up --build
```

**Production:**

```bash
git pull && docker compose up --build -d
```

Align nginx upstream with `PORT` in `.env` (`nginx/README.md`).

---

## Security

- Do not bypass auth, CORS, or CSP on the proxy.
- Redact secrets in logs and docs.
- `OPENAI_API_KEY` only in `.env` for admin AI translate.

---

## Cursor integration

| Mechanism | Purpose |
|-----------|---------|
| `AGENTS.md` (this file) | Project hub for humans and agents |
| `.cursor/rules/*.mdc` | Auto-applied rules (see frontmatter `alwaysApply` / `globs`) |
| `.cursor/skills/` | Deep workflows (e.g. proxy parity) |

When editing proxy code, read the proxy parity skill first. When editing markets UI, follow `.cursor/rules/markets-ui.mdc`.
