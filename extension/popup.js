const $ = (id) => document.getElementById(id);
const status = (msg, cls = "") => { $("status").textContent = msg; $("status").className = cls; };

chrome.storage.local.get("pack").then(({ pack }) => {
  if (pack) {
    $("pack").value = JSON.stringify(pack, null, 2);
    status(`Loaded: ${pack.company ?? "?"} — ${pack.role ?? "?"}`, "ok");
  }
});

$("save").onclick = async () => {
  try {
    const pack = JSON.parse($("pack").value);
    await chrome.storage.local.set({ pack });
    status(`Loaded: ${pack.company ?? "?"} — ${pack.role ?? "?"}`, "ok");
  } catch (e) {
    status("Invalid JSON: " + e.message, "err");
  }
};

$("fill").onclick = async () => {
  const { pack } = await chrome.storage.local.get("pack");
  if (!pack) return status("Load a pack first.", "err");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    const [{ result: report }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (p) => window.__jobopsFill(p),
      args: [pack],
    });
    const lines = [
      `Filled: ${report.filled.length} field(s)`,
      ...report.filled.map((f) => `  ✓ ${f}`),
      report.skipped.length ? `Unmatched (fill by hand):` : "",
      ...report.skipped.map((f) => `  · ${f}`),
      "", "Review everything, attach the resume, then submit yourself.",
    ].filter(Boolean);
    status(lines.join("\n"), report.filled.length ? "ok" : "warn");
  } catch (e) {
    status("Could not fill this page: " + e.message, "err");
  }
};
