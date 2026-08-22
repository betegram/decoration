/* AURUM Markets — discovery product powered by sportsbook data engine */

const API = "/api/bs";
const FLAG = "/api/flag";
const WS_URL = "https://bs-iframedev1.thesportslab.eu";
const WS_PATH = "/socket/";

const state = {
  sports: [],
  sportId: 1,
  fixtures: [],
  featuredComps: [],
  overview: null, // liveSportOverview payload
  filter: "all", // all | live | upcoming | competition id
  search: "",
  ticket: [], // {fixtureId, uuid, label, price, eventLabel, selection}
  stake: 10,
  loading: true,
  feedLabel: "markets",
};

const el = {
  sportNav: document.getElementById("sportNav"),
  filterRail: document.getElementById("filterRail"),
  featuredTrack: document.getElementById("featuredTrack"),
  featuredSub: document.getElementById("featuredSub"),
  groups: document.getElementById("groups"),
  skeletons: document.getElementById("skeletons"),
  empty: document.getElementById("empty"),
  feedTitle: document.getElementById("feedTitle"),
  feedSub: document.getElementById("feedSub"),
  liveCount: document.getElementById("liveCount"),
  searchInput: document.getElementById("searchInput"),
  ticket: document.getElementById("ticket"),
  ticketBody: document.getElementById("ticketBody"),
  ticketCount: document.getElementById("ticketCount"),
  fabCount: document.getElementById("fabCount"),
  fabTicket: document.getElementById("fabTicket"),
  stakeInput: document.getElementById("stakeInput"),
  potentialReturn: document.getElementById("potentialReturn"),
  openTrade: document.getElementById("openTrade"),
  desk: document.getElementById("desk"),
  deskFrame: document.getElementById("deskFrame"),
  deskTitle: document.getElementById("deskTitle"),
  brandName: document.getElementById("brandName"),
  brandTag: document.getElementById("brandTag"),
  featuredTitle: document.getElementById("featuredTitle"),
};

const offset = (() => {
  const m = -new Date().getTimezoneOffset();
  const sign = m >= 0 ? "+" : "-";
  const abs = Math.abs(m);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
})();

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}

async function api(path) {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: "application/json", "utc-offset": offset },
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

function flagUrl(path) {
  if (!path) return "";
  if (/^https?:/i.test(path)) return path;
  return FLAG + path;
}

function fmtTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function isEsports(fx) {
  const blob = `${fx.region_name || ""} ${fx.competition_name || ""} ${(fx.participants || []).join(" ")}`.toLowerCase();
  return /esport|e-?soccer|cyber|virtual/.test(blob);
}

function scoreOf(fx) {
  const s = fx.statistics || {};
  return [Number(s.p1_score ?? 0), Number(s.p2_score ?? 0)];
}

function crest(url, name) {
  if (url) return `<img class="crest" src="${esc(url)}" alt="" loading="lazy" />`;
  return `<span class="crest-ph">${esc(initials(name))}</span>`;
}

/** Pull 1X2-style outcomes from overview socket fixture if present */
function marketsFromOverview(fixtureId) {
  const ov = state.overview;
  if (!ov || typeof ov !== "object") return null;
  const fx = ov[fixtureId] || ov[String(fixtureId)];
  if (!fx) return null;

  // Common shapes: overview_markets.match_result / markets / odds arrays
  const bag =
    fx.overview_markets ||
    fx.markets ||
    fx.odds ||
    fx.primary_markets ||
    null;

  if (!bag) {
    // Sometimes odds hang directly as array of selections
    if (Array.isArray(fx.selections)) return normalizeSelections(fx.selections, fx);
    return null;
  }

  // Prefer match_result / 1x2
  const preferred = ["match_result", "1x2", "winner", "match-winner", "three_way"];
  let market = null;
  if (typeof bag === "object" && !Array.isArray(bag)) {
    for (const key of preferred) {
      if (bag[key]) {
        market = bag[key];
        break;
      }
    }
    if (!market) market = Object.values(bag)[0];
  } else if (Array.isArray(bag)) {
    market = bag.find((m) => /match|1x2|winner/i.test(m?.slug || m?.name || "")) || bag[0];
  }

  if (!market) return null;
  const odds = market.odds || market.selections || market.outcomes || market;
  if (Array.isArray(odds)) return normalizeSelections(odds, fx);
  if (typeof odds === "object") {
    return normalizeSelections(Object.values(odds), fx);
  }
  return null;
}

