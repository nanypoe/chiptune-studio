---
id: {{id}}
name: {{name}}
family: {{family}}
status: draft
confidence: 0.0
updated: {{date}}
region: {{region}}
era: {{era}}
function: {{function}}
sources: []
---

# {{name}}

## 1. Identidad y célula
[Qué es, dónde, cuándo, para qué y para quién. Una célula concreta.]

## 2. Referencias y fuentes
[Mínimo 6 fuentes con URL o ISBN y la afirmación que respalda cada una.]

## 3. Métrica, tempo y forma
[Compás, acentos, BPM, frases, secciones, repeticiones, inicio y final.]

## 4. Ritmo y groove
[Patrones concretos en pasos o acentos; quién lleva el pulso y quién el contratiempo.]

## 5. Armonía
[Modos, progresiones por grados, cadencias, préstamos, drones y tensiones.]

## 6. Melodía y fraseo
[Motivo, ámbito, ornamentos, respiración, llamada-respuesta y variación.]

## 7. Roles e instrumentación
[Un rol por capa; instrumento real, registro y comportamiento.]

## 8. Dinámica, densidad y silencio
[Curva de densidad, breaks, dropouts, falsos finales y secciones mínimas.]

## 9. Producción y textura
[Efectos, mezcla, espacio, saturación y traducción a los cinco efectos.]

## 10. Traducción a Chiptune Studio
[Qué se puede reproducir, qué no y cómo se sustituye. Incluye el test mínimo.]

## 11. Debe / evitar
[Rasgos obligatorios y clichés que arruinan el género.]

## 12. Criterios de aceptación
[Pruebas de escucha concretas.]

## 13. Preguntas abiertas
[Huecos honestos y desacuerdos entre fuentes.]

## 14. SPEC

```json
{
  "schema": "chiptune-genre-spec@1",
  "id": "{{id}}",
  "name": "{{name}}",
  "family": "{{family}}",
  "status": "draft",
  "confidence": 0.0,
  "updated": "{{date}}",
  "aliases": [],
  "tags": [],
  "summary": "",
  "context": { "region": "", "era": "", "function": "" },
  "meter": { "primary": "4/4", "allowed": ["4/4"], "feel": "" },
  "tempo": { "range": [60, 100], "typical": 80, "map": [] },
  "key": { "common": [], "scales": [], "modality": "" },
  "form": [],
  "rhythm": { "grid": "16th", "patterns": [], "groove": "", "claves": [] },
  "harmony": { "progressions": [], "cadences": [], "borrowed": [], "notes": "" },
  "melody": { "range": "C4-C6", "motif": "", "phrasing": "", "ornaments": [], "avoid": [] },
  "roles": [],
  "instrumentation": { "required": [], "optional": [], "avoid": [] },
  "production": { "effects": [], "texture": "", "mix": "" },
  "chiptune": { "translation": "", "constraints": [], "workarounds": [] },
  "silence": { "breaks": [], "dropouts": [], "rules": [] },
  "must": [],
  "avoid": [],
  "acceptance": [],
  "sources": [],
  "openQuestions": []
}
```
