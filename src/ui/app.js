/* Interfaz de una sola pantalla: piano roll de 1 octava, teclado, pistas, panel de aprendizaje (lecciones · acordes · oído), historial y menú. */
(() => {
  const { $, clamp, midi, name, SOL } = CS, T = CS.theory, E = CS.engine;
  const KEYS = ['KeyA','KeyW','KeyS','KeyE','KeyD','KeyF','KeyT','KeyG','KeyY','KeyH','KeyU','KeyJ','KeyK'], KL = ['A','W','S','E','D','F','T','G','Y','H','U','J','K'];
  const SK = 'cs2_song', DK = 'cs2_done2';
  let song, sel = 0, oct = 4, len = 2, z = 1, sx = 0, cur = 0, ls = 0, rec = false, drag = null, G = {}, last = '', hist = [], hi = -1, clip = null, tab = 'lec', stT = 0;
  let done = new Set(JSON.parse(localStorage.getItem(DK) || '[]'));
  const tr = () => song.tracks[sel], isD = () => tr().instrument === 'drums', total = () => song.bars * 16;
  const rootV = () => +$('#root').value, sc = () => T.scales[$('#scale').value], barOf = () => Math.floor(cur / 16);
  const rows = () => isD() ? [...CS.drumOrder].reverse().map((k) => ({ p: k, l: CS.getInst('drums').pieces[k].name }))
    : Array.from({ length: 12 }, (_, i) => { const m = 12 * (oct + 1) + 11 - i; return { p: name(m), m, l: name(m) }; });
  const hear = (p, v = 1) => E.preview(song, tr(), p, 0.3, v);
  const say = (t) => { $('#st').textContent = t; clearTimeout(stT); stT = setTimeout(() => ($('#st').textContent = ''), 2800); };
  const region = () => { if (!$('#lp').checked) return null; const a = clamp((+$('#lpA').value || 1) - 1, 0, song.bars - 1), n = clamp(+$('#lpN').value || 1, 1, song.bars - a); return { from: a * 16, to: (a + n) * 16 }; };

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
    const R = rows(), LW = 84, RU = 22, RH = (H - RU) / 12, N = total(), SW = Math.max(2, (W - LW) / N) * z, D = isD();
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
    x.fillStyle = '#ffffff0b'; x.fillRect(barOf() * 16 * SW, RU, 16 * SW, H);                       // compás del cursor
    const rg = region(); if (rg) { x.fillStyle = v('--acc') + '1f'; x.fillRect(rg.from * SW, 0, (rg.to - rg.from) * SW, H); x.fillStyle = v('--acc'); x.fillRect(rg.from * SW, RU - 4, (rg.to - rg.from) * SW, 4); }
    for (let s = 0; s <= N; s++) {
      const bar = s % 16 === 0, beat = s % 4 === 0; if (!bar && !beat && SW < 9) continue;
      x.fillStyle = bar ? v('--mut') : beat ? v('--line') : v('--line') + '66'; x.fillRect(s * SW, bar ? 0 : RU, 1, H);
      if (bar && s < N) { x.fillStyle = v('--tx'); x.font = '12px system-ui'; x.fillText(s / 16 + 1, s * SW + 4, 11); }
    }
    let up = 0, dn = 0;
    for (const n of tr().notes) {
      const i = R.findIndex((r) => r.p === n.pitch);
      if (i < 0) { if (!D) midi(n.pitch) > R[0].m ? up++ : dn++; continue; }
      x.globalAlpha = 0.45 + 0.55 * (n.vel ?? 1); x.fillStyle = col; x.fillRect(n.step * SW + 1, RU + i * RH + 2, Math.max(2, n.len * SW - 2), RH - 4); x.globalAlpha = 1;
      if (n.len * SW > 34 && !D) { x.fillStyle = '#1a1530'; x.font = 'bold 11px system-ui'; x.fillText(n.pitch, n.step * SW + 5, RU + i * RH + RH / 2); }
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
    if (h.n) drag = { n: h.n, mode: edge(h.n, e) ? 'size' : 'move', x0: e.offsetX, y0: e.offsetY, step0: h.n.step, moved: false, fresh: false };
    else { const n = { step: h.s, len: Math.min(len, total() - h.s), pitch: h.r.p }; tr().notes.push(n); hear(n.pitch); cur = h.s; drag = { n, mode: 'size', x0: e.offsetX, y0: e.offsetY, moved: false, fresh: true }; draw(); }
  });
  g.addEventListener('pointermove', (e) => {
    if (!drag) { const h = hitAt(e); g.style.cursor = h && h.n ? (edge(h.n, e) ? 'ew-resize' : 'grab') : 'crosshair'; return; }
    const n = drag.n; if (!drag.moved && (Math.abs(e.offsetX - drag.x0) > 4 || (!drag.fresh && Math.abs(e.offsetY - drag.y0) > G.RH / 2))) drag.moved = true; if (!drag.moved) return;
    if (drag.mode === 'size') n.len = clamp(Math.floor((e.offsetX - G.LW + sx) / G.SW) - n.step + 1, 1, total() - n.step);
    else { n.step = clamp(drag.step0 + Math.round((e.offsetX - drag.x0) / G.SW), 0, total() - n.len); const r = G.R[clamp(Math.floor((e.offsetY - G.RU) / G.RH), 0, 11)]; if (r.p !== n.pitch) { n.pitch = r.p; hear(r.p); } }
    draw();
  });
  const end = () => { if (!drag) return; if (!drag.moved && !drag.fresh) { const t = tr(); t.notes.splice(t.notes.indexOf(drag.n), 1); } drag = null; changed(); };
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
  $('#lens').innerHTML = [[1, '1/16', 'semicorchea · 1 paso'], [2, '1/8', 'corchea · 2 pasos'], [4, '1/4', 'negra · 4 pasos (un pulso)'], [8, '1/2', 'blanca · 8 pasos'], [16, '1', 'redonda · 16 pasos (un compás)']]
    .map(([n, l, t]) => `<button data-l="${n}" class="${n === len ? 'on' : ''}" title="Notas nuevas de ${t}">${l}</button>`).join('');
  $('#lens').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; len = +b.dataset.l; [...$('#lens').children].forEach((x) => x.classList.toggle('on', x === b)); };

  /* ---------- Edición de compases y pistas ---------- */
  const inBar = (n, b) => n.step >= b * 16 && n.step < b * 16 + 16;
  $('#clB').onclick = () => { const b = barOf(), k = tr().notes.length; tr().notes = tr().notes.filter((n) => !inBar(n, b)); say(`Compás ${b + 1} limpio (${k - tr().notes.length} notas)`); changed(); };
  $('#clT').onclick = () => { say(`Pista «${tr().name}» limpia`); tr().notes = []; changed(); };
  $('#clA').onclick = () => { song.tracks.forEach((t) => (t.notes = [])); say('Todas las notas borradas (Ctrl+Z para recuperarlas)'); changed(); };
  $('#cpy').onclick = () => { const b = barOf(); clip = { d: isD(), notes: tr().notes.filter((n) => inBar(n, b)).map((n) => ({ ...n, step: n.step - b * 16 })) }; say(`Compás ${b + 1} copiado (${clip.notes.length} notas)`); };
  $('#pst').onclick = () => {
    if (!clip) return say('Primero copia un compás');
    if (clip.d !== isD()) return say('Pega en una pista del mismo tipo (melódica o batería)');
    const b = barOf(); tr().notes = tr().notes.filter((n) => !inBar(n, b)); clip.notes.forEach((n) => tr().notes.push({ ...n, step: n.step + b * 16, len: Math.min(n.len, total() - (n.step + b * 16)) }));
    say(`Pegado en el compás ${b + 1}`); if ((b + 1) * 16 < total()) cur = (b + 1) * 16; changed();
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
    [[1, 0], [3, 1], [6, 3], [8, 4], [10, 5]].forEach(([st, w]) => K.insertAdjacentHTML('beforeend', `<button class="k" data-i="${st}" title="${CS.NOTE[st]}${oct} sostenido (tecla ${KL[st]})" style="left:calc(${w + 1}*100%/8 - 100%/8*.29)"><b>${CS.NOTE[st]}</b><kbd>${KL[st]}</kbd></button>`));
  }
  function key(i) {
    const p = isD() ? CS.drumOrder[i] : name(12 * (oct + 1) + i); if (!p) return; hear(p);
    const b = $(`#keys [data-i="${i}"]`); if (b) { b.classList.add('p'); setTimeout(() => b.classList.remove('p'), 120); }
    if (rec) { const ps = E.pos(), st = clamp(ps != null ? Math.floor(ps) : cur, 0, total() - 1); tr().notes.push({ step: st, len: isD() ? 1 : Math.min(len, total() - st), pitch: p }); if (ps == null) cur = clamp(cur + (isD() ? 1 : len), 0, total() - 1); changed(); }
  }
  $('#keys').addEventListener('pointerdown', (e) => { const b = e.target.closest('button'); if (b) key(+b.dataset.i); });
  $('#rec').onchange = (e) => (rec = e.target.checked);
  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) { if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return; if (e.code === 'KeyZ') { e.preventDefault(); e.shiftKey ? redo() : undo(); } else if (e.code === 'KeyY') { e.preventDefault(); redo(); } return; }
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || e.altKey || $('#dlg').open) return;
    if (e.code === 'Space') { e.preventDefault(); toggle(); } else if (e.code === 'KeyZ') setOct(-1); else if (e.code === 'KeyX') setOct(1); else if (e.code === 'Home') { cur = 0; sx = 0; draw(); }
    else { const i = KEYS.indexOf(e.code); if (i >= 0 && !e.repeat) key(i); }
  });

  /* ---------- Panel de aprendizaje: lecciones · acordes · oído ---------- */
  const lessonCtx = () => ({ root: rootV(), sc: sc(), id: $('#scale').value });
  function renderDrawer() {
    document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    const B = $('#dbody'); if (!$('#drawer').classList.contains('open')) return;
    if (tab === 'lec') {
      const L = CS.lessons, l = L[ls];
      B.innerHTML = `<div class="steps">${L.map((x, i) => `<button data-l="${i}" class="${i === ls ? 'on' : ''} ${done.has(i) ? 'ok' : ''}" title="${i + 1}. ${x.t}${done.has(i) ? ' (completada)' : ''}">${i + 1}</button>`).join('')}</div><h3>${ls + 1}. ${l.t}</h3><p>${l.b}</p><p class="task">🎯 ${l.task}</p><div id="lstat"></div><div class="nav"><button data-n="-1" title="Lección anterior">◀ Anterior</button><button data-n="1" title="Lección siguiente">Siguiente ▶</button></div>`;
      checkLesson();
    } else if (tab === 'cho') renderChords(); else renderEar();
  }
  function checkLesson() {
    const ok = CS.lessons[ls].ok(song, lessonCtx()), s = $('#lstat');
    if (ok && !done.has(ls)) { done.add(ls); localStorage.setItem(DK, JSON.stringify([...done])); say(`✓ Lección ${ls + 1} completada`); document.querySelector(`.steps [data-l="${ls}"]`)?.classList.add('ok'); }
    for (const i of CS.lessons.keys()) if (!done.has(i) && CS.lessons[i].ok(song, lessonCtx())) { done.add(i); localStorage.setItem(DK, JSON.stringify([...done])); say(`✓ Lección ${i + 1} completada`); }
    $('#learnBtn').textContent = `📖 Aprender ${done.size}/${CS.lessons.length}`;
    if (s) { s.textContent = ok ? '✓ ¡Logrado!' : 'Pendiente…'; s.className = ok ? 'ok' : ''; }
  }
  function renderChords() {
    const s = sc(), B = $('#dbody'); if (s.s.length < 7) { B.innerHTML = '<p class="hint">Elige la escala Mayor o Menor natural para ver los acordes del tono.</p>'; return; }
    B.innerHTML = `<p class="hint">Los 7 acordes que nacen de la escala elegida. Clic para escucharlos; ＋ los inserta en el compás del cursor de la pista elegida (octava ${oct}).</p><div id="chords">` + s.rn.map((rn, i) => { const ns = T.triad(rootV(), oct, s, i); return `<div class="ch"><button data-c="${i}" title="Escuchar el acorde ${rn}">${rn} <small>${T.chordName(ns)}</small></button><button data-i="${i}" title="Insertar el acorde ${rn} en el compás del cursor">＋</button></div>`; }).join('') + '</div>';
  }
  const IV = ['Unísono', '2ª menor', '2ª mayor', '3ª menor', '3ª mayor', '4ª justa', 'Tritono', '5ª justa', '6ª menor', '6ª mayor', '7ª menor', '7ª mayor', 'Octava'];
  const EAR = { int: ['Intervalos básicos (3ª, 4ª, 5ª, 8ª)', [3, 4, 5, 7, 12]], all: ['Todos los intervalos', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]], tri: ['Acorde: ¿mayor o menor?'], sca: ['Escala: ¿mayor o menor?'] };
  let earQ = null, earS = { ok: 0, n: 0 }, earMode = 'int'; const earTr = CS.song.track('piano');
  const pt = (m, d = 0) => setTimeout(() => E.preview(song, earTr, name(m), 0.5), d);
  function earNew() {
    const r = 55 + Math.floor(Math.random() * 12), mj = Math.random() < 0.5;
    if (earMode === 'int' || earMode === 'all') { const p = EAR[earMode][1], a = p[Math.floor(Math.random() * p.length)]; earQ = { ans: p.map((x) => IV[x]), ok: IV[a], play: () => { pt(r); pt(r + a, 550); } }; }
    else if (earMode === 'tri') earQ = { ans: ['Mayor', 'Menor'], ok: mj ? 'Mayor' : 'Menor', play: () => [0, mj ? 4 : 3, 7].forEach((x) => pt(r + x)) };
    else { const s = mj ? [0, 2, 4, 5, 7, 9, 11, 12] : [0, 2, 3, 5, 7, 8, 10, 12]; earQ = { ans: ['Mayor', 'Menor'], ok: mj ? 'Mayor' : 'Menor', play: () => s.forEach((x, i) => pt(r + x, i * 280)) }; }
    renderEar(); earQ.play();
  }
  function renderEar(fb = '') {
    $('#dbody').innerHTML = `<p class="hint">El oído se entrena poco a poco: unos minutos al día. Escucha y elige la respuesta.</p><select id="earMode" title="Qué quieres practicar">${Object.entries(EAR).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('')}</select>
      <div class="nav"><button id="earGo" title="Empezar con una pregunta nueva">${earQ ? '↻ Nueva' : '▶ Empezar'}</button><button id="earRe" title="Volver a escuchar la pregunta" ${earQ ? '' : 'disabled'}>🔊 Repetir</button></div>
      ${earQ ? `<div class="earb">${earQ.ans.map((a) => `<button data-a="${a}" title="Responder: ${a}">${a}</button>`).join('')}</div>` : ''}<p><b>${fb}</b></p><p class="hint">Aciertos: ${earS.ok} de ${earS.n}</p>`;
    $('#earMode').value = earMode;
  }
  $('#dbody').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (tab === 'lec') { if (b.dataset.l) ls = +b.dataset.l; else ls = clamp(ls + +b.dataset.n, 0, CS.lessons.length - 1); renderDrawer(); }
    else if (tab === 'cho') {
      const i = +(b.dataset.c ?? b.dataset.i), ns = T.triad(rootV(), oct, sc(), i); if (isD()) return say('Elige una pista melódica para tocar o insertar acordes');
      if (b.dataset.c !== undefined) ns.forEach((m) => hear(name(m))); else { const st = barOf() * 16; ns.forEach((m) => tr().notes.push({ step: st, len: Math.min(16, total() - st), pitch: name(m) })); say(`Acorde insertado en el compás ${barOf() + 1}`); changed(); }
    } else if (b.id === 'earGo') earNew(); else if (b.id === 'earRe') earQ.play();
    else if (b.dataset.a) { earS.n++; const okk = b.dataset.a === earQ.ok; if (okk) earS.ok++; const q = earQ; earQ = null; renderEar(okk ? '✓ ¡Correcto!' : '✗ Era: ' + q.ok); setTimeout(() => { if (tab === 'ear') earNew(); }, 1100); }
  };
  $('#dbody').onchange = (e) => { if (e.target.id === 'earMode') { earMode = e.target.value; earQ = null; renderEar(); } };
  document.querySelector('.tabs').onclick = (e) => { const b = e.target.closest('button'); if (b) { tab = b.dataset.tab; renderDrawer(); } };
  $('#learnBtn').onclick = () => { $('#drawer').classList.toggle('open'); renderDrawer(); }; $('#dClose').onclick = () => $('#drawer').classList.remove('open');

  /* ---------- Cabecera y transporte ---------- */
  $('#root').innerHTML = CS.NOTE.map((n, i) => `<option value="${i}">${n} · ${SOL[i]}</option>`).join(''); $('#root').value = 9;
  $('#scale').innerHTML = Object.entries(T.scales).map(([k, v]) => `<option value="${k}">${v.n}</option>`).join('');
  $('#root').onchange = $('#scale').onchange = () => { renderDrawer(); draw(); checkLesson(); };
  const toggle = () => { if (E.playing) return E.stop(); const rg = region(); E.play(song, rg ? { loop: true, from: rg.from, to: rg.to } : { loop: $('#loop').checked, from: cur }); };
  $('#play').onclick = toggle; $('#stop').onclick = () => E.stop();
  $('#metro').onchange = (e) => (E.metro = e.target.checked); $('#vol').oninput = (e) => E.setVol(+e.target.value);
  $('#lp').onchange = $('#lpA').onchange = $('#lpN').onchange = () => { if (E.playing) E.stop(); draw(); };
  $('#bpm').onchange = (e) => { song.bpm = clamp(+e.target.value || 120, 40, 240); e.target.value = song.bpm; commit(); save(); };
  $('#title').oninput = (e) => { song.title = e.target.value; save(); }; $('#title').onchange = commit;
  const setBars = (n) => { song.bars = clamp(n, 1, 64); const t = total(); for (const k of song.tracks) k.notes = k.notes.filter((x) => x.step < t).map((x) => ({ ...x, len: Math.min(x.len, t - x.step) })); cur = Math.min(cur, t - 1); z = 1; sx = 0; changed(); };
  $('#barP').onclick = () => setBars(song.bars + 1); $('#barM').onclick = () => setBars(song.bars - 1);
  $('#dup').onclick = () => { if (song.bars > 32) return say('Máximo 64 compases'); const o = total(); for (const t of song.tracks) t.notes.push(...t.notes.map((n) => ({ ...n, step: n.step + o }))); setBars(song.bars * 2); };

  /* ---------- Menú: archivo, JSON, IA ---------- */
  const msg = (t) => ($('#msg').textContent = t);
  const dl = (n, b) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = n; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  const slug = () => (song.title || 'cancion').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cancion';
  const load = (s) => { E.stop(); Object.assign(song, s); sel = 0; cur = 0; z = 1; sx = 0; renderAll(); commit(); save(); };
  $('#menu').onclick = () => $('#dlg').showModal(); $('#close').onclick = () => $('#dlg').close();
  $('#demo').onclick = () => { load(CS.song.demo()); msg('Demo cargada.'); }; $('#new').onclick = () => { load(CS.song.blank()); msg('Canción nueva (Ctrl+Z para recuperar la anterior).'); };
  $('#xJson').onclick = () => { const t = CS.song.text(song); $('#out').value = t; dl(slug() + '.json', new Blob([t], { type: 'application/json' })); msg('Descargado ' + slug() + '.json'); };
  $('#xJs').onclick = () => { const t = '// Chiptune Studio v2 · 16 pasos por compás\nconst song = ' + CS.song.text(song) + ';\n\nexport default song;\n'; $('#out').value = t; dl(slug() + '.js', new Blob([t], { type: 'text/javascript' })); msg('Descargado ' + slug() + '.js'); };
  $('#xWav').onclick = async () => { msg('Renderizando WAV…'); try { dl(slug() + '.wav', await E.wav(song)); msg('Descargado ' + slug() + '.wav'); } catch (e) { msg('No se pudo crear el WAV: ' + e.message); } };
  $('#copy').onclick = async () => { const o = $('#out'); o.select(); try { await navigator.clipboard.writeText(o.value); msg('Copiado.'); } catch (e) { document.execCommand('copy'); msg('Texto seleccionado: usa Ctrl+C si no se copió.'); } };
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
  function renderAll() { $('#title').value = song.title; $('#bpm').value = song.bpm; $('#bars').textContent = song.bars; renderTracks(); renderKeys(); renderDrawer(); draw(); checkLesson(); }
  try { song = CS.song.normalize(JSON.parse(localStorage.getItem(SK))); } catch (e) { song = CS.song.demo(); }
  if (CS.errors.length) console.warn('Archivos de instrumento/efecto con problemas:\n' + CS.errors.join('\n'));
  renderAll(); commit(); addEventListener('pagehide', save); setInterval(save, 2000);
  const dots = [...document.querySelectorAll('#mon .dots i')]; dots[0].classList.add('first');
  (function frame() {
    const p = E.pos(), ph = $('#ph'), play = $('#play'), mon = $('#mon'), arm = $('#arm');
    if (E.playing && p != null && G.SW) {
      ph.style.display = 'block'; const X = G.LW + p * G.SW - sx; ph.style.left = X + 'px'; if (X > G.W - 30 || X < G.LW) { sx = clamp(p * G.SW - 60, 0, 1e9); draw(); }
      const beat = Math.floor(p / 4) % 4, rg = region(), lo = rg ? rg.from : 0, span = rg ? rg.to - rg.from : total();
      dots.forEach((d, i) => d.classList.toggle('cur', i === beat)); arm.setAttribute('transform', `rotate(${(Math.cos(Math.PI * p / 4) * 24).toFixed(1)} 16 26)`);
      mon.classList.add('live'); mon.classList.toggle('acc', p % 16 < 1); $('#monT').textContent = `${rg ? 'Sec. ' : 'Comp. '}${Math.floor(p / 16) + 1}/${rg ? rg.to / 16 : song.bars}`; $('#monP').style.width = clamp((p - lo) / span * 100, 0, 100) + '%';
    } else if (!E.playing) { ph.style.display = 'none'; mon.classList.remove('live', 'acc'); dots.forEach((d) => d.classList.remove('cur')); arm.setAttribute('transform', 'rotate(0 16 26)'); $('#monT').textContent = '—'; $('#monP').style.width = '0'; }
    play.classList.toggle('on', E.playing); play.textContent = E.playing ? '❚❚' : '▶'; requestAnimationFrame(frame);
  })();
})();
