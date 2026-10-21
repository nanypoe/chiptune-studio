# Checklist antes de entregar

## Brief y decisiones

- [ ] Leí el brief completo y separé hechos, emociones, función, influencias y restricciones.
- [ ] Los huecos están en `assumptions`; no inventé datos como si estuvieran en el brief.
- [ ] La función (exploración, jefe, menú, cinemática, canción) manda sobre el género.
- [ ] Si el género no existe en la base, usé una familia cercana y lo declaré como fusión estimada.
- [ ] La influencia está traducida a rasgos, no a una cita.

## Técnica

- [ ] `check` termina sin errores.
- [ ] 1–64 compases, 40–240 BPM, 1–12 pistas.
- [ ] Todas las notas están dentro del compás y del registro de su instrumento.
- [ ] La batería usa piezas válidas; las pistas melódicas usan pitches válidos.
- [ ] `timeSig` y la rejilla de semicorcheas son coherentes.
- [ ] `key` y `scale` coinciden con las notas (o no los declaré).
- [ ] Los cambios de tempo tienen `bar >= 1` y están dentro de la canción.
- [ ] `loopStart` está dentro de la canción y el final enlaza con ese compás.
- [ ] No hay pistas vacías, silenciadas o con volumen 0 por descuido.
- [ ] Los `slide` y `chord` están usados con intención, no como adorno constante.

## Música

- [ ] La emoción se entiende en los primeros 8 compases.
- [ ] Hay contraste real entre secciones: energía, textura, armonía o tempo.
- [ ] La melodía se puede tararear y tiene un motivo reconocible.
- [ ] El motivo se repite con variación; no es una sucesión aleatoria de notas.
- [ ] El bajo y la batería definen el género.
- [ ] La armonía sostiene la melodía; las notas fuertes caen en el acorde.
- [ ] Cada rol tiene un timbre y una octava clara; no hay tres leads compitiendo.
- [ ] El silencio y las capas que entran/salen forman parte del arreglo.
- [ ] El clímax llega en el momento emocional correcto y no todo está al máximo desde el principio.
- [ ] La coda o el loop cierran con intención.

## Originalidad

- [ ] No hay melodías, riffs, progresiones exactas ni arreglos reconocibles de las referencias.
- [ ] Cambié al menos dos dimensiones respecto a cada influencia principal.
- [ ] El motivo principal es propio.
- [ ] El título no usa el nombre de un artista vivo ni de una obra existente como reclamo.
- [ ] No hay samples, letras ni grabaciones externas.
- [ ] Hice la prueba de tararear y comparar con la referencia.

## Entrega

- [ ] Escuché la canción completa en la app, no solo el JSON.
- [ ] Corregí lo que el análisis no puede oír: fraseo, densidad, transiciones, mezcla.
- [ ] El JSON final es el que validé y escuché.
- [ ] Incluí un resumen breve: género/familia, forma, tonalidad/modo, instrumentación, recursos usados y originalidad.
- [ ] Si es una demo, está en `demos/` y ejecuté `node tools/build-demos.js`.
- [ ] Si toqué la base de géneros, ejecuté `node tools/build-genres.js`.
