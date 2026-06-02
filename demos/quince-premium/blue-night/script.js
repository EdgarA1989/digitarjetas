// =====================================================
//  Plantilla Trap · 15 años · script.js
// =====================================================

fetch('config.json')
  .then(r => r.json())
  .then(init)
  .catch(() => console.warn('Abrí con Live Server para cargar config.json'));


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
function init(c) {
  c = normalizeDemoAssets(c);
aplicarTema(c.tema);
  renderCover(c);
  renderHero(c);
  renderBienvenida(c.bienvenida);
  renderEvento(c);
  renderDresscode(c.dresscode);
  renderRegalos(c.regalos);
  renderGallery(c.fotos);
  initGalleryLightbox();
  renderMusica(c.musica);
  initRsvp(c);
  renderFooter(c.footer);

  renderCalendario(c.fecha);

  startCountdown(c.fecha);
  initParticles('cover-particles');
  initParticles('hero-particles');
  initCover();
  initCopy();
  initMusica();
  initCalendar(c);
  initFireIcons();
  // initReveal() se llama desde initCover() al abrir
}

// ── Tema ──────────────────────────────────────────────
function aplicarTema(tema) {
  if (!tema) return;
  const r = document.documentElement.style;
  if (tema.acento) {
    r.setProperty('--accent', tema.acento);
    const hex = tema.acento.replace('#', '');
    const [rv, g, b] = [0,2,4].map(i => parseInt(hex.substr(i*2,2),16));
    r.setProperty('--accent-glow', `rgba(${rv},${g},${b},.35)`);
  }
  if (tema.acento2) r.setProperty('--accent2', tema.acento2);
}

// ── Render cover ──────────────────────────────────────
function renderCover(c) {
  set('cover-nombre', c.nombre.toUpperCase());
  set('cover-frase',  c.frase);
  set('cover-fecha',  c.fechaDisplay);
}

// ── Render hero ───────────────────────────────────────
function renderHero(c) {
  set('hero-name',  c.nombre.toUpperCase());
  set('hero-frase', c.frase);
  set('hero-fecha', c.fechaDisplay);
  document.title = `15 · ${c.nombre}`;
  meta('description', `${c.frase} ${c.fechaDisplay}`);
  meta('og:title', `15 · ${c.nombre}`);
}

// ── Render bienvenida ─────────────────────────────────
function renderBienvenida(b) {
  set('bien-titulo', b.titulo);
  set('bien-texto',  b.texto);
}

// ── Render evento ─────────────────────────────────────
function renderEvento(c) {
  set('evento-fecha',  c.fechaDisplay);
  set('evento-hora',   c.hora);
  set('lugar-nombre',  c.lugar.nombre);
  set('lugar-barrio',  c.lugar.barrio);
  set('lugar-dir',     c.lugar.direccion);
  attr('btn-maps', 'href', c.lugar.mapsUrl);
}

// ── Render dresscode ──────────────────────────────────
function renderDresscode(d) {
  set('dresscode-texto', d.texto);
  set('dresscode-nota',  d.nota);
}

// ── Render regalos ────────────────────────────────────
function renderRegalos(r) {
  set('regalos-texto', r.texto);
  set('regalos-alias', r.alias);
  set('regalos-nombre', r.nombre || r.titular || r.cbu);
  set('regalos-banco', r.banco);
}

// ══════════════════════════════════════════════════════
//  GALERÍA CARD STACK
// ══════════════════════════════════════════════════════
const GC = { images:[], total:0, current:0, busy:false, dragging:false, dragStartX:0, dragDelta:0, didDrag:false };
const GC_STACK = [
  { x:0,     z:0,    r:0, shadow:0    },
  { x:7.25,  z:-100, r:2, shadow:.15  },
  { x:13,    z:-200, r:4, shadow:.28  },
  { x:17.25, z:-300, r:6, shadow:.38  },
  { x:20,    z:-400, r:8, shadow:.48  },
];
const GC_VISIBLE = GC_STACK.length, GC_THRESHOLD = 60;

