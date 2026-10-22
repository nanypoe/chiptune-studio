---
id: city-pop
name: City Pop
family: funk-disco-aor
status: validated
confidence: 0.72
updated: 2026-10-22
region: Tokio, Japón
era: 1978-1986
function: Ocio urbano, radio FM, clubes y conducción; música de consumo sofisticado
sources:
  - Light in the Attic, Pacific Breeze (2019)
  - Carolyn S. Stevens, Japanese Popular Music (2008)
  - Maxwell Ramage, The Royal Road Progression (2023)
  - Japan Foundation, Hiroshi Nagai: Paintings for Music (2020)
  - Reem Numan, Feeling Déjà Vu in Japanese (IIAS)
  - Bass Magazine Japan, シティポップの名フレーズ40 (2017)
---

# City Pop

## 1. Identidad y célula

**Célula:** Tokio, 1978–1986. Pop urbano de estudio, con presupuesto alto, músicos de sesión de jazz-funk y sintetizadores polifónicos. No es un género homogéneo: el término agrupa AOR, boogie, disco-funk, synth-pop y baladas suaves.

Para Chiptune Studio interesa la variante **boogie/disco-funk bailable**: 4/4 recto, hi-hat en semicorcheas, bajo slap en octavas, acordes extendidos y respuestas de metales. Es la célula que el `TEST.json` debe demostrar. La balada lenta de city pop queda fuera de esta especificación.

## 2. Referencias y fuentes

| Fuente | Qué respalda | Confianza |
|---|---|---|
| Light in the Attic, *Pacific Breeze* (2019), liner notes | City Pop surge a mediados de los 70 y domina los 80; mezcla groove, boogie, techno-pop y AOR; música sofisticada ligada a la prosperidad urbana. | Alta |
| Carolyn S. Stevens, *Japanese Popular Music* (2008), ISBN 978-0415492218 | Contexto de producción, tecnología y asimilación de técnicas occidentales en la música popular japonesa. No es un análisis específico de city pop. | Alta (contexto) |
| Maxwell Ramage, *The Royal Road Progression in Japanese Popular Music* (2023), DOI 10.1093/mts/mtad008 | La royal road es IVM7–V7–iii7–vi7 (arquetipo F–G–Em–Am) y es central en la música popular japonesa, incluido city pop. | Alta |
| Japan Foundation, *Hiroshi Nagai: Paintings for Music* (2020) | City pop como mezcla pulida de synth-pop, disco, funk, boogie, jazz-fusion y R&B; el término es retrospectivo. | Alta |
| Reem Numan, *Feeling Déjà Vu in Japanese* (IIAS) | Influencia de funk, disco, soul, R&B y bossa nova; uso de slap bass y de la progresión ii–V–iii–vi. | Media |
| Bass Magazine Japan, *シティポップの名フレーズ40* (2017), ISBN 978-4-8456-2986-2 | Vocabulario de bajo del género: frases de octavas, slap y articulación rítmica. | Media |
| 木村ユタカ, *Japanese City Pop: Selected 500 over titles of albums* (2008), ISBN 978-4401617738 | Delimitación discográfica y periodización del repertorio. Es una guía de discos, no un tratado armónico. | Media |
| chordprogressions.org, tabla de géneros | Tempo orientativo 92–118 BPM y presencia de séptimas. Fuente secundaria, solo para contraste. | Baja |

**Correcciones a la investigación cruda:** el inbox citaba *Sayonara City Pop* (Kimura, ISBN 978-4401636181), una guía de `gh.chip-audio-archive.org` y un DOI de Kawamoto que no existen en los catálogos consultados; se eliminaron. También llamaba "Royal Road Variant" a F–E7–Am–C7, que no es la royal road: la royal road verificada es **F–G–Em–Am**. La duración 1978–1986 se mantiene como delimitación práctica, aunque el término se usa hoy para un repertorio más amplio.

## 3. Métrica, tempo y forma

- **Compás:** 4/4 estricto. Rejilla de semicorcheas (16 pasos).
- **Tempo:** 96–124 BPM; típico **112** para la variante boogie. El subconjunto disco-funk puede llegar a 120–124; las baladas de city pop quedan fuera.
- **Frases:** 2, 4 u 8 compases, cuadradas.
- **Forma de referencia (48 compases):**

