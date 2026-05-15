// Componente reutilizable para demos.
// En cada demo definir antes de este archivo:
// const CURRENT_TEMPLATE = "aurora";
// const CURRENT_MODE = "whatsapp"; // o "formulario"
// Cambiar WHATSAPP_NUMBER por el numero real.
const DEMO_WHATSAPP_NUMBER = "549XXXXXXXXXX";

const templateLinks = {
  aurora: {
    whatsapp: "../../quince/aurora/",
    formulario: "../../quince-mail/aurora/",
    label: "Aurora",
  },
  "urban-glow": {
    whatsapp: "../../quince/urban-glow/",
    formulario: "../../quince-mail/urban-glow/",
    label: "Urban Glow",
  },
  "blue-night": {
    whatsapp: "../../quince/blue-night/",
    formulario: "../../quince-mail/blue-night/",
    label: "Blue Night",
  },
  "black-white": {
    whatsapp: "../../quince/black-white/",
    formulario: "../../quince-mail/black-white/",
    label: "Black White",
  },
  "neon-party": {
    whatsapp: "../../quince/neon-party/",
    formulario: "../../quince-mail/neon-party/",
    label: "Neon Party",
  },
  "verde-menta": {
    whatsapp: "../../quince/verde-menta/",
    formulario: "../../quince-mail/verde-menta/",
    label: "Verde Menta",
  },
};

const demoModeLabels = {
  whatsapp: "Invitaci\u00f3n por WhatsApp",
  formulario: "Invitaci\u00f3n con confirmaci\u00f3n",
};

document.addEventListener("DOMContentLoaded", () => {
  initDemoModeSwitcher();
  initDemoCommercialCta();
});

function initDemoModeSwitcher() {
  const select = document.querySelector("[data-demo-mode-select]");
  const button = document.querySelector("[data-demo-mode-go]");
  const currentTemplate = typeof CURRENT_TEMPLATE !== "undefined" ? CURRENT_TEMPLATE : window.CURRENT_TEMPLATE;
  const currentMode = typeof CURRENT_MODE !== "undefined" ? CURRENT_MODE : window.CURRENT_MODE;
  const links = templateLinks[currentTemplate];
  if (!select || !button || !links) return;

  select.innerHTML = Object.entries(demoModeLabels)
    .filter(([mode]) => Boolean(links[mode]))
    .map(([mode, label]) => `<option value="${mode}" ${mode === currentMode ? "selected" : ""}>${label}</option>`)
    .join("");

  button.addEventListener("click", () => {
    const target = links[select.value];
    if (target) window.location.href = target;
  });
}

function initDemoCommercialCta() {
  const currentTemplate = typeof CURRENT_TEMPLATE !== "undefined" ? CURRENT_TEMPLATE : window.CURRENT_TEMPLATE;
  const links = templateLinks[currentTemplate];
  if (!links) return;

  document.querySelectorAll("[data-demo-template-name]").forEach(element => {
    element.textContent = links.label;
  });

  const whatsapp = document.querySelector("[data-demo-whatsapp]");
  if (whatsapp) {
    const message = `Hola, quiero consultar por la plantilla ${links.label}.`;
    whatsapp.href = `https://wa.me/${DEMO_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  const back = document.querySelector("[data-demo-back]");
  if (back) back.href = "../../../";
}
