# Prompt: componer una canción desde un brief

Copia este prompt y pega debajo tu brief. Si no tienes todos los datos, deja los campos en blanco; la IA debe proponer y anotar los supuestos.

---

Vas a componer una canción original para Chiptune Studio.

**Brief:**

```text
TÍTULO:
PROYECTO / ESCENA:
PREMISA / HISTORIA / LORE:
EMOCIONES:
FUNCIÓN:
INFLUENCIAS:
GÉNERO / SUBGÉNERO:
LO QUE DEBE INCLUIR:
LO QUE HAY QUE EVITAR:
DATOS TÉCNICOS:
  BPM:
  Compás:
  Compases:
  Duración:
  Loop:
  Tonalidad:
  Escala/modo:
  Máximo de pistas:
  Instrumentos obligatorios:
  ¿Debe cambiar el tempo?:
ORIGINALIDAD:
NOTAS:
```

**Proceso obligatorio:**

1. Lee `ai/CORE.md`, `ai/COMPOSE.md`, `ai/GENRES.md` y `ai/ORIGINALITY.md`.
2. Separa hechos, emociones, función, influencias, restricciones y huecos. Anota los huecos en `assumptions`.
3. Elige género/familia. Si no existe, usa el fallback y declara la fusión.
4. Define forma con contraste, energía por sección, tonalidad/modo, progresión, tempo y compás.
5. Escribe un motivo propio y un plan de instrumentación por roles (máximo 12 pistas).
6. Genera la canción completa en formato v2, con notas reales (no solo acordes), batería, bajo, melodía, armonía y textura.
7. Usa al menos tres recursos de la app con intención: `slide`, `chord`, `vel`, `pan`, `fx`, cambios de tempo con o sin `ramp`, compás impar, `loopStart`.
8. Valida mentalmente y, si tienes terminal, ejecuta `node tools/ai-compose.js check cancion.json`.
9. Revisa la originalidad: no copies material reconocible; cambia al menos dos dimensiones respecto a cada influencia.

**Entrega:**

- Un bloque ```json con la canción completa.
- Un resumen breve: género/familia, forma, tonalidad/modo, instrumentación, recursos usados, supuestos y originalidad.
- Si el JSON no pasa la validación, corrige y explica qué cambiaste.

No entregues el esbozo automático sin escucharlo. No inventes capacidades que la app no tiene.
