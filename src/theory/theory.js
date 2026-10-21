/* Teoría musical aplicada: escalas, grados, acordes y tipos de tríada. */
CS.theory = {
  scales: {
    major: { n: 'Mayor / Jónico', s: [0, 2, 4, 5, 7, 9, 11], rn: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] },
    minor: { n: 'Menor natural / Eólico', s: [0, 2, 3, 5, 7, 8, 10], rn: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'] },
    dorian: { n: 'Dórico', s: [0, 2, 3, 5, 7, 9, 10], rn: ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'] },
    phrygian: { n: 'Frigio', s: [0, 1, 3, 5, 7, 8, 10], rn: ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'] },
    lydian: { n: 'Lidio', s: [0, 2, 4, 6, 7, 9, 11], rn: ['I', 'II', 'iii', 'iv°', 'V', 'vi', 'vii'] },
    mixolydian: { n: 'Mixolidio', s: [0, 2, 4, 5, 7, 9, 10], rn: ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'] },
    locrian: { n: 'Locrio', s: [0, 1, 3, 5, 6, 8, 10], rn: ['i°', 'II', 'III', 'iv', 'v', 'VI', 'VII'] },
    harmonicMinor: { n: 'Menor armónica', s: [0, 2, 3, 5, 7, 8, 11], rn: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'] },
    melodicMinor: { n: 'Menor melódica', s: [0, 2, 3, 5, 7, 9, 11], rn: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'] },
    harmonicMajor: { n: 'Mayor armónica', s: [0, 2, 4, 5, 7, 8, 11], rn: ['I', 'ii', 'iii', 'IV', 'V+', 'vi', 'vii°'] },
    phrygianDominant: { n: 'Frigio dominante', s: [0, 1, 4, 5, 7, 8, 10], rn: ['I', 'II', 'III+', 'iv', 'v°', 'VI', 'vii'] },
    doubleHarmonic: { n: 'Doble armónica (bizantina)', s: [0, 1, 4, 5, 7, 8, 11], rn: ['I', 'II', 'III+', 'iv', 'V+', 'VI', 'vii°'] },
    hungarianMinor: { n: 'Menor húngara', s: [0, 2, 3, 6, 7, 8, 11], rn: ['i', 'II', 'III+', 'iv', 'V', 'VI', 'vii°'] },
    pentMin: { n: 'Pentatónica menor', s: [0, 3, 5, 7, 10] },
    pentMaj: { n: 'Pentatónica mayor', s: [0, 2, 4, 7, 9] },
    blues: { n: 'Blues (hexatónica)', s: [0, 3, 5, 6, 7, 10] },
    wholeTone: { n: 'Tono completo', s: [0, 2, 4, 6, 8, 10] },
    diminished: { n: 'Disminuida (octatónica)', s: [0, 2, 3, 5, 6, 8, 9, 11] },
    hirajoshi: { n: 'Hirajoshi (japonesa)', s: [0, 2, 3, 7, 8] },
    insen: { n: 'In-Sen (japonesa)', s: [0, 1, 5, 7, 10] },
    egyptian: { n: 'Egipcia', s: [0, 2, 5, 7, 10] },
    chromatic: { n: 'Cromática (todas)', s: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  },
  pc: (m, root) => (((m - root) % 12) + 12) % 12,
  inScale(m, root, sc) { return sc.s.includes(this.pc(m, root)); },
  degree(m, root, sc) { const i = sc.s.indexOf(this.pc(m, root)); return i < 0 || sc.s.length < 7 ? null : i + 1; },
  /** Tríada diatónica del grado i (0-6) con fundamental en la octava dada. */
  triad(rootPc, oct, sc, i) { const s = sc.s, b = 12 * (oct + 1) + rootPc, n = (k) => b + s[(i + k) % 7] + 12 * Math.floor((i + k) / 7); return [n(0), n(2), n(4)]; },
  /** Tipo de tríada en estado fundamental: 'M' mayor, 'm' menor, 'dim', 'aug' (o null) y su fundamental (0-11). */
  triadType(ms) {
    const s = [...new Set(ms)].sort((a, b) => a - b); if (s.length < 3) return null;
    const a = s[1] - s[0], b = s[2] - s[1], t = a === 4 && b === 3 ? 'M' : a === 3 && b === 4 ? 'm' : a === 3 && b === 3 ? 'dim' : a === 4 && b === 4 ? 'aug' : null;
    return t ? { type: t, root: s[0] % 12 } : null;
  },
  chordName(ns) { const t = this.triadType(ns); return CS.NOTE[ns[0] % 12] + (t ? { M: '', m: 'm', dim: ' dim', aug: ' aug' }[t.type] : '?'); },
};

/* ---- Nomenclatura: cómo se escribe cada tecla negra (♯ sostenido / ♭ bemol) ---- */
Object.assign(CS.theory, {
  SH: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'], FL: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  LET: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], NAT: [0, 2, 4, 5, 7, 9, 11], SOLN: { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' },
  MAJN: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'], MINN: ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'],
  base: (id) => (id === 'major' || id === 'pentMaj' ? 'major' : id === 'minor' || id === 'pentMin' ? 'minor' : null),
  /** Ortografía de la tonalidad: cada letra se usa una vez (F mayor = F G A Bb C D E; D mayor = D E F# G A B C#). */
  spellMap(root, id) {
    const b = this.base(id); if (!b) return null;
    const rn = (b === 'major' ? this.MAJN : this.MINN)[root], L0 = this.LET.indexOf(rn[0]), map = {};
    this.scales[b].s.forEach((semi, k) => { const pc = (root + semi) % 12, nat = this.NAT[(L0 + k) % 7], a = ((pc - nat + 18) % 12) - 6; if (Math.abs(a) <= 1) map[pc] = { l: this.LET[(L0 + k) % 7], a }; });
    return map;
  },
  /** Preferencia de la armadura: −1 usa bemoles, +1 usa sostenidos, 0 ninguna (Do mayor, La menor, cromática). */
  pref(root, id) { const mp = this.spellMap(root, id); if (!mp) return 0; let f = 0, s = 0; for (const k in mp) { if (mp[k].a < 0) f++; if (mp[k].a > 0) s++; } return f > s ? -1 : s > f ? 1 : 0; },
  keyName(root, id) { const b = this.base(id); return b ? (b === 'major' ? this.MAJN : this.MINN)[root] + (b === 'major' ? ' mayor' : ' menor') : CS.NOTE[root] + ' · ' + this.scales[id].n; },
  /** Nombre correcto de una nota. 1) Si es de la tonalidad, manda la tonalidad. 2) Si no: la armadura decide (tonalidad con ♯ → ♯, con ♭ → ♭). 3) Sin armadura (Do mayor / La menor): subiendo → ♯, bajando → ♭ (convención habitual, no una ley). dir: +1 sube, −1 baja, 0 sin contexto. */
  spell(m, root, id, dir = 0) {
    const pc = m % 12, mp = this.spellMap(root, id); let l, a, why = '';
    if (mp && mp[pc]) { l = mp[pc].l; a = mp[pc].a; why = 'scale'; }
    else {
      const nat = this.NAT.indexOf(pc);
      if (nat >= 0) { l = this.LET[nat]; a = 0; }
      else { const pf = this.pref(root, id), flat = pf !== 0 ? pf < 0 : dir < 0; l = (flat ? this.FL : this.SH)[pc][0]; a = flat ? -1 : 1; why = pf !== 0 ? 'key' : dir < 0 ? 'down' : dir > 0 ? 'up' : 'none'; }
    }
    let o = Math.floor(m / 12) - 1; if (l === 'B' && a === 1) o--; if (l === 'C' && a === -1) o++;
    const ac = a > 0 ? '#' : a < 0 ? 'b' : '';
    return { n: l + ac, full: l + ac + o, acc: a, sol: this.SOLN[l] + (a > 0 ? '♯' : a < 0 ? '♭' : ''), why };
  },
  label(ns, root, id) { const t = this.triadType(ns); return this.spell(ns[0], root, id).n + (t ? { M: '', m: 'm', dim: '°', aug: '+' }[t.type] : '?'); },
  use: {
    major: [
      { e: '🏠 <b>Hogar.</b> Se siente como llegar a casa: estable y feliz.', w: 'inicio y final de casi todo: pop, rock, himnos, música de plataformas.' },
      { e: '🌤️ Suave y de transición; prepara al V.', w: 'pop, jazz y baladas (el clásico ii–V–I).' },
      { e: '🌫️ Delicado y un poco ambiguo.', w: 'baladas y pop suave; casi nunca va solo.' },
      { e: '🌅 Abierto y luminoso, como salir de aventura.', w: 'rock, gospel, pop y chiptune de plataformas.' },
      { e: '⚡ <b>Tensión.</b> Pide volver al I.', w: 'todos los géneros, justo antes del final de una frase.' },
      { e: '🌧️ Nostálgico y emotivo (el "primo triste" del I).', w: 'pop, baladas y música de créditos.' },
      { e: '😰 Inestable y tenso.', w: 'música clásica y jazz; en chiptune, como paso rápido.' },
    ],
    minor: [
      { e: '🌑 <b>Hogar oscuro</b> y serio.', w: 'metal, synthwave, JRPG y mazmorras.' },
      { e: '😰 Tenso, de paso.', w: 'música clásica y jazz menor.' },
      { e: '🌤️ Esperanza: es el "relativo mayor".', w: 'épica, rock y JRPG.' },
      { e: '🌊 Melancólico y profundo.', w: 'baladas, folk oscuro y chiptune triste.' },
      { e: '🌫️ Suave y triste.', w: 'folk y rock alternativo.' },
      { e: '🌄 Épico y emotivo.', w: 'música cinematográfica, JRPG y synthwave.' },
      { e: '🦸 Heroico: empuja hacia adelante.', w: 'rock, metal y jefes finales.' },
    ],
  },
  progs: {
    major: [{ n: 'Pop de siempre', d: [0, 4, 5, 3], w: 'Pop · Rock' }, { n: 'Doo‑wop alegre', d: [0, 5, 3, 4], w: 'Años 50 · Chiptune alegre' }, { n: 'Rock y blues', d: [0, 3, 4, 0], w: 'Rock · Blues · Country' }],
    minor: [{ n: 'Épica', d: [0, 5, 2, 6], w: 'Cinemático · JRPG · Synthwave' }, { n: 'Melancólica', d: [0, 3, 4, 0], w: 'Baladas · Folk oscuro' }, { n: 'Heroica', d: [0, 6, 5, 6], w: 'Rock · Metal · Jefes finales' }],
    modal: [
      { n: 'Pedal modal', d: [0, 0, 6, 0], w: 'Dórico · Eólico · Folk · Post-rock' },
      { n: 'Color lidio', d: [0, 1, 0, 4], w: 'Lidio · Cine · Videojuegos' },
      { n: 'Frigio oscuro', d: [0, 1, 0, 6], w: 'Frigio · Metal · Tensión' },
      { n: 'Mixolidio abierto', d: [0, 6, 3, 0], w: 'Rock · Country · Blues' },
      { n: 'Cadencia frigia', d: [0, 1, 6, 0], w: 'Flamenco · Metal · Épica' },
    ],
  },
});
