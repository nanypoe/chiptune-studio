/* Sintetizador: convierte la definición de un instrumento (JSON) en sonido. No conoce ningún instrumento concreto. */
CS.voice = (rig, d, f, t, dur, vel, dest) => {
  const c = rig.ctx, e = d.env, a = Math.min(e.attack, dur * 0.8), vol = vel * d.gain;
  const te = e.ring ? t + a + e.decay : t + Math.min(a + e.decay, dur), end = e.ring ? Math.max(t + dur, te) : t + dur;
  const g = c.createGain(), src = c.createGain(); let lg = null;
  if (d.vibrato) {
    const l = c.createOscillator(); lg = c.createGain(); l.frequency.value = d.vibrato.rate;
    lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(d.vibrato.depth, t + d.vibrato.delay + 0.25);
    l.connect(lg); l.start(t); l.stop(end + e.release + 0.1);
  }
  for (const o of d.osc) {
    const x = c.createOscillator(), og = c.createGain();
    if (o.wave === 'pulse') x.setPeriodicWave(rig.pulse(o.duty || 0.5)); else x.type = o.wave === 'saw' ? 'sawtooth' : o.wave;
    x.frequency.value = f * (o.ratio || 1); x.detune.value = o.detune || 0; og.gain.value = o.gain ?? 1;
    if (lg) lg.connect(x.detune);
    x.connect(og); og.connect(src); x.start(t); x.stop(end + e.release + 0.1);
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
/* Percusión: cada pieza es una lista de capas (oscilador con barrido o ráfaga de ruido). */
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
