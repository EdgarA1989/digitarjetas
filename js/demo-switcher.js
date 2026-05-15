// Componente reutilizable para demos.
// En cada demo definir antes de este archivo:
// const CURRENT_TEMPLATE = "aurora";
// const CURRENT_PLAN = "plus"; // "esencial", "plus" o "completo"
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
    completo: "../../quince-mail/aurora/",
    label: "Aurora",
  },
  "urban-glow": {
    esencial: "../../quince/urban-glow/",
    plus: "../../quince-plus/urban-glow/",
    completo: "../../quince-mail/urban-glow/",
    label: "Urban Glow",
  },
  "blue-night": {
    esencial: "../../quince/blue-night/",
    plus: "../../quince-plus/blue-night/",
    completo: "../../quince-mail/blue-night/",
    label: "Blue Night",
  },
  "black-white": {
    esencial: "../../quince/black-white/",
    plus: "../../quince-plus/black-white/",
    completo: "../../quince-mail/black-white/",
    label: "Black White",
  },
  "neon-party": {
    esencial: "../../quince/neon-party/",
    plus: "../../quince-plus/neon-party/",
    completo: "../../quince-mail/neon-party/",
    label: "Neon Party",
  },
  "verde-menta": {
    esencial: "../../quince/verde-menta/",
    plus: "../../quince-plus/verde-menta/",
    completo: "../../quince-mail/verde-menta/",
    label: "Verde Menta",
  },
  "bautismo-celeste": {
    esencial: "../../bautismo-esencial/bautismo-celeste/",
    plus: "../../bautismo-plus/bautismo-celeste/",
    completo: "../../bautismo-completo/bautismo-celeste/",
    label: "Bautismo Celeste",
  },
  "bautismo-rosa": {
    esencial: "../../bautismo-esencial/bautismo-rosa/",
    plus: "../../bautismo-plus/bautismo-rosa/",
    completo: "../../bautismo-completo/bautismo-rosa/",
    label: "Bautismo Rosa",
  },
};

const demoPlanLabels = {
  esencial: "Plan Esencial",
  plus: "Plan Plus",
  completo: "Plan Completo",
};

const legacyModeToPlan = {
  whatsapp: "esencial",
  formulario: "completo",
};

document.addEventListener("DOMContentLoaded", () => {
  initDemoMediaState();
  initDemoPlanSwitcher();
  initDemoCommercialCta();
});

function initDemoMediaState() {
  fetch("config.json")
    .then(response => response.json())
    .then(config => {
      const hasPhotos = Array.isArray(config.fotos) && config.fotos.length > 0;
      const hasMusic = Boolean(config.musica?.src);
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
  const select = document.querySelector("[data-demo-plan-select], [data-demo-mode-select]");
  const button = document.querySelector("[data-demo-plan-go], [data-demo-mode-go]");
  const currentTemplate = getCurrentTemplate();
  const currentPlan = getCurrentPlan();
  const links = templateLinks[currentTemplate];
  if (!select || !button || !links) return;

  select.innerHTML = Object.entries(demoPlanLabels)
    .filter(([plan]) => Boolean(links[plan]))
    .map(([plan, label]) => `<option value="${plan}" ${plan === currentPlan ? "selected" : ""}>${label}</option>`)
    .join("");

  button.addEventListener("click", () => {
    const target = links[select.value];
    if (target) window.location.href = target;
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

  const back = document.querySelector("[data-demo-back]");
  if (back) {
    back.href = "../../../#plantillas";
    back.textContent = "Otras demos";
  }
}
