# Base de géneros y subgéneros

La base está en `ai/genres.json` (generada) y en las piezas editables de `ai/genres/`:

- `families.json`: 39 familias con tempo, compases, escalas, armonía, ritmo, textura, forma, instrumentos, efectos, emociones y consejos de traducción a chiptune.
- `profiles.json`: perfiles concretos que heredan de una familia y cambian solo lo necesario.
- `catalog.json`: nombres de géneros, subgéneros, formas, danzas e instrumentos tradicionales agrupados por familia. Sirve para reconocer el nombre aunque no tenga perfil propio.

Después de editar las piezas, regenera el archivo central:

```bash
node tools/build-genres.js
```

## Cómo se resuelve un género

1. Busca el nombre exacto en `genres` o en `catalog` (sin distinguir mayúsculas ni tildes).
2. Si hay perfil, fusiona **familia + perfil + brief + influencia**.
3. Si solo está en el catálogo, usa la familia y el nombre como matiz.
4. Si no aparece, aplica el **fallback**:
   - busca palabras clave en `fallback.keywordToFamily`;
   - elige la familia más cercana;
   - ajusta tempo, compás, escala, instrumentos y forma;
   - si mezcla dos tradiciones, elige una primaria y una secundaria;
   - escribe los supuestos y no inventes autenticidad.

Consulta desde la terminal:

```bash
node tools/ai-compose.js genres "folk metal"
node tools/ai-compose.js genres --family latin
node tools/ai-compose.js genres --emotion misterioso
node tools/ai-compose.js genres
```

## Familias

| Familia | Úsala para | Colors típicos |
|---|---|---|
| `medieval` | canto gregoriano, organum, ars antiqua/nova, danza medieval | modal, drone, pad/triangle, sin batería |
| `renaissance` | madrigal, motete, misa, chanson | polifonía imitativa, pluck/strings |
| `baroque` | fuga, suite, concerto, ópera seria | bajo continuo, contrapunto, ornamentos |
| `classical` | sonata, sinfonía, cuarteto, concierto | simetría, claridad, dinámica por capas |
| `romantic` | lied, poema sinfónico, ópera, ballet | cromatismo, cuerdas, tempo map |
| `impressionist` | Debussy/Ravel, color, paralelismo | tono completo, arpegios, reverb |
| `expressionist` | atonal libre, monodrama | disonancia, saltos, silencios |
| `serialist` | dodecafonismo, serialismo integral | serie, puntos, no tonal |
| `aleatoric` | música gráfica, indeterminada | reglas, texturas, eventos |
| `electroacoustic` | concreta, acusmática, paisaje sonoro | ruido, crush, espacio |
| `minimalist` | proceso, fases, postminimalismo | células, capas, repetición |
| `opera-stage` | ópera, opereta, zarzuela, oratorio, cantata, musical | voz imaginaria, números, coros |
| `blues` | delta, chicago, jump, boogie | shuffle, blue notes, guitarra/piano |
| `gospel` | gospel, spirituals, work songs | coro, palmas, vamp |
| `jazz` | ragtime, swing, bebop, cool, modal, fusion | walking bass, ride, comping |
| `soul-rnb` | soul, motown, funk, disco, doo-wop | groove, coros, bajo activo |
| `rock` | rock and roll, progresivo, indie, shoegaze, post-rock | riffs, guitarra, batería |
| `metal` | heavy, thrash, death, black, doom, power, metalcore | power chords, doble bombo, riffs |
| `punk` | punk, hardcore, post-punk, new wave, gótico | urgencia, pocas capas |
| `pop` | pop, dance-pop, electropop, K-pop, J-pop, city pop | hook, coro, capas |
| `hiphop` | rap, boom bap, trap, drill, grime, phonk, lo-fi | 808, hats, sample |
| `reggae-caribbean` | reggae, ska, dub, dancehall, calypso, soca | one-drop, skank, delay |
| `latin` | salsa, son, mambo, bolero, cumbia, vallenato, tango | clave, montuno, tumbao |
| `brazil` | samba, bossa, choro, forró, frevo, maracatu | síncopa, percusión, nylon |
| `country-folk` | country, bluegrass, folk, americana, zydeco | acústico, train beat |
| `flamenco-lusophone` | flamenco, fado, kizomba, raï, gnawa | cadencia andaluza, compás 12 |
| `celtic` | jig, reel, folk irlandés/escocés/gallego | 6/8, drone, ornamentos |
| `andean` | huayno, sanjuanito, cueca, saya, chamamé | pentatónica, quena, charango |
| `mexican` | mariachi, ranchera, norteño, corrido | trompetas, guitarra, polka |
| `asian` | China, Japón, Corea, India, raga, gagaku | pentatónica, pluck, drone |
| `middle-east` | maqam, mugham, dabke, taqsim | segundas aumentadas, percusión |
| `african` | highlife, afrobeat, mbalax, amapiano, soukous | polirritmia, capas |
| `electronic` | house, techno, trance, DnB, dubstep, ambient, IDM | síntesis, loops, drops |
| `experimental` | noise, drone, free improvisation, sound art | textura, ruido, forma abierta |
| `chiptune-game` | chiptune, 8-bit, game music, loops | canales, arpegio, bajo, ruido |
| `screen-stage` | banda sonora, cine, musical, escenario | tema, leitmotiv, tempo map |
| `european-folk` | klezmer, balcánico, gitano, polka | modal, danza, vientos |
| `world-fusion` | world music, fusión, global bass | mezcla con pulso común |
| `military` | marcha, himno, fanfarria, desfile | metales, tambores, claridad |

## Cómo inventar un género que no está

No hace falta que exista en la base. Ejemplo de brief: "post-rock de santuario con campanas y un coro lejano".

1. **Familia primaria:** `screen-stage` o `experimental` (textura, arco largo).
2. **Familia secundaria:** `celtic` o `asian` (campanas, drone, ornamentos).
3. **Tempo:** 70–95 BPM.
4. **Compás:** 4/4 o 6/8.
5. **Escala:** dórico o lidio.
6. **Instrumentos:** pad, strings, bell, piano, bass, drums (muy pocos).
7. **Forma:** drone 8 · tema 8 · coro lejano 8 · clímax 8 · fade 8.
8. **Nombre de trabajo:** "post-rock de santuario".
9. **Supuestos:** "No existe un canon de este microgénero; se trata como fusión de screen-stage con textura celta/asiática."

El plan debe decir que es una **fusión estimada**, no una etiqueta histórica.

## Errores frecuentes al elegir género

- Elegir "metal" para cualquier combate. A veces un jefe necesita una nana, un gospel oscuro o un tango.
- Usar "folk" como cajón de sastre. Distingue country, celta, andino, balcánico, etc.
- Confundir género con instrumento: "guqin" o "tabla" son instrumentos/tradiciones, no necesariamente un género.
- Confundir región con género: "música china" abarca ópera, guqin, orquesta, pop, etc.
- Copiar el cliché más superficial (escala "oriental", tambor "tribal") sin ritmo ni fraseo.
- Poner una influencia de banda en el título o en la descripción del producto. La influencia es interna, no marketing.
