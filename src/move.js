import { chooseMove } from "./strategy.js";
import { isState } from "./state.js";

/**
 * Handler de POST /move.
 *
 * Recibe el estado del juego, lo valida y devuelve una dirección para cada
 * ficha del jugador que tiene el turno.
 */
export function move(req, res) {
  const state = req.body;

  if (!isState(state)) {
    return res.status(400).json({
      error:
        'Estado inválido: se requiere jugador A o B, dado de 1 a 3 y tablero de 10x10 con "", "N" o piezas como A1/B1.',
    });
  }

  return res.json(chooseMove(state));
}
