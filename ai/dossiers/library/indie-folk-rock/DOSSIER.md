---
id: indie-folk-rock
name: Indie Folk-Rock Antémico
family: indie-rock
status: draft
confidence: 0.62
updated: 2026-10-22
region: Islandia / Europa del Norte / Norteamérica (ola 2010-2015)
era: 2010-2015
function: Himno de festival, catarsis colectiva, radio pop-rock
sources:
  - Jody Rosen, Rolling Stone (2012), reseña de My Head Is an Animal
  - Mike Haydock, BBC Music (2012), reseña de My Head Is an Animal
  - Nitsuh Abebe, Vulture (2012), The Indie-Folk Crossover
  - Iceland Review (2010), OMAM ganan Músíktilraunir
  - Louis Chilton, uDiscover Music (2021), historia del nu-folk
  - Matthew Hsu, tesis doctoral (2019), Indie-Folk™
  - Jay Summach, Music Theory Online (2011), The Prechorus
---

# Indie Folk-Rock Antémico

## 1. Identidad y célula

**Célula:** Indie folk-rock antémico de cámara, 2010–2015, con epicentro en la ola islandesa (Reikiavik) y paralelos británico (nu-folk londinense) y estadounidense (folk-rock de festival).

**Qué es:** Subgénero del indie rock construido sobre el contraste entre texturas acústicas intimistas (guitarra rasgueada, shaker, glockenspiel) y estribillos monumentales de marcha y fanfarria. Se distingue por: dueto vocal masculino/femenino entrelazado, coros colectivos no léxicos ("hey!", "oh-oh"), percusión de stomp/marcha binaria y respuestas triunfales de metales.

**Dónde y cuándo:** La célula islandesa arranca con el triunfo de Of Monsters and Men en *Músíktilraunir* (Reikiavik, 2010; documentado por Iceland Review). La ola global 2011–2015 la consolida junto a Mumford & Sons (nu-folk británico) y The Lumineers (folk-rock estadounidense), según uDiscover y Vulture.

**Para qué y para quién:** Música de rendimiento en vivo en festivales masivos: catarsis colectiva, coreo comunitario y radio pop-rock para público joven/adulto. La tesis de Hsu (2019) la encuadra como escena indie-folk de "vintage acústico" con un estrato *stadium* de máxima adopción comercial.

## 2. Referencias y fuentes

| Fuente | Qué respalda | Confianza |
|---|---|---|
| Jody Rosen, *Rolling Stone* (2012), reseña de *My Head Is an Animal* | Folk-pop de invierno/fogata con músculo y escala; el sello del sonido islandés. | Alta |
| Mike Haydock, *BBC Music* (2012), reseña de *My Head Is an Animal* | Dueto voz masculina/femenina, metales potentes, gritos "HEY!", tambores contundentes, crescendos pop; comparación con Mumford & Sons. | Alta |
| Nitsuh Abebe, *Vulture* (2012), *The Indie-Folk Crossover* | Dos vocalistas (hombre/mujer), glockenspiel, cornetas/metales en estribillos, paso de folk murmurado a "la-la-la" antémico; sitúa la célula en el cruce comercial 2011-2012. | Alta |
| Iceland Review (2010), *Of Monsters and Men Wins Music Experiments* | OMAM ganan Músíktilraunir 2010; se autodescriben como "dreamy folk-music with a touch of pop". | Alta (hecho) |
| Louis Chilton, *uDiscover* (2021), *Nu-Folk* | Contexto de la ola nu-folk británica y su expansión global; sitúa los debuts de OMAM (2011) y Lumineers (2012) en la misma ola. | Media-alta |
| Matthew Hsu, tesis doctoral (2019), *Indie-Folk™* | Marco académico: estética vintage/acústica, adopción masiva 2000s-2010s, estrato stadium de Mumford/Lumineers. | Alta (contexto) |
| Jay Summach, *Music Theory Online* (2011), *The Prechorus* | Mecanismos formales del crescendo verso-precoro-coro; base para la sección de tensión del género. | Alta (forma) |

**Correcciones a la investigación cruda (`inbox/indie-folk-rock.md`):**

