#!/usr/bin/env node
/* Une las piezas legibles de ai/song-maker/data/genres/ en ai/song-maker/data/genres.json (base consultable por la IA y por ai-compose.js). */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const families = read('ai/song-maker/data/genres/families.json');
const profiles = read('ai/song-maker/data/genres/profiles.json');
const catalog = read('ai/song-maker/data/genres/catalog.json');

const familyIds = new Set(Object.keys(families.families));
const errors = [];
for (const [id, g] of Object.entries(profiles.profiles)) {
  if (!familyIds.has(g.family)) errors.push(`Perfil ${id}: familia desconocida "${g.family}"`);
}
for (const family of Object.keys(catalog.catalog)) {
  if (!familyIds.has(family)) errors.push(`Catálogo: familia desconocida "${family}"`);
}
if (errors.length) {
  console.error('Errores de integridad:\n' + errors.join('\n'));
  process.exit(1);
}

const fallback = {
  method: "Si el estilo no está en el catálogo: (1) busca la familia por palabras clave y contexto; (2) hereda sus rasgos; (3) ajusta tempo, compás, escala, instrumentos y forma con lo que pida el brief; (4) si mezcla dos tradiciones, elige una primaria y una secundaria; (5) escribe los supuestos en el plan y no inventes una autenticidad que no puedes verificar.",
  defaultFamily: "screen-stage",
  keywordToFamily: {
    medieval: ["chant", "canto", "gregoriano", "organum", "ars", "motete", "trovador", "juglar", "medieval"],
    renaissance: ["renacimiento", "madrigal", "chanson", "villancico", "polifonía", "polifonia"],
    baroque: ["barroco", "fuga", "suite", "concerto", "continuo", "aria", "bach", "vivaldi"],
    classical: ["clásico", "clasico", "sonata", "sinfonía", "sinfonia", "cuarteto", "concierto", "mozart", "haydn"],
    romantic: ["romántico", "romantico", "lied", "poema sinfónico", "chopin", "liszt", "wagner"],
    impressionist: ["impresionista", "debussy", "ravel", "tono completo", "paralelo"],
    expressionist: ["expresionista", "atonal", "schoenberg", "berg", "webern", "sprechgesang"],
    serialist: ["serial", "dodecafon", "doce tonos", "twelve-tone", "puntillista"],
    aleatoric: ["aleatorio", "indeterminado", "gráfica", "grafica", "cage", "azar"],
    electroacoustic: ["concreta", "concreto", "electroacústica", "electroacustica", "acousmatic", "cinta", "paisaje sonoro"],
    minimalist: ["minimal", "proceso", "fase", "repetición", "repeticion", "reich", "glass", "riley"],
    "opera-stage": ["ópera", "opera", "opereta", "zarzuela", "oratorio", "cantata", "musical", "cabaret", "aria", "recitativo"],
    blues: ["blues", "delta", "chicago", "boogie", "shuffle", "blue note"],
    gospel: ["gospel", "espiritual", "spiritual", "work song", "coro", "himno"],
    jazz: ["jazz", "swing", "bebop", "bop", "ragtime", "dixieland", "big band", "fusion", "bossa"],
    "soul-rnb": ["soul", "r&b", "rnb", "motown", "funk", "disco", "doo-wop", "groove"],
    rock: ["rock", "grunge", "indie", "shoegaze", "post-rock", "emo", "surf", "garage", "punk rock"],
    metal: ["metal", "thrash", "death", "black metal", "doom", "power metal", "metalcore", "djent"],
    punk: ["punk", "hardcore", "post-punk", "new wave", "gótico", "gotico", "industrial"],
    pop: ["pop", "k-pop", "j-pop", "city pop", "synth-pop", "electropop", "dance-pop", "hit"],
    hiphop: ["hip hop", "hip-hop", "rap", "trap", "drill", "grime", "boom bap", "phonk", "808"],
    "reggae-caribbean": ["reggae", "ska", "rocksteady", "dub", "dancehall", "calypso", "soca", "zouk", "kompa"],
    latin: ["salsa", "son cubano", "mambo", "bolero", "cumbia", "vallenato", "merengue", "bachata", "reggaeton", "tango", "milonga", "chacarera", "zamba", "carnavalito"],
    brazil: ["samba", "bossa", "mpb", "choro", "forró", "forro", "baião", "baiao", "frevo", "maracatu", "axé", "axe"],
    "country-folk": ["country", "bluegrass", "folk", "americana", "outlaw", "zydeco", "cajun", "tex-mex", "tejano"],
    "flamenco-lusophone": ["flamenco", "sevillanas", "fado", "morna", "kizomba", "kuduro", "raï", "rai", "gnawa", "maqam", "mugham"],
    celtic: ["celta", "celtic", "jig", "reel", "irlandesa", "escocesa", "gallega"],
    andean: ["andina", "huayno", "sanjuanito", "cueca", "saya", "tinku", "chamamé", "chamame", "candombe", "murga"],
    mexican: ["mariachi", "ranchera", "norteño", "norteno", "banda sinaloense", "corrido", "tejano"],
    asian: ["china", "japón", "japon", "corea", "india", "raga", "carnatic", "hindustani", "gagaku", "kabuki", "pansori", "enka", "sitar", "tabla"],
    "middle-east": ["maqam", "mugham", "shashmaqom", "taqsim", "dabke", "árabe", "arabe", "persa", "turca", "sufi", "qawwali"],
    african: ["highlife", "afrobeat", "mbalax", "mbaqanga", "soukous", "rumba congoleña", "amapiano", "juju", "fuji", "africa", "áfrica"],
    electronic: ["house", "techno", "trance", "drum and bass", "dnb", "jungle", "dubstep", "ambient", "trip hop", "idm", "edm", "hardstyle", "vaporwave", "synthwave", "electrónica", "electronica"],
    experimental: ["experimental", "noise", "ruido", "drone", "free improvisation", "arte sonoro", "field recording"],
    "chiptune-game": ["chiptune", "videojuego", "video game", "8-bit", "16-bit", "tracker", "demoscene", "nes", "snes", "game boy", "arcade", "jrpg"],
    "screen-stage": ["banda sonora", "soundtrack", "film score", "cine", "película", "pelicula", "teatro", "musical", "ballet", "escena"],
    "european-folk": ["klezmer", "balcánica", "balcanica", "gitana", "polka", "vals", "manele", "chalga"],
    "world-fusion": ["world music", "fusión", "fusion", "global", "intercultural", "folktronica"],
    military: ["marcha", "militar", "himno", "fanfarria", "desfile", "redoble"]
  },
  fusion: "Si hay dos géneros, usa 70% familia primaria y 30% secundaria en ritmo, instrumentación o armonía; no mezcles los dos al 50% sin una razón.",
  originality: "Las influencias se traducen a rasgos abstractos (tempo, textura, instrumentación, lenguaje armónico, forma). No copies melodías, riffs, progresiones reconocibles ni arreglos completos."
};

const out = {
  schema: 'chiptune-genres@1',
  updated: '2026-10-21',
  note: families.note,
  families: families.families,
  genres: profiles.profiles,
  catalog: catalog.catalog,
  fallback
};
fs.writeFileSync(path.join(ROOT, 'ai/song-maker/data/genres.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');

const count = Object.values(out.catalog).reduce((n, a) => n + a.length, 0) + Object.keys(out.genres).length;
console.log(`ai/song-maker/data/genres.json generado: ${Object.keys(out.families).length} familias, ${Object.keys(out.genres).length} perfiles, ${count} nombres de catálogo/perfil.`);
