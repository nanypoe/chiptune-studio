# Chiptune Studio 2

Compón música chiptune y aprende teoría musical en una sola pantalla (pensado para 1920×1080, sin scroll).
Abre `index.html` con doble clic: no necesita servidor ni compilación (por eso usa scripts clásicos y no módulos ES).

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
```

## Añadir un instrumento
1. Copia `src/instruments/pulse.js`, cámbiale `id`, `name`, `family`, `range`, `tip` y los parámetros de sonido.
2. Añade su `<script>` en `index.html`. Nada más: aparece en la lista, en la guía para IA y en el WAV.

Campos (`cs-instrument@1`): `osc[]` (`wave`: sine|triangle|saw|square|pulse, `duty`, `ratio`, `detune`, `gain`), `env` (attack, decay, sustain, release, ring),
`filter` (`cutoff:[inicio,fin]` × frecuencia de la nota, `time`, `q`), `vibrato` (rate, depth, delay), `noise` (soplo/golpe), `formants` (voces), `gain`.
Percusión: `pieces` con `layers` (`osc` con barrido de frecuencia, o `noise` con filtro). Un archivo mal formado se ignora y se anota en `CS.errors`.

## Añadir un efecto
Copia un archivo de `src/effects/`. Si usa un `kind` existente (reverb, delay, chorus, drive) solo cambias parámetros;
para un algoritmo nuevo, añade `CS.kinds.miEfecto = (ctx, params) => ({ input, output })` en `src/engine/effects.js`. Los efectos son envíos por pista (sliders en la tarjeta de pista).

## Formato de canción v2
`{"format":"chiptune-studio","version":2,"title","bpm","bars","tracks":[{"name","instrument","volume","pan","fx":{"reverb":0.15},"notes":[{"step","len","pitch","vel"}]}]}`
16 pasos por compás, 4/4. Se importan canciones v1 (los ids antiguos tienen alias: flute→triangle, bass2→pluck, lead→saw, pulse25/50→pulse, pulse12→arp, organ/choir→pad).

## Atajos
Espacio reproducir/detener · Z / X bajar/subir octava · A W S E D F T G Y H U J K tocar · Ctrl+rueda zoom · rueda desplazar · Mayús+clic en nota: fuerza.
