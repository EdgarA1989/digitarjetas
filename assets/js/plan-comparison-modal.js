(function () {
  const MODAL_ID = "plan-comparison-modal";
  const TRIGGER_SELECTOR = "[data-open-plan-comparison]";
  let lastFocusedElement = null;
  let previousBodyOverflow = "";

  function getData() {
    return window.PlanComparisonData || { title: "", subtitle: "", featureTitle: "", features: [], plans: [] };
  }

  function isIncluded(plan, featureId) {
    return Array.isArray(plan.included) && plan.included.includes(featureId);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderPlanHead(plan) {
    return `
      <div class="pcm-plan-head pcm-plan-head--${escapeHtml(plan.tone)}${plan.featured ? " is-featured" : ""}">
        ${plan.badge ? `<span class="pcm-badge">${escapeHtml(plan.badge)}</span>` : ""}
        <strong>${escapeHtml(plan.shortName || plan.name)}</strong>
        <small>${escapeHtml(plan.description)}</small>
      </div>
    `;
  }

  function renderTable(data) {
    return `
      <div class="pcm-table-wrap">
        <table class="pcm-table">
          <thead>
            <tr>
              <th>${escapeHtml(data.featureTitle)}</th>
              ${data.plans.map(plan => `<th>${renderPlanHead(plan)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data.features.map(feature => `
              <tr>
                <th>${escapeHtml(feature.label)}</th>
                ${data.plans.map(plan => `
                  <td class="${isIncluded(plan, feature.id) ? "is-included" : "is-muted"}">
                    <span aria-label="${isIncluded(plan, feature.id) ? "Incluido" : "No incluido"}">
                      ${isIncluded(plan, feature.id) ? "✓" : "—"}
                    </span>
                  </td>
                `).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderMobileCards(data) {
    return `
      <div class="pcm-mobile-plans">
        ${data.plans.map(plan => {
          const included = data.features.filter(feature => isIncluded(plan, feature.id));
          return `
            <article class="pcm-mobile-card pcm-mobile-card--${escapeHtml(plan.tone)}${plan.featured ? " is-featured" : ""}">
              <header>
                ${plan.badge ? `<span class="pcm-badge">${escapeHtml(plan.badge)}</span>` : ""}
                <h3>${escapeHtml(plan.name)}</h3>
                <p>${escapeHtml(plan.description)}</p>
              </header>
              <div class="pcm-mobile-list">
                <h4>Incluye</h4>
                <ul>
                  ${included.map(feature => `<li><span>✓</span>${escapeHtml(feature.label)}</li>`).join("")}
                </ul>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  function createModal() {
    const data = getData();
    const modal = document.createElement("div");
    modal.className = "pcm-modal";
    modal.id = MODAL_ID;
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="pcm-overlay" data-plan-comparison-close></div>
      <section class="pcm-dialog" role="dialog" aria-modal="true" aria-labelledby="pcm-title" aria-describedby="pcm-subtitle">
        <button class="pcm-close" type="button" aria-label="Cerrar comparativa de planes" data-plan-comparison-close>&times;</button>
        <header class="pcm-header">
          <span>Comparativa de planes</span>
          <h2 id="pcm-title">${escapeHtml(data.title)}</h2>
          <p id="pcm-subtitle">${escapeHtml(data.subtitle)}</p>
        </header>
        ${renderTable(data)}
        ${renderMobileCards(data)}
      </section>
    `;

    modal.addEventListener("click", event => {
      if (event.target.closest("[data-plan-comparison-close]")) close();
    });

    document.body.append(modal);
    return modal;
  }

  function getModal() {
    return document.getElementById(MODAL_ID) || createModal();
  }

  function getFocusableElements(modal) {
    return Array.from(modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"))
      .filter(element => !element.disabled && element.offsetParent !== null);
  }

  function normalizeTheme(theme) {
    if (theme === "light" || theme === "dark") return theme;
    if (document.documentElement.dataset.theme === "dark" || document.body.classList.contains("dark")) return "dark";
    return "light";
  }

  function open(options = {}) {
    const modal = getModal();
    const theme = normalizeTheme(options.theme);
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    previousBodyOverflow = document.body.style.overflow || "";

    modal.dataset.theme = theme;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    window.setTimeout(() => {
      modal.querySelector(".pcm-close")?.focus();
    }, 20);
  }

  function close() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal || !modal.classList.contains("is-open")) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousBodyOverflow;
    lastFocusedElement?.focus?.();
    lastFocusedElement = null;
  }

  function onKeydown(event) {
    const modal = document.getElementById(MODAL_ID);
    if (!modal || !modal.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = getFocusableElements(modal);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function bindTriggers() {
    document.addEventListener("click", event => {
      const trigger = event.target.closest(TRIGGER_SELECTOR);
      if (!trigger) return;

      event.preventDefault();
      open({ theme: trigger.dataset.theme });
    });
    document.addEventListener("keydown", onKeydown);
  }

  function init() {
    if (window.PlanComparisonModal?.initialized) return;
    bindTriggers();
    window.PlanComparisonModal.initialized = true;
  }

  window.PlanComparisonModal = {
    initialized: false,
    open,
    close,
    init,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
