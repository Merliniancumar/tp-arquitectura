// casas.js
// Generador determinista de "casas" a partir de una semilla numérica.
// Determinista significa que la MISMA semilla siempre produce el MISMO
// resultado, algo esencial para poder reproducir partidas y escribir
// pruebas automatizadas.

const { dentroDelTablero } = require("./tablero");

/**
 * Generador de números pseudoaleatorios simple (LCG - Linear Congruential
 * Generator). No es criptográficamente seguro, pero es determinista y
 * suficiente para esto.
 */
function crearGeneradorAleatorio(semilla) {
  let estado = semilla % 2147483647;
  if (estado <= 0) estado += 2147483646;

  return function siguiente() {
    estado = (estado * 16807) % 2147483647;
    return (estado - 1) / 2147483646; // número entre 0 y 1
  };
}

/**
 * Genera `cantidad` posiciones de "casas" distintas dentro del tablero,
 * evitando las celdas ya ocupadas (por fichas) y evitando
 * posiciones repetidas entre sí.
 *
 * @param {object} tablero - tablero ya creado (con celdas ocupadas o no)
 * @param {number} semilla - semilla para el generador determinista
 * @param {number} cantidad - cantidad de casas a generar (default 5)
 * @returns {Array<{fila: number, columna: number}>}
 */
function generarCasas(tablero, semilla, cantidad = 5) {
  const aleatorio = crearGeneradorAleatorio(semilla);
  const posiciones = [];
  const ocupadas = new Set();

  // Registrar como "ocupadas" las celdas que ya tienen algo (fichas).
  for (let f = 0; f < tablero.filas; f++) {
    for (let c = 0; c < tablero.columnas; c++) {
      if (tablero.celdas[f][c] !== null) {
        ocupadas.add(`${f},${c}`);
      }
    }
  }

  let intentos = 0;
  const intentosMaximos = 1000; // salvaguarda contra loops infinitos

  while (posiciones.length < cantidad && intentos < intentosMaximos) {
    intentos++;
    const fila = Math.floor(aleatorio() * tablero.filas);
    const columna = Math.floor(aleatorio() * tablero.columnas);
    const clave = `${fila},${columna}`;

    if (!dentroDelTablero(tablero, fila, columna)) continue;
    if (ocupadas.has(clave)) continue;

    ocupadas.add(clave);
    posiciones.push({ fila, columna });
  }

  if (posiciones.length < cantidad) {
    throw new Error(
      `No se pudieron generar ${cantidad} casas sin superposición (se generaron ${posiciones.length}).`
    );
  }

  return posiciones;
}

/**
 * Coloca las casas generadas dentro del tablero (las escribe en `celdas`).
 */
function colocarCasasEnTablero(tablero, posiciones) {
  posiciones.forEach((pos, indice) => {
    tablero.celdas[pos.fila][pos.columna] = { tipo: "casa", id: indice };
  });
  return tablero;
}

module.exports = {
  crearGeneradorAleatorio,
  generarCasas,
  colocarCasasEnTablero,
};
