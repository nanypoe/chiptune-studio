---
id: folk-metal-espanol
name: Folk Metal español
family: metal
status: tested
confidence: 0.62
updated: 2026-10-22
region: España (Madrid), con difusión en Hispanoamérica
era: 1994–presente (consolidación 1998–2003)
function: concierto, himno festivo, identidad cultural
sources:
  - title: "Folk metal - Wikipedia, la enciclopedia libre"
    url: "https://es.wikipedia.org/wiki/Folk_metal"
  - title: "Mägo de Oz @ Electric Ballroom"
    url: "https://spainculturescience.co.uk/event/mago-de-oz-electric-ballroom/"
  - title: "Figura 3.111. Zanfoña (tesis sobre Folk y Viking Metal)"
    url: "https://repositorio.inah.gob.mx/_flysystem/fedora/2023-11/tesis_1890.pdf"
  - title: "Folk Metal Violin tabs (hilo de foro)"
    url: "https://forum.metal-archives.com/viewtopic.php?f=8&t=111736"
  - title: "Los orígenes del Folk Metal se remontan a la década de los noventa"
    url: "http://bdjc.iia.unam.mx/items/show/635"
  - title: "Mägo de Oz - Wikipedia, la enciclopedia libre"
    url: "https://es.wikipedia.org/wiki/M%C3%A4go_de_Oz"
  - title: "Hoy, Mago de Oz regresa a San Luis Potosí"
    url: "https://elheraldoslp.com.mx/2015/12/04/hoy-mago-de-oz-regresa-a-san-luis-potosi/"
  - title: "Getting a Pan flute... (hilo de foro)"
    url: "https://forum.metal-archives.com/viewtopic.php?p=1099558"
---

# Folk Metal español

## 1. Identidad y célula

**Célula:** folk metal español de base heavy metal con color celta-ibérico, articulado en Madrid y orientado a concierto masivo e himno festivo. El dossier no describe todo el folk metal hispanohablante ni el folk metal europeo en general: acota una célula de estadio, con violín y flauta/whistle como marcadores tímbricos y una escritura de canción directa, de estribillo coreable.

**Qué es:** fusión de heavy metal tradicional (riff de guitarra distorsionada, batería de rock duro, bajo eléctrico) con melodías e instrumentos de tradición celta (violín, flauta irlandesa, whistle, ocasionalmente gaita) y una forma de canción pensada para que el público cante. La melodía folk no es un adorno: comparte protagonismo con el riff.

**Dónde y cuándo:** España, Madrid; primera publicación en 1994 y consolidación internacional entre 1998 y 2003. La recepción se extiende a Hispanoamérica. La fuente institucional consultada sitúa el origen de la banda de referencia en 1988 y su consolidación con *Finisterra*.

**Para qué y para quién:** concierto, escucha grabada y celebración comunitaria. El oyente objetivo reconoce el género por el backbeat de metal, el riff de corcheas y una melodía diatónica que puede tararear; no por un ritual pagano, una danza tradicional o un club.

**Supuesto central:** no se encontraron transcripciones musicales verificables de las obras de la célula. Los BPM, rangos, patrones y progresiones son inferencias razonables a partir de descripciones de género y de la práctica del heavy metal melódico. Este dossier no transcribe ni reproduce material de ninguna obra existente.

**Correcciones respecto a la investigación cruda:**

- El id se normaliza a `folk-metal-espanol` para que coincida con la carpeta, el archivo y el slug del catálogo.
- El `tempo.map` original no tenía `bar`; se añaden barras 0-based alineadas con la forma.
- Las densidades originales no contaban la batería; se recalculan como notas por compás de todas las pistas.
- Las fuentes de foro se conservan como contexto, pero no sostienen por sí solas ninguna decisión estructural.
- Se aclara que el instrumento de viento de referencia es flauta irlandesa/tin whistle, no flauta andina.

## 2. Referencias y fuentes

| Fuente | Tipo | Afirmación que respalda | Confianza |
|---|---|---|---|
| Wikipedia, «Folk metal» | Enciclopedia abierta | El metal celta se caracteriza por violín, gaita y flauta irlandesa; Mägo de Oz aparece entre las bandas destacadas; temáticas de leyendas y fantasía. | Media |
| SPAIN arts & culture, ficha de concierto | Programación cultural oficial | Mägo de Oz son «pioneers of Spanish folk metal»; mezclan heavy metal con influencias celtas, violín y flauta; letras de fantasía y directos teatrales. | Media-alta |
| Tesis INAH sobre folk/viking metal | Tesis académica | Las bandas de folk/viking amplían la plantilla con instrumentos tradicionales: violines, flautas, acordeones, zanfonas. | Media |
| Foro Metal-Archives, «Folk Metal Violin tabs» | Testimonio de practicantes | Las melodías suelen ser escalas mayores/menores simples y rápidas; el violín tiene rol protagónico. | Baja-media |
| BDJC-IIA, UNAM, orígenes del folk metal | Repositorio académico | Mägo de Oz es mencionado como precursor del folk metal contemporáneo, con primer disco en 1994. | Media |
| Wikipedia, «Mägo de Oz» | Enciclopedia abierta | Origen en 1988–1989; incorporación temprana de violín y melodías folk. | Media |
| El Heraldo de San Luis Potosí, 2015 | Prensa regional | La banda mezcla metal/hard rock con música celta; la música celta predomina en su sonido. | Media-baja |
| Foro Metal-Archives, «Getting a Pan flute...» | Testimonio de practicantes | En folk metal es común el tin whistle en varias tonalidades, no la flauta andina; guitarra en afinación estándar. | Baja |

