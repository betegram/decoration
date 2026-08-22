---
name: proxy-parity-engineering
description: >-
  White-hat reverse-proxy parity workflow for sportsbook iframe apps. Use when
  debugging proxy failures, comparing original vs proxied behavior, WebSocket
  issues, cookie/session problems, URL rewriting, or before any Phase B UI redesign.
disable-model-invocation: true
---

# Proxy Parity Engineering (Phase A before Phase B)

## Operating boundary (white-hat)

Use security-engineering knowledge for observation, protocol analysis, debugging, compatibility engineering, and authorized traffic inspection.

Do NOT: bypass authentication, bypass authorization, evade WAF/security controls, steal sessions, defeat anti-bot controls, exploit vulnerabilities, or weaken third-party security protections.

If architecture requires bypassing an upstream security boundary, STOP and report the limitation.

## Mandatory phases

**PHASE A — COMPATIBILITY**: Proxied app ≈ original functionally. No visual redesign.

**PHASE B — TRANSFORMATION**: Polymarket-inspired UI only after Phase A passes regression tests.

Never mix proxy debugging with UI/CSS/DOM transformation in the same change.

## Primary methodology: differential debugging

Run the same workflow twice:

- **A** = Original (`UPSTREAM`, e.g. `iframedev1.thesportslab.eu`)
- **B** = Proxy (`ui.kycland.xyz` or local)

Record both sessions chronologically. Find the **first meaningful divergence**. Fix only that layer. Repeat.

Example stop point:

```
A4 /api/events 200
B4 /api/events 401  → investigate B4 only
```

## Investigation skills (apply in order)

1. **Black-box mapping** — Document: HTML → JS/CSS → API → cookies → WebSocket → dynamic imports. Classify app type (SPA/SSR/iframe/WS-driven).
2. **Network forensics** — Capture URL, method, status, headers, cookies, Content-Type, redirects for A vs B.
3. **DevTools** — Network, Console, Application (cookies/storage), WS tab, Security, Frames.
4. **HTTP proxy engineering** — Host, Origin, Referer, forwarded headers, compression, caching, redirects.
5. **Cookie/session** — Map Set-Cookie lifecycle; translate Domain/Path/SameSite only where needed; never expose HttpOnly to JS.
6. **URL rewriting** — Classify: navigation, static asset, API, WebSocket, CDN, auth, iframe. No blind global domain replace in HTML.
7. **JS runtime** — API base URLs may be built at runtime; inspect bundles/env config.
8. **WebSocket** — Upgrade handshake, Origin, cookies, reconnect; proxy must support Upgrade, not treat as HTTP.
9. **SSE/streaming** — Do not buffer streams the app expects incrementally.
10. **CSP/CORS** — Document compatibility; do not globally disable security.
11. **Service workers** — Check registration scope on proxy origin.
12. **Frames/postMessage** — Map origins; do not replace origin checks with `*`.

## Failure classification

Tag every failure before fixing: NETWORK | DNS | TLS | HTTP | REDIRECT | COOKIE | AUTH | CORS | CSP | ORIGIN | ASSET | JAVASCRIPT | WEBSOCKET | SSE | SERVICE_WORKER | IFRAME | POSTMESSAGE | REWRITE | UI_TRANSFORMATION

## Project tools

- `scripts/proxy-diff.mjs` — HTTP differential smoke compare
- `docs/PROXY_PARITY_AUDIT.md` — living divergence log
- `PROXY_DEBUG=true` — structured proxy logging (redacts secrets)

## Regression tests (Playwright)

After each fix, verify: page load, sports, live events, filters, event desk, odds update, bet slip, navigation, WS connected, no critical console errors, no unexpected 4xx/5xx.

## This codebase map

| Path | Upstream | Notes |
|------|----------|-------|
| `/api/bs/*` | `BS_UPSTREAM` | REST sports data |
| `/api/flag/*` | `UPSTREAM` | Flag assets |
| `/api/i18n.json` | local | i18n for designed `/live-sports/overview` UI |
| `/assets/*`, `/live-sports/*` (except overview) | `UPSTREAM` | SPA routes + assets |
| `/markets/*` | `UPSTREAM` (`/live-sports/*`) | Proxied upstream SPA |
| `/live-sports/overview/*` | local | Designed AURUM markets UI |

`/live-sports/overview/*` returns custom `index.html`. `/markets/overview/*` proxies upstream SPA.
