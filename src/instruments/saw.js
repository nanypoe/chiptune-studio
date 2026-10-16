/* Instrumento de Chiptune Studio. Formato: cs-instrument@1 (ver README). Solo datos: edítalo y recarga. */
CS.registerInstrument({
  "schema": "cs-instrument@1",
  "id": "saw",
  "name": "Sierra (lead eléctrico)",
  "family": "Melodía",
  "color": "#ffa63d",
  "pan": 0,
  "range": {
    "low": "C3",
    "high": "C7"
  },
  "aliases": [
    "lead"
  ],
  "tip": "Potente, con vibrato: solos y melodías de rock o electrónica.",
  "gain": 0.09,
  "osc": [
    {
      "wave": "saw"
    },
    {
      "wave": "saw",
      "detune": 12,
      "gain": 0.7
    }
  ],
  "env": {
    "attack": 0.012,
    "decay": 0.12,
    "sustain": 0.75,
    "release": 0.1
  },
  "filter": {
    "cutoff": [
      7,
      3.5
    ],
    "time": 0.2,
    "q": 1
  },
  "vibrato": {
    "rate": 5.5,
    "depth": 12,
    "delay": 0.25
  }
});
