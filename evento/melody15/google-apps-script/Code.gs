/**
 * DigiTarjetas - Melody 15
 *
 * Publicar como Web App:
 * - Ejecutar como: Yo
 * - Acceso: Cualquiera
 *
 * Luego pegar la URL /exec en:
 * evento/melody15/config.json -> rsvp.googleSheetsUrl
 */

const SPREADSHEET_ID = "1LfxKQRqcgBVko3jelJGKx330ALuzWyRdApp7SjkBrls";
const SHEET_CONFIRMACIONES = "Confirmaciones";
const SHEET_RESUMEN = "Resumen";
const ORIGEN_EVENTO = "melody15";
const ESTADO_VALIDO = "VALIDO";
const ESTADO_DUPLICADO = "DUPLICADO";

const HEADERS_CONFIRMACIONES = [
  "id_confirmacion",
  "fecha_confirmacion",
  "nombre",
  "apellido",
  "edad",
  "asiste",
  "detalle_restriccion",
  "cancion_sugerida",
  "origen",
  "estado",
];

function doGet(e) {
  try {
    const action = normalizeText(e && e.parameter && e.parameter.action);

    if (action === "health") {
      return jsonResponse({ ok: true, message: "API Melody 15 activa." });
    }

    if (action === "resumen") {
      return jsonResponse({ ok: true, resumen: getResumen() });
    }

    return jsonResponse({ ok: true, message: "DigiTarjetas Melody 15 API." });
  } catch (error) {
    return jsonResponse({ ok: false, message: getErrorMessage(error) });
  }
}

function doPost(e) {
  try {
    const data = parsePostData(e);
    const action = normalizeText((e && e.parameter && e.parameter.action) || data.action);

    if (action && action !== "confirmacion") {
      return jsonResponse({ ok: false, message: "Acción no válida." });
    }

    const records = normalizeRecords(data);
    if (!records.length) {
      throw new Error("No se recibieron confirmaciones para guardar.");
    }

    ensureConfirmacionesHeaders();

    const duplicate = findDuplicate(records);
    if (duplicate) {
      return jsonResponse({
        ok: false,
        code: "DUPLICATE",
        duplicate: true,
        duplicado: true,
        message: "Ya existe una confirmación registrada con esos datos.",
        record: duplicate,
      });
    }

    const saved = saveConfirmaciones(records);
    updateResumen();

    return jsonResponse({
      ok: true,
      message: "Confirmación registrada correctamente.",
      saved,
    });
  } catch (error) {
    return jsonResponse({ ok: false, message: getErrorMessage(error) });
  }
}

function parsePostData(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("No se recibieron datos del formulario.");
  }

  return JSON.parse(e.postData.contents);
}

function normalizeRecords(data) {
  const incoming = Array.isArray(data.records)
    ? data.records
    : Array.isArray(data.guests)
      ? data.guests
      : [data];

  return incoming.map((record, index) => {
    const origen = valueOrDefault(record.origen || data.origen || data.eventId, ORIGEN_EVENTO);
    const estado = valueOrDefault(record.estado || data.estado, ESTADO_VALIDO);
    const fecha = valueOrDefault(record.fecha_confirmacion || data.submittedAt, new Date().toISOString());
    const nombre = clean(record.nombre);
    const apellido = clean(record.apellido);
    const edad = clean(record.edad);
    const asiste = normalizeYesNo(record.asiste || record.status);
    const detalleRestriccion = buildRestrictionDetail(record);
    const cancion = clean(record.cancion_sugerida || record.cancion || data.cancion);

    if (!nombre) throw new Error("El nombre es obligatorio.");
    if (!apellido) throw new Error("El apellido es obligatorio.");
    if (!edad) throw new Error("La edad es obligatoria.");

    return {
      id_confirmacion: clean(record.id_confirmacion) || createConfirmationId(origen, index + 1),
      fecha_confirmacion: fecha,
      nombre,
      apellido,
      edad,
      asiste,
      detalle_restriccion: detalleRestriccion,
      cancion_sugerida: cancion,
      origen,
      estado,
    };
  });
}

function saveConfirmaciones(records) {
  const sheet = getSheet(SHEET_CONFIRMACIONES);
  const rows = records.map(record => HEADERS_CONFIRMACIONES.map(header => record[header] || ""));

  sheet
    .getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS_CONFIRMACIONES.length)
    .setValues(rows);

  return rows.length;
}

function findDuplicate(records) {
  const sheet = getSheet(SHEET_CONFIRMACIONES);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return null;

  const headers = values[0].map(normalizeText);
  const indexes = {
    nombre: headers.indexOf("nombre"),
    apellido: headers.indexOf("apellido"),
    edad: headers.indexOf("edad"),
    origen: headers.indexOf("origen"),
    estado: headers.indexOf("estado"),
  };

  const existingKeys = new Set();
  values.slice(1).forEach(row => {
    const estado = normalizeText(row[indexes.estado]);
    if (estado === normalizeText(ESTADO_DUPLICADO)) return;

    const origen = clean(row[indexes.origen]) || ORIGEN_EVENTO;
    existingKeys.add(buildDuplicateKey({
      nombre: row[indexes.nombre],
      apellido: row[indexes.apellido],
      edad: row[indexes.edad],
      origen,
    }));
  });

  return records.find(record => existingKeys.has(buildDuplicateKey(record))) || null;
}

