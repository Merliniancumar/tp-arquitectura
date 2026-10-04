// modelo.js
// Punto de entrada para ver el modelo del tablero, las casas y los
// movimientos válidos. Esto se va a ejecutar con: node modelo.js [semilla]

const { crearTableroInicial, imprimirTablero } = require("./src/tablero");
const { generarCasas, colocarCasasEnTablero } = require("./src/casas");
const { calcularMovimientosValidos } = require("./src/movimientos");

function ejecutarEjemplo(semilla) {
  console.log(`\n========== Ejemplo con semilla = ${semilla} ==========\n`);

  // 1. Estado inicial del tablero
  const tablero = crearTableroInicial();

  // 2. Generación determinista de casas
  const posicionesCasas = generarCasas(tablero, semilla, 5);
  colocarCasasEnTablero(tablero, posicionesCasas);

  console.log("Tablero generado:");
  console.log(imprimirTablero(tablero));

  console.log("Posiciones de las casas:", posicionesCasas);

  // 3. Movimientos válidos de la primera ficha blanca (fila 0, columna 0)
  const movimientos = calcularMovimientosValidos(tablero, 0, 0);
  console.log("\nMovimientos válidos de la ficha blanca en (0,0):");
  console.log(movimientos);
}

// Tomamos la semilla desde process.argv, o usamos 42 por defecto.
const semillaArgumento = process.argv[2];
const semilla = semillaArgumento ? Number(semillaArgumento) : 42;

ejecutarEjemplo(semilla);
