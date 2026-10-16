/* Instrumento de Chiptune Studio. Formato: cs-instrument@1 (ver README). Solo datos: edítalo y recarga. */
CS.registerInstrument({
  "schema": "cs-instrument@1",
  "id": "pad",
  "name": "Pad (ambiente)",
  "family": "Armonía",
  "color": "#8ab4ff",
  "pan": 0.25,
  "range": {
    "low": "C2",
    "high": "C6"
  },
  "aliases": [
    "organ",
    "choir"
  ],
  "tip": "Atmósfera suave: acordes muy largos de fondo.",
  "gain": 0.1,
  "osc": [
    {
      "wave": "triangle",
      "detune": -10
    },
    {
      "wave": "triangle",
      "detune": 10
    },
    {
      "wave": "sine",
      "ratio": 0.5,
      "gain": 0.5
    }
  ],
  "env": {
    "attack": 0.5,
    "decay": 0.4,
    "sustain": 0.8,
    "release": 0.8
  },
  "filter": {
    "cutoff": [
      3,
      3
    ],
    "time": 0.1,
    "q": 0.5
  },
  "vibrato": {
    "rate": 4.5,
    "depth": 6,
    "delay": 0.6
  }
});
