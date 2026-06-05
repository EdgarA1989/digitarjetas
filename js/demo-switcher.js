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

const templateCatalogFilters = {
  aurora: "quince",
  "urban-glow": "quince",
  "blue-night": "quince",
  "black-white": "quince",
  "neon-party": "quince",
  "verde-menta": "quince",
  "bautismo-celeste": "bautismos",
  "bautismo-rosa": "bautismos",
  "casamiento-editorial-olivo": "casamientos",
  "casamiento-dorado": "casamientos",
};

const demoSwitcherBaseUrl = (() => {
  const script = document.currentScript;
  return script?.src ? new URL("../", script.src).href : "../../../";
})();

document.addEventListener("DOMContentLoaded", () => {
  initDemoMediaState();
  initDemoImagePerformance();
  initDemoAudioLifecycle();
  initDemoPlanSwitcher();
  initDemoGalleryLightbox();
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

function initDemoImagePerformance() {
  const optimizeImage = image => {
    if (!(image instanceof HTMLImageElement)) return;
    if (!image.hasAttribute("decoding")) image.decoding = "async";
    if (!image.hasAttribute("loading") && !isLikelyHeroImage(image)) image.loading = "lazy";
    if (!image.hasAttribute("fetchpriority") && image.loading === "lazy") image.setAttribute("fetchpriority", "low");
  };

  const loadDeferredBackground = element => {
    if (!(element instanceof HTMLElement) || element.dataset.dtBgLoaded === "1") return;
    const src = element.dataset.src || element.dataset.bg;
    if (!src) return;

    element.style.backgroundImage = `url('${src}')`;
    element.dataset.dtBgLoaded = "1";
  };

  const observeDeferredBackground = element => {
    if (!(element instanceof HTMLElement)) return;
    if (element.dataset.dtBgObserved === "1" || element.dataset.dtBgLoaded === "1") return;
    if (!element.dataset.src && !element.dataset.bg) return;

    element.dataset.dtBgObserved = "1";
    if (!("IntersectionObserver" in window)) {
      loadDeferredBackground(element);
      return;
    }

    backgroundObserver.observe(element);
  };

  const scan = root => {
    const scope = root instanceof Element ? root : document;
    scope.querySelectorAll("img").forEach(optimizeImage);
    scope.querySelectorAll(".galeria-item[data-src], .gallery-card[data-src], [data-bg]").forEach(observeDeferredBackground);
  };

  const backgroundObserver = "IntersectionObserver" in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          loadDeferredBackground(entry.target);
          backgroundObserver.unobserve(entry.target);
        });
      }, { rootMargin: "480px 0px" })
    : null;

  scan(document);

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        if (node.matches("img")) optimizeImage(node);
        if (node.matches(".galeria-item[data-src], .gallery-card[data-src], [data-bg]")) observeDeferredBackground(node);
        scan(node);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function isLikelyHeroImage(image) {
  const value = `${image.id || ""} ${image.className || ""}`.toLowerCase();
  return value.includes("hero") || value.includes("cover") || value.includes("portada");
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
  const opensInternalRsvpFlow = target => {
    if (target.closest("#btn-asiste")) return true;
    if (target.closest("[data-plus-rsvp-close], [data-plus-rsvp-minus], [data-plus-rsvp-plus]")) return true;
    return Boolean(target.closest("#btn-wa, #btn-whatsapp") && document.querySelector(".plus-rsvp"));
  };

  const shouldPauseForClick = target => {
    if (opensInternalRsvpFlow(target)) return false;

    const externalLink = target.closest("a[href]");
    if (externalLink) {
      const href = externalLink.getAttribute("href") || "";
      if (/^(https?:|mailto:|tel:)/i.test(href) || externalLink.target === "_blank") {
        return true;
      }
    }

    return Boolean(target.closest(
      "#btn-wa, #btn-whatsapp, #btn-ics, #btn-calendario, " +
      "[data-plus-rsvp-submit], [data-demo-plan-button], [data-demo-plans], " +
      "[data-demo-return], [data-demo-whatsapp]"
    ));
  };

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
      <button class="dt-plan-link dt-plan-link--details" type="button" data-demo-plans data-open-plan-comparison>Detalles planes</button>
      <a class="dt-plan-link" href="${getDemoCatalogReturnUrl()}">Volver</a>
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

  bar.querySelector("[data-demo-plans]")?.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    closeMenu();
    pauseDemoAudio();
    openPlanComparisonFromDemo(getDemoPreferredPlanModalTheme());
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

function openPlanComparisonFromDemo(theme = "dark") {
  ensurePlanComparisonModal()
    .then(() => {
      window.PlanComparisonModal?.open({ theme });
    })
    .catch(error => {
      console.warn("[DigiTarjetas] No se pudo abrir la comparativa de planes.", error);
    });
}

function getDemoPreferredPlanModalTheme() {
  const savedTheme = localStorage.getItem("digitarjetas-theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  if (document.documentElement.dataset.theme === "light" || document.body.classList.contains("theme-light")) return "light";
  return "dark";
}

function ensurePlanComparisonModal() {
  if (window.PlanComparisonModal?.open) return Promise.resolve();

  return Promise.all([
    loadDemoAsset("css", "assets/css/plan-comparison-modal.css"),
    loadDemoAsset("js", "assets/js/plan-comparison-data.js"),
  ]).then(() => loadDemoAsset("js", "assets/js/plan-comparison-modal.js"));
}

function loadDemoAsset(type, path) {
  const url = new URL(path, demoSwitcherBaseUrl).href;
  const selector = type === "css" ? `link[href="${url}"]` : `script[src="${url}"]`;
  const existing = document.querySelector(selector);
  if (existing) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const element = type === "css" ? document.createElement("link") : document.createElement("script");
    if (type === "css") {
      element.rel = "stylesheet";
      element.href = url;
    } else {
      element.src = url;
      element.defer = true;
    }
    element.onload = resolve;
    element.onerror = reject;
    document.head.append(element);
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
    backLink.href = getDemoCatalogReturnUrl();
    backLink.textContent = "Volver";
    backLink.setAttribute("data-demo-return", "");
    actions.append(backLink);
  });
}

