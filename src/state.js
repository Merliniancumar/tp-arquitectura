export const SIZE = 10;
const PIECE_ID = /^[AB][1-9]\d*$/;

/**
 * Valida el estado que llega en el body de POST /move.
 *
 * El JSON externo no es confiable hasta pasar por esta función. Si devuelve
 * true, el resto del bot puede asumir que el tablero tiene 10 filas de 10
 * columnas, que el dado está entre 1 y 3 y que las casillas son válidas.
 */
export function isState(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

  if (value.jugador !== "A" && value.jugador !== "B") return false;
  if (
    typeof value.dado !== "number" ||
    !Number.isInteger(value.dado) ||
    value.dado < 1 ||
    value.dado > 3
  ) {
    return false;
  }

  if (!Array.isArray(value.tablero) || value.tablero.length !== SIZE) return false;

  const ids = new Set();
  for (const row of value.tablero) {
    if (!Array.isArray(row) || row.length !== SIZE) return false;

    for (const cell of row) {
      if (typeof cell !== "string") return false;
      if (cell === "" || cell === "N") continue;

      // Una casilla con ficha debe ser un ID como A1 o B2.
      if (!PIECE_ID.test(cell)) return false;

      // El árbitro no envía IDs repetidos; rechazarlos evita ambigüedad.
      if (ids.has(cell)) return false;
      ids.add(cell);
    }
  }

  return true;
}
