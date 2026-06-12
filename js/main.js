// DigiTarjetas
// Cambiar este numero por el WhatsApp real, solo numeros con codigo de pais.
const WHATSAPP_NUMBER = "5491151498796";

const PLAN_LABELS = {
  esencial: "Plan Esencial",
  plus: "Plan Plus",
  premium: "Plan Premium",
  completo: "Plan Completo",
};

const PLAN_SHORT_LABELS = {
  esencial: "Esencial",
  plus: "Plus",
  premium: "Premium",
  completo: "Completo",
};

let revealObserver;
let pendingTemplateReturnSlug = null;

// Agregar nuevas plantillas aca:
// - availablePlans: indicar los planes disponibles: ["esencial"], ["plus"], ["premium"] o combinados.
// - demos: cambiar los links relativos cuando subas nuevas demos.
// - Para agregar una demo Plus, crear la carpeta en demos/quince-plus/nombre-plantilla/ y cargar la URL en demos.plus.
// - previewVideo, previewGif y previewImage se renderizan dentro del celular en ese orden de prioridad.
// - Para muchos videos, conviene usar archivos cortos y luego sumar lazy loading con IntersectionObserver.
const templates = [
  {
    name: "Aurora",
    slug: "aurora",
    category: "15 años elegante",
    style: "quince",
    availablePlans: ["esencial", "plus", "premium"],
    description: "Diseño delicado, sofisticado y moderno para fiestas de 15 con estilo premium.",
    image: "assets/img/demos/aurora/preview.png",
    previewImage: "assets/img/demos/aurora/preview.png",
    decorativeMedia: true,
    darkPreview: true,
    previewType: "demo",
    demos: {
      esencial: "./demos/quince/aurora/",
      plus: "./demos/quince-plus/aurora/",
      premium: "./demos/quince-premium/aurora/",
    },
    bg: "linear-gradient(145deg, #7b61ff, #f68ab8 55%, #f5ca78)",
  },
  {
    name: "Urban Glow",
    slug: "urban-glow",
    category: "15 años urbano / rap",
    style: "quince",
    availablePlans: ["esencial", "plus", "premium"],
    description: "Una plantilla con energía, actitud y estética urbana para eventos con personalidad.",
    image: "assets/img/demos/urban-glow/preview.png",
    previewImage: "assets/img/demos/urban-glow/preview.png",
    decorativeMedia: true,
    darkPreview: true,
    previewType: "demo",
    demos: {
      esencial: "./demos/quince/urban-glow/",
      plus: "./demos/quince-plus/urban-glow/",
      premium: "./demos/quince-premium/urban-glow/",
    },
    bg: "linear-gradient(145deg, #10101b, #772fff 52%, #16d8ff)",
  },
  {
    name: "Blue Night",
    slug: "blue-night",
    category: "15 años moderna azul",
    style: "quince",
    availablePlans: ["esencial", "plus", "premium"],
    description: "Diseño nocturno, moderno y elegante con tonos azules, luces y detalles brillantes.",
    image: "assets/img/demos/blue-night/preview.png",
    previewImage: "assets/img/demos/blue-night/preview.png",
    darkPreview: true,
    previewType: "demo",
    demos: {
      esencial: "./demos/quince/blue-night/",
      plus: "./demos/quince-plus/blue-night/",
      premium: "./demos/quince-premium/blue-night/",
    },
    bg: "linear-gradient(145deg, #071a44, #1f73ff 54%, #7fe8ff)",
  },
  {
    name: "Black White",
    slug: "black-white",
    category: "15 años blanco y negro",
    style: "quince",
    availablePlans: ["esencial", "plus", "premium"],
    description: "Una propuesta minimalista, elegante y editorial con contraste blanco y negro.",
    image: "assets/img/demos/black-white/preview.png",
    previewImage: "assets/img/demos/black-white/preview.png",
    darkPreview: true,
    previewType: "demo",
    demos: {
      esencial: "./demos/quince/black-white/",
      plus: "./demos/quince-plus/black-white/",
      premium: "./demos/quince-premium/black-white/",
    },
    bg: "linear-gradient(145deg, #050505, #2b2b2b 58%, #f5f5f5)",
  },
  {
    name: "Neon Party",
    slug: "neon-party",
    category: "15 años urbana",
    style: "quince",
    availablePlans: ["esencial", "plus", "premium"],
    description: "Diseño intenso, moderno y vibrante para una fiesta con mucha actitud.",
    image: "assets/img/demos/neon-party/preview.png",
    previewImage: "assets/img/demos/neon-party/preview.png",
    darkPreview: true,
    previewType: "demo",
    demos: {
      esencial: "./demos/quince/neon-party/",
      plus: "./demos/quince-plus/neon-party/",
      premium: "./demos/quince-premium/neon-party/",
    },
    bg: "linear-gradient(145deg, #190821, #e040fb 52%, #ff6b35)",
  },
  {
    name: "Verde Menta",
    slug: "verde-menta",
    category: "15 años natural",
    style: "quince",
    availablePlans: ["esencial", "plus", "premium"],
    description: "Una plantilla luminosa, fresca y delicada con detalles verdes y estilo natural.",
    image: "assets/img/demos/verde-menta/preview.png",
    previewImage: "assets/img/demos/verde-menta/preview.png",
    previewType: "demo",
    demos: {
      esencial: "./demos/quince/verde-menta/",
      plus: "./demos/quince-plus/verde-menta/",
      premium: "./demos/quince-premium/verde-menta/",
    },
    bg: "linear-gradient(145deg, #d4efec, #5bbfb5 54%, #3d9d93)",
  },
  {
    name: "Editorial Olivo",
    slug: "casamiento-editorial-olivo",
    category: "Casamientos",
    style: "casamientos",
    availablePlans: ["esencial", "plus", "premium"],
    description: "Invitación de boda con estética editorial boutique. Tonos oliva, marfil y terracota. Diseño cálido, moderno y premium.",
    image: "assets/img/demos/casamiento-editorial-olivo/preview.png",
    previewImage: "assets/img/demos/casamiento-editorial-olivo/preview.png",
    previewType: "demo",
    demos: {
      esencial: "./demos/casamiento-escencial/casamiento-editorial-olivo/",
      plus:     "./demos/casamiento-plus/casamiento-editorial-olivo/",
      premium:  "./demos/casamiento-premium/casamiento-editorial-olivo/",
    },
    bg: "linear-gradient(145deg, #EDE7DC, #6F7764 55%, #42483A)",
  },
  {
    name: "Casamiento Dorado",
    slug: "casamiento-dorado",
    category: "Casamientos",
    style: "casamientos",
    availablePlans: ["esencial", "plus", "premium"],
    description: "Plantilla elegante de casamiento con paleta ivory y dorado. Incluye galería, música, timeline, datos de regalo y formulario RSVP con múltiples invitados.",
    image: "assets/img/demos/casamiento-dorado/preview.png",
    previewImage: "assets/img/demos/casamiento-dorado/preview.png",
    darkPreview: true,
    previewType: "demo",
    demos: {
      esencial: "./demos/casamiento-escencial/casamiento-dorado/",
      plus:     "./demos/casamiento-plus/casamiento-dorado/",
      premium:  "./demos/casamiento-premium/casamiento-dorado/",
    },
    bg: "linear-gradient(145deg, #F3E8D7, #C6A46C 55%, #A8864A)",
  },
  {
    name: "Bautismo Celeste",
    slug: "bautismo-celeste",
    category: "Bautismos",
    style: "bautismos",
    availablePlans: ["esencial", "plus", "premium"],
    description: "Diseño delicado, luminoso y elegante para bautismos. Incluye galería, música, dress code y datos de regalo.",
    image: "assets/img/demos/bautismo-celeste/preview.png",
    previewVideo: "assets/videos/previews/bautismo-celeste.mp4",
    previewImage: "assets/img/demos/bautismo-celeste/preview.png",
    previewType: "demo",
    demos: {
      esencial: "./demos/bautismo-esencial/bautismo-celeste/",
      plus: "./demos/bautismo-plus/bautismo-celeste/",
      premium: "./demos/bautismo-premium/bautismo-celeste/",
    },
    bg: "linear-gradient(145deg, #7cbfe3, #c9e8f7 54%, #e8d09a)",
  },
  {
    name: "Bautismo Rosa",
    slug: "bautismo-rosa",
    category: "Bautismos",
    style: "bautismos",
    availablePlans: ["esencial", "plus", "premium"],
    description: "Diseño delicado y femenino para bautismos de niña. Incluye galería asimétrica, música, dress code y datos de regalo.",
    image: "assets/img/demos/bautismo-rosa/preview.png",
    previewImage: "assets/img/demos/bautismo-rosa/preview.png",
    previewType: "demo",
    demos: {
      esencial: "./demos/bautismo-esencial/bautismo-rosa/",
      plus: "./demos/bautismo-plus/bautismo-rosa/",
      premium: "./demos/bautismo-premium/bautismo-rosa/",
    },
    bg: "linear-gradient(145deg, #f2c4d5, #f9dde8 54%, #e8d09a)",
  },
  {
    name: "Comunión Amarillo Clásico",
    slug: "comunion-amarillo-clasico",
    category: "Comuniones",
    style: "eventos",
    availablePlans: ["esencial", "plus", "premium"],
    description: "Una invitación clásica y elegante para Primera Comunión, con tonos amarillo dorado, marfil y detalles negros editoriales.",
    image: "assets/img/demos/comunion-amarillo-clasico/preview.png",
    previewImage: "assets/img/demos/comunion-amarillo-clasico/preview.png",
    previewType: "demo",
    demos: {
      esencial: "./demos/comunion-esencial/comunion-amarillo-clasico/",
      plus: "./demos/comunion-plus/comunion-amarillo-clasico/",
      premium: "./demos/comunion-premium/comunion-amarillo-clasico/",
    },
    bg: "linear-gradient(145deg, #faeecb, #fef9e6 55%, #f2d88a)",
  },
  {
    name: "Golden Party",
    slug: "golden-party",
    category: "Cumpleaños adultos",
    style: "eventos",
    availablePlans: ["plus"],
    description: "Una plantilla festiva, elegante y versátil para cumpleaños y eventos privados.",
    image: "assets/img/template-golden-party.jpg",
    previewImage: "assets/img/template-golden-party.jpg",
    previewType: "preview",
    demos: { esencial: "", plus: "#", premium: "" },
    bg: "linear-gradient(145deg, #17120c, #c89534 52%, #ffe29a)",
  },
];

