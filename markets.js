/* AURUM Markets — discovery product powered by sportsbook data engine */

function tr(key, vars) {
  return window.AurumI18n?.t(key, vars) ?? key;
}

let API = "/api/bs";
let FLAG = "/api/flag";
let WS_URL = "https://bs-iframedev1.thesportslab.eu";
let WS_PATH = "/socket/";

const DATE_RANGES = [
  { id: 0, labelKey: "site.date_today" },
  { id: 1, labelKey: "site.date_tomorrow" },
  { id: 2, labelKey: "site.date_plus2" },
  { id: 7, labelKey: "site.date_week" },
];

const state = {
  sports: [],
  sportId: 1,
  dateRange: 0,
  fixtures: [],
  featuredComps: [],
  overview: null,
  overviewMarkets: {},
  liveSports: null,
  filter: "all",
  search: "",
  ticket: [],
  stake: 10,
  loading: true,
  feedLabel: "markets",
  favourites: new Set(),
  collapsedGroups: new Set(),
};

const el = {
  sportNav: document.getElementById("sportNav"),
  dateRail: document.getElementById("dateRail"),
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
  ticketBackdrop: document.getElementById("ticketBackdrop"),
  ticketClose: document.getElementById("ticketClose"),
  ticketToggle: document.getElementById("ticketToggle"),
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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Accept: "application/json", "utc-offset": offset },
      signal: controller.signal,
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`${path} → ${res.status}${text ? `: ${text.slice(0, 120)}` : ""}`);
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`${path} → invalid JSON (${text.slice(0, 120)}…)`);
    }
  } finally {
    clearTimeout(timer);
  }
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

function loadFavourites() {
  try {
    const raw = localStorage.getItem("aurum_favourites");
    const ids = JSON.parse(raw || "[]");
    state.favourites = new Set(ids.map(String));
  } catch {
    state.favourites = new Set();
  }
}

function saveFavourites() {
  localStorage.setItem("aurum_favourites", JSON.stringify([...state.favourites]));
}

function wsLocale() {
  return (window.AurumI18n?.getLocale?.() || "en").split("-")[0].toLowerCase() || "en";
}

function sportMarketDefs(sportId) {
  const defs = state.overviewMarkets?.[sportId] || state.overviewMarkets?.[String(sportId)];
  return Array.isArray(defs) ? defs : [];
}

function sportMarketDef(sportId, slug) {
  return sportMarketDefs(sportId).find((d) => d.slug === slug);
}

function sportOverviewMarkets(sportId) {
  const types = ["simple", "totals", "totals_new", "handicap", "handicap_new"];
  return sportMarketDefs(sportId).filter((d) => types.includes(d.market_type));
}

function primaryMarketSlugs(sportId) {
  return sportOverviewMarkets(sportId).slice(0, 2).map((d) => d.slug);
}

function mergeFixtureFromOverview(fx) {
  if (!fx?.id) return;
  if (fx.sport_id != null && Number(fx.sport_id) !== Number(state.sportId)) return;
  const idx = state.fixtures.findIndex((f) => String(f.id) === String(fx.id));
  if (idx >= 0) {
    state.fixtures[idx] = { ...state.fixtures[idx], ...fx };
  } else if (fx.live) {
    state.fixtures.push(fx);
  }
}

function applyJsonPatch(root, patches) {
  if (!Array.isArray(patches)) return;
  for (const patch of patches) {
    const { op, path, value } = patch;
    if (!path) continue;
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 1) {
      if (op === "add" || op === "replace") {
        root[parts[0]] = value;
        if (value?.id) mergeFixtureFromOverview(value);
      } else if (op === "remove") {
        delete root[parts[0]];
      }
      continue;
    }
    let parent = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (parent[key] == null || typeof parent[key] !== "object") parent[key] = {};
      parent = parent[key];
    }
    const leaf = parts[parts.length - 1];
    if (op === "add" || op === "replace") parent[leaf] = value;
    else if (op === "remove") delete parent[leaf];
    const fx = root[parts[0]];
    if (fx?.id) mergeFixtureFromOverview(fx);
  }
}

