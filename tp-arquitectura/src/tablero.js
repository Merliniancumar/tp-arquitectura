// tablero.js
// Este es el responsable de crear y representar el estado del tablero 10x10.

const FILAS = 10;
const COLUMNAS = 10;

/**
 * Crea el estado inicial del tablero.
 * Cada celda puede contener:
 *   null                -> celda vacía
 *   { tipo: 'ficha', color: 'blanco' | 'negro', id: number }
 *   { tipo: 'casa', id: number }
 *
 * Las fichas de cada jugador se colocan en su fila base (0 y 9),
 * en las primeras 5 columnas pares para dejarlas separadas.
 */
function crearTableroInicial() {
  const celdas = [];
  for (let fila = 0; fila < FILAS; fila++) {
    const filaCeldas = [];
    for (let columna = 0; columna < COLUMNAS; columna++) {
      filaCeldas.push(null);
    }
    celdas.push(filaCeldas);
  }

  // Colocar 5 fichas del jugador "blanco" en la fila 0
  for (let i = 0; i < 5; i++) {
    const columna = i * 2; // columnas 0,2,4,6,8
    celdas[0][columna] = { tipo: "ficha", color: "blanco", id: i };
  }

  // Colocar 5 fichas del jugador "negro" en la fila 9
  for (let i = 0; i < 5; i++) {
    const columna = i * 2;
    celdas[9][columna] = { tipo: "ficha", color: "negro", id: i };
  }

  return {
    filas: FILAS,
    columnas: COLUMNAS,
    celdas,
  };
}

/**
 * Devuelve true si la posición {fila, columna} está dentro del tablero.
 */
function dentroDelTablero(tablero, fila, columna) {
  return fila >= 0 && fila < tablero.filas && columna >= 0 && columna < tablero.columnas;
}

/**
 * Devuelve el contenido de una celda, o null si está vacía.
 */
function obtenerCelda(tablero, fila, columna) {
  if (!dentroDelTablero(tablero, fila, columna)) return undefined;
  return tablero.celdas[fila][columna];
}

/**
 * Representación en texto del tablero, útil para depurar por consola.
 * B = ficha blanca, N = ficha negra, C = casa, . = vacío
 */
function imprimirTablero(tablero) {
  let salida = "";
  for (let fila = 0; fila < tablero.filas; fila++) {
    let linea = "";
    for (let columna = 0; columna < tablero.columnas; columna++) {
      const celda = tablero.celdas[fila][columna];
      if (!celda) {
        linea += ". ";
      } else if (celda.tipo === "ficha") {
        linea += (celda.color === "blanco" ? "B" : "N") + " ";
      } else if (celda.tipo === "casa") {
        linea += "C ";
      }
    }
    salida += linea.trimEnd() + "\n";
  }
  return salida;
}

module.exports = {
  FILAS,
  COLUMNAS,
  crearTableroInicial,
  dentroDelTablero,
  obtenerCelda,
  imprimirTablero,
};
