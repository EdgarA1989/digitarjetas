// DigiTarjetas
// Cambiar este numero por el WhatsApp real, solo numeros con codigo de pais.
const WHATSAPP_NUMBER = "549XXXXXXXXXX";

const PLAN_LABELS = {
  esencial: "Plan Esencial",
  plus: "Plan Plus",
  completo: "Plan Completo",
};

const PLAN_SHORT_LABELS = {
  esencial: "Esencial",
  plus: "Plus",
  completo: "Completo",
};

// Agregar nuevas plantillas aca:
// - availablePlans: indicar los planes disponibles: ["esencial"], ["plus"], ["completo"] o combinados.
// - demos: cambiar los links relativos cuando subas nuevas demos.
// - Para agregar una demo Plus, crear la carpeta en demos/quince-plus/nombre-plantilla/ y cargar la URL en demos.plus.
// - image: si existe una imagen en assets/img/, se puede usar para reemplazar el mockup visual.
const templates = [
  {
    name: "Aurora",
    slug: "aurora",
    category: "15 años elegante",
    style: "quince",
    availablePlans: ["esencial", "plus", "completo"],
    description: "Diseño delicado, sofisticado y moderno para fiestas de 15 con estilo premium.",
    image: "assets/img/template-aurora.jpg",
    demos: {
      esencial: "./demos/quince/aurora/",
      plus: "./demos/quince-plus/aurora/",
      completo: "./demos/quince-mail/aurora/",
    },
    bg: "linear-gradient(145deg, #7b61ff, #f68ab8 55%, #f5ca78)",
  },
  {
    name: "Urban Glow",
    slug: "urban-glow",
    category: "15 años urbano / rap",
    style: "quince",
    availablePlans: ["esencial", "plus", "completo"],
    description: "Una plantilla con energía, actitud y estética urbana para eventos con personalidad.",
    image: "assets/img/template-urban-glow.jpg",
    demos: {
      esencial: "./demos/quince/urban-glow/",
      plus: "./demos/quince-plus/urban-glow/",
      completo: "./demos/quince-mail/urban-glow/",
    },
    bg: "linear-gradient(145deg, #10101b, #772fff 52%, #16d8ff)",
  },
  {
    name: "Blue Night",
    slug: "blue-night",
    category: "15 años moderna azul",
    style: "quince",
    availablePlans: ["esencial", "plus", "completo"],
    description: "Diseño nocturno, moderno y elegante con tonos azules, luces y detalles brillantes.",
    image: "assets/img/template-blue-night.jpg",
    demos: {
      esencial: "./demos/quince/blue-night/",
      plus: "./demos/quince-plus/blue-night/",
      completo: "./demos/quince-mail/blue-night/",
    },
    bg: "linear-gradient(145deg, #071a44, #1f73ff 54%, #7fe8ff)",
  },
  {
    name: "Black White",
    slug: "black-white",
    category: "15 años blanco y negro",
    style: "quince",
    availablePlans: ["esencial", "plus", "completo"],
    description: "Una propuesta minimalista, elegante y editorial con contraste blanco y negro.",
    image: "assets/img/template-black-white.jpg",
    demos: {
      esencial: "./demos/quince/black-white/",
      plus: "./demos/quince-plus/black-white/",
      completo: "./demos/quince-mail/black-white/",
    },
    bg: "linear-gradient(145deg, #050505, #2b2b2b 58%, #f5f5f5)",
  },
  {
    name: "Neon Party",
    slug: "neon-party",
    category: "15 años urbana",
    style: "quince",
    availablePlans: ["esencial", "plus", "completo"],
    description: "Diseño intenso, moderno y vibrante para una fiesta con mucha actitud.",
    image: "assets/img/template-neon-party.jpg",
    demos: {
      esencial: "./demos/quince/neon-party/",
      plus: "./demos/quince-plus/neon-party/",
      completo: "./demos/quince-mail/neon-party/",
    },
    bg: "linear-gradient(145deg, #190821, #e040fb 52%, #ff6b35)",
  },
  {
    name: "Verde Menta",
    slug: "verde-menta",
    category: "15 años natural",
    style: "quince",
    availablePlans: ["esencial", "plus", "completo"],
    description: "Una plantilla luminosa, fresca y delicada con detalles verdes y estilo natural.",
    image: "assets/img/template-verde-menta.jpg",
    demos: {
      esencial: "./demos/quince/verde-menta/",
      plus: "./demos/quince-plus/verde-menta/",
      completo: "./demos/quince-mail/verde-menta/",
    },
    bg: "linear-gradient(145deg, #d4efec, #5bbfb5 54%, #3d9d93)",
  },
  {
    name: "Romance",
    slug: "romance",
    category: "Casamientos",
    style: "casamientos",
    availablePlans: ["esencial", "plus"],
    description: "Una propuesta cálida y elegante para celebrar una historia de amor.",
    image: "assets/img/template-romance.jpg",
    demos: { esencial: "#", plus: "#", completo: "" },
    bg: "linear-gradient(145deg, #fff0e8, #e6a187 50%, #b96b86)",
  },
  {
    name: "Celeste",
    slug: "celeste",
    category: "Bautismos y comuniones",
    style: "bautismos",
    availablePlans: ["esencial", "completo"],
    description: "Diseño suave, luminoso y familiar para celebraciones especiales.",
    image: "assets/img/template-celeste.jpg",
    demos: { esencial: "#", plus: "", completo: "#" },
    bg: "linear-gradient(145deg, #dff6ff, #74c7ef 52%, #f6f2d4)",
  },
  {
    name: "Bautismo Celeste",
    slug: "bautismo-celeste",
    category: "Bautismos y comuniones",
    style: "bautismos",
    availablePlans: ["esencial", "plus", "completo"],
    description: "Diseño delicado, luminoso y elegante para bautismos. Incluye galería, música, dress code y datos de regalo.",
    image: "assets/img/template-bautismo-celeste.jpg",
    demos: {
      esencial: "./demos/bautismo-esencial/bautismo-celeste/",
      plus: "./demos/bautismo-plus/bautismo-celeste/",
      completo: "./demos/bautismo-completo/bautismo-celeste/",
    },
    bg: "linear-gradient(145deg, #7cbfe3, #c9e8f7 54%, #e8d09a)",
  },
  {
    name: "Bautismo Rosa",
    slug: "bautismo-rosa",
    category: "Bautismos y comuniones",
    style: "bautismos",
    availablePlans: ["plus"],
    description: "Diseño delicado y femenino para bautismos de niña. Incluye galería asimétrica, música, dress code y datos de regalo.",
    image: "assets/img/template-bautismo-rosa.jpg",
    demos: {
      esencial: "",
      plus: "./demos/bautismo-plus/bautismo-rosa/",
      completo: "",
    },
    bg: "linear-gradient(145deg, #f2c4d5, #f9dde8 54%, #e8d09a)",
  },
  {
    name: "Golden Party",
    slug: "golden-party",
    category: "Cumpleaños adultos",
    style: "eventos",
    availablePlans: ["plus"],
    description: "Una plantilla festiva, elegante y versátil para cumpleaños y eventos privados.",
    image: "assets/img/template-golden-party.jpg",
    demos: { esencial: "", plus: "#", completo: "" },
    bg: "linear-gradient(145deg, #17120c, #c89534 52%, #ffe29a)",
  },
  {
    name: "Corporate Link",
    slug: "corporate-link",
    category: "Eventos empresariales",
    style: "eventos",
    availablePlans: ["esencial", "completo"],
    description: "Invitaciones digitales sobrias y profesionales para eventos corporativos.",
    image: "assets/img/template-corporate-link.jpg",
    demos: { esencial: "#", plus: "", completo: "#" },
    bg: "linear-gradient(145deg, #0b1120, #2d5bff 56%, #9fb3ff)",
  },
];

