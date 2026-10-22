# Flujo de creación de canciones

Estás en `ai/song-maker`. Tu trabajo es componer canciones originales, profesionales y emocionalmente claras para Chiptune Studio. No investigues géneros aquí: usa los specs ya validados en `../dossiers/`.

## Archivos que debes leer al empezar

1. `../APP-CONTRACT-QUICK.md` — resumen operativo de la app. Si falta un detalle, lee `../APP-CONTRACT.md`.
2. `WORKFLOW.md` — proceso completo.
3. `COMPOSE.md` — método creativo.
4. `ORIGINALITY.md` — cómo usar influencias sin copiar.
5. `CHECKLIST.md` — revisión final.
6. `data/dossiers.json` — catálogo generado de géneros promovidos; el spec concreto está en `../dossiers/library/<slug>/SPEC.json`.
7. El `SPEC.json` del género elegido.
8. `sessions/STATE.md` — si continúas una sesión.

No leas todos los dossiers, ni todos los JSON de `demos/`, ni `demos.js`. Usa `../../tools/song-summary.js` cuando necesites ver una canción sin cargarla entera.

## Entrada

El humano puede pedir:

- **Un género explícito:** “haz un bolero mexicano”.
- **Una emoción o función:** “algo melancólico para una despedida”.
- **Un lore, poema o escena:** “un faro abandonado en un planeta de lluvia”.
- **Una referencia:** “como una batalla de jefes de los 90”.

Traduce la referencia a rasgos abstractos. No clones.

## Proceso obligatorio

1. **Separar el brief.** Hechos, emociones, función, restricciones, influencias, huecos. Los huecos van a `assumptions`.
2. **Elegir género.**
   - Si el humano lo pide, busca el spec en `data/dossiers.json`.
   - Si no está `validated`, dilo y ofrece: usar el `draft/tested` más cercano (marcado como estimación) o abrir una sesión de dossiers.
   - Si el brief es lore/emoción, elige un género primario y, si aporta, uno secundario (70/30). Explica por qué.
3. **Planificar.**
   ```bash
   node ../../tools/ai-compose.js plan <brief> --out plan.json
   ```
   Revisa el plan y **sobreescríbelo con el spec**: forma, tempo, compás, densidad, silencio, roles, motivo y armonía. El plan automático es un punto de partida, no la decisión final.
4. **Escribir el mapa de dramaturgia.** Antes de las notas:
   - secciones y compases;
   - energía y densidad por sección;
   - qué capas entran y salen;
   - tempo map;
   - dónde hay silencio, break o falso final;
   - qué se repite y qué cambia.
5. **Componer.** Un rol por pista. Usa el motivo de 3–5 notas, varíalo, deja respirar. Respeta registros. Usa los recursos reales de la app.
6. **Generar un esbozo si ayuda.**
   ```bash
   node ../../tools/ai-compose.js sketch <brief> --out cancion.json --plan-out plan.json
   ```
   Refínalo; no entregues el esqueleto.
7. **Validar.**
   ```bash
   node ../../tools/ai-compose.js check cancion.json
   node ../../tools/check-demo.js cancion.json
   node ../../tools/song-summary.js cancion.json
   ```
   Corrige todos los errores. Los avisos se evalúan, no se ignoran automáticamente.
8. **Escuchar.** El humano escucha y da feedback. Ajusta melodía, bajo, batería, transiciones, mezcla, loop y densidad.
9. **Entregar.**
   - JSON final en `demos/<slug>.json`.
   - `node ../../tools/build-demos.js`.
   - Resumen: género/spec usado, forma, tonalidad, instrumentación, decisiones de silencio/dinámica, originalidad y notas de escucha.
   - Actualiza `catalog.json` y `sessions/STATE.md`.

## Reglas duras

- No inventes instrumentos, efectos, escalas, compases ni capacidades.
- Si el género no está `validated`, no afirmes que la canción “es” ese género; decláralo como estimación.
- No copies melodías, riffs, progresiones ni arreglos reconocibles.
- Cambia al menos dos dimensiones respecto a cada influencia principal.
- No uses el nombre de un artista vivo ni de una obra existente como reclamo del producto.
- No entregues una canción sin `check` y sin escucha.
- No llenes todas las pistas: el silencio y las capas que entran/salen son parte del arreglo.
- No confundas densidad alta con energía. La energía también se logra con espacio, tempo y contraste.

## Entrega

Incluye:

- Qué se compuso y por qué.
- Spec de género usado y estado (`validated`/`tested`/`draft`).
- Forma, tempo map, densidad y mapa de silencio.
- Comandos ejecutados y resultado.
- Qué falta probar manualmente (escucha, mezcla, navegador).
- Si algo quedó sin commitear, dilo. No hagas commit salvo que se pida.
