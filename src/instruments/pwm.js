/* Instrumento de Chiptune Studio. Formato: cs-instrument@1 (ver README). Solo datos: edítalo y recarga. */
CS.registerInstrument({
  "schema": "cs-instrument@1",
  "id": "pwm",
  "name": "Pulso PWM (lead vivo)",
  "family": "Melodía",
  "color": "#ffb347",
  "pan": 0,
  "range": {
    "low": "C3",
    "high": "C7"
  },
  "aliases": [],
  "tip": "El ancho del pulso se mueve solo y el sonido \"respira\": un clásico del C64 y del NES. Ideal para melodías largas y expresivas.",
  "gain": 0.14,
  "osc": [
    {
      "wave": "pwm",
      "duty": [
        0.1,
        0.5
      ],
      "time": 0.7
    }
  ],
  "env": {
    "attack": 0.004,
    "decay": 0.2,
    "sustain": 0.8,
    "release": 0.1
  },
  "vibrato": {
    "rate": 5,
    "depth": 8,
    "delay": 0.3
  }
});
