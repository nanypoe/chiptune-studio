#!/usr/bin/env node
'use strict';
/*
 * songkit — helpers de composición para canciones Chiptune Studio.
 *
 * Filosofía: fallar ruidoso. Un generador no debe poder colocar una nota fuera
 * de rango, pisar otra nota del mismo paso por accidente ni salirse de la
 * canción sin enterarse. Los duplicados idénticos son idempotentes; la
 * polifonía intencional se declara con stack().
 *
 * Uso:
 *   const kit = require('./tools/songkit.js');
 *   const CS = kit.loadCS();
 *   const k = kit.make({ title, bpm, bars, timeSig, key, scale, sections });
 *   const lead = k.track('Lead', 'saw', { fx: { delay: 0.2 } });
 *   lead.at(1, 0, 4, 'A4');
 *   lead.pattern?  // solo batería
 *   const drums = k.track('Batería', 'drums');
 *   drums.pattern({ kick: [0, 8], snare: [4, 12] }, { fromBar: 1, bars: 8 });
 *   k.tempo([{ bar: 16, bpm: 132, ramp: true }]);
 *   k.write('demos/mi-cancion.json');
 *
 * CLI:
 *   node tools/songkit.js selftest
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const CHORDS = ['M', 'm', 'dim', 'aug', '7', 'M7', 'm7', 'sus4', 'power'];
const TOMS = ['tomlo', 'tommid', 'tomhi'];

let CS = null;

function loadCS() {
  if (global.CS && global.CS.song && global.CS.theory) return (CS = global.CS);
  global.window = global;
  const load = (p) => vm.runInThisContext(fs.readFileSync(path.join(ROOT, p), 'utf8'), { filename: p });
  load('src/core/cs.js');
  load('src/engine/schema.js');
  for (const f of fs.readdirSync(path.join(ROOT, 'src/effects')).sort()) load(path.join('src/effects', f));
  for (const f of fs.readdirSync(path.join(ROOT, 'src/instruments')).sort()) load(path.join('src/instruments', f));
  load('src/engine/voice.js');
  load('src/theory/theory.js');
  load('src/song/song.js');
  return (CS = global.CS);
}

const fail = (msg) => { throw new Error('songkit: ' + msg); };
const isInt = (n) => Number.isInteger(n);
const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

function pieces() {
  const cs = loadCS();
  return cs.drumOrder.slice();
}

/* Elige la octava de un pitch entre candidatos. Por defecto NO transporta:
   [0] evita que un salto silencioso de octava pase desapercibido. */
function fit(pitch, instrument, candidates = [0]) {
  const cs = loadCS();
  const d = cs.getInst(instrument);
  if (!d || d.id === 'drums') fail(`fit: instrumento melódico desconocido "${instrument}"`);
  const m = cs.midi(pitch);
  if (m == null) fail(`fit: nota inválida "${pitch}"`);
  const lo = cs.midi(d.range.low), hi = cs.midi(d.range.high);
  for (const c of candidates) {
    if (!isInt(c)) fail(`fit: candidato de octava inválido ${c}`);
    if (m + c >= lo && m + c <= hi) return cs.name(m + c);
  }
  fail(`"${pitch}" no cabe en ${d.id} (${d.range.low}–${d.range.high}) con candidatos [${candidates.join(', ')}]`);
}

class Track {
  constructor(kit, spec) {
    this.kit = kit;
    this.cfg = spec;
  }

  get notes() { return this.cfg.notes; }
  get isDrums() { return this.cfg.instrument === 'drums'; }
  get inst() { return loadCS().getInst(this.cfg.instrument); }

