let config = {};
let galleryImages = [];
let galleryIndex = 0;
let lightboxHistory = false;
let plusRsvpHistory = false;
let premiumRsvpHistory = false;
let plusQty = 1;
let formQty = 1;

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("cover-open");
  fetch("config.json")
    .then(r => r.json())
    .then(data => {
      config = data;
      hydrateContent();
      initCover();
      initCountdown();
      initTimeline();
      initCalendar();
      initGallery();
      initMusic();
      initRsvp();
      initCopyAlias();
      initReveal();
    })
    .catch(err => {
      console.warn("[Comunion Amarillo Clasico] No se pudo cargar config.json", err);
      initCover();
      initReveal();
    });
});

function get(path, fallback = "") {
  return path.split(".").reduce((v, k) => v?.[k], config) ?? fallback;
}

function hydrateContent() {
  document.querySelectorAll("[data-text]").forEach(el => {
    el.textContent = get(el.dataset.text, el.textContent);
  });

  document.querySelectorAll("[data-link]").forEach(el => {
    const href = get(el.dataset.link);
    if (href) el.href = href;
  });

  setBackground("[data-bg='heroCover']", get("images.heroCover"));
  setBackground("[data-bg='heroChild']",  get("images.heroChild"));

  document.body.classList.toggle("has-gallery",      Boolean(get("gallery.enabled")));
  document.body.classList.toggle("has-music",        Boolean(get("music.enabled")));
  document.body.classList.toggle("has-plus-details", Boolean(get("features.plusDetails")));
}

function setBackground(selector, src) {
  const el = document.querySelector(selector);
  if (!el || !src) return;
  const img = new Image();
  img.onload = () => {
    el.classList.add("has-image");
    el.style.backgroundImage = `linear-gradient(180deg, rgba(31,26,26,.06), rgba(31,26,26,.14)), url("${src}")`;
  };
  img.onerror = () => el.classList.remove("has-image");
  img.src = src;
}

function initCover() {
  document.getElementById("open-invitation")?.addEventListener("click", () => {
    document.getElementById("cover")?.classList.add("is-hidden");
    document.body.classList.remove("cover-open");
    // Limpia el overflow inline que puso el script de carga inmediata
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.getElementById("inicio")?.scrollIntoView({ block: "start", behavior: "auto" });
  });
}

