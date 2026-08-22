/**
 * Smoke tests for translation pipeline (run: node scripts/test-translation-pipeline.mjs)
 */
import { computeSourceHash, prepareConfigAfterSave, localesNeedingTranslation } from "../lib/translation-pipeline.js";
import { buildPublicLinks } from "../lib/links.js";
import { normalizeSiteConfig } from "../lib/i18n.js";

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("ok:", msg);
  }
}

const base = normalizeSiteConfig({
  i18n: { defaultLocale: "en", enabledLocales: ["en", "fa", "de"] },
  translations: { en: { "site.brand_name": "AURUM" } },
});

const h1 = computeSourceHash(base);
const prepared = prepareConfigAfterSave(
  { ...base, translations: { en: { "site.brand_name": "AURUM CHANGED" } } },
  h1
);
assert(prepared.translationMeta.locales.fa?.status === "outdated" || prepared.translationMeta.locales.fa?.status === "pending", "outdated/pending on source change");

const needs = localesNeedingTranslation(prepared);
assert(needs.includes("fa") || needs.includes("de"), "locales need translation");

const links = buildPublicLinks({
  proto: "https",
  host: "ui.example.com",
  config: base,
});
assert(links.primary.url.includes("/live-sports/overview/"), "primary link path");
assert(links.secondary.url.includes("/markets/overview/"), "secondary link path");
assert(links.byLocale.fa?.dir === "rtl", "fa is rtl");

if (failed) {
  console.error(`${failed} test(s) failed`);
  process.exit(1);
}
console.log("All translation pipeline checks passed.");
