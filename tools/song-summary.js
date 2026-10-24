#!/usr/bin/env node
/*
 * song-summary.js — resumen compacto de una canción de Chiptune Studio.
 * Uso: node tools/song-summary.js <cancion.json> [--json]
 *
 * No sustituye al oído ni a check-demo: sirve para leer una canción sin
 * cargar todo el JSON en el contexto de una IA.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const file = process.argv[2];
const asJson = process.argv.includes('--json');
if (!file) {
  console.error('Uso: node tools/song-summary.js <cancion.json> [--json]');
  process.exit(1);
}
const target = path.resolve(process.cwd(), file);
if (!fs.existsSync(target)) {
  console.error(`No existe: ${target}`);
  process.exit(1);
}

global.window = global;
const load = (p) => vm.runInThisContext(fs.readFileSync(path.join(ROOT, p), 'utf8'), { filename: p });
load('src/core/cs.js');
load('src/engine/schema.js');
load('src/engine/voice.js');
for (const f of fs.readdirSync(path.join(ROOT, 'src/effects'))) if (f.endsWith('.js')) load('src/effects/' + f);
for (const f of fs.readdirSync(path.join(ROOT, 'src/instruments'))) if (f.endsWith('.js')) load('src/instruments/' + f);
load('src/theory/theory.js');
load('src/song/song.js');

const raw = JSON.parse(fs.readFileSync(target, 'utf8'));
const s = CS.song.normalize(raw);
const spb = CS.sig(s).spb;
const steps = s.bars * spb;
const totalNotes = s.tracks.reduce((n, t) => n + t.notes.length, 0);
const density = s.bars ? totalNotes / s.bars : 0;
const duration = CS.song.timeline(s).t[steps] || 0;
const tempo = [{ bar: 0, bpm: s.bpm }, ...(s.tempo || [])];

const windowBars = s.bars <= 8 ? 2 : 4;
const windows = Math.ceil(s.bars / windowBars);
const counts = Array.from({ length: windows }, () => 0);
for (const t of s.tracks) for (const n of t.notes) {
  const w = Math.floor(n.step / spb / windowBars);
  if (w >= 0 && w < windows) counts[w]++;
}
const maxCount = Math.max(1, ...counts);
const spark = counts.map((c) => '▁▂▃▄▅▆▇█'[Math.min(7, Math.floor((c / maxCount) * 7))]).join('');

const tracks = s.tracks.map((t) => {
  const inst = CS.getInst(t.instrument);
  const drum = inst.id === 'drums';
  let min = Infinity, max = -Infinity, bad = 0, pieces = {};
  for (const n of t.notes) {
    if (n.step < 0 || n.step >= steps || n.len < 1 || n.step + n.len > steps) bad++;
    if (drum) {
      pieces[n.pitch] = (pieces[n.pitch] || 0) + 1;
      if (!inst.pieces[n.pitch]) bad++;
    } else {
      const m = CS.midi(n.pitch);
      if (m == null) { bad++; continue; }
      min = Math.min(min, m); max = Math.max(max, m);
      if (m < CS.midi(inst.range.low) || m > CS.midi(inst.range.high)) bad++;
    }
  }
  return {
    name: t.name || inst.name,
    instrument: inst.id,
    notes: t.notes.length,
    density: s.bars ? +(t.notes.length / s.bars).toFixed(1) : 0,
    range: drum ? null : (t.notes.length ? `${CS.name(min)}–${CS.name(max)}` : '—'),
    pieces,
    bad,
    fx: Object.keys(t.fx || {}),
    volume: t.volume,
    pan: t.pan,
  };
});

const warnings = [];
if (s.key == null) warnings.push('No declara tonalidad (key).');
if (!s.scale) warnings.push('No declara escala (scale).');
if (s.scale && !CS.theory.scales[s.scale]) warnings.push(`Escala desconocida: ${s.scale}.`);
if (density > 90) warnings.push(`Densidad media muy alta: ${density.toFixed(1)} notas/compás.`);
if (s.tracks.length >= 12) warnings.push('Usa 12 pistas: revisa que cada rol sea necesario.');
if (!s.tracks.some((t) => t.instrument === 'drums')) warnings.push('No hay pista de batería.');
for (const t of tracks) if (t.bad) warnings.push(`${t.name}: ${t.bad} nota(s) fuera de rango/compás.`);

if (asJson) {
  console.log(JSON.stringify({
    title: s.title, bpm: s.bpm, bars: s.bars, timeSig: s.timeSig, key: s.key, scale: s.scale,
    loopStart: s.loopStart, duration: +duration.toFixed(2), tracks: s.tracks.length, notes: totalNotes,
    density: +density.toFixed(1), tempo, sections: s.sections || [], windows: counts, spark, trackList: tracks, warnings,
  }, null, 2));
  process.exit(0);
}

const mm = Math.floor(duration / 60), ss = String(Math.round(duration % 60)).padStart(2, '0');
console.log(`«${s.title || path.basename(target)}» · ${s.bars} compases ${s.timeSig} · ${s.tracks.length} pistas · ${totalNotes} notas · ${mm}:${ss}`);
console.log(`Tonalidad: ${s.key ?? '—'} ${s.scale || ''} · loopStart: ${s.loopStart} · densidad media: ${density.toFixed(1)} notas/compás`);
console.log(`Tempo: ${tempo.map((e) => `${e.bar + 1}:${e.bpm}${e.ramp ? '↗' : ''}`).join(' → ')}`);
if (s.sections && s.sections.length) console.log(`Secciones: ${s.sections.map((e) => `${e.id}@${e.bar}`).join(' → ')}`);
console.log(`Densidad cada ${windowBars} compases: ${spark}  (${counts.join(' · ')})`);
console.log('Pistas:');
for (const t of tracks) {
  const extra = t.instrument === 'drums'
    ? Object.entries(t.pieces).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' ')
    : `${t.range} · ${t.density}/compás`;
  console.log(`  ${String(t.name).padEnd(20)} ${String(t.instrument).padEnd(9)} ${String(t.notes).padStart(4)} notas  ${extra}  fx:${t.fx.join(',') || '—'}`);
}
if (warnings.length) {
  console.log('Avisos:');
  warnings.forEach((w) => console.log('  ⚠ ' + w));
}
