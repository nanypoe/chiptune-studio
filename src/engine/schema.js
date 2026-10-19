/* Registro y validación de instrumentos y efectos. Un archivo mal formado NO rompe el motor: se anota en CS.errors y se ignora. */
CS.check = (c, msg) => { if (!c) throw new Error(msg); };
CS.registerInstrument = (d) => {
  try {
    CS.check(d && d.id && d.name, 'faltan "id" y "name"');
    if (d.id === 'drums') {
      CS.check(d.pieces && Object.keys(d.pieces).length, 'drums: falta "pieces"');
      for (const [k, p] of Object.entries(d.pieces)) CS.check(Array.isArray(p.layers) && p.layers.length, `drums.${k}: falta "layers"`);
      CS.drumOrder = Object.keys(d.pieces);
    } else {
      CS.check(Array.isArray(d.osc) && d.osc.length && d.env, 'faltan "osc" y "env"');
      d.osc.forEach((o, i) => CS.check(['sine', 'triangle', 'saw', 'square', 'pulse', 'pwm'].includes(o.wave), `osc[${i}].wave inválida`));
      ['attack', 'decay', 'sustain', 'release'].forEach((k) => CS.check(typeof d.env[k] === 'number', `env.${k} debe ser número`));
      CS.check(typeof d.gain === 'number', '"gain" debe ser número');
      d.osc.forEach((o, i) => { if (o.wave === 'pwm' && o.duty) CS.check(Array.isArray(o.duty) && o.duty.length === 2, `osc[${i}].duty en pwm debe ser [inicio, fin]`); });
      if (d.pitchEnv) CS.check(typeof d.pitchEnv.from === 'number' && typeof d.pitchEnv.time === 'number', 'pitchEnv necesita "from" (cents) y "time" (s)');
      if (d.arp) CS.check(Array.isArray(d.arp.offsets) && d.arp.offsets.length, 'arp necesita "offsets" (semitonos)');
    }
    CS.inst[d.id] = d; (d.aliases || []).forEach((a) => (CS.alias[a] = d.id));
  } catch (e) { CS.errors.push(`Instrumento ${d && d.id}: ${e.message}`); console.error(e); }
};
CS.registerEffect = (d) => {
  try { CS.check(d && d.id && d.kind, 'faltan "id" y "kind"'); CS.fx[d.id] = d; }
  catch (e) { CS.errors.push(`Efecto ${d && d.id}: ${e.message}`); console.error(e); }
};
CS.getInst = (id) => CS.inst[CS.alias[id] || id];
