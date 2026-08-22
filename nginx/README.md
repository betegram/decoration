# Nginx — ui.kycland.xyz

Proxies **http://ui.kycland.xyz** → **127.0.0.1:8080** (same as `PORT` in `.env`). Add TLS after deployment (e.g. certbot).

## Prerequisites

1. App running on the server (`docker compose up` or `./run.sh`)
2. DNS **A record** for `ui.kycland.xyz` → your server IP
3. Nginx installed (`sudo apt install nginx`)

## Install

```bash
sudo cp nginx/ui.kycland.xyz.conf /etc/nginx/sites-available/ui.kycland.xyz
sudo ln -sf /etc/nginx/sites-available/ui.kycland.xyz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Different port

If `PORT` in `.env` is not `8080`, edit the upstream in `ui.kycland.xyz.conf`:

```nginx
upstream aurum_markets {
    server 127.0.0.1:YOUR_PORT;
}
```

## Docker on same host

With `docker compose up`, port `8080` is published to the host — `127.0.0.1:8080` is correct for nginx on the same machine.
