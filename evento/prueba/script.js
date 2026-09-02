// =====================================================
//  Plantilla Urbana · 15 años · script.js
// =====================================================

// ── Carga config y arranca ──────────────────────────
fetch('config.json')
  .then(r => r.json())
  .then(init)
  .catch(() => console.warn('Abrí con Live Server para cargar config.json'));


function normalizeDemoAssets(config) {
  if (!config) return config;
  const assets = config.assets || {};
  const imageBase = assets.imagesBasePath || "";
  const placeholder = assets.placeholderImage || "../../assets/img/ui/placeholders/placeholder-evento.jpg";
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
  renderGaleria(c.fotos);
  renderMusica(c.musica);
  renderConfirmar(c);
  renderFooter(c.footer);

  renderCalendario(c.fecha);

  startCountdown(c.fecha);
  initCover();
  initCopy();
  initMusica(c.musica);
  initCalendar(c);
  initRsvp(c);
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
    document.getElementById('musica-btn')?.click();
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
  set('regalos-nombre', r.nombre || r.titular || r.cbu);
  set('regalos-banco',  r.banco);
}

// ── Render galería · Swiper coverflow ───────────────
function getGaleriaPosition(src) {
  const normalized = String(src || '').toLowerCase();
  if (normalized.includes('foto horizontal 1')) return '78% center';
  if (normalized.includes('foto horizontal 2')) return '95% center';
  return 'center center';
}

function renderGaleria(fotos) {
  const wrapper = document.getElementById('galeria-grid');
  if (!wrapper) return;
  wrapper.innerHTML = fotos.map((src, i) => `
    <div class="swiper-slide" data-index="${i}">
      <img src="${src}" alt="Foto ${i + 1}" loading="lazy" style="object-position: ${getGaleriaPosition(src)}" />
    </div>
  `).join('');

  const firstImg = wrapper.querySelector('.swiper-slide[data-index="0"] img');
  if (firstImg) firstImg.style.objectPosition = getGaleriaPosition(fotos[0]);

  const sw = new Swiper('.galeria-swiper', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    loop: fotos.length > 2,
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      depth: 200,
      modifier: 1.5,
      scale: 0.82,
      slideShadows: true,
    },
    autoplay: {
      delay: 2800,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    pagination: {
      el: '.galeria-pagination',
      clickable: true,
    },
  });

  initGaleriaLightbox(fotos, sw);
}

// ── Lightbox galería ────────────────────────────────
function initGaleriaLightbox(fotos, sw) {
  const lb    = document.getElementById('galeria-lb');
  const img   = document.getElementById('galeria-lb-img');
  const close = document.getElementById('galeria-lb-close');
  const prev  = document.getElementById('galeria-lb-prev');
  const next  = document.getElementById('galeria-lb-next');
  if (!lb || !img) return;

  let current = 0;

  function show(index) {
    current = ((index % fotos.length) + fotos.length) % fotos.length;
    img.src = fotos[current];
  }

  function open(index) {
    show(index);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    sw?.autoplay?.stop();
  }

  function closeLb() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    sw?.autoplay?.start();
  }

  document.querySelector('.galeria-swiper')?.addEventListener('click', e => {
    const slide = e.target.closest('.swiper-slide[data-index]');
    if (!slide) return;
    open(parseInt(slide.dataset.index, 10));
  });

  close.addEventListener('click', closeLb);
  prev.addEventListener('click',  () => show(current - 1));
  next.addEventListener('click',  () => show(current + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLb();
    if (e.key === 'ArrowLeft')   show(current - 1);
    if (e.key === 'ArrowRight')  show(current + 1);
  });
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
  const button = document.getElementById('btn-asiste');
  if (button && c.rsvp?.enabled) button.hidden = false;
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

