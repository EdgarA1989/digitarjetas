// =====================================================
//  rsvpService.js — Envío del formulario de confirmación
//  Modo: "mailto" | "formsubmit" | "google_sheets"
// =====================================================

const RsvpService = (() => {

  async function send(payload, rsvpConfig) {
    const mode = rsvpConfig?.submitMode || 'mailto';

    if (mode === 'google_sheets') return sendToGoogleSheets(payload, rsvpConfig);
    if (mode === 'formsubmit')    return sendViaFormSubmit(payload, rsvpConfig);
    return sendViaMailto(payload, rsvpConfig);
  }

  // ── Abre el cliente de correo con el mensaje pre-armado ─────────
  async function sendViaMailto(payload, cfg) {
    const emailTo  = cfg?.emailTo || '';
    const statusLbl = payload.status === 'asiste' ? 'CONFIRMA ASISTENCIA' : 'NO PUEDE ASISTIR';

    const guestLines = payload.guests
      .map(g => `  ${formatGuestLine(g, '\n     ')}`)
      .join('\n');

    const subject = `Confirmación · 15 de ${payload.eventName} · ${payload.guests[0]?.nombre || ''} ${payload.guests[0]?.apellido || ''}`;
    const lines = [
      `Estado: ${statusLbl}`,
      `Evento: 15 de ${payload.eventName}`,
      `Invitados (${payload.guestCount}):`,
      guestLines,
      '',
    ];
    if (payload.attendingCount !== undefined) lines.push(`Cantidad que asisten: ${payload.attendingCount}`, '');
    if (payload.cancion) lines.push(`Canción sugerida: ${payload.cancion}`, '');
    lines.push(`Enviado: ${new Date(payload.submittedAt).toLocaleString('es-AR')}`);
    const body = lines.join('\n');

    const url = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  }

  // ── Envía via FormSubmit.co (sin backend, sin registro) ─────────
  async function sendViaFormSubmit(payload, cfg) {
    const emailTo = cfg?.emailTo || '';
    if (!emailTo) throw new Error('emailTo no configurado');

    const statusLbl  = payload.status === 'asiste' ? '✅ CONFIRMA ASISTENCIA' : '❌ NO PUEDE ASISTIR';
    const guestLines = payload.guests
      .map(g => formatGuestLine(g, ' - '))
      .join(' | ');

    const bodyData = {
      _subject:        `Confirmación · 15 de ${payload.eventName} · ${payload.guests[0]?.nombre || ''} ${payload.guests[0]?.apellido || ''}`,
      _captcha:        'false',
      _template:       'box',
      Estado:          statusLbl,
      Evento:          `15 de ${payload.eventName}`,
      'Cantidad de personas': payload.guestCount,
      Invitados:       guestLines,
      'Fecha y hora':  new Date(payload.submittedAt).toLocaleString('es-AR'),
    };
    if (payload.attendingCount !== undefined) bodyData['Cantidad que asisten'] = payload.attendingCount;
    if (payload.cancion) bodyData['Canción sugerida'] = payload.cancion;

    const res = await fetch(`https://formsubmit.co/ajax/${emailTo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(bodyData),
    });

    const data = await res.json();
    if (!data.success) throw new Error('FormSubmit error');
  }

  // ── Envía a Google Sheets via Apps Script ───────────────────────
  async function sendToGoogleSheets(payload, cfg) {
    const url = cfg?.googleSheetsUrl;
    if (!url) throw new Error('googleSheetsUrl no configurado');
    if (/PEGAR_URL/i.test(url)) {
      throw new Error('El formulario está listo, pero falta conectar la URL de Google Apps Script.');
    }

    const body = buildGoogleSheetsPayload(payload, cfg);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok || data.ok === false) {
      const isDuplicate = data.code === 'DUPLICATE' || data.duplicado === true || data.duplicate === true;
      const duplicateMessage = cfg?.duplicateMessage || 'Ya existe una confirmación registrada con esos datos.';
      const error = new Error(isDuplicate ? duplicateMessage : (data.message || data.error || 'No se pudo enviar la confirmación'));
      error.code = data.code || '';
      throw error;
    }
    return data;
  }

  function buildGoogleSheetsPayload(payload, cfg) {
    const origen = cfg?.origen || cfg?.eventId || payload.origen || 'melody15';
    const estado = cfg?.estado || 'VALIDO';
    const submittedAt = payload.submittedAt || new Date().toISOString();
    const records = payload.guests.map(guest => ({
      id_confirmacion: `${origen}-${Date.now()}-${guest.number}`,
      fecha_confirmacion: submittedAt,
      origen,
      estado,
      nombre: guest.nombre,
      apellido: guest.apellido,
      edad: guest.edad,
      asiste: guest.status === 'no_asiste' ? 'NO' : 'SI',
      restriccion_alimentaria: guest.restriccion || '',
      cancion_sugerida: guest.cancion || payload.cancion || '',
      duplicate_key: normalizeDuplicateKey(guest),
    }));

    return {
      action: 'confirmacion',
      eventId: origen,
      origen,
      estado,
      duplicateKey: cfg?.duplicateKey || ['nombre', 'apellido', 'edad'],
      records,
    };
  }

  function normalizeDuplicateKey(guest) {
    return [guest.nombre, guest.apellido, guest.edad]
      .map(value => String(value || '').trim().toLowerCase())
      .join('|');
  }

  function formatGuestLine(guest, separator) {
    const status = guest.status === 'no_asiste' ? 'No asistira' : 'Asistira';
    const details = [
      `${guest.number}. ${guest.nombre} ${guest.apellido}`,
      `Asistencia: ${status}`,
    ];
    if (guest.edad) details.push(`Edad: ${guest.edad}`);
    if (guest.status !== 'no_asiste' && guest.restriccion) details.push(`Restriccion alimenticia: ${guest.restriccion}`);
    if (guest.status !== 'no_asiste' && guest.cancion) details.push(`Cancion: ${guest.cancion}`);
    return details.join(separator);
  }

  return { send };
})();


// =====================================================
//  rsvpModal.js — Modal de confirmación de asistencia
// =====================================================

const RsvpModal = (() => {
  let _mode       = 'asiste';
  let _qty        = 1;
  let _maxGuests  = 6;
  let _cfg        = {};
  let _nombre     = '';
  let _submitting = false;

  const TEXTS = {
    asiste: {
      titulo:    'Confirmar asistencia',
      subtitulo: 'Completá los datos de las personas que asistirán.',
      btnLabel:  'Confirmar asistencia',
      success:   '¡Asistencia confirmada! Te esperamos en la fiesta.',
    },
    no_asiste: {
      titulo:    'No podré asistir',
      subtitulo: 'Completá tus datos para que podamos registrar tu respuesta.',
      btnLabel:  'Enviar respuesta',
      success:   'Tu respuesta fue registrada. ¡Gracias por avisarnos!',
    },
  };

  // ── Init ─────────────────────────────────────────
  function init(config, nombre) {
    _cfg    = config || {};
    _nombre = nombre || '';
    _maxGuests = (_cfg.maxGuests > 0) ? _cfg.maxGuests : 6;

    on('btn-asiste',    'click', () => open('asiste'));
    on('btn-no-asiste', 'click', () => open('no_asiste'));
    on('rsvp-close',    'click', close);
    on('rsvp-submit',   'click', handleSubmit);
    on('rsvp-retry',    'click', handleRetry);
    on('rsvp-close-success', 'click', close);
    on('rsvp-qty-minus', 'click', () => setQty(_qty - 1));
    on('rsvp-qty-plus',  'click', () => setQty(_qty + 1));

    if (_cfg.hideDeclineButton) {
      const declineBtn = document.getElementById('btn-no-asiste');
      if (declineBtn) declineBtn.remove();
    }

    const guestsContainer = document.getElementById('rsvp-guests');
    guestsContainer?.addEventListener('click', e => {
      const button = e.target.closest('[data-rsvp-status]');
      if (!button) return;

      const index = Number(button.dataset.guest);
      const status = button.dataset.rsvpStatus;
      if (_cfg.perGuestDetails && status === 'no_asiste' && _qty > 1) {
        removeGuest(index);
        return;
      }

      const input = qs(`.rsvp-status-input[data-guest="${index}"]`);
      if (input) input.value = status;

      button.closest('.rsvp-status-toggle')?.querySelectorAll('[data-rsvp-status]').forEach(item => {
        item.classList.toggle('is-active', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });

      toggleGuestDetails(index, status);
    });

    const overlay = document.getElementById('rsvp-modal');
    if (overlay) {
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });
  }

  // ── Abrir modal ───────────────────────────────────
  function open(mode) {
    _mode       = mode;
    _qty        = 1;
    _submitting = false;

    const texts = getTexts(mode);
    setText('rsvp-titulo',    texts.titulo);
    setText('rsvp-subtitulo', texts.subtitulo);
    setText('rsvp-submit',    texts.btnLabel);

    const qtySection = document.getElementById('rsvp-qty');
    if (qtySection) qtySection.style.display = mode === 'asiste' || _cfg.perGuestDetails ? '' : 'none';
    if (_cfg.perGuestDetails) setTextBySelector('.rsvp-qty-label', '¿Cuántas personas querés cargar?');

    setQty(1);
    const cancionInput = document.getElementById('rsvp-cancion-input');
    if (cancionInput) cancionInput.value = '';
    const cancionWrap = document.querySelector('.rsvp-cancion-wrap');
    if (cancionWrap) cancionWrap.style.display = _cfg.perGuestDetails ? 'none' : '';
    showState('form');

    const overlay = document.getElementById('rsvp-modal');
    if (overlay) {
      overlay.setAttribute('aria-hidden', 'false');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  // ── Cerrar modal ──────────────────────────────────
  function close() {
    const overlay = document.getElementById('rsvp-modal');
    if (overlay) {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  // ── Control de cantidad ───────────────────────────
  function setQty(n, drafts) {
    const currentGuests = Array.isArray(drafts) ? drafts : getGuests();
    const max = _mode === 'asiste' ? _maxGuests : 1;
    _qty = Math.max(1, Math.min(n, max));
    setText('rsvp-qty-num', String(_qty));

    const btnMinus = document.getElementById('rsvp-qty-minus');
    const btnPlus  = document.getElementById('rsvp-qty-plus');
    if (btnMinus) btnMinus.disabled = _qty <= 1;
    if (btnPlus)  btnPlus.disabled  = _qty >= max;

    renderGuests(currentGuests);
  }

  // ── Renderizar campos de invitados ────────────────
  function renderGuests(drafts = []) {
    const container = document.getElementById('rsvp-guests');
    if (!container) return;

    let html = '';
    for (let i = 0; i < _qty; i++) {
      const draft = drafts[i] || {};
      const label = _qty > 1 ? `Invitado ${i + 1}` : '';
      html += `
        <div class="rsvp-guest">
          ${label ? `<p class="rsvp-guest-label">${label}</p>` : ''}
          <div class="rsvp-guest-fields">
            <label class="rsvp-field-label rsvp-name-field">
              <span>Nombre</span>
              <input class="rsvp-input"
                     type="text"
                     placeholder="Nombre"
                     data-guest="${i}"
                     data-field="nombre"
                     autocomplete="${i === 0 ? 'given-name' : 'off'}"
                     inputmode="text"
                     value="${escapeAttr(draft.nombre)}" />
            </label>
            <label class="rsvp-field-label rsvp-name-field">
              <span>Apellido</span>
              <input class="rsvp-input"
                     type="text"
                     placeholder="Apellido"
                     data-guest="${i}"
                     data-field="apellido"
                     autocomplete="${i === 0 ? 'family-name' : 'off'}"
                     inputmode="text"
                     value="${escapeAttr(draft.apellido)}" />
            </label>
          </div>
          ${_cfg.perGuestDetails ? renderGuestDetails(i, draft) : ''}
        </div>`;
    }
    container.innerHTML = html;
  }

  function renderGuestDetails(index, draft = {}) {
    const status = draft.status || 'asiste';
    const isAttending = status !== 'no_asiste';
    return `
      <div class="rsvp-guest-extra">
        <div class="rsvp-field-label rsvp-field-label--status">
          <div class="rsvp-status-row">
            <label class="rsvp-field-label rsvp-age-field">
              <span>Edad</span>
              <input class="rsvp-input rsvp-age-input"
                     type="number"
                     min="0"
                     max="99"
                     placeholder="Edad"
                     data-guest="${index}"
                     data-field="edad"
                     autocomplete="off"
                     inputmode="numeric"
                     value="${escapeAttr(draft.edad)}" />
            </label>
            <div class="rsvp-status-field">
              <span>Asistencia</span>
              <input class="rsvp-status-input"
                     type="hidden"
                     value="${escapeAttr(status)}"
                     data-guest="${index}"
                     data-field="status" />
              <div class="rsvp-status-toggle" role="group" aria-label="Asistencia del invitado ${index + 1}">
                <button class="rsvp-status-btn ${isAttending ? 'is-active' : ''}"
                        type="button"
                        data-guest="${index}"
                        data-rsvp-status="asiste"
                        aria-pressed="${isAttending ? 'true' : 'false'}">Sí</button>
                <button class="rsvp-status-btn ${isAttending ? '' : 'is-active'}"
                        type="button"
                        data-guest="${index}"
                        data-rsvp-status="no_asiste"
                        aria-pressed="${isAttending ? 'false' : 'true'}">No</button>
              </div>
            </div>
          </div>
        </div>
        <div class="rsvp-attendance-details" data-guest-details="${index}" ${isAttending ? '' : 'hidden'}>
          <label class="rsvp-field-label">
            <span>¿Posee alguna restricción alimenticia?</span>
            <select class="rsvp-input"
                    data-guest="${index}"
                    data-field="restriccion">
              ${renderRestrictionOptions(draft.restriccion)}
            </select>
          </label>
          ${_cfg.includeSongRequest === false ? '' : `
            <label class="rsvp-field-label">
              <span>Canción que no puede faltar (opcional)</span>
              <input class="rsvp-input"
                     type="text"
                     placeholder="Artista · Canción"
                     data-guest="${index}"
                     data-field="cancion"
                     autocomplete="off"
                     inputmode="text"
                     value="${escapeAttr(draft.cancion)}" />
            </label>
          `}
        </div>
      </div>`;
  }

  function removeGuest(index) {
    const guests = getGuests();
    guests.splice(index, 1);
    setQty(_qty - 1, guests);
  }

  function renderRestrictionOptions(selected = '') {
    const options = [
      ['', 'Seleccionar'],
      ['Sin restricción', 'Sin restricción'],
      ['Vegetariano/a', 'Vegetariano/a'],
      ['Vegano/a', 'Vegano/a'],
      ['Sin TACC / celiaquía', 'Sin TACC / celiaquía'],
      ['Sin lactosa', 'Sin lactosa'],
      ['Alergia a frutos secos', 'Alergia a frutos secos'],
      ['Otra restricción', 'Otra restricción'],
    ];
    return options.map(([value, label]) => (
      `<option value="${escapeAttr(value)}"${value === selected ? ' selected' : ''}>${label}</option>`
    )).join('');
  }

  function escapeAttr(value = '') {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  // ── Obtener datos de los campos ───────────────────
  function getGuests() {
    const guests = [];
    for (let i = 0; i < _qty; i++) {
      const nombre   = (qs(`.rsvp-input[data-guest="${i}"][data-field="nombre"]`)?.value   || '').trim();
      const apellido = (qs(`.rsvp-input[data-guest="${i}"][data-field="apellido"]`)?.value || '').trim();
      const status = _cfg.perGuestDetails
        ? (qs(`.rsvp-status-input[data-guest="${i}"][data-field="status"]`)?.value || 'asiste')
        : _mode;
      const restriccion = _cfg.perGuestDetails
        ? (qs(`.rsvp-input[data-guest="${i}"][data-field="restriccion"]`)?.value || '').trim()
        : '';
      const edad = _cfg.perGuestDetails
        ? (qs(`.rsvp-input[data-guest="${i}"][data-field="edad"]`)?.value || '').trim()
        : '';
      const cancion = _cfg.perGuestDetails
        ? (qs(`.rsvp-input[data-guest="${i}"][data-field="cancion"]`)?.value || '').trim()
        : '';
      guests.push({ number: i + 1, nombre, apellido, status, edad, restriccion, cancion });
    }
    return guests;
  }

  // ── Validación ────────────────────────────────────
  function validate(guests) {
    clearErrors();
    let ok = true;
    let missingCount = 0;
    let firstError = null;

    const addError = (el, message) => {
      markError(el, message);
      if (!firstError && el) firstError = el;
      missingCount += 1;
      ok = false;
    };

    guests.forEach((g, i) => {
      const nEl = qs(`.rsvp-input[data-guest="${i}"][data-field="nombre"]`);
      const aEl = qs(`.rsvp-input[data-guest="${i}"][data-field="apellido"]`);
      const eEl = qs(`.rsvp-input[data-guest="${i}"][data-field="edad"]`);
      const rEl = qs(`.rsvp-input[data-guest="${i}"][data-field="restriccion"]`);
      if (!g.nombre) addError(nEl, 'Completá el nombre.');
      if (!g.apellido) addError(aEl, 'Completá el apellido.');
      if (!g.edad) addError(eEl, 'Indicá la edad.');
      if (_cfg.perGuestDetails && g.status === 'asiste' && !g.restriccion) {
        addError(rEl, 'Seleccioná una opción.');
      }
    });

    if (!ok) {
      const message = missingCount === 1
        ? 'Falta completar 1 dato obligatorio para enviar la confirmación.'
        : `Faltan completar ${missingCount} datos obligatorios para enviar la confirmación.`;
      toggleValidationAlert(true, message);
      focusFirstError(firstError);
    }

    return ok;
  }

  function markError(el, message) {
    if (!el) return;
    el.classList.add('rsvp-input--error');
    el.setAttribute('aria-invalid', 'true');

    const label = el.closest('.rsvp-field-label') || el.parentElement;
    const errorId = `rsvp-error-${el.dataset.guest || 'main'}-${el.dataset.field || el.id || 'field'}`;
    el.setAttribute('aria-describedby', errorId);
    if (!label || label.querySelector('.rsvp-field-error')) return;

    label.classList.add('rsvp-field-label--error');
    const error = document.createElement('small');
    error.className = 'rsvp-field-error';
    error.id = errorId;
    error.textContent = message;
    label.appendChild(error);
  }

  function clearErrors() {
    document.querySelectorAll('.rsvp-input--error').forEach(el => {
      el.classList.remove('rsvp-input--error');
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    });
    document.querySelectorAll('.rsvp-field-label--error').forEach(el => el.classList.remove('rsvp-field-label--error'));
    document.querySelectorAll('.rsvp-field-error').forEach(el => el.remove());
    toggleValidationAlert(false);
  }

  function toggleValidationAlert(show, message = '') {
    const alert = document.getElementById('rsvp-validation-alert');
    if (!alert) return;
    if (message) alert.textContent = message;
    alert.hidden = !show;
    if (show) {
      alert.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      const modal = alert.closest('.rsvp-modal');
      if (modal) {
        modal.classList.remove('rsvp-modal--needs-attention');
        window.requestAnimationFrame(() => modal.classList.add('rsvp-modal--needs-attention'));
        window.setTimeout(() => modal.classList.remove('rsvp-modal--needs-attention'), 360);
      }
    }
  }

  function focusFirstError(el) {
    if (!el) return;
    window.setTimeout(() => {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el.focus({ preventScroll: true });
    }, 80);
  }

  // ── Envío ─────────────────────────────────────────
  async function handleSubmit() {
    if (_submitting) return;
    const guests = getGuests();
    if (!validate(guests)) return;

    _submitting = true;
    showState('loading');

    const cancion = _cfg.perGuestDetails ? '' : (document.getElementById('rsvp-cancion-input')?.value || '').trim();
    const attendingCount = _cfg.perGuestDetails
      ? guests.filter(guest => guest.status === 'asiste').length
      : _qty;
    const payload = {
      status:      _cfg.perGuestDetails ? (attendingCount > 0 ? 'asiste' : 'no_asiste') : _mode,
      guestCount:  _qty,
      attendingCount,
      guests,
      cancion,
      origen:      _cfg.origen || _cfg.eventId || document.body.dataset.event || 'melody15',
      estado:      _cfg.estado || 'VALIDO',
      template:    document.body.dataset.template || '',
      eventName:   _nombre,
      submittedAt: new Date().toISOString(),
    };

    try {
      const result = await RsvpService.send(payload, _cfg);
      setText('rsvp-success-msg', buildSuccessMessage(result));
      showState('success');
    } catch (err) {
      const message = err?.message || 'Ocurrió un error. Intentá de nuevo.';
      setText('rsvp-error-msg', message);
      showState('error');
      _submitting = false;
    }
  }

  function handleRetry() {
    _submitting = false;
    showState('form');
  }

  // ── Estados del modal ─────────────────────────────
  function showState(state) {
    const ids = { form: 'rsvp-form-body', loading: 'rsvp-loading', success: 'rsvp-success', error: 'rsvp-error' };
    Object.values(ids).forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.display = 'none'; el.setAttribute('aria-hidden', 'true'); }
    });
    const target = document.getElementById(ids[state]);
    if (target) { target.style.display = ''; target.setAttribute('aria-hidden', 'false'); }
  }

  // ── Helpers ───────────────────────────────────────
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function setTextBySelector(selector, val) {
    const el = document.querySelector(selector);
    if (el) el.textContent = val;
  }

  function getTexts(mode) {
    if (!_cfg.perGuestDetails) return TEXTS[mode];
    return {
      titulo: 'Confirmar asistencia',
      subtitulo: 'Completá tus datos y la asistencia de cada invitado.',
      btnLabel: 'Enviar confirmación',
      success: '¡Respuesta enviada! Gracias por avisarnos.',
    };
  }

  function buildSuccessMessage(result = {}) {
    if (result.partial && Array.isArray(result.duplicates) && result.duplicates.length) {
      const names = result.duplicates
        .map(item => [item.nombre, item.apellido, item.edad ? `(${item.edad})` : ''].filter(Boolean).join(' '))
        .join(', ');
      const savedText = result.saved === 1 ? 'Se registró 1 invitado nuevo.' : `Se registraron ${result.saved || 0} invitados nuevos.`;
      return `${savedText} Ya estaba registrado: ${names}.`;
    }

    return result.message || getTexts(_mode).success;
  }

  function toggleGuestDetails(index, status) {
    const details = document.querySelector(`[data-guest-details="${index}"]`);
    if (!details) return;
    details.hidden = status !== 'asiste';
    if (status !== 'asiste') {
      details.querySelectorAll('input, select').forEach(field => {
        field.classList.remove('rsvp-input--error');
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
        if (field.tagName === 'SELECT') field.value = '';
        if (field.tagName === 'INPUT') field.value = '';
      });
      details.querySelectorAll('.rsvp-field-label--error').forEach(field => field.classList.remove('rsvp-field-label--error'));
      details.querySelectorAll('.rsvp-field-error').forEach(error => error.remove());
    }
  }

  function on(id, event, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, fn);
  }

  function qs(selector) {
    return document.querySelector(selector);
  }

  return { init };
})();


// =====================================================
//  plantilla-blanconegro · script.js
// =====================================================

let CONFIG = {};

// ── Arranque ──────────────────────────────────────────
fetch('config.json')
  .then(r => r.json())
  .then(c => { CONFIG = c; init(c); })
  .catch(() => {
    document.documentElement.classList.remove('dt-cover-lock');
    initReveal();
    initSmoothScroll();
  });


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
poblarHero(c);
  poblarBienvenida(c);
  poblarCuando(c);
  poblarDonde(c);
  poblarDresscode(c);
  poblarRegalos(c);
  renderGaleria(c);
  poblarFooter(c);
  renderCalendario(c.fecha);
  startCountdown(c.fecha);
  initRsvp(c);
  initGuardarFecha(c);
  initPlayer(c);
  initAudioLifecycle();
  initCopiar();
  updateMeta(c);

  const refreshSnake = initCountdownSnake();

  if (c.splash !== false) {
    initSplash(() => {
      refreshSnake(); // recalcula dimensiones ahora que el contenido es visible
      initReveal();
      initSmoothScroll();
    });
  } else {
    document.documentElement.classList.remove('dt-cover-lock');
    initReveal();
    initSmoothScroll();
  }
}

// ── Poblar secciones ──────────────────────────────────
function poblarHero(c) {
  animateHeroNombre(c.nombre);
  setText('hero-frase',     c.frase);
  setText('hero-frase-sub', c.fraseSub);
  setText('hero-fecha',     c.fechaDisplay);
  setText('inv-hero-nombre',    c.nombre);
  setText('inv-hero-frase',     c.frase);
  setText('inv-hero-frase-sub', c.fraseSub);
  setText('inv-hero-fecha',     c.fechaDisplay);
  document.title = `15 · ${c.nombre}`;

  if (c.heroFoto) {
    const hero = document.getElementById('hero');
    hero.style.backgroundImage = `url('${c.heroFoto}')`;
    hero.classList.add('hero--foto');
  }
}

function animateHeroNombre(nombre) {
  const el = document.getElementById('hero-nombre');
  if (!el) return;
  el.innerHTML = nombre.split('').map((char, i) => {
    const delay = (0.38 + i * 0.065).toFixed(2);
    const content = char === ' ' ? '&nbsp;' : char;
    return `<span class="hero-char" style="animation-delay:${delay}s">${content}</span>`;
  }).join('');
}

function poblarBienvenida(c) {
  setText('bv-titulo', c.bienvenida.titulo);
  setText('bv-texto',  c.bienvenida.texto);
  setText('bv-firma',  `— ${c.nombre}`);
}

function poblarCuando(c) {
  const fecha   = new Date(c.fecha);
  const meses   = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const diasSem = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  setText('cuando-dia-semana', diasSem[fecha.getDay()]);
  setText('cuando-numero',     String(fecha.getDate()));
  setText('cuando-mes',        `${meses[fecha.getMonth()]} · ${fecha.getFullYear()}`);
  setText('cuando-hora',       c.hora);
}

function poblarDonde(c) {
  setText('donde-nombre', c.lugar.nombre);
  setText('donde-barrio', c.lugar.barrio);
  setText('donde-dir',    c.lugar.direccion);
  const btn = document.getElementById('donde-mapa');
  if (btn) {
    btn.href = c.lugar.mapsUrl;
    btn.innerHTML = `Cómo llegar <span aria-hidden="true">→</span>`;
  }
}

function poblarDresscode(c) {
  setText('dc-texto', c.dresscode.texto);
  setText('dc-aviso', c.dresscode.aviso);
  setText('dc-nota',  c.dresscode.nota);
}

function poblarRegalos(c) {
  setText('regalos-texto', c.regalos.texto);
  setText('regalos-alias', c.regalos.alias);
  setText('regalos-nombre', c.regalos.nombre || c.regalos.titular || c.regalos.cbu);
}

function poblarFooter(c) {
  setText('footer-mensaje', c.footer.mensaje);
  setText('footer-firma',   c.footer.firma);
}

// ── Galería ───────────────────────────────────────────
function renderGaleria(c) {
  const grid = document.getElementById('galeria-grid');
  if (!grid || !c.fotos?.length) return;
  grid.innerHTML = c.fotos.map((src, index) => `
    <button class="galeria-item galeria-item--${index + 1} reveal"
         type="button"
         data-src="${escapeAttr(src)}"
         data-index="${index}"
         aria-label="Ampliar foto ${index + 1} de ${escapeAttr(c.nombre)}">
      <img class="galeria-item__image"
           src="${escapeAttr(src)}"
           alt=""
           loading="lazy"
           decoding="async">
    </button>
  `).join('');
  initGaleriaLightbox(c.fotos, c.nombre);
}

function initGaleriaLightbox(fotos, nombre) {
  if (!Array.isArray(fotos) || !fotos.length || document.body.dataset.melodyGalleryReady === '1') return;
  document.body.dataset.melodyGalleryReady = '1';

  const lightbox = document.createElement('div');
  lightbox.className = 'galeria-lightbox';
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.innerHTML = `
    <button class="galeria-lightbox__close" type="button" aria-label="Cerrar imagen">&times;</button>
    <img class="galeria-lightbox__image" alt="Foto ampliada de ${escapeAttr(nombre)}">
    <div class="galeria-lightbox__nav" aria-label="NavegaciÃ³n de fotos">
      <button class="galeria-lightbox__arrow" type="button" data-gallery-prev aria-label="Foto anterior">&#8249;</button>
      <button class="galeria-lightbox__arrow" type="button" data-gallery-next aria-label="Foto siguiente">&#8250;</button>
    </div>
  `;
  document.body.append(lightbox);

  const image = lightbox.querySelector('.galeria-lightbox__image');
  const close = lightbox.querySelector('.galeria-lightbox__close');
  const prev = lightbox.querySelector('[data-gallery-prev]');
  const next = lightbox.querySelector('[data-gallery-next]');
  let currentIndex = 0;
  let previousOverflow = '';
  let lastFocusedElement = null;
  let touchStartX = 0;
  let touchStartY = 0;

  const updateOrientation = () => {
    const isLandscape = image.naturalWidth > image.naturalHeight;
    image.classList.toggle('is-landscape', isLandscape);
    image.classList.toggle('is-portrait', !isLandscape);
  };

  const show = index => {
    currentIndex = (index + fotos.length) % fotos.length;
    image.src = fotos[currentIndex];
    image.alt = `Foto ${currentIndex + 1} de ${nombre}`;
    image.dataset.galleryIndex = String(currentIndex + 1);
    if (image.complete && image.naturalWidth) updateOrientation();
    else image.addEventListener('load', updateOrientation, { once: true });
  };

  const open = index => {
    previousOverflow = document.body.style.overflow || '';
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    show(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('dt-lightbox-open');
    document.body.style.overflow = 'hidden';
    close.focus();
  };

  const closeLightbox = () => {
    if (!lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('dt-lightbox-open');
    document.body.style.overflow = previousOverflow;
    lastFocusedElement?.focus?.();
    lastFocusedElement = null;
  };

  const goToPrev = () => show(currentIndex - 1);
  const goToNext = () => show(currentIndex + 1);

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const item = event.target.closest('.galeria-item[data-src]');
    if (!item) return;
    open(Number(item.dataset.index || 0));
  });

  close.addEventListener('click', closeLightbox);
  prev.addEventListener('click', event => { event.stopPropagation(); goToPrev(); });
  next.addEventListener('click', event => { event.stopPropagation(); goToNext(); });
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') goToPrev();
    if (event.key === 'ArrowRight') goToNext();
  });
  lightbox.addEventListener('touchstart', event => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });
  lightbox.addEventListener('touchend', event => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    if (deltaX < 0) goToNext();
    else goToPrev();
  }, { passive: true });
}

// ── Countdown ─────────────────────────────────────────
function startCountdown(fechaISO) {
  const target = new Date(fechaISO).getTime();

  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      ['cd-dias','cd-horas','cd-min','cd-seg'].forEach(id => setText(id, '00'));
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);
    setText('cd-dias',  String(d));
    setText('cd-horas', String(h).padStart(2, '0'));
    setText('cd-min',   String(m).padStart(2, '0'));
    setText('cd-seg',   String(s).padStart(2, '0'));
  };

  tick();
  setInterval(tick, 1000);
}

// ── Calendario del mes ────────────────────────────────
function renderCalendario(fechaISO) {
  const card = document.getElementById('calendario-card');
  if (!card) return;

  const fecha  = new Date(fechaISO);
  const year   = fecha.getFullYear();
  const month  = fecha.getMonth();
  const day    = fecha.getDate();
  const hoy    = new Date();

  const meses    = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const diasSem  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const cabecera = ['Lu','Ma','Mi','Ju','Vi','Sa','Do'];

  const primero = new Date(year, month, 1).getDay();
  const offset  = primero === 0 ? 6 : primero - 1;
  const total   = new Date(year, month + 1, 0).getDate();
  const nombreDia = diasSem[fecha.getDay()];

  let celdas = '';
  for (let i = 0; i < offset; i++) {
    celdas += `<span class="cal-dia cal-dia--vacio"></span>`;
  }
  for (let d = 1; d <= total; d++) {
    const esEvento = d === day;
    const esHoy    = year  === hoy.getFullYear()
                  && month === hoy.getMonth()
                  && d     === hoy.getDate();
    let cls = 'cal-dia';
    if (esEvento)    cls += ' cal-dia--evento';
    else if (esHoy)  cls += ' cal-dia--hoy';
    celdas += `<span class="${cls}">${d}</span>`;
  }

  card.innerHTML = `
    <div class="cal-header">${meses[month]} ${year}</div>
    <div class="cal-semana">${cabecera.map(d => `<span>${d}</span>`).join('')}</div>
    <div class="cal-grid">${celdas}</div>
    <p class="cal-label">${nombreDia} · ${day} de ${meses[month]}</p>
  `;
}

// ── Countdown glow (efecto escalonado resuelto en CSS) ─────────────────────────
function initCountdownSnake() {
  return () => {};
}

// ── Splash ────────────────────────────────────────────
function initSplash(onReveal) {
  const cover  = document.getElementById('hero');
  const cta    = document.getElementById('hero-cta');
  const player = document.getElementById('player');
  if (!cover || !cta) {
    document.documentElement.classList.remove('dt-cover-lock');
    return;
  }

  document.documentElement.classList.add('dt-cover-lock');
  if (player) player.classList.add('oculto');

  cta.addEventListener('click', e => {
    e.preventDefault();
    e.stopImmediatePropagation();

    document.getElementById('player-btn')?.click();
    cover.classList.add('hero--opening');
    document.documentElement.classList.remove('dt-cover-lock');

    // Inicia las animaciones de reveal cuando el cover está casi desaparecido
    setTimeout(() => {
      if (onReveal) onReveal();
    }, 900);

    // Oculta el cover del DOM y muestra el player
    setTimeout(() => {
      cover.style.display = 'none';
      document.getElementById('inv-hero')?.scrollIntoView({ block: 'start' });
      if (player) player.classList.remove('oculto');
    }, 1150);
  }, { once: true });
}

// ── Confirmación ──────────────────────────────────────────────
function initRsvp(c) {
  if (typeof RsvpModal !== 'undefined') {
    RsvpModal.init(c.rsvp || {}, c.nombre);
  }
}

// ── Guardar en Google Calendar ────────────────────────
function initGuardarFecha(c) {
  const btn = document.getElementById('btn-calendario');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const fecha = new Date(c.fecha);
    const fin   = new Date(fecha.getTime() + 4 * 3600000);
    const fmt   = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + `&text=${encodeURIComponent('15 de ' + c.nombre)}`
      + `&dates=${fmt(fecha)}/${fmt(fin)}`
      + `&details=${encodeURIComponent('Fiesta de 15 de ' + c.nombre)}`
      + `&location=${encodeURIComponent(c.lugar.direccion)}`;
    window.open(url, '_blank');
  });
}

// ── Música ────────────────────────────────────────────
function initPlayer(c) {
  const audio = document.getElementById('player-audio');
  const btn   = document.getElementById('player-btn');
  const play  = btn?.querySelector('.icon-play');
  const pause = btn?.querySelector('.icon-pause');
  if (!audio || !btn) return;

  if (c.musica?.src)     audio.src = c.musica.src;
  if (c.musica?.titulo)  setText('player-titulo',  c.musica.titulo);
  if (c.musica?.artista) setText('player-artista', c.musica.artista);
  audio.volume = 0.4;

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        if (play)  play.style.display  = 'none';
        if (pause) pause.style.display = '';
        btn.classList.add('playing');
        btn.setAttribute('aria-label', 'Pausar');
      }).catch(() => {});
    } else {
      audio.pause();
      if (play)  play.style.display  = '';
      if (pause) pause.style.display = 'none';
      btn.classList.remove('playing');
      btn.setAttribute('aria-label', 'Reproducir');
    }
  });
}

// ── Copiar al portapapeles ────────────────────────────
function pausePlayerAudio() {
  const audio = document.getElementById('player-audio');
  const btn   = document.getElementById('player-btn');
  const play  = btn?.querySelector('.icon-play');
  const pause = btn?.querySelector('.icon-pause');
  if (!audio || !btn || audio.paused) return;

  audio.pause();
  if (play)  play.style.display = '';
  if (pause) pause.style.display = 'none';
  btn.classList.remove('playing');
  btn.setAttribute('aria-label', 'Reproducir');
}

function initAudioLifecycle() {
  if (document.body.dataset.melodyAudioLifecycle === '1') return;
  document.body.dataset.melodyAudioLifecycle = '1';

  const isInternalModalInteraction = target => Boolean(target.closest(
    '#btn-asiste, #rsvp-modal, .galeria-item, .galeria-lightbox'
  ));

  const shouldPauseForClick = target => {
    if (isInternalModalInteraction(target)) return false;
    if (target.closest('#btn-calendario')) return true;

    const externalLink = target.closest('a[href]');
    if (!externalLink) return false;

    const href = externalLink.getAttribute('href') || '';
    return /^(https?:|mailto:|tel:)/i.test(href) || externalLink.target === '_blank';
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') pausePlayerAudio();
  });
  window.addEventListener('pagehide', pausePlayerAudio);
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    if (shouldPauseForClick(event.target)) pausePlayerAudio();
  }, true);
}

function initCopiar() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.rc-copiar');
    if (!btn) return;
    const campo = document.getElementById(btn.dataset.campo);
    if (!campo) return;
    navigator.clipboard.writeText(campo.textContent.trim()).then(() => {
      const orig = btn.textContent;
      btn.textContent = 'Copiado';
      btn.classList.add('copiado');
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove('copiado');
      }, 2000);
    }).catch(() => {});
  });
}

// ── Scroll reveal ─────────────────────────────────────
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  const observe = () => document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  observe();
  setTimeout(observe, 300);
}

// ── Smooth scroll ─────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    });
  });
}

// ── Open Graph dinámico ───────────────────────────────
function updateMeta(c) {
  const set = (prop, val) => {
    let el = document.querySelector(`meta[property="${prop}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
    el.setAttribute('content', val);
  };
  set('og:title',       `15 de ${c.nombre}`);
  set('og:description', c.frase);
  if (c.heroFoto) set('og:image', c.heroFoto);
}

// ── Util ──────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.textContent = val;
}

function escapeAttr(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