const filters = [
  { label: "15 años", value: "quince" },
  { label: "Bautismos", value: "bautismos" },
  { label: "Casamientos", value: "casamientos" },
  { label: "Eventos", value: "eventos" },
  { label: "Ver todas", value: "all" },
];

const features = [
  ["01", "Diseño personalizado", "Colores, textos y estilo adaptados al tipo de evento y a la estética que quieras transmitir.", "Todos los planes"],
  ["02", "Link para compartir por WhatsApp", "Un enlace claro, moderno y fácil de enviar a familiares, amigos e invitados.", "Todos los planes"],
  ["03", "Cuenta regresiva", "Genera expectativa y acompaña la emoción hasta el gran día del evento.", "Todos los planes"],
  ["04", "Ubicación con Google Maps", "Tus invitados acceden rápido a la ubicación exacta y llegan más fácil al lugar.", "Todos los planes"],
  ["05", "Botón para agendar fecha", "Tus invitados pueden guardar el evento en su calendario y recordarlo fácilmente.", "Todos los planes"],
  ["06", "Confirmación simple por WhatsApp", "Una forma rápida y directa para que tus invitados avisen si van a asistir.", "Plan Esencial"],
  ["07", "Galería de fotos", "Sumá imágenes especiales para que la experiencia se vea más personal, emotiva y visual.", "Plus y Premium"],
  ["08", "Música de fondo", "Acompañá la experiencia con una canción que represente el momento o el estilo del evento.", "Plus y Premium"],
  ["09", "Frase especial", "Agregá un mensaje emotivo que le dé identidad y calidez a la propuesta.", "Plus y Premium"],
  ["10", "Dress code", "Indicá de forma clara el estilo de vestimenta para acompañar mejor la propuesta del evento.", "Plus y Premium"],
  ["11", "Datos de regalo o alias", "Incluí alias, cuenta o información útil de forma prolija, simple y bien integrada.", "Plus y Premium"],
  ["12", "Secciones personalizadas / cronograma", "Mostrá horarios, momentos clave o detalles especiales de forma ordenada.", "Plus y Premium"],
  ["13", "Confirmación inteligente por WhatsApp", "El invitado usa un selector para indicar cuántas personas confirma y recibe un mensaje listo para enviar.", "Plan Plus"],
  ["14", "Formulario integrado de confirmación", "La confirmación sucede dentro de la invitación, sin Google Forms visible y con una experiencia más cuidada.", "Plan Premium"],
  ["15", "Registro en planilla online", "Las confirmaciones quedan organizadas para consultar invitados, cantidades y datos importantes.", "Plan Premium"],
  ["16", "Resumen de confirmaciones", "Accedé a confirmados, adultos, menores y datos clave del evento.", "Plan Premium"],
];