  /* Nota en paso absoluto. */
  add(step, len, pitch, opts = {}) {
    const cs = loadCS(), d = this.inst;
    if (!isInt(step) || step < 0) fail(`"${this.cfg.name}": step debe ser entero ≥ 0 (recibido ${step})`);
    if (!isInt(len) || len < 1) fail(`"${this.cfg.name}": len debe ser entero ≥ 1 (recibido ${len})`);
    if (step + len > this.kit.totalSteps) fail(`"${this.cfg.name}": ${pitch} en paso ${step} len ${len} se sale de la canción (${this.kit.totalSteps} pasos)`);
    const vel = opts.vel == null ? 0.9 : opts.vel;
    if (typeof vel !== 'number' || !(vel >= 0.1 && vel <= 1)) fail(`"${this.cfg.name}": vel debe estar entre 0.1 y 1 (recibido ${opts.vel})`);

    let note;
    if (d.id === 'drums') {
      if (!cs.drumOrder.includes(pitch)) fail(`"${this.cfg.name}": pieza de batería desconocida "${pitch}" (usa ${cs.drumOrder.join(', ')})`);
      if (opts.slide != null) fail(`"${this.cfg.name}": las notas de batería no admiten slide`);
      if (opts.chord != null) fail(`"${this.cfg.name}": las notas de batería no admiten chord`);
      note = { step, len, pitch, vel };
      const dup = this.cfg.notes.find((n) => n.step === step && n.pitch === pitch);
      if (dup) return dup;
      this.cfg.notes.push(note);
      return note;
    }

    const m = cs.midi(pitch);
    if (m == null) fail(`"${this.cfg.name}": nota inválida "${pitch}"`);
    const lo = cs.midi(d.range.low), hi = cs.midi(d.range.high);
    if (m < lo || m > hi) fail(`"${this.cfg.name}": ${pitch} está fuera del registro de ${d.id} (${d.range.low}–${d.range.high})`);
    if (opts.chord != null && !CHORDS.includes(opts.chord)) fail(`"${this.cfg.name}": chord inválido "${opts.chord}" (usa ${CHORDS.join(', ')})`);
    if (opts.slide != null) {
      const sm = cs.midi(opts.slide);
      if (sm == null) fail(`"${this.cfg.name}": slide inválido "${opts.slide}"`);
      if (sm < lo || sm > hi) fail(`"${this.cfg.name}": slide ${opts.slide} fuera del registro de ${d.id} (${d.range.low}–${d.range.high})`);
    }

    const atStep = this.cfg.notes.filter((n) => n.step === step);
    const same = atStep.find((n) => n.len === len && n.pitch === pitch);
    if (same) return same;
    if (atStep.length && !opts.stack) {
      const prev = atStep[0];
      fail(`"${this.cfg.name}" colisión en paso ${step}: ya hay ${prev.pitch} (len ${prev.len}); intento ${pitch} (len ${len}). Usa stack() para polifonía intencional.`);
    }
    note = { step, len, pitch, vel };
    if (opts.chord != null) note.chord = opts.chord;
    if (opts.slide != null) note.slide = opts.slide;
    this.cfg.notes.push(note);
    return note;
  }

  /* Nota relativa a un compás 1-based. */
  at(bar, stepInBar, len, pitch, opts = {}) {
    return this.add(this.kit.toStep(bar, stepInBar), len, pitch, opts);
  }

  /* Polifonía explícita: varias notas arrancan en el mismo paso. */
  stack(step, len, pitches, opts = {}) {
    if (!Array.isArray(pitches) || pitches.length < 2) fail(`"${this.cfg.name}": stack necesita 2–4 pitches`);
    if (pitches.length > 4) fail(`"${this.cfg.name}": stack admite como máximo 4 notas simultáneas`);
    return pitches.map((p) => this.add(step, len, p, { ...opts, stack: true }));
  }

  /* Golpe de batería relativo a compás (bar 1-based, step 0-based). */
  hit(piece, bar, stepInBar, opts = {}) {
    if (!this.isDrums) fail(`"${this.cfg.name}": hit solo para pistas de batería`);
    return this.add(this.kit.toStep(bar, stepInBar), 1, piece, opts);
  }

  /* Aplica {pieza:[pasos]} a cada compás del rango. Las piezas deben ser
     concretas: "toms" es una familia del spec, no una pieza reproducible. */
  pattern(map, opts = {}) {
    if (!this.isDrums) fail(`"${this.cfg.name}": pattern solo para pistas de batería`);
    if (!isObj(map)) fail(`"${this.cfg.name}": pattern espera {pieza:[pasos]}`);
    const cs = loadCS();
    const fromBar = opts.fromBar == null ? 1 : opts.fromBar;
    const bars = opts.bars == null ? 1 : opts.bars;
    const vel = opts.vel;
    this.kit.checkBars(fromBar, bars);
    for (const [piece, steps] of Object.entries(map)) {
      if (piece === 'toms' || !cs.drumOrder.includes(piece)) fail(`"${this.cfg.name}": pieza "${piece}" no es concreta (usa ${cs.drumOrder.join(', ')}; "toms" = ${TOMS.join('/')})`);
      if (!Array.isArray(steps)) fail(`"${this.cfg.name}": pattern.${piece} debe ser un array de pasos`);
      for (const s of steps) {
        if (!isInt(s) || s < 0 || s >= this.kit.spb) fail(`"${this.cfg.name}": pattern.${piece} paso ${s} fuera de 0..${this.kit.spb - 1}`);
      }
      for (let b = fromBar; b < fromBar + bars; b++) for (const s of steps) this.hit(piece, b, s, { vel });
    }
    return this;
  }

