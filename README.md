# Chiptune Studio

Chiptune Studio es una aplicación web para componer música con timbres
sintetizados de inspiración retro, tocar y grabar patrones en loops, y convertir
audio o MIDI en una canción editable. No requiere instalación ni proceso de
compilación.

## Inicio

Abre `index.html` en un navegador moderno. Para evitar restricciones al cargar
audio o módulos externos, es preferible servir la carpeta mediante un servidor
estático:

```bash
python -m http.server 8000
```

Después visita `http://localhost:8000`. También se pueden abrir directamente
`Chiptune Studio.html` o `Audio2CT.html`. Se recomienda Chrome o Edge recientes
para la mejor compatibilidad con Web Audio, exportación WAV y entrada de audio.

## Aplicación

La página principal reúne dos módulos en pestañas:

- **Estudio:** crea y edita canciones a mano, toca en pantalla o con el teclado
  y escucha o exporta la composición.
- **Audio a canción:** analiza archivos de audio completos o importa MIDI,
  permite revisar el resultado y enviarlo al Estudio con **Abrir en Estudio**.

El Estudio conserva la sesión automáticamente en el almacenamiento local del
navegador. Los dos módulos funcionan en el cliente; no se envían archivos a un
servidor propio.

El pie de página incluye el crédito de autoría y la licencia MIT, junto con
enlaces al perfil y al repositorio de GitHub. La licencia completa está en
[LICENSE](./LICENSE).

## Componer en el Estudio

1. Pulsa **Canción nueva** o **Cargar demo**.
2. Define el título, tempo, tonalidad y escala. El tempo admitido es de 40 a
   240 BPM.
3. Añade o selecciona una pista, elige su instrumento y ajusta volumen, paneo
   o silencio.
4. En **Piano roll**, haz clic en una celda vacía para crear una nota. Arrastra
   una nota para moverla y arrastra su borde derecho para cambiar su duración.
   Haz clic en una nota para seleccionarla; usa **Eliminar nota** o
   **Suprimir/Backspace** para borrarla. Mayús+clic alterna su nivel de
   velocidad entre acentuado, normal y nota fantasma.
5. Pulsa **Reproducir** para escuchar. **Repetir** activa el loop de toda la
   canción. El metrónomo se puede activar antes o durante la reproducción;
   marca negras y acentúa el primer pulso de cada compás. **Nivel metrónomo**
   ajusta el nivel del pulso; también lo afecta el volumen general. Al
   activarlo durante la reproducción aparece un metrónomo visual flotante que
   oscila con cada pulso y muestra el tempo y el tiempo actual del compás.
6. Selecciona una nota para editar sus efectos en el panel bajo el piano roll.
   El ajuste de esa nota pasa a ser el predeterminado para las notas nuevas de
   la misma pista; las notas ya creadas conservan sus propios efectos.

### Teclado tocable y loops

La vista **Teclado tocable** ofrece un teclado en pantalla y pads de batería.
Elige pista/instrumento, octava, escala y duración, y toca con ratón, pantalla
táctil o teclado de computadora. Los atajos del teclado físico se muestran
junto al instrumento; Mayús permite apilar notas simultáneas.

En **Loop de práctica y grabación**, selecciona el compás inicial y una
duración de 1, 2, 4 u 8 compases. **Reproducir loop** practica esa sección;
**Grabar loop** inicia una toma sincronizada. Toca desde el teclado tocable o
desde las teclas del piano roll. **Detener grabación** finaliza la toma sin
parar el loop. **Conservar y superponer tomas** mantiene las notas anteriores;
desactívalo para reemplazar las notas de la pista seleccionada dentro del
rango.

### Instrumentos y efectos

El catálogo incluye seis familias para crear arreglos con roles distintos:

- **Chip clásico:** `pulse25`, `pulse50`, `pulse12`, `triangle`, `saw`, `bass`.
- **Melódicos:** `lead`, `flute`, `brass`, `strings`, `organ`, `choir`.
- **Teclas y plectro:** `piano`, `bell`, `guitar`, `acousticGuitar`,
  `electricGuitar`, `bass2`.
- **Electrónicos:** `supersaw`, `wobble`.
- **Ambiente:** `pad`.
- **Percusión:** `drums`, con `kick`, `snare`, `clap`, `hat`, `openhat`, `tom`
  y `crash`.

Los instrumentos se generan con síntesis Web Audio; nombres como guitarra,
flauta o cuerdas describen emulaciones estilizadas, no grabaciones acústicas.
Cada nota puede usar **trémolo, chorus, flanger, phaser, wah, compresor,
overdrive, fuzz, bitcrusher, delay** y **reverb**. Ajusta los controles de una
nota para cambiar el preajuste de nuevas notas de esa pista. Las notas
existentes no cambian y los efectos desactivados no se guardan en la nota.

