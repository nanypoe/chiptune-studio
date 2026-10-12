const $=s=>document.querySelector(s), clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'], BASE={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const midiOf=p=>{const m=/^([A-G])([#b]?)(-?\d)$/i.exec(p);return m?12*(+m[3]+1)+BASE[m[1].toUpperCase()]+(m[2]==='#'?1:m[2]==='b'?-1:0):null};
const nameOf=m=>NAMES[m%12]+(Math.floor(m/12)-1), hz=m=>440*2**((m-69)/12);
const DR=['crash','openhat','hat','clap','tom','snare','kick'];
/* P = receta de síntesis: o=osciladores {w:onda|ancho de pulso, m:múltiplo, d:cents, g:ganancia}, a=nivel, A/D/S/R=envolvente,
   fl=[corte0,corte1,tiempo,Q] (×frecuencia de la nota), vib=[Hz,cents,retardo], lfo=[Hz,corteMin,corteMax], nz=[×f,Q,dur,nivel] (soplo/golpe), fm=formantes, ring=suena más allá de la nota */
const INST={
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
 {id:'tremolo',name:'Trémolo',hint:'Volumen rítmico'},
 {id:'chorus',name:'Chorus',hint:'Anchura y desafinación'},
 {id:'flanger',name:'Flanger',hint:'Barrido metálico'},
 {id:'phaser',name:'Phaser',hint:'Barrido de fase'},
 {id:'wah',name:'Wah',hint:'Filtro expresivo'},
 {id:'compressor',name:'Compresor',hint:'Control de dinámica'},
 {id:'drive',name:'Overdrive',hint:'Saturación cálida'},
 {id:'fuzz',name:'Fuzz',hint:'Distorsión intensa'},
 {id:'bitcrush',name:'Bitcrusher',hint:'Resolución retro'},
 {id:'delay',name:'Delay',hint:'Ecos rítmicos'},
 {id:'reverb',name:'Reverb',hint:'Espacio reverberante'}
];
const GUIDE=`GUÍA PARA IA · CHIPTUNE STUDIO · JSON v1

Crea, arregla o adapta una canción para Chiptune Studio. Devuelve ÚNICAMENTE un objeto JSON válido: sin Markdown, comentarios ni explicaciones. No inventes campos ni instrumentos. Si el usuario proporciona una canción de origen, conserva su identidad (melodía, armonía, ritmo y tempo) salvo que pida explícitamente cambiarlos; si es una creación nueva, sigue su género, intención y duración.

FORMATO
{"format":"chiptune-studio","version":1,"title":"Título","bpm":120,"bars":4,"tracks":[{"name":"Melodía","instrument":"pulse25","volume":0.8,"pan":0,"fxPreset":{"delay":0.25},"notes":[{"step":0,"len":2,"pitch":"E5","vel":0.8,"fx":{"delay":0.25}}]}]}

REGLAS TÉCNICAS
- bpm: 40–240; bars: 1–64; máximo 10 pistas; volume: 0–1; pan: −1 a 1; mute: booleano opcional; fxPreset por pista (opcional): efectos predeterminados para las notas nuevas, con valores 0–1.
- Cada compás tiene 16 pasos: step 0 inicia el primer compás y el 2.º inicia en 16. len: 1=semicorchea, 2=corchea, 4=negra, 8=blanca, 16=redonda. En cada nota, step >= 0, len >= 1 y step+len <= bars*16.
- pitch: nombre A–G, alteración opcional # o b y una cifra de octava: C4, F#3, Bb5. Usa una sola cifra, sin octavas negativas ni dobles alteraciones. El editor normaliza bemoles a sostenidos.
- vel (opcional): 0.1–1; úsala para acentos y notas fantasma.
- fx por nota (opcional): valores 0–1; sólo incluye efectos que tengan intención musical. Las notas nuevas heredan fxPreset; editar los efectos de una nota actualiza el preajuste de su pista sin modificar las notas existentes.
- En pistas drums, pitch sólo puede ser kick, snare, clap, hat, openhat, tom o crash.

INSTRUMENTOS DISPONIBLES (usa exactamente el identificador)
Chip clásico: pulse25, pulse50, pulse12, triangle, saw, bass.
Melódicos: lead, flute, brass, strings, organ, choir.
Teclas/plectro: piano, bell, guitar, acousticGuitar, electricGuitar, bass2.
Electrónicos: supersaw, wobble. Ambiente: pad. Percusión: drums.
Rangos útiles: bajos bass/bass2/wobble C1–C4; triangle/saw/organ/strings/pad C2–C6; pulse25/pulse50/lead/supersaw C3–C7; pulse12/flute C4–C8; brass/choir C3–C6; piano/acousticGuitar/electricGuitar C2–C7; guitar C2–C6; bell C5–C8.
Efectos por nota: tremolo, chorus, flanger, phaser, wah, compressor, drive, fuzz, bitcrush, delay, reverb.

ARREGLO Y CARÁCTER
- Prioriza una composición clara y tocable: normalmente 3–6 pistas con funciones diferenciadas (melodía, bajo, armonía y, si aporta, batería o contramelodía). No uses el catálogo como una cuota.
- Conserva espacio entre registros y frases; usa repeticiones con variaciones, dinámica mediante vel y paneo moderado. Evita saturar cada nota de efectos.
- Traduce el género al lenguaje chiptune: salsa (montuno sincopado, bajo, metales y percusión); merengue (pulso enérgico, bajo constante y acordes a contratiempo); rock/metal (riff de electricGuitar, bajo y batería, drive/fuzz con moderación); EDM (supersaw y wobble); orquestal (strings/pad, brass, flute/choir). Todos los timbres son síntesis, no muestras acústicas.
- Si se adapta una grabación o MIDI, respeta sus notas, tonalidad, tempo y forma lo mejor posible. El formato sólo admite un tempo fijo y 64 compases: si hay que resumir, prioriza los motivos y secciones distintivos, no cambies la tonalidad por conveniencia y explica cualquier límite sólo si el usuario permite texto aparte.

VALIDACIÓN ANTES DE RESPONDER
Comprueba que el JSON parsea, que format/version sean correctos, todos los instrumentos y pitches son válidos, cada efecto está entre 0 y 1, hay como máximo 10 pistas y ninguna nota supera bars*16. No devuelvas ejemplos o notas fuera del esquema solicitado.`;

let song, sel=0, L=2, CW=24, RH=16, KW=58, lastSel=-1, selectedNote=null,drumReferenceTrack=null,drumReferenceChosen=false;
const mk=(name,instrument,notes=[],volume=.8)=>({name,instrument,volume,pan:INST[instrument].p||0,mute:false,notes,fxPreset:{}});
function cleanFx(fx){
  if(!fx||typeof fx!=='object'||Array.isArray(fx))return undefined;
  const clean={};
  for(const {id} of FX){const value=Number(fx[id]);if(Number.isFinite(value)&&value>0)clean[id]=clamp(value,0,1)}
  return clean;
}
function noteWithTrackFx(tr,note){
  note.fx={...tr.fxPreset};
  if(!Object.keys(note.fx).length)delete note.fx;
  return note;
}
function setNoteFx(tr,note,fx){
  note.fx={...fx};
  if(!Object.keys(note.fx).length)delete note.fx;
  tr.fxPreset={...fx};
}
const total=()=>song.bars*16;

function demo(){
  const s={format:'chiptune-studio',version:1,title:'Demo en La menor',bpm:140,bars:4,tracks:[]};
  const mel=[[0,2,'E5'],[2,2,'C5'],[4,2,'A4'],[6,2,'C5'],[8,4,'E5'],[12,4,'D5'],[16,2,'C5'],[18,2,'A4'],[20,2,'F4'],[22,2,'A4'],[24,4,'C5'],[28,4,'A4'],[32,2,'G4'],[34,2,'C5'],[36,2,'E5'],[38,2,'C5'],[40,4,'G5'],[44,4,'E5'],[48,2,'D5'],[50,2,'G4'],[52,2,'B4'],[54,2,'D5'],[56,8,'G5']];
  s.tracks.push(mk('Melodía','lead',mel.map(([step,len,pitch])=>({step,len,pitch})),.8));
  const ch=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]], roots=[45,41,36,43], arp=[], bass=[], dr=[];
  for(let b=0;b<4;b++){
    for(let i=0;i<8;i++)arp.push({step:b*16+i*2,len:1,pitch:nameOf(ch[b][i%3]+12)});
    for(const st of [0,4,6,8,12,14])bass.push({step:b*16+st,len:st==14?2:2,pitch:nameOf(roots[b])});
    for(const st of [0,8])dr.push({step:b*16+st,len:1,pitch:'kick'});
    for(const st of [4,12])dr.push({step:b*16+st,len:1,pitch:'snare'});
    for(let st=0;st<16;st+=2)dr.push({step:b*16+st,len:1,pitch:'hat',...(st%4?{vel:.55}:{})});
  }
  s.tracks.push(mk('Cuerdas','strings',ch.flatMap((c,b)=>c.map(m=>({step:b*16,len:16,pitch:nameOf(m)}))),.45),mk('Arpegio','piano',arp,.5),mk('Bajo','bass2',bass,.9),mk('Batería','drums',dr,.8));
  return s;
}

