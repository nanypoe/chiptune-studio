/* Efecto de Chiptune Studio (envío por pista). Formato: cs-effect@1. "kind" elige el algoritmo del motor (src/engine/effects.js). */
CS.registerEffect({
  "schema": "cs-effect@1",
  "id": "chorus",
  "name": "Coro",
  "kind": "chorus",
  "params": {
    "rate": 0.8,
    "depth": 0.004,
    "delay": 0.022
  },
  "level": 0.7,
  "tip": "Ensancha el sonido, como si tocaran varios."
});
