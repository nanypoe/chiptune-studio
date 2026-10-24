# Estado de la sesión — song-maker

Sesión: dos canciones de prueba para validar géneros en estado `tested` (folk-metal-espanol, indie-folk-rock). Ambas son estimaciones, no afirmaciones de género.

## antorcha-sobre-el-rio

- Género: folk-metal-espanol (tested, 0.62) — estimación.
- Archivos: demos/antorcha-sobre-el-rio.json, plan-antorcha.json, brief-antorcha-sobre-el-rio.json.
- Forma: Intro 4 · Estrofa 8 · Estribillo 8 · Estrofa 8 · Estribillo 8 · Puente 8 · Break 2 · Estribillo final 8 · Silencio 1 (compás 55, falso final) · Outro 4 · Cierre 1. 60 compases, 4/4, A minor, 128–134 BPM.
- Densidad/silencio: 29.9 notas/compás; intro sin batería; break 45-46 con toms; compás 55 en silencio total; préstamo dorian (D mayor) en el compás 43.
- Pendiente: escucha humana; revisar el peso del riff saw en estrofas y el sub del doblez en estribillos.

## faroles-en-la-nieve

- Género: indie-folk-rock (tested, 0.62) — estimación.
- Archivos: demos/faroles-en-la-nieve.json, plan-faroles.json, brief-faroles-en-la-nieve.json.
- Forma: Intro 4 · Verso A 8 · Pre-coro 8 · Coro 8 · Verso B 8 · Pre-coro 8 · Puente 8 · Coro final 8 · Outro 4. 64 compases, 4/4, C major, 100–108 BPM.
- Densidad/silencio: 30.6 notas/compás; intro sin batería (solo shaker desde el compás 3); dropouts en 20 y 44 (patrón reducido); puente con guitarra fuera 45-48 y bajo fuera 45-46; coro final con pad y campanas; outro con capas saliendo una a una.
- Pendiente: escucha humana; revisar el dueto en 3as (Voz B puede sonar baja), el peso de las campanas en coros y el corte de batería del compás 60.

## Hallazgos para el flujo de dossiers

- Ambos SPEC.json tienen `acceptance` que contradicen su propio array `form` (dicen coro/estribillo en el compás 13/9; sus formas lo sitúan en el 21/13). Se siguió el array `form` y se anotó la discrepancia en los `assumptions` de cada brief. Convendría reconciliar acceptance y form en el dossier.
- El spec de folk-metal pide "intro sin batería" y a la vez un `form` que no lo especifica; se respetó la instrucción textual (batería entra en el compás 5).

## Handoff

```text
Continúa en ai/song-maker. Lee sessions/STATE.md, los briefs y los specs de folk-metal-espanol e indie-folk-rock.
Ambas canciones están validadas técnicamente (check 100/100, 0 avisos), pero faltan escucha humana y decisión sobre si promover los géneros a validated.
No recargues las canciones completas: usa tools/song-summary.js.
```
