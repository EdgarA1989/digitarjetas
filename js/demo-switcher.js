// Componente reutilizable para demos.
// En cada demo definir antes de este archivo:
// const CURRENT_TEMPLATE = "aurora";
// const CURRENT_PLAN = "plus"; // "esencial", "plus" o "premium"
// Cambiar DEMO_WHATSAPP_NUMBER por el numero real.
const DEMO_WHATSAPP_NUMBER = "5491151498796";

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
  "casamiento-editorial-olivo": {
    esencial: "../../casamiento-escencial/casamiento-editorial-olivo/",
    plus:     "../../casamiento-plus/casamiento-editorial-olivo/",
    premium:  "../../casamiento-premium/casamiento-editorial-olivo/",
    label:    "Editorial Olivo",
  },
  "casamiento-dorado": {
    esencial: "../../casamiento-escencial/casamiento-dorado/",
    plus:     "../../casamiento-plus/casamiento-dorado/",
    premium:  "../../casamiento-premium/casamiento-dorado/",
    label:    "Casamiento Dorado",
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
  initDemoAudioLifecycle();
  initDemoPlanSwitcher();
  initDemoPlansModal();
  initDemoLightboxState();
  initDemoCommercialCta();
  initDemoPlanSwitch();
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

function pauseDemoAudio() {
  document.querySelectorAll("#musica-btn.playing, #player-btn.playing").forEach(button => {
    button.click();
  });

  document.querySelectorAll("audio").forEach(audio => {
    if (!audio.paused) audio.pause();
  });

  document.querySelectorAll("#musica-btn, #player-btn").forEach(button => {
    const playIcon = button.querySelector(".icon-play");
    const pauseIcon = button.querySelector(".icon-pause");

    if (button.classList.contains("playing")) button.classList.remove("playing");
    if (button.getAttribute("aria-label") !== "Reproducir") {
      button.setAttribute("aria-label", "Reproducir");
    }
    if (playIcon) playIcon.style.display = "";
    if (pauseIcon) pauseIcon.style.display = "none";
  });

  document.querySelectorAll("#musica-waves, #eq-bars").forEach(element => {
    if (element.classList.contains("active")) element.classList.remove("active");
  });
  document.querySelectorAll("#musica-esfera").forEach(element => {
    if (element.classList.contains("sonando")) element.classList.remove("sonando");
  });
  document.querySelectorAll("#musica-disc").forEach(element => {
    if (element.classList.contains("spinning")) element.classList.remove("spinning");
  });
}

function initDemoAudioLifecycle() {
  const shouldPauseForClick = target => {
    const externalLink = target.closest("a[href]");
    if (externalLink) {
      const href = externalLink.getAttribute("href") || "";
      if (/^(https?:|mailto:|tel:)/i.test(href) || externalLink.target === "_blank") {
        return true;
      }
    }

    return Boolean(target.closest(
      "#btn-asiste, #btn-wa, #btn-whatsapp, #btn-ics, #btn-calendario, " +
      "[data-plus-rsvp-submit], [data-demo-plan-button], [data-demo-plans], " +
      "[data-demo-return], [data-demo-whatsapp]"
    ));
  };

  const hasBlockingOverlay = () => document.querySelector(
    ".lightbox.open, .rsvp-overlay.open, .plus-rsvp:not([hidden]), .dt-plans-modal.is-open"
  );

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") pauseDemoAudio();
  });
  window.addEventListener("blur", pauseDemoAudio);
  window.addEventListener("pagehide", pauseDemoAudio);

  document.addEventListener("click", event => {
    if (event.target instanceof Element && shouldPauseForClick(event.target)) {
      pauseDemoAudio();
    }
  }, true);

  const observer = new MutationObserver(() => {
    if (hasBlockingOverlay()) pauseDemoAudio();
  });
  observer.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "hidden", "aria-hidden"],
  });
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
  if (availablePlans.length < 2) return;

  const bar = document.createElement("nav");
  bar.className = "dt-plan-bar";
  bar.setAttribute("aria-label", "Versiones de la plantilla por plan");
  bar.innerHTML = `
    <button class="dt-plan-trigger" type="button" aria-expanded="false" aria-controls="dt-plan-menu">
      <span class="dt-plan-trigger__text">
        <small>Elegir plan</small>
        <strong>${demoPlanLabels[currentPlan] || "Plan Esencial"}</strong>
      </span>
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
      <button class="dt-plan-link" type="button" data-demo-plans>Planes</button>
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
      if (!target) return;
      sessionStorage.setItem("dt-skip-cover", "1");
      window.location.href = target;
    });
  });

  bar.querySelector("[data-demo-plans]")?.addEventListener("click", () => {
    closeMenu();
    openDemoPlansModal();
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

function initDemoPlansModal() {
  injectDemoPlansModalStyles();
  getDemoPlansModal();

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeDemoPlansModal();
  });
}

function getDemoPlansModal() {
  let modal = document.getElementById("dt-plans-modal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.className = "dt-plans-modal";
  modal.id = "dt-plans-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="dt-plans-modal__backdrop" data-dt-plans-close></div>
    <section class="dt-plans-modal__card" role="dialog" aria-modal="true" aria-labelledby="dt-plans-modal-title">
      <button class="dt-plans-modal__close" type="button" aria-label="Cerrar" data-dt-plans-close>&times;</button>
      <div class="dt-plans-modal__header">
        <span>Comparar planes</span>
        <h2 id="dt-plans-modal-title">Elegí el plan ideal para tu invitación</h2>
      </div>
      <img class="dt-plans-modal__image" src="" alt="Comparativa de planes DigiTarjetas">
    </section>
  `;

  modal.querySelectorAll("[data-dt-plans-close]").forEach(element => {
    element.addEventListener("click", closeDemoPlansModal);
  });

  document.body.append(modal);
  return modal;
}

