# How AURUM Markets Works

AURUM Markets is a local web app with two layers: a **custom discovery UI** and a **proxied sportsbook** for full trading. Both run on one Node server at `http://localhost:8080`.

## Architecture

```
Browser
  │
  ├─ /  ──────────────────────► index.html + markets.js + styles.css   (Markets UI)
  │
  ├─ /api/bs/*  ──────────────► bs-iframedev1.thesportslab.eu           (REST data)
  ├─ /api/flag/*  ────────────► iframedev1.thesportslab.eu             (region flags)
  │
  └─ /live-sports/*  ─────────► iframedev1.thesportslab.eu             (Event desk SPA)
         (iframe)                  + board.css injected into HTML
```

**Upstream sources**

| Host | Used for |
| --- | --- |
| `bs-iframedev1.thesportslab.eu` | Fixtures, sports, competitions (JSON API) |
| `iframedev1.thesportslab.eu` | Full sportsbook SPA (event view, bet placement) |
| `bs-iframedev1.thesportslab.eu` (WebSocket) | Live odds overview (browser connects directly) |

## Request routing (`server.js`)

Every request hits one handler. It picks a path in this order:

1. **`/api/bs/*`** — Proxies to the sportsbook REST API. Adds `Origin` / `Referer` so upstream accepts the call.
2. **`/api/flag/*`** — Proxies flag/icon assets from the iframe host.
3. **Static allowlist** — Serves only `index.html`, `markets.js`, `styles.css`, `board.css`.
4. **Everything else** — Proxies to `iframedev1.thesportslab.eu` (the original sportsbook).

For proxied HTML responses, the server:

- Strips `Content-Security-Policy` and `X-Frame-Options` (so the desk can load in an iframe).
- Rewrites `Set-Cookie` for localhost.
- Injects `<link rel="stylesheet" href="/board.css">` before `</head>`.

## Markets UI (`markets.js`)

On load, the app:

1. Fetches today's sports from `/api/bs/sports/today`.
2. Loads fixtures and featured competitions for the selected sport.
3. Renders sport tabs, filter chips, a live strip, and grouped event cards.
4. Joins a Socket.IO room (`join-liveSportOverview`) for live odds on cards.
5. Polls fixtures every 45 seconds as a fallback.

**User actions**

| Action | What happens |
| --- | --- |
| Pick sport / filter / search | Re-filters and re-renders the feed |
| Click an odds button | Adds selection to the ticket (or opens desk if odds aren't live yet) |
| Open trade desk / Full markets | Opens modal with iframe → `/live-sports/event-view/:id` (proxied board) |
| Place bet | Done inside the iframe on the original sportsbook — behavior unchanged |

Live prices on cards come from the socket `liveSportOverview` payload when available; otherwise cards show placeholder labels until data arrives.

## Files

| File | Role |
| --- | --- |
| `server.js` | HTTP server: static files, API proxy, board proxy |
| `index.html` | Page structure (header, feed, ticket, desk modal) |
| `markets.js` | Data fetching, rendering, socket, interactions |
| `styles.css` | Markets UI look and feel |
| `board.css` | Dark theme overrides for the proxied event desk |

## Run

```bash
./run.sh
```

Requires **Node.js 18+**. No npm install.

## Admin customization

| URL | Purpose |
| --- | --- |
| `/admin` | ERP-style admin panel (login required) |
| `/live-sports/overview/1` | Public site (mirrors original path) |
| `/api/theme.css` | Generated CSS from saved config |

Default credentials: `admin` / `aurum2026` — change in `admin-auth.json`.

## Files
