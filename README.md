# Chiptune Studio 2

Compón música chiptune y aprende teoría musical en una sola pantalla (pensado para 1920×1080, sin scroll).
Abre `index.html` con doble clic: no necesita servidor ni compilación (por eso usa scripts clásicos y no módulos ES). Para que la carpeta `demos/` se detecte automáticamente, usa `node tools/serve.js` (ver **Demos**).

## Estructura (cada pieza se puede auditar por separado)

```
index.html                 Pantalla única; aquí se enlazan los archivos de instrumentos y efectos
css/app.css                Estilos
src/core/cs.js             Espacio de nombres CS, utilidades de notas
src/engine/schema.js       Registro y VALIDACIÓN de instrumentos y efectos (errores → CS.errors / consola)
src/engine/voice.js        Sintetizador genérico: lee un instrumento (JSON) y lo convierte en sonido
src/engine/effects.js      Algoritmos de efectos (reverb, delay, chorus, drive)
src/engine/engine.js       Rig (grafo de audio), reproductor con reloj de audio, metrónomo, exportación WAV
src/instruments/*.js       UN archivo por instrumento (JSON puro dentro de CS.registerInstrument)
src/effects/*.js           UN archivo por efecto
src/song/song.js           Formato de canción, importación v1/v2, guía para IA (se genera sola)
src/theory/theory.js       Escalas, grados, acordes
src/theory/lessons.js      Ruta de aprendizaje editable, con comprobación automática
src/ui/app.js              Interfaz: piano roll, teclado, pistas, aprendizaje, archivo
demos/*.json               Demos: cualquier .json nuevo aparece en Menú → Demos
demos/demos.js             Copia inline generada para que las demos funcionen con doble clic
tools/serve.js             Servidor local sin dependencias; lista demos/ al vuelo
tools/build-demos.js       Regenera demos/index.json y demos/demos.js (--watch)
tools/check-demo.js        Valida una demo con el normalizador y los rangos de la app
tools/make-demo.js         Generador de la demo «Metropolis of Mirrors»
```

## Añadir un instrumento
1. Copia `src/instruments/pulse.js`, cámbiale `id`, `name`, `family`, `range`, `tip` y los parámetros de sonido.
2. Añade su `<script>` en `index.html`. Nada más: aparece en la lista, en la guía para IA y en el WAV.

Campos (`cs-instrument@1`): `osc[]` (`wave`: sine|triangle|saw|square|pulse, `duty`, `ratio`, `detune`, `gain`), `env` (attack, decay, sustain, release, ring),
`filter` (`cutoff:[inicio,fin]` × frecuencia de la nota, `time`, `q`), `vibrato` (rate, depth, delay), `noise` (soplo/golpe), `formants` (voces), `gain`.
Percusión: `pieces` con `layers` (`osc` con barrido de frecuencia, o `noise` con filtro). Un archivo mal formado se ignora y se anota en `CS.errors`.

### Capacidades avanzadas de síntesis (opcionales en un instrumento)
- `osc[].wave: "pwm"` con `duty: [inicio, fin]` y `time`: el ancho del pulso se mueve solo (el clásico "respirar" del C64/NES).
- `pitchEnv: { from: cents, time: s }`: la nota arranca desafinada y cae a su altura (chirp, moneda, láser).
- `arp: { offsets: [0,4,7], rate: Hz }`: arpegio rápido dentro de la voz (el truco de los chips de un canal).
- Por nota (formato de canción): `slide: "G5"` desliza la nota hasta esa altura; `chord: "M" | "m" | "dim" | "aug" | "7" | "M7" | "m7" | "sus4" | "power"` la toca como acorde arpegiado. En el estudio: **Efectos de nota** (selector de acorde y botón ↗ Deslizar).

## Añadir un efecto
Copia un archivo de `src/effects/`. Si usa un `kind` existente (reverb, delay, chorus, drive) solo cambias parámetros;
para un algoritmo nuevo, añade `CS.kinds.miEfecto = (ctx, params) => ({ input, output })` en `src/engine/effects.js`. Los efectos son envíos por pista (sliders en la tarjeta de pista).

## Formato de canción v2
`{"format":"chiptune-studio","version":2,"title","bpm","tempo":[...],"bars","timeSig","tracks":[{"name","instrument","volume","pan","fx":{"reverb":0.15},"notes":[{"step","len","pitch","vel","slide","chord"}]}]}`

- La rejilla es de semicorcheas (1 paso = 1/16). `timeSig` (opcional, por defecto `"4/4"`) fija los pasos por compás: **4/4 = 16, 3/4 = 12, 2/4 = 8, 5/4 = 20, 6/8 = 12, 12/8 = 24, 7/8 = 14**. El compás *n* empieza en el paso (n−1) × pasos por compás.
- `loopStart` (opcional, compás 0-based, por defecto 0): al terminar, la canción vuelve a ese compás (intro + parte que se repite). **Menú → WAV en bucle perfecto** exporta solo el tramo que se repite, con la cola del final mezclada sobre el inicio (sin salto al repetir).
- `tempo` (opcional): cambios de velocidad por compás. `[{"bar":8,"bpm":140}]` salta a 140 BPM al empezar el compás 9; `[{"bar":8,"bpm":140,"ramp":true}]` llega a 140 poco a poco desde el cambio anterior (acelerando o ritardando). `bar` es 0-based y debe ser ≥ 1; el compás 1 usa `bpm`. Afecta a la reproducción, al metrónomo, al monitor y al WAV (las notas que cruzan un cambio conservan su duración real).
- Se importan canciones v1 y v2 sin `timeSig` (se leen como 4/4). Alias de ids antiguos: flute→triangle, bass2→pluck, lead→saw, pulse25/50→pulse, pulse12→arp, organ/choir→pad.
- Cambiar el compás en el estudio reacomoda las notas compás por compás (las que no caben se quitan; se puede deshacer).

