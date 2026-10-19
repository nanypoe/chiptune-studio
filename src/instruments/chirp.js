/* Instrumento de Chiptune Studio. Formato: cs-instrument@1 (ver README). Solo datos: edítalo y recarga. */
CS.registerInstrument({
  "schema": "cs-instrument@1",
  "id": "chirp",
  "name": "Chirp (salto de moneda)",
  "family": "Melodía",
  "color": "#7dff7a",
  "pan": 0.15,
  "range": {
    "low": "C4",
    "high": "C8"
  },
  "aliases": [],
  "tip": "Cada nota \"cae\" desde una octava más arriba: sonidos de moneda, láser y leads muy marcados.",
  "gain": 0.15,
  "osc": [
    {
      "wave": "pulse",
      "duty": 0.25
    }
  ],
  "env": {
    "attack": 0.001,
    "decay": 0.12,
    "sustain": 0.45,
    "release": 0.06
  },
  "pitchEnv": {
    "from": 1200,
    "time": 0.05
  }
});
