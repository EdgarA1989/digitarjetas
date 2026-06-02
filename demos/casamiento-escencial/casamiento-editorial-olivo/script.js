// =====================================================
//  Editorial Olivo · Plan Esencial · script.js
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
    if (!v) return placeholder;
    if (isAbsolute(v)) return v;
    return imageBase ? imageBase + localName(v) : v;
  };
  config._heroImage = imageUrl(assets.heroImage || '');
  return config;
}

function init(c) {
  c = normalizeDemoAssets(c);
  aplicarTema(c.tema);
  renderCover(c);
  renderHero(c);
  renderBienvenida(c.bienvenida);
  renderEvento(c);
  renderTimeline(c.timeline);
  renderConfirmar(c);
  renderMensajeFinal(c.mensajeFinal);
  renderFooter(c.footer);
  renderCalendario(c.fecha);
  startCountdown(c.fecha);
  initCover();
  initCalendar(c);
}

// ── Tema ────────────────────────────────────────────
function aplicarTema(tema) {
  if (!tema) return;
  const r = document.documentElement.style;
  if (tema.acento)  r.setProperty('--accent',  tema.acento);
  if (tema.acento2) r.setProperty('--accent2', tema.acento2);
  if (tema.terra)   r.setProperty('--terra',   tema.terra);
  if (tema.champagne) r.setProperty('--champagne', tema.champagne);
}

// ── Cover ───────────────────────────────────────────
function renderCover(c) {
  const display = c.pareja?.display || `${c.pareja?.nombre1} & ${c.pareja?.nombre2}`;
  set('cover-names', display);
  set('cover-fecha', c.fechaDisplay);
  document.title = `Casamiento · ${display}`;

  // Imagen de portada: carga solo si existe, usa gradiente como fallback
  if (c._heroImage && c._heroImage !== (c.assets?.placeholderImage || '')) {
    const img = document.getElementById('cover-img');
    if (img) {
      const tmp = new Image();
      tmp.onload = () => {
        img.style.backgroundImage = `url('${c._heroImage}')`;
        document.getElementById('cover')?.classList.add('loaded');
      };
      tmp.onerror = () => {}; // fallback silencioso al gradiente CSS
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
}

// ── Bienvenida ──────────────────────────────────────
function renderBienvenida(b) {
  if (!b) return;
  set('bien-titulo', b.titulo);
  set('bien-texto',  b.texto);
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

// ── Confirmación ────────────────────────────────────
function renderConfirmar(c) {
  const url = `https://wa.me/${c.whatsapp.numero}?text=${encodeURIComponent(c.whatsapp.mensaje)}`;
  attr('btn-wa', 'href', url);
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
