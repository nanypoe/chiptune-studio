/* Algoritmos de efectos ("kind"). Cada uno recibe (ctx, params) y devuelve { input, output, setBpm? }. Todos producen solo señal "mojada": se usan como envíos por pista. */
CS.kinds.reverb = (c, p) => {
  const len = Math.floor(c.sampleRate * (p.seconds || 1.4)), ir = c.createBuffer(2, len, c.sampleRate);
  for (let k = 0; k < 2; k++) { const d = ir.getChannelData(k); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** (p.decay || 3); }
  const cv = c.createConvolver(); cv.buffer = ir; return { input: cv, output: cv };
};
CS.kinds.delay = (c, p) => {
  const i = c.createGain(), o = c.createGain(), d = c.createDelay(2), fb = c.createGain(), lp = c.createBiquadFilter();
  lp.frequency.value = p.tone || 3500; fb.gain.value = p.feedback ?? 0.35;
  i.connect(d); d.connect(o); d.connect(lp); lp.connect(fb); fb.connect(d);
  return { input: i, output: o, setBpm: (b) => { d.delayTime.value = CS.clamp((60 / b) * (p.beats || 0.75), 0.01, 1.9); } };
};
CS.kinds.chorus = (c, p) => {
  const i = c.createGain(), d = c.createDelay(0.05), l = c.createOscillator(), lg = c.createGain();
  d.delayTime.value = p.delay || 0.022; l.frequency.value = p.rate || 0.8; lg.gain.value = p.depth || 0.004;
  l.connect(lg); lg.connect(d.delayTime); l.start(); i.connect(d); return { input: i, output: d };
};
CS.kinds.drive = (c, p) => {
  const s = c.createWaveShaper(), n = 1024, cu = new Float32Array(n), k = p.amount || 20, L = p.bits ? 2 ** (p.bits - 1) : 0;
  for (let i = 0; i < n; i++) { let x = Math.tanh(((i * 2) / n - 1) * k / 4); if (L) x = Math.round(x * L) / L; cu[i] = x; }
  s.curve = cu; return { input: s, output: s };
};