/* ===== AUDIO ===== */
let ctx,master,bus,noiseBuf,waves={},G=new WeakMap(),wet,reverbIR=null;
const activeVoiceOutputs=new Map();
const activeVoiceSources=new Set();
function chain(){ // maestro -> directo + sala (reverb suave)
  master=ctx.createGain();master.gain.value=+$('#vol').value;master.connect(ctx.destination);
  const len=Math.floor(ctx.sampleRate*1.4);reverbIR=ctx.createBuffer(2,len,ctx.sampleRate);
  for(let c=0;c<2;c++){const d=reverbIR.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len)**3}
  const cv=ctx.createConvolver();cv.buffer=reverbIR;wet=ctx.createGain();wet.gain.value=+$('#rev').value;master.connect(cv);cv.connect(wet);wet.connect(ctx.destination);
  noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  waves={};
}
function initAudio(){
  if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();chain();newBus()}
  if(ctx.state==='suspended')ctx.resume();
}
function newBus(){if(bus)bus.disconnect();bus=ctx.createGain();bus.connect(master);G=new WeakMap()}
function releaseVoiceOutput(output){
  const timer=activeVoiceOutputs.get(output);
  if(timer!==undefined)clearTimeout(timer);
  activeVoiceOutputs.delete(output);
  output.disconnect();
}
function clearVoiceOutputs(){
  for(const output of activeVoiceOutputs.keys())releaseVoiceOutput(output);
}
function startVoiceSource(source,t,stopAt,onended){
  if(!rendering){
    activeVoiceSources.add(source);
    source.onended=()=>{
      activeVoiceSources.delete(source);
      source.disconnect();
      onended?.();
    };
  }
  source.start(t);
  if(stopAt!==undefined)source.stop(stopAt);
}
function stopVoiceSources(){
  for(const source of activeVoiceSources){source.stop();source.disconnect()}
  activeVoiceSources.clear();
}
const W=d=>waves[d]||(waves[d]=(()=>{const N=40,re=new Float32Array(N),im=new Float32Array(N);for(let n=1;n<N;n++)re[n]=2/(n*Math.PI)*Math.sin(n*Math.PI*d);return ctx.createPeriodicWave(re,im)})());
function trackOut(tr){
  let g=G.get(tr);if(!g){g=ctx.createGain();g._p=ctx.createStereoPanner();g.connect(g._p);g._p.connect(bus);G.set(tr,g)}
  g.gain.value=tr.mute?0:tr.volume;g._p.pan.value=clamp(tr.pan||0,-1,1);return g;
}
function tone(w,f,t,dur,v,dest){
  const o=ctx.createOscillator(),g=ctx.createGain(),e=t+dur;
  typeof w==='number'?o.setPeriodicWave(W(w)):o.type=w;
  o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);
  g.gain.linearRampToValueAtTime(v*.75,t+Math.min(dur,.15));g.gain.setTargetAtTime(0,e,.025);
  o.connect(g).connect(dest);startVoiceSource(o,t,e+.25);
}
function noise(hp,d,v,t,dest){
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  s.buffer=noiseBuf;f.type='highpass';f.frequency.value=hp;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
  s.connect(f).connect(g).connect(dest);startVoiceSource(s,t,t+d+.02);
}
function nb(t,dest,hz,q,d,v){ // ráfaga de ruido filtrado: soplo, golpe de martillo, púa, palmada
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  s.buffer=noiseBuf;f.type='bandpass';f.frequency.value=Math.min(hz,18000);f.Q.value=q;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0005,t+d);
  s.connect(f).connect(g).connect(dest);startVoiceSource(s,t,t+d+.02);
}
function voice(P,f,t,dur,v,dest){
  const g=ctx.createGain(),src=ctx.createGain(),a=Math.min(P.A,dur*.8),vol=v*P.a,te=P.ring?t+a+P.D:t+Math.min(a+P.D,dur),end=P.ring?Math.max(t+dur,te):t+dur;
  let lg=null,filter=null;
  if(P.vib){const l=ctx.createOscillator();lg=ctx.createGain();l.frequency.value=P.vib[0];lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(P.vib[1],t+P.vib[2]+.25);l.connect(lg);startVoiceSource(l,t,end+P.R+.1)}
  for(const o of P.o){
    const x=ctx.createOscillator(),og=ctx.createGain();
    typeof o.w==='number'?x.setPeriodicWave(W(o.w)):x.type=o.w;
    x.frequency.value=f*(o.m||1);x.detune.value=o.d||0;og.gain.value=o.g??1;if(lg)lg.connect(x.detune);
    x.connect(og).connect(src);startVoiceSource(x,t,end+P.R+.1);
  }
  if(P.fm)for(const[hz,q,gn]of P.fm){const b=ctx.createBiquadFilter(),bg=ctx.createGain();b.type='bandpass';b.frequency.value=hz;b.Q.value=q;bg.gain.value=gn;src.connect(b).connect(bg).connect(g)}
  else if(P.fl){filter=ctx.createBiquadFilter();filter.type='lowpass';filter.Q.value=P.fl[3];filter.frequency.setValueAtTime(Math.min(f*P.fl[0],16000),t);filter.frequency.exponentialRampToValueAtTime(Math.min(f*P.fl[1],16000),t+P.fl[2]);src.connect(filter).connect(g)}
  else src.connect(g);
  if(P.lfo&&filter){
    const l=ctx.createOscillator(),mod=ctx.createGain(),low=Math.min(P.lfo[1],P.lfo[2]),high=Math.max(P.lfo[1],P.lfo[2]),base=Math.min(f*P.fl[0],16000);
    l.frequency.value=P.lfo[0];mod.gain.value=base*(high-low)/2;
    filter.frequency.cancelScheduledValues(t);
    filter.frequency.setValueAtTime(Math.max(20,base*(high+low)/2),t);
    l.connect(mod).connect(filter.frequency);startVoiceSource(l,t,end+P.R+.1);
  }
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+a);g.gain.linearRampToValueAtTime(vol*P.S,te);g.gain.setTargetAtTime(0,end,P.R/3);
  g.connect(dest);
  if(P.nz)nb(t,dest,f*P.nz[0],P.nz[1],P.nz[2],vol*P.nz[3]);
}
function noteEffects(input,fx,t,dur,dest){
  let current=input;
  const mix=(amount,build)=>{
    const sum=ctx.createGain(),dry=ctx.createGain(),wet=ctx.createGain();
    dry.gain.value=1-amount*.2;wet.gain.value=amount*.65;
    current.connect(dry).connect(sum);build(current).connect(wet).connect(sum);current=sum;
  };
  for(const {id} of FX){
    const amount=clamp(Number(fx?.[id])||0,0,1);
    if(!amount)continue;
    if(id==='tremolo'){
      const amp=ctx.createGain(),lfo=ctx.createOscillator(),depth=ctx.createGain();
      amp.gain.value=1-amount*.4;depth.gain.value=amount*.4;lfo.frequency.value=4+amount*8;
      current.connect(amp);lfo.connect(depth).connect(amp.gain);startVoiceSource(lfo,t,t+dur+.2);current=amp;
    }else if(id==='wah'){
      const filter=ctx.createBiquadFilter(),lfo=ctx.createOscillator(),depth=ctx.createGain();
      filter.type='bandpass';filter.Q.value=2+amount*8;filter.frequency.value=900+amount*1200;
      lfo.frequency.value=1.5+amount*4;depth.gain.value=(900+amount*1200)*.7;lfo.connect(depth).connect(filter.frequency);
      current.connect(filter);startVoiceSource(lfo,t,t+dur+.2);current=filter;
    }else if(id==='compressor'){
      const compressor=ctx.createDynamicsCompressor();
      compressor.threshold.value=-18-amount*24;compressor.knee.value=18;compressor.ratio.value=1+amount*11;
      compressor.attack.value=.003;compressor.release.value=.12;current.connect(compressor);current=compressor;
    }else if(id==='phaser'){
      mix(amount,inputNode=>{
        const filters=Array.from({length:4},(_,i)=>{const f=ctx.createBiquadFilter();f.type='allpass';f.frequency.value=350*2**i;f.Q.value=1.2;return f});
        filters.reduce((node,filter)=>node.connect(filter),inputNode);
        const lfo=ctx.createOscillator(),depth=ctx.createGain();lfo.frequency.value=.25+amount*1.8;depth.gain.value=200+amount*700;
        for(const filter of filters)lfo.connect(depth).connect(filter.frequency);
        startVoiceSource(lfo,t,t+dur+.2);return filters.at(-1);
      });
    }else if(id==='chorus'||id==='flanger'){
      mix(amount,inputNode=>{
        const delay=ctx.createDelay(.08),lfo=ctx.createOscillator(),depth=ctx.createGain();
        const chorus=id==='chorus';delay.delayTime.value=chorus?.018:.003;
        lfo.frequency.value=chorus?.25+amount*1.5:.15+amount*4;
        depth.gain.value=(chorus?.004:.0025)*amount;lfo.connect(depth).connect(delay.delayTime);
        inputNode.connect(delay);startVoiceSource(lfo,t,t+dur+.2);return delay;
      });
    }else if(id==='delay'){
      mix(amount,inputNode=>{
        const sum=ctx.createGain();
        const beat=60/song.bpm;
        const taps=[beat,beat*2,beat*3];
        taps.forEach((time,i)=>{
          const delay=ctx.createDelay(Math.max(1,time+.01)),gain=ctx.createGain();
          delay.delayTime.value=time;gain.gain.value=.52*(.62**i);
          inputNode.connect(delay).connect(gain).connect(sum);
        });
        return sum;
      });
    }else if(id==='reverb'){
      mix(amount,inputNode=>{
        const convolver=ctx.createConvolver();convolver.buffer=reverbIR;inputNode.connect(convolver);return convolver;
      });
    }else if(id==='drive'||id==='fuzz'||id==='bitcrush'){
      mix(amount,inputNode=>{
        const shaper=ctx.createWaveShaper(),curve=new Float32Array(2048);
        if(id==='bitcrush'){
          const levels=2**Math.round(12-amount*9);
          for(let i=0;i<curve.length;i++){const x=i*2/(curve.length-1)-1;curve[i]=Math.round(x*levels)/levels}
        }else{
          const drive=id==='fuzz'?4+amount*28:1+amount*12,normalizer=Math.tanh(drive);
          for(let i=0;i<curve.length;i++){const x=i*2/(curve.length-1)-1;curve[i]=Math.tanh(x*drive)/normalizer}
        }
        shaper.curve=curve;shaper.oversample='2x';inputNode.connect(shaper);return shaper;
      });
    }
  }
  current.connect(dest);
}
function drum(k,t,dest,v=1){
  if(k==='kick'||k==='tom'){const tm=k==='tom',o=ctx.createOscillator(),g=ctx.createGain();
    o.frequency.setValueAtTime(tm?230:160,t);o.frequency.exponentialRampToValueAtTime(tm?110:42,t+(tm?.18:.1));
    g.gain.setValueAtTime((tm?.6:.9)*v,t);g.gain.exponentialRampToValueAtTime(.001,t+(tm?.35:.28));o.connect(g).connect(dest);startVoiceSource(o,t,t+.4)}
  else if(k==='snare'){noise(1500,.16,.35*v,t,dest);tone('triangle',190,t,.06,.25*v,dest)}
  else if(k==='clap'){for(let i=0;i<3;i++)nb(t+i*.011,dest,1400,1,i===2?.18:.03,.5*v)}
  else if(k==='hat')noise(7500,.05,.18*v,t,dest);
  else if(k==='openhat')noise(6500,.3,.18*v,t,dest);
  else if(k==='crash')noise(5000,.95,.22*v,t,dest);
}
function hit(tr,pitch,t,dur,dest,vel=1,fx=null){
  const effects=fx&&Object.keys(fx).length?fx:null;
  if(rendering){
    if(tr.instrument==='drums'){
      if(!effects)return drum(pitch,t,dest,vel);
      const source=ctx.createGain();drum(pitch,t,source,vel);noteEffects(source,effects,t,dur,dest);return;
    }
    if(effects){
      const source=ctx.createGain();voice(INST[tr.instrument].P,hz(midiOf(pitch)),t,dur,vel,source);
      noteEffects(source,effects,t,dur,dest);
    }else voice(INST[tr.instrument].P,hz(midiOf(pitch)),t,dur,vel,dest);
    return;
  }
  const output=ctx.createGain();
  output.connect(dest);
  let tail=dur;
  if(tr.instrument==='drums')tail=Math.max(tail,1);
  else{
    const patch=INST[tr.instrument].P;
    tail=Math.max(tail,patch.ring?patch.A+patch.D:0)+patch.R+.2;
  }
  if(effects?.delay)tail+=3*60/song.bpm+.1;
  if(effects?.reverb)tail+=1.4;
  const timer=setTimeout(()=>releaseVoiceOutput(output),Math.max(0,(t+tail-ctx.currentTime)*1000));
  activeVoiceOutputs.set(output,timer);
  try{
    if(tr.instrument==='drums'){
      if(!effects)return drum(pitch,t,output,vel);
      const source=ctx.createGain();drum(pitch,t,source,vel);noteEffects(source,effects,t,dur,output);return;
    }
    if(effects){
      const source=ctx.createGain();voice(INST[tr.instrument].P,hz(midiOf(pitch)),t,dur,vel,source);
      noteEffects(source,effects,t,dur,output);
    }else voice(INST[tr.instrument].P,hz(midiOf(pitch)),t,dur,vel,output);
  }catch(error){
    releaseVoiceOutput(output);
    throw error;
  }
}
function preview(pitch,fx=song.tracks[sel].fxPreset){if(rendering)return;initAudio();const tr=song.tracks[sel];hit(tr,pitch,ctx.currentTime+.01,.3,trackOut(tr),1,fx)}
function instOpts(){const gr={};for(const[k,v]of Object.entries(INST))(gr[v.g]=gr[v.g]||[]).push(`<option value="${k}">${v.n}</option>`);return Object.entries(gr).map(([g,o])=>`<optgroup label="${g}">${o.join('')}</optgroup>`).join('')}

