# Chiptune Studio: capacidades reales

Esta es la referencia técnica para una IA o para una persona que vaya a escribir una canción. Si algo no está aquí, no lo inventes: usa la app o pregunta.

## Límites que no se pueden superar

- **Formato:** `chiptune-studio`, versión `2`.
- **Pistas:** hasta **12**.
- **Compases:** de **1 a 64**.
- **Tempo:** de **40 a 240 BPM**.
- **Rejilla:** semicorcheas. **1 paso = 1/16 de redonda**. El paso 0 es el inicio del compás 1.
- **Compases:** `4/4` = 16 pasos, `3/4` = 12, `2/4` = 8, `5/4` = 20, `6/8` = 12, `12/8` = 24, `7/8` = 14.
- **Notas:** pitch MIDI 12–119. En la práctica, respeta el registro de cada instrumento.
- **Audio:** síntesis propia; no hay samples externos, ni audio por archivo, ni VST.
- **Efectos:** solo los cinco de la app, por pista, con envío 0–1.

## Formato mínimo

```json
{
  "format": "chiptune-studio",
  "version": 2,
  "title": "Nombre",
  "bpm": 120,
  "bars": 8,
  "timeSig": "4/4",
  "key": "D",
  "scale": "dorian",
  "loopStart": 0,
  "tempo": [
    { "bar": 4, "bpm": 150, "ramp": true },
    { "bar": 6, "bpm": 90 }
  ],
  "tracks": [
    {
      "name": "Melodía",
      "instrument": "pulse",
      "volume": 0.8,
      "pan": 0,
      "mute": false,
      "fx": { "reverb": 0.15, "delay": 0.1 },
      "notes": [
        { "step": 0, "len": 2, "pitch": "D5" },
        { "step": 2, "len": 2, "pitch": "F5", "vel": 0.7 },
        { "step": 4, "len": 4, "pitch": "A5", "slide": "G5", "chord": "M" }
      ]
    }
  ]
}
```

### Campos de la canción

| Campo | Obligatorio | Significado |
|---|---|---|
| `format` | recomendado | `"chiptune-studio"`. |
| `version` | recomendado | `2`. |
| `title` | sí | Título; también se usa para el nombre de archivo. |
| `bpm` | sí | Tempo base, 40–240. |
| `bars` | sí | 1–64. |
| `timeSig` | no | Por defecto `4/4`. Cambia los pasos por compás. |
| `key` | no | Tonalidad declarada: `"C"`, `"D"`, `"Eb"`, `"F#"` o pc 0–11. La app la usa para resaltar el tono. |
| `scale` | no | Id de escala/modo de la tabla de abajo. La app la usa para resaltar y para los acordes. |
| `loopStart` | no | Compás 0-based al que vuelve el loop. Para un loop de juego, que el final enlace con este compás. |
| `tempo` | no | Cambios de tempo por compás. Ver abajo. |
| `tracks` | sí | 1–12 pistas. |

### Pista

| Campo | Significado |
|---|---|
| `name` | Nombre visible. |
| `instrument` | Id real: `pulse`, `pwm`, `saw`, `triangle`, `arp`, `bell`, `chirp`, `brass`, `piano`, `guitar`, `strings`, `pad`, `bass`, `pluck`, `drums`. |
| `volume` | 0–1. |
| `pan` | -1 izquierda, 0 centro, 1 derecha. |
| `fx` | Envíos 0–1: `reverb`, `delay`, `chorus`, `drive`, `crush`. |
| `notes` | Lista de notas. En batería, `pitch` es una pieza, no una altura. |

### Nota melódica

| Campo | Significado |
|---|---|
| `step` | Paso de inicio, 0-based. |
| `len` | Duración en pasos: 1 = 1/16, 2 = 1/8, 4 = 1/4, 8 = 1/2, 16 = compás en 4/4. |
| `pitch` | Nota con octava: `"C4"`, `"F#5"`, `"Bb3"`. `C4` es Do central. |
| `vel` | 0.1–1 opcional. Tiempo fuerte 1; contratiempo 0.65–0.8; fantasma 0.35–0.5. |
| `slide` | Opcional. Nota destino; la voz se desliza durante la duración. Ideal para portamento, rayos, caídas. |
| `chord` | Opcional. Convierte una nota en un acorde arpegiado rápido: `M`, `m`, `dim`, `aug`, `7`, `M7`, `m7`, `sus4`, `power`. Es el truco de un solo canal. |

