// movimientos.js
// Calcula los movimientos válidos para una ficha ubicada en una posición dada.

const { dentroDelTablero, obtenerCelda } = require("./tablero");

// Direcciones ortogonales: arriba, abajo, izquierda ó derecha.
// Si en algún momento se quisiera permitir movimientos diagonales, se podrían agregar aquí.
const DIRECCIONES = [
  { nombre: "arriba", df: -1, dc: 0 },
  { nombre: "abajo", df: 1, dc: 0 },
  { nombre: "izquierda", df: 0, dc: -1 },
  { nombre: "derecha", df: 0, dc: 1 },
];

/**
 * Calcula los movimientos válidos para la ficha ubicada en (fila, columna).
 *
 * Reglas aplicadas:
 *  - El movimiento debe mantenerse dentro del tablero.
 *  - La celda destino debe estar vacía O ser una "casa" (se permite pisarla).
 *  - No se puede mover a una celda ocupada por otra ficha (propia o rival).
 *
 * @returns {Array<{fila: number, columna: number, direccion: string}>}
 */
function calcularMovimientosValidos(tablero, fila, columna) {
  const origen = obtenerCelda(tablero, fila, columna);

  if (!origen || origen.tipo !== "ficha") {
    throw new Error(`No hay una ficha en la posición (${fila}, ${columna}).`);
  }

  const movimientos = [];

  for (const direccion of DIRECCIONES) {
    const nuevaFila = fila + direccion.df;
    const nuevaColumna = columna + direccion.dc;

    if (!dentroDelTablero(tablero, nuevaFila, nuevaColumna)) continue;

    const destino = obtenerCelda(tablero, nuevaFila, nuevaColumna);

    // Vacío o casa: movimiento permitido. Ocupado por ficha: bloqueado.
    if (destino === null || destino.tipo === "casa") {
      movimientos.push({
        fila: nuevaFila,
        columna: nuevaColumna,
        direccion: direccion.nombre,
      });
    }
  }

  return movimientos;
}

module.exports = {
  DIRECCIONES,
  calcularMovimientosValidos,
};
