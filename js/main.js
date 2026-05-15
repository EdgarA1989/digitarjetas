// DigiTarjetas
// Cambiar este numero por el WhatsApp real, solo numeros con codigo de pais.
const WHATSAPP_NUMBER = "549XXXXXXXXXX";

// Agregar nuevas plantillas aca:
// - modes: usar ["whatsapp"], ["formulario"] o ["whatsapp", "formulario"].
// - whatsappDemo y formDemo: cambiar links cuando subas demos reales.
// - image: si existe una imagen en assets/img/, se puede usar para reemplazar el mockup visual.
const templates = [
  {
    name: "Aurora",
    slug: "aurora",
    category: "15 a\u00f1os elegante",
    style: "elegante",
    modes: ["whatsapp", "formulario"],
    description: "Dise\u00f1o delicado, sofisticado y moderno para fiestas de 15 con estilo premium.",
    image: "assets/img/template-aurora.jpg",
    whatsappDemo: "./demos/quince/aurora/",
    formDemo: "./demos/quince-mail/aurora/",
    bg: "linear-gradient(145deg, #7b61ff, #f68ab8 55%, #f5ca78)",
  },
  {
    name: "Urban Glow",
    slug: "urban-glow",
    category: "15 a\u00f1os urbano / rap",
    style: "urbano",
    modes: ["whatsapp", "formulario"],
    description: "Una plantilla con energ\u00eda, actitud y est\u00e9tica urbana para eventos con personalidad.",
    image: "assets/img/template-urban-glow.jpg",
    whatsappDemo: "./demos/quince/urban-glow/",
    formDemo: "./demos/quince-mail/urban-glow/",
    bg: "linear-gradient(145deg, #10101b, #772fff 52%, #16d8ff)",
  },
  {
    name: "Blue Night",
    slug: "blue-night",
    category: "15 a\u00f1os moderna azul",
    style: "moderna",
    modes: ["whatsapp", "formulario"],
    description: "Dise\u00f1o nocturno, moderno y elegante con tonos azules, luces y detalles brillantes.",
    image: "assets/img/template-blue-night.jpg",
    whatsappDemo: "./demos/quince/blue-night/",
    formDemo: "./demos/quince-mail/blue-night/",
    bg: "linear-gradient(145deg, #071a44, #1f73ff 54%, #7fe8ff)",
  },
  {
    name: "Black White",
    slug: "black-white",
    category: "15 a\u00f1os blanco y negro",
    style: "quince",
    modes: ["whatsapp", "formulario"],
    description: "Una propuesta minimalista, elegante y editorial con contraste blanco y negro.",
    image: "assets/img/template-black-white.jpg",
    whatsappDemo: "./demos/quince/black-white/",
    formDemo: "./demos/quince-mail/black-white/",
    bg: "linear-gradient(145deg, #050505, #2b2b2b 58%, #f5f5f5)",
  },
  {
    name: "Neon Party",
    slug: "neon-party",
    category: "15 a\u00f1os urbana",
    style: "quince",
    modes: ["whatsapp", "formulario"],
    description: "Dise\u00f1o intenso, moderno y vibrante para una fiesta con mucha actitud.",
    image: "assets/img/template-neon-party.jpg",
    whatsappDemo: "./demos/quince/neon-party/",
    formDemo: "./demos/quince-mail/neon-party/",
    bg: "linear-gradient(145deg, #190821, #e040fb 52%, #ff6b35)",
  },
  {
    name: "Verde Menta",
    slug: "verde-menta",
    category: "15 a\u00f1os natural",
    style: "quince",
    modes: ["whatsapp", "formulario"],
    description: "Una plantilla luminosa, fresca y delicada con detalles verdes y estilo natural.",
    image: "assets/img/template-verde-menta.jpg",
    whatsappDemo: "./demos/quince/verde-menta/",
    formDemo: "./demos/quince-mail/verde-menta/",
    bg: "linear-gradient(145deg, #d4efec, #5bbfb5 54%, #3d9d93)",
  },
  {
    name: "Romance",
    slug: "romance",
    category: "Casamientos",
    style: "casamientos",
    modes: ["whatsapp"],
    description: "Una propuesta c\u00e1lida y elegante para celebrar una historia de amor.",
    image: "assets/img/template-romance.jpg",
    whatsappDemo: "#",
    formDemo: "",
    bg: "linear-gradient(145deg, #fff0e8, #e6a187 50%, #b96b86)",
  },
  {
    name: "Celeste",
    slug: "celeste",
    category: "Bautismos y comuniones",
    style: "bautismos",
    modes: ["formulario"],
    description: "Dise\u00f1o suave, luminoso y familiar para celebraciones especiales.",
    image: "assets/img/template-celeste.jpg",
    whatsappDemo: "",
    formDemo: "#",
    bg: "linear-gradient(145deg, #dff6ff, #74c7ef 52%, #f6f2d4)",
  },
  {
    name: "Golden Party",
    slug: "golden-party",
    category: "Cumplea\u00f1os adultos",
    style: "eventos",
    modes: ["whatsapp"],
    description: "Una plantilla festiva, elegante y vers\u00e1til para cumplea\u00f1os y eventos privados.",
    image: "assets/img/template-golden-party.jpg",
    whatsappDemo: "#",
    formDemo: "",
    bg: "linear-gradient(145deg, #17120c, #c89534 52%, #ffe29a)",
  },
  {
    name: "Corporate Link",
    slug: "corporate-link",
    category: "Eventos empresariales",
    style: "eventos",
    modes: ["whatsapp", "formulario"],
    description: "Invitaciones digitales sobrias y profesionales para eventos corporativos.",
    image: "assets/img/template-corporate-link.jpg",
    whatsappDemo: "#",
    formDemo: "#",
    bg: "linear-gradient(145deg, #0b1120, #2d5bff 56%, #9fb3ff)",
  },
];