function normalizeSelections(list, fx) {
  return list
    .filter(Boolean)
    .slice(0, 3)
    .map((o, idx) => {
      const price = Number(o.price ?? o.odds ?? o.value ?? o.decimal);
      const label =
        o.name_overview ||
        o.name ||
        o.header_name ||
        o.label ||
        ["1", "X", "2"][idx] ||
        "—";
      return {
        uuid: o.uuid || o.odd_uuid || o.id || `${fx?.id || "x"}-${idx}`,
        label: String(label),
        price: Number.isFinite(price) ? price : null,
        status: o.status || "active",
        raw: o,
      };
    });
}

/** Fallback synthetic labels when live odds not yet streamed */
function placeholderMarkets(fx) {
  const [home, away] = fx.participants || ["Home", "Away"];
  const three = fx.sport_id === 1 || /soccer|football/i.test(fx.sport_name || "");
  const labels = three ? [home.split(" ")[0] || "1", "Draw", away.split(" ")[0] || "2"] : [home.split(" ")[0] || "1", away.split(" ")[0] || "2"];
  return labels.map((label, idx) => ({
    uuid: `pending-${fx.id}-${idx}`,
    label,
    price: null,
    status: "pending",
  }));
}

function filteredFixtures() {
  let list = state.fixtures.slice();

  if (state.filter === "live") list = list.filter((f) => f.live);
  else if (state.filter === "upcoming") list = list.filter((f) => !f.live);
  else if (state.filter !== "all") list = list.filter((f) => String(f.competition_id) === String(state.filter));

  const q = state.search.trim().toLowerCase();
  if (q) {
    list = list.filter((f) => {
      const blob = `${(f.participants || []).join(" ")} ${f.competition_name || ""} ${f.region_name || ""}`.toLowerCase();
      return blob.includes(q);
    });
  }

  list.sort((a, b) => {
    if (a.live !== b.live) return a.live ? -1 : 1;
    const ae = isEsports(a) ? 1 : 0;
    const be = isEsports(b) ? 1 : 0;
    if (ae !== be) return ae - be;
    return (b.competition_weight || 0) - (a.competition_weight || 0);
  });
  return list;
}

