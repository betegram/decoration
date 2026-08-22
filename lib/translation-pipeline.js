/**
 * Automatic translation pipeline — source-first, async jobs, audit metadata.
 */
import { createHash } from "crypto";
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  STRING_CATALOG,
  defaultEnglishBundle,
  normalizeSiteConfig,
  keysForAiTranslate,
} from "./i18n.js";
import { translateWithOpenAI, isOpenAiConfigured } from "./openai.js";

export const DEFAULT_GLOSSARY = [
  { term: "Live", rule: "keep" },
  { term: "Markets", rule: "keep" },
  { term: "AURUM", rule: "keep" },
  { term: "Odds", rule: "preferred", hint: "betting odds / prices" },
  { term: "Bet Slip", rule: "preferred", hint: "sportsbook ticket panel" },
  { term: "Ticket", rule: "preferred", hint: "bet selection slip" },
  { term: "Event", rule: "preferred", hint: "sporting match" },
  { term: "Cash Out", rule: "preferred" },
  { term: "Free Bet", rule: "preferred" },
];

let jobRunning = false;
let jobSnapshot = null;

function now() {
  return new Date().toISOString();
}

export function computeSourceHash(config) {
  const norm = normalizeSiteConfig(config);
  const src = norm.i18n?.defaultLocale || DEFAULT_LOCALE;
  const bundle = norm.translations?.[src] || {};
  const keys = Object.keys(STRING_CATALOG).sort();
  const payload = keys.map((k) => `${k}=${bundle[k] ?? ""}`).join("\n");
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

function ensureTranslationMeta(config) {
  if (!config.translationMeta) {
    config.translationMeta = { revision: 0, sourceHash: "", locales: {}, job: null };
  }
  if (!config.translationMeta.locales) config.translationMeta.locales = {};
  if (!config.i18n.glossary || !config.i18n.glossary.length) {
    config.i18n.glossary = structuredClone(DEFAULT_GLOSSARY);
  }
  return config;
}

export function initLocaleMeta(config, locale, status, extra = {}) {
  const prev = config.translationMeta.locales[locale] || {};
  config.translationMeta.locales[locale] = {
    ...prev,
    locale,
    status,
    updatedAt: now(),
    revision: config.translationMeta.revision,
    provider: extra.provider ?? prev.provider ?? null,
    retryCount: extra.retryCount ?? prev.retryCount ?? 0,
    error: extra.error ?? null,
  };
}

export function prepareConfigAfterSave(config, previousHash) {
  const norm = ensureTranslationMeta(normalizeSiteConfig(config));
  const source = norm.i18n.defaultLocale || DEFAULT_LOCALE;
  const newHash = computeSourceHash(norm);
  const sourceChanged = previousHash && previousHash !== newHash;

  if (!norm.translationMeta.sourceHash || sourceChanged) {
    norm.translationMeta.sourceHash = newHash;
    norm.translationMeta.revision = (norm.translationMeta.revision || 0) + 1;
  }

  for (const loc of norm.i18n.enabledLocales) {
    if (loc === source) {
      initLocaleMeta(norm, loc, "source", { provider: null, error: null });
      continue;
    }
    const cur = norm.translationMeta.locales[loc]?.status;
    if (sourceChanged && (cur === "generated" || cur === "published")) {
      initLocaleMeta(norm, loc, "outdated");
    } else if (!cur || cur === "pending") {
      initLocaleMeta(norm, loc, "pending");
    }
  }

  return norm;
}

export function getJobSnapshot() {
  return jobSnapshot;
}

export function localesNeedingTranslation(config, onlyLocales = null) {
  const norm = normalizeSiteConfig(config);
  const source = norm.i18n.defaultLocale || DEFAULT_LOCALE;
  const targets = (onlyLocales || norm.i18n.enabledLocales).filter((l) => l !== source);
  return targets.filter((loc) => {
    const st = norm.translationMeta?.locales?.[loc]?.status;
    return st === "pending" || st === "outdated" || st === "failed";
  });
}

/**
 * Run translation job (non-blocking). Mutates and persists via saveFn.
 */
export async function runTranslationJob(config, saveFn, { locales = null } = {}) {
  if (jobRunning) return jobSnapshot;
  if (!isOpenAiConfigured()) {
    jobSnapshot = { running: false, error: "OPENAI_API_KEY not configured", completedAt: now() };
    return jobSnapshot;
  }

  const norm = normalizeSiteConfig(config);
  const targets = localesNeedingTranslation(norm, locales);
  if (!targets.length) {
    jobSnapshot = { running: false, completedAt: now(), pending: [], completed: [], failed: [] };
    return jobSnapshot;
  }

  jobRunning = true;
  jobSnapshot = {
    running: true,
    startedAt: now(),
    pending: [...targets],
    completed: [],
    failed: [],
    sourceLocale: norm.i18n.defaultLocale,
    revision: norm.translationMeta.revision,
  };

  const glossary = norm.i18n.glossary || DEFAULT_GLOSSARY;
  let working = norm;

  for (const locale of targets) {
    initLocaleMeta(working, locale, "generating");
    working = await saveFn(working);

    try {
      const items = keysForAiTranslate(working, locale, "all");
      if (!Object.keys(items).length) {
        initLocaleMeta(working, locale, "generated", { provider: "openai" });
      } else {
        const translated = await translateWithOpenAI({
          sourceLocale: working.i18n.defaultLocale,
          targetLocale: locale,
          targetLabel: LOCALE_META[locale]?.label || locale,
          items,
          glossary,
        });
        if (!working.translations[locale]) working.translations[locale] = {};
        Object.assign(working.translations[locale], translated);
        initLocaleMeta(working, locale, "generated", { provider: "openai", error: null });
      }
      working = await saveFn(working);
      jobSnapshot.completed.push(locale);
      jobSnapshot.pending = jobSnapshot.pending.filter((l) => l !== locale);
    } catch (err) {
      const prev = working.translationMeta.locales[locale]?.retryCount || 0;
      initLocaleMeta(working, locale, "failed", {
        provider: "openai",
        error: String(err.message || err).slice(0, 240),
        retryCount: prev + 1,
      });
      working = await saveFn(working);
      jobSnapshot.failed.push({ locale, error: String(err.message || err).slice(0, 240) });
      jobSnapshot.pending = jobSnapshot.pending.filter((l) => l !== locale);
    }
  }

  jobSnapshot.running = false;
  jobSnapshot.completedAt = now();
  jobRunning = false;
  working.translationMeta.job = { ...jobSnapshot };
  await saveFn(working);
  return jobSnapshot;
}

export function scheduleTranslationJob(config, saveFn, opts = {}) {
  setImmediate(() => {
    runTranslationJob(config, saveFn, opts).catch((err) => {
      console.error("Translation job error:", err.message);
      jobRunning = false;
      jobSnapshot = {
        running: false,
        error: String(err.message),
        completedAt: now(),
      };
    });
  });
}
