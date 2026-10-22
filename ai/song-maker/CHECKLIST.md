# Checklist de canción

## Género y brief

- [ ] El género usado está `validated`, o se declaró como estimación.
- [ ] El brief está separado en hechos, emociones, función, influencias y huecos.
- [ ] Los huecos están en `assumptions`.
- [ ] La canción cumple la función pedida (menú, batalla, créditos, loop, escena).

## Forma y dramaturgia

- [ ] Hay una forma clara, no una sucesión de compases.
- [ ] Cada sección tiene función, energía y textura.
- [ ] Hay contraste real: no todo está al mismo volumen ni a la misma densidad.
- [ ] Hay silencio, break, dropout o falso final.
- [ ] El clímax está preparado, no solo subido.
- [ ] El final resuelve o deja abierto a propósito.

## Ritmo y bajo

- [ ] El groove se reconoce antes que la melodía.
- [ ] El bajo define la armonía y el pulso.
- [ ] Los acentos son coherentes; no todo golpea igual.
- [ ] En compases impares, el agrupamiento es consistente.
- [ ] La batería tiene fills y cambios de sección, no solo un loop.

## Armonía y melodía

- [ ] La tonalidad/modo está declarada y las notas son coherentes.
- [ ] La progresión tiene lógica y cadencia.
- [ ] El motivo es de 3–5 notas y se reconoce.
- [ ] El motivo se repite con variación, no idéntico hasta el infinito.
- [ ] La melodía respira y cae en notas del acorde en tiempos fuertes.

## Instrumentación y mezcla

- [ ] Un rol por pista; máximo 12.
- [ ] No hay dos timbres iguales en la misma octava sin razón.
- [ ] Los registros son válidos.
- [ ] El paneo separa roles.
- [ ] Los efectos tienen intención, no están en todo.
- [ ] El bajo y la batería no tapan la melodía.

## Formato

- [ ] `format: chiptune-studio`, `version: 2`.
- [ ] 1–12 pistas, 1–64 compases, 40–240 BPM.
- [ ] Un solo `timeSig` válido.
- [ ] `tempo` usa `bar >= 1`.
- [ ] `loopStart` es 0-based y está dentro.
- [ ] No hay notas fuera de compás ni de registro.
- [ ] No hay piezas de batería inventadas.

## Originalidad

- [ ] No hay melodías, riffs o progresiones copiadas.
- [ ] Cambié al menos dos dimensiones respecto a cada referencia.
- [ ] El motivo es propio.
- [ ] No uso el nombre de un artista vivo ni de una obra existente como reclamo.
- [ ] La fusión, si existe, está justificada.

## Validación

- [ ] `node tools/ai-compose.js check cancion.json`
- [ ] `node tools/check-demo.js cancion.json`
- [ ] `node tools/song-summary.js cancion.json`
- [ ] Escucha humana en la app.
- [ ] `node tools/build-demos.js` si va a `demos/`.
- [ ] `catalog.json` y `sessions/STATE.md` actualizados.
