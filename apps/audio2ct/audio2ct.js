'use strict';
    // ============================================================
    // AUDIO2CT v3 · BASIC PITCH + CLASIFICADOR DE ROLES CHIPTUNE
    // ------------------------------------------------------------
    // Motor principal: @spotify/basic-pitch (ML polifónico, igual
    // que Chiptune-transcriber.html). El clasificador de pistas
    // (melodía / armonía / bajo / agudos / batería) se hace sobre
    // las notas que devuelve el modelo, y luego se mapea al
    // catálogo de Chiptune Studio con auto-instrumento.
    // Fallback espectral si la CDN falla.
    // ============================================================

    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const BASE = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};

    const midiOf = p => {
      const m = /^([A-G])([#b]?)(-?\d)$/i.exec(p);
      return m ? 12 * (+m[3] + 1) + BASE[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) : null;
    };
    const nameOf = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
    const hz = m => 440 * 2 ** ((m - 69) / 12);
    const DR = ['crash','openhat','hat','clap','tom','snare','kick'];

    const INST = {
      pulse25:{n:'Pulso 25% (lead clásico)',g:'Chip clásico',c:'#ffc83d',lo:48,hi:96,p:0,P:{o:[{w:.25}],a:.15,A:.004,D:.15,S:.75,R:.1}},
      pulse50:{n:'Cuadrada 50%',g:'Chip clásico',c:'#ff8a5c',lo:48,hi:96,p:.1,P:{o:[{w:.5}],a:.1,A:.004,D:.15,S:.75,R:.1}},
      pulse12:{n:'Pulso 12.5% (arpegios)',g:'Chip clásico',c:'#4fe3c1',lo:60,hi:108,p:-.35,P:{o:[{w:.125}],a:.15,A:.003,D:.1,S:.7,R:.08}},
      triangle:{n:'Triángulo',g:'Chip clásico',c:'#6db4ff',lo:36,hi:84,p:.2,P:{o:[{w:'triangle'}],a:.28,A:.004,D:.15,S:.8,R:.1}},
      saw:{n:'Sierra',g:'Chip clásico',c:'#c68cff',lo:36,hi:84,p:-.2,P:{o:[{w:'sawtooth'}],a:.08,A:.004,D:.15,S:.75,R:.1}},
      bass:{n:'Bajo NES (triángulo)',g:'Chip clásico',c:'#ff5d8f',lo:24,hi:60,p:0,P:{o:[{w:'triangle'},{w:.25,m:2,g:.3}],a:.34,A:.003,D:.1,S:.8,R:.08}},
      lead:{n:'Lead sintético',g:'Melódicos',c:'#ffa63d',lo:48,hi:96,p:0,P:{o:[{w:'sawtooth'},{w:'sawtooth',d:12,g:.7}],a:.09,A:.012,D:.12,S:.75,R:.1,fl:[7,3.5,.2,1],vib:[5.5,12,.25]}},
      flute:{n:'Flauta',g:'Melódicos',c:'#9be8ff',lo:60,hi:108,p:-.15,P:{o:[{w:'sine'},{w:'triangle',m:2,g:.12}],a:.3,A:.07,D:.1,S:.85,R:.12,vib:[5.2,14,.15],nz:[2,2,.12,.5]}},
      brass:{n:'Trompeta / metales',g:'Melódicos',c:'#ffd24d',lo:48,hi:84,p:.15,P:{o:[{w:'sawtooth'},{w:'sawtooth',d:7,g:.6}],a:.1,A:.04,D:.12,S:.8,R:.08,fl:[1.3,6,.1,1],vib:[5.5,10,.3]}},
      strings:{n:'Cuerdas',g:'Melódicos',c:'#e68cff',lo:36,hi:84,p:-.25,P:{o:[{w:'sawtooth',d:-9},{w:'sawtooth',d:9},{w:'sawtooth',m:2,g:.5}],a:.06,A:.18,D:.2,S:.85,R:.25,fl:[4,4,.1,.7],vib:[5,8,.35]}},
      organ:{n:'Órgano',g:'Melódicos',c:'#ff7ab8',lo:36,hi:84,p:.3,P:{o:[{w:'sine',m:.5,g:.5},{w:'sine'},{w:'sine',m:2,g:.6},{w:'sine',m:3,g:.3},{w:.5,g:.15}],a:.11,A:.01,D:.02,S:1,R:.04,vib:[6,5,0]}},
      choir:{n:'Coro (voces)',g:'Melódicos',c:'#b8ff8a',lo:48,hi:84,p:0,P:{o:[{w:'sawtooth',d:-8},{w:'sawtooth',d:8}],a:.5,A:.15,D:.1,S:.9,R:.25,fm:[[800,6,1],[1150,8,.7],[2800,10,.25]],vib:[5,12,.3]}},
      piano:{n:'Piano chip',g:'Teclas y plectro',c:'#7bd0ff',lo:36,hi:96,p:.1,P:{o:[{w:.25},{w:'triangle',g:.8}],a:.2,A:.004,D:.6,S:.12,R:.15,fl:[9,2.5,.4,1],nz:[6,.7,.015,.5]}},
      bell:{n:'Campanas / glockenspiel',g:'Teclas y plectro',c:'#fff08a',lo:72,hi:108,p:.4,P:{o:[{w:'sine'},{w:'sine',m:2.76,g:.45},{w:'sine',m:5.4,g:.2}],a:.2,A:.002,D:1.2,S:0,R:.4,ring:1}},
      guitar:{n:'Guitarra pulsada',g:'Teclas y plectro',c:'#ff9a6b',lo:36,hi:84,p:-.35,P:{o:[{w:'sawtooth'},{w:.5,g:.3}],a:.18,A:.003,D:.35,S:.18,R:.12,fl:[10,2,.25,2],nz:[5,.8,.02,.4]}},
      acousticGuitar:{n:'Guitarra acústica (chip)',g:'Guitarras chiptune',c:'#e7a96b',lo:36,hi:96,p:-.25,P:{o:[{w:'triangle'},{w:'sine',m:2,g:.42},{w:.5,m:3,g:.12}],a:.24,A:.003,D:.62,S:.08,R:.16,fl:[12,1.7,.28,1.1],nz:[5,.8,.018,.22]}},
      electricGuitar:{n:'Guitarra eléctrica (chip)',g:'Guitarras chiptune',c:'#ff6685',lo:36,hi:96,p:.25,P:{o:[{w:'sawtooth'},{w:.5,g:.5},{w:'square',m:2,g:.18}],a:.12,A:.003,D:.4,S:.24,R:.12,fl:[8,3,.16,2.4]}},
      bass2:{n:'Bajo eléctrico',g:'Teclas y plectro',c:'#ff4d6d',lo:24,hi:60,p:0,P:{o:[{w:'sawtooth'},{w:'sine',m:.5,g:.8}],a:.3,A:.004,D:.18,S:.55,R:.07,fl:[14,3.5,.15,3]}},
      supersaw:{n:'Supersaw (lead EDM)',g:'Electrónicos',c:'#ff5bce',lo:48,hi:96,p:0,P:{o:[{w:'sawtooth',d:-24,g:.55},{w:'sawtooth',d:-16,g:.7},{w:'sawtooth',d:-8,g:.85},{w:'sawtooth'},{w:'sawtooth',d:8,g:.85},{w:'sawtooth',d:16,g:.7},{w:'sawtooth',d:24,g:.55}],a:.11,A:.025,D:.2,S:.78,R:.16,fl:[8,5,.12,.8]}},
      wobble:{n:'Bajo wobble',g:'Electrónicos',c:'#68f0dc',lo:24,hi:60,p:0,P:{o:[{w:'sawtooth'},{w:'square',m:.5,g:.75}],a:.28,A:.008,D:.3,S:.62,R:.1,fl:[8,8,.1,1.2],lfo:[2.5,.12,.95]}},
      pad:{n:'Pad ambiente',g:'Ambiente',c:'#8ab4ff',lo:36,hi:84,p:.25,P:{o:[{w:'triangle',d:-10},{w:'triangle',d:10},{w:'sine',m:.5,g:.5}],a:.1,A:.5,D:.4,S:.8,R:.8,fl:[3,3,.1,.5],vib:[4.5,6,.6]}},
      drums:{n:'Batería',g:'Percusión',c:'#9aa3c7',p:0}
    };
    const FX=[
      {id:'tremolo',name:'Trémolo'},{id:'chorus',name:'Chorus'},{id:'flanger',name:'Flanger'},
      {id:'phaser',name:'Phaser'},{id:'wah',name:'Wah'},{id:'compressor',name:'Compresor'},
      {id:'drive',name:'Overdrive'},
      {id:'fuzz',name:'Fuzz'},{id:'bitcrush',name:'Bitcrusher'},{id:'delay',name:'Delay'},
      {id:'reverb',name:'Reverb'}
    ];

    const pct = (a, p) => Float32Array.from(a).sort()[Math.floor((a.length - 1) * p)] || 0;
    const qv = x => x > .82 ? 1 : x > .62 ? .8 : x > .48 ? .6 : .45;

    // --- Estado global ---
    let audioCtx = null;
    let reverbBuffer = null;
    let masterGain = null;
    let reverbNode = null;
    let audioBuffer = null;
    let F = null;                  // análisis espectral (fallback / info)
    let bpNotes = null;            // notas crudas de Basic Pitch [{midi,start,duration,amplitude}]
    let currentSong = null;
    let originalFileName = '';
    let isPlaying = false;
    let activeScheduledSources = [];
    let activePlaybackNodes = [];
    let scheduledTimeouts = [];
    let playSource = null;
    let playStartTime = 0;
    let playDuration = 0;
    let animFrameId = null;
    let analyserNode = null;
    let currentPlayType = null;
    let masterVolume = 0.7;
    let reverbAmount = 0.15;
    let noiseBuffer = null;
    let waves = {};
    const statusLog = [];

    let basicPitch = null;         // instancia cargada
    let basicPitchModule = null;   // módulo con helpers (addPitchBendsToNoteEvents, noteFramesToTime, outputToNotesPoly)
    let tempoManuallySet = false;

    // --- Logs y Modales ---
    function log(msg, type = 'info') {
      const entry = { time: new Date().toLocaleTimeString(), msg, type };
      statusLog.push(entry);
      if (statusLog.length > 200) statusLog.shift();
      renderLog();
    }

    function renderLog() {
      const list = $('#logList');
      if (!list) return;
      list.innerHTML = statusLog.map(e => `<div class="${e.type}">[${e.time}] ${e.msg}</div>`).join('');
      const body = list.parentElement;
      if (body) body.scrollTop = body.scrollHeight;
    }

    function setGlobalStatus(text, type = 'idle') {
      const el = $('#globalStatus');
      el.className = `status-badge ${type}`;
      el.innerHTML = type === 'processing'
        ? `<span class="spinner"></span> ${text}`
        : `<span style="width:6px;height:6px;border-radius:50%;background:currentColor;"></span> ${text}`;
    }

    function showLoading(text, showProgress = false) {
      $('#loadingText').textContent = text;
      $('#loadingProgressWrap').style.display = showProgress ? 'block' : 'none';
      $('#loadingProgress').style.width = '0%';
      $('#loadingOverlay').classList.add('active');
    }
    function setLoadingProgress(p) {
      $('#loadingProgress').style.width = `${Math.round(p * 100)}%`;
    }
    function hideLoading() {
      $('#loadingOverlay').classList.remove('active');
    }

    // --- Audio Context & Síntesis Chiptune ---
    function createAudioContext() {
      if (audioCtx) return;
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = masterVolume;

      const len = Math.floor(audioCtx.sampleRate * 1.4);
      const ir = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = ir.getChannelData(c);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
      }
      reverbBuffer = ir;
      const convolver = audioCtx.createConvolver();
      convolver.buffer = ir;
      reverbNode = audioCtx.createGain();
      reverbNode.gain.value = reverbAmount;

      masterGain.connect(audioCtx.destination);
      masterGain.connect(convolver);
      convolver.connect(reverbNode);
      reverbNode.connect(audioCtx.destination);

      noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
      const nd = noiseBuffer.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      waves = {};
    }

    function ensureAudioContext() {
      if (!audioCtx) createAudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function getWave(d) {
      if (waves[d]) return waves[d];
      const N = 40, re = new Float32Array(N), im = new Float32Array(N);
      for (let n = 1; n < N; n++) re[n] = 2 / (n * Math.PI) * Math.sin(n * Math.PI * d);
      return (waves[d] = audioCtx.createPeriodicWave(re, im));
    }

    function trackPlaybackNode(node) {
      activePlaybackNodes.push(node);
      return node;
    }

    function stopPlayback() {
      if (playSource) {
        try { playSource.stop(); } catch(e) {}
        playSource = null;
      }
      for (const src of activeScheduledSources) {
        try { src.stop(); } catch(e) {}
      }
      activeScheduledSources = [];
      for (const node of activePlaybackNodes) {
        try { node.disconnect(); } catch(e) {}
      }
      activePlaybackNodes = [];
      for (const tid of scheduledTimeouts) clearTimeout(tid);
      scheduledTimeouts = [];

      if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
      if (analyserNode) { try { analyserNode.disconnect(); } catch(e) {} analyserNode = null; }
      isPlaying = false;
      currentPlayType = null;
      $('#playhead').style.display = 'none';
      $('#playhead').style.left = '0px';
      $('#btnStop').disabled = true;
      setGlobalStatus('Listo', 'idle');
    }

    function synthTone(w, f, t, dur, v, dest) {
      const o = trackPlaybackNode(audioCtx.createOscillator()), g = trackPlaybackNode(audioCtx.createGain()), e = t + dur;
      typeof w === 'number' ? o.setPeriodicWave(getWave(w)) : o.type = w;
      o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .004);
      g.gain.linearRampToValueAtTime(v * .75, t + Math.min(dur, .15)); g.gain.setTargetAtTime(0, e, .025);
      o.connect(g).connect(dest); o.start(t); o.stop(e + .25);
      activeScheduledSources.push(o);
    }

    function synthNoise(hp, d, v, t, dest) {
      const s = trackPlaybackNode(audioCtx.createBufferSource()), f = trackPlaybackNode(audioCtx.createBiquadFilter()), g = trackPlaybackNode(audioCtx.createGain());
      s.buffer = noiseBuffer; f.type = 'highpass'; f.frequency.value = hp; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
      s.connect(f).connect(g).connect(dest); s.start(t); s.stop(t + d + .02);
      activeScheduledSources.push(s);
    }

    function synthNB(t, dest, hzVal, q, d, v) {
      const s = trackPlaybackNode(audioCtx.createBufferSource()), f = trackPlaybackNode(audioCtx.createBiquadFilter()), g = trackPlaybackNode(audioCtx.createGain());
      s.buffer = noiseBuffer; f.type = 'bandpass'; f.frequency.value = Math.min(hzVal, 18000); f.Q.value = q; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0005, t + d);
      s.connect(f).connect(g).connect(dest); s.start(t); s.stop(t + d + .02);
      activeScheduledSources.push(s);
    }

    function synthNoteEffects(input, fx, t, dur, dest) {
      let current = input;
      const mix = (amount, build) => {
        const sum = trackPlaybackNode(audioCtx.createGain());
        const dry = trackPlaybackNode(audioCtx.createGain());
        const wet = trackPlaybackNode(audioCtx.createGain());
        dry.gain.value = 1 - amount * .2;
        wet.gain.value = amount * .65;
        current.connect(dry).connect(sum);
        build(current).connect(wet).connect(sum);
        current = sum;
      };
      for (const { id } of FX) {
        const amount = clamp(Number(fx?.[id]) || 0, 0, 1);
        if (!amount) continue;
        if (id === 'tremolo') {
          const amp = trackPlaybackNode(audioCtx.createGain());
          const lfo = trackPlaybackNode(audioCtx.createOscillator());
          const depth = trackPlaybackNode(audioCtx.createGain());
          amp.gain.value = 1 - amount * .4; depth.gain.value = amount * .4;
          lfo.frequency.value = 4 + amount * 8;
          current.connect(amp); lfo.connect(depth).connect(amp.gain);
          lfo.start(t); lfo.stop(t + dur + .2); activeScheduledSources.push(lfo); current = amp;
        } else if (id === 'wah') {
          const filter = trackPlaybackNode(audioCtx.createBiquadFilter());
          const lfo = trackPlaybackNode(audioCtx.createOscillator());
          const depth = trackPlaybackNode(audioCtx.createGain());
          filter.type = 'bandpass'; filter.Q.value = 2 + amount * 8; filter.frequency.value = 900 + amount * 1200;
          lfo.frequency.value = 1.5 + amount * 4; depth.gain.value = (900 + amount * 1200) * .7;
          lfo.connect(depth).connect(filter.frequency); current.connect(filter);
          lfo.start(t); lfo.stop(t + dur + .2); activeScheduledSources.push(lfo); current = filter;
        } else if (id === 'compressor') {
          const compressor = trackPlaybackNode(audioCtx.createDynamicsCompressor());
          compressor.threshold.value = -18 - amount * 24; compressor.knee.value = 18;
          compressor.ratio.value = 1 + amount * 11; compressor.attack.value = .003;
          compressor.release.value = .12; current.connect(compressor); current = compressor;
        } else if (id === 'phaser') {
          mix(amount, inputNode => {
            const filters = Array.from({ length: 4 }, (_, i) => {
              const filter = trackPlaybackNode(audioCtx.createBiquadFilter());
              filter.type = 'allpass'; filter.frequency.value = 350 * 2 ** i; filter.Q.value = 1.2;
              return filter;
            });
            filters.reduce((node, filter) => node.connect(filter), inputNode);
            const lfo = trackPlaybackNode(audioCtx.createOscillator());
            const depth = trackPlaybackNode(audioCtx.createGain());
            lfo.frequency.value = .25 + amount * 1.8; depth.gain.value = 200 + amount * 700;
            for (const filter of filters) lfo.connect(depth).connect(filter.frequency);
            lfo.start(t); lfo.stop(t + dur + .2); activeScheduledSources.push(lfo);
            return filters[filters.length - 1];
          });
        } else if (id === 'chorus' || id === 'flanger') {
          mix(amount, inputNode => {
            const delay = trackPlaybackNode(audioCtx.createDelay(.08));
            const lfo = trackPlaybackNode(audioCtx.createOscillator());
            const depth = trackPlaybackNode(audioCtx.createGain());
            const chorus = id === 'chorus';
            delay.delayTime.value = chorus ? .018 : .003;
            lfo.frequency.value = chorus ? .25 + amount * 1.5 : .15 + amount * 4;
            depth.gain.value = (chorus ? .004 : .0025) * amount;
            lfo.connect(depth).connect(delay.delayTime); inputNode.connect(delay);
            lfo.start(t); lfo.stop(t + dur + .2); activeScheduledSources.push(lfo);
            return delay;
          });
        } else if (id === 'delay') {
          mix(amount, inputNode => {
            const sum = trackPlaybackNode(audioCtx.createGain());
            const beat = 60 / (currentSong?.bpm || 120);
            const taps = [beat, beat * 2, beat * 3];
            taps.forEach((time, i) => {
              const delay = trackPlaybackNode(audioCtx.createDelay(Math.max(1, time + .01)));
              const gain = trackPlaybackNode(audioCtx.createGain());
              delay.delayTime.value = time; gain.gain.value = .52 * (.62 ** i);
              inputNode.connect(delay).connect(gain).connect(sum);
            });
            return sum;
          });
        } else if (id === 'reverb') {
          mix(amount, inputNode => {
            const convolver = trackPlaybackNode(audioCtx.createConvolver());
            convolver.buffer = reverbBuffer; inputNode.connect(convolver); return convolver;
          });
        } else if (id === 'drive' || id === 'fuzz' || id === 'bitcrush') {
          mix(amount, inputNode => {
            const shaper = trackPlaybackNode(audioCtx.createWaveShaper());
            const curve = new Float32Array(2048);
            if (id === 'bitcrush') {
              const levels = 2 ** Math.round(12 - amount * 9);
              for (let i = 0; i < curve.length; i++) {
                const x = i * 2 / (curve.length - 1) - 1;
                curve[i] = Math.round(x * levels) / levels;
              }
            } else {
              const drive = id === 'fuzz' ? 4 + amount * 28 : 1 + amount * 12;
              const normalizer = Math.tanh(drive);
              for (let i = 0; i < curve.length; i++) {
                const x = i * 2 / (curve.length - 1) - 1;
                curve[i] = Math.tanh(x * drive) / normalizer;
              }
            }
            shaper.curve = curve; shaper.oversample = '2x'; inputNode.connect(shaper); return shaper;
          });
        }
      }
      current.connect(dest);
    }

    function synthVoice(P, f, t, dur, v, dest, fx = null) {
      const g = trackPlaybackNode(audioCtx.createGain()), src = trackPlaybackNode(audioCtx.createGain()), a = Math.min(P.A, dur * .8), vol = v * P.a, te = P.ring ? t + a + P.D : t + Math.min(a + P.D, dur), end = P.ring ? Math.max(t + dur, te) : t + dur;
      let lg = null;
      if (P.vib) {
        const l = trackPlaybackNode(audioCtx.createOscillator()); lg = trackPlaybackNode(audioCtx.createGain());
        l.frequency.value = P.vib[0]; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(P.vib[1], t + P.vib[2] + .25);
        l.connect(lg); l.start(t); l.stop(end + P.R + .1);
        activeScheduledSources.push(l);
      }
      for (const o of P.o) {
        const x = trackPlaybackNode(audioCtx.createOscillator()), og = trackPlaybackNode(audioCtx.createGain());
        typeof o.w === 'number' ? x.setPeriodicWave(getWave(o.w)) : x.type = o.w;
        x.frequency.value = f * (o.m || 1); x.detune.value = o.d || 0; og.gain.value = o.g ?? 1;
        if (lg) lg.connect(x.detune);
        x.connect(og).connect(src); x.start(t); x.stop(end + P.R + .1);
        activeScheduledSources.push(x);
      }
      if (P.fm) {
        for (const [hzVal, q, gn] of P.fm) {
          const b = trackPlaybackNode(audioCtx.createBiquadFilter()), bg = trackPlaybackNode(audioCtx.createGain());
          b.type = 'bandpass'; b.frequency.value = hzVal; b.Q.value = q; bg.gain.value = gn;
          src.connect(b).connect(bg).connect(g);
        }
      } else if (P.fl) {
        const fl = trackPlaybackNode(audioCtx.createBiquadFilter()); fl.type = 'lowpass'; fl.Q.value = P.fl[3];
        fl.frequency.setValueAtTime(Math.min(f * P.fl[0], 16000), t);
        fl.frequency.exponentialRampToValueAtTime(Math.min(f * P.fl[1], 16000), t + P.fl[2]);
        src.connect(fl).connect(g);
        if (P.lfo) {
          const l = trackPlaybackNode(audioCtx.createOscillator()), mod = trackPlaybackNode(audioCtx.createGain());
          const low = Math.min(P.lfo[1], P.lfo[2]), high = Math.max(P.lfo[1], P.lfo[2]), base = Math.min(f * P.fl[0], 16000);
          l.frequency.value = P.lfo[0]; mod.gain.value = base * (high - low) / 2;
          fl.frequency.cancelScheduledValues(t);
          fl.frequency.setValueAtTime(Math.max(20, base * (high + low) / 2), t);
          l.connect(mod).connect(fl.frequency); l.start(t); l.stop(end + P.R + .1);
          activeScheduledSources.push(l);
        }
      } else src.connect(g);

      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + a);
      g.gain.linearRampToValueAtTime(vol * P.S, te); g.gain.setTargetAtTime(0, end, P.R / 3);
      if (fx && Object.keys(fx).length) synthNoteEffects(g, fx, t, dur, dest);
      else g.connect(dest);
      if (P.nz) synthNB(t, dest, f * P.nz[0], P.nz[1], P.nz[2], vol * P.nz[3]);
    }

    function synthDrum(k, t, dest, v = 1) {
      if (k === 'kick' || k === 'tom') {
        const tm = k === 'tom', o = trackPlaybackNode(audioCtx.createOscillator()), g = trackPlaybackNode(audioCtx.createGain());
        o.frequency.setValueAtTime(tm ? 230 : 160, t);
        o.frequency.exponentialRampToValueAtTime(tm ? 110 : 42, t + (tm ? .18 : .1));
        g.gain.setValueAtTime((tm ? .6 : .9) * v, t);
        g.gain.exponentialRampToValueAtTime(.001, t + (tm ? .35 : .28));
        o.connect(g).connect(dest); o.start(t); o.stop(t + .4);
        activeScheduledSources.push(o);
      } else if (k === 'snare') {
        synthNoise(1500, .16, .35 * v, t, dest);
        synthTone('triangle', 190, t, .06, .25 * v, dest);
      } else if (k === 'clap') {
        for (let i = 0; i < 3; i++) synthNB(t + i * .011, dest, 1400, 1, i === 2 ? .18 : .03, .5 * v);
      } else if (k === 'hat') synthNoise(7500, .05, .18 * v, t, dest);
      else if (k === 'openhat') synthNoise(6500, .3, .18 * v, t, dest);
      else if (k === 'crash') synthNoise(5000, .95, .22 * v, t, dest);
    }

    function synthHit(track, pitch, t, dur, dest, vel = 1, fx = null) {
      if (track.instrument === 'drums') {
        if (!fx || !Object.keys(fx).length) return synthDrum(pitch, t, dest, vel);
        const source = trackPlaybackNode(audioCtx.createGain());
        synthDrum(pitch, t, source, vel);
        synthNoteEffects(source, fx, t, dur, dest);
        return;
      }
      const m = midiOf(pitch);
      if (m === null) return;
      const P = INST[track.instrument]?.P || INST.pulse25.P;
      synthVoice(P, hz(m), t, dur, vel, dest, fx);
    }

    // ============================================================
    // CARGA DE BASIC PITCH (ML de Spotify, mismo que el transcriber)
    // ============================================================
    async function loadBasicPitch() {
      if (basicPitch) return true;
      try {
        const mod = await import('https://cdn.jsdelivr.net/npm/@spotify/basic-pitch@1.0.1/+esm');
        basicPitchModule = mod;
        // El modelo viene del mismo CDN
        const modelUrl = 'https://cdn.jsdelivr.net/npm/@spotify/basic-pitch@1.0.1/model/model.json';
        basicPitch = new mod.BasicPitch(modelUrl);
        log('Basic Pitch cargado desde CDN.', 'ok');
        $('#enginePill').textContent = 'Motor: Basic Pitch';
        return true;
      } catch (e) {
        log('No se pudo cargar Basic Pitch (' + e.message + '). Solo se estimará la batería; no habrá transcripción de alturas.', 'warn');
        $('#enginePill').textContent = 'Respaldo: solo batería';
        return false;
      }
    }

    // Resampleo a 22050 Hz mono (Basic Pitch espera 22050 Hz).
    async function resampleTo22050(buffer) {
      const TARGET_SR = 22050;
      if (buffer.sampleRate === TARGET_SR && buffer.numberOfChannels === 1) {
        return buffer.getChannelData(0);
      }
      const length = Math.ceil(buffer.duration * TARGET_SR);
      const offlineCtx = new OfflineAudioContext(1, length, TARGET_SR);
      const src = offlineCtx.createBufferSource();
      src.buffer = buffer;
      src.connect(offlineCtx.destination);
      src.start();
      const rendered = await offlineCtx.startRendering();
      return rendered.getChannelData(0);
    }

    // Transcripción con Basic Pitch
    async function transcribeWithBasicPitch(buffer, startSec, durSec) {
      const ok = await loadBasicPitch();
      if (!ok) return null;

      // Recortar la región de interés antes de resamplear
      const sr = buffer.sampleRate;
      const startSample = Math.floor(startSec * sr);
      const durSamples = Math.floor(durSec * sr);
      const cropLen = Math.min(durSamples, buffer.length - startSample);
      if (cropLen <= 0) throw new Error('Región de audio inválida');

      const cropped = audioCtx.createBuffer(
        buffer.numberOfChannels,
        cropLen,
        sr
      );
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        const src = buffer.getChannelData(c);
        const dst = cropped.getChannelData(c);
        dst.set(src.subarray(startSample, startSample + cropLen));
      }

      const samples = await resampleTo22050(cropped);

      const overlapSeconds = 1;
      const maxModelChunkSeconds = 180;
      const coreSeconds = maxModelChunkSeconds - 2 * overlapSeconds;
      const chunkCount = Math.ceil(samples.length / (coreSeconds * 22050));
      const timedNotes = [];
      const onsetThr = +$('#onsetThr').value || 0.3;
      const frameThr = +$('#sensNotes').value || 0.5;

      for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
        const coreStart = chunkIndex * coreSeconds;
        const coreEnd = Math.min(durSamples / 22050, coreStart + coreSeconds);
        const chunkStart = Math.max(0, coreStart - overlapSeconds);
        const chunkEnd = Math.min(durSamples / 22050, coreEnd + overlapSeconds);
        const firstSample = Math.floor(chunkStart * 22050);
        const lastSample = Math.min(samples.length, Math.ceil(chunkEnd * 22050));
        const chunkSamples = samples.subarray(firstSample, lastSample);
        const monoBuffer = {
          length: chunkSamples.length,
          sampleRate: 22050,
          numberOfChannels: 1,
          getChannelData: () => chunkSamples
        };
        const frames = [], onsets = [], contours = [];

        await basicPitch.evaluateModel(
          monoBuffer,
          (f, o, c) => { frames.push(...f); onsets.push(...o); contours.push(...c); },
          progress => setLoadingProgress((chunkIndex + progress) / chunkCount)
        );

        const frameThreshold = clamp(0.5 - (frameThr - 0.5) * 0.6, 0.05, 0.9);
        const onsetThreshold = clamp(onsetThr, 0.05, 0.9);
        const notesPoly = basicPitchModule.outputToNotesPoly(
          frames, onsets, onsetThreshold, frameThreshold, 3
        );
        const notesWithBends = basicPitchModule.addPitchBendsToNoteEvents(contours, notesPoly);
        const chunkNotes = basicPitchModule.noteFramesToTime(notesWithBends);
        const coreStartInChunk = coreStart - chunkStart;
        const coreEndInChunk = coreEnd - chunkStart;

        for (const note of chunkNotes) {
          if (note.startTimeSeconds < coreStartInChunk || note.startTimeSeconds >= coreEndInChunk) continue;
          timedNotes.push({
            midi: note.pitchMidi,
            start: chunkStart + note.startTimeSeconds,
            duration: note.durationSeconds,
            amplitude: note.amplitude ?? 0.7
          });
        }
      }

      return timedNotes.map(n => ({
        midi: n.midi,
        start: n.start,
        duration: n.duration,
        amplitude: n.amplitude
      }));
    }

    // ============================================================
    // ANÁLISIS ESPECTRAL (fallback + info para batería y centroide)
    // Reutilizamos la maquinaria anterior, pero ya no se usa para
    // decidir pitch: solo para clasificar batería y calcular centroide.
    // ============================================================
    const N = 4096, HOP = 512, SR = 22050, NP = 81, WH = [1, .7, .5, .35];
    const win = Float32Array.from({ length: N }, (_, i) => .5 - .5 * Math.cos(2 * Math.PI * i / N));
    const revBits = new Uint16Array(N);
    for (let i = 0; i < N; i++) {
      let r = 0;
      for (let j = 0; j < 12; j++) if (i >> j & 1) r |= 1 << (11 - j);
      revBits[i] = r;
    }
    const TC = Float32Array.from({ length: N / 2 }, (_, i) => Math.cos(2 * Math.PI * i / N));
    const TS = Float32Array.from({ length: N / 2 }, (_, i) => -Math.sin(2 * Math.PI * i / N));

    function fft(re, im) {
      for (let i = 0; i < N; i++) {
        const j = revBits[i];
        if (j > i) {
          let t = re[i]; re[i] = re[j]; re[j] = t;
          t = im[i]; im[i] = im[j]; im[j] = t;
        }
      }
      for (let sz = 2; sz <= N; sz <<= 1) {
        const h = sz >> 1, st = N / sz;
        for (let i = 0; i < N; i += sz) {
          for (let j = 0, k = 0; j < h; j++, k += st) {
            const a = i + j, b = a + h;
            const tr = re[b] * TC[k] - im[b] * TS[k];
            const ti = re[b] * TS[k] + im[b] * TC[k];
            re[b] = re[a] - tr; im[b] = im[a] - ti;
            re[a] += tr; im[a] += ti;
          }
        }
      }
    }

    async function analyzeSpectrum(buffer, startSec, durSec) {
      const x = await resampleTo22050(buffer);
      const i0 = Math.floor(startSec * SR);
      const i1 = Math.min(x.length, i0 + SR * durSec);
      const n = Math.floor((i1 - i0 - N) / HOP) + 1;
      if (n < 10) throw new Error('El audio es demasiado corto desde ese punto');

      F = {
        n,
        lo: new Float32Array(n), mid: new Float32Array(n), hi: new Float32Array(n),
        tm: new Float32Array(n), cen: new Float32Array(n),
        bKick: new Float32Array(n), bSnare: new Float32Array(n),
        bHat: new Float32Array(n), bTom: new Float32Array(n), bClap: new Float32Array(n),
        onset: new Float32Array(n)
      };

      const re = new Float32Array(N), im = new Float32Array(N);
      const mg = new Float32Array(N / 2);

      for (let f = 0; f < n; f++) {
        const o = i0 + f * HOP;
        for (let i = 0; i < N; i++) { re[i] = x[o + i] * win[i]; im[i] = 0; }
        fft(re, im);
        for (let k = 0; k < N / 2; k++) mg[k] = Math.hypot(re[k], im[k]);

        const band = (a, b) => { let s = 0; for (let k = a; k <= b; k++) s += mg[k]; return Math.log1p(s); };
        const hzToBin = h => Math.round(h * N / SR);

        F.lo[f] = band(1, 27);
        F.mid[f] = band(279, 929);
        F.hi[f] = band(1300, 2047);
        F.tm[f] = band(28, 75);
        F.bKick[f]  = band(hzToBin(30), hzToBin(90));
        F.bTom[f]   = band(hzToBin(90), hzToBin(200));
        F.bSnare[f] = band(hzToBin(200), hzToBin(400)) * 0.6 + band(hzToBin(1500), hzToBin(4000)) * 0.4;
        F.bClap[f]  = band(hzToBin(1000), hzToBin(2000));
        F.bHat[f]   = band(hzToBin(6000), hzToBin(12000));

        let cs = 0, ct = 1e-6;
        for (let k = 8; k < 1000; k++) { cs += k * mg[k]; ct += mg[k]; }
        F.cen[f] = cs / ct;

        if (f > 0) {
          F.onset[f] = Math.max(0, F.lo[f] - F.lo[f - 1]) +
                       Math.max(0, F.mid[f] - F.mid[f - 1]) +
                       Math.max(0, F.hi[f] - F.hi[f - 1]);
        }

        if (f % 400 === 0) {
          await new Promise(r => setTimeout(r, 0));
        }
      }
    }

    function detectTempo() {
      if (!F) return;
      const o = F.onset;
      const FT = HOP / SR, SH = .5 * N / SR;
      let b = null;
      for (let bpm = 70; bpm <= 180; bpm += .5) {
        const P = 60 / bpm, Pf = P / FT;
        for (let ph = 0; ph < Pf; ph++) {
          let s = 0, c = 0;
          for (let t = ph; t < o.length; t += Pf) { s += o[Math.round(t)] || 0; c++; }
          s /= c;
          if (!b || s > b.score) b = { score: s, bpm, off: ph * FT + SH };
        }
      }
      if (b) {
        $('#bpmInput').value = b.bpm.toFixed(1);
        $('#offsetMs').value = Math.round(b.off * 1000 % (60 / b.bpm / 4 * 1000));
      }
    }

    // ============================================================
    // CLASIFICADOR DE ROLES → PISTAS CHIPTUNE
    // ------------------------------------------------------------
    // Recibe las notas crudas de Basic Pitch (midi, start, duration,
    // amplitude) y construye pistas compatibles con Chiptune Studio.
    // Estrategia:
    //  1. Cuantizar a la rejilla (BPM + offset + 16 pasos/compás)
    //  2. Agrupar notas simultáneas en "candidatos polifónicos"
    //  3. Asignar cada candidato a un rol por rango + persistencia:
    //     - bass: midi < 48 (o fundamental baja persistente)
    //     - melody: la voz superior no-dron
    //     - harmony: el resto por debajo de melody
    //     - high: midi >= 84 (agudos)
    //  4. La batería se detecta del análisis espectral (kick/snare/hat)
    //     porque Basic Pitch no distingue percusión.
    // ============================================================
    function quantizeAndSplitNotes(rawNotes, bpm, offsetSec, durSec, maxPoly, maxTracks) {
      const sd = 60 / bpm / 4;              // duración de un step (s)
      const S = Math.floor((durSec - offsetSec) / sd);
      if (S < 4) return [];

      // 1) Cuantizar y limpiar
      const qnotes = [];
      const seenNotes = new Set();
      for (const n of rawNotes) {
        const step = Math.max(0, Math.round((n.start - offsetSec) / sd));
        const lenRaw = Math.max(1, Math.round(n.duration / sd));
        if (!Number.isFinite(n.start) || !Number.isFinite(n.duration) ||
            !Number.isFinite(n.midi) || step >= S) continue;
        const midi = Math.round(n.midi), key = `${step}:${midi}`;
        if (seenNotes.has(key)) continue;
        seenNotes.add(key);
        const len = Math.min(lenRaw, S - step);
        qnotes.push({
          step, len,
          midi,
          vel: clamp(n.amplitude ?? 0.7, 0.1, 1)
        });
      }
      if (!qnotes.length) return [];

      // 2) Agrupar por step (polifonía)
      const byStep = new Map();
      for (const n of qnotes) {
        if (!byStep.has(n.step)) byStep.set(n.step, []);
        byStep.get(n.step).push(n);
      }
      // Ordenar cada step por midi ascendente y limitar polifonía
      for (const [s, arr] of byStep) {
        arr.sort((a, b) => a.midi - b.midi);
        if (arr.length > maxPoly) {
          const keep = maxPoly === 1 ? [arr.slice().sort((a, b) => b.vel - a.vel)[0]] : [arr[0], arr[arr.length - 1]];
          for (const note of arr.slice().sort((a, b) => b.vel - a.vel)) {
            if (keep.length >= maxPoly) break;
            if (!keep.includes(note)) keep.push(note);
          }
          byStep.set(s, keep.sort((a, b) => a.midi - b.midi));
        }
      }

      // 3) Asignar roles con seguimiento de voz
      //    Cada step genera hasta maxPoly "slots". Los slots se asignan
      //    por continuidad: buscamos la nota más cercana al pitch previo
      //    de cada rol.
      const roleState = {
        bass: { notes: [] },
        melody: { notes: [] },
        harmony: { notes: [] },
        high: { notes: [] }
      };
      const sortedSteps = [...byStep.keys()].sort((a, b) => a - b);
      for (const s of sortedSteps) {
        const middle = byStep.get(s).filter(n => n.midi >= 48 && n.midi < 84);
        const melody = middle.reduce((highest, n) => !highest || n.midi > highest.midi ? n : highest, null);
        for (const n of byStep.get(s)) {
          const role = n.midi < 48 ? 'bass'
            : n.midi >= 84 ? 'high'
            : n === melody ? 'melody' : 'harmony';
          roleState[role].notes.push({ step: s, len: n.len, midi: n.midi, vel: n.vel });
        }
      }

      // 4) Fusionar notas contiguas del mismo rol y mismo pitch
      const mergeRole = notes => {
        notes.sort((a, b) => a.step - b.step);
        const out = [];
        for (const n of notes) {
          const last = out[out.length - 1];
          if (last && last.step + last.len === n.step && last.midi === n.midi) {
            last.len += n.len;
            last.vel = Math.max(last.vel, n.vel);
          } else out.push({ ...n });
        }
        return out;
      };

      const result = [];
      for (const role of ['bass', 'melody', 'harmony', 'high']) {
        const merged = mergeRole(roleState[role].notes);
        if (merged.length) result.push({ role, notes: merged });
      }
      return result;
    }

    // Detección de batería desde el análisis espectral (Basic Pitch no la detecta)
    function detectDrums(offsetSec, bpm, durSec) {
      if (!F) return [];
      const sd = 60 / bpm / 4;
      const S = Math.floor((durSec - offsetSec) / sd);
      if (S < 4) return [];

      const dsens = +$('#sensDrums').value;
      const fl = {
        kick: new Float32Array(S), tom: new Float32Array(S),
        snare: new Float32Array(S), clap: new Float32Array(S), hat: new Float32Array(S),
        hiE: new Float32Array(S)
      };
      const cnt = new Float32Array(S);

      for (let f = 1; f < F.n; f++) {
        const o = Math.round(((f * HOP + .5 * N) / SR - offsetSec) / sd);
        if (o < 0 || o >= S) continue;
        cnt[o]++;
        const onsets = {
          kick: Math.max(0, F.bKick[f] - F.bKick[f-1]),
          tom: Math.max(0, F.bTom[f] - F.bTom[f-1]),
          snare: Math.max(0, F.bSnare[f] - F.bSnare[f-1]),
          clap: Math.max(0, F.bClap[f] - F.bClap[f-1]),
          hat: Math.max(0, F.bHat[f] - F.bHat[f-1]),
        };
        for (const k in onsets) fl[k][o] = Math.max(fl[k][o], onsets[k]);
        fl.hiE[o] = Math.max(fl.hiE[o], F.hi[f]);
      }

      const Tval = k => Math.max(.03, pct(fl[k], .98) * (.65 - .5 * dsens));
      const P98 = k => Math.max(.03, pct(fl[k], .98));
      const tk = Tval('kick'), tt = Tval('tom'), tS = Tval('snare'), tC = Tval('clap'), th = Tval('hat');
      const lm = (a, s) => a[s] >= (a[s-1] || 0) && a[s] > (a[s+1] || 0);
      const dv = (k, s) => qv(.4 + .6 * Math.min(1, fl[k][s] / P98(k)));

      const notes = [];
      const push = (s, pitch, k) => {
        const o = { step: s, len: 1, midi: null, pitch, vel: dv(k, s) };
        notes.push(o);
      };

      for (let s = 0; s < S; s++) {
        const kick = fl.kick[s] > tk && lm(fl.kick, s);
        const tom = fl.tom[s] > tt && lm(fl.tom, s);
        const snare = fl.snare[s] > tS && lm(fl.snare, s);
        const clap = fl.clap[s] > tC && lm(fl.clap, s);
        const hat = fl.hat[s] > th && lm(fl.hat, s);

        if (kick) push(s, 'kick', 'kick');
        if (snare) push(s, 'snare', 'snare');
        else if (clap && !snare) push(s, 'clap', 'clap');
        else if (tom && !kick) push(s, 'tom', 'tom');
        if (hat) {
          let kIdx = 0;
          while (kIdx < 8 && fl.hiE[s + kIdx + 1] > .9 * fl.hiE[s]) kIdx++;
          push(s, kIdx >= 4 ? 'crash' : kIdx >= 1 ? 'openhat' : 'hat', 'hat');
        }
      }
      return notes;
    }

    // Auto-instrumento por rol + estadísticas de la pista
    function pickInstrument(role, notes) {
      if (!notes.length) return 'pulse25';
      const midis = notes.map(n => n.midi).filter(m => m != null);
      const cenMidi = midis.reduce((a, b) => a + b, 0) / Math.max(1, midis.length);
      const lens = notes.map(n => n.len).sort((a, b) => a - b);
      const avgLen = lens[lens.length >> 1] || 2;
      const uniqSteps = new Set(notes.map(n => n.step)).size;
      const poly = notes.length / Math.max(1, uniqSteps);

      if (role === 'bass') {
        return (avgLen >= 4 || cenMidi < 40) ? 'bass' : 'bass2';
      }
      if (role === 'melody') {
        if (avgLen >= 6) return cenMidi < 60 ? 'flute' : cenMidi > 76 ? 'brass' : 'lead';
        if (avgLen <= 2) return cenMidi < 60 ? 'piano' : 'pulse25';
        return cenMidi > 76 ? 'pulse12' : 'lead';
      }
      if (role === 'harmony') {
        if (poly > 1.5 || avgLen >= 4) return cenMidi > 72 ? 'strings' : cenMidi < 55 ? 'pad' : 'organ';
        return cenMidi > 68 ? 'pulse50' : 'guitar';
      }
      if (role === 'high') {
        return avgLen <= 2 ? 'bell' : 'flute';
      }
      return 'pulse25';
    }

    // ============================================================
    // CONSTRUCCIÓN DE LA CANCIÓN (formato Chiptune Studio)
    // ============================================================
    function buildSongFromBasicPitch(rawNotes, startSec, durSec) {
      const bpm = clamp(+$('#bpmInput').value || 120, 40, 240);
      const offsetSec = (+$('#offsetMs').value || 0) / 1e3;
      const maxPoly = parseInt($('#maxPoly').value) || 4;
      const maxTracks = parseInt($('#maxTracks').value) || 10;

      // Cuantizar y clasificar en roles
      const roles = quantizeAndSplitNotes(rawNotes, bpm, offsetSec, durSec, maxPoly, maxTracks);

      // Construir pistas Chiptune
      const tracks = [];
      const wantRole = {
        bass: $('#chkBass').checked,
        melody: $('#chkMelody').checked,
        harmony: $('#chkHarmony').checked,
        high: $('#chkHigh').checked
      };

      const roleNames = { bass: 'Bajo', melody: 'Melodía', harmony: 'Armonía', high: 'Agudos' };
      const roleVol = { bass: 0.9, melody: 0.8, harmony: 0.45, high: 0.55 };

      for (const r of roles) {
        if (!wantRole[r.role]) continue;
        const inst = $('#chkAuto').checked
          ? pickInstrument(r.role, r.notes)
          : (r.role === 'bass' ? 'bass' : r.role === 'melody' ? 'lead' : r.role === 'harmony' ? 'strings' : 'bell');

        const chiptuneNotes = r.notes.map(n => {
          const o = { step: n.step, len: Math.max(1, n.len), pitch: nameOf(n.midi) };
          if (n.vel < 1) o.vel = clamp(+n.vel.toFixed(2), 0.1, 1);
          return o;
        });

        tracks.push({
          name: roleNames[r.role],
          instrument: inst,
          volume: roleVol[r.role],
          pan: INST[inst]?.p || 0,
          mute: false,
          notes: chiptuneNotes.sort((a, b) => a.step - b.step)
        });
      }

      // Batería (desde análisis espectral)
      if ($('#chkDrums').checked) {
        const drumNotes = detectDrums(offsetSec, bpm, durSec);
        if (drumNotes.length) {
          const chiptuneDrums = drumNotes.map(n => {
            const o = { step: n.step, len: 1, pitch: n.pitch };
            if (n.vel < 1) o.vel = clamp(+n.vel.toFixed(2), 0.1, 1);
            return o;
          });
          tracks.push({
            name: 'Batería',
            instrument: 'drums',
            volume: 0.8,
            pan: 0,
            mute: false,
            notes: chiptuneDrums.sort((a, b) => a.step - b.step)
          });
        }
      }

      // Duración: limitar bars para que quepa en 30–90 s (o el durSec pedido)
      const totalSteps = Math.floor((durSec - offsetSec) / (60 / bpm / 4));
      const bars = clamp(Math.ceil(totalSteps / 16), 1, 64);

      return {
        format: 'chiptune-studio', version: 1,
        title: originalFileName ? originalFileName.replace(/\.[^.]+$/, '') : 'Canción Audio2CT',
        bpm: +bpm.toFixed(1),
        bars,
        tracks: tracks.slice(0, maxTracks)
      };
    }

    // The spectral analyzer can estimate percussion, but cannot transcribe pitch.
    function buildSongFromSpectral() {
      if (!F) return null;
      const bpm = clamp(+$('#bpmInput').value || 120, 40, 240);
      const off = (+$('#offsetMs').value || 0) / 1e3;
      const sd = 60 / bpm / 4;
      const dur = (F.n * HOP + N) / SR;
      const S = Math.min(1024, Math.floor((dur - off) / sd));
      if (S < 4) return null;

      const sens = +$('#sensNotes').value;
      const dsens = +$('#sensDrums').value;

      // Reutilizamos la lógica de "una sola pista por banda + batería"
      // adaptada al nuevo formato.
      const tracks = [];

      // Melodía/bajo/armonía no están disponibles sin el análisis completo;
      // devolvemos solo batería + una pista tonal básica de relleno.
      if ($('#chkDrums').checked) {
        const dn = detectDrums(off, bpm, dur);
        if (dn.length) {
          tracks.push({
            name: 'Batería', instrument: 'drums', volume: 0.8, pan: 0, mute: false,
            notes: dn.map(n => ({ step: n.step, len: 1, pitch: n.pitch, ...(n.vel < 1 ? { vel: n.vel } : {}) }))
          });
        }
      }

      return {
        format: 'chiptune-studio', version: 1,
        title: originalFileName ? originalFileName.replace(/\.[^.]+$/, '') : 'Canción Audio2CT',
        bpm: +bpm.toFixed(1),
        bars: Math.min(64, Math.ceil(S / 16)),
        tracks
      };
    }

    // ============================================================
    // VALIDACIÓN Y FORMATO
    // ============================================================
    function normalizeNoteFx(fx) {
      if (!fx || typeof fx !== 'object' || Array.isArray(fx)) return undefined;
      const result = {};
      for (const { id } of FX) {
        const value = Number(fx[id]);
        if (Number.isFinite(value) && value > 0) result[id] = clamp(value, 0, 1);
      }
      return Object.keys(result).length ? result : undefined;
    }

    function validateAndFormat(song) {
      if (!song || !song.tracks) return song;
      song.tracks = song.tracks.slice(0, 10).filter(t => t.notes && t.notes.length > 0);
      for (const track of song.tracks) {
        track.notes = track.notes.filter(n => {
          if (track.instrument === 'drums') return DR.includes(n.pitch);
          const m = midiOf(n.pitch);
          if (m === null) return false;
          const octMatch = /(-?\d)$/.exec(n.pitch);
          if (!octMatch) return false;
          const oct = parseInt(octMatch[1]);
          return oct >= -9 && oct <= 9;
        }).map(n => ({
          step: Math.max(0, Math.floor(n.step)),
          len: Math.max(1, Math.floor(n.len)),
          pitch: n.pitch,
          ...(n.vel != null ? { vel: clamp(n.vel, 0.1, 1) } : {}),
          ...(normalizeNoteFx(n.fx) ? { fx: normalizeNoteFx(n.fx) } : {})
        }));
        const maxStep = song.bars * 16;
        track.notes = track.notes
          .filter(n => n.step < maxStep)
          .map(n => ({ ...n, len: Math.min(n.len, maxStep - n.step) }));
      }
      song.tracks = song.tracks.filter(t => t.notes.length > 0);
      return song;
    }

    function formatJSON(song) {
      const { tracks, ...head } = song;
      const tr = tracks.map(t => {
        const { notes, ...r } = t;
        return '  {' + JSON.stringify(r).slice(1, -1) + ',\n   "notes":[\n' +
          notes.slice().sort((a, b) => a.step - b.step).map(n => '    ' + JSON.stringify(n)).join(',\n') +
          '\n   ]}';
      });
      return JSON.stringify(head).slice(0, -1).replace(/,"/g, ',\n "').replace('{"', '{\n "') +
        ',\n "tracks":[\n' + tr.join(',\n') + '\n ]\n}';
    }

    function updateUIState(song) {
      currentSong = validateAndFormat(song);
      $('#jsonOutput').value = formatJSON(currentSong);
      $('#btnCopyJson').disabled = false;
      $('#btnDownloadJson').disabled = false;
      $('#btnSendToStudio').disabled = false;
      $('#btnPlayTranscription').disabled = false;
      renderTracksEditor(currentSong);
      drawRoll();
    }

    // ============================================================
    // EDITOR DE PISTAS
    // ============================================================
    function renderTracksEditor(song) {
      const list = $('#tracksList');
      const panel = $('#tracksPanel');
      list.innerHTML = '';
      $('#trackCount').textContent = `${song.tracks.length} pistas`;
      
      if (!song.tracks || song.tracks.length === 0) {
        panel.style.display = 'none';
        return;
      }
      panel.style.display = 'block';

      song.tracks.forEach((track, idx) => {
        const row = document.createElement('div');
        row.className = 'track-row';
        const color = INST[track.instrument]?.c || '#888';
        const isDrums = track.instrument === 'drums';

        const instOptionsHtml = Object.entries(
          Object.entries(INST).reduce((acc, [k, v]) => {
            acc[v.g] = acc[v.g] || [];
            acc[v.g].push(`<option value="${k}" ${track.instrument === k ? 'selected' : ''}>${v.n}</option>`);
            return acc;
          }, {})
        ).map(([g, opts]) => `<optgroup label="${g}">${opts.join('')}</optgroup>`).join('');

        row.innerHTML = `
          <div class="track-color-indicator" style="background:${color};"></div>
          <div class="track-inputs">
            <input type="text" value="${track.name}" data-idx="${idx}" data-field="name" style="width:110px;" placeholder="Nombre">
            <select data-idx="${idx}" data-field="instrument" ${isDrums ? 'disabled' : ''}>
              ${isDrums ? '<option value="drums" selected>Batería</option>' : instOptionsHtml}
            </select>
            <div class="control-group">
              <label>Vol</label>
              <input type="range" min="0" max="1" step="0.01" value="${track.volume ?? 0.8}" data-idx="${idx}" data-field="volume" style="width:70px;">
            </div>
            <div class="control-group">
              <label>Pan</label>
              <input type="range" min="-1" max="1" step="0.05" value="${track.pan ?? 0}" data-idx="${idx}" data-field="pan" style="width:60px;">
            </div>
            <label class="checkbox-pill ${track.mute ? '' : 'active'}" style="padding:2px 8px; font-size:10px;">
              <input type="checkbox" data-idx="${idx}" data-field="mute" ${track.mute ? '' : 'checked'}>
              <span class="dot"></span> ${track.mute ? 'Silencio' : 'Activa'}
            </label>
          </div>
          <div class="track-notes-count">${track.notes.length} notas</div>
        `;

        row.querySelectorAll('input, select').forEach(input => {
          input.addEventListener('change', (e) => {
            const field = e.target.dataset.field;
            const tIdx = parseInt(e.target.dataset.idx);
            const targetTrack = currentSong.tracks[tIdx];

            if (field === 'name') targetTrack.name = e.target.value;
            else if (field === 'instrument') {
              targetTrack.instrument = e.target.value;
              targetTrack.pan = INST[e.target.value]?.p || 0;
            } else if (field === 'volume') targetTrack.volume = parseFloat(e.target.value);
            else if (field === 'pan') targetTrack.pan = parseFloat(e.target.value);
            else if (field === 'mute') targetTrack.mute = !e.target.checked;

            updateUIState(currentSong);
          });
        });

        list.appendChild(row);
      });
    }

    // ============================================================
    // REPRODUCCIÓN
    // ============================================================
    function playOriginal() {
      if (!audioBuffer) return;
      ensureAudioContext();
      stopPlayback();
      playSource = trackPlaybackNode(audioCtx.createBufferSource());
      playSource.buffer = audioBuffer;

      analyserNode = trackPlaybackNode(audioCtx.createAnalyser());
      analyserNode.fftSize = 256;
      playSource.connect(analyserNode);
      analyserNode.connect(masterGain);

      playDuration = audioBuffer.duration;
      playStartTime = audioCtx.currentTime;
      playSource.start(0);
      isPlaying = true;
      currentPlayType = 'original';

      $('#btnStop').disabled = false;
      $('#playhead').style.display = 'block';
      setGlobalStatus('Reproduciendo audio original...', 'processing');

      startSpectrumAndPlayheadDraw();
      playSource.onended = () => { if (currentPlayType === 'original') stopPlayback(); };
    }

    function playTranscription() {
      if (!currentSong || !currentSong.tracks.length) return;
      ensureAudioContext();
      stopPlayback();

      const bpm = currentSong.bpm || 120;
      const stepDur = 60 / bpm / 4;
      const totalSteps = currentSong.bars * 16;
      const duration = totalSteps * stepDur;
      const delayTail = currentSong.tracks.some(track => track.notes.some(note => note.fx?.delay))
        ? 3 * 60 / bpm : 0;
      const reverbTail = currentSong.tracks.some(track => track.notes.some(note => note.fx?.reverb))
        ? 1.5 : 0;
      const startTime = audioCtx.currentTime + 0.05;

      playDuration = duration;
      playStartTime = startTime;
      isPlaying = true;
      currentPlayType = 'transcription';

      analyserNode = trackPlaybackNode(audioCtx.createAnalyser());
      analyserNode.fftSize = 256;
      analyserNode.connect(masterGain);

      for (const track of currentSong.tracks) {
        if (track.mute) continue;
        const trackGain = trackPlaybackNode(audioCtx.createGain());
        trackGain.gain.value = track.volume ?? 0.8;
        const panner = trackPlaybackNode(audioCtx.createStereoPanner());
        panner.pan.value = clamp(track.pan || 0, -1, 1);
        trackGain.connect(panner);
        panner.connect(analyserNode);

        for (const note of track.notes) {
          const noteTime = startTime + note.step * stepDur;
          const noteDur = note.len * stepDur;
          synthHit(track, note.pitch, noteTime, noteDur, trackGain, note.vel ?? 1, note.fx);
        }
      }

      $('#btnStop').disabled = false;
      $('#playhead').style.display = 'block';
      setGlobalStatus('Reproduciendo transcripción...', 'processing');
      startSpectrumAndPlayheadDraw();

      const endTimeoutId = setTimeout(() => {
        if (isPlaying && currentPlayType === 'transcription') stopPlayback();
      }, (duration + Math.max(1.5, delayTail, reverbTail)) * 1000);
      scheduledTimeouts.push(endTimeoutId);
    }

    function startSpectrumAndPlayheadDraw() {
      const spectrumCanvas = $('#spectrumCanvas');
      const spectrumCtx = spectrumCanvas.getContext('2d');
      const sW = spectrumCanvas.width = spectrumCanvas.clientWidth * 2;
      const sH = spectrumCanvas.height = spectrumCanvas.clientHeight * 2;
      spectrumCtx.scale(2, 2);

      const playheadEl = $('#playhead');
      const rollBoxEl = $('#rollBox');

      function drawFrame() {
        if (!isPlaying) return;
        animFrameId = requestAnimationFrame(drawFrame);

        spectrumCtx.fillStyle = 'rgba(11,14,24,0.9)';
        spectrumCtx.fillRect(0, 0, sW, sH);

        if (analyserNode) {
          const bufferLength = analyserNode.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserNode.getByteFrequencyData(dataArray);
          const barWidth = (sW / 2) / bufferLength;
          for (let i = 0; i < bufferLength; i++) {
            const value = dataArray[i] / 255;
            const barHeight = value * (sH / 2) * 0.95;
            const hue = 40 + value * 140;
            spectrumCtx.fillStyle = `hsl(${hue}, 80%, ${40 + value * 30}%)`;
            spectrumCtx.fillRect(i * barWidth, (sH / 2) - barHeight, barWidth - 1, barHeight);
          }
        }

        const elapsed = audioCtx.currentTime - playStartTime;
        const progress = Math.min(1, Math.max(0, elapsed / playDuration));
        playheadEl.style.left = `${progress * rollBoxEl.clientWidth}px`;
      }
      drawFrame();
    }

    function drawRoll() {
      const canvas = $('#rollCanvas');
      const container = $('#rollBox');
      if (!canvas || !container) return;

      const song = currentSong;
      if (!song || !song.tracks || song.tracks.length === 0) {
        $('#rollOverlay').textContent = 'Sin datos';
        canvas.width = 0; canvas.height = 0;
        return;
      }

      const W = container.clientWidth * 2;
      const H = container.clientHeight * 2;
      canvas.width = W; canvas.height = H;

      const ctx2d = canvas.getContext('2d');
      ctx2d.fillStyle = '#0b0e18';
      ctx2d.fillRect(0, 0, W, H);

      const totalSteps = song.bars * 16;
      const stepW = W / totalSteps;
      const trackCount = song.tracks.length;
      const trackH = H / trackCount;
      const noteH = Math.min(trackH * 0.65, 12);

      for (let s = 0; s <= totalSteps; s++) {
        if (s % 16 === 0) {
          ctx2d.strokeStyle = 'rgba(255,255,255,0.18)';
          ctx2d.lineWidth = 1;
          ctx2d.beginPath(); ctx2d.moveTo(s * stepW, 0); ctx2d.lineTo(s * stepW, H); ctx2d.stroke();
        } else if (s % 4 === 0) {
          ctx2d.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx2d.lineWidth = 1;
          ctx2d.beginPath(); ctx2d.moveTo(s * stepW, 0); ctx2d.lineTo(s * stepW, H); ctx2d.stroke();
        }
      }

      song.tracks.forEach((track, ti) => {
        const y0 = ti * trackH;
        const color = INST[track.instrument]?.c || '#888';
        ctx2d.fillStyle = color;
        for (const note of track.notes) {
          const x = note.step * stepW;
          const w = Math.max(note.len * stepW - 1, 2);
          const y = y0 + (trackH - noteH) / 2;
          ctx2d.globalAlpha = 0.4 + 0.6 * (note.vel ?? 1);
          ctx2d.fillRect(x, y, w, noteH);
        }
        ctx2d.globalAlpha = 1;
        ctx2d.fillStyle = 'rgba(255,255,255,0.85)';
        ctx2d.font = '500 18px IBM Plex Mono, monospace';
        ctx2d.fillText(track.name, 10, y0 + trackH / 2 + 6);
      });

      $('#rollOverlay').textContent = `${song.tracks.length} pistas · ${song.bars} compases (${totalSteps} pasos)`;
    }

    // ============================================================
    // MANEJO DE ARCHIVOS
    // ============================================================
    async function handleFile(file) {
      if (!file) return;
      stopPlayback();
      tempoManuallySet = false;
      originalFileName = file.name;

      $('#dropzone').style.display = 'none';
      $('#dropzoneMini').style.display = 'flex';
      $('#loadedFileName').textContent = file.name;
      $('#loadedFileMeta').textContent = `${(file.size / 1024).toFixed(1)} KB`;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const header = new Uint8Array(arrayBuffer.slice(0, 4));
        const isMidi = header[0] === 0x4D && header[1] === 0x54 && header[2] === 0x68 && header[3] === 0x64;

        if (isMidi) {
          log(`Procesando MIDI: ${file.name}`, 'info');
          showLoading('Parseando MIDI...');
          audioBuffer = null;
          F = null;
          bpNotes = null;
          $('#paramsPanel').style.display = 'none';
          $('#btnPlayOriginal').disabled = true;

          const parsed = parseMidi(arrayBuffer);
          const song = midiToSong(parsed);
          updateUIState(song);

          hideLoading();
          setGlobalStatus('MIDI cargado', 'success');
          log(`MIDI cargado: ${song.tracks.length} pistas, ${song.bars} compases.`, 'ok');
        } else {
          log(`Procesando Audio: ${file.name}`, 'info');
          showLoading('Decodificando audio...');
          ensureAudioContext();
          
          audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          $('#startSec').value = 0;
          $('#durSec').max = Math.ceil(audioBuffer.duration);
          $('#durSec').value = Math.ceil(audioBuffer.duration);
          $('#btnPlayOriginal').disabled = false;
          $('#paramsPanel').style.display = 'block';

          await runFullAnalysis();
        }
      } catch (e) {
        hideLoading();
        log('Error al procesar archivo: ' + e.message, 'err');
        setGlobalStatus('Error en archivo', 'error');
      }
    }

    async function runFullAnalysis() {
      if (!audioBuffer) return;
      stopPlayback();
      const maxStart = Math.max(0, audioBuffer.duration - 0.1);
      const startSec = clamp(Number($('#startSec').value) || 0, 0, maxStart);
      const maxDuration = Math.max(0.1, audioBuffer.duration - startSec);
      const durSec = clamp(Number($('#durSec').value) || 60, 0.1, maxDuration);
      $('#startSec').value = startSec;
      $('#durSec').value = durSec;

      try {
        // 1) Análisis espectral (para tempo y batería)
        showLoading('Análisis espectral (tempo + batería)...', true);
        setGlobalStatus('Analizando canción completa...', 'processing');
        await analyzeSpectrum(audioBuffer, startSec, durSec);
        if (!tempoManuallySet) detectTempo();

        // 2) Transcripción con Basic Pitch
        showLoading('Transcribiendo con Basic Pitch...', true);
        setGlobalStatus('Transcribiendo con Basic Pitch...', 'processing');
        log('Iniciando transcripción con Basic Pitch...', 'info');

        let rawNotes = null;
        try {
          rawNotes = await transcribeWithBasicPitch(audioBuffer, startSec, durSec);
        } catch (e) {
          log('Basic Pitch falló: ' + e.message, 'warn');
        }

        // 3) Construir canción
        showLoading('Clasificando roles y construyendo pistas...');
        let song;
        if (rawNotes && rawNotes.length) {
          bpNotes = rawNotes;
          log(`Basic Pitch devolvió ${rawNotes.length} notas.`, 'ok');
          song = buildSongFromBasicPitch(rawNotes, startSec, durSec);
        } else {
          log('Basic Pitch no devolvió notas. El análisis espectral solo puede estimar batería, no melodía ni armonía.', 'warn');
          song = buildSongFromSpectral();
        }

        if (!song || !song.tracks.length) {
          throw new Error('No se generaron notas. Prueba a subir sensibilidad o cambia la duración.');
        }

        const requestedBars = Math.ceil((durSec - (+$('#offsetMs').value || 0) / 1e3) / (60 / song.bpm * 4));
        updateUIState(song);
        hideLoading();
        if (requestedBars > 64) {
          setGlobalStatus(`Listo: ${song.tracks.length} pistas · límite de 64 compases`, 'success');
          log(`Se analizó el audio completo (${durSec.toFixed(1)} s), pero el formato actual del Estudio solo admite 64 compases; el JSON se limita a ese rango.`, 'warn');
        } else {
          setGlobalStatus(`Listo: ${song.tracks.length} pistas`, 'success');
        }
        log(`Análisis completado: ${song.tracks.length} pistas, ${song.tracks.reduce((a,t)=>a+t.notes.length,0)} notas.`, 'ok');
      } catch (e) {
        hideLoading();
        log('Error en análisis: ' + e.message, 'err');
        setGlobalStatus('Error en análisis', 'error');
      }
    }

    function runAnalysis() {
      if (audioBuffer) {
        runFullAnalysis();
        return;
      }
      if (!F) return;
      try {
        showLoading('Reconstruyendo transcripción...');
        const song = buildSongFromSpectral();
        if (!song || !song.tracks.length) throw new Error('No se generaron notas con los parámetros actuales');
        updateUIState(song);
        hideLoading();
        setGlobalStatus(`Listo: ${song.tracks.length} pistas`, 'success');
      } catch (e) {
        hideLoading();
        log('Error en análisis: ' + e.message, 'err');
        setGlobalStatus('Error en análisis', 'error');
      }
    }

    // ============================================================
    // PARSER MIDI (igual que antes)
    // ============================================================
    function parseMidi(ab) {
      const d = new DataView(ab), u = new Uint8Array(ab); let p = 8;
      d.getUint16(p); p += 2; const nt = d.getUint16(p); p += 2; const ppq = d.getUint16(p) & 0x7fff || 480; p += 2;
      let tempo = 500000, gotT = false, ts = [4, 4]; const notes = [], prog = {}, pan = {};
      const vl = () => { let v = 0, b; do { b = u[p++]; v = v << 7 | b & 127; } while (b & 128); return v; };
      for (let t = 0; t < nt && p + 8 <= u.length; t++) {
        p += 4; const len = d.getUint32(p); p += 4; const e = p + len, on = {}, vel = {}; let tick = 0, rs = 0;
        while (p < e) {
          tick += vl(); let st = u[p]; if (st & 128) { p++; if (st < 0xF0) rs = st; } else st = rs;
          if (st === 0xFF) { const ty = u[p++], l = vl(); if (ty === 0x51 && !gotT) { tempo = u[p] << 16 | u[p + 1] << 8 | u[p + 2]; gotT = true; } else if (ty === 0x58) ts = [u[p], 1 << u[p + 1]]; p += l; }
          else if (st === 0xF0 || st === 0xF7) { p += vl(); }
          else {
            const hi = st >> 4, ch = st & 15;
            if (hi === 0xC || hi === 0xD) { if (hi === 0xC && prog[ch] === undefined) prog[ch] = u[p]; p++; }
            else {
              const a = u[p], b = u[p + 1]; p += 2;
              if (hi === 0xB && a === 10) pan[ch] = clamp((b - 64) / 63, -1, 1);
              else if (hi === 9 && b > 0) { on[ch * 128 + a] = tick; vel[ch * 128 + a] = b; }
              else if (hi === 8 || hi === 9) { const k = ch * 128 + a; if (on[k] !== undefined) { notes.push({ ch, n: a, t: on[k], d: tick - on[k], v: vel[k] }); delete on[k]; } }
            }
          }
        }
        p = e;
      }
      return { ppq, tempo, ts, notes, prog, pan };
    }

    function midiToSong(m) {
      let bpm = 6e7 / m.tempo, fac = 1; while (bpm > 240) { bpm /= 2; fac *= 2; } while (bpm < 40) { bpm *= 2; fac /= 2; }
      const sp = 4 / m.ppq / fac, by = {}; for (const n of m.notes) (by[n.ch] = by[n.ch] || []).push(n);
      const GM = n => n === 35 || n === 36 ? 'kick' : n === 37 || n === 39 ? 'clap' : n === 38 || n === 40 ? 'snare' : [41, 43, 45, 47, 48, 50].includes(n) ? 'tom' : [49, 52, 55, 57].includes(n) ? 'crash' : [46, 51, 53, 59].includes(n) ? 'openhat' : 'hat';
      const gmi = p => p === 38 || p === 39 ? 'bass' : p < 8 ? 'piano' : p < 16 ? 'bell' : p < 24 ? 'organ' : p < 32 ? 'guitar' : p < 40 ? 'bass2' : p < 56 ? (p < 52 ? 'strings' : 'choir') : p < 64 ? 'brass' : p < 72 ? 'lead' : p < 80 ? 'flute' : p < 88 ? 'lead' : p < 96 ? 'pad' : null;
      let end = 0; const tracks = [];
      for (const ch in by) {
        const ns = by[ch], isD = +ch === 9, seen = new Set(), notes = [];
        for (const n of ns) {
          const step = Math.round(n.t * sp), len = Math.max(1, Math.round(n.d * sp)), pitch = isD ? GM(n.n) : nameOf(clamp(n.n, 12, 108)), k = step + pitch;
          if (seen.has(k)) continue; seen.add(k);
          const o = { step, len: isD ? 1 : len, pitch }, v = qv(Math.min(1, (n.v || 100) / 105)); if (v < 1) o.vel = v; notes.push(o); end = Math.max(end, step + o.len);
        }
        let inst = 'drums', nm = 'Batería';
        if (!isD) {
          const mdVal = ns.map(n => n.n).sort((a, b) => a - b)[ns.length >> 1], poly = ns.length / new Set(ns.map(n => Math.round(n.t * sp))).size;
          inst = gmi(m.prog[ch]) || (mdVal < 50 ? 'bass2' : poly > 1.5 ? 'strings' : mdVal >= 60 ? 'pulse25' : 'triangle');
          nm = INST[inst].n.split(' (')[0] + ' ' + (+ch + 1);
        }
        const pn = m.pan[ch] !== undefined ? m.pan[ch] : (INST[inst].p || 0);
        tracks.push({ name: nm, instrument: inst, volume: inst.startsWith('bass') ? .9 : isD ? .8 : .7, pan: +pn.toFixed(2), mute: false, notes: notes.sort((a, b) => a.step - b.step) });
      }
      tracks.sort((a, b) => b.notes.length - a.notes.length); tracks.length = Math.min(10, tracks.length);
      const bars = clamp(Math.ceil(end / 16), 1, 64);
      for (const t of tracks) t.notes = t.notes.filter(n => n.step < bars * 16).map(n => ({ ...n, len: Math.min(n.len, bars * 16 - n.step) }));
      return { format: 'chiptune-studio', version: 1, title: originalFileName.replace(/\.[^.]+$/, ''), bpm: +bpm.toFixed(1), bars, tracks };
    }

    // ============================================================
    // EVENTOS DE INTERFAZ
    // ============================================================
    const dropzone = $('#dropzone');
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', e => { e.preventDefault(); dropzone.classList.remove('dragover'); });
    dropzone.addEventListener('drop', e => {
      e.preventDefault(); dropzone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    $('#fileInput').addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; });
    $('#fileInputMini').addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; });

    $('#sensNotes').addEventListener('input', e => { $('#sensNotesVal').textContent = parseFloat(e.target.value).toFixed(2); });
    $('#sensDrums').addEventListener('input', e => { $('#sensDrumsVal').textContent = parseFloat(e.target.value).toFixed(2); });
    $('#maxPoly').addEventListener('input', e => { $('#maxPolyVal').textContent = e.target.value; });
    $('#onsetThr').addEventListener('input', e => { $('#onsetThrVal').textContent = parseFloat(e.target.value).toFixed(2); });

    $$('.checkbox-pill').forEach(pill => {
      const checkbox = pill.querySelector('input');
      const syncPill = () => {
        pill.classList.toggle('active', checkbox.checked);
        pill.setAttribute('aria-checked', String(checkbox.checked));
      };
      pill.addEventListener('click', e => {
        if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
        syncPill();
      });
      pill.addEventListener('keydown', e => {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
        syncPill();
      });
      checkbox.addEventListener('change', syncPill);
    });

    $('#btnAnalyze').addEventListener('click', () => {
      if (audioBuffer) runFullAnalysis();
      else runAnalysis();
    });
    $('#btnDetectTempo').addEventListener('click', () => {
      if (F) {
        tempoManuallySet = false;
        detectTempo();
        log('Tempo redetectado.', 'ok');
      }
    });
    $('#bpmInput').addEventListener('input', () => { tempoManuallySet = true; });
    $('#offsetMs').addEventListener('input', () => { tempoManuallySet = true; });

    $('#btnPlayOriginal').addEventListener('click', playOriginal);
    $('#btnPlayTranscription').addEventListener('click', playTranscription);
    $('#btnStop').addEventListener('click', stopPlayback);

    $('#masterVol').addEventListener('input', e => {
      masterVolume = parseFloat(e.target.value);
      if (masterGain) masterGain.gain.value = masterVolume;
    });
    $('#reverbAmt').addEventListener('input', e => {
      reverbAmount = parseFloat(e.target.value);
      if (reverbNode) reverbNode.gain.value = reverbAmount;
    });

    // Modales
    const openModal = id => $('#' + id)?.classList.add('active');
    const closeModal = id => $('#' + id)?.classList.remove('active');
    $$('.modal-close, [data-close]').forEach(el => el.addEventListener('click', () => closeModal(el.dataset.close)));
    $$('.modal-overlay').forEach(overlay => overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); }));

    $('#btnOpenLog').addEventListener('click', () => { renderLog(); openModal('modalLog'); });
    $('#btnClearLog').addEventListener('click', () => { statusLog.length = 0; renderLog(); });

    $('#btnCopyJson').addEventListener('click', async () => {
      const text = $('#jsonOutput').value;
      if (!text) return;
      try { await navigator.clipboard.writeText(text); log('JSON copiado al portapapeles.', 'ok'); } catch(e) {}
    });

    $('#btnDownloadJson').addEventListener('click', () => {
      const text = $('#jsonOutput').value;
      if (!text) return;
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${currentSong?.title || 'audio2ct'}.json`; a.click();
      URL.revokeObjectURL(url);
      log('JSON descargado.', 'ok');
    });

    $('#jsonOutput').addEventListener('input', e => {
      $('#btnSendToStudio').disabled = !e.target.value.trim();
    });

    $('#btnSendToStudio').addEventListener('click', () => {
      try {
        const song = JSON.parse($('#jsonOutput').value);
        if (!song || typeof song !== 'object' || Array.isArray(song)) {
          throw new Error('el contenido debe ser un objeto de canción');
        }
        window.parent.postMessage({ type: 'chiptune-studio:import-song', song }, '*');
      } catch (e) {
        log('No se pudo enviar la canción: ' + e.message, 'err');
      }
    });

    $('#btnImportJson').addEventListener('click', () => {
      const text = $('#jsonOutput').value;
      if (!text) return;
      try {
        const song = JSON.parse(text);
        updateUIState(song);
        log('JSON importado y validado.', 'ok');
        setGlobalStatus('JSON importado', 'success');
      } catch (e) {
        log('Error al importar JSON: ' + e.message, 'err');
      }
    });

    $('#btnClearJson').addEventListener('click', () => {
      $('#jsonOutput').value = '';
      $('#btnSendToStudio').disabled = true;
      log('Cuadro JSON limpiado.', 'info');
    });

    window.addEventListener('resize', () => drawRoll());
    document.addEventListener('keydown', e => {
      if (e.code === 'Space' && !/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement.tagName)) {
        e.preventDefault();
        if (isPlaying) stopPlayback();
        else if (currentSong) playTranscription();
      }
    });

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================
    log('Audio2CT v3 (Basic Pitch + clasificador de roles) inicializado.', 'info');
    drawRoll();

    // Pre-cargar Basic Pitch en segundo plano para que el primer análisis sea rápido
    setTimeout(() => loadBasicPitch(), 500);
  