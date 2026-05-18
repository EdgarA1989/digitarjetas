// Componente reutilizable para demos.
// En cada demo definir antes de este archivo:
// const CURRENT_TEMPLATE = "aurora";
// const CURRENT_PLAN = "plus"; // "esencial", "plus" o "premium"
// Cambiar DEMO_WHATSAPP_NUMBER por el numero real.
const DEMO_WHATSAPP_NUMBER = "549XXXXXXXXXX";

// Para agregar una nueva plantilla o demo Plus:
// 1. Crear la carpeta correspondiente: ../../quince-plus/nombre-plantilla/
// 2. Agregar el slug en este mapa.
// 3. Dejar vacio el plan que todavia no exista.
const templateLinks = {
  aurora: {
    esencial: "../../quince/aurora/",
    plus: "../../quince-plus/aurora/",
    premium: "../../quince-premium/aurora/",
    label: "Aurora",
  },
  "urban-glow": {
    esencial: "../../quince/urban-glow/",
    plus: "../../quince-plus/urban-glow/",
    premium: "../../quince-premium/urban-glow/",
    label: "Urban Glow",
  },
  "blue-night": {
    esencial: "../../quince/blue-night/",
    plus: "../../quince-plus/blue-night/",
    premium: "../../quince-premium/blue-night/",
    label: "Blue Night",
  },
  "black-white": {
    esencial: "../../quince/black-white/",
    plus: "../../quince-plus/black-white/",
    premium: "../../quince-premium/black-white/",
    label: "Black White",
  },
  "neon-party": {
    esencial: "../../quince/neon-party/",
    plus: "../../quince-plus/neon-party/",
    premium: "../../quince-premium/neon-party/",
    label: "Neon Party",
  },
  "verde-menta": {
    esencial: "../../quince/verde-menta/",
    plus: "../../quince-plus/verde-menta/",
    premium: "../../quince-premium/verde-menta/",
    label: "Verde Menta",
  },
  "bautismo-celeste": {
    esencial: "../../bautismo-esencial/bautismo-celeste/",
    plus: "../../bautismo-plus/bautismo-celeste/",
    premium: "../../bautismo-premium/bautismo-celeste/",
    label: "Bautismo Celeste",
  },
  "bautismo-rosa": {
    esencial: "../../bautismo-esencial/bautismo-rosa/",
    plus: "../../bautismo-plus/bautismo-rosa/",
    premium: "../../bautismo-premium/bautismo-rosa/",
    label: "Bautismo Rosa",
  },
};

const demoPlanLabels = {
  esencial: "Plan Esencial",
  plus: "Plan Plus",
  premium: "Plan Premium",
};

const legacyModeToPlan = {
  whatsapp: "esencial",
  formulario: "premium",
};

document.addEventListener("DOMContentLoaded", () => {
  initDemoMediaState();
  initDemoPlanSwitcher();
  initDemoLightboxState();
  initDemoCommercialCta();
});

function initDemoMediaState() {
  fetch("config.json")
    .then(response => response.json())
    .then(config => {
      const hasPhotos = (Array.isArray(config.fotos) && config.fotos.length > 0)
        || (Array.isArray(config.photos) && config.photos.length > 0)
        || (Array.isArray(config.assets?.gallery) && config.assets.gallery.length > 0);
      const hasMusic = Boolean(config.assets?.musicPath) || Boolean(config.musica?.src) || Boolean(config.music?.src);
      document.body.classList.toggle("dt-no-media", !hasPhotos && !hasMusic);
    })
    .catch(() => {});
}

function getCurrentTemplate() {
  return typeof CURRENT_TEMPLATE !== "undefined" ? CURRENT_TEMPLATE : window.CURRENT_TEMPLATE;
}

function getCurrentPlan() {
  const currentPlan = typeof CURRENT_PLAN !== "undefined" ? CURRENT_PLAN : window.CURRENT_PLAN;
  if (currentPlan) return currentPlan;

  const legacyMode = typeof CURRENT_MODE !== "undefined" ? CURRENT_MODE : window.CURRENT_MODE;
  return legacyModeToPlan[legacyMode] || "esencial";
}