const benefits = [
  "Todo en un solo link",
  "Lista para compartir por WhatsApp",
  "Diseño adaptado a tu evento",
  "Experiencia moderna para invitados",
  "Confirmaciones más ordenadas",
  "Formulario integrado sin Google Forms",
  "Planilla online con registros",
  "Resumen claro de invitados",
];

let activeFilter = getInitialTemplateFilter();
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
  initMoreModelsModal();
  initModal();
  initReveal();
  setYear();
});

function renderFeatures() {
  const grid = document.getElementById("features-grid");
  if (!grid) return;

  grid.innerHTML = features.map(([icon, title, text, plan]) => `
    <article class="feature-card reveal">
      <div class="feature-card__top">
        <span class="feature-icon" aria-hidden="true">${icon}</span>
        <span class="feature-plan">${plan}</span>
      </div>
      <h3>${title}</h3>
      <p>${text}</p>
    </article>
  `).join("");
}

function getInitialTemplateFilter() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("categoria") || params.get("category") || "";
  pendingTemplateReturnSlug = params.get("plantilla") || params.get("template") || null;
  if (pendingTemplateReturnSlug) {
    const selectedTemplate = templates.find(template => template.slug === pendingTemplateReturnSlug);
    if (selectedTemplate) return selectedTemplate.style;
  }

  const normalized = category.toLowerCase();
  const allowedFilters = filters.map(filter => filter.value);
  const aliases = {
    "15": "quince",
    "15-anos": "quince",
    "15-anios": "quince",
    quince: "quince",
    quinces: "quince",
    bautismo: "bautismos",
    bautismos: "bautismos",
    comunion: "bautismos",
    comuniones: "bautismos",
    casamiento: "casamientos",
    casamientos: "casamientos",
    boda: "casamientos",
    bodas: "casamientos",
    evento: "eventos",
    eventos: "eventos",
    all: "all",
    todas: "all",
  };
  const filter = aliases[normalized] || normalized;

  return allowedFilters.includes(filter) ? filter : "quince";
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
    return template.style === activeFilter;
  });

  grid.innerHTML = visibleTemplates.map(template => `
    <article class="template-card reveal" id="plantilla-${template.slug}" data-template-card="${template.slug}">
      <div class="template-card__body${template.decorativeMedia ? " template-card__body--decorative-media" : ""}" style="--template-bg: ${template.bg}; --template-image: url('${template.image}')">
        <div class="template-card__media">
          <div class="template-mini-phone${template.darkPreview ? " template-mini-phone--light-frame" : ""}" aria-hidden="true">
            <div class="template-mini-screen">
              ${template.previewImage ? `<img class="template-preview-media template-preview-media--${template.slug}" src="${template.previewImage}" alt="" aria-hidden="true" loading="lazy" decoding="async" fetchpriority="low" onerror="this.style.display='none'">` : ""}
            </div>
          </div>
        </div>
        <div class="template-card__content">
          <span class="template-category">${template.category}</span>
          <h3>${template.name}</h3>
          <div class="template-meta">
            <span class="template-mode ${getPlanBadgeClass(template)}">${getPlanBadgeText(template)}</span>
          </div>
          <p>${template.description}</p>
        </div>
        <div class="template-actions">
          ${getAvailableDemoPlans(template).length
            ? `<button class="btn btn--outline btn--small" type="button" data-demo-template="${template.slug}">Ver demo</button>`
            : `<button class="btn btn--outline btn--small" type="button" disabled>Demo pronto</button>`}
          <button class="btn btn--primary btn--small" type="button" data-consult-template="${template.slug}">Quiero esta</button>
        </div>
      </div>
    </article>
  `).join("");

  empty?.classList.toggle("is-visible", visibleTemplates.length === 0);
  renderMoreModelsCta(visibleTemplates.length);
  initReveal();
  restoreTemplateReturnPosition();
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
  return template.availablePlans.filter(plan => {
    const url = template.demos?.[plan];
    return Boolean(url && url !== "#");
  });
}

