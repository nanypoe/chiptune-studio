/* Instrumento de Chiptune Studio. Formato: cs-instrument@1 (ver README). Solo datos: edítalo y recarga. */
CS.registerInstrument({
  "schema": "cs-instrument@1",
  "id": "arp",
  "name": "Pulso fino (arpegio)",
  "family": "Melodía",
  "color": "#4fe3c1",
  "pan": -0.35,
  "range": {
    "low": "C4",
    "high": "C8"
  },
  "aliases": [
    "pulse12"
  ],
  "tip": "Fino y rápido: arpegios y adornos que dan movimiento.",
  "gain": 0.15,
  "osc": [
    {
      "wave": "pulse",
      "duty": 0.125
    }
  ],
  "env": {
    "attack": 0.003,
    "decay": 0.1,
    "sustain": 0.7,
    "release": 0.08
  }
});