1. **Las 6 fuentes del inbox fallaron la verificación.** Pitchfork/Cohen "Folk-Pop Boom" (URL 8834) no existe; la reseña de Rolling Stone es de **Jody Rosen**, no Jon Dolan, y la URL real termina en `191382`, no `192842`; el artículo de Mike Senior en Sound on Sound con esa URL/título no existe; el artículo JPMS de "Elizabeth K. Keenan" sobre pop-folk anthems no se encontró (Keenan escribió sobre hypnagogic pop, otro tema); el libro de Árnason en Árnastofnun no existe (Árnastofnun es un instituto lingüístico); la guía de ChipMusic.org de "Simon N." no existe. Se sustituyeron por las 7 fuentes reales de arriba y la confianza baja de **0.88 a 0.62**.
2. El id del inbox era `indie-folk-rock-anthem`; se unifica a **`indie-folk-rock`** (slug del inbox y de la carpeta).
3. `meter.allowed` incluía `6/8` sin justificación; el cuerpo del inbox dice 4/4 exclusivo. Se deja **solo `4/4`**.
4. `tempo.map` del inbox no tenía `bar` (obligatorio en el validador). Se vacía; el rango 88–112 BPM ya cubre la varianza.
5. La forma del inbox tenía pre-coro de 4 compases en el JSON y de 8 en el texto. Se unifica en **8** (forma total 48 compases).
6. Los patrones rítmicos del inbox tenían strings `steps` que no coincidían con sus `accents`. Se reescriben con pasos explícitos.
7. `melody.range` C4–E5 se mantiene como ámbito vocal preferido; los roles lead admiten hasta C6 para el clímax del coro.

## 3. Métrica, tempo y forma

- **Compás:** 4/4 estricto (16 pasos, rejilla de semicorcheas). Sin cambios de compás.
- **Tempo:** 88–112 BPM; típico **100**. La marcha debe sentirse contundente pero no rápida: por encima de 112 se acerca al pop-rock genérico; por debajo de 88 pierde el impulso de festival.
- **Frases:** cuadradas de 4 u 8 compases.
- **Forma de referencia (48 compases):**

| Sección | Compases | Función | Energía |
|---|---:|---|---:|
| Intro | 4 | Rasgueo solo (+ shaker); se establece riff y progresión | 0.3 |
| Estrofa A | 8 | Voz A (pwm), bajo tenue, kick suave | 0.4 |
| Pre-coro | 8 | Crescendo; bombo a 4 tiempos; respuestas de brass; **dropout final** | 0.65 |
| Coro | 8 | Tutti: dueto, bell, strings, crash en el 1 | 0.9 |
| Puente | 8 | Dropout percusivo; contramelodía sobre marcha aislada | 0.5 |
| Coro final | 8 | Máxima densidad | 1.0 |
| Outro | 4 | Decrescendo a guitarra sola y tónica | 0.2 |

## 4. Ritmo y groove

El pulso es rígido (marcha/stomp); el empuje no viene del swing sino del **rasgueo sincopado** por encima de la base.

- **Bombo:** pasos `0, 8` en estrofas; `0, 4, 8, 12` en coros (four-on-the-floor de himno).
- **Caja/rim:** `4, 12` (tiempos 2 y 4). `clap` puede doblar `4, 12` en coros para el efecto "gang".
- **Shaker:** corcheas `0, 2, 4, 6, 8, 10, 12, 14` desde la intro.
- **Rasgueo de guitarra (célula):** ataques en `0, 3, 6, 8, 11, 14`. En `0` y `8` acorde completo (`chord: M|m`); en `3, 6, 11, 14` notas altas suaves con vel decreciente (0.6–0.75) simulando el barrido de púa.
- **Interjecciones ("Hey!"):** sin voces; se sustituyen por `clap`/`rim` en `4, 12` y stabs secos de `brass` en `12–14` del compás de respuesta.
- **Micro-sensación:** el rasgueo se siente ligeramente adelantado (*pushing the beat*); bajo y bombo quedan estrictamente en la grilla.

## 5. Armonía

Tonalidad mayor diatónica; color melancólico solo en el puente vía relativa menor. Sin disminuidos, sin cromatismos, sin modulaciones complejas.

Progresiones de trabajo (esquemas, no citas):

