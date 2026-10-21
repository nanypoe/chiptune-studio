# Chiptune Studio para IA

Esta carpeta convierte la app en un encargo de composición, no en un generador de loops genéricos. Una IA (o una persona) puede leer el brief, elegir género, planificar forma, escribir el JSON, validarlo y escucharlo en Chiptune Studio.

## Qué hay aquí

| Archivo | Para qué sirve |
|---|---|
| `CORE.md` | Referencia técnica: formato, límites, instrumentos, batería, efectos, escalas, tempo, compás y loop. |
| `COMPOSE.md` | Método creativo: leer el brief, elegir forma, armonía, melodía, ritmo, orquestación y originalidad. |
| `GENRES.md` | Familias, catálogo, herencia de rasgos y fallback para estilos que no existen. |
| `ORIGINALITY.md` | Reglas para usar influencias sin copiar melodías, riffs, progresiones ni arreglos. |
| `CHECKLIST.md` | Lista breve para revisar antes de entregar. |
| `genres.json` | Base generada: 39 familias, perfiles y 1.211 nombres de géneros/subgéneros. Consúltala con la herramienta, no la pegues entera en el contexto. |
| `genres/` | Piezas editables de la base: `families.json`, `profiles.json`, `catalog.json`. |
| `moods.json` | Emociones normalizadas: valencia, energía, tensión, calidez, tempo, escalas, familias e instrumentos. |
| `influences.json` | Perfiles abstractos de influencias (videojuegos, bandas, bandas sonoras). |
| `brief.schema.json` | Esquema flexible del brief. |
| `examples/` | Tres briefs de ejemplo: historia/lore, influencias y técnica. |
| `prompts/` | Prompts listos para pegar en una conversación con una IA. |

## Flujo mínimo

1. **Escribe el brief** con `ai/examples/*.json`, texto libre o la plantilla de la app (`Menú → Guía para IA → Brief`). Si falta algo, la IA debe proponerlo y anotarlo en `assumptions`.
2. **Planifica**:

   ```bash
   node tools/ai-compose.js plan mi-brief.json --out plan.json
   ```

   Revisa género, familia, emoción, tonalidad, escala, compás, forma, tempo, instrumentación y supuestos. Corrige el plan antes de generar notas.

3. **Genera un esbozo**:

   ```bash
   node tools/ai-compose.js sketch mi-brief.json --out cancion.json --plan-out plan.json
   ```

   El esbozo es un punto de partida válido. No es la entrega final: hay que escuchar, ajustar la melodía, el bajo, la batería, las transiciones y el loop.

4. **Valida**:

   ```bash
   node tools/ai-compose.js check cancion.json
   ```

5. **Escucha** en la app: abre `index.html` con doble clic o usa `node tools/serve.js` para que aparezcan las demos. Corrige lo que el análisis no puede oír.

6. **Entrega** el JSON final, el resumen de decisiones y las notas de escucha. Si es una demo, guárdala en `demos/` y ejecuta `node tools/build-demos.js`.

## Consultas rápidas

```bash
node tools/ai-compose.js genres "folk metal"
node tools/ai-compose.js genres --family latin
node tools/ai-compose.js genres --emotion misterioso
node tools/ai-compose.js moods "melancólico"
node tools/ai-compose.js brief --out brief.md
```

## Brief: lo que ayuda

No hace falta rellenar todo. Lo importante:

- **Historia, escena o lore:** qué ocurre y qué debe sentir quien escucha.
- **Función:** exploración, combate, jefe, menú, cinemática, créditos, canción de álbum.
- **Emociones:** pueden cambiar por secciones.
- **Influencias:** bandas, canciones, bandas sonoras, videojuegos, géneros. Se traducen a rasgos, nunca a citas.
- **Datos técnicos:** BPM, compás, compases, duración, loop, tonalidad, escala, máximo de pistas, instrumentos obligatorios.
- **Debe incluir / debe evitar:** un motivo, un instrumento, un cambio de tempo, un slide, un tipo de batería, clichés que no quieres.
- **Originalidad:** qué hace única la obra y qué no se debe copiar.

Si el brief pide una canción “como” una obra existente, traduce la petición: “como X por la textura y el tempo, pero con otra instrumentación, otra armonía y un motivo propio”.

## Reglas duras

- Máximo **12 pistas**, **64 compases**, **40–240 BPM**.
- Rejilla de **semicorcheas**; `timeSig` cambia los pasos por compás.
- Solo los instrumentos, efectos, escalas y capacidades reales de la app. No hay samples, VST ni audio externo.
- `key` y `scale` son metadatos: si los declaras, las notas deben ser coherentes.
- Un esbozo no se entrega sin `check` y sin escucharlo.
- Las influencias no se copian. Ver `ORIGINALITY.md`.

## Mantenimiento de la base

Edita `ai/genres/families.json`, `profiles.json` o `catalog.json` y regenera:

```bash
node tools/build-genres.js
```

No edites `ai/genres.json` a mano: es el archivo generado que consultan la IA y `tools/ai-compose.js`.
