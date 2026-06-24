/* ── script.js: lógica de la experiencia especial ── */

const $ = (id) => document.getElementById(id);

// ── Estado global ──
let audioReady = false;
let isPlaying = false;

// ── Inicialización ──
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('cover-open');
  renderHero();
  renderCalendario();
  renderSections();
  setupGalleryObserver();
  setupLightbox();
  renderFinalStep();
  renderModal();
  renderTransition();
  renderFinal();
  setupAudio();
  setupCover();
  setupModal();
  setupFinalStep();
  setupReveal();
});

// ── Render: hero ──
function renderHero() {
  const h = specialConfig.hero;
  $('hero-title').textContent   = h.title;
  $('hero-subtitle').textContent = h.subtitle;
  $('hero-text').textContent    = h.text;
  $('hero-btn-text').textContent = h.button;
  const img = $('hero-img');
  img.src = h.image;
  img.alt = h.title;
}

// ── Render: calendario ──
function renderCalendario() {
  const cal  = specialConfig.calendar;
  const card = $('calendario-card');
  if (!card || !cal) return;

  if ($('calendario-eyebrow')) $('calendario-eyebrow').textContent = cal.eyebrow;
  if ($('calendario-titulo'))  $('calendario-titulo').textContent  = cal.title;

  // T12:00:00 evita desfase de timezone
  const fecha     = new Date(cal.date + 'T12:00:00');
  const year      = fecha.getFullYear();
  const month     = fecha.getMonth();
  const day       = fecha.getDate();

  const meses  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const semana = ['L','M','M','J','V','S','D'];

  let startDow = new Date(year, month, 1).getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;

  const totalDias = new Date(year, month + 1, 0).getDate();

  let celdas = '';
  for (let i = 0; i < startDow; i++) {
    celdas += '<span class="cal-dia" aria-hidden="true"></span>';
  }
  for (let d = 1; d <= totalDias; d++) {
    const dow = (startDow + d - 1) % 7;
    if (d === day) {
      celdas += `<span class="cal-dia cal-dia--evento" aria-label="${d} — nuestro día">${d}</span>`;
    } else {
      const cls = (dow === 5 || dow === 6) ? ' cal-dia--finde' : '';
      celdas += `<span class="cal-dia${cls}">${d}</span>`;
    }
  }

  const nombreDia = fecha.toLocaleDateString('es-AR', { weekday: 'long' });

  card.innerHTML = `
    <div class="cal-header">
      <span class="cal-mes">${meses[month]}</span>
      <span class="cal-anio">${year}</span>
    </div>
    <div class="cal-semana" aria-hidden="true">
      ${semana.map(d => `<span class="cal-dow">${d}</span>`).join('')}
    </div>
    <div class="cal-grid">${celdas}</div>
    <p class="cal-label">♡ ${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} · ${day} de ${meses[month]}</p>
  `;
}

// ── Render: secciones de historia ──
function renderSections() {
  const container = $('history-container');
  specialConfig.sections.forEach((sec, i) => {
    const section = document.createElement('section');
    section.className = 'history-section';
    section.id = sec.id;

    const ordinal  = String(i + 1).padStart(2, '0');
    const isFirst  = i === 0;
    section.innerHTML = `
      <div class="history-header${isFirst ? ' section-one-copy' : ''}">
        <span class="history-number reveal">Capítulo ${ordinal}</span>
        <h2 class="history-title reveal">${sec.title}</h2>
        <p class="history-text reveal">${sec.text}</p>
        <p class="history-short-text reveal">${sec.shortText}</p>
      </div>
      ${buildGallery(sec.layout, sec.images, sec.title)}
    `;
    container.appendChild(section);

    // separador entre secciones (no después de la última)
    if (i < specialConfig.sections.length - 1) {
      const sep = document.createElement('img');
      sep.src = '../../assets/img/clientes/especial/separador.png';
      sep.className = 'section-separator';
      sep.alt = '';
      sep.setAttribute('aria-hidden', 'true');
      container.appendChild(sep);
    }
  });
}