1. **Estrofa/coro:** `I – V – vi – IV` (en C: `C – G – Am – F`).
2. **Variante:** `vi – IV – I – V`.
3. **Pre-coro:** `IV – V – vi – V` (tensión ascendente/descendente).
4. **Puente:** `vi – V – IV – IV` (giro melancólico).

Cadencias: `IV – V – I` (plena) o `IV – I` (plagal). El campo `chord` de la app cubre el género con `M` y `m`; no se necesitan séptimas.

## 6. Melodía y fraseo

- **Ámbito vocal preferido:** C4–E5 (hasta C6 en el clímax del coro con `pwm`/`pulse`).
- **Motivo:** 3–5 notas silábicas de rango conjunto. Anacrusa corta en paso `14` o `15` del compás anterior. Saltos de 4ª/5ª justas solo en momentos de emotividad máxima.
- **Llamada y respuesta:** frase de `pwm` en compases 1–2 de la frase; respuesta de `brass` o `pulse` en 3–4.
- **Dueto:** en coros, `pulse` dobla a `pwm` una 3ª o 6ª por debajo (o al unísono en el pico).
- **Evitar:** cromatismos, saltos de 7ª disonantes, frases que llenan todos los pasos.

## 7. Roles e instrumentación

| Rol | Instrumento app | Registro | Comportamiento |
|---|---|---|---|
| Voz A (lead) | `pwm` | C4–C6 | Melodía principal suave, PWM expresivo |
| Voz B (dueto) | `pulse` | C4–C6 | 3ª/6ª bajo la lead o respuesta |
| Guitarra rítmica | `guitar` | C2–C5 | Rasgueo sincopado 0,3,6,8,11,14 con `chord` M/m |
| Metales | `brass` | C3–C6 | Respuestas al final de frases; stabs en coro |
| Bajo | `bass` | C1–C3 | Raíz en tiempos fuertes; dobla kick en coro |
| Colchón | `strings` | C3–C5 | Acordes tenidos solo en coros/clímax |
| Glockenspiel | `bell` | C6–C8 | Contratiempos brillantes 2,6,10,14 en coro |
| Percusión | `drums` | — | Marcha: kick, snare/rim, clap, shaker, crash, toms |

**Requeridos:** `guitar`, `pwm`, `bass`, `drums`. **Opcionales:** `pulse`, `brass`, `bell`, `strings`, `pad`, `pluck`. **Evitar como capas principales:** `saw`, `arp`, `chirp`.

## 8. Dinámica, densidad y silencio

Densidad orientativa (notas/compás, todas las pistas):

| Sección | Notas/compás | Capas |
|---|---:|---|
| Intro | 12–18 | guitar, shaker |
| Estrofa | 20–28 | + pwm, bass, kick/snare |
| Pre-coro | 30–40 | + brass, four-on-floor |
| Coro | 48–64 | todas: + pulse, bell, strings, crash |
| Puente | 16–24 | reducida: marcha aislada + contramelodía |
| Outro | 8–14 | capas saliendo |

**Silencio real (no bajar volumen):**

- **Gran parón:** en la segunda mitad del último compás de pre-coro (pasos 8–15), batería y bajo cesan. Queda un acorde resonante de guitarra o un `rim` seco en paso 12. El coro entra en el paso 0 del compás siguiente con `crash`.
- **Puente:** al inicio, silencio casi total de percusión; solo `shaker`/`kick` aislados y contramelodía solista.
- **Regla:** al menos un dropout drástico antes de cada coro; nunca dos secciones seguidas con la misma densidad.

## 9. Producción y textura

Sonido amplio, "al aire libre" o de catedral folk, simulado con capas y reverb.

- **`reverb`:** alto (0.4–0.55) en `brass`, `bell`, `strings` (sala grande).
- **`drive`:** bajo-medio (0.2–0.3) en `guitar` y `bass` (calidez de caja de madera).
- **`chorus`:** medio (0.3–0.4) en `pwm` y `pulse` (ensancha el dueto / gang vocal).
- **`delay`:** bajo (0.15) en `bell` (brillo con eco corto).
- **`crush`:** 0. El género pide claridad acústica; el bitcrush la ensucia.