function getMoreModelsInfo(filter) {
  const categories = {
    all: {
      url: "./plantillas/",
      text: "Explorá todos los modelos visuales disponibles.",
    },
    quince: {
      url: "./plantillas/?categoria=quince",
      text: "Explorá más modelos visuales de quince años.",
    },
    bautismos: {
      url: "./plantillas/?categoria=bautismo",
      text: "Explorá más modelos visuales de bautismo y comunión.",
    },
    casamientos: {
      url: "./plantillas/?categoria=casamiento",
      text: "Explorá más modelos visuales de casamiento.",
    },
    eventos: {
      url: "./plantillas/?categoria=eventos",
      text: "Explorá más modelos visuales para eventos especiales.",
    },
  };

  return categories[filter] || categories.all;
}

function renderMoreModelsCta(visibleCount) {
  const cta = document.getElementById("more-models-cta");
  if (!cta) return;

  const info = getMoreModelsInfo(activeFilter);
  cta.hidden = visibleCount === 0;
  cta.innerHTML = `
    <div>
      <strong>¿Querés ver más estilos?</strong>
      <p>${info.text}</p>
    </div>
    <button class="btn btn--primary" type="button" data-more-models>Más modelos</button>
  `;
}

function getPlanBadgeText(template) {
  const plans = getAvailableDemoPlans(template);
  if (plans.length === 0) return "Demo en preparación";
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

function restoreTemplateReturnPosition() {
  if (!pendingTemplateReturnSlug) return;

  const slug = pendingTemplateReturnSlug;
  pendingTemplateReturnSlug = null;

  window.setTimeout(() => {
    const card = document.querySelector(`[data-template-card="${slug}"]`);
    if (!card) return;

    card.scrollIntoView({ behavior: "auto", block: "center" });
    card.classList.add("is-visible");
  }, 80);
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

      if (href === "#inicio") {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

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
    if (url) {
      rememberTemplateReturn(template);
      window.location.href = url;
    }
    return;
  }

  openPlanModal({
    title: "Elegí qué versión querés ver",
    text: "Esta plantilla está disponible en distintos planes. Podés ver la versión simple, la versión visual con fotos y música, o la versión premium con formulario.",
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
  document.addEventListener("click", event => {
    if (event.target.closest("[data-modal-close]")) closeModal();
  });
}

function initMoreModelsModal() {
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-more-models]");
    if (!button) return;

    event.preventDefault();
    openMoreModelsModal();
  });
}

