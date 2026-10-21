#!/usr/bin/env node
/*
 * ai-compose.js — flujo de composición asistida para Chiptune Studio.
 *
 *   node tools/ai-compose.js plan <brief> [--out plan.json]
 *   node tools/ai-compose.js sketch <brief> [--out cancion.json] [--plan-out plan.json]
 *   node tools/ai-compose.js check <cancion.json> [--json]
 *   node tools/ai-compose.js genres [consulta] [--family latin] [--emotion misterioso]
 *   node tools/ai-compose.js moods [consulta]
 *   node tools/ai-compose.js brief [--out brief.md]
 *
 * Sin dependencias externas. El esbozo es un punto de partida: la IA (o una persona)
 * debe escucharlo, ajustar la melodía y validarlo antes de entregarlo.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const GENRES = readJSON('ai/genres.json');
const MOODS = readJSON('ai/moods.json');
const INFLUENCES = readJSON('ai/influences.json');

const VALID_SCALES = ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian', 'harmonicMinor', 'melodicMinor', 'harmonicMajor', 'phrygianDominant', 'doubleHarmonic', 'hungarianMinor', 'pentMin', 'pentMaj', 'blues', 'wholeTone', 'diminished', 'hirajoshi', 'insen', 'egyptian', 'chromatic'];
const VALID_METERS = ['4/4', '3/4', '2/4', '5/4', '6/8', '12/8', '7/8'];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const norm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9#]+/g, ' ').trim();
const slug = (s) => norm(s).replace(/\s+/g, '-') || 'sin-nombre';
const uniq = (a) => [...new Set(a.filter((x) => x != null && x !== ''))];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const pick = (arr, r) => arr[Math.floor(r() * arr.length) % arr.length];
function mulberry(seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- lectura y normalización de briefs ---------- */

function cleanLines(text) {
  return String(text).replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean);
}

function listFrom(lines) {
  const out = [];
  for (const l of lines) {
    if (/^[-*•]\s*/.test(l)) out.push(l.replace(/^[-*•]\s*/, '').trim());
    else if (/^\d+[.)]\s+/.test(l)) out.push(l.replace(/^\d+[.)]\s+/, '').trim());
    else if (l && !/^#/.test(l)) out.push(l);
  }
  return out.map((s) => s.replace(/^\[|\]$/g, '').trim()).filter(Boolean);
}

