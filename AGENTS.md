# AURUM Markets — AI development guide

Instructions for AI agents and developers working in this repository (`betegram/decoration`).

**Production:** https://ui.kycland.xyz  
**Local:** `http://localhost:${PORT}` (see `.env`)

---

## Project purpose

Custom sports **market discovery UI** (themes, i18n, ticket) on the same origin as a **proxied upstream sportsbook SPA** for full trading in the event desk iframe.

| Path | Role |
|------|------|
| `/live-sports/overview/{sportId}` | **Designed UI** — `index.html`, `markets.js`, `styles.css`, `/api/theme.css` |
| `/markets/overview/{sportId}` | **Proxied upstream SPA** (reference / parity baseline) |
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

Custom UI at `/live-sports/overview/*` only. Changes to `markets.js`, `styles.css`, `lib/config.js`, `lib/themes.js`, `index.html`, `admin/`.

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

- Ticket is **outside** `page-shell` in `index.html` (sibling, not inside the feed grid).
- Desktop (>1100px): `position: fixed` **rail** aligned to the content column via `--ticket-rail-right` (set in `syncChromeMetrics()` in `markets.js`).
- Feed reserves space: `page-shell` `padding-right` = ticket width + gap + gutter.
- Do **not** put the ticket back inside the feed flex/grid or use sticky positioning that overlaps cards.
- Mobile (≤1100px): bottom sheet (`display: none` until `.is-open`), FAB, backdrop; `setTicketOpen()` is mobile-only.

### Event cards

- Cards need `min-width: 0`, `overflow: hidden`, and container queries for tight market grids.
- Featured carousel: fixed column width; limit extra market rows in the strip.
- Test at ~1400px desktop and ~390px mobile; check heavy-shadow themes (neomorphism, brutalist, cyber).

### Themes

Themes are full design systems (surface tokens in `lib/theme-tokens.js`, effects in `lib/themes.js`), not color-only swaps.

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
