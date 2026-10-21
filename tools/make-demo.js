/* Genera demos/progressive-metal-dream-theater.json. Herramienta de composición, no se carga en la app. */
const fs = require('fs'), path = require('path');
const N = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const nn = (m) => N[m % 12] + (Math.floor(m / 12) - 1);
const S = 14; // 7/8: 14 semicorcheas por compás
const CH = {
  Dm: { t: [50,53,57], r: 38, p: 50 },
  Bb: { t: [46,50,53], r: 34, p: 46 },
  F:  { t: [41,45,48], r: 29, p: 41 },
  C:  { t: [48,52,55], r: 36, p: 48 },
  Gm: { t: [43,46,50], r: 31, p: 43 },
  A:  { t: [45,49,52], r: 33, p: 45 }
};
const song = {
  format: 'chiptune-studio', version: 2, title: 'Metropolis of Mirrors',
  bpm: 78, bars: 40, timeSig: '7/8', key: 'D', scale: 'minor', loopStart: 0, tempo: [],
  tracks: []
};
const tr = (name, instrument, volume, pan, fx) => { const t = { name, instrument, volume, pan, fx, notes: [] }; song.tracks.push(t); return t; };
const gtr = tr('Guitarra rítmica', 'guitar', 0.72, -0.28, { drive: 0.5, reverb: 0.08 });
const bas = tr('Bajo', 'pluck', 0.82, 0, { drive: 0.28, reverb: 0.04 });
const drm = tr('Batería', 'drums', 0.8, 0, { reverb: 0.16 });
const led = tr('Lead', 'saw', 0.62, 0.12, { drive: 0.22, delay: 0.25, reverb: 0.16 });
const str = tr('Cuerdas', 'strings', 0.42, -0.35, { reverb: 0.36 });
const pia = tr('Teclados', 'piano', 0.5, 0.25, { reverb: 0.22, delay: 0.1 });
const arp = tr('Arpegio', 'arp', 0.3, 0.4, { delay: 0.3, reverb: 0.2 });
const a = (t, b, k, l, m, x) => t.notes.push({ step: b * S + k, len: l, pitch: nn(m), ...(x || {}) });
const d = (b, k, pc, v) => drm.notes.push({ step: b * S + k, len: 1, pitch: pc, ...(v < 1 ? { vel: v } : {}) });

/* ---------- Introducción (compases 0-7): arpegios limpios, cuerdas y build-up ---------- */
const iP = ['Dm','Bb','F','C','Dm','Bb','Gm','A'];
const iArp = {
  Dm: [50,57,62,65,69,65,62], Bb: [46,53,58,62,65,62,58],
  F:  [41,48,53,57,60,57,53], C:  [48,55,60,64,67,64,60],
  Gm: [43,50,55,58,62,58,55], A:  [45,52,57,61,64,61,57]
};
const kHi = {
  Dm: [74,77,81,86], Bb: [70,74,77,82], F: [72,77,81,84],
  C:  [72,76,79,84], Gm: [67,74,79,82], A: [69,73,76,81]
};
iP.forEach((c, b) => {
  iArp[c].forEach((m, k) => a(gtr, b, k * 2, 2, m, { vel: b < 4 ? 0.55 : 0.68 }));
  CH[c].t.forEach((m) => a(str, b, 0, 14, m, { vel: 0.5 }));
  if (b >= 4) a(str, b, 0, 14, CH[c].t[0] + 12, { vel: 0.35 });
  const p = kHi[c];
  if (b < 4) { a(pia, b, 0, 8, p[0], { vel: 0.5 }); a(pia, b, 8, 6, p[2], { vel: 0.4 }); }
  else p.forEach((m, k) => a(pia, b, k * 4, 4, m, { vel: 0.45 }));
  const r = CH[c].r;
  if (b < 4) a(bas, b, 0, 14, r, { vel: 0.55 });
  else [0,2,4,6,8,10,12].forEach((k, i) => a(bas, b, k, 2, i === 5 ? r + 12 : r, { vel: 0.7 }));
});
for (let b = 0; b < 8; b++) {
  if (b < 4) {
    [0,2,4,6,8,10,12].forEach((k) => d(b, k, 'ride', 0.3));
    [0,6,10].forEach((k) => d(b, k, 'kick', 0.55));
    [4,12].forEach((k) => d(b, k, 'snare', 0.28));
  } else {
    [0,2,4,6,8,10,12].forEach((k) => d(b, k, k === 12 ? 'openhat' : 'hat', 0.35));
    [0,3,6,10].forEach((k) => d(b, k, 'kick', 0.7));
    [4,12].forEach((k) => d(b, k, 'snare', 0.6));
    [0,8].forEach((k) => d(b, k, 'ride', 0.35));
  }
}
[8,9,10,11,12,13].forEach((k, i) => d(7, k, ['tomhi','tomhi','tommid','tommid','tomlo','tomlo'][i], 0.7));
d(4, 0, 'crash', 0.8); d(8, 0, 'crash', 0.9);
[[6,0,6,70],[6,6,4,74],[6,10,4,79],[7,0,4,69],[7,4,2,73],[7,6,2,76],[7,8,6,81]]
  .forEach((x) => a(led, x[0], x[1], x[2], x[3]));