function openDemoPlansModal() {
  const modal = getDemoPlansModal();
  const image = modal.querySelector(".dt-plans-modal__image");
  pauseDemoAudio();
  if (image) image.src = getDemoPlansImageSrc();

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.dataset.dtPlansModalOverflow = document.body.style.overflow || "";
  document.body.style.overflow = "hidden";
  modal.querySelector(".dt-plans-modal__close")?.focus();
}

function closeDemoPlansModal() {
  const modal = document.getElementById("dt-plans-modal");
  if (!modal || !modal.classList.contains("is-open")) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = document.body.dataset.dtPlansModalOverflow || "";
  delete document.body.dataset.dtPlansModalOverflow;
}

function getDemoPlansImageSrc() {
  const imageName = isCurrentDemoDark() ? "planes_oscuro.png" : "planes_claro.png";
  return `../../../assets/img/ui/planes/${imageName}`;
}

function isCurrentDemoDark() {
  if (document.body.classList.contains("dark")) return true;

  const currentTemplate = getCurrentTemplate();
  const darkTemplates = ["black-white", "blue-night", "casamiento-dorado", "neon-party", "urban-glow"];
  const lightTemplates = ["aurora", "bautismo-celeste", "bautismo-rosa", "casamiento-editorial-olivo", "verde-menta"];
  if (darkTemplates.includes(currentTemplate)) return true;
  if (lightTemplates.includes(currentTemplate)) return false;

  const color = getComputedStyle(document.body).backgroundColor
    || getComputedStyle(document.documentElement).backgroundColor;
  const match = color.match(/\d+(\.\d+)?/g);
  if (!match || match.length < 3) return window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [r, g, b] = match.slice(0, 3).map(Number);
  const luminance = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
  return luminance < 128;
}

