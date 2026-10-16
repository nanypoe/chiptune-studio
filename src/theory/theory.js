/* Teoría musical aplicada: escalas, grados y acordes diatónicos. */
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
  chordName(ns) { const [a, b, c] = ns, q = b - a === 4 && c - b === 3 ? '' : b - a === 3 && c - b === 4 ? 'm' : b - a === 3 && c - b === 3 ? ' dim' : '?'; return CS.NOTE[a % 12] + q; },
  isTriad(ms) { const s = [...new Set(ms)].sort((a, b) => a - b); return s.length >= 3 && [3, 4].includes(s[1] - s[0]) && s[2] - s[0] === 7 || (s.length >= 3 && s[1] - s[0] === 3 && s[2] - s[0] === 6); },
};
