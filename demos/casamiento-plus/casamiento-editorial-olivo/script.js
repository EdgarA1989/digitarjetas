// =====================================================
//  Editorial Olivo · Plan Plus · script.js
// =====================================================

fetch('config.json')
  .then(r => r.json())
  .then(init)
  .catch(() => console.warn('Abrí con Live Server para cargar config.json'));

function normalizeDemoAssets(config) {
  if (!config) return config;
  const assets = config.assets || {};
  const imageBase = assets.imagesBasePath || '';
  const placeholder = assets.placeholderImage || '../../../assets/img/ui/placeholders/placeholder-evento.jpg';
  const localName = v => String(v || '').replace(/^\.\//, '').replace(/^img\//, '');
  const isAbsolute = v => /^(https?:|data:|\/|\.\.\/)/.test(String(v || ''));
  const imageUrl = v => {
    if (!v) return '';
    if (isAbsolute(v)) return v;
    return imageBase ? imageBase + localName(v) : v;
  };
  config._heroImage   = imageUrl(assets.heroImage   || '');
  config._heroPortada = imageUrl(assets.heroPortada || '');
  const musicPath = assets.musicPath || config.musica?.src || '';
  if (config.musica) config.musica.src = musicPath;
  config._gallery = (assets.gallery || []).map(img => imageUrl(img));
  return config;
}

function init(c) {
  c = normalizeDemoAssets(c);
  aplicarTema(c.tema);
  renderCover(c);
  renderHero(c);
  renderBienvenida(c.bienvenida);
  renderMusica(c.musica);
  renderEvento(c);
  renderTimeline(c.timeline);
  renderGallery(c.gallery);
  renderDresscode(c.dresscode);
  renderRegalos(c.regalos);
  renderConfirmar(c);
  renderMensajeFinal(c.mensajeFinal);
  renderFooter(c.footer);
  renderCalendario(c.fecha);
  startCountdown(c.fecha);
  initCover();
  initCalendar(c);
  initCopyButtons();
  initGalleryLightbox();
  initRsvpPlus(c);
}

// ── Tema ────────────────────────────────────────────
function aplicarTema(tema) {
  if (!tema) return;
  const r = document.documentElement.style;
  if (tema.acento)    r.setProperty('--accent',    tema.acento);
  if (tema.acento2)   r.setProperty('--accent2',   tema.acento2);
  if (tema.terra)     r.setProperty('--terra',     tema.terra);
  if (tema.champagne) r.setProperty('--champagne', tema.champagne);
}

// ── Cover ───────────────────────────────────────────
function renderCover(c) {
  const display = c.pareja?.display || `${c.pareja?.nombre1} & ${c.pareja?.nombre2}`;
  set('cover-names', display);
  set('cover-fecha', c.fechaDisplay);
  document.title = `Casamiento · ${display}`;
  if (c._heroImage) {
    const img = document.getElementById('cover-img');
    if (img) {
      const tmp = new Image();
      tmp.onload = () => {
        img.style.backgroundImage = `url('${c._heroImage}')`;
        document.getElementById('cover')?.classList.add('loaded');
      };
      tmp.onerror = () => {};
      tmp.src = c._heroImage;
    }
  }
}

// ── Hero ────────────────────────────────────────────
function renderHero(c) {
  const display = c.pareja?.display || `${c.pareja?.nombre1} & ${c.pareja?.nombre2}`;
  set('hero-names', display);
  set('hero-frase', c.frase);
  set('hero-fecha', c.fechaDisplay);
  const portada = document.getElementById('hero-portada');
  if (portada && c._heroPortada) portada.src = c._heroPortada;
}

// ── Bienvenida ──────────────────────────────────────
function renderBienvenida(b) {
  if (!b) return;
  set('bien-titulo', b.titulo);
  set('bien-texto',  b.texto);
}

// ── Música ──────────────────────────────────────────
function renderMusica(m) {
  if (!m) return;
  set('musica-titulo',  m.titulo || '');
  set('musica-artista', m.artista || '');
  const audio = document.getElementById('audio');
  if (audio && m.src) audio.src = m.src;
}

// ── Evento ──────────────────────────────────────────
function renderEvento(c) {
  set('evento-fecha', c.fechaDisplay);
  set('evento-hora',  c.hora);
  set('lugar-nombre', c.lugar.nombre);
  set('lugar-barrio', c.lugar.barrio);
  set('lugar-dir',    c.lugar.direccion);
  attr('btn-maps', 'href', c.lugar.mapsUrl);
}

// ── Timeline ────────────────────────────────────────
function renderTimeline(items) {
  const list = document.getElementById('timeline-list');
  if (!list || !Array.isArray(items)) return;
  list.innerHTML = items.map(item => `
    <div class="timeline-item" role="listitem">
      <span class="timeline-hora">${item.hora}</span>
      <div class="timeline-dot" aria-hidden="true"></div>
      <span class="timeline-evento">${item.evento}</span>
    </div>
  `).join('');
}

// ══════════════════════════════════════════════════════
//  GALERÍA CARD STACK (efecto mazo tipo Swiper cards)
// ══════════════════════════════════════════════════════

// Estado de la galería
const GC = {
  images:   [],
  total:    0,
  current:  0,
  busy:     false,   // bloquea mientras anima
  dragging: false,
  dragStartX: 0,
  dragDelta:  0,
  didDrag:    false, // distingue click de drag
};

// Posición visual de cada carta según distancia al activo
// pos 0 = activa (frente), pos 1 = primera detrás, etc.
const GC_STACK = [
  { x:  0,     z:   0, r: 0, shadow: 0    },
  { x:  7.25,  z:-100, r: 2, shadow: 0.15 },
  { x: 13,     z:-200, r: 4, shadow: 0.28 },
  { x: 17.25,  z:-300, r: 6, shadow: 0.38 },
  { x: 20,     z:-400, r: 8, shadow: 0.48 },
];
const GC_VISIBLE   = GC_STACK.length;
const GC_THRESHOLD = 60; // px para confirmar swipe

function gcCard(gi) {
  return document.querySelector(`.gallery-card[data-gi="${gi}"]`);
}

// Posición relativa al activo (0 = activa, 1 = primera detrás, etc.)
function gcRelPos(gi) {
  return ((gi - GC.current) % GC.total + GC.total) % GC.total;
}

// Aplica el transform de stack a una carta
function gcSetPos(card, pos, animate) {
  const hidden = pos >= GC_VISIBLE;
  const st     = GC_STACK[Math.min(pos, GC_VISIBLE - 1)];

  if (animate) {
    card.style.transition =
      'transform 0.38s cubic-bezier(0.25,0.1,0.25,1), opacity 0.3s ease';
  } else {
    card.style.transition = 'none';
  }

  card.style.zIndex        = hidden ? '0' : String(GC.total - pos);
  card.style.opacity       = hidden ? '0' : '1';
  card.style.pointerEvents = pos === 0 ? 'auto' : 'none';
  card.style.transform     =
    `translate3d(${st.x}%, 0, ${st.z}px) rotateZ(${st.r}deg)`;

  const sh = card.querySelector('.gallery-card__shadow');
  if (sh) {
    sh.style.transition = animate ? 'opacity 0.38s ease' : 'none';
    sh.style.opacity    = String(hidden ? 0 : st.shadow);
  }
}

// Actualiza todas las cartas al estado actual
function gcRefresh(animate) {
  document.querySelectorAll('.gallery-card').forEach(card => {
    gcSetPos(card, gcRelPos(Number(card.dataset.gi)), animate);
  });
  gcUpdateCounter();
}

function gcUpdateCounter() {
  const el = document.querySelector('[data-gallery-counter]');
  if (el) el.textContent = `${GC.current + 1} / ${GC.total}`;
}

// Avanza al siguiente (la carta activa vuela hacia la izquierda)
function gcGoNext() {
  if (GC.busy || GC.total < 2) return;
  GC.busy = true;

  const outCard = gcCard(GC.current);
  GC.current    = (GC.current + 1) % GC.total;

  // Carta que sale: vuela por la izquierda
  if (outCard) {
    outCard.style.transition =
      'transform 0.42s cubic-bezier(0.55,0,1,0.45), opacity 0.32s ease';
    outCard.style.zIndex    = String(GC.total + 1);
    outCard.style.transform = 'translate3d(-115%, 0, 0) rotateZ(-10deg)';
    outCard.style.opacity   = '0';
  }

  // Resto del mazo avanza un puesto
  document.querySelectorAll('.gallery-card').forEach(card => {
    if (card !== outCard) gcSetPos(card, gcRelPos(Number(card.dataset.gi)), true);
  });

  gcUpdateCounter();

  // Una vez terminada la animación, reposita la carta al fondo
  setTimeout(() => {
    if (outCard) gcSetPos(outCard, gcRelPos(Number(outCard.dataset.gi)), false);
    GC.busy = false;
  }, 440);
}

// Retrocede al anterior (la carta anterior vuela desde la izquierda)
function gcGoPrev() {
  if (GC.busy || GC.total < 2) return;
  GC.busy = true;

  GC.current    = (GC.current - 1 + GC.total) % GC.total;
  const inCard  = gcCard(GC.current);

  // Pre-posicionar la carta que entra, fuera de pantalla a la izquierda
  if (inCard) {
    inCard.style.transition = 'none';
    inCard.style.zIndex     = String(GC.total + 1);
    inCard.style.opacity    = '1';
    inCard.style.transform  = 'translate3d(-115%, 0, 0) rotateZ(-8deg)';
    const sh = inCard.querySelector('.gallery-card__shadow');
    if (sh) sh.style.opacity = '0';
  }

  // Resto del mazo retrocede un puesto
  document.querySelectorAll('.gallery-card').forEach(card => {
    if (card !== inCard) gcSetPos(card, gcRelPos(Number(card.dataset.gi)), true);
  });

  // En el próximo frame anima la carta entrante al centro
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (inCard) {
      inCard.style.transition =
        'transform 0.42s cubic-bezier(0.25,0.1,0.25,1), opacity 0.3s ease';
      inCard.style.transform = 'translate3d(0, 0, 0) rotateZ(0deg)';
    }
    gcUpdateCounter();
    setTimeout(() => { GC.busy = false; }, 440);
  }));
}

