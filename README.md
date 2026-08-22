# AURUM Markets

Sports market discovery UI powered by thesportslab APIs. Event trading opens in an
embedded desk (proxied sportsbook on the same origin).

## Run

```bash
./run.sh
```

- **Public site:** http://localhost:8080/live-sports/overview/1  
  (same path as the original URL — only the base host differs)
- **Admin panel:** http://localhost:8080/admin  
  Default login: `admin` / `aurum2026` (set via `.env` or `admin-auth.json`)

See **[How it works](HOW_IT_WORKS.md)** for architecture and data flow.

### Docker

```bash
cp .env.example .env   # set MONGODB_URI and secrets
docker compose up --build
```

When `MONGODB_URI` is set, site config and admin credentials are stored in MongoDB.

| Variable | Description |
| --- | --- |
| `PORT` | Listen port (default `8080`) |
| `HOST` | Bind address (default `0.0.0.0`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB` | Database name (default `aurum_markets`) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin panel login |
| `UPSTREAM` / `BS_UPSTREAM` | Sportsbook API hosts (optional) |
| `OVERVIEW_SHELL` | `proxy` (original SPA at `/live-sports/overview/*`) or `custom` (AURUM UI) |
| `OPENAI_API_KEY` | Enables AI translation in Admin → Languages |
| `OPENAI_MODEL` | OpenAI model (default `gpt-4o-mini`) |

### Multilingual

- **Admin → Languages:** default locale, enabled languages, manual edits, **AI translate missing** (OpenAI).
- **Public site** (`/markets/overview/1`): language switcher in header; strings from MongoDB/config.
- **Cookie:** `aurum_lang`; query `?lang=tr` also works.
- Proxied overview SPA (`OVERVIEW_SHELL=proxy`) uses upstream UI language — use `/markets` for full i18n.

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
