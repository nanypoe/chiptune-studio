# Instrucciones para agentes

Este repositorio es Chiptune Studio: una app estática para componer, aprender y exportar música chiptune. La carpeta `ai/` convierte la app en una herramienta de composición asistida por IA. Si te piden una canción, un arreglo, un brief o una revisión, sigue este documento.

## Antes de componer

Lee, en este orden:

1. `ai/CORE.md` — límites, formato, instrumentos, batería, efectos, escalas, tempo, compás y loop.
2. `ai/COMPOSE.md` — método creativo.
3. `ai/GENRES.md` — familias, catálogo y fallback.
4. `ai/ORIGINALITY.md` — cómo usar influencias sin copiar.
5. `ai/CHECKLIST.md` — revisión final.

No inventes instrumentos, efectos, escalas ni capacidades. Si algo no está en `ai/CORE.md` o en el código, no existe para la app.

## Flujo obligatorio

1. **Leer el brief.** Separa hechos, emociones, función, influencias, restricciones y huecos. Anota los huecos en `assumptions`.
2. **Planificar.**
   ```bash
   node tools/ai-compose.js plan <brief> --out plan.json
   ```
   Revisa género/familia, forma, tonalidad/modo, compás, tempo, instrumentación y supuestos. Corrige el plan antes de generar notas.
3. **Generar un esbozo.**
   ```bash
   node tools/ai-compose.js sketch <brief> --out cancion.json --plan-out plan.json
   ```
   El esbozo es un punto de partida, no una entrega final.
4. **Refinar.** Ajusta melodía, bajo, batería, transiciones, densidad, loop y mezcla. Escucha la canción en la app.
5. **Validar.**
   ```bash
   node tools/ai-compose.js check cancion.json
   ```
   Corrige todos los errores. Revisa los avisos.
6. **Entregar** el JSON final, un resumen de decisiones y las notas de escucha. Si es una demo, guárdala en `demos/` y ejecuta `node tools/build-demos.js`.

## Reglas duras

- Formato `chiptune-studio`, versión `2`.
- 1–12 pistas, 1–64 compases, 40–240 BPM.
- Rejilla de semicorcheas. `timeSig`: 4/4=16 pasos, 3/4=12, 2/4=8, 5/4=20, 6/8=12, 12/8=24, 7/8=14.
- Solo instrumentos, efectos, escalas y capacidades reales. No hay samples, VST ni audio externo.
- Si declaras `key`/`scale`, las notas deben ser coherentes.
- Respeta el registro de cada instrumento.
- `tempo` usa `bar >= 1`; el compás 1 usa `bpm`.
- `loopStart` es 0-based y debe quedar dentro de la canción.
- No entregues un JSON sin `check` y sin escucharlo.

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
- `ai/genres.json` es generado por `node tools/build-genres.js` desde `ai/genres/`. No lo edites a mano.
- Mantén los cambios pequeños y coherentes con el estilo del archivo.
- No borres ni sobrescribas trabajo del usuario sin investigarlo antes.

## Pruebas

Antes de dar por terminado un cambio:

```bash
node --check tools/ai-compose.js
node --check src/song/song.js
node --check src/ui/app.js
node tools/build-genres.js
node tools/check-demo.js
node tools/ai-compose.js check <cancion.json>
```

Si el cambio toca la interfaz o la reproducción, abre la app con `node tools/serve.js` y prueba en el navegador: modos, botón Brief, carga/guardado de tonalidad, reproducción, loop, WAV y la demo.

## Entrega

Incluye:

- Qué cambió y por qué.
- Comandos ejecutados y resultado.
- Qué falta probar manualmente (escucha, mezcla, navegador).
- Si algo quedó sin commitear, dilo. No hagas commit salvo que se pida.
