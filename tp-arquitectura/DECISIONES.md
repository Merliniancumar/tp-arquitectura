# Registro de decisiones de modelado — Entrega 2

## 1. Representación del tablero
Se eligió representar el tablero como una matriz de 10x10 (array de arrays),
donde cada celda es `null` (vacía) o un objeto que describe su contenido
(`ficha` o `casa`). Se prefirió esta estructura sobre un array plano de 100
posiciones porque las coordenadas `{fila, columna}` son más, digamos, legibles, y se
corresponden directamente con el tablero físico armado en la primera tarea.

## 2. Identificación de fichas y casas
Cada ficha tiene `color` (blanco/negro) e `id` (0 a 4), y cada casa tiene un
`id` de 0 a 4. Esto permite distinguir individualmente cada elemento del
tablero, útil para futuras reglas ó modificaciones de la misma.

## 3. Generador determinista de casas
Se implementó un generador pseudoaleatorio propio (LCG - Linear Congruential
Generator) en lugar de usar `Math.random()`, porque `Math.random()` no acepta
una semilla, y, por lo tanto, no es reproducible. Con una semilla fija, el LCG
genera siempre la misma secuencia de números, lo cual permite:
- Reproducir el mismo tablero para comparar resultados entre compañeros.
- Escribir pruebas automatizadas en el futuro (Jest) que verifiquen
  comportamientos específicos sobre un tablero conocido.

Se decidió evitar que las casas se generen sobre celdas ya ocupadas por
fichas, y se incluyó una salvaguarda de intentos máximos para prevenir un
bucle infinito en caso de que el tablero estuviera casi lleno.

## 4. Movimientos válidos
Se definieron movimientos ortogonales (arriba, abajo, izquierda ó derecha),
descartando diagonales por el momento, en línea con el diseño simple
mostrado en la primera tarea. Una celda vacía o una "casa" se consideran destinos
válidos; una celda con otra ficha bloquea el movimiento. Esta regla se podrá
ampliar en futuras entregas (por ejemplo, agregando captura de fichas
rivales).

## 5. Separación en módulos
Se dividió el código en tres módulos independientes (`tablero.js`,
`casas.js`, `movimientos.js`) en lugar de un solo archivo, para que cada uno
tenga una responsabilidad clara y sea más fácil de probar por separado con
Jest en una entrega posterior.
