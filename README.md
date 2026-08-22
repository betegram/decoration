# AURUM Markets

Sports market discovery UI powered by thesportslab APIs. Event trading opens in an
embedded desk (proxied sportsbook on the same origin).

## Run (Docker only — no Node/npm on the host)

**Requirements on the server:** Docker and Docker Compose only.

```bash
cp .env.example .env   # set MONGODB_URI, ADMIN_PASSWORD, PORT, etc.
./run.sh
```

`./run.sh` runs `docker compose up --build`. All npm dependencies (`mongodb`, `ws`, …) are installed **inside the image** during `docker build`, not on the host.

Equivalent:

```bash
docker compose up --build
```

- **Public site (designed UI):** `http://localhost:${PORT}/live-sports/overview/1`  
- **Proxied upstream SPA:** `http://localhost:${PORT}/markets/overview/1`
- **Admin panel:** `http://localhost:${PORT}/admin`  
  Default login: `admin` / `aurum2026` (set via `.env`)

See **[How it works](HOW_IT_WORKS.md)** for architecture and data flow.  
AI agents: see **[AGENTS.md](AGENTS.md)** and `.cursor/rules/`.

### Production deploy (ui.kycland.xyz)

```bash
git pull
docker compose up --build -d
```

Match nginx upstream port to `PORT` in `.env` (see [`nginx/README.md`](nginx/README.md)).

| Variable | Description |
| --- | --- |
| `PORT` | Listen port (default `8080`) |
| `HOST` | Bind address (default `0.0.0.0`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB` | Database name (default `aurum_markets`) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin panel login |
| `UPSTREAM` / `BS_UPSTREAM` | Sportsbook API hosts (optional) |
| `OPENAI_API_KEY` | Enables AI translation in Admin → Languages |
| `OPENAI_MODEL` | OpenAI model (default `gpt-4o-mini`) |
| `PROXY_DEBUG` | `true` — structured proxy request/response logs (secrets redacted) |

### Proxy parity (Phase A)

See `.cursor/skills/proxy-parity-engineering/SKILL.md` and `docs/PROXY_PARITY_AUDIT.md`.

- **Designed UI** at `/live-sports/overview/*` — AURUM markets page (themes, i18n).
- **Proxy reference** at `/markets/overview/*` — upstream sportsbook SPA (`/markets/*` → upstream `/live-sports/*`).

```bash
node scripts/proxy-diff.mjs          # optional smoke compare (needs Node on your machine)
PROXY_DEBUG=true docker compose up --build
```

### Multilingual

- **Admin → Languages:** default locale, enabled languages, manual edits, **AI translate missing** (OpenAI).
- **Public site** (`/live-sports/overview/1`): language switcher in header; strings from MongoDB/config.
- **Cookie:** `aurum_lang`; query `?lang=tr` also works.
- Proxied upstream SPA at `/markets/overview/1` uses upstream UI language.

### Nginx (ui.kycland.xyz)

See [`nginx/README.md`](nginx/README.md). Proxies the domain to `127.0.0.1:${PORT}`.

## Admin

The ERP-style admin panel lets you change branding, **12 predefined design themes**,
layout presets, colors (color pickers), typography (dropdowns), spacing, and event-desk theme. Click **Apply changes** to publish;
users see updates immediately on the shared URL.

## Structure

| File | Role |
| --- | --- |
| `index.html` | Markets UI shell |
| `markets.js` | Feed, filters, ticket, live socket |
| `styles.css` | Markets UI styles |
| `lib/store.js` | MongoDB / file persistence |
| `admin/` | ERP-style customization panel |
| `lib/config.js` | Config load/save + theme CSS generator |
| `server.js` | Server, admin API, theme routes, proxy |
| `board.css` | Base overrides for proxied event desk |
