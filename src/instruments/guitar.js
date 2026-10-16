/* Instrumento de Chiptune Studio. Formato: cs-instrument@1 (ver README). Solo datos: edítalo y recarga. */
CS.registerInstrument({
  "schema": "cs-instrument@1",
  "id": "guitar",
  "name": "Guitarra",
  "family": "Armonía",
  "color": "#ff9a6b",
  "pan": -0.35,
  "range": {
    "low": "C2",
    "high": "C6"
  },
  "aliases": [],
  "tip": "Pulsada: ritmos y arpegios con carácter.",
  "gain": 0.18,
  "osc": [
    {
      "wave": "saw"
    },
    {
      "wave": "pulse",
      "duty": 0.5,
      "gain": 0.3
    }
  ],
  "env": {
    "attack": 0.003,
    "decay": 0.35,
    "sustain": 0.18,
    "release": 0.12
  },
  "filter": {
    "cutoff": [
      10,
      2
    ],
    "time": 0.25,
    "q": 2
  },
  "noise": {
    "ratio": 5,
    "q": 0.8,
    "dur": 0.02,
    "gain": 0.4
  }
});
