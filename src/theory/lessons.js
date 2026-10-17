/* Ruta de aprendizaje (editable). Basada en el mapa del video "En qué orden aprender teoría musical" (vocabulario → intervalos → escala mayor →
   acordes → armonizar → escala menor → pentatónica → modos), adaptada a componer: cada lección tiene un reto que la herramienta comprueba sola.
   La lectura de partitura se sustituye por el piano roll, y se añade al final una lección de forma y arreglo. */
(() => {
  const TH = CS.theory, isM = (t) => t.instrument !== 'drums';
  const mel = (s) => s.tracks.filter(isM).flatMap((t) => t.notes.map((n) => ({ ...n, m: CS.midi(n.pitch), t })));
  const groups = (s) => { const g = {}; for (const n of mel(s)) (g[n.t.name + '|' + n.step] = g[n.t.name + '|' + n.step] || []).push(n.m); return Object.entries(g).map(([k, v]) => ({ step: +k.split('|')[1], ms: v })); };
  const jumps = (s) => s.tracks.filter(isM).flatMap((t) => { const n = [...t.notes].sort((a, b) => a.step - b.step); return n.slice(1).map((x, i) => Math.abs(CS.midi(x.pitch) - CS.midi(n[i].pitch))); });
  const bars = (s) => groups(s).filter((g) => g.step % 16 === 0).map((g) => ({ bar: g.step / 16, ms: g.ms, ...(TH.triadType(g.ms) || {}) })).filter((x) => x.type).sort((a, b) => a.bar - b.bar);
  const diat = (c, k) => c.ms.every((m) => TH.inScale(m, k.root, k.sc));
  CS.lessons = [
    { t: 'Pulso y compás', b: 'La música late en pulsos. En 4/4 cada compás tiene 4 pulsos: son las líneas gruesas del roll (cada 4 pasos). El pulso es la base de todo lo demás.',
      task: 'Elige la pista Batería y pon un bombo en cada pulso del compás 1 (pasos 1, 5, 9 y 13).', ok: (s) => { const d = s.tracks.find((t) => t.instrument === 'drums'); return !!d && [0, 4, 8, 12].every((x) => d.notes.some((n) => n.pitch === 'kick' && n.step === x)); } },
    { t: 'Figuras rítmicas', b: 'Cada nota dura una figura: semicorchea (1 paso), corchea (2), negra (4), blanca (8) y redonda (16). Combinarlas crea el ritmo. Elige la duración en «Nota» antes de crear.',
      task: 'Escribe notas con al menos 3 figuras distintas.', ok: (s) => new Set(mel(s).map((n) => n.len)).size >= 3 },
    { t: 'Tonos y semitonos', b: 'Hay 12 notas y cada fila del roll es un semitono, la distancia más corta entre dos notas. Dos semitonos forman un tono. Entre Mi–Fa y Si–Do solo hay un semitono.',
      task: 'Toca notas seguidas separadas por un semitono (1 fila) y otras por un tono (2 filas).', ok: (s) => { const j = jumps(s); return j.includes(1) && j.includes(2); } },
    { t: 'Intervalos', b: 'Un intervalo es la distancia entre dos notas, medida en semitonos: 3 = tercera menor, 4 = tercera mayor, 5 = cuarta, 7 = quinta, 12 = octava. Son los cimientos de escalas y acordes. Entrena el oído en la pestaña Oído.',
      task: 'Pon a la vez dos notas separadas por una quinta (7) y, en otro punto, dos separadas por una tercera (3 o 4).', ok: (s) => { const g = groups(s), d = (x) => g.some((q) => q.ms.some((a) => q.ms.some((b) => x.includes(b - a)))); return d([7]) && d([3, 4]); } },
    { t: 'La escala mayor', b: 'Fórmula: tono, tono, semitono, tono, tono, tono, semitono. Es la escala "alegre" y se puede construir desde cualquier nota. Elige «Mayor» en la cabecera: las filas resaltadas son sus notas y el número es el grado.',
      task: 'Con la escala Mayor elegida, usa las 7 notas de la escala (todas, en cualquier octava).', ok: (s, k) => k.id === 'major' && TH.scales.major.s.every((d) => mel(s).some((n) => TH.pc(n.m, k.root) === d)) },
    { t: 'Acordes: las tríadas', b: 'Una tríada apila fundamental, tercera y quinta. Mayor = 4+3 semitonos (alegre), menor = 3+4 (triste), disminuida = 3+3, aumentada = 4+4. Usa la pestaña Acordes para oírlos e insertarlos.',
      task: 'Inserta un acorde mayor y uno menor (en la escala Mayor o Menor).', ok: (s) => { const t = groups(s).map((g) => TH.triadType(g.ms)).filter(Boolean).map((x) => x.type); return t.includes('M') && t.includes('m'); } },
    { t: 'Armonizar la escala mayor', b: 'Sobre cada nota de la escala se construye una tríada: salen 7 acordes (I ii iii IV V vi vii°). Todos pertenecen a la tonalidad; el I es el centro tonal, el "hogar". Una progresión clásica: I–V–vi–IV.',
      task: 'Con la escala Mayor, pon 4 acordes seguidos (uno por compás), todos de la escala y empezando en el I.', ok: (s, k) => { const c = bars(s); return k.id === 'major' && c.length >= 4 && c.every((x) => diat(x, k)) && c[0].root === k.root % 12; } },
    { t: 'La escala menor', b: 'Fórmula natural: tono, semitono, tono, tono, semitono, tono, tono. Su tercera es menor y por eso suena más oscura. Cada mayor tiene una relativa menor con las mismas notas (Do mayor y La menor).',
      task: 'Elige «Menor natural» y escribe 6 o más notas de la escala, incluyendo la tónica.', ok: (s, k) => { const m = mel(s); return k.id === 'minor' && m.length >= 6 && m.every((n) => TH.inScale(n.m, k.root, k.sc)) && m.some((n) => TH.pc(n.m, k.root) === 0); } },
    { t: 'Armonizar la escala menor', b: 'Se hace igual que en mayor, pero el centro tonal es un acorde menor (i). Progresión típica: i–VI–III–VII. Compara cómo cambia el ánimo respecto a la mayor.',
      task: 'Con la escala Menor natural, pon 4 acordes seguidos de la escala y empieza en el acorde menor i.', ok: (s, k) => { const c = bars(s); return k.id === 'minor' && c.length >= 4 && c.every((x) => diat(x, k)) && c[0].type === 'm' && c[0].root === k.root % 12; } },
    { t: 'La pentatónica', b: 'Son 5 notas: la escala mayor o menor sin dos de sus grados. Es la más fácil para melodías y solos porque casi nada "choca". Elige pentatónica en la cabecera.',
      task: 'Con una escala pentatónica elegida, escribe una melodía de 8 o más notas dentro de ella.', ok: (s, k) => { const m = mel(s); return k.id.startsWith('pent') && m.length >= 8 && m.every((n) => TH.inScale(n.m, k.root, k.sc)); } },
    { t: 'Centro tonal y reposo', b: 'Las mismas notas pueden sonar mayores o menores según dónde "descansan": ese es el centro tonal (y la idea detrás de los modos). Volver al primer acorde da sensación de cierre.',
      task: 'Escribe 4 acordes de la escala donde el último vuelva a la misma fundamental que el primero.', ok: (s, k) => { const c = bars(s); return c.length >= 4 && c.every((x) => diat(x, k)) && c[0].root === c[c.length - 1].root; } },
    { t: 'Forma y arreglo', b: 'Una canción es capas con roles: batería (pulso), bajo (fundamental del acorde), acordes (armonía) y melodía. La forma (A–B) da estructura: algo que se repite y algo que contrasta. Copiar y pegar compases ayuda mucho.',
      task: 'Crea 8 compases con batería, bajo, acordes y melodía.', ok: (s) => s.bars >= 8 && s.tracks.filter((t) => t.notes.length).length >= 4 && s.tracks.some((t) => t.instrument === 'drums' && t.notes.length) },
  ];
})();
