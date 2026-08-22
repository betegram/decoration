/**
 * AURUM Markets — server + admin API + config-driven theming
 */
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";
import {
  themeCss,
  boardCss,
  sharedPath,
  LAYOUT_PRESETS,
  FONT_STACKS,
} from "./lib/config.js";
import { THEME_PRESETS } from "./lib/themes.js";
import { initStore, loadSiteConfig, saveSiteConfig, loadAdminAuth, closeStore } from "./lib/store.js";
import {
  LOCALE_META,
  STRING_CATALOG,
  catalogForScope,
  defaultEnglishBundle,
  normalizeSiteConfig,
  publicBundle,
  adminBundle,
  resolveLocale,
  keysForAiTranslate,
} from "./lib/i18n.js";
import { translateWithOpenAI, isOpenAiConfigured } from "./lib/openai.js";
import { buildPublicLinks } from "./lib/links.js";
import {
  computeSourceHash,
  prepareConfigAfterSave,
  scheduleTranslationJob,
  getJobSnapshot,
  runTranslationJob,
  localesNeedingTranslation,
} from "./lib/translation-pipeline.js";
import { proxyLog, PROXY_DEBUG } from "./lib/proxy-debug.js";

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || "0.0.0.0";
const UPSTREAM = process.env.UPSTREAM || "https://iframedev1.thesportslab.eu";
const BS = process.env.BS_UPSTREAM || "https://bs-iframedev1.thesportslab.eu";
const BS_WS_ORIGIN = BS.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
// Primary experience = proxied upstream sportsbook SPA (restyled to the design
// system) at /live-sports/overview/*. The custom designed AURUM UI lives at
// /markets/overview/*.
const DESIGNED_OVERVIEW_RE = /^\/markets\/overview\/\d+\/?$/;
const DESIGNED_OVERVIEW_PATH = "/markets/overview/1";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Version/17.0 Safari/605.1.15";

const HOP_BY_HOP = new Set([
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailers", "transfer-encoding", "upgrade",
  "content-length", "content-encoding", "host", "accept-encoding",
]);

const STRIP_HEADERS = new Set([
  "content-security-policy",
  "content-security-policy-report-only",
  "x-frame-options",
]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const STATIC = {
  "/index.html": "index.html",
  "/markets.js": "markets.js",
  "/styles.css": "styles.css",
  "/board.css": "board.css",
  "/i18n-client.js": "i18n-client.js",
};

const sessions = new Map();
let cachedConfig = null;

async function getConfig() {
  if (!cachedConfig) cachedConfig = await loadSiteConfig();
  return cachedConfig;
}

async function refreshConfig() {
  cachedConfig = await loadSiteConfig();
  return cachedConfig;
}

function boardInjection() {
  return Buffer.from(
    '<link rel="stylesheet" href="/api/board-theme.css" />' +
      '<link rel="stylesheet" href="/board.css" />'
  );
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
    "Access-Control-Allow-Headers": "*",
  };
}

function parseCookie(req) {
  const raw = req.headers.cookie || "";
  const out = {};
  raw.split(";").forEach((part) => {
    const [k, ...v] = part.trim().split("=");
    if (k) out[k] = decodeURIComponent(v.join("="));
  });
  return out;
}

function sessionUser(req) {
  const token = parseCookie(req).aurum_admin;
  const session = token && sessions.get(token);
  return session ? (session.username || session) : null;
}

async function readAuth() {
  return loadAdminAuth();
}

function mapMarketsPath(url) {
  const q = url.indexOf("?");
  const path = q >= 0 ? url.slice(0, q) : url;
  const search = q >= 0 ? url.slice(q) : "";
  if (!path.startsWith("/markets")) {
    return { upstreamUrl: url, rewriteLocation: false };
  }
  const upstreamPath = `/live-sports${path.slice("/markets".length)}`;
  return { upstreamUrl: upstreamPath + search, rewriteLocation: true };
}