**Verificación:** Wikipedia («Folk metal») y SPAIN arts & culture se comprobaron en línea el 2026-10-22 y sostienen las afirmaciones tímbricas y funcionales principales. El resto se conserva con su nivel de confianza declarado; las fuentes de foro son contexto, no prueba académica.

**Límite:** no hay partituras, análisis armónicos ni mediciones de tempo publicadas en las fuentes consultadas. La confianza global se queda en 0.62.

## 3. Métrica, tempo y forma

**Compás:** 4/4, 16 pasos por compás. Es el compás dominante del heavy metal y del rock de estadio; no se documenta un uso sistemático de compases irregulares en esta célula. La app no permite cambiar de compás dentro de una canción, así que el 4/4 es también la decisión de traducción.

**Tempo:** rango inferido **100–150 BPM**, zona típica **120–140 BPM**, valor de trabajo **128 BPM**. La intro puede ir algo más lenta; el estribillo no necesita acelerar para sonar amplio. El tempo se escribe siempre con `bar >= 1` y base 0: el compás 1 usa `bpm`; un cambio en el compás 5 usa `bar: 4`.

| Sección | Compases (1-based) | BPM | `bar` en JSON (0-based) |
|---|---|---:|---:|
| Intro | 1–4 | 112 (base) | — |
| Estrofa | 5–12 | 128 | 4 |
| Estribillo | 13–20 | 128 | 12 |
| Puente | 21–28 | 120 | 20 |
| Break | 29–30 | 128 | 28 |
| Outro | 31–34 | 132 | 30 |

**Unidad de frase:** 4 compases; respiración cada 2. Estrofas y estribillos de 8 compases; secciones de 8 o 16. La forma completa del spec suma 34 compases, dentro del máximo de 64.

| Sección | Compases | Rol | Energía | Densidad (notas/compás, todas las pistas) |
|---|---:|---|---:|---:|
| Intro | 4 | Melodía folk; bajo y guitarra acústica entran al final; sin batería | 0.3 | 4–12 |
| Estrofa | 8 | Riff de corcheas, bajo, backbeat y melodía simplificada | 0.6 | 28–36 |
| Estribillo | 8 | Melodía amplia, riff denso, colchón y batería completa | 0.9 | 32–48 |
| Puente | 8 | Solo folk o riff, sin colchón; contraste y respiración | 0.5 | 16–28 |
| Break | 2 | Batería sola y dropout total antes de la reentrada | 0.2 | 0–8 |
| Outro | 4 | Reentrada con riff y crash; cierre en tónica | 0.8 | 10–44 |

**Cómo empieza y termina:** empieza por melodía folk reconocible (violín/flauta) o por riff de guitarra; termina en cadencia fuerte sobre la tónica, con golpe final y crash. Evitar fundidos largos: en chiptune el cierre debe ser rítmico y claro.

## 4. Ritmo y groove

**Pulso:** el pulso no es folk, es metal. Kick en negras, snare en 2 y 4 (backbeat), hat en corcheas. La melodía folk flota por encima del riff; no compite con la batería.

**Patrón base (16 pasos):**

| Pieza | Pasos |
|---|---|
| Kick | 0, 4, 8, 12 |
| Snare | 4, 12 |
| Hat | 0, 2, 4, 6, 8, 10, 12, 14 |

**Variante intensa (estribillo):**

| Pieza | Pasos |
|---|---|
| Kick | 0, 3, 8, 11 |
| Snare | 4, 12 |
| Hat | 0, 2, 4, 6, 8, 10, 12, 14 |
| Crash | 0 (inicio de sección) |

**Riff de guitarra (16 pasos, acentos):** `0, 2, 3, 6, 8, 10, 11, 14`. Las corcheas se interrumpen con síncopas en 3 y 11; los acentos largos caen en 0 y 8. Es una inferencia de escritura de metal, no una transcripción.

**Break de batería:** snare en 4 y 12; toms en 0, 2, 8 y 10; kick en 0 y 8. Sirve para cortar la densidad antes del último estribillo.

**Groove:** recto y driving, sin swing. El peso está en el backbeat y en los acentos del riff. No hay clave afrocubana ni polirritmia; el «ancla» es el 2–4 y la corchea del riff.

## 5. Armonía

**Modos:** menor natural (`minor`) como base; `dorian` para pasajes de color folk (sexta mayor sobre tónica menor); `mixolydian` para secciones de celebración (bVII mayor). `phrygianDominant` puede aparecer como color puntual, pero no es el núcleo de esta célula.

**Progresiones por grados (en menor):**

| Uso | Progresión | Ejemplo en A menor |
|---|---|---|
| Estrofa | i – VI – III – VII | Am – F – C – G |
| Estribillo | VI – III – VII – i | F – C – G – Am |
| Estribillo alternativo | i – VII – VI – VII | Am – G – F – G |
| Puente | iv – i – VII – VI | Dm – Am – G – F |

