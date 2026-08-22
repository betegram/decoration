/**
 * Multilingual string catalog, locale resolution, and config normalization.
 */

export const DEFAULT_LOCALE = "en";

export const LOCALE_META = {
  en: { label: "English", native: "English" },
  tr: { label: "Turkish", native: "Türkçe" },
  de: { label: "German", native: "Deutsch" },
  es: { label: "Spanish", native: "Español" },
  fr: { label: "French", native: "Français" },
  it: { label: "Italian", native: "Italiano" },
  pt: { label: "Portuguese", native: "Português" },
  ar: { label: "Arabic", native: "العربية" },
  ru: { label: "Russian", native: "Русский" },
  zh: { label: "Chinese", native: "中文" },
};

/** Flat catalog: key → { group, label, default (English), scope: site|admin } */
export const STRING_CATALOG = {
  // —— Public site ——
  "site.page_title": { group: "Branding", label: "Browser title", scope: "site", default: "AURUM Markets" },
  "site.brand_name": { group: "Branding", label: "Brand name", scope: "site", default: "AURUM" },
  "site.brand_tag": { group: "Branding", label: "Brand tag", scope: "site", default: "Markets" },
  "site.search_placeholder": { group: "Branding", label: "Search placeholder", scope: "site", default: "Search teams, leagues, events…" },
  "site.featured_title": { group: "Branding", label: "Featured title", scope: "site", default: "Live now" },
  "site.featured_sub": { group: "Branding", label: "Featured subtitle", scope: "site", default: "Highest intensity markets" },
  "site.feed_title": { group: "Branding", label: "Feed title", scope: "site", default: "Markets" },
  "site.feed_sub": { group: "Feed", label: "Feed subtitle", scope: "site", default: "Discover events" },
  "site.search_sr": { group: "Feed", label: "Search screen-reader label", scope: "site", default: "Search" },
  "site.live_label": { group: "Feed", label: "Live chip label", scope: "site", default: "Live" },
  "site.ticket_label": { group: "Ticket", label: "Ticket button", scope: "site", default: "Ticket" },
  "site.ticket_heading": { group: "Ticket", label: "Ticket heading", scope: "site", default: "Ticket" },
  "site.ticket_clear": { group: "Ticket", label: "Clear ticket", scope: "site", default: "Clear" },
  "site.ticket_empty": { group: "Ticket", label: "Empty ticket message", scope: "site", default: "Select a market outcome to build your ticket." },
  "site.stake_label": { group: "Ticket", label: "Stake label", scope: "site", default: "Stake" },
  "site.potential_return": { group: "Ticket", label: "Potential return label", scope: "site", default: "Potential return" },
  "site.open_trade": { group: "Ticket", label: "Open trade desk button", scope: "site", default: "Open trade desk" },
  "site.open_trade_fine": { group: "Ticket", label: "Open trade footnote", scope: "site", default: "Opens the live event desk to complete the trade on the connected engine." },
  "site.event_desk": { group: "Desk", label: "Event desk kicker", scope: "site", default: "Event desk" },
  "site.event_desk_title": { group: "Desk", label: "Event desk default title", scope: "site", default: "Markets" },
  "site.close_desk": { group: "Desk", label: "Close desk button", scope: "site", default: "Close" },
  "site.desk_frame_title": { group: "Desk", label: "Desk iframe title", scope: "site", default: "Event trading desk" },
  "site.desk_aria": { group: "Desk", label: "Desk dialog label", scope: "site", default: "Event desk" },
  "site.full_markets": { group: "Cards", label: "Full markets link", scope: "site", default: "Full markets →" },
  "site.filter_all": { group: "Filters", label: "Filter: All", scope: "site", default: "All" },
  "site.filter_live": { group: "Filters", label: "Filter: Live now", scope: "site", default: "Live now" },
  "site.filter_upcoming": { group: "Filters", label: "Filter: Upcoming", scope: "site", default: "Upcoming" },
  "site.filter_favourites": { group: "Filters", label: "Filter: Favourites", scope: "site", default: "Favourites" },
  "site.date_today": { group: "Filters", label: "Date: Today", scope: "site", default: "Today" },
  "site.date_tomorrow": { group: "Filters", label: "Date: Tomorrow", scope: "site", default: "Tomorrow" },
  "site.date_plus2": { group: "Filters", label: "Date: +2 days", scope: "site", default: "+2 days" },
  "site.date_week": { group: "Filters", label: "Date: This week", scope: "site", default: "This week" },
  "site.date_rail_aria": { group: "Filters", label: "Date rail aria", scope: "site", default: "Date range" },
  "site.fav_add_aria": { group: "Cards", label: "Add favourite aria", scope: "site", default: "Add to favourites" },
  "site.fav_remove_aria": { group: "Cards", label: "Remove favourite aria", scope: "site", default: "Remove from favourites" },
  "site.loading_markets": { group: "Feed", label: "Loading markets", scope: "site", default: "Loading markets…" },
  "site.waiting_kickoff": { group: "Feed", label: "No live featured text", scope: "site", default: "Waiting for kickoff" },
  "site.featured_in_play": { group: "Feed", label: "Featured in play (use {{count}})", scope: "site", default: "{{count}} in play" },
  "site.events_live_count": { group: "Feed", label: "Events subline ({{count}}, {{live}})", scope: "site", default: "{{count}} events · {{live}} live" },
  "site.no_markets_title": { group: "Empty state", label: "No markets title", scope: "site", default: "No markets match" },
  "site.no_markets_body": { group: "Empty state", label: "No markets body", scope: "site", default: "Try another sport, filter, or search term." },
  "site.no_live_events": { group: "Empty state", label: "No live events card", scope: "site", default: "No live events in this sport right now." },
  "site.draw": { group: "Cards", label: "Draw label", scope: "site", default: "Draw" },
  "site.home": { group: "Cards", label: "Home fallback", scope: "site", default: "Home" },
  "site.away": { group: "Cards", label: "Away fallback", scope: "site", default: "Away" },
  "site.in_play": { group: "Cards", label: "In play status", scope: "site", default: "In play" },
  "site.scheduled": { group: "Cards", label: "Scheduled status", scope: "site", default: "Scheduled" },
  "site.live_badge": { group: "Cards", label: "Live badge", scope: "site", default: "LIVE" },
  "site.error_load_fixtures": { group: "Errors", label: "Load fixtures error title", scope: "site", default: "Could not load fixtures" },
  "site.error_load_markets": { group: "Errors", label: "Load markets error title", scope: "site", default: "Could not load markets" },
  "site.error_render_markets": { group: "Errors", label: "Render error title", scope: "site", default: "Could not render markets" },
  "site.lang_label": { group: "Language", label: "Language switcher label", scope: "site", default: "Language" },
  "site.sport_nav_aria": { group: "Feed", label: "Sport nav aria", scope: "site", default: "Sports" },
  "site.filter_rail_aria": { group: "Feed", label: "Filter rail aria", scope: "site", default: "Filters" },
  "site.ticket_aria": { group: "Ticket", label: "Ticket panel aria", scope: "site", default: "Trade ticket" },
  "site.open_ticket_aria": { group: "Ticket", label: "Open ticket aria", scope: "site", default: "Open ticket" },
  "site.remove_pick_aria": { group: "Ticket", label: "Remove pick aria", scope: "site", default: "Remove" },
  "site.markets_label": { group: "Feed", label: "Markets word (feed)", scope: "site", default: "markets" },

  // —— Admin panel ——
  "admin.login_title": { group: "Admin login", label: "Login page title", scope: "admin", default: "Operator Login — AURUM" },
  "admin.promo_badge": { group: "Admin login", label: "Promo badge", scope: "admin", default: "VIP OPERATOR" },
  "admin.promo_heading": { group: "Admin login", label: "Promo heading HTML", scope: "admin", default: "Control your<br /><span>live sports</span> experience" },
  "admin.promo_body": { group: "Admin login", label: "Promo body", scope: "admin", default: "Customize layouts, colors, branding, and publish to your players in real time." },
  "admin.promo_perk_1": { group: "Admin login", label: "Perk 1", scope: "admin", default: "Live theme publishing" },
  "admin.promo_perk_2": { group: "Admin login", label: "Perk 2", scope: "admin", default: "Layout presets & color studio" },
  "admin.promo_perk_3": { group: "Admin login", label: "Perk 3", scope: "admin", default: "Same URL paths as your sportsbook" },
  "admin.sign_in_title": { group: "Admin login", label: "Sign in title", scope: "admin", default: "Operator sign in" },
  "admin.sign_in_sub": { group: "Admin login", label: "Sign in subtitle", scope: "admin", default: "Secure access to your brand control center" },
  "admin.username": { group: "Admin login", label: "Username label", scope: "admin", default: "Username" },
  "admin.password": { group: "Admin login", label: "Password label", scope: "admin", default: "Password" },
  "admin.username_ph": { group: "Admin login", label: "Username placeholder", scope: "admin", default: "Enter username" },
  "admin.password_ph": { group: "Admin login", label: "Password placeholder", scope: "admin", default: "Enter password" },
  "admin.remember": { group: "Admin login", label: "Remember me", scope: "admin", default: "Remember me" },
  "admin.login_btn": { group: "Admin login", label: "Login button", scope: "admin", default: "LOGIN" },
  "admin.signing_in": { group: "Admin login", label: "Signing in…", scope: "admin", default: "SIGNING IN…" },
  "admin.demo_hint": { group: "Admin login", label: "Demo hint HTML", scope: "admin", default: "Demo access: <strong>admin</strong> / <strong>aurum2026</strong>" },
  "admin.studio_name": { group: "Admin shell", label: "Studio name", scope: "admin", default: "AURUM Studio" },
  "admin.studio_tag": { group: "Admin shell", label: "Studio tag", scope: "admin", default: "Operator control" },
  "admin.sign_out": { group: "Admin shell", label: "Sign out", scope: "admin", default: "Sign out" },
  "admin.reset_section": { group: "Admin shell", label: "Reset section", scope: "admin", default: "Reset section" },
  "admin.apply_changes": { group: "Admin shell", label: "Apply changes", scope: "admin", default: "Apply changes" },
  "admin.live_preview": { group: "Admin shell", label: "Live preview", scope: "admin", default: "Live preview" },
  "admin.preview_note": { group: "Admin shell", label: "Preview note", scope: "admin", default: "Updates after Apply" },
  "admin.shared_url": { group: "Admin shell", label: "Shared URL label", scope: "admin", default: "Shared URL" },
  "admin.copy": { group: "Admin shell", label: "Copy button", scope: "admin", default: "Copy" },
  "admin.path_hint": { group: "Admin shell", label: "Path hint", scope: "admin", default: "Same path as the original site — only your base URL differs." },
  "admin.nav_themes": { group: "Admin nav", label: "Nav: Themes", scope: "admin", default: "Themes" },
  "admin.nav_general": { group: "Admin nav", label: "Nav: General", scope: "admin", default: "General" },
  "admin.nav_layout": { group: "Admin nav", label: "Nav: Layout", scope: "admin", default: "Layout" },
  "admin.nav_colors": { group: "Admin nav", label: "Nav: Colors", scope: "admin", default: "Colors" },
  "admin.nav_typography": { group: "Admin nav", label: "Nav: Typography", scope: "admin", default: "Typography" },
  "admin.nav_structure": { group: "Admin nav", label: "Nav: Structure", scope: "admin", default: "Structure" },
  "admin.nav_board": { group: "Admin nav", label: "Nav: Event desk", scope: "admin", default: "Event desk" },
  "admin.nav_share": { group: "Admin nav", label: "Nav: Share", scope: "admin", default: "Share & publish" },
  "admin.nav_languages": { group: "Admin nav", label: "Nav: Languages", scope: "admin", default: "Languages" },
  "admin.lang_section_title": { group: "Languages", label: "Section title", scope: "admin", default: "Languages & translations" },
  "admin.lang_section_desc": { group: "Languages", label: "Section desc", scope: "admin", default: "Default locale, enabled languages, and AI-assisted translations" },
  "admin.lang_default": { group: "Languages", label: "Default locale label", scope: "admin", default: "Default language" },
  "admin.lang_enabled": { group: "Languages", label: "Enabled locales label", scope: "admin", default: "Enabled languages" },
  "admin.lang_edit_locale": { group: "Languages", label: "Edit locale label", scope: "admin", default: "Edit translations" },
  "admin.lang_ai_translate": { group: "Languages", label: "AI translate button", scope: "admin", default: "AI translate missing" },
  "admin.lang_ai_all": { group: "Languages", label: "AI translate all button", scope: "admin", default: "AI translate all enabled languages" },
  "admin.lang_key": { group: "Languages", label: "Table: Key", scope: "admin", default: "Key" },
  "admin.lang_reference": { group: "Languages", label: "Table: Reference", scope: "admin", default: "Reference (EN)" },
  "admin.lang_value": { group: "Languages", label: "Table: Value", scope: "admin", default: "Translation" },
  "admin.lang_missing": { group: "Languages", label: "Missing count", scope: "admin", default: "{{count}} missing" },
  "admin.lang_saved": { group: "Languages", label: "Saved toast", scope: "admin", default: "Translations updated" },
  "admin.lang_ai_done": { group: "Languages", label: "AI done toast", scope: "admin", default: "AI translation complete — review and Apply" },
  "admin.lang_ai_fail": { group: "Languages", label: "AI fail toast", scope: "admin", default: "AI translation failed" },
  "admin.welcome": { group: "Admin shell", label: "Welcome toast", scope: "admin", default: "Welcome back, operator" },
  "admin.applied": { group: "Admin shell", label: "Applied toast", scope: "admin", default: "Changes applied — live site updated" },
  "admin.reset_done": { group: "Admin shell", label: "Reset toast", scope: "admin", default: "Section reset to saved values" },
  "admin.copied": { group: "Admin shell", label: "Copied toast", scope: "admin", default: "Copied to clipboard" },
};

