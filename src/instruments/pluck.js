/* Instrumento de Chiptune Studio. Formato: cs-instrument@1 (ver README). Solo datos: edítalo y recarga. */
CS.registerInstrument({
  "schema": "cs-instrument@1",
  "id": "pluck",
  "name": "Bajo pulsado",
  "family": "Bajos",
  "color": "#ff4d6d",
  "pan": 0,
  "range": {
    "low": "C1",
    "high": "C4"
  },
  "aliases": [
    "bass2"
  ],
  "tip": "Con ataque: funk, rock y ritmos marcados.",
  "gain": 0.3,
  "osc": [
    {
      "wave": "saw"
    },
    {
      "wave": "sine",
      "ratio": 0.5,
      "gain": 0.8
    }
  ],
  "env": {
    "attack": 0.004,
    "decay": 0.18,
    "sustain": 0.55,
    "release": 0.07
  },
  "filter": {
    "cutoff": [
      14,
      3.5
    ],
    "time": 0.15,
    "q": 3
  }
});