**Cadencias:** `bVII – i` y `VI – VII – i` (plagal amplia) antes que una auténtica V–i demasiado clásica. El cierre de estribillo puede ser un acorde de tónica completo y sostenido.

**Préstamos:** bVII mayor (color mixolidio) y bVI mayor (color natural). Son parte del lenguaje, no «notas equivocadas».

**Tensiones:** tríadas predominantes; las séptimas se reservan para el puente. La tensión viene de la densidad, el drive y el choque entre riff y melodía, no de la extensión armónica.

## 6. Melodía y fraseo

**Motivo:** 3–5 notas, con salto ascendente de cuarta o quinta y descenso por grados conjuntos. La forma abstracta es tónica–4ª–3ª–2ª–tónica; el test la concreta en un motivo original de cinco notas (A–D–C–B–A). No se copia ninguna melodía existente.

**Ámbito:** melodía principal **C4–C6**. El estribillo puede llegar a D6 o E6 en el clímax, pero no debe quedarse en el registro extremo. El riff vive en C3–C5 para dejar espacio.

**Ornamentos:** apoyatura rápida de dos semicorcheas, trino corto en el clímax y `slide` ascendente puntual. En chiptune, el vibrato expresivo del violín no existe por nota; se aproxima con `pwm`, `delay` y ornamentos rápidos. Evitar la ornamentación barroca: esta célula es directa.

**Fraseo:** frases de 4 compases con respiración cada 2. Llamada-respuesta entre lead folk y guitarra en intro y puente. En el estribillo, la melodía es silábica y masiva: notas largas en los acentos, no virtuosismo.

**Relación con el canto:** no es danza tradicional; es canto de participación. El estribillo debe ser fácil de corear: intervalos no mayores de quinta, ritmo repetitivo y una nota final estable.

**Evitar:** cromatismo sistemático, saltos mayores de sexta en el estribillo, melodía que compita con el riff en el mismo registro y frases que no respiren.

## 7. Roles e instrumentación

| Rol | Instrumento real | Instrumento Chiptune | Registro | Comportamiento |
|---|---|---|---|---|
| Lead folk | Violín / flauta / whistle | `pulse` o `pwm` | C4–C6 | Melodía principal en intro y puente; contramelodía en estrofa y estribillo. `pulse` para brillo; `pwm` para expresividad. |
| Riff metal | Guitarra eléctrica distorsionada | `saw` con `drive` | C3–C5 | Corcheas con acentos en 3 y 11; sostiene la armonía y deja la melodía al lead folk. |
| Doblez metal | Segunda guitarra / capa de riff | `saw` con `drive` | C3–C5 | Dobla la melodía del estribillo una octava abajo; usa la quinta si la octava choca con la raíz del riff. |
| Bajo | Bajo eléctrico | `bass` o `pluck` | C2–C3 | Raíz del acorde en negras; en el estribillo alterna raíz y quinta en corcheas; `pluck` solo en secciones rápidas. |
| Batería | Batería acústica | `drums` | — | Backbeat kick/snare/hat; `crash` al inicio del estribillo; break de snare/toms antes del cierre. |
| Colchón armónico | Teclados / orquesta | `strings` o `pad` | C3–C5 | Acordes largos (tercera y quinta) en el estribillo; densidad baja para no tapar el riff ni duplicar la raíz. |
| Color folk secundario | Gaita / whistle | `triangle` o `chirp` | C4–C6 | Contramelodía dulce en estrofa y puente; `triangle` para flauta, `chirp` para whistle brillante. |
| Arpegios / textura | Guitarra acústica / arpa | `arp` o `guitar` | C4–C6 | Arpegios de 16 pasos en intro y reentrada; `guitar` para simular rasgueo. |

**Duplicaciones:** en el estribillo, la melodía de `pulse` se dobla con una segunda capa de `saw` una octava abajo para dar peso metal; cuando la octava choca con la raíz del riff, el doblez usa la quinta. En la intro, `pulse` va solo, sin batería.

**Qué se deja solo:** la melodía folk en la intro (sin riff) y el break de batería antes del último estribillo. El silencio también es un rol: no todo puede sonar a la vez.

**Límite de la app:** el test usa 8 pistas (`pulse`, dos `saw` —riff y doblez—, `bass`, `drums`, `strings`, `triangle` y `guitar`), dentro de las 12 disponibles. Si se añaden `pwm`, `pad`, `arp` o `pluck`, hay que quitar capas para no saturar.

## 8. Dinámica, densidad y silencio

Las densidades de la investigación cruda contaban sobre todo melodía, riff y bajo. Al sumar la batería, la cifra real sube. Estas son las densidades corregidas, en notas por compás de **todas** las pistas:

| Sección | Densidad corregida | Comentario |
|---|---:|---|
| Intro | 4–12 | Melodía sola al principio; bajo y acústica entran después. |
| Estrofa | 28–36 | Riff, bajo, backbeat y melodía simplificada. |
| Estribillo | 32–48 | Riff denso, melodía amplia, colchón y batería completa. |
| Puente | 16–28 | Solo folk o riff; sin colchón. |
| Break | 0–8 | Batería sola y, después, silencio. |
| Outro | 10–44 | Reentrada densa; el compás final baja a un golpe. |