function rewriteLocationForMarkets(value) {
  if (!value) return value;
  if (value.startsWith("/live-sports")) {
    return `/markets${value.slice("/live-sports".length)}`;
  }
  try {
    const base = UPSTREAM.endsWith("/") ? UPSTREAM : `${UPSTREAM}/`;
    const upstreamOrigin = new URL(UPSTREAM).origin;
    const u = new URL(value, base);
    if (u.origin === upstreamOrigin && u.pathname.startsWith("/live-sports")) {
      u.pathname = `/markets${u.pathname.slice("/live-sports".length)}`;
      return u.pathname + u.search + u.hash;
    }
  } catch {
    // ignore malformed Location
  }
  return value;
}

function rewriteCookie(value) {
  let v = value.replace(/;\s*Domain=[^;]+/gi, "");
  v = v.replace(/;\s*Secure/gi, "");
  v = v.replace(/;\s*SameSite=None/gi, "; SameSite=Lax");
  return v;
}

function injectHtml(body, contentType) {
  const injection = boardInjection();
  if (!contentType?.toLowerCase().includes("text/html")) return body;
  const lower = body.toString("latin1").toLowerCase();
  const idx = lower.indexOf("</head>");
  if (idx === -1) {
    const bodyIdx = lower.indexOf("<body");
    if (bodyIdx === -1) return Buffer.concat([body, injection]);
    return Buffer.concat([body.subarray(0, bodyIdx), injection, body.subarray(bodyIdx)]);
  }
  return Buffer.concat([body.subarray(0, idx), injection, body.subarray(idx)]);
}

async function fetchUpstream(url, { method = "GET", headers = {}, body = null } = {}) {
  const hdrs = {};
  for (const [k, v] of Object.entries(headers)) {
    if (!HOP_BY_HOP.has(k.toLowerCase())) hdrs[k] = v;
  }
  hdrs["User-Agent"] = hdrs["User-Agent"] || USER_AGENT;
  hdrs["Host"] = new URL(url).host;
  const res = await fetch(url, { method, headers: hdrs, body: body || undefined, redirect: "follow" });
  const buf = Buffer.from(await res.arrayBuffer());
  const outHeaders = {};
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") outHeaders[key] = value;
  });
  if (typeof res.headers.getSetCookie === "function") {
    outHeaders["set-cookie"] = res.headers.getSetCookie();
  } else {
    const single = res.headers.get("set-cookie");
    if (single) outHeaders["set-cookie"] = [single];
  }
  return { status: res.status, headers: outHeaders, body: buf };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function readJson(req) {
  const raw = (await readBody(req)).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function send(res, status, body, contentType, method = "GET", extraHeaders = {}) {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
  const headers = {
    "Content-Type": contentType,
    "Content-Length": buf.length,
    "Cache-Control": "no-store",
    ...extraHeaders,
  };
  if (!extraHeaders["Set-Cookie"]) Object.assign(headers, cors());
  res.writeHead(status, headers);
  if (method !== "HEAD") res.end(buf);
  else res.end();
}

function redirect(res, location) {
  res.writeHead(302, { Location: location, ...cors() });
  res.end();
}

async function serveFile(res, filePath, method = "GET") {
  const body = await readFile(filePath);
  const ext = extname(filePath).toLowerCase();
  send(res, 200, body, MIME[ext] || "application/octet-stream", method);
}

async function serveMarketsShell(res, method) {
  await serveFile(res, join(ROOT, "index.html"), method);
}

async function proxyApi(req, res, base, origin) {
  const raw = req.url.slice(base.length) || "/";
  const suffix = raw.startsWith("/") ? raw : `/${raw}`;
  const target = origin + suffix;
  proxyLog("api→upstream", { method: req.method, base, suffix, target });
  const headers = {
    Accept: "application/json",
    Origin: UPSTREAM,
    Referer: `${UPSTREAM}/`,
    "User-Agent": USER_AGENT,
  };
  if (req.headers["utc-offset"]) headers["utc-offset"] = req.headers["utc-offset"];
  if (origin === UPSTREAM) delete headers.Accept;
  try {
    const { status, headers: rh, body } = await fetchUpstream(target, { headers });
    const ctype = rh["content-type"] || rh["Content-Type"] || "application/json";
    proxyLog("api←upstream", { status, type: ctype, bytes: body.length });
    send(res, status, body, ctype, req.method);
  } catch (err) {
    proxyLog("api-error", { message: err.message });
    send(res, 502, String(err.message), "text/plain", req.method);
  }
}

async function proxyUpstreamApi(req, res) {
  const suffix = req.url.replace(/^\/api\/upstream/, "") || "/";
  const target = UPSTREAM + suffix;
  proxyLog("upstream-api→", { method: req.method, target });
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (!HOP_BY_HOP.has(k.toLowerCase()) && v) headers[k] = v;
  }
  headers["Origin"] = UPSTREAM;
  headers["Referer"] = `${UPSTREAM}/`;
  headers["User-Agent"] = USER_AGENT;
  let payload = null;
  if (req.method !== "GET" && req.method !== "HEAD") payload = await readBody(req);
  try {
    const { status, headers: rh, body } = await fetchUpstream(target, {
      method: req.method,
      headers,
      body: payload,
    });
    const ctype = rh["content-type"] || rh["Content-Type"] || "application/json";
    const outHeaders = {};
    for (const [key, value] of Object.entries(rh)) {
      const lk = key.toLowerCase();
      if (HOP_BY_HOP.has(lk) || STRIP_HEADERS.has(lk)) continue;
      if (lk === "set-cookie" || lk === "content-type") continue;
      outHeaders[key] = value;
    }
    const cookies = rh["set-cookie"];
    if (cookies) {
      const list = Array.isArray(cookies) ? cookies : [cookies];
      outHeaders["Set-Cookie"] = list.map(rewriteCookie);
    }
    if (ctype) outHeaders["Content-Type"] = ctype;
    outHeaders["Content-Length"] = body.length;
    outHeaders["Access-Control-Allow-Origin"] = "*";
    proxyLog("upstream-api←", { status, type: ctype, bytes: body.length });
    res.writeHead(status, outHeaders);
    if (req.method !== "HEAD") res.end(body);
    else res.end();
  } catch (err) {
    proxyLog("upstream-api-error", { message: err.message });
    send(res, 502, String(err.message), "text/plain", req.method);
  }
}

