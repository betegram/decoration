/**
 * Reusable generated-link blocks for admin ERP UI.
 */

export function escHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderGeneratedLink(link, { tag = "div" } = {}) {
  if (!link?.url) return "";
  const label = link.label || "Public link";
  return `
    <${tag} class="gen-link">
      <div class="gen-link-head">
        <span class="gen-link-label">${escHtml(label)}</span>
        ${link.status ? `<span class="gen-link-status status-${escHtml(link.status)}">${escHtml(link.status)}</span>` : ""}
      </div>
      <div class="gen-link-row">
        <input class="gen-link-input" readonly value="${escHtml(link.url)}" aria-label="${escHtml(label)}" />
        <button type="button" class="btn ghost sm" data-copy="${escHtml(link.url)}">Copy</button>
        <a class="btn ghost sm" href="${escHtml(link.url)}" target="_blank" rel="noopener noreferrer">Open</a>
      </div>
    </${tag}>`;
}

export function renderLinksPanel(links) {
  if (!links) return "";
  const primary = renderGeneratedLink(links.primary, { tag: "div" });
  const secondary = renderGeneratedLink(links.secondary, { tag: "div" });
  const localeRows = Object.values(links.byLocale || {})
    .map((loc) => {
      const st = loc.status || "pending";
      return `<div class="locale-link-row">
        <div class="locale-link-meta">
          <strong>${escHtml(loc.label)}</strong>
          <span class="gen-link-status status-${escHtml(st)}">${escHtml(st)}</span>
          ${loc.dir === "rtl" ? '<span class="tag-rtl">RTL</span>' : ""}
        </div>
        <div class="gen-link-row">
          <input class="gen-link-input" readonly value="${escHtml(loc.url)}" />
          <button type="button" class="btn ghost sm" data-copy="${escHtml(loc.url)}">Copy</button>
          <a class="btn ghost sm" href="${escHtml(loc.url)}" target="_blank" rel="noopener noreferrer">Open</a>
        </div>
      </div>`;
    })
    .join("");
  return `
    <div class="links-panel">
      <h3>Generated links</h3>
      <p class="hint">Canonical URLs from the server — copy or open directly.</p>
      ${primary}
      ${secondary}
      ${localeRows ? `<div class="locale-links"><h4>Localized public URLs</h4>${localeRows}</div>` : ""}
    </div>`;
}

export function bindCopyButtons(root = document) {
  root.querySelectorAll("[data-copy]").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const text = btn.dataset.copy;
      if (text) navigator.clipboard.writeText(text);
    });
  });
}
