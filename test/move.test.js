import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { expect, test } from "@jest/globals";
import { app } from "../src/app.js";
import { isState } from "../src/state.js";
import { chooseMove } from "../src/strategy.js";

function cargarFixture(nombre) {
  const ruta = new URL(`../fixtures/${nombre}.json`, import.meta.url);
  return JSON.parse(readFileSync(ruta, "utf8"));
}

const state1 = cargarFixture("state1");
const state2 = cargarFixture("state2");
const state3 = cargarFixture("state3");

test("acepta los fixtures válidos y rechaza estados fuera del contrato", () => {
  expect(isState(state1)).toBe(true);
  expect(isState(state2)).toBe(true);
  expect(isState(state3)).toBe(true);

  const rowIncompleta = structuredClone(state1);
  rowIncompleta.tablero[0].pop();
  const tableroIncompleto = structuredClone(state1);
  tableroIncompleto.tablero.pop();
  const celdaInvalida = structuredClone(state1);
  celdaInvalida.tablero[0][0] = "X1";
  const idRepetido = structuredClone(state1);
  idRepetido.tablero[0][1] = "A1";

  for (const invalido of [
    null,
    [],
    {},
    { ...state1, jugador: "C" },
    { ...state1, dado: 0 },
    { ...state1, dado: 4 },
    { ...state1, dado: 1.5 },
    { ...state1, dado: "3" },
    { ...state1, tablero: null },
    tableroIncompleto,
    rowIncompleta,
    celdaInvalida,
    idRepetido,
  ]) {
    expect(isState(invalido)).toBe(false);
  }
});

test("mueve todas las fichas propias y no modifica el estado", () => {
  const original1 = structuredClone(state1);
  const original2 = structuredClone(state2);

  expect(chooseMove(state1)).toEqual({ A1: "N" });
  expect(chooseMove({ ...state1, jugador: "B" })).toEqual({ B2: "E" });
  expect(chooseMove(state2)).toEqual({ B1: "E", B2: "N" });
  expect(chooseMove({ ...state2, jugador: "A" })).toEqual({ A1: "O", A2: "N" });

  expect(state1).toEqual(original1);
  expect(state2).toEqual(original2);
});

test("evita que dos fichas terminen en la misma casilla", () => {
  const movimientos = chooseMove(state3);

  expect(movimientos).toEqual({ A1: "E", A2: "N" });
  expect(Object.keys(movimientos)).toHaveLength(2);

  // Ambas fichas se mueven exactamente dos casillas desde su posición.
  const destinos = [
    [0, 0],
    [0, 4],
  ].map(([fila, columna], indice) => {
    const direccion = movimientos[indice === 0 ? "A1" : "A2"];
    const delta = { N: [-1, 0], E: [0, 1], S: [1, 0], O: [0, -1] }[direccion];
    return [
      (fila + delta[0] * state3.dado + 10) % 10,
      (columna + delta[1] * state3.dado + 10) % 10,
    ];
  });

  expect(new Set(destinos.map(([fila, columna]) => `${fila},${columna}`)).size).toBe(2);
  expect(destinos).toContainEqual([0, 2]); // Una ficha conquista la casa neutral.
});

test("devuelve un objeto vacío si el jugador no tiene fichas", () => {
  const sinFichas = structuredClone(state1);
  sinFichas.tablero.forEach((fila) => fila.fill(""));
  sinFichas.tablero[0][0] = "N";

  expect(chooseMove(sinFichas)).toEqual({});
});

test("POST /move valida el estado y devuelve un diccionario", async () => {
  await conServidor(async (url) => {
    const post = (body) =>
      fetch(`${url}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: typeof body === "string" ? body : JSON.stringify(body),
      });

    const respuestaA = await post(state1);
    expect(respuestaA.status).toBe(200);
    expect(await respuestaA.json()).toEqual({ A1: "N" });

    const respuestaB = await post({ ...state1, jugador: "B" });
    expect(respuestaB.status).toBe(200);
    expect(await respuestaB.json()).toEqual({ B2: "E" });

    const tableroIncompleto = structuredClone(state1);
    tableroIncompleto.tablero.pop();
    const celdaInvalida = structuredClone(state1);
    celdaInvalida.tablero[0][0] = null;

    for (const invalido of [
      null,
      {},
      { ...state1, jugador: "C" },
      ...[0, 4, 1.5, "3"].map((dado) => ({ ...state1, dado })),
      { ...state1, tablero: null },
      tableroIncompleto,
      celdaInvalida,
    ]) {
      expect((await post(invalido)).status).toBe(400);
    }

    // Un body que ni siquiera tiene sintaxis JSON válida también es 400.
    expect((await post("{invalid")).status).toBe(400);

    // Un body demasiado grande se rechaza antes de llegar al handler.
    const enorme = JSON.stringify({ relleno: "x".repeat(70 * 1024) });
    expect((await post(enorme)).status).toBe(413);

    // Una ruta desconocida devuelve JSON y no HTML de Express.
    const inexistente = await fetch(`${url}/ruta-inexistente`);
    expect(inexistente.status).toBe(404);
    expect(await inexistente.json()).toEqual({ error: "Ruta no encontrada." });
  });
});

test("GET / permite comprobar que la función está desplegada", async () => {
  await conServidor(async (url) => {
    const response = await fetch(`${url}/`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      name: "Bot TP Arquitectura",
      status: "ok",
      endpoints: ["GET /profile", "POST /move"],
    });
  });
});

test("GET /profile devuelve exactamente el perfil público del bot", async () => {
  await conServidor(async (url) => {
    const response = await fetch(`${url}/profile`);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/^application\/json\b/);
    expect(await response.json()).toEqual({
      name: "Bot TP Arquitectura",
      colors: ["#0B3D91", "#F4C430", "#0B3D91"],
    });
  });
});

async function conServidor(callback) {
  // El puerto 0 solicita un puerto libre para no chocar con otro proceso.
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));

  const address = server.address();
  assert.ok(address && typeof address !== "string");

  try {
    return await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}
