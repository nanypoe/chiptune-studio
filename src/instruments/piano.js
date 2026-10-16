/* Instrumento de Chiptune Studio. Formato: cs-instrument@1 (ver README). Solo datos: edítalo y recarga. */
CS.registerInstrument({
  "schema": "cs-instrument@1",
  "id": "piano",
  "name": "Piano",
  "family": "Armonía",
  "color": "#7bd0ff",
  "pan": 0.1,
  "range": {
    "low": "C2",
    "high": "C7"
  },
  "aliases": [],
  "tip": "Versátil: acordes y melodías de cualquier género.",
  "gain": 0.2,
  "osc": [
    {
      "wave": "pulse",
      "duty": 0.25
    },
    {
      "wave": "triangle",
      "gain": 0.8
    }
  ],
  "env": {
    "attack": 0.004,
    "decay": 0.6,
    "sustain": 0.12,
    "release": 0.15
  },
  "filter": {
    "cutoff": [
      9,
      2.5
    ],
    "time": 0.4,
    "q": 1
  },
  "noise": {
    "ratio": 6,
    "q": 0.7,
    "dur": 0.015,
    "gain": 0.5
  }
});