/* ---------- Riff principal (compases 8-15) ---------- */
const mP = ['Dm','Dm','Bb','Bb','F','F','C','A'];
const rA = [[0,2],[2,1],[3,3],[6,2],[8,2],[10,1],[11,3]];
const rB = [[0,2],[3,2],[6,2],[8,2],[10,2],[12,2]];
mP.forEach((c, i) => {
  const b = 8 + i, r = CH[c].p;
  (i === 7 ? rB : rA).forEach(([k, l]) => a(gtr, b, k, l, r, { chord: 'power', vel: k === 0 || k === 6 || k === 10 ? 0.95 : 0.8 }));
  [0,2,4,6,8,10,12].forEach((k, j) => a(bas, b, k, 2, j === 2 || j === 5 ? CH[c].r + 12 : CH[c].r, { vel: 0.8 }));
  CH[c].t.forEach((m) => a(str, b, 0, 14, m, { vel: 0.4 }));
});
for (let b = 8; b < 16; b++) {
  [0,3,6,8,10,13].forEach((k) => d(b, k, 'kick', 0.8));
  [4,12].forEach((k) => d(b, k, 'snare', 0.85));
  for (let k = 0; k < 14; k += 2) d(b, k, 'hat', k % 4 === 0 ? 0.4 : 0.28);
  if (b === 11 || b === 15) [8,9,10,11,12,13].forEach((k, i) => d(b, k, ['tomhi','tomhi','tommid','tommid','tomlo','tomlo'][i], 0.7));
  if (b >= 14) [1,2,7,9].forEach((k) => d(b, k, 'kick', 0.7));
}
d(8, 0, 'crash', 0.85); d(12, 0, 'crash', 0.85);
const mL = [
  [8,[[0,4,74],[4,2,77],[6,2,76],[8,6,74]]],
  [9,[[0,4,69],[4,4,74],[8,6,77]]],
  [10,[[0,4,77],[4,2,74],[6,2,70],[8,6,74]]],
  [11,[[0,6,77],[6,2,79],[8,6,81]]],
  [12,[[0,4,81],[4,2,79],[6,2,77],[8,6,72]]],
  [13,[[0,6,77],[6,2,76],[8,6,74]]],
  [14,[[0,4,79],[4,2,76],[6,2,72],[8,6,76]]],
  [15,[[0,8,81],[8,1,79],[9,1,77],[10,1,76],[11,1,74],[12,2,73]]]
];
mL.forEach(([b, xs]) => xs.forEach(([k, l, m]) => a(led, b, k, l, m, { vel: 0.75 })));

/* ---------- Unísono progresivo (compases 16-19) ---------- */
const uP = ['Dm','Bb','Gm','A'];
const runs = {
  Dm: [50,52,53,55,57,58,61,62,64,65,64,62,61,57],
  Bb: [46,48,50,51,53,55,57,58,60,62,60,58,57,53],
  Gm: [43,45,46,48,50,51,53,55,57,58,57,55,53,50],
  A:  [45,47,49,50,52,53,55,57,59,61,62,61,59,55]
};
uP.forEach((c, i) => {
  const b = 16 + i, r = CH[c].r, run = runs[c];
  run.forEach((m, k) => {
    a(gtr, b, k, 1, m, k === 0 || k === 4 || k === 8 || k === 12 ? { chord: 'power', vel: 0.95 } : { vel: 0.85 });
    a(led, b, k, 1, m + 12, { vel: 0.8 });
    a(bas, b, k, 1, r + (k === 4 || k === 12 ? 12 : 0), { vel: 0.85 });
  });
  CH[c].t.forEach((m) => a(str, b, 0, 2, m, { vel: 0.55 }));
  [0,4,8,12].forEach((k) => d(b, k, 'crash', 0.5));
  [0,1,2,3,4,6,7,8,9,10,12,13].forEach((k) => d(b, k, 'kick', 0.8));
  [4,12].forEach((k) => d(b, k, 'snare', 0.9));
  if (i === 3) [8,9,10,11,12,13].forEach((k, j) => d(b, k, ['tomhi','tommid','tomlo','tomhi','tommid','tomlo'][j], 0.8));
});