**Curva:** baja (intro) → media (estrofa) → alta (estribillo) → media-baja (puente) → break/silencio → alta (reentrada) → cierre. La curva es parte de la identidad: si todo suena igual de denso, el género pierde el efecto de estadio.

**Breaks y dropouts:**

- **Break de batería** de 1–2 compases antes del estribillo final: solo `drums` (snare/toms), sin armonía.
- **Dropout del puente:** el primer compás deja solo `pulse` con la melodía folk, sin armonía ni batería.
- **Falso final:** tras el estribillo, un compás de silencio y reentrada con riff y crash.
- **Silencio final:** el último compás cierra en tónica; no se alarga con un fundido.

**Reglas:** el silencio es estructural (break, dropout), no textural. No hay silencios largos en la estrofa; la respiración se hace con frases de 4 compases, no con huecos aleatorios.

## 9. Producción y textura

**Textura:** capas diferenciadas por función. Riff distorsionado en el medio, melodía brillante al frente, bajo redondo abajo, batería seca y colchón discreto. La mezcla debe dejar espacio a la melodía folk; el riff no debe taparla.

| Efecto | Destino | Uso |
|---|---|---|
| `drive` | `saw` (riff) | Distorsión moderada; si se pasa, embarra y tapa la melodía. |
| `reverb` | `pulse`/`pwm`, `strings` | Espacio de concierto, corto-medio. |
| `delay` | Melodía del puente | Amplitud sin samples; no usarlo en toda la canción. |
| `chorus` | `triangle`/`pwm` | Movimiento para flauta o color folk. |
| `crush` | Batería | Textura de grabación de metal, muy leve; evitar en la melodía. |

**Lo que se pierde:** la distorsión real de guitarra, la resonancia del violín acústico y la dinámica de un batería humano. El chiptune sustituye por `drive`, `pwm`, `chorus` y patrones rítmicos fijos. La autenticidad tímbrica no es el objetivo: el objetivo es la recognoscibilidad de la gramática (backbeat, riff de corcheas, melodía folk diatónica, contraste de densidad).

## 10. Traducción a Chiptune Studio

**Qué se puede reproducir:**

- Backbeat de metal (kick 1/3, snare 2/4) y riff de corcheas con acentos.
- Melodía folk diatónica en `pulse`/`pwm`, registro C4–C6.
- Progresiones i–VI–III–VII y VI–III–VII–i.
- Forma intro–estrofa–estribillo–puente–estribillo–outro en 4/4.
- Break de batería, dropout de puente y falso final.
- Colchón de `strings`/`pad` y arpegios de `guitar`/`arp`.
- Doblez de la melodía a la octava (o a la quinta) en el estribillo.

**Qué no se puede reproducir:**

- Distorsión de guitarra real (se sustituye por `saw` + `drive`).
- Vibrato expresivo de violín (se sustituye por `pwm` + ornamentos rápidos + `delay`).
- Voces y coros (no permitidos).
- Cambios de compás (no permitidos).
- Samples de instrumentos folk reales (no permitidos).
- Microtonalidad y articulación por nota.

**Workarounds:**

- Violín → `pulse` con `delay` corto; flauta → `triangle` o `pwm` con `chorus`.
- Gaita → `saw` con `drive` suave o `pulse` con `chorus`; evitar `brass`, que suena a fanfarria.
- Guitarra acústica → `guitar` o `pluck` para arpegios; no usar `piano` como base folk.
- Bajo → `bass` para sostener; `pluck` solo en secciones de mayor densidad rítmica.

**Test mínimo — `TEST.json`, «Alborada de hierro»:** 16 compases, 4/4, A menor, 112→128 BPM, 8 pistas, 387 notas (media 24.2 notas/compás). Comprime las secciones de 8 compases a 4 para caber en la prueba; el spec completo conserva la forma de 34 compases.

| Compases | Sección | Qué demuestra |
|---|---|---|
| 1–4 | Intro | `pulse` con motivo original de 5 notas; `bass` en blancas; `guitar` acústica entra en 3–4; sin batería. |
| 5–8 | Estrofa | `saw` con riff `[0,2,3,6,8,10,11,14]`, `bass` en negras, `drums` backbeat, melodía simplificada y `triangle` como contramelodía en 7–8. |
| 9–12 | Estribillo | `saw` en corcheas, `pulse` en notas largas, doblez de `saw` una octava abajo, `strings` en acordes, batería completa con `crash` en 9 y respuesta de `triangle` en 11–12. |
| 13–14 | Break + dropout | Compás 13 solo `drums` (snare/toms); compás 14 silencio total. |
| 15–16 | Reentrada y cierre | Riff, crash, melodía y acorde final de tónica; el último compás baja a un golpe. |

**Validación:** `node ../../tools/ai-compose.js check library/folk-metal-espanol/TEST.json` y `node ../../tools/check-demo.js library/folk-metal-espanol/TEST.json`. El test no se deja en `demos/`; se escucha con **Menú → Abrir JSON**.

## 11. Debe / evitar

**Debe:**

