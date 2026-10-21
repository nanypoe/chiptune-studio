# Del brief a la canción

Este es el método de trabajo. No es una receta: es un orden para tomar decisiones y no terminar con un loop genérico.

## 1. Leer el encargo

Separa lo que el brief **dice** de lo que **sugiere**:

- **Hechos:** título, juego/escena, duración, loop, compás, tempo, tonalidad, instrumentos obligatorios.
- **Emoción:** qué debe sentir el jugador/espectador. Puede haber varias emociones y cambiar por secciones.
- **Función:** exploración, combate, jefe, menú, cinemática, créditos, canción de álbum. La función manda sobre el género.
- **Influencias:** bandas, obras, videojuegos, canciones. Se traducen a rasgos, nunca a citas.
- **Restricciones:** evitar algo, no copiar, no usar ciertos timbres, máximo de pistas.
- **Huecos:** lo que falta. Propón y anota en `assumptions`; no finjas que el brief lo dijo.

Si el brief es una historia o un nivel, escribe una frase por momento emocional. Ejemplo:

> Entrada silenciosa → descubrimiento → mecanismo que despierta → persecución → sala del recuerdo → salida con esperanza.

Esa secuencia ya es una forma musical.

## 2. Elegir género y familia

1. Busca el género explícito en `ai/genres.json` (`genres`, `catalog`).
2. Si no está, busca la familia por palabras clave (`fallback.keywordToFamily`).
3. Si hay dos influencias, elige una **primaria** y una **secundaria**. Mezcla 70/30, no 50/50.
4. Si el género no existe, invéntalo con un nombre descriptivo y declara la familia base. Eso es válido: "post-rock de santuario" puede ser `screen-stage` con textura de `post-rock`.

No elijas un género solo por el nombre. Un "jefe final" puede ser metal, electrónica industrial, gospel oscuro o una nana. Pregúntate qué **función** y qué **emoción** necesita.

### Tabla rápida de decisión

| Si el brief pide... | Piensa en... | Cuidado con... |
|---|---|---|
| Exploración, espacio, soledad | ambient, electronic, chiptune-game, screen-stage | llenar con arpegios constantes |
| Combate, urgencia | metal, punk, electronic, hiphop | saturar sin contraste |
| Pueblo, taberna, viaje | folk, celtic, country-folk, world-fusion | clichés turísticos |
| Misterio, ruinas, secretos | dorian/phrygian, ambient, jazz modal | resolver demasiado pronto |
| Emoción, pérdida, recuerdo | romantic, folk, lo-fi, piano | exagerar el dramatismo |
| Celebración, festival | latin, african, pop, ska | groove genérico |
| Tensión mecánica | industrial, techno, metal, experimental | ruido sin pulso |
| Épica, destino | screen-stage, power metal, romantic | fanfarria constante |
| Juego rápido y loop | chiptune-game, pop, electronic | loop que no cierra |

## 3. Definir la forma

Una canción de 32 compases no es una canción de 4 compases repetida ocho veces. La forma es un mapa de energía.

### Formas base (adapta, no copies)

- **Loop de juego (16–32):** Intro 4 · A 8 · B 8 · A 8 · Outro 4.
- **Exploración (24–40):** Intro 8 · A 8 · B 8 · A' 8 · Coda 8.
- **Jefe (24–40):** Intro 4 · Riff A 8 · Verso 8 · Clímax 8 · Breakdown 4 · Final 4.
- **Canción pop (32–48):** Intro 4 · Verso 8 · Pre 4 · Coro 8 · Verso 8 · Coro 8 · Puente 4 · Coro 8.
- **Cinemática (24–48):** Tema 8 · Desarrollo 8 · Contraste 8 · Clímax 8 · Coda 8.
- **Ambient (32–64):** Drone 8 · Capa A 8 · Capa B 8 · Clímax 8 · Fade 8.
- **Clásica (32–48):** Exposición 8 · Desarrollo 8 · Recapitulación 8 · Coda 8.

Cada sección debe tener:

- **Función:** presentar, desarrollar, contrastar, romper, resolver.
- **Energía:** 0–1. No todas al 0.9.
- **Textura:** qué capas entran y salen.
- **Armonía:** qué acordes o centro modal.
- **Motivo:** qué material se transforma.
- **Tempo:** si cambia, cuándo y cómo.