const filters = [
  { label: "Todas", value: "all" },
  { label: "Esencial", value: "esencial" },
  { label: "Plus", value: "plus" },
  { label: "Completo", value: "completo" },
  { label: "15 años", value: "quince" },
  { label: "Casamientos", value: "casamientos" },
  { label: "Bautismos", value: "bautismos" },
  { label: "Eventos", value: "eventos" },
];

const features = [
  ["01", "Diseño personalizado", "Colores, textos y estilo adaptados a tu evento."],
  ["02", "Link para WhatsApp", "Un enlace claro y listo para compartir con invitados."],
  ["03", "Cuenta regresiva", "Genera expectativa hasta el día del evento."],
  ["04", "Ubicación con Google Maps", "Tus invitados llegan fácil al lugar correcto."],
  ["05", "Galería de fotos", "Sumá imágenes importantes y momentos especiales."],
  ["06", "Música de fondo", "Acompañá la invitación con una canción elegida."],
  ["07", "Confirmación de asistencia", "Organizá mejor quiénes van a participar."],
  ["08", "Formulario de confirmación", "Una forma simple de recibir respuestas."],
  ["09", "Botón para agendar fecha", "Tus invitados pueden guardar el evento."],
  ["10", "Dress code", "Indicá el estilo de vestimenta de forma clara."],
  ["11", "Frase especial", "Un mensaje emotivo que represente la celebración."],
  ["12", "Datos de regalo o alias", "Agregá alias, cuenta o información útil."],
  ["13", "Cronograma del evento", "Mostrá los momentos importantes de la jornada."],
  ["14", "Mensaje personalizado", "Un cierre cálido para tus invitados."],
];

