/* Instrumento de Chiptune Studio. Formato: cs-instrument@1 (ver README). Solo datos: edítalo y recarga. */
CS.registerInstrument({
  "schema": "cs-instrument@1",
  "id": "triangle",
  "name": "Triángulo (suave)",
  "family": "Melodía",
  "color": "#6db4ff",
  "pan": 0.2,
  "range": {
    "low": "C3",
    "high": "C6"
  },
  "aliases": [
    "flute"
  ],
  "tip": "Redondo y dulce: contramelodías y líneas tranquilas.",
  "gain": 0.28,
  "osc": [
    {
      "wave": "triangle"
    }
  ],
  "env": {
    "attack": 0.004,
    "decay": 0.15,
    "sustain": 0.8,
    "release": 0.1
  }
});