function injectDemoPlansModalStyles() {
  if (document.getElementById("dt-plans-modal-styles")) return;

  const style = document.createElement("style");
  style.id = "dt-plans-modal-styles";
  style.textContent = `
    .dt-plans-modal {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: grid;
      place-items: center;
      padding: clamp(1rem, 4vw, 2rem);
      opacity: 0;
      pointer-events: none;
      transition: opacity .22s ease;
    }
    .dt-plans-modal.is-open {
      opacity: 1;
      pointer-events: auto;
    }
    .dt-plans-modal__backdrop {
      position: absolute;
      inset: 0;
      background: rgba(8, 9, 22, .72);
      backdrop-filter: blur(14px);
    }
    .dt-plans-modal__card {
      position: relative;
      width: min(980px, 100%);
      max-height: calc(100svh - 2rem);
      overflow: auto;
      padding: clamp(.9rem, 2vw, 1.25rem);
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 28px;
      background: color-mix(in srgb, #ffffff 92%, #f2effb);
      box-shadow: 0 28px 80px rgba(0, 0, 0, .32);
      transform: translateY(14px) scale(.98);
      transition: transform .22s ease;
    }
    .dt-plans-modal.is-open .dt-plans-modal__card {
      transform: translateY(0) scale(1);
    }
    .dt-plans-modal__header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 1rem;
      margin: .2rem 3rem 1rem .2rem;
      color: #17152a;
    }
    .dt-plans-modal__header span {
      color: #7357ff;
      font-size: .72rem;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .dt-plans-modal__header h2 {
      margin: 0;
      font-family: "Poppins", system-ui, sans-serif;
      font-size: clamp(1.25rem, 3vw, 2rem);
      line-height: 1.05;
      text-align: right;
    }
    .dt-plans-modal__close {
      position: absolute;
      top: .9rem;
      right: .9rem;
      width: 40px;
      height: 40px;
      border: 1px solid rgba(23,21,42,.12);
      border-radius: 999px;
      color: #17152a;
      background: rgba(255,255,255,.82);
      font-size: 1.7rem;
      line-height: 1;
      cursor: pointer;
    }
    .dt-plans-modal__image {
      width: 100%;
      height: auto;
      max-height: calc(100svh - 8rem);
      object-fit: contain;
      border-radius: 20px;
    }
    @media (prefers-color-scheme: dark) {
      .dt-plans-modal__card {
        background: color-mix(in srgb, #11142c 92%, #070816);
      }
      .dt-plans-modal__header {
        color: #f8f4ff;
      }
      .dt-plans-modal__close {
        color: #f8f4ff;
        border-color: rgba(255,255,255,.16);
        background: rgba(17,20,44,.88);
      }
    }
    @media (max-width: 640px) {
      .dt-plans-modal {
        padding: .5rem;
      }
      .dt-plans-modal__backdrop {
        background: rgba(8, 9, 22, .38);
        backdrop-filter: none;
      }
      .dt-plans-modal__card {
        width: 100%;
        max-height: calc(100svh - 1rem);
        padding: .45rem;
        overflow: auto;
        border: 0;
        border-radius: 18px;
        background: rgba(255,255,255,.98);
        box-shadow: none;
        -webkit-overflow-scrolling: touch;
      }
      .dt-plans-modal__header {
        display: none;
      }
      .dt-plans-modal__close {
        position: sticky;
        top: .25rem;
        left: calc(100% - 42px);
        z-index: 2;
        display: grid;
        place-items: center;
        margin-bottom: .35rem;
      }
      .dt-plans-modal__image {
        width: auto;
        min-width: 760px;
        max-width: none;
        max-height: none;
        border-radius: 14px;
      }
    }
  `;
  document.head.append(style);
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

function initDemoPlanSwitch() {
  if (!sessionStorage.getItem("dt-skip-cover")) return;
  sessionStorage.removeItem("dt-skip-cover");

  setTimeout(() => {
    let elapsed = 0;
    const MAX_WAIT = 60;
    const INTERVAL = 80;

    const timer = setInterval(() => {
      elapsed += INTERVAL;
      if (elapsed > MAX_WAIT) { clearInterval(timer); return; }

      const cover = document.getElementById("cover");
      if (!cover) { clearInterval(timer); return; }
      if (cover.classList.contains("opening") || getComputedStyle(cover).display === "none") {
        clearInterval(timer); return;
      }

      const btn = document.getElementById("btn-cover");
      if (!btn) return;

      btn.click();
      clearInterval(timer);
    }, INTERVAL);
  }, 3000);
}