export const BRANDING_TO_I18N = {
  pageTitle: "site.page_title",
  name: "site.brand_name",
  tag: "site.brand_tag",
  searchPlaceholder: "site.search_placeholder",
  featuredTitle: "site.featured_title",
  featuredSub: "site.featured_sub",
  feedTitle: "site.feed_title",
};

export function defaultEnglishBundle() {
  const out = {};
  for (const [key, meta] of Object.entries(STRING_CATALOG)) {
    out[key] = meta.default;
  }
  return out;
}

export function catalogForScope(scope) {
  return Object.entries(STRING_CATALOG)
    .filter(([, m]) => m.scope === scope)
    .map(([key, m]) => ({ key, group: m.group, label: m.label, default: m.default }));
}

export function catalogGroups(scope) {
  const groups = new Map();
  for (const item of catalogForScope(scope)) {
    if (!groups.has(item.group)) groups.set(item.group, []);
    groups.get(item.group).push(item);
  }
  return groups;
}

export function interpolate(template, vars = {}) {
  if (!template) return "";
  return String(template).replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] != null ? String(vars[k]) : "");
}

export function t(bundle, key, vars = {}) {
  const raw = bundle?.[key] ?? STRING_CATALOG[key]?.default ?? key;
  return interpolate(raw, vars);
}

