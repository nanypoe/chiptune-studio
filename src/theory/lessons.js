/* Ruta de aprendizaje (editable): cada lección = explicación + reto + comprobación automática sobre la canción.
   Orden propuesto: pulso → notas → duración → escala → intervalos → acordes → progresión → forma. */
(() => {
  const mel = (s) => s.tracks.filter((t) => t.instrument !== 'drums').flatMap((t) => t.notes.map((n) => ({ ...n, m: CS.midi(n.pitch), t })));
  const groups = (s) => { const g = {}; for (const n of mel(s)) (g[n.t.name + '|' + n.step] = g[n.t.name + '|' + n.step] || []).push(n.m); return Object.entries(g).map(([k, v]) => ({ step: +k.split('|')[1], ms: v })); };
  CS.lessons = [
    { t: 'Pulso y compás', b: 'La música respira en pulsos. Un compás de 4/4 tiene 4 pulsos: las líneas gruesas cada 4 pasos. Todo lo demás se acomoda sobre ese latido.',
      task: 'Selecciona la pista Batería y pon un bombo en cada pulso del compás 1 (pasos 1, 5, 9 y 13).', ok: (s) => { const d = s.tracks.find((t) => t.instrument === 'drums'); return !!d && [0, 4, 8, 12].every((x) => d.notes.some((n) => n.pitch === 'kick' && n.step === x)); } },
    { t: 'Notas y octavas', b: 'Hay 7 notas (Do Re Mi Fa Sol La Si) y se repiten en cada octava: más arriba suena más agudo. Usa ▲ ▼ (o X / Z) para subir o bajar de octava.',
      task: 'En una pista melódica, escribe 3 notas distintas.', ok: (s) => new Set(mel(s).map((n) => n.m % 12)).size >= 3 },
    { t: 'Duración y ritmo', b: 'Cada nota dura un tiempo distinto: 1/16, 1/8, 1/4… Mezclar duraciones largas y cortas crea ritmo.',
      task: 'Usa al menos 3 duraciones distintas en tus notas.', ok: (s) => new Set(mel(s).map((n) => n.len)).size >= 3 },
    { t: 'Escala y tonalidad', b: 'Una escala es el grupo de notas que "se llevan bien". Las filas resaltadas del piano roll son la escala de la tonalidad elegida: casi cualquier cosa que toques ahí suena bien.',
      task: 'Escribe 6 o más notas y que todas estén en la escala (filas resaltadas).', ok: (s, c) => { const m = mel(s); return m.length >= 6 && m.every((n) => CS.theory.inScale(n.m, c.root, c.sc)); } },
    { t: 'Intervalos', b: 'La distancia entre dos notas es un intervalo, contado en semitonos. 3 o 4 = tercera (dulce o triste), 7 = quinta (firme y estable), 12 = octava (la misma nota, más aguda).',
      task: 'Pon dos notas a la vez separadas por una quinta (7 semitonos).', ok: (s) => groups(s).some((g) => g.ms.some((a) => g.ms.some((b) => b - a === 7))) },
    { t: 'Acordes', b: 'Un acorde son 3 notas apiladas por terceras (fundamental, tercera y quinta). Con la paleta "Acordes del tono" puedes escucharlos e insertarlos en el compás del cursor.',
      task: 'Inserta un acorde de 3 notas con la paleta (botón ＋).', ok: (s) => groups(s).some((g) => CS.theory.isTriad(g.ms)) },
    { t: 'Progresión', b: 'Los acordes se encadenan formando una progresión. Una muy usada: I–V–vi–IV (en menor, i–VI–III–VII). Cada acorde cambia con el compás.',
      task: 'Pon 4 acordes seguidos, uno por compás (necesitas 4 compases).', ok: (s) => { const b = new Set(groups(s).filter((g) => g.step % 16 === 0 && CS.theory.isTriad(g.ms)).map((g) => g.step)); return b.size >= 4; } },
    { t: 'Bajo y forma', b: 'El bajo toca la fundamental de cada acorde y ancla la canción. La forma (A–B) da estructura: una parte que se repite y otra que contrasta.',
      task: 'Haz 8 compases con batería, bajo, acordes y melodía.', ok: (s) => s.bars >= 8 && s.tracks.filter((t) => t.notes.length).length >= 4 },
  ];
})();