function applyOverviewPayload(payload) {
  if (!payload) return;
  if (Array.isArray(payload)) {
    if (!state.overview) state.overview = {};
    applyJsonPatch(state.overview, payload);
  } else if (typeof payload === "object") {
    state.overview = payload;
    for (const fx of Object.values(payload)) {
      if (fx && typeof fx === "object" && fx.id) mergeFixtureFromOverview(fx);
    }
  }
  if (state.dateRange === 0) state.loading = false;
}

function fixtureOverview(fx) {
  const ov = state.overview?.[fx.id] || state.overview?.[String(fx.id)];
  return {
    ...fx,
    ...(ov || {}),
    overview_markets: ov?.overview_markets || fx.overview_markets,
  };
}

function selectionsFromMarket(marketObj, fx, def) {
  if (!marketObj) return [];
  let list;
  if (Array.isArray(marketObj)) list = marketObj;
  else if (typeof marketObj === "object") {
    list = Object.values(marketObj).sort((a, b) => Number(a?.col ?? 0) - Number(b?.col ?? 0));
  } else return [];
  return normalizeSelections(list, fx, def);
}

function marketsForFixture(fx, slug) {
  const merged = fixtureOverview(fx);
  const bag = merged.overview_markets;
  if (!bag || !slug || !bag[slug]) return null;
  const def = sportMarketDef(fx.sport_id, slug);
  return selectionsFromMarket(bag[slug], merged, def);
}

/** Pull overview odds for a fixture (primary market slug from sport config) */
function overviewFixturesArray() {
  if (!state.overview || typeof state.overview !== "object") return [];
  return Object.values(state.overview)
    .filter((fx) => fx && fx.id && Number(fx.sport_id) === Number(state.sportId))
    .map((fx) => fixtureOverview(fx));
}

function activeFixtures() {
  if (state.dateRange === 0) return overviewFixturesArray();
  return state.fixtures;
}