export function normalizeSiteConfig(config) {
  const out = structuredClone(config);
  if (!out.i18n) out.i18n = {};
  if (!out.i18n.defaultLocale) out.i18n.defaultLocale = DEFAULT_LOCALE;
  if (!Array.isArray(out.i18n.enabledLocales) || !out.i18n.enabledLocales.length) {
    out.i18n.enabledLocales = [DEFAULT_LOCALE];
  }
  if (!out.i18n.enabledLocales.includes(out.i18n.defaultLocale)) {
    out.i18n.enabledLocales = [out.i18n.defaultLocale, ...out.i18n.enabledLocales];
  }
  if (!out.translations) out.translations = {};
  if (!out.translations[DEFAULT_LOCALE]) out.translations[DEFAULT_LOCALE] = {};
  const en = { ...defaultEnglishBundle(), ...out.translations[DEFAULT_LOCALE] };

  // Migrate legacy flat branding → English translation keys
  if (out.branding && typeof out.branding === "object" && out.branding.name && !out.branding.pageTitle) {
    for (const [bk, ik] of Object.entries(BRANDING_TO_I18N)) {
      if (out.branding[bk]) en[ik] = out.branding[bk];
    }
  }

  // Admin General section edits branding → sync into English catalog
  if (out.branding && typeof out.branding === "object") {
    for (const [bk, ik] of Object.entries(BRANDING_TO_I18N)) {
      if (out.branding[bk] != null && String(out.branding[bk]).trim()) {
        en[ik] = out.branding[bk];
      }
    }
  }

  out.translations[DEFAULT_LOCALE] = { ...en };

  for (const locale of out.i18n.enabledLocales) {
    if (!out.translations[locale]) out.translations[locale] = {};
    out.translations[locale] = { ...defaultEnglishBundle(), ...out.translations[locale] };
  }

  // Keep branding in sync with English translations for admin General section
  out.branding = {
    pageTitle: en["site.page_title"],
    name: en["site.brand_name"],
    tag: en["site.brand_tag"],
    searchPlaceholder: en["site.search_placeholder"],
    featuredTitle: en["site.featured_title"],
    featuredSub: en["site.featured_sub"],
    feedTitle: en["site.feed_title"],
  };

  return out;
}

