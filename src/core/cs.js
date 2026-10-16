/* Espacio de nombres global CS: utilidades y registros compartidos. Sin módulos ES para que funcione abriendo index.html con doble clic. */
window.CS = (() => {
  const NOTE = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'], B = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
  return {
    NOTE, SOL: ['Do','Do♯','Re','Re♯','Mi','Fa','Fa♯','Sol','Sol♯','La','La♯','Si'],
    clamp: (v, a, b) => Math.min(b, Math.max(a, v)),
    $: (s) => document.querySelector(s),
    midi: (p) => { const m = /^([A-G])([#b]?)(-?\d)$/i.exec(p); return m ? 12 * (+m[3] + 1) + B[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) : null; },
    name: (m) => NOTE[m % 12] + (Math.floor(m / 12) - 1),
    hz: (m) => 440 * 2 ** ((m - 69) / 12),
    inst: {}, fx: {}, alias: {}, kinds: {}, errors: [], drumOrder: [],
  };
})();