function updateResumen() {
  const sheet = getSheet(SHEET_RESUMEN);
  const stats = calculateStats();
  const rows = [
    ["Total confirmados", stats.totalConfirmados],
    ["Total adultos", stats.totalAdultos],
    ["Total menores", stats.totalMenores],
    ["No asisten", stats.noAsisten],
    ["Con restricción alimentaria", stats.conRestriccion],
    ["Canciones sugeridas", stats.cancionesSugeridas],
    ["Última confirmación", stats.ultimaConfirmacion],
  ];

  sheet.getRange(1, 1, 1, 2).setValues([["Métrica", "Resultado"]]);
  sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  return stats;
}

function getResumen() {
  updateResumen();
  return calculateStats();
}

function calculateStats() {
  const sheet = getSheet(SHEET_CONFIRMACIONES);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return {
      totalConfirmados: 0,
      totalAdultos: 0,
      totalMenores: 0,
      noAsisten: 0,
      conRestriccion: 0,
      cancionesSugeridas: 0,
      ultimaConfirmacion: "",
    };
  }

  const headers = values[0].map(normalizeText);
  const index = header => headers.indexOf(header);
  const rows = values.slice(1).filter(row => {
    const origen = clean(row[index("origen")]) || ORIGEN_EVENTO;
    const estado = normalizeText(row[index("estado")]);
    return origen === ORIGEN_EVENTO && estado !== normalizeText(ESTADO_DUPLICADO);
  });

  const asistentes = rows.filter(row => normalizeYesNo(row[index("asiste")]) === "SI");
  const noAsisten = rows.filter(row => normalizeYesNo(row[index("asiste")]) === "NO");
  const adultos = asistentes.filter(row => Number(row[index("edad")]) >= 18);
  const menores = asistentes.filter(row => Number(row[index("edad")]) < 18);
  const conRestriccion = asistentes.filter(row => hasRestriction(row[index("detalle_restriccion")]));
  const canciones = rows.filter(row => clean(row[index("cancion_sugerida")]));
  const fechas = rows
    .map(row => parseDate(row[index("fecha_confirmacion")]))
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime());

  return {
    totalConfirmados: asistentes.length,
    totalAdultos: adultos.length,
    totalMenores: menores.length,
    noAsisten: noAsisten.length,
    conRestriccion: conRestriccion.length,
    cancionesSugeridas: canciones.length,
    ultimaConfirmacion: fechas[0] ? formatDate(fechas[0]) : "",
  };
}

function ensureConfirmacionesHeaders() {
  const sheet = getSheet(SHEET_CONFIRMACIONES);
  const current = sheet.getRange(1, 1, 1, HEADERS_CONFIRMACIONES.length).getValues()[0];
  const hasHeaders = current.some(value => clean(value));

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS_CONFIRMACIONES.length).setValues([HEADERS_CONFIRMACIONES]);
  }
}

function getSheet(name) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(name);
  if (!sheet) throw new Error(`No existe la hoja "${name}".`);
  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function buildRestrictionDetail(record) {
  const restriccion = clean(record.restriccion_alimentaria || record.restriccion);
  const detalle = clean(record.detalle_restriccion);

  if (!restriccion) return detalle;
  if (!detalle || normalizeText(restriccion) === normalizeText(detalle)) return restriccion;
  return `${restriccion} - ${detalle}`;
}

function buildDuplicateKey(record) {
  return [
    record.origen || ORIGEN_EVENTO,
    record.nombre,
    record.apellido,
    record.edad,
  ].map(value => normalizeText(value)).join("|");
}

function createConfirmationId(origen, index) {
  return `${origen}-${Date.now()}-${index}`;
}

function normalizeYesNo(value) {
  const text = normalizeText(value);
  if (["no", "no_asiste", "false", "0"].includes(text)) return "NO";
  return "SI";
}

function hasRestriction(value) {
  const text = normalizeText(value);
  return Boolean(text) && !["sin restriccion", "sin restricción", "seleccionar"].includes(text);
}

function clean(value) {
  return String(value === null || value === undefined ? "" : value).trim();
}

function normalizeText(value) {
  return clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function valueOrDefault(value, fallback) {
  const cleaned = clean(value);
  return cleaned || fallback;
}

function parseDate(value) {
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value)) return value;
  const date = new Date(value);
  return isNaN(date) ? null : date;
}

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
}

function getErrorMessage(error) {
  return error && error.message ? error.message : "Error inesperado.";
}
