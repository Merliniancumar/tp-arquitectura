# Comparativa: `npm install` vs `npm ci`

## Procedimiento realizado

1. Se instaló el proyecto normalmente con `npm install`, generando
   `node_modules/` y `package-lock.json`.
2. Se hizo una **copia limpia** del proyecto (sin `node_modules/`) para
   simular, por ejemplo, el entorno de otra persona que clona el repositorio
   o un pipeline de CI.
3. Sobre esa copia limpia se probó primero `npm install` y luego `npm ci`.
4. Para hacer visible la diferencia real, se modificó el `package.json` a
   mano (se agregó una dependencia nueva, `lodash`) **sin** volver a correr
   `npm install`, de modo que quedó desincronizado respecto al
   `package-lock.json` existente. Esto simula un error común: alguien edita
   el `package.json` directamente, o hace merge de dos ramas con
   dependencias distintas, y se olvida de regenerar el lock file.

## Resultado 1: con `package.json` y `package-lock.json` sincronizados

| Comando | Resultado |
|---|---|
| `npm install` | Instala correctamente. Puede modificar el `package-lock.json` si detecta cualquier margen de actualización permitido por los rangos de versión (`^`). |
| `npm ci` | Instala correctamente. Borra `node_modules/` antes de instalar (instalación limpia) e instala **exactamente** las versiones que indica el lock file, sin modificarlo. |

## Resultado 2: con `package.json` desincronizado del lock file

Se agregó `"lodash": "^4.17.21"` al `package.json` sin actualizar el lock.

**`npm ci` → FALLA:**




**`npm install` → FUNCIONA:**
Instala sin problema y **actualiza automáticamente** el `package-lock.json`
agregando la entrada de `lodash` que faltaba.

## Conclusión

| Aspecto | `npm install` | `npm ci` |
|---|---|---|
| Lee el lock file | Sí, pero puede modificarlo | Sí, de forma estricta |
| Modifica `package-lock.json` | Puede hacerlo | Nunca lo modifica |
| Si hay desincronización con `package.json` | Lo resuelve e instala | **Falla con error** |
| Borra `node_modules/` antes de instalar | No necesariamente | Sí, siempre |
| Uso recomendado | Desarrollo local, cuando se agregan/cambian dependencias | Entornos de CI/CD y producción, donde se necesita una instalación 100% reproducible |

En resumen: `npm install` es flexible y conveniente para el día a día de
desarrollo, porque puede ajustar el lock file si hace falta. `npm ci` es
más estricto y rápido/seguro para automatización (pipelines de CI, Docker,
despliegues), porque garantiza que todos instalen exactamente las mismas
versiones y falla de forma explícita si algo no está sincronizado, en lugar
de "arreglarlo" silenciosamente.