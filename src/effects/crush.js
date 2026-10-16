/* Efecto de Chiptune Studio (envío por pista). Formato: cs-effect@1. "kind" elige el algoritmo del motor (src/engine/effects.js). */
CS.registerEffect({
  "schema": "cs-effect@1",
  "id": "crush",
  "name": "Bits",
  "kind": "drive",
  "params": {
    "amount": 4,
    "bits": 5
  },
  "level": 0.5,
  "tip": "Reduce la resolución: el crujido retro 8-bit."
});