/* ===== TECLADO TOCABLE ===== */
const keyboardCodes=['KeyA','KeyW','KeyS','KeyE','KeyD','KeyF','KeyT','KeyG','KeyY','KeyH','KeyU','KeyJ','KeyK','KeyO','KeyL','KeyP','Semicolon','Quote','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6'];
const keyboardLabels=['A','W','S','E','D','F','T','G','Y','H','U','J','K','O','L','P',';',"'",'1','2','3','4','5','6'];
const drumPadOrder=['kick','snare','clap','hat','openhat','tom','crash'];
const trackNameFor=instrument=>{
  const base=INST[instrument].n.split(' (')[0],count=song.tracks.filter(track=>track.instrument===instrument).length;
  return count?`${base} ${count+1}`:base;
};
function keyboardStepLabel(step){
  if(step>=total())return 'Fin de canción';
  return `Compás ${Math.floor(step/16)+1} · paso ${step%16+1}`;
}
function selectedLoopRange(){
  const bars=clamp(Math.floor(+$('#loopBars').value||1),1,song.bars),startBar=clamp(Math.floor(+$('#loopStartBar').value||1),1,song.bars);
  $('#loopStartBar').max=song.bars;
  $('#loopStartBar').value=startBar;
  $('#loopBars').max=song.bars;
  $('#loopBars').value=bars;
  const start=(startBar-1)*16,end=Math.min(total(),start+bars*16);
  return{start,end,bars:Math.ceil((end-start)/16),limited:end-start<bars*16};
}
function renderDrumReferenceControls(){
  const controls=$('#drumReferenceControls'),select=$('#drumReferenceTrack');
  if(song.tracks[sel].instrument!=='drums'){controls.hidden=true;return}
  controls.hidden=false;
  const candidates=song.tracks.map((track,index)=>({track,index})).filter(({track,index})=>index!==sel&&track.instrument!=='drums');
  if(!drumReferenceChosen||(drumReferenceTrack&&!candidates.some(({track})=>track===drumReferenceTrack))){
    drumReferenceTrack=candidates[0]?.track??null;
    drumReferenceChosen=true;
  }
  select.replaceChildren(new Option('Sin pista guía',''),...candidates.map(({track,index})=>new Option(`${index+1}. ${track.name}`,String(index))));
  select.value=String(song.tracks.indexOf(drumReferenceTrack));
  if(!drumReferenceTrack)select.value='';
}
function renderLoopTimeline(){
  const {start,end,bars}=selectedLoopRange(),steps=end-start,timeline=$('#loopTimeline');
  timeline.style.setProperty('--loop-steps',steps);
  timeline.innerHTML=Array.from({length:steps},(_,i)=>`<span class="loop-step${i%16===0?' bar-start':''}" data-step="${start+i}" aria-hidden="true"></span>`).join('');
  timeline.setAttribute('aria-label',`Loop desde el compás ${Math.floor(start/16)+1} por ${bars} compás(es)`);
  updateLoopControls();
}
function currentPlaybackPosition(){
  if(!playing||!ctx)return null;
  const stepDuration=60/song.bpm/4,elapsed=Math.max(0,ctx.currentTime-playOriginTime),offset=elapsed/stepDuration;
  if(playbackLoop){
    const span=playbackLoop.end-playbackLoop.start;
    const wrapped=offset%span;
    return playbackLoop.start+wrapped;
  }
  return Math.min(total(),offset);
}
function updateLoopProgress(){
  const position=currentPlaybackPosition(),timeline=$('#loopTimeline');
  const start=playbackLoop?.start??selectedLoopRange().start;
  const index=position===null?-1:Math.floor(position-start);
  for(const step of timeline.children)step.classList.toggle('playing',+step.dataset.step===start+index);
  timeline.classList.toggle('is-playing',position!==null);
}
function updateLoopControls(){
  const loopActive=playing&&!!playbackLoop;
  const range=selectedLoopRange();
  $('#loopBox')?.classList.toggle('is-recording',loopRecording);
  $('#loopPlay').disabled=playing;
  $('#loopRecord').disabled=playing&&(!loopActive||loopRecording);
  $('#loopStopRecording').disabled=!loopActive||!loopRecording;
  $('#loopStop').disabled=!loopActive;
  $('#metronomeLoopControls [data-loop-action="play"]').disabled=playing;
  $('#metronomeLoopControls [data-loop-action="record"]').disabled=playing&&(!loopActive||loopRecording);
  $('#metronomeLoopControls [data-loop-action="stop-recording"]').disabled=!loopActive||!loopRecording;
  $('#metronomeLoopControls [data-loop-action="stop"]').disabled=!loopActive;
  $('#loopStartBar').disabled=loopActive;
  $('#loopBars').disabled=loopActive;
  $('#loopOverdub').disabled=loopActive;
  $('#loopRecord').setAttribute('aria-pressed',String(loopRecording));
  $('#metronomeLoopControls [data-loop-action="record"]').setAttribute('aria-pressed',String(loopRecording));
  $('#loopStatus').textContent=loopActive
    ? loopRecording?'Grabando toma · el loop sigue en reproducción.':'Loop en reproducción · pulsa «Grabar loop» para otra toma.'
    : range.limited?`Loop limitado a ${range.bars} compás(es), hasta el final de la canción.`:'Elige el compás y la duración del loop.';
  updateLoopProgress();
}
function renderKeyboard(){
  const trackSelect=$('#keyboardTrack'),instrumentSelect=$('#keyboardInstrument');
  trackSelect.replaceChildren(...song.tracks.map((track,i)=>{
    const option=document.createElement('option');
    option.value=i;option.textContent=`${i+1}. ${track.name}`;
    return option;
  }));
  trackSelect.value=sel;
  instrumentSelect.innerHTML=instOpts();
  instrumentSelect.value=song.tracks[sel].instrument;
  const drums=song.tracks[sel].instrument==='drums';
  $('#keyboardKeys').hidden=drums;
  $('#drumPads').hidden=!drums;
  $('#keyboardHint').textContent=drums
    ? 'Pads de batería: usa A, W, S, E, D, F y T para kick, snare, clap, hat, open hat, tom y crash.'
    : 'Atajos: octava grave A/W/S/E/D/F/T/G/Y/H/U/J; octava alta K/O/L/P/;/\'/1–6. Mayús + nota graba acordes en el mismo paso.';
  if(drums){
    $('#drumPads').innerHTML=drumPadOrder.map((pitch,i)=>`<button type="button" class="drum-pad" data-pitch="${pitch}" aria-label="Tocar ${pitch}"><span>${pitch}</span><kbd>${['A','W','S','E','D','F','T'][i]}</kbd></button>`).join('');
  }else{
    const root=+$('#root').value,scale=$('#scale').value.split(',').map(Number),octave=+$('#keyboardOctave').value;
    $('#keyboardKeys').innerHTML=keyboardCodes.map((code,i)=>{
      const midi=(octave+1)*12+i,pitch=nameOf(midi),inScale=scale.includes(((midi%12-root)%12+12)%12);
      return `<button type="button" class="piano-key ${NAMES[midi%12].includes('#')?'black':''}" data-pitch="${pitch}" aria-label="Tocar ${pitch}, tecla ${keyboardLabels[i]}" ${inScale?'':'disabled'}><span>${pitch}</span><kbd>${keyboardLabels[i]}</kbd></button>`;
    }).join('');
  }
  const step=playing?Math.max(0,Math.min(Math.floor(currentPlaybackPosition()??cur-1),total())):clamp(+$('#keyboardStep').value||0,0,total());
  $('#keyboardStep').max=total();
  $('#keyboardStep').value=step;
  if(playing){$('#keyboardStep').value=step;$('#keyboardStep').disabled=true}
  else $('#keyboardStep').disabled=false;
  $('#keyboardRecord').disabled=playing&&!!playbackLoop;
  if(playbackLoop)$('#keyboardRecord').checked=loopRecording;
  $('#keyboardPosition').textContent=keyboardStepLabel(step);
}
function playKeyboardPitch(pitch,stack=false){
  if(rendering)return;
  const tr=song.tracks[sel],length=tr.instrument==='drums'?1:+$('#keyboardLength').value;
  initAudio();
  hit(tr,pitch,ctx.currentTime+.015,(60/song.bpm/4)*length,trackOut(tr),1,tr.fxPreset);
  if(!$('#keyboardRecord').checked)return;
  const step=playing?Math.max(0,Math.min(Math.floor(currentPlaybackPosition()??cur-1),total())):clamp(+$('#keyboardStep').value||0,0,total());
  const range=playbackLoop,recordEnd=range?.end??total();
  if(step>=recordEnd){
    $('#keyboardStatus').textContent='La canción está llena. Añade compases para seguir grabando.';
    return;
  }
  const note=noteWithTrackFx(tr,{step,len:Math.min(length,recordEnd-step),pitch});
  tr.notes.push(note);
  if(!playing&&!stack)$('#keyboardStep').value=Math.min(total(),step+note.len);
  $('#keyboardStatus').textContent=`Grabada ${pitch} · ${keyboardStepLabel(step)}${stack?' (acorde)':''}`;
  if($('#keyboardView').hidden)draw();
  else draw();
  renderTabs();
  renderKeyboard();
}
$('#keyboardKeys').addEventListener('click',e=>{
  const key=e.target.closest('[data-pitch]');
  if(key&&!key.disabled)playKeyboardPitch(key.dataset.pitch,e.shiftKey);
});
$('#drumPads').addEventListener('click',e=>{
  const pad=e.target.closest('[data-pitch]');
  if(pad)playKeyboardPitch(pad.dataset.pitch,e.shiftKey);
});
$('#keyboardTrack').addEventListener('change',e=>{sel=+e.target.value;lastSel=-1;refresh()});
$('#keyboardInstrument').addEventListener('change',e=>{
  const tr=song.tracks[sel],was=tr.instrument==='drums',now=e.target.value==='drums';
  if(was!==now&&tr.notes.length){
    if(song.tracks.length>=10){$('#keyboardStatus').textContent='No se cambió el instrumento para conservar las notas; máximo 10 pistas.';renderKeyboard();return}
    const instrument=e.target.value;
    song.tracks.push(mk(trackNameFor(instrument),instrument));
    sel=song.tracks.length-1;
    $('#keyboardStatus').textContent='Se creó una pista nueva para conservar las notas de la pista anterior.';
  }else tr.instrument=e.target.value;
  lastSel=-1;refresh();
});
$('#keyboardAddTrack').addEventListener('click',()=>{
  if(song.tracks.length>=10){$('#keyboardStatus').textContent='Máximo 10 pistas por canción.';return}
  const instrument=$('#keyboardInstrument').value;
  song.tracks.push(mk(trackNameFor(instrument),instrument));
  sel=song.tracks.length-1;lastSel=-1;refresh();
  $('#keyboardStatus').textContent=`Nueva pista: ${song.tracks[sel].name}.`;
});
$('#keyboardOctave').addEventListener('change',renderKeyboard);
$('#keyboardStep').addEventListener('input',e=>{
  e.target.value=clamp(+e.target.value||0,0,total());
  $('#keyboardPosition').textContent=keyboardStepLabel(+e.target.value);
});
$('#keyboardRecord').addEventListener('change',()=>{
  if(playbackLoop&&loopRecording&&!$('#keyboardRecord').checked)stopLoopRecording();
});
$('#loopStartBar').addEventListener('change',renderLoopTimeline);
$('#loopBars').addEventListener('change',renderLoopTimeline);
$('#loopPlay').addEventListener('click',()=>startLoop(false));
$('#loopRecord').addEventListener('click',()=>startLoop(true));
$('#loopStopRecording').addEventListener('click',stopLoopRecording);
$('#loopStop').addEventListener('click',stop);
$('#metronomeLoopControls').addEventListener('click',e=>{
  const action=e.target.closest('[data-loop-action]')?.dataset.loopAction;
  const control={play:'#loopPlay',stop:'#loopStop',record:'#loopRecord','stop-recording':'#loopStopRecording'}[action];
  if(control)$(control).click();
});
document.addEventListener('keydown',e=>{
  if(!e.altKey||!e.shiftKey||e.ctrlKey||e.metaKey||e.repeat||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;
  const control={KeyL:'#loopPlay',KeyS:'#loopStop',KeyR:'#loopRecord',KeyX:'#loopStopRecording'}[e.code];
  if(!control)return;
  e.preventDefault();
  $(control).click();
});
$('#loopOverdub').addEventListener('change',()=>$('#loopStatus').textContent=$('#loopOverdub').checked?'Las tomas nuevas se superponen sin borrar las anteriores.':'La próxima toma reemplazará las notas de la pista elegida dentro del loop.');
$('#root').addEventListener('change',renderKeyboard);
$('#scale').addEventListener('change',renderKeyboard);
$('#editorTabs').addEventListener('click',e=>{
  const tab=e.target.closest('[role="tab"]');
  if(!tab)return;
  const keyboard=tab.id==='tabKeyboard';
  $('#rollView').hidden=keyboard;
  $('#keyboardView').hidden=!keyboard;
  $('#tabRoll').setAttribute('aria-selected',String(!keyboard));
  $('#tabKeyboard').setAttribute('aria-selected',String(keyboard));
  if(keyboard)renderKeyboard();
});
document.addEventListener('keydown',e=>{
  const keyboardVisible=$('#keyboardView')&&!$('#keyboardView').hidden,loopCapture=playing&&!!playbackLoop&&loopRecording;
  if((!keyboardVisible&&!loopCapture)||e.repeat||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)||document.activeElement.closest('button')&&!document.activeElement.closest('#keyboardKeys,#drumPads'))return;
  const index=keyboardCodes.indexOf(e.code),drumIndex=['KeyA','KeyW','KeyS','KeyE','KeyD','KeyF','KeyT'].indexOf(e.code);
  const isDrums=song.tracks[sel].instrument==='drums';
  if(isDrums&&drumIndex>=0){e.preventDefault();playKeyboardPitch(drumPadOrder[drumIndex],e.shiftKey);return}
  if(!isDrums&&index>=0){
    const midi=(+$('#keyboardOctave').value+1)*12+index,pitch=nameOf(midi),key=$(`#keyboardKeys [data-pitch]:nth-child(${index+1})`),root=+$('#root').value,scale=$('#scale').value.split(',').map(Number);
    if(!scale.includes(((midi%12-root)%12+12)%12))return;
    e.preventDefault();playKeyboardPitch(pitch,e.shiftKey);
    if(key){key.classList.add('pressed');setTimeout(()=>key.classList.remove('pressed'),120)}
  }
});

