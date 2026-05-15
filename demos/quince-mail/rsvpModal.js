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

    const texts = TEXTS[mode];
    setText('rsvp-titulo',    texts.titulo);
    setText('rsvp-subtitulo', texts.subtitulo);
    setText('rsvp-submit',    texts.btnLabel);

    const qtySection = document.getElementById('rsvp-qty');
    if (qtySection) qtySection.style.display = mode === 'asiste' ? '' : 'none';

    setQty(1);
    const cancionInput = document.getElementById('rsvp-cancion-input');
    if (cancionInput) cancionInput.value = '';
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
        </div>`;
    }
    container.innerHTML = html;
  }

  // ── Obtener datos de los campos ───────────────────
  function getGuests() {
    const guests = [];
    for (let i = 0; i < _qty; i++) {
      const nombre   = (qs(`.rsvp-input[data-guest="${i}"][data-field="nombre"]`)?.value   || '').trim();
      const apellido = (qs(`.rsvp-input[data-guest="${i}"][data-field="apellido"]`)?.value || '').trim();
      guests.push({ number: i + 1, nombre, apellido });
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
      if (!g.nombre)   { markError(nEl); ok = false; }
      if (!g.apellido) { markError(aEl); ok = false; }
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

    const cancion = (document.getElementById('rsvp-cancion-input')?.value || '').trim();
    const payload = {
      status:      _mode,
      guestCount:  _qty,
      guests,
      cancion,
      template:    document.body.dataset.template || '',
      eventName:   _nombre,
      submittedAt: new Date().toISOString(),
    };

    try {
      await RsvpService.send(payload, _cfg);
      setText('rsvp-success-msg', TEXTS[_mode].success);
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

  function on(id, event, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, fn);
  }

  function qs(selector) {
    return document.querySelector(selector);
  }

  return { init };
})();