// ── Drag / swipe ──────────────────────────────────────
function gcInitDrag(container) {
  container.addEventListener('pointerdown', e => {
    if (GC.busy) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    GC.dragging   = true;
    GC.didDrag    = false;
    GC.dragStartX = e.clientX;
    GC.dragDelta  = 0;
    container.setPointerCapture(e.pointerId);
  });

  container.addEventListener('pointermove', e => {
    if (!GC.dragging) return;
    GC.dragDelta = e.clientX - GC.dragStartX;
    if (Math.abs(GC.dragDelta) > 5) GC.didDrag = true;
    gcDragUpdate();
  });

  container.addEventListener('pointerup',     gcDragEnd);
  container.addEventListener('pointercancel', gcDragEnd);
}

function gcDragUpdate() {
  const d        = GC.dragDelta;
  const progress = Math.min(Math.abs(d) / GC_THRESHOLD, 1);
  const active   = gcCard(GC.current);
  if (!active) return;

  // Carta activa sigue el dedo con leve rotación
  const rot = (d < 0 ? -1 : 1) * progress * 7;
  active.style.transition = 'none';
  active.style.transform  = `translate3d(${d}px, 0, 0) rotateZ(${rot}deg)`;

  // Swipe izquierda → revelar carta siguiente emergiendo del mazo
  if (d < 0) {
    const nextGi   = (GC.current + 1) % GC.total;
    const nextCard = gcCard(nextGi);
    if (nextCard) {
      const st = GC_STACK[1];
      nextCard.style.transition = 'none';
      nextCard.style.transform  =
        `translate3d(${st.x * (1 - progress)}%, 0, ${st.z * (1 - progress)}px) rotateZ(${st.r * (1 - progress)}deg)`;
      const sh = nextCard.querySelector('.gallery-card__shadow');
      if (sh) sh.style.opacity = String(st.shadow * (1 - progress));
    }
  }
}

