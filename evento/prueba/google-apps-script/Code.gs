/**
 * DigiTarjetas - Prueba RSVP
 *
 * Publicar como Web App:
 * - Ejecutar como: Yo
 * - Acceso: Cualquiera
 *
 * Luego pegar la URL /exec en:
 * evento/prueba/config.json -> rsvp.googleSheetsUrl
 */

const SPREADSHEET_ID = "1F1J80qMQu9wf33pFexmz3Ku4qkskiuvxZrKyksXF2tc";
const SHEET_CONFIRMACIONES = "Confirmaciones";
const SHEET_RESUMEN = "Resumen";
const ORIGEN_EVENTO = "prueba-digitarjetas";
const ESTADO_VALIDO = "VALIDO";
const ESTADO_DUPLICADO = "DUPLICADO";
const TIME_ZONE = "America/Argentina/Buenos_Aires";
const API_VERSION = "prueba-digitarjetas-2026-09-02";

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
      return jsonResponse({ ok: true, message: "API DigiTarjetas prueba activa.", version: API_VERSION });
    }
    if (action === "resumen") {
      return jsonResponse({ ok: true, resumen: getResumen() });
    }
    return jsonResponse({ ok: true, message: "DigiTarjetas prueba RSVP API." });
  } catch (error) {
    return jsonResponse({ ok: false, message: getErrorMessage(error) });
  }
}

function onEdit(e) {
  onSpreadsheetEdit(e);
}

function onChange(e) {
  onSpreadsheetChange(e);
}

function onSpreadsheetEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_CONFIRMACIONES) return;
  updateResumen();
}

function onSpreadsheetChange(e) {
  const changeType = e && e.changeType ? String(e.changeType) : "";
  const refreshTypes = ["EDIT", "INSERT_ROW", "REMOVE_ROW", "INSERT_COLUMN", "REMOVE_COLUMN", "OTHER"];
  if (!changeType || refreshTypes.includes(changeType)) {
    updateResumen();
  }
}

function refreshResumen() {
  return updateResumen();
}

function installResumenAutoRefreshTrigger() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const handlers = ["refreshResumen", "onSpreadsheetEdit", "onSpreadsheetChange"];

  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (handlers.includes(trigger.getHandlerFunction())) {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger("onSpreadsheetEdit")
    .forSpreadsheet(spreadsheet)
    .onEdit()
    .create();

  ScriptApp.newTrigger("onSpreadsheetChange")
    .forSpreadsheet(spreadsheet)
    .onChange()
    .create();

  updateResumen();

  return "Triggers de resumen activos: edición y borrado/agregado de filas.";
}

function listResumenTriggers() {
  return ScriptApp.getProjectTriggers().map(trigger => {
    return {
      handler: trigger.getHandlerFunction(),
      eventType: String(trigger.getEventType()),
      sourceId: trigger.getTriggerSourceId(),
    };
  });
}

function testResumenManual() {
  return updateResumen();
}

function resetResumenDemo() {
  const sheet = getSheet(SHEET_CONFIRMACIONES);
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, HEADERS_CONFIRMACIONES.length).clearContent();
  }

  return updateResumen();
}