| Sección | Compases | Función | Energía |
|---|---:|---|---|
| Intro | 8 | Batería y bajo; entran piano y strings | 0.5 |
| Estrofa A | 8 | Melodía principal, base limpia | 0.6 |
| Pre-coro B | 8 | Tensión armónica y síncopas | 0.75 |
| Coro C | 8 | Clímax: brass, hi-hat abierto, melodía aguda | 1.0 |
| Break / solo | 8 | Solo de lead; dropout antes de volver | 0.85 |
| Outro | 8 | Repetición con capas que se van | 0.4 |

## 4. Ritmo y groove

El pulso es recto. El empuje no viene del swing: viene de la **anticipación del bajo** y de los acordes en contratiempo.

- **Bombo:** pasos `0, 8`; opcional `10` para empujar el tiempo 3-and.
- **Caja:** `4, 12` (tiempos 2 y 4), seca y al frente.
- **Hi-hat:** semicorcheas `0–15`; `openhat` en `6` y `14`.
- **Bajo slap:** raíz en `0, 4, 8, 12`; octava aguda en `3, 7, 11, 15`. Nota de paso cromática en `14` cuando cambia el acorde.
- **Piano/Rhodes:** stabs cortos en `2, 6, 10, 14`; deja libres `0` y `8` para el kick.
- **Metales:** respuesta de dos notas en `12` y `14` del último compás de cada frase de cuatro.
- **Anticipación melódica:** la primera nota de una frase puede entrar en el paso `15` del compás anterior.

## 5. Armonía

Tonalidad mayor con color aeolio. Se evitan las tríadas desnudas: el mínimo es séptima; la novena se reparte entre piano y strings.

Progresiones de trabajo:

1. **Royal road:** `IVM7 – V7 – iii7 – vi7` (en C: `Fmaj7 – G7 – Em7 – Am7`).
2. **Turnaround AOR:** `ii7 – V9 – iii7 – vi7` (en C: `Dm7 – G9 – Em7 – Am7`).
3. **Descenso con iv prestado:** `IVM7 – IVm7 – iii7 – vi7` (en C: `Fmaj7 – Fm7 – Em7 – Am7`).
4. **Turnaround de jazz-funk:** `iii7 – VI7 – ii7 – V7` (en C: `Em7 – A7 – Dm7 – G7`).

Cadencias: `ii7–V7–IM7`, `IVM7–V7–IM7`, `IVm7–I` (plagal menor). El préstamo `IVm7` y el `V7/iii` son color, no norma en cada vuelta.

## 6. Melodía y fraseo

- **Ámbito:** C4–C6; el coro puede subir a D6/E6 sin salir de `pwm`.
- **Motivo:** 3–5 notas. Arranca con un salto ascendente de 4ª o 6ª, baja por grados conjuntos y respira. Ejemplo de forma, no de melodía: `E5–A5–G5–E5–D5`.
- **Fraseo:** frases de 2 o 4 compases; la última nota se anticipa al paso 15. Llamada del lead, respuesta de brass al final de la frase.
- **Adornos:** notas de paso cromáticas descendentes, saltos de octava y `slide` a la nota siguiente.
- **Evitar:** melodías que llenan todos los pasos, marchas diatónicas sin síncopa y frases que no dejan respirar al groove.

## 7. Roles e instrumentación

| Rol | Instrumento | Registro | Comportamiento |
|---|---|---|---|
| Lead / voz | `pwm`, `pulse` | C4–C6 | Melodía sincopada, notas ligadas, respuesta a la sección de brass. |
| Bajo | `pluck` + `bass` | C1–C3 | `pluck` da el ataque slap en octavas; `bass` sostiene la raíz. |
| Armonía | `piano`, `guitar` | C3–C5 | Stabs de acorde en contratiempo; guitarra funk opcional con cortes secos. |
| Colchón | `strings`, `pad` | C3–C6 | Sostiene 5ª y 9ª para completar el voicing. |
| Metales | `brass` | C4–C6 | Stabs cortos en 12 y 14; nunca fanfarria continua. |
| Batería | `drums` | — | Kick 0/8, snare 4/12, hats 16ths, openhat 6/14. |
| Adorno | `bell`, `arp` | C5–C8 / C4–C8 | Brillo puntual al inicio de frase; arpegio rápido si falta una extensión. |

