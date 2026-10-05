// index.js
// Punto de entrada del bot v0.1.
//
// Uso:
//   node index.js <ruta-al-archivo-json-de-estado>
//
// Ejemplo:
//   node index.js fixtures/estado-ejemplo-1.json
//
// Eato devuelve por consola un JSON con la decisión del bot:
//   { "pieceId": 2, "direction": "derecha" }

const { leerEstadoDesdeArchivo } = require("./src/leerEstado");
const { decidirMovimiento } = require("./src/logica");

function main() {
  const rutaEstado = process.argv[2];

  try {
    const estado = leerEstadoDesdeArchivo(rutaEstado);
    const decision = decidirMovimiento(estado);
    console.log(JSON.stringify(decision));
  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  }
}

main();