const RsvpService = (() => {
  async function send(payload, cfg) {
    const url = cfg?.googleSheetsUrl;
    if (!url || /PEGAR_URL/i.test(url)) {
      throw new Error('El formulario está listo, falta conectar la URL de Google Apps Script.');
    }

    const origen = cfg?.origen || cfg?.eventId || payload.origen || 'prueba-digitarjetas';
    const estado = cfg?.estado || 'VALIDO';
    const records = payload.guests.map(guest => ({
      id_confirmacion: `${origen}-${Date.now()}-${guest.number}`,
      fecha_confirmacion: formatArgentinaDateTime(payload.submittedAt),
      origen,
      estado,
      nombre: guest.nombre,
      apellido: guest.apellido,
      edad: guest.edad,
      asiste: guest.status === 'no_asiste' ? 'NO' : 'SI',
      restriccion_alimentaria: guest.restriccion || 'Sin restricción',
      detalle_restriccion: guest.restriccion || 'Sin restricción',
      cancion_sugerida: guest.cancion || '',
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'confirmacion',
        eventId: origen,
        origen,
        estado,
        duplicateKey: cfg?.duplicateKey || ['nombre', 'apellido', 'edad'],
        records,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.ok === false) {
      const isDuplicate = data.code === 'DUPLICATE' || data.duplicate === true || data.duplicado === true;
      const message = isDuplicate
        ? (cfg?.duplicateMessage || 'Ya existe una confirmación registrada con esos datos.')
        : (data.message || 'No se pudo enviar la confirmación.');
      throw new Error(message);
    }

    return data;
  }

  function formatArgentinaDateTime(value) {
    return new Date(value).toLocaleString('sv-SE', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace('T', ' ');
  }

  return { send };
})();

const RsvpModal = (() => {
  let cfg = {};
  let eventName = '';
  let qty = 1;
  let maxGuests = 6;
  let submitting = false;

  function init(config, nombre) {
    cfg = config || {};
    eventName = nombre || '';
    maxGuests = cfg.maxGuests > 0 ? cfg.maxGuests : 6;
    bind('btn-asiste', 'click', open);
    bind('rsvp-close', 'click', close);
    bind('rsvp-close-success', 'click', close);
    bind('rsvp-retry', 'click', () => showState('form'));
    bind('rsvp-submit', 'click', submit);
    bind('rsvp-qty-minus', 'click', () => setQty(qty - 1));
    bind('rsvp-qty-plus', 'click', () => setQty(qty + 1));
    document.getElementById('rsvp-modal')?.addEventListener('click', event => {
      if (event.target.id === 'rsvp-modal') close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') close();
    });
  }

  function open() {
    submitting = false;
    setQty(1);
    showState('form');
    const overlay = document.getElementById('rsvp-modal');
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    const overlay = document.getElementById('rsvp-modal');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    submitting = false;
  }

  function setQty(nextQty) {
    qty = Math.max(1, Math.min(Number(nextQty) || 1, maxGuests));
    set('rsvp-qty-num', String(qty));
    const minus = document.getElementById('rsvp-qty-minus');
    const plus = document.getElementById('rsvp-qty-plus');
    if (minus) minus.disabled = qty <= 1;
    if (plus) plus.disabled = qty >= maxGuests;
    renderGuests();
  }

  function renderGuests() {
    const container = document.getElementById('rsvp-guests');
    if (!container) return;
    container.innerHTML = Array.from({ length: qty }, (_, index) => `
      <div class="rsvp-guest">
        ${qty > 1 ? `<p class="rsvp-guest-label">Invitado ${index + 1}</p>` : ''}
        <div class="rsvp-guest-fields">
          ${field(index, 'nombre', 'Nombre', 'text')}
          ${field(index, 'apellido', 'Apellido', 'text')}
          ${field(index, 'edad', 'Edad', 'number')}
        </div>
        <label class="rsvp-field-label">
          <span>Restricción alimentaria</span>
          <select class="rsvp-input" data-guest="${index}" data-field="restriccion">
            <option value="Sin restricción">Sin restricción</option>
            <option value="Celiaco/a">Celiaco/a</option>
            <option value="Vegetariano/a">Vegetariano/a</option>
            <option value="Vegano/a">Vegano/a</option>
            <option value="Otro">Otro</option>
          </select>
        </label>
        <label class="rsvp-field-label">
          <span>Canción sugerida</span>
          <input class="rsvp-input" type="text" data-guest="${index}" data-field="cancion" placeholder="Artista - canción" inputmode="text" />
        </label>
      </div>
    `).join('');
  }

  function field(index, name, label, type) {
    const numberAttrs = type === 'number' ? 'min="0" max="120" inputmode="numeric"' : 'inputmode="text"';
    return `
      <label class="rsvp-field-label">
        <span>${label}</span>
        <input class="rsvp-input" type="${type}" data-guest="${index}" data-field="${name}" placeholder="${label}" ${numberAttrs} />
      </label>
    `;
  }

  function collectGuests() {
    clearErrors();
    const guests = [];
    let firstError = null;

    for (let index = 0; index < qty; index++) {
      const guest = {
        number: index + 1,
        status: 'asiste',
        nombre: value(index, 'nombre'),
        apellido: value(index, 'apellido'),
        edad: value(index, 'edad'),
        restriccion: value(index, 'restriccion'),
        cancion: value(index, 'cancion'),
      };

      ['nombre', 'apellido', 'edad'].forEach(name => {
        if (!guest[name]) {
          const input = inputFor(index, name);
          markError(input);
          if (!firstError) firstError = input;
        }
      });

      guests.push(guest);
    }

    if (firstError) {
      toggleValidation(true);
      firstError.focus();
      return null;
    }

    return guests;
  }

  async function submit() {
    if (submitting) return;
    const guests = collectGuests();
    if (!guests) return;

    submitting = true;
    showState('loading');

    try {
      const result = await RsvpService.send({
        status: 'asiste',
        guestCount: guests.length,
        attendingCount: guests.length,
        guests,
        eventName,
        origen: cfg.origen || cfg.eventId,
        estado: cfg.estado || 'VALIDO',
        submittedAt: new Date().toISOString(),
      }, cfg);

      set('rsvp-success-msg', result.message || 'Confirmación de prueba registrada.');
      showState('success');
    } catch (error) {
      set('rsvp-error-msg', error?.message || 'Ocurrió un error. Intentá de nuevo.');
      showState('error');
      submitting = false;
    }
  }

  function showState(state) {
    const ids = { form: 'rsvp-form-body', loading: 'rsvp-loading', success: 'rsvp-success', error: 'rsvp-error' };
    Object.entries(ids).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.display = key === state ? '' : 'none';
      el.setAttribute('aria-hidden', String(key !== state));
    });
  }

  function value(index, name) {
    return inputFor(index, name)?.value.trim() || '';
  }

  function inputFor(index, name) {
    return document.querySelector(`[data-guest="${index}"][data-field="${name}"]`);
  }

  function markError(input) {
    if (!input) return;
    input.classList.add('rsvp-input--error');
    input.setAttribute('aria-invalid', 'true');
  }

  function clearErrors() {
    document.querySelectorAll('.rsvp-input--error').forEach(input => {
      input.classList.remove('rsvp-input--error');
      input.removeAttribute('aria-invalid');
    });
    toggleValidation(false);
  }

  function toggleValidation(show) {
    const alert = document.getElementById('rsvp-validation-alert');
    if (alert) alert.hidden = !show;
  }

  function bind(id, event, handler) {
    document.getElementById(id)?.addEventListener(event, handler);
  }

  return { init };
})();

function initRsvp(c) {
  if (c.rsvp?.enabled) RsvpModal.init(c.rsvp, c.nombre);
}