**Evitar:** `saw` como lead principal (acerca el resultado al rock), `crush` y `drive` alto.

## 8. Dinámica, densidad y silencio

Densidad orientativa por compás (todas las pistas):

| Sección | Notas/compás | Capas |
|---|---:|---|
| Intro | 18–28 | drums, bass, pluck |
| Estrofa | 24–36 | + piano, strings |
| Pre-coro | 28–40 | + lead, brass |
| Coro | 34–46 | todas |
| Break | 28–42 | lead al frente, base reducida |
| Outro | 18–30 | capas saliendo |

**Silencio real, no bajar volumen:**

- En la segunda mitad del compás 8 de una frase, cortar `bass`, `pluck`, `piano` y `strings`; dejar solo `drums` con un fill `tomhi → tommid → tomlo`.
- Resolver el fill con `crash` en el tiempo 1 del compás siguiente.
- En el último compás, dejar que el groove se caiga: los tonales paran y la batería cierra con toms.
- Regla: al menos un dropout cada 8 compases; nunca dos secciones seguidas con la misma densidad.

## 9. Producción y textura

- **`chorus`:** piano (0.4–0.5) y guitarra (0.3–0.4) para el ancho del Rhodes y las guitarras de rack.
- **`reverb`:** brass (0.3), strings (0.25), snare (0.15–0.2).
- **`delay`:** `pwm` (0.2–0.3), eco corto, para profundidad sin emborronar.
- **`drive`:** `pluck` (0.1–0.15) para el ataque del bajo; nada en el resto.
- **`crush`:** 0. El género pide una textura pulida; el bitcrush lo convierte en otra cosa.

Mezcla: bajo centrado y definido, caja nítida, piano a la izquierda, strings/brass a la derecha, lead al centro.

## 10. Traducción a Chiptune Studio

**Se puede:** 4/4, 96–124 BPM, 7–8 pistas, `pluck+bass`, `piano`, `strings`, `pwm`, `brass`, `drums`, `chorus/reverb/delay`, stabs, octavas, fills y dropouts.

**No se puede:** voces y coros, automatización de filtros, pitch bend por nota (solo `slide`), acordes sostenidos reales y extensiones 9/11 en el campo `chord` (solo `M7`, `m7`, `7`, tríadas, `sus4`).

**Workarounds:**

1. Repartir el voicing: `piano` toca 3ª y 7ª; `strings` sostiene 5ª y 9ª en la octava superior.
2. Duplicar el bajo: `pluck` para el ataque y la octava, `bass` para el cuerpo de la raíz.
3. Usar `slide` para aproximar los glissandos del lead; no fingir un bend que la app no tiene.
4. Si el acorde necesita 9ª, escribirla como nota de `strings` o `arp`, no como `chord`.

**Test mínimo:** 16 compases en C mayor. Intro de 2 compases (drums, bass, pluck), entrada de piano/strings en 3–4, melodía en 5–8, brass en 9–11, dropout en el compás 12 y reentrada con `crash` en 13. Cierre con segundo dropout en el compás 16. El motivo del lead es original y no cita ninguna obra.

## 11. Debe / evitar

**Debe:**

- Acordes con séptima (M7/m7/7) y, cuando se pueda, 9ª repartida en strings.
- Bajo en octavas con síncopa de semicorchea.
- Hi-hat en semicorcheas con `openhat` en 6 y 14.
- Respuesta de brass al final de frases de 2 o 4 compases.
- Textura limpia con `chorus` y `reverb`; sin `crush`.
- Anticipación melódica en el paso 15.
- Un dropout con fill de toms antes del coro o del cierre.

**Evitar:**

- Tríadas desnudas 1-3-5 sin tensión.
- Bajo en negras a tiempo fuerte, sin octavas ni síncopas.
- `drive` alto o `crush`: convierten el city pop en rock o chiptune industrial.
- Melodía de marcha, sin síncopa ni respiración.
- Power chords o riffs de guitarra rock.
- Copiar melodías, riffs o progresiones de obras existentes; las progresiones de arriba son esquemas armónicos, no citas.

## 12. Criterios de aceptación