function gcDragEnd() {
  if (!GC.dragging) return;
  GC.dragging = false;
  const d = GC.dragDelta;
  GC.dragDelta = 0;

  if (!GC.didDrag) return; // click real, no drag

  if (d < -GC_THRESHOLD)      gcGoNext();
  else if (d > GC_THRESHOLD)  gcGoPrev();
  else                         gcRefresh(true); // snap back
}

// ── Render principal ──────────────────────────────────
function renderGallery(galleryConfig) {
  const carousel = document.querySelector('[data-gallery-carousel]');
  if (!carousel) return;

  const images = galleryConfig?.images || [];
  if (!galleryConfig?.enabled || !images.length) {
    document.getElementById('galeria')?.style.setProperty('display', 'none');
    return;
  }

  GC.images  = images;
  GC.total   = images.length;
  GC.current = 0;
  GC.busy    = false;

  if (galleryConfig.title)    set('gallery-title',    galleryConfig.title);
  if (galleryConfig.subtitle) set('gallery-subtitle', galleryConfig.subtitle);

  // Renderizar cartas (orden: primera imagen arriba del todo)
  carousel.innerHTML = images.map((src, i) => `
    <div class="gallery-card" data-gi="${i}">
      <img src="${src}" alt="Foto de casamiento ${i + 1}" loading="lazy">
      <div class="gallery-card__shadow" aria-hidden="true"></div>
    </div>
  `).join('');

  // Fallback si imagen no carga
  carousel.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () =>
      img.closest('.gallery-card')?.classList.add('is-missing')
    );
  });

  // Posiciones iniciales sin animación
  gcRefresh(false);

  // Drag/swipe
  gcInitDrag(carousel);

  // Click en carta activa → lightbox (solo si no fue drag)
  carousel.addEventListener('click', e => {
    if (GC.didDrag) return;
    const card = e.target.closest('.gallery-card[data-gi]');
    if (!card) return;
    if (gcRelPos(Number(card.dataset.gi)) === 0) openLightbox(GC.current);
  });

  // Botones de navegación
  document.querySelector('.gallery-prev')?.addEventListener('click', gcGoPrev);
  document.querySelector('.gallery-next')?.addEventListener('click', gcGoNext);
}

