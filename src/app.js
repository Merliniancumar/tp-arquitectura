import express from "express";
import { move } from "./move.js";

// Creamos la aplicación sin abrir un puerto; así también se puede usar en
// pruebas y en Vercel, donde la plataforma administra el servidor HTTP.
export const app = express();

app.disable("x-powered-by");

// Interpreta los cuerpos con Content-Type: application/json.
// Debe registrarse antes del endpoint para que req.body esté disponible.
app.use(express.json({ limit: "64kb" }));

// Perfil público del bot. El árbitro lo consulta antes de iniciar la partida.
app.get("/profile", (req, res) => {
  return res.status(200).json({
    name: "Bot TP Arquitectura",
    colors: ["#0B3D91", "#F4C430", "#0B3D91"],
  });
});

// El árbitro solicita una decisión enviando el estado mediante POST /move.
app.post("/move", move);

// Ruta desconocida: respondemos JSON para que el error sea fácil de leer.
app.use((req, res) => {
  return res.status(404).json({ error: "Ruta no encontrada." });
});

// Express reconoce los manejadores de errores por sus cuatro parámetros,
// aunque este manejador no necesite usar req ni next.
const errorHandler = (err, req, res, next) => {
  // Un JSON con sintaxis inválida falla en express.json(), antes de move().
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El body contiene JSON inválido." });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "El body es demasiado grande." });
  }

  const status = err.status || 500;
  return res.status(status).json({
    error: status === 500 ? "Error interno del bot." : "Solicitud inválida.",
  });
};

app.use(errorHandler);