/* ---------- Tema principal (compases 20-27) ---------- */
const tP = ['Dm','Bb','F','C','Gm','Bb','A','Dm'];
const tM = [
  [20,[[0,4,69],[4,2,74],[6,2,76],[8,4,77],[12,2,76]]],
  [21,[[0,4,74],[4,2,77],[6,2,79],[8,4,77],[12,2,74]]],
  [22,[[0,4,72],[4,2,77],[6,2,76],[8,4,77],[12,2,81]]],
  [23,[[0,4,79],[4,2,76],[6,2,72],[8,4,76],[12,2,79]]],
  [24,[[0,4,70],[4,2,74],[6,2,79],[8,4,77],[12,2,74]]],
  [25,[[0,4,74],[4,2,77],[6,2,82],[8,4,81],[12,2,77]]],
  [26,[[0,4,73],[4,2,76],[6,2,81],[8,2,79],[10,2,76],[12,2,73]]],
  [27,[[0,6,74],[6,2,81],[8,4,77],[12,2,76]]]
];
tP.forEach((c, i) => {
  const b = 20 + i;
  [0,4,8,12].forEach((k) => a(gtr, b, k, 4, CH[c].p, { chord: 'power', vel: 0.9 }));
  [0,2,4,6,8,10,12].forEach((k) => a(bas, b, k, 2, CH[c].r, { vel: 0.75 }));
  CH[c].t.forEach((m) => a(str, b, 0, 14, m, { vel: 0.42 }));
  const p = kHi[c];
  [0,2,4,6,8,10,12].forEach((k, j) => a(pia, b, k, 2, p[j % 4], { vel: 0.4 }));
});
tM.forEach(([b, xs]) => xs.forEach(([k, l, m]) => a(led, b, k, l, m, { vel: 0.78 })));
for (let b = 20; b < 28; b++) {
  [0,4,6,10].forEach((k) => d(b, k, 'kick', 0.75));
  [4,12].forEach((k) => d(b, k, 'snare', 0.8));
  for (let k = 0; k < 14; k += 2) d(b, k, 'ride', k % 4 === 0 ? 0.38 : 0.28);
  if (b === 23 || b === 27) [8,9,10,11,12,13].forEach((k, j) => d(b, k, ['tomhi','tomhi','tommid','tommid','tomlo','tomlo'][j], 0.7));
}
d(20, 0, 'crash', 0.8);

/* ---------- Breakdown (compases 28-31): medio tiempo y dramático ---------- */
const bP = ['Dm','Bb','Gm','A'];
const bG = [
  [28,0,6],[28,6,2],[28,8,6],
  [29,0,6],[29,6,2],[29,8,6],
  [30,0,6],[30,6,2],[30,8,6],
  [31,0,4],[31,4,2],[31,6,2],[31,8,2],[31,10,1],[31,12,1]
];
bG.forEach(([b, k, l]) => a(gtr, b, k, l, CH[bP[b - 28]].p, { chord: 'power', vel: 0.9 }));
bP.forEach((c, i) => {
  const b = 28 + i, r = CH[c].r;
  a(bas, b, 0, 6, r, { vel: 0.8 });
  a(bas, b, 6, 2, r, { vel: 0.8 });
  a(bas, b, 8, 6, i === 3 ? r + 7 : r, { vel: 0.8 });
  CH[c].t.forEach((m) => { a(str, b, 0, 14, m, { vel: 0.55 }); a(str, b, 0, 14, m + 12, { vel: 0.25 }); });
  const p = kHi[c];
  a(pia, b, 0, 6, p[0], { vel: 0.5 }); a(pia, b, 8, 6, p[2], { vel: 0.45 });
});
for (let b = 28; b < 32; b++) {
  [0,6,10].forEach((k) => d(b, k, 'kick', 0.85));
  [4,12].forEach((k) => d(b, k, 'snare', 0.9));
  for (let k = 0; k < 14; k += 2) d(b, k, 'ride', 0.3);
}
[0,4,8,10,12].forEach((k) => d(28, k, 'crash', 0.6));
[10,11,12,13].forEach((k, i) => d(31, k, ['tomhi','tommid','tomlo','tomlo'][i], 0.8));
[[28,0,6,74],[28,6,4,77],[28,10,4,76],[29,0,6,74],[29,6,2,77],[29,8,6,79],
 [30,0,6,70],[30,6,4,74],[30,10,4,77],[31,0,6,76],[31,6,4,73],[31,10,4,69]]
  .forEach((x) => a(led, x[0], x[1], x[2], x[3], { vel: 0.8 }));

