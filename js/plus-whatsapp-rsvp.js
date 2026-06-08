(function () {
  "use strict";

  const DEFAULT_MAX_GUESTS = 8;
  const BUTTON_SELECTORS = ["#btn-wa", "#btn-whatsapp"];

  let configPromise;
  let modal;
  let quantity = 1;
  let maxGuests = DEFAULT_MAX_GUESTS;
  let previousBodyOverflow = "";
  let triggerButton = null;
  let activeConfig = {};

  function loadConfig() {
    if (!configPromise) {
      configPromise = fetch("./config.json")
        .then((response) => {
          if (!response.ok) throw new Error("No se pudo cargar config.json");
          return response.json();
        })
        .catch((error) => {
          console.warn("[Plus RSVP]", error.message);
          return {};
        });
    }
    return configPromise;
  }

  function getButton() {
    return document.querySelector(BUTTON_SELECTORS.join(", "));
  }

  function getMaxGuests(config) {
    const configuredMax = Number(config.plusWhatsapp?.maxGuests || config.whatsapp?.maxGuests);
    if (!Number.isInteger(configuredMax) || configuredMax < 1) {
      return DEFAULT_MAX_GUESTS;
    }
    return configuredMax;
  }

  function getWhatsappNumber(config) {
    return config.whatsapp?.numero || config.whatsapp?.number || config.whatsappNumber || "";
  }

  function getEventName(config) {
    const couple = config.pareja?.display
      || [config.pareja?.nombre1, config.pareja?.nombre2].filter(Boolean).join(" & ");

    if (couple) return `el casamiento de ${couple}`;
    if (config.childName) return `el bautismo de ${config.childName}`;
    if (config.nombre) return `los 15 de ${config.nombre}`;
    if (config.name) return `la comunión de ${config.name}`;

    return "el evento";
  }

  function buildMessage(config) {
    const eventName = getEventName(config);
    const attendanceTarget = eventName.startsWith("el ")
      ? `al ${eventName.slice(3)}`
      : `a ${eventName}`;
    const guests = Array.from({ length: quantity }, (_, index) => [
      `Invitado ${index + 1}:`,
      "Nombre y apellido:",
      "Edad:",
      "Restricci\u00f3n alimentaria:",
    ].join("\n"));

    return [
      `Hola, confirmo asistencia ${attendanceTarget}.`,
      "",
      guests.join("\n\n"),
    ].join("\n");
  }

  function updateCounter() {
    if (!modal) return;
    modal.querySelector("[data-plus-rsvp-count]").textContent = String(quantity);
    modal.querySelector("[data-plus-rsvp-minus]").disabled = quantity <= 1;
    modal.querySelector("[data-plus-rsvp-plus]").disabled = quantity >= maxGuests;
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = previousBodyOverflow;
    triggerButton?.focus();
  }

  function openModal(config, button) {
    activeConfig = config;
    triggerButton = button;
    quantity = 1;
    maxGuests = getMaxGuests(config);
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal.hidden = false;
    updateCounter();
    modal.querySelector("[data-plus-rsvp-close]").focus();
  }

  function createModal() {
    modal = document.createElement("div");
    modal.className = "plus-rsvp";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="plus-rsvp__overlay" data-plus-rsvp-close></div>
      <section class="plus-rsvp__dialog" role="dialog" aria-modal="true" aria-labelledby="plus-rsvp-title">
        <button class="plus-rsvp__close" type="button" data-plus-rsvp-close aria-label="Cerrar modal">&times;</button>
        <p class="plus-rsvp__eyebrow">DigiTarjetas Plus</p>
        <h2 class="plus-rsvp__title" id="plus-rsvp-title">Confirmar asistencia</h2>
        <p class="plus-rsvp__subtitle">Eleg&iacute; cu&aacute;ntos invitados quer&eacute;s confirmar y te preparamos el mensaje para WhatsApp.</p>
        <p class="plus-rsvp__question">&iquest;Cu&aacute;ntos invitados quer&eacute;s confirmar?</p>
        <div class="plus-rsvp__counter" aria-label="Cantidad de invitados">
          <button class="plus-rsvp__counter-button" type="button" data-plus-rsvp-minus aria-label="Restar invitado">&minus;</button>
          <strong class="plus-rsvp__count" data-plus-rsvp-count aria-live="polite">1</strong>
          <button class="plus-rsvp__counter-button" type="button" data-plus-rsvp-plus aria-label="Sumar invitado">+</button>
        </div>
        <button class="plus-rsvp__cta" type="button" data-plus-rsvp-submit>Continuar por WhatsApp</button>
      </section>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll("[data-plus-rsvp-close]").forEach((button) => {
      button.addEventListener("click", closeModal);
    });

    modal.querySelector("[data-plus-rsvp-minus]").addEventListener("click", () => {
      quantity = Math.max(1, quantity - 1);
      updateCounter();
    });

    modal.querySelector("[data-plus-rsvp-plus]").addEventListener("click", () => {
      quantity = Math.min(maxGuests, quantity + 1);
      updateCounter();
    });

    modal.querySelector("[data-plus-rsvp-submit]").addEventListener("click", () => {
      const number = getWhatsappNumber(activeConfig);
      if (!number) {
        console.warn("[Plus RSVP] Falta configurar el numero de WhatsApp.");
        return;
      }

      const url = `https://wa.me/${number}?text=${encodeURIComponent(buildMessage(activeConfig))}`;
      window.open(url, "_blank", "noopener,noreferrer");
      closeModal();
    });
  }

  function init() {
    const button = getButton();
    if (!button) return;

    createModal();
    loadConfig();

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      openModal(await loadConfig(), button);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