function initCountdown() {
  const date = new Date(get("dateISO"));
  if (Number.isNaN(date.getTime())) return;

  const update = () => {
    const diff = Math.max(0, date.getTime() - Date.now());
    setText("cd-days",  String(Math.floor(diff / 86400000)).padStart(3, "0"));
    setText("cd-hours", String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0"));
    setText("cd-mins",  String(Math.floor((diff % 3600000)  / 60000)).padStart(2, "0"));
    setText("cd-secs",  String(Math.floor((diff % 60000)    / 1000)).padStart(2, "0"));
  };

  update();
  setInterval(update, 1000);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function initTimeline() {
  const list = document.getElementById("timeline-list");
  const moments = get("timeline", []);
  if (!list || !Array.isArray(moments)) return;

  list.innerHTML = moments.map(item => `
    <div class="timeline-item">
      <strong>${escapeHtml(item.time)}</strong>
      <span>${escapeHtml(item.label)}</span>
    </div>
  `).join("");
}

function initCalendar() {
  const link = document.getElementById("calendar-link");
  const start = new Date(get("dateISO"));
  if (!link || Number.isNaN(start.getTime())) return;

  const end = new Date(start.getTime() + 75 * 60000);
  const fmt = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const params = new URLSearchParams({
    action:   "TEMPLATE",
    text:     `${get("eventType")} de ${get("name")}`,
    dates:    `${fmt(start)}/${fmt(end)}`,
    details:  get("welcomeText"),
    location: get("ceremony.address"),
  });
  link.href = `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function initGallery() {
  const gallery = get("gallery", {});
  galleryImages = Array.isArray(gallery.images) ? gallery.images : [];
  const track = document.getElementById("gallery-track");
  if (!gallery.enabled || !track || !galleryImages.length) return;

  track.innerHTML = galleryImages.map((src, i) => `
    <button class="gallery-item" type="button" data-gallery-index="${i}" aria-label="Ampliar foto ${i + 1}"></button>
  `).join("");

  track.querySelectorAll(".gallery-item").forEach((btn, i) => {
    setGalleryBackground(btn, galleryImages[i]);
    btn.addEventListener("click", () => openLightbox(i));
  });

  track.addEventListener("scroll", () => {
    const w = track.querySelector(".gallery-item")?.getBoundingClientRect().width || 1;
    const i = Math.round(track.scrollLeft / w);
    setText("gallery-counter", `${Math.min(i + 1, galleryImages.length)} / ${galleryImages.length}`);
  }, { passive: true });

  document.querySelector(".lightbox__close")?.addEventListener("click", closeLightbox);
  document.getElementById("lightbox-prev")?.addEventListener("click", () => moveLightbox(-1));
  document.getElementById("lightbox-next")?.addEventListener("click", () => moveLightbox(1));

  let touchStart = 0;
  const lightbox = document.getElementById("gallery-lightbox");
  lightbox?.addEventListener("touchstart", e => { touchStart = e.touches[0].clientX; }, { passive: true });
  lightbox?.addEventListener("touchend",   e => {
    const delta = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 45) moveLightbox(delta > 0 ? -1 : 1);
  }, { passive: true });
}

function setGalleryBackground(el, src) {
  const img = new Image();
  img.onload = () => {
    el.classList.add("has-image");
    el.style.backgroundImage = `url("${src}")`;
  };
  img.src = src;
}

function openLightbox(index) {
  galleryIndex = index;
  updateLightbox();
  document.getElementById("gallery-lightbox")?.classList.add("is-open");
  document.getElementById("gallery-lightbox")?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  if (!lightboxHistory) {
    history.pushState({ comunionLightbox: true }, "");
    lightboxHistory = true;
  }
}

function closeLightbox() {
  if (lightboxHistory && history.state?.comunionLightbox) { history.back(); return; }
  closeLightboxSilent();
}

function closeLightboxSilent() {
  lightboxHistory = false;
  document.getElementById("gallery-lightbox")?.classList.remove("is-open");
  document.getElementById("gallery-lightbox")?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function moveLightbox(step) {
  galleryIndex = (galleryIndex + step + galleryImages.length) % galleryImages.length;
  updateLightbox();
}

function updateLightbox() {
  const img = document.getElementById("lightbox-image");
  if (img) {
    img.style.display = "none";
    img.onload  = () => { img.style.display = ""; };
    img.onerror = () => { img.style.display = "none"; };
    img.src = galleryImages[galleryIndex] || "";
  }
  setText("lightbox-counter", `${galleryIndex + 1} / ${galleryImages.length}`);
}

function initMusic() {
  const audio  = document.getElementById("music-audio");
  const button = document.getElementById("music-toggle");
  const icon   = document.getElementById("music-icon");
  const src    = get("music.src");
  if (!audio || !button || !src) return;

  audio.src = src;
  button.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().then(() => {
        button.classList.add("is-playing");
        if (icon) icon.textContent = "Ⅱ";
      }).catch(() => {});
    } else {
      audio.pause();
      button.classList.remove("is-playing");
      if (icon) icon.textContent = "▶";
    }
  });
}

function initRsvp() {
  const plan      = get("plan", "esencial");
  const simple    = document.getElementById("simple-rsvp");
  const plus      = document.getElementById("plus-rsvp");
  const premium   = document.querySelector("[data-open-rsvp-modal]");
  const maxGuests = Number(get("whatsapp.maxGuests", get("rsvpForm.maxGuests", 6)));

  if (plan === "esencial") {
    if (simple) simple.href = getWhatsappUrl(get("whatsapp.simpleMessage"));

  } else if (plan === "plus") {
    if (simple) simple.hidden = true;
    if (plus)   plus.hidden   = false;
    plus?.addEventListener("click", openPlusRsvp);
    bindQty("qty-minus", "qty-plus", "qty-value", () => plusQty, v => { plusQty = v; }, maxGuests);
    document.getElementById("plus-rsvp-submit")?.addEventListener("click", () => {
      window.open(getWhatsappUrl(buildPlusMessage()), "_blank", "noopener");
    });
    document.querySelectorAll("[data-close-plus-rsvp]").forEach(el => el.addEventListener("click", closePlusRsvp));

  } else if (plan === "premium") {
    if (simple)  simple.hidden  = true;
    if (premium) premium.hidden = false;
    premium?.addEventListener("click", openPremiumRsvp);
    bindQty("form-qty-minus", "form-qty-plus", "form-qty-value", () => formQty, v => {
      formQty = v;
      renderGuestFields();
    }, maxGuests);
    renderGuestFields();
    document.querySelectorAll("[data-close-rsvp-modal]").forEach(el => el.addEventListener("click", closePremiumRsvp));
    document.getElementById("premium-rsvp-form")?.addEventListener("submit", e => {
      e.preventDefault();
      const success = document.getElementById("premium-success");
      if (success) success.hidden = false;
    });
  }

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (document.getElementById("gallery-lightbox")?.classList.contains("is-open"))    closeLightbox();
    if (document.getElementById("plus-rsvp-modal")?.classList.contains("is-open"))     closePlusRsvp();
    if (document.getElementById("premium-rsvp-modal")?.classList.contains("is-open"))  closePremiumRsvp();
  });

  window.addEventListener("popstate", () => {
    if (document.getElementById("gallery-lightbox")?.classList.contains("is-open"))    closeLightboxSilent();
    if (document.getElementById("plus-rsvp-modal")?.classList.contains("is-open"))     closePlusRsvpSilent();
    if (document.getElementById("premium-rsvp-modal")?.classList.contains("is-open"))  closePremiumRsvpSilent();
  });
}

function bindQty(minusId, plusId, valueId, getter, setter, max) {
  const sync = v => {
    setter(Math.max(1, Math.min(max, v)));
    setText(valueId, String(getter()));
  };
  document.getElementById(minusId)?.addEventListener("click", () => sync(getter() - 1));
  document.getElementById(plusId)?.addEventListener("click",  () => sync(getter() + 1));
}

function openPlusRsvp() {
  document.getElementById("plus-rsvp-modal")?.classList.add("is-open");
  document.getElementById("plus-rsvp-modal")?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  if (!plusRsvpHistory) {
    history.pushState({ comunionPlusRsvp: true }, "");
    plusRsvpHistory = true;
  }
}

function closePlusRsvp() {
  if (plusRsvpHistory && history.state?.comunionPlusRsvp) { history.back(); return; }
  closePlusRsvpSilent();
}

function closePlusRsvpSilent() {
  plusRsvpHistory = false;
  document.getElementById("plus-rsvp-modal")?.classList.remove("is-open");
  document.getElementById("plus-rsvp-modal")?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openPremiumRsvp() {
  document.getElementById("premium-rsvp-modal")?.classList.add("is-open");
  document.getElementById("premium-rsvp-modal")?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  if (!premiumRsvpHistory) {
    history.pushState({ comunionPremiumRsvp: true }, "");
    premiumRsvpHistory = true;
  }
}

function closePremiumRsvp() {
  if (premiumRsvpHistory && history.state?.comunionPremiumRsvp) { history.back(); return; }
  closePremiumRsvpSilent();
}

function closePremiumRsvpSilent() {
  premiumRsvpHistory = false;
  document.getElementById("premium-rsvp-modal")?.classList.remove("is-open");
  document.getElementById("premium-rsvp-modal")?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function buildPlusMessage() {
  const lines = [
    `Hola, confirmo asistencia a la comunión de ${get("name")}.`,
    "",
    `Cantidad de invitados: ${plusQty}`,
    "",
  ];
  for (let i = 1; i <= plusQty; i++) {
    lines.push(`Invitado ${i}:`, "Nombre:", "Apellido:", "");
  }
  return lines.join("\n");
}

function renderGuestFields() {
  const fields = document.getElementById("guest-fields");
  if (!fields) return;
  fields.innerHTML = Array.from({ length: formQty }, (_, i) => `
    <div class="guest-card">
      <strong>Asistente ${i + 1}</strong>
      <label class="form-field">Nombre<input name="firstName${i}" required></label>
      <label class="form-field">Apellido<input name="lastName${i}" required></label>
      <label class="form-field">Edad<input name="age${i}" type="number" min="0" max="120" value="${i === 0 ? 18 : ""}" required></label>
    </div>
  `).join("");
  fields.querySelectorAll("input[type='number']").forEach(inp => inp.addEventListener("input", updateSummary));
  updateSummary();
}

function updateSummary() {
  const ages   = Array.from(document.querySelectorAll("#guest-fields input[type='number']")).map(inp => Number(inp.value || 0));
  const minors = ages.filter(a => a > 0 && a < 18).length;
  const adults = Math.max(0, formQty - minors);
  setText("rsvp-summary", `Total: ${formQty} · Adultos: ${adults} · Menores: ${minors}`);
}

function initCopyAlias() {
  document.getElementById("copy-alias")?.addEventListener("click", () => {
    navigator.clipboard?.writeText(get("gift.alias", ""));
  });
}

function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

function getWhatsappUrl(message) {
  return `https://wa.me/${get("whatsapp.number")}?text=${encodeURIComponent(message || "")}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[c]));
}

