/* Valida demos/*.json con el mismo código de la app (sin navegador). Uso: node tools/check-demo.js [archivo] */
const fs = require('fs'), path = require('path'), vm = require('vm');
global.window = global;
const root = path.join(__dirname, '..');
const load = (p) => vm.runInThisContext(fs.readFileSync(path.join(root, p), 'utf8'), { filename: p });
load('src/core/cs.js'); load('src/engine/schema.js'); load('src/engine/voice.js');
for (const f of fs.readdirSync(path.join(root, 'src/effects'))) if (f.endsWith('.js')) load('src/effects/' + f);
for (const f of fs.readdirSync(path.join(root, 'src/instruments'))) if (f.endsWith('.js')) load('src/instruments/' + f);
load('src/song/song.js');
const target = process.argv[2] || path.join(root, 'demos/progressive-metal-dream-theater.json');
const s = CS.song.normalize(JSON.parse(fs.readFileSync(target, 'utf8')));
const tl = CS.song.timeline(s), spb = CS.sig(s).spb, steps = s.bars * spb;
const secs = tl.t[steps], dur = `${Math.floor(secs / 60)}:${String(Math.round(secs % 60)).padStart(2, '0')}`;
console.log(`«${s.title}» · ${s.bars} compases ${s.timeSig} · ${s.tracks.length} pistas · ${s.tracks.reduce((n, t) => n + t.notes.length, 0)} notas · ${dur}`);
console.log('Tempo:', [{ bar: 0, bpm: s.bpm }, ...(s.tempo || [])].map((e) => `${e.bar + 1}:${e.bpm}${e.ramp ? '↗' : ''}`).join(' → '));
const errors = [];
for (const t of s.tracks) {
  const inst = CS.getInst(t.instrument), drum = inst.id === 'drums';
  let bad = 0, min = Infinity, max = -Infinity;
  for (const n of t.notes) {
    if (n.step < 0 || n.step >= steps || n.len < 1 || n.step + n.len > steps) bad++;
    if (drum) { if (!inst.pieces[n.pitch]) bad++; }
    else {
      const m = CS.midi(n.pitch); min = Math.min(min, m); max = Math.max(max, m);
      if (m < CS.midi(inst.range.low) || m > CS.midi(inst.range.high)) bad++;
    }
  }
  if (bad) errors.push(`${t.name}: ${bad} nota(s) fuera de rango/compás`);
  console.log(`  ${t.name.padEnd(18)} ${String(t.notes.length).padStart(4)} notas  ${drum ? 'percusión' : `${CS.name(min)}–${CS.name(max)}`}  fx ${Object.keys(t.fx).join(',') || '—'}`);
}
if (errors.length) { console.error('\nERRORES:\n' + errors.join('\n')); process.exit(1); }
console.log('\nOK: todas las notas están dentro del compás y del rango de su instrumento.');
