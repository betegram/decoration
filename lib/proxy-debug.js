const SENSITIVE = /cookie|authorization|token|password|secret|api[_-]?key/i;

export const PROXY_DEBUG = process.env.PROXY_DEBUG === "true";

function redactValue(key, value) {
  if (SENSITIVE.test(key)) return "[redacted]";
  if (typeof value !== "string") return value;
  if (value.length > 120) return value.slice(0, 80) + "…";
  return value;
}

function redact(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) out[k] = v.map((x) => (typeof x === "string" ? redactValue(k, x) : x));
    else out[k] = redactValue(k, v);
  }
  return out;
}

export function proxyLog(phase, detail = {}) {
  if (!PROXY_DEBUG) return;
  const ts = new Date().toISOString();
  console.log(`[PROXY ${ts}] ${phase}`, JSON.stringify(redact(detail)));
}