function gcCard(gi) { return document.querySelector(`.gallery-card[data-gi="${gi}"]`); }
function gcRelPos(gi) { return ((gi - GC.current) % GC.total + GC.total) % GC.total; }
function gcSetPos(card, pos, animate) {
  const hidden = pos >= GC_VISIBLE, st = GC_STACK[Math.min(pos, GC_VISIBLE - 1)];
  card.style.transition  = animate ? 'transform 0.38s cubic-bezier(0.25,0.1,0.25,1), opacity 0.3s ease' : 'none';
  card.style.zIndex      = hidden ? '0' : String(GC.total - pos);
  card.style.opacity     = hidden ? '0' : '1';
  card.style.pointerEvents = pos === 0 ? 'auto' : 'none';
  card.style.transform   = `translate3d(${st.x}%, 0, ${st.z}px) rotateZ(${st.r}deg)`;
  const sh = card.querySelector('.gallery-card__shadow');
  if (sh) { sh.style.transition = animate ? 'opacity 0.38s ease' : 'none'; sh.style.opacity = String(hidden ? 0 : st.shadow); }
}
function gcRefresh(animate) {
  document.querySelectorAll('.gallery-card').forEach(card => gcSetPos(card, gcRelPos(Number(card.dataset.gi)), animate));
  gcUpdateCounter();
}
function gcUpdateCounter() {
  const el = document.querySelector('[data-gallery-counter]');
  if (el) el.textContent = `${GC.current + 1} / ${GC.total}`;
}
function gcGoNext() {
  if (GC.busy || GC.total < 2) return;
  GC.busy = true;
  const outCard = gcCard(GC.current);
  GC.current = (GC.current + 1) % GC.total;
  if (outCard) { outCard.style.transition = 'transform 0.42s cubic-bezier(0.55,0,1,0.45), opacity 0.32s ease'; outCard.style.zIndex = String(GC.total + 1); outCard.style.transform = 'translate3d(-115%, 0, 0) rotateZ(-10deg)'; outCard.style.opacity = '0'; }
  document.querySelectorAll('.gallery-card').forEach(card => { if (card !== outCard) gcSetPos(card, gcRelPos(Number(card.dataset.gi)), true); });
  gcUpdateCounter();
  setTimeout(() => { if (outCard) gcSetPos(outCard, gcRelPos(Number(outCard.dataset.gi)), false); GC.busy = false; }, 440);
}
function gcGoPrev() {
  if (GC.busy || GC.total < 2) return;
  GC.busy = true;
  GC.current = (GC.current - 1 + GC.total) % GC.total;
  const inCard = gcCard(GC.current);
  if (inCard) { inCard.style.transition = 'none'; inCard.style.zIndex = String(GC.total + 1); inCard.style.opacity = '1'; inCard.style.transform = 'translate3d(-115%, 0, 0) rotateZ(-8deg)'; const sh = inCard.querySelector('.gallery-card__shadow'); if (sh) sh.style.opacity = '0'; }
  document.querySelectorAll('.gallery-card').forEach(card => { if (card !== inCard) gcSetPos(card, gcRelPos(Number(card.dataset.gi)), true); });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (inCard) { inCard.style.transition = 'transform 0.42s cubic-bezier(0.25,0.1,0.25,1), opacity 0.3s ease'; inCard.style.transform = 'translate3d(0, 0, 0) rotateZ(0deg)'; }
    gcUpdateCounter();
    setTimeout(() => { GC.busy = false; }, 440);
  }));
}
function gcInitDrag(container) {
  container.addEventListener('pointerdown', e => { if (GC.busy || (e.button !== 0 && e.pointerType === 'mouse')) return; GC.dragging = true; GC.didDrag = false; GC.dragStartX = e.clientX; GC.dragDelta = 0; container.setPointerCapture(e.pointerId); });
  container.addEventListener('pointermove', e => { if (!GC.dragging) return; GC.dragDelta = e.clientX - GC.dragStartX; if (Math.abs(GC.dragDelta) > 5) GC.didDrag = true; gcDragUpdate(); });
  container.addEventListener('pointerup',     gcDragEnd);
  container.addEventListener('pointercancel', gcDragEnd);
}
function gcDragUpdate() {
  const d = GC.dragDelta, progress = Math.min(Math.abs(d) / GC_THRESHOLD, 1);
  const active = gcCard(GC.current);
  if (!active) return;
  active.style.transition = 'none';
  active.style.transform  = `translate3d(${d}px, 0, 0) rotateZ(${(d < 0 ? -1 : 1) * progress * 7}deg)`;
  if (d < 0) { const next = gcCard((GC.current + 1) % GC.total); if (next) { const st = GC_STACK[1]; next.style.transition = 'none'; next.style.transform = `translate3d(${st.x * (1 - progress)}%, 0, ${st.z * (1 - progress)}px) rotateZ(${st.r * (1 - progress)}deg)`; const sh = next.querySelector('.gallery-card__shadow'); if (sh) sh.style.opacity = String(st.shadow * (1 - progress)); } }
}
function gcDragEnd() {
  if (!GC.dragging) return;
  GC.dragging = false;
  const d = GC.dragDelta; GC.dragDelta = 0;
  if (!GC.didDrag) return;
  if (d < -GC_THRESHOLD) gcGoNext(); else if (d > GC_THRESHOLD) gcGoPrev(); else gcRefresh(true);
}
function renderGallery(fotos) {
  const carousel = document.querySelector('[data-gallery-carousel]');
  if (!carousel || !fotos?.length) { document.getElementById('galeria')?.style.setProperty('display','none'); return; }
  GC.images = fotos; GC.total = fotos.length; GC.current = 0; GC.busy = false;
  carousel.innerHTML = fotos.map((src, i) => `
    <div class="gallery-card" data-gi="${i}">
      <img src="${src}" alt="Foto ${i + 1}" loading="lazy">
      <div class="gallery-card__shadow" aria-hidden="true"></div>
    </div>`).join('');
  carousel.querySelectorAll('img').forEach(img => img.addEventListener('error', () => img.closest('.gallery-card')?.classList.add('is-missing')));
  gcRefresh(false);
  gcInitDrag(carousel);
  carousel.addEventListener('click', e => { if (GC.didDrag) return; const card = e.target.closest('.gallery-card[data-gi]'); if (card && gcRelPos(Number(card.dataset.gi)) === 0) openLightbox(GC.current); });
  document.querySelector('.gallery-prev')?.addEventListener('click', gcGoPrev);
  document.querySelector('.gallery-next')?.addEventListener('click', gcGoNext);
}

