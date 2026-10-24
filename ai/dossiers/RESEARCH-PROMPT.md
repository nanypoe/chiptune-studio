# Prompt de investigación de género

> **Para el humano.** Cambia solo `{{GÉNERO}}`. Opcionalmente añade región, época o enfoque. Pega el prompt completo en una IA con internet. Guarda la respuesta como `ai/dossiers/inbox/<slug>.md`.
>
> **Para OpenCode:** no leas este archivo como fuente. Es la herramienta de investigación del humano.

---

## Prompt

Eres musicólogo, analista de géneros y traductor de música a chiptune. Tu tarea es producir un **dossier de género** para Chiptune Studio, no una canción. Con base en lo que investigues en internet.

### Entrada

- Género: `{{GÉNERO}}`

Si el humano añade región, época o enfoque en la misma línea, úsalos. Si no, infiere la célula principal y prioriza la práctica viva y las grabaciones.

Si el género es ambiguo (por ejemplo, “rock” o “folk”), elige una **célula concreta** (región + época + función social) y declárala. Si hay dos células igual de válidas, elige una y anota la otra en “variantes”. No hagas un promedio de todo el mundo.

Si falta un dato que cambia por completo la respuesta, elige la opción más representativa y anótala en supuestos. Solo pregunta si es imposible continuar.

### Objetivo

Producir un dossier verificable y una especificación compositiva que permita a Chiptune Studio tocar algo que un oyente del género reconozca. El dossier debe explicar **cómo funciona la música**, no solo cómo se llama.

### Reglas duras

- No inventes fuentes, fechas, discos, artistas ni citas. Si no puedes verificar algo, dilo.
- Distingue **hecho verificado**, **inferencia razonable** y **opinión**. Usa `confidence` y `openQuestions`.
- No copies melodías, riffs, progresiones exactas ni arreglos de obras existentes.
- No uses el nombre de un artista vivo ni de una obra existente como reclamo del producto. Puedes mencionarlos como referencia analítica.
- No propongas samples, VST, audio externo, voces grabadas ni capacidades que la app no tiene.
- No escribas “suena auténtico”, “ritmo sabroso” o “emoción única” sin explicar el mecanismo musical.
- El output debe ser **un solo archivo Markdown** con el formato exacto de abajo.

### Protocolo de investigación

1. **Definir la célula.** Región, época, contexto social, función (baile, ritual, cine, juego, protesta, club), medios de producción y público.
2. **Buscar fuentes.** Mínimo 6, ideal 10. Mezcla:
   - fuentes académicas o enciclopédicas;
   - métodos, entrevistas o testimonios de practicantes;
   - grabaciones o partituras representativas;
   - fuentes sobre la traducción a chiptune o a música de juego, si existen.
   Cada fuente debe tener título, autor/organización, año, URL o ISBN, tipo y la afirmación concreta que respalda.
3. **Separar capas.**
   - **Gramática:** metro, tempo, ritmo, groove, forma, armonía, melodía, fraseo.
   - **Timbre:** instrumentos, roles, registro, técnicas, producción.
   - **Contexto:** función, espacio, interacción, variación regional.
   - **Clichés:** lo que se imita mal y conviene evitar.
4. **Medir lo medible.** Da rangos de BPM, compases, duración de frases, densidad de notas por compás, registro, progresiones por grados, acentos y ciclos.
5. **Traducir a Chiptune Studio.** Usa solo los ids reales de la tabla de abajo. Si un instrumento no existe, elige el más cercano y explica el workaround.
6. **Escribir el dossier.** Ordena para que sirva para componer: primero identidad, luego decisiones, luego fuentes.

### Tabla de traducción a Chiptune Studio

| id | Registro | Uso |
|---|---|---|
| `pulse` | C3–C7 | Lead brillante |
| `pwm` | C3–C7 | Lead expresivo |
| `saw` | C3–C7 | Rock, electrónica, solos |
| `triangle` | C3–C6 | Contramelodía dulce, bajo suave |
| `bass` | C1–C4 | Raíz, graves |
| `pluck` | C1–C4 | Bajo con ataque |
| `guitar` | C2–C6 | Ritmo, arpegios, chugs |
| `piano` | C2–C7 | Acordes y melodía |
| `strings` | C2–C6 | Colchón armónico |
| `pad` | C2–C6 | Atmósfera |
| `brass` | C3–C6 | Fanfarria |
| `bell` | C5–C8 | Brillo |
| `chirp` | C4–C8 | Monedas, láser, leads |
| `arp` | C4–C8 | Arpegios rápidos |
| `drums` | — | `kick`, `snare`, `rim`, `clap`, `hat`, `openhat`, `shaker`, `ride`, `crash`, `tomlo`, `tommid`, `tomhi` |

Efectos: `reverb`, `delay`, `chorus`, `drive`, `crush`.

Compases: `4/4` (16 pasos), `3/4` (12), `2/4` (8), `5/4` (20), `6/8` (12), `12/8` (24), `7/8` (14). Un solo compás por canción.

Escalas: `major`, `minor`, `dorian`, `phrygian`, `lydian`, `mixolydian`, `locrian`, `harmonicMinor`, `melodicMinor`, `harmonicMajor`, `phrygianDominant`, `doubleHarmonic`, `hungarianMinor`, `pentMin`, `pentMaj`, `blues`, `wholeTone`, `diminished`, `hirajoshi`, `insen`, `egyptian`, `chromatic`.

