# Método de composición

Una canción es una promesa emocional que se cumple o se rompe en el tiempo. El género da la gramática; el brief da la intención; la forma, el tempo, la densidad y el silencio hacen que se sienta.

## 1. Leer el brief

Separa:

- **Hechos:** lugar, época, personajes, función, duración, restricciones.
- **Emociones:** qué debe sentir el oyente al principio, en el centro y al final.
- **Función:** menú, batalla, créditos, exploración, cinemática, loop, canción.
- **Influencias:** solo rasgos abstractos (tempo, textura, instrumentación, armonía, forma, actitud).
- **Huecos:** lo que falta. Anótalo en `assumptions`.

No empieces a escribir notas hasta tener una frase que resuma la canción: “una despedida que empieza resignada y termina agradecida”, “una persecución que nunca llega a casa”.

## 2. Elegir el género correcto

El planificador `ai-compose.js` usa el catálogo heredado de `data/` como punto de partida. Si existe un `SPEC.json` en `../dossiers/library/`, el spec manda y corrige lo que el planificador haya propuesto.

- Si el brief pide un género, usa su spec validado.
- Si el brief es un lore o una emoción, elige un género primario y, si aporta, uno secundario (70/30).
- Si el género no está validado, dilo. No vendas una estimación como autenticidad.
- El género no es una camisa de fuerza: si el brief pide algo que el género no hace, cambia el género o escribe la fusión y sus supuestos.

## 3. Escribir el plan de dramaturgia

Antes de las notas, escribe una tabla:

| Sección | Compases | Energía | Densidad | Capas | Tempo | Qué pasa |
|---|---:|---:|---:|---|---:|---|
| Intro | 4 | 0.2 | 4–8 | pad, bell | 70 | Solo el lugar |
| A | 8 | 0.5 | 12–20 | + lead, bass, drums | 82 | Aparece el motivo |
| B | 8 | 0.8 | 30–45 | + guitar, strings | 96 | Conflicto |
| Break | 4 | 0.1 | 1–4 | bass, voz | 70 | Se calla todo |
| C | 8 | 1.0 | 45–65 | todos | 120 | Clímax |
| Coda | 4 | 0.3 | 6–12 | piano, bell | 80 | Resolución |

La densidad se mide en **notas por compás** (suma de todas las pistas). No es lo mismo que energía: un acorde largo y agudo puede ser más intenso que dieciséis notas repetidas.

## 4. Forma

Formas útiles:

- **Canción:** intro, A, B, A’, B’, puente, clímax, coda.
- **Loop de juego:** intro, A, B, A, loop; `loopStart` al inicio de A.
- **Ambiente:** una sección que evoluciona por capas, sin clímax tradicional.
- **Épica:** introducción, exposición, desarrollo, breakdown, clímax, coda.
- **Danza:** intro, groove, breakdown, drop, groove, outro.

Cada sección necesita una función. Si una sección no cambia nada, sobra.

## 5. Motivo

- Escribe un motivo de **3–5 notas**.
- Hazlo reconocible por ritmo, intervalo o contorno.
- Repítelo con variación: inversión, cambio de octava, aumento, disminución, cambio de modo, fragmento.
- Resuélvelo al final o déjalo abierto a propósito.
- No llenes cada compás con el motivo: el silencio lo hace memorable.

## 6. Armonía

- Elige tonalidad/modo del spec.
- Define una progresión por grados, no por acordes sueltos.
- Usa cadencia o giro modal para cerrar frases.
- En modos, pentatónicas o escalas simétricas, apóyate en drones, intervalos abiertos y ostinatos.
- La melodía debe caer en notas del acorde en tiempos fuertes, salvo que busques tensión deliberada.

## 7. Ritmo y groove

El groove es lo que hace que el cuerpo reconozca el género antes que la melodía.

- Decide qué instrumento lleva el pulso, cuál el contratiempo y cuál el relleno.
- Escribe patrones en pasos, no en adjetivos.
- Usa `vel` para acentuar; no todos los golpes suenan igual.
- En compases impares, decide el agrupamiento (7/8 = 2+2+3, 3+2+2, etc.) y respétalo.
- En 6/8 y 12/8, piensa en grupos de tres, no en semicorcheas sueltas.
- El bajo y la batería definen el género; la melodía lo confirma.

## 8. Roles e instrumentación

- Un rol por pista, máximo 12.
- Lead, contramelodía, armonía, bajo, ritmo, textura, batería, adorno.
- No dupliques el mismo timbre en la misma octava.
- Usa octavas, paneo y complementos para engrosar.
- Deja un instrumento solo en el breakdown: el contraste hace que el tutti suene más grande.

## 9. Silencio, densidad y dinámica

El silencio es una decisión de arreglo, no un accidente.

- Deja compases con 0–4 notas después de un clímax.
- Quita la batería durante 2–4 compases y deja que el bajo sostenga.
- Haz un falso final: silencio, luego una última frase.
- Reduce el registro y la instrumentación antes del clímax; no lo llenes todo.
- Usa notas largas y espacio entre frases.
- Un breakdown no es “bajar el volumen”: es quitar capas, cambiar el pulso o dejar un pedal.

## 10. Tempo

- Un tempo fijo puede funcionar, pero un mapa de tempo da forma.
- Intro lenta → A media → clímax rápido → coda lenta es una curva clásica.
- Usa `ramp: true` para acelerandos y ritardandos.
- No cambies de tempo sin una razón dramática.
- El tempo cambia la duración real; verifica que las frases sigan cuadrando.

## 11. Recursos de la app

- `slide` para portamento y gestos expresivos.
- `chord` para acordes arpegiados en un canal.
- `vel` para acentos y humanización.
- `pan` para separar roles.
- `fx` para espacio, eco, coro, saturación y crujido.
- `loopStart` para loops sin salto.
- Cambios de tempo por compás.
- 7/8, 5/4, 6/8, 12/8 para métricas no binarias.
- Capas que entran y salen para construir y liberar tensión.

## 12. Originalidad

- Las influencias se traducen a rasgos, no a material.
- Cambia al menos dos dimensiones respecto a cada referencia principal.
- Escribe un motivo propio y reconocible.
- No copies melodías, riffs, progresiones exactas, arreglos, letras ni samples.
- No uses el nombre de un artista vivo ni de una obra existente como reclamo.
- Si el brief pide “igual que X”, ofrece una alternativa original y explica qué rasgos conservaste.

## 13. Validación y escucha

1. `node tools/ai-compose.js check cancion.json`
2. `node tools/check-demo.js cancion.json`
3. `node tools/song-summary.js cancion.json`
4. Escucha en la app: forma, groove, mezcla, loop, transiciones.
5. Corrige y vuelve a escuchar.

El `check` detecta errores técnicos. No detecta si la canción conmueve.

## 14. Entrega

Incluye:

- JSON final.
- Género/spec y estado.
- Forma, tempo map, densidad y silencio.
- Instrumentación y roles.
- Decisiones de originalidad.
- Notas de escucha y lo que falta validar.
