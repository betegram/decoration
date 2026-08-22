/**
 * Canonical public URLs — backend source of truth for admin link display.
 */
import { LOCALE_META, RTL_LOCALES } from "./i18n.js";
import { sharedPath } from "./config.js";

const DESIGNED_OVERVIEW_PATH = "/markets/overview/1";

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
  const primaryPath = sharedPath(1); // /live-sports/overview/1 — full sportsbook SPA (themed)
  const designedPath = DESIGNED_OVERVIEW_PATH; // /markets/overview/1 — custom designed UI
  const primary = {
    id: "sportsbook",
    label: "Primary — full sportsbook (design system)",
    path: primaryPath,
    url: `${base}${primaryPath}`,
  };
  const secondary = {
    id: "designed",
    label: "Secondary — designed markets UI",
    path: designedPath,
    url: `${base}${designedPath}`,
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