## 4. Armonía y tonalidad

### Elegir centro y modo

- **Mayor/Jónico:** claridad, alegría, himno. Úsalo si la emoción es luminosa o si necesitas ironía.
- **Menor/Eólico:** tristeza, seriedad, épica. El más seguro, pero también el más usado.
- **Dórico:** menor con IV mayor; esperanza, aventura, folk, jazz modal. Muy útil para evitar la tristeza genérica.
- **Frigio:** tensión, exotismo, metal, flamenco. La segunda menor es el color.
- **Lidio:** asombro, magia, cine. La cuarta aumentada brilla.
- **Mixolidio:** rock, folk, blues; dominante sin resolver.
- **Locrio:** rareza, inestabilidad; úsalo con intención.
- **Armónica/melódica:** drama, oriente, metal neoclásico, jazz.
- **Pentatónicas:** melodías directas, folk, blues, juego.
- **Blues:** lenguaje propio; no es solo menor con notas raras.
- **Tono completo/disminuida/cromática:** color, tensión, ciencia ficción, serialismo.

### Progresiones que funcionan

- **Funcional mayor:** I–V–vi–IV, I–vi–IV–V, I–IV–V–I, vi–IV–I–V.
- **Funcional menor:** i–VI–III–VII, i–iv–V–i, i–VII–VI–V.
- **Modal:** i–IV (dórico), i–VII (eólico/mixolidio), I–bII (frigio), I–II (lidio).
- **Rock/metal:** i–VI–III–VII, i–bVI–bVII–i, riffs sobre pedal.
- **Jazz:** ii–V–I, I–vi–ii–V, blues de 12 compases, rhythm changes simplificado.
- **Blues:** I–I–I–I–IV–IV–I–I–V–IV–I–V (12 compases).
- **Ambient/minimal:** dos o tres acordes, pedal, movimiento por voces.

Para modos no heptatónicos, no fuerces siete acordes: usa drones, intervalos abiertos, ostinatos y melodía.

### Cómo escribir acordes en la app

- Varias notas en la misma columna y misma pista = acorde real.
- Una nota con `chord: "M"` = acorde arpegiado rápido de un solo canal. Ahorra pistas, pero no es un acorde sostenido.
- En 7 notas, construye tríadas sobre grados de la escala. En 5/6/8 notas, usa quintas, cuartas o drones.
- No pongas un acorde de 5 notas en una pista de lead si tapa la melodía.

## 5. Melodía

Una melodía memorable suele tener:

1. **Motivo corto:** 3–5 notas, con un ritmo reconocible.
2. **Repetición con variación:** cambia la última nota, el registro o el ritmo.
3. **Contorno:** sube, baja o forma un arco. Evita el zigzag aleatorio.
4. **Puntos de apoyo:** notas del acorde en tiempos fuertes; notas de la escala en los débiles.
5. **Silencios:** una frase necesita respirar.
6. **Clímax:** una nota alta o un salto en el momento emocional correcto.
7. **Cierre:** vuelve al centro tonal o deja una tensión deliberada.

### Plantillas de motivo

- **Heroico:** 1–3–5–8 (arpegio) con ritmo de negras y una síncopa al final.
- **Melancólico:** 5–3–2–1, con una apoyatura y una nota larga.
- **Misterioso:** 1–b2–5–b6, con silencios y repetición.
- **Juguetón:** saltos de octava, staccato, llamada-respuesta.
- **Épico:** 1–5–6–5–3, con crescendo y final largo.
- **Folk:** giro pentatónico con bordadura y nota pedal.

### Chiptune

- `pulse`/`pwm` para el lead; `triangle` para contramelodía; `arp` para arpegios; `bell` para brillo.
- `slide` en notas largas o saltos; no en cada nota.
- `chord` en el arpegio, no en la melodía principal.
- `vel` para acentuar; el chip no tiene dinámica humana, pero la velocity y la duración sí.

## 6. Ritmo y bajo

El bajo y la batería definen el género más que la armonía.