// ── Lightbox ──────────────────────────────────────────
let _lbIndex = 0, _lbHistoryOn = false;
function openLightbox(index) {
  const lb = document.querySelector('[data-gallery-lightbox]');
  if (!lb || !GC.total) return;
  _lbShowImage(index);
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (!_lbHistoryOn) { history.pushState({ galleryLb: true }, ''); _lbHistoryOn = true; }
  lb.querySelector('.lightbox-close')?.focus();
}
function closeLightbox() {
  const lb = document.querySelector('[data-gallery-lightbox]');
  if (!lb || lb.getAttribute('aria-hidden') !== 'false') return;
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  const wasOn = _lbHistoryOn; _lbHistoryOn = false;
  if (wasOn) history.back();
}
function _lbShowImage(index) {
  const n = ((index % GC.total) + GC.total) % GC.total; _lbIndex = n;
  const img = document.querySelector('[data-lightbox-image]');
  const ctr = document.querySelector('[data-lightbox-counter]');
  if (img) { img.src = GC.images[n]; img.alt = `Foto ${n + 1}`; }
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
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') goToNextImage();
    if (e.key === 'ArrowLeft')  goToPrevImage();
  });
  window.addEventListener('popstate', () => { if (_lbHistoryOn) { _lbHistoryOn = false; lb.setAttribute('aria-hidden','true'); document.body.style.overflow = ''; } });
}

// ── Render música ─────────────────────────────────────
function renderMusica(m) {
  set('musica-titulo',  m.titulo);
  set('musica-artista', m.artista);
  const audio = document.getElementById('audio');
  if (audio) audio.src = m.src;
}

// ── Confirmación ──────────────────────────────────────────────
function initRsvp(c) {
  if (typeof RsvpModal !== 'undefined') {
    RsvpModal.init(c.rsvp || {}, c.nombre);
  }
}

// ── Render footer ─────────────────────────────────────
function renderFooter(f) {
  set('footer-mensaje', f.mensaje);
  set('footer-firma',   f.firma);
}

