// =====================================================
//  Casamiento Clásico · Plan Premium · script.js
// =====================================================

let galleryImages = [];

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
  const imageUrl = v => { if (!v) return placeholder; if (isAbsolute(v)) return v; return imageBase ? imageBase + localName(v) : v; };
  const gallerySrc = Array.isArray(assets.gallery) && assets.gallery.length ? assets.gallery : (Array.isArray(config.fotos) ? config.fotos : []);
  config._gallery = gallerySrc.map(imageUrl).filter(Boolean);
  config._heroImage = imageUrl(assets.heroImage || '');
  const musicPath = assets.musicPath || config.musica?.src || '';
  if (config.musica) config.musica.src = musicPath;
  return config;
}

function init(c) {
  c = normalizeDemoAssets(c);
  galleryImages = c._gallery || [];
  aplicarTema(c.tema);
  renderCover(c);
  renderHero(c);
  renderBienvenida(c.bienvenida);
  renderMusica(c.musica);
  renderEvento(c);
  renderTimeline(c.timeline);
  renderGaleria(galleryImages);
  renderDresscode(c.dresscode);
  renderRegalos(c.regalos);
  renderConfirmar(c);
  renderFooter(c.footer);
  renderCalendario(c.fecha);
  startCountdown(c.fecha);
  initSparkles('hero-sparkles');
  initCover();
  initMusica(c.musica);
  initCopy();
  initLightbox();
  initRsvp(c);
  initCalendar(c);
}

// ── RSVP Modal ────────────────────────────────────
function initRsvp(c) {
  if (typeof RsvpModal !== 'undefined') {
    const display = c.pareja?.display || `${c.pareja?.nombre1} & ${c.pareja?.nombre2}`;
    RsvpModal.init(c.rsvp || {}, display);
  }
}

// Reemplazar renderConfirmar (no usa WhatsApp en premium)
function renderConfirmar(c) { /* gestión por RsvpModal */ }

function aplicarTema(tema) {
  if (!tema) return;
  const r = document.documentElement.style;
  if (tema.acento)  r.setProperty('--accent',  tema.acento);
  if (tema.acento2) r.setProperty('--accent2', tema.acento2);
}

function renderCover(c) {
  const display = c.pareja?.display || `${c.pareja?.nombre1} & ${c.pareja?.nombre2}`;
  set('cover-names', display); set('cover-fecha', c.fechaDisplay);
  document.title = `Casamiento · ${display}`;
  if (c._heroImage) {
    const img = document.getElementById('cover-img');
    if (img) { img.style.backgroundImage = `url('${c._heroImage}')`; const tmp = new Image(); tmp.onload = () => document.getElementById('cover')?.classList.add('loaded'); tmp.src = c._heroImage; }
  }
}

function renderHero(c) {
  const display = c.pareja?.display || `${c.pareja?.nombre1} & ${c.pareja?.nombre2}`;
  set('hero-names', display);
  set('hero-frase', c.frase);
  set('hero-fecha', c.fechaDisplay);
}