/* ---------- Final (compases 32-39): reprise, acelerando y ritardando final ---------- */
const fP = ['Dm','Bb','F','C','Dm','Bb','A','Dm'];
const fM = [
  [32,[[0,4,74],[4,2,77],[6,2,81],[8,6,86]]],
  [33,[[0,4,77],[4,2,82],[6,2,86],[8,4,89]]],
  [34,[[0,4,84],[4,2,89],[6,2,88],[8,6,84]]],
  [35,[[0,4,79],[4,2,84],[6,2,88],[8,4,91]]],
  [36,[[0,4,81],[4,2,86],[6,2,89],[8,6,93]]],
  [37,[[0,4,82],[4,2,86],[6,2,89],[8,4,94]]],
  [38,[[0,4,85],[4,2,88],[6,2,93],[8,2,91],[10,2,88],[12,2,85]]],
  [39,[[0,14,86]]]
];
fP.forEach((c, i) => {
  const b = 32 + i;
  if (i === 7) {
    a(gtr, b, 0, 14, CH.Dm.p, { chord: 'power', vel: 1 });
    a(bas, b, 0, 14, CH.Dm.r, { vel: 0.9 });
    CH.Dm.t.forEach((m) => { a(str, b, 0, 14, m, { vel: 0.55 }); a(str, b, 0, 14, m + 12, { vel: 0.28 }); });
    kHi.Dm.slice(0, 3).forEach((m) => a(pia, b, 0, 14, m, { vel: 0.5 }));
  } else {
    rA.forEach(([k, l]) => a(gtr, b, k, l, CH[c].p, { chord: 'power', vel: 0.95 }));
    [0,1,2,3,6,7,8,10,11,12,13].forEach((k) => a(bas, b, k, 1, k === 4 || k === 12 ? CH[c].r + 12 : CH[c].r, { vel: 0.85 }));
    CH[c].t.forEach((m) => { a(str, b, 0, 10, m, { vel: 0.5 }); a(str, b, 0, 10, m + 12, { vel: 0.25 }); });
    const p = kHi[c];
    [0,2,4,6,8,10,12].forEach((k, j) => a(pia, b, k, 2, p[j % 4], { vel: 0.42 }));
  }
});
fM.forEach(([b, xs]) => xs.forEach(([k, l, m]) => a(led, b, k, l, m, { vel: 0.8 })));
for (let b = 32; b < 39; b++) {
  [0,1,2,3,6,7,8,10,11,12,13].forEach((k) => d(b, k, 'kick', 0.85));
  [4,12].forEach((k) => d(b, k, 'snare', 0.9));
  for (let k = 0; k < 14; k += 2) d(b, k, 'hat', k % 4 === 0 ? 0.4 : 0.28);
  if (b === 35 || b === 38) [8,9,10,11,12,13].forEach((k, j) => d(b, k, ['tomhi','tomhi','tommid','tommid','tomlo','tomlo'][j], 0.75));
}
[32,34,36,38].forEach((b) => d(b, 0, 'crash', 0.85));
d(39, 0, 'crash', 1); d(39, 0, 'kick', 1); d(39, 4, 'snare', 0.9);
[8,9,10,11,12].forEach((k, i) => d(39, k, ['tomhi','tomhi','tommid','tomlo','tomlo'][i], 0.85));
d(39, 12, 'crash', 1);
[[6,'Gm'],[7,'A'],[38,'A'],[39,'Dm']].forEach(([b, c]) => {
  const p = kHi[c];
  for (let k = 0; k < 14; k++) a(arp, b, k, 1, p[k % 4] + 12, { vel: 0.3 });
});