1. **Compases 1–2:** se reconoce una base disco-funk/boogie por el bajo en octavas y el hi-hat con apertura en contratiempo.
2. **Compases 3–4:** el piano con chorus y los acordes con séptima dan la sofisticación AOR, no pop infantil.
3. **Compases 5–8:** la melodía entra con un salto y una anticipación; el brass responde sin taparla.
4. **Compás 12:** el corte de la base tonal y el fill de toms crean expectativa; el `crash` del compás 13 resuelve.
5. **Compás 16:** el segundo dropout deja silencio real, no un simple descenso de volumen.
6. Si se quita el bajo slap, el oyente debe notar que falta la célula; si se quita el piano, debe notar que falta el color armónico.

## 13. Preguntas abiertas

- El tempo tiene dos lecturas: 92–118 BPM (tabla secundaria) y 110–128 BPM (variante boogie). Se eligió 96–124 con típico 112; falta confirmar con escucha si el test suena lento o rápido para la célula elegida.
- No hay una fuente verificada para el patrón exacto de stabs `2,6,10,14`; es una inferencia razonable del funk/disco, no una transcripción.
- La combinación `pluck + bass` puede emborronar graves en altavoces pequeños; el test usa `pluck` una octava arriba para separar.
- El campo `chord` no admite 9ª/11ª. El test resuelve con séptimas y deja las extensiones a `strings`; falta escuchar si alcanza.
- El término "city pop" es retrospectivo y amplio. Este spec cubre la célula boogie/AOR de Tokio, no las baladas ni el neo-city-pop posterior.
- Se eliminaron fuentes inventadas del inbox; la confianza baja a 0.72 y varias afirmaciones de producción quedan como inferencia.

## 14. SPEC