function competitionsFromFixtures(list) {
  const map = new Map();
  for (const fx of list) {
    if (!fx?.competition_id) continue;
    const id = String(fx.competition_id);
    if (!map.has(id)) {
      map.set(id, { id: fx.competition_id, name: fx.competition_name || id });
    }
  }
  return [...map.values()].sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

function marketsFromOverview(fixtureId, slug) {
  const fx =
    activeFixtures().find((f) => String(f.id) === String(fixtureId)) ||
    state.fixtures.find((f) => String(f.id) === String(fixtureId));
  if (!fx) return null;
  const slugs = primaryMarketSlugs(fx.sport_id);
  const marketSlug = slug || slugs[0] || sportOverviewMarkets(fx.sport_id)[0]?.slug;
  if (!marketSlug) return null;
  return marketsForFixture(fx, marketSlug);
}

function normalizeSelections(list, fx, def) {
  const oddNames = def?.odd_names;
  return list
    .filter(Boolean)
    .slice(0, 3)
    .map((o, idx) => {
      const price = Number(o.price ?? o.odds ?? o.value ?? o.decimal);
      let label =
        o.name_short ||
        o.name_overview ||
        o.name ||
        o.header_name ||
        o.label ||
        oddNames?.[idx] ||
        ["1", "X", "2"][idx] ||
        "";
      const status = o.status || "available";
      return {
        uuid: o.uuid || o.odd_uuid || o.id || `${fx?.id || "x"}-${idx}`,
        label: String(label).trim(),
        price: Number.isFinite(price) ? price : null,
        status,
        raw: o,
      };
    })
    .filter((o) => o.label);
}

/** Fallback synthetic labels when live odds not yet streamed */
function placeholderMarkets(fx, slug) {
  const def = slug ? sportMarketDef(fx.sport_id, slug) : sportOverviewMarkets(fx.sport_id)[0];
  const oddNames = def?.odd_names?.filter((n) => n && String(n).trim()) || [];
  if (oddNames.length) {
    return oddNames.map((label, idx) => ({
      uuid: `pending-${fx.id}-${slug || "m"}-${idx}`,
      label: String(label),
      price: null,
      status: "pending",
    }));
  }
  const [home, away] = fx.participants || [tr("site.home"), tr("site.away")];
  const three = def?.three_way === true;
  const labels = three
    ? [home.split(" ")[0] || "1", tr("site.draw"), away.split(" ")[0] || "2"]
    : [home.split(" ")[0] || "1", away.split(" ")[0] || "2"];
  return labels.map((label, idx) => ({
    uuid: `pending-${fx.id}-${idx}`,
    label,
    price: null,
    status: "pending",
  }));
}

function filteredFixtures() {
  let list = activeFixtures().slice();

  if (state.filter === "live") list = list.filter((f) => f.live);
  else if (state.filter === "upcoming") list = list.filter((f) => !f.live);
  else if (state.filter === "favourites") list = list.filter((f) => state.favourites.has(String(f.id)));
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
  const liveList = state.liveSports && typeof state.liveSports === "object"
    ? Object.values(state.liveSports).filter((s) => s && s.id && Number(s.fixtures_count || 0) > 0)
    : [];
  const source = liveList.length ? liveList : state.sports;
  el.sportNav.innerHTML = source
    .slice()
    .sort((a, b) => Number(b.fixtures_count || 0) - Number(a.fixtures_count || 0))
    .map((s) => {
      const on = Number(s.id) === Number(state.sportId);
      const count = Number(s.fixtures_count || 0);
      const label = count > 0 && liveList.length ? `${s.name} (${count})` : s.name;
      return `<button type="button" class="${on ? "is-active" : ""}" data-sport="${esc(s.id)}">${esc(label)}</button>`;
    })
    .join("");
}

function renderDateRail() {
  if (!el.dateRail) return;
  el.dateRail.innerHTML = DATE_RANGES.map((d) => {
    const on = Number(state.dateRange) === Number(d.id);
    return `<button type="button" class="${on ? "is-active" : ""}" data-date="${esc(d.id)}">${esc(tr(d.labelKey))}</button>`;
  }).join("");
}

function renderFilters() {
  const fixtureComps = competitionsFromFixtures(activeFixtures());
  const comps = (fixtureComps.length ? fixtureComps : state.featuredComps).slice(0, 12);
  const chips = [
    { id: "all", label: tr("site.filter_all") },
    { id: "live", label: tr("site.filter_live") },
    { id: "upcoming", label: tr("site.filter_upcoming") },
    { id: "favourites", label: tr("site.filter_favourites") },
    ...comps.map((c) => ({ id: String(c.id), label: c.name })),
  ];
  el.filterRail.innerHTML = chips
    .map((c) => {
      const on = String(state.filter) === String(c.id);
      return `<button type="button" class="chip ${on ? "is-active" : ""}" data-filter="${esc(c.id)}">${esc(c.label)}</button>`;
    })
    .join("");
}

function marketsGridClass(count) {
  return count <= 2 ? "markets markets-2up" : "markets";
}

function marketsButtonsHTML(fx, mkts) {
  return `<div class="${marketsGridClass(mkts.length)}">${mkts.map((m) => pickBtnHTML(fx, m)).join("")}</div>`;
}

function pickBtnHTML(fx, m) {
  const disabled =
    m.status === "suspended" ||
    m.status === "unavailable" ||
    m.status === "closed" ||
    m.price == null;
  const selected = state.ticket.some((t) => t.uuid === m.uuid);
  const price = m.price != null ? m.price.toFixed(2) : "—";
  const [home, away] = fx.participants || [tr("site.home"), tr("site.away")];
  return `<button type="button" class="mkt-btn ${selected ? "is-on" : ""}" data-pick="${esc(fx.id)}" data-uuid="${esc(m.uuid)}" data-label="${esc(m.label)}" data-price="${m.price ?? ""}" data-event="${esc(`${home} vs ${away}`)}" ${disabled ? "disabled" : ""}>
    <span>${esc(m.label)}</span><strong>${esc(price)}</strong>
  </button>`;
}

function marketRowsHTML(fx) {
  const slugs = primaryMarketSlugs(fx.sport_id);
  const rows = slugs
    .map((slug) => {
      const def = sportMarketDef(fx.sport_id, slug);
      const mkts = marketsForFixture(fx, slug);
      if (!mkts?.length) return "";
      return `<div class="market-row">
        <div class="market-row-label">${esc(def?.name || slug)}</div>
        ${marketsButtonsHTML(fx, mkts)}
      </div>`;
    })
    .filter(Boolean);
  if (rows.length) return `<div class="market-rows">${rows.join("")}</div>`;
  const primarySlug = slugs[0] || sportOverviewMarkets(fx.sport_id)[0]?.slug;
  let mkts = primarySlug ? marketsForFixture(fx, primarySlug) : null;
  if (!mkts?.length) mkts = marketsFromOverview(fx.id, primarySlug);
  if (!mkts?.length) mkts = placeholderMarkets(fx, primarySlug);
  return marketsButtonsHTML(fx, mkts);
}

function cardHTML(fx) {
  const [home, away] = fx.participants || [tr("site.home"), tr("site.away")];
  const logos = fx.participant_logos || {};
  const [h, a] = scoreOf(fx);
  const live = !!fx.live;
  const showScore = live || h > 0 || a > 0;
  const clock = live ? fx.time || fx.statistics?.half || fx.status || tr("site.live_badge") : fmtTime(fx.start_datetime);
  const isFav = state.favourites.has(String(fx.id));

  return `<article class="card" data-fx="${esc(fx.id)}">
    <div class="card-top">
      <div class="left">
        ${fx.region_icon_url ? `<img src="${esc(flagUrl(fx.region_icon_url))}" alt="" />` : ""}
        <span>${esc(fx.competition_name || "")}</span>
      </div>
      <div class="card-top-actions">
        <button type="button" class="fav-btn ${isFav ? "is-on" : ""}" data-fav="${esc(fx.id)}" aria-label="${esc(isFav ? tr("site.fav_remove_aria") : tr("site.fav_add_aria"))}">★</button>
        ${live ? `<span class="pill-live"><i></i>${esc(clock)}</span>` : `<span>${esc(clock)}</span>`}
      </div>
    </div>
    <div class="teams">
      <div class="team">${crest(logos.home, home)}<strong>${esc(home)}</strong><b>${showScore ? h : ""}</b></div>
      <div class="team">${crest(logos.away, away)}<strong>${esc(away)}</strong><b>${showScore ? a : ""}</b></div>
    </div>
    ${marketRowsHTML(fx)}
    <div class="card-foot">
      <span class="status-line">${esc(fx.status || (live ? tr("site.in_play") : tr("site.scheduled")))}</span>
      <button type="button" class="more-btn" data-desk="${esc(fx.id)}" data-title="${esc(`${home} vs ${away}`)}">${esc(tr("site.full_markets"))}</button>
    </div>
  </article>`;
}

function showLoadError(title, detail) {
  state.loading = false;
  el.skeletons.hidden = true;
  el.groups.innerHTML = "";
  el.empty.hidden = false;
  el.empty.innerHTML = `<h3>${esc(title)}</h3><p>${esc(detail)}</p>`;
}

function renderFeed() {
  try {
    renderFeedInner();
  } catch (err) {
    console.error("renderFeed", err);
    showLoadError(tr("site.error_render_markets"), err.message || "Unknown render error");
  }
}

function renderFeedInner() {
  const list = filteredFixtures();
  const fixturePool = activeFixtures();
  const liveN = fixturePool.filter((f) => f.live).length;
  el.liveCount.textContent = String(liveN);

  const sport =
    (state.liveSports && Object.values(state.liveSports).find((s) => Number(s.id) === Number(state.sportId))) ||
    state.sports.find((s) => Number(s.id) === Number(state.sportId));
  el.feedTitle.textContent = sport ? `${sport.name} ${state.feedLabel}` : state.feedLabel.charAt(0).toUpperCase() + state.feedLabel.slice(1);
  el.feedSub.textContent = tr("site.events_live_count", { count: list.length, live: liveN });

  if (state.loading) {
    el.featuredTrack.innerHTML = "";
    el.skeletons.hidden = false;
    el.skeletons.innerHTML = `<div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div>`;
    el.groups.innerHTML = "";
    el.empty.hidden = true;
    return;
  }

  // Featured: live non-esports first
  const featured = fixturePool
    .filter((f) => f.live && !isEsports(f))
    .concat(fixturePool.filter((f) => f.live && isEsports(f)))
    .slice(0, 8);
  el.featuredSub.textContent = featured.length
    ? tr("site.featured_in_play", { count: featured.length })
    : tr("site.waiting_kickoff");
  el.featuredTrack.innerHTML = featured.length
    ? featured.map(cardHTML).join("")
    : `<div class="card"><p class="ticket-empty">${esc(tr("site.no_live_events"))}</p></div>`;

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
      const collapsed = state.collapsedGroups.has(g.key);
      return `<section class="group-section ${collapsed ? "is-collapsed" : ""}">
        <button type="button" class="group-head" data-collapse="${esc(g.key)}">
          ${flag ? `<img src="${esc(flag)}" alt="" />` : ""}
          <h3>${esc(g.key)}</h3>
          <span class="chev" aria-hidden="true">▼</span>
        </button>
        <div class="cards">${g.items.slice(0, 12).map(cardHTML).join("")}</div>
      </section>`;
    })
    .join("");
}

