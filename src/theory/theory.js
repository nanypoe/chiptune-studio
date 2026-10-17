/* Teoría musical aplicada: escalas, grados, acordes y tipos de tríada. */
CS.theory = {
  scales: {
    minor: { n: 'Menor natural', s: [0, 2, 3, 5, 7, 8, 10], rn: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'] },
    major: { n: 'Mayor', s: [0, 2, 4, 5, 7, 9, 11], rn: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] },
    pentMin: { n: 'Pentatónica menor', s: [0, 3, 5, 7, 10] },
    pentMaj: { n: 'Pentatónica mayor', s: [0, 2, 4, 7, 9] },
    chrom: { n: 'Cromática (todas)', s: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
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
