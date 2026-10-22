# Contrato rápido

Resumen operativo. Si hay conflicto, manda `APP-CONTRACT.md`.

## Formato

- `chiptune-studio`, versión `2`.
- 1–12 pistas, 1–64 compases, 40–240 BPM.
- Un solo `timeSig`: `4/4` (16 pasos), `3/4` (12), `2/4` (8), `5/4` (20), `6/8` (12), `12/8` (24), `7/8` (14).
- Rejilla de semicorcheas. `step` absoluto; `len` en pasos.
- `tempo` por compás: `{ "bar": 4, "bpm": 140, "ramp": true }`; `bar >= 1`.
- `loopStart` 0-based.
- Sin samples, VST, audio externo, voces, microtonalidad ni cambio de compás.

## Notas

`pitch` con octava (`C4`). Batería: `pitch` es la pieza.
`vel` 0.1–1. `slide` a nota destino. `chord`: `M`, `m`, `dim`, `aug`, `7`, `M7`, `m7`, `sus4`, `power`.

## Instrumentos

| id | Registro |
|---|---|
| `pulse` | C3–C7 |
| `pwm` | C3–C7 |
| `saw` | C3–C7 |
| `triangle` | C3–C6 |
| `bass` | C1–C4 |
| `pluck` | C1–C4 |
| `guitar` | C2–C6 |
| `piano` | C2–C7 |
| `strings` | C2–C6 |
| `pad` | C2–C6 |
| `brass` | C3–C6 |
| `bell` | C5–C8 |
| `chirp` | C4–C8 |
| `arp` | C4–C8 |
| `drums` | — |

Batería: `kick`, `snare`, `rim`, `clap`, `hat`, `openhat`, `shaker`, `ride`, `crash`, `tomlo`, `tommid`, `tomhi`.

## Efectos

`reverb`, `delay`, `chorus`, `drive`, `crush`. Son envíos por pista (`fx`), sin automatización.

## Escalas

`major`, `minor`, `dorian`, `phrygian`, `lydian`, `mixolydian`, `locrian`, `harmonicMinor`, `melodicMinor`, `harmonicMajor`, `phrygianDominant`, `doubleHarmonic`, `hungarianMinor`, `pentMin`, `pentMaj`, `blues`, `wholeTone`, `diminished`, `hirajoshi`, `insen`, `egyptian`, `chromatic`.

## Recursos

Forma, silencio, densidad, tempo map, 7/8 y 5/4, capas que entran y salen, `slide`, `chord`, `vel`, `pan`, `fx`, `loopStart`, 15 instrumentos, 12 pistas.

## Validar

```bash
node tools/ai-compose.js check cancion.json
node tools/check-demo.js cancion.json
node tools/song-summary.js cancion.json
```
