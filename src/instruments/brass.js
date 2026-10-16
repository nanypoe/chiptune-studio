/* Instrumento de Chiptune Studio. Formato: cs-instrument@1 (ver README). Solo datos: edítalo y recarga. */
CS.registerInstrument({
  "schema": "cs-instrument@1",
  "id": "brass",
  "name": "Metales",
  "family": "Melodía",
  "color": "#ffd24d",
  "pan": 0.15,
  "range": {
    "low": "C3",
    "high": "C6"
  },
  "aliases": [],
  "tip": "Fanfarria y energía: refuerzos y melodías heroicas.",
  "gain": 0.1,
  "osc": [
    {
      "wave": "saw"
    },
    {
      "wave": "saw",
      "detune": 7,
      "gain": 0.6
    }
  ],
  "env": {
    "attack": 0.04,
    "decay": 0.12,
    "sustain": 0.8,
    "release": 0.08
  },
  "filter": {
    "cutoff": [
      1.3,
      6
    ],
    "time": 0.1,
    "q": 1
  },
  "vibrato": {
    "rate": 5.5,
    "depth": 10,
    "delay": 0.3
  }
});