/* ---------- Solo instrumental (compases 28-35) ---------- */
const orig = song.tracks.map((t) => t.notes.map((n) => ({ ...n })));
for (const t of song.tracks) t.notes = t.notes.filter((n) => n.step < 28 * S);
const sP = ['Dm','Bb','F','C','Gm','Bb','A','Dm'];
const sRuns = [
  [74,76,77,79,81,82,81,79,77,76,74,76,77,79],
  [77,79,81,82,84,86,84,82,81,79,77,79,81,82],
  [81,82,84,86,88,89,88,86,84,82,81,82,84,86],
  [84,86,88,89,91,93,91,89,88,86,84,86,88,89],
  [82,84,86,88,89,91,89,88,86,84,82,84,86,88],
  [79,81,82,84,86,88,89,88,86,84,82,81,79,77],
  [85,88,89,91,93,94,93,91,89,88,85,84,81,79],
  [86,88,89,91,93,94,93,91,89,86,84,82,81,79]
];
sP.forEach((c, i) => {
  const b = 28 + i;
  rA.forEach(([k, l]) => a(gtr, b, k, l, CH[c].p, { chord: 'power', vel: 0.95 }));
  [0,1,2,3,4,6,7,8,9,10,12,13].forEach((k) => a(bas, b, k, 1, k === 4 || k === 12 ? CH[c].r + 12 : CH[c].r, { vel: 0.85 }));
  CH[c].t.forEach((m) => { a(str, b, 0, 14, m, { vel: 0.48 }); a(str, b, 0, 14, m + 12, { vel: 0.22 }); });
  const p = kHi[c];
  [0,2,4,6,8,10,12].forEach((k, j) => a(pia, b, k, 2, p[j % 4], { vel: 0.4 }));
  sRuns[i].forEach((m, k) => a(led, b, k, 1, m, { vel: k % 4 === 0 ? 0.85 : 0.7 }));
  [0,1,2,3,6,7,8,10,11,12,13].forEach((k) => d(b, k, 'kick', 0.85));
  [4,12].forEach((k) => d(b, k, 'snare', 0.9));
  for (let k = 0; k < 14; k += 2) d(b, k, 'hat', k % 4 === 0 ? 0.4 : 0.28);
  if (i === 7) [8,9,10,11,12,13].forEach((k, j) => d(b, k, ['tomhi','tomhi','tommid','tommid','tomlo','tomlo'][j], 0.8));
});
[28,30,32,34].forEach((b) => d(b, 0, 'crash', 0.85));

/* ---------- Estructura final de 64 compases ----------
   0-7 intro · 8-15 riff · 16-19 unísono · 20-27 tema · 28-35 solo
   36-43 riff · 44-47 unísono · 48-55 tema · 56-59 breakdown · 60-63 final */
const copyRange = (i, from, to, shiftBars) => orig[i]
  .filter((n) => n.step >= from * S && n.step < to * S)
  .map((n) => ({ ...n, step: n.step + shiftBars * S }));
song.tracks.forEach((t, i) => {
  t.notes.push(...copyRange(i, 8, 28, 28));   // riff + unísono + tema → 36-55
  t.notes.push(...copyRange(i, 28, 32, 28));  // breakdown → 56-59
  t.notes.push(...copyRange(i, 36, 40, 24));  // final → 60-63
});
song.bars = 64;
song.tempo = [
  { bar: 4, bpm: 84, ramp: true },
  { bar: 8, bpm: 120 },
  { bar: 16, bpm: 138 },
  { bar: 20, bpm: 110 },
  { bar: 28, bpm: 120 },
  { bar: 32, bpm: 150, ramp: true },
  { bar: 36, bpm: 120 },
  { bar: 44, bpm: 138 },
  { bar: 48, bpm: 110 },
  { bar: 56, bpm: 80 },
  { bar: 60, bpm: 132, ramp: true },
  { bar: 62, bpm: 152 },
  { bar: 63, bpm: 84, ramp: true }
];

/* ---------- Guardar ---------- */
const dir = path.join(__dirname, '..', 'demos');
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, 'progressive-metal-dream-theater.json');
fs.writeFileSync(file, JSON.stringify(song, null, 1) + '\n');
const notes = song.tracks.reduce((n, t) => n + t.notes.length, 0);
console.log('Escrito', file);
console.log('Pistas:', song.tracks.length, '· notas:', notes, '· compases:', song.bars);
require('./build-demos'); // mantiene demos/demos.js sincronizado para abrir con doble clic