```json
{
  "schema": "chiptune-genre-spec@1",
  "id": "city-pop",
  "name": "City Pop",
  "family": "funk-disco-aor",
  "status": "validated",
  "confidence": 0.72,
  "updated": "2026-10-22",
  "aliases": [
    "Japanese City Pop",
    "Tokyo AOR",
    "Bubble-era boogie"
  ],
  "tags": [
    "1980s",
    "japan",
    "funk",
    "disco",
    "aor",
    "boogie",
    "synthpop"
  ],
  "summary": "Pop urbano japonés de finales de los 70 y los 80: groove disco-funk de semicorcheas, armonía jazzy con séptimas y novenas, bajo slap en octavas y producción brillante.",
  "context": {
    "region": "Tokio, Japón",
    "era": "1978-1986",
    "function": "Ocio urbano, radio FM, clubes nocturnos y conducción; música de consumo sofisticado"
  },
  "meter": {
    "primary": "4/4",
    "allowed": [
      "4/4"
    ],
    "feel": "Binario recto con hi-hat en semicorcheas; el empuje viene del bajo en contratiempos, no del swing"
  },
  "tempo": {
    "range": [
      96,
      124
    ],
    "typical": 112,
    "map": []
  },
  "key": {
    "common": [
      "C major",
      "F major",
      "G major",
      "A minor",
      "Bb major"
    ],
    "scales": [
      "major",
      "mixolydian",
      "dorian",
      "minor"
    ],
    "modality": "Mayor brillante con color aeolio (royal road), dominantes secundarias y préstamo del iv menor"
  },
  "form": [
    {
      "id": "intro",
      "bars": 8,
      "role": "Batería y bajo; entran piano y strings",
      "energy": 0.5,
      "density": [
        18,
        28
      ],
      "returns": false
    },
    {
      "id": "verse_a",
      "bars": 8,
      "role": "Melodía principal sobre base limpia",
      "energy": 0.6,
      "density": [
        24,
        36
      ],
      "returns": true
    },
    {
      "id": "pre_chorus",
      "bars": 8,
      "role": "Tensión armónica y síncopas; entran brass",
      "energy": 0.75,
      "density": [
        28,
        40
      ],
      "returns": true
    },
    {
      "id": "chorus",
      "bars": 8,
      "role": "Clímax con brass, hi-hat abierto y melodía aguda",
      "energy": 1,
      "density": [
        34,
        46
      ],
      "returns": true
    },
    {
      "id": "break_solo",
      "bars": 8,
      "role": "Solo de lead con dropout antes de volver",
      "energy": 0.85,
      "density": [
        28,
        42
      ],
      "returns": false
    },
    {
      "id": "outro",
      "bars": 8,
      "role": "Repetición con capas que salen y cierre percusivo",
      "energy": 0.4,
      "density": [
        18,
        30
      ],
      "returns": false
    }
  ],
  "rhythm": {
    "grid": "16th",
    "patterns": [
      {
        "name": "four_on_floor_funk",
        "steps": "Kick 0,8 (10 opcional); snare 4,12; hat 0-15; openhat 6,14",
        "accents": [
          0,
          4,
          6,
          8,
          12,
          14
        ]
      },
      {
        "name": "slap_bass_octaves",
        "steps": "Raíz 0,4,8,12; octava aguda 3,7,11,15; cromatismo de paso en 14 al cambiar de acorde",
        "accents": [
          0,
          3,
          4,
          7,
          8,
          11,
          12,
          15
        ]
      },
      {
        "name": "rhodes_stabs",
        "steps": "Acordes cortos en 2,6,10,14; 0 y 8 quedan para el kick",
        "accents": [
          2,
          6,
          10,
          14
        ]
      },
      {
        "name": "brass_call",
        "steps": "Stab de dos notas en 12 y 14 del último compás de cada frase de cuatro",
        "accents": [
          12,
          14
        ]
      }
    ],
    "groove": "Pulso recto y bailable; la síncopa está en el bajo y en los stabs, la caja se mantiene asentada en 2 y 4",
    "claves": []
  },
  "harmony": {
    "progressions": [
      "IVM7 -> V7 -> iii7 -> vi7 (royal road; en C: Fmaj7-G7-Em7-Am7)",
      "ii7 -> V9 -> iii7 -> vi7 (turnaround AOR; en C: Dm7-G9-Em7-Am7)",
      "IVM7 -> IVm7 -> iii7 -> vi7 (descenso con iv prestado)",
      "iii7 -> VI7 -> ii7 -> V7 (turnaround de jazz-funk)"
    ],
    "cadences": [
      "ii7 -> V7 -> IM7",
      "IVM7 -> V7 -> IM7",
      "IVm7 -> I (plagal menor)"
    ],
    "borrowed": [
      "IVm7",
      "bVII7",
      "V7/iii"
    ],
    "notes": "Evitar tríadas desnudas; el mínimo es séptima. La 9ª se reparte en strings o arp porque el campo chord no la admite."
  },
  "melody": {
    "range": "C4-C6",
    "motif": "3-5 notas: salto ascendente de 4ª o 6ª, descenso por grados conjuntos y anticipación en el paso 15 del compás anterior",
    "phrasing": "Frases de 2 o 4 compases con respiración; llamada del lead y respuesta de brass al final",
    "ornaments": [
      "notas de paso cromáticas",
      "saltos de octava",
      "slide a la nota siguiente"
    ],
    "avoid": [
      "melodía de marcha sin síncopa",
      "frases que llenan todos los pasos",
      "escalas menores armónicas oscuras"
    ]
  },
  "roles": [
    {
      "role": "lead",
      "instruments": [
        "pwm",
        "pulse"
      ],
      "range": "C4-C6",
      "behavior": "Melodía sincopada y solos con notas ligadas; deja respirar al groove"
    },
    {
      "role": "bass",
      "instruments": [
        "pluck",
        "bass"
      ],
      "range": "C1-C3",
      "behavior": "Pluck da el ataque slap en octavas; bass sostiene la raíz en los tiempos fuertes"
    },
    {
      "role": "harmony",
      "instruments": [
        "piano",
        "guitar"
      ],
      "range": "C3-C5",
      "behavior": "Stabs de acorde en 2,6,10,14; guitarra funk opcional con cortes secos"
    },
    {
      "role": "pad_strings",
      "instruments": [
        "strings",
        "pad"
      ],
      "range": "C3-C6",
      "behavior": "Sostiene 5ª y 9ª para completar el voicing sin saturar el medio"
    },
    {
      "role": "brass",
      "instruments": [
        "brass"
      ],
      "range": "C4-C6",
      "behavior": "Stabs cortos en 12 y 14 al final de frases; nunca fanfarria continua"
    },
    {
      "role": "drums",
      "instruments": [
        "drums"
      ],
      "range": "—",
      "behavior": "Kick 0/8, snare 4/12, hats en semicorcheas con openhat 6/14 y fills de toms en dropouts"
    }
  ],
  "instrumentation": {
    "required": [
      "pluck",
      "bass",
      "piano",
      "strings",
      "pwm",
      "drums"
    ],
    "optional": [
      "brass",
      "guitar",
      "pad",
      "bell",
      "arp"
    ],
    "avoid": [
      "saw"
    ]
  },
  "production": {
    "effects": [
      "chorus",
      "reverb",
      "delay",
      "drive"
    ],
    "texture": "Limpia, brillante y amplia; sin crush ni distorsión pesada",
    "mix": "Bajo centrado y definido, caja nítida, piano a la izquierda, strings y brass a la derecha, lead al centro"
  },
  "chiptune": {
    "translation": "Groove disco-funk de 16avos con bajo pluck+bass en octavas, stabs de piano con chorus, strings que completan el voicing y lead pwm con delay corto",
    "constraints": [
      "No hay voces ni coros",
      "No hay automatización de filtros ni pitch bend por nota; solo slide",
      "El campo chord no admite 9ª ni 11ª; solo tríadas, séptimas, sus4 y power",
      "No hay acordes sostenidos reales: chord es un arpegio rápido"
    ],
    "workarounds": [
      "Repartir el voicing: piano 3ª/7ª y strings 5ª/9ª",
      "Duplicar el ataque del bajo con pluck y el cuerpo con bass",
      "Escribir la 9ª como nota de strings o arp, no como chord",
      "Usar slide para aproximar glissandos del lead"
    ]
  },
  "silence": {
    "breaks": [
      {
        "section": "break_solo",
        "bars": "segunda mitad del compás 8 de la frase",
        "whatStops": "Cortar bass, pluck, piano y strings; solo queda drums con fill de toms"
      },
      {
        "section": "outro",
        "bars": "segunda mitad del último compás",
        "whatStops": "Los tonales paran y la batería cierra con toms, sin crash final"
      }
    ],
    "dropouts": [
      "Dropout tonal en la segunda mitad del compás 8, con tomhi-tommid-tomlo y crash en el compás siguiente",
      "Silencio de dos pasos antes del coro para acentuar la reentrada",
      "El piano y los strings pueden desaparecer durante la estrofa si el lead necesita espacio"
    ],
    "rules": [
      "Al menos un dropout cada 8 compases",
      "El silencio se hace dejando de tocar, no bajando el volumen",
      "No dejar dos secciones seguidas con la misma instrumentación y densidad"
    ]
  },
  "must": [
    "Usar acordes con séptima (M7, m7, 7) y 9ª repartida en strings cuando se pueda",
    "Bajo en octavas con síncopa de semicorchea: raíz en 0,4,8,12 y octava en 3,7,11,15",
    "Hi-hat en semicorcheas con openhat en 6 y 14",
    "Respuesta de brass al final de frases de 2 o 4 compases",
    "Textura limpia con chorus y reverb, sin crush",
    "Anticipación melódica en el paso 15 y respiración al final de frase",
    "Dropout con fill de toms antes del coro o del cierre"
  ],
  "avoid": [
    "Tríadas desnudas 1-3-5 sin tensión",
    "Bajo en negras a tiempo fuerte, sin octavas ni síncopas",
    "Drive alto o crush: convierten el city pop en rock o chiptune industrial",
    "Melodía de marcha sin síncopa ni respiración",
    "Power chords o riffs de guitarra rock",
    "Copiar melodías, riffs o progresiones de obras existentes"
  ],
  "acceptance": [
    "En los compases 1-2 se reconoce la base disco-funk/boogie por el bajo en octavas y el hi-hat con apertura en contratiempo",
    "En los compases 3-4 el piano con chorus y los acordes con séptima dan la sofisticación AOR, no pop infantil",
    "En los compases 5-8 la melodía entra con salto y anticipación, y el brass responde sin taparla",
    "En el compás 12 el corte tonal y el fill de toms crean expectativa; el crash del 13 resuelve",
    "En el compás 16 el segundo dropout deja silencio real, no un simple descenso de volumen",
    "Si se quita el bajo slap se nota que falta la célula; si se quita el piano se nota que falta el color armónico"
  ],
  "sources": [
    {
      "title": "Pacific Breeze: Japanese City Pop, AOR & Boogie 1976-1986",
      "author": "Light in the Attic Records",
      "year": "2019",
      "url": "https://lightintheattic.net/products/pacific-breeze-japanese-city-pop-aor-boogie-1976-1986",
      "type": "Liner notes / compilatorio",
      "claim": "City Pop surge a mediados de los 70 y domina los 80; mezcla groove, boogie, techno-pop y AOR; música sofisticada ligada a la prosperidad urbana."
    },
    {
      "title": "Japanese Popular Music: Culture, Authenticity and Power",
      "author": "Carolyn S. Stevens",
      "year": "2008",
      "isbn": "978-0415492218",
      "doi": "10.4324/9780203945018",
      "type": "Libro académico",
      "claim": "Contexto de producción, tecnología y asimilación de técnicas occidentales en la música popular japonesa; no es un análisis específico de city pop."
    },
    {
      "title": "The Royal Road Progression in Japanese Popular Music",
      "author": "Maxwell Ramage",
      "year": "2023",
      "doi": "10.1093/mts/mtad008",
      "url": "https://doi.org/10.1093/mts/mtad008",
      "type": "Artículo académico",
      "claim": "La royal road es IVM7-V7-iii7-vi7 (arquetipo F-G-Em-Am) y es central en la música popular japonesa, incluido city pop."
    },
    {
      "title": "Hiroshi Nagai: Paintings for Music",
      "author": "Japan Foundation",
      "year": "2020",
      "url": "https://sydney.jpf.go.jp/jpf/jpfmedia/JPF-HNCatalogue-R7-Issuu.pdf",
      "type": "Ensayo curatorial",
      "claim": "City pop como mezcla pulida de synth-pop, disco, funk, boogie, jazz-fusion y R&B; el término es retrospectivo."
    },
    {
      "title": "Feeling Déjà Vu in Japanese: Discovering City Pop, Japanese Jazz Fusion, and their origins in Black American Music",
      "author": "Reem Numan",
      "year": "2026",
      "url": "https://blog.iias.asia/pop-pacific/feeling-deja-vu-japanese-discovering-city-pop-japanese-jazz-fusion-and-their-origins-black-american",
      "type": "Ensayo divulgativo",
      "claim": "Influencia de funk, disco, soul, R&B y bossa nova; uso de slap bass y de la progresión ii-V-iii-vi."
    },
    {
      "title": "シティポップの名フレーズ40 (Bass Magazine Archive Series 2)",
      "author": "Bass Magazine Japan",
      "year": "2017",
      "isbn": "978-4-8456-2986-2",
      "type": "Método de análisis",
      "claim": "Vocabulario de bajo del género: frases de octavas, slap y articulación rítmica."
    },
    {
      "title": "Japanese City Pop: Selected 500 over titles of albums",
      "author": "木村ユタカ (Yutaka Kimura)",
      "year": "2008",
      "isbn": "978-4401617738",
      "type": "Guía discográfica",
      "claim": "Delimitación discográfica y periodización del repertorio; no es un tratado armónico."
    },
    {
      "title": "Chord Progressions by Genre: All 29 Compared",
      "author": "chordprogressions.org",
      "year": "2026",
      "url": "https://chordprogressions.org/genres/",
      "type": "Base de datos web (secundaria)",
      "claim": "Tempo orientativo de city pop 92-118 BPM y presencia de acordes con séptima; fuente de baja confianza, solo para contraste."
    }
  ],
  "openQuestions": [
    "El tempo tiene dos lecturas: 92-118 BPM (tabla secundaria) y 110-128 BPM (variante boogie). Se eligió 96-124 con típico 112; falta confirmar con escucha.",
    "No hay una fuente verificada para el patrón exacto de stabs 2,6,10,14; es una inferencia del funk/disco, no una transcripción.",
    "La combinación pluck+bass puede emborronar graves en altavoces pequeños; el test usa pluck una octava arriba para separar.",
    "El campo chord no admite 9ª/11ª. El test resuelve con séptimas y deja las extensiones a strings; falta escuchar si alcanza.",
    "El término city pop es retrospectivo y amplio. Este spec cubre la célula boogie/AOR de Tokio, no las baladas ni el neo-city-pop posterior.",
    "Se eliminaron fuentes inventadas del inbox (Sayonara City Pop, guía chip-audio, DOI de Kawamoto); la confianza baja a 0.72 y varias afirmaciones de producción quedan como inferencia."
  ]
}
```