// ── Lightbox ─────────────────────────────────────────
let _lbIndex    = 0;
let _lbHistoryOn = false;

function openLightbox(index) {
  const lb = document.querySelector('[data-gallery-lightbox]');
  if (!lb || !GC.total) return;
  _lbShowImage(index);
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (!_lbHistoryOn) {
    history.pushState({ galleryLb: true }, '');
    _lbHistoryOn = true;
  }
  lb.querySelector('.lightbox-close')?.focus();
}

function closeLightbox() {
  const lb = document.querySelector('[data-gallery-lightbox]');
  if (!lb || lb.getAttribute('aria-hidden') !== 'false') return;
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  const wasOn = _lbHistoryOn;
  _lbHistoryOn = false;
  if (wasOn) history.back();
}

function _lbShowImage(index) {
  const n   = ((index % GC.total) + GC.total) % GC.total;
  _lbIndex  = n;
  const img = document.querySelector('[data-lightbox-image]');
  const ctr = document.querySelector('[data-lightbox-counter]');
  if (img) { img.src = GC.images[n]; img.alt = `Foto de casamiento ${n + 1}`; }
  if (ctr) ctr.textContent = `${n + 1} / ${GC.total}`;
}

function goToNextImage() { _lbShowImage(_lbIndex + 1); }
function goToPrevImage() { _lbShowImage(_lbIndex - 1); }

