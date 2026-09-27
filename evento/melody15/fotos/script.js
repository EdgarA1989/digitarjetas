(function () {
  "use strict";

  const CONFIG_PATH = "config.json";
  const PLACEHOLDER_PREFIX = "PEGAR_URL_";

  const fallbackConfig = {
    eventId: "melody15",
    eventName: "Melody 15",
    title: "Comparti tus fotos y videos de Melody 15",
    subtitle: "Gracias por ser parte de esta noche especial.",
    description: "Subi tus mejores fotos y videos y ayudanos a guardar los recuerdos de Melody 15.",
    upload: {
      enabled: true,
      label: "Subir fotos y videos",
      url: "PEGAR_URL_GOOGLE_FORM"
    },
    gallery: {
      enabled: false,
      label: "Ver fotos y videos",
      url: "PEGAR_URL_CARPETA_FOTOS_DRIVE",
      lockedText: "Disponible proximamente",
      description: "El album se habilitara despues del evento, cuando la familia revise y organice las fotos y videos."
    },
    closingText: "Gracias por compartir tus recuerdos con Melody."
  };

  const els = {
    eventName: document.getElementById("event-name"),
    title: document.getElementById("page-title"),
    subtitle: document.getElementById("subtitle"),
    description: document.getElementById("description"),
    uploadLink: document.getElementById("upload-link"),
    uploadLabel: document.getElementById("upload-label"),
    galleryLink: document.getElementById("gallery-link"),
    galleryLabel: document.getElementById("gallery-label"),
    galleryStatus: document.getElementById("gallery-status"),
    galleryDescription: document.getElementById("gallery-description"),
    notice: document.getElementById("notice"),
    closingText: document.getElementById("closing-text")
  };

  init();

  async function init() {
    try {
      const config = await loadConfig();
      render(config, false);
    } catch (error) {
      render(fallbackConfig, true);
    }
  }

  async function loadConfig() {
    const response = await fetch(CONFIG_PATH, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("No se pudo cargar config.json");
    }

    return response.json();
  }

  function render(config, usedFallback) {
    const data = mergeConfig(config);
    const messages = [];

    setText(els.eventName, data.eventName);
    setText(els.title, data.title);
    setText(els.subtitle, data.subtitle);
    setText(els.description, data.description);
    setText(els.uploadLabel, data.upload.label);
    setText(els.galleryLabel, data.gallery.label);
    setText(els.galleryStatus, data.gallery.lockedText);
    setText(els.galleryDescription, data.gallery.description);
    setText(els.closingText, data.closingText);

    const uploadUrl = normalizeUrl(data.upload.url);
    const galleryUrl = normalizeUrl(data.gallery.url);

    if (data.upload.enabled && uploadUrl) {
      enableLink(els.uploadLink, uploadUrl);
    } else {
      disableLink(els.uploadLink);
      messages.push("Falta cargar la URL del formulario para subir fotos y videos.");
    }

    if (data.gallery.enabled && galleryUrl) {
      enableLink(els.galleryLink, galleryUrl);
      setText(els.galleryStatus, "Album habilitado");
    } else {
      disableLink(els.galleryLink);
      setText(els.galleryStatus, data.gallery.lockedText);
    }

    if (usedFallback) {
      messages.unshift("No se pudo leer config.json. Se muestra una version de respaldo.");
    }

    els.notice.textContent = messages.join(" ");
  }

  function mergeConfig(config) {
    return {
      ...fallbackConfig,
      ...config,
      upload: {
        ...fallbackConfig.upload,
        ...(config.upload || {})
      },
      gallery: {
        ...fallbackConfig.gallery,
        ...(config.gallery || {})
      }
    };
  }

  function normalizeUrl(url) {
    const value = typeof url === "string" ? url.trim() : "";

    if (!value || value.startsWith(PLACEHOLDER_PREFIX)) {
      return "";
    }

    return value;
  }

  function setText(element, value) {
    if (element && typeof value === "string" && value.trim()) {
      element.textContent = value;
    }
  }

  function enableLink(link, url) {
    link.href = url;
    link.classList.remove("is-disabled", "is-loading");
    link.setAttribute("aria-disabled", "false");
  }

  function disableLink(link) {
    link.removeAttribute("href");
    link.classList.add("is-disabled");
    link.classList.remove("is-loading");
    link.setAttribute("aria-disabled", "true");
  }
})();
