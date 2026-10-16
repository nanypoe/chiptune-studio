/* Instrumento de Chiptune Studio. Formato: cs-instrument@1 (ver README). Solo datos: edítalo y recarga. */
CS.registerInstrument({
  "schema": "cs-instrument@1",
  "id": "strings",
  "name": "Cuerdas",
  "family": "Armonía",
  "color": "#e68cff",
  "pan": -0.25,
  "range": {
    "low": "C2",
    "high": "C6"
  },
  "aliases": [],
  "tip": "Colchón amplio: acordes largos que sostienen la canción.",
  "gain": 0.06,
  "osc": [
    {
      "wave": "saw",
      "detune": -9
    },
    {
      "wave": "saw",
      "detune": 9
    },
    {
      "wave": "saw",
      "ratio": 2,
      "gain": 0.5
    }
  ],
  "env": {
    "attack": 0.18,
    "decay": 0.2,
    "sustain": 0.85,
    "release": 0.25
  },
  "filter": {
    "cutoff": [
      4,
      4
    ],
    "time": 0.1,
    "q": 0.7
  },
  "vibrato": {
    "rate": 5,
    "depth": 8,
    "delay": 0.35
  }
});