- Backbeat claro: snare en 2 y 4; kick en 1 y 3.
- Riff de corcheas con acentos síncopados en los pasos 3 y 11.
- Melodía folk diatónica en `pulse`/`pwm`, ámbito C4–C6, frase de 4 compases.
- Progresión i–VI–III–VII en la estrofa y VI–III–VII–i en el estribillo.
- Contraste de densidad entre intro folk y estribillo metal.
- Break de batería y dropout antes del estribillo final.
- Melodía doblada a la octava por una segunda capa de `saw` en el estribillo (quinta si choca con el riff).

**Evitar:**

- Compases irregulares o cambios de compás.
- Polka/humppa finlandesa (corcheas «saltarinas» sistemáticas): es otra célula.
- Black metal: blast beats, tremolo picking y voces rasgadas no son el núcleo de esta célula.
- Melodías cromáticas o virtuosísticas en exceso: el folk de estadio es diatónico y coreable.
- `brass` como melodía principal: suena a fanfarria épica, no a violín/flauta folk.
- Abuso de `crush` en la melodía: destruye la inteligibilidad de la frase folk.
- Fundidos largos en lugar de un cierre rítmico.
- Copiar riffs, melodías, progresiones exactas, arreglos o letras de obras existentes.

## 12. Criterios de aceptación

1. **Compases 4–5:** un oyente debe identificar el backbeat de metal (snare en 2 y 4) junto con una melodía diatónica por encima; si suena a balada o a rock ligero, falla.
2. **Compás 9 (inicio de estribillo):** debe haber un cambio de densidad perceptible (más capas, `crash`, melodía más amplia). Si el estribillo no se distingue de la estrofa, falla.
3. **Compases 13–14 (break/dropout):** debe haber un silencio o una reducción drástica antes de la reentrada; si la densidad es continua, falla.
4. **Melodía folk:** debe ser repetible y diatónica; si el oyente no puede tararearla tras dos escuchas, falla.
5. **Progresión:** debe haber una sensación de i–VI–III–VII en la estrofa; si la armonía es estática o demasiado jazzística, falla.
6. **Timbre:** el riff debe tener ataque y distorsión (`saw` + `drive`); si suena limpio o como `piano`, falla.
7. **Doblez:** el estribillo debe doblar la melodía una octava abajo y producir un peso metal extra; si el doblez tapa la melodía o desafina, falla.

## 13. Preguntas abiertas

- No se encontraron transcripciones musicales verificables (BPM, compases, progresiones exactas). Los valores numéricos son inferencias; falta contrastarlos con partituras o análisis académicos.
- ¿La célula usa gaita de forma sistemática o principalmente violín y flauta? Las fuentes mencionan violín y flauta; la gaita aparece en el folk metal celta en general, pero no se verificó su peso en esta célula.
- ¿El tempo de estudio y el de directo difieren? No hay medición.
- ¿Hay diferencias significativas de densidad y armonía entre las etapas de consolidación (1998–2003)? Las fuentes no lo detallan.
- La afirmación de foro sobre «escalas mayores/menores simples» es opinión de practicantes, no dato académico.
- La célula es Madrid-céntrica y de estadio; no separa las variantes regionales de folk metal en Galicia, Asturias o Cataluña.
- Sin voces ni letras, la función de himno se aproxima con melodía coreable y estribillo, no con texto.

## 14. SPEC

