/**
 * Client-side i18n for public markets UI (classic script, no bundler).
 */
(function (global) {
  const state = {
    locale: "en",
    defaultLocale: "en",
    enabledLocales: ["en"],
    locales: {},
    strings: {},
  };

  function interpolate(template, vars = {}) {
    return String(template || "").replace(/\{\{(\w+)\}\}/g, (_, k) =>
      vars[k] != null ? String(vars[k]) : ""
    );
  }

  function t(key, vars = {}) {
    const raw = state.strings[key] ?? key;
    return interpolate(raw, vars);
  }

  async function initI18n() {
    const params = new URLSearchParams(window.location.search);
    const qLang = params.get("lang");
    const headers = {};
    if (qLang) headers["X-Aurum-Lang"] = qLang;
    const res = await fetch("/api/i18n.json", { headers });
    if (!res.ok) throw new Error("i18n bundle failed");
    const data = await res.json();
    state.locale = data.locale;
    state.defaultLocale = data.defaultLocale;
    state.enabledLocales = data.enabledLocales || ["en"];
    state.locales = data.locales || {};
    state.strings = data.strings || {};
    document.documentElement.lang = state.locale;
    document.documentElement.dir = data.dir === "rtl" ? "rtl" : "ltr";
    return state;
  }

  function setLocale(locale) {
    document.cookie = `aurum_lang=${encodeURIComponent(locale)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", locale);
    window.location.href = url.toString();
  }

  function applyDomI18n(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      const attr = el.getAttribute("data-i18n-attr");
      const text = t(key);
      if (attr) el.setAttribute(attr, text);
      else el.textContent = text;
    });
    root.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (key) el.innerHTML = t(key);
    });
  }

  function renderLangSwitcher(container) {
    if (!container) return;
    const enabled = state.enabledLocales;
    if (enabled.length <= 1) {
      container.hidden = true;
      return;
    }
    container.hidden = false;
    const meta = state.locales;
    const cur = state.locale;
    container.innerHTML = enabled
      .map((code) => {
        const label = meta[code]?.native || meta[code]?.label || code;
        const on = code === cur;
        return `<button type="button" class="lang-btn${on ? " is-active" : ""}" data-lang="${code}" aria-pressed="${on}">${label}</button>`;
      })
      .join("");
    container.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang;
        if (lang && lang !== state.locale) setLocale(lang);
      });
    });
  }

  global.AurumI18n = {
    t,
    initI18n,
    setLocale,
    applyDomI18n,
    renderLangSwitcher,
    getLocale: () => state.locale,
    getEnabledLocales: () => state.enabledLocales,
  };
})(window);