function groupFixtures(list) {
  const map = new Map();
  for (const fx of list) {
    const key = `${fx.region_name || ""} · ${fx.competition_name || "Other"}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        region: fx.region_name || "",
        competition: fx.competition_name || "Other",
        flag: fx.region_icon_url || "",
        weight: fx.competition_weight || 0,
        items: [],
      });
    }
    map.get(key).items.push(fx);
  }
  return [...map.values()].sort((a, b) => b.weight - a.weight);
}

function renderSports() {
  el.sportNav.innerHTML = state.sports
    .slice()
    .sort((a, b) => Number(b.fixtures_count || 0) - Number(a.fixtures_count || 0))
    .slice(0, 14)
    .map((s) => {
      const on = Number(s.id) === Number(state.sportId);
      return `<button type="button" class="${on ? "is-active" : ""}" data-sport="${esc(s.id)}">${esc(s.name)}</button>`;
    })
    .join("");
}

function renderFilters() {
  const comps = state.featuredComps.slice(0, 10);
  const chips = [
    { id: "all", label: "All" },
    { id: "live", label: "Live now" },
    { id: "upcoming", label: "Upcoming" },
    ...comps.map((c) => ({ id: String(c.id), label: c.name })),
  ];
  el.filterRail.innerHTML = chips
    .map((c) => {
      const on = String(state.filter) === String(c.id);
      return `<button type="button" class="chip ${on ? "is-active" : ""}" data-filter="${esc(c.id)}">${esc(c.label)}</button>`;
    })
    .join("");
}

function cardHTML(fx) {
  const [home, away] = fx.participants || ["Home", "Away"];
  const logos = fx.participant_logos || {};
  const [h, a] = scoreOf(fx);
  const live = !!fx.live;
  const showScore = live || h > 0 || a > 0;
  let mkts = marketsFromOverview(fx.id);
  if (!mkts || !mkts.length) mkts = placeholderMarkets(fx);
  const clock = live ? fx.time || fx.statistics?.half || fx.status || "LIVE" : fmtTime(fx.start_datetime);

  const mktHtml = mkts
    .map((m) => {
      const disabled = m.status === "suspended" || m.price == null;
      const selected = state.ticket.some((t) => t.uuid === m.uuid);
      const price = m.price != null ? m.price.toFixed(2) : "—";
      return `<button type="button" class="mkt-btn ${selected ? "is-on" : ""}" data-pick="${esc(fx.id)}" data-uuid="${esc(m.uuid)}" data-label="${esc(m.label)}" data-price="${m.price ?? ""}" data-event="${esc(`${home} vs ${away}`)}" ${disabled ? "disabled" : ""}>
        <span>${esc(m.label)}</span><strong>${esc(price)}</strong>
      </button>`;
    })
    .join("");

  return `<article class="card" data-fx="${esc(fx.id)}">
    <div class="card-top">
      <div class="left">
        ${fx.region_icon_url ? `<img src="${esc(flagUrl(fx.region_icon_url))}" alt="" />` : ""}
        <span>${esc(fx.competition_name || "")}</span>
      </div>
      <div>${live ? `<span class="pill-live"><i></i>${esc(clock)}</span>` : `<span>${esc(clock)}</span>`}</div>
    </div>
    <div class="teams">
      <div class="team">${crest(logos.home, home)}<strong>${esc(home)}</strong><b>${showScore ? h : ""}</b></div>
      <div class="team">${crest(logos.away, away)}<strong>${esc(away)}</strong><b>${showScore ? a : ""}</b></div>
    </div>
    <div class="markets">${mktHtml}</div>
    <div class="card-foot">
      <span class="status-line">${esc(fx.status || (live ? "In play" : "Scheduled"))}</span>
      <button type="button" class="more-btn" data-desk="${esc(fx.id)}" data-title="${esc(`${home} vs ${away}`)}">Full markets →</button>
    </div>
  </article>`;
}

function renderFeed() {
  const list = filteredFixtures();
  const liveN = state.fixtures.filter((f) => f.live).length;
  el.liveCount.textContent = String(liveN);

  const sport = state.sports.find((s) => Number(s.id) === Number(state.sportId));
  el.feedTitle.textContent = sport ? `${sport.name} ${state.feedLabel}` : state.feedLabel.charAt(0).toUpperCase() + state.feedLabel.slice(1);
  el.feedSub.textContent = `${list.length} events · ${liveN} live`;

  // Featured: live non-esports first
  const featured = state.fixtures
    .filter((f) => f.live && !isEsports(f))
    .concat(state.fixtures.filter((f) => f.live && isEsports(f)))
    .slice(0, 8);
  el.featuredSub.textContent = featured.length ? `${featured.length} in play` : "Waiting for kickoff";
  el.featuredTrack.innerHTML = featured.length
    ? featured.map(cardHTML).join("")
    : `<div class="card"><p class="ticket-empty">No live events in this sport right now.</p></div>`;

  if (state.loading) {
    el.skeletons.hidden = false;
    el.skeletons.innerHTML = `<div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div>`;
    el.groups.innerHTML = "";
    el.empty.hidden = true;
    return;
  }
  el.skeletons.hidden = true;

  if (!list.length) {
    el.groups.innerHTML = "";
    el.empty.hidden = false;
    return;
  }
  el.empty.hidden = true;

  const groups = groupFixtures(list.slice(0, 80));
  el.groups.innerHTML = groups
    .map((g) => {
      const flag = flagUrl(g.flag);
      return `<section>
        <div class="group-head">${flag ? `<img src="${esc(flag)}" alt="" />` : ""}<h3>${esc(g.key)}</h3></div>
        <div class="cards">${g.items.slice(0, 12).map(cardHTML).join("")}</div>
      </section>`;
    })
    .join("");
}

function renderTicket() {
  el.ticketCount.textContent = String(state.ticket.length);
  el.fabCount.textContent = String(state.ticket.length);
  if (!state.ticket.length) {
    el.ticketBody.innerHTML = `<p class="ticket-empty">Select a market outcome to build your ticket.</p>`;
    el.openTrade.disabled = true;
    el.potentialReturn.textContent = "—";
    return;
  }
  el.ticketBody.innerHTML = state.ticket
    .map(
      (t, i) => `<div class="pick">
      <div class="meta">${esc(t.eventLabel)}</div>
      <div class="row"><div class="sel">${esc(t.label)}</div><button type="button" data-remove="${i}" aria-label="Remove">✕</button></div>
      <div class="meta">@ ${t.price != null ? Number(t.price).toFixed(2) : "—"}</div>
    </div>`
    )
    .join("");
  el.openTrade.disabled = false;
  const combo = state.ticket.reduce((acc, t) => acc * (Number(t.price) || 1), 1);
  const ret = combo * (Number(state.stake) || 0);
  el.potentialReturn.textContent = ret ? ret.toFixed(2) : "—";
}

function addPick({ fixtureId, uuid, label, price, eventLabel }) {
  if (!uuid || String(uuid).startsWith("pending-")) {
    openDesk(fixtureId, eventLabel);
    return;
  }
  // Replace same fixture pick
  state.ticket = state.ticket.filter((t) => String(t.fixtureId) !== String(fixtureId));
  state.ticket.push({
    fixtureId,
    uuid,
    label,
    price: price === "" || price == null ? null : Number(price),
    eventLabel,
  });
  renderTicket();
  renderFeed();
}

function openDesk(fixtureId, title) {
  el.deskTitle.textContent = title || "Event desk";
  el.deskFrame.src = `/live-sports/event-view/${fixtureId}`;
  el.desk.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeDesk() {
  el.desk.hidden = true;
  el.deskFrame.src = "about:blank";
  document.body.style.overflow = "";
}

async function loadSport(sportId) {
  state.sportId = Number(sportId);
  state.filter = "all";
  state.loading = true;
  state.overview = null;
  renderSports();
  renderFilters();
  renderFeed();

  try {
    const [fixtures, featured] = await Promise.all([
      api(`/fixtures/${state.sportId}/daterange/0`),
      api(`/sport/${state.sportId}/competitions/featured`).catch(() => []),
    ]);
    state.fixtures = Array.isArray(fixtures) ? fixtures : [];
    state.featuredComps = Array.isArray(featured) ? featured : [];
    state.loading = false;
    renderFilters();
    renderFeed();
    joinOverviewSocket(state.sportId);
  } catch (err) {
    console.error(err);
    state.loading = false;
    state.fixtures = [];
    renderFeed();
  }
}

/* —— Live overview via socket.io (same engine as original board) —— */
let socket = null;
let joinedSport = null;

function joinOverviewSocket(sportId) {
  if (typeof io !== "function") return;
  if (!socket) {
    try {
      socket = io(`${WS_URL}/sb-en`, {
        path: WS_PATH,
        transports: ["websocket"],
        withCredentials: false,
      });
      socket.on("connect", () => {
        if (joinedSport) socket.emit("join-liveSportOverview", joinedSport);
      });
      socket.on("liveSportOverview", (payload) => {
        state.overview = payload;
        renderFeed();
      });
      socket.on("liveSportOverviewUpdate", (payload) => {
        // patch-style or full — try merge
        if (payload && typeof payload === "object") {
          if (!state.overview) state.overview = {};
          if (payload.patch) {
            // unknown patch format — request isn't available; shallow assign if dict
            Object.assign(state.overview, payload.patch);
          } else {
            Object.assign(state.overview, payload);
          }
          renderFeed();
        }
      });
    } catch (err) {
      console.warn("socket unavailable", err);
      return;
    }
  }
  if (joinedSport && joinedSport !== sportId) {
    socket.emit("leave-liveSportOverview", joinedSport);
  }
  joinedSport = sportId;
  if (socket.connected) socket.emit("join-liveSportOverview", sportId);
}

/* —— Events —— */
el.sportNav.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-sport]");
  if (!btn) return;
  loadSport(btn.dataset.sport);
});

el.filterRail.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;
  state.filter = btn.dataset.filter;
  renderFilters();
  renderFeed();
});

el.searchInput.addEventListener("input", () => {
  state.search = el.searchInput.value;
  renderFeed();
});

document.body.addEventListener("click", (e) => {
  const pick = e.target.closest("[data-pick]");
  if (pick) {
    addPick({
      fixtureId: pick.dataset.pick,
      uuid: pick.dataset.uuid,
      label: pick.dataset.label,
      price: pick.dataset.price,
      eventLabel: pick.dataset.event,
    });
    return;
  }
  const desk = e.target.closest("[data-desk]");
  if (desk) {
    openDesk(desk.dataset.desk, desk.dataset.title);
    return;
  }
  const rem = e.target.closest("[data-remove]");
  if (rem) {
    state.ticket.splice(Number(rem.dataset.remove), 1);
    renderTicket();
    renderFeed();
    return;
  }
  if (e.target.closest("[data-close-desk]")) closeDesk();
});

document.getElementById("clearTicket").addEventListener("click", () => {
  state.ticket = [];
  renderTicket();
  renderFeed();
});

el.stakeInput.addEventListener("input", () => {
  state.stake = Number(el.stakeInput.value) || 0;
  renderTicket();
});

el.openTrade.addEventListener("click", () => {
  const last = state.ticket[state.ticket.length - 1];
  if (!last) return;
  openDesk(last.fixtureId, last.eventLabel);
});

document.getElementById("ticketToggle").addEventListener("click", () => {
  el.ticket.classList.toggle("is-open");
});
el.fabTicket.addEventListener("click", () => {
  el.ticket.classList.add("is-open");
});

function sportFromPath() {
  const m = window.location.pathname.match(/\/live-sports\/overview\/(\d+)/);
  return m ? Number(m[1]) : null;
}

function applySiteConfig(cfg) {
  if (!cfg) return;
  document.title = cfg.branding?.pageTitle || document.title;
  if (el.brandName) el.brandName.textContent = cfg.branding?.name || "AURUM";
  if (el.brandTag) el.brandTag.textContent = cfg.branding?.tag || "Markets";
  if (el.searchInput) el.searchInput.placeholder = cfg.branding?.searchPlaceholder || el.searchInput.placeholder;
  if (el.featuredTitle) el.featuredTitle.textContent = cfg.branding?.featuredTitle || "Live now";
  if (el.featuredSub) el.featuredSub.textContent = cfg.branding?.featuredSub || el.featuredSub.textContent;
  state.feedLabel = (cfg.branding?.feedTitle || "Markets").toLowerCase();

  document.body.className = "";
  const themePreset = cfg.theme?.preset || "polymarket";
  document.body.classList.add(`theme-${themePreset}`);
  document.body.classList.add(`layout-${cfg.layout?.preset || "standard"}`);
  document.body.classList.add(`density-${cfg.structure?.density || "normal"}`);
  if (cfg.layout?.showFeatured === false) document.body.classList.add("hide-featured");
  if (cfg.layout?.showTicket === false) document.body.classList.add("hide-ticket");
}

async function boot() {
  el.skeletons.hidden = false;
  el.skeletons.innerHTML = `<div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div>`;
  let startSport = sportFromPath() || 1;
  try {
    const cfg = await fetch("/api/site-config.json").then((r) => r.json());
    applySiteConfig(cfg);
  } catch {
    /* theme.css still applies defaults */
  }
  try {
    const sports = await api("/sports/today");
    state.sports = Array.isArray(sports) ? sports : [];
    const preferred = state.sports.find((s) => Number(s.id) === Number(startSport)) || state.sports[0];
    if (!preferred) throw new Error("No sports");
    await loadSport(preferred.id);
  } catch (err) {
    console.error(err);
    state.loading = false;
    el.groups.innerHTML = "";
    el.empty.hidden = false;
    el.empty.innerHTML = `<h3>Could not load markets</h3><p>${esc(err.message)}. Is the server running?</p>`;
  }
  renderTicket();
}

boot();
setInterval(() => {
  if (document.hidden) return;
  api(`/fixtures/${state.sportId}/daterange/0`)
    .then((fixtures) => {
      if (Array.isArray(fixtures)) {
        state.fixtures = fixtures;
        renderFeed();
      }
    })
    .catch(() => {});
}, 45000);
