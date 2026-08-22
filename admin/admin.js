import { renderLinksPanel, bindCopyButtons } from "./components/links.js";

const loginView = document.getElementById("loginView");
const appView = document.getElementById("appView");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const panel = document.getElementById("panel");
const sectionTitle = document.getElementById("sectionTitle");
const sectionDesc = document.getElementById("sectionDesc");
const previewFrame = document.getElementById("previewFrame");
const previewLinks = document.getElementById("previewLinks");
const toast = document.getElementById("toast");
const sidebar = document.getElementById("sidebar");
const drawerBackdrop = document.getElementById("drawerBackdrop");

let config = null;
let meta = null;
let section = "themes";

const SECTIONS = {
  themes: {
    title: "Design themes",
    desc: "12 famous design systems — pick one and apply",
    themes: true,
  },
  general: {
    title: "General",
    desc: "Branding, titles, and page identity",
    fields: [
      { group: "Branding", items: [
        { key: "branding.pageTitle", label: "Browser title", type: "text" },
        { key: "branding.name", label: "Brand name", type: "text" },
        { key: "branding.tag", label: "Brand tag", type: "text" },
        { key: "branding.searchPlaceholder", label: "Search placeholder", type: "text", full: true },
      ]},
      { group: "Section copy", items: [
        { key: "branding.featuredTitle", label: "Featured title", type: "text" },
        { key: "branding.featuredSub", label: "Featured subtitle", type: "text" },
        { key: "branding.feedTitle", label: "Feed title", type: "text" },
      ]},
    ],
  },
  layout: {
    title: "Layout",
    desc: "Predefined layouts and page structure",
    presets: true,
    fields: [
      { group: "Dimensions", items: [
        { key: "layout.maxWidth", label: "Max content width (px)", type: "select", options: ["960", "1200", "1400", "1680", "1920"] },
        { key: "layout.ticketWidth", label: "Ticket panel width (px)", type: "select", options: ["280", "320", "360", "400"] },
        { key: "layout.cardColumns", label: "Card columns", type: "select", options: ["1", "2", "3"] },
        { key: "layout.showFeatured", label: "Show featured strip", type: "select", options: [{ v: true, l: "Yes" }, { v: false, l: "No" }] },
        { key: "layout.showTicket", label: "Show ticket sidebar", type: "select", options: [{ v: true, l: "Yes" }, { v: false, l: "No" }] },
      ]},
    ],
  },
  colors: {
    title: "Colors",
    desc: "Palette for backgrounds, accents, and text",
    fields: [
      { group: "Canvas", items: [
        { key: "colors.background", label: "Background", type: "color" },
        { key: "colors.backgroundSecondary", label: "Background secondary", type: "color" },
        { key: "colors.panel", label: "Panel", type: "color" },
        { key: "colors.panelOpacity", label: "Panel opacity %", type: "select", options: ["70", "75", "82", "88", "95"] },
      ]},
      { group: "Accent & status", items: [
        { key: "colors.accent", label: "Accent", type: "color" },
        { key: "colors.accentBright", label: "Accent bright", type: "color" },
        { key: "colors.live", label: "Live indicator", type: "color" },
        { key: "colors.success", label: "Success / up", type: "color" },
      ]},
      { group: "Text & borders", items: [
        { key: "colors.text", label: "Primary text", type: "color" },
        { key: "colors.textMuted", label: "Muted text", type: "color" },
        { key: "colors.textFaint", label: "Faint text", type: "color" },
        { key: "colors.border", label: "Border", type: "color" },
        { key: "colors.borderStrong", label: "Border strong", type: "color" },
        { key: "colors.glowBlue", label: "Blue glow", type: "color" },
        { key: "colors.glowPurple", label: "Purple glow", type: "color" },
      ]},
    ],
  },
  typography: {
    title: "Typography",
    desc: "Fonts and text sizing",
    fields: [
      { group: "Font settings", items: [
        { key: "typography.fontFamily", label: "Font family", type: "select", optionsFrom: "fonts" },
        { key: "typography.baseSize", label: "Base font size (px)", type: "select", options: ["13", "14", "15", "16", "17", "18"] },
        { key: "typography.headingSize", label: "Heading size (px)", type: "select", options: ["15", "16", "17", "18", "20", "22"] },
        { key: "typography.labelSize", label: "Label size (px)", type: "select", options: ["10", "11", "12", "13", "14"] },
        { key: "typography.weight", label: "Font weight", type: "select", options: ["500", "600", "650", "700"] },
      ]},
    ],
  },
  structure: {
    title: "Structure",
    desc: "Spacing, radius, and density",
    fields: [
      { group: "Shape & spacing", items: [
        { key: "structure.radius", label: "Corner radius (px)", type: "select", options: ["8", "12", "16", "20", "24"] },
        { key: "structure.radiusLg", label: "Large radius (px)", type: "select", options: ["16", "20", "22", "28", "32"] },
        { key: "structure.density", label: "Density", type: "select", options: ["compact", "normal", "spacious"] },
        { key: "structure.headerBlur", label: "Header blur (px)", type: "select", options: ["12", "16", "22", "28"] },
        { key: "structure.cardGap", label: "Card gap (px)", type: "select", options: ["8", "12", "16", "20"] },
        { key: "structure.sectionGap", label: "Section gap (px)", type: "select", options: ["16", "20", "24", "32", "40"] },
      ]},
    ],
  },
  board: {
    title: "Event desk",
    desc: "Theme for the proxied trading board (iframe)",
    fields: [
      { group: "Board theme", items: [
        { key: "board.background", label: "Background", type: "color" },
        { key: "board.accent", label: "Accent", type: "color" },
        { key: "board.text", label: "Text", type: "color" },
      ]},
    ],
  },
  share: {
    title: "Publish",
    desc: "Public URLs and translation status",
    shareOnly: true,
  },
  languages: {
    title: "Languages",
    desc: "Source language, auto-translation, and glossary",
    languagesOnly: true,
  },
};