## Tempo progresivo
Con el botón **♩** de la cabecera se abre el mapa de tempo: permite que cada sección vaya a una velocidad distinta (intro lenta → estribillo rápido → puente lento) o que el tempo cambie gradualmente (un build-up que acelera, un final que ritarda). Los cambios se guardan por compás, así que sobreviven a transponer, copiar compases o cambiar el compás. En el roll, el compás con cambio se marca con una línea y `♩BPM` (↗/↘ si es gradual). Durante la reproducción, el monitor muestra el BPM actual.

## Demos y la carpeta `demos/`
La carpeta `demos/` es la lista de demos de la app: deja ahí cualquier canción `.json` y aparecerá en **Menú → Demos**. Incluye **«Metropolis of Mirrors»**, una pieza instrumental de metal progresivo en 7/8 (64 compases, 7 pistas, 1:59) con riff pesado, unísonos, tema, solo, breakdown y un final que acelera y ritarda. Es un homenaje al estilo de Dream Theater, no una transcripción.

- **Detección automática (recomendado):** `node tools/serve.js` y abre `http://127.0.0.1:8080/`. El servidor genera `/demos/index.json` y el listado de la carpeta al vuelo; cualquier `.json` nuevo aparece en el menú sin reiniciar. La lista se refresca sola cada pocos segundos mientras el menú está abierto. También funciona con un servidor estático que muestre el listado de `demos/` o que sirva `demos/index.json`.
- **Doble clic (`file://`):** por seguridad, el navegador no permite leer una carpeta local desde una página `file://`. La app usa `demos/demos.js`, una copia inline generada por `node tools/build-demos.js`. Para añadir una demo nueva sin servidor, ejecuta ese comando y recarga, o usa **Menú → Demos → Abrir carpeta / Abrir JSON** (la demo queda guardada en el navegador).
- `node tools/build-demos.js --watch` regenera la copia inline al guardar un `.json` (recarga la app para verla).
- `node tools/check-demo.js [archivo]` valida compases, rangos de instrumento y duración con el mismo código de la app.
- `node tools/make-demo.js` vuelve a generar la demo incluida (herramienta de composición).

## Pantalla
- **Cabecera:** ☰ Menú (demos, canción nueva, importar/exportar JSON·JS·WAV, guía para IA, atajos) · título · deshacer/rehacer · reproducir/detener · repetir · metrónomo (sonido) · **monitor** (péndulo, 4 tiempos y avance) · BPM y **♩ mapa de tempo** · compases · **bucle de sección** · tono y escala · volumen · 📖 Aprender.
- **Roll (ancho completo):** una octava de 12 semitonos, con zoom y desplazamiento. Barra de herramientas: octava, duración de nota, zoom, copiar/pegar compás, transponer ♭/♯ y limpiar (compás, pista, todo).
- **📖 Aprender (panel flotante):** 3 pestañas. *Lecciones*: 13 lecciones de varias páginas (explicación visual → 3 ejemplos con pasos y audio → reto que se comprueba solo); «Siguiente» pasa a «Lección N ▶» al terminar. *Acordes*: los 7 del tono con sus notas (nomenclatura C4 · Do), cómo se forman, dónde se usan, instrucciones «Hazlo tú», ＋ insertar y progresiones famosas. *Oído*: intervalos, acorde y escala mayor/menor.
- **«Suena con»:** por defecto todo suena con piano; el botón lo sincroniza con el instrumento y la octava de la pista elegida (ejemplos, acordes y oído).
- **Teclado:** las teclas negras muestran ♯ y ♭; al tocar, dice cuál es el nombre correcto (por la tonalidad, o subiendo → ♯ / bajando → ♭).
- **Todos los botones** tienen una descripción emergente breve al pasar el ratón.

## Ruta de aprendizaje
Basada en el mapa del video (vocabulario → intervalos → escala mayor → acordes → armonizar → escala menor → pentatónica → modos/centro tonal), adaptada a componer y con una lección final de forma y arreglo. Está en `src/theory/lessons.js` como datos: se puede reordenar o ampliar.

## Atajos
Espacio reproducir/pausar · Z / X bajar/subir octava · A W S E D F T G Y H U J K tocar · Ctrl+Z / Ctrl+Y deshacer/rehacer · Inicio cursor al principio · Ctrl+rueda zoom · rueda desplazar · Mayús+clic en nota: su fuerza · clic derecho: borrar nota.
