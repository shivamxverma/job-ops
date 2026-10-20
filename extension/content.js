// JobOps content script: exposes window.__jobopsFill(pack).
// Fills text inputs/textareas/selects by matching their visible label against
// identity fields and pack.answers[].match regexes. Never touches submit buttons.
(() => {
  if (window.__jobopsFill) return;

  const IDENTITY_MATCHERS = [
    { key: "first_name", re: /first\s*name/i },
    { key: "last_name", re: /last\s*name|surname|family\s*name/i },
    { key: "full_name", re: /^(full\s*)?name$|your\s*name/i },
    { key: "email", re: /e-?mail/i },
    { key: "phone", re: /phone|mobile/i },
    { key: "linkedin", re: /linkedin/i },
    { key: "github", re: /github/i },
    { key: "portfolio", re: /portfolio|website|personal\s*site|url/i },
    { key: "twitter", re: /twitter|\bx\b.*(profile|handle)/i },
    { key: "location", re: /location|where.*based|current.*city/i },
    { key: "city", re: /^city/i },
    { key: "country", re: /country/i },
  ];

  function labelFor(el) {
    // aria-label, associated <label>, wrapping label, placeholder, name — first hit wins.
    const aria = el.getAttribute("aria-label");
    if (aria) return aria;
    if (el.labels && el.labels.length) return [...el.labels].map((l) => l.textContent).join(" ");
    if (el.id) {
      const lab = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lab) return lab.textContent;
    }
    const wrap = el.closest("label");
    if (wrap) return wrap.textContent;
    // Greenhouse/Ashby often put the question text in a sibling/ancestor block
    const container = el.closest("[class*=field], [class*=question], .application-question, div");
    if (container) {
      const q = container.querySelector("label, legend, [class*=label], [class*=Question]");
      if (q) return q.textContent;
    }
    return el.placeholder || el.name || "";
  }

  function setValue(el, value) {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    setter ? setter.call(el, value) : (el.value = value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  window.__jobopsFill = (pack) => {
    const filled = [], skipped = [];
    const answers = (pack.answers ?? []).map((a) => ({
      res: a.match.map((m) => new RegExp(m, "i")),
      text: a.text,
    }));

    const fields = document.querySelectorAll(
      'input[type=text], input[type=email], input[type=tel], input[type=url], input:not([type]), textarea'
    );
    for (const el of fields) {
      if (el.value && el.value.trim()) continue; // never overwrite what's already there
      if (el.closest("[aria-hidden=true]") || el.offsetParent === null) continue;
      const label = labelFor(el).trim().replace(/\s+/g, " ").slice(0, 120);
      if (!label) continue;

      let value = null;
      for (const { key, re } of IDENTITY_MATCHERS) {
        if (re.test(label) && pack.identity?.[key]) { value = pack.identity[key]; break; }
      }
      if (value === null) {
        for (const a of answers) {
          if (a.res.some((re) => re.test(label))) { value = a.text; break; }
        }
      }
      if (value !== null && value !== "") {
        setValue(el, value);
        filled.push(label);
      } else if (el.required || el.tagName === "TEXTAREA") {
        skipped.push(label);
      }
    }
    return { filled, skipped };
  };
  return true;
})();