export function parseCookieLang(raw) {
  const v = String(raw || "").trim().toLowerCase();
  return v && /^[a-z]{2}(-[a-z]{2})?$/i.test(v) ? v.split("-")[0] : null;
}

export function resolveLocale(req, config) {
  const enabled = config.i18n?.enabledLocales || [DEFAULT_LOCALE];
  const defaultLocale = config.i18n?.defaultLocale || DEFAULT_LOCALE;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const q = parseCookieLang(url.searchParams.get("lang"));
  if (q && enabled.includes(q)) return q;
  const hdr = parseCookieLang(req.headers["x-aurum-lang"]);
  if (hdr && enabled.includes(hdr)) return hdr;
  const cookie = parseCookieLang(parseCookieString(req.headers.cookie || "").aurum_lang);
  if (cookie && enabled.includes(cookie)) return cookie;
  const accept = String(req.headers["accept-language"] || "");
  for (const part of accept.split(",")) {
    const code = parseCookieLang(part.trim().split(";")[0]);
    if (code && enabled.includes(code)) return code;
  }
  return defaultLocale;
}

function parseCookieString(raw) {
  const out = {};
  raw.split(";").forEach((part) => {
    const [k, ...v] = part.trim().split("=");
    if (k) out[k] = decodeURIComponent(v.join("="));
  });
  return out;
}

