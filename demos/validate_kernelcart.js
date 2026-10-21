#!/usr/bin/env node
/* Validador de canciones KERNELCART con las mismas reglas de normalización de Chiptune Studio. */
const fs = require('fs');
const path = require('path');

const TS = {
  '4/4': { spb: 16, beat: 4, n: 4 },
  '3/4': { spb: 12, beat: 4, n: 3 },
  '2/4': { spb: 8, beat: 4, n: 2 },
  '5/4': { spb: 20, beat: 4, n: 5 },
  '6/8': { spb: 12, beat: 6, n: 2 },
  '12/8': { spb: 24, beat: 6, n: 4 },
  '7/8': { spb: 14, beat: 2, n: 7 },
};

const RANGES = {
  pulse: ['C3', 'C7'], arp: ['C4', 'C8'], pwm: ['C3', 'C7'], chirp: ['C4', 'C8'],
  triangle: ['C3', 'C6'], saw: ['C3', 'C7'], brass: ['C3', 'C6'], bell: ['C5', 'C8'],
  bass: ['C1', 'C4'], pluck: ['C1', 'C4'], piano: ['C2', 'C7'], guitar: ['C2', 'C6'],
  strings: ['C2', 'C6'], pad: ['C2', 'C6'],
};
const DRUMS = ['kick', 'snare', 'rim', 'clap', 'hat', 'openhat', 'shaker', 'ride', 'crash', 'tomlo', 'tommid', 'tomhi'];
const CHORDS = ['M', 'm', 'dim', 'aug', '7', 'M7', 'm7', 'sus4', 'power'];
const FX = ['reverb', 'delay', 'chorus', 'drive', 'crush'];
const NOTE_BASE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function midi(p) {
  const m = /^([A-G])([#b]?)(-?\d)$/i.exec(String(p));
  if (!m) return null;
  return 12 * (+m[3] + 1) + NOTE_BASE[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}

function validateSong(song) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);

  if (!song || typeof song !== 'object') return { errors: ['JSON raíz no es un objeto'], warnings };
  if (song.format !== 'chiptune-studio') warn(`format distinto de "chiptune-studio": ${song.format}`);
  if (song.version !== 2) warn(`version distinta de 2: ${song.version}`);
  if (typeof song.title !== 'string' || !song.title.trim()) err('title vacío o inválido');
  const bpm = Number(song.bpm);
  if (!Number.isFinite(bpm) || bpm < 40 || bpm > 240) err(`bpm fuera de 40-240: ${song.bpm}`);
  const timeSig = song.timeSig == null ? '4/4' : song.timeSig;
  if (!TS[timeSig]) { err(`timeSig inválido: ${timeSig}`); return { errors, warnings }; }
  const spb = TS[timeSig].spb;
  const bars = Number(song.bars);
  if (!Number.isInteger(bars) || bars < 1 || bars > 64) err(`bars fuera de 1-64: ${song.bars}`);
  const loopStart = song.loopStart == null ? 0 : Number(song.loopStart);
  if (!Number.isInteger(loopStart) || loopStart < 0 || loopStart > Math.max(0, bars - 1)) err(`loopStart inválido: ${song.loopStart}`);
  if (!Array.isArray(song.tracks)) { err('falta el arreglo "tracks"'); return { errors, warnings }; }
  if (song.tracks.length < 1 || song.tracks.length > 12) err(`número de pistas inválido: ${song.tracks.length} (1-12)`);
  const total = bars * spb;
  let maxEnd = 0;

  song.tracks.forEach((t, ti) => {
    const tag = `track[${ti}] ${t && t.name ? `"${t.name}"` : ''}`;
    if (!t || typeof t !== 'object') { err(`${tag}: pista inválida`); return; }
    if (typeof t.name !== 'string' || !t.name.trim()) err(`${tag}: name inválido`);
    const dr = t.instrument === 'drums';
    if (dr) {
      const r = RANGES;
      void r;
    } else if (!RANGES[t.instrument]) {
      err(`${tag}: instrumento desconocido "${t.instrument}"`);
    }
    if (typeof t.volume !== 'undefined' && (!Number.isFinite(+t.volume) || +t.volume < 0 || +t.volume > 1)) err(`${tag}: volume fuera de 0-1`);
    if (typeof t.pan !== 'undefined' && (!Number.isFinite(+t.pan) || +t.pan < -1 || +t.pan > 1)) err(`${tag}: pan fuera de -1..1`);
    if (t.fx != null) {
      if (typeof t.fx !== 'object') err(`${tag}: fx inválido`);
      else for (const [k, v] of Object.entries(t.fx)) {
        if (!FX.includes(k)) warn(`${tag}: fx desconocido "${k}"`);
        if (!Number.isFinite(+v) || +v < 0 || +v > 1) err(`${tag}: fx.${k} fuera de 0-1`);
      }
    }
    if (!Array.isArray(t.notes)) { err(`${tag}: notes no es arreglo`); return; }
    if (t.notes.length === 0) warn(`${tag}: pista sin notas`);
    t.notes.forEach((n, ni) => {
      const ntag = `${tag} note[${ni}]`;
      if (!n || typeof n !== 'object') { err(`${ntag}: nota inválida`); return; }
      const step = Number(n.step);
      const len = Number(n.len);
      if (!Number.isInteger(step) || step < 0) err(`${ntag}: step inválido`);
      if (!Number.isInteger(len) || len < 1) err(`${ntag}: len inválido`);
      if (step >= total) err(`${ntag}: step ${step} fuera de la rejilla (${total})`);
      if (step + len > total) err(`${ntag}: step+len ${step + len} excede ${total}`);
      maxEnd = Math.max(maxEnd, step + len);
      if (n.vel != null && (!Number.isFinite(+n.vel) || +n.vel < 0.1 || +n.vel > 1)) err(`${ntag}: vel fuera de 0.1-1`);
      const p = String(n.pitch);
      if (dr) {
        if (!DRUMS.includes(p.toLowerCase())) err(`${ntag}: pieza de batería inválida "${n.pitch}"`);
        if (len !== 1) warn(`${ntag}: drums fuerza len=1 (declarado ${len})`);
        if (n.slide != null || n.chord != null) warn(`${ntag}: slide/chord ignorado en batería`);
      } else {
        const m = midi(p);
        if (m == null || m < 12 || m > 119) err(`${ntag}: pitch inválido "${n.pitch}"`);
        const range = RANGES[t.instrument];
        if (range && m != null) {
          const lo = midi(range[0]), hi = midi(range[1]);
          if (m < lo || m > hi) warn(`${ntag}: ${p} fuera del registro de ${t.instrument} (${range[0]}-${range[1]})`);
        }
        if (n.slide != null) {
          const sm = midi(n.slide);
          if (sm == null || sm < 12 || sm > 119) err(`${ntag}: slide inválido "${n.slide}"`);
        }
        if (n.chord != null && !CHORDS.includes(n.chord)) err(`${ntag}: chord inválido "${n.chord}"`);
      }
    });
  });

  const needed = Math.ceil(maxEnd / spb);
  if (Number.isInteger(bars) && needed > bars) err(`bars declarado ${bars} < compases necesarios ${needed}`);
  return { errors, warnings };
}

function main() {
  const dir = path.resolve(process.argv[2] || path.join(__dirname, 'kernelcart'));
  if (!fs.existsSync(dir)) {
    console.error(`No existe el directorio: ${dir}`);
    process.exit(2);
  }
  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.json')).sort();
  if (!files.length) {
    console.error(`No hay archivos .json en ${dir}`);
    process.exit(2);
  }
  let bad = 0, warned = 0;
  const rows = [];
  for (const f of files) {
    const file = path.join(dir, f);
    let song;
    try {
      song = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      bad++;
      rows.push(`FAIL ${f}: JSON inválido (${e.message})`);
      continue;
    }
    const { errors, warnings } = validateSong(song);
    if (errors.length) {
      bad++;
      rows.push(`FAIL ${f}${song && song.title ? ` — ${song.title}` : ''}`);
      for (const e of errors) rows.push(`   ERROR ${e}`);
    } else {
      rows.push(`OK   ${f}${song && song.title ? ` — ${song.title}` : ''}${warnings.length ? ` (${warnings.length} avisos)` : ''}`);
    }
    if (warnings.length) warned++;
    for (const w of warnings) rows.push(`   aviso ${w}`);
  }
  console.log(rows.join('\n'));
  console.log(`\n${files.length} archivos: ${files.length - bad} OK, ${bad} con errores, ${warned} con avisos`);
  process.exit(bad ? 1 : 0);
}

if (require.main === module) main();
module.exports = { validateSong, TS, RANGES, DRUMS, CHORDS, FX, midi };
