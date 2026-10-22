#!/usr/bin/env node
/*
 * dossier.js — flujo de dossiers de género de Chiptune Studio.
 *
 *   node tools/dossier.js new <slug> [--name "Nombre"] [--family "familia"]
 *   node tools/dossier.js check <slug|archivo.md|SPEC.json>
 *   node tools/dossier.js promote <slug> [--force]
 *   node tools/dossier.js index
 *   node tools/dossier.js list
 *   node tools/dossier.js status <slug> <draft|tested|validated>
 *   node tools/dossier.js summary <slug>
 *
 * Sin dependencias externas.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const AI = path.join(ROOT, 'ai', 'dossiers');
const INBOX = path.join(AI, 'inbox');
const LIBRARY = path.join(AI, 'library');
const TEMPLATE = path.join(AI, '_template', 'DOSSIER.md');
const INDEX = path.join(AI, 'index.json');
const SONG_CATALOG = path.join(ROOT, 'ai', 'song-maker', 'data', 'dossiers.json');

const METERS = ['4/4', '3/4', '2/4', '5/4', '6/8', '12/8', '7/8'];
const SCALES = ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian', 'harmonicMinor', 'melodicMinor', 'harmonicMajor', 'phrygianDominant', 'doubleHarmonic', 'hungarianMinor', 'pentMin', 'pentMaj', 'blues', 'wholeTone', 'diminished', 'hirajoshi', 'insen', 'egyptian', 'chromatic'];
const EFFECTS = ['reverb', 'delay', 'chorus', 'drive', 'crush'];
const STATUSES = ['inbox', 'draft', 'tested', 'validated'];
const INSTRUMENTS = {
  pulse: ['C3', 'C7'], pwm: ['C3', 'C7'], saw: ['C3', 'C7'], triangle: ['C3', 'C6'],
  bass: ['C1', 'C4'], pluck: ['C1', 'C4'], guitar: ['C2', 'C6'], piano: ['C2', 'C7'],
  strings: ['C2', 'C6'], pad: ['C2', 'C6'], brass: ['C3', 'C6'], bell: ['C5', 'C8'],
  chirp: ['C4', 'C8'], arp: ['C4', 'C8'], drums: null,
};
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (p) => {
  const m = /^([A-G])([#b]?)(-?\d)$/i.exec(String(p || '').trim());
  if (!m) return null;
  const n = NOTE[m[1].toUpperCase()];
  if (n == null) return null;
  return 12 * (+m[3] + 1) + n + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
};

const norm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9#]+/g, '-').replace(/^-+|-+$/g, '');
const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const read = (p) => fs.readFileSync(p, 'utf8');
const readJSON = (p) => JSON.parse(read(p));
const writeJSON = (p, o) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(o, null, 2) + '\n', 'utf8'); };
const list = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir).sort() : [];
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

function fail(msg) { console.error('✗ ' + msg); process.exit(1); }

function specBlocks(text) {
  const re = /```json\s*([\s\S]*?)```/gi;
  const out = [];
  let m;
  while ((m = re.exec(text))) {
    try { out.push(JSON.parse(m[1])); } catch (e) { /* bloque inválido: se ignora aquí */ }
  }
  return out;
}

function findSpec(text) {
  const blocks = specBlocks(text);
  for (let i = blocks.length - 1; i >= 0; i--) if (blocks[i] && blocks[i].schema === 'chiptune-genre-spec@1') return blocks[i];
  return null;
}

function replaceSpecBlock(text, spec) {
  const re = /```json[\s\S]*?```/gi;
  let match, last;
  while ((match = re.exec(text))) last = match;
  if (!last) return text;
  const block = '```json\n' + JSON.stringify(spec, null, 2) + '\n```';
  return text.slice(0, last.index) + block + text.slice(last.index + last[0].length);
}