const benefits = [
  "Más práctico que una invitación impresa",
  "Fácil de compartir",
  "Ideal para WhatsApp",
  "Diseño adaptable a cada evento",
  "Confirmaciones organizadas",
  "Ahorro de tiempo",
  "Experiencia moderna para los invitados",
  "Compatible con celulares",
];

let activeFilter = "all";
let lastFocusedElement = null;

document.addEventListener("DOMContentLoaded", () => {
  renderFeatures();
  renderFilters();
  renderTemplates();
  renderBenefits();
  initTheme();
  initMenu();
  initSmoothLinks();
  initFaq();
  initForm();
  initWhatsappLinks();
  initTemplateActions();
  initModal();
  initReveal();
  setYear();
});

function renderFeatures() {
  const grid = document.getElementById("features-grid");
  if (!grid) return;

  grid.innerHTML = features.map(([icon, title, text]) => `
    <article class="feature-card reveal">
      <span class="feature-icon" aria-hidden="true">${icon}</span>
      <h3>${title}</h3>
      <p>${text}</p>
    </article>
  `).join("");
}

function renderFilters() {
  const filterWrap = document.getElementById("template-filters");
  if (!filterWrap) return;

  filterWrap.innerHTML = filters.map(filter => `
    <button class="filter-btn${filter.value === activeFilter ? " is-active" : ""}" type="button" data-filter="${filter.value}">
      ${filter.label}
    </button>
  `).join("");

  filterWrap.querySelectorAll("[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
      setActiveFilter(button.dataset.filter);
    });
  });
}