let langEditLocale = "en";
let translationPollTimer = null;

function renderPreviewLinks() {
  if (!previewLinks || !meta?.links) return;
  previewLinks.innerHTML = renderLinksPanel(meta.links);
  bindCopyButtons(previewLinks);
  previewLinks.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => showToast("Copied to clipboard"));
  });
}

function statusLabel(status) {
  const map = {
    source: "Source",
    pending: "Pending",
    generating: "Generating",
    generated: "Auto translated",
    published: "Published",
    outdated: "Outdated",
    failed: "Failed",
  };
  return map[status] || status || "—";
}

async function pollTranslationStatus() {
  try {
    const st = await api("/admin/api/translation/status");
    meta.translation = { meta: { locales: st.locales }, job: st.job };
    if (st.job?.running) {
      if (section === "languages" || section === "share") renderPanel();
      translationPollTimer = setTimeout(pollTranslationStatus, 2000);
    } else {
      clearTimeout(translationPollTimer);
      if (section === "languages") renderPanel();
      renderPreviewLinks();
    }
  } catch {
    clearTimeout(translationPollTimer);
  }
}

function startTranslationPoll() {
  clearTimeout(translationPollTimer);
  pollTranslationStatus();
}

function get(obj, path) {
  return path.split(".").reduce((a, k) => (a == null ? undefined : a[k]), obj);
}

function set(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]] || typeof cur[keys[i]] !== "object") cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  const last = keys[keys.length - 1];
  if (value === "true") cur[last] = true;
  else if (value === "false") cur[last] = false;
  else if (/^\d+$/.test(String(value)) && typeof get(obj, path) !== "string") cur[last] = Number(value);
  else cur[last] = value;
}

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.hidden = true; }, 2600);
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    credentials: "same-origin",
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `${path} → ${res.status}`);
  }
  return res.json();
}