/* ===== REPRODUCCIÓN ===== */
let playing=false,timer,nextT,cur,queue=[],ended=false,endAt=0,playbackLoop=null,loopRecording=false,playOriginTime=0;
let restoreLoopMetronome=false,loopMetronomeBefore=false;
let rendering=false;
function metronomeClick(t,accent){
  const level=+$('#metronomeVolume').value;
  animateMetronome(t,accent);
  if(level<=0)return;
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type='triangle';osc.frequency.setValueAtTime(accent?1760:1180,t);
  gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime((accent?.24:.15)*level,t+.002);
  gain.gain.exponentialRampToValueAtTime(.0001,t+.045);
  osc.connect(gain).connect(bus);startVoiceSource(osc,t,t+.05,()=>gain.disconnect());
}
function updateMetronomeVisibility(){
  $('#metronomeVisual').classList.toggle('is-visible',playing&&$('#metronome').checked);
}
function animateMetronome(t,accent){
  const visual=$('#metronomeVisual'),arm=$('#metronomeArm'),beat=Math.floor(cur/4)%4;
  visual.classList.toggle('is-accent',accent);
  visual.querySelectorAll('.metronome-beats i').forEach((dot,index)=>dot.classList.toggle('is-current',index===beat));
  const duration=60/song.bpm*1000,startAngle=beat%2===0?-24:24,endAngle=-startAngle;
  arm.getAnimations().forEach(animation=>animation.cancel());
  arm.style.transform=`rotate(${startAngle}deg)`;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){arm.style.transform=`rotate(${endAngle}deg)`;return}
  arm.animate(
    [{transform:`rotate(${startAngle}deg)`},{transform:`rotate(${endAngle}deg)`}],
    {duration,delay:Math.max(0,(t-ctx.currentTime)*1000),easing:'ease-in-out',fill:'forwards'}
  );
}
function play(loop=null,record=false){if(rendering)return;
  initAudio();stop();newBus();cur=0;nextT=ctx.currentTime+.08;queue=[];ended=false;playing=true;
  playbackLoop=loop;loopRecording=record;
  if(playbackLoop)cur=playbackLoop.start;
  playOriginTime=nextT;renderKeyboard();updateMetronomeVisibility();timer=setInterval(tick,25);$('#play').classList.add('on');$('#play').textContent='❚❚';$('#ph').style.display='block';requestAnimationFrame(frame);
  updateLoopControls();
}
function startLoop(record){
  if(!(playing&&playbackLoop)){
    loopMetronomeBefore=$('#metronome').checked;
    restoreLoopMetronome=true;
    $('#metronome').checked=true;
    updateMetronomeVisibility();
  }
  const range=selectedLoopRange();
  if(playing&&playbackLoop){
    if(!record||loopRecording)return;
    if(!$('#loopOverdub').checked){
      const tr=song.tracks[sel];
      tr.notes=tr.notes.filter(note=>note.step+note.len<=range.start||note.step>=range.end);
      draw();
    }
    loopRecording=true;$('#keyboardRecord').checked=true;$('#loopRecord').blur();
    renderKeyboard();updateLoopControls();return;
  }
  if(record&&!$('#loopOverdub').checked){
    const tr=song.tracks[sel];
    tr.notes=tr.notes.filter(note=>note.step+note.len<=range.start||note.step>=range.end);
    draw();
  }
  $('#keyboardRecord').checked=record;
  if(record)$('#loopRecord').blur();
  play(range,record);
}
function stopLoopRecording(){
  if(!playbackLoop||!loopRecording)return;
  loopRecording=false;$('#keyboardRecord').checked=false;
  $('#keyboardStatus').textContent='Toma terminada; el loop sigue reproduciéndose.';
  updateLoopControls();
}
function tick(){
  while(nextT<ctx.currentTime+.12){
    const sd=60/song.bpm/4;queue.push({s:cur,t:nextT,sd});
    if($('#metronome').checked&&cur%4===0)metronomeClick(nextT,cur%16===0);
    for(const tr of song.tracks){const out=trackOut(tr);for(const n of tr.notes)if(n.step===cur)hit(tr,n.pitch,nextT,n.len*sd,out,n.vel??1,n.fx)}
    nextT+=sd;cur++;
    if(playbackLoop&&cur>=playbackLoop.end)cur=playbackLoop.start;
    else if(cur>=total()){if($('#loop').checked)cur=0;else{ended=true;const hasDelay=song.tracks.some(track=>track.notes.some(note=>note.fx?.delay));endAt=nextT+Math.max(1.5,hasDelay?3*60/song.bpm:0);clearInterval(timer);return}}
  }
}
function stop(){
  const wasLooping=!!playbackLoop;
  clearInterval(timer);stopVoiceSources();clearVoiceOutputs();if(bus)newBus();playing=false;playbackLoop=null;loopRecording=false;
  if(wasLooping&&restoreLoopMetronome)$('#metronome').checked=loopMetronomeBefore;
  if(wasLooping)restoreLoopMetronome=false;
  updateMetronomeVisibility();$('#metronomeVisual').classList.remove('is-accent');$('#metronomeArm').getAnimations().forEach(animation=>animation.cancel());
  if(wasLooping)$('#keyboardRecord').checked=false;
  $('#play').classList.remove('on');$('#play').textContent='▶';$('#ph').style.display='none';
  if($('#keyboardView'))renderKeyboard();
  if($('#loopTimeline'))updateLoopControls();
}
function frame(){
  if(!playing)return;const now=ctx.currentTime;
  if(!$('#keyboardView').hidden){
    const step=Math.max(0,Math.min(Math.floor(currentPlaybackPosition()??cur-1),total()));
    $('#keyboardStep').value=step;
    $('#keyboardPosition').textContent=keyboardStepLabel(step);
  }
  updateLoopProgress();
  while(queue.length>1&&queue[1].t<=now)queue.shift();
  const h=queue[0];if(h&&h.t<=now){
    const x=KW+(h.s+Math.min(1,(now-h.t)/h.sd))*CW,ph=$('#ph'),sc=$('#scroll');ph.style.left=x+'px';
    if(x<sc.scrollLeft+KW||x>sc.scrollLeft+sc.clientWidth-40)sc.scrollLeft=x-KW-80;
  }
  if(ended&&now>endAt)return stop();
  requestAnimationFrame(frame);
}

