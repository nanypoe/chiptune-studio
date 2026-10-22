# Instrucciones para agentes

Chiptune Studio es una app estática para componer, aprender y exportar música chiptune. La IA trabaja en **dos flujos separados**. No los mezcles.

## 1. Dossiers de género — `ai/dossiers/`

Investiga un género, valida las fuentes, tradúcelo a las capacidades reales de la app y produce un `SPEC.json` y un `TEST.json` mínimo.

- Si la sesión empieza en `ai/dossiers`, lee `ai/dossiers/AGENTS.md`.
- El humano usa `ai/dossiers/RESEARCH-PROMPT.md`; la IA no lo lee como fuente.
- El humano deja la investigación en `ai/dossiers/inbox/<slug>.md`.
- El catálogo y los estados están en `ai/dossiers/index.json`.

## 2. Creación de canciones — `ai/song-maker/`

Compón canciones originales, profesionales y emocionalmente claras usando los specs validados del flujo anterior.

- Si la sesión empieza en `ai/song-maker`, lee `ai/song-maker/AGENTS.md`.
- No investigues géneros aquí: si falta un spec, abre una sesión de dossiers.
- El brief, el plan, la forma, la densidad y el silencio mandan sobre el género.

## Contrato de la app

`ai/APP-CONTRACT.md` es la fuente única de límites, formato, instrumentos, registros, efectos, escalas y recursos expresivos. Si algo no está ahí o en el código, no existe.

## Reglas duras

- Formato `chiptune-studio`, versión `2`.
- 1–12 pistas, 1–64 compases, 40–240 BPM.
- Un solo `timeSig` por canción. Pasos: 4/4=16, 3/4=12, 2/4=8, 5/4=20, 6/8=12, 12/8=24, 7/8=14.
- Solo instrumentos, efectos, escalas y capacidades reales. No hay samples, VST ni audio externo.
- Si declaras `key`/`scale`, las notas deben ser coherentes.
- Respeta el registro de cada instrumento.
- `tempo` usa `bar >= 1`; el compás 1 usa `bpm`.
- `loopStart` es 0-based y debe quedar dentro de la canción.
- No entregues una canción sin `check` y sin escucharla.
- No marques un género `validated` sin escucha humana.

## Originalidad

- Las influencias se traducen a rasgos abstractos: tempo, textura, instrumentación, lenguaje armónico, forma, actitud.
- No copies melodías, riffs, progresiones exactas, arreglos, letras ni samples.
- Cambia al menos dos dimensiones respecto a cada influencia principal.
- Escribe un motivo propio de 3–5 notas y hazlo reconocible.
- No uses el nombre de un artista vivo ni de una obra existente como reclamo del producto.
- Si el brief pide “igual que X”, ofrece una alternativa original; no clones.

## Convenciones del repositorio

- La app debe seguir funcionando con `file://` y sin compilación: scripts clásicos, sin módulos ES.
- No añadas dependencias externas sin necesidad.
- `demos/*.json` se detectan automáticamente. `demos/index.json` y `demos/demos.js` son generados por `node tools/build-demos.js`.
- `ai/song-maker/data/genres.json` es generado por `node tools/build-genres.js` desde `ai/song-maker/data/genres/`. No lo edites a mano.
- `ai/dossiers/index.json` se regenera con `node tools/dossier.js index`.
- Mantén los cambios pequeños y coherentes con el estilo del archivo.
- No borres ni sobrescribas trabajo del usuario sin investigarlo antes.

## Pruebas

Antes de dar por terminado un cambio:

```bash
node --check tools/ai-compose.js
node --check tools/dossier.js
node --check tools/song-summary.js
node --check src/song/song.js
node --check src/ui/app.js
node tools/build-genres.js
node tools/dossier.js index
node tools/check-demo.js
```

Si el cambio toca la interfaz o la reproducción, abre la app con `node tools/serve.js` y prueba en el navegador: modos, botón Brief, carga/guardado de tonalidad, reproducción, loop, WAV y una demo.

## Entrega

Incluye:

- Qué cambió y por qué.
- Comandos ejecutados y resultado.
- Qué falta probar manualmente (escucha, mezcla, navegador).
- Si algo quedó sin commitear, dilo. No hagas commit salvo que se pida.
