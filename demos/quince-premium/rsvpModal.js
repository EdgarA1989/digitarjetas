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
  function setQty(n) {
    const max = _mode === 'asiste' ? _maxGuests : 1;
    _qty = Math.max(1, Math.min(n, max));
    setText('rsvp-qty-num', String(_qty));

    const btnMinus = document.getElementById('rsvp-qty-minus');
    const btnPlus  = document.getElementById('rsvp-qty-plus');
    if (btnMinus) btnMinus.disabled = _qty <= 1;
    if (btnPlus)  btnPlus.disabled  = _qty >= max;

    renderGuests();
  }

  // ── Renderizar campos de invitados ────────────────
  function renderGuests() {
    const container = document.getElementById('rsvp-guests');
    if (!container) return;

    let html = '';
    for (let i = 0; i < _qty; i++) {
      const isOnly = _qty === 1;
      const label  = isOnly && _mode === 'no_asiste' ? 'Tus datos'
                   : isOnly ? 'Tus datos'
                   : `Invitado ${i + 1}`;
      html += `
        <div class="rsvp-guest">
          <p class="rsvp-guest-label">${label}</p>
          <div class="rsvp-guest-fields">
            <input class="rsvp-input"
                   type="text"
                   placeholder="Nombre"
                   data-guest="${i}"
                   data-field="nombre"
                   autocomplete="${i === 0 ? 'given-name' : 'off'}"
                   inputmode="text" />
            <input class="rsvp-input"
                   type="text"
                   placeholder="Apellido"
                   data-guest="${i}"
                   data-field="apellido"
                   autocomplete="${i === 0 ? 'family-name' : 'off'}"
                   inputmode="text" />
          </div>
          ${_cfg.perGuestDetails ? renderGuestDetails(i) : ''}
        </div>`;
    }
    container.innerHTML = html;
  }

  function renderGuestDetails(index) {
    return `
      <div class="rsvp-guest-extra">
        <label class="rsvp-field-label">
          <span>Asistencia</span>
          <div class="rsvp-status-row">
            <input class="rsvp-status-input"
                   type="hidden"
                   value="asiste"
                   data-guest="${index}"
                   data-field="status" />
            <div class="rsvp-status-toggle" role="group" aria-label="Asistencia del invitado ${index + 1}">
              <button class="rsvp-status-btn is-active"
                      type="button"
                      data-guest="${index}"
                      data-rsvp-status="asiste"
                      aria-pressed="true">Sí</button>
              <button class="rsvp-status-btn"
                      type="button"
                      data-guest="${index}"
                      data-rsvp-status="no_asiste"
                      aria-pressed="false">No</button>
            </div>
          </div>
        </label>
        <div class="rsvp-attendance-details" data-guest-details="${index}">
          <label class="rsvp-field-label">
            <span>¿Posee alguna restricción alimenticia?</span>
            <select class="rsvp-input"
                    data-guest="${index}"
                    data-field="restriccion">
              <option value="">Seleccionar</option>
              <option>Sin restricción</option>
              <option>Vegetariano/a</option>
              <option>Vegano/a</option>
              <option>Sin TACC / celiaquía</option>
              <option>Sin lactosa</option>
              <option>Alergia a frutos secos</option>
              <option>Otra restricción</option>
            </select>
          </label>
          ${_cfg.includeSongRequest === false ? '' : `
            <label class="rsvp-field-label">
              <span>Canción que no puede faltar</span>
              <input class="rsvp-input"
                     type="text"
                     placeholder="Artista · Canción"
                     data-guest="${index}"
                     data-field="cancion"
                     autocomplete="off"
                     inputmode="text" />
            </label>
          `}
        </div>
      </div>`;
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
      const cancion = _cfg.perGuestDetails
        ? (qs(`.rsvp-input[data-guest="${i}"][data-field="cancion"]`)?.value || '').trim()
        : '';
      guests.push({ number: i + 1, nombre, apellido, status, restriccion, cancion });
    }
    return guests;
  }

  // ── Validación ────────────────────────────────────
  function validate(guests) {
    clearErrors();
    let ok = true;
    guests.forEach((g, i) => {
      const nEl = qs(`.rsvp-input[data-guest="${i}"][data-field="nombre"]`);
      const aEl = qs(`.rsvp-input[data-guest="${i}"][data-field="apellido"]`);
      const rEl = qs(`.rsvp-input[data-guest="${i}"][data-field="restriccion"]`);
      if (!g.nombre)   { markError(nEl); ok = false; }
      if (!g.apellido) { markError(aEl); ok = false; }
      if (_cfg.perGuestDetails && g.status === 'asiste' && !g.restriccion) { markError(rEl); ok = false; }
    });
    return ok;
  }

  function markError(el) {
    if (el) el.classList.add('rsvp-input--error');
  }

  function clearErrors() {
    document.querySelectorAll('.rsvp-input--error').forEach(el => el.classList.remove('rsvp-input--error'));
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
      template:    document.body.dataset.template || '',
      eventName:   _nombre,
      submittedAt: new Date().toISOString(),
    };

    try {
      await RsvpService.send(payload, _cfg);
      setText('rsvp-success-msg', getTexts(_mode).success);
      showState('success');
    } catch (_err) {
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

  function toggleGuestDetails(index, status) {
    const details = document.querySelector(`[data-guest-details="${index}"]`);
    if (!details) return;
    details.hidden = status !== 'asiste';
    if (status !== 'asiste') {
      details.querySelectorAll('input, select').forEach(field => {
        field.classList.remove('rsvp-input--error');
        if (field.tagName === 'SELECT') field.value = '';
        if (field.tagName === 'INPUT') field.value = '';
      });
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