## Audio a canción

Arrastra un archivo a la zona de carga o selecciónalo. Se admiten formatos de
audio que el navegador pueda decodificar (por ejemplo WAV, MP3, FLAC u OGG) y
archivos MIDI (`.mid`, `.midi`). Para audio, el análisis usa Basic Pitch para
estimar notas polifónicas y asignarlas a pistas e instrumentos; también detecta
percusión. Ajusta el tempo, desfase y opciones avanzadas, escucha la fuente y
la transcripción, y corrige el JSON antes de importarlo o enviarlo al Estudio.

Basic Pitch se carga desde jsDelivr y necesita conexión a Internet. Si no se
puede cargar la librería o su modelo, Audio2CT avisa y usa un método espectral
de respaldo que estima percusión, pero no transcribe alturas melódicas con la
misma capacidad. La transcripción automática es una aproximación: mezclas
densas, reverberación, distorsión, percusión y notas cercanas pueden producir
omisiones o notas falsas. Conviene escuchar, corregir y volver a analizar con
otros parámetros antes de dar por terminado el arreglo.

El formato del Estudio admite hasta 64 compases, 10 pistas y un tempo fijo. Si
el audio excede el límite de compases, Audio2CT lo indica y limita el JSON a
ese rango. Los cambios de tempo de la fuente no se representan como mapa de
tempo.

## Guía para IA e intercambio de canciones

La guía está en **Estudio → Guía para IA**. Pulsa el botón para preparar las
instrucciones en el cuadro de texto, usa **Copiar texto** y pégalas en la IA que
elijas. Audio2CT no tiene una guía duplicada: su flujo es analizar, validar el
JSON y usar **Abrir en Estudio**.

El Estudio permite importar JSON o módulos JavaScript (`.js`) y exportar la
canción como JSON, JavaScript o WAV estéreo de 44.1 kHz y 16 bits. Audio2CT
puede importar archivos MIDI, pero el Estudio no exporta MIDI. El JSON de
canción usa esta estructura:

```json
{
  "format": "chiptune-studio",
  "version": 1,
  "title": "Mi canción",
  "bpm": 120,
  "bars": 4,
  "tracks": [
    {
      "name": "Melodía",
      "instrument": "pulse25",
      "volume": 0.8,
      "pan": 0,
      "fxPreset": { "delay": 0.25 },
      "notes": [
        {
          "step": 0,
          "len": 2,
          "pitch": "E5",
          "vel": 0.8,
          "fx": { "delay": 0.25 }
        }
      ]
    }
  ]
}
```

`step` y `len` se expresan en pasos de semicorchea; `pitch` sigue la
convención de octava del Estudio. `vel`, `pan`, `mute`, `fxPreset` y `fx` son
opcionales. `fxPreset` define los efectos que heredarán las notas nuevas de la
pista; `fx` conserva los efectos particulares de cada nota. Si una canción
anterior no tiene `fxPreset`, el Estudio toma como preajuste los efectos de la
última nota de la pista.
Las versiones anteriores sin `fx` siguen siendo compatibles.

## Accesibilidad y uso

Los controles principales se pueden usar con ratón, teclado o pantalla táctil.
Los botones, campos y modos incluyen etiquetas accesibles, mensajes de estado
y estados de foco visibles. En Studio, la barra espaciadora alterna reproducir
y detener cuando no se está escribiendo en un campo; en el piano roll,
Suprimir/Backspace elimina la nota seleccionada.

Si no hay sonido, comprueba el volumen general y el nivel del metrónomo, y
pulsa **Reproducir** para habilitar el audio del navegador tras la interacción.
Si el análisis de audio no produce alturas, revisa el estado del motor y la
conexión a Internet. En caso de un resultado impreciso, usa la escucha previa,
los controles de sensibilidad y el editor JSON.

## Estructura del proyecto

```text
index.html                    Contenedor y navegación entre módulos
app.css / app.js              Estilos y comunicación del contenedor
Chiptune Studio.html          Interfaz del editor
apps/studio/studio.css        Estilos del editor y sus modos
apps/studio/studio.js         Síntesis, edición, loops e importación/exportación
Audio2CT.html                 Interfaz de transcripción y conversión
apps/audio2ct/audio2ct.css    Estilos de Audio2CT
apps/audio2ct/audio2ct.js     Análisis de audio/MIDI y conversión
```