function getDemoCatalogReturnUrl() {
  const storedReturnUrl = getStoredDemoCatalogReturnUrl();
  if (storedReturnUrl) return storedReturnUrl;

  const filter = templateCatalogFilters[getCurrentTemplate()] || "quince";
  const template = getCurrentTemplate();
  return `../../../?categoria=${encodeURIComponent(filter)}&plantilla=${encodeURIComponent(template)}#plantillas`;
}

function getStoredDemoCatalogReturnUrl() {
  try {
    const rawState = sessionStorage.getItem("dt-template-return");
    if (!rawState) return "";

    const state = JSON.parse(rawState);
    const currentTemplate = getCurrentTemplate();
    if (!state?.slug || state.slug !== currentTemplate) return "";

    const filter = state.filter || templateCatalogFilters[currentTemplate] || "quince";
    return `../../../?categoria=${encodeURIComponent(filter)}&plantilla=${encodeURIComponent(state.slug)}#plantillas`;
  } catch (_) {
    return "";
  }
}

function initDemoGalleryLightbox() {
  const lightboxSelector = ".lightbox, .gallery-lightbox, .galeria-lb, [data-gallery-lightbox]";
  const imageSelector = ".lightbox-img, .lightbox-image, .galeria-lb-img, [data-lightbox-image]";
  const openSelector = ".lightbox.open, .galeria-lb.open, .gallery-lightbox[aria-hidden=\"false\"], [data-gallery-lightbox][aria-hidden=\"false\"]";
  let cachedSources = [];
  let sourcesDirty = true;
  let syncScheduled = false;

  const getSources = () => {
    if (!sourcesDirty) return cachedSources;

    const sources = [];
    const seen = new Set();
    document.querySelectorAll(
      ".galeria-item[data-src], .gallery-card[data-src], .gallery-card img[src], .galeria-item img[src]"
    ).forEach(element => {
      const src = element.dataset?.src || element.getAttribute("src");
      if (!src || seen.has(src)) return;
      seen.add(src);
      sources.push(src);
    });
    cachedSources = sources;
    sourcesDirty = false;
    return cachedSources;
  };

  const getOpenLightbox = () => document.querySelector(openSelector);
  const getLightboxImage = lightbox => lightbox?.querySelector(imageSelector);
  const getGalleryObjectPosition = src => {
    const normalized = decodeURIComponent(String(src || "")).toLowerCase();
    if ((normalized.includes("verde-menta") || normalized.includes("neon-party")) && normalized.includes("foto horizontal 1")) return "78% center";
    if ((normalized.includes("verde-menta") || normalized.includes("neon-party")) && normalized.includes("foto horizontal 2")) return "95% center";
    if (normalized.includes("foto horizontal 1")) return "22% center";
    if (normalized.includes("foto horizontal 2")) return "78% center";
    return "center center";
  };

  const applyGalleryItemFocus = root => {
    const scope = root instanceof Element ? root : document;
    scope.querySelectorAll(".galeria-item, .gallery-card").forEach(item => {
      if (!(item instanceof HTMLElement)) return;
      const img = item.querySelector("img");
      const src = item.dataset.src || img?.getAttribute("src") || "";
      if (item.dataset.dtGalleryFocusSrc === src) return;

      const position = getGalleryObjectPosition(src);
      item.style.setProperty("background-position", position);
      item.dataset.dtGalleryFocusSrc = src;
      item.querySelectorAll("img").forEach(image => {
        image.style.setProperty("object-position", position);
      });
    });
  };

  const getOrCreateSharedLightbox = () => {
    let lightbox = document.querySelector("[data-dt-shared-lightbox]");
    if (lightbox) return lightbox;

    lightbox = document.createElement("div");
    lightbox.className = "lightbox dt-shared-gallery-lightbox";
    lightbox.setAttribute("data-dt-shared-lightbox", "");
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Cerrar imagen">&times;</button>
      <img class="lightbox-img" alt="Foto ampliada" data-lightbox-image>
    `;
    applySharedLightboxLayout(lightbox);

    const close = () => closeSharedLightbox(lightbox);
    lightbox.querySelector(".lightbox-close")?.addEventListener("click", event => {
      event.stopPropagation();
      close();
    });
    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) close();
    });
    document.body.append(lightbox);
    return lightbox;
  };

  const applySharedLightboxLayout = lightbox => {
    if (!(lightbox instanceof HTMLElement)) return;

    const setImportant = (element, styles) => {
      Object.entries(styles).forEach(([property, value]) => {
        element.style.setProperty(property, value, "important");
      });
    };

    setImportant(lightbox, {
      position: "fixed",
      inset: "0",
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
      "z-index": "10040",
      "flex-direction": "column",
      "align-items": "center",
      "justify-content": "center",
      gap: ".85rem",
      width: "100vw",
      height: "100dvh",
      "min-height": "100dvh",
      "max-width": "none",
      margin: "0",
      padding: "clamp(1rem, 3vw, 2rem)",
      overflow: "auto",
      transform: "none",
      background: "rgba(8, 9, 18, .72)",
      "backdrop-filter": "blur(6px)",
      "-webkit-backdrop-filter": "blur(6px)",
    });

    const closeButton = lightbox.querySelector(".lightbox-close");
    if (closeButton instanceof HTMLElement) {
      setImportant(closeButton, {
        position: "fixed",
        top: "max(1rem, env(safe-area-inset-top))",
        right: "max(1rem, env(safe-area-inset-right))",
        "z-index": "4",
        width: "42px",
        height: "42px",
        display: "grid",
        "place-items": "center",
        border: "1px solid rgba(255, 255, 255, .2)",
        "border-radius": "999px",
        color: "#fff",
        background: "rgba(255, 255, 255, .16)",
        "box-shadow": "0 12px 28px rgba(0, 0, 0, .24)",
        "font-size": "1.45rem",
        "line-height": "1",
        cursor: "pointer",
        "backdrop-filter": "blur(10px)",
        "-webkit-backdrop-filter": "blur(10px)",
      });
    }

    const image = getLightboxImage(lightbox);
    if (image instanceof HTMLElement) {
      const objectPosition = getGalleryObjectPosition(image.getAttribute("src") || image.dataset.src || "");
      setImportant(image, {
        position: "static",
        display: "block",
        width: "auto",
        height: "auto",
        "max-width": "min(92vw, 640px)",
        "max-height": "min(78dvh, 820px)",
        "object-fit": "contain",
        "object-position": objectPosition,
        "border-radius": "18px",
        background: "transparent",
        "box-shadow": "0 22px 70px rgba(0, 0, 0, .28)",
        transform: "none",
        "user-select": "none",
        "touch-action": "pan-y",
      });
    }

    lightbox.querySelectorAll(".dt-lightbox-nav").forEach(nav => {
      if (!(nav instanceof HTMLElement)) return;
      setImportant(nav, {
        position: "static",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
        gap: ".8rem",
        width: "100%",
        margin: "0",
        padding: "0",
        "z-index": "2",
      });
    });

    lightbox.querySelectorAll("[data-dt-lightbox-prev], [data-dt-lightbox-next]").forEach(button => {
      if (!(button instanceof HTMLElement)) return;
      setImportant(button, {
        position: "static",
        transform: "none",
        width: "48px",
        height: "48px",
        display: "inline-grid",
        "place-items": "center",
        "border-radius": "999px",
        border: "1px solid rgba(255, 255, 255, .32)",
        color: "#111",
        background: "#fff",
        "box-shadow": "0 12px 28px rgba(0, 0, 0, .22)",
        "font-size": "1.25rem",
        "font-weight": "800",
        "line-height": "1",
        cursor: "pointer",
      });
    });
  };

  const setSharedLightboxOpen = (lightbox, isOpen) => {
    if (!(lightbox instanceof HTMLElement)) return;
    applySharedLightboxLayout(lightbox);
    lightbox.style.setProperty("display", isOpen ? "flex" : "none", "important");
    document.body.classList.toggle("dt-gallery-modal-open", isOpen);
    document.body.classList.toggle("dt-lightbox-open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
    document.querySelectorAll(".dt-plan-bar").forEach(bar => {
      if (!(bar instanceof HTMLElement)) return;
      bar.style.opacity = isOpen ? "0" : "";
      bar.style.visibility = isOpen ? "hidden" : "";
      bar.style.pointerEvents = isOpen ? "none" : "";
      bar.style.transform = isOpen ? "translateY(-8px)" : "";
    });
  };

  const closeSharedLightbox = lightbox => {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.classList.remove("dt-gallery-lightbox-open");
    lightbox.setAttribute("aria-hidden", "true");
    setSharedLightboxOpen(lightbox, false);
  };

  const openSharedLightbox = src => {
    const lightbox = getOrCreateSharedLightbox();
    const image = getLightboxImage(lightbox);
    if (!image || !src) return;

    image.src = src;
    image.dataset.dtObjectPosition = getGalleryObjectPosition(src);
    updateLightboxImageOrientation(image);
    ensureNav(lightbox);
    lightbox.classList.add("open", "dt-gallery-lightbox-open");
    lightbox.setAttribute("aria-hidden", "false");
    setSharedLightboxOpen(lightbox, true);
    window.requestAnimationFrame(() => setSharedLightboxOpen(lightbox, true));
  };

  const normalizeSrc = src => {
    if (!src) return "";
    try {
      return new URL(src, window.location.href).href;
    } catch {
      return src;
    }
  };

  const goTo = (lightbox, direction) => {
    const image = getLightboxImage(lightbox);
    const sources = getSources();
    if (!image || sources.length < 2) return;

    const currentSrc = normalizeSrc(image.currentSrc || image.src);
    const currentIndex = Math.max(0, sources.findIndex(src => normalizeSrc(src) === currentSrc));
    const nextIndex = (currentIndex + direction + sources.length) % sources.length;
    image.src = sources[nextIndex];
    image.dataset.dtLightboxIndex = String(nextIndex);
    image.dataset.dtObjectPosition = getGalleryObjectPosition(sources[nextIndex]);
    updateLightboxImageOrientation(image);
    lightbox.querySelector("[data-lightbox-counter]")?.replaceChildren(document.createTextNode(`${nextIndex + 1} / ${sources.length}`));
  };

  const updateLightboxImageOrientation = image => {
    if (!(image instanceof HTMLImageElement)) return;

    const apply = () => {
      const isLandscape = image.naturalWidth > image.naturalHeight;
      image.classList.toggle("dt-lightbox-image--landscape", isLandscape);
      image.classList.toggle("dt-lightbox-image--portrait", !isLandscape);
      if (image.closest(lightboxSelector)) {
        const objectPosition = image.dataset.dtObjectPosition || getGalleryObjectPosition(image.currentSrc || image.src);
        const styles = isLandscape ? {
          width: "min(92vw, 640px)",
          height: "min(74dvh, 760px)",
          "aspect-ratio": "4 / 5",
          "object-fit": "cover",
          "object-position": objectPosition,
        } : {
          width: "auto",
          height: "auto",
          "aspect-ratio": "auto",
          "object-fit": "contain",
          "object-position": objectPosition,
        };
        Object.entries(styles).forEach(([property, value]) => {
          image.style.setProperty(property, value, "important");
        });
      }
    };

    if (image.complete && image.naturalWidth) {
      apply();
    } else {
      image.addEventListener("load", apply, { once: true });
    }
  };

  const clickExistingNav = (lightbox, direction) => {
    const selector = direction < 0
      ? ".lightbox-prev:not([data-dt-lightbox-prev]), .galeria-lb-prev"
      : ".lightbox-next:not([data-dt-lightbox-next]), .galeria-lb-next";
    const button = lightbox.querySelector(selector);
    if (!button) return false;

    button.click();
    return true;
  };

  const moveExistingNavBelowImage = lightbox => {
    if (lightbox.querySelector(".dt-lightbox-nav, .galeria-lb-arrows")) return;

    const prev = lightbox.querySelector(".lightbox-prev");
    const next = lightbox.querySelector(".lightbox-next");
    if (!prev || !next) return;

    const nav = document.createElement("div");
    nav.className = "dt-lightbox-nav";
    prev.before(nav);
    nav.append(prev, next);

    const figure = lightbox.querySelector(".lightbox-figure, .galeria-lb-figure");
    const image = getLightboxImage(lightbox);
    if (figure) {
      figure.after(nav);
    } else if (image) {
      image.after(nav);
    }
  };

  const ensureNav = lightbox => {
    if (!lightbox || lightbox.dataset.dtGalleryReady === "1") return;
    lightbox.dataset.dtGalleryReady = "1";

    const image = getLightboxImage(lightbox);
    if (image) {
      image.decoding = "async";
      updateLightboxImageOrientation(image);
      image.addEventListener("load", () => updateLightboxImageOrientation(image));
    }

    moveExistingNavBelowImage(lightbox);

    if (!lightbox.querySelector(".lightbox-prev, .galeria-lb-prev, [data-dt-lightbox-prev]")) {
      const nav = document.createElement("div");
      nav.className = "dt-lightbox-nav";
      nav.innerHTML = `
        <button type="button" data-dt-lightbox-prev aria-label="Foto anterior">&#8249;</button>
        <button type="button" data-dt-lightbox-next aria-label="Foto siguiente">&#8250;</button>
      `;
      lightbox.append(nav);
      nav.querySelector("[data-dt-lightbox-prev]")?.addEventListener("click", event => {
        event.stopPropagation();
        goTo(lightbox, -1);
      });
      nav.querySelector("[data-dt-lightbox-next]")?.addEventListener("click", event => {
        event.stopPropagation();
        goTo(lightbox, 1);
      });
      applySharedLightboxLayout(lightbox);
    }

    let touchStartX = 0;
    let touchStartY = 0;
    lightbox.addEventListener("touchstart", event => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    lightbox.addEventListener("touchend", event => {
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY)) return;
      const direction = deltaX < 0 ? 1 : -1;
      if (!clickExistingNav(lightbox, direction)) goTo(lightbox, direction);
    }, { passive: true });
  };

  const sync = () => {
    syncScheduled = false;
    applyGalleryItemFocus(document);
    document.querySelectorAll(lightboxSelector).forEach(lightbox => {
      ensureNav(lightbox);
      if (lightbox.matches(openSelector)) applySharedLightboxLayout(lightbox);
      lightbox.classList.toggle("dt-gallery-lightbox-open", lightbox.matches(openSelector));
      updateLightboxImageOrientation(getLightboxImage(lightbox));
    });
    document.body.classList.toggle("dt-gallery-modal-open", Boolean(getOpenLightbox()));
  };

  const scheduleSync = () => {
    if (syncScheduled) return;
    syncScheduled = true;
    window.requestAnimationFrame(sync);
  };

  document.addEventListener("click", event => {
    const item = event.target.closest(".galeria-item[data-src], .gallery-card[data-src]");
    if (!item || event.target.closest(lightboxSelector)) return;

    const hasTemplateLightbox = Array.from(document.querySelectorAll(lightboxSelector))
      .some(lightbox => !lightbox.hasAttribute("data-dt-shared-lightbox"));
    if (hasTemplateLightbox) return;

    event.preventDefault();
    openSharedLightbox(item.dataset.src);
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const lightbox = document.querySelector("[data-dt-shared-lightbox].open");
    if (lightbox) closeSharedLightbox(lightbox);
  });

  document.addEventListener("click", event => {
    const prev = event.target.closest(".lightbox-prev, .galeria-lb-prev");
    const next = event.target.closest(".lightbox-next, .galeria-lb-next");
    if (!prev && !next) return;

    const lightbox = event.target.closest(lightboxSelector);
    if (!lightbox) return;
    lightbox.dataset.dtLastNav = prev ? "prev" : "next";
  }, true);

  const observer = new MutationObserver(mutations => {
    sourcesDirty = true;
    mutations.forEach(mutation => {
      if (mutation.type === "attributes" && mutation.target instanceof HTMLElement) {
        mutation.target.removeAttribute("data-dt-gallery-focus-src");
      }
    });
    scheduleSync();
  });
  observer.observe(document.body, {
    subtree: true,
    attributes: true,
    childList: true,
    attributeFilter: ["class", "aria-hidden", "src"],
  });
  sync();
}

function initDemoLightboxState() {
  const getOpenLightbox = () => document.querySelector(
    ".lightbox.open, .galeria-lb.open, .gallery-lightbox[aria-hidden=\"false\"], [data-gallery-lightbox][aria-hidden=\"false\"]"
  );
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
    const MAX_WAIT = 3000;
    const INTERVAL = 80;

    const timer = setInterval(() => {
      elapsed += INTERVAL;
      if (elapsed > MAX_WAIT) { clearInterval(timer); return; }

      const cover = document.getElementById("cover") || document.getElementById("hero");
      if (!cover) { clearInterval(timer); return; }
      const alreadyOpen = cover.classList.contains("opening") || cover.classList.contains("hero--opening") || getComputedStyle(cover).display === "none";
      if (alreadyOpen) { clearInterval(timer); return; }

      const btn = document.getElementById("btn-cover") || document.getElementById("hero-cta");
      if (!btn) return;

      btn.click();
      clearInterval(timer);
    }, INTERVAL);
  }, 1500);
}