// ── Countdown ─────────────────────────────────────────
function startCountdown(fechaISO) {
  const target = new Date(fechaISO).getTime();

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => set(id, '00'));
      return;
    }
    set('cd-days',  pad(Math.floor(diff / 86400000)));
    set('cd-hours', pad(Math.floor((diff % 86400000) / 3600000)));
    set('cd-mins',  pad(Math.floor((diff % 3600000) / 60000)));
    set('cd-secs',  pad(Math.floor((diff % 60000) / 1000)));
  }
  tick();
  setInterval(tick, 1000);
}

// ── Partículas flotantes (stage smoke) ───────────────
function initParticles(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const count = containerId === 'cover-particles' ? 55 : 30;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    const isPurple = Math.random() < 0.22;
    const size     = .4 + Math.random() * 2.2;
    el.style.cssText = `
      left:   ${Math.random() * 100}%;
      top:    ${(60 + Math.random() * 40)}%;
      width:  ${size}px;
      height: ${size}px;
      --dur:  ${4 + Math.random() * 9}s;
      --delay:${Math.random() * 10}s;
      --op:   ${.12 + Math.random() * .45};
      background: ${isPurple ? 'var(--accent)' : '#ffffff'};
    `;
    container.appendChild(el);
  }
}

// ── Cover ─────────────────────────────────────────────
function initCover() {
  const cover = document.getElementById('cover');
  const btn   = document.getElementById('btn-cover');
  if (!cover || !btn) return;

  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  btn.addEventListener('click', () => {
    document.getElementById('musica-btn')?.click();
    cover.classList.add('opening');
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      cover.style.display = 'none';
      initReveal();
    }, 1200);
  });
}

// ── Copy to clipboard ─────────────────────────────────
function initCopy() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      navigator.clipboard.writeText(target.textContent.trim()).then(() => {
        showToast();
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = target.textContent.trim();
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast();
      });
    });
  });
}

function showToast() {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}


// ── Música + ecualizador ──────────────────────────────
function initMusica() {
  const btn    = document.getElementById('musica-btn');
  const audio  = document.getElementById('audio');
  const eqBars = document.getElementById('eq-bars');
  const play  = btn?.querySelector('.icon-play');
  const pause = btn?.querySelector('.icon-pause');
  if (!btn || !audio) return;

  let playing = false;

  btn.addEventListener('click', () => {
    if (playing) {
      audio.pause();
      playing = false;
      play.style.display  = '';
      pause.style.display = 'none';
      eqBars?.classList.remove('active');
      btn.classList.remove('playing');
      btn.setAttribute('aria-label', 'Reproducir');
    } else {
      audio.play().then(() => {
        playing = true;
        play.style.display  = 'none';
        pause.style.display = '';
        eqBars?.classList.add('active');
        btn.classList.add('playing');
        btn.setAttribute('aria-label', 'Pausar');
      }).catch(() => {});
    }
  });
}

// ── Calendario visual ─────────────────────────────────
function renderCalendario(fechaISO) {
  const card = document.getElementById('calendario-card');
  if (!card) return;
  const fecha = new Date(fechaISO);
  const year = fecha.getFullYear(), month = fecha.getMonth(), day = fecha.getDate();
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const semana = ['L','M','M','J','V','S','D'];
  let startDow = new Date(year, month, 1).getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  const totalDias = new Date(year, month + 1, 0).getDate();
  let celdas = '';
  for (let i = 0; i < startDow; i++) celdas += '<span class="cal-dia cal-dia--vacio"></span>';
  for (let d = 1; d <= totalDias; d++) {
    const dow = (startDow + d - 1) % 7;
    const esFinde = dow === 5 || dow === 6;
    const esEvento = d === day;
    const cls = esEvento ? ' cal-dia--evento' : esFinde ? ' cal-dia--finde' : '';
    celdas += `<span class="cal-dia${cls}">${d}</span>`;
  }
  const nombreDia = fecha.toLocaleDateString('es-AR', { weekday: 'long' });
  card.innerHTML = `
    <div class="cal-header">
      <span class="cal-mes">${meses[month]}</span>
      <span class="cal-anio">${year}</span>
    </div>
    <div class="cal-semana">${semana.map(d => `<span class="cal-dow">${d}</span>`).join('')}</div>
    <div class="cal-grid">${celdas}</div>
    <p class="cal-label">// ${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} · ${day} de ${meses[month]}</p>`;
}

