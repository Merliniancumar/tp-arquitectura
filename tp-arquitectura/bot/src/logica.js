// logica.js
// Lógica de decisión del bot: dado un estado, elige qué ficha mover y
// hacia qué dirección. Es DETERMINISTA: ante el mismo estado, siempre
// devuelve exactamente la misma decisión (no usa Math.random ni nada
// dependiente del reloj).

const DIRECCIONES = ["arriba", "abajo", "izquierda", "derecha"];

/**
 * Devuelve true si la celda (fila, columna) está libre: no hay ninguna
 * ficha de `fichas` ubicada ahí. (Las casas no bloquean el movimiento.)
 */
function celdaLibre(fichas, fila, columna) {
  return !fichas.some((f) => f.fila === fila && f.columna === columna);
}

/**
 * Calcula los movimientos ortogonales válidos para una ficha dada,
 * dentro de un tablero de `filas` x `columnas`.
 */
function movimientosValidos(ficha, fichas, filas = 10, columnas = 10) {
  const deltas = [
    { direction: "arriba", df: -1, dc: 0 },
    { direction: "abajo", df: 1, dc: 0 },
    { direction: "izquierda", df: 0, dc: -1 },
    { direction: "derecha", df: 0, dc: 1 },
  ];

  const validos = [];
  for (const delta of deltas) {
    const nuevaFila = ficha.fila + delta.df;
    const nuevaColumna = ficha.columna + delta.dc;

    const dentroDelTablero =
      nuevaFila >= 0 && nuevaFila < filas && nuevaColumna >= 0 && nuevaColumna < columnas;

    if (dentroDelTablero && celdaLibre(fichas, nuevaFila, nuevaColumna)) {
      validos.push(delta.direction);
    }
  }
  return validos;
}

/**
 * Decide el movimiento del bot para el estado dado.
 *
 * Estrategia determinista y simple (versión 0.1):
 *  1. Tomar las fichas propias (del color indicado en `estado.turno`),
 *     ordenadas por `id` ascendente, para que el orden sea siempre igual.
 *  2. Para cada ficha, en ese orden, calcular sus movimientos válidos.
 *  3. Elegir la PRIMERA ficha que tenga al menos un movimiento válido,
 *     y de sus direcciones válidas, elegir siempre la primera según el
 *     orden fijo DIRECCIONES (arriba, abajo, izquierda, derecha).
 *
 * @returns {{ pieceId: number, direction: string }}
 */
function decidirMovimiento(estado) {
  const { turno, fichas } = estado;

  const fichasPropias = fichas
    .filter((f) => f.color === turno)
    .sort((a, b) => a.id - b.id);

  for (const ficha of fichasPropias) {
    const disponibles = movimientosValidos(ficha, fichas);
    if (disponibles.length === 0) continue;

    // Elegir siempre la dirección de menor prioridad en DIRECCIONES,
    // para que la decisión sea 100% reproducible.
    const direccionElegida = DIRECCIONES.find((d) => disponibles.includes(d));

    return { pieceId: ficha.id, direction: direccionElegida };
  }

  throw new Error(`Ninguna ficha del color '${turno}' tiene movimientos válidos.`);
}

module.exports = {
  DIRECCIONES,
  movimientosValidos,
  decidirMovimiento,
};