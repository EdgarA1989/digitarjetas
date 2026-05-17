// ─────────────────────────────────────────────────────────────
// Bautismo Celeste · Plan Plus · DigiTarjetas
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


function normalizeDemoAssets(config) {
  if (!config) return config;
  const assets = config.assets || {};
  const imageBase = assets.imagesBasePath || "";
  const placeholder = assets.placeholderImage || "../../../assets/img/ui/placeholders/placeholder-evento.jpg";
  const localName = value => String(value || "").replace(/^\.\//, "").replace(/^img\//, "").replace(/^music\//, "");
  const isAbsolute = value => /^(https?:|data:|\/|\.\.\/)/.test(String(value || ""));
  const imageUrl = value => {
    if (!value) return placeholder;
    if (isAbsolute(value)) return value;
    return imageBase ? imageBase + localName(value) : value;
  };

  const gallerySource = Array.isArray(assets.gallery) && assets.gallery.length
    ? assets.gallery
    : (Array.isArray(config.fotos) ? config.fotos : (Array.isArray(config.photos) ? config.photos : []));
  const gallery = gallerySource.map(imageUrl).filter(Boolean);

  if (Array.isArray(config.fotos) || assets.gallery) config.fotos = gallery;
  if (Array.isArray(config.photos) || assets.gallery) config.photos = gallery;
  if (assets.heroImage || config.heroPhoto) config.heroPhoto = imageUrl(assets.heroImage || config.heroPhoto);
  if (assets.coverImage || config.coverPhoto) config.coverPhoto = imageUrl(assets.coverImage || config.coverPhoto);

  const musicPath = assets.musicPath || config.musica?.src || config.music?.src || "";
  if (config.musica) config.musica.src = musicPath;
  if (config.music) config.music.src = musicPath;
  return config;
}
function init(config) {
  config = normalizeDemoAssets(config || getDefaultConfig());

  poblarCover(config);
  poblarHero(config);
  poblarFecha(config);
  poblarLugares(config);
  poblarFrase(config);
  poblarDresscode(config);
  poblarRegalos(config);
  poblarWhatsapp(config);
  poblarFooter(config);
  initMusic(config);
  initCountdown(config);
  initGaleria(config);
  initHeroFoto(config);
  initCover();
  initReveal();
  initSmoothScroll();
  initCopyButtons();
  initCalendar(config);
  initLightbox();
}

// ── Configuración por defecto ─────────────────────────────────
function getDefaultConfig() {
  return {
    eventType: "Bautismo",
    childName: "Mateo",
    title: "Bautismo de Mateo",
    subtitle: "Te invitamos a compartir este día tan especial.",
    date: "2025-05-24T15:30:00",
    ceremony: { title: "Ceremonia religiosa", place: "Parroquia San José", address: "Av. Belgrano 1250, Salta", mapUrl: "#" },
    celebration: { title: "Festejo", place: "Salón Los Olivos", address: "Mitre 845, Salta", mapUrl: "#" },
    music: { src: "../../../assets/music/bautismo-clasico.mp3", title: "Canción especial", artist: "Artista" },
    photos: ["../../../assets/img/ui/placeholders/placeholder-evento.jpg", "../../../assets/img/ui/placeholders/placeholder-evento.jpg", "../../../assets/img/ui/placeholders/placeholder-evento.jpg", "../../../assets/img/ui/placeholders/placeholder-evento.jpg"],
    gift: { alias: "MATEO.BAUTISMO", text: "¡Tu cariño es nuestro mejor regalo!" },
    dressCode: "Elegante sport",
    specialPhrase: "Que la luz de Dios te acompañe siempre y te guíe en cada paso de tu vida.",
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

function initHeroFoto(config) {
  const frame = document.getElementById("hero-foto-frame");
  const src = config.heroPhoto || config.photos?.[0];
  if (!frame || !src) return;

  const img = new Image();
  img.alt = `Foto de ${config.childName}`;
  img.onload = () => {
    const ph = frame.querySelector(".hero-foto-placeholder");
    if (ph) ph.remove();
    frame.appendChild(img);
  };
  img.src = src;
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

function poblarFrase(config) {
  setText("frase-texto", config.specialPhrase);
}

function poblarDresscode(config) {
  setText("dresscode-texto", config.dressCode);
}

function poblarRegalos(config) {
  setText("regalos-alias", config.gift?.alias);
  setText("regalos-sub",   config.gift?.text);
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

// ── Música ────────────────────────────────────────────────────
function initMusic(config) {
  const audio  = document.getElementById("audio");
  const btn    = document.getElementById("musica-btn");
  const esfera = document.getElementById("musica-esfera");
  if (!audio || !btn) return;

  const musicConfig = config.music || {};
  audio.src = musicConfig.src || "../../../assets/music/bautismo-clasico.mp3";
  setText("musica-titulo",  musicConfig.title  || "Canción especial");
  setText("musica-artista", musicConfig.artist || "");
  buildMusicaParticulas();

  const iconPlay  = btn.querySelector(".icon-play");
  const iconPause = btn.querySelector(".icon-pause");

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().then(() => {
        if (iconPlay)  iconPlay.style.display  = "none";
        if (iconPause) iconPause.style.display = "block";
        btn.classList.add("playing");
        esfera?.classList.add("sonando");
      }).catch(() => {});
    } else {
      audio.pause();
      if (iconPlay)  iconPlay.style.display  = "block";
      if (iconPause) iconPause.style.display = "none";
      btn.classList.remove("playing");
      esfera?.classList.remove("sonando");
    }
  });
}

function buildMusicaParticulas() {
  const container = document.getElementById("musica-particulas");
  if (!container) return;
  const count = 16;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "musica-particula";
    const angle = (i / count) * 360 + Math.random() * 10;
    const rad   = angle * Math.PI / 180;
    const r     = 36 + Math.random() * 16;
    const cx = 75, cy = 75;
    const x  = cx + Math.cos(rad) * r;
    const y  = cy + Math.sin(rad) * r;
    const dx = Math.cos(rad) * (12 + Math.random() * 16);
    const dy = Math.sin(rad) * (12 + Math.random() * 16);
    const size = 4 + Math.random() * 6;
    p.style.cssText = `width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;left:${(x - size / 2).toFixed(1)}px;top:${(y - size / 2).toFixed(1)}px;--dur:${(2.5 + Math.random() * 2.5).toFixed(1)}s;--delay:${(Math.random() * 3).toFixed(1)}s;--op:${(0.35 + Math.random() * 0.4).toFixed(2)};--dx:${dx.toFixed(1)}px;--dy:${dy.toFixed(1)}px;`;
    container.appendChild(p);
  }
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

// ── Galería ───────────────────────────────────────────────────
function initGaleria(config) {
  const grid = document.getElementById("galeria-grid");
  if (!grid) return;

  const photos = config.photos || [];
  const total  = photos.length || 4;

  for (let i = 0; i < total; i++) {
    const item = document.createElement("div");
    item.className = "galeria-item reveal";

    if (photos[i]) {
      const img = new Image();
      img.alt = `Foto ${i + 1}`;
      img.dataset.index = i;
      img.onload  = () => item.appendChild(img);
      img.onerror = () => appendPlaceholder(item, i + 1);
      img.src = photos[i];
    } else {
      appendPlaceholder(item, i + 1);
    }

    grid.appendChild(item);
  }

  // Re-observe new elements
  if (window._revealObserver) {
    grid.querySelectorAll(".reveal").forEach(el => window._revealObserver.observe(el));
  }
}

function appendPlaceholder(item, num) {
  const ph = document.createElement("div");
  ph.className = "galeria-placeholder";
  ph.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>foto ${num}</span>`;
  item.appendChild(ph);
}

// ── Lightbox ──────────────────────────────────────────────────
function initLightbox() {
  const lightbox  = document.getElementById("lightbox");
  const closeBtn  = document.getElementById("lightbox-close");
  const lightImg  = document.getElementById("lightbox-img");
  if (!lightbox || !closeBtn || !lightImg) return;

  document.getElementById("galeria-grid")?.addEventListener("click", e => {
    const img = e.target.closest("img");
    if (!img) return;
    lightImg.src = img.src;
    lightImg.alt = img.alt;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  });

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  };

  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });
}

// ── Cover ─────────────────────────────────────────────────────
function initCover() {
  const cover  = document.getElementById("cover");
  const btn    = document.getElementById("btn-cover");
  if (!cover || !btn) return;

  btn.addEventListener("click", () => {
    cover.classList.add("hidden");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    // Intenta reproducir la música al abrir la invitación
    setTimeout(() => {
      const audio = document.getElementById("audio");
      if (!audio || !audio.src || audio.src === window.location.href) return;
      audio.play().then(() => {
        const musicBtn = document.getElementById("musica-btn");
        if (!musicBtn) return;
        const ip = musicBtn.querySelector(".icon-play");
        const pa = musicBtn.querySelector(".icon-pause");
        if (ip) ip.style.display = "none";
        if (pa) pa.style.display = "block";
        musicBtn.classList.add("playing");
        document.getElementById("musica-esfera")?.classList.add("sonando");
      }).catch(() => {});
    }, 900);
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
  window._revealObserver = observer;
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

// ── Copiar alias ──────────────────────────────────────────────
function initCopyButtons() {
  document.querySelectorAll(".copy-btn[data-target]").forEach(btn => {
    btn.addEventListener("click", () => {
      const el = document.getElementById(btn.dataset.target);
      if (!el) return;
      const text = el.textContent.trim();

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(showToast).catch(() => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
    });
  });
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); showToast(); } catch(_) {}
  ta.remove();
}

function showToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 2200);
}

// ── Calendario ICS ────────────────────────────────────────────
function initCalendar(config) {
  const btn = document.getElementById("btn-ics");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const start = new Date(config.date);
    const end   = new Date(start.getTime() + 3 * 3600000); // +3hs

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