/* ===== ROLL ===== */
function rowsOf(tr){
  if(tr.instrument==='drums')return DR.map(k=>({p:k,l:k}));
  const I=INST[tr.instrument];let lo=I.lo,hi=I.hi;
  for(const n of tr.notes){const m=midiOf(n.pitch);lo=Math.min(lo,Math.floor(m/12)*12);hi=Math.max(hi,Math.ceil((m+1)/12)*12)}
  const r=[];for(let m=hi;m>=lo;m--)r.push({p:nameOf(m),m,l:nameOf(m),black:NAMES[m%12].includes('#')});return r;
}
function draw(){
  const tr=song.tracks[sel],rows=rowsOf(tr),reference=tr.instrument==='drums'?drumReferenceTrack:null,referenceRows=reference?rowsOf(reference):[],rowHeight=rows.length*RH,H=(rows.length+referenceRows.length)*RH,Wd=total()*CW,cs=getComputedStyle(document.documentElement),v=n=>cs.getPropertyValue(n).trim();
  const root=+$('#root').value,sc=$('#scale').value.split(',').map(Number),col=INST[tr.instrument].c;
  const g=$('#grid'),k=$('#keys');if(g.width!==Wd)g.width=Wd;if(g.height!==H)g.height=H;if(k.width!==KW)k.width=KW;if(k.height!==H)k.height=H;$('#ph').style.height=H+'px';
  const c=g.getContext('2d'),kc=k.getContext('2d');
  rows.forEach((r,i)=>{
    const y=i*RH,drum=tr.instrument==='drums',ins=!drum&&sc.includes(((r.m-root)%12+12)%12);
    c.fillStyle=drum?v('--row'):r.black?v('--rowb'):ins?v('--scale'):v('--row');c.fillRect(0,y,Wd,RH);
    if(ins){c.fillStyle=col+'22';c.fillRect(0,y,Wd,RH)}
    if(!drum&&r.m%12===0){c.fillStyle=v('--line');c.fillRect(0,y+RH-1,Wd,1)}
    kc.fillStyle=drum?v('--panel'):r.black?'#1b1b26':'#ecedf5';kc.fillRect(0,y,KW,RH);
    kc.fillStyle=drum?v('--tx'):r.black?'#9aa':'#333';kc.font='10px ui-monospace,monospace';kc.textBaseline='middle';
    if(drum||!r.black||true)kc.fillText(r.l,6,y+RH/2);
    if(!drum&&r.m%12===0){kc.fillStyle=col;kc.fillRect(KW-4,y,4,RH)}
    kc.fillStyle='#0003';kc.fillRect(0,y+RH-1,KW,1);
  });
  if(reference){
    const referenceColor=INST[reference.instrument].c;
    c.fillStyle=v('--rowb');c.fillRect(0,rowHeight,Wd,referenceRows.length*RH);
    referenceRows.forEach((r,i)=>{
      const y=rowHeight+i*RH,ins=sc.includes(((r.m-root)%12+12)%12);
      c.fillStyle=r.black?v('--rowb'):ins?v('--scale'):v('--row');c.fillRect(0,y,Wd,RH);
      if(ins){c.fillStyle=referenceColor+'12';c.fillRect(0,y,Wd,RH)}
      if(r.m%12===0){c.fillStyle=v('--line');c.fillRect(0,y+RH-1,Wd,1)}
      kc.fillStyle=r.black?'#1b1b26':'#ecedf5';kc.fillRect(0,y,KW,RH);
      kc.fillStyle=r.black?'#9aa':'#333';kc.font='10px ui-monospace,monospace';kc.textBaseline='middle';kc.fillText(r.l,6,y+RH/2);
      if(r.m%12===0){kc.fillStyle=referenceColor;kc.fillRect(KW-4,y,4,RH)}
      kc.fillStyle='#0003';kc.fillRect(0,y+RH-1,KW,1);
    });
    c.strokeStyle=referenceColor+'99';c.lineWidth=2;c.beginPath();c.moveTo(0,rowHeight+.5);c.lineTo(Wd,rowHeight+.5);c.stroke();
    for(const note of reference.notes){
      const row=referenceRows.findIndex(item=>item.p===note.pitch);if(row<0)continue;
      const y=rowHeight+row*RH;
      c.globalAlpha=.34;c.fillStyle=referenceColor;c.fillRect(note.step*CW+1,y+2,note.len*CW-2,RH-4);c.globalAlpha=1;
      if(note.len*CW>30){c.fillStyle=v('--tx');c.globalAlpha=.75;c.font='bold 9px ui-monospace,monospace';c.fillText(note.pitch,note.step*CW+4,y+RH/2);c.globalAlpha=1}
    }
  }
  const loopRange=selectedLoopRange();
  c.fillStyle='rgba(104,240,220,.07)';
  c.fillRect(loopRange.start*CW,0,(loopRange.end-loopRange.start)*CW,H);
  c.lineWidth=1;
  for(let s=0;s<=total();s++){c.strokeStyle=s%16===0?v('--mut'):s%4===0?v('--line'):v('--line')+'66';c.beginPath();c.moveTo(s*CW+.5,0);c.lineTo(s*CW+.5,H);c.stroke()}
  c.strokeStyle='#68f0dcaa';c.lineWidth=2;
  for(const step of [loopRange.start,loopRange.end]){c.beginPath();c.moveTo(step*CW+.5,0);c.lineTo(step*CW+.5,H);c.stroke()}
  for(const n of tr.notes){
    const i=rows.findIndex(r=>r.p===n.pitch);if(i<0)continue;
    c.globalAlpha=.4+.6*(n.vel??1);c.fillStyle=col;c.fillRect(n.step*CW+1,i*RH+1,n.len*CW-2,RH-2);c.globalAlpha=1;c.fillStyle='#0008';c.fillRect(n.step*CW+1,i*RH+RH-3,n.len*CW-2,2);
    if(n===selectedNote){c.strokeStyle='#fff';c.lineWidth=2;c.strokeRect(n.step*CW+2,i*RH+2,n.len*CW-4,RH-4)}
    if(n.fx&&Object.keys(n.fx).length){c.fillStyle='#171a30';c.beginPath();c.arc(n.step*CW+n.len*CW-5,i*RH+5,3,0,Math.PI*2);c.fill()}
    if(n.len*CW>30&&tr.instrument!=='drums'){c.fillStyle='#1a1530';c.font='bold 9px ui-monospace,monospace';c.fillText(n.pitch,n.step*CW+4,i*RH+RH/2)}
  }
}
function renderNoteFx(){
  const tr=song.tracks[sel],note=tr.notes.includes(selectedNote)?selectedNote:null,controls=$('#noteFxControls');
  $('#deleteNote').disabled=!note;
  if(!note){
    selectedNote=null;$('#noteFxStatus').textContent='Selecciona una nota; su ajuste será el predeterminado para las notas nuevas de esta pista.';
    controls.innerHTML='<span class="hint">Las notas nuevas heredan el ajuste actual; las notas existentes no cambian.</span>';return;
  }
  $('#noteFxStatus').textContent=`${note.pitch} · ${keyboardStepLabel(note.step)} · ${note.len} paso(s) · Su ajuste será el predeterminado para las notas nuevas de esta pista.`;
  controls.innerHTML=FX.map(({id,name,hint})=>{
    const value=note.fx?.[id]??0,active=value>0;
    return `<div class="note-fx-control">
      <label title="${hint}"><input type="checkbox" data-fx="${id}" ${active?'checked':''}> ${name}</label>
      <input type="range" min="0" max="1" step=".05" value="${value}" data-fx-level="${id}" aria-label="Intensidad de ${name}" ${active?'':'disabled'}>
      <output data-fx-output="${id}">${Math.round(value*100)}%</output>
    </div>`;
  }).join('');
  controls.querySelectorAll('[data-fx]').forEach(input=>input.addEventListener('change',()=>{
    const id=input.dataset.fx;
    const fx={...note.fx};
    if(input.checked)fx[id]=.5;else delete fx[id];
    setNoteFx(tr,note,fx);
    renderNoteFx();draw();
  }));
  controls.querySelectorAll('[data-fx-level]').forEach(input=>input.addEventListener('input',()=>{
    const id=input.dataset.fxLevel,value=+input.value;
    const fx={...note.fx,[id]:value};
    if(!value)delete fx[id];
    setNoteFx(tr,note,fx);
    const toggle=controls.querySelector(`[data-fx="${id}"]`);toggle.checked=value>0;
    input.disabled=value===0;
    controls.querySelector(`[data-fx-output="${id}"]`).textContent=`${Math.round(value*100)}%`;
    draw();
  }));
}
function deleteSelectedNote(){
  const notes=song.tracks[sel].notes,index=notes.indexOf(selectedNote);
  if(index<0)return;
  notes.splice(index,1);selectedNote=null;refresh();
  $('#msg').textContent='Nota eliminada.';
}
$('#deleteNote').addEventListener('click',deleteSelectedNote);
let drag=null;
const grid=$('#grid'),EDGE=9;
const hitAt=(tr,rows,e)=>{const r=rows[Math.floor(e.offsetY/RH)],st=Math.floor(e.offsetX/CW);if(!r||st<0||st>=total())return null;return{r,s:st,n:tr.notes.find(n=>n.pitch===r.p&&st>=n.step&&st<n.step+n.len)}};
const nearEdge=(n,e)=>n.step*CW+n.len*CW-e.offsetX<EDGE;
grid.addEventListener('pointerdown',e=>{
  const tr=song.tracks[sel],rows=rowsOf(tr),h=hitAt(tr,rows,e);if(!h)return;
  if(h.n&&e.shiftKey){const c=[1,.7,.45],i=(c.indexOf(h.n.vel??1)+1)%3;i?h.n.vel=c[i]:delete h.n.vel;preview(h.r.p,h.n.fx);draw();return}
  selectedNote=h.n||null;renderNoteFx();draw();
  grid.setPointerCapture(e.pointerId);
  if(h.n)drag={n:h.n,mode:nearEdge(h.n,e)?'size':'move',x0:e.offsetX,y0:Math.floor(e.offsetY/RH),step0:h.n.step,moved:false,fresh:false,rows};
  else{const n=noteWithTrackFx(tr,{step:h.s,len:Math.min(L,total()-h.s),pitch:h.r.p});tr.notes.push(n);selectedNote=n;renderNoteFx();preview(n.pitch,n.fx);drag={n,mode:'size',x0:e.offsetX,y0:0,moved:false,fresh:true,rows};draw()}
});
grid.addEventListener('pointermove',e=>{
  if(!drag){const tr=song.tracks[sel],h=hitAt(tr,rowsOf(tr),e);grid.style.cursor=h&&h.n?(nearEdge(h.n,e)?'ew-resize':'grab'):'crosshair';return}
  const n=drag.n,row=clamp(Math.floor(e.offsetY/RH),0,drag.rows.length-1);
  if(!drag.moved&&(Math.abs(e.offsetX-drag.x0)>4||(!drag.fresh&&row!==drag.y0)))drag.moved=true;
  if(!drag.moved)return;
  if(drag.mode==='size')n.len=clamp(Math.floor(e.offsetX/CW)-n.step+1,1,total()-n.step);
  else{
    n.step=clamp(drag.step0+Math.round((e.offsetX-drag.x0)/CW),0,total()-n.len);
    const r=drag.rows[row];if(r.p!==n.pitch){n.pitch=r.p;preview(r.p,n.fx)}
  }
  grid.style.cursor=drag.mode==='size'?'ew-resize':'grabbing';draw();
});
const endDrag=()=>{
  if(!drag)return;const tr=song.tracks[sel];
  if(!drag.moved&&!drag.fresh){
    selectedNote=drag.n;renderNoteFx();
    const row=drag.rows.findIndex(item=>item.p===drag.n.pitch);
    if(row>=0)$('#noteFxStatus').textContent=`${drag.n.pitch} · ${keyboardStepLabel(drag.n.step)} · ${drag.n.len} paso(s) · Seleccionada; Eliminar nota o Suprimir`;
  }
  drag=null;draw();
};
grid.addEventListener('pointerup',endDrag);grid.addEventListener('pointercancel',endDrag);
$('#keys').addEventListener('pointerdown',e=>{const r=rowsOf(song.tracks[sel])[Math.floor(e.offsetY/RH)];if(r){if(playing&&playbackLoop&&loopRecording)playKeyboardPitch(r.p,e.shiftKey);else preview(r.p)}});