function resolveTarget(arg) {
  if (!arg) return null;
  const direct = path.resolve(process.cwd(), arg);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const slug = norm(arg);
  const lib = path.join(LIBRARY, slug, 'DOSSIER.md');
  if (fs.existsSync(lib)) return lib;
  const inbox = path.join(INBOX, slug + '.md');
  if (fs.existsSync(inbox)) return inbox;
  return null;
}

function resolveSpec(arg) {
  if (!arg) return null;
  const direct = path.resolve(process.cwd(), arg);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) {
    if (/\.json$/i.test(direct)) return direct;
    const spec = findSpec(read(direct));
    return spec || null;
  }
  const slug = norm(arg);
  const json = path.join(LIBRARY, slug, 'SPEC.json');
  if (fs.existsSync(json)) return json;
  const dossier = path.join(LIBRARY, slug, 'DOSSIER.md');
  if (fs.existsSync(dossier)) return findSpec(read(dossier));
  const inbox = path.join(INBOX, slug + '.md');
  if (fs.existsSync(inbox)) return findSpec(read(inbox));
  return null;
}

function expectedId(file) {
  const base = path.basename(file);
  if (base === 'DOSSIER.md' || base === 'SPEC.json') return path.basename(path.dirname(file));
  return base.replace(/\.(md|json)$/i, '');
}

