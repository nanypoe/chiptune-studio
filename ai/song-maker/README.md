# Song maker

Empieza aquí.

1. Inicia OpenCode en esta carpeta.
2. Pide una canción con género, emoción, función o lore.
3. OpenCode leerá `AGENTS.md`, `WORKFLOW.md`, `COMPOSE.md`, el contrato de la app y el spec del género en `../dossiers/`.
4. Si el género no está `validated`, se declarará como estimación o se abrirá una sesión de dossiers.
5. La canción se compone, se valida, se escucha y se guarda en `demos/`.

## Archivos

- `AGENTS.md` — reglas de la IA en este flujo.
- `WORKFLOW.md` — proceso y comandos.
- `COMPOSE.md` — método creativo.
- `ORIGINALITY.md` — cómo usar influencias sin copiar.
- `CHECKLIST.md` — revisión final.
- `BRIEF-TEMPLATE.json` — plantilla de brief.
- `catalog.json` — canciones creadas.
- `data/` — catálogos machine-readable de apoyo; `data/dossiers.json` lista los géneros promovidos.
- `examples/` — briefs de ejemplo.
- `sessions/STATE.md` — estado de la sesión.

## Regla de oro

El brief manda sobre el género. El género da la gramática; la forma, el tempo, la densidad y el silencio hacen que la canción se sienta.