/* ===== UI ===== */
function renderTabs(){
  const t=$('#tabs');t.innerHTML='';
  song.tracks.forEach((tr,i)=>{const b=document.createElement('button');b.className='tab'+(i===sel?' sel':'');b.style.setProperty('--c',INST[tr.instrument].c);
    b.textContent=(tr.mute?'🔇 ':'')+tr.name;b.onclick=()=>{sel=i;refresh()};t.appendChild(b)});
  const s=document.createElement('select');s.innerHTML='<option value="">＋ Añadir pista…</option>'+instOpts();
  s.onchange=()=>{if(!s.value||song.tracks.length>=10)return;song.tracks.push(mk(INST[s.value].n.split(' (')[0],s.value));sel=song.tracks.length-1;refresh()};t.appendChild(s);
  renderDrumReferenceControls();
}
function renderSettings(){
  const tr=song.tracks[sel],p=$('#settings');
  p.innerHTML=`<label>Nombre <input id="tn" value="" style="width:130px"></label>
  <label>Instrumento <select id="ti">${instOpts()}</select></label>
  <label>Volumen <input id="tv" type="range" min="0" max="1" step=".01"></label>
  <label>Paneo <input id="tp" type="range" min="-1" max="1" step=".05"></label>
  <label><input id="tm" type="checkbox"> Silenciar</label>
  <button id="tc">Vaciar pista</button><button id="td">Eliminar pista</button>`;
  $('#tn').value=tr.name;$('#ti').value=tr.instrument;$('#tv').value=tr.volume;$('#tp').value=tr.pan||0;$('#tm').checked=tr.mute;
  $('#tn').oninput=e=>{tr.name=e.target.value;renderTabs()};
  $('#ti').onchange=e=>{const was=tr.instrument==='drums',now=e.target.value==='drums';tr.instrument=e.target.value;if(was!==now)tr.notes=[];lastSel=-1;refresh()};
  $('#tv').oninput=e=>{tr.volume=+e.target.value;if(playing)trackOut(tr)};
  $('#tp').oninput=e=>{tr.pan=+e.target.value;if(playing)trackOut(tr)};
  $('#tm').onchange=e=>{tr.mute=e.target.checked;if(playing)trackOut(tr);renderTabs()};
  $('#tc').onclick=()=>{tr.notes=[];selectedNote=null;renderNoteFx();draw()};
  $('#td').onclick=()=>{if(song.tracks.length>1){song.tracks.splice(sel,1);selectedNote=null;sel=Math.max(0,sel-1);refresh()}};
}
function refresh(){
  $('#title').value=song.title;$('#bpm').value=song.bpm;$('#bars').textContent=song.bars;
  renderTabs();renderSettings();draw();renderNoteFx();renderKeyboard();renderLoopTimeline();
  if(sel!==lastSel){lastSel=sel;focusRoll()}
}
$('#drumReferenceTrack').addEventListener('change',e=>{
  const index=e.target.value===''?-1:+e.target.value;
  drumReferenceTrack=index<0?null:song.tracks[index];
  drumReferenceChosen=true;
  draw();
});
function focusRoll(){const tr=song.tracks[sel],rows=rowsOf(tr),ys=tr.notes.map(n=>rows.findIndex(r=>r.p===n.pitch)).filter(i=>i>=0);$('#scroll').scrollTop=Math.max(0,(ys.length?Math.min(...ys):Math.floor(rows.length/3))*RH-40)}
function setBars(n){
  song.bars=clamp(n,1,64);for(const t of song.tracks)t.notes=t.notes.filter(x=>x.step<total()).map(x=>({...x,len:Math.min(x.len,total()-x.step)}));refresh();
}
$('#barP').onclick=()=>setBars(song.bars+1);$('#barM').onclick=()=>setBars(song.bars-1);
$('#dup').onclick=()=>{if(song.bars>32)return msg('Máximo 64 compases.');const T=total();for(const t of song.tracks)t.notes.push(...t.notes.map(n=>({...n,step:n.step+T})));song.bars*=2;refresh()};
$('#bpm').onchange=e=>{song.bpm=clamp(+e.target.value||120,40,240);e.target.value=song.bpm;$('#metronomeTempo').textContent=`${song.bpm} BPM`};
$('#title').oninput=e=>song.title=e.target.value;
$('#vol').oninput=e=>{if(master)master.gain.value=+e.target.value};
$('#rev').oninput=e=>{if(wet)wet.gain.value=+e.target.value};
$('#metronomeVolume').addEventListener('input',e=>e.target.title=`Nivel del metrónomo: ${Math.round(+e.target.value*100)}%`);
$('#metronome').addEventListener('change',()=>{
  if(playing&&playbackLoop)restoreLoopMetronome=false;
  updateMetronomeVisibility();
});
$('#root').innerHTML=NAMES.map((n,i)=>`<option value="${i}">${n}</option>`).join('');$('#root').value=9;
$('#root').onchange=$('#scale').onchange=draw;
$('#lens').innerHTML=[[1,'1/16'],[2,'1/8'],[4,'1/4'],[8,'1/2'],[16,'1']].map(([n,l])=>`<button data-l="${n}">${l}</button>`).join('');
$('#lens').onclick=e=>{const b=e.target.closest('button');if(!b)return;L=+b.dataset.l;[...$('#lens').children].forEach(x=>x.classList.toggle('on',x===b))};
$('#lens').children[1].classList.add('on');
$('#play').onclick=()=>playing?stop():play();$('#stop').onclick=stop;
addEventListener('keydown',e=>{if(e.code==='Space'&&!/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement.tagName)){e.preventDefault();playing?stop():play()}});
addEventListener('keydown',e=>{
  if(!['Delete','Backspace'].includes(e.key)||/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement.tagName)||!selectedNote)return;
  e.preventDefault();deleteSelectedNote();
});

