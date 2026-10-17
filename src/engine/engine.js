/* Motor de audio: Rig (grafo de audio: pistas, envíos, maestro) + Player (planificador con reloj de audio) + exportación WAV. */
CS.Rig = class {
  constructor(ctx, bpm) {
    this.ctx = ctx; this.waves = {}; this.all = new Set(); this.strips = new WeakMap(); this.fx = {};
    this.master = ctx.createGain();
    const cp = ctx.createDynamicsCompressor(); cp.threshold.value = -14; cp.knee.value = 20; cp.ratio.value = 4;
    this.master.connect(cp); cp.connect(ctx.destination);
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = this.noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    for (const e of Object.values(CS.fx)) {
      const k = CS.kinds[e.kind]; if (!k) { CS.errors.push(`Efecto ${e.id}: tipo "${e.kind}" desconocido`); continue; }
      const n = k(ctx, e.params || {}), o = ctx.createGain(); o.gain.value = e.level ?? 1; n.output.connect(o); o.connect(this.master);
      this.fx[e.id] = n; if (n.setBpm) n.setBpm(bpm);
    }
  }
  setBpm(b) { for (const n of Object.values(this.fx)) if (n.setBpm) n.setBpm(b); }
  pulse(d) {
    if (this.waves[d]) return this.waves[d];
    const N = 40, re = new Float32Array(N), im = new Float32Array(N);
    for (let n = 1; n < N; n++) re[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * d);
    return (this.waves[d] = this.ctx.createPeriodicWave(re, im));
  }
  burst(t, dest, hz, q, d, v, type = 'bandpass') {
    const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noise; f.type = type; f.frequency.value = Math.min(hz, 18000); f.Q.value = q;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0005, t + d);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t + d + 0.02);
  }
  strip(tr, solo) {
    let s = this.strips.get(tr);
    if (!s) { const g = this.ctx.createGain(), p = this.ctx.createStereoPanner(); g.connect(p); p.connect(this.master); s = { g, p, sends: {} }; this.strips.set(tr, s); this.all.add(s); }
    s.g.gain.value = tr.mute || (solo && !tr.solo) ? 0 : tr.volume; s.p.pan.value = tr.pan || 0;
    for (const [id, a] of Object.entries(tr.fx || {})) {
      if (!this.fx[id]) continue;
      let sd = s.sends[id]; if (!sd) { sd = s.sends[id] = this.ctx.createGain(); s.p.connect(sd); sd.connect(this.fx[id].input); }
      sd.gain.value = a;
    }
    for (const id in s.sends) if (!(tr.fx && id in tr.fx)) s.sends[id].gain.value = 0;
    return s.g;
  }
  hit(tr, pitch, t, dur, vel, solo) {
    const g = this.strip(tr, solo), d = CS.getInst(tr.instrument); if (!d) return;
    if (d.id === 'drums') CS.drumHit(this, d, pitch, t, vel, g); else CS.voice(this, d, CS.hz(CS.midi(pitch)), t, dur, vel, g);
  }
  cut() { this.all.forEach((s) => s.g.disconnect()); this.all.clear(); this.strips = new WeakMap(); }   // silencia todo lo programado
};

CS.engine = (() => {
  let ctx, rig, timer, q = [], P = null, lastBpm = 0;
  const E = {
    vol: 0.7, metro: false,
    get playing() { return !!P; },
    init() {
      if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); rig = new CS.Rig(ctx, 120); rig.master.gain.value = E.vol; }
      if (ctx.state === 'suspended') ctx.resume(); return ctx;
    },
    setVol(v) { E.vol = v; if (rig) rig.master.gain.value = v; },
    solo: (s) => s.tracks.some((t) => t.solo),
    preview(song, tr, pitch, dur = 0.25, vel = 1) { E.init(); rig.hit(tr, pitch, ctx.currentTime + 0.01, dur, vel, E.solo(song)); },
    refresh(song) { if (rig) { const so = E.solo(song); song.tracks.forEach((t) => rig.strip(t, so)); } },
    play(song, o = {}) {
      E.init(); E.stop();
      const from = o.from || 0; P = { song, loop: o.loop !== false, step: from, from, to: o.to > from ? o.to : 0, t: ctx.currentTime + 0.08, end: 0 }; q = []; lastBpm = 0;
      timer = setInterval(E._tick, 25); E._tick();
    },
    _tick() {
      if (!P) return; const s = P.song;
      while (!P.end && P.t < ctx.currentTime + 0.12) {
        if (s.bpm !== lastBpm) { lastBpm = s.bpm; rig.setBpm(s.bpm); }
        const sd = 60 / s.bpm / 4, so = E.solo(s);
        for (const tr of s.tracks) for (const n of tr.notes) if (n.step === P.step) rig.hit(tr, n.pitch, P.t, n.len * sd, n.vel ?? 1, so);
        if (E.metro && P.step % 4 === 0) E._click(P.t, P.step % 16 === 0);
        q.push({ s: P.step, t: P.t, sd }); P.t += sd; P.step++;
        const lim = Math.min(P.to || 1e9, s.bars * 16); if (P.step >= lim) { if (P.loop) P.step = P.from; else P.end = P.t + 1.5; }
      }
      if (P.end && ctx.currentTime > P.end) E.stop();
    },
    _click(t, acc) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = acc ? 1500 : 1000;
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04); o.connect(g); g.connect(rig.master); o.start(t); o.stop(t + 0.05);
    },
    stop() { clearInterval(timer); P = null; q = []; if (rig) rig.cut(); },
    /** Posición actual en pasos (fraccionaria) o null. */
    pos() {
      if (!P || !ctx) return null; const n = ctx.currentTime;
      while (q.length > 1 && q[1].t <= n) q.shift();
      const h = q[0]; return h && h.t <= n ? h.s + Math.min(1, (n - h.t) / h.sd) : null;
    },
    async wav(song) {
      const sr = 44100, sd = 60 / song.bpm / 4, T = song.bars * 16 * sd, oc = new OfflineAudioContext(2, Math.ceil((T + 2) * sr), sr), r = new CS.Rig(oc, song.bpm), so = E.solo(song);
      for (const tr of song.tracks) for (const n of tr.notes) r.hit(tr, n.pitch, 0.01 + n.step * sd, n.len * sd, n.vel ?? 1, so);
      const b = await oc.startRendering(), n = b.length, ch = [b.getChannelData(0), b.getChannelData(1)];
      let pk = 0; for (const c of ch) for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(c[i]));
      const k = pk > 0 ? 0.9 / pk : 1, a = new ArrayBuffer(44 + n * 4), v = new DataView(a), w = (o, t) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
      w(0, 'RIFF'); v.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
      v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 4, true);
      let o = 44; for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) { v.setInt16(o, CS.clamp(ch[c][i] * k, -1, 1) * 32767, true); o += 2; }
      return new Blob([a], { type: 'audio/wav' });
    },
  };
  return E;
})();