function renderPanel() {
  const def = SECTIONS[section];
  sectionTitle.textContent = def.title;
  sectionDesc.textContent = def.desc;
  panel.innerHTML = "";

  if (def.languagesOnly) {
    renderLanguagesPanel();
    return;
  }

  if (def.themes && meta?.themes) {
    const wrap = document.createElement("div");
    wrap.className = "field-card full";
    wrap.innerHTML = "<h3>Predefined design systems</h3><p class='hint'>Each theme applies a full design system: surfaces, blur, shadows, typography, radii, and component chrome — not only colors. Click <strong>Apply changes</strong> to publish.</p><div class='theme-grid' id='themeGrid'></div>";
    panel.appendChild(wrap);
    const grid = wrap.querySelector("#themeGrid");
    const active = config.theme?.preset || "polymarket";
    Object.entries(meta.themes).forEach(([id, t]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `theme-card${active === id ? " is-active" : ""}`;
      const bg = t.config?.colors?.background || "#07080c";
      const accent = t.config?.colors?.accent || "#0a84ff";
      const panel = t.config?.colors?.panel || "#10121a";
      btn.innerHTML = `<div class="theme-preview" style="background:linear-gradient(145deg,${bg} 0%,${panel} 55%,${accent}33 100%)"></div><span class="theme-concept">${t.concept}</span><strong>${t.label}</strong><span>${t.desc}</span>`;
      btn.onclick = () => {
        const preset = meta.themes[id];
        if (preset?.config) {
          for (const [sec, vals] of Object.entries(preset.config)) {
            if (typeof vals === "object" && !Array.isArray(vals)) {
              config[sec] = { ...(config[sec] || {}), ...vals };
            } else {
              config[sec] = vals;
            }
          }
        }
        renderPanel();
        showToast(`Theme "${t.label}" loaded — click Apply to publish`);
      };
      grid.appendChild(btn);
    });
    return;
  }

  if (def.shareOnly) {
    const job = meta?.translation?.job;
    const jobHtml = job?.running
      ? `<div class="job-banner">Generating ${job.pending?.length || 0} translation(s)…</div>`
      : "";
    panel.innerHTML = `
      ${jobHtml}
      <div class="field-card full">${renderLinksPanel(meta?.links)}</div>
      <div class="field-card full">
        <h3>Workflow</h3>
        <p class="hint">Edit source content in <strong>General</strong> (English/source language). Click <strong>Save & publish</strong>. The system auto-translates enabled languages in the background.</p>
        <p class="hint muted">Original upstream: ${escHtml(meta?.originalUrl || "")}</p>
      </div>`;
    bindCopyButtons(panel);
    panel.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", () => showToast("Copied to clipboard"));
    });
    return;
  }

  if (def.presets && meta?.presets) {
    const wrap = document.createElement("div");
    wrap.className = "field-card full";
    wrap.innerHTML = "<h3>Layout presets</h3><div class='preset-grid' id='presetGrid'></div>";
    panel.appendChild(wrap);
    const grid = wrap.querySelector("#presetGrid");
    Object.entries(meta.presets).forEach(([id, p]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `preset${config.layout.preset === id ? " is-active" : ""}`;
      btn.innerHTML = `<strong>${p.label}</strong><span>${p.desc}</span>`;
      btn.onclick = () => {
        Object.assign(config.layout, p.layout);
        renderPanel();
      };
      grid.appendChild(btn);
    });
  }

  def.fields.forEach((group) => {
    const card = document.createElement("div");
    card.className = "field-card full";
    card.innerHTML = `<h3>${group.group}</h3><div class="field-grid"></div>`;
    const grid = card.querySelector(".field-grid");

    group.items.forEach((field) => {
      const wrap = document.createElement("label");
      wrap.className = field.full ? "full" : "";
      wrap.textContent = field.label;
      const val = get(config, field.key);
      let input;

      if (field.type === "color") {
        input = document.createElement("input");
        input.type = "color";
        input.value = String(val || "#000000").slice(0, 7);
        input.addEventListener("input", () => set(config, field.key, input.value));
      } else if (field.type === "select") {
        input = document.createElement("select");
        const opts = field.optionsFrom === "fonts"
          ? (meta?.fonts || []).map((f) => ({ v: f, l: f }))
          : field.options.map((o) => (typeof o === "object" ? o : { v: o, l: o }));
        opts.forEach(({ v, l }) => {
          const opt = document.createElement("option");
          opt.value = String(v);
          opt.textContent = l;
          if (String(val) === String(v) || val === v) opt.selected = true;
          input.appendChild(opt);
        });
        input.addEventListener("change", () => {
          const raw = input.value;
          set(config, field.key, raw === "true" ? true : raw === "false" ? false : raw);
        });
      } else {
        input = document.createElement("input");
        input.type = "text";
        input.value = val ?? "";
        input.addEventListener("input", () => set(config, field.key, input.value));
      }
      wrap.appendChild(input);
      grid.appendChild(wrap);
    });
    panel.appendChild(card);
  });
}

