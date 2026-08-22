const loginView = document.getElementById("loginView");
const appView = document.getElementById("appView");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const panel = document.getElementById("panel");
const sectionTitle = document.getElementById("sectionTitle");
const sectionDesc = document.getElementById("sectionDesc");
const previewFrame = document.getElementById("previewFrame");
const sharedUrlInput = document.getElementById("sharedUrl");
const originalUrlEl = document.getElementById("originalUrl");
const toast = document.getElementById("toast");

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
    title: "Share & publish",
    desc: "Public URL mirrors the original site path",
    shareOnly: true,
  },
};

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

  if (def.themes && meta?.themes) {
    const wrap = document.createElement("div");
    wrap.className = "field-card full";
    wrap.innerHTML = "<h3>Predefined design systems</h3><p class='hint'>Select a theme to apply colors, typography, structure, and visual effects. Click <strong>Apply changes</strong> to publish.</p><div class='theme-grid' id='themeGrid'></div>";
    panel.appendChild(wrap);
    const grid = wrap.querySelector("#themeGrid");
    const active = config.theme?.preset || "polymarket";
    Object.entries(meta.themes).forEach(([id, t]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `theme-card${active === id ? " is-active" : ""}`;
      btn.innerHTML = `<span class="theme-concept">${t.concept}</span><strong>${t.label}</strong><span>${t.desc}</span>`;
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
    panel.innerHTML = `
      <div class="field-card full">
        <h3>Published URL</h3>
        <p class="hint">Users open this link. The path matches the original sportsbook (<code>/live-sports/overview/1</code>).</p>
        <div class="url-row">
          <input id="shareCopy" readonly value="${sharedUrlInput.value}" />
          <button type="button" class="btn primary" id="copyShare">Copy URL</button>
        </div>
        <p class="hint muted">Original reference: ${meta?.originalUrl || ""}</p>
        <p class="hint">After editing any section, click <strong>Apply changes</strong>. The preview and live site update immediately.</p>
      </div>`;
    document.getElementById("copyShare").onclick = () => copyText(sharedUrlInput.value);
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

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => showToast("Copied to clipboard"));
}

function refreshPreview() {
  const url = meta?.sharedUrl || "/live-sports/overview/1";
  previewFrame.src = `${url}?t=${Date.now()}`;
}

async function loadApp() {
  config = await api("/admin/api/config");
  meta = await api("/admin/api/meta");
  sharedUrlInput.value = meta.sharedUrl;
  originalUrlEl.textContent = `Original: ${meta.originalUrl}`;
  renderPanel();
  refreshPreview();
}

const loginBtn = document.getElementById("loginBtn");
const passwordInput = document.getElementById("passwordInput");
const togglePwd = document.getElementById("togglePwd");

function showLogin() {
  loginView.hidden = false;
  appView.hidden = true;
}

function showApp() {
  loginView.hidden = true;
  appView.hidden = false;
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
    config = await api("/admin/api/config", { method: "PUT", body: JSON.stringify(config) });
    showToast("Changes applied — live site updated");
    refreshPreview();
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

document.getElementById("copyUrl").addEventListener("click", () => copyText(sharedUrlInput.value));

document.getElementById("nav").addEventListener("click", (e) => {
  const btn = e.target.closest(".nav-item");
  if (!btn) return;
  section = btn.dataset.section;
  document.querySelectorAll(".nav-item").forEach((n) => n.classList.toggle("is-active", n === btn));
  renderPanel();
});

api("/admin/api/session")
  .then(async (s) => {
    if (s.loggedIn) {
      await loadApp();
      showApp();
    }
  })
  .catch(() => showLogin());