/* ===== IMPORT / EXPORT ===== */
const msg=t=>$('#msg').textContent=t;
function norm(o){
  if(!o||!Array.isArray(o.tracks))throw Error('falta el arreglo "tracks"');
  const s={format:'chiptune-studio',version:1,title:String(o.title||'Sin título'),bpm:clamp(+o.bpm||120,40,240),bars:1,tracks:[]};let end=0,bad=0;
  o.tracks.slice(0,10).forEach(t=>{
    const ins=INST[t.instrument]?t.instrument:'pulse25',notes=[];
    (t.notes||[]).forEach(n=>{
      let p=n.pitch;if(typeof p==='number')p=nameOf(p);
      if(ins==='drums'){p=String(p).toLowerCase();if(!DR.includes(p)){bad++;return}}
      else{const m=midiOf(String(p));if(m==null){bad++;return}p=nameOf(m)}
      const st=Math.max(0,Math.floor(+n.step||0)),len=Math.max(1,Math.floor(+n.len||1));const vl=n.vel==null?1:clamp(+n.vel||1,.1,1),nt={step:st,len,pitch:p};if(vl<1)nt.vel=+vl.toFixed(2);
      const fx=cleanFx(n.fx);if(fx&&Object.keys(fx).length)nt.fx=fx;
      notes.push(nt);end=Math.max(end,st+len);
    });
    const fxPreset=cleanFx(t.fxPreset)??cleanFx(notes.at(-1)?.fx)??{};
    s.tracks.push({name:String(t.name||INST[ins].n),instrument:ins,volume:clamp(t.volume??.8,0,1),pan:clamp(+t.pan||0,-1,1),mute:!!t.mute,notes,fxPreset});
  });
  if(!s.tracks.length)throw Error('no hay pistas');
  s.bars=clamp(Math.max(Math.floor(+o.bars||1),Math.ceil(end/16)),1,64);
  for(const t of s.tracks)t.notes=t.notes.filter(n=>n.step<s.bars*16).map(n=>({...n,len:Math.min(n.len,s.bars*16-n.step)}));
  s._bad=bad;return s;
}
function parse(text){
  const a=text.indexOf('{'),b=text.lastIndexOf('}');if(a<0||b<a)throw Error('no encontré un objeto { ... }');
  const body=text.slice(a,b+1);
  try{return JSON.parse(body)}catch(e){return new Function('"use strict";return ('+body+')')()}
}
function load(text){
  try{const s=norm(parse(text));const bad=s._bad;delete s._bad;stop();song=s;sel=0;lastSel=-1;refresh();msg(`Importada «${s.title}»: ${s.tracks.length} pistas, ${s.bars} compases.`+(bad?` Se ignoraron ${bad} notas inválidas.`:''))}
  catch(e){msg('No se pudo importar: '+e.message)}
}
window.addEventListener('message',e=>{
  if(e.source!==window.parent||e.data?.type!=='chiptune-studio:import-song')return;
  const incoming=e.data.song;
  if(!incoming||typeof incoming!=='object'||Array.isArray(incoming))return;
  load(JSON.stringify(incoming));
});
function fmt(){
  const {tracks,...head}=song;
  const tr=tracks.map(t=>{const {notes,...r}=t;return '  {'+JSON.stringify(r).slice(1,-1)+',\n   "notes":[\n'+t.notes.slice().sort((a,b)=>a.step-b.step).map(n=>'    '+JSON.stringify(n)).join(',\n')+'\n   ]}'});
  return JSON.stringify(head).slice(0,-1).replace(/,"/g,',\n "').replace('{"','{\n "')+',\n "tracks":[\n'+tr.join(',\n')+'\n ]\n}';
}
const slug=()=>(song.title||'cancion').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'cancion';
function dl(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
$('#xJson').onclick=()=>{const t=fmt();$('#out').value=t;dl(slug()+'.json',new Blob([t],{type:'application/json'}));msg('Descargado '+slug()+'.json (si tu navegador bloqueó la descarga, copia el texto del cuadro).')};
$('#xJs').onclick=()=>{const t='// Chiptune Studio v1 · 16 pasos por compás · pitch "C4" = Do central\nconst song = '+fmt()+';\n\nexport default song;\n';$('#out').value=t;dl(slug()+'.js',new Blob([t],{type:'text/javascript'}));msg('Descargado '+slug()+'.js (si no se descargó, copia el texto del cuadro).')};
function wavBlob(buf){
  const n=buf.length,ch=[buf.getChannelData(0),buf.getChannelData(1)];let pk=0;
  for(const c of ch)for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(c[i]));
  const k=pk>0?.9/pk:1,a=new ArrayBuffer(44+n*4),v=new DataView(a),w=(o,t)=>[...t].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));
  w(0,'RIFF');v.setUint32(4,36+n*4,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);
  v.setUint32(24,buf.sampleRate,true);v.setUint32(28,buf.sampleRate*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*4,true);
  let o=44;for(let i=0;i<n;i++)for(let c=0;c<2;c++){v.setInt16(o,clamp(ch[c][i]*k,-1,1)*32767,true);o+=2}
  return new Blob([a],{type:'audio/wav'});
}
$('#xWav').onclick=async()=>{
  if(rendering)return;stop();rendering=true;msg('Renderizando WAV…');
  const sv={ctx,master,bus,noiseBuf,waves,G,wet,reverbIR};
  try{
    const sr=44100,sd=60/song.bpm/4,T=total()*sd;
    const delayTail=song.tracks.some(track=>track.notes.some(note=>note.fx?.delay))?3*60/song.bpm:0;
    ctx=new OfflineAudioContext(2,Math.ceil((T+Math.max(2.5,delayTail+.25))*sr),sr);
    chain();bus=ctx.createGain();bus.connect(master);G=new WeakMap();
    for(const tr of song.tracks){const out=trackOut(tr);for(const n of tr.notes)hit(tr,n.pitch,.01+n.step*sd,n.len*sd,out,n.vel??1,n.fx)}
    const buf=await ctx.startRendering();
    ({ctx,master,bus,noiseBuf,waves,G,wet,reverbIR}=sv);
    dl(slug()+'.wav',wavBlob(buf));msg('Descargado '+slug()+'.wav ('+T.toFixed(1)+' s, 44.1 kHz estéreo, 16 bits).');
  }catch(e){({ctx,master,bus,noiseBuf,waves,G,wet,reverbIR}=sv);msg('No se pudo crear el WAV: '+e.message)}
  rendering=false;
};
$('#copy').onclick=async()=>{const o=$('#out');o.select();try{await navigator.clipboard.writeText(o.value);msg('Copiado.')}catch(e){document.execCommand('copy');msg('Texto seleccionado: usa Ctrl/Cmd+C si no se copió.')}};
$('#clearBox').onclick=()=>{$('#out').value='';$('#out').focus();msg('Cuadro limpio.')};
$('#iText').onclick=()=>load($('#out').value);
$('#file').onchange=async e=>{const f=e.target.files[0];if(f){const t=await f.text();$('#out').value=t;load(t)}e.target.value=''};
$('#guide').onclick=()=>{$('#out').value=GUIDE;$('#out').focus();msg('Guía lista. Pulsa «Copiar texto» y pégala en tu IA.')};
$('#demo').onclick=()=>{stop();song=demo();sel=0;lastSel=-1;refresh();msg('Demo cargada.')};
$('#clear').onclick=()=>{if(!confirm('¿Borrar la canción actual y empezar una nueva?'))return;stop();song={format:'chiptune-studio',version:1,title:'Mi canción',bpm:120,bars:4,tracks:[mk('Melodía','pulse25'),mk('Bajo','bass'),mk('Batería','drums')]};sel=0;lastSel=-1;refresh();msg('Canción nueva.')};

const KEY='chiptune-studio-autosave-v1';let lastSaved='',restored=false;
try{const r=localStorage.getItem(KEY);if(r){song=norm(JSON.parse(r));delete song._bad;restored=true}}catch(e){}
if(!song)song=demo();
refresh();$('#metronomeTempo').textContent=`${song.bpm} BPM`;if(restored)msg('Recuperé tu última sesión (autoguardado).');
function autosave(){try{const t=JSON.stringify(song);if(t!==lastSaved){localStorage.setItem(KEY,t);lastSaved=t;$('#saved').textContent='✓ Autoguardado '+new Date().toLocaleTimeString()}}catch(e){$('#saved').textContent='Autoguardado no disponible en este modo'}}
setInterval(autosave,1500);addEventListener('pagehide',autosave);document.addEventListener('visibilitychange',()=>{if(document.hidden)autosave()});
