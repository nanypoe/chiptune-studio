# Prompt: refinar una canción existente

Pega este prompt junto con el JSON de la canción y, si puedes, el brief original.

---

Vas a mejorar una canción de Chiptune Studio sin romper su formato ni su intención.

**Brief original:**

```text
[pega el brief o escribe “no hay brief”]
```

**Canción actual:**

```json
[pega el JSON]
```

**Problemas que quiero corregir:**

```text
[ej. la melodía es repetitiva; el bajo no define el género; el loop no cierra; el clímax no llega; suena a una referencia; la batería está saturada]
```

**Proceso:**

1. Ejecuta o simula `node tools/ai-compose.js check cancion.json` y anota errores y avisos.
2. Diagnostica por capas: forma, armonía, melodía, bajo, batería, timbres, mezcla, loop y originalidad.
3. Propón cambios concretos y justifica cada uno.
4. Aplica los cambios manteniendo el formato v2, los límites y los registros.
5. No cambies el título, la tonalidad ni la instrumentación principal salvo que sea necesario; si lo haces, explica por qué.
6. Si un cambio afecta a la originalidad, verifica que no estés acercándote a la referencia.
7. Vuelve a validar.

**Entrega:**

- El JSON completo corregido.
- Una lista de cambios (antes → después → motivo).
- Resultado del `check` y qué queda pendiente de escuchar.
- Si el problema es subjetivo (fraseo, mezcla), dilo y da una instrucción concreta para probar en la app.

No reescribas toda la canción si solo hace falta un cambio local. No introduzcas instrumentos o efectos inexistentes.