function initSparkles(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div');
    const isBurst = Math.random() < 0.18;
    el.className = 'sparkle' + (isBurst ? ' sparkle--burst' : '');
    const size = isBurst ? 1.5 + Math.random() * 2 : .6 + Math.random() * 2;
    el.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${size}px;height:${size}px;--dur:${isBurst?10+Math.random()*12:2.5+Math.random()*5}s;--delay:${Math.random()*10}s;--op:${isBurst?.7+Math.random()*.2:.18+Math.random()*.45};`;
    container.appendChild(el);
  }
}

function renderBienvenida(b) { if (!b) return; set('bien-titulo', b.titulo); set('bien-texto', b.texto); }

function renderMusica(m) {
  if (!m) return;
  set('musica-titulo', m.titulo); set('musica-artista', m.artista);
  const audio = document.getElementById('audio');
  if (audio && m.src) audio.src = m.src;
}

function renderEvento(c) {
  set('evento-fecha', c.fechaDisplay); set('evento-hora', c.hora);
  set('lugar-nombre', c.lugar.nombre); set('lugar-barrio', c.lugar.barrio); set('lugar-dir', c.lugar.direccion);
  attr('btn-maps', 'href', c.lugar.mapsUrl);
}

function renderTimeline(items) {
  const list = document.getElementById('timeline-list');
  if (!list || !Array.isArray(items)) return;
  list.innerHTML = items.map((item, i) => `
    <div class="timeline-item reveal" role="listitem" style="--delay:${i * 0.08}s">
      <span class="timeline-hora">${item.hora}</span>
      <span class="timeline-dot" aria-hidden="true"></span>
      <span class="timeline-evento">${item.evento}</span>
    </div>`).join('');
}

function renderGaleria(fotos) {
  const grid = document.getElementById('galeria-grid');
  if (!grid || !fotos.length) return;
  grid.innerHTML = fotos.map((src, i) => `
    <div class="galeria-item reveal"
         style="--delay:${(i%3)*.1}s"
         data-src="${src}" data-index="${i}"
         role="img" tabindex="0" aria-label="Foto ${i+1}"></div>`).join('');
}

function renderDresscode(d) {
  if (!d) return;
  set('dresscode-texto', d.texto); set('dresscode-nota', d.nota);
}

function renderRegalos(r) {
  if (!r) return;
  set('regalos-texto', r.texto); set('regalos-alias', r.alias);
  set('regalos-titular', r.titular || ''); set('regalos-banco', r.banco);
}

function renderConfirmar(c) {
  const url = `https://wa.me/${c.whatsapp.numero}?text=${encodeURIComponent(c.whatsapp.mensaje)}`;
  attr('btn-wa', 'href', url);
}

function renderFooter(f) { if (!f) return; set('footer-mensaje', f.mensaje); set('footer-firma', f.firma); }

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
  for (let i = 0; i < startDow; i++) celdas += '<span class="cal-dia" aria-hidden="true"></span>';
  for (let d = 1; d <= totalDias; d++) {
    const dow = (startDow + d - 1) % 7;
    const cls = d === day ? ' cal-dia--evento' : (dow === 5 || dow === 6) ? ' cal-dia--finde' : '';
    celdas += `<span class="cal-dia${cls}">${d}</span>`;
  }
  const nombreDia = fecha.toLocaleDateString('es-AR', { weekday: 'long' });
  card.innerHTML = `<div class="cal-header"><span class="cal-mes">${meses[month]}</span><span class="cal-anio">${year}</span></div><div class="cal-semana" aria-hidden="true">${semana.map(d=>`<span class="cal-dow">${d}</span>`).join('')}</div><div class="cal-grid">${celdas}</div><p class="cal-label">♡ ${nombreDia.charAt(0).toUpperCase()+nombreDia.slice(1)} · ${day} de ${meses[month]}</p>`;
}

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

function initCover() {
  const cover = document.getElementById('cover'), btn = document.getElementById('btn-cover');
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

function initMusica(cfg) {
  const btn = document.getElementById('musica-btn'), audio = document.getElementById('audio');
  const disc = document.getElementById('musica-disc');
  const play = btn?.querySelector('.icon-play'), pause = btn?.querySelector('.icon-pause');
  if (!btn || !audio) return;
  let playing = false;
  btn.addEventListener('click', () => {
    if (playing) { audio.pause(); playing = false; play.style.display = ''; pause.style.display = 'none'; btn.classList.remove('playing'); if (disc) disc.classList.remove('spinning'); }
    else { audio.play().then(() => { playing = true; play.style.display = 'none'; pause.style.display = ''; btn.classList.add('playing'); if (disc) disc.classList.add('spinning'); }).catch(() => {}); }
  });
}

function initCopy() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      navigator.clipboard.writeText(target.textContent.trim()).then(showToast).catch(() => {
        const ta = document.createElement('textarea'); ta.value = target.textContent.trim(); ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast();
      });
    });
  });
}

