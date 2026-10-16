/* Efecto de Chiptune Studio (envío por pista). Formato: cs-effect@1. "kind" elige el algoritmo del motor (src/engine/effects.js). */
CS.registerEffect({
  "schema": "cs-effect@1",
  "id": "delay",
  "name": "Eco",
  "kind": "delay",
  "params": {
    "beats": 0.75,
    "feedback": 0.35,
    "tone": 3500
  },
  "level": 0.8,
  "tip": "Repite la nota atenuada, sincronizado al tempo."
});