export function publicBundle(config, locale) {
  const normalized = normalizeSiteConfig(config);
  const loc = normalized.i18n.enabledLocales.includes(locale)
    ? locale
    : normalized.i18n.defaultLocale;
  const def = normalized.translations[normalized.i18n.defaultLocale] || {};
  const all = { ...def, ...normalized.translations[loc] };
  const site = {};
  for (const [key, val] of Object.entries(all)) {
    if (key.startsWith("site.")) site[key] = val;
  }
  return {
    locale: loc,
    defaultLocale: normalized.i18n.defaultLocale,
    enabledLocales: normalized.i18n.enabledLocales,
    locales: LOCALE_META,
    strings: site,
  };
}

export function adminBundle(config, locale) {
  const normalized = normalizeSiteConfig(config);
  const loc = normalized.i18n.enabledLocales.includes(locale)
    ? locale
    : normalized.i18n.defaultLocale;
  const all = normalized.translations[loc] || {};
  const strings = {};
  for (const [key, val] of Object.entries(all)) {
    if (key.startsWith("admin.")) strings[key] = val;
  }
  return { locale: loc, strings };
}

export function missingKeys(config, locale, scope) {
  const normalized = normalizeSiteConfig(config);
  const ref = normalized.translations[normalized.i18n.defaultLocale] || defaultEnglishBundle();
  const target = normalized.translations[locale] || {};
  const missing = [];
  for (const [key, meta] of Object.entries(STRING_CATALOG)) {
    if (meta.scope !== scope) continue;
    const val = target[key];
    const refVal = ref[key] || meta.default;
    if (!val || val === meta.default && locale !== DEFAULT_LOCALE && val === ref[key]) {
      // only count missing if empty or same as untranslated
    }
    if (!val || String(val).trim() === "") missing.push({ key, source: refVal || meta.default });
    else if (locale !== DEFAULT_LOCALE && val === refVal) missing.push({ key, source: refVal });
  }
  return missing;
}

export function keysForAiTranslate(config, locale, scope) {
  const normalized = normalizeSiteConfig(config);
  const refLocale = normalized.i18n.defaultLocale;
  const ref = normalized.translations[refLocale] || defaultEnglishBundle();
  const target = normalized.translations[locale] || {};
  const items = {};
  for (const [key, meta] of Object.entries(STRING_CATALOG)) {
    if (meta.scope !== scope && scope !== "all") continue;
    if (scope === "site" && meta.scope !== "site") continue;
    if (scope === "admin" && meta.scope !== "admin") continue;
    const refText = ref[key] || meta.default;
    const cur = target[key];
    if (!cur || String(cur).trim() === "" || (locale !== refLocale && cur === refText)) {
      items[key] = refText;
    }
  }
  return items;
}
