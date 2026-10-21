/* Interfaz de una sola pantalla: piano roll de 1 octava, teclado, pistas, panel de aprendizaje (lecciones · acordes · oído), historial y menú. */
(() => {
  const { $, clamp, midi, name, SOL } = CS, T = CS.theory, E = CS.engine;
  const KEYS = ['KeyA','KeyW','KeyS','KeyE','KeyD','KeyF','KeyT','KeyG','KeyY','KeyH','KeyU','KeyJ','KeyK'], KL = ['A','W','S','E','D','F','T','G','Y','H','U','J','K'];
  const SK = 'cs2_song', DK = 'cs2_done2';
  let song, sel = 0, oct = 4, len = 2, z = 1, sx = 0, cur = 0, ls = 0, rec = false, drag = null, G = {}, last = '', hist = [], hi = -1, clip = null, tab = 'lec', stT = 0;
  let done = new Set(JSON.parse(localStorage.getItem(DK) || '[]'));
  const tr = () => song.tracks[sel], isD = () => tr().instrument === 'drums', spb = () => CS.sig(song).spb, total = () => song.bars * spb(), LEN = () => (len === 'bar' ? spb() : len);
  const dots = () => [...document.querySelectorAll('#mon .dots i')];
  const rootV = () => +$('#root').value, sc = () => T.scales[$('#scale').value], barOf = () => Math.floor(cur / spb());
  const rows = () => isD() ? [...CS.drumOrder].reverse().map((k) => ({ p: k, l: CS.getInst('drums').pieces[k].name }))
    : Array.from({ length: 12 }, (_, i) => { const m = 12 * (oct + 1) + 11 - i; return { p: name(m), m, l: rowLabel(m) }; });
  const rowLabel = (m) => { const pc = m % 12; if (!CS.NOTE[pc].includes('#')) return name(m); const id = $('#scale').value; if (T.spellMap(rootV(), id)?.[pc] || T.pref(rootV(), id)) return T.spell(m, rootV(), id).full; return CS.NOTE[pc] + '/' + T.FL[pc] + (Math.floor(m / 12) - 1); };
  const hear = (p, v = 1, n) => E.preview(song, tr(), p, 0.3, v, n);
  const say = (t) => { $('#st').textContent = t; clearTimeout(stT); stT = setTimeout(() => ($('#st').textContent = ''), 2800); };
  const region = () => { if (!$('#lp').checked) return null; const a = clamp((+$('#lpA').value || 1) - 1, 0, song.bars - 1), n = clamp(+$('#lpN').value || 1, 1, song.bars - a); return { from: a * spb(), to: (a + n) * spb() }; };

  /* ---------- Historial (deshacer / rehacer) ---------- */
  const upBtns = () => { $('#undo').disabled = hi <= 0; $('#redo').disabled = hi >= hist.length - 1; };
  function commit() { const s = JSON.stringify(song); if (hist[hi] === s) return; hist = hist.slice(0, hi + 1); hist.push(s); if (hist.length > 100) hist.shift(); hi = hist.length - 1; upBtns(); }
  function restore(i) { hi = clamp(i, 0, hist.length - 1); Object.assign(song, JSON.parse(hist[hi])); sel = clamp(sel, 0, song.tracks.length - 1); cur = clamp(cur, 0, total() - 1); E.refresh(song); renderAll(); save(); upBtns(); }
  const undo = () => { if (hi > 0) { restore(hi - 1); say('Deshecho'); } }, redo = () => { if (hi < hist.length - 1) { restore(hi + 1); say('Rehecho'); } };
  $('#undo').onclick = undo; $('#redo').onclick = redo;

  /* ---------- Piano roll ---------- */
  function draw() {
    const c = $('#grid'), b = c.parentElement, W = b.clientWidth, H = b.clientHeight; if (!W || !H || !song) return;
    if (c.width !== W) c.width = W; if (c.height !== H) c.height = H;
    const x = c.getContext('2d'), cs = getComputedStyle(document.body), v = (n) => cs.getPropertyValue(n).trim();
    const R = rows(), LW = 84, RU = 22, RH = (H - RU) / 12, N = total(), SW = Math.max(2, (W - LW) / N) * z, D = isD(), SP = spb(), BT = CS.sig(song).beat;
    sx = clamp(sx, 0, Math.max(0, N * SW - (W - LW))); G = { W, H, LW, RU, RH, SW, R };
    const s7 = sc(), rt = rootV(), col = CS.getInst(tr().instrument).color;
    x.clearRect(0, 0, W, H); x.textBaseline = 'middle';
    R.forEach((r, i) => {
      const y = RU + i * RH, blk = !D && CS.NOTE[r.m % 12].includes('#'), ins = !D && T.inScale(r.m, rt, s7);
      x.fillStyle = blk ? v('--rowb') : v('--row'); x.fillRect(LW, y, W - LW, RH);
      if (ins) { x.fillStyle = col + (T.pc(r.m, rt) === 0 ? '55' : '26'); x.fillRect(LW, y, W - LW, RH); }
      x.fillStyle = D ? v('--panel') : blk ? '#1b1b26' : '#e9ebf5'; x.fillRect(0, y, LW - 2, RH - 1);
      x.fillStyle = D || blk ? v('--tx') : '#222'; x.font = 'bold 13px system-ui'; x.fillText(r.l, 8, y + RH / 2 - (D ? 0 : 8));
      if (!D) { const dg = T.degree(r.m, rt, s7); x.font = '11px system-ui'; x.fillStyle = blk ? '#aab' : '#667'; x.fillText(SOL[r.m % 12] + (dg ? '  ·  ' + dg : ''), 8, y + RH / 2 + 9); }
    });
    x.save(); x.beginPath(); x.rect(LW, 0, W - LW, H); x.clip(); x.translate(LW - sx, 0);
    x.fillStyle = '#ffffff0b'; x.fillRect(barOf() * SP * SW, RU, SP * SW, H);                       // compás del cursor
    const rg = region(); if (rg) { x.fillStyle = v('--acc') + '1f'; x.fillRect(rg.from * SW, 0, (rg.to - rg.from) * SW, H); x.fillStyle = v('--acc'); x.fillRect(rg.from * SW, RU - 4, (rg.to - rg.from) * SW, 4); }
    if (song.loopStart) { const lx = song.loopStart * SP * SW; x.fillStyle = '#4fe3c1'; x.fillRect(lx, 0, 2, H); x.font = 'bold 12px system-ui'; x.fillText('↺ el bucle vuelve aquí', lx + 6, H - 10); }
    for (let s = 0; s <= N; s++) {
      const bar = s % SP === 0, beat = s % BT === 0; if (!bar && !beat && SW < 9) continue;
      x.fillStyle = bar ? v('--mut') : beat ? v('--line') : v('--line') + '66'; x.fillRect(s * SW, bar ? 0 : RU, 1, H);
      if (bar && s < N) { x.fillStyle = v('--tx'); x.font = '12px system-ui'; x.fillText(s / SP + 1, s * SW + 4, 11); }
    }
    let up = 0, dn = 0;
    for (const n of tr().notes) {
      const i = R.findIndex((r) => r.p === n.pitch);
      if (i < 0) { if (!D) midi(n.pitch) > R[0].m ? up++ : dn++; continue; }
      x.globalAlpha = 0.45 + 0.55 * (n.vel ?? 1); x.fillStyle = col; x.fillRect(n.step * SW + 1, RU + i * RH + 2, Math.max(2, n.len * SW - 2), RH - 4); x.globalAlpha = 1;
      if (n.chord) { x.fillStyle = '#ffffffcc'; x.fillRect(n.step * SW + 1, RU + i * RH + 2, Math.max(2, n.len * SW - 2), 3); }
      if (n.slide) { const j = R.findIndex((r) => r.p === n.slide), yj = j >= 0 ? RU + j * RH + RH / 2 : (midi(n.slide) > midi(n.pitch) ? RU + 3 : H - 3); x.strokeStyle = '#ffffff'; x.lineWidth = 2; x.beginPath(); x.moveTo(n.step * SW + 3, RU + i * RH + RH / 2); x.lineTo((n.step + n.len) * SW - 3, yj); x.stroke(); }
      if (n.len * SW > 34 && !D) { x.fillStyle = '#1a1530'; x.font = 'bold 11px system-ui'; x.fillText(n.pitch + (n.chord ? ' ' + n.chord : '') + (n.slide ? ' →' + n.slide : ''), n.step * SW + 5, RU + i * RH + RH / 2); }
    }
    x.fillStyle = '#ff3d6e'; x.beginPath(); const cx = cur * SW; x.moveTo(cx - 5, 0); x.lineTo(cx + 5, 0); x.lineTo(cx, 9); x.fill(); x.restore();
    x.fillStyle = v('--mut'); x.font = '12px system-ui';
    if (up) x.fillText(`▲ ${up} nota(s) en octavas más agudas`, LW + 8, RU + 14); if (dn) x.fillText(`▼ ${dn} en octavas más graves`, LW + 8, H - 10);
    $('#zoom').textContent = Math.round(z * 100) + '%'; $('#oct').textContent = D ? 'Perc.' : `C${oct}–B${oct}`;
  }
  const g = $('#grid'), EDGE = 8;
  const hitAt = (e) => { const s = Math.floor((e.offsetX - G.LW + sx) / G.SW), r = G.R[Math.floor((e.offsetY - G.RU) / G.RH)]; if (!r || e.offsetX < G.LW || e.offsetY < G.RU || s < 0 || s >= total()) return null; return { s, r, n: tr().notes.find((n) => n.pitch === r.p && s >= n.step && s < n.step + n.len) }; };
  const edge = (n, e) => (n.step + n.len) * G.SW - sx + G.LW - e.offsetX < EDGE;
  g.addEventListener('contextmenu', (e) => { e.preventDefault(); const h = hitAt(e); if (h && h.n) { tr().notes.splice(tr().notes.indexOf(h.n), 1); changed(); } });
  g.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    if (e.offsetX < G.LW && e.offsetY > G.RU) { const r = G.R[Math.floor((e.offsetY - G.RU) / G.RH)]; if (r) hear(r.p); return; }
    if (e.offsetY < G.RU) { cur = clamp(Math.floor((e.offsetX - G.LW + sx) / G.SW), 0, total() - 1); draw(); return; }
    const h = hitAt(e); if (!h) return; g.setPointerCapture(e.pointerId);
    if (h.n && e.shiftKey) { const c = [1, 0.7, 0.45], i = (c.indexOf(h.n.vel ?? 1) + 1) % 3; i ? (h.n.vel = c[i]) : delete h.n.vel; hear(h.r.p, h.n.vel ?? 1); changed(); return; }
    if (h.n) drag = { n: h.n, mode: slideMode && !isD() ? 'slide' : edge(h.n, e) ? 'size' : 'move', x0: e.offsetX, y0: e.offsetY, step0: h.n.step, moved: false, fresh: false };
    else { const n = { step: h.s, len: Math.min(LEN(), total() - h.s), pitch: h.r.p }; if (!isD() && $('#chordSel').value) n.chord = $('#chordSel').value; tr().notes.push(n); hear(n.pitch, 1, n); cur = h.s; drag = { n, mode: 'size', x0: e.offsetX, y0: e.offsetY, moved: false, fresh: true }; draw(); }
  });
  g.addEventListener('pointermove', (e) => {
    if (!drag) { const h = hitAt(e); g.style.cursor = h && h.n ? (edge(h.n, e) ? 'ew-resize' : 'grab') : 'crosshair'; return; }
    const n = drag.n; if (!drag.moved && (Math.abs(e.offsetX - drag.x0) > 4 || (!drag.fresh && Math.abs(e.offsetY - drag.y0) > G.RH / 2))) drag.moved = true; if (!drag.moved) return;
    if (drag.mode === 'size') n.len = clamp(Math.floor((e.offsetX - G.LW + sx) / G.SW) - n.step + 1, 1, total() - n.step);
    else if (drag.mode === 'slide') { const r = G.R[clamp(Math.floor((e.offsetY - G.RU) / G.RH), 0, 11)]; if (r.p !== n.pitch) n.slide = r.p; else delete n.slide; }
    else { n.step = clamp(drag.step0 + Math.round((e.offsetX - drag.x0) / G.SW), 0, total() - n.len); const r = G.R[clamp(Math.floor((e.offsetY - G.RU) / G.RH), 0, 11)]; if (r.p !== n.pitch) { n.pitch = r.p; hear(r.p); } }
    draw();
  });
  const end = () => { if (!drag) return; if (!drag.moved && !drag.fresh && drag.mode !== 'slide') { const t = tr(); t.notes.splice(t.notes.indexOf(drag.n), 1); } drag = null; changed(); };
  g.addEventListener('pointerup', end); g.addEventListener('pointercancel', end);
  g.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.ctrlKey) { const old = G.SW, px = e.offsetX - G.LW + sx, f = e.deltaY < 0 ? 1.2 : 1 / 1.2; z = clamp(z * f, 1, 24); draw(); sx = px / old * G.SW - (e.offsetX - G.LW); draw(); }
    else { sx += (e.deltaX || e.deltaY); draw(); }
  }, { passive: false });
  new ResizeObserver(draw).observe($('#rollBox'));
  const zoom = (f) => { z = clamp(z * f, 1, 24); draw(); };
  $('#zIn').onclick = () => zoom(1.4); $('#zOut').onclick = () => zoom(1 / 1.4); $('#zFit').onclick = () => { z = 1; sx = 0; draw(); };
  const setOct = (d) => { oct = clamp(oct + d, 1, 7); renderKeys(); renderDrawer(); draw(); };
  $('#octD').onclick = () => setOct(-1); $('#octU').onclick = () => setOct(1);
  $('#lens').innerHTML = [[1, '1/16', 'semicorchea · 1 paso'], [2, '1/8', 'corchea · 2 pasos'], [4, '1/4', 'negra · 4 pasos (un pulso)'], [8, '1/2', 'blanca · 8 pasos'], ['bar', '1', 'compás completo (16 pasos en 4/4, 12 en 3/4 y 6/8…)']]
    .map(([n, l, t]) => `<button data-l="${n}" class="${n === len ? 'on' : ''}" title="Notas nuevas de ${t}">${l}</button>`).join('');
  let slideMode = false;
  $('#mdSlide').onclick = () => { slideMode = !slideMode; $('#mdSlide').classList.toggle('on', slideMode); say(slideMode ? 'Modo deslizar: arrastra una nota hacia arriba o abajo' : 'Modo normal'); };
  $('#lens').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; len = b.dataset.l === 'bar' ? 'bar' : +b.dataset.l; [...$('#lens').children].forEach((x) => x.classList.toggle('on', x === b)); };

  /* ---------- Edición de compases y pistas ---------- */
  const inBar = (n, b) => n.step >= b * spb() && n.step < (b + 1) * spb();
  $('#clB').onclick = () => { const b = barOf(), k = tr().notes.length; tr().notes = tr().notes.filter((n) => !inBar(n, b)); say(`Compás ${b + 1} limpio (${k - tr().notes.length} notas)`); changed(); };
  $('#clT').onclick = () => { say(`Pista «${tr().name}» limpia`); tr().notes = []; changed(); };
  $('#clA').onclick = () => { song.tracks.forEach((t) => (t.notes = [])); say('Todas las notas borradas (Ctrl+Z para recuperarlas)'); changed(); };
  $('#cpy').onclick = () => { const b = barOf(); clip = { d: isD(), notes: tr().notes.filter((n) => inBar(n, b)).map((n) => ({ ...n, step: n.step - b * spb() })) }; say(`Compás ${b + 1} copiado (${clip.notes.length} notas)`); };
  $('#pst').onclick = () => {
    if (!clip) return say('Primero copia un compás');
    if (clip.d !== isD()) return say('Pega en una pista del mismo tipo (melódica o batería)');
    const b = barOf(); tr().notes = tr().notes.filter((n) => !inBar(n, b)); clip.notes.forEach((n) => tr().notes.push({ ...n, step: n.step + b * spb(), len: Math.min(n.len, total() - (n.step + b * spb())) }));
    say(`Pegado en el compás ${b + 1}`); if ((b + 1) * spb() < total()) cur = (b + 1) * spb(); changed();
  };
  const transpose = (e, d) => {
    if (isD()) return say('La batería no se transpone'); const k = e.shiftKey ? 12 * d : d;
    if (tr().notes.some((n) => { const m = midi(n.pitch) + k; return m < 12 || m > 119; })) return say('Se saldría del rango');
    tr().notes.forEach((n) => (n.pitch = name(midi(n.pitch) + k))); say(`Pista transpuesta ${k > 0 ? '+' : ''}${k} semitono(s)`); changed();
  };
  $('#trD').onclick = (e) => transpose(e, -1); $('#trU').onclick = (e) => transpose(e, 1);

  /* ---------- Pistas ---------- */
  const fams = () => { const o = {}; for (const d of Object.values(CS.inst)) (o[d.family] = o[d.family] || []).push(d); return o; };
  const instOpts = () => Object.entries(fams()).map(([f, a]) => `<optgroup label="${f}">${a.map((d) => `<option value="${d.id}">${d.name}</option>`).join('')}</optgroup>`).join('');
  function renderTracks() {
    const L = $('#tracks'); L.innerHTML = '';
    song.tracks.forEach((t, i) => { const d = CS.getInst(t.instrument), r = document.createElement('div'); r.className = 'trk' + (i === sel ? ' sel' : ''); r.dataset.i = i; r.style.setProperty('--c', d.color); r.title = 'Clic para elegir esta pista: el roll y el teclado tocan con su instrumento';
      r.innerHTML = `<b>${t.name}</b><button data-m class="${t.mute ? 'on' : ''}" title="Silenciar (M): la pista no suena">M</button><button data-s class="${t.solo ? 'on' : ''}" title="Solo (S): suena solo esta pista">S</button><small>${d.name} · ${t.notes.length} notas</small>`; L.appendChild(r); });
    const t = tr(), d = CS.getInst(t.instrument);
    $('#card').innerHTML = `<label title="Nombre de la pista">Nombre<input type="text" id="cn" value="${t.name.replace(/"/g, '&quot;')}"></label><label title="Cambia el sonido de la pista (si cambias entre batería y melodía, se borran sus notas)">Instrumento<select id="ci">${instOpts()}</select></label>
      <label title="Volumen de esta pista">Volumen<input type="range" id="cv" min="0" max="1" step=".01" value="${t.volume}"></label><label title="Paneo: izquierda (−1), centro (0) o derecha (1). Separar instrumentos ayuda a que no se pisen">Paneo<input type="range" id="cp" min="-1" max="1" step=".05" value="${t.pan || 0}"></label>
      ${Object.values(CS.fx).map((f) => `<label title="${f.name}: ${f.tip || ''} (cuánto de este efecto recibe la pista)">${f.name}<input type="range" data-fx="${f.id}" min="0" max="1" step=".01" value="${(t.fx || {})[f.id] || 0}"></label>`).join('')}
      <button id="cd" title="Eliminar esta pista y sus notas (se puede deshacer)">Eliminar pista</button>`;
    $('#ci').value = d.id; $('#tip').textContent = '💡 ' + d.name + ': ' + d.tip;
    $('#cn').oninput = (e) => { t.name = e.target.value; save(); }; $('#cn').onchange = () => { renderTracks(); commit(); };
    $('#ci').onchange = (e) => { const was = isD(); t.instrument = e.target.value; if (was !== isD()) t.notes = []; renderKeys(); changed(); };
    $('#cv').oninput = (e) => { t.volume = +e.target.value; E.refresh(song); save(); }; $('#cp').oninput = (e) => { t.pan = +e.target.value; E.refresh(song); save(); };
    $('#cv').onchange = $('#cp').onchange = commit;
    document.querySelectorAll('[data-fx]').forEach((s) => { s.oninput = () => { t.fx = t.fx || {}; t.fx[s.dataset.fx] = +s.value; E.refresh(song); save(); }; s.onchange = commit; });
    $('#cd').onclick = () => { if (song.tracks.length > 1) { song.tracks.splice(sel, 1); sel = Math.max(0, sel - 1); renderKeys(); changed(); } };
  }
  $('#tracks').onclick = (e) => { const r = e.target.closest('.trk'); if (!r) return; const t = song.tracks[+r.dataset.i];
    if (e.target.dataset.m !== undefined) t.mute = !t.mute; else if (e.target.dataset.s !== undefined) t.solo = !t.solo; else { sel = +r.dataset.i; renderKeys(); }
    E.refresh(song); changed(); };
  $('#addTrack').innerHTML = '<option value="">＋ Añadir pista…</option>' + instOpts();
  $('#addTrack').onchange = (e) => { if (e.target.value && song.tracks.length < 12) { song.tracks.push(CS.song.track(e.target.value)); sel = song.tracks.length - 1; renderKeys(); changed(); } e.target.value = ''; };

  /* ---------- Teclado tocable (misma octava que el roll) ---------- */
  function renderKeys() {
    const K = $('#keys'); K.className = isD() ? 'pads' : 'piano'; K.innerHTML = '';
    $('#khint').textContent = isD() ? 'Pads de batería: A W S E D F T G Y H U J' : 'Teclas A W S E D F T G Y H U J K · Z / X cambian de octava';
    if (isD()) { CS.drumOrder.forEach((k, i) => K.insertAdjacentHTML('beforeend', `<button data-i="${i}" title="${CS.getInst('drums').pieces[k].name} (tecla ${KL[i]})"><b>${CS.getInst('drums').pieces[k].name}</b><kbd>${KL[i]}</kbd></button>`)); return; }
    [0, 2, 4, 5, 7, 9, 11, 12].forEach((st, w) => K.insertAdjacentHTML('beforeend', `<button class="w" data-i="${st}" title="${CS.NOTE[st % 12]}${oct + (st === 12 ? 1 : 0)} (tecla ${KL[st]})" style="left:calc(${w}*100%/8)"><b>${CS.NOTE[st % 12]}${oct + (st === 12 ? 1 : 0)}</b><small>${SOL[st % 12]}</small><kbd>${KL[st]}</kbd></button>`));
    const id = $('#scale').value, mp = T.spellMap(rootV(), id), up = (n) => n.replace('#', '♯').replace('b', '♭');
    [[1, 0], [3, 1], [6, 3], [8, 4], [10, 5]].forEach(([st, w]) => {
      const m = 12 * (oct + 1) + st, inK = !!(mp && mp[st]), pf = T.pref(rootV(), id), sp = inK || pf ? T.spell(m, rootV(), id) : null;
      const lab = sp ? `<b>${up(sp.n)}</b>` : `<b>${up(CS.NOTE[st])}</b><b>${up(T.FL[st])}</b>`, tip = sp ? `${sp.full} (${sp.sol}): ` + (inK ? 'en esta tonalidad se escribe así' : `esta tonalidad usa ${pf < 0 ? 'bemoles ♭' : 'sostenidos ♯'}`) : `${CS.NOTE[st]}${oct} / ${T.FL[st]}${oct}: sostenido si subes, bemol si bajas (convención habitual)`;
      K.insertAdjacentHTML('beforeend', `<button class="k" data-i="${st}" title="${tip} · tecla ${KL[st]}" style="left:calc(${w + 1}*100%/8 - 100%/8*.29)">${lab}<kbd>${KL[st]}</kbd></button>`);
    });
  }
  let lastM = null, kfT = 0;
  function kfb(sp) {
    const A = sp.acc > 0 ? '♯' : sp.acc < 0 ? '♭' : '', why = { scale: 'es una nota de la escala elegida', up: 'vienes subiendo y esta tonalidad no tiene ♯ ni ♭', down: 'vienes bajando y esta tonalidad no tiene ♯ ni ♭', key: `la tonalidad elegida usa ${sp.acc > 0 ? 'sostenidos' : 'bemoles'}`, none: 'primer toque sin tonalidad con ♯/♭: se usa sostenido' }[sp.why];
    $('#kfb').textContent = `${sp.n[0]}${A}${sp.full.slice(sp.n.length)} · ${sp.sol}` + (sp.acc ? ` — ${sp.acc > 0 ? 'sostenido ♯' : 'bemol ♭'}: ${why}` : '');
    clearTimeout(kfT); kfT = setTimeout(() => ($('#kfb').textContent = ''), 3500);
  }
  function key(i) {
    const m = isD() ? null : 12 * (oct + 1) + i, p = isD() ? CS.drumOrder[i] : name(m); if (!p) return; hear(p);
    const b = $(`#keys [data-i="${i}"]`); if (b) { b.classList.add('p'); setTimeout(() => b.classList.remove('p'), 120); }
    if (!isD()) { kfb(T.spell(m, rootV(), $('#scale').value, lastM == null ? 0 : Math.sign(m - lastM))); lastM = m; }
    if (rec) { const ps = E.pos(), st = clamp(ps != null ? Math.floor(ps) : cur, 0, total() - 1); tr().notes.push({ step: st, len: isD() ? 1 : Math.min(LEN(), total() - st), pitch: p }); if (ps == null) cur = clamp(cur + (isD() ? 1 : LEN()), 0, total() - 1); changed(); }
  }
  $('#keys').addEventListener('pointerdown', (e) => { const b = e.target.closest('button'); if (b) key(+b.dataset.i); });
  $('#rec').onchange = (e) => (rec = e.target.checked);
  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) { if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return; if (e.code === 'KeyZ') { e.preventDefault(); e.shiftKey ? redo() : undo(); } else if (e.code === 'KeyY') { e.preventDefault(); redo(); } return; }
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || e.altKey || $('#dlg').open) return;
    if (e.code === 'Space') { e.preventDefault(); toggle(); } else if (e.code === 'KeyZ') setOct(-1); else if (e.code === 'KeyX') setOct(1); else if (e.code === 'Home') { cur = 0; sx = 0; draw(); }
    else { const i = KEYS.indexOf(e.code); if (i >= 0 && !e.repeat) key(i); }
  });

  /* ---------- Panel de aprendizaje: lecciones (páginas) · acordes · oído, con sonido sincronizable ---------- */
  let sync = false, pg = 0, chOpen = 0;
  const solOf = (p) => { const m = /^([A-G])([#b]?)/.exec(p); return T.SOLN[m[1]] + (m[2] === '#' ? '♯' : m[2] === 'b' ? '♭' : ''); };
  const chip = (p) => `<span class="nt" style="--c:hsl(${(midi(p) % 12) * 30} 70% 58%)">${p}<small>${solOf(p)}</small></span>`;
  const fmtHtml = (h) => h.replace(/\[\[([A-G][#b]?-?\d)\]\]/g, (_, p) => chip(p));
  const syncOn = () => sync && !isD(), syncInst = () => (syncOn() ? tr().instrument : 'piano'), sy = () => (syncOn() ? (oct - 4) * 12 : 0);
  const lessonCtx = () => ({ root: rootV(), sc: sc(), id: $('#scale').value });
  const playTemp = (o) => E.play(CS.song.normalize(o), { loop: false });
  const exSong = (d) => ({ bpm: d.bpm, bars: d.bars, timeSig: d.ts, tracks: d.tracks.map(([inst, ns]) => { const dr = inst === 'drums'; return { instrument: dr ? 'drums' : syncOn() ? syncInst() : inst, volume: 0.9, fx: { reverb: 0.12 }, notes: ns.map((n) => (dr ? n : { ...n, pitch: name(clamp(midi(n.pitch) + sy(), 24, 108)) })) }; }) });
  function renderDrawer() {
    document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    $('#sync').textContent = sync ? `🔄 Suena con tu pista: ${isD() ? 'Piano (la pista elegida es batería)' : CS.getInst(tr().instrument).name + ' · octava ' + oct}` : '🎹 Suena con: Piano (por defecto)'; $('#sync').classList.toggle('on', sync);
    if (!$('#drawer').classList.contains('open')) return;
    const B = $('#dbody'), st = B.scrollTop; if (tab === 'lec') renderLesson(); else if (tab === 'cho') renderChords(); else renderEar(); B.scrollTop = st;
  }
  function renderLesson() {
    const L = CS.lessons, l = L[ls], P = l.pages, N = P.length + 1; pg = clamp(pg, 0, N - 1); let body;
    if (pg < P.length) { const p = P[pg]; body = `<h3>${p.h}</h3>` + (p.html ? fmtHtml(p.html) : '<p class="hint">Haz cada ejemplo tú mismo en el roll siguiendo los pasos; el botón ▶ te deja escuchar cómo debe sonar (no modifica tu canción).</p>') + (p.ex || []).map((e, i) => `<div class="exc"><span class="tag">${e.g}</span><b>${e.t}</b><ol class="how">${e.how.split(' | ').map((x) => `<li>${fmtHtml(x)}</li>`).join('')}</ol><button data-ex="${pg}-${i}" title="Escucha cómo debe sonar este ejemplo (no cambia tu canción)">▶ Escuchar ejemplo</button></div>`).join(''); }
    else body = `<h3>🎯 Tu reto</h3><div class="box tip">${fmtHtml(l.task)}</div>${l.tips ? `<div class="box">💡 ${fmtHtml(l.tips)}</div>` : ''}<div id="lstat"></div><p class="hint">Cuando lo logres se marca solo y se ilumina el número de la lección.</p>`;
    const warn = song.timeSig !== '4/4' && !l.t.startsWith('Compases') ? `<div class="box warn">⚠️ Tu canción está en <b>${song.timeSig}</b> y esta lección usa 4/4. <button data-ts44="1" title="Cambiar a 4/4 (las notas se acomodan compás por compás)">Cambiar a 4/4</button></div>` : '';
    const prev = pg > 0 ? '◀ Atrás' : ls > 0 ? `◀ Lección ${ls}` : '◀', next = pg < N - 1 ? 'Siguiente ▶' : ls < L.length - 1 ? `Lección ${ls + 2} ▶` : '¡Fin! 🎉';
    $('#dbody').innerHTML = `<div class="steps">${L.map((x, i) => `<button data-l="${i}" class="${i === ls ? 'on' : ''} ${done.has(i) ? 'ok' : ''}" title="${i + 1}. ${x.t}${done.has(i) ? ' (completada ✓)' : ''}">${i + 1}</button>`).join('')}</div>
      <div class="lh"><span style="font-size:22px">${l.ic}</span><b>LECCIÓN ${ls + 1} DE ${L.length}</b></div><div class="pbar"><i style="width:${(pg + 1) / N * 100}%"></i></div>${warn}${body}
      <div class="nav"><button data-pg="-1" ${prev === '◀' ? 'disabled' : ''} title="${pg > 0 ? 'Página anterior' : 'Ir a la lección anterior'}">${prev}</button><span class="dots2">${Array.from({ length: N }, (_, i) => `<i class="${i === pg ? 'on' : ''}"></i>`).join('')}</span><button data-pg="1" ${next.startsWith('¡') ? 'disabled' : ''} title="${pg < N - 1 ? 'Página siguiente' : 'Ir a la lección siguiente'}">${next}</button></div>`;
    checkLesson();
  }
  function checkLesson() {
    const ok = CS.lessons[ls].ok(song, lessonCtx()), s = $('#lstat');
    for (const i of CS.lessons.keys()) if (!done.has(i) && CS.lessons[i].ok(song, lessonCtx())) { done.add(i); localStorage.setItem(DK, JSON.stringify([...done])); say(`✓ Lección ${i + 1} completada`); document.querySelector(`.steps [data-l="${i}"]`)?.classList.add('ok'); }
    $('#learnBtn').textContent = `📖 Aprender ${done.size}/${CS.lessons.length}`;
    if (s) { s.textContent = ok ? '✓ ¡Logrado!' : 'Pendiente…'; s.className = ok ? 'ok' : ''; }
  }
  function renderChords() {
    const s = sc(), id = $('#scale').value, B = $('#dbody'), mj = id === 'major';
    if (s.s.length < 7) { B.innerHTML = '<div class="box warn">Elige la escala <b>Mayor</b> o <b>Menor natural</b> (arriba) para ver los 7 acordes de la tonalidad.</div>'; return; }
    const R = rootV(), U = T.use[mj ? 'major' : 'minor'], ty = { M: ['mayor', 'fundamental + 3ª mayor (4 filas) + 5ª justa (7 filas)'], m: ['menor', 'fundamental + 3ª menor (3 filas) + 5ª justa (7 filas)'], dim: ['disminuido', 'fundamental + 3ª menor (3) + 5ª disminuida (6)'], aug: ['aumentado', 'fundamental + 3ª mayor (4) + 5ª aumentada (8)'] };
    let h = `<div class="box tip">💡 Estás en <b>${T.keyName(R, id)}</b>. Un <b>acorde del tono</b> es una tríada (3 notas) construida sobre cada nota de la escala: los 7 suenan bien juntos. <b>Intenta ponerlos tú primero</b> con las instrucciones y compara con ＋.</div>`;
    s.rn.forEach((rn, i) => {
      const ns = T.triad(R, oct, s, i), t = T.triadType(ns), sp = ns.map((m) => T.spell(m, R, id)), u = U[i];
      h += `<button class="chh ${i === chOpen ? 'open' : ''}" data-o="${i}" title="Ver sus notas, dónde se usa y cómo ponerlo"><b>${rn}</b> · ${T.label(ns, R, id)} <small>${sp.map((x) => x.sol).join(' – ')}</small></button>`;
      if (i === chOpen) h += `<div class="exc"><p><b>Notas:</b> ${sp.map((x, k) => chip(x.full) + (ns[k] >= 12 * (oct + 2) ? '<small>↑ octava siguiente</small>' : '')).join(' ')}</p><p><b>Cómo se forma:</b> ${ty[t.type][1]} → acorde <b>${ty[t.type][0]}</b>.</p><p>${u.e}</p><p><b>Dónde se usa:</b> ${u.w}</p>
        <b>🛠️ Hazlo tú:</b><ol class="how"><li>Elige una pista melódica (Piano, Guitarra…).</li><li>En <b>Nota</b> elige <b>1</b> (un compás entero).</li><li>Clic en la regla para poner el cursor en el compás que quieras.</li><li>En esa <b>misma columna</b> haz clic en ${sp.map((x) => chip(x.full)).join(' ')} (usa ▲▼ si alguna está en otra octava).</li><li>Pulsa ▶ y compáralo con el botón ＋.</li></ol>
        <div class="nav"><button data-c="${i}" title="Escuchar este acorde">🔊 Escuchar</button><button data-i="${i}" title="Insertar este acorde en el compás del cursor de la pista elegida">＋ Insertar</button></div></div>`;
    });
    h += '<h3>🎼 Progresiones famosas en esta tonalidad</h3><p class="hint">Un acorde por compás. Escúchalas, inserta la que te guste y cámbiale el ritmo o la melodía.</p>';
    T.progs[mj ? 'major' : 'minor'].forEach((p, k) => { h += `<div class="exc"><span class="tag">${p.w}</span><b>${p.n}</b><p>${p.d.map((d) => s.rn[d]).join(' – ')} → <b>${p.d.map((d) => T.label(T.triad(R, oct, s, d), R, id)).join(' – ')}</b></p><div class="nav"><button data-pp="${k}" title="Escuchar la progresión completa">🔊 Escuchar</button><button data-pi="${k}" title="Insertar la progresión, un acorde por compás desde el cursor (alarga la canción si hace falta)">＋ Insertar (${p.d.length} compases)</button></div></div>`; });
    B.innerHTML = h;
  }
  const IV = ['Unísono', '2ª menor', '2ª mayor', '3ª menor', '3ª mayor', '4ª justa', 'Tritono', '5ª justa', '6ª menor', '6ª mayor', '7ª menor', '7ª mayor', 'Octava'];
  const EAR = { int: ['Intervalos básicos (3ª, 4ª, 5ª, 8ª)', [3, 4, 5, 7, 12], '😢 3ª menor: triste · 😊 3ª mayor: alegre · 🌅 4ª: abierta · 💪 5ª: firme · 🪞 8ª: la misma nota más aguda'], all: ['Todos los intervalos', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'Empieza por los básicos; cada intervalo tiene su “color”. Tritono = tensión, 7ª = pide resolver.'], tri: ['Acorde: ¿mayor o menor?'], sca: ['Escala: ¿mayor o menor?'], dic: ['✍️ Dictado: escucha y copia en el roll'] };
  const EARTIP = { tri: '😊 Mayor: brillante y alegre · 😢 Menor: oscuro y triste', sca: 'Fíjate en la tercera nota: sube más (mayor, alegre) o menos (menor, oscura)' };
  let earQ = null, earMode = 'int', dicQ = null; const earTr = CS.song.track('piano');
  /* estadísticas persistentes: aciertos por ejercicio, ejercicios de hoy y racha de días */
  const SKEY = 'cs2_stats'; let stats = JSON.parse(localStorage.getItem(SKEY) || '{}');
  const today = (d = new Date()) => d.toLocaleDateString('en-CA');
  const statAdd = (mode, ok) => { stats.days = stats.days || {}; stats.days[today()] = (stats.days[today()] || 0) + 1; stats.m = stats.m || {}; const a = stats.m[mode] || [0, 0]; a[1]++; if (ok) a[0]++; stats.m[mode] = a; try { localStorage.setItem(SKEY, JSON.stringify(stats)); } catch (e) { /* sin almacenamiento */ } };
  const streak = () => { const d = new Date(); if (!(stats.days || {})[today(d)]) d.setDate(d.getDate() - 1); let n = 0; while ((stats.days || {})[today(d)]) { n++; d.setDate(d.getDate() - 1); } return n; };
  const statLine = () => { const m = stats.m || {}, ok = Object.values(m).reduce((a, x) => a + x[0], 0), n = Object.values(m).reduce((a, x) => a + x[1], 0), c = m[earMode]; return `🔥 Racha: ${streak()} día(s) · Hoy: ${(stats.days || {})[today()] || 0} ejercicios · Total: ${ok} de ${n}${n ? ` (${Math.round(ok / n * 100)}%)` : ''}${c ? ` · Este ejercicio: ${c[0]} de ${c[1]}` : ''}`; };
  const pt = (m, d = 0) => setTimeout(() => { earTr.instrument = syncInst(); E.preview(song, earTr, name(clamp(m, 24, 108)), 0.5); }, d);
  function earNew() {
    const r = syncOn() ? 12 * (oct + 1) + Math.floor(Math.random() * 7) : 55 + Math.floor(Math.random() * 7), mj = Math.random() < 0.5;
    if (earMode === 'int' || earMode === 'all') { const p = EAR[earMode][1], a = p[Math.floor(Math.random() * p.length)]; earQ = { ans: p.map((x) => IV[x]), ok: IV[a], play: () => { pt(r); pt(r + a, 550); } }; }
    else if (earMode === 'tri') earQ = { ans: ['Mayor', 'Menor'], ok: mj ? 'Mayor' : 'Menor', play: () => [0, mj ? 4 : 3, 7].forEach((x) => pt(r + x)) };
    else { const sc2 = mj ? [0, 2, 4, 5, 7, 9, 11, 12] : [0, 2, 3, 5, 7, 8, 10, 12]; earQ = { ans: ['Mayor', 'Menor'], ok: mj ? 'Mayor' : 'Menor', play: () => sc2.forEach((x, i) => pt(r + x, i * 280)) }; }
    renderEar(); earQ.play();
  }
  /* Dictado: 4 notas de la escala elegida, en la octava que ves en el roll, para copiarlas en las columnas 1, 5, 9 y 13 */
  const dicPlay = () => playTemp({ bpm: 100, bars: 1, timeSig: song.timeSig, tracks: [{ instrument: syncInst(), volume: 0.9, fx: { reverb: 0.12 }, notes: dicQ.ms.map((m, i) => ({ step: i * 4, len: 4, pitch: name(m) })) }] });
  function dicNew() {
    const base = 12 * (oct + 1), pcs = [...Array(12).keys()].filter((pc) => T.inScale(base + pc, rootV(), sc())), pick = () => base + pcs[Math.floor(Math.random() * pcs.length)];
    dicQ = { ms: Array.from({ length: Math.min(4, Math.floor(spb() / 4)) }, pick) }; dicQ.ps = dicQ.ms.map(name); renderEar(); dicPlay();
  }
  function dicCheck() {
    if (!dicQ) return; if (isD()) return renderEar('Elige una pista melódica para copiar las notas');
    const b = barOf() * spb(), ok = dicQ.ps.map((p, i) => tr().notes.some((n) => n.step === b + i * 4 && n.pitch === p)), all = ok.every(Boolean);
    statAdd('dic', all); renderEar(all ? `✓ ¡Perfecto! Copiaste las ${ok.length} notas.` : `Aciertos: ${ok.filter(Boolean).length} de ${ok.length}. Revisa la nota ${ok.indexOf(false) + 1} (columna ${ok.indexOf(false) * 4 + 1} del compás del cursor).`);
  }
  function renderEar(fb = '') {
    const snd = syncOn() ? `${CS.getInst(tr().instrument).name} · octava ${oct}` : 'Piano', dn = Math.min(4, Math.floor(spb() / 4)), cols = Array.from({ length: dn }, (_, i) => i * 4 + 1).join(', ');
    const head = `<div class="box tip">👂 Entrenar el oído es como aprender a distinguir colores: poco a poco, unos minutos al día. Ahora suena con: <b>${snd}</b>. Cambia arriba <b>«Suena con»</b> para oírlo en tu instrumento y tu octava.</div>
      <select id="earMode" title="Qué quieres practicar">${Object.entries(EAR).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('')}</select>`;
    let body;
    if (earMode === 'dic') body = `<div class="box">1) Elige una pista melódica y pon el cursor en un compás vacío (clic en la regla). 2) Pulsa Empezar: oirás <b>${dn} notas</b> (negras) de tu escala, en la octava que ves: <b>C${oct}–B${oct}</b>. 3) Cópialas con <b>Nota 1/4</b> en las columnas <b>${cols}</b>. 4) Pulsa Comprobar.</div>
      <div class="nav"><button id="earGo" title="Generar un dictado nuevo y escucharlo">${dicQ ? '↻ Nuevo dictado' : '▶ Empezar'}</button><button id="earRe" title="Volver a escuchar el dictado" ${dicQ ? '' : 'disabled'}>🔊 Repetir</button><button id="dicChk" title="Comprobar lo que escribiste en el roll" ${dicQ ? '' : 'disabled'}>✔ Comprobar</button></div>
      ${dicQ ? `<button id="dicSol" title="Ver las notas correctas (cuenta como fallo)">👁 Ver solución</button>` : ''}`;
    else body = `<p class="hint">${EAR[earMode][2] || EARTIP[earMode]}</p><div class="nav"><button id="earGo" title="Empezar con una pregunta nueva">${earQ ? '↻ Nueva' : '▶ Empezar'}</button><button id="earRe" title="Volver a escuchar la pregunta" ${earQ ? '' : 'disabled'}>🔊 Repetir</button></div>
      ${earQ ? `<div class="earb">${earQ.ans.map((a) => `<button data-a="${a}" title="Responder: ${a}">${a}</button>`).join('')}</div>` : ''}`;
    $('#dbody').innerHTML = head + body + `<p><b>${fb}</b></p><p class="hint">${statLine()}</p>`; $('#earMode').value = earMode;
  }
  const insProg = (k) => {
    if (isD()) return say('Elige una pista melódica para insertar acordes'); const mj = $('#scale').value === 'major', p = T.progs[mj ? 'major' : 'minor'][k], s = sc(), st = barOf();
    song.bars = clamp(Math.max(song.bars, st + p.d.length), 1, 64); p.d.forEach((d, b) => { if (st + b < song.bars) T.triad(rootV(), oct, s, d).forEach((m) => tr().notes.push({ step: (st + b) * spb(), len: spb(), pitch: name(m) })); });
    say(`Progresión «${p.n}» insertada desde el compás ${st + 1}`); changed();
  };
  $('#dbody').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return; const D = b.dataset;
    if (tab === 'lec') {
      if (D.ts44) { setTS('4/4'); return; }
      if (D.ex) { const [p, i] = D.ex.split('-').map(Number); return playTemp(exSong(CS.lessons[ls].pages[p].ex[i].demo)); }
      if (D.l) { ls = +D.l; pg = 0; } else { const N = CS.lessons[ls].pages.length + 1, d = +D.pg; if (pg + d < 0) { ls = clamp(ls - 1, 0, CS.lessons.length - 1); pg = 0; } else if (pg + d >= N) { ls = clamp(ls + 1, 0, CS.lessons.length - 1); pg = 0; } else pg += d; }
      renderDrawer(); $('#dbody').scrollTop = 0;
    } else if (tab === 'cho') {
      const s = sc();
      if (D.o !== undefined) { chOpen = chOpen === +D.o ? -1 : +D.o; return renderDrawer(); }
      if (D.pp !== undefined || D.pi !== undefined) { const k = +(D.pp ?? D.pi); if (D.pi !== undefined) return insProg(k); const p = T.progs[$('#scale').value === 'major' ? 'major' : 'minor'][k]; return playTemp({ bpm: 90, bars: p.d.length, timeSig: song.timeSig, tracks: [{ instrument: syncInst(), volume: 0.9, fx: { reverb: 0.12 }, notes: p.d.flatMap((d, bb) => T.triad(rootV(), oct, s, d).map((m) => ({ step: bb * spb(), len: spb(), pitch: name(m) }))) }] }); }
      const i = +(D.c ?? D.i), ns = T.triad(rootV(), oct, s, i);
      if (D.c !== undefined) playTemp({ bpm: 90, bars: 1, tracks: [{ instrument: syncInst(), volume: 0.9, fx: { reverb: 0.12 }, notes: ns.map((m) => ({ step: 0, len: 12, pitch: name(m) })) }] });
      else { if (isD()) return say('Elige una pista melódica para insertar acordes'); const st = barOf() * spb(); ns.forEach((m) => tr().notes.push({ step: st, len: Math.min(spb(), total() - st), pitch: name(m) })); say(`Acorde insertado en el compás ${barOf() + 1}`); changed(); }
    } else if (b.id === 'earGo') { if (earMode === 'dic') dicNew(); else earNew(); } else if (b.id === 'earRe') { if (earMode === 'dic') { if (dicQ) dicPlay(); } else if (earQ) earQ.play(); }
    else if (b.id === 'dicChk') dicCheck(); else if (b.id === 'dicSol') { statAdd('dic', false); renderEar('Solución: ' + dicQ.ps.map((p, i) => `col. ${i * 4 + 1}: ${p}`).join(' · ')); }
    else if (D.a && earQ) { const okk = D.a === earQ.ok, q = earQ; statAdd(earMode, okk); earQ = null; renderEar(okk ? '✓ ¡Correcto!' : '✗ Era: ' + q.ok + ' (escúchala otra vez)'); if (!okk) setTimeout(() => q.play(), 500); setTimeout(() => { if (tab === 'ear') earNew(); }, okk ? 1100 : 2600); }
  };
  $('#dbody').onchange = (e) => { if (e.target.id === 'earMode') { earMode = e.target.value; earQ = null; dicQ = null; renderEar(); } };
  document.querySelector('.tabs').onclick = (e) => { const b = e.target.closest('button'); if (b) { tab = b.dataset.tab; renderDrawer(); } };
  $('#sync').onclick = () => { sync = !sync; if (sync && isD()) say('La pista elegida es batería: se usa el piano'); renderDrawer(); };
  $('#learnBtn').onclick = () => { $('#drawer').classList.toggle('open'); renderDrawer(); }; $('#dClose').onclick = () => $('#drawer').classList.remove('open');

  /* ---------- Cabecera y transporte ---------- */
  $('#root').innerHTML = CS.NOTE.map((n, i) => `<option value="${i}">${n} · ${SOL[i]}</option>`).join(''); $('#root').value = 9;
  $('#scale').innerHTML = Object.entries(T.scales).map(([k, v]) => `<option value="${k}">${v.n}</option>`).join('');
  $('#root').onchange = $('#scale').onchange = () => { renderKeys(); renderDrawer(); draw(); checkLesson(); };
  const toggle = () => { if (E.playing) return E.stop(); const rg = region(); E.play(song, rg ? { loop: true, from: rg.from, to: rg.to } : { loop: $('#loop').checked, from: cur }); };
  $('#play').onclick = toggle; $('#stop').onclick = () => E.stop();
  $('#metro').onchange = (e) => (E.metro = e.target.checked); $('#vol').oninput = (e) => E.setVol(+e.target.value);
  $('#lp').onchange = $('#lpA').onchange = $('#lpN').onchange = () => { if (E.playing) E.stop(); draw(); };
  $('#bpm').onchange = (e) => { song.bpm = clamp(+e.target.value || 120, 40, 240); e.target.value = song.bpm; commit(); save(); };
  $('#title').oninput = (e) => { song.title = e.target.value; save(); }; $('#title').onchange = commit;
  const setBars = (n) => { song.bars = clamp(n, 1, 64); const t = total(); for (const k of song.tracks) k.notes = k.notes.filter((x) => x.step < t).map((x) => ({ ...x, len: Math.min(x.len, t - x.step) })); cur = Math.min(cur, t - 1); song.loopStart = Math.min(song.loopStart || 0, song.bars - 1); z = 1; sx = 0; changed(); };
  $('#barP').onclick = () => setBars(song.bars + 1); $('#barM').onclick = () => setBars(song.bars - 1);
  $('#dup').onclick = () => { if (song.bars > 32) return say('Máximo 64 compases'); const o = total(); for (const t of song.tracks) t.notes.push(...t.notes.map((n) => ({ ...n, step: n.step + o }))); setBars(song.bars * 2); };

  /* ---------- Compás (4/4, 3/4, 6/8…): las notas se acomodan compás por compás ---------- */
  function setTS(v) {
    if (!CS.TS[v] || v === song.timeSig) return; E.stop(); const o = spb(); song.timeSig = v; const n = spb(); let lost = 0;
    for (const t of song.tracks) t.notes = t.notes.flatMap((x) => { const b = Math.floor(x.step / o), off = x.step % o; if (off >= n) { lost++; return []; } return [{ ...x, step: b * n + off, len: Math.min(x.len, n - off) }]; });
    cur = Math.min(Math.floor(cur / o) * n, total() - 1); z = 1; sx = 0; renderAll(); say(lost ? `Compás ${v}: ${lost} nota(s) no cabían y se quitaron (Ctrl+Z para recuperarlas)` : `Compás cambiado a ${v}`); changed();
  }
  $('#ts').onchange = (e) => setTS(e.target.value);

  /* ---------- Menú: archivo, JSON, IA ---------- */
  const msg = (t) => ($('#msg').textContent = t);
  const dl = (n, b) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = n; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  const slug = () => (song.title || 'cancion').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cancion';
  const load = (s) => { E.stop(); Object.assign(song, s); sel = 0; cur = 0; z = 1; sx = 0; renderAll(); commit(); save(); };
  $('#menu').onclick = () => $('#dlg').showModal(); $('#close').onclick = () => $('#dlg').close();
  $('#demo').onclick = () => { load(CS.song.demo()); msg('Demo cargada.'); }; $('#new').onclick = () => { load(CS.song.blank()); msg('Canción nueva (Ctrl+Z para recuperar la anterior).'); };
  $('#xJson').onclick = () => { const t = CS.song.text(song); $('#out').value = t; dl(slug() + '.json', new Blob([t], { type: 'application/json' })); msg('Descargado ' + slug() + '.json'); };
  $('#xJs').onclick = () => { const t = '// Chiptune Studio v2 · 1 paso = 1/16 de nota\nconst song = ' + CS.song.text(song) + ';\n\nexport default song;\n'; $('#out').value = t; dl(slug() + '.js', new Blob([t], { type: 'text/javascript' })); msg('Descargado ' + slug() + '.js'); };
  $('#xWav').onclick = async () => { msg('Renderizando WAV…'); try { dl(slug() + '.wav', await E.wav(song)); msg('Descargado ' + slug() + '.wav'); } catch (e) { msg('No se pudo crear el WAV: ' + e.message); } };
  $('#copy').onclick = async () => { const o = $('#out'); o.select(); try { await navigator.clipboard.writeText(o.value); msg('Copiado.'); } catch (e) { document.execCommand('copy'); msg('Texto seleccionado: usa Ctrl+C si no se copió.'); } };
  $('#lpS').onchange = (e) => { song.loopStart = clamp((+e.target.value || 1) - 1, 0, song.bars - 1); e.target.value = song.loopStart + 1; commit(); save(); draw(); };
  $('#xWavL').onclick = async () => { msg('Renderizando WAV en bucle…'); try { dl(slug() + '-loop.wav', await E.wav(song, true)); msg('Descargado ' + slug() + '-loop.wav: el final se une con el inicio sin salto' + (song.loopStart ? ` (solo el tramo desde el compás ${song.loopStart + 1})` : '') + '.'); } catch (e) { msg('No se pudo crear el WAV: ' + e.message); } };
  $('#iText').onclick = () => { try { load(CS.song.parse($('#out').value)); msg('Importada «' + song.title + '».'); $('#dlg').close(); } catch (e) { msg('No se pudo importar: ' + e.message); } };
  $('#open').onchange = async (e) => { const f = e.target.files[0]; if (f) { $('#out').value = await f.text(); $('#iText').click(); } e.target.value = ''; };
  $('#guide').onclick = () => { $('#out').value = CS.song.guide(); msg('Pega esta guía en la conversación con una IA y pídele la canción.'); };
  $('#clr').onclick = () => { $('#out').value = ''; msg(''); };

  /* ---------- Descripciones emergentes para todos los botones (rápidas y visibles sobre el menú) ---------- */
  const tt = $('#tt'); let tto;
  const hideTT = () => { clearTimeout(tto); try { tt.hidePopover(); } catch (e) { tt.style.display = 'none'; } };
  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('[title],[data-tip]'); if (!el) return; if (el.title) { el.dataset.tip = el.title; el.removeAttribute('title'); }
    clearTimeout(tto); tto = setTimeout(() => { tt.textContent = el.dataset.tip; try { tt.showPopover(); } catch (er) { tt.style.display = 'block'; }
      const r = el.getBoundingClientRect(); tt.style.left = clamp(r.left, 4, innerWidth - tt.offsetWidth - 4) + 'px'; tt.style.top = (r.bottom + 8 + tt.offsetHeight > innerHeight ? r.top - tt.offsetHeight - 8 : r.bottom + 8) + 'px'; }, 220);
  });
  document.addEventListener('mouseout', (e) => { if (e.target.closest('[data-tip]')) hideTT(); }); document.addEventListener('pointerdown', hideTT, true);

  /* ---------- Estado, autoguardado y arranque ---------- */
  function save() { try { const t = JSON.stringify(song); if (t !== last) { localStorage.setItem(SK, t); last = t; $('#saved').textContent = '✓ guardado'; } } catch (e) { /* sin almacenamiento */ } }
  function changed() { E.refresh(song); commit(); $('#bars').textContent = song.bars; renderTracks(); renderDrawer(); draw(); checkLesson(); save(); }
  function renderAll() { $('#ts').value = song.timeSig; $('#lpS').value = (song.loopStart || 0) + 1; $('#lpS').max = song.bars; $('#mon .dots').innerHTML = '<i></i>'.repeat(CS.sig(song).n); dots()[0]?.classList.add('first'); $('#title').value = song.title; $('#bpm').value = song.bpm; $('#bars').textContent = song.bars; renderTracks(); renderKeys(); renderDrawer(); draw(); checkLesson(); }
  try { song = CS.song.normalize(JSON.parse(localStorage.getItem(SK))); } catch (e) { song = CS.song.demo(); }
  if (CS.errors.length) console.warn('Archivos de instrumento/efecto con problemas:\n' + CS.errors.join('\n'));
  renderAll(); commit(); addEventListener('pagehide', save); setInterval(save, 2000);
  (function frame() {
    const p = E.pos(), ph = $('#ph'), play = $('#play'), mon = $('#mon'), arm = $('#arm');
    if (E.playing && p != null && G.SW) {
      ph.style.display = 'block'; const X = G.LW + p * G.SW - sx; ph.style.left = X + 'px'; if (X > G.W - 30 || X < G.LW) { sx = clamp(p * G.SW - 60, 0, 1e9); draw(); }
      const sg = CS.sig(song), beat = Math.floor(p / sg.beat) % sg.n, rg = region(), lo = rg ? rg.from : 0, span = rg ? rg.to - rg.from : total();
      dots().forEach((d, i) => d.classList.toggle('cur', i === beat)); arm.setAttribute('transform', `rotate(${(Math.cos(Math.PI * p / sg.beat) * 24).toFixed(1)} 16 26)`);
      mon.classList.add('live'); mon.classList.toggle('acc', p % sg.spb < 1); $('#monT').textContent = `${rg ? 'Sec. ' : 'Comp. '}${Math.floor(p / sg.spb) + 1}/${rg ? rg.to / sg.spb : song.bars}`; $('#monP').style.width = clamp((p - lo) / span * 100, 0, 100) + '%';
    } else if (!E.playing) { ph.style.display = 'none'; mon.classList.remove('live', 'acc'); dots().forEach((d) => d.classList.remove('cur')); arm.setAttribute('transform', 'rotate(0 16 26)'); $('#monT').textContent = '—'; $('#monP').style.width = '0'; }
    play.classList.toggle('on', E.playing); play.textContent = E.playing ? '❚❚' : '▶'; requestAnimationFrame(frame);
  })();
})();