Límites: 1–12 pistas, 1–64 compases, 40–240 BPM, sin cambio de compás, sin samples, sin voces, sin microtonalidad, sin automatización de efectos.

### Formato de salida

Escribe el dossier en español. Devuelve **solo** este Markdown, sin introducción ni despedida:

````markdown
---
id: slug-del-genero
name: Nombre del género
family: familia-amplia
status: draft
confidence: 0.0
updated: YYYY-MM-DD
region: ...
era: ...
function: ...
sources:
  - title: ...
    author: ...
    year: ...
    url: ...
    type: ...
---

# Nombre del género

## 1. Identidad y célula
Qué es, dónde, cuándo, para qué y para quién. Una célula concreta, no un promedio global.

## 2. Referencias y fuentes
Lista de fuentes con la afirmación que respalda cada una. Marca las no verificadas.

## 3. Métrica, tempo y forma
Compás, acentos, rango de BPM, duración de frase, secciones típicas, repeticiones, cómo empieza y cómo termina.

## 4. Ritmo y groove
Patrones concretos en pasos o fórmulas de acentos. Qué instrumento lleva el pulso, cuál el contratiempo, qué se siente “adelantado” o “atrasado”.

## 5. Armonía
Modos, progresiones por grados, cadencias, préstamos, drones, tensiones y resoluciones.

## 6. Melodía y fraseo
Motivo, ámbito, ornamentos, respiración, llamada-respuesta, variación, relaciones con el texto o la danza.

## 7. Roles e instrumentación
Un rol por capa. Instrumento real, registro, comportamiento, qué se duplica y qué se deja solo.

## 8. Dinámica, densidad y silencio
Curva de densidad, breaks, dropouts, falsos finales, secciones mínimas. Números por compás, no adjetivos.

## 9. Producción y textura
Efectos, mezcla, espacio, saturación, limpieza, lo-fi, reverberación. Cómo se traduce a los cinco efectos de la app.

## 10. Traducción a Chiptune Studio
Qué se puede reproducir, qué no, qué se sustituye y cómo. Incluye un “test mínimo” de 8–16 compases.

## 11. Debe / evitar
Lista corta de rasgos obligatorios y de clichés que arruinan el género.

## 12. Criterios de aceptación
Pruebas de escucha concretas. Qué debe reconocer un oyente y en qué compás.

## 13. Preguntas abiertas
Huecos honestos, desacuerdos entre fuentes y lo que falta verificar.

## 14. SPEC

```json
{
  "schema": "chiptune-genre-spec@1",
  "id": "slug-del-genero",
  "name": "Nombre del género",
  "family": "familia-amplia",
  "status": "draft",
  "confidence": 0.0,
  "updated": "YYYY-MM-DD",
  "aliases": [],
  "tags": [],
  "summary": "...",
  "context": { "region": "", "era": "", "function": "" },
  "meter": { "primary": "4/4", "allowed": ["4/4"], "feel": "..." },
  "tempo": { "range": [60, 100], "typical": 80, "map": [] },
  "key": { "common": ["A minor"], "scales": ["minor"], "modality": "..." },
  "form": [
    { "id": "intro", "bars": 4, "role": "...", "energy": 0.2, "density": [2, 6], "returns": false }
  ],
  "rhythm": {
    "grid": "16th",
    "patterns": [{ "name": "...", "steps": "...", "accents": [0, 3, 6, 8, 11, 14] }],
    "groove": "...",
    "claves": []
  },
  "harmony": { "progressions": ["..."], "cadences": ["..."], "borrowed": [], "notes": "..." },
  "melody": { "range": "C4-C6", "motif": "...", "phrasing": "...", "ornaments": [], "avoid": [] },
  "roles": [
    { "role": "lead", "instruments": ["pulse"], "range": "C4-C6", "behavior": "..." }
  ],
  "instrumentation": { "required": ["..."], "optional": ["..."], "avoid": ["..."] },
  "production": { "effects": ["reverb"], "texture": "...", "mix": "..." },
  "chiptune": { "translation": "...", "constraints": ["..."], "workarounds": ["..."] },
  "silence": {
    "breaks": [{ "section": "...", "bars": "...", "whatStops": "..." }],
    "dropouts": ["..."],
    "rules": ["..."]
  },
  "must": ["..."],
  "avoid": ["..."],
  "acceptance": ["..."],
  "sources": [
    { "title": "...", "author": "...", "year": "...", "url": "...", "type": "...", "claim": "..." }
  ],
  "openQuestions": ["..."]
}
```
````

### Antes de responder, comprueba

- ¿La célula está definida y no es un promedio de continentes?
- ¿Hay al menos 6 fuentes con URL/ISBN y cada una respalda una afirmación?
- ¿Los patrones rítmicos están en pasos o acentos, no en adjetivos?
- ¿Los instrumentos son ids reales y los registros caben?
- ¿El compás es uno de los permitidos?
- ¿El tempo está entre 40 y 240?
- ¿La densidad está en notas por compás?
- ¿Hay silencio, breaks o dropouts descritos?
- ¿La traducción a chiptune explica qué se pierde?
- ¿El JSON del final es válido y no tiene comentarios?
- ¿Evitaste copiar material reconocible?

Si algo no lo puedes verificar, dilo. Es mejor un dossier honesto con huecos que uno inventado.
