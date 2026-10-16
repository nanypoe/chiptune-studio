/* Efecto de Chiptune Studio (envío por pista). Formato: cs-effect@1. "kind" elige el algoritmo del motor (src/engine/effects.js). */
CS.registerEffect({
  "schema": "cs-effect@1",
  "id": "reverb",
  "name": "Sala",
  "kind": "reverb",
  "params": {
    "seconds": 1.4,
    "decay": 3
  },
  "level": 1.2,
  "tip": "Espacio: hace que suene en una habitación."
});
