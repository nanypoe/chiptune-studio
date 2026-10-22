# Contrato de Chiptune Studio

Documento estable. Lo leen los dos flujos: `dossiers/` y `song-maker/`.
Si algo no está aquí o en el código de la app, no existe para la IA.

## 1. Reglas duras

- Formato `chiptune-studio`, versión `2`.
- 1–12 pistas. 1–64 compases. 40–240 BPM.
- Una sola firma de compás por canción: `4/4`, `3/4`, `2/4`, `5/4`, `6/8`, `12/8` o `7/8`.
- Rejilla de semicorcheas: 1 paso = 1/16.
- Sin samples, VST, audio externo, letras ni voces grabadas.
- Sin microtonalidad ni articulación por nota.
- Si se declara `key`/`scale`, las notas deben ser coherentes con esa escala.
- Respetar el registro de cada instrumento.
- `tempo` usa `bar >= 1`; el compás 1 usa `bpm`.
- `loopStart` es 0-based y debe quedar dentro de la canción.
- No entregar una canción sin `check` y sin escucha humana.

## 2. Formato de canción

```json
{
  "format": "chiptune-studio",
  "version": 2,
  "title": "Nombre",
  "bpm": 120,
  "bars": 16,
  "timeSig": "4/4",
  "key": "D",
  "scale": "minor",
  "loopStart": 0,
  "tempo": [{ "bar": 8, "bpm": 150, "ramp": true }],
  "tracks": [
    {
      "name": "Lead",
      "instrument": "saw",
      "volume": 0.8,
      "pan": 0,
      "fx": { "reverb": 0.15, "delay": 0.1 },
      "notes": [
        { "step": 0, "len": 4, "pitch": "D5", "vel": 0.9, "slide": "F5", "chord": "m" }
      ]
    }
  ]
}
```

### Notas

- `step`: paso absoluto desde el inicio de la canción.
- `len`: duración en pasos. `1` = 1/16, `4` = 1/4, `16` = compás en 4/4.
- `pitch`: nombre con octava (`C4` = Do central). En batería es el id de una pieza.
- `vel`: 0.1–1. Tiempo fuerte ≈ 0.9–1; contratiempo ≈ 0.6–0.8; nota fantasma ≈ 0.4.
- `slide`: nota destino; la altura se desliza durante la duración.
- `chord`: `M`, `m`, `dim`, `aug`, `7`, `M7`, `m7`, `sus4` o `power`. Suena como acorde arpegiado rápido en un solo canal; no es un acorde sostenido.
- `step + len` no puede pasar del último paso de la canción.

### Pistas

- `volume`: 0–1.
- `pan`: −1 (izquierda) a 1 (derecha).
- `fx`: envíos 0–1 por pista. Los parámetros internos del efecto son fijos en `src/effects/*.js`.
- `mute` y `solo` se aceptan al normalizar, pero una canción entregada debe funcionar sin depender de ellos.

## 3. Tiempo, compás y tempo

| `timeSig` | Pasos por compás | Sensación |
|---|---:|---|
| `4/4` | 16 | Pulso binario estándar |
| `3/4` | 12 | Vals |
| `2/4` | 8 | Marcha, polka |
| `5/4` | 20 | Compás impar (3+2 o 2+3) |
| `6/8` | 12 | Binario compuesto (2 grupos de 3) |
| `12/8` | 24 | Cuaternario compuesto (4 grupos de 3) |
| `7/8` | 14 | Impar (2+2+3, 3+2+2, etc.) |

- Un solo `timeSig` por canción. Si un género necesita 5/8 y 7/8, se elige uno y se escribe el otro como acento interno; no se puede cambiar la firma a mitad de canción.
- `tempo` es un mapa por compás. `bar` es 0-based y debe ser ≥ 1.
- `ramp: true` llega al BPM indicado gradualmente desde el cambio anterior.
- El tempo cambia la duración real de las notas, no la rejilla.

## 4. Instrumentos y registros