function buildGallery(layout, images, altBase) {
  const wrapClass = {
    featured:  'gallery-featured',
    grid:      'gallery-grid',
    collage:   'gallery-collage',
    polaroid:  'gallery-polaroid',
    emotional: 'gallery-emotional',
    album:     'gallery-album'
  }[layout] || 'gallery-grid';

  const items = images.map((src, i) => `
    <div class="img-wrap reveal-photo" style="--delay: ${i * 140}ms">
      <img src="${src}" alt="${altBase} — foto ${i + 1}" loading="lazy" onerror="this.style.background='#EFE3D0';this.removeAttribute('src')" />
    </div>`).join('');

  return `<div class="${wrapClass}">${items}</div>`;
}

// ── Render: cierre ──
function renderFinalStep() {
  const f = specialConfig.finalStep;
  $('final-step-text').textContent    = f.text;
  $('final-step-subtitle').textContent = f.subtitle;
  $('final-step-btn-text').textContent = f.button;
}

// ── Render: modal ──
function renderModal() {
  const m = specialConfig.modal;
  $('modal-title').textContent = m.title;
  $('modal-text').textContent  = m.text;
  $('btn-modal-confirm').textContent = m.confirm;
  $('btn-modal-cancel').textContent  = m.cancel;
}

// ── Render: transición ──
function renderTransition() {
  const t = specialConfig.transition;
  $('transition-title').textContent = t.title;
  $('transition-text').textContent  = t.text;
}

// ── Render: pantalla final ──
function renderFinal() {
  const f = specialConfig.final;
  $('final-title').textContent    = f.title;
  $('final-subtitle').textContent = f.subtitle;
}

// ── Audio ──
function setupAudio() {
  const audio = $('audio');
  /* Reemplazá cancion.mp3 con la música real */
  audio.src = specialConfig.music.src;

  $('btn-music').addEventListener('click', toggleMusic);
}

function toggleMusic() {
  const audio = $('audio');
  if (!audioReady) {
    audio.load();
    audioReady = true;
  }
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    $('btn-music').classList.remove('playing');
    $('icon-play').style.display  = '';
    $('icon-pause').style.display = 'none';
  } else {
    audio.play().catch(() => {});
    isPlaying = true;
    $('btn-music').classList.add('playing');
    $('icon-play').style.display  = 'none';
    $('icon-pause').style.display = '';
  }
}

function startMusicIfReady() {
  if (!isPlaying) toggleMusic();
}

// ── Portada ──
function setupCover() {
  const cover   = $('cover');
  const main    = $('main');
  const musicBtn = $('btn-music');

  $('btn-cover').addEventListener('click', () => {
    cover.classList.add('opening');
    setTimeout(() => {
      cover.style.display = 'none';
      document.body.classList.remove('cover-open');
      main.setAttribute('aria-hidden', 'false');
      main.classList.add('visible');
      musicBtn.classList.add('visible');
      startMusicIfReady();
      $('hero').scrollIntoView({ behavior: 'instant' });
      // inicia el loop de reveal
      requestAnimationFrame(() => setTimeout(triggerVisibleInViewport, 50));
      // failsafe: después de 3s fuerza visible todo lo que quede pendiente
      setTimeout(() => {
        document.querySelectorAll('.reveal:not(.visible)').forEach((el) => el.classList.add('visible'));
      }, 3000);
    }, 800);
  });

  // Hero: botón comenzar → scroll a primera sección
  $('btn-hero').addEventListener('click', () => {
    $('calendario').scrollIntoView({ behavior: 'smooth' });
  });
}

// ── Modal ──
function setupModal() {
  const modal = $('modal');

  $('btn-final-step').addEventListener('click', openModal);
  $('btn-modal-cancel').addEventListener('click', closeModal);
  $('btn-modal-confirm').addEventListener('click', () => {
    closeModal();
    showTransition();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function openModal() {
  const modal = $('modal');
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('active'));
}

function closeModal() {
  const modal = $('modal');
  modal.classList.remove('active');
  setTimeout(() => { modal.hidden = true; }, 400);
}

// ── Transición + Countdown ──
function showTransition() {
  const screen = $('transition-screen');
  screen.hidden = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => screen.classList.add('active'));

  const { from, interval } = specialConfig.countdown;
  const numEl = $('countdown-number');

  // pequeña pausa antes de empezar el countdown
  setTimeout(() => {
    runCountdown(from, interval, numEl, () => {
      showFinal();
      setTimeout(() => {
        screen.classList.remove('active');
        setTimeout(() => { screen.hidden = true; }, 600);
      }, 80);
    });
  }, 1800);
}

function runCountdown(n, interval, el, onDone) {
  if (n < 0) { onDone(); return; }

  el.classList.remove('show');
  el.textContent = n === 0 ? '♡' : String(n);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add('show'));
  });

  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => runCountdown(n - 1, interval, el, onDone), 300);
  }, interval);
}

