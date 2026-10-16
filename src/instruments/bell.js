/* Instrumento de Chiptune Studio. Formato: cs-instrument@1 (ver README). Solo datos: edítalo y recarga. */
CS.registerInstrument({
  "schema": "cs-instrument@1",
  "id": "bell",
  "name": "Campanas",
  "family": "Melodía",
  "color": "#fff08a",
  "pan": 0.4,
  "range": {
    "low": "C5",
    "high": "C8"
  },
  "aliases": [],
  "tip": "Cristalinas: notas agudas que brillan y resuenan solas.",
  "gain": 0.2,
  "osc": [
    {
      "wave": "sine"
    },
    {
      "wave": "sine",
      "ratio": 2.76,
      "gain": 0.45
    },
    {
      "wave": "sine",
      "ratio": 5.4,
      "gain": 0.2
    }
  ],
  "env": {
    "attack": 0.002,
    "decay": 1.2,
    "sustain": 0,
    "release": 0.4,
    "ring": true
  }
});
