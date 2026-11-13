const SIZE = 10;
const CAPTURE_BONUS = 1000;
const MAX_SEARCH_NODES = 500_000;

// Orden fijo de direcciones. Se usa también para desempatar de forma
// determinista: ante dos jugadas con el mismo puntaje gana la primera.
export const DIRECTIONS = Object.freeze([
  { name: "N", row: -1, column: 0 },
  { name: "E", row: 0, column: 1 },
  { name: "S", row: 1, column: 0 },
  { name: "O", row: 0, column: -1 },
]);

function wrap(value) {
  return ((value % SIZE) + SIZE) % SIZE;
}

function cellKey(row, column) {
  return `${row},${column}`;
}

function toroidalDistance(rowA, columnA, rowB, columnB) {
  const rowDistance = Math.abs(rowA - rowB);
  const columnDistance = Math.abs(columnA - columnB);
  return (
    Math.min(rowDistance, SIZE - rowDistance) +
    Math.min(columnDistance, SIZE - columnDistance)
  );
}

function distanceToNearestHouse(row, column, houses) {
  if (houses.length === 0) return 0;

  let nearest = Infinity;
  for (const house of houses) {
    nearest = Math.min(
      nearest,
      toroidalDistance(row, column, house.row, house.column),
    );
  }
  return nearest;
}

function buildCandidates(state, piece, houses, occupiedByRival) {
  return DIRECTIONS.map((direction, order) => {
    // El árbitro usa un tablero toroidal: salir por un borde entra por el
    // borde opuesto. Por eso usamos el módulo en lugar de descartar la jugada.
    const row = wrap(piece.row + direction.row * state.dado);
    const column = wrap(piece.column + direction.column * state.dado);
    const cell = state.tablero[row][column];
    const captures = cell === "N";

    return {
      direction: direction.name,
      row,
      column,
      order,
      score:
        (captures ? CAPTURE_BONUS : 0) -
        distanceToNearestHouse(row, column, houses),
    };
  })
    .filter((candidate) => !occupiedByRival.has(cellKey(candidate.row, candidate.column)))
    .sort((a, b) => b.score - a.score || a.order - b.order);
}

function pieceNumber(id) {
  return Number(id.slice(1));
}

/**
 * Elige una dirección para cada ficha propia.
 *
 * Reglas del árbitro que respeta esta estrategia:
 *  - Todas las fichas propias se mueven exactamente `dado` casillas.
 *  - El movimiento es ortogonal (N, E, S u O).
 *  - No se puede terminar sobre una ficha rival.
 *  - Dos fichas no pueden terminar en la misma casilla.
 *  - Se puede atravesar fichas y se permite el intercambio de posiciones.
 *
 * La búsqueda prioriza conquistar casas neutrales y, si no es posible,
 * acercarse a la casa más cercana. Es determinista: el mismo estado siempre
 * produce la misma respuesta.
 */
export function chooseMove(state) {
  const ownPieces = [];
  const occupiedByRival = new Set();
  const houses = [];

  for (let row = 0; row < SIZE; row += 1) {
    for (let column = 0; column < SIZE; column += 1) {
      const cell = state.tablero[row][column];

      if (cell === "N") {
        houses.push({ row, column });
      } else if (cell !== "") {
        if (cell.startsWith(state.jugador)) {
          ownPieces.push({ id: cell, row, column });
        } else {
          occupiedByRival.add(cellKey(row, column));
        }
      }
    }
  }

  // Sin fichas propias, la respuesta correcta es un diccionario vacío.
  if (ownPieces.length === 0) return {};

  const pieces = ownPieces.map((piece) => ({
    id: piece.id,
    candidates: buildCandidates(state, piece, houses, occupiedByRival),
  }));

  // Primero las fichas con menos opciones: reduce el espacio de búsqueda.
  pieces.sort(
    (a, b) =>
      a.candidates.length - b.candidates.length ||
      pieceNumber(a.id) - pieceNumber(b.id),
  );

  // Cota superior optimista para podar la búsqueda.
  const suffixMax = new Array(pieces.length + 1).fill(0);
  for (let index = pieces.length - 1; index >= 0; index -= 1) {
    const bestCandidate = pieces[index].candidates[0];
    suffixMax[index] = suffixMax[index + 1] + (bestCandidate ? bestCandidate.score : 0);
  }
  const upperBound = suffixMax[0];

  let best = null;
  let bestScore = -Infinity;
  let visitedNodes = 0;
  const usedDestinations = new Set();
  const currentMoves = {};

  function search(index, score) {
    if (bestScore === upperBound) return;
    if (score + suffixMax[index] <= bestScore) return;
    if (visitedNodes >= MAX_SEARCH_NODES) return;
    visitedNodes += 1;

    if (index === pieces.length) {
      if (score > bestScore) {
        bestScore = score;
        best = { ...currentMoves };
      }
      return;
    }

    const piece = pieces[index];
    for (const candidate of piece.candidates) {
      const destination = cellKey(candidate.row, candidate.column);
      if (usedDestinations.has(destination)) continue;

      usedDestinations.add(destination);
      currentMoves[piece.id] = candidate.direction;

      search(index + 1, score + candidate.score);

      delete currentMoves[piece.id];
      usedDestinations.delete(destination);
    }
  }

  search(0, 0);
  if (best) return best;

  // Si no existe una jugada válida para todas las fichas, devolvemos la
  // mejor aproximación posible. El árbitro la rechazará, pero el bot siempre
  // responde con todas sus fichas y no deja el turno sin contestar.
  const fallback = {};
  const fallbackDestinations = new Set();
  for (const piece of pieces) {
    const candidate =
      piece.candidates.find(
        (option) => !fallbackDestinations.has(cellKey(option.row, option.column)),
      ) ?? piece.candidates[0];

    if (candidate) {
      fallback[piece.id] = candidate.direction;
      fallbackDestinations.add(cellKey(candidate.row, candidate.column));
    } else {
      fallback[piece.id] = DIRECTIONS[0].name;
    }
  }

  return fallback;
}
