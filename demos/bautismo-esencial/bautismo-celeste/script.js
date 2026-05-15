// ─────────────────────────────────────────────────────────────
// Bautismo Celeste · Plan Esencial · DigiTarjetas
// ─────────────────────────────────────────────────────────────

// ── Editá acá ──
// El número de WhatsApp se lee desde config.json
// Si no hay config, se usa este valor como fallback:
const WHATSAPP_FALLBACK = "549XXXXXXXXXX";

// ── Init ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  fetch("./config.json")
    .then(r => r.json())
    .then(config => init(config))
    .catch(() => init(null));
});

function init(config) {
  config = config || getDefaultConfig();

  poblarCover(config);
  poblarHero(config);
  poblarFecha(config);
  poblarLugares(config);
  poblarWhatsapp(config);
  poblarFooter(config);
  initHeroFoto(config);
  initCountdown(config);
  initCover();
  initReveal();
  initSmoothScroll();
  initCalendar(config);
}

// ── Configuración por defecto ─────────────────────────────────
function getDefaultConfig() {
  return {
    eventType: "Bautismo",
    childName: "Mateo",
    title: "Bautismo de Mateo",
    subtitle: "Te invitamos a compartir este día tan especial.",
    date: "2026-09-20T15:30:00",
    ceremony: { title: "Ceremonia religiosa", place: "Parroquia San José", address: "Av. Belgrano 1250, Salta", mapUrl: "#" },
    celebration: { title: "Festejo", place: "Salón Los Olivos", address: "Mitre 845, Salta", mapUrl: "#" },
    whatsappNumber: WHATSAPP_FALLBACK
  };
}

// ── Helpers ───────────────────────────────────────────────────
function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value != null) el.textContent = value;
}
function setHref(id, href) {
  const el = document.getElementById(id);
  if (el && href) el.href = href;
}

// ── Poblado de secciones ──────────────────────────────────────
function poblarCover(config) {
  setText("cover-nombre", config.childName);
  setText("cover-fecha", formatDateLong(config.date));
  buildCoverParticles();
  buildCoverOrbs();
}

function poblarHero(config) {
  setText("hero-nombre", config.childName);
  setText("hero-sub", config.subtitle);
  setText("hero-fecha", formatDateLong(config.date));
  buildHeroOrbs();
}

function poblarFecha(config) {
  const date = new Date(config.date);
  const dias  = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  setText("fecha-dia",   dias[date.getDay()]);
  setText("fecha-fecha", `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`);
  setText("fecha-hora",  `${pad(date.getHours())}:${pad(date.getMinutes())} hs.`);
}

function poblarLugares(config) {
  if (config.ceremony) {
    setText("ceremony-title",   config.ceremony.title);
    setText("ceremony-place",   config.ceremony.place);
    setText("ceremony-address", config.ceremony.address);
    setHref("btn-ceremony-map", config.ceremony.mapUrl || "#");
  }
  if (config.celebration) {
    setText("celebration-title",   config.celebration.title);
    setText("celebration-place",   config.celebration.place);
    setText("celebration-address", config.celebration.address);
    setHref("btn-celebration-map", config.celebration.mapUrl || "#");
  }
}

function poblarWhatsapp(config) {
  const number  = config.whatsappNumber || WHATSAPP_FALLBACK;
  const message = `Hola, confirmo asistencia al bautismo de ${config.childName}.`;
  const btn = document.getElementById("btn-wa");
  if (btn) btn.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function poblarFooter(config) {
  const year = new Date(config.date).getFullYear();
  setText("footer-firma", `Con amor, la familia · ${year}`);
}

// ── Foto del hero ─────────────────────────────────────────────
function initHeroFoto(config) {
  const frame = document.getElementById("hero-foto-frame");
  if (!frame || !config.photos || !config.photos[0]) return;
  const img = new Image();
  img.alt = `Foto de ${config.childName}`;
  img.onload = () => {
    const ph = frame.querySelector(".hero-foto-placeholder");
    if (ph) ph.remove();
    frame.appendChild(img);
  };
  img.src = config.photos[0];
}

// ── Cuenta regresiva ──────────────────────────────────────────
function initCountdown(config) {
  const target = new Date(config.date).getTime();

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      ["cd-days","cd-hours","cd-mins","cd-secs"].forEach(id => setText(id, "00"));
      return;
    }
    setText("cd-days",  pad(Math.floor(diff / 86400000)));
    setText("cd-hours", pad(Math.floor((diff % 86400000) / 3600000)));
    setText("cd-mins",  pad(Math.floor((diff % 3600000)  / 60000)));
    setText("cd-secs",  pad(Math.floor((diff % 60000)    / 1000)));
  }

  tick();
  setInterval(tick, 1000);
}

// ── Cover ─────────────────────────────────────────────────────
function initCover() {
  const cover = document.getElementById("cover");
  const btn   = document.getElementById("btn-cover");
  if (!cover || !btn) return;

  btn.addEventListener("click", () => {
    cover.classList.add("hidden");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  });
}

// ── Reveal ────────────────────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

  els.forEach(el => observer.observe(el));
}

// ── Smooth scroll ─────────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// ── Calendario ICS ────────────────────────────────────────────
function initCalendar(config) {
  const btn = document.getElementById("btn-ics");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const start = new Date(config.date);
    const end   = new Date(start.getTime() + 3 * 3600000);

    const fmt = d => d.toISOString().replace(/[-:.]/g, "").slice(0, 15);

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//DigiTarjetas//Bautismo Celeste//ES",
      "BEGIN:VEVENT",
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:Bautismo de ${config.childName}`,
      `DESCRIPTION:${config.subtitle || ""}`,
      `LOCATION:${config.ceremony?.address || ""}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `bautismo-${(config.childName || "evento").toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ── Decorativos ───────────────────────────────────────────────
function buildCoverParticles() {
  const container = document.getElementById("cover-particles");
  if (!container) return;
  for (let i = 0; i < 14; i++) {
    const p = document.createElement("div");
    p.className = "cover-particle";
    const s = 3 + Math.random() * 4;
    p.style.cssText = `width:${s}px;height:${s}px;top:${rand(5,90)}%;left:${rand(5,90)}%;--dur:${(3+Math.random()*3).toFixed(1)}s;--delay:${(Math.random()*2).toFixed(1)}s;--op:${(0.3+Math.random()*0.4).toFixed(2)}`;
    container.appendChild(p);
  }
}

function buildCoverOrbs() {
  const c = document.getElementById("cover-orbs");
  if (!c) return;
  ["cover-orb--1","cover-orb--2"].forEach(cls => {
    const o = document.createElement("div");
    o.className = `cover-orb ${cls}`;
    c.appendChild(o);
  });
}

function buildHeroOrbs() {
  const c = document.getElementById("hero-orbs");
  if (!c) return;
  ["hero-orb--1","hero-orb--2"].forEach(cls => {
    const o = document.createElement("div");
    o.className = `hero-orb ${cls}`;
    c.appendChild(o);
  });
}

// ── Utilidades ────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, "0"); }
function rand(min, max) { return (min + Math.random() * (max - min)).toFixed(1); }

function formatDateLong(dateStr) {
  const d = new Date(dateStr);
  const dias  = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${dias[d.getDay()]} · ${d.getDate()} de ${meses[d.getMonth()]} · ${d.getFullYear()}`;
}