// ── Pantalla final ──
function showFinal() {
  const screen = $('final-screen');
  screen.hidden = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    screen.classList.add('active');
    setupFinalBtns();
  });
}

function setupFinalBtns() {
  $('btn-si').addEventListener('click', showRespuesta);
  $('btn-no').addEventListener('click', () => {
    const btn = $('btn-no');
    btn.textContent = 'Pensalo bien… ♡';
    btn.style.pointerEvents = 'none';
  });
}

function showRespuesta() {
  const screen = $('respuesta-screen');
  screen.hidden = false;
  requestAnimationFrame(() => screen.classList.add('active'));
}

// ── IntersectionObserver: imágenes de todas las secciones ──
function setupGalleryObserver() {
  const photos = document.querySelectorAll('.reveal-photo');
  if (!photos.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      // El collage entra todo junto para preservar el efecto escalonado desde lados
      const collage = el.closest('.gallery-collage');
      if (collage) {
        collage.querySelectorAll('.reveal-photo').forEach(w => {
          w.classList.add('is-visible');
          observer.unobserve(w);
        });
      } else {
        el.classList.add('is-visible');
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });

  photos.forEach(el => observer.observe(el));
}

// ── Lightbox ──
function setupLightbox() {
  const lb    = $('lightbox');
  const img   = $('lightbox-img');
  const close = $('lightbox-close');
  const prev  = $('lightbox-prev');
  const next  = $('lightbox-next');
  if (!lb) return;

  let idx = 0;
  let lbScrollY = 0;
  let touchStartX = 0;

  // Todas las imágenes en orden de config (igual al orden DOM de renderSections)
  const lbImages = specialConfig.sections.flatMap(sec => sec.images);

  const allWraps = () => Array.from(document.querySelectorAll('#history-container .img-wrap'));

  const goTo = (i) => {
    idx = (i + lbImages.length) % lbImages.length;
    img.src = lbImages[idx];
  };

  const openLb = (i) => {
    lbScrollY = window.scrollY;
    idx = i;
    img.src = lbImages[idx];
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    history.pushState({ lightbox: true }, '');
  };

  const closeLb = () => {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (history.state?.lightbox) history.back();
    else window.scrollTo({ top: lbScrollY, behavior: 'instant' });
  };

  const closeSilent = () => {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    window.scrollTo({ top: lbScrollY, behavior: 'instant' });
  };

  // Click en cualquier foto de galería — índice por posición DOM
  document.getElementById('history-container').addEventListener('click', (e) => {
    const wrap = e.target.closest('.img-wrap');
    if (!wrap) return;
    const i = allWraps().indexOf(wrap);
    if (i !== -1 && lbImages[i]) openLb(i);
  });

  close.addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  prev.addEventListener('click', () => goTo(idx - 1));
  next.addEventListener('click', () => goTo(idx + 1));

  // Teclado
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLb();
    if (e.key === 'ArrowLeft')  goTo(idx - 1);
    if (e.key === 'ArrowRight') goTo(idx + 1);
  });

  // Swipe táctil
  lb.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend',   (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? goTo(idx + 1) : goTo(idx - 1);
  });

  // Botón atrás del navegador
  window.addEventListener('popstate', () => {
    if (lb.classList.contains('open')) closeSilent();
  });
}

// ── Reveal al scroll ──
let revealLoopRunning = false;

function revealLoop() {
  const vh = document.documentElement.clientHeight;
  const items = document.querySelectorAll('.reveal:not(.visible)');
  items.forEach((el) => {
    if (el.getBoundingClientRect().top < vh) {
      el.classList.add('visible');
    }
  });
  if (items.length > 0) {
    requestAnimationFrame(revealLoop);
  } else {
    revealLoopRunning = false;
  }
}

function startReveal() {
  if (!revealLoopRunning) {
    revealLoopRunning = true;
    requestAnimationFrame(revealLoop);
  }
}

function setupReveal() {
  window.addEventListener('scroll',    startReveal, { passive: true });
  window.addEventListener('touchmove', startReveal, { passive: true });
}

function triggerVisibleInViewport() {
  startReveal();
}