async function proxyBoard(req, res) {
  const mapped = mapMarketsPath(req.url);
  const target = UPSTREAM + mapped.upstreamUrl;
  proxyLog("board→upstream", {
    method: req.method,
    url: req.url,
    upstreamUrl: mapped.upstreamUrl,
    target,
    rewriteLocation: mapped.rewriteLocation,
  });
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (!HOP_BY_HOP.has(k.toLowerCase()) && v) headers[k] = v;
  }
  headers["Origin"] = UPSTREAM;
  headers["Referer"] = `${UPSTREAM}/`;
  let payload = null;
  if (req.method !== "GET" && req.method !== "HEAD") payload = await readBody(req);
  try {
    const { status, headers: rh, body } = await fetchUpstream(target, {
      method: req.method,
      headers,
      body: payload,
    });
    const ctype = rh["content-type"] || rh["Content-Type"] || "";
    const outBody = injectHtml(body, ctype);
    const outHeaders = {};
    for (const [key, value] of Object.entries(rh)) {
      const lk = key.toLowerCase();
      if (HOP_BY_HOP.has(lk) || STRIP_HEADERS.has(lk)) continue;
      if (lk === "set-cookie" || lk === "content-type") continue;
      if (lk === "location" && mapped.rewriteLocation) {
        outHeaders[key] = rewriteLocationForMarkets(value);
        continue;
      }
      outHeaders[key] = value;
    }
    const cookies = rh["set-cookie"];
    if (cookies) {
      const list = Array.isArray(cookies) ? cookies : [cookies];
      outHeaders["Set-Cookie"] = list.map(rewriteCookie);
    }
    if (ctype) outHeaders["Content-Type"] = ctype;
    outHeaders["Content-Length"] = outBody.length;
    outHeaders["Access-Control-Allow-Origin"] = "*";
    proxyLog("board←upstream", { status, type: ctype, bytes: outBody.length, injected: outBody.length !== body.length });
    res.writeHead(status, outHeaders);
    if (req.method !== "HEAD") res.end(outBody);
    else res.end();
  } catch (err) {
    proxyLog("board-error", { message: err.message });
    send(res, 502, `Upstream error: ${err.message}`, "text/plain", req.method);
  }
}