// ── Add to Calendar ───────────────────────────────────
function initCalendar(c) {
  const fecha = new Date(c.fecha);
  const fin   = new Date(fecha.getTime() + 6 * 3600000);
  const fmt   = d => d.toISOString().replace(/[-:]/g,'').split('.')[0];
  const titulo  = `15 de ${c.nombre}`;
  const detalle = `${c.frase} ${c.fechaDisplay}`;
  const lugar   = c.lugar.direccion;

  const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE`
    + `&text=${encodeURIComponent(titulo)}`
    + `&dates=${fmt(fecha)}/${fmt(fin)}`
    + `&details=${encodeURIComponent(detalle)}`
    + `&location=${encodeURIComponent(lugar)}`;

  const btnIcs = document.getElementById('btn-ics');
  if (btnIcs) {
    btnIcs.addEventListener('click', () => {
      const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Programate//15anios//ES',
        'BEGIN:VEVENT',
        `DTSTART:${fmt(fecha)}`,
        `DTEND:${fmt(fin)}`,
        `SUMMARY:${titulo}`,
        `DESCRIPTION:${detalle}`,
        `LOCATION:${lugar}`,
        'STATUS:CONFIRMED',
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');

      const blob   = new Blob([ics], { type: 'text/calendar' });
      const icsUrl = URL.createObjectURL(blob);
      const ua     = navigator.userAgent;

      if (/Android/i.test(ua)) {
        window.location.href = 'intent://calendar.google.com/calendar/render?action=TEMPLATE'
          + `&text=${encodeURIComponent(titulo)}`
          + `&dates=${fmt(fecha)}/${fmt(fin)}`
          + `&details=${encodeURIComponent(detalle)}`
          + `&location=${encodeURIComponent(lugar)}`
          + '#Intent;scheme=https;package=com.google.android.calendar;end';
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = icsUrl;
          a.download = `15-${c.nombre.toLowerCase()}.ics`;
          a.click();
          URL.revokeObjectURL(icsUrl);
        }, 800);
      } else if (/iPhone|iPad|iPod/i.test(ua)) {
        window.location.href = icsUrl;
        setTimeout(() => URL.revokeObjectURL(icsUrl), 5000);
      } else {
        window.open(calUrl, '_blank');
        const a = document.createElement('a');
        a.href = icsUrl;
        a.download = `15-${c.nombre.toLowerCase()}.ics`;
        a.click();
        URL.revokeObjectURL(icsUrl);
      }
    });
  }
}

// ── Reveal on scroll ──────────────────────────────────
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── Helpers ───────────────────────────────────────────
function set(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function attr(id, attribute, value) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attribute, value);
}

function meta(name, content) {
  const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (el) el.setAttribute('content', content);
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// ── Fuego animado: reemplaza // por SVG de llama ──────
function initFireIcons() {
  const FLAME = `<span class="fire-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path class="fire-o" d="M128 20C118 42 122 60 106 82C96 96 94 112 96 126C84 108 72 96 66 74C60 92 60 110 52 126C44 142 34 154 34 176C34 214 72 238 128 238C184 238 222 214 222 176C222 154 210 142 202 126C194 110 194 96 188 74C182 96 170 108 160 126C162 112 160 96 150 82C134 60 138 42 128 20Z"/><path class="fire-m" d="M128 74C118 94 120 108 108 126C100 138 96 152 98 166C88 154 80 142 76 124C68 138 64 152 64 170C64 202 92 226 128 226C164 226 192 202 192 170C192 152 188 138 180 124C176 142 168 154 158 166C160 152 156 138 148 126C136 108 138 94 128 74Z"/><path class="fire-i" d="M128 112C122 126 124 136 118 148C112 160 102 170 102 186C102 206 116 220 128 226C140 220 154 206 154 186C154 170 144 160 138 148C132 136 134 126 128 112Z"/></svg></span>`;

  document.querySelectorAll('.section-tag, .cover-tag, .hero-tag, .agendar-label')
    .forEach(el => { el.innerHTML = el.innerHTML.replace('//', FLAME); });
}
