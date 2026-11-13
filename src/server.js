import { app } from "./app.js";

// PORT permite cambiar el puerto sin tocar el código. En desarrollo usamos
// 3000, que es el mismo valor que aparece en la documentación del árbitro.
const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Bot TP Arquitectura escuchando en http://localhost:${port}`);
});
