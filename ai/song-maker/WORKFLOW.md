# Workflow de song-maker

Este flujo crea canciones. No investiga géneros: consume los specs de `ai/dossiers/`.

## Mapa de la carpeta

```text
ai/song-maker/
  AGENTS.md              Instrucciones para OpenCode en este flujo
  WORKFLOW.md            Este documento
  COMPOSE.md             Método creativo
  ORIGINALITY.md         Reglas de originalidad
  CHECKLIST.md           Revisión final
  BRIEF-TEMPLATE.json    Plantilla de brief
  catalog.json           Canciones creadas y su estado
  data/                  Catálogos machine-readable que usa ai-compose.js
    dossiers.json        Catálogo generado de géneros promovidos (lo escribe dossier.js)
    genres/
    genres.json
    moods.json
    influences.json
    brief.schema.json
  examples/              Briefs de ejemplo
  sessions/
    STATE.md             Estado de la sesión actual
```

`data/` conserva los catálogos machine-readable heredados como punto de partida para `ai-compose.js`. `data/dossiers.json` es el catálogo generado de géneros promovidos; los specs de `../dossiers/` son la autoridad cuando existen.

## Dos entradas posibles

### A. Género explícito

```text
“Haz un bolero mexicano para una escena de despedida.”
  → buscar bolero-mexicano en data/dossiers.json
  → leer ../dossiers/library/bolero-mexicano/SPEC.json
  → si no está validated, declararlo como estimación
  → brief + plan + composición
```

### B. Lore, emoción o escena

```text
“Un faro abandonado en un planeta de lluvia.”
  → separar emociones, función y restricciones
  → elegir género primario validado (y uno secundario si aporta)
  → escribir assumptions
  → brief + plan + composición
```

En ambos casos, el brief manda sobre el género. El género es la gramática; el brief es el contenido.

## Proceso

```text
brief/lore
  → assumptions
  → género primario (spec validado)
  → plan: forma, tempo map, densidad, silencio, roles, motivo
  → composición por roles
  → check + check-demo + song-summary
  → escucha humana
  → iteración
  → demos/<slug>.json + build-demos
  → catalog.json + STATE.md
```

## Uso de los specs

- `validated`: se puede afirmar el género.
- `tested`: se puede usar como base, pero se declara “estimación”.
- `draft`: solo como referencia; no afirmar autenticidad.
- Si el brief pide un género que no existe, no improvises un spec en song-maker. Abre una sesión en `ai/dossiers` o usa una familia cercana con `assumptions`.

## Composición por roles

Un rol por pista, máximo 12:

| Rol | Función | Instrumentos típicos |
|---|---|---|
| `lead` | Melodía principal | `pulse`, `pwm`, `saw`, `chirp` |
| `counter` | Contramelodía | `triangle`, `piano`, `bell` |
| `harmony` | Acordes y colchón | `piano`, `strings`, `pad`, `brass` |
| `bass` | Raíz y groove | `bass`, `pluck`, `triangle` |
| `rhythm` | Ataque armónico | `guitar`, `piano`, `pluck` |
| `texture` | Ambiente y arpegios | `pad`, `arp`, `strings`, `bell` |
| `drums` | Pulso y secciones | `drums` |
| `ornament` | Adornos y FX | `bell`, `chirp`, `arp` |

No dupliques el mismo rol con el mismo timbre en la misma octava. Si necesitas grosor, usa octavas, paneo o instrumentos complementarios.

## Dramaturgia

Antes de escribir notas, decide:

- **Forma:** intro, A, B, desarrollo, clímax, coda o loop.
- **Tempo map:** secciones más lentas/rápidas, rampas, falso final.
- **Densidad:** notas por compás por sección. Un clímax no tiene por qué ser el momento más denso.
- **Silencio:** compases con pocas capas, breaks, dropouts, frases que respiran.
- **Repetición:** qué vuelve igual, qué vuelve variado y qué no vuelve.
- **Motivo:** 3–5 notas reconocibles; aparición, variación y resolución.

## Validación

```bash
node ../../tools/ai-compose.js plan <brief> --out plan.json
node ../../tools/ai-compose.js sketch <brief> --out cancion.json --plan-out plan.json
node ../../tools/ai-compose.js check cancion.json
node ../../tools/check-demo.js cancion.json
node ../../tools/song-summary.js cancion.json
node ../../tools/build-demos.js
```

`check` es un piso técnico, no un juicio artístico. Un score alto no garantiza que el género se reconozca. La escucha humana decide.

## Protocolo de sesión y tokens

Al empezar, lee solo:

1. `AGENTS.md`
2. `../APP-CONTRACT-QUICK.md` (y `../APP-CONTRACT.md` solo si falta un detalle)
3. `WORKFLOW.md`
4. `COMPOSE.md`
5. `../dossiers/index.json`
6. `SPEC.json` del género
7. `sessions/STATE.md` y el brief

No leas canciones completas: usa `song-summary.js`. No leas todos los dossiers. Una canción por sesión, salvo que el humano pida un lote pequeño.

Al terminar, actualiza `STATE.md`:

```text
# Estado
Canción: <slug>
Género: <slug> (<estado>)
Archivos: demos/<slug>.json, plan.json
Forma: ...
Densidad/silencio: ...
Pendiente: ...
No releer: ...
```

## Entrega

- JSON final en `demos/`.
- `index.json` y `demos.js` regenerados.
- Resumen musical y de originalidad.
- Notas de escucha y qué falta validar.
