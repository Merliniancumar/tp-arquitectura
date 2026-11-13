# Bot TP Arquitectura

Bot HTTP para el juego de casas. Está preparado para conectarse al árbitro de la materia (`arbitro-casas`) y sigue el mismo contrato que el bot de ejemplo del profesor: `GET /profile` y `POST /move`.

Está hecho en **JavaScript puro**, sin TypeScript y sin paso de compilación. La idea es que se pueda clonar y ejecutar directamente desde **CMD en Windows** con `npm install` y `npm start`.

## Requisitos

- Node.js 22 o posterior.
- npm (viene incluido con Node.js).

Para comprobar las versiones:

```bat
node --version
npm --version
```

## Cómo ejecutarlo desde CMD (Windows)

```bat
git clone https://github.com/Merliniancumar/tp-arquitectura.git
cd tp-arquitectura
npm install
npm start
```

Tiene que aparecer este mensaje:

```text
Bot TP Arquitectura escuchando en http://localhost:3000
```

No hace falta ejecutar `npm run build` ni configurar variables de entorno. Para detener el servidor: `Ctrl+C`.

> Si PowerShell bloquea `npm.ps1`, usá `npm.cmd start` o abrí una consola **Símbolo del sistema (CMD)**.

### Desarrollo con reinicio automático

```bat
npm run dev
```

Este comando reinicia el bot cuando se modifica un archivo de `src/`.

### Cambiar el puerto

En CMD:

```bat
set PORT=3001
npm start
```

En PowerShell:

```powershell
$env:PORT=3001
npm start
```

## Cómo conectarlo al árbitro

1. Abrí una terminal y ejecutá este bot con `npm start`.
2. Abrí otra terminal, entrá a la carpeta del árbitro (`arbitro-casas`) y ejecutalo con `npm start`.
3. En la interfaz del árbitro elegí **Bot** y usá esta URL:

```text
http://localhost:3000/move
```

El árbitro también consulta `GET /profile` en el mismo origen para mostrar el nombre y los colores del bot.

## Contrato del bot

### `GET /profile`

Respuesta:

```json
{
  "name": "Bot TP Arquitectura",
  "colors": ["#0B3D91", "#F4C430", "#0B3D91"]
}
```

Deben ser exactamente tres colores hexadecimales.

### `POST /move`

El árbitro envía el estado del juego:

```json
{
  "jugador": "A",
  "dado": 2,
  "tablero": [
    ["", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", ""],
    ["", "", "A1", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "B2", "", ""],
    ["", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", ""]
  ]
}
```

Cada casilla puede ser:

- `""`: vacía.
- `"N"`: casa neutral.
- `"A1"`, `"A2"`, `"B1"`, etc.: ficha de un jugador.

El bot responde con una dirección para **todas** sus fichas:

```json
{
  "A1": "N",
  "A2": "O"
}
```

Direcciones permitidas: `N` (norte), `E` (este), `S` (sur), `O` (oeste).

Si el estado no cumple el contrato, el bot responde HTTP `400` con un mensaje de error. Si el JSON está mal formado, también responde `400`.

### Probar el endpoint a mano

Con `curl`:

```bash
curl -X POST "http://localhost:3000/move" \
  -H "Content-Type: application/json" \
  --data @fixtures/state1.json
```

En PowerShell:

```powershell
$estado = Get-Content -Raw fixtures/state1.json
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/move" `
  -ContentType "application/json" `
  -Body $estado
```

Respuesta esperada para `fixtures/state1.json`:

```json
{"A1":"N"}
```

También podés probar el perfil:

```bash
curl http://localhost:3000/profile
```

## Pruebas

```bat
npm test
```

Las pruebas usan Jest y cubren:

- validación del estado;
- la estrategia con distintos tableros;
- que se muevan todas las fichas propias;
- que no haya dos fichas en la misma casilla;
- el endpoint `POST /move` (éxito y errores `400`);
- el endpoint `GET /profile`.

Otros comandos:

```bat
npm run test:watch
npm run test:coverage
```

## Estrategia del bot

La estrategia es determinista: ante el mismo estado siempre devuelve la misma jugada.

1. Detecta las fichas propias, las fichas rivales y las casas neutrales.
2. Para cada ficha propia calcula las cuatro direcciones posibles, moviéndose exactamente la cantidad indicada por el dado.
3. Descarta los destinos ocupados por fichas rivales.
4. Busca una combinación en la que ninguna ficha propia termine en la misma casilla que otra.
5. Prioriza conquistar una casa neutral. Si no puede, elige el destino que quede más cerca de alguna casa.
6. Si hay empate, respeta el orden fijo `N`, `E`, `S`, `O`.

El tablero se trata como **toroidal**, igual que el motor del árbitro: si una ficha sale por un borde, entra por el borde opuesto.

## Estructura del proyecto

```text
tp-arquitectura/
├── api/
│   └── index.js          # Entrada para Vercel (serverless)
├── fixtures/
│   ├── state1.json
│   ├── state2.json
│   └── state3.json
├── src/
│   ├── app.js            # Aplicación Express y rutas
│   ├── move.js           # Handler de POST /move
│   ├── server.js         # Arranque local (app.listen)
│   ├── state.js          # Validación del estado recibido
│   └── strategy.js       # Lógica que elige los movimientos
├── test/
│   └── move.test.js
├── jest.config.js
├── package.json
└── vercel.json
```

`src/app.js` no llama a `listen`: eso permite reutilizar la misma aplicación en las pruebas, en el servidor local y en Vercel. `src/server.js` es el único archivo que abre el puerto.

## Despliegue en Vercel (opcional)

El proyecto ya incluye:

- `api/index.js`, que exporta la aplicación sin abrir un puerto;
- `vercel.json`, que redirige todas las rutas a la función;
- un workflow de GitHub Actions en `.github/workflows/ci-cd.yml`.

Para desplegar desde GitHub Actions hay que configurar estos secretos en el repositorio:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

El workflow ejecuta `npm ci` y `npm test` antes de desplegar. Si las pruebas fallan, no se publica nada. Si los secretos de Vercel todavía no están configurados, el job de despliegue se omite y el CI sigue en verde.

## Sobre esta versión

La versión anterior era un script de consola que recibía un archivo JSON por parámetro y no exponía un servidor HTTP. El árbitro espera un bot HTTP, así que esta versión:

- se ejecuta con `npm start` desde la raíz del repositorio;
- no necesita compilación;
- implementa `GET /profile` y `POST /move`;
- valida el estado y responde `400` ante errores;
- mueve todas las fichas propias y evita colisiones.