function renderTemplates() {
  const grid = document.getElementById("templates-grid");
  const empty = document.getElementById("templates-empty");
  if (!grid) return;

  const visibleTemplates = templates.filter(template => {
    if (activeFilter === "all") return true;
    if (["esencial", "plus", "completo"].includes(activeFilter)) return template.availablePlans.includes(activeFilter);
    return template.style === activeFilter;
  });

  grid.innerHTML = visibleTemplates.map(template => `
    <article class="template-card reveal">
      <div class="template-visual" style="--template-bg: ${template.bg}">
        <div class="template-mini-phone" aria-hidden="true"></div>
      </div>
      <div class="template-body">
        <span class="template-category">${template.category}</span>
        <h3>${template.name}</h3>
        <div class="template-meta">
          <span class="template-mode ${getPlanBadgeClass(template)}">${getPlanBadgeText(template)}</span>
        </div>
        <p>${template.description}</p>
        <div class="template-actions">
          <button class="btn btn--outline btn--small" type="button" data-demo-template="${template.slug}">Ver demo</button>
          <button class="btn btn--primary btn--small" type="button" data-consult-template="${template.slug}">Quiero esta</button>
        </div>
      </div>
    </article>
  `).join("");

  empty?.classList.toggle("is-visible", visibleTemplates.length === 0);
  initReveal();
}

function renderBenefits() {
  const grid = document.getElementById("benefits-grid");
  if (!grid) return;

  grid.innerHTML = benefits.map((benefit, index) => `
    <div class="benefit-item reveal">
      <span class="benefit-icon" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
      <span>${benefit}</span>
    </div>
  `).join("");
}

function getAvailableDemoPlans(template) {
  return template.availablePlans.filter(plan => Boolean(template.demos?.[plan]));
}

function getPlanBadgeText(template) {
  const plans = getAvailableDemoPlans(template);
  if (plans.length === 1) return PLAN_LABELS[plans[0]];
  if (plans.length === 3) return "Disponible en 3 planes";
  return "Disponible en 2 planes";
}

function getPlanBadgeClass(template) {
  const plans = getAvailableDemoPlans(template);
  if (plans.length > 1) return "template-mode--both";
  return `template-mode--${plans[0] || "single"}`;
}

function setActiveFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll("[data-filter]").forEach(button => {
    button.classList.toggle("is-active", button.dataset.filter === activeFilter);
  });
  renderTemplates();
  document.getElementById("plantillas")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("digitarjetas-theme") || "light";
  applyTheme(savedTheme);

  toggle?.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
    localStorage.setItem("digitarjetas-theme", nextTheme);
    applyTheme(nextTheme);
  });

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark", isDark);
    toggle?.setAttribute("aria-pressed", String(isDark));
    toggle?.setAttribute("aria-label", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  }
}

function initMenu() {
  const toggle = document.getElementById("menu-toggle");
  const panel = document.getElementById("nav-panel");
  if (!toggle || !panel) return;

  function closeMenu() {
    panel.classList.remove("is-open");
    toggle.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
  }

  toggle.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Cerrar menu" : "Abrir menu");
  });

  panel.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeMenu();
      closeModal();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 980) closeMenu();
  }, { passive: true });
}

function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initFaq() {
  document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      if (!item) return;
      item.classList.toggle("is-open");
    });
  });
}

function initForm() {
  const form = document.getElementById("contact-form");
  const message = document.getElementById("form-message");
  if (!form || !message) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    const fields = [...form.querySelectorAll("[required]")];
    let isValid = true;

    fields.forEach(field => {
      const hasValue = field.value.trim().length > 0;
      field.classList.toggle("field-error", !hasValue);
      if (!hasValue) isValid = false;
    });

    if (!isValid) {
      message.textContent = "Completa los campos obligatorios para enviar la consulta.";
      message.classList.add("is-visible");
      return;
    }

    form.reset();
    message.textContent = "Gracias por tu consulta. Te vamos a contactar a la brevedad.";
    message.classList.add("is-visible");

    setTimeout(() => {
      message.classList.remove("is-visible");
    }, 6500);
  });

  form.querySelectorAll("input, select, textarea").forEach(field => {
    field.addEventListener("input", () => field.classList.remove("field-error"));
    field.addEventListener("change", () => field.classList.remove("field-error"));
  });
}

