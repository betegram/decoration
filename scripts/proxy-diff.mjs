/**
 * Phase A differential HTTP smoke compare (original vs proxy).
 * Usage: node scripts/proxy-diff.mjs
 */
const ORIG = process.env.ORIGINAL_BASE || "https://iframedev1.thesportslab.eu";
const PROXY = process.env.PROXY_BASE || "https://ui.kycland.xyz";
const BS = process.env.BS_UPSTREAM || "https://bs-iframedev1.thesportslab.eu";

const checks = [
  { label: "overview HTML", a: `${ORIG}/live-sports/overview/1`, b: `${PROXY}/live-sports/overview/1` },
  { label: "main JS bundle", a: `${ORIG}/assets/index-c14111cb.js`, b: `${PROXY}/assets/index-c14111cb.js` },
  { label: "main CSS", a: `${ORIG}/assets/index-d90b4e09.css`, b: `${PROXY}/assets/index-d90b4e09.css` },
  { label: "board.css", a: null, b: `${PROXY}/board.css` },
  { label: "BS sports/today", a: `${BS}/sports/today`, b: `${PROXY}/api/bs/sports/today` },
];

async function probe(url) {
  const res = await fetch(url, {
    headers: { Accept: "*/*", "User-Agent": "AURUM-ProxyDiff/1.0" },
    redirect: "follow",
  });
  const buf = await res.arrayBuffer();
  const text = new TextDecoder().decode(buf.slice(0, 200));
  const kind = res.headers.get("content-type") || "";
  const isHtml = kind.includes("html") || text.trimStart().startsWith("<!");
  const isJson = kind.includes("json") || text.trimStart().startsWith("[") || text.trimStart().startsWith("{");
  return {
    status: res.status,
    type: kind.split(";")[0],
    size: buf.byteLength,
    isHtml,
    isJson,
    sniff: text.slice(0, 60).replace(/\s+/g, " "),
  };
}

console.log(`ORIGINAL: ${ORIG}`);
console.log(`PROXY:    ${PROXY}`);
console.log("");

let firstDivergence = null;

for (const c of checks) {
  console.log(`--- ${c.label} ---`);
  if (c.a) {
    const a = await probe(c.a);
    console.log(`A  ${a.status} ${a.type} ${a.size}B  ${a.sniff}`);
  }
  const b = await probe(c.b);
  console.log(`B  ${b.status} ${b.type} ${b.size}B  ${b.sniff}`);

  if (c.a) {
    const a = await probe(c.a);
    const diverge =
      a.status !== b.status ||
      (c.label.includes("JS") && b.size < a.size * 0.5) ||
      (c.label === "board.css" && b.isHtml) ||
      (c.label === "overview HTML" && b.sniff.includes("markets.js") && !a.sniff.includes("index-c14111cb"));
    if (diverge && !firstDivergence) {
      firstDivergence = c.label;
      console.log(">>> DIVERGENCE");
    }
  } else if (b.isHtml && c.label === "board.css") {
    if (!firstDivergence) firstDivergence = c.label;
    console.log(">>> DIVERGENCE (board.css returned HTML)");
  }
  console.log("");
}

if (firstDivergence) {
  console.log(`FIRST DIVERGENCE: ${firstDivergence}`);
  process.exit(1);
}
console.log("No obvious HTTP divergences in smoke set.");