function initGalleryLightbox() {
  const lb = document.querySelector('[data-gallery-lightbox]');
  if (!lb) return;

  lb.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  lb.querySelector('.lightbox-prev')?.addEventListener('click', goToPrevImage);
  lb.querySelector('.lightbox-next')?.addEventListener('click', goToNextImage);

  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (lb.getAttribute('aria-hidden') !== 'false') return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') goToNextImage();
    if (e.key === 'ArrowLeft')  goToPrevImage();
  });

  window.addEventListener('popstate', () => {
    if (_lbHistoryOn) {
      _lbHistoryOn = false;
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });
}

// ── Dress code ──────────────────────────────────────
function renderDresscode(d) {
  if (!d?.activo) return;
  set('dresscode-texto', d.texto);
  set('dresscode-nota',  d.nota);
}

// ── Regalos ─────────────────────────────────────────
function renderRegalos(r) {
  if (!r) return;
  set('regalos-texto',   r.texto);
  set('regalos-alias',   r.alias);
  set('regalos-titular', r.titular);
  set('regalos-banco',   r.banco);
}

// ── Confirmación ────────────────────────────────────
function renderConfirmar(c) {
  // El botón #btn-asiste lo maneja plus-whatsapp-rsvp.js
}

// ── Mensaje final ───────────────────────────────────
function renderMensajeFinal(mf) {
  if (!mf) return;
  set('final-titulo', mf.titulo);
  set('final-texto',  mf.texto);
}

// ── Footer ──────────────────────────────────────────
function renderFooter(f) {
  if (!f) return;
  set('footer-mensaje', f.mensaje);
  set('footer-firma',   f.firma);
}

// ── Calendario visual ───────────────────────────────
function renderCalendario(fechaISO) {
  const card = document.getElementById('calendario-card');
  if (!card) return;
  const fecha = new Date(fechaISO);
  const year = fecha.getFullYear(), month = fecha.getMonth(), day = fecha.getDate();
  const meses  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const semana = ['L','M','M','J','V','S','D'];
  let startDow = new Date(year, month, 1).getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  const totalDias = new Date(year, month + 1, 0).getDate();
  let celdas = '';
  for (let i = 0; i < startDow; i++) celdas += '<span class="cal-dia" aria-hidden="true"></span>';
  for (let d = 1; d <= totalDias; d++) {
    const dow = (startDow + d - 1) % 7;
    const cls = d === day ? ' cal-dia--evento' : (dow === 5 || dow === 6) ? ' cal-dia--finde' : '';
    celdas += `<span class="cal-dia${cls}">${d}</span>`;
  }
  const nombreDia = fecha.toLocaleDateString('es-AR', { weekday: 'long' });
  card.innerHTML = `
    <div class="cal-header"><span class="cal-mes">${meses[month]}</span><span class="cal-anio">${year}</span></div>
    <div class="cal-semana" aria-hidden="true">${semana.map(d => `<span class="cal-dow">${d}</span>`).join('')}</div>
    <div class="cal-grid">${celdas}</div>
    <p class="cal-label">· ${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} · ${day} de ${meses[month]}</p>`;
}

// ── Countdown ───────────────────────────────────────
function startCountdown(fechaISO) {
  const target = new Date(fechaISO).getTime();
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) { ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => set(id, '00')); return; }
    setCountdown('cd-days',  pad(Math.floor(diff / 86400000)));
    setCountdown('cd-hours', pad(Math.floor((diff % 86400000) / 3600000)));
    setCountdown('cd-mins',  pad(Math.floor((diff % 3600000) / 60000)));
    setCountdown('cd-secs',  pad(Math.floor((diff % 60000) / 1000)));
  }
  tick(); setInterval(tick, 1000);
}

function setCountdown(id, value) {
  const el = document.getElementById(id);
  if (!el || el.textContent === value) return;
  el.textContent = value;
  el.classList.remove('cd-tick');
  void el.offsetWidth;
  el.classList.add('cd-tick');
}