### Batería

`pitch` debe ser una de estas 12 piezas:

`kick` (bombo), `snare` (caja), `rim` (aro), `clap` (palmas), `hat` (charles cerrado), `openhat` (charles abierto), `shaker` (shaker), `ride` (ride), `crash` (crash), `tomlo`, `tommid`, `tomhi` (toms).

La batería siempre dura 1 paso; `len` se ignora. Usa `vel` para acentos y fantasmas. Los fills de toms y el crash al inicio de sección son recursos expresivos, no adorno obligatorio.

## Tempo por compás

`tempo` guarda **solo los cambios**, no el tempo base. Cada entrada:

```json
{ "bar": 8, "bpm": 140 }
```

- `bar` es **0-based** y debe ser **>= 1**. El compás 1 (bar 0) usa `bpm`.
- Sin `ramp`, el tempo **salta** al empezar ese compás.
- Con `"ramp": true`, el tempo llega a ese BPM **poco a poco** desde el cambio anterior: acelerando o ritardando.
- La rejilla no cambia: los pasos siguen siendo semicorcheas; cambia su duración real.
- Para un build-up: pon un cambio con `ramp` al inicio del clímax. Para un corte: pon un salto en el compás exacto.
- Un `ramp` en el primer cambio se interpola desde el `bpm` base.

Ejemplo: intro a 84, subida gradual al estribillo a 150 en el compás 9, y bajada a 100 en el compás 17:

```json
"tempo": [
  { "bar": 8, "bpm": 150, "ramp": true },
  { "bar": 16, "bpm": 100 }
]
```

## Instrumentos y registros

| Id | Nombre | Registro | Uso |
|---|---|---|---|
| `pulse` | Pulso (lead) | C3–C7 | Lead brillante, melodía principal. |
| `pwm` | Pulso PWM | C3–C7 | Lead que respira; melodías largas y expresivas. |
| `saw` | Sierra | C3–C7 | Lead potente, rock/electrónica, solos. |
| `triangle` | Triángulo | C3–C6 | Contramelodía dulce, bajo suave, líneas tranquilas. |
| `arp` | Pulso fino | C4–C8 | Arpegios rápidos, adornos, movimiento. |
| `bell` | Campanas | C5–C8 | Brillo, motivos cristalinos, acentos. |
| `chirp` | Chirp | C4–C8 | Efectos de moneda/láser, leads muy marcados. Cada nota cae desde una octava arriba. |
| `brass` | Metales | C3–C6 | Fanfarria, refuerzos, temas heroicos. |
| `piano` | Piano | C2–C7 | Acordes y melodías versátiles. |
| `guitar` | Guitarra | C2–C6 | Ritmos, arpegios, riffs con carácter. |
| `strings` | Cuerdas | C2–C6 | Colchón armónico amplio. |
| `pad` | Pad | C2–C6 | Atmósfera, acordes muy largos, drones. |
| `bass` | Bajo sub | C1–C4 | Raíz del acorde, graves profundos. |
| `pluck` | Bajo pulsado | C1–C4 | Ataque, funk, rock, ritmos marcados. |
| `drums` | Batería | 12 piezas | Ritmo y acentos. |

Reglas prácticas:

- No pongas una melodía de `pulse` en C2 ni un `bell` en C4: fuera de registro se pierde o suena mal.
- `pulse`, `pwm`, `saw`, `triangle`, `arp`, `bell`, `chirp` y `brass` son melódicos; `piano`, `guitar`, `strings` y `pad` sirven para armonía; `bass`/`pluck` para bajo; `drums` para percusión.
- Se puede repetir instrumento en dos pistas, pero especializa roles: lead, contramelodía, armonía, bajo, brillo, percusión.
- Para un acorde real se necesitan varias notas o `chord` en una sola nota. `chord` arpegia y ahorra pistas, pero no es un acorde sostenido.

## Efectos por pista

| Id | Nombre | Qué hace | Uso típico |
|---|---|---|---|
| `reverb` | Sala | Espacio y cola | Atmósfera, cámara, iglesia, cine. |
| `delay` | Eco | Repetición sincronizada | Dub, solos, cañones, misterio. |
| `chorus` | Coro | Ensancha y duplica | Cuerdas, pad, guitarra, synth. |
| `drive` | Distorsión | Saturación | Rock, metal, industrial, bajo. |
| `crush` | Bits | Reduce resolución | Lo-fi, 8-bit, ruido, intro. |