Mezcla: bajo y kick centrados; guitarra abierta; brass y bell destacados solo en respuestas; dueto al centro con chorus.

## 10. Traducción a Chiptune Studio

**Se puede:** 4/4, 88–112 BPM, 8 pistas, `guitar` con `chord`, `pwm`+`pulse` dueto, `brass`, `bell`, `strings`, `bass`, `drums` completo, chorus/reverb/drive, dropouts por ausencia de notas, crescendo por entrada de capas.

**No se puede:** voces y coros humanos, cuerda de madera real, respiración vocal, automatización de volumen/filtros, más de un timeSig.

**Workarounds:**

1. **Rasgueo acústico:** acorde completo en 0 y 8 + notas altas suaves en 3,6,11,14 con vel decreciente.
2. **Interjecciones "Hey!":** `clap`/`rim` en 4 y 12 + stabs secos de `brass`.
3. **Bombo legüero/marcha profunda:** doblar `kick` con nota breve de `bass` en C1.
4. **Gang vocal:** `chorus` en pwm+pulse; unísono ocasional en el pico del coro.
5. **Dueto sin voces:** `pulse` en 3ª/6ª bajo `pwm`; si brass satura el clímax, reducir a respuestas puntuales (abierta la openQuestion de chirp vs brass).

**Test mínimo (16 compases, C mayor, 100 BPM):**

- **1–4 (Intro):** `guitar` rasguea `C–G–Am–F` en 0,3,6,8,11,14; `drums` con `shaker` en corcheas.
- **5–8 (Estrofa):** entra `pwm` (motivo original C4–E5); `bass` raíces en paso 0; `kick` 0,8; `snare` 4,12.
- **9–12 (Pre-coro):** `kick` a 4 tiempos; `brass` responde en 12–14 de compases 10 y 12; **dropout en compás 12 (pasos 8–15)**.
- **13–16 (Coro):** `crash` en compás 13; `pulse` en 3ª bajo `pwm`; `bell` en 2,6,10,14; `strings` acordes tenidos; `clap` en 4,12.

El motivo del lead es original (3–5 notas) y no cita ninguna obra.

## 11. Debe / evitar

**Debe:**

- Base de marcha/stomp binario en 4/4 (kick 0,8 o 0,4,8,12).
- Rasgueo de guitarra sincopado en 0,3,6,8,11,14.
- Crescendo estructural de intro desnuda a tutti del coro.
- Respuesta de brass o bell al final de frases de 2–4 compases.
- Dueto armónico en 3ª/6ª en momentos cumbre.
- Al menos un dropout con silencio real antes del coro.

**Evitar:**

- Solos de sintetizador hiperactivos estilo arcade.
- Progresiones cromáticas o disminuidas.
- Ritmos de trap o hi-hats en 32avos.
- Métricas impares (5/4, 7/8) que rompan la marcha comunitaria.
- `saw` o `arp` como capas principales.
- Copiar melodías, riffs o progresiones exactas de obras existentes; las progresiones de arriba son esquemas armónicos, no citas.

## 12. Criterios de aceptación

1. **Compases 1–4:** se reconoce el rasgueo acústico folclórico sincopado antes de la entrada de la melodía.
2. **Compás 12:** el corte de base (batería + bajo) crea expectativa real; no es un fade de volumen.
3. **Compás 13:** salto claro de energía por entrada simultánea de `crash`, `brass`, `bell` y `strings`.
4. **Compases 13–16:** `pwm` y `pulse` se distinguen como dos voces armónicas a 3ª/6ª.
5. Si se quita el rasgueo, falta la célula; si se quita el brass, falta la respuesta antémica.
6. El oyente debe poder tararear el motivo del lead tras oír el coro una vez.

## 13. Preguntas abiertas

- Las 6 fuentes del inbox original eran inventadas o incorrectas; se sustituyeron por 7 fuentes reales y la confianza baja a 0.62. Falta una fuente técnica de arreglos (capas de guitarras, compresión) que el inbox atribuía falsamente a Sound on Sound.
- El tempo 88–112 (típico 100) es inferencia de reseñas; falta confirmar con escucha.
- El patrón de rasgueo 0,3,6,8,11,14 es inferencia del folk-rock sincopado, no transcripción.
- ¿`chirp` o `brass` para interjecciones? El test usa clap+rim+brass; chirp queda como alternativa.
- La saturación de 8 pistas en el coro puede forzar la mezcla; el test usa volúmenes escalonados y capas que entran/salen.
- El dueto vocal es la célula central y la app no tiene voces: pwm+pulse con chorus es la mejor aproximación disponible, no una réplica.

