# GUÍA PARA IA — Chiptune Studio (formato v2)

Responde SOLO con un JSON válido:

```json
{
  "format": "chiptune-studio",
  "version": 2,
  "title": "Nombre",
  "bpm": 120,
  "bars": 8,
  "timeSig": "4/4",
  "tracks": [
    {
      "name": "Melodía",
      "instrument": "pulse",
      "volume": 0.8,
      "pan": 0,
      "fx": {
        "reverb": 0.15
      },
      "notes": [
        {
          "step": 0,
          "len": 2,
          "pitch": "E5"
        },
        {
          "step": 2,
          "len": 2,
          "pitch": "G5",
          "vel": 0.6
        }
      ]
    }
  ]
}
```

---

## REGLAS

- **Rejilla de semicorcheas:** 1 paso = 1/16. `"timeSig"` (opcional, por defecto `"4/4"`) fija los pasos por compás:
  - 4/4 = 16
  - 3/4 = 12
  - 2/4 = 8
  - 5/4 = 20
  - 6/8 = 12
  - 12/8 = 24
  - 7/8 = 14
  
  El compás $n$ empieza en el paso $(n-1) \times \text{pasos por compás}$.

- **loopStart** (opcional, compás 0-based; por defecto 0): al llegar al final, la canción vuelve a ese compás. Útil para intro + parte que se repite. Para un bucle sin saltos, el último compás debe enlazar con el compás `loopStart`.

- **len en pasos:** 1=1/16, 2=1/8, 4=1/4, 8=1/2, 16=compás en 4/4. `step + len <= bars × pasos por compás`.

- **pitch:** `"C4"` = Do central; sostenidos con `#`. En batería: `kick`, `snare`, `rim`, `clap`, `hat`, `openhat`, `shaker`, `ride`, `crash`, `tomlo`, `tommid`, `tomhi`.

- **Límites:** `bpm` 40-240, `bars` 1-64, hasta 12 pistas, `volume` 0-1, `pan` -1 (izq) a 1 (der).

- **vel** (0.1-1, opcional): tiempo fuerte 1, contratiempo 0.6-0.8, nota fantasma 0.4.

- **slide** (opcional, nota destino, ej. `"G5"`): la nota se desliza hasta esa altura durante su duración (portamento, saltos de juego).

- **chord** (opcional): `"M"`, `"m"`, `"dim"`, `"aug"`, `"7"`, `"M7"`, `"m7"`, `"sus4"` o `"power"`: una sola nota suena como acorde arpegiado rápido (truco chiptune de un canal).

- **fx por pista** (envío 0-1): `reverb`, `delay`, `chorus`, `drive`, `crush`.

- **Ids antiguos aceptados:**
  - `pulse25` → `pulse`
  - `pulse50` → `pulse`
  - `pulse12` → `arp`
  - `flute` → `triangle`
  - `lead` → `saw`
  - `bass2` → `pluck`
  - `organ` → `pad`
  - `choir` → `pad`

---

## INSTRUMENTOS

- **pulse** (Pulso (lead), C3–C7): Lead brillante y claro: ideal para la melodía principal.
- **arp** (Pulso fino (arpegio), C4–C8): Fino y rápido: arpegios y adornos que dan movimiento.
- **pwm** (Pulso PWM (lead vivo), C3–C7): El ancho del pulso se mueve solo y el sonido "respira": un clásico del C64 y del NES. Ideal para melodías largas y expresivas.
- **chirp** (Chirp (salto de moneda), C4–C8): Cada nota "cae" desde una octava más arriba: sonidos de moneda, láser y leads muy marcados.
- **triangle** (Triángulo (suave), C3–C6): Redondo y dulce: contramelodías y líneas tranquilas.
- **saw** (Sierra (lead eléctrico), C3–C7): Potente, con vibrato: solos y melodías de rock o electrónica.
- **brass** (Metales, C3–C6): Fanfarria y energía: refuerzos y melodías heroicas.
- **bell** (Campanas, C5–C8): Cristalinas: notas agudas que brillan y resuenan solas.
- **bass** (Bajo sub, C1–C4): Graves profundos: toca la raíz de cada acorde.
- **pluck** (Bajo pulsado, C1–C4): Con ataque: funk, rock y ritmos marcados.
- **piano** (Piano, C2–C7): Versátil: acordes y melodías de cualquier género.
- **guitar** (Guitarra, C2–C6): Pulsada: ritmos y arpegios con carácter.
- **strings** (Cuerdas, C2–C6): Colchón amplio: acordes largos que sostienen la canción.
- **pad** (Pad (ambiente), C2–C6): Atmósfera suave: acordes muy largos de fondo.
- **drums:** `kick` (Bombo), `snare` (Caja), `rim` (Aro), `clap` (Palmada), `hat` (Hi-hat), `openhat` (Hi-hat abierto), `shaker` (Shaker), `ride` (Ride), `crash` (Crash), `tomlo` (Tom grave), `tommid` (Tom medio), `tomhi` (Tom agudo).

---

## PARA QUE NO SUENE TODO IGUAL

- **Un timbre distinto por rol:** melodía, contramelodía (otro timbre y otra octava), armonía, bajo, brillo (bell), batería.
- **Variación:** Cambia de instrumento entre secciones; usa `vel` y `pan`; fills de toms al final de frase y crash al empezar sección.
- **Registro y Armonía:** Respeta el registro de cada instrumento. Elige escala y acordes (ej. Am-F-C-G); la melodía cae en notas del acorde en tiempos fuertes.