function initDemoPlanSwitcher() {
  const currentTemplate = getCurrentTemplate();
  const currentPlan = getCurrentPlan();
  const links = templateLinks[currentTemplate];
  if (!links) return;

  document.querySelectorAll(".dt-mode-switcher").forEach(element => element.remove());

  const availablePlans = Object.entries(demoPlanLabels).filter(([plan]) => Boolean(links[plan]));
  if (availablePlans.length < 1) return;

  const bar = document.createElement("nav");
  bar.className = "dt-plan-bar";
  bar.setAttribute("aria-label", "Versiones de la plantilla por plan");
  bar.innerHTML = `
    <button class="dt-plan-trigger" type="button" aria-expanded="false" aria-controls="dt-plan-menu">
      <span>Otras versiones</span>
      <span class="dt-plan-trigger__icon" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>
    <div class="dt-plan-menu" id="dt-plan-menu" hidden>
      ${availablePlans.map(([plan, label]) => `
        <button
          class="dt-plan-button${plan === currentPlan ? " is-active" : ""}"
          type="button"
          data-demo-plan-button="${plan}"
          ${plan === currentPlan ? "aria-current=\"page\"" : ""}
        >
          ${label.replace("Plan ", "")}
        </button>
      `).join("")}
      <a class="dt-plan-link" href="../../../#plantillas">Volver</a>
    </div>
  `;

  const trigger = bar.querySelector(".dt-plan-trigger");
  const menu = bar.querySelector(".dt-plan-menu");
  const closeMenu = () => {
    bar.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  };

  trigger.addEventListener("click", () => {
    const isOpen = bar.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(isOpen));
    menu.hidden = !isOpen;
  });

  bar.querySelectorAll("[data-demo-plan-button]").forEach(button => {
    button.addEventListener("click", () => {
      const plan = button.dataset.demoPlanButton;
      if (plan === currentPlan) return;
      const target = links[plan];
      if (target) window.location.href = target;
    });
  });

  document.body.prepend(bar);

  document.addEventListener("click", event => {
    if (!bar.classList.contains("is-open") || bar.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !bar.classList.contains("is-open")) return;
    closeMenu();
    trigger.focus();
  });
}

function initDemoCommercialCta() {
  const currentTemplate = getCurrentTemplate();
  const currentPlan = getCurrentPlan();
  const links = templateLinks[currentTemplate];
  if (!links) return;

  document.querySelectorAll("[data-demo-template-name]").forEach(element => {
    element.textContent = links.label;
  });

  const whatsapp = document.querySelector("[data-demo-whatsapp]");
  if (whatsapp) {
    const planLabel = demoPlanLabels[currentPlan] || "Plan Esencial";
    const message = `Hola, quiero consultar por la plantilla ${links.label} en ${planLabel}.`;
    whatsapp.href = `https://wa.me/${DEMO_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  document.querySelectorAll("[data-demo-back]").forEach(element => element.remove());

  document.querySelectorAll(".dt-demo-cta__actions").forEach(actions => {
    if (actions.querySelector("[data-demo-return]")) return;

    const backLink = document.createElement("a");
    backLink.href = "../../../#plantillas";
    backLink.textContent = "Volver";
    backLink.setAttribute("data-demo-return", "");
    actions.append(backLink);
  });
}

function initDemoLightboxState() {
  const getOpenLightbox = () => document.querySelector(".lightbox.open");
  const getOpenRsvp = () => document.querySelector(".rsvp-overlay.open");
  const galleryTarget = () => document.getElementById("galeria")
    || document.querySelector(".galeria-section")
    || document.querySelector(".galeria");
  const confirmTarget = () => document.getElementById("confirmar")
    || document.querySelector(".confirmar-section")
    || document.querySelector(".confirmar");

  let lightboxHistoryActive = false;
  let rsvpHistoryActive = false;

  const syncOverlayState = () => {
    document.body.classList.toggle("dt-lightbox-open", Boolean(getOpenLightbox()));
    document.body.classList.toggle("dt-rsvp-open", Boolean(getOpenRsvp()));
  };

  const closeLightbox = () => {
    const lightbox = getOpenLightbox();
    if (!lightbox) return;

    lightbox.querySelector(".lightbox-close")?.click();
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    syncOverlayState();

    window.setTimeout(() => {
      galleryTarget()?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const closeRsvp = () => {
    const rsvp = getOpenRsvp();
    if (!rsvp) return;

    rsvp.querySelector("#rsvp-close")?.click();
    rsvp.classList.remove("open");
    rsvp.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    syncOverlayState();

    window.setTimeout(() => {
      confirmTarget()?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  document.addEventListener("click", event => {
    const galleryClick = event.target.closest(".galeria-item, .gallery-item, #galeria-grid img");
    if (!galleryClick) return;

    window.setTimeout(() => {
      if (!getOpenLightbox() || lightboxHistoryActive) {
        syncOverlayState();
        return;
      }

      lightboxHistoryActive = true;
      history.pushState({ dtLightbox: true }, "", "#galeria");
      syncOverlayState();
    }, 0);
  });

  document.addEventListener("click", event => {
    if (!event.target.closest("#btn-asiste")) return;

    window.setTimeout(() => {
      if (!getOpenRsvp() || rsvpHistoryActive) {
        syncOverlayState();
        return;
      }

      rsvpHistoryActive = true;
      history.pushState({ dtRsvp: true }, "", "#confirmar");
      syncOverlayState();
    }, 0);
  });

  window.addEventListener("popstate", () => {
    if (rsvpHistoryActive) {
      rsvpHistoryActive = false;
      closeRsvp();
      return;
    }

    if (lightboxHistoryActive) {
      lightboxHistoryActive = false;
      closeLightbox();
    }
  });

  const observer = new MutationObserver(syncOverlayState);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class", "aria-hidden", "style"],
    subtree: true,
  });

  syncOverlayState();
}


