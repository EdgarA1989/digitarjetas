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
      .map(g => `  ${g.number}. ${g.nombre} ${g.apellido}`)
      .join('\n');

    const subject = `Confirmación · 15 de ${payload.eventName} · ${payload.guests[0]?.nombre || ''} ${payload.guests[0]?.apellido || ''}`;
    const lines = [
      `Estado: ${statusLbl}`,
      `Evento: 15 de ${payload.eventName}`,
      `Invitados (${payload.guestCount}):`,
      guestLines,
      '',
    ];
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
      .map(g => `${g.number}. ${g.nombre} ${g.apellido}`)
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

    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  return { send };
})();