const filters = [
  { label: "Todas", value: "all" },
  { label: "15 a\u00f1os", value: "quince" },
  { label: "Casamientos", value: "casamientos" },
  { label: "Bautismos", value: "bautismos" },
  { label: "Eventos", value: "eventos" },
];

const features = [
  ["01", "Dise\u00f1o personalizado", "Colores, textos y estilo adaptados a tu evento."],
  ["02", "Link para WhatsApp", "Un enlace claro y listo para compartir con invitados."],
  ["03", "Cuenta regresiva", "Genera expectativa hasta el d\u00eda del evento."],
  ["04", "Ubicaci\u00f3n con Google Maps", "Tus invitados llegan f\u00e1cil al lugar correcto."],
  ["05", "Galer\u00eda de fotos", "Sum\u00e1 im\u00e1genes importantes y momentos especiales."],
  ["06", "M\u00fasica de fondo", "Acompa\u00f1\u00e1 la invitaci\u00f3n con una canci\u00f3n elegida."],
  ["07", "Confirmaci\u00f3n de asistencia", "Organiz\u00e1 mejor qui\u00e9nes van a participar."],
  ["08", "Formulario RSVP", "Una forma simple de recibir respuestas."],
  ["09", "Bot\u00f3n para agendar fecha", "Tus invitados pueden guardar el evento."],
  ["10", "Dress code", "Indic\u00e1 el estilo de vestimenta de forma clara."],
  ["11", "Frase especial", "Un mensaje emotivo que represente la celebraci\u00f3n."],
  ["12", "Datos de regalo o alias", "Agreg\u00e1 alias, cuenta o informaci\u00f3n \u00fatil."],
  ["13", "Cronograma del evento", "Mostr\u00e1 los momentos importantes de la jornada."],
  ["14", "Mensaje personalizado", "Un cierre c\u00e1lido para tus invitados."],
];