function renderTicket() {
  el.ticketCount.textContent = String(state.ticket.length);
  el.fabCount.textContent = String(state.ticket.length);
  if (!state.ticket.length) {
    el.ticketBody.innerHTML = `<p class="ticket-empty">${esc(tr("site.ticket_empty"))}</p>`;
    el.openTrade.disabled = true;
    el.potentialReturn.textContent = "—";
    return;
  }
  el.ticketBody.innerHTML = state.ticket
    .map(
      (t, i) => `<div class="pick">
      <div class="meta">${esc(t.eventLabel)}</div>
      <div class="row"><div class="sel">${esc(t.label)}</div><button type="button" data-remove="${i}" aria-label="${esc(tr("site.remove_pick_aria"))}">✕</button></div>
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
  el.deskTitle.textContent = title || tr("site.event_desk_title");
  el.deskFrame.src = `/live-sports/event-view/${fixtureId}`;
  el.desk.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeDesk() {
  el.desk.hidden = true;
  el.deskFrame.src = "about:blank";
  document.body.style.overflow = "";
}

function navigateSport(sportId) {
  const path = `/live-sports/overview/${sportId}`;
  if (window.location.pathname !== path) {
    const url = new URL(window.location.href);
    url.pathname = path;
    history.replaceState(null, "", url.toString());
  }
}

async function loadOverviewMarkets() {
  try {
    const data = await api("/sports/overview_markets");
    state.overviewMarkets = data && typeof data === "object" ? data : {};
  } catch (err) {
    console.warn("overview_markets", err);
    state.overviewMarkets = {};
  }
}

function applyLiveSportsPayload(payload) {
  if (!payload) return;
  if (Array.isArray(payload)) {
    state.liveSports = {};
    for (const s of payload) {
      if (s?.id) state.liveSports[s.id] = s;
    }
  } else if (payload?.patch && Array.isArray(payload.patch)) {
    if (!state.liveSports) state.liveSports = {};
    applyJsonPatch(state.liveSports, payload.patch);
  } else if (typeof payload === "object") {
    state.liveSports = payload;
  }
  renderSports();
}

async function loadSport(sportId) {
  state.sportId = Number(sportId);
  state.filter = "all";
  state.loading = true;
  state.overview = null;
  navigateSport(state.sportId);
  renderSports();
  renderDateRail();
  renderFilters();
  renderFeed();

  try {
    const [fixtures, featured] = await Promise.all([
      api(`/fixtures/${state.sportId}/daterange/${state.dateRange}`),
      api(`/sport/${state.sportId}/competitions/featured`).catch(() => []),
    ]);
    state.fixtures = Array.isArray(fixtures) ? fixtures : [];
    state.featuredComps = Array.isArray(featured) ? featured : [];
    if (state.dateRange !== 0) state.loading = false;
    renderFilters();
    renderFeed();
    joinOverviewSocket(state.sportId);
    if (state.dateRange === 0) {
      setTimeout(() => {
        if (state.loading) {
          state.loading = false;
          renderFeed();
        }
      }, 8000);
    }
  } catch (err) {
    console.error(err);
    state.loading = false;
    state.fixtures = [];
    showLoadError(tr("site.error_load_fixtures"), err.message || "API request failed");
  }
}

async function reloadFixtures() {
  try {
    const fixtures = await api(`/fixtures/${state.sportId}/daterange/${state.dateRange}`);
    if (Array.isArray(fixtures)) {
      state.fixtures = fixtures;
      renderFeed();
    }
  } catch {
    /* silent poll */
  }
}

/* —— Live overview via socket.io (same engine as original board) —— */
let socket = null;
let joinedSport = null;
let socketLocale = null;
let liveSportsJoined = false;

function ensureSocket() {
  if (typeof io !== "function") return null;
  const locale = wsLocale();
  if (socket && socketLocale === locale) return socket;
  if (socket) {
    socket.disconnect();
    socket = null;
    joinedSport = null;
    liveSportsJoined = false;
  }
  socketLocale = locale;
  try {
    socket = io(`${WS_URL}/sb-${locale}`, {
      path: WS_PATH,
      transports: ["websocket"],
      withCredentials: false,
    });
    socket.on("connect", () => {
      if (!liveSportsJoined) {
        socket.emit("join-liveSports");
        liveSportsJoined = true;
      }
      if (joinedSport) socket.emit("join-liveSportOverview", joinedSport);
    });
    socket.on("liveSports", (payload) => {
      applyLiveSportsPayload(payload);
    });
    socket.on("liveSportsUpdate", (payload) => {
      applyLiveSportsPayload(payload);
    });
    socket.on("liveSportOverview", (payload) => {
      applyOverviewPayload(payload);
      renderFeed();
    });
    socket.on("liveSportOverviewUpdate", (payload) => {
      applyOverviewPayload(payload);
      renderFeed();
    });
    socket.on("connect_error", (err) => {
      console.warn("socket connect_error", err.message);
    });
  } catch (err) {
    console.warn("socket unavailable", err);
    socket = null;
  }
  return socket;
}

function joinOverviewSocket(sportId) {
  const s = ensureSocket();
  if (!s) return;
  if (joinedSport && joinedSport !== sportId) {
    s.emit("leave-liveSportOverview", joinedSport);
  }
  joinedSport = sportId;
  if (s.connected) s.emit("join-liveSportOverview", sportId);
}

/* —— Events —— */
el.sportNav.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-sport]");
  if (!btn) return;
  loadSport(btn.dataset.sport);
});

if (el.dateRail) {
  el.dateRail.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-date]");
    if (!btn) return;
    state.dateRange = Number(btn.dataset.date);
    state.loading = true;
    if (state.dateRange !== 0) state.overview = null;
    renderDateRail();
    renderFeed();
    reloadFixtures().finally(() => {
      if (state.dateRange !== 0) {
        state.loading = false;
        renderFeed();
      } else {
        state.overview = null;
        joinOverviewSocket(state.sportId);
      }
    });
  });
}

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
  const fav = e.target.closest("[data-fav]");
  if (fav) {
    const id = String(fav.dataset.fav);
    if (state.favourites.has(id)) state.favourites.delete(id);
    else state.favourites.add(id);
    saveFavourites();
    renderFeed();
    return;
  }
  const collapse = e.target.closest("[data-collapse]");
  if (collapse) {
    const key = collapse.dataset.collapse;
    if (state.collapsedGroups.has(key)) state.collapsedGroups.delete(key);
    else state.collapsedGroups.add(key);
    renderFeed();
    return;
  }
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

function isMobileTicket() {
  return window.matchMedia("(max-width: 1100px)").matches;
}

function syncChromeMetrics() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;
  const height = topbar.getBoundingClientRect().height;
  document.documentElement.style.setProperty("--topbar-height", `${Math.ceil(height)}px`);
  document.documentElement.style.setProperty("--filter-sticky-top", `${Math.ceil(height)}px`);
  document.documentElement.style.setProperty("--ticket-sticky-top", `${Math.ceil(height) + 12}px`);
}

function scheduleChromeMetrics() {
  requestAnimationFrame(() => syncChromeMetrics());
}

function setTicketOpen(open) {
  el.ticket.classList.toggle("is-open", open);
  document.body.classList.toggle("is-ticket-open", open && isMobileTicket());
  if (el.ticketToggle) el.ticketToggle.setAttribute("aria-expanded", String(open));
}

el.stakeInput.addEventListener("input", () => {
  state.stake = Number(el.stakeInput.value) || 0;
  renderTicket();
});

el.openTrade.addEventListener("click", () => {
  const last = state.ticket[state.ticket.length - 1];
  if (!last) return;
  openDesk(last.fixtureId, last.eventLabel);
});

el.ticketToggle.addEventListener("click", () => {
  setTicketOpen(!el.ticket.classList.contains("is-open"));
});
el.fabTicket.addEventListener("click", () => setTicketOpen(true));
if (el.ticketBackdrop) el.ticketBackdrop.addEventListener("click", () => setTicketOpen(false));
if (el.ticketClose) el.ticketClose.addEventListener("click", () => setTicketOpen(false));
window.matchMedia("(max-width: 1100px)").addEventListener("change", (e) => {
  if (!e.matches) setTicketOpen(false);
});

function sportFromPath() {
  const m =
    window.location.pathname.match(/\/live-sports\/overview\/(\d+)/) ||
    window.location.pathname.match(/\/markets\/overview\/(\d+)/);
  return m ? Number(m[1]) : null;
}

async function loadRuntimeConfig() {
  try {
    const cfg = await fetch("/api/runtime-config.json").then((r) => r.json());
    if (cfg.apiBase) API = cfg.apiBase;
    if (cfg.flagBase) FLAG = cfg.flagBase;
    if (cfg.wsUrl) WS_URL = cfg.wsUrl.replace(/\/$/, "");
    if (cfg.wsPath) WS_PATH = cfg.wsPath;
  } catch {
    /* defaults */
  }
}

function applySiteConfig(cfg) {
  if (!cfg) return;
  document.title = tr("site.page_title");
  if (el.brandName) el.brandName.textContent = tr("site.brand_name");
  if (el.brandTag) el.brandTag.textContent = tr("site.brand_tag");
  state.feedLabel = tr("site.markets_label");

  document.body.className = "";
  const themePreset = cfg.theme?.preset || "polymarket";
  document.body.classList.add(`theme-${themePreset}`);
  document.body.classList.add(`layout-${cfg.layout?.preset || "standard"}`);
  document.body.classList.add(`density-${cfg.structure?.density || "normal"}`);
  if (cfg.layout?.showFeatured === false) document.body.classList.add("hide-featured");
  if (cfg.layout?.showTicket === false) {
    document.body.classList.add("hide-ticket");
    setTicketOpen(false);
  }
  scheduleChromeMetrics();
}

async function boot() {
  loadFavourites();
  el.skeletons.hidden = false;
  el.skeletons.innerHTML = `<div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div>`;
  let startSport = sportFromPath() || 1;
  await loadRuntimeConfig();
  ensureSocket();
  try {
    await window.AurumI18n.initI18n();
    window.AurumI18n.applyDomI18n();
    window.AurumI18n.renderLangSwitcher(document.getElementById("langSwitcher"));
  } catch (err) {
    console.warn("i18n init", err);
  }
  renderDateRail();
  try {
    const cfg = await fetch("/api/site-config.json").then((r) => r.json());
    applySiteConfig(cfg);
    window.AurumI18n?.applyDomI18n();
  } catch {
    /* theme.css still applies defaults */
  }
  try {
    await loadOverviewMarkets();
    const sports = await api("/sports/today");
    state.sports = Array.isArray(sports) ? sports : [];
    const preferred = state.sports.find((s) => Number(s.id) === Number(startSport)) || state.sports[0];
    if (!preferred) throw new Error("No sports returned from API");
    renderSports();
    await loadSport(preferred.id);
  } catch (err) {
    console.error(err);
    showLoadError(tr("site.error_load_markets"), err.message || "API request failed");
  }
  renderTicket();
  scheduleChromeMetrics();
  window.addEventListener("resize", scheduleChromeMetrics);
}

boot();
setInterval(() => {
  if (document.hidden) return;
  reloadFixtures();
}, 45000);
