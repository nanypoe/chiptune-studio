/* Modelo de canción: crear, validar/normalizar (acepta v1 y v2), dar formato a texto, demo y guía para IA. */
CS.song = {
  track(inst, name) { const d = CS.getInst(inst); return { name: name || d.name, instrument: d.id, volume: 0.8, pan: d.pan || 0, mute: false, solo: false, fx: { reverb: 0.15 }, notes: [] }; },
  blank() { return { format: 'chiptune-studio', version: 2, title: 'Mi canción', bpm: 120, bars: 4, tracks: [CS.song.track('pulse', 'Melodía'), CS.song.track('bass', 'Bajo'), CS.song.track('drums', 'Batería')] }; },
  normalize(o) {
    if (!o || !Array.isArray(o.tracks)) throw new Error('falta el arreglo "tracks"');
    const s = { format: 'chiptune-studio', version: 2, title: String(o.title || 'Sin título'), bpm: CS.clamp(+o.bpm || 120, 40, 240), bars: 1, tracks: [] }; let end = 0;
    for (const t of o.tracks.slice(0, 12)) {
      const d = CS.getInst(t.instrument) || CS.getInst('pulse'), dr = d.id === 'drums', notes = [];
      for (const n of t.notes || []) {
        let p = n.pitch; if (typeof p === 'number') p = CS.name(p);
        if (dr) { p = String(p).toLowerCase(); if (p === 'tom') p = 'tommid'; if (!d.pieces[p]) continue; }
        else { const m = CS.midi(String(p)); if (m == null || m < 12 || m > 119) continue; p = CS.name(m); }
        const st = Math.max(0, Math.floor(+n.step || 0)), len = dr ? 1 : Math.max(1, Math.floor(+n.len || 1)), vel = n.vel == null ? 1 : CS.clamp(+n.vel || 1, 0.1, 1);
        const x = { step: st, len, pitch: p }; if (vel < 1) x.vel = +vel.toFixed(2); notes.push(x); end = Math.max(end, st + len);
      }
      const fx = {}; if (t.fx && typeof t.fx === 'object') for (const [k, v] of Object.entries(t.fx)) fx[k] = CS.clamp(+v || 0, 0, 1); else fx.reverb = 0.15;
      s.tracks.push({ name: String(t.name || d.name), instrument: d.id, volume: CS.clamp(t.volume ?? 0.8, 0, 1), pan: CS.clamp(+t.pan || 0, -1, 1), mute: !!t.mute, solo: false, fx, notes });
    }
    if (!s.tracks.length) throw new Error('no hay pistas');
    s.bars = CS.clamp(Math.max(Math.floor(+o.bars || 1), Math.ceil(end / 16)), 1, 64);
    const T = s.bars * 16; for (const t of s.tracks) t.notes = t.notes.filter((n) => n.step < T).map((n) => ({ ...n, len: Math.min(n.len, T - n.step) }));
    return s;
  },
  parse(text) { const a = text.indexOf('{'), b = text.lastIndexOf('}'); if (a < 0 || b < a) throw new Error('no encontré un objeto { ... }'); return CS.song.normalize(JSON.parse(text.slice(a, b + 1))); },
  text(s) {
    const { tracks, ...h } = s, tr = tracks.map((t) => { const { notes, solo, ...r } = t; return '  {' + JSON.stringify(r).slice(1, -1) + ',\n   "notes":[\n' + notes.slice().sort((a, b) => a.step - b.step).map((n) => '    ' + JSON.stringify(n)).join(',\n') + '\n   ]}'; });
    return JSON.stringify(h).slice(0, -1).replace(/,"/g, ',\n "').replace('{"', '{\n "') + ',\n "tracks":[\n' + tr.join(',\n') + '\n ]\n}';
  },
  demo() {
    const s = { format: 'chiptune-studio', version: 2, title: 'Demo en La menor', bpm: 120, bars: 4, tracks: [] }, N = CS.name;
    const mel = [[0,2,'E5'],[2,2,'C5'],[4,2,'A4'],[6,2,'C5'],[8,4,'E5'],[12,4,'D5'],[16,2,'C5'],[18,2,'A4'],[20,2,'F4'],[22,2,'A4'],[24,4,'C5'],[28,4,'A4'],[32,2,'G4'],[34,2,'C5'],[36,2,'E5'],[38,2,'C5'],[40,4,'G5'],[44,4,'E5'],[48,2,'D5'],[50,2,'G4'],[52,2,'B4'],[54,2,'D5'],[56,8,'G5']];
    const ch = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], roots = [33, 29, 36, 31], pads = [], bass = [], dr = [];
    ch.forEach((c, b) => { c.forEach((m) => pads.push({ step: b * 16, len: 16, pitch: N(m) })); for (const st of [0, 6, 8, 14]) bass.push({ step: b * 16 + st, len: 2, pitch: N(roots[b]) });
      for (const st of [0, 8]) dr.push({ step: b * 16 + st, len: 1, pitch: 'kick' }); for (const st of [4, 12]) dr.push({ step: b * 16 + st, len: 1, pitch: 'snare' });
      for (let st = 0; st < 16; st += 2) dr.push({ step: b * 16 + st, len: 1, pitch: 'hat', ...(st % 4 ? { vel: 0.55 } : {}) }); });
    const T = CS.song.track, add = (i, n, notes, v) => { const t = T(i, n); t.notes = notes; t.volume = v; s.tracks.push(t); };
    add('pulse', 'Melodía', mel.map(([step, len, pitch]) => ({ step, len, pitch })), 0.8); add('strings', 'Acordes', pads, 0.45); add('pluck', 'Bajo', bass, 0.9); add('drums', 'Batería', dr, 0.8);
    return s;
  },
  /** Guía para IA: se genera sola a partir de los instrumentos y efectos registrados. */
  guide() {
    const I = Object.values(CS.inst).filter((d) => d.id !== 'drums').map((d) => `- ${d.id} (${d.name}, ${d.range.low}–${d.range.high}): ${d.tip}`).join('\n');
    const dk = CS.getInst('drums'), al = Object.entries(CS.alias).map(([a, b]) => `${a}→${b}`).join(', ');
    return `GUÍA PARA IA — Chiptune Studio (formato v2)
Responde SOLO con un JSON válido:
{"format":"chiptune-studio","version":2,"title":"Nombre","bpm":120,"bars":8,
 "tracks":[{"name":"Melodía","instrument":"pulse","volume":0.8,"pan":0,"fx":{"reverb":0.15},
   "notes":[{"step":0,"len":2,"pitch":"E5"},{"step":2,"len":2,"pitch":"G5","vel":0.6}]}]}

REGLAS
- 16 pasos por compás (semicorcheas), siempre 4/4. step = posición (el compás 2 empieza en 16). len en pasos: 1=1/16, 2=1/8, 4=1/4, 8=1/2, 16=compás. step+len <= bars*16.
- pitch: "C4" = Do central; sostenidos con #. En batería: ${CS.drumOrder.join(', ')}.
- bpm 40-240, bars 1-64, hasta 12 pistas, volume 0-1, pan -1 (izq) a 1 (der).
- vel (0.1-1, opcional): tiempo fuerte 1, contratiempo 0.6-0.8, nota fantasma 0.4.
- fx por pista (envío 0-1): ${Object.keys(CS.fx).join(', ')}.
- Ids antiguos aceptados: ${al}.

INSTRUMENTOS
${I}
- drums: ${CS.drumOrder.map((k) => `${k} (${dk.pieces[k].name})`).join(', ')}.

PARA QUE NO SUENE TODO IGUAL
- Un timbre distinto por rol: melodía, contramelodía (otro timbre y otra octava), armonía, bajo, brillo (bell), batería.
- Cambia de instrumento entre secciones; usa vel y pan; fills de toms al final de frase y crash al empezar sección.
- Respeta el registro de cada instrumento. Elige escala y acordes (ej. Am-F-C-G); la melodía cae en notas del acorde en tiempos fuertes.`;
  },
};
