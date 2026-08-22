/**
 * Canonical public URLs — backend source of truth for admin link display.
 */
import { LOCALE_META, RTL_LOCALES } from "./i18n.js";
import { sharedPath } from "./config.js";

const PROXY_OVERVIEW_PATH = "/markets/overview/1";

export function localeUrl(baseUrl, path, locale) {
  const u = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  u.searchParams.set("lang", locale);
  return u.toString();
}

/**
 * @param {{ proto: string, host: string, config: object }} opts
 */
export function buildPublicLinks({ proto, host, config }) {
  const base = `${proto}://${host}`;
  const designedPath = sharedPath(1);
  const primary = {
    id: "designed",
    label: "Primary — designed markets UI",
    path: designedPath,
    url: `${base}${designedPath}`,
  };
  const secondary = {
    id: "proxy",
    label: "Secondary — proxied upstream SPA",
    path: PROXY_OVERVIEW_PATH,
    url: `${base}${PROXY_OVERVIEW_PATH}`,
  };

  const enabled = config?.i18n?.enabledLocales || ["en"];
  const sourceLocale = config?.i18n?.defaultLocale || "en";
  const meta = config?.translationMeta?.locales || {};

  const byLocale = {};
  for (const loc of enabled) {
    const lm = LOCALE_META[loc] || { label: loc, native: loc };
    const locMeta = meta[loc] || {};
    byLocale[loc] = {
      locale: loc,
      label: lm.native || lm.label || loc,
      dir: RTL_LOCALES.includes(loc) ? "rtl" : "ltr",
      url: localeUrl(base, designedPath, loc),
      status: loc === sourceLocale ? "source" : locMeta.status || "pending",
      published: locMeta.status === "source" || locMeta.status === "generated" || locMeta.status === "published",
    };
  }

  return { primary, secondary, byLocale, sourceLocale };
}
