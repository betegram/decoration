/**
 * OpenAI-powered batch translation for i18n strings.
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
const OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
const OPENAI_BASE = process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1";

export function isOpenAiConfigured() {
  return Boolean(OPENAI_API_KEY);
}

/**
 * Translate a map of key → source text into target locale.
 * Returns { key → translated text }.
 */
export async function translateWithOpenAI({
  sourceLocale,
  targetLocale,
  targetLabel,
  items,
}) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  if (!items || Object.keys(items).length === 0) return {};

  const system = `You are a professional UI translator for a sports betting / iGaming product.
Translate JSON string values from ${sourceLocale} to ${targetLabel || targetLocale}.
Rules:
- Return ONLY valid JSON with the same keys as input.
- Keep HTML tags, placeholders like {{count}}, {{live}}, and brand names when appropriate.
- Use natural, concise UI copy (buttons, labels, errors).
- Do not translate keys, only values.
- Preserve emoji and special symbols if present.`;

  const user = JSON.stringify(items, null, 2);

  const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${raw.slice(0, 240)}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("OpenAI returned invalid JSON envelope");
  }

  const content = parsed.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty content");

  let translations;
  try {
    translations = JSON.parse(content);
  } catch {
    throw new Error("OpenAI content is not valid JSON");
  }

  const out = {};
  for (const key of Object.keys(items)) {
    if (translations[key] != null && String(translations[key]).trim()) {
      out[key] = String(translations[key]).trim();
    }
  }
  return out;
}
