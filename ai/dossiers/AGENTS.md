# Flujo de dossiers de género

Estás en `ai/dossiers`. Tu trabajo es convertir un género musical en una **especificación compositiva válida para Chiptune Studio**. No compongas canciones completas aquí.

## Archivos que debes leer al empezar

1. `../APP-CONTRACT-QUICK.md` — resumen operativo de la app. Si falta un detalle, lee `../APP-CONTRACT.md`.
2. `WORKFLOW.md` — el proceso completo.
3. `SPEC-SCHEMA.md` — campos y valores válidos del spec.
4. `index.json` — estado del catálogo.
5. `inbox/<genero>.md` — la investigación cruda del género de esta sesión.

No leas `RESEARCH-PROMPT.md`: es para el humano. No leas todos los dossiers de `library/` ni los catálogos de `ai/song-maker/data/`. Si necesitas una referencia, lee solo la que el usuario nombre.

## Disparador de sesión

El humano dirá algo como:

> Hoy trataremos de implementar el género bolero mexicano en Chiptune Studio.

Si no existe `inbox/bolero-mexicano.md`, pide que ejecute `RESEARCH-PROMPT.md` y guarde la salida con ese nombre. No inventes la investigación.

## Proceso obligatorio

1. **Leer la investigación cruda.** Separa hechos verificados, inferencias, opiniones y huecos. Anota los huecos en `openQuestions`.
2. **Validar fuentes.** Cada afirmación importante debe tener fuente con URL o ISBN. Si no la tiene, bájala a `confidence` o a `openQuestions`.
3. **Extraer el spec.** Del bloque `json` del dossier, obtén el objeto `chiptune-genre-spec@1`.
4. **Traducir a la app.**
   - Usa solo ids de instrumentos, efectos, escalas y compases de `APP-CONTRACT.md`.
   - Convierte instrumentos reales a roles de la app (`lead`, `bass`, `harmony`, `rhythm`, `texture`, `drums`, `ornament`).
   - Ajusta rangos: no pidas un chelo en C2 si el instrumento elegido no llega.
   - Si el género usa un compás que la app no tiene, elige el más cercano y escribe el workaround.
   - Si el género depende de samples, voces o microtonalidad, dilo y propón una traducción.
5. **Curar el dossier.** Escribe `library/<slug>/DOSSIER.md` y `library/<slug>/SPEC.json`.
   - No copies la investigación cruda tal cual: ordénala, corrige errores y marca confianza.
   - El dossier final debe ser útil para componer, no un ensayo.
6. **Validar.**
   ```bash
   node ../../tools/dossier.js check library/<slug>/DOSSIER.md
   node ../../tools/dossier.js index
   ```
   Corrige todos los errores.
7. **Prueba mínima.** Si el spec está completo, crea `library/<slug>/TEST.json`: 8–16 compases que demuestren el groove, la instrumentación y el silencio del género. No es una canción final.
   ```bash
   node ../../tools/ai-compose.js check library/<slug>/TEST.json
   node ../../tools/check-demo.js library/<slug>/TEST.json
   ```
   Para escucharlo, usa **Menú → Abrir JSON** y elige `TEST.json`; no lo dejes en `demos/`. Si la prueba falla, corrige el spec, no maquilles el test.
8. **Estado.**
   - `draft`: dossier y spec existen, pero no hay prueba.
   - `tested`: hay `TEST.json` que pasa las validaciones.
   - `validated`: el humano escuchó y reconoce el género.
   Solo el humano puede pasar a `validated`. No te autoproclames.
9. **Cierre.** Actualiza `sessions/STATE.md` y ejecuta `node ../../tools/dossier.js index`. Eso actualiza `index.json` y el catálogo que consume song-maker (`ai/song-maker/data/dossiers.json`).

## Reglas duras

- No inventes instrumentos, efectos, escalas, compases ni capacidades.
- No copies melodías, riffs, progresiones ni arreglos de obras existentes.
- No uses el nombre de un artista vivo ni de una obra existente como reclamo del producto.
- No confundas “investigación” con “dossier”: el dossier es una herramienta de composición.
- No llenes `index.json` a mano si puedes usar `node ../../tools/dossier.js index`.
- No marques `validated` sin escucha humana.
- No borres `inbox/` después de promover: es la trazabilidad de la investigación.

## Entrega

Incluye:

- Qué género y qué célula se trabajó.
- Qué se corrigió respecto a la investigación cruda.
- Qué limitaciones de la app aparecieron y su workaround.
- Comandos ejecutados y resultado.
- Qué falta escuchar o validar.
- Ruta del dossier, spec y test.
