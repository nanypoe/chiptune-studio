/* Instrumento de Chiptune Studio. Formato: cs-instrument@1 (ver README). Solo datos: edítalo y recarga. */
CS.registerInstrument({
  "schema": "cs-instrument@1",
  "id": "pulse",
  "name": "Pulso (lead)",
  "family": "Melodía",
  "color": "#ffc83d",
  "pan": 0,
  "range": {
    "low": "C3",
    "high": "C7"
  },
  "aliases": [
    "pulse25",
    "pulse50"
  ],
  "tip": "Lead brillante y claro: ideal para la melodía principal.",
  "gain": 0.15,
  "osc": [
    {
      "wave": "pulse",
      "duty": 0.25
    }
  ],
  "env": {
    "attack": 0.004,
    "decay": 0.15,
    "sustain": 0.75,
    "release": 0.1
  }
});