  /* Copia el contenido de [fromBar, fromBar+bars) times veces hacia delante.
     Las colisiones se detectan vía add(); transpose solo en melódicas. */
  repeat(opts = {}) {
    const fromBar = opts.fromBar == null ? 1 : opts.fromBar;
    const bars = opts.bars == null ? 1 : opts.bars;
    const times = opts.times == null ? 1 : opts.times;
    const gap = opts.gap == null ? 0 : opts.gap;
    const transpose = opts.transpose == null ? 0 : opts.transpose;
    if (!isInt(times) || times < 1) fail(`"${this.cfg.name}": repeat.times debe ser entero ≥ 1`);
    if (!isInt(gap) || gap < 0) fail(`"${this.cfg.name}": repeat.gap debe ser entero ≥ 0`);
    if (!isInt(transpose)) fail(`"${this.cfg.name}": repeat.transpose debe ser entero`);
    if (transpose !== 0 && this.isDrums) fail(`"${this.cfg.name}": repeat.transpose no tiene sentido en batería`);
    this.kit.checkBars(fromBar, bars);
    const start = this.kit.toStep(fromBar, 0), len = bars * this.kit.spb;
    const src = this.cfg.notes.filter((n) => n.step >= start && n.step < start + len).map((n) => ({ ...n }));
    if (!src.length) fail(`"${this.cfg.name}": no hay notas en compases ${fromBar}..${fromBar + bars - 1} para repetir`);
    const cs = loadCS();
    for (let k = 1; k < times; k++) {
      const off = k * (bars + gap) * this.kit.spb;
      for (const n of src) {
        const pitch = transpose ? cs.name(cs.midi(n.pitch) + transpose) : n.pitch;
        this.add(n.step + off, n.len, pitch, { vel: n.vel, chord: n.chord, slide: n.slide });
      }
    }
    return this;
  }
}

class Kit {
  constructor(opts = {}) {
    const cs = loadCS();
    this.title = isStr(opts.title) ? opts.title : 'Sin título';
    this.bpm = opts.bpm == null ? 120 : opts.bpm;
    if (!isInt(this.bpm) || this.bpm < 40 || this.bpm > 240) fail(`bpm debe ser entero 40–240 (recibido ${opts.bpm})`);
    this.bars = opts.bars == null ? 8 : opts.bars;
    if (!isInt(this.bars) || this.bars < 1 || this.bars > 64) fail(`bars debe ser entero 1–64 (recibido ${opts.bars})`);
    this.timeSig = opts.timeSig == null ? '4/4' : opts.timeSig;
    if (!cs.TS[this.timeSig]) fail(`timeSig inválido "${this.timeSig}" (usa ${Object.keys(cs.TS).join(', ')})`);
    this.spb = cs.sig({ timeSig: this.timeSig }).spb;
    this.totalSteps = this.bars * this.spb;
    this.key = opts.key == null ? null : opts.key;
    this.scale = opts.scale == null ? null : opts.scale;
    if (this.scale != null && !cs.theory.scales[this.scale]) fail(`scale inválida "${this.scale}" (usa ${Object.keys(cs.theory.scales).join(', ')})`);
    this.loopStart = opts.loopStart == null ? 0 : opts.loopStart;
    if (!isInt(this.loopStart) || this.loopStart < 0 || this.loopStart >= this.bars) fail(`loopStart debe ser entero 0..${this.bars - 1}`);
    this.tracks = [];
    this.names = new Set();
    this.sections = [];
    this.sectionIds = new Set();
    this.tempoMap = [];
    for (const s of opts.sections || []) this.section(s && s.id, s && s.bar);
  }

  checkBars(fromBar, bars) {
    if (!isInt(fromBar) || fromBar < 1 || fromBar > this.bars) fail(`compás ${fromBar} fuera de 1..${this.bars}`);
    if (!isInt(bars) || bars < 1 || fromBar + bars - 1 > this.bars) fail(`rango de ${bars} compases desde ${fromBar} se sale de la canción (${this.bars})`);
  }