function ensureI18nConfig() {
  if (!config.i18n) config.i18n = { defaultLocale: "en", enabledLocales: ["en"] };
  if (!config.i18n.defaultLocale) config.i18n.defaultLocale = "en";
  if (!Array.isArray(config.i18n.enabledLocales)) config.i18n.enabledLocales = ["en"];
  if (!config.translations) config.translations = {};
  for (const loc of config.i18n.enabledLocales) {
    if (!config.translations[loc]) config.translations[loc] = {};
  }
  if (!langEditLocale || !config.i18n.enabledLocales.includes(langEditLocale)) {
    langEditLocale = config.i18n.defaultLocale;
  }
}

function catalogItemsForScope(scope) {
  const site = meta?.i18n?.catalog || [];
  const admin = meta?.i18n?.adminCatalog || [];
  if (scope === "site") return site;
  if (scope === "admin") return admin;
  return [...site, ...admin];
}

function renderLanguagesPanel() {
  ensureI18nConfig();
  const locales = meta?.i18n?.locales || {};
  const enabled = config.i18n.enabledLocales;
  const source = config.i18n.defaultLocale;
  const openAi = meta?.i18n?.openAi;
  const locMeta = meta?.translation?.meta?.locales || config.translationMeta?.locales || {};
  const job = meta?.translation?.job;

  const settings = document.createElement("div");
  settings.className = "field-card full";
  settings.innerHTML = `<h3>Source language & locales</h3>
    <p class="hint">Administrators edit <strong>source content only</strong> (General section). Other languages are generated automatically on save.</p>
    <div class="field-grid">
      <label>Source language
        <select id="defaultLocaleSel"></select>
      </label>
    </div>
    <div class="lang-enabled-wrap"><span class="hint">Enabled languages (auto-translated after save)</span>
      <div class="lang-enabled" id="enabledLocales"></div>
    </div>
    ${openAi ? "" : "<p class='hint warn'>Set <code>OPENAI_API_KEY</code> in .env to enable automatic translation.</p>"}`;
  panel.appendChild(settings);

  const defaultSel = settings.querySelector("#defaultLocaleSel");
  Object.entries(locales).forEach(([code, m]) => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = `${m.native || m.label} (${code})${m.dir === "rtl" ? " · RTL" : ""}`;
    if (code === source) opt.selected = true;
    defaultSel.appendChild(opt);
  });
  defaultSel.addEventListener("change", () => {
    config.i18n.defaultLocale = defaultSel.value;
    if (!config.i18n.enabledLocales.includes(defaultSel.value)) {
      config.i18n.enabledLocales.unshift(defaultSel.value);
    }
    renderPanel();
  });

  const enabledWrap = settings.querySelector("#enabledLocales");
  Object.entries(locales).forEach(([code, m]) => {
    const on = enabled.includes(code);
    const label = document.createElement("label");
    label.className = "lang-check";
    label.innerHTML = `<input type="checkbox" data-locale="${code}" ${on ? "checked" : ""} ${code === source ? "disabled checked" : ""} /> ${m.native || m.label}${m.dir === "rtl" ? " (RTL)" : ""}`;
    const input = label.querySelector("input");
    if (!input.disabled) {
      input.addEventListener("change", (e) => {
        const checked = e.target.checked;
        if (checked && !config.i18n.enabledLocales.includes(code)) {
          config.i18n.enabledLocales.push(code);
        } else if (!checked) {
          config.i18n.enabledLocales = config.i18n.enabledLocales.filter((c) => c !== code);
        }
        renderPanel();
      });
    }
    enabledWrap.appendChild(label);
  });

  if (job?.running) {
    const banner = document.createElement("div");
    banner.className = "job-banner full";
    banner.textContent = `Generating translations… (${job.completed?.length || 0} done, ${job.pending?.length || 0} pending)`;
    panel.appendChild(banner);
  }

  const statusCard = document.createElement("div");
  statusCard.className = "field-card full";
  statusCard.innerHTML = `<h3>Translation status</h3><div class="translation-status" id="translationStatus"></div>`;
  panel.appendChild(statusCard);
  const statusWrap = statusCard.querySelector("#translationStatus");
  enabled.forEach((code) => {
    const lm = locales[code] || {};
    const st = locMeta[code]?.status || (code === source ? "source" : "pending");
    const row = document.createElement("div");
    row.className = "translation-row";
    row.innerHTML = `
      <span><strong>${escHtml(lm.native || code)}</strong> <span class="gen-link-status status-${escHtml(st)}">${escHtml(statusLabel(st))}</span>${lm.dir === "rtl" ? '<span class="tag-rtl">RTL</span>' : ""}</span>
      <span class="hint">${code === source ? "Canonical source" : locMeta[code]?.updatedAt ? escHtml(locMeta[code].updatedAt.slice(0, 19).replace("T", " ")) : ""}</span>
      ${code !== source && st === "failed" ? `<button type="button" class="btn ghost sm" data-retry="${code}">Retry</button>` : "<span></span>"}`;
    statusWrap.appendChild(row);
    const retry = row.querySelector("[data-retry]");
    if (retry) {
      retry.addEventListener("click", async () => {
        try {
          await api("/admin/api/translation/retry", { method: "POST", body: JSON.stringify({ locale: code }) });
          showToast(`Retrying ${code}…`);
          startTranslationPoll();
        } catch (err) {
          showToast(err.message || "Retry failed");
        }
      });
    }
  });

  const glossaryCard = document.createElement("div");
  glossaryCard.className = "field-card full";
  glossaryCard.innerHTML = `<h3>Terminology glossary</h3>
    <p class="hint">AI uses these rules for consistent sportsbook terminology across pages.</p>
    <table class="glossary-table"><thead><tr><th>Term</th><th>Rule</th><th>Hint</th></tr></thead><tbody id="glossaryBody"></tbody></table>`;
  panel.appendChild(glossaryCard);
  const glossary = config.i18n.glossary || meta?.i18n?.glossary || [];
  const tbody = glossaryCard.querySelector("#glossaryBody");
  glossary.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" data-gloss-idx="${idx}" data-gloss-field="term" value="${escHtml(row.term || "")}" /></td>
      <td><select data-gloss-idx="${idx}" data-gloss-field="rule">
        <option value="keep" ${row.rule === "keep" ? "selected" : ""}>Keep as-is</option>
        <option value="preferred" ${row.rule === "preferred" ? "selected" : ""}>Preferred translation</option>
        <option value="translate" ${row.rule === "translate" ? "selected" : ""}>Translate naturally</option>
      </select></td>
      <td><input type="text" data-gloss-idx="${idx}" data-gloss-field="hint" value="${escHtml(row.hint || row.translation || "")}" placeholder="Optional hint" /></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("[data-gloss-idx]").forEach((el) => {
    el.addEventListener("input", () => {
      const idx = Number(el.dataset.glossIdx);
      const field = el.dataset.glossField;
      if (!config.i18n.glossary[idx]) return;
      config.i18n.glossary[idx][field] = el.value;
    });
    el.addEventListener("change", () => {
      const idx = Number(el.dataset.glossIdx);
      const field = el.dataset.glossField;
      if (!config.i18n.glossary[idx]) return;
      config.i18n.glossary[idx][field] = el.value;
    });
  });

  const sourceCard = document.createElement("div");
  sourceCard.className = "field-card full";
  sourceCard.innerHTML = `<h3>Source content</h3>
    <p class="hint">Edit branding strings in the <strong>General</strong> section (source language). Do not translate manually here — save triggers auto-translation.</p>
    <button type="button" class="btn ghost" id="gotoGeneral">Open General</button>`;
  panel.appendChild(sourceCard);
  sourceCard.querySelector("#gotoGeneral").addEventListener("click", () => {
    section = "general";
    document.querySelectorAll(".erp-nav-item").forEach((n) => {
      n.classList.toggle("is-active", n.dataset.section === "general");
    });
    renderPanel();
  });
}

function escHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => showToast("Copied to clipboard"));
}

function refreshPreview() {
  const base = meta?.sharedUrl || "/markets/overview/1";
  const lang = langEditLocale || config?.i18n?.defaultLocale || "en";
  previewFrame.src = `${base}?lang=${encodeURIComponent(lang)}&t=${Date.now()}`;
}

async function loadApp() {
  config = await api("/admin/api/config");
  meta = await api("/admin/api/meta");
  renderPanel();
  renderPreviewLinks();
  refreshPreview();
  startTranslationPoll();
}

const loginBtn = document.getElementById("loginBtn");
const passwordInput = document.getElementById("passwordInput");
const togglePwd = document.getElementById("togglePwd");

/** guest | authed — prevents stale session bootstrap from reverting a successful login */
let authState = "guest";

function showLogin() {
  authState = "guest";
  loginView.classList.remove("is-hidden");
  appView.classList.add("is-hidden");
}

function showApp() {
  authState = "authed";
  loginView.classList.add("is-hidden");
  appView.classList.remove("is-hidden");
  if (localStorage.getItem("aurum_sidebar_collapsed") === "1") {
    appView.classList.add("is-collapsed");
  }
}

if (togglePwd && passwordInput) {
  togglePwd.addEventListener("click", () => {
    const isPwd = passwordInput.type === "password";
    passwordInput.type = isPwd ? "text" : "password";
    togglePwd.textContent = isPwd ? "Hide" : "Show";
  });
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.hidden = true;
  const fd = new FormData(loginForm);
  const username = String(fd.get("username") || "").trim();
  const password = String(fd.get("password") || "");
  if (!username || !password) {
    loginError.textContent = "Enter username and password";
    loginError.hidden = false;
    return;
  }
  loginBtn.disabled = true;
  const label = loginBtn.querySelector(".ig-btn-text");
  const prev = label?.textContent;
  if (label) label.textContent = "SIGNING IN…";
  try {
    await api("/admin/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    authState = "authed";
    await loadApp();
    showApp();
    showToast("Welcome back, operator");
  } catch (err) {
    loginError.textContent = err.message || "Login failed. Check username and password.";
    loginError.hidden = false;
  } finally {
    loginBtn.disabled = false;
    if (label) label.textContent = prev || "LOGIN";
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await api("/admin/api/logout", { method: "POST" }).catch(() => {});
  showLogin();
  loginForm.reset();
});

document.getElementById("applyBtn").addEventListener("click", async () => {
  try {
    const res = await api("/admin/api/config", { method: "PUT", body: JSON.stringify(config) });
    config = res;
    if (res.translationJob) meta.translation = { job: res.translationJob };
    showToast("Saved — translations running in background");
    meta = await api("/admin/api/meta");
    renderPreviewLinks();
    refreshPreview();
    startTranslationPoll();
    if (section === "languages" || section === "share") renderPanel();
  } catch (err) {
    showToast(err.message);
  }
});

document.getElementById("resetBtn").addEventListener("click", async () => {
  const fresh = await api("/admin/api/config");
  config = fresh;
  renderPanel();
  showToast("Section reset to saved values");
});

document.getElementById("nav").addEventListener("click", (e) => {
  const btn = e.target.closest(".erp-nav-item");
  if (!btn) return;
  section = btn.dataset.section;
  document.querySelectorAll(".erp-nav-item").forEach((n) => n.classList.toggle("is-active", n === btn));
  renderPanel();
  closeMobileDrawer();
});

const sidebarCollapse = document.getElementById("sidebarCollapse");
if (sidebarCollapse) {
  sidebarCollapse.addEventListener("click", () => {
    appView.classList.toggle("is-collapsed");
    localStorage.setItem("aurum_sidebar_collapsed", appView.classList.contains("is-collapsed") ? "1" : "0");
  });
}

function openMobileDrawer() {
  appView.classList.add("is-drawer-open");
  if (drawerBackdrop) drawerBackdrop.hidden = false;
}
function closeMobileDrawer() {
  appView.classList.remove("is-drawer-open");
  if (drawerBackdrop) drawerBackdrop.hidden = true;
}

document.getElementById("mobileNavOpen")?.addEventListener("click", openMobileDrawer);
document.getElementById("mobileNavClose")?.addEventListener("click", closeMobileDrawer);
drawerBackdrop?.addEventListener("click", closeMobileDrawer);

async function bootstrap() {
  try {
    const s = await api("/admin/api/session");
    if (s.loggedIn && authState !== "authed") {
      await loadApp();
      showApp();
    }
  } catch {
    if (authState !== "authed") showLogin();
  }
}

bootstrap();
