# Spec de género — `chiptune-genre-spec@1`

El spec es la parte que lee el compositor. Es corto, concreto y validable. El dossier `.md` puede ser más largo.

## Forma mínima

```json
{
  "schema": "chiptune-genre-spec@1",
  "id": "bolero-mexicano",
  "name": "Bolero mexicano",
  "family": "latin",
  "status": "draft",
  "confidence": 0.7,
  "updated": "2026-10-21",
  "aliases": [],
  "tags": [],
  "summary": "Una frase que capture la identidad.",
  "meter": { "primary": "4/4", "allowed": ["4/4"], "feel": "..." },
  "tempo": { "range": [60, 90], "typical": 72, "map": [] },
  "key": { "common": ["A minor"], "scales": ["minor"], "modality": "..." },
  "form": [
    { "id": "intro", "bars": 4, "role": "...", "energy": 0.2, "density": [2, 6], "returns": false }
  ],
  "rhythm": {
    "grid": "16th",
    "patterns": [{ "name": "...", "steps": "...", "accents": [0, 4, 8, 12] }],
    "groove": "...",
    "claves": []
  },
  "harmony": {
    "progressions": ["..."],
    "cadences": ["..."],
    "borrowed": [],
    "notes": "..."
  },
  "melody": {
    "range": "C4-C6",
    "motif": "3–5 notas...",
    "phrasing": "...",
    "ornaments": ["..."],
    "avoid": []
  },
  "roles": [
    { "role": "lead", "instruments": ["saw"], "range": "C4-C6", "behavior": "..." }
  ],
  "instrumentation": {
    "required": ["..."],
    "optional": ["..."],
    "avoid": ["..."]
  },
  "production": {
    "effects": ["reverb", "delay"],
    "texture": "...",
    "mix": "..."
  },
  "chiptune": {
    "translation": "...",
    "constraints": ["..."],
    "workarounds": ["..."]
  },
  "silence": {
    "breaks": [{ "section": "...", "bars": "...", "whatStops": "..." }],
    "dropouts": ["..."],
    "rules": ["..."]
  },
  "must": [],
  "avoid": [],
  "acceptance": [],
  "sources": [
    { "title": "...", "author": "...", "year": "...", "url": "...", "type": "...", "claim": "..." }
  ],
  "openQuestions": []
}
```

## Campos

| Campo | Tipo | Obligatorio | Regla |
|---|---|---|---|
| `schema` | string | sí | Exactamente `chiptune-genre-spec@1` |
| `id` | slug | sí | Igual al nombre de la carpeta y del archivo |
| `name` | string | sí | Nombre legible |
| `family` | string | sí | Familia amplia (`latin`, `metal`, `electronic`, etc.) |
| `status` | enum | sí | `draft`, `tested`, `validated` |
| `confidence` | 0–1 | sí | Confianza de la investigación |
| `updated` | `YYYY-MM-DD` | sí | Última revisión |
| `aliases` | string[] | no | Otros nombres |
| `tags` | string[] | no | Búsqueda |
| `summary` | string | sí | Identidad en una frase |
| `context` | object | no | `region`, `era`, `function` |
| `meter.primary` | enum | sí | `4/4`, `3/4`, `2/4`, `5/4`, `6/8`, `12/8`, `7/8` |
| `meter.allowed` | enum[] | sí | Debe incluir `primary` |
| `meter.feel` | string | sí | Cómo se siente el pulso |
| `tempo.range` | [number, number] | sí | Dentro de 40–240 |
| `tempo.typical` | number | sí | Dentro del rango |
| `tempo.map` | object[] | no | `{section,bpm,ramp}` |
| `key.common` | string[] | sí | Ej. `"A minor"`, `"D phrygian"` |
| `key.scales` | enum[] | sí | Ids de `APP-CONTRACT.md` |
| `key.modality` | string | sí | Tonal, modal, pentatónica, etc. |
| `form` | object[] | sí | Secciones con `id`, `bars`, `role`, `energy` |
| `form[].density` | [number, number] | sí | Notas por compás, mínimo y máximo |
| `form[].returns` | boolean | no | Si la sección vuelve |
| `rhythm.grid` | string | sí | Normalmente `"16th"` |
| `rhythm.patterns` | object[] | sí | Patrones concretos, no adjetivos |
| `rhythm.groove` | string | sí | Descripción rítmica |
| `harmony.progressions` | string[] | sí | Progresiones abstractas o grados |
| `harmony.cadences` | string[] | sí | Cadencias típicas |
| `melody.motif` | string | sí | Regla para un motivo de 3–5 notas |
| `melody.range` | string | sí | Registro preferido |
| `roles` | object[] | sí | Un rol por capa; instrumentos reales |
| `roles[].instruments` | enum[] | sí | Ids de instrumento de la app |
| `roles[].range` | string | sí | Dentro del registro del instrumento |
| `instrumentation.required` | string[] | sí | Roles o instrumentos indispensables |
| `instrumentation.avoid` | string[] | sí | Lo que abarata el género |
| `production.effects` | enum[] | sí | Ids de efecto de la app |
| `chiptune.translation` | string | sí | Cómo suena en la app |
| `chiptune.constraints` | string[] | sí | Lo que no se puede reproducir |
| `chiptune.workarounds` | string[] | sí | Cómo se aproxima |
| `silence.breaks` | object[] | sí | Dónde y qué se calla |
| `silence.dropouts` | string[] | sí | Capas que entran y salen |
| `silence.rules` | string[] | sí | Reglas de espacio |
| `must` | string[] | sí | 3–8 rasgos obligatorios |
| `avoid` | string[] | sí | 3–8 clichés o errores |
| `acceptance` | string[] | sí | Pruebas de escucha concretas |
| `sources` | object[] | sí | Al menos 3 con URL o ISBN |
| `openQuestions` | string[] | sí | Huecos honestos |

## Reglas de contenido

- Cada patrón rítmico debe poder escribirse en pasos o en una fórmula de acentos. “Ritmo sabroso” no es un patrón.
- Cada rol debe tener un instrumento real y un registro que la app pueda tocar.
- Si un género depende de un instrumento que la app no tiene, el spec debe decirlo en `chiptune.constraints` y proponer un rol sustituto.
- `density` se mide en notas por compás (suma de notas de todas las pistas). Un bolero puede tener 12–25; un metal, 35–80; un breakdown, 4–15.
- `silence` no es “bajar el volumen”: es dejar de tocar, quitar capas o reducir el registro.
- `acceptance` debe ser escuchable: “el oyente reconoce el bolero por el tresillo del bajo y la guitarra en 3+3+2”, no “suena auténtico”.
- No inventes fuentes. Si no hay una fuente para una afirmación, va a `openQuestions` o baja `confidence`.

## Compatibilidad con la app

- `meter.primary` debe ser una firma real.
- `tempo` dentro de 40–240.
- `roles[].instruments` solo ids reales.
- `production.effects` solo ids reales.
- `form` suma de `bars` ≤ 64.
- `density` debe ser alcanzable con ≤ 12 pistas.
- Si el género necesita más de 12 capas, prioriza y dilo en `chiptune.workarounds`.

## Bloque JSON en el dossier

El dossier debe terminar con un bloque cercado:

````markdown
```json
{ "schema": "chiptune-genre-spec@1", ... }
```
````

`tools/dossier.js` extrae el último bloque `json` y valida el objeto. No pongas comentarios dentro del JSON.