function doPost(e) {
  try {
    const data = parsePostData(e);
    const action = normalizeText((e && e.parameter && e.parameter.action) || data.action);
    if (action && action !== "confirmacion") {
      return jsonResponse({ ok: false, message: "Accion no valida." });
    }

    const records = normalizeRecords(data);
    if (!records.length) throw new Error("No se recibieron confirmaciones para guardar.");

    ensureConfirmacionesHeaders();
    const result = splitNewAndDuplicateRecords(records);
    if (!result.newRecords.length) {
      return jsonResponse({
        ok: false,
        code: "DUPLICATE",
        duplicate: true,
        duplicado: true,
        message: buildDuplicateMessage(result.duplicates),
        duplicates: result.duplicates,
      });
    }

    const saved = saveConfirmaciones(result.newRecords);
    updateResumen();
    return jsonResponse({
      ok: true,
      partial: result.duplicates.length > 0,
      message: result.duplicates.length
        ? buildPartialMessage(saved, result.duplicates)
        : "Confirmación registrada correctamente.",
      saved,
      duplicates: result.duplicates,
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
    const nombre = clean(record.nombre);
    const apellido = clean(record.apellido);
    const edad = clean(record.edad);
    if (!nombre) throw new Error("El nombre es obligatorio.");
    if (!apellido) throw new Error("El apellido es obligatorio.");
    if (!edad) throw new Error("La edad es obligatoria.");

    return {
      id_confirmacion: clean(record.id_confirmacion) || createConfirmationId(origen, index + 1),
      fecha_confirmacion: formatArgentinaDateTime(record.fecha_confirmacion || data.submittedAt || new Date()),
      nombre,
      apellido,
      edad,
      asiste: normalizeYesNo(record.asiste || record.status),
      detalle_restriccion: buildRestrictionDetail(record),
      cancion_sugerida: clean(record.cancion_sugerida || record.cancion || data.cancion),
      origen,
      estado,
    };
  });
}

function saveConfirmaciones(records) {
  const sheet = getSheet(SHEET_CONFIRMACIONES);
  const headers = ensureConfirmacionesHeaders();
  const rows = records.map(record => headers.map(header => record[header] || ""));
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
  return rows.length;
}

function splitNewAndDuplicateRecords(records) {
  const sheet = getSheet(SHEET_CONFIRMACIONES);
  const values = sheet.getDataRange().getValues();
  const existingKeys = new Set();
  const seenInRequest = new Set();
  const newRecords = [];
  const duplicates = [];

  if (values.length >= 2) {
    const headers = values[0].map(normalizeText);
    const indexes = {
      nombre: headers.indexOf("nombre"),
      apellido: headers.indexOf("apellido"),
      edad: headers.indexOf("edad"),
      origen: headers.indexOf("origen"),
      estado: headers.indexOf("estado"),
    };

    values.slice(1).forEach(row => {
      const estado = normalizeText(indexes.estado >= 0 ? row[indexes.estado] : "");
      if (estado === normalizeText(ESTADO_DUPLICADO)) return;
      const origen = clean(indexes.origen >= 0 ? row[indexes.origen] : "") || ORIGEN_EVENTO;
      existingKeys.add(buildDuplicateKey({
        nombre: indexes.nombre >= 0 ? row[indexes.nombre] : "",
        apellido: indexes.apellido >= 0 ? row[indexes.apellido] : "",
        edad: indexes.edad >= 0 ? row[indexes.edad] : "",
        origen,
      }));
    });
  }

  records.forEach(record => {
    const key = buildDuplicateKey(record);
    if (existingKeys.has(key) || seenInRequest.has(key)) {
      duplicates.push(toPublicRecord(record));
      return;
    }
    seenInRequest.add(key);
    newRecords.push(record);
  });

  return { newRecords, duplicates };
}

function ensureConfirmacionesHeaders() {
  const sheet = getSheet(SHEET_CONFIRMACIONES);
  const current = sheet.getRange(1, 1, 1, HEADERS_CONFIRMACIONES.length).getValues()[0];
  if (!current.some(value => clean(value))) {
    sheet.getRange(1, 1, 1, HEADERS_CONFIRMACIONES.length).setValues([HEADERS_CONFIRMACIONES]);
  }
  return HEADERS_CONFIRMACIONES;
}

function updateResumen() {
  const sheet = getSheet(SHEET_RESUMEN);
  const stats = calculateStats();
  const rows = [
    ["Total confirmados", stats.totalConfirmados],
    ["Total adultos", stats.totalAdultos],
    ["Total menores", stats.totalMenores],
    ["No asisten", stats.noAsisten],
    ["Con restriccion alimentaria", stats.conRestriccion],
    ["Canciones sugeridas", stats.cancionesSugeridas],
    ["Última confirmación", stats.ultimaConfirmacion],
  ];
  sheet.getRange(1, 1, 1, 2).setValues([["Metrica", "Resultado"]]);
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
    return { totalConfirmados: 0, totalAdultos: 0, totalMenores: 0, noAsisten: 0, conRestriccion: 0, cancionesSugeridas: 0, ultimaConfirmacion: "" };
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
  const fechas = rows.map(row => parseDate(row[index("fecha_confirmacion")])).filter(Boolean).sort((a, b) => b.getTime() - a.getTime());

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

function getSheet(name) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  return sheet;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function buildRestrictionDetail(record) {
  const restriccion = clean(record.restriccion_alimentaria || record.restriccion);
  const detalle = clean(record.detalle_restriccion);
  if (!restriccion && !detalle) return "Sin restricción";
  if (!restriccion) return detalle;
  if (!detalle || normalizeText(restriccion) === normalizeText(detalle)) return restriccion;
  return `${restriccion} - ${detalle}`;
}

function buildDuplicateKey(record) {
  return [record.origen || ORIGEN_EVENTO, record.nombre, record.apellido, record.edad].map(value => normalizeText(value)).join("|");
}

function buildDuplicateMessage(duplicates) {
  const names = duplicates.map(formatRecordName).filter(Boolean).join(", ");
  return names ? `Ya existe una confirmación registrada para: ${names}.` : "Ya existe una confirmación registrada con esos datos.";
}

function buildPartialMessage(saved, duplicates) {
  const names = duplicates.map(formatRecordName).filter(Boolean).join(", ");
  return names ? `Se registraron ${saved} invitado(s). Ya estaban registrados: ${names}.` : `Se registraron ${saved} invitado(s). Algunos invitados ya estaban registrados.`;
}

function formatRecordName(record) {
  return [record.nombre, record.apellido, record.edad ? `(${record.edad})` : ""].filter(Boolean).join(" ");
}

function toPublicRecord(record) {
  return { nombre: record.nombre, apellido: record.apellido, edad: record.edad };
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
  return Boolean(text) && !["sin restriccion", "seleccionar"].includes(text);
}

function clean(value) {
  return String(value === null || value === undefined ? "" : value).trim();
}

function normalizeText(value) {
  return clean(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function valueOrDefault(value, fallback) {
  const cleaned = clean(value);
  return cleaned || fallback;
}

function formatArgentinaDateTime(value) {
  const cleaned = clean(value);
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(cleaned)) return cleaned.replace("T", " ");
  const date = parseDate(value) || new Date();
  return Utilities.formatDate(date, TIME_ZONE, "yyyy-MM-dd HH:mm:ss");
}

function parseDate(value) {
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value)) return value;
  const date = new Date(value);
  return isNaN(date) ? null : date;
}

function formatDate(date) {
  return Utilities.formatDate(date, TIME_ZONE, "dd/MM/yyyy HH:mm:ss");
}

function getErrorMessage(error) {
  return error && error.message ? error.message : "Error inesperado.";
}
