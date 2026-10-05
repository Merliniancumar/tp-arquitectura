// leerEstado.js
// Responsable de leer el archivo JSON con el estado del tablero y
// validar que tenga la forma mínima esperada.

const fs = require("fs");

/**
 * Lee un archivo JSON desde `rutaArchivo` y lo devuelve como objeto.
 * Lanza un error claro si el archivo no existe o el JSON es inválido.
 */
function leerEstadoDesdeArchivo(rutaArchivo) {
  if (!rutaArchivo) {
    throw new Error(
      "No se especificó la ruta del archivo de estado. Uso: node index.js <ruta-al-json>"
    );
  }

  if (!fs.existsSync(rutaArchivo)) {
    throw new Error(`No se encontró el archivo: ${rutaArchivo}`);
  }

  const contenido = fs.readFileSync(rutaArchivo, "utf-8");

  let estado;
  try {
    estado = JSON.parse(contenido);
  } catch (error) {
    throw new Error(`El archivo ${rutaArchivo} no contiene un JSON válido: ${error.message}`);
  }

  validarEstado(estado);
  return estado;
}

/**
 * Valida que el estado tenga la estructura mínima necesaria:
 * { turno: 'blanco' | 'negro', fichas: [...], casas: [...] }
 */
function validarEstado(estado) {
  if (!estado || typeof estado !== "object") {
    throw new Error("El estado leído no es un objeto válido.");
  }
  if (estado.turno !== "blanco" && estado.turno !== "negro") {
    throw new Error("El estado debe indicar 'turno': 'blanco' o 'negro'.");
  }
  if (!Array.isArray(estado.fichas)) {
    throw new Error("El estado debe incluir un array 'fichas'.");
  }
}

module.exports = {
  leerEstadoDesdeArchivo,
  validarEstado,
};