function openPlanModal({ title, text, template, action }) {
  const modal = document.getElementById("template-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalText = document.getElementById("modal-text");
  const modalActions = document.getElementById("modal-actions");
  if (!modal || !modalTitle || !modalText || !modalActions) return;

  lastFocusedElement = document.activeElement;
  modal.classList.remove("modal--more-models");
  const eyebrow = modal.querySelector(".eyebrow");
  if (eyebrow) eyebrow.textContent = "Modalidad";
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
        if (url) {
          rememberTemplateReturn(template);
          window.location.href = url;
        }
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

function openMoreModelsModal() {
  const modal = document.getElementById("template-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalText = document.getElementById("modal-text");
  const modalActions = document.getElementById("modal-actions");
  if (!modal || !modalTitle || !modalText || !modalActions) return;

  lastFocusedElement = document.activeElement;
  modal.classList.add("modal--more-models");
  const eyebrow = modal.querySelector(".eyebrow");
  if (eyebrow) eyebrow.textContent = "Catálogo";
  modalTitle.textContent = "Más modelos en camino";
  modalText.textContent = "Estamos trabajando en nuevas plantillas para ampliar el catálogo. Si no encontrás el estilo que buscás, podemos crear una invitación personalizada especialmente para tu evento.";
  modalActions.innerHTML = `
    <button class="btn btn--primary" type="button" data-more-models-whatsapp>Diseñar mi invitación</button>
    <button class="btn btn--outline" type="button" data-modal-close>Cerrar</button>
  `;

  modalActions.querySelector("[data-more-models-whatsapp]")?.addEventListener("click", () => {
    closeModal();
    window.open(getWhatsappUrl("Hola, quiero diseñar una invitación personalizada para mi evento."), "_blank", "noopener");
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

function rememberTemplateReturn(template) {
  if (!template?.slug) return;

  const filter = template.style || activeFilter || "quince";
  const returnState = {
    slug: template.slug,
    filter,
    scrollY: window.scrollY,
  };

  try {
    sessionStorage.setItem("dt-template-return", JSON.stringify(returnState));
  } catch (_) {}

  if (window.history?.replaceState) {
    const returnUrl = new URL(window.location.href);
    returnUrl.searchParams.set("categoria", filter);
    returnUrl.searchParams.set("plantilla", template.slug);
    returnUrl.hash = "plantillas";
    history.replaceState(history.state, "", returnUrl);
  }
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

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
  }

  elements.forEach(element => revealObserver.observe(element));
}

function setYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}




