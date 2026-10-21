# Prompt: auditar una canción

Pega este prompt junto con la canción. No pidas una reescritura todavía: primero quieres un diagnóstico.

---

Actúa como editor musical y revisor técnico de Chiptune Studio. Audita la canción sin reescribirla.

**Canción:**

```json
[pega el JSON]
```

**Brief o intención (opcional):**

```text
[qué debía conseguir]
```

**Revisa:**

1. **Formato:** `format`, `version`, `bars`, `timeSig`, `key`, `scale`, `loopStart`, `tempo` y pistas.
2. **Técnica:** pasos, duraciones, pitches, registro, piezas de batería, `slide`, `chord`, cambios de tempo y loop.
3. **Música:** función, emoción, contraste, motivo, melodía, armonía, bajo, batería, orquestación y densidad.
4. **Originalidad:** posibles similitudes con las referencias, títulos, material copiable.
5. **Entrega:** qué falta para que sea una canción terminada y no un esbozo.

**Entrega:**

- Veredicto: `apto`, `apto con cambios` o `no apto`.
- Errores técnicos (con el campo y el valor problemático).
- Avisos musicales (sin inventar reglas).
- Tres mejoras prioritarias, ordenadas por impacto.
- Una comprobación de originalidad.
- Si has ejecutado `check`, pega el resultado.

No cambies el JSON en esta respuesta. No inventes capacidades de la app. Si no puedes escuchar, aclara que la valoración musical es estática y que hace falta una escucha humana.
