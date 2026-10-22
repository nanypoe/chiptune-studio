# Dossiers de género

Empieza aquí.

1. Abre `RESEARCH-PROMPT.md` y cambia solo `{{GÉNERO}}`.
2. Ejecuta el prompt en una IA con internet.
3. Guarda la respuesta como `inbox/<slug>.md`.
4. Inicia OpenCode en esta carpeta y di:
   > Hoy trataremos de implementar el género <nombre> en Chiptune Studio.
5. OpenCode leerá `AGENTS.md`, el contrato de la app y tu archivo; producirá `library/<slug>/DOSSIER.md`, `SPEC.json` y, si toca, `TEST.json`.

## Archivos

- `AGENTS.md` — reglas de la IA en este flujo.
- `WORKFLOW.md` — proceso completo y comandos.
- `SPEC-SCHEMA.md` — qué debe contener un spec.
- `RESEARCH-PROMPT.md` — para el humano; la IA no lo lee.
- `index.json` — catálogo y estados.
- `inbox/` — investigación cruda.
- `library/` — dossiers y specs curados.
- `sessions/STATE.md` — estado de la sesión.

## Estados

`draft` → `tested` → `validated`.

Solo el humano marca `validated`, después de escuchar.

## Regla de oro

Si el test suena genérico, el problema suele estar en el groove, la instrumentación, la forma o el silencio. Corrige el spec, no maquilles el test.