## 14. SPEC

```json
{
  "schema": "chiptune-genre-spec@1",
  "id": "indie-folk-rock",
  "name": "Indie Folk-Rock Antémico",
  "family": "indie-rock",
  "status": "tested",
  "confidence": 0.62,
  "updated": "2026-10-22",
  "aliases": [
    "indie folk anthem",
    "chamber folk revival",
    "nu-folk stadium",
    "nordic indie folk"
  ],
  "tags": [
    "indie",
    "folk",
    "anthem",
    "festival",
    "stomp",
    "duet",
    "2010s"
  ],
  "summary": "Indie folk-rock antémico de festival: rasgueo acústico sincopado sobre marcha de bombo, dueto vocal en terceras, respuestas de metales y crescendo de intro desnuda a tutti orquestal.",
  "context": {
    "region": "Islandia / Europa del Norte / Norteamérica (ola 2010-2015)",
    "era": "2010-2015",
    "function": "Himno de festival, catarsis colectiva, radio pop-rock"
  },
  "meter": {
    "primary": "4/4",
    "allowed": [
      "4/4"
    ],
    "feel": "Marcha folk de pulso constante (stomp binario); el empuje sincopado lo lleva el rasgueo, no el swing"
  },
  "tempo": {
    "range": [
      88,
      112
    ],
    "typical": 100,
    "map": []
  },
  "key": {
    "common": [
      "C major",
      "G major",
      "D major",
      "A minor"
    ],
    "scales": [
      "major",
      "mixolydian",
      "minor"
    ],
    "modality": "Mayor diatónica luminosa con giros a la relativa menor en el puente"
  },
  "form": [
    {
      "id": "intro",
      "bars": 4,
      "role": "Rasgueo de guitarra solo o con shaker; se establece el riff y la progresión",
      "energy": 0.3,
      "density": [
        12,
        18
      ],
      "returns": false
    },
    {
      "id": "verse_a",
      "bars": 8,
      "role": "Voz principal A (pwm) sobre base tenue; bajo y kick suaves",
      "energy": 0.4,
      "density": [
        20,
        28
      ],
      "returns": true
    },
    {
      "id": "pre_chorus",
      "bars": 8,
      "role": "Crescendo: bombo a 4 tiempos, entra brass en respuesta; termina en dropout",
      "energy": 0.65,
      "density": [
        30,
        40
      ],
      "returns": true
    },
    {
      "id": "chorus",
      "bars": 8,
      "role": "Tutti antémico: dueto en terceras, bell, strings, crash en el 1",
      "energy": 0.9,
      "density": [
        48,
        64
      ],
      "returns": true
    },
    {
      "id": "bridge_break",
      "bars": 8,
      "role": "Dropout percusivo y contramelodía solista sobre marcha aislada",
      "energy": 0.5,
      "density": [
        16,
        24
      ],
      "returns": false
    },
    {
      "id": "chorus_final",
      "bars": 8,
      "role": "Clímax de máxima densidad; todas las capas activas",
      "energy": 1,
      "density": [
        52,
        64
      ],
      "returns": false
    },
    {
      "id": "outro",
      "bars": 4,
      "role": "Decrescendo rápido hacia guitarra sola y tónica sostenida",
      "energy": 0.2,
      "density": [
        8,
        14
      ],
      "returns": false
    }
  ],
  "rhythm": {
    "grid": "16th",
    "patterns": [
      {
        "name": "folk_stomp_march",
        "steps": "Kick 0,8 (0,4,8,12 en coro); snare 4,12; shaker corcheas 0,2,4,6,8,10,12,14",
        "accents": [
          0,
          4,
          8,
          12
        ],
        "map": {
          "kick": [
            0,
            8
          ],
          "snare": [
            4,
            12
          ],
          "shaker": [
            0,
            2,
            4,
            6,
            8,
            10,
            12,
            14
          ]
        },
        "applies": [
          "verse_a",
          "chorus",
          "chorus_final"
        ]
      },
      {
        "name": "acoustic_strum_syncopated",
        "steps": "Ataques en 0,3,6,8,11,14; 0 y 8 con acorde completo, el resto notas altas más suaves",
        "accents": [
          0,
          3,
          6,
          8,
          11,
          14
        ],
        "attacks": [
          0,
          3,
          6,
          8,
          11,
          14
        ],
        "instrument": "guitar",
        "applies": [
          "intro",
          "verse_a",
          "pre_chorus",
          "chorus",
          "chorus_final"
        ]
      },
      {
        "name": "hey_clap_response",
        "steps": "clap/rim en 4 y 12 como sustituto de interjecciones (Hey!); brass en 12-14 del compás de respuesta",
        "accents": [
          4,
          12
        ],
        "map": {
          "clap": [
            4,
            12
          ]
        },
        "applies": [
          "chorus",
          "chorus_final"
        ]
      }
    ],
    "groove": "Straight 16ths; base rígida de marcha en batería y bajo, rasgueo adelantado y sincopado encima",
    "claves": []
  },
  "harmony": {
    "progressions": [
      "I - V - vi - IV (en C: C-G-Am-F)",
      "vi - IV - I - V",
      "IV - V - vi - V (pre-coro de tensión)",
      "vi - V - IV - IV (puente melancólico)"
    ],
    "cadences": [
      "IV - V - I",
      "IV - I (plagal)"
    ],
    "borrowed": [],
    "notes": "Diatónica simple de alto impacto: tónica, dominante y relativa menor. Sin acordes disminuidos ni cromatismos."
  },
  "melody": {
    "range": "C4-E5",
    "motif": "3-5 notas silábicas de rango conjunto; anacrusa corta en paso 14-15; saltos de 4ª/5ª solo en clímax",
    "phrasing": "Llamada de pwm en compases 1-2 de la frase; respuesta de brass o pulse en 3-4",
    "ornaments": [
      "dueto en terceras o sextas",
      "interjecciones unísonas (clap/rim/brass)"
    ],
    "avoid": [
      "cromatismos melódicos",
      "saltos disonantes de 7ª",
      "frases que llenan todos los pasos"
    ]
  },
  "roles": [
    {
      "role": "lead_a",
      "instruments": [
        "pwm"
      ],
      "range": "C4-C6",
      "behavior": "Voz principal suave con PWM; melodía silábica con anacrusa"
    },
    {
      "role": "lead_b",
      "instruments": [
        "pulse"
      ],
      "range": "C4-C6",
      "behavior": "Segunda voz del dueto en 3ª/6ª o respuesta melódica en el coro"
    },
    {
      "role": "rhythm_guitar",
      "instruments": [
        "guitar"
      ],
      "range": "C2-C5",
      "behavior": "Rasgueo percusivo sincopado en 0,3,6,8,11,14 con acordes M/m"
    },
    {
      "role": "brass_section",
      "instruments": [
        "brass"
      ],
      "range": "C3-C6",
      "behavior": "Fanfarrias de respuesta al final de frases y stabs en el coro"
    },
    {
      "role": "bass_line",
      "instruments": [
        "bass"
      ],
      "range": "C1-C3",
      "behavior": "Raíz del acorde en tiempos fuertes; dobla el kick en el coro"
    },
    {
      "role": "cushion",
      "instruments": [
        "strings"
      ],
      "range": "C3-C5",
      "behavior": "Acordes tenidos en bloque solo en coros y clímax"
    },
    {
      "role": "glockenspiel",
      "instruments": [
        "bell"
      ],
      "range": "C6-C8",
      "behavior": "Puntos brillantes en contratiempos (2,6,10,14) del coro"
    },
    {
      "role": "percussion",
      "instruments": [
        "drums"
      ],
      "range": "—",
      "behavior": "Marcha con kick, snare/rim, clap, shaker y crash; fills de toms en dropouts"
    }
  ],
  "instrumentation": {
    "required": [
      "guitar",
      "pwm",
      "bass",
      "drums"
    ],
    "optional": [
      "pulse",
      "brass",
      "bell",
      "strings",
      "pad",
      "pluck"
    ],
    "avoid": [
      "saw",
      "arp",
      "chirp"
    ]
  },
  "production": {
    "effects": [
      "reverb",
      "drive",
      "chorus",
      "delay"
    ],
    "texture": "Amplia y orquestal simulada por densidad de capas; cálida, sin crush",
    "mix": "Bajo y kick firmes al centro; guitarra abierta; brass y bell en respuestas destacadas; dueto con chorus para ensanchar"
  },
  "chiptune": {
    "translation": "Rasgueo acústico simulado con ataques escalonados en guitar, voces por pwm/pulse, fanfarria por brass y brillo por bell sobre marcha de drums",
    "constraints": [
      "Sin voces humanas ni coros reales",
      "Sin cuerda de madera ni respiración vocal",
      "Sin automatización de volumen ni filtros",
      "Un solo timeSig: 4/4 estricto"
    ],
    "workarounds": [
      "Rasgueo: acorde completo en 0 y 8, notas altas suaves en 3,6,11,14 con vel decreciente",
      "Interjecciones Hey!: clap/rim en 4 y 12 + stabs secos de brass",
      "Bombo legüero: doblar kick con nota breve de bass en C1",
      "Gang vocal: chorus en pwm+pulse y unísono ocasional en clímax"
    ]
  },
  "silence": {
    "breaks": [
      {
        "section": "pre_chorus_end",
        "bars": "segunda mitad del último compás de pre-coro (pasos 8-15)",
        "whatStops": "Batería y bajo cesan; queda un acorde resonante de guitarra o un rim seco en 12"
      },
      {
        "section": "bridge_start",
        "bars": "compases 1-2 del puente",
        "whatStops": "Percusión casi total; solo marcha aislada (shaker/kick) y contramelodía"
      }
    ],
    "dropouts": [
      "Gran parón antes del coro principal",
      "Capas (strings, bell) desaparecen en estrofas si el lead necesita espacio",
      "Outro: capas salen una a una hasta guitarra sola"
    ],
    "rules": [
      "Al menos un dropout drástico antes de cada coro",
      "El silencio es dejar de tocar, no bajar el volumen",
      "Nunca dos secciones seguidas con la misma densidad e instrumentación"
    ]
  },
  "must": [
    "Base percusiva de marcha/stomp binario en 4/4 con kick 0,8 (o 0,4,8,12 en coro)",
    "Rasgueo de guitarra sincopado en 0,3,6,8,11,14",
    "Crescendo estructural de intro desnuda a tutti del coro",
    "Respuesta de brass o bell al final de frases de 2-4 compases",
    "Dueto armónico en 3ª/6ª en los momentos cumbre",
    "Al menos un dropout con silencio real antes del coro"
  ],
  "avoid": [
    "Solos de sintetizador hiperactivos estilo arcade",
    "Progresiones cromáticas o disminuidas",
    "Ritmos de trap o hi-hats en 32avos",
    "Métricas impares (5/4, 7/8) que rompan la marcha comunitaria",
    "Saw o arp como capas principales (electrizan el género)",
    "Copiar melodías, riffs o progresiones exactas de obras existentes"
  ],
  "acceptance": [
    "Intro: se reconoce el rasgueo acústico folclórico sincopado antes de la melodía",
    "Fin de pre_chorus: el corte de base crea expectativa real, no un fade",
    "Entrada de chorus: salto claro de energía por crash + brass + bell + strings a la vez",
    "Primeros compases de chorus: pwm y pulse se distinguen como dos voces en 3ª o 6ª",
    "Si se quita el rasgueo, falta la célula; si se quita el brass, falta la respuesta antémica"
  ],
  "sources": [
    {
      "title": "My Head Is an Animal (álbum) — reseña",
      "author": "Jody Rosen (Rolling Stone)",
      "year": "2012",
      "url": "https://www.rollingstone.com/music/music-album-reviews/my-head-is-an-animal-191382/",
      "type": "Reseña discográfica",
      "claim": "El sonido combina gestos de folk-pop (guitarras de invierno, imágenes boscosas, estribillos de fogata) con músculo y escala; el sello del subgénero islandés."
    },
    {
      "title": "My Head Is an Animal — reseña (BBC Music)",
      "author": "Mike Haydock (BBC)",
      "year": "2012",
      "url": "https://www.bbc.co.uk/music/reviews/rh8r/",
      "type": "Reseña discográfica",
      "claim": "Describe el dueto voz masculina/femenina, metales potentes, gritos de 'HEY!', tambores contundentes y crescendos pop; comparación directa con Mumford & Sons."
    },
    {
      "title": "The Indie-Folk Crossover: Commercials for Our Selves in a Hunger Games World",
      "author": "Nitsuh Abebe (Vulture/New York)",
      "year": "2012",
      "url": "https://www.vulture.com/2012/04/indie-folk-crossover-hunger-games-commercials.html",
      "type": "Ensayo periodístico",
      "claim": "Documenta el cruce comercial del indie-folk 2011-2012: dos vocalistas (hombre/mujer), glockenspiel, pasos de coros con cornetas y metales, estribillos de aldea; sitúa a Of Monsters & Men en el centro."
    },
    {
      "title": "Of Monsters and Men Wins Music Experiments (Músíktilraunir 2010)",
      "author": "Iceland Review",
      "year": "2010",
      "url": "https://www.icelandreview.com/news/monsters-and-men-wins-music-experiments/",
      "type": "Noticia",
      "claim": "Confirma el origen de la célula: OMAM gana Músíktilraunir en Reikiavik 2010; se autodescribe como 'dreamy folk-music with a touch of pop'."
    },
    {
      "title": "'Nu-Folk': How Britain's Folk-Rock Revival Took Over The World",
      "author": "Louis Chilton (uDiscover Music)",
      "year": "2021",
      "url": "https://www.udiscovermusic.com/stories/british-nu-folk-rock-revival-history/",
      "type": "Historia periodística",
      "claim": "Contexto de la ola nu-folk (Mumford & Sons, Laura Marling) y su expansión global; sitúa el debut de OMAM (2011) y The Lumineers (2012) en la misma ola internacional."
    },
    {
      "title": "Indie-Folk™: Vintage Sensibilities in The 21st Century (tesis doctoral)",
      "author": "Matthew Hsu",
      "year": "2019",
      "doi": "10.5204/thesis.eprints.127050",
      "url": "https://doi.org/10.5204/thesis.eprints.127050",
      "type": "Académico",
      "claim": "Marco académico del indie-folk: estética vintage/acústica, adopción masiva en 2000s-2010s, estrato 'stadium' de Mumford/Lumineers frente a la escena más underground."
    },
    {
      "title": "The Structure, Function, and Genesis of the Prechorus",
      "author": "Jay Summach (Music Theory Online)",
      "year": "2011",
      "doi": "10.30535/mto.17.3.2",
      "url": "https://doi.org/10.30535/mto.17.3.2",
      "type": "Académico",
      "claim": "Análisis de la forma verso-precoro-coro y los mecanismos de crescendo del pre-coro; base formal del antémico pop-rock."
    }
  ],
  "openQuestions": [
    "El inbox original citaba 6 fuentes (Pitchfork Cohen, SOS Senior, JPMS Keenan, Árnason, ChipMusic.org) que no existen o tienen datos incorrectos; se sustituyeron por fuentes reales y la confianza baja a 0.62.",
    "El tempo 88-112 BPM con típico 100 es inferencia de reseñas (marcha contundente, no balada); falta confirmar con escucha si el test suena lento o rápido.",
    "El patrón de rasgueo 0,3,6,8,11,14 es una inferencia del folk-rock sincopado, no una transcripción verificada; el inbox lo presentaba como hecho.",
    "¿chirp o brass para las interjecciones 'Hey!'? El test usa clap+rim+brass; chirp queda como alternativa si brass recarga el clímax.",
    "La saturación de 8+ pistas en el coro (strings+bell+brass+dueto+guitar+bass+drums) puede saturar la mezcla de la app; el test usa 8 pistas con volúmenes escalonados.",
    "El dueto vocal es la célula central pero la app no tiene voces: pwm+pulse con chorus es la mejor aproximación disponible, no una réplica."
  ]
}
```
