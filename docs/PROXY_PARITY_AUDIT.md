# Proxy parity audit (Phase A)

Living document. Update after each differential run.

## Targets

| Session | Base URL |
|---------|----------|
| **A (original)** | `https://iframedev1.thesportslab.eu` |
| **B (proxy)** | `https://ui.kycland.xyz` |

## Application model (black-box)

- **Type**: Vue SPA (CSR), single `#app` mount, lazy chunks under `/assets/`
- **Data**: REST on `bs-iframedev1.thesportslab.eu` (hardcoded in bundle)
- **Account**: `iframedev1.thesportslab.eu/api/*` (session cookies on iframe host)
- **Live**: Socket.IO on `bs-iframedev1.thesportslab.eu` (`/socket/`, namespace `sb-en`)
- **Not** a classic server-rendered site

## Differential snapshot (2026-08-22)

| Step | Resource | A (original) | B (proxy) | Divergence |
|------|----------|--------------|-----------|------------|
| 1 | `/live-sports/overview/1` | 200 HTML SPA shell | 200 **custom AURUM `index.html`** | **DOCUMENT** — designed UI (intentional) |
| 1b | `/markets/overview/1` | 200 HTML SPA shell | 200 SPA via path rewrite | Proxy parity target |
| 2 | `/assets/index-c14111cb.js` | 200 JS ~5MB | 200 JS ~5MB | OK |
| 3 | `/assets/index-d90b4e09.css` | 200 CSS | 200 CSS | OK |
| 4 | BS `sports/today` | 200 JSON (via `bs-iframedev1`) | 200 JSON via `/api/bs/sports/today` | OK on proxy path |
| 5 | `/board.css` | N/A | Was 200 **HTML** (broken) | **ASSET** — fixed: serve static before catch-all |
| 6 | WebSocket | Direct to `bs-iframedev1` | Browser cross-origin WS | **WEBSOCKET** — not proxied; relies on upstream accepting Origin |

## First divergences to fix (priority)

1. **DOCUMENT / ROUTE** — `/markets/overview/*` proxies upstream SPA (`/markets/*` → upstream `/live-sports/*`). Designed AURUM UI at `/live-sports/overview/*`.
2. **ASSET** — Static allowlist (`board.css`, `i18n-client.js`, …) must register before catch-all proxy.
3. **WEBSOCKET** — Optional same-origin WS proxy at `/socket/` (implemented in server upgrade handler) for environments that block cross-origin WS.

## Known cross-origin behavior (not bugs)

- SPA JS calls `https://bs-iframedev1.thesportslab.eu/*` directly — works when BS sends `Access-Control-Allow-Origin: *`.
- Account APIs on `iframedev1` may use cookies on upstream host; third-party cookie policies can limit logged-in flows on proxy origin without same-origin API proxy.

## Commands

```bash
node scripts/proxy-diff.mjs
PROXY_DEBUG=true node server.js
```

## Phase gate

- [ ] B1 document = upstream SPA HTML (not custom `index.html`)
- [ ] All `/assets/*` return correct Content-Type and size ≈ A
- [ ] BS API reachable (direct or `/api/bs`)
- [ ] WS connects (Network → WS tab)
- [ ] Playwright smoke tests pass
- [ ] Then begin Phase B UI work on `/markets` only