```json
{
  "schema": "chiptune-genre-spec@1",
  "id": "folk-metal-espanol",
  "name": "Folk Metal español",
  "family": "metal",
  "status": "tested",
  "confidence": 0.62,
  "updated": "2026-10-22",
  "aliases": [
    "Folk metal celta-ibérico",
    "Folk metal de estadio en español"
  ],
  "tags": [
    "metal",
    "folk",
    "celta",
    "ibérico",
    "concierto",
    "himno",
    "españa"
  ],
  "summary": "Folk metal de base heavy metal con melodía celta (violín/flauta), riff de corcheas y estribillo diatónico coreable; himno de estadio con breaks y dropouts estructurales.",
  "context": {
    "region": "España (Madrid), con difusión en Hispanoamérica",
    "era": "1994–presente (consolidación 1998–2003)",
    "function": "concierto, himno festivo, identidad cultural"
  },
  "meter": {
    "primary": "4/4",
    "allowed": [
      "4/4"
    ],
    "feel": "recto y driving, backbeat en 2 y 4, sin swing"
  },
  "tempo": {
    "range": [
      100,
      150
    ],
    "typical": 128,
    "map": [
      {
        "bar": 4,
        "bpm": 128
      },
      {
        "bar": 12,
        "bpm": 128
      },
      {
        "bar": 20,
        "bpm": 120
      },
      {
        "bar": 28,
        "bpm": 128
      },
      {
        "bar": 30,
        "bpm": 132
      }
    ]
  },
  "key": {
    "common": [
      "A minor",
      "E minor",
      "D minor"
    ],
    "scales": [
      "minor",
      "dorian",
      "mixolydian"
    ],
    "modality": "menor natural con préstamos de bVII y bVI; dorian para color folk y mixolydian para celebración"
  },
  "form": [
    {
      "id": "intro",
      "bars": 4,
      "role": "melodía folk; bajo y guitarra acústica entran al final, sin batería",
      "energy": 0.3,
      "density": [
        4,
        12
      ],
      "returns": false
    },
    {
      "id": "estrofa",
      "bars": 8,
      "role": "riff de corcheas, bajo, backbeat y melodía simplificada",
      "energy": 0.6,
      "density": [
        28,
        36
      ],
      "returns": true
    },
    {
      "id": "estribillo",
      "bars": 8,
      "role": "melodía amplia, riff denso, colchón y batería completa",
      "energy": 0.9,
      "density": [
        32,
        48
      ],
      "returns": true
    },
    {
      "id": "puente",
      "bars": 8,
      "role": "solo folk o riff, sin colchón; contraste y respiración",
      "energy": 0.5,
      "density": [
        16,
        28
      ],
      "returns": false
    },
    {
      "id": "break",
      "bars": 2,
      "role": "batería sola y dropout total antes de la reentrada",
      "energy": 0.2,
      "density": [
        0,
        8
      ],
      "returns": false
    },
    {
      "id": "outro",
      "bars": 4,
      "role": "reentrada con riff y crash; cierre en tónica",
      "energy": 0.8,
      "density": [
        10,
        44
      ],
      "returns": false
    }
  ],
  "rhythm": {
    "grid": "16th",
    "patterns": [
      {
        "name": "backbeat metal",
        "steps": "kick:0,4,8,12; snare:4,12; hat:0,2,4,6,8,10,12,14",
        "accents": [
          0,
          4,
          8,
          12
        ],
        "map": {
          "kick": [
            0,
            4,
            8,
            12
          ],
          "snare": [
            4,
            12
          ],
          "hat": [
            0,
            2,
            4,
            6,
            8,
            10,
            12,
            14
          ]
        },
        "applies": [
          "estrofa"
        ]
      },
      {
        "name": "backbeat intenso",
        "steps": "kick:0,3,8,11; snare:4,12; hat:0,2,4,6,8,10,12,14",
        "accents": [
          0,
          3,
          8,
          11
        ],
        "map": {
          "kick": [
            0,
            3,
            8,
            11
          ],
          "snare": [
            4,
            12
          ],
          "hat": [
            0,
            2,
            4,
            6,
            8,
            10,
            12,
            14
          ]
        },
        "applies": [
          "estribillo"
        ]
      },
      {
        "name": "riff corcheas con síncopa",
        "steps": "saw:0,2,3,6,8,10,11,14",
        "accents": [
          0,
          3,
          6,
          8,
          11,
          14
        ],
        "attacks": [
          0,
          2,
          3,
          6,
          8,
          10,
          11,
          14
        ],
        "instrument": "saw",
        "applies": [
          "estrofa",
          "estribillo"
        ]
      },
      {
        "name": "break de batería",
        "steps": "snare:4,12; toms:0,2,8,10; kick:0,8",
        "accents": [
          0,
          4,
          8,
          12
        ],
        "map": {
          "kick": [
            0,
            8
          ],
          "snare": [
            4,
            12
          ],
          "toms": [
            0,
            2,
            8,
            10
          ]
        },
        "applies": [
          "break"
        ]
      }
    ],
    "groove": "recto y driving; el peso está en el backbeat y en los acentos del riff, no en el swing",
    "claves": []
  },
  "harmony": {
    "progressions": [
      "i - VI - III - VII (estrofa)",
      "VI - III - VII - i (estribillo)",
      "iv - i - VII - VI (puente)"
    ],
    "cadences": [
      "bVII - i",
      "VI - VII - i",
      "cierre en tónica con acorde completo"
    ],
    "borrowed": [
      "bVII mayor (color mixolidio)",
      "bVI mayor (color natural)"
    ],
    "notes": "Tríadas predominantes; séptimas solo en el puente. La tensión viene de la densidad y el drive, no de la extensión armónica. Evitar cadencias V-i demasiado clásicas."
  },
  "melody": {
    "range": "C4-C6",
    "motif": "3–5 notas: salto ascendente de 4ª o 5ª y descenso por grados conjuntos; repetible y diatónico (tónica–4ª–3ª–2ª–tónica como forma, no como melodía fija)",
    "phrasing": "frases de 4 compases con respiración cada 2; llamada-respuesta entre lead folk y guitarra en intro y puente; estribillo silábico y repetitivo",
    "ornaments": [
      "apoyatura rápida de dos semicorcheas",
      "trino corto en el clímax",
      "slide ascendente puntual"
    ],
    "avoid": [
      "cromatismo sistemático",
      "saltos mayores de 6ª en el estribillo",
      "virtuosismo barroco",
      "melodía que compita con el riff en el mismo registro"
    ]
  },
  "roles": [
    {
      "role": "lead folk",
      "instruments": [
        "pulse",
        "pwm"
      ],
      "range": "C4-C6",
      "behavior": "melodía principal en intro y puente; contramelodía en estrofa y estribillo; pulse para brillo, pwm para expresividad"
    },
    {
      "role": "riff metal",
      "instruments": [
        "saw"
      ],
      "range": "C3-C5",
      "behavior": "corcheas con acentos en 3 y 11; drive moderado; sostiene la armonía y deja la melodía al lead folk"
    },
    {
      "role": "doblez metal",
      "instruments": [
        "saw"
      ],
      "range": "C3-C5",
      "behavior": "dobla la melodía del estribillo una octava abajo; usa la quinta cuando la octava choca con la raíz del riff"
    },
    {
      "role": "bajo",
      "instruments": [
        "bass",
        "pluck"
      ],
      "range": "C2-C3",
      "behavior": "raíz del acorde en negras; en el estribillo alterna raíz y quinta en corcheas; pluck solo en secciones rápidas"
    },
    {
      "role": "batería",
      "instruments": [
        "drums"
      ],
      "range": "—",
      "behavior": "backbeat kick/snare/hat; crash al inicio del estribillo; break de snare/toms antes del cierre"
    },
    {
      "role": "colchón",
      "instruments": [
        "strings",
        "pad"
      ],
      "range": "C3-C5",
      "behavior": "acordes largos (tercera y quinta) en el estribillo; densidad baja para no tapar el riff ni duplicar la raíz"
    },
    {
      "role": "color folk secundario",
      "instruments": [
        "triangle",
        "chirp"
      ],
      "range": "C4-C6",
      "behavior": "contramelodía dulce en estrofa y puente; triangle para flauta, chirp para whistle brillante"
    },
    {
      "role": "arpegios",
      "instruments": [
        "arp",
        "guitar"
      ],
      "range": "C4-C6",
      "behavior": "arpegios de 16 pasos en intro y reentrada; guitar para rasgueo acústico"
    }
  ],
  "instrumentation": {
    "required": [
      "pulse",
      "saw",
      "bass",
      "drums"
    ],
    "optional": [
      "pwm",
      "strings",
      "triangle",
      "guitar",
      "arp",
      "pluck",
      "pad"
    ],
    "avoid": [
      "brass como melodía principal",
      "piano como base folk",
      "bell como sustituto del violín",
      "más de dos capas melódicas simultáneas"
    ]
  },
  "production": {
    "effects": [
      "drive",
      "reverb",
      "delay",
      "chorus",
      "crush"
    ],
    "texture": "capas diferenciadas: melodía al frente, riff medio con drive, bajo redondo, batería seca y colchón discreto",
    "mix": "la melodía folk debe ser inteligible; el riff no la tapa; el crash marca el estribillo sin saturar"
  },
  "chiptune": {
    "translation": "violín/flauta a pulse/pwm/triangle; guitarra distorsionada a saw+drive; bajo a bass/pluck; batería a drums; colchón a strings/pad",
    "constraints": [
      "sin samples de instrumentos folk",
      "sin voces ni coros",
      "sin cambio de compás",
      "sin microtonalidad ni vibrato por nota",
      "sin automatización de efectos"
    ],
    "workarounds": [
      "pwm+delay para aproximar el vibrato del violín",
      "triangle+chorus para flauta dulce",
      "saw con drive suave para gaita; evitar brass",
      "guitar/arp para acústica",
      "pluck para bajo en secciones rápidas"
    ]
  },
  "silence": {
    "breaks": [
      {
        "section": "pre-estribillo final",
        "bars": "1-2",
        "whatStops": "todo excepto drums"
      },
      {
        "section": "puente",
        "bars": "1",
        "whatStops": "armonía y batería; solo pulse"
      }
    ],
    "dropouts": [
      "primer compás del puente: solo pulse sin armonía",
      "un compás de silencio antes de la reentrada final",
      "falso final tras el estribillo: un compás de silencio y reentrada con riff y crash"
    ],
    "rules": [
      "el silencio es estructural (break, dropout), no textural",
      "no hay silencios largos en la estrofa",
      "el último compás cierra en tónica, sin fundido largo"
    ]
  },
  "must": [
    "backbeat claro con snare en 2 y 4",
    "riff de corcheas con acentos en los pasos 3 y 11",
    "melodía diatónica coreable en C4-C6",
    "progresión i-VI-III-VII en la estrofa",
    "contraste de densidad entre intro folk y estribillo metal",
    "break de batería y dropout antes del cierre",
    "melodía doblada a la octava por una segunda capa de saw en el estribillo (quinta si la octava choca con el riff)"
  ],
  "avoid": [
    "compases irregulares o cambios de compás",
    "polka/humppa finlandesa sistemática",
    "blast beats y tremolo picking de black metal",
    "cromatismo o virtuosismo en la melodía",
    "brass como lead folk",
    "crush excesivo en la melodía",
    "fundidos largos en lugar de cierre rítmico",
    "copiar riffs, melodías o letras de obras existentes"
  ],
  "acceptance": [
    "Entrada de estrofa (tras la intro): se reconoce el backbeat de metal bajo una melodía diatónica; no suena a balada ni a rock ligero",
    "Entrada de estribillo: entra con más capas, crash y melodía más amplia; se distingue de la estrofa",
    "Sección break: hay break de batería y silencio antes de la reentrada; la densidad no es continua",
    "la melodía folk se puede tararear tras dos escuchas",
    "la estrofa produce una sensación armónica i-VI-III-VII",
    "el riff tiene ataque y distorsión (saw+drive); no suena limpio ni a piano",
    "el estribillo dobla la melodía una octava abajo y produce un peso metal extra; si el doblez tapa la melodía o desafina, falla"
  ],
  "sources": [
    {
      "title": "Folk metal - Wikipedia, la enciclopedia libre",
      "author": "Wikipedia (colaboradores)",
      "year": "2004–2025",
      "url": "https://es.wikipedia.org/wiki/Folk_metal",
      "type": "enciclopedia abierta",
      "claim": "El metal celta se caracteriza por violín, gaita y flauta irlandesa; Mägo de Oz aparece entre las bandas destacadas; temáticas de leyendas, fantasía y taberna.",
      "confidence": "media",
      "verified": "2026-10-22"
    },
    {
      "title": "Mägo de Oz @ Electric Ballroom",
      "author": "SPAIN arts & culture",
      "year": "s.f. (evento)",
      "url": "https://spainculturescience.co.uk/event/mago-de-oz-electric-ballroom/",
      "type": "ficha institucional",
      "claim": "Mägo de Oz son pioneros del folk metal español; mezclan heavy metal con fuertes influencias celtas e instrumentos como violín y flauta; letras de fantasía y directos teatrales.",
      "confidence": "media-alta",
      "verified": "2026-10-22"
    },
    {
      "title": "Figura 3.111. Zanfoña (tesis sobre Folk y Viking Metal)",
      "author": "Repositorio INAH (México)",
      "year": "2023",
      "url": "https://repositorio.inah.gob.mx/_flysystem/fedora/2023-11/tesis_1890.pdf",
      "type": "tesis académica",
      "claim": "Las bandas de folk/viking amplían la plantilla con instrumentos tradicionales; el folk metal incorpora violines, flautas, acordeones y zanfonas; Skyclad y Subway to Sally como precursores.",
      "confidence": "media",
      "verified": "no verificada en línea en esta sesión"
    },
    {
      "title": "Folk Metal Violin tabs (hilo de foro)",
      "author": "Metal-Archives forum (usuarios)",
      "year": "2015",
      "url": "https://forum.metal-archives.com/viewtopic.php?f=8&t=111736",
      "type": "foro de practicantes",
      "claim": "Las melodías de folk metal suelen ser escalas mayores/menores simples y rápidas; muchas bandas adaptan melodías tradicionales; el violín tiene rol protagónico.",
      "confidence": "baja-media",
      "verified": "no verificada en línea en esta sesión"
    },
    {
      "title": "Los orígenes del Folk Metal se remontan a la década de los noventa",
      "author": "BDJC-IIA, UNAM",
      "year": "s.f.",
      "url": "http://bdjc.iia.unam.mx/items/show/635",
      "type": "repositorio académico",
      "claim": "Mägo de Oz es mencionado como uno de los precursores del folk metal contemporáneo, con primer disco en 1994.",
      "confidence": "media",
      "verified": "no verificada en línea en esta sesión"
    },
    {
      "title": "Mägo de Oz - Wikipedia, la enciclopedia libre",
      "author": "Wikipedia (colaboradores)",
      "year": "2004–actualidad",
      "url": "https://es.wikipedia.org/wiki/M%C3%A4go_de_Oz",
      "type": "enciclopedia abierta",
      "claim": "Origen en 1988–1989; incorporación temprana de violín y melodías folk; Txus como compositor principal.",
      "confidence": "media",
      "verified": "no verificada en línea en esta sesión"
    },
    {
      "title": "Hoy, Mago de Oz regresa a San Luis Potosí",
      "author": "El Heraldo de San Luis Potosí",
      "year": "2015",
      "url": "https://elheraldoslp.com.mx/2015/12/04/hoy-mago-de-oz-regresa-a-san-luis-potosi/",
      "type": "prensa regional",
      "claim": "Mägo de Oz mezcla metal/hard rock con música celta y folk; la música celta es la influencia predominante; éxito masivo en España y Latinoamérica.",
      "confidence": "media-baja",
      "verified": "no verificada en línea en esta sesión"
    },
    {
      "title": "Getting a Pan flute... (hilo de foro)",
      "author": "Metal-Archives forum (usuarios)",
      "year": "s.f.",
      "url": "https://forum.metal-archives.com/viewtopic.php?p=1099558",
      "type": "foro de practicantes",
      "claim": "En folk metal es común el tin whistle irlandés en varias tonalidades, no la flauta andina; la guitarra suele estar en afinación estándar.",
      "confidence": "baja",
      "verified": "no verificada en línea en esta sesión"
    }
  ],
  "openQuestions": [
    "Faltan transcripciones musicales verificables (BPM, compases, progresiones exactas); los valores numéricos de este spec son inferencias razonables.",
    "No se verificó el peso real de la gaita frente al violín y la flauta en esta célula.",
    "No hay medición de la diferencia de tempo entre estudio y directo.",
    "No está documentada la evolución de densidad y armonía entre las etapas de consolidación (1998–2003).",
    "La afirmación de foro sobre 'escalas mayores/menores simples' es opinión de practicantes, no dato académico.",
    "La célula es Madrid-céntrica y de estadio; no separa las variantes regionales de folk metal en Galicia, Asturias o Cataluña.",
    "Sin voces ni letras, la función de himno se aproxima con melodía coreable y estribillo, no con texto."
  ]
}
```