function initWhatsappLinks() {
  document.addEventListener("click", event => {
    const planButton = event.target.closest("[data-plan]");
    const messageButton = event.target.closest("[data-wa-message]");
    const whatsappTarget = planButton || messageButton;

    if (!whatsappTarget) return;
    event.preventDefault();

    let message = whatsappTarget.dataset.waMessage;

    if (planButton) {
      message = `Hola, quiero consultar por el Plan ${planButton.dataset.plan} de DigiTarjetas.`;
    }

    window.open(getWhatsappUrl(message), "_blank", "noopener");
  });
}

function initTemplateActions() {
  document.addEventListener("click", event => {
    const demoButton = event.target.closest("[data-demo-template]");
    const consultButton = event.target.closest("[data-consult-template]");
    if (!demoButton && !consultButton) return;

    event.preventDefault();
    const slug = demoButton?.dataset.demoTemplate || consultButton?.dataset.consultTemplate;
    const template = templates.find(item => item.slug === slug);
    if (!template) return;

    if (demoButton) handleDemoAction(template);
    if (consultButton) handleConsultAction(template);
  });
}

function handleDemoAction(template) {
  const plans = getAvailableDemoPlans(template);
  if (plans.length === 1) {
    const url = getDemoUrl(template, plans[0]);
    if (url) window.location.href = url;
    return;
  }

  openPlanModal({
    title: "Elegí qué versión querés ver",
    text: "Esta plantilla está disponible en distintos planes. Podés ver la versión simple, la versión visual con fotos y música, o la versión completa con formulario.",
    template,
    action: "demo",
  });
}

function handleConsultAction(template) {
  const plans = getAvailableDemoPlans(template);
  if (plans.length === 1) {
    window.open(getWhatsappUrl(getTemplateMessage(template, plans[0])), "_blank", "noopener");
    return;
  }

  openPlanModal({
    title: "Elegí el plan para consultar",
    text: "Así te enviamos la información correcta según la versión que querés usar para tu evento.",
    template,
    action: "consult",
  });
}

function initModal() {
  document.querySelectorAll("[data-modal-close]").forEach(element => {
    element.addEventListener("click", closeModal);
  });
}

function openPlanModal({ title, text, template, action }) {
  const modal = document.getElementById("template-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalText = document.getElementById("modal-text");
  const modalActions = document.getElementById("modal-actions");
  if (!modal || !modalTitle || !modalText || !modalActions) return;

  lastFocusedElement = document.activeElement;
  modalTitle.textContent = title;
  modalText.textContent = text;
  modalActions.innerHTML = getAvailableDemoPlans(template).map(plan => `
    <button class="btn ${plan === "plus" ? "btn--primary" : "btn--outline"}" type="button" data-modal-plan="${plan}">
      ${action === "demo" ? "Ver" : "Consultar"} ${PLAN_SHORT_LABELS[plan]}
    </button>
  `).join("");

  modalActions.querySelectorAll("[data-modal-plan]").forEach(button => {
    button.addEventListener("click", () => {
      const plan = button.dataset.modalPlan;
      closeModal();
      if (action === "demo") {
        const url = getDemoUrl(template, plan);
        if (url) window.location.href = url;
      } else {
        window.open(getWhatsappUrl(getTemplateMessage(template, plan)), "_blank", "noopener");
      }
    });
  });

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("menu-open");
  modal.querySelector("[data-modal-close]")?.focus();
}

function closeModal() {
  const modal = document.getElementById("template-modal");
  if (!modal?.classList.contains("is-open")) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("menu-open");
  lastFocusedElement?.focus?.();
}

function getDemoUrl(template, plan) {
  return template.demos?.[plan] || "";
}

function getTemplateMessage(template, plan) {
  return `Hola, quiero consultar por la plantilla ${template.name} en ${PLAN_LABELS[plan]}.`;
}

function getWhatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function initReveal() {
  const elements = document.querySelectorAll(".reveal:not(.is-visible)");
  if (!elements.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach(element => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  elements.forEach(element => observer.observe(element));
}

function setYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}
