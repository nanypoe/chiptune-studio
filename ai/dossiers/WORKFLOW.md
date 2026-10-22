# Workflow de dossiers

Este flujo convierte un género musical en una especificación que Chiptune Studio puede tocar. Es independiente del flujo de creación de canciones.

## Mapa de la carpeta

```text
ai/dossiers/
  AGENTS.md              Instrucciones para OpenCode en este flujo
  WORKFLOW.md            Este documento
  RESEARCH-PROMPT.md     Prompt para el humano; la IA no lo lee
  SPEC-SCHEMA.md         Contrato del spec
  index.json             Catálogo y estado de los géneros
  inbox/                 Investigación cruda que deja el humano
    <slug>.md
  library/               Dossiers curados
    <slug>/
      DOSSIER.md
      SPEC.json
      TEST.json           Prueba mínima de 8–16 compases (opcional hasta "tested")
  _template/
    DOSSIER.md
    SPEC.json
  sessions/
    STATE.md             Estado de la sesión actual
```

## Flujo humano

1. Abre `RESEARCH-PROMPT.md`.
2. Cambia solo `{{GÉNERO}}`. Si quieres, añade región, época o enfoque; si no, la IA de investigación los infiere.
3. Ejecuta el prompt en una IA con internet.
4. Guarda la respuesta completa como `inbox/<slug>.md`.
5. Inicia OpenCode en `ai/dossiers` y di:
   > Hoy trataremos de implementar el género <nombre> en Chiptune Studio.
6. OpenCode lee `AGENTS.md`, el contrato de la app, el spec del género y tu archivo; hace el resto.
7. Escucha `TEST.json` cuando exista (Menú → Abrir JSON). Si reconoce el género, lo marcas `validated`. Si no, se corrige el spec.

## Flujo de la IA

```text
inbox/<slug>.md
  → validar fuentes y huecos
  → extraer spec
  → traducir a instrumentos/efectos/compases reales
  → library/<slug>/DOSSIER.md
  → library/<slug>/SPEC.json
  → index.json + song-maker/data/dossiers.json (draft)
  → library/<slug>/TEST.json
  → check + check-demo
  → index.json + song-maker/data/dossiers.json (tested)
  → escucha humana
  → index.json + song-maker/data/dossiers.json (validated)
```

## Estados

| Estado | Significado | Quién lo pone |
|---|---|---|
| `draft` | Hay dossier y spec; falta prueba | IA |
| `tested` | Hay test válido; falta oído humano | IA |
| `validated` | El humano reconoce el género | Humano |

Un género `validated` se congela. Si cambia, se abre una nueva revisión y se anota en el dossier.

## Comandos (desde `ai/dossiers`)

```bash
# Crear una plantilla de investigación
node ../../tools/dossier.js new bolero-mexicano --name "Bolero mexicano"

# Validar un dossier crudo o curado
node ../../tools/dossier.js check inbox/bolero-mexicano.md

# Promover a library + index
node ../../tools/dossier.js promote bolero-mexicano

# Reconstruir el índice
node ../../tools/dossier.js index

# Ver el catálogo
node ../../tools/dossier.js list

# Cambiar estado (solo "validated" lo decide el humano)
node ../../tools/dossier.js status bolero-mexicano tested
```

## Protocolo de sesión y tokens

Al empezar, lee solo:

1. `AGENTS.md`
2. `../APP-CONTRACT-QUICK.md` (y `../APP-CONTRACT.md` solo si falta un detalle)
3. `SPEC-SCHEMA.md`
4. `index.json`
5. `inbox/<slug>.md` o `library/<slug>/SPEC.json`

No leas todos los dossiers, ni `demos.js`, ni canciones completas. Si necesitas comparar, usa `tools/song-summary.js` o pide al humano que elija una referencia.

Al terminar, escribe `sessions/STATE.md`:

```text
# Estado
Género: <slug>
Estado: draft | tested | validated
Archivos: <rutas>
Decisiones: <3–6 bullets>
Limitaciones: <bullets>
Pendiente: <escucha / corregir / promover>
No releer: <rutas que no hacen falta>
```

Y deja un handoff de 5 líneas:

```text
Continúa en ai/dossiers. Lee sessions/STATE.md y library/<slug>/SPEC.json.
Género: <slug>. Estado: <...>.
Siguiente: <...>.
No recargues el catálogo entero.
```

## Criterio de calidad

Un dossier no está listo por tener muchas fuentes. Está listo cuando un compositor puede leer el spec y producir algo que un oyente del género reconozca. Si el test suena genérico, el problema suele estar en el groove, la instrumentación, la forma o el silencio, no en la cantidad de adjetivos.

## Qué no hace este flujo

- No crea canciones completas; para eso está `ai/song-maker/`.
- No modifica la app; las limitaciones se anotan y se resuelven con workarounds.
- No valida autenticidad cultural por sí solo; la investigación y la escucha humana son parte del contrato.