  toStep(bar, stepInBar) {
    if (!isInt(bar) || bar < 1 || bar > this.bars) fail(`compás ${bar} fuera de 1..${this.bars}`);
    if (!isInt(stepInBar) || stepInBar < 0 || stepInBar >= this.spb) fail(`paso ${stepInBar} fuera de 0..${this.spb - 1} (${this.timeSig})`);
    return (bar - 1) * this.spb + stepInBar;
  }

  section(id, bar) {
    if (!isStr(id)) fail('section: id vacío');
    id = id.trim();
    if (this.sectionIds.has(id)) fail(`section: id duplicado "${id}"`);
    if (!isInt(bar) || bar < 1 || bar > this.bars) fail(`section "${id}": bar debe ser entero 1..${this.bars}`);
    this.sectionIds.add(id);
    this.sections.push({ id, bar });
    this.sections.sort((a, b) => a.bar - b.bar || a.id.localeCompare(b.id));
    return this;
  }

  sectionAt(bar) {
    let found = null;
    for (const s of this.sections) if (s.bar <= bar) found = s.id;
    return found;
  }

  track(name, instrument, opts = {}) {
    const cs = loadCS();
    if (!isStr(name)) fail('track: nombre vacío');
    name = name.trim();
    if (this.names.has(name)) fail(`track: nombre duplicado "${name}"`);
    if (this.tracks.length >= 12) fail('track: máximo 12 pistas');
    const d = cs.getInst(instrument);
    if (!d) fail(`track: instrumento desconocido "${instrument}"`);
    const volume = opts.volume == null ? 0.8 : opts.volume;
    const pan = opts.pan == null ? 0 : opts.pan;
    if (typeof volume !== 'number' || volume < 0 || volume > 1) fail(`track "${name}": volume 0–1`);
    if (typeof pan !== 'number' || pan < -1 || pan > 1) fail(`track "${name}": pan −1..1`);
    const fx = {};
    for (const [id, amt] of Object.entries(opts.fx || {})) {
      if (!cs.fx[id]) fail(`track "${name}": efecto desconocido "${id}"`);
      if (typeof amt !== 'number' || amt < 0 || amt > 1) fail(`track "${name}": fx.${id} 0–1`);
      fx[id] = amt;
    }
    this.names.add(name);
    const cfg = { name, instrument: d.id, volume, pan, fx, notes: [] };
    this.tracks.push({ name, cfg });
    return new Track(this, cfg);
  }

  /* Entradas de tempo: bar 0-based, ≥ 1, dentro de la canción. */
  tempo(entries) {
    if (!Array.isArray(entries)) fail('tempo espera un array');
    for (const e of entries) {
      if (!isObj(e)) fail('tempo: cada entrada debe ser {bar,bpm,ramp?}');
      if (!isInt(e.bar) || e.bar < 1 || e.bar >= this.bars) fail(`tempo.bar debe ser entero 1..${this.bars - 1} (recibido ${e.bar})`);
      if (!isInt(e.bpm) || e.bpm < 40 || e.bpm > 240) fail(`tempo.bpm debe ser entero 40–240 (recibido ${e.bpm})`);
      if (e.ramp != null && typeof e.ramp !== 'boolean') fail('tempo.ramp debe ser booleano');
      if (this.tempoMap.some((x) => x.bar === e.bar)) fail(`tempo: bar ${e.bar} duplicado`);
      this.tempoMap.push({ bar: e.bar, bpm: e.bpm, ...(e.ramp ? { ramp: true } : {}) });
    }
    this.tempoMap.sort((a, b) => a.bar - b.bar);
    return this;
  }

  song() {
    const cs = loadCS();
    const out = {
      format: 'chiptune-studio', version: 2, title: this.title, bpm: this.bpm, bars: this.bars, timeSig: this.timeSig,
      loopStart: this.loopStart,
    };
    if (this.key != null) out.key = this.key;
    if (this.scale != null) out.scale = this.scale;
    if (this.sections.length) out.sections = this.sections.map((s) => ({ id: s.id, bar: s.bar }));
    if (this.tempoMap.length) out.tempo = this.tempoMap.map((e) => ({ ...e }));
    out.tracks = this.tracks.map(({ cfg }) => ({
      name: cfg.name, instrument: cfg.instrument, volume: cfg.volume, pan: cfg.pan, fx: { ...cfg.fx },
      notes: cfg.notes.map((n) => ({ ...n })),
    }));
    return cs.song.normalize(out);
  }