function showToast() {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000);
}

function initLightbox() {
  const lb = document.getElementById('lightbox'), img = document.getElementById('lightbox-img');
  const close = document.getElementById('lightbox-close'), prev = document.getElementById('lightbox-prev'), next = document.getElementById('lightbox-next');
  if (!lb) return;
  let idx = 0;
  let lbScrollY = 0;

  const openLb = i => {
    lbScrollY = window.scrollY;
    idx = i;
    img.src = galleryImages[idx];
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    history.pushState({ lightbox: true }, '');
  };

  const closeLb = () => {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (history.state?.lightbox) {
      history.back();
    } else {
      window.scrollTo({ top: lbScrollY, behavior: 'instant' });
    }
  };

  const closeSilent = () => {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    window.scrollTo({ top: lbScrollY, behavior: 'instant' });
  };
  document.addEventListener('click', e => { const item = e.target.closest('.galeria-item'); if (!item) return; const i = parseInt(item.dataset.index, 10); if (!isNaN(i)) openLb(i); });
  close.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  if (prev) prev.addEventListener('click', () => { idx = (idx - 1 + galleryImages.length) % galleryImages.length; img.src = galleryImages[idx]; });
  if (next) next.addEventListener('click', () => { idx = (idx + 1) % galleryImages.length; img.src = galleryImages[idx]; });
  document.addEventListener('keydown', e => { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') { idx = (idx-1+galleryImages.length)%galleryImages.length; img.src = galleryImages[idx]; } if (e.key === 'ArrowRight') { idx = (idx+1)%galleryImages.length; img.src = galleryImages[idx]; } });
  window.addEventListener('popstate', () => { if (lb.classList.contains('open')) closeSilent(); });
}

function initCalendar(c) {
  const btn = document.getElementById('btn-ics');
  if (!btn) return;
  const fecha = new Date(c.fecha), fin = new Date(fecha.getTime() + 8 * 3600000);
  const fmt = d => d.toISOString().replace(/[-:]/g, '').split('.')[0];
  const display = c.pareja?.display || '', titulo = `Casamiento de ${display}`, lugar = c.lugar?.direccion || '';
  const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&dates=${fmt(fecha)}/${fmt(fin)}&location=${encodeURIComponent(lugar)}`;
  btn.addEventListener('click', () => {
    const ics = ['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT',`DTSTART:${fmt(fecha)}`,`DTEND:${fmt(fin)}`,`SUMMARY:${titulo}`,`LOCATION:${lugar}`,'STATUS:CONFIRMED','END:VEVENT','END:VCALENDAR'].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' }), url = URL.createObjectURL(blob), ua = navigator.userAgent;
    if (/Android/i.test(ua)) { window.location.href = `intent://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&dates=${fmt(fecha)}/${fmt(fin)}&location=${encodeURIComponent(lugar)}#Intent;scheme=https;package=com.google.android.calendar;end`; setTimeout(() => { const a = document.createElement('a'); a.href = url; a.download = 'casamiento.ics'; a.click(); URL.revokeObjectURL(url); }, 800); }
    else if (/iPhone|iPad|iPod/i.test(ua)) { window.location.href = url; setTimeout(() => URL.revokeObjectURL(url), 5000); }
    else { window.open(calUrl, '_blank'); const a = document.createElement('a'); a.href = url; a.download = 'casamiento.ics'; a.click(); URL.revokeObjectURL(url); }
  });
}

function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (!e.isIntersecting) return; const delay = parseFloat(e.target.style.getPropertyValue('--delay')||0)*1000; setTimeout(() => e.target.classList.add('visible'), delay); observer.unobserve(e.target); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function set(id, text) { const el = document.getElementById(id); if (el) el.textContent = text ?? ''; }
function attr(id, a, v) { const el = document.getElementById(id); if (el && v) el.setAttribute(a, v); }
function pad(n) { return String(n).padStart(2, '0'); }