function parseRange(s) {
  const m = String(s || '').match(/([A-G][#b]?-?\d)\s*[-–]\s*([A-G][#b]?-?\d)/i);
  if (!m) return null;
  const a = midi(m[1]), b = midi(m[2]);
  if (a == null || b == null) return null;
  return [Math.min(a, b), Math.max(a, b)];
}

function validateSpec(spec, expected) {
  const errors = [], warnings = [];
  const need = (cond, msg) => { if (!cond) errors.push(msg); };
  const warn = (cond, msg) => { if (!cond) warnings.push(msg); };

  need(isObj(spec), 'El spec no es un objeto JSON.');
  if (!isObj(spec)) return { errors, warnings };
  need(spec.schema === 'chiptune-genre-spec@1', 'schema debe ser "chiptune-genre-spec@1".');
  need(isStr(spec.id), 'Falta id.');
  if (isStr(spec.id) && expected && norm(spec.id) !== norm(expected)) errors.push(`id "${spec.id}" no coincide con la carpeta/archivo "${expected}".`);
  need(isStr(spec.name), 'Falta name.');
  need(isStr(spec.family), 'Falta family.');
  need(STATUSES.includes(spec.status), `status inválido: ${spec.status}. Usa draft, tested o validated.`);
  need(isNum(spec.confidence) && spec.confidence >= 0 && spec.confidence <= 1, 'confidence debe ser un número entre 0 y 1.');
  need(/^\d{4}-\d{2}-\d{2}$/.test(String(spec.updated || '')), 'updated debe ser YYYY-MM-DD.');
  need(isStr(spec.summary), 'Falta summary.');
  if (spec.context != null) {
    need(isObj(spec.context), 'context debe ser un objeto.');
    if (isObj(spec.context)) {
      for (const k of ['region', 'era', 'function']) warn(isStr(spec.context[k]), `context.${k} está vacío.`);
    }
  }

  need(isObj(spec.meter), 'Falta meter.');
  if (isObj(spec.meter)) {
    need(METERS.includes(spec.meter.primary), `meter.primary inválido: ${spec.meter.primary}.`);
    need(Array.isArray(spec.meter.allowed) && spec.meter.allowed.length > 0, 'meter.allowed debe ser un array no vacío.');
    if (Array.isArray(spec.meter.allowed)) {
      for (const m of spec.meter.allowed) need(METERS.includes(m), `meter.allowed contiene un compás inválido: ${m}.`);
      need(spec.meter.allowed.includes(spec.meter.primary), 'meter.allowed debe incluir meter.primary.');
    }
    need(isStr(spec.meter.feel), 'Falta meter.feel.');
  }

  need(isObj(spec.tempo), 'Falta tempo.');
  if (isObj(spec.tempo)) {
    const r = spec.tempo.range;
    need(Array.isArray(r) && r.length === 2 && isNum(r[0]) && isNum(r[1]) && r[0] <= r[1], 'tempo.range debe ser [min,max].');
    if (Array.isArray(r) && r.length === 2) {
      need(r[0] >= 40 && r[1] <= 240, `tempo.range fuera de 40–240: ${r[0]}–${r[1]}.`);
    }
    need(isNum(spec.tempo.typical), 'tempo.typical debe ser un número.');
    if (isNum(spec.tempo.typical) && Array.isArray(r) && r.length === 2) need(spec.tempo.typical >= r[0] && spec.tempo.typical <= r[1], 'tempo.typical debe estar dentro de tempo.range.');
    if (spec.tempo.map != null) {
      need(Array.isArray(spec.tempo.map), 'tempo.map debe ser un array.');
      if (Array.isArray(spec.tempo.map)) for (const e of spec.tempo.map) {
        need(isObj(e) && isNum(e.bpm) && e.bpm >= 40 && e.bpm <= 240, 'Cada tempo.map necesita bpm 40–240.');
        need(isObj(e) && Number.isInteger(e.bar) && e.bar >= 1, 'Cada tempo.map necesita bar >= 1.');
      }
    }
  }

  need(isObj(spec.key), 'Falta key.');
  if (isObj(spec.key)) {
    need(Array.isArray(spec.key.common) && spec.key.common.length > 0, 'key.common debe ser un array no vacío.');
    need(Array.isArray(spec.key.scales) && spec.key.scales.length > 0, 'key.scales debe ser un array no vacío.');
    if (Array.isArray(spec.key.scales)) for (const s of spec.key.scales) need(SCALES.includes(s), `Escala inválida: ${s}.`);
    need(isStr(spec.key.modality), 'Falta key.modality.');
  }

  need(Array.isArray(spec.form) && spec.form.length > 0, 'form debe ser un array no vacío.');
  if (Array.isArray(spec.form)) {
    let bars = 0;
    for (const [i, f] of spec.form.entries()) {
      const tag = `form[${i}]`;
      need(isObj(f), `${tag} debe ser un objeto.`);
      if (!isObj(f)) continue;
      need(isStr(f.id), `${tag}.id falta.`);
      need(Number.isInteger(f.bars) && f.bars > 0, `${tag}.bars debe ser un entero > 0.`);
      if (Number.isInteger(f.bars)) bars += f.bars;
      need(isStr(f.role), `${tag}.role falta.`);
      need(isNum(f.energy) && f.energy >= 0 && f.energy <= 1, `${tag}.energy debe estar entre 0 y 1.`);
      need(Array.isArray(f.density) && f.density.length === 2 && f.density.every(isNum), `${tag}.density debe ser [min,max].`);
      if (Array.isArray(f.density) && f.density.length === 2) {
        need(f.density[0] >= 0 && f.density[1] >= f.density[0], `${tag}.density inválida.`);
        warn(f.density[1] <= 120, `${tag}.density máxima ${f.density[1]} notas/compás: difícil con 12 pistas.`);
      }
    }
    need(bars <= 64, `La forma suma ${bars} compases; el máximo es 64.`);
    warn(bars > 0, 'La forma no suma compases.');
  }

  need(isObj(spec.rhythm), 'Falta rhythm.');
  if (isObj(spec.rhythm)) {
    need(isStr(spec.rhythm.grid), 'Falta rhythm.grid.');
    need(Array.isArray(spec.rhythm.patterns) && spec.rhythm.patterns.length > 0, 'rhythm.patterns debe ser un array no vacío.');
    need(isStr(spec.rhythm.groove), 'Falta rhythm.groove.');
  }

  need(isObj(spec.harmony), 'Falta harmony.');
  if (isObj(spec.harmony)) {
    need(Array.isArray(spec.harmony.progressions) && spec.harmony.progressions.length > 0, 'harmony.progressions debe ser un array no vacío.');
    need(Array.isArray(spec.harmony.cadences) && spec.harmony.cadences.length > 0, 'harmony.cadences debe ser un array no vacío.');
  }

  need(isObj(spec.melody), 'Falta melody.');
  if (isObj(spec.melody)) {
    need(isStr(spec.melody.range), 'Falta melody.range.');
    need(isStr(spec.melody.motif), 'Falta melody.motif.');
    need(isStr(spec.melody.phrasing), 'Falta melody.phrasing.');
  }

  need(Array.isArray(spec.roles) && spec.roles.length > 0, 'roles debe ser un array no vacío.');
  if (Array.isArray(spec.roles)) for (const [i, r] of spec.roles.entries()) {
    const tag = `roles[${i}]`;
    need(isObj(r), `${tag} debe ser un objeto.`);
    if (!isObj(r)) continue;
    need(isStr(r.role), `${tag}.role falta.`);
    need(Array.isArray(r.instruments) && r.instruments.length > 0, `${tag}.instruments debe ser un array no vacío.`);
    if (Array.isArray(r.instruments)) for (const id of r.instruments) {
      need(Object.prototype.hasOwnProperty.call(INSTRUMENTS, id), `Instrumento inválido en ${tag}: ${id}.`);
      if (INSTRUMENTS[id] && isStr(r.range)) {
        const rr = parseRange(r.range), ir = [midi(INSTRUMENTS[id][0]), midi(INSTRUMENTS[id][1])];
        if (!rr) warnings.push(`${tag}.range no se pudo leer: ${r.range}.`);
        else if (rr[0] < ir[0] || rr[1] > ir[1]) errors.push(`${tag}.range ${r.range} excede el registro de ${id} (${INSTRUMENTS[id][0]}–${INSTRUMENTS[id][1]}).`);
      }
    }
    need(isStr(r.behavior), `${tag}.behavior falta.`);
  }

  need(isObj(spec.instrumentation), 'Falta instrumentation.');
  if (isObj(spec.instrumentation)) {
    need(Array.isArray(spec.instrumentation.required) && spec.instrumentation.required.length > 0, 'instrumentation.required debe ser un array no vacío.');
    need(Array.isArray(spec.instrumentation.avoid), 'instrumentation.avoid debe ser un array.');
  }

  need(isObj(spec.production), 'Falta production.');
  if (isObj(spec.production)) {
    need(Array.isArray(spec.production.effects), 'production.effects debe ser un array.');
    if (Array.isArray(spec.production.effects)) for (const fx of spec.production.effects) need(EFFECTS.includes(fx), `Efecto inválido: ${fx}.`);
    warn(Array.isArray(spec.production.effects) && spec.production.effects.length > 0, 'production.effects está vacío.');
  }

  need(isObj(spec.chiptune), 'Falta chiptune.');
  if (isObj(spec.chiptune)) {
    need(isStr(spec.chiptune.translation), 'Falta chiptune.translation.');
    need(Array.isArray(spec.chiptune.constraints), 'chiptune.constraints debe ser un array.');
    need(Array.isArray(spec.chiptune.workarounds), 'chiptune.workarounds debe ser un array.');
  }

  need(isObj(spec.silence), 'Falta silence.');
  if (isObj(spec.silence)) {
    need(Array.isArray(spec.silence.breaks), 'silence.breaks debe ser un array.');
    need(Array.isArray(spec.silence.dropouts), 'silence.dropouts debe ser un array.');
    need(Array.isArray(spec.silence.rules), 'silence.rules debe ser un array.');
    warn(Array.isArray(spec.silence.breaks) && spec.silence.breaks.length > 0, 'silence.breaks está vacío: el género no tiene espacio definido.');
  }

  for (const k of ['must', 'avoid', 'acceptance']) {
    need(Array.isArray(spec[k]) && spec[k].length > 0, `${k} debe ser un array no vacío.`);
  }

  need(Array.isArray(spec.sources), 'sources debe ser un array.');
  if (Array.isArray(spec.sources)) {
    need(spec.sources.length >= 3, `sources tiene ${spec.sources.length}; mínimo 3.`);
    for (const [i, s] of spec.sources.entries()) {
      const tag = `sources[${i}]`;
      need(isObj(s), `${tag} debe ser un objeto.`);
      if (!isObj(s)) continue;
      need(isStr(s.title), `${tag}.title falta.`);
      warn(isStr(s.url) || isStr(s.isbn) || isStr(s.doi), `${tag} no tiene URL/ISBN/DOI.`);
      warn(isStr(s.claim), `${tag}.claim falta: no se sabe qué respalda.`);
    }
  }

  need(Array.isArray(spec.openQuestions), 'openQuestions debe ser un array.');
  return { errors, warnings };
}

function checkDossier(file) {
  const text = read(file);
  const headings = (text.match(/^##\s+\d+\.\s+.+$/gm) || []).length;
  const spec = findSpec(text);
  const errors = [], warnings = [];
  if (headings < 14) errors.push(`El dossier tiene ${headings} secciones numeradas; se esperan 14.`);
  if (!/^##\s+14\.\s+SPEC/im.test(text)) errors.push('Falta la sección "## 14. SPEC".');
  if (!spec) errors.push('No hay un bloque ```json``` con schema "chiptune-genre-spec@1".');
  if (spec) {
    const v = validateSpec(spec, expectedId(file));
    errors.push(...v.errors);
    warnings.push(...v.warnings);
  }
  return { spec, errors, warnings, headings };
}

function printResult(name, spec, errors, warnings, headings) {
  if (errors.length) {
    console.error(`✗ ${name}: ${errors.length} error(es)`);
    errors.forEach((e) => console.error('  · ' + e));
    if (warnings.length) warnings.forEach((w) => console.error('  ⚠ ' + w));
    process.exit(1);
  }
  console.log(`✓ ${name}: dossier válido`);
  if (spec) {
    const bars = (spec.form || []).reduce((n, f) => n + (f.bars || 0), 0);
    console.log(`  ${spec.name || spec.id} · ${spec.status} · confianza ${spec.confidence}`);
    console.log(`  ${spec.meter?.primary || '—'} · ${spec.tempo?.range?.join('–') || '—'} BPM (típico ${spec.tempo?.typical ?? '—'}) · ${(spec.form || []).length} secciones / ${bars} compases`);
    console.log(`  ${(spec.roles || []).length} roles · fx: ${(spec.production?.effects || []).join(', ') || '—'} · fuentes: ${(spec.sources || []).length}`);
  }
  if (headings) console.log(`  ${headings} secciones de dossier.`);
  if (warnings.length) {
    console.log('  Avisos:');
    warnings.forEach((w) => console.log('  ⚠ ' + w));
  }
}

function cmdNew(args) {
  const slug = norm(args[0]);
  if (!slug) fail('Falta el slug. Ej: node tools/dossier.js new bolero-mexicano');
  const nameArg = args.indexOf('--name');
  const familyArg = args.indexOf('--family');
  const name = nameArg >= 0 ? args[nameArg + 1] : slug.replace(/-/g, ' ');
  const family = familyArg >= 0 ? args[familyArg + 1] : 'sin-familia';
  const dest = path.join(INBOX, slug + '.md');
  if (fs.existsSync(dest)) fail(`Ya existe ${path.relative(ROOT, dest)}. No lo sobrescribo.`);
  const tpl = read(TEMPLATE)
    .replace(/\{\{id\}\}/g, slug)
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{family\}\}/g, family)
    .replace(/\{\{date\}\}/g, today())
    .replace(/\{\{region\}\}/g, '')
    .replace(/\{\{era\}\}/g, '')
    .replace(/\{\{function\}\}/g, '');
  fs.mkdirSync(INBOX, { recursive: true });
  fs.writeFileSync(dest, tpl, 'utf8');
  console.log(`✓ Plantilla creada: ${path.relative(ROOT, dest)}`);
  console.log('  Rellena la investigación o pega la salida de RESEARCH-PROMPT.md, y luego:');
  console.log(`  node tools/dossier.js check ${path.relative(ROOT, dest)}`);
}

function cmdCheck(args) {
  const file = resolveTarget(args[0]);
  if (!file) fail(`No encuentro el dossier: ${args[0] || '(falta argumento)'}`);
  if (/\.json$/i.test(file)) {
    const spec = readJSON(file);
    const v = validateSpec(spec, expectedId(file));
    printResult(path.relative(ROOT, file), spec, v.errors, v.warnings, 0);
    return;
  }
  const r = checkDossier(file);
  printResult(path.relative(ROOT, file), r.spec, r.errors, r.warnings, r.headings);
}

function cmdPromote(args) {
  const slug = norm(args[0]);
  if (!slug) fail('Falta el slug.');
  const src = path.join(INBOX, slug + '.md');
  if (!fs.existsSync(src)) fail(`No existe ${path.relative(ROOT, src)}.`);
  const destDir = path.join(LIBRARY, slug);
  const destDossier = path.join(destDir, 'DOSSIER.md');
  const destSpec = path.join(destDir, 'SPEC.json');
  const force = args.includes('--force');
  if (fs.existsSync(destDossier) && !force) fail(`Ya existe ${path.relative(ROOT, destDossier)}. Usa --force para reemplazar.`);
  const r = checkDossier(src);
  if (r.errors.length) {
    printResult(path.relative(ROOT, src), r.spec, r.errors, r.warnings, r.headings);
    return;
  }
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, destDossier);
  writeJSON(destSpec, r.spec);
  console.log(`✓ Promovido: ${path.relative(ROOT, destDossier)}`);
  console.log(`✓ Spec: ${path.relative(ROOT, destSpec)}`);
  cmdIndex([]);
}

function cmdIndex() {
  const genres = [];
  for (const slug of list(LIBRARY)) {
    const dir = path.join(LIBRARY, slug);
    if (!fs.statSync(dir).isDirectory()) continue;
    const specFile = path.join(dir, 'SPEC.json');
    if (!fs.existsSync(specFile)) continue;
    let spec;
    try { spec = readJSON(specFile); } catch (e) { console.error(`⚠ ${slug}: SPEC.json inválido`); continue; }
    genres.push({
      id: spec.id || slug,
      name: spec.name || slug,
      family: spec.family || '',
      status: spec.status || 'draft',
      confidence: spec.confidence ?? 0,
      updated: spec.updated || '',
      dossier: path.relative(AI, path.join(dir, 'DOSSIER.md')).replace(/\\/g, '/'),
      spec: path.relative(AI, specFile).replace(/\\/g, '/'),
      test: fs.existsSync(path.join(dir, 'TEST.json')) ? `library/${slug}/TEST.json` : null,
    });
  }
  for (const file of list(INBOX)) {
    if (!/\.md$/i.test(file) || file === '.gitkeep') continue;
    const slug = file.replace(/\.md$/i, '');
    if (genres.some((g) => norm(g.id) === norm(slug))) continue;
    const text = read(path.join(INBOX, file));
    const spec = findSpec(text);
    genres.push({
      id: spec?.id || slug,
      name: spec?.name || slug.replace(/-/g, ' '),
      family: spec?.family || '',
      status: 'inbox',
      confidence: spec?.confidence ?? 0,
      updated: spec?.updated || '',
      dossier: `inbox/${file}`,
      spec: null,
      test: null,
    });
  }
  genres.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  writeJSON(INDEX, { schema: 'chiptune-dossiers@1', updated: today(), songCatalog: 'ai/song-maker/data/dossiers.json', genres });
  const promoted = genres.filter((g) => g.spec).map((g) => ({
    ...g,
    dossier: '../dossiers/' + g.dossier,
    spec: '../dossiers/' + g.spec,
    test: g.test ? '../dossiers/' + g.test : null,
  }));
  writeJSON(SONG_CATALOG, { schema: 'chiptune-dossier-catalog@1', updated: today(), source: 'ai/dossiers/index.json', genres: promoted });
  console.log(`✓ index.json: ${genres.length} género(s)`);
  console.log(`✓ song-maker/data/dossiers.json: ${promoted.length} género(s) promovido(s)`);
  for (const g of genres) console.log(`  ${g.status.padEnd(9)} ${g.id} · ${g.name}`);
}

function cmdList() {
  if (!fs.existsSync(INDEX)) cmdIndex([]);
  const index = readJSON(INDEX);
  if (!index.genres.length) { console.log('No hay géneros en el catálogo.'); return; }
  console.log('Estado     Confianza  Género');
  for (const g of index.genres) console.log(`${String(g.status).padEnd(10)} ${String(g.confidence).padEnd(10)} ${g.id} · ${g.name}`);
}

function cmdStatus(args) {
  const slug = norm(args[0]);
  const status = args[1];
  if (!slug || !status) fail('Uso: node tools/dossier.js status <slug> <draft|tested|validated>');
  if (!['draft', 'tested', 'validated'].includes(status)) fail(`Estado inválido: ${status}`);
  const file = path.join(LIBRARY, slug, 'SPEC.json');
  if (!fs.existsSync(file)) fail(`No existe ${path.relative(ROOT, file)}.`);
  const spec = readJSON(file);
  spec.status = status;
  spec.updated = today();
  writeJSON(file, spec);
  const dossier = path.join(LIBRARY, slug, 'DOSSIER.md');
  if (fs.existsSync(dossier)) fs.writeFileSync(dossier, replaceSpecBlock(read(dossier), spec), 'utf8');
  console.log(`✓ ${slug}: ${status}`);
  cmdIndex([]);
}

function cmdSummary(args) {
  const resolved = resolveSpec(args[0]);
  if (!resolved) fail(`No encuentro el género: ${args[0] || '(falta argumento)'}`);
  const spec = typeof resolved === 'string' ? readJSON(resolved) : resolved;
  const bars = (spec.form || []).reduce((n, f) => n + (f.bars || 0), 0);
  console.log(`${spec.name} (${spec.id}) · ${spec.family} · ${spec.status} · confianza ${spec.confidence}`);
  console.log(`${spec.meter?.primary} · ${spec.tempo?.range?.join('–')} BPM (típico ${spec.tempo?.typical}) · ${bars} compases · ${(spec.form || []).length} secciones`);
  console.log(`Forma: ${(spec.form || []).map((f) => `${f.id}(${f.bars})`).join(' → ')}`);
  console.log(`Roles: ${(spec.roles || []).map((r) => `${r.role}:${(r.instruments || []).join('+')}`).join(' · ')}`);
  console.log(`Densidad: ${(spec.form || []).map((f) => `${f.id} ${f.density?.join('–')}`).join(' · ')}`);
  console.log(`Silencio: ${(spec.silence?.rules || []).join(' | ') || '—'}`);
  console.log(`Debe: ${(spec.must || []).join(' | ')}`);
  console.log(`Evitar: ${(spec.avoid || []).join(' | ')}`);
}

function help() {
  console.log(`Uso:
  node tools/dossier.js new <slug> [--name "Nombre"] [--family "familia"]
  node tools/dossier.js check <slug|archivo.md|SPEC.json>
  node tools/dossier.js promote <slug> [--force]
  node tools/dossier.js index
  node tools/dossier.js list
  node tools/dossier.js status <slug> <draft|tested|validated>
  node tools/dossier.js summary <slug>`);
}

const [cmd, ...args] = process.argv.slice(2);
if (!cmd || cmd === 'help' || cmd === '--help') help();
else if (cmd === 'new') cmdNew(args);
else if (cmd === 'check') cmdCheck(args);
else if (cmd === 'promote') cmdPromote(args);
else if (cmd === 'index') cmdIndex(args);
else if (cmd === 'list') cmdList();
else if (cmd === 'status') cmdStatus(args);
else if (cmd === 'summary') cmdSummary(args);
else fail(`Comando desconocido: ${cmd}`);