- **Rock/metal:** corcheas/semicorcheas, backbeat, kick en 1 y 3, snare en 2 y 4. Metal: doble bombo y galope.
- **Pop:** kick en 1 y 3, snare en 2 y 4, hats en corcheas. Dance: kick en cada negra.
- **Jazz:** ride con swing, walking bass, snare/ghost notes.
- **Funk:** semicorcheas con silencios, contratiempos, slap.
- **Reggae:** one-drop (kick+snare en 3), skank en contratiempo, bajo redondo.
- **Latin:** clave 3-2/2-3, tumbao, montuno. No lo aplanes a 4/4 recto.
- **Trap/drill:** 808 con slide, hats rápidos, half-time.
- **Folk/celta:** 6/8, jig, reel; el pulso es compuesto.
- **Ambient:** sin batería o percusión mínima.

El bajo no tiene que tocar solo la raíz: quinta, octava, tercera, aproximaciones cromáticas y notas de paso. Pero no tape la melodía.

## 7. Orquestar con 12 pistas

Roles recomendados:

1. Lead / tema.
2. Contramelodía o respuesta.
3. Armonía (strings/pad/piano).
4. Bajo.
5. Batería.
6. Arpegio / textura.
7. Brillo (bell/chirp).
8. Percusión adicional (shaker, clap, toms).
9. Capa de ruido/efecto.
10–12. Refuerzos para el clímax o variaciones.

Reglas:

- Un rol, un timbre principal. No pongas tres leads compitiendo.
- Usa el paneo para separar: bajo y kick al centro; armonía a los lados; lead al centro o ligeramente a un lado.
- Usa `volume` para jerarquía: lead 0.75–0.9, bajo 0.8–0.95, armonía 0.35–0.6, brillo 0.25–0.5.
- Entra y sal por capas. Una sección nueva no necesita todos los instrumentos a la vez.
- El silencio es una capa.

## 8. Tempo, compás y loop

- El tempo base no es décor: una intro a 90 y un estribillo a 150 cambian la percepción.
- Usa `ramp` para builds y ritardandos; usa saltos para cambios de sección.
- Los compases impares (5/4, 7/8) son identidad, no un truco. Si los usas, que el pulso sea contable.
- Si el loop es para un juego, el último compás debe enlazar con `loopStart`. Prueba mentalmente el salto.
- `loopStart` no recorta el WAV: indica el punto de retorno. Para un loop perfecto, exporta con la opción de bucle de la app.

## 9. Originalidad

1. **Traduce, no copies.** De una influencia toma: tempo, textura, instrumentación, lenguaje armónico, forma, actitud. No tomes melodías, riffs, progresiones exactas ni arreglos.
2. **Cambia al menos dos dimensiones.** Si te gusta el ritmo de una referencia, cambia la instrumentación y la armonía. Si te gusta la instrumentación, cambia el ritmo y la forma.
3. **Combina dos influencias no obvias.** Folk celta + industrial; gospel + ambient; tango + chiptune.
4. **Escribe un motivo propio.** Tres a cinco notas, con un ritmo que puedas tararear.
5. **Evita el "soundalike".** Si el resultado se reconoce como "la canción de X", no es original.
6. **No uses nombres de artistas en el título** para vender la referencia. El título debe pertenecer a la obra.
7. **Deja una firma:** una textura, un intervalo, un instrumento o una regla de composición que se repita.

## 10. Proceso recomendado con la herramienta

```bash
node tools/ai-compose.js plan ai/examples/lore-brief.json --out plan.json
node tools/ai-compose.js sketch ai/examples/lore-brief.json --out cancion.json --plan-out plan.json
node tools/ai-compose.js check cancion.json
```

1. Ajusta el `plan.json` a mano: género, forma, tempo, tonalidad, instrumentación, emociones.
2. Genera un esbozo.
3. Refina: melodía, bajo, batería, dinámica, transiciones, loop.
4. Valida.
5. Si es una demo, cópiala a `demos/` y ejecuta `node tools/build-demos.js`.
6. Escucha en la app; no entregues solo el JSON.

## 11. Preguntas antes de entregar

- ¿Se entiende la emoción en los primeros 8 compases?
- ¿Hay contraste entre secciones?
- ¿La melodía se puede tararear?
- ¿El bajo y la batería definen el género?
- ¿Cada instrumento está en su registro?
- ¿El tempo y el compás respiran?
- ¿El loop cierra?
- ¿Se usan los recursos de la app con intención (slide, chord, fx, tempo)?
- ¿La obra es original y no una copia de la influencia?
- ¿El JSON valida y suena?