const benefits = [
  "M\u00e1s pr\u00e1ctico que una invitaci\u00f3n impresa",
  "F\u00e1cil de compartir",
  "Ideal para WhatsApp",
  "Dise\u00f1o adaptable a cada evento",
  "Confirmaciones organizadas",
  "Ahorro de tiempo",
  "Experiencia moderna para los invitados",
  "Compatible con celulares",
];

const modeLabels = {
  whatsapp: "Invitaci\u00f3n por WhatsApp",
  formulario: "Invitaci\u00f3n con confirmaci\u00f3n de asistencia",
};

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
    if (activeFilter === "quince") return ["elegante", "urbano", "moderna", "quince"].includes(template.style);
    if (activeFilter === "whatsapp" || activeFilter === "formulario") return template.modes.includes(activeFilter);
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
          <span class="template-mode ${getModeBadgeClass(template)}">${getModeBadgeText(template)}</span>
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

function getModeBadgeText(template) {
  if (template.modes.length > 1) return "Disponible en ambas";
  return template.modes[0] === "formulario" ? "Con confirmaci\u00f3n" : "WhatsApp";
}

function getModeBadgeClass(template) {
  if (template.modes.length > 1) return "template-mode--both";
  return template.modes[0] === "formulario" ? "template-mode--formulario" : "";
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
      message = `Hola, quiero consultar por el Plan ${planButton.dataset.plan} de DigiTarjetas`;
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
  if (template.modes.length === 1) {
    const url = getDemoUrl(template, template.modes[0]);
    if (url) window.location.href = url;
    return;
  }

  openModeModal({
    title: "Eleg\u00ed c\u00f3mo quer\u00e9s ver esta plantilla",
    text: "Esta plantilla est\u00e1 disponible en dos modalidades. Pod\u00e9s verla como invitaci\u00f3n cl\u00e1sica para WhatsApp o con confirmaci\u00f3n de asistencia.",
    template,
    action: "demo",
  });
}

function handleConsultAction(template) {
  if (template.modes.length === 1) {
    window.open(getWhatsappUrl(getTemplateMessage(template, template.modes[0])), "_blank", "noopener");
    return;
  }

  openModeModal({
    title: "Eleg\u00ed la modalidad para consultar",
    text: "As\u00ed te enviamos la informaci\u00f3n correcta seg\u00fan la versi\u00f3n que quer\u00e9s usar para tu evento.",
    template,
    action: "consult",
  });
}

function initModal() {
  document.querySelectorAll("[data-modal-close]").forEach(element => {
    element.addEventListener("click", closeModal);
  });
}

function openModeModal({ title, text, template, action }) {
  const modal = document.getElementById("template-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalText = document.getElementById("modal-text");
  const modalActions = document.getElementById("modal-actions");
  if (!modal || !modalTitle || !modalText || !modalActions) return;

  lastFocusedElement = document.activeElement;
  modalTitle.textContent = title;
  modalText.textContent = text;
  modalActions.innerHTML = template.modes.map(mode => `
    <button class="btn ${mode === "whatsapp" ? "btn--outline" : "btn--primary"}" type="button" data-modal-mode="${mode}">
      ${mode === "whatsapp" ? "Versi\u00f3n WhatsApp" : "Versi\u00f3n con confirmaci\u00f3n"}
    </button>
  `).join("");

  modalActions.querySelectorAll("[data-modal-mode]").forEach(button => {
    button.addEventListener("click", () => {
      const mode = button.dataset.modalMode;
      closeModal();
      if (action === "demo") {
        const url = getDemoUrl(template, mode);
        if (url) window.location.href = url;
      } else {
        window.open(getWhatsappUrl(getTemplateMessage(template, mode)), "_blank", "noopener");
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

function getDemoUrl(template, mode) {
  return mode === "formulario" ? template.formDemo : template.whatsappDemo;
}

function getTemplateMessage(template, mode) {
  return `Hola, quiero consultar por la plantilla ${template.name} en modalidad ${modeLabels[mode]}.`;
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
