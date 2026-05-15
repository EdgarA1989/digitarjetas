// =====================================================
//  Plantilla Urbana · 15 años · script.js
// =====================================================

// ── Carga config y arranca ──────────────────────────
fetch('config.json')
  .then(r => r.json())
  .then(init)
  .catch(() => console.warn('Abrí con Live Server para cargar config.json'));

function init(c) {
  aplicarTema(c.tema);
  renderCover(c);
  renderHero(c);
  renderBienvenida(c.bienvenida);
  renderEvento(c);
  renderDresscode(c.dresscode);
  renderRegalos(c.regalos);
  renderGaleria(c.fotos);
  renderMusica(c.musica);
  renderConfirmar(c);
  renderFooter(c.footer);

  renderCalendario(c.fecha);

  startCountdown(c.fecha);
  initCover();
  initCopy();
  initLightbox();
  initMusica(c.musica);
  initCalendar(c);
}

// ── Tema desde config ───────────────────────────────
function aplicarTema(tema) {
  if (!tema) return;
  const r = document.documentElement.style;
  if (tema.acento)  {
    r.setProperty('--accent', tema.acento);
    const hex = tema.acento.replace('#','');
    const [rr, g, b] = [0,2,4].map(i => parseInt(hex.substr(i*2,2),16));
    r.setProperty('--accent-glow', `rgba(${rr},${g},${b},.22)`);
  }
  if (tema.acento2) r.setProperty('--accent2', tema.acento2);
}

// ── Render cover ────────────────────────────────────
function renderCover(c) {
  set('cover-nombre', c.nombre.toUpperCase());
  set('cover-fecha',  c.fechaDisplay);
}

// ── Cover (pantalla de entrada) ─────────────────────
function initCover() {
  const cover = document.getElementById('cover');
  const btn   = document.getElementById('btn-cover');
  if (!cover || !btn) return;

  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  btn.addEventListener('click', () => {
    cover.classList.add('opening');
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      cover.style.display = 'none';
      initReveal();
    }, 2600);
  });
}

// ── Render hero ─────────────────────────────────────
function renderHero(c) {
  set('hero-name', c.nombre.toUpperCase());
  set('hero-frase', c.frase);
  set('hero-fecha', c.fechaDisplay);

  // Actualiza meta tags con datos reales
  document.title = `15 de ${c.nombre}`;
  meta('description', `Te invito a celebrar mis 15, ${c.fechaDisplay}.`);
  meta('og:title', `15 de ${c.nombre}`);
}

// ── Render bienvenida ───────────────────────────────
function renderBienvenida(b) {
  set('bien-titulo', b.titulo);
  set('bien-texto', b.texto);
}

// ── Render evento ───────────────────────────────────
function renderEvento(c) {
  set('evento-fecha',   c.fechaDisplay);
  set('evento-hora',    c.hora);
  set('lugar-nombre',   c.lugar.nombre);
  set('lugar-barrio',   c.lugar.barrio);
  set('lugar-dir',      c.lugar.direccion);
  attr('btn-maps', 'href', c.lugar.mapsUrl);
}

// ── Render dresscode ────────────────────────────────
function renderDresscode(d) {
  set('dresscode-texto', d.texto);
  set('dresscode-nota',  d.nota);
}

// ── Render regalos ──────────────────────────────────
function renderRegalos(r) {
  set('regalos-texto',  r.texto);
  set('regalos-alias',  r.alias);
  set('regalos-cbu',    r.cbu);
  set('regalos-banco',  r.banco);
}

// ── Render galería ──────────────────────────────────
function renderGaleria(fotos) {
  const grid = document.getElementById('galeria-grid');
  if (!grid) return;
  grid.innerHTML = fotos.map((src, i) => `
    <div class="galeria-item reveal"
         style="background-image:url('${src}')"
         data-src="${src}"
         role="img"
         aria-label="Foto ${i + 1}">
    </div>
  `).join('');
}

// ── Render música ───────────────────────────────────
function renderMusica(m) {
  set('musica-titulo',  m.titulo);
  set('musica-artista', m.artista);
  const audio = document.getElementById('audio');
  if (audio) audio.src = m.src;
}

// ── Render confirmación ─────────────────────────────
function renderConfirmar(c) {
  const url = `https://wa.me/${c.whatsapp.numero}?text=${encodeURIComponent(c.whatsapp.mensaje)}`;
  attr('btn-wa', 'href', url);
}

// ── Render footer ───────────────────────────────────
function renderFooter(f) {
  set('footer-mensaje', f.mensaje);
  set('footer-firma',   f.firma);
}

// ── Countdown ───────────────────────────────────────
function startCountdown(fechaISO) {
  const target = new Date(fechaISO).getTime();

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => set(id, '00'));
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    set('cd-days',  pad(d));
    set('cd-hours', pad(h));
    set('cd-mins',  pad(m));
    set('cd-secs',  pad(s));
  }
  tick();
  setInterval(tick, 1000);
}

// ── Copy to clipboard ───────────────────────────────
function initCopy() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      navigator.clipboard.writeText(target.textContent.trim()).then(() => {
        showToast();
      }).catch(() => {
        // Fallback para navegadores sin clipboard API
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

// ── Galería + Lightbox ──────────────────────────────
function initLightbox() {
  const lb    = document.getElementById('lightbox');
  const img   = document.getElementById('lightbox-img');
  const close = document.getElementById('lightbox-close');
  if (!lb) return;

  document.addEventListener('click', e => {
    const item = e.target.closest('.galeria-item');
    if (!item) return;
    const src = item.dataset.src;
    if (!src) return;
    img.src = src;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });

  const closeLb = () => {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    img.src = '';
  };

  close.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
}

// ── Música ──────────────────────────────────────────
function initMusica(cfg) {
  const btn   = document.getElementById('musica-btn');
  const audio = document.getElementById('audio');
  const waves = document.getElementById('musica-waves');
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
      waves.classList.remove('active');
      btn.classList.remove('playing');
      btn.setAttribute('aria-label', 'Reproducir');
    } else {
      audio.play().then(() => {
        playing = true;
        play.style.display  = 'none';
        pause.style.display = '';
        waves.classList.add('active');
        btn.classList.add('playing');
        btn.setAttribute('aria-label', 'Pausar');
      }).catch(() => {
        // Archivo no encontrado o bloqueado por el navegador — silencioso
      });
    }
  });
}

// ── Calendario visual ───────────────────────────────
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
    <p class="cal-label">${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} · ${day} de ${meses[month]}</p>`;
}

// ── Add to Calendar ─────────────────────────────────
function initCalendar(c) {
  const fecha = new Date(c.fecha);
  const fin   = new Date(fecha.getTime() + 6 * 3600000); // +6 horas

  const fmt = d => d.toISOString().replace(/[-:]/g,'').split('.')[0];
  const titulo = `15 de ${c.nombre}`;
  const detalle = `${c.frase} ${c.fechaDisplay}`;
  const lugar = c.lugar.direccion;

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

// ── Reveal on scroll ────────────────────────────────
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

// ── Helpers ─────────────────────────────────────────
function set(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function attr(id, attribute, value) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attribute, value);
}

function meta(name, content) {
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (el) el.setAttribute('content', content);
}

function pad(n) {
  return String(n).padStart(2, '0');
}
