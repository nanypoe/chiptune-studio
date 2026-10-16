/* Instrumento de Chiptune Studio. Formato: cs-instrument@1 (ver README). Solo datos: edítalo y recarga. */
CS.registerInstrument({
  "schema": "cs-instrument@1",
  "id": "bass",
  "name": "Bajo sub",
  "family": "Bajos",
  "color": "#ff5d8f",
  "pan": 0,
  "range": {
    "low": "C1",
    "high": "C4"
  },
  "aliases": [],
  "tip": "Graves profundos: toca la raíz de cada acorde.",
  "gain": 0.34,
  "osc": [
    {
      "wave": "triangle"
    },
    {
      "wave": "pulse",
      "duty": 0.25,
      "ratio": 2,
      "gain": 0.3
    }
  ],
  "env": {
    "attack": 0.003,
    "decay": 0.1,
    "sustain": 0.8,
    "release": 0.08
  }
});