Los envíos son 0–1. No hace falta usar todos. Un error común es saturar todo con reverb y drive: elige uno o dos efectos por rol y deja espacio.

## Escalas y modos disponibles

`key` acepta cualquier pc/nota. `scale` debe ser uno de estos ids:

| Id | Nombre | Semitonos |
|---|---|---|
| `major` | Mayor / Jónico | 0 2 4 5 7 9 11 |
| `minor` | Menor natural / Eólico | 0 2 3 5 7 8 10 |
| `dorian` | Dórico | 0 2 3 5 7 9 10 |
| `phrygian` | Frigio | 0 1 3 5 7 8 10 |
| `lydian` | Lidio | 0 2 4 6 7 9 11 |
| `mixolydian` | Mixolidio | 0 2 4 5 7 9 10 |
| `locrian` | Locrio | 0 1 3 5 6 8 10 |
| `harmonicMinor` | Menor armónica | 0 2 3 5 7 8 11 |
| `melodicMinor` | Menor melódica | 0 2 3 5 7 9 11 |
| `harmonicMajor` | Mayor armónica | 0 2 4 5 7 8 11 |
| `phrygianDominant` | Frigio dominante | 0 1 4 5 7 8 10 |
| `doubleHarmonic` | Doble armónica | 0 1 4 5 7 8 11 |
| `hungarianMinor` | Menor húngara | 0 2 3 6 7 8 11 |
| `pentMin` | Pentatónica menor | 0 3 5 7 10 |
| `pentMaj` | Pentatónica mayor | 0 2 4 7 9 |
| `blues` | Blues hexatónica | 0 3 5 6 7 10 |
| `wholeTone` | Tono completo | 0 2 4 6 8 10 |
| `diminished` | Disminuida | 0 2 3 5 6 8 9 11 |
| `hirajoshi` | Hirajoshi | 0 2 3 7 8 |
| `insen` | In-Sen | 0 1 5 7 10 |
| `egyptian` | Egipcia | 0 2 5 7 10 |
| `chromatic` | Cromática | 0 1 2 3 4 5 6 7 8 9 10 11 |

- Los modos de 7 notas permiten acordes diatónicos y progresiones modales.
- Pentatónicas, blues, tono completo, disminuida y cromática funcionan mejor como melodía, color o textura; la app no muestra los 7 acordes para ellas.
- La tonalidad no se guarda en las notas: las notas ya tienen altura. `key`/`scale` son metadatos para la app y para que la IA declare su intención. Si declaras `D`/`dorian`, las notas deben ser coherentes con D dórico (D E F G A B C).
- Para un modo, piensa en el centro tonal: D dórico no es "D menor con B natural" solamente; el acorde i y el IV mayor son el color.

## Cómo se traduce un género a Chiptune Studio

No hay guitarras reales, cuerdas reales ni batería acústica: hay timbres. La traducción es por **rol**:

- **Guitarra rítmica** → `guitar` o `pulse` con `drive`.
- **Guitarra solista** → `saw`/`pwm` con `delay` y `drive` suave.
- **Cuerdas** → `strings` o `pad`; para cámara, `strings` con reverb media.
- **Metales** → `brass`; para fanfarria, varias notas y `vel` alto.
- **Piano** → `piano`; para piano eléctrico, `pluck` o `piano` con chorus.
- **Bajo** → `bass` para sub, `pluck` para ataque.
- **Percusión latina** → `drums` con `rim`, `shaker`, `clap`, toms.
- **Coros** → `pad`/`pulse` en acordes; no hay voz real.
- **Ruido/textura** → `crush`, `saw` con drive, notas largas y paneo.

Un mismo género puede sonar a chiptune puro (pocos canales, sin reverb) o a "chiptune-core" (capas, efectos, producción). Decide el grado de pureza en el plan.

## Errores que rompen una canción

- `step` o `len` fuera de los compases: se recortan o desaparecen.
- Notas fuera del registro: se pierden o suenan mal.
- Batería con `pitch` inventado: se ignora.
- `tempo` con `bar` 0: se ignora; el tempo base va en `bpm`.
- `scale` inventada: la app la ignora y no resalta el modo.
- Más de 12 pistas o más de 64 compases: se recorta.
- `loopStart` en un compás que no enlaza: el loop salta.
- Acordes con `chord` en una pista de batería: no aplica.
- Usar `slide` a una nota fuera de registro: se ignora.
