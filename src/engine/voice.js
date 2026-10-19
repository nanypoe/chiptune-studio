/* Sintetizador: convierte la definición de un instrumento (JSON) en sonido. No conoce ningún instrumento concreto.
   Capacidades: osciladores (sine, triangle, saw, square, pulse, pwm), envolvente ADSR, filtro con barrido, vibrato, ruido (soplo/golpe), formantes,
   chirp (pitchEnv), arpegio rápido (arp) y, por nota, deslizamiento (slide) y acorde arpegiado (chord). */
CS.CHORDS = { M: [0, 4, 7], m: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8], '7': [0, 4, 7, 10], M7: [0, 4, 7, 11], m7: [0, 3, 7, 10], sus4: [0, 5, 7], power: [0, 7, 12] };
CS.voice = (rig, d, f, t, dur, vel, dest, ex = {}) => {
  const c = rig.ctx, e = d.env, a = Math.min(e.attack, dur * 0.8), vol = vel * d.gain;
  const te = e.ring ? t + a + e.decay : t + Math.min(a + e.decay, dur), end = e.ring ? Math.max(t + dur, te) : t + dur, stop = end + e.release + 0.1;
  const g = c.createGain(), src = c.createGain(), os = []; let lg = null;
  if (d.vibrato) {
    const l = c.createOscillator(); lg = c.createGain(); l.frequency.value = d.vibrato.rate;
    lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(d.vibrato.depth, t + d.vibrato.delay + 0.25);
    l.connect(lg); l.start(t); l.stop(stop);
  }
  for (const o of d.osc) {
    const r = o.ratio || 1, og = c.createGain(); og.gain.value = (o.gain ?? 1) * (o.wave === 'pwm' ? 0.5 : 1);
    const mk = () => { const x = c.createOscillator(); x.frequency.value = f * r; x.detune.value = o.detune || 0; if (lg) lg.connect(x.detune); x.start(t); x.stop(stop); os.push({ x, r }); return x; };
    if (o.wave === 'pwm') {   // ancho de pulso móvil: sierra menos sierra retrasada (el retraso = ancho del pulso)
      const s1 = mk(), s2 = mk(), dl = c.createDelay(0.1), inv = c.createGain(), du = o.duty || [0.5, 0.5], per = 1 / (f * r), cl = (v) => CS.clamp(v * per, 0.0001, 0.09);
      s1.type = s2.type = 'sawtooth'; inv.gain.value = -1;
      dl.delayTime.setValueAtTime(cl(du[0]), t); dl.delayTime.linearRampToValueAtTime(cl(du[1]), t + (o.time || 0.4));
      s1.connect(og); s2.connect(dl); dl.connect(inv); inv.connect(og);
    } else { const x = mk(); if (o.wave === 'pulse') x.setPeriodicWave(rig.pulse(o.duty || 0.5)); else x.type = o.wave === 'saw' ? 'sawtooth' : o.wave; x.connect(og); }
    og.connect(src);
  }
  const A = ex.offs || (d.arp && d.arp.offsets), rate = (d.arp && d.arp.rate) || 25;
  for (const { x, r } of os) {
    const f0 = f * r;
    if (A) { for (let i = 0; ; i++) { const tt = t + i / rate; if (tt >= end) break; x.frequency.setValueAtTime(f0 * 2 ** (A[i % A.length] / 12), tt); } }
    else if (ex.fEnd) { x.frequency.setValueAtTime(f0, t); x.frequency.exponentialRampToValueAtTime(ex.fEnd * r, t + Math.max(dur * 0.9, 0.02)); }
    if (d.pitchEnv) { x.detune.setValueAtTime(d.pitchEnv.from, t); x.detune.linearRampToValueAtTime(0, t + d.pitchEnv.time); }
  }
  if (d.formants) for (const [h, q, gn] of d.formants) { const b = c.createBiquadFilter(), bg = c.createGain(); b.type = 'bandpass'; b.frequency.value = h; b.Q.value = q; bg.gain.value = gn; src.connect(b); b.connect(bg); bg.connect(g); }
  else if (d.filter) {
    const fl = c.createBiquadFilter(), k = d.filter.cutoff; fl.type = 'lowpass'; fl.Q.value = d.filter.q || 1;
    fl.frequency.setValueAtTime(Math.min(f * k[0], 16000), t); fl.frequency.exponentialRampToValueAtTime(Math.min(f * k[1], 16000), t + d.filter.time);
    src.connect(fl); fl.connect(g);
  } else src.connect(g);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + a);
  g.gain.linearRampToValueAtTime(vol * e.sustain, te); g.gain.setTargetAtTime(0, end, e.release / 3);
  g.connect(dest);
  if (d.noise) rig.burst(t, dest, f * d.noise.ratio, d.noise.q, d.noise.dur, vol * d.noise.gain, 'bandpass');
};
/* Percusión: cada pieza es una lista de capas (oscilador con barrido de frecuencia o ráfaga de ruido). */
CS.drumHit = (rig, d, k, t, vel, dest) => {
  const p = d.pieces[k]; if (!p) return; const c = rig.ctx;
  for (const L of p.layers) {
    const s = t + (L.delay || 0), v = (L.gain ?? 1) * vel;
    if (L.type === 'osc') {
      const o = c.createOscillator(), g = c.createGain(), [f0, f1] = Array.isArray(L.freq) ? L.freq : [L.freq, L.freq];
      o.type = L.wave === 'saw' ? 'sawtooth' : L.wave; o.frequency.setValueAtTime(f0, s);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, s + (L.sweep || 0.1));
      g.gain.setValueAtTime(v, s); g.gain.exponentialRampToValueAtTime(0.001, s + L.decay);
      o.connect(g); g.connect(dest); o.start(s); o.stop(s + L.decay + 0.02);
    } else rig.burst(s, dest, L.freq, L.q || 1, L.decay, v, L.filter || 'bandpass');
  }
};
