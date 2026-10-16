/* Interfaz de una sola pantalla: piano roll de 1 octava, teclado, pistas, aprendizaje y archivo. */
(() => {
  const { $, clamp, midi, name, SOL } = CS, T = CS.theory, E = CS.engine;
  const KEYS = ['KeyA','KeyW','KeyS','KeyE','KeyD','KeyF','KeyT','KeyG','KeyY','KeyH','KeyU','KeyJ','KeyK'], KL = ['A','W','S','E','D','F','T','G','Y','H','U','J','K'];
  const SK = 'cs2_song', DK = 'cs2_done';
  let song, sel = 0, oct = 4, len = 2, z = 1, sx = 0, cur = 0, ls = 0, rec = false, drag = null, G = {}, last = '';
  let done = new Set(JSON.parse(localStorage.getItem(DK) || '[]'));
  const tr = () => song.tracks[sel], isD = () => tr().instrument === 'drums', total = () => song.bars * 16;
  const rootV = () => +$('#root').value, sc = () => T.scales[$('#scale').value];
  const rows = () => isD() ? [...CS.drumOrder].reverse().map((k) => ({ p: k, l: CS.getInst('drums').pieces[k].name }))
    : Array.from({ length: 12 }, (_, i) => { const m = 12 * (oct + 1) + 11 - i; return { p: name(m), m, l: name(m) }; });
  const hear = (p, v = 1) => E.preview(song, tr(), p, 0.3, v);

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
  const setOct = (d) => { oct = clamp(oct + d, 1, 7); renderKeys(); draw(); };
  $('#octD').onclick = () => setOct(-1); $('#octU').onclick = () => setOct(1);
  $('#lens').innerHTML = [[1, '1/16'], [2, '1/8'], [4, '1/4'], [8, '1/2'], [16, '1']].map(([n, l]) => `<button data-l="${n}" class="${n === len ? 'on' : ''}" title="Duración de la nota nueva">${l}</button>`).join('');
  $('#lens').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; len = +b.dataset.l; [...$('#lens').children].forEach((x) => x.classList.toggle('on', x === b)); };

  /* ---------- Pistas ---------- */
  const fams = () => { const o = {}; for (const d of Object.values(CS.inst)) (o[d.family] = o[d.family] || []).push(d); return o; };
  const instOpts = () => Object.entries(fams()).map(([f, a]) => `<optgroup label="${f}">${a.map((d) => `<option value="${d.id}">${d.name}</option>`).join('')}</optgroup>`).join('');
  function renderTracks() {
    const L = $('#tracks'); L.innerHTML = '';
    song.tracks.forEach((t, i) => { const d = CS.getInst(t.instrument), r = document.createElement('div'); r.className = 'trk' + (i === sel ? ' sel' : ''); r.dataset.i = i; r.style.setProperty('--c', d.color);
      r.innerHTML = `<b>${t.name}</b><button data-m class="${t.mute ? 'on' : ''}" title="Silenciar">M</button><button data-s class="${t.solo ? 'on' : ''}" title="Solo">S</button><small>${d.name} · ${t.notes.length} notas</small>`; L.appendChild(r); });
    const t = tr(), d = CS.getInst(t.instrument);
    $('#card').innerHTML = `<label>Nombre<input type="text" id="cn" value="${t.name.replace(/"/g, '&quot;')}"></label><label>Instrumento<select id="ci">${instOpts()}</select></label>
      <label>Volumen<input type="range" id="cv" min="0" max="1" step=".01" value="${t.volume}"></label><label>Paneo<input type="range" id="cp" min="-1" max="1" step=".05" value="${t.pan || 0}"></label>
      ${Object.values(CS.fx).map((f) => `<label title="${f.tip || ''}">${f.name}<input type="range" data-fx="${f.id}" min="0" max="1" step=".01" value="${(t.fx || {})[f.id] || 0}"></label>`).join('')}
      <button id="cd">Eliminar pista</button>`;
    $('#ci').value = d.id; $('#tip').textContent = '💡 ' + d.name + ': ' + d.tip;
    $('#cn').oninput = (e) => { t.name = e.target.value; save(); }; $('#cn').onchange = renderTracks;
    $('#ci').onchange = (e) => { const was = isD(); t.instrument = e.target.value; if (was !== isD()) t.notes = []; renderKeys(); changed(); };
    $('#cv').oninput = (e) => { t.volume = +e.target.value; E.refresh(song); save(); }; $('#cp').oninput = (e) => { t.pan = +e.target.value; E.refresh(song); save(); };
    document.querySelectorAll('[data-fx]').forEach((s) => (s.oninput = () => { t.fx = t.fx || {}; t.fx[s.dataset.fx] = +s.value; E.refresh(song); save(); }));
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
    if (isD()) { CS.drumOrder.forEach((k, i) => K.insertAdjacentHTML('beforeend', `<button data-i="${i}"><b>${CS.getInst('drums').pieces[k].name}</b><kbd>${KL[i]}</kbd></button>`)); return; }
    [0, 2, 4, 5, 7, 9, 11, 12].forEach((st, w) => K.insertAdjacentHTML('beforeend', `<button class="w" data-i="${st}" style="left:calc(${w}*100%/8)"><b>${CS.NOTE[st % 12]}${oct + (st === 12 ? 1 : 0)}</b><small>${SOL[st % 12]}</small><kbd>${KL[st]}</kbd></button>`));
    [[1, 0], [3, 1], [6, 3], [8, 4], [10, 5]].forEach(([st, w]) => K.insertAdjacentHTML('beforeend', `<button class="k" data-i="${st}" style="left:calc(${w + 1}*100%/8 - 100%/8*.29)"><b>${CS.NOTE[st]}</b><kbd>${KL[st]}</kbd></button>`));
  }
  function key(i) {
    const p = isD() ? CS.drumOrder[i] : name(12 * (oct + 1) + i); if (!p) return; hear(p);
    const b = $(`#keys [data-i="${i}"]`); if (b) { b.classList.add('p'); setTimeout(() => b.classList.remove('p'), 120); }
    if (rec) { const ps = E.pos(), st = ps != null ? Math.floor(ps) : cur; tr().notes.push({ step: clamp(st, 0, total() - 1), len: isD() ? 1 : Math.min(len, total() - st), pitch: p }); if (ps == null) cur = clamp(cur + (isD() ? 1 : len), 0, total() - 1); changed(); }
  }
  $('#keys').addEventListener('pointerdown', (e) => { const b = e.target.closest('button'); if (b) key(+b.dataset.i); });
  $('#rec').onchange = (e) => (rec = e.target.checked);
  addEventListener('keydown', (e) => {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === 'Space') { e.preventDefault(); toggle(); } else if (e.code === 'KeyZ') setOct(-1); else if (e.code === 'KeyX') setOct(1);
    else { const i = KEYS.indexOf(e.code); if (i >= 0 && !e.repeat) key(i); }
  });

  /* ---------- Aprender y acordes ---------- */
  function renderLearn() {
    const L = CS.lessons, l = L[ls];
    $('#learn').innerHTML = `<div class="steps">${L.map((x, i) => `<button data-l="${i}" class="${i === ls ? 'on' : ''} ${done.has(i) ? 'ok' : ''}" title="${x.t}">${i + 1}</button>`).join('')}</div><h3>${ls + 1}. ${l.t}</h3><p>${l.b}</p><p class="task">🎯 ${l.task}</p><div id="lstat"></div><div class="nav"><button data-n="-1">◀ Anterior</button><button data-n="1">Siguiente ▶</button></div>`;
    $('#learn').style.display = $('#learnOn').checked ? '' : 'none'; checkLesson();
  }
  function checkLesson() {
    const ok = CS.lessons[ls].ok(song, { root: rootV(), sc: sc() }), s = $('#lstat'); if (!s) return;
    s.textContent = ok ? '✓ ¡Logrado!' : 'Pendiente…'; s.className = ok ? 'ok' : '';
    if (ok && !done.has(ls)) { done.add(ls); localStorage.setItem(DK, JSON.stringify([...done])); document.querySelector(`.steps [data-l="${ls}"]`)?.classList.add('ok'); }
  }
  $('#learn').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.l) ls = +b.dataset.l; else ls = clamp(ls + +b.dataset.n, 0, CS.lessons.length - 1); renderLearn(); };
  $('#learnOn').onchange = renderLearn;
  function renderChords() {
    const s = sc(), box = $('#chords'); if (s.s.length < 7) { box.innerHTML = '<p class="hint">Elige la escala Mayor o Menor natural para ver los acordes del tono.</p>'; return; }
    box.innerHTML = s.rn.map((rn, i) => { const ns = T.triad(rootV(), oct, s, i); return `<div class="ch"><button data-c="${i}" title="Escuchar">${rn} <small>${T.chordName(ns)}</small></button><button data-i="${i}" title="Insertar en el compás del cursor">＋</button></div>`; }).join('');
  }
  $('#chords').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return; const i = +(b.dataset.c ?? b.dataset.i), ns = T.triad(rootV(), oct, sc(), i);
    if (isD()) return ($('#msg').textContent = ''), ($('#tip').textContent = 'Elige una pista melódica para tocar o insertar acordes.');
    if (b.dataset.c !== undefined) ns.forEach((m) => hear(name(m)));
    else { const st = Math.floor(cur / 16) * 16; ns.forEach((m) => tr().notes.push({ step: st, len: Math.min(16, total() - st), pitch: name(m) })); changed(); }
  };

  /* ---------- Cabecera, transporte y archivo ---------- */
  $('#root').innerHTML = CS.NOTE.map((n, i) => `<option value="${i}">${n} · ${SOL[i]}</option>`).join(''); $('#root').value = 9;
  $('#scale').innerHTML = Object.entries(T.scales).map(([k, v]) => `<option value="${k}">${v.n}</option>`).join('');
  $('#root').onchange = $('#scale').onchange = () => { renderChords(); draw(); checkLesson(); };
  const toggle = () => { if (E.playing) E.stop(); else E.play(song, { loop: $('#loop').checked, from: cur }); };
  $('#play').onclick = toggle; $('#stop').onclick = () => E.stop();
  $('#metro').onchange = (e) => (E.metro = e.target.checked); $('#vol').oninput = (e) => E.setVol(+e.target.value);
  $('#bpm').onchange = (e) => { song.bpm = clamp(+e.target.value || 120, 40, 240); e.target.value = song.bpm; save(); };
  $('#title').oninput = (e) => { song.title = e.target.value; save(); };
  const setBars = (n) => { song.bars = clamp(n, 1, 64); const T = total(); for (const t of song.tracks) t.notes = t.notes.filter((x) => x.step < T).map((x) => ({ ...x, len: Math.min(x.len, T - x.step) })); cur = Math.min(cur, T - 1); z = 1; sx = 0; changed(); };
  $('#barP').onclick = () => setBars(song.bars + 1); $('#barM').onclick = () => setBars(song.bars - 1);
  $('#dup').onclick = () => { if (song.bars > 32) return; const o = total(); for (const t of song.tracks) t.notes.push(...t.notes.map((n) => ({ ...n, step: n.step + o }))); setBars(song.bars * 2); };
  const msg = (t) => ($('#msg').textContent = t);
  const dl = (n, b) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = n; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  const slug = () => (song.title || 'cancion').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cancion';
  const load = (s) => { E.stop(); song = s; sel = 0; cur = 0; z = 1; sx = 0; renderAll(); save(); };
  $('#file').onclick = () => $('#dlg').showModal(); $('#close').onclick = () => $('#dlg').close();
  $('#demo').onclick = () => { load(CS.song.demo()); msg('Demo cargada.'); }; $('#new').onclick = () => { if (confirm('¿Empezar una canción nueva?')) { load(CS.song.blank()); msg('Canción nueva.'); } };
  $('#xJson').onclick = () => { const t = CS.song.text(song); $('#out').value = t; dl(slug() + '.json', new Blob([t], { type: 'application/json' })); msg('Descargado ' + slug() + '.json'); };
  $('#xJs').onclick = () => { const t = '// Chiptune Studio v2 · 16 pasos por compás\nconst song = ' + CS.song.text(song) + ';\n\nexport default song;\n'; $('#out').value = t; dl(slug() + '.js', new Blob([t], { type: 'text/javascript' })); msg('Descargado ' + slug() + '.js'); };
  $('#xWav').onclick = async () => { msg('Renderizando WAV…'); try { dl(slug() + '.wav', await E.wav(song)); msg('Descargado ' + slug() + '.wav'); } catch (e) { msg('No se pudo crear el WAV: ' + e.message); } };
  $('#copy').onclick = async () => { const o = $('#out'); o.select(); try { await navigator.clipboard.writeText(o.value); msg('Copiado.'); } catch (e) { document.execCommand('copy'); } };
  $('#iText').onclick = () => { try { load(CS.song.parse($('#out').value)); msg('Importada «' + song.title + '».'); } catch (e) { msg('No se pudo importar: ' + e.message); } };
  $('#open').onchange = async (e) => { const f = e.target.files[0]; if (f) { $('#out').value = await f.text(); $('#iText').click(); } e.target.value = ''; };
  $('#guide').onclick = () => { $('#out').value = CS.song.guide(); msg('Pega esta guía en la conversación con una IA y pídele la canción.'); };
  $('#clr').onclick = () => { $('#out').value = ''; msg(''); };

  /* ---------- Estado, autoguardado y arranque ---------- */
  function save() { try { const t = JSON.stringify(song); if (t !== last) { localStorage.setItem(SK, t); last = t; $('#saved').textContent = '✓ guardado ' + new Date().toLocaleTimeString(); } } catch (e) { /* sin almacenamiento */ } }
  function changed() { E.refresh(song); renderTracks(); draw(); checkLesson(); save(); }
  function renderAll() { $('#title').value = song.title; $('#bpm').value = song.bpm; $('#bars').textContent = song.bars; renderTracks(); renderKeys(); renderChords(); renderLearn(); draw(); }
  const _c = changed; changed = () => { $('#bars').textContent = song.bars; _c(); };
  try { song = CS.song.normalize(JSON.parse(localStorage.getItem(SK))); } catch (e) { song = CS.song.demo(); }
  if (CS.errors.length) console.warn('Archivos de instrumento/efecto con problemas:\n' + CS.errors.join('\n'));
  renderAll(); addEventListener('pagehide', save); setInterval(save, 2000);
  (function frame() {
    const p = E.pos(), ph = $('#ph'), play = $('#play');
    if (E.playing && p != null && G.SW) { ph.style.display = 'block'; const X = G.LW + p * G.SW - sx; ph.style.left = X + 'px'; if (X > G.W - 30 || X < G.LW) { sx = clamp(p * G.SW - 60, 0, 1e9); draw(); } } else if (!E.playing) ph.style.display = 'none';
    play.classList.toggle('on', E.playing); play.textContent = E.playing ? '❚❚' : '▶'; requestAnimationFrame(frame);
  })();
})();