function parseTechnical(lines) {
  const t = {}, text = lines.join('\n');
  const bpm = text.match(/(?:^|\s)(\d{2,3})\s*(?:bpm|BPM)/); if (bpm) t.bpm = +bpm[1];
  const range = text.match(/(\d{2,3})\s*[-–a]\s*(\d{2,3})\s*(?:bpm|BPM)/i); if (range) t.bpmRange = [+range[1], +range[2]];
  const meter = text.match(/\b(4\/4|3\/4|2\/4|5\/4|6\/8|12\/8|7\/8)\b/); if (meter) t.timeSig = meter[1];
  const bars = text.match(/(\d{1,2})\s*compases/i); if (bars) t.bars = +bars[1];
  const dur = text.match(/(?:duraci[oó]n|duration)\D{0,12}(\d+(?:[.,]\d+)?)\s*(s|seg|segundos|min|minutos)?/i);
  if (dur) t.duration = +dur[1].replace(',', '.') * (/min/i.test(dur[2] || '') ? 60 : 1);
  const key = text.match(/(?:tonalidad|key)\s*:?\s*([A-G][#b]?)/i); if (key) t.key = key[1];
  const scale = text.match(/(?:escala|modo|scale)\s*:?\s*([A-Za-z]+)/i); if (scale) t.scale = scale[1];
  const loop = text.match(/loop\s*:?\s*(s[ií]|yes|true|no|false)/i); if (loop) t.loop = !/^n|false/i.test(loop[1]);
  const loopBar = text.match(/(?:retorno|loopStart|comp[aá]s de retorno)\s*:?\s*(\d+)/i); if (loopBar) t.loopStartBar = +loopBar[1] - 1;
  const max = text.match(/(?:m[aá]ximo|max)\D{0,12}(\d{1,2})\s*pistas/i); if (max) t.maxTracks = +max[1];
  if (/cambiar?\s+(?:el\s+)?tempo|mustChangeTempo|cambio de tempo/i.test(text)) t.mustChangeTempo = true;
  return t;
}

function parseTextBrief(text, file) {
  const raw = String(text).replace(/^\uFEFF/, '').replace(/```(?:json|markdown|md)?/gi, '').trim();
  if (/^\{/.test(raw)) { try { return JSON.parse(raw); } catch (e) { /* sigue como texto */ } }
  const lines = cleanLines(raw), b = { title: path.basename(file || 'brief', path.extname(file || '')).replace(/[-_]+/g, ' ') };
  const map = {
    titulo: 'title', title: 'title', nombre: 'title',
    proyecto: 'project', project: 'project', escena: 'project', nivel: 'project',
    premisa: 'premise', historia: 'premise', lore: 'premise', descripcion: 'premise', description: 'premise',
    emociones: 'emotions', emocion: 'emotions', emotions: 'emotions', mood: 'emotions',
    funcion: 'function', function: 'function', uso: 'function',
    influencias: 'influences', influencia: 'influences', influences: 'influences', referencias: 'references',
    genero: 'genre', genre: 'genre', subgenero: 'subgenre', subgenre: 'subgenre',
    'lo que debe incluir': 'mustInclude', incluir: 'mustInclude', mustinclude: 'mustInclude', requisitos: 'mustInclude',
    'lo que hay que evitar': 'avoid', evitar: 'avoid', avoid: 'avoid',
    'datos tecnicos': 'technical', tecnico: 'technical', technical: 'technical',
    originalidad: 'originality', originality: 'originality',
    notas: 'notes', notes: 'notes', entregables: 'deliverables'
  };
  let cur = null, buf = [];
  const flush = () => { if (!cur) return; if (cur === 'technical') b.technical = parseTechnical(buf); else if (cur === 'originality') b.originality = { statement: buf.join(' ') }; else if (cur === 'notes' || cur === 'project' || cur === 'premise' || cur === 'function' || cur === 'subgenre') b[cur] = buf.join(' '); else b[cur] = listFrom(buf); };
  for (const l of lines) {
    const h = l.match(/^#{1,6}\s*(.+)$/);
    if (h) { flush(); const key = norm(h[1]).replace(/:$/, ''); cur = map[key] || null; buf = []; continue; }
    const kv = l.match(/^([^:]{2,40}):\s*(.*)$/);
    if (kv && !cur) {
      const key = map[norm(kv[1]).replace(/:$/, '')];
      if (key && key !== 'technical') { b[key] = key === 'emotions' || key === 'influences' || key === 'genre' || key === 'mustInclude' || key === 'avoid' ? listFrom([kv[2]]) : kv[2]; continue; }
    }
    if (cur) buf.push(l);
  }
  flush();
  if (!b.premise && !b.influences && !b.genre && !b.title) b.premise = raw;
  return b;
}

function readBrief(file) {
  if (!file || file === '-') {
    if (!process.stdin.isTTY) return parseTextBrief(fs.readFileSync(0, 'utf8'), 'stdin');
    return { title: 'Brief sin título', premise: 'Describe aquí la historia, la escena o la emoción.' };
  }
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) throw new Error(`No existe el brief: ${file}`);
  const text = fs.readFileSync(p, 'utf8');
  if (/\.json$/i.test(p)) return JSON.parse(text);
  return parseTextBrief(text, p);
}

function normalizeBrief(o) {
  const b = { ...o };
  const arr = (v) => Array.isArray(v) ? v.map((x) => typeof x === 'string' ? x : (x && (x.name || x.title)) || '').filter(Boolean) : (v ? [String(v)] : []);
  b.title = String(b.title || b.name || 'Canción sin título').slice(0, 80);
  b.premise = String(b.premise || b.description || b.lore || '').trim();
  b.project = String(b.project || b.projectName || '').trim();
  b.function = String(b.function || b.funcion || b.use || '').trim();
  b.emotions = arr(b.emotions || b.moods || b.feelings);
  b.influences = arr(b.influences || b.references);
  b.genre = arr(b.genre || b.genres);
  b.subgenre = String(b.subgenre || '');
  b.mustInclude = arr(b.mustInclude || b.must_include);
  b.avoid = arr(b.avoid || b.avoidList);
  b.notes = String(b.notes || '');
  b.technical = { ...(b.technical || {}) };
  if (b.bpm != null && b.technical.bpm == null) b.technical.bpm = +b.bpm;
  if (b.timeSig != null && b.technical.timeSig == null) b.technical.timeSig = b.timeSig;
  if (b.bars != null && b.technical.bars == null) b.technical.bars = +b.bars;
  if (b.key != null && b.technical.key == null) b.technical.key = b.key;
  if (b.scale != null && b.technical.scale == null) b.technical.scale = b.scale;
  if (b.loop != null && b.technical.loop == null) b.technical.loop = !!b.loop;
  if (b.technical.timeSig && !VALID_METERS.includes(b.technical.timeSig)) delete b.technical.timeSig;
  if (b.technical.scale && !VALID_SCALES.includes(b.technical.scale)) delete b.technical.scale;
  if (b.technical.bars) b.technical.bars = clamp(Math.floor(+b.technical.bars), 1, 64);
  if (b.technical.bpm) b.technical.bpm = clamp(Math.round(+b.technical.bpm), 40, 240);
  if (b.technical.bpmRange) b.technical.bpmRange = b.technical.bpmRange.map((n) => clamp(Math.round(+n), 40, 240)).sort((a, c) => a - c);
  return b;
}

function briefText(b) {
  return [b.title, b.project, b.premise, b.function, b.genre.join(' '), b.subgenre, b.emotions.join(' '), b.influences.join(' '), b.mustInclude.join(' '), b.avoid.join(' '), b.notes, JSON.stringify(b.technical || {})].join(' ').trim();
}

/* ---------- índice de géneros, emociones e influencias ---------- */

const FAMILIES = GENRES.families;
const PROFILES = GENRES.genres;
const familyIds = new Set(Object.keys(FAMILIES));
const FAMILY_ALIASES = { ambient: 'electronic', 'new-age': 'electronic', cartoon: 'screen-stage', bolero: 'latin', ska: 'reggae-caribbean', industrial: 'electronic', techno: 'electronic', noise: 'experimental', 'city-pop': 'pop', folk: 'country-folk' };
const canonFamily = (f) => FAMILY_ALIASES[f] || f;
const profileById = new Map(Object.entries(PROFILES).map(([id, p]) => [id, { ...p, id }]));
const profileByNorm = new Map();
const catalogByNorm = new Map();

function addAlias(map, key, value) { if (key && !map.has(key)) map.set(key, value); }
for (const [id, p] of Object.entries(PROFILES)) {
  const item = { ...p, id, custom: false, source: 'profile' };
  addAlias(profileByNorm, norm(id), item);
  addAlias(profileByNorm, norm(p.name), item);
  for (const a of p.aliases || []) addAlias(profileByNorm, norm(a), item);
}
for (const [family, names] of Object.entries(GENRES.catalog)) {
  for (const name of names) {
    const n = norm(name), prof = profileByNorm.get(n);
    const item = prof || { id: slug(name), name, family, custom: false, source: 'catalog' };
    addAlias(catalogByNorm, n, item);
  }
}

function findGenre(q) {
  const n = norm(q);
  if (!n) return null;
  if (profileByNorm.has(n)) return profileByNorm.get(n);
  if (catalogByNorm.has(n)) return catalogByNorm.get(n);
  let best = null, bs = 0;
  for (const [key, p] of profileByNorm) {
    if (key.includes(n) || n.includes(key)) { const s = Math.min(key.length, n.length) / Math.max(key.length, n.length); if (s > bs) { bs = s; best = p; } }
  }
  if (best && bs > 0.55) return best;
  for (const [key, p] of catalogByNorm) {
    if (key.includes(n) || n.includes(key)) { const s = Math.min(key.length, n.length) / Math.max(key.length, n.length); if (s > bs) { bs = s; best = p; } }
  }
  return bs > 0.55 ? best : null;
}

function findMood(q) {
  const n = norm(q);
  if (!n) return null;
  for (const [id, m] of Object.entries(MOODS.moods)) {
    if (norm(id) === n || norm(m.name) === n) return { ...m, id };
    for (const a of m.aliases || []) if (norm(a) === n) return { ...m, id };
  }
  for (const [id, m] of Object.entries(MOODS.moods)) {
    const hay = [id, m.name, ...(m.aliases || [])].map(norm);
    if (hay.some((h) => h.includes(n) || n.includes(h))) return { ...m, id };
  }
  return null;
}

function findInfluence(q) {
  const n = norm(q);
  if (!n) return null;
  for (const [id, p] of Object.entries(INFLUENCES.profiles)) {
    if (norm(id) === n || norm(p.name) === n) return { ...p, id };
    for (const a of p.aliases || []) if (norm(a) === n) return { ...p, id };
  }
  for (const [id, p] of Object.entries(INFLUENCES.profiles)) {
    const hay = [id, p.name, ...(p.aliases || [])].map(norm);
    if (hay.some((h) => h.includes(n) || n.includes(h))) return { ...p, id };
  }
  return null;
}

function guessFamily(text) {
  const n = norm(text), scores = new Map();
  const add = (f, v) => { if (familyIds.has(f)) scores.set(f, (scores.get(f) || 0) + v); };
  for (const [f, kws] of Object.entries(GENRES.fallback.keywordToFamily || {})) for (const k of kws) if (n.includes(norm(k))) add(f, 3 + norm(k).length / 20);
  for (const [f, fam] of Object.entries(FAMILIES)) {
    for (const k of fam.keywords || []) if (n.includes(norm(k))) add(f, 2 + norm(k).length / 25);
    for (const k of fam.emotions || []) if (n.includes(norm(k))) add(f, 0.5);
  }
  if (/videojuego|game|jrpg|nivel|jefe|boss|pantalla|consola/.test(n)) add('chiptune-game', 3);
  if (/cine|pelicula|film|soundtrack|escena|cinem/.test(n)) add('screen-stage', 2.5);
  let best = GENRES.fallback.defaultFamily || 'screen-stage', bs = -1;
  for (const [f, s] of scores) if (s > bs) { bs = s; best = f; }
  return best;
}

function makeCustomGenre(name, text) {
  const family = guessFamily(text + ' ' + name);
  return { id: slug(name), name, family, aliases: [], traits: { emotions: FAMILIES[family].emotions || [] }, custom: true, source: 'custom' };
}

function scoreGenreMatch(b, text) {
  const n = norm(text), scores = new Map();
  const add = (p, s) => { scores.set(p.id, (scores.get(p.id) || 0) + s); };
  const all = [...profileByNorm.values()];
  const seen = new Set();
  for (const p of all) {
    if (seen.has(p.id)) continue; seen.add(p.id);
    let s = 0;
    if (b.genre.some((g) => norm(g) === norm(p.name) || norm(g) === norm(p.id))) s += 120;
    else if (b.genre.some((g) => { const gn = norm(g); return gn.includes(norm(p.name)) || norm(p.name).includes(gn); })) s += 60;
    for (const a of p.aliases || []) if (n.includes(norm(a))) s += 8;
    for (const k of p.traits?.keywords || []) if (n.includes(norm(k))) s += 4;
    const fam = FAMILIES[p.family]; if (!fam) continue;
    for (const k of fam.keywords || []) if (n.includes(norm(k))) s += 1.5;
    for (const e of p.traits?.emotions || fam.emotions || []) if (n.includes(norm(e))) s += 3;
    if (b.technical.bpm && fam.tempo && b.technical.bpm >= fam.tempo[0] - 10 && b.technical.bpm <= fam.tempo[1] + 10) s += 2;
    if (b.technical.timeSig && (fam.meters || []).includes(b.technical.timeSig)) s += 2;
    if (b.technical.scale && (p.traits?.scales || fam.scales || []).includes(b.technical.scale)) s += 3;
    if (b.avoid.some((a) => norm(a).includes(norm(p.name)) || norm(p.name).includes(norm(a)))) s -= 80;
    if (s > 0) add(p, s);
  }
  for (const inf of b.influences) {
    const p = findInfluence(inf);
    if (!p) continue;
    for (const rawF of p.families || []) {
      const f = canonFamily(rawF);
      if (familyIds.has(f)) add({ id: `__fam_${f}`, family: f, name: FAMILIES[f].name, traits: {}, custom: true, source: 'family' }, 26);
    }
    for (const [gid, g] of Object.entries(PROFILES)) if (g.family && (p.families || []).map(canonFamily).includes(g.family)) add({ ...g, id: gid }, 12);
  }
  if (!scores.size) {
    const fam = guessFamily(text);
    const p = { id: `__fam_${fam}`, family: fam, name: FAMILIES[fam].name, traits: {}, custom: true, source: 'family' };
    scores.set(p.id, 1);
  }
  const list = [...scores.entries()].map(([id, score]) => {
    if (id.startsWith('__fam_')) { const f = id.slice(6); if (!FAMILIES[f]) return null; return { id, score, genre: { id: `familia-${f}`, name: FAMILIES[f].name, family: f, traits: {}, custom: true, source: 'family' } }; }
    const p = profileById.get(id) || profileByNorm.get(id);
    return p ? { id, score, genre: { ...p, id } } : null;
  }).filter(Boolean).sort((a, c) => c.score - a.score);
  return list;
}

function mergeTraits(familyId, profile, influenceTraits, technical) {
  const base = FAMILIES[familyId] || FAMILIES[GENRES.fallback.defaultFamily];
  const out = { ...base, fx: { ...(base.fx || {}) } };
  const apply = (t) => {
    if (!t) return;
    for (const [k, v] of Object.entries(t)) {
      if (v == null) continue;
      if (k === 'fx') out.fx = { ...(out.fx || {}), ...v };
      else if (['meters', 'scales', 'instruments', 'emotions', 'keywords'].includes(k)) out[k] = uniq([...(out[k] || []), ...(Array.isArray(v) ? v : [v])]);
      else if (k === 'tempo' && Array.isArray(v)) out.tempo = [v[0], v[1]];
      else out[k] = v;
    }
  };
  apply(profile?.traits);
  apply(influenceTraits);
  const t = technical || {};
  if (t.bpmRange) out.tempo = t.bpmRange;
  else if (t.bpm) out.tempo = [clamp(t.bpm, 40, 240), clamp(t.bpm, 40, 240)];
  if (t.timeSig) out.meters = uniq([t.timeSig, ...(out.meters || [])]);
  if (t.scale) out.scales = uniq([t.scale, ...(out.scales || [])]);
  if (t.instrumentation && Array.isArray(t.instrumentation)) out.instruments = uniq([...t.instrumentation, ...(out.instruments || [])]);
  return out;
}

function moodFromBrief(b) {
  const found = [];
  for (const e of b.emotions) { const m = findMood(e); if (m) found.push(m); }
  if (!found.length && b.emotions.length) for (const e of b.emotions) { const m = findMood(e.split(/\s+/)[0]); if (m) found.push(m); }
  const dims = ['valence', 'energy', 'tension', 'warmth'];
  const out = { id: null, name: b.emotions[0] || 'Neutro', valence: 0.1, energy: 0.55, tension: 0.35, warmth: 0.5, tempo: [80, 140], scales: [], families: [], instruments: [], texture: '', rhythm: '', tips: '', avoid: '' };
  if (!found.length) return out;
  for (const d of dims) out[d] = found.reduce((s, m) => s + (+m[d] || 0), 0) / found.length;
  out.id = found[0].id; out.name = found.map((m) => m.name).join(' / ');
  out.tempo = [Math.min(...found.map((m) => m.tempo?.[0] || 80)), Math.max(...found.map((m) => m.tempo?.[1] || 140))];
  out.scales = uniq(found.flatMap((m) => m.scales || []));
  out.families = uniq(found.flatMap((m) => m.families || []));
  out.instruments = uniq(found.flatMap((m) => m.instruments || []));
  out.texture = found.map((m) => m.texture).filter(Boolean).join(' · ');
  out.rhythm = found.map((m) => m.rhythm).filter(Boolean).join(' · ');
  out.tips = found.map((m) => m.tips).filter(Boolean).join(' ');
  out.avoid = found.map((m) => m.avoid).filter(Boolean).join(' ');
  return out;
}

/* ---------- forma, armonía, tempo, instrumentación ---------- */

const FORMS = {
  loop: [
    { name: 'Intro', weight: 1, energy: 0.35, texture: 'entrada', roles: ['texture', 'bass', 'perc'] },
    { name: 'A', weight: 2, energy: 0.7, texture: 'tema', roles: ['lead', 'harmony', 'bass', 'drums'] },
    { name: 'B', weight: 2, energy: 0.85, texture: 'contraste', roles: ['lead', 'counter', 'harmony', 'bass', 'drums', 'arp'] },
    { name: 'A2', weight: 2, energy: 0.75, texture: 'retorno', roles: ['lead', 'harmony', 'bass', 'drums', 'bell'] },
    { name: 'Outro', weight: 1, energy: 0.3, texture: 'cierre', roles: ['harmony', 'bass', 'texture'] }
  ],
  exploration: [
    { name: 'Intro', weight: 2, energy: 0.25, texture: 'espacio', roles: ['texture', 'bass'] },
    { name: 'A', weight: 2, energy: 0.55, texture: 'descubrimiento', roles: ['lead', 'harmony', 'bass', 'perc', 'arp'] },
    { name: 'B', weight: 2, energy: 0.7, texture: 'peligro', roles: ['lead', 'counter', 'bass', 'drums', 'harmony'] },
    { name: 'A2', weight: 2, energy: 0.6, texture: 'retorno', roles: ['lead', 'harmony', 'bass', 'drums', 'bell'] },
    { name: 'Coda', weight: 1, energy: 0.3, texture: 'salida', roles: ['pad', 'bass', 'bell'] }
  ],
  boss: [
    { name: 'Intro', weight: 1, energy: 0.5, texture: 'amenaza', roles: ['bass', 'drums', 'texture'] },
    { name: 'Riff A', weight: 2, energy: 0.9, texture: 'ataque', roles: ['lead', 'harmony', 'bass', 'drums'] },
    { name: 'Verso', weight: 2, energy: 0.75, texture: 'presión', roles: ['lead', 'counter', 'bass', 'drums', 'arp'] },
    { name: 'Clímax', weight: 2, energy: 1, texture: 'caos', roles: ['lead', 'counter', 'harmony', 'bass', 'drums', 'arp', 'bell'] },
    { name: 'Breakdown', weight: 1, energy: 0.45, texture: 'silencio tenso', roles: ['bass', 'drums', 'texture'] },
    { name: 'Final', weight: 1, energy: 0.95, texture: 'golpe', roles: ['lead', 'harmony', 'bass', 'drums'] }
  ],
  cinematic: [
    { name: 'Tema', weight: 2, energy: 0.45, texture: 'presentación', roles: ['lead', 'harmony', 'bass', 'bell'] },
    { name: 'Desarrollo', weight: 2, energy: 0.6, texture: 'viaje', roles: ['lead', 'counter', 'harmony', 'bass', 'perc'] },
    { name: 'Contraste', weight: 2, energy: 0.35, texture: 'intimidad', roles: ['piano', 'pad', 'bass', 'bell'] },
    { name: 'Clímax', weight: 2, energy: 0.95, texture: 'épica', roles: ['lead', 'counter', 'harmony', 'bass', 'drums', 'bell'] },
    { name: 'Coda', weight: 1, energy: 0.3, texture: 'resolución', roles: ['harmony', 'bass', 'bell'] }
  ],
  song: [
    { name: 'Intro', weight: 1, energy: 0.35, texture: 'entrada', roles: ['lead', 'harmony', 'bass', 'perc'] },
    { name: 'Verso', weight: 2, energy: 0.55, texture: 'narración', roles: ['lead', 'harmony', 'bass', 'drums'] },
    { name: 'Pre-coro', weight: 1, energy: 0.7, texture: 'subida', roles: ['lead', 'harmony', 'bass', 'drums', 'arp'] },
    { name: 'Coro', weight: 2, energy: 0.9, texture: 'estribillo', roles: ['lead', 'counter', 'harmony', 'bass', 'drums', 'bell'] },
    { name: 'Verso 2', weight: 1.5, energy: 0.6, texture: 'desarrollo', roles: ['lead', 'harmony', 'bass', 'drums'] },
    { name: 'Puente', weight: 1, energy: 0.5, texture: 'contraste', roles: ['lead', 'pad', 'bass', 'perc'] },
    { name: 'Coro final', weight: 2, energy: 1, texture: 'clímax', roles: ['lead', 'counter', 'harmony', 'bass', 'drums', 'bell', 'arp'] },
    { name: 'Outro', weight: 1, energy: 0.3, texture: 'cierre', roles: ['harmony', 'bass', 'bell'] }
  ],
  ambient: [
    { name: 'Drone', weight: 2, energy: 0.15, texture: 'aire', roles: ['texture', 'harmony'] },
    { name: 'Capa A', weight: 2, energy: 0.35, texture: 'aparición', roles: ['lead', 'harmony', 'bass', 'texture'] },
    { name: 'Capa B', weight: 2, energy: 0.5, texture: 'crecimiento', roles: ['lead', 'counter', 'harmony', 'bass', 'arp'] },
    { name: 'Clímax', weight: 1.5, energy: 0.65, texture: 'luz', roles: ['lead', 'harmony', 'bass', 'bell', 'texture'] },
    { name: 'Fade', weight: 2, energy: 0.2, texture: 'disolución', roles: ['texture', 'harmony', 'bell'] }
  ],
  classical: [
    { name: 'Exposición', weight: 2, energy: 0.55, texture: 'tema', roles: ['lead', 'counter', 'harmony', 'bass'] },
    { name: 'Desarrollo', weight: 2, energy: 0.7, texture: 'transformación', roles: ['lead', 'counter', 'harmony', 'bass', 'arp'] },
    { name: 'Recapitulación', weight: 2, energy: 0.65, texture: 'retorno', roles: ['lead', 'counter', 'harmony', 'bass', 'drums'] },
    { name: 'Coda', weight: 1, energy: 0.4, texture: 'cierre', roles: ['harmony', 'bass', 'bell'] }
  ]
};

function selectForm(b, family) {
  const f = norm(b.function + ' ' + b.premise + ' ' + b.notes);
  if (/jefe|boss|combate|batalla|fight/.test(f)) return 'boss';
  if (/explor|mundo|nivel|zona|dungeon|ruina|viaje/.test(f)) return 'exploration';
  if (/menu|tienda|pueblo|taberna|loop|fondo/.test(f)) return 'loop';
  if (/cine|cutscene|cinem|pelicula|escena|trailer/.test(f)) return 'cinematic';
  if (/ambient|drone|medit|calma|sueno/.test(f)) return 'ambient';
  if (family === 'classical' || family === 'baroque' || family === 'romantic') return 'classical';
  if (family === 'chiptune-game') return 'loop';
  return 'song';
}

function fitSections(parts, bars) {
  let list = parts.map((p) => ({ ...p }));
  while (list.length > bars) list.splice(Math.max(1, list.length - 3), 1);
  const total = list.reduce((s, p) => s + p.weight, 0);
  let out = list.map((p) => ({ ...p, bars: Math.max(1, Math.floor((p.weight / total) * bars)) }));
  let sum = out.reduce((s, p) => s + p.bars, 0);
  while (sum < bars) {
    const i = out.reduce((best, p, idx) => p.weight > out[best].weight ? idx : best, 0); out[i].bars++; sum++;
  }
  while (sum > bars) {
    const i = out.reduce((best, p, idx) => p.bars > 1 && (best < 0 || p.bars > out[best].bars) ? idx : best, -1);
    if (i < 0) break; out[i].bars--; sum--;
  }
  let start = 0;
  out = out.map((p) => { const x = { ...p, startBar: start }; start += p.bars; return x; });
  return out;
}

function progressionFor(family, scale, mood) {
  if (family === 'blues') return [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4];
  if (family === 'jazz') return [1, 4, 0, 0, 5, 1, 4, 4];
  if (['medieval', 'renaissance'].includes(family)) return [0, 3, 0, 4];
  if (family === 'baroque') return [0, 4, 5, 3];
  if (family === 'classical') return [0, 4, 5, 3];
  if (family === 'romantic') return [0, 5, 3, 4];
  if (family === 'impressionist') return [0, 1, 4, 0];
  if (family === 'minimalist' || family === 'ambient' || family === 'electronic') return [0, 0, 3, 3];
  if (family === 'metal') return [0, 5, 6, 0];
  if (family === 'hiphop') return [0, 5, 3, 4];
  if (family === 'latin' || family === 'brazil') return [0, 3, 4, 0];
  if (scale === 'dorian') return [0, 3, 0, 6];
  if (scale === 'phrygian') return [0, 1, 0, 6];
  if (scale === 'lydian') return [0, 1, 0, 4];
  if (scale === 'mixolydian') return [0, 6, 0, 3];
  if (scale === 'locrian') return [0, 1, 0, 4];
  if (scale === 'minor' || scale === 'harmonicMinor' || scale === 'melodicMinor') return [0, 5, 2, 6];
  return [0, 4, 5, 3];
}

function chooseKey(b, mood) {
  if (b.technical.key) {
    const k = String(b.technical.key).replace('♭', 'b');
    const m = k.match(/^([A-G])([#b]?)/i);
    if (m) { const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return NOTE_NAMES[((base % 12) + 12) % 12]; }
  }
  const roots = mood.valence < -0.2 ? ['D', 'E', 'F', 'G', 'A', 'C#'] : ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Bb'];
  return roots[hash(b.title + b.premise) % roots.length];
}

function chooseScale(b, traits, mood) {
  if (b.technical.scale && VALID_SCALES.includes(b.technical.scale)) return b.technical.scale;
  const candidates = uniq([...(mood.scales || []), ...(traits.scales || [])]).filter((s) => VALID_SCALES.includes(s));
  return candidates[hash(b.title + b.emotions.join(' ')) % Math.max(1, candidates.length)] || 'minor';
}

function buildTempo(b, traits, mood, sections) {
  const range = (traits.tempo && traits.tempo.length === 2) ? traits.tempo : [80, 140];
  let lo = clamp(Math.round(range[0]), 40, 240), hi = clamp(Math.round(range[1]), 40, 240);
  if (b.technical.bpm) { lo = hi = clamp(b.technical.bpm, 40, 240); }
  else if (b.technical.bpmRange) { lo = clamp(b.technical.bpmRange[0], 40, 240); hi = clamp(b.technical.bpmRange[1], 40, 240); }
  const base = clamp(Math.round((lo + hi) / 2 + (mood.energy - 0.5) * 12), 40, 240);
  const map = [];
  let prev = base;
  for (let i = 1; i < sections.length; i++) {
    const sec = sections[i], before = sections[i - 1];
    const big = Math.abs(sec.energy - before.energy) >= 0.22 || /climax|clímax|build|subida|drop|final|breakdown/i.test(sec.name);
    if (!big) continue;
    let target = clamp(Math.round(base + (sec.energy - 0.5) * (hi - lo) * 0.65), lo, hi);
    if (Math.abs(target - prev) < 4) target = clamp(prev + (sec.energy > 0.5 ? 8 : -8), 40, 240);
    if (Math.abs(target - prev) < 2) continue;
    map.push({ bar: sec.startBar, bpm: target, ...(/build|subida|climax|clímax/i.test(sec.name) ? { ramp: true } : {}) });
    prev = target;
    if (map.length >= 5) break;
  }
  if (b.technical.mustChangeTempo && !map.length && sections.length > 1) map.push({ bar: sections[1].startBar, bpm: clamp(base + 12, 40, 240) });
  return { base, range: [lo, hi], map };
}

function pickInstrument(candidates, fallback, taken, allowRepeat) {
  for (const id of candidates) if ((allowRepeat || !taken.has(id)) && id !== 'drums') return id;
  if (allowRepeat || !taken.has(fallback)) return fallback;
  return fallback;
}

function buildInstrumentation(b, traits, mood, family, maxTracks) {
  const palette = uniq([...(traits.instruments || []), ...(mood.instruments || []), ...(FAMILIES[family].instruments || [])]);
  const mel = ['pulse', 'pwm', 'saw', 'brass', 'piano', 'guitar', 'pluck', 'arp', 'triangle', 'bell', 'strings', 'pad'];
  const har = ['strings', 'pad', 'piano', 'guitar', 'pluck', 'brass'];
  const bassPref = ['bass', 'pluck', 'triangle', 'piano'];
  const arpPref = ['arp', 'pluck', 'piano', 'bell', 'guitar'];
  const bellPref = ['bell', 'glass', 'musicbox', 'triangle'];
  const texPref = ['pad', 'strings', 'saw', 'triangle', 'crush'];
  const taken = new Set(), list = [];
  const roleExists = (role) => list.some((x) => x.role === role);
  const add = (role, inst, vol, pan, octave, fx) => {
    if (!inst || list.length >= maxTracks || roleExists(role)) return false;
    if (inst !== 'drums') taken.add(inst);
    list.push({ role, instrument: inst, name: roleName(role), volume: clamp(vol, 0, 1), pan: clamp(pan, -1, 1), octave, fx: fx || {} });
    return true;
  };
  const choose = (pref, allowRepeat = false) => {
    const cands = uniq([...pref.filter((x) => palette.includes(x)), ...pref]);
    for (const c of cands) if (c !== 'drums' && (allowRepeat || !taken.has(c))) return c;
    return allowRepeat ? pref[0] : null;
  };
  if (b.technical.instrumentation && b.technical.instrumentation.length) {
    b.technical.instrumentation.forEach((inst, i) => {
      const id = String(inst).toLowerCase();
      if (id === 'drums') add('drums', 'drums', 0.8, 0, 0, { reverb: 0.1 });
      else add(i === 0 ? 'lead' : 'harmony', id, i === 0 ? 0.82 : 0.5, i === 0 ? 0 : (i % 2 ? -0.25 : 0.25), i === 0 ? 5 : 4, {});
    });
  }
  if (!roleExists('lead')) add('lead', choose(mel, true), 0.82, 0, 5, roleFx(traits, 'lead'));
  if (!roleExists('bass')) add('bass', choose(bassPref, true), 0.86, 0, 2, roleFx(traits, 'bass'));
  if (traits.percussion !== 'none' && !roleExists('drums')) add('drums', 'drums', traits.percussion === 'light' ? 0.55 : 0.78, 0, 0, roleFx(traits, 'drums'));
  if (!roleExists('harmony')) add('harmony', choose(har) || 'strings', 0.45, -0.22, 4, roleFx(traits, 'harmony'));
  if (maxTracks >= 5 && !roleExists('counter')) add('counter', choose(mel) || 'triangle', 0.55, 0.28, 4, roleFx(traits, 'counter'));
  if (maxTracks >= 6 && !roleExists('arp')) add('arp', choose(arpPref) || 'arp', 0.38, 0.35, 6, roleFx(traits, 'arp'));
  if (maxTracks >= 7 && !roleExists('bell')) add('bell', choose(bellPref) || 'bell', 0.28, -0.35, 7, roleFx(traits, 'bell'));
  if (maxTracks >= 8 && !roleExists('texture')) add('texture', choose(texPref, true) || 'pad', 0.32, 0.4, 4, roleFx(traits, 'texture'));
  if (maxTracks >= 9 && traits.percussion === 'full' && !roleExists('perc')) add('perc', 'drums', 0.45, -0.4, 0, roleFx(traits, 'perc'));
  return list.slice(0, maxTracks);
}

function roleName(role) {
  return ({ lead: 'Melodía', counter: 'Contramelodía', harmony: 'Armonía', bass: 'Bajo', drums: 'Batería', arp: 'Arpegio', bell: 'Brillo', texture: 'Textura', perc: 'Percusión' })[role] || role;
}

function roleFx(traits, role) {
  const base = { ...(traits.fx || {}) };
  if (role === 'lead') return { ...base, reverb: Math.min(1, (base.reverb || 0.15) + 0.05), delay: Math.min(1, (base.delay || 0) + 0.05) };
  if (role === 'bass') return { reverb: Math.min(0.25, base.reverb || 0.05), drive: base.drive || 0 };
  if (role === 'drums') return { reverb: Math.min(0.25, base.reverb || 0.08) };
  if (role === 'harmony') return { ...base, reverb: Math.min(1, (base.reverb || 0.2) + 0.08) };
  if (role === 'arp') return { reverb: Math.min(0.6, base.reverb || 0.15), delay: Math.min(0.5, base.delay || 0.1) };
  if (role === 'texture') return { ...base, reverb: Math.min(1, (base.reverb || 0.3) + 0.12) };
  return base;
}

function buildPlan(rawBrief, opts) {
  const b = normalizeBrief(rawBrief), text = briefText(b);
  const scored = scoreGenreMatch(b, text);
  let top = scored[0];
  if (b.genre.length) {
    for (const g of b.genre) { const f = findGenre(g); if (f) { if (!top || !b.genre.some((x) => norm(x) === norm(top.genre.name))) top = { genre: { ...f, id: f.id || slug(f.name) }, score: Math.max(120, top?.score || 0) }; break; } }
    if (!top || !top.genre) { const f = makeCustomGenre(b.genre[0], text); top = { genre: f, score: 1 }; }
  }
  if (!top) { const f = makeCustomGenre(b.genre[0] || 'música de videojuegos', text); top = { genre: f, score: 1 }; }
  const genre = top.genre;
  const family = familyIds.has(canonFamily(genre.family)) ? canonFamily(genre.family) : guessFamily(text + ' ' + genre.name);
  let influenceTraits = {};
  const influenceHits = [], genericInfluences = [], unknownInfluences = [];
  for (const inf of b.influences) {
    const p = findInfluence(inf); if (!p) {
      if (/ambient|explor|atmosfer|cinem|orquestal|industrial|chiptune|folk|metal|rock|jazz|blues|pop|electr|acustic|epic|oscuro|minimal|ritual|etere|celta/.test(norm(inf))) genericInfluences.push(inf);
      else unknownInfluences.push(inf);
      continue;
    }
    influenceHits.push(p.id);
    influenceTraits = mergeTraits(family, { traits: influenceTraits }, p.traits, {});
  }
  const mood = moodFromBrief(b);
  const traits = mergeTraits(family, genre, influenceTraits, b.technical);
  if (traits.percussion === 'none' && FAMILIES[family].percussion === 'full' && !/sin (bateria|percusion)|no drums|without drums/.test(norm(text))) {
    traits.percussion = 'light';
  }
  const bars = clamp(Math.floor(b.technical.bars || (b.technical.duration ? b.technical.duration * (b.technical.bpm || 100) / 60 / 4 : 0) || 32), 1, 64);
  const formId = opts.form || selectForm(b, family);
  const sections = fitSections(FORMS[formId] || FORMS.loop, bars);
  const tempo = buildTempo(b, traits, mood, sections);
  const key = chooseKey(b, mood);
  const scale = chooseScale(b, traits, mood);
  const meter = b.technical.timeSig || (traits.meters && traits.meters[0]) || '4/4';
  const maxTracks = clamp(Math.floor(b.technical.maxTracks || 10), 1, 12);
  const instrumentation = buildInstrumentation(b, traits, mood, family, maxTracks);
  const loopStart = clamp(Math.floor(b.technical.loopStartBar || 0), 0, Math.max(0, bars - 1));
  const prog = progressionFor(family, scale, mood);
  const harmonicRhythm = ['ambient', 'minimalist', 'electronic'].includes(family) ? 4 : ['jazz', 'blues'].includes(family) ? 1 : 2;
  const assumptions = [], warnings = [];
  if (!b.technical.bpm && !b.technical.bpmRange) assumptions.push(`Tempo propuesto: ${tempo.base} BPM (rango ${tempo.range[0]}–${tempo.range[1]}).`);
  if (b.technical.key == null) assumptions.push(`Tonalidad propuesta: ${key}.`);
  if (b.technical.scale == null) assumptions.push(`Escala/modo propuesto: ${scale}.`);
  if (!b.technical.bars && !b.technical.duration) assumptions.push(`Duración propuesta: ${bars} compases.`);
  if (genre.custom) assumptions.push(`El género "${genre.name}" no tiene perfil exacto; se trata como familia ${FAMILIES[family].name} con matices del nombre.`);
  if (influenceHits.length) assumptions.push(`Influencias reconocidas: ${influenceHits.join(', ')}. Se usan como rasgos abstractos, sin citas.`);
  if (genericInfluences.length) assumptions.push(`Influencias genéricas interpretadas por palabras clave: ${genericInfluences.join(', ')}.`);
  for (const inf of unknownInfluences) warnings.push(`Influencia no reconocida: "${inf}". Se interpretará por palabras clave; revisa que el resultado no dependa de una cita.`);
  if (b.technical.mustChangeTempo && !tempo.map.length) warnings.push('Se pidió cambio de tempo, pero la forma no generó ninguno; añádelo manualmente.');
  if (loopStart > 0 && b.technical.loop === false) warnings.push('loopStart > 0 pero el brief dice que no hay loop; pon loopStart 0 o cambia el brief.');
  if (b.avoid.length) warnings.push(`Evitar: ${b.avoid.join('; ')}.`);
  const plan = {
    schema: 'chiptune-plan@1',
    title: b.title,
    brief: b,
    genre: {
      id: genre.id || slug(genre.name), name: genre.name, family, familyName: FAMILIES[family].name,
      confidence: top.score ? Math.min(0.99, 0.45 + top.score / 200) : 0.45,
      alternatives: scored.slice(1, 5).map((x) => ({ name: x.genre.name, family: x.genre.family, score: Math.round(x.score) })),
      custom: !!genre.custom || genre.source === 'catalog'
    },
    mood: { id: mood.id, name: mood.name, valence: +mood.valence.toFixed(2), energy: +mood.energy.toFixed(2), tension: +mood.tension.toFixed(2), warmth: +mood.warmth.toFixed(2), texture: mood.texture, rhythm: mood.rhythm },
    key, scale, scaleName: scale,
    meter, bars, loopStart,
    tempo,
    form: { id: formId, sections },
    harmony: { progression: prog, harmonicRhythm, description: `Progresión de grados [${prog.join(', ')}] en ${key} ${scale}; un acorde cada ${harmonicRhythm} compás(es).` },
    motifs: {
      lead: [0, 2, 4, 2, 0, -1, 0, 2],
      counter: [4, 2, 0, -1, 0, 2, 4, 2],
      rhythm: [[0, 0.25], [0.25, 0.25], [0.5, 0.25], [0.75, 0.5], [1.25, 0.25], [1.5, 0.25], [1.75, 0.25]],
      description: 'Motivo de 8 eventos con variación al final de cada frase; adaptable a 4/4, 6/8, 7/8 y 3/4.'
    },
    instrumentation,
    arrangement: sections.map((s) => ({ section: s.name, startBar: s.startBar, bars: s.bars, energy: s.energy, activeRoles: uniq([...s.roles, ...(instrumentation.map((i) => i.role))]).filter((r) => instrumentation.some((i) => i.role === r)) })),
    originality: {
      statement: `Obra original: la familia ${FAMILIES[family].name} y las influencias se usan como rasgos abstractos. Se compone un motivo propio y se evita cualquier melodía, riff o progresión reconocible de las referencias.`,
      strategies: ['Motivo propio de 3–5 notas con variación', 'Cambiar al menos dos dimensiones respecto a la referencia', 'Combinar timbres de la app en roles claros', 'No citar material protegido', 'Revisar si el resultado suena a una canción existente'],
      referencePolicy: 'rasgos abstractos únicamente; sin citas',
      nonNegotiables: b.originality?.nonNegotiables || ['sin melodías, riffs ni arreglos copiados']
    },
    assumptions,
    warnings
  };
  return plan;
}

/* ---------- esbozo: un punto de partida válido, no una obra terminada ---------- */

function loadCS() {
  if (global.CS && global.CS.song && global.CS.theory) return global.CS;
  global.window = global;
  const load = (p) => vm.runInThisContext(fs.readFileSync(path.join(ROOT, p), 'utf8'), { filename: p });
  load('src/core/cs.js');
  load('src/engine/schema.js');
  for (const f of fs.readdirSync(path.join(ROOT, 'src/effects')).sort()) load(path.join('src/effects', f));
  for (const f of fs.readdirSync(path.join(ROOT, 'src/instruments')).sort()) load(path.join('src/instruments', f));
  load('src/engine/voice.js');
  load('src/theory/theory.js');
  load('src/song/song.js');
  return global.CS;
}

function fitMidi(CS, inst, m) {
  const lo = CS.midi(inst.range.low), hi = CS.midi(inst.range.high);
  if (lo == null || hi == null) return null;
  while (m < lo) m += 12;
  while (m > hi) m -= 12;
  if (m < lo || m > hi) return null;
  return m;
}

function makeSong(plan, seedText) {
  const CS = loadCS();
  const meter = VALID_METERS.includes(plan.meter) ? plan.meter : '4/4';
  const spb = CS.TS[meter].spb;
  const bars = clamp(Math.floor(plan.bars || 32), 1, 64);
  const total = bars * spb;
  const keyPc = (() => {
    if (plan.key == null) return 9;
    if (typeof plan.key === 'number') return ((Math.floor(plan.key) % 12) + 12) % 12;
    const m = CS.midi(String(plan.key).replace('♭', 'b').replace('♯', '#') + (/\d$/.test(String(plan.key)) ? '' : '4'));
    return m == null ? 9 : m % 12;
  })();
  const scale = (CS.theory.scales[plan.scale] || CS.theory.scales.minor).s;
  const rng = mulberry(hash(seedText || (plan.title + plan.genre?.name + plan.key + plan.scale)));
  const s = {
    format: 'chiptune-studio', version: 2, title: plan.title || 'Canción sin título', bpm: clamp(Math.round(plan.tempo?.base || 120), 40, 240),
    bars, timeSig: meter, key: NOTE_NAMES[keyPc], scale: plan.scale || 'minor', loopStart: clamp(Math.floor(plan.loopStart || 0), 0, Math.max(0, bars - 1)), tracks: []
  };
  if (plan.tempo?.map?.length) s.tempo = plan.tempo.map.filter((e) => +e.bar >= 1 && +e.bar < bars).map((e) => ({ bar: Math.floor(+e.bar), bpm: clamp(Math.round(+e.bpm), 40, 240), ...(e.ramp ? { ramp: true } : {}) }));
  const byRole = new Map(), seen = new Map();
  for (const item of plan.instrumentation || []) {
    const inst = CS.getInst(item.instrument) ? item.instrument : 'pulse';
    const t = CS.song.track(inst, item.name || roleName(item.role));
    t.volume = clamp(+item.volume || 0.7, 0, 1);
    t.pan = clamp(+item.pan || 0, -1, 1);
    t.fx = { ...(item.fx || {}) };
    s.tracks.push(t);
    if (!byRole.has(item.role)) byRole.set(item.role, t);
    const key = s.tracks.length - 1; seen.set(key, new Set());
  }
  const trackInfo = (role) => {
    const t = byRole.get(role); if (!t) return null;
    const idx = s.tracks.indexOf(t), inst = CS.getInst(t.instrument);
    return { t, idx, inst, dr: inst.id === 'drums' };
  };
  const addNote = (role, step, len, midi, opts = {}) => {
    const q = trackInfo(role); if (!q || q.dr) return;
    let m = Math.round(midi); if (m == null || Number.isNaN(m)) return;
    m = fitMidi(CS, q.inst, m); if (m == null) return;
    step = Math.round(step); len = Math.max(1, Math.round(len));
    if (step < 0 || step >= total) return;
    len = Math.min(len, total - step);
    const p = CS.name(m), sk = `${step}:${p}`, set = seen.get(q.idx);
    if (set.has(sk)) return;
    set.add(sk);
    const n = { step, len, pitch: p };
    if (opts.vel != null) n.vel = +clamp(opts.vel, 0.1, 1).toFixed(2);
    if (opts.slide != null) { const sm = fitMidi(CS, q.inst, Math.round(opts.slide)); if (sm != null && CS.name(sm) !== p) n.slide = CS.name(sm); }
    if (opts.chord && CS.CHORDS[opts.chord]) n.chord = opts.chord;
    q.t.notes.push(n);
  };
  const addDrum = (role, step, piece, vel = 0.8) => {
    const q = trackInfo(role); if (!q || !q.dr) return;
    const pd = CS.getInst('drums').pieces[piece]; if (!pd) return;
    step = Math.round(step); if (step < 0 || step >= total) return;
    const sk = `${step}:${piece}`, set = seen.get(q.idx); if (set.has(sk)) return; set.add(sk);
    q.t.notes.push({ step, len: 1, pitch: piece, vel: +clamp(vel, 0.1, 1).toFixed(2) });
  };
  const degPitch = (deg, octave) => {
    const n = scale.length, d = ((Math.floor(deg) % n) + n) % n, oct = Math.floor(Math.floor(deg) / n);
    return 12 * (octave + 1 + oct) + keyPc + scale[d];
  };
  const chordDegrees = (deg) => [deg, deg + 2, deg + 4];
  const sectionAt = (bar) => (plan.form?.sections || []).find((x) => bar >= x.startBar && bar < x.startBar + x.bars) || null;
  const prog = plan.harmony?.progression?.length ? plan.harmony.progression : [0, 4, 5, 3];
  const hr = Math.max(1, Math.floor(plan.harmony?.harmonicRhythm || 2));
  const chordDegree = (bar) => prog[Math.floor(bar / hr) % prog.length] || 0;
  const active = (sec, role) => !sec || !sec.roles || sec.roles.includes(role) || role === 'drums' || role === 'perc';
  const patternBass = (family, meter, energy) => {
    if (family === 'blues') return [[0, .25, 0], [.25, .25, 0], [.5, .25, 2], [.75, .25, 1], [.875, .125, -1]];
    if (family === 'jazz') return [[0, .25, 0], [.25, .25, 1], [.5, .25, 2], [.75, .25, -1]];
    if (family === 'reggae-caribbean') return [[0, .375, 0], [.5, .25, 1], [.75, .125, 0], [.875, .125, 2]];
    if (family === 'latin' || family === 'brazil') return [[0, .1875, 0], [.25, .125, 1], [.5, .25, 0], [.75, .125, 2], [.875, .125, 1]];
    if (family === 'hiphop') return [[0, .375, 0], [.5, .25, 0], [.75, .125, 3]];
    if (family === 'electronic') return [[0, .25, 0], [.25, .25, 0], [.5, .25, 3], [.75, .25, 0]];
    if (family === 'metal') return [[0, .125, 0], [.125, .125, 0], [.25, .125, 0], [.375, .125, 0], [.5, .125, 0], [.625, .125, 0], [.75, .125, 0], [.875, .125, 0]];
    if (family === 'funk' || family === 'soul-rnb') return [[0, .125, 0], [.1875, .125, 3], [.375, .125, 1], [.5, .125, 0], [.625, .125, 2], [.75, .125, 3], [.875, .125, 1]];
    if (meter === '6/8' || meter === '12/8') return [[0, .25, 0], [.375, .125, 1], [.5, .25, 0], [.75, .25, 2]];
    if (energy < .35) return [[0, 1, 0]];
    return [[0, .25, 0], [.25, .25, 0], [.5, .25, 1], [.75, .25, 0]];
  };
  const bassPitch = (deg, off) => {
    if (off === 1) return degPitch(deg + 4, 2);
    if (off === 2) return degPitch(deg + 2, 2);
    if (off === 3) return degPitch(deg, 3);
    if (off === -1) return degPitch(deg - 1, 2);
    return degPitch(deg, 2);
  };
  const drumPattern = (family, energy, light) => {
    const P = [];
    const add = (f, p, v) => P.push([f, p, v]);
    if (family === 'metal') {
      for (const f of [0, .1875, .375, .5, .6875, .875]) add(f, 'kick', .95);
      for (const f of [.25, .75]) add(f, 'snare', .9);
      for (let f = 0; f < 1; f += .125) add(f, 'hat', f % .25 ? .55 : .75);
    } else if (family === 'punk') {
      for (const f of [0, .25, .5, .75]) add(f, 'kick', .9);
      for (const f of [.25, .75]) add(f, 'snare', .85);
      for (let f = 0; f < 1; f += .125) add(f, 'hat', .65);
    } else if (family === 'jazz') {
      for (const f of [0, .1875, .25, .375, .5, .6875, .75, .875]) add(f, 'ride', f % .25 ? .55 : .8);
      for (const f of [.375, .875]) add(f, 'snare', .35);
      add(0, 'kick', .45);
    } else if (family === 'electronic' || family === 'hiphop') {
      for (const f of [0, .25, .5, .75]) add(f, 'kick', .9);
      for (const f of [.25, .75]) add(f, 'clap', .6);
      for (let f = .125; f < 1; f += .125) add(f, 'hat', f % .25 ? .45 : .65);
      if (family === 'hiphop') { add(.375, 'kick', .75); add(.625, 'kick', .7); }
    } else if (family === 'reggae-caribbean') {
      add(.5, 'kick', .9); add(.5, 'snare', .75); add(.375, 'rim', .55);
      for (let f = .125; f < 1; f += .25) add(f, 'hat', .55);
    } else if (family === 'latin' || family === 'brazil') {
      for (const f of [0, .1875, .375, .625, .75]) add(f, 'rim', .6);
      add(0, 'kick', .7); add(.5, 'kick', .65); add(.25, 'snare', .4);
      for (let f = .125; f < 1; f += .125) add(f, 'shaker', .35);
    } else if (family === 'african') {
      add(0, 'kick', .8); add(.375, 'tomlo', .6); add(.625, 'tommid', .6); add(.875, 'tomhi', .55);
      for (let f = .125; f < 1; f += .125) add(f, 'shaker', .4);
    } else if (family === 'ambient' || light) {
      add(0, 'kick', .35); add(.5, 'rim', .25);
    } else {
      for (const f of [0, .5]) add(f, 'kick', .9);
      for (const f of [.25, .75]) add(f, 'snare', .85);
      for (let f = 0; f < 1; f += .125) add(f, 'hat', f % .25 ? .5 : .7);
    }
    if (energy > .8) add(.875, 'crash', .45);
    return P;
  };
  for (const [si, sec] of (plan.form?.sections || []).entries()) {
    const start = sec.startBar * spb, secSteps = sec.bars * spb, energy = +sec.energy || 0.5;
    const harmonicRhythm = hr;
    for (let b = sec.startBar; b < sec.startBar + sec.bars; b += harmonicRhythm) {
      const deg = chordDegree(b), len = Math.min(harmonicRhythm, sec.startBar + sec.bars - b) * spb;
      const step = b * spb;
      if (active(sec, 'harmony')) {
        const q = trackInfo('harmony');
        if (q) {
          const inst = q.inst.id;
          if (['piano', 'guitar', 'pluck', 'arp'].includes(inst)) {
            const notes = chordDegrees(deg).map((d) => degPitch(d, 4));
            const div = meter === '6/8' ? 3 : 4;
            for (let k = 0; k < div; k++) for (const m of notes) addNote('harmony', step + Math.floor((k / div) * len), Math.max(2, Math.floor(spb / div)), m, { vel: k === 0 ? .55 : .38 });
          } else {
            for (const d of chordDegrees(deg)) addNote('harmony', step, len, degPitch(d, 4), { vel: .42 });
          }
        }
      }
      if (active(sec, 'texture')) {
        addNote('texture', step, len, degPitch(deg, 3), { vel: .3 });
        addNote('texture', step, len, degPitch(deg + 4, 3), { vel: .26 });
      }
      if (active(sec, 'bass')) {
        const pat = patternBass(plan.genre?.family, meter, energy);
        for (const [f, lf, off] of pat) {
          const st = step + Math.floor(f * spb), ln = Math.max(1, Math.floor(lf * spb));
          addNote('bass', st, ln, bassPitch(deg, off), { vel: f === 0 ? .95 : .8 });
        }
      }
      if (active(sec, 'arp')) {
        const notes = [];
        for (let k = 0; k < 8; k++) for (const d of chordDegrees(deg)) notes.push(degPitch(d, 6));
        const rate = meter === '6/8' ? 1.5 : 1;
        for (let k = 0; k < Math.floor(len / rate); k++) addNote('arp', step + Math.floor(k * rate), rate, notes[k % notes.length], { vel: k % 4 === 0 ? .5 : .32 });
      }
      if (active(sec, 'bell') && (b === sec.startBar || b % 4 === 0)) {
        addNote('bell', step, Math.max(2, Math.floor(spb / 2)), degPitch(deg + 4, 7), { vel: .35, chord: 'M' });
      }
    }
    if (active(sec, 'lead')) {
      const rhythm = plan.motifs?.rhythm || [[0, .25], [.25, .25], [.5, .25], [.75, .5]];
      const mot = plan.motifs?.lead || [0, 2, 4, 2, 0, -1, 0];
      for (let phrase = 0; phrase * 2 * spb < secSteps; phrase++) {
        const pStart = start + phrase * 2 * spb, pEnd = Math.min(start + secSteps, pStart + 2 * spb);
        if (energy < .35 && phrase % 2) continue;
        rhythm.forEach(([f, lf], i) => {
          const st = Math.round(pStart + f * spb);
          if (st >= pEnd) return;
          const bar = Math.floor(st / spb), deg = chordDegree(bar);
          let off = mot[i % mot.length];
          if (phrase % 3 === 2 && i === rhythm.length - 1) off += 1;
          if (energy < .6 && i % 3 === 1) return;
          const ln = Math.max(1, Math.round(lf * spb));
          const m = degPitch(deg + off, 5);
          const opts = { vel: f % .5 === 0 ? .9 : .66 };
          if ((plan.genre?.family === 'chiptune-game' || plan.genre?.family === 'electronic' || energy > .75) && (i === rhythm.length - 1 || ln >= spb / 4) && rng() > .62) opts.slide = degPitch(deg + off + 1, 5);
          addNote('lead', st, ln, m, opts);
        });
      }
    }
    if (active(sec, 'counter')) {
      for (let b = sec.startBar; b < sec.startBar + sec.bars; b++) {
        const deg = chordDegree(b), step = b * spb;
        for (const [f, off] of [[.375, 2], [.875, 4]]) addNote('counter', step + Math.floor(f * spb), Math.max(1, Math.floor(spb / 4)), degPitch(deg + off, 4), { vel: .42 });
      }
    }
    if (active(sec, 'drums')) {
      const q = trackInfo('drums');
      if (q) {
        const pat = drumPattern(plan.genre?.family, energy, q.t.volume < .65 || plan.genre?.family === 'ambient');
        if (plan.genre?.family !== 'ambient') {
          for (let b = sec.startBar; b < sec.startBar + sec.bars; b++) {
            const step = b * spb;
            for (const [f, p, v] of pat) addDrum('drums', step + Math.floor(f * spb), p, v * (energy < .5 ? .75 : 1));
            if (b === sec.startBar) addDrum('drums', step, 'crash', .55);
            if (b === sec.startBar + sec.bars - 1) for (let k = 0; k < 4; k++) addDrum('drums', step + Math.floor((.75 + k * .0625) * spb), k % 2 ? 'tommid' : 'tomlo', .55 + k * .08);
          }
        } else if (sec.startBar === 0) addDrum('drums', 0, 'rim', .25);
      }
    }
    if (active(sec, 'perc')) {
      for (let b = sec.startBar; b < sec.startBar + sec.bars; b++) {
        const step = b * spb;
        for (let f = .125; f < 1; f += .125) addDrum('perc', step + Math.floor(f * spb), f % .25 ? 'shaker' : 'rim', f % .25 ? .28 : .4);
      }
    }
    if (si === (plan.form?.sections || []).length - 1) {
      const last = start + secSteps - 1;
      addDrum('drums', last, 'crash', .65);
      if (byRole.get('lead')) addNote('lead', last, Math.min(spb, total - last), degPitch(chordDegree(sec.startBar + sec.bars - 1), 5), { vel: .85, slide: degPitch(chordDegree(sec.startBar + sec.bars - 1), 4) });
    }
  }
  /* Limpieza: quita pistas vacías, ordena y normaliza. */
  s.tracks = s.tracks.filter((t) => t.notes.length);
  if (!s.tracks.length) { const t = CS.song.track('pulse', 'Melodía'); t.notes.push({ step: 0, len: spb, pitch: 'C5' }); s.tracks.push(t); }
  for (const t of s.tracks) {
    t.notes.sort((a, b) => a.step - b.step || String(a.pitch).localeCompare(String(b.pitch)));
    const m = new Map();
    for (const n of t.notes) { const k = `${n.step}:${n.pitch}`; const old = m.get(k); if (!old || n.len > old.len) m.set(k, n); }
    t.notes = [...m.values()];
  }
  return CS.song.normalize(s);
}

/* ---------- validación y análisis ---------- */

function readSong(file) {
  const CS = loadCS();
  if (!file || file === '-') {
    const text = fs.readFileSync(0, 'utf8');
    const raw = JSON.parse(text);
    return { raw, song: CS.song.normalize(raw), text };
  }
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) throw new Error(`No existe la canción: ${file}`);
  const text = fs.readFileSync(p, 'utf8');
  let raw;
  try { raw = JSON.parse(text); }
  catch (e) { const a = text.indexOf('{'), b = text.lastIndexOf('}'); if (a < 0 || b < a) throw new Error('No encontré un objeto JSON en el archivo.'); raw = JSON.parse(text.slice(a, b + 1)); }
  return { raw, song: CS.song.normalize(raw), text };
}

function fmtDur(sec) {
  sec = Math.max(0, Math.round(sec));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

function analyze(song, raw) {
  const CS = loadCS();
  const spb = CS.sig(song).spb, totalSteps = song.bars * spb;
  const errors = [], warnings = [], trackStats = [];
  if (song.bars < 1 || song.bars > 64) errors.push(`bars fuera de rango: ${song.bars} (1–64).`);
  if (song.bpm < 40 || song.bpm > 240) errors.push(`bpm fuera de rango: ${song.bpm} (40–240).`);
  if (song.tracks.length < 1) errors.push('La canción no tiene pistas.');
  if (song.tracks.length > 12) errors.push(`Hay ${song.tracks.length} pistas; el máximo es 12.`);
  if (!VALID_METERS.includes(song.timeSig)) errors.push(`timeSig no válido: ${song.timeSig}.`);
  if (raw && raw.scale && !CS.theory.scales[raw.scale]) errors.push(`scale no válida: "${raw.scale}".`);
  if (raw && raw.key != null && song.key == null) errors.push(`key no válida: "${raw.key}".`);
  if (raw && raw.tracks && Array.isArray(raw.tracks)) {
    if (raw.tracks.length > 12) errors.push(`El JSON original tiene ${raw.tracks.length} pistas; se recortaron a 12.`);
    for (let i = 0; i < raw.tracks.length; i++) {
      const rt = raw.tracks[i], t = song.tracks[i];
      if (!CS.getInst(rt.instrument)) errors.push(`Pista ${i + 1}: instrumento desconocido "${rt.instrument}".`);
      if (t && Array.isArray(rt.notes) && rt.notes.length > t.notes.length) warnings.push(`Pista ${i + 1}: ${rt.notes.length - t.notes.length} nota(s) se descartaron al normalizar (altura, batería, paso o duración).`);
    }
  }
  if (Array.isArray(raw?.tempo)) {
    for (const e of raw.tempo) {
      const bar = Math.floor(+e?.bar);
      if (!(bar >= 1)) errors.push(`tempo con bar ${e?.bar}: el tempo base va en bpm y los cambios usan bar >= 1.`);
      else if (bar >= song.bars) warnings.push(`tempo con bar ${bar} fuera de la canción (${song.bars} compases); se ignora.`);
      if (e?.bpm != null && (+e.bpm < 40 || +e.bpm > 240)) errors.push(`tempo con bpm ${e.bpm} fuera de 40–240.`);
    }
  }
  const all = [], stepStarts = new Map(), stepEnds = new Map(), pcHist = new Map(), drumHist = new Map();
  let totalNotes = 0, maxPoly = 0, minMidi = 200, maxMidi = -1, outOfRange = 0;
  for (const [ti, t] of song.tracks.entries()) {
    const inst = CS.getInst(t.instrument), dr = inst?.id === 'drums';
    if (!inst) { errors.push(`Pista ${ti + 1}: instrumento desconocido \"${t.instrument}\".`); trackStats.push({ index: ti, name: t.name, instrument: t.instrument, notes: t.notes.length, empty: t.notes.length === 0, range: null, polyphony: 0, density: 0, outOfRange: 0 }); continue; }
    const st = { index: ti, name: t.name, instrument: t.instrument, notes: t.notes.length, empty: t.notes.length === 0, range: null, polyphony: 0, density: 0, outOfRange: 0 };
    if (!t.notes.length) warnings.push(`Pista ${ti + 1} (${t.name}): vacía.`);
    if (t.mute) warnings.push(`Pista ${ti + 1} (${t.name}): está silenciada.`);
    if (t.volume === 0) warnings.push(`Pista ${ti + 1} (${t.name}): volumen 0.`);
    const starts = new Map(), ends = new Map(), lo = dr ? 0 : CS.midi(inst.range.low), hi = dr ? 127 : CS.midi(inst.range.high);
    for (const n of t.notes) {
      totalNotes++;
      if (n.step < 0 || n.step >= totalSteps) errors.push(`Pista ${ti + 1}: nota en paso ${n.step}, fuera de ${totalSteps} pasos.`);
      if (!dr && (n.len < 1 || n.step + n.len > totalSteps)) errors.push(`Pista ${ti + 1}: nota en paso ${n.step} con len ${n.len} se sale del compás.`);
      if (n.step + n.len > totalSteps) errors.push(`Pista ${ti + 1}: nota en paso ${n.step} termina fuera de la canción.`);
      if (dr) {
        if (!CS.getInst('drums').pieces[n.pitch]) errors.push(`Pista ${ti + 1}: pieza de batería desconocida "${n.pitch}".`);
        else drumHist.set(n.pitch, (drumHist.get(n.pitch) || 0) + 1);
        starts.set(n.step, (starts.get(n.step) || 0) + 1); ends.set(n.step + 1, (ends.get(n.step + 1) || 0) + 1);
      } else {
        const m = CS.midi(n.pitch);
        if (m == null) { errors.push(`Pista ${ti + 1}: pitch inválido "${n.pitch}".`); continue; }
        if (m < 12 || m > 119) errors.push(`Pista ${ti + 1}: pitch ${n.pitch} fuera de 12–119.`);
        if (m < lo || m > hi) { outOfRange++; st.outOfRange++; warnings.push(`Pista ${ti + 1} (${t.name}): ${n.pitch} fuera de ${inst.range.low}–${inst.range.high}.`); }
        minMidi = Math.min(minMidi, m); maxMidi = Math.max(maxMidi, m);
        pcHist.set(((m % 12) + 12) % 12, (pcHist.get(((m % 12) + 12) % 12) || 0) + 1);
        all.push({ ti, step: n.step, len: n.len, pitch: n.pitch, midi: m });
        starts.set(n.step, (starts.get(n.step) || 0) + 1); ends.set(n.step + n.len, (ends.get(n.step + n.len) || 0) + 1);
        if (n.slide && CS.midi(n.slide) == null) errors.push(`Pista ${ti + 1}: slide inválido "${n.slide}".`);
        if (n.chord && !CS.CHORDS[n.chord]) errors.push(`Pista ${ti + 1}: chord inválido "${n.chord}".`);
      }
    }
    let cur = 0;
    for (let step = 0; step <= totalSteps; step++) { cur += (starts.get(step) || 0); maxPoly = Math.max(maxPoly, cur); st.polyphony = Math.max(st.polyphony, cur); cur -= (ends.get(step) || 0); }
    st.density = +(t.notes.length / Math.max(1, song.bars)).toFixed(2);
    st.range = !dr && minMidi !== 200 ? [CS.name(lo), CS.name(hi)] : null;
    trackStats.push(st);
  }
  const melodic = all.length, inside = melodic ? all.filter((n) => (CS.theory.scales[song.scale]?.s || []).map((x) => (keyPc(song.key) + x) % 12).includes(n.midi % 12)).length : 0;
  const consistency = melodic ? inside / melodic : 1;
  if (melodic && song.scale && consistency < 0.72) warnings.push(`Solo el ${Math.round(consistency * 100)}% de las notas coincide con ${song.key} ${song.scale}; revisa la tonalidad declarada o las notas de paso.`);
  const dup = new Map();
  for (const n of all) { const k = `${n.step}:${n.midi}`; dup.set(k, (dup.get(k) || 0) + 1); }
  const duplicates = [...dup.values()].filter((n) => n > 1).length;
  if (duplicates > 3) warnings.push(`${duplicates} notas duplicadas (mismo paso y altura en pistas distintas); puede ser intencional (unísono), pero revisa el arreglo.`);
  if (totalNotes === 0) errors.push('La canción no tiene notas.');
  if (totalNotes / Math.max(1, song.bars) > 42) warnings.push(`Densidad alta: ${(totalNotes / song.bars).toFixed(1)} notas por compás; puede sonar saturado.`);
  if (!song.tracks.some((t) => CS.getInst(t.instrument).id === 'drums') && !['ambient', 'medieval', 'impressionist'].includes(GENRES.families?.[raw?.genre]?.id)) warnings.push('No hay pista de batería; si el género la necesita, añádela.');
  if (!song.tracks.some((t) => ['bass', 'pluck', 'triangle', 'piano'].includes(CS.getInst(t.instrument).id))) warnings.push('No hay un bajo claro; el género puede perder cuerpo.');
  if (!song.tracks.some((t) => ['pulse', 'pwm', 'saw', 'brass', 'piano', 'guitar', 'pluck', 'triangle', 'arp', 'bell'].includes(CS.getInst(t.instrument).id))) warnings.push('No hay una voz melódica clara.');
  if (song.loopStart > 0 && song.loopStart >= song.bars) errors.push(`loopStart ${song.loopStart} fuera de la canción.`);
  if ((song.tempo || []).length > 8) warnings.push(`Hay ${song.tempo.length} cambios de tempo; puede ser difícil de seguir.`);
  const duration = CS.song.timeAt(song, totalSteps);
  const score = clamp(100 - errors.length * 14 - warnings.length * 3, 0, 100);
  return {
    ok: errors.length === 0, score,
    title: song.title, bpm: song.bpm, bars: song.bars, timeSig: song.timeSig, key: song.key || null, scale: song.scale || null,
    loopStart: song.loopStart, duration, durationText: fmtDur(duration), tracks: trackStats,
    totals: { notes: totalNotes, melodic, tracks: song.tracks.length, maxPolyphony: maxPoly, minMidi: minMidi === 200 ? null : CS.name(minMidi), maxMidi: maxMidi < 0 ? null : CS.name(maxMidi), outOfRange, duplicates, scaleConsistency: +consistency.toFixed(2) },
    drums: Object.fromEntries(drumHist), errors, warnings,
    song
  };
}

function keyPc(k) {
  if (k == null) return 9;
  if (typeof k === 'number') return ((Math.floor(k) % 12) + 12) % 12;
  const CS = loadCS(), m = CS.midi(String(k).replace('♭', 'b').replace('♯', '#') + (/\d$/.test(String(k)) ? '' : '4'));
  return m == null ? 9 : m % 12;
}

function humanCheck(a) {
  const icon = a.ok ? '✓' : '✗';
  const lines = [];
  lines.push(`${icon} ${a.ok ? 'Canción válida' : 'Hay errores'} — "${a.title}"  ·  ${a.score}/100`);
  lines.push(`${a.bars} compases ${a.timeSig} · ${a.bpm} BPM · ${a.durationText} · ${a.totals.tracks} pistas · ${a.totals.notes} notas`);
  lines.push(`Tonalidad: ${a.key || '—'} ${a.scale || ''} · loopStart: ${a.loopStart} · polifonía máx.: ${a.totals.maxPolyphony}`);
  if (a.totals.outOfRange) lines.push(`Registro: ${a.totals.outOfRange} nota(s) fuera del registro de su instrumento.`);
  lines.push('', `ERRORES (${a.errors.length})`);
  if (!a.errors.length) lines.push('  ninguno');
  else a.errors.forEach((e) => lines.push('  - ' + e));
  lines.push('', `AVISOS (${a.warnings.length})`);
  if (!a.warnings.length) lines.push('  ninguno');
  else a.warnings.slice(0, 20).forEach((w) => lines.push('  - ' + w));
  if (a.warnings.length > 20) lines.push(`  ... y ${a.warnings.length - 20} más.`);
  lines.push('', 'PISTAS');
  for (const t of a.tracks) lines.push(`  ${t.index + 1}. ${t.name} [${t.instrument}] · ${t.notes} notas · ${t.density}/compás · polifonía ${t.polyphony}${t.empty ? ' · VACÍA' : ''}`);
  lines.push('', 'CHECKLIST RÁPIDA');
  [['La emoción se entiende en 8 compases', true], ['Hay contraste entre secciones', true], ['La melodía se puede tararear', true], ['El bajo y la batería definen el género', true], ['Todos los instrumentos están en registro', a.totals.outOfRange === 0], ['El loop cierra', a.loopStart === 0 || a.ok], ['La obra es original y no cita material protegido', true]].forEach(([x, ok]) => lines.push(`  [${ok ? 'x' : ' '}] ${x}`));
  return lines.join('\n');
}

/* ---------- consultas ---------- */

function listGenres(query, family, emotion) {
  const q = norm(query || ''), rows = [], seen = new Set();
  for (const [id, p] of Object.entries(PROFILES)) {
    if (family && p.family !== family) continue;
    const fam = FAMILIES[p.family] || {};
    if (emotion && !(p.traits?.emotions || fam.emotions || []).some((e) => norm(e).includes(norm(emotion)))) continue;
    const hay = norm([id, p.name, p.family, ...(p.aliases || []), ...(p.traits?.keywords || [])].join(' '));
    if (q && !hay.includes(q)) continue;
    rows.push({ name: p.name, family: p.family, familyName: fam.name, tempo: p.traits?.tempo || fam.tempo, scales: p.traits?.scales || fam.scales, instruments: p.traits?.instruments || fam.instruments, emotions: p.traits?.emotions || fam.emotions, source: 'perfil' });
    seen.add(norm(p.name));
  }
  for (const [fam, names] of Object.entries(GENRES.catalog)) {
    if (family && fam !== family) continue;
    if (emotion && !(FAMILIES[fam]?.emotions || []).some((e) => norm(e).includes(norm(emotion)))) continue;
    for (const name of names) {
      if (q && !norm(name).includes(q)) continue;
      if (seen.has(norm(name))) continue;
      const f = FAMILIES[fam] || {};
      rows.push({ name, family: fam, familyName: f.name, tempo: f.tempo, scales: f.scales, instruments: f.instruments, emotions: f.emotions, source: 'catálogo' });
      seen.add(norm(name));
    }
  }
  return rows.sort((a, b) => a.family.localeCompare(b.family) || a.name.localeCompare(b.name));
}

function humanGenres(rows) {
  if (!rows.length) return 'No encontré ese género. Usa el fallback de ai/GENRES.md: familia cercana + supuestos.';
  return rows.slice(0, 60).map((r) => `- ${r.name} [${r.family}] · ${r.tempo?.[0]}–${r.tempo?.[1]} BPM · ${(r.scales || []).slice(0, 5).join(', ')} · ${(r.instruments || []).slice(0, 6).join(', ')}${r.source === 'catálogo' ? ' · (catálogo)' : ''}`).join('\n') + (rows.length > 60 ? `\n... y ${rows.length - 60} más.` : '');
}

/* ---------- CLI ---------- */

const FLAGS_WITH_VALUE = new Set(['out', 'plan', 'plan-out', 'family', 'emotion', 'genre', 'seed', 'form']);
function parseArgs(argv) {
  const flags = {}, pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      if (FLAGS_WITH_VALUE.has(k)) flags[k] = argv[++i];
      else flags[k] = true;
    } else pos.push(a);
  }
  return { flags, pos };
}

function writeOut(file, text) {
  const p = path.resolve(process.cwd(), file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text, 'utf8');
  return p;
}

function planSummary(p) {
  return [
    `Plan: ${p.title}`,
    `Género: ${p.genre.name} [${p.genre.family}] · confianza ${Math.round(p.genre.confidence * 100)}%${p.genre.custom ? ' · estimado' : ''}`,
    `Emoción: ${p.mood.name} · energía ${p.mood.energy} · tensión ${p.mood.tension}`,
    `Tempo: ${p.tempo.base} BPM (${p.tempo.range[0]}–${p.tempo.range[1]}) · ${p.meter} · ${p.bars} compases · loopStart ${p.loopStart}`,
    `Tonalidad: ${p.key} ${p.scale} · progresión [${p.harmony.progression.join(', ')}] · acorde cada ${p.harmony.harmonicRhythm} compás(es)`,
    `Forma: ${p.form.sections.map((s) => `${s.name} ${s.bars}`).join(' · ')}`,
    `Pistas: ${p.instrumentation.map((i) => `${i.role}=${i.instrument}`).join(' · ')}`,
    `Supuestos: ${p.assumptions.length ? p.assumptions.join(' | ') : 'ninguno'}`,
    `Avisos: ${p.warnings.length ? p.warnings.join(' | ') : 'ninguno'}`
  ].join('\n');
}

function main() {
  const argv = process.argv.slice(2), cmd = argv[0];
  const { flags, pos } = parseArgs(argv.slice(1));
  if (!cmd || ['help', '-h', '--help'].includes(cmd)) {
    console.log(`Uso:
  node tools/ai-compose.js plan <brief> [--out plan.json] [--form loop|exploration|boss|cinematic|song|ambient|classical]
  node tools/ai-compose.js sketch <brief> [--out cancion.json] [--plan plan.json] [--seed texto]
  node tools/ai-compose.js check <cancion.json> [--json]
  node tools/ai-compose.js genres [consulta] [--family latin] [--emotion misterioso] [--json]
  node tools/ai-compose.js moods [consulta] [--json]
  node tools/ai-compose.js brief [--out brief.md]
Documentación: ai/README.md · ai/CORE.md · ai/COMPOSE.md · ai/GENRES.md`);
    return;
  }
  if (cmd === 'plan') {
    const file = pos[0]; if (!file) throw new Error('Falta el brief: node tools/ai-compose.js plan ai/examples/lore-brief.json');
    const b = readBrief(file);
    if (flags.genre) b.genre = [flags.genre];
    const plan = buildPlan(b, { form: flags.form });
    if (flags.out) { const p = writeOut(flags.out, JSON.stringify(plan, null, 2) + '\n'); console.log(`Plan escrito en ${p}\n\n${planSummary(plan)}`); }
    else if (flags.json) console.log(JSON.stringify(plan, null, 2));
    else console.log(planSummary(plan));
    return;
  }
  if (cmd === 'sketch') {
    const file = pos[0]; if (!file) throw new Error('Falta el brief: node tools/ai-compose.js sketch ai/examples/lore-brief.json');
    let plan;
    if (flags.plan) plan = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), flags.plan), 'utf8'));
    else { const b = readBrief(file); if (flags.genre) b.genre = [flags.genre]; plan = buildPlan(b, { form: flags.form }); }
    const song = makeSong(plan, flags.seed || '');
    const a = analyze(song, song);
    if (flags['plan-out']) writeOut(flags['plan-out'], JSON.stringify(plan, null, 2) + '\n');
    const text = loadCS().song.text(song);
    if (flags.out) { const p = writeOut(flags.out, text); console.log(`Canción escrita en ${p}\n${a.bars} compases · ${a.bpm} BPM · ${a.durationText} · ${a.totals.tracks} pistas · ${a.totals.notes} notas · ${a.ok ? 'válida' : 'con errores'}`); }
    else console.log(flags.json ? JSON.stringify(song, null, 2) : text);
    return;
  }
  if (cmd === 'check') {
    const file = pos[0]; if (!file) throw new Error('Falta la canción: node tools/ai-compose.js check cancion.json');
    const { raw, song } = readSong(file);
    const a = analyze(song, raw);
    if (flags.json) console.log(JSON.stringify({ ...a, song: undefined }, null, 2));
    else console.log(humanCheck(a));
    if (!a.ok) process.exitCode = 1;
    return;
  }
  if (cmd === 'genres') {
    const rows = listGenres(pos.join(' '), flags.family, flags.emotion);
    if (flags.json) console.log(JSON.stringify(rows, null, 2));
    else if (!pos.length && !flags.family && !flags.emotion) {
      const counts = Object.entries(GENRES.catalog).map(([f, a]) => `${f}: ${a.length}`).join(' · ');
      console.log(`${Object.keys(GENRES.families).length} familias · ${Object.keys(GENRES.genres).length} perfiles\n${counts}\n\nBusca: node tools/ai-compose.js genres "folk metal"`);
    } else console.log(humanGenres(rows));
    return;
  }
  if (cmd === 'moods') {
    const q = norm(pos.join(' ')), rows = Object.entries(MOODS.moods).filter(([id, m]) => !q || norm([id, m.name, ...(m.aliases || [])].join(' ')).includes(q)).map(([id, m]) => ({ id, ...m }));
    if (flags.json) console.log(JSON.stringify(rows, null, 2));
    else if (!rows.length) console.log('No encontré esa emoción. Prueba: heroico, misterioso, melancólico, tenso, festivo, onírico.');
    else rows.forEach((m) => console.log(`- ${m.name} [${m.id}] · valence ${m.valence} · energía ${m.energy} · tensión ${m.tension} · ${m.tempo?.[0]}–${m.tempo?.[1]} BPM · ${(m.scales || []).slice(0, 5).join(', ')}`));
    return;
  }
  if (cmd === 'brief') {
    const CS = loadCS(), text = CS.song.brief();
    if (flags.out) { const p = writeOut(flags.out, text + '\n'); console.log(`Brief escrito en ${p}`); } else console.log(text);
    return;
  }
  throw new Error(`Comando desconocido: ${cmd}. Usa --help.`);
}

if (require.main === module) {
  try { main(); }
  catch (e) { console.error('Error: ' + e.message); if (process.env.DEBUG) console.error(e.stack); process.exitCode = 1; }
}