async function handleAdminApi(req, res, pathname, method) {
  if (pathname === "/admin/api/login" && method === "POST") {
    const body = await readJson(req);
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");
    const auth = await readAuth();
    if (username !== String(auth.username).trim() || password !== String(auth.password)) {
      send(res, 401, JSON.stringify({ error: "Invalid username or password" }), "application/json", method);
      return true;
    }
    const token = randomBytes(32).toString("hex");
    sessions.set(token, { username, at: Date.now() });
    send(res, 200, JSON.stringify({ ok: true, user: username }), "application/json", method, {
      "Set-Cookie": `aurum_admin=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
    });
    return true;
  }

  if (pathname === "/admin/api/logout" && method === "POST") {
    const token = parseCookie(req).aurum_admin;
    if (token) sessions.delete(token);
    send(res, 200, JSON.stringify({ ok: true }), "application/json", method, {
      "Set-Cookie": "aurum_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    });
    return true;
  }

  if (pathname === "/admin/api/session" && method === "GET") {
    const user = sessionUser(req);
    send(res, 200, JSON.stringify({ loggedIn: !!user, user: user || null }), "application/json", method);
    return true;
  }

  const user = sessionUser(req);
  if (!user) {
    send(res, 401, JSON.stringify({ error: "Unauthorized" }), "application/json", method);
    return true;
  }

  if (pathname === "/admin/api/config" && method === "GET") {
    const config = await getConfig();
    send(res, 200, JSON.stringify(config), "application/json", method);
    return true;
  }

  if (pathname === "/admin/api/config" && method === "PUT") {
    const patch = await readJson(req);
    const prev = await getConfig();
    const prevHash = computeSourceHash(prev);
    const prepared = prepareConfigAfterSave(patch, prevHash);
    cachedConfig = await saveSiteConfig(prepared);
    const needs = localesNeedingTranslation(cachedConfig);
    if (needs.length && isOpenAiConfigured()) {
      scheduleTranslationJob(cachedConfig, async (cfg) => {
        cachedConfig = await saveSiteConfig(cfg);
        return cachedConfig;
      });
    }
    send(
      res,
      200,
      JSON.stringify({ ...cachedConfig, translationJob: getJobSnapshot() }),
      "application/json",
      method
    );
    return true;
  }

  if (pathname === "/admin/api/translation/status" && method === "GET") {
    const config = await getConfig();
    send(
      res,
      200,
      JSON.stringify({
        job: getJobSnapshot() || config.translationMeta?.job || null,
        locales: config.translationMeta?.locales || {},
        revision: config.translationMeta?.revision || 0,
        sourceHash: config.translationMeta?.sourceHash || "",
        sourceLocale: config.i18n?.defaultLocale,
        openAi: isOpenAiConfigured(),
      }),
      "application/json",
      method
    );
    return true;
  }

  if (pathname === "/admin/api/translation/retry" && method === "POST") {
    const body = await readJson(req);
    const locale = String(body.locale || "").trim();
    if (!locale) {
      send(res, 400, JSON.stringify({ error: "locale required" }), "application/json", method);
      return true;
    }
    if (!isOpenAiConfigured()) {
      send(res, 503, JSON.stringify({ error: "OPENAI_API_KEY not configured" }), "application/json", method);
      return true;
    }
    const config = await getConfig();
    scheduleTranslationJob(config, async (cfg) => {
      cachedConfig = await saveSiteConfig(cfg);
      return cachedConfig;
    }, { locales: [locale] });
    send(res, 200, JSON.stringify({ ok: true, job: getJobSnapshot() }), "application/json", method);
    return true;
  }

  if (pathname === "/admin/api/meta" && method === "GET") {
    const host = req.headers.host || `localhost:${PORT}`;
    const proto = req.headers["x-forwarded-proto"] || "http";
    const adminLocale = resolveLocale(req, await getConfig());
    const siteConfig = await getConfig();
    const links = buildPublicLinks({ proto, host, config: siteConfig });
    send(
      res,
      200,
      JSON.stringify({
        presets: LAYOUT_PRESETS,
        themes: THEME_PRESETS,
        fonts: Object.keys(FONT_STACKS),
        sharedUrl: links.secondary.url,
        proxyReferenceUrl: links.primary.url,
        originalUrl: `${UPSTREAM}${sharedPath(1)}`,
        links,
        upstream: UPSTREAM,
        i18n: {
          locales: LOCALE_META,
          catalog: catalogForScope("site"),
          adminCatalog: catalogForScope("admin"),
          openAi: isOpenAiConfigured(),
          defaultLocale: siteConfig.i18n?.defaultLocale,
          glossary: siteConfig.i18n?.glossary,
        },
        translation: {
          meta: siteConfig.translationMeta || {},
          job: getJobSnapshot() || siteConfig.translationMeta?.job || null,
        },
        adminI18n: adminBundle(siteConfig, adminLocale),
      }),
      "application/json",
      method
    );
    return true;
  }

  if (pathname === "/admin/api/i18n/translate" && method === "POST") {
    const body = await readJson(req);
    const targetLocale = String(body.locale || "").trim();
    const scope = String(body.scope || "all");
    if (!targetLocale) {
      send(res, 400, JSON.stringify({ error: "locale required" }), "application/json", method);
      return true;
    }
    if (!isOpenAiConfigured()) {
      send(res, 503, JSON.stringify({ error: "OPENAI_API_KEY not configured" }), "application/json", method);
      return true;
    }
    const config = await getConfig();
    const items = keysForAiTranslate(config, targetLocale, scope);
    if (!Object.keys(items).length) {
      send(res, 200, JSON.stringify({ ok: true, translated: 0, patch: {} }), "application/json", method);
      return true;
    }
    try {
      const meta = LOCALE_META[targetLocale];
      const translated = await translateWithOpenAI({
        sourceLocale: config.i18n.defaultLocale,
        targetLocale,
        targetLabel: meta?.label || targetLocale,
        items,
      });
      send(
        res,
        200,
        JSON.stringify({ ok: true, translated: Object.keys(translated).length, patch: translated }),
        "application/json",
        method
      );
    } catch (err) {
      send(res, 502, JSON.stringify({ error: err.message }), "application/json", method);
      return true;
    }
    return true;
  }

  return false;
}

function attachSocketProxy(httpServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (req, socket, head) => {
    const url = req.url || "";
    if (!url.startsWith("/socket/")) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (client) => {
      const target = `${BS_WS_ORIGIN}${url}`;
      proxyLog("ws→upstream", { url, target });
      const upstream = new WebSocket(target, {
        headers: {
          Origin: BS,
          "User-Agent": USER_AGENT,
        },
      });

      const closeBoth = () => {
        try {
          if (client.readyState !== WebSocket.CLOSED) client.close();
        } catch {
          /* ignore */
        }
        try {
          if (upstream.readyState !== WebSocket.CLOSED) upstream.close();
        } catch {
          /* ignore */
        }
      };

      upstream.on("open", () => {
        proxyLog("ws←upstream", { status: "open", url });
      });
      client.on("message", (data, isBinary) => {
        if (upstream.readyState === WebSocket.OPEN) upstream.send(data, { binary: isBinary });
      });
      upstream.on("message", (data, isBinary) => {
        if (client.readyState === WebSocket.OPEN) client.send(data, { binary: isBinary });
      });
      client.on("close", () => upstream.close());
      upstream.on("close", () => client.close());
      client.on("error", (err) => {
        proxyLog("ws-client-error", { message: err.message });
        closeBoth();
      });
      upstream.on("error", (err) => {
        proxyLog("ws-upstream-error", { message: err.message });
        closeBoth();
      });
    });
  });
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors());
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method;

  if (pathname.startsWith("/admin/api/")) {
    await handleAdminApi(req, res, pathname, method);
    return;
  }

  if (pathname === "/api/site-config.json" && method === "GET") {
    const config = await getConfig();
    send(res, 200, JSON.stringify(config), "application/json", method);
    return;
  }

  if (pathname === "/api/runtime-config.json" && method === "GET") {
    const host = req.headers.host || `localhost:${PORT}`;
    const proto = req.headers["x-forwarded-proto"] || "http";
    send(
      res,
      200,
      JSON.stringify({
        apiBase: "/api/bs",
        flagBase: "/api/flag",
        wsUrl: `${proto}://${host}`,
        wsPath: "/socket/",
        designedPath: DESIGNED_OVERVIEW_PATH,
        proxyPath: sharedPath(1),
        upstream: UPSTREAM,
        bsUpstream: BS,
      }),
      "application/json",
      method
    );
    return;
  }

  if (pathname === "/api/i18n.json" && method === "GET") {
    const config = await getConfig();
    const locale = resolveLocale(req, config);
    const bundle = publicBundle(config, locale);
    send(res, 200, JSON.stringify(bundle), "application/json", method);
    return;
  }

  if (pathname === "/api/theme.css" && method === "GET") {
    const config = await getConfig();
    send(res, 200, themeCss(config), "text/css", method);
    return;
  }

  if (pathname === "/api/board-theme.css" && method === "GET") {
    const config = await getConfig();
    send(res, 200, boardCss(config), "text/css", method);
    return;
  }

  if (pathname.startsWith("/admin")) {
    const adminPath = pathname === "/admin" || pathname === "/admin/"
      ? "index.html"
      : pathname.slice("/admin/".length);
    if (adminPath.includes("..")) {
      send(res, 404, "Not found", "text/plain", method);
      return;
    }
    const file = join(ROOT, "admin", adminPath);
    if (!file.startsWith(join(ROOT, "admin")) || !existsSync(file)) {
      send(res, 404, "Not found", "text/plain", method);
      return;
    }
    await serveFile(res, file, method);
    return;
  }

  if (pathname.startsWith("/api/bs")) {
    await proxyApi(req, res, "/api/bs", BS);
    return;
  }
  if (pathname.startsWith("/api/flag")) {
    await proxyApi(req, res, "/api/flag", UPSTREAM);
    return;
  }
  if (pathname.startsWith("/api/upstream")) {
    await proxyUpstreamApi(req, res);
    return;
  }

  if (method === "GET" || method === "HEAD") {
    if (STATIC[pathname]) {
      await serveFile(res, join(ROOT, STATIC[pathname]), method);
      return;
    }
    if (pathname === "/") {
      redirect(res, sharedPath(1));
      return;
    }
    if (DESIGNED_OVERVIEW_RE.test(pathname)) {
      await serveMarketsShell(res, method);
      return;
    }
    if (
      pathname === "/markets" ||
      pathname === "/markets/" ||
      pathname === "/markets/overview" ||
      pathname === "/markets/overview/"
    ) {
      redirect(res, DESIGNED_OVERVIEW_PATH);
      return;
    }
  }

  if (["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"].includes(method)) {
    await proxyBoard(req, res);
    return;
  }

  res.writeHead(405, cors());
  res.end();
});

async function start() {
  await initStore(ROOT);
  attachSocketProxy(server);
  server.listen(PORT, HOST, async () => {
    await refreshConfig();
    console.log(`Primary (SPA)  → http://localhost:${PORT}${sharedPath(1)}`);
    console.log(`Designed UI    → http://localhost:${PORT}${DESIGNED_OVERVIEW_PATH}`);
    if (PROXY_DEBUG) console.log("Proxy debug logging enabled (PROXY_DEBUG=true)");
    console.log(`Admin panel    → http://localhost:${PORT}/admin`);
    console.log(`Original path  → ${UPSTREAM}${sharedPath(1)}`);
  });
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});

function shutdown() {
  console.log("\nShutting down…");
  server.close(async () => {
    await closeStore();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