// ── Cover / apertura ────────────────────────────────
function initCover() {
  const cover = document.getElementById('cover');
  const btn   = document.getElementById('btn-cover');
  if (!cover || !btn) return;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  btn.addEventListener('click', () => {
    document.getElementById('musica-btn')?.click();
    cover.classList.add('opening');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    setTimeout(() => {
      cover.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'instant' });
      initReveal();
    }, 950);
  });
}

// ── Música interactiva ──────────────────────────────
function initMusica() {
  const btn   = document.getElementById('musica-btn');
  const audio = document.getElementById('audio');
  const disc  = document.getElementById('musica-disc');
  const play  = btn?.querySelector('.icon-play');
  const pause = btn?.querySelector('.icon-pause');
  if (!btn || !audio) return;
  let playing = false;
  btn.addEventListener('click', () => {
    if (playing) {
      audio.pause();
      disc?.classList.remove('spinning');
      if (play)  play.style.display  = '';
      if (pause) pause.style.display = 'none';
      btn.setAttribute('aria-label', 'Reproducir música');
    } else {
      audio.play().catch(() => {});
      disc?.classList.add('spinning');
      if (play)  play.style.display  = 'none';
      if (pause) pause.style.display = '';
      btn.setAttribute('aria-label', 'Pausar música');
    }
    playing = !playing;
  });
}

// ── RSVP Plus ───────────────────────────────────────
function initRsvpPlus(c) {
  // Configuración para plus-whatsapp-rsvp.js
  window.RSVP_CONFIG = {
    waNumber: c.whatsapp?.numero || '',
    maxGuests: c.rsvp?.maxGuests || 8,
    pareja: c.pareja?.display || '',
  };
  initMusica();
}

// ── Copy buttons ────────────────────────────────────
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const text = document.getElementById(targetId)?.textContent || '';
      navigator.clipboard?.writeText(text).then(() => showToast()).catch(() => fallbackCopy(text));
    });
  });
}

function fallbackCopy(text) {
  const el = document.createElement('textarea');
  el.value = text;
  el.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  showToast();
}

function showToast() {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2200);
}


// ── Add to Calendar ─────────────────────────────────
function initCalendar(c) {
  const btn = document.getElementById('btn-ics');
  if (!btn) return;
  const fecha  = new Date(c.fecha);
  const fin    = new Date(fecha.getTime() + 8 * 3600000);
  const fmt    = d => d.toISOString().replace(/[-:]/g, '').split('.')[0];
  const display = c.pareja?.display || '';
  const titulo  = `Casamiento de ${display}`;
  const lugar   = c.lugar?.direccion || '';
  const calUrl  = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&dates=${fmt(fecha)}/${fmt(fin)}&location=${encodeURIComponent(lugar)}`;
  btn.addEventListener('click', () => {
    const ics = ['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT',`DTSTART:${fmt(fecha)}`,`DTEND:${fmt(fin)}`,`SUMMARY:${titulo}`,`LOCATION:${lugar}`,'STATUS:CONFIRMED','END:VEVENT','END:VCALENDAR'].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url  = URL.createObjectURL(blob);
    const ua   = navigator.userAgent;
    if (/Android/i.test(ua)) {
      window.location.href = `intent://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&dates=${fmt(fecha)}/${fmt(fin)}&location=${encodeURIComponent(lugar)}#Intent;scheme=https;package=com.google.android.calendar;end`;
      setTimeout(() => { const a = document.createElement('a'); a.href = url; a.download = 'boda.ics'; a.click(); URL.revokeObjectURL(url); }, 800);
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      window.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } else {
      window.open(calUrl, '_blank');
      const a = document.createElement('a'); a.href = url; a.download = 'boda.ics'; a.click(); URL.revokeObjectURL(url);
    }
  });
}

// ── Reveal on scroll ────────────────────────────────
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── Helpers ─────────────────────────────────────────
function set(id, text) { const el = document.getElementById(id); if (el) el.textContent = text ?? ''; }
function attr(id, a, v) { const el = document.getElementById(id); if (el && v) el.setAttribute(a, v); }
function pad(n) { return String(n).padStart(2, '0'); }