  write(file) {
    const song = this.song();
    fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(song, null, 2) + '\n', 'utf8');
    return song;
  }
}

function make(opts) {
  loadCS();
  return new Kit(opts);
}

function selftest() {
  const os = require('os');
  let pass = 0;
  const ok = (c, m) => { if (!c) throw new Error('selftest ✗ ' + m); pass++; };
  const throws = (fn, re, m) => {
    try { fn(); } catch (e) {
      if (re && !re.test(e.message)) throw new Error(`selftest ✗ ${m} — mensaje inesperado: ${e.message}`);
      pass++; return;
    }
    throw new Error('selftest ✗ ' + m + ' — no lanzó');
  };
  const base = () => make({ title: 'Test', bpm: 120, bars: 4, timeSig: '4/4' });

  throws(() => make({ bars: 0 }), /bars/, 'bars 0 falla');
  throws(() => make({ bars: 65 }), /bars/, 'bars 65 falla');
  throws(() => make({ timeSig: '9/8' }), /timeSig/, 'timeSig inválido falla');
  throws(() => make({ bpm: 300 }), /bpm/, 'bpm 300 falla');
  throws(() => make({ scale: 'nope' }), /scale/, 'scale inválida falla');

  const sec = make({ bars: 8, sections: [{ id: 'b', bar: 5 }, { id: 'a', bar: 1 }] });
  ok(sec.sections.map((s) => s.id).join(',') === 'a,b', 'sections se ordenan por compás');
  ok(sec.sectionAt(4) === 'a' && sec.sectionAt(5) === 'b', 'sectionAt resuelve el compás');
  throws(() => sec.section('a', 8), /duplicado/, 'section duplicada falla');
  throws(() => sec.section('c', 9), /bar/, 'section fuera de rango falla');
  throws(() => make({ bars: 4, sections: [{ id: 'x', bar: 0 }] }), /bar/, 'section bar 0 falla');

  const k = base();
  const lead = k.track('Lead', 'saw', { fx: { delay: 0.2 } });
  throws(() => k.track('Lead', 'bass'), /duplicado/, 'nombre de pista duplicado falla');
  throws(() => k.track('X', 'theremin'), /desconocido/, 'instrumento desconocido falla');
  throws(() => k.track('Y', 'saw', { fx: { wah: 0.3 } }), /efecto/, 'efecto desconocido falla');

  lead.add(0, 4, 'C4');
  ok(lead.notes.length === 1, 'add coloca una nota');
  lead.add(0, 4, 'C4');
  ok(lead.notes.length === 1, 'duplicado idéntico es idempotente');
  throws(() => lead.add(0, 4, 'D4'), /colisión/, 'colisión de paso distinta nota falla');
  throws(() => lead.add(0, 4, 'Z9'), /inválida/, 'pitch inválido falla');
  throws(() => lead.add(0, 0, 'C4'), /len/, 'len 0 falla');
  throws(() => lead.add(-1, 1, 'C4'), /step/, 'step negativo falla');
  throws(() => lead.add(63, 2, 'C4'), /se sale/, 'nota más allá del final falla');
  throws(() => lead.add(4, 1, 'C8'), /registro/, 'pitch fuera de registro falla');
  throws(() => lead.add(4, 1, 'C4', { vel: 0 }), /vel/, 'vel 0 falla');
  throws(() => lead.add(4, 1, 'C4', { chord: 'maj7' }), /chord/, 'chord inválido falla');
  lead.at(2, 0, 4, 'E4');
  ok(lead.notes.some((n) => n.step === 16 && n.pitch === 'E4'), 'at usa compás 1-based');
  throws(() => lead.at(0, 0, 1, 'C4'), /compás/, 'at bar 0 falla');
  throws(() => lead.at(1, 16, 1, 'C4'), /paso/, 'at paso 16 falla en 4/4');
  throws(() => lead.at(5, 0, 1, 'C4'), /compás/, 'at bar > bars falla');

  const st = base().track('Pad', 'pad');
  st.stack(0, 8, ['C3', 'E3', 'G3']);
  ok(st.notes.length === 3, 'stack coloca polifonía');
  st.stack(0, 8, ['C3', 'E3', 'G3']);
  ok(st.notes.length === 3, 'stack idéntico es idempotente');
  throws(() => st.stack(16, 4, ['C3', 'D3', 'E3', 'F3', 'G3']), /máximo/, 'stack >4 falla');

  const dr = base().track('Batería', 'drums');
  dr.hit('kick', 1, 0);
  ok(dr.notes.length === 1, 'hit coloca un golpe');
  dr.hit('snare', 1, 0);
  ok(dr.notes.length === 2, 'dos piezas distintas comparten paso');
  throws(() => dr.hit('cowbell', 1, 0), /desconocida/, 'pieza inválida falla');
  throws(() => dr.hit('kick', 1, 16), /paso/, 'hit paso fuera de compás falla');
  dr.pattern({ kick: [0, 8], snare: [4, 12] }, { fromBar: 2, bars: 2 });
  ok(dr.notes.filter((n) => n.step >= 16 && n.step < 48).length === 8, 'pattern cubre 2 compases × 4 golpes');
  throws(() => dr.pattern({ toms: [0, 2] }, { fromBar: 1, bars: 1 }), /concreta/, 'familia toms falla en pattern');
  throws(() => dr.pattern({ kick: [16] }, { fromBar: 1, bars: 1 }), /fuera de/, 'pattern paso 16 falla');
  throws(() => dr.pattern({ kick: [0] }, { fromBar: 4, bars: 2 }), /sale/, 'pattern se sale de la canción');

  throws(() => fit('B2', 'saw'), /no cabe/, 'fit sin candidatos falla fuera de rango');
  ok(fit('B2', 'saw', [0, 12]) === 'B3', 'fit transporta con candidato 12');
  ok(fit('C8', 'saw', [0, -12]) === 'C7', 'fit baja una octava con candidato -12');
  throws(() => fit('B2', 'drums'), /melódico/, 'fit rechaza batería');

  const r = base();
  const bass = r.track('Bajo', 'bass');
  bass.at(1, 0, 4, 'C2');
  bass.repeat({ fromBar: 1, bars: 1, times: 3 });
  ok(bass.notes.length === 3 && bass.notes.some((n) => n.step === 16) && bass.notes.some((n) => n.step === 32), 'repeat copia compases');
  throws(() => bass.repeat({ fromBar: 4, bars: 1, times: 1, transpose: 0 }), /no hay notas/, 'repeat sin material falla');
  throws(() => bass.repeat({ fromBar: 1, bars: 1, times: 2, transpose: 36 }), /registro/, 'repeat transpose fuera de rango falla');

  r.tempo([{ bar: 3, bpm: 132, ramp: true }]);
  ok(r.tempoMap.length === 1 && r.tempoMap[0].bar === 3, 'tempo acepta bar 0-based ≥ 1');
  throws(() => base().tempo([{ bar: 0, bpm: 130 }]), /tempo\.bar/, 'tempo bar 0 falla');
  throws(() => make({ bars: 8 }).tempo([{ bar: 4, bpm: 130 }, { bar: 4, bpm: 140 }]), /duplicado/, 'tempo bar duplicado falla');

  r.section('intro', 1).section('outro', 4);
  const file = path.join(os.tmpdir(), 'songkit-selftest.json');
  const song = r.write(file);
  ok(song.sections.length === 2 && song.sections[0].id === 'intro', 'write conserva sections');
  ok(song.tempo.length === 1 && song.tempo[0].bar === 3, 'write conserva tempo');
  ok(song.tracks.length === 1 && song.tracks[0].notes.length === 3, 'write conserva pistas y notas');
  const reread = JSON.parse(fs.readFileSync(file, 'utf8'));
  ok(reread.sections.length === 2 && reread.format === 'chiptune-studio' && reread.version === 2, 'JSON escrito es re-legible');
  fs.unlinkSync(file);

  console.log(`✓ songkit selftest: ${pass} comprobaciones`);
}

module.exports = { loadCS, make, fit, pieces, TOMS, CHORDS, selftest, Track, Kit };

if (require.main === module) {
  const cmd = process.argv[2];
  if (cmd === 'selftest') {
    try { selftest(); } catch (e) { console.error(e.message); process.exit(1); }
  } else {
    console.error('uso: node tools/songkit.js selftest');
    process.exit(1);
  }
}