| id | Nombre | Registro | Uso típico |
|---|---|---|---|
| `pulse` | Pulso (lead) | C3–C7 | Melodía principal brillante |
| `pwm` | Pulso PWM | C3–C7 | Lead expresivo, C64/NES |
| `saw` | Sierra | C3–C7 | Rock, electrónica, solos |
| `triangle` | Triángulo | C3–C6 | Contramelodía dulce, bajo suave |
| `bass` | Bajo sub | C1–C4 | Raíz del acorde, graves profundos |
| `pluck` | Bajo pulsado | C1–C4 | Bajo con ataque, funk/rock |
| `guitar` | Guitarra | C2–C6 | Ritmos, arpegios, chugs |
| `piano` | Piano | C2–C7 | Acordes y melodías versátiles |
| `strings` | Cuerdas | C2–C6 | Colchón armónico |
| `pad` | Pad | C2–C6 | Atmósfera, acordes largos |
| `brass` | Metales | C3–C6 | Fanfarria, energía |
| `bell` | Campanas | C5–C8 | Brillo, notas que resuenan |
| `chirp` | Chirp | C4–C8 | Monedas, láser, leads marcados |
| `arp` | Pulso fino | C4–C8 | Arpegios y adornos rápidos |
| `drums` | Batería | — | 12 piezas |

### Batería

`pitch` es la pieza, no una altura:

`kick`, `snare`, `rim`, `clap`, `hat`, `openhat`, `shaker`, `ride`, `crash`, `tomlo`, `tommid`, `tomhi`.

No inventar piezas. No usar notas melódicas en la pista de batería.

## 5. Efectos

| id | Nombre | Uso |
|---|---|---|
| `reverb` | Sala | Espacio, profundidad |
| `delay` | Eco | Repetición sincronizada al tempo |
| `chorus` | Coro | Ensanchar |
| `drive` | Distorsión | Saturación, rock/electrónica |
| `crush` | Bits | Crujido retro 8-bit |

Se aplican como envío por pista (`fx`). No hay automatización de parámetros.

## 6. Escalas y modos

Ids válidos para `scale`:

`major`, `minor`, `dorian`, `phrygian`, `lydian`, `mixolydian`, `locrian`, `harmonicMinor`, `melodicMinor`, `harmonicMajor`, `phrygianDominant`, `doubleHarmonic`, `hungarianMinor`, `pentMin`, `pentMaj`, `blues`, `wholeTone`, `diminished`, `hirajoshi`, `insen`, `egyptian`, `chromatic`.

## 7. Recursos expresivos reales

- **Forma:** secciones con distinta densidad, registro, instrumentación y tempo.
- **Silencio:** notas ausentes, frases que respiran, capas que dejan de tocar, breaks y falsos finales.
- **Tempo:** mapa por compás, con o sin rampa.
- **Métrica:** 7/8, 5/4, 6/8, 12/8 y acentos internos.
- **Timbre:** 15 instrumentos, 5 efectos, paneo y volumen.
- **Textura:** capas que entran y salen; un rol por pista.
- **Melodía:** motivo de 3–5 notas, variación, llamada-respuesta, secuencias.
- **Bajo:** raíz, octavas, walking, pedal, ostinato.
- **Batería:** groove, fills, half-time, doble pedal simulado con toms/kick, cambios de sección.
- **Adornos:** `slide`, `chord`, `vel`, arpegios con `arp` o notas rápidas.
- **Loop:** `loopStart` para una pieza que vuelve sin salto.

## 8. Lo que no existe

- No hay cambio de compás dentro de una canción.
- No hay samples ni instrumentos grabados.
- No hay voces, letras ni coros sampleados.
- No hay microtonalidad, bend por nota (solo `slide` a una nota destino), vibrato por nota (el vibrato es del instrumento).
- No hay automatización de efectos, filtros ni volumen por nota.
- No hay más de 12 pistas.
- No hay más de 64 compases.
- No hay edición de audio ni MIDI externo.

## 9. Validación

```bash
node tools/ai-compose.js check cancion.json
node tools/check-demo.js demos/cancion.json
node tools/song-summary.js cancion.json
```

- `check` valida formato, rangos, escala declarada, tempo, loop y densidad.
- `check-demo` usa el normalizador real de la app.
- `song-summary` imprime un resumen compacto para no cargar el JSON completo en contexto.

## 10. Documentos de cada flujo

- Género: `ai/dossiers/AGENTS.md`, `ai/dossiers/WORKFLOW.md`, `ai/dossiers/SPEC-SCHEMA.md`.
- Canción: `ai/song-maker/AGENTS.md`, `ai/song-maker/WORKFLOW.md`, `ai/song-maker/COMPOSE.md`, `ai/song-maker/ORIGINALITY.md`, `ai/song-maker/CHECKLIST.md`.
