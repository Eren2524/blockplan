/* Blockplan – Oberfläche: Bauliste, Ebenen, 2D-Raster, Materialliste, Fortschritt. */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const D = (c) => MC.BLOCKS[c.id] || MC.BLOCKS.stone;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('blockplan.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('blockplan.' + k, JSON.stringify(v)); } catch (e) { /* kein Speicher */ } }
  };
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const CAT = { farm: 'Automatische Farmen', project: 'Bauprojekte', building: 'Gebäude' };
  const CAT_ONE = { farm: 'Automatische Farm', project: 'Bauprojekt', building: 'Gebäude' };
  const DIFF = { 'Leicht': 'easy', 'Mittel': 'mid', 'Fortgeschritten': 'hard' };

  const state = { diff: '', build: null, layer: 0, mode: 'all', sel: null, tab: 'layer', rotate: false, done: new Set() };
  let viewer;

  /* ---------- Hilfen ---------- */
  function index(b) {
    if (b.layers) return;
    b.layers = Array.from({ length: b.size[1] }, () => []);
    b.lookup = new Map();
    b.cells.forEach((c) => { b.layers[c.y].push(c); b.lookup.set(c.x + ',' + c.y + ',' + c.z, c); });
  }
  const at = (b, x, y, z) => b.lookup.get(x + ',' + y + ',' + z);
  const placed = (cells) => cells.filter((c) => { const d = D(c); return !d.auto && !d.entity; });

  function swatchCanvas(id, size) {
    const def = MC.BLOCKS[id];
    const c = document.createElement('canvas');
    c.width = c.height = 16;
    const g = c.getContext('2d');
    const key = def.tex ? (def.tex.all || def.tex.front || def.tex.side || def.tex.top) : null;
    if (key) g.drawImage(MC.texCanvas(key), 0, 0);
    if (!key || def.transparent) { g.fillStyle = def.color; g.globalAlpha = def.transparent ? 0.45 : 1; g.fillRect(0, 0, 16, 16); g.globalAlpha = 1; }
    c.style.width = c.style.height = (size || 22) + 'px';
    return c;
  }

  function stackText(n, stack) {
    if (!stack || stack <= 1 || n < stack) return '';
    const s = Math.floor(n / stack), r = n % stack;
    return s + ' × ' + stack + (r ? ' + ' + r : '');
  }

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.hidden = true; }, 2200);
  }

  function fmtTime(min) {
    if (min < 60) return 'ca. ' + min + ' Min.';
    const h = Math.floor(min / 60), m = min % 60;
    return 'ca. ' + h + ' Std.' + (m ? ' ' + m + ' Min.' : '');
  }
  const ytLink = (b) => b.youtube || 'https://www.youtube.com/results?search_query=' + encodeURIComponent('minecraft ' + b.name + ' tutorial deutsch');

  /* ---------- Theme ---------- */
  function applyTheme() {
    if (!viewer) return;
    viewer.setColors(css('--stage'), css('--grid'), css('--accent'), css('--muted'));
    if (state.build) drawGrid();
  }

  /* ---------- Bauliste ---------- */
  function renderList() {
    const q = $('#search').value.trim().toLowerCase();
    const wrap = $('#buildList');
    wrap.textContent = '';
    let any = false;
    ['farm', 'project', 'building'].forEach((cat) => {
      const items = BUILDS.filter((b) => b.cat === cat && (!state.diff || b.difficulty === state.diff) && (!q || (b.name + ' ' + b.tagline + ' ' + b.description).toLowerCase().includes(q)));
      if (!items.length) return;
      any = true;
      const grp = el('div', 'list-group');
      const head = el('div', 'list-head');
      head.append(el('span', null, CAT[cat]), el('span', null, String(items.length)));
      grp.append(head);
      items.forEach((b) => {
        const btn = el('button', 'item');
        btn.dataset.id = b.id;
        btn.setAttribute('aria-current', state.build && state.build.id === b.id ? 'true' : 'false');
        btn.append(el('span', 'item-name', b.name), el('span', 'item-tag', b.tagline));
        const meta = el('span', 'item-meta');
        meta.append(el('span', 'pill ' + DIFF[b.difficulty], b.difficulty), el('span', null, b.size[0] + '×' + b.size[2] + '×' + b.size[1]), el('span', null, '⏱ ' + (b.minutes < 60 ? b.minutes + ' Min.' : Math.floor(b.minutes / 60) + ' h ' + (b.minutes % 60 ? b.minutes % 60 : ''))));
        btn.append(meta);
        btn.addEventListener('click', () => open(b.id));
        grp.append(btn);
      });
      wrap.append(grp);
    });
    if (!any) wrap.append(el('p', 'empty-note', q ? 'Kein Bau passt zu „' + q + '“.' : 'Kein Bau mit dieser Schwierigkeit.'));
    document.querySelectorAll('#diffSeg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.diff === state.diff)));
  }

  /* ---------- Bau öffnen ---------- */
  function open(id) {
    stopVideo();
    const b = BUILDS.find((x) => x.id === id) || BUILDS[0];
    index(b);
    state.build = b;
    state.sel = null;
    state.mode = 'all';
    state.done = new Set(store.get('done.' + b.id, []));
    const firstOpen = [...Array(b.size[1]).keys()].find((y) => !state.done.has(y));
    state.layer = firstOpen == null ? 0 : firstOpen;
    store.set('last', b.id);
    try { history.replaceState(null, '', '#' + b.id); } catch (e) { /* egal */ }
    viewer.load(b);
    renderHead();
    renderMats();
    renderHow();
    renderList();
    setLayer(state.layer, false);
    closeDrawer();
  }

  function renderHead() {
    const b = state.build;
    $('#topTitle').textContent = b.name;
    $('#eyebrow').textContent = CAT_ONE[b.cat] + ' · ' + b.difficulty;
    $('#title').textContent = b.name;
    $('#desc').textContent = b.description;
    const st = $('#stats');
    st.textContent = '';
    const pairs = [
      ['Grundfläche', b.size[0] + ' × ' + b.size[2]],
      ['Höhe', b.size[1] + ' Ebenen'],
      ['Blöcke', String(placed(b.cells).length)],
      ['Bauzeit', fmtTime(b.minutes)],
      ['Version', b.edition]
    ];
    pairs.forEach(([k, v], i) => {
      const d = el('div', 'stat' + (i === 4 ? ' wide' : ''));
      d.append(el('dt', null, k), el('dd', null, v));
      d.title = k === 'Bauzeit' ? 'Geschätzt: nur Platzieren, mit allem Material im Inventar. Sammeln ist nicht eingerechnet.' : k + ': ' + v;
      st.append(d);
    });
    $('#ytLink').href = ytLink(b);
    $('#community').hidden = !b.community;
    $('#edition').textContent = 'Ausgelegt für ' + b.edition + '. Koordinaten sind relativ: Die Ecke ganz im Nordwesten unten ist X 0 · Y 0 · Z 0 (rot markiert).';
  }

  /* ---------- Ebenen ---------- */
  function setLayer(n, fromUser) {
    if (video && fromUser) stopVideo();
    const b = state.build;
    const H = b.size[1];
    state.layer = Math.max(0, Math.min(H - 1, n));
    if (fromUser && state.mode === 'all') state.mode = 'upto';
    viewer.setLayer(state.layer, state.mode, true);
    if (state.sel && state.sel.y !== state.layer) { state.sel = null; viewer.select(null); }
    $('#hudNum').textContent = state.layer + ' / ' + (H - 1);
    $('#hudSub').textContent = state.done.has(state.layer) ? 'Ebene fertig' : 'Ebene (Y ' + state.layer + ')';
    $('#prevBtn').disabled = state.layer === 0;
    $('#nextBtn').disabled = state.layer === H - 1;
    document.querySelectorAll('#modeSeg button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.mode === state.mode)));
    const cells = b.layers[state.layer];
    $('#layerTitle').innerHTML = '';
    $('#layerTitle').append('Ebene ' + state.layer);
    $('#layerTitle').append(el('small', null, placed(cells).length + ' Blöcke'));
    const note = b.layerNotes && b.layerNotes[state.layer];
    $('#layerNote').hidden = !note;
    $('#layerNote').textContent = note || '';
    const on = state.done.has(state.layer);
    $('#doneBox').checked = on;
    $('#doneLabel').classList.toggle('on', on);
    renderChips();
    renderProgress();
    drawGrid();
    renderInfo();
    renderMatList($('#layerMats'), cells, false);
  }

  function renderChips() {
    const b = state.build, wrap = $('#chips');
    wrap.textContent = '';
    for (let y = 0; y < b.size[1]; y++) {
      const c = el('button', 'chip' + (state.done.has(y) ? ' done' : ''), String(y));
      c.setAttribute('aria-current', String(y === state.layer));
      c.title = 'Ebene ' + y + (state.done.has(y) ? ' (fertig)' : '');
      c.addEventListener('click', () => setLayer(y, true));
      wrap.append(c);
    }
  }

  function renderProgress() {
    const H = state.build.size[1], n = state.done.size;
    $('#progText').textContent = n + ' von ' + H + ' Ebenen gebaut';
    $('#progBar').style.width = (n / H * 100) + '%';
  }

  function toggleDone(force) {
    const y = state.layer;
    const on = force != null ? force : !state.done.has(y);
    if (on) state.done.add(y); else state.done.delete(y);
    store.set('done.' + state.build.id, [...state.done]);
    if (on && y < state.build.size[1] - 1 && force == null) { setLayer(y + 1, true); toast('Ebene ' + y + ' fertig. Weiter mit Ebene ' + (y + 1) + '.'); }
    else setLayer(y, false);
  }

  /* ---------- 2D-Raster ---------- */
  let gridGeom = null;
  function drawGrid() {
    const b = state.build;
    if (!b) return;
    const [W, , Dp] = b.size;
    const cv = $('#layerCanvas');
    const avail = Math.max(200, $('#gridWrap').clientWidth - 18);
    const lab = 24;
    const s = Math.max(14, Math.min(34, Math.floor((avail - lab) / W)));
    const wPx = lab + W * s + 1, hPx = lab + Dp * s + 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = wPx * dpr; cv.height = hPx * dpr;
    cv.style.width = wPx + 'px'; cv.style.height = hPx + 'px';
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.imageSmoothingEnabled = false;
    gridGeom = { lab, s, W, Dp };
    const ink = css('--ink'), muted = css('--muted'), line = css('--line'), bg = css('--bg'), accent = css('--accent');
    g.fillStyle = bg; g.fillRect(0, 0, wPx, hPx);
    const y = state.layer;
    // Ebene darunter als Orientierung
    if (y > 0) {
      g.globalAlpha = 0.22;
      b.layers[y - 1].forEach((c) => { if (!at(b, c.x, y, c.z)) { g.fillStyle = D(c).color; g.fillRect(lab + c.x * s, lab + c.z * s, s, s); } });
      g.globalAlpha = 1;
    }
    b.layers[y].forEach((c) => drawCell(g, b, c, lab + c.x * s, lab + c.z * s, s));
    // Gitter
    g.strokeStyle = line; g.lineWidth = 1;
    g.beginPath();
    for (let x = 0; x <= W; x++) { g.moveTo(lab + x * s + 0.5, lab); g.lineTo(lab + x * s + 0.5, lab + Dp * s); }
    for (let z = 0; z <= Dp; z++) { g.moveTo(lab, lab + z * s + 0.5); g.lineTo(lab + W * s, lab + z * s + 0.5); }
    g.stroke();
    // Fünfer-Linien
    g.strokeStyle = muted; g.globalAlpha = 0.45;
    g.beginPath();
    for (let x = 5; x < W; x += 5) { g.moveTo(lab + x * s + 0.5, lab); g.lineTo(lab + x * s + 0.5, lab + Dp * s); }
    for (let z = 5; z < Dp; z += 5) { g.moveTo(lab, lab + z * s + 0.5); g.lineTo(lab + W * s, lab + z * s + 0.5); }
    g.stroke();
    g.globalAlpha = 1;
    // Beschriftung
    g.fillStyle = muted; g.font = '600 10px "JetBrains Mono", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const step = s < 18 ? 2 : 1;
    for (let x = 0; x < W; x += step) g.fillText(String(x), lab + x * s + s / 2, lab / 2 + 2);
    g.textAlign = 'right';
    for (let z = 0; z < Dp; z += step) g.fillText(String(z), lab - 4, lab + z * s + s / 2);
    // Norden
    g.fillStyle = accent; g.textAlign = 'center'; g.font = '700 11px "Pixelify Sans", monospace';
    g.beginPath(); g.moveTo(8, 4); g.lineTo(13, 12); g.lineTo(3, 12); g.closePath(); g.fill();
    g.fillText('N', 8, 19);
    // Auswahl
    if (state.sel && state.sel.y === y) {
      g.strokeStyle = accent; g.lineWidth = 2.5;
      g.strokeRect(lab + state.sel.x * s + 1.5, lab + state.sel.z * s + 1.5, s - 2, s - 2);
    }
    g.fillStyle = ink;
  }

  function lum(hex) {
    const n = parseInt(hex.slice(1), 16);
    return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  }

  function arrow(g, cx, cy, r, dir, color) {
    g.fillStyle = color; g.strokeStyle = color; g.lineWidth = Math.max(1.5, r * 0.22);
    if (dir === 'u' || dir === 'd') {
      g.beginPath(); g.arc(cx, cy, r * 0.62, 0, Math.PI * 2); g.stroke();
      if (dir === 'u') { g.beginPath(); g.arc(cx, cy, r * 0.2, 0, Math.PI * 2); g.fill(); }
      else { const k = r * 0.38; g.beginPath(); g.moveTo(cx - k, cy - k); g.lineTo(cx + k, cy + k); g.moveTo(cx + k, cy - k); g.lineTo(cx - k, cy + k); g.stroke(); }
      return;
    }
    const v = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[dir];
    if (!v) return;
    const px = -v[1], py = v[0];
    const tip = [cx + v[0] * r * 0.8, cy + v[1] * r * 0.8];
    const base = [cx - v[0] * r * 0.1, cy - v[1] * r * 0.1];
    g.beginPath();
    g.moveTo(tip[0], tip[1]);
    g.lineTo(base[0] + px * r * 0.55, base[1] + py * r * 0.55);
    g.lineTo(base[0] - px * r * 0.55, base[1] - py * r * 0.55);
    g.closePath(); g.fill();
    g.beginPath(); g.moveTo(cx - v[0] * r * 0.75, cy - v[1] * r * 0.75); g.lineTo(base[0], base[1]); g.stroke();
  }

  /* Rechteck an einer Kante der Zelle (für Leiter, Schild, Tür, Knopf) */
  function edgeRect(g, x, y, s, side, depth, color) {
    g.fillStyle = color;
    const d = Math.max(2, s * depth);
    if (side === 'n') g.fillRect(x, y, s, d);
    else if (side === 's') g.fillRect(x, y + s - d, s, d);
    else if (side === 'w') g.fillRect(x, y, d, s);
    else if (side === 'e') g.fillRect(x + s - d, y, d, s);
  }

  function drawCell(g, b, c, x, y, s) {
    const def = D(c), f = c.facing, cx = x + s / 2, cy = y + s / 2, r = s / 2;
    const contrast = lum(def.color) > 0.55 ? '#1b1b1b' : '#ffffff';
    const nbSame = (d) => { const v = MC.DIRS[d]; return at(b, c.x + v[0], c.y, c.z + v[2]); };
    switch (def.shape) {
      case 'liquid':
        g.fillStyle = def.color; g.fillRect(x, y, s, s);
        if (!def.flow && c.id === 'water') { g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + s * 0.2, cy); g.quadraticCurveTo(x + s * 0.35, cy - s * 0.15, cx, cy); g.quadraticCurveTo(x + s * 0.65, cy + s * 0.15, x + s * 0.8, cy); g.stroke(); }
        break;
      case 'cross':
        if (def.auto) { g.setLineDash([3, 2]); g.strokeStyle = def.color; g.lineWidth = 1.5; g.strokeRect(x + 2.5, y + 2.5, s - 5, s - 5); g.setLineDash([]); }
        else { g.fillStyle = 'rgba(120,90,50,0.25)'; g.fillRect(x, y, s, s); }
        g.fillStyle = def.color; g.globalAlpha = def.auto ? 0.5 : 1;
        g.fillRect(cx - s * 0.08, y + s * 0.2, s * 0.16, s * 0.6); g.fillRect(x + s * 0.22, cy - s * 0.05, s * 0.56, s * 0.1);
        g.globalAlpha = 1;
        break;
      case 'dust': {
        g.strokeStyle = def.color; g.lineWidth = Math.max(2, s * 0.18); g.lineCap = 'round';
        const conn = ['n', 's', 'e', 'w'].filter((d) => { const v = MC.DIRS[d]; return [0, -1, 1].some((dy) => { const n = at(b, c.x + v[0], c.y + dy, c.z + v[2]); return n && n.id === 'redstone'; }); });
        let arms = conn.length ? conn : ['n', 's', 'e', 'w'];
        if (arms.length === 1) arms = arms.concat(MC.OPP[arms[0]]);
        g.beginPath();
        arms.forEach((d) => { const v = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[d]; g.moveTo(cx, cy); g.lineTo(cx + v[0] * r, cy + v[1] * r); });
        g.stroke(); g.lineCap = 'butt';
        g.fillStyle = def.color; g.beginPath(); g.arc(cx, cy, s * 0.14, 0, Math.PI * 2); g.fill();
        break;
      }
      case 'rail_cart': {
        g.fillStyle = '#b9b9b9'; g.fillRect(x, y, s, s);
        const along = f === 'e' || f === 'w';
        g.fillStyle = '#6b4f2c';
        for (let i = 0; i < 3; i++) along ? g.fillRect(x + s * (0.15 + i * 0.3), y + s * 0.1, s * 0.1, s * 0.8) : g.fillRect(x + s * 0.1, y + s * (0.15 + i * 0.3), s * 0.8, s * 0.1);
        g.fillStyle = '#4b4b52'; along ? g.fillRect(x + s * 0.1, y + s * 0.25, s * 0.8, s * 0.5) : g.fillRect(x + s * 0.25, y + s * 0.1, s * 0.5, s * 0.8);
        g.fillStyle = '#26262a'; g.fillRect(cx - s * 0.15, cy - s * 0.15, s * 0.3, s * 0.3);
        break;
      }
      case 'carpet':
        g.fillStyle = def.color; g.fillRect(x, y, s, s);
        g.fillStyle = 'rgba(255,255,255,0.18)'; for (let i = 0; i < s; i += 4) g.fillRect(x, y + i, s, 1);
        break;
      case 'rail': {
        g.strokeStyle = def.color; g.lineWidth = Math.max(1.5, s * 0.1);
        const along = f === 'e' || f === 'w';
        g.beginPath();
        if (along) { g.moveTo(x, y + s * 0.28); g.lineTo(x + s, y + s * 0.28); g.moveTo(x, y + s * 0.72); g.lineTo(x + s, y + s * 0.72); }
        else { g.moveTo(x + s * 0.28, y); g.lineTo(x + s * 0.28, y + s); g.moveTo(x + s * 0.72, y); g.lineTo(x + s * 0.72, y + s); }
        g.stroke();
        break;
      }
      case 'bell':
        g.fillStyle = def.color; g.beginPath(); g.arc(cx, cy, s * 0.28, 0, Math.PI * 2); g.fill();
        break;
      case 'anvil':
        g.fillStyle = def.color;
        if (f === 'e' || f === 'w') g.fillRect(x + s * 0.2, y, s * 0.6, s); else g.fillRect(x, y + s * 0.2, s, s * 0.6);
        break;
      case 'gate': {
        g.fillStyle = def.color;
        const ax = f === 'n' || f === 's';
        if (ax) { g.fillRect(x, cy - s * 0.08, s, s * 0.16); g.fillRect(x, cy - s * 0.16, s * 0.14, s * 0.32); g.fillRect(x + s * 0.86, cy - s * 0.16, s * 0.14, s * 0.32); }
        else { g.fillRect(cx - s * 0.08, y, s * 0.16, s); g.fillRect(cx - s * 0.16, y, s * 0.32, s * 0.14); g.fillRect(cx - s * 0.16, y + s * 0.86, s * 0.32, s * 0.14); }
        break;
      }
      case 'trapdoor':
        edgeRect(g, x, y, s, MC.OPP[f], 0.22, def.color);
        g.strokeStyle = def.color; g.lineWidth = 1; g.setLineDash([2, 2]); g.strokeRect(x + 2.5, y + 2.5, s - 5, s - 5); g.setLineDash([]);
        break;
      case 'cauldron':
        g.fillStyle = def.color; g.fillRect(x + 1, y + 1, s - 2, s - 2);
        g.fillStyle = '#1b1b1d'; g.fillRect(x + s * 0.22, y + s * 0.22, s * 0.56, s * 0.56);
        break;
      case 'bamboo':
        if (def.auto) { g.setLineDash([3, 2]); g.strokeStyle = def.color; g.lineWidth = 1.5; g.strokeRect(x + 2.5, y + 2.5, s - 5, s - 5); g.setLineDash([]); }
        g.globalAlpha = def.auto ? 0.5 : 1; g.fillStyle = def.color; g.beginPath(); g.arc(cx, cy, s * 0.18, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
        break;
      case 'portal':
        g.fillStyle = def.color; g.globalAlpha = 0.75;
        if (f === 'e' || f === 'w') g.fillRect(x, cy - s * 0.15, s, s * 0.3); else g.fillRect(cx - s * 0.15, y, s * 0.3, s);
        g.globalAlpha = 1;
        break;
      case 'beacon':
        g.fillStyle = '#bfeff3'; g.fillRect(x, y, s, s);
        g.fillStyle = def.color; g.fillRect(x + s * 0.25, y + s * 0.25, s * 0.5, s * 0.5);
        break;
      case 'entity':
        g.fillStyle = def.color; g.beginPath(); g.arc(cx, cy, r * 0.78, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#1b1b1b'; g.lineWidth = 1; g.stroke();
        g.fillStyle = contrast; g.font = '700 ' + Math.round(s * 0.5) + 'px "Atkinson Hyperlegible", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(def.name[0], cx, cy + 1);
        break;
      case 'ladder': edgeRect(g, x, y, s, MC.OPP[f], 0.22, def.color); break;
      case 'wall_sign': edgeRect(g, x, y, s, MC.OPP[f], 0.2, def.color); break;
      case 'button': g.fillStyle = def.color; { const d = MC.OPP[f], k = s * 0.22; const o = { n: [cx - k, y, k * 2, k], s: [cx - k, y + s - k, k * 2, k], w: [x, cy - k, k, k * 2], e: [x + s - k, cy - k, k, k * 2] }[d]; g.fillRect(o[0], o[1], o[2], o[3]); } break;
      case 'door':
        edgeRect(g, x, y, s, MC.OPP[f], 0.24, def.color);
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, y, s, s);
        break;
      case 'pane':
      case 'wall':
      case 'fence': {
        g.fillStyle = def.color;
        const t = def.shape === 'pane' ? 0.16 : 0.22;
        const conn = ['n', 's', 'e', 'w'].filter((d) => { const n = nbSame(d); return n && (D(n).shape === 'cube' || D(n).shape === def.shape || D(n).shape === 'door' || D(n).shape === 'gate'); });
        const arms = conn.length ? conn : (def.shape === 'pane' ? ['e', 'w'] : []);
        arms.forEach((d) => {
          if (d === 'n') g.fillRect(cx - s * t / 2, y, s * t, s / 2);
          if (d === 's') g.fillRect(cx - s * t / 2, cy, s * t, s / 2);
          if (d === 'w') g.fillRect(x, cy - s * t / 2, s / 2, s * t);
          if (d === 'e') g.fillRect(cx, cy - s * t / 2, s / 2, s * t);
        });
        const p = def.shape === 'pane' ? 0.2 : 0.32;
        g.fillRect(cx - s * p / 2, cy - s * p / 2, s * p, s * p);
        if (def.shape === 'pane') { g.strokeStyle = '#6a8fa0'; g.lineWidth = 1; g.strokeRect(cx - s * p / 2, cy - s * p / 2, s * p, s * p); }
        break;
      }
      case 'lantern':
        g.fillStyle = '#2f2f33'; g.fillRect(cx - s * 0.22, cy - s * 0.22, s * 0.44, s * 0.44);
        g.fillStyle = def.color; g.fillRect(cx - s * 0.14, cy - s * 0.14, s * 0.28, s * 0.28);
        break;
      case 'bed': {
        g.fillStyle = def.color; g.fillRect(x + 1, y + 1, s - 2, s - 2);
        if (c.part === 'head') { g.fillStyle = '#f1eee6'; const k = s * 0.32; const o = { n: [x + 2, y + 2, s - 4, k], s: [x + 2, y + s - 2 - k, s - 4, k], w: [x + 2, y + 2, k, s - 4], e: [x + s - 2 - k, y + 2, k, s - 4] }[f]; g.fillRect(o[0], o[1], o[2], o[3]); }
        break;
      }
      case 'slab': {
        g.fillStyle = def.color; g.fillRect(x, y, s, s);
        g.fillStyle = 'rgba(0,0,0,0.3)';
        if (c.half === 'top') g.fillRect(x, y, s, s / 2); else g.fillRect(x, y + s / 2, s, s / 2);
        g.fillStyle = contrast; g.font = '700 ' + Math.round(s * 0.42) + 'px "Atkinson Hyperlegible", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(c.half === 'top' ? '▀' : '▄', cx, cy + 1);
        break;
      }
      case 'stairs': {
        g.fillStyle = def.color; g.fillRect(x, y, s, s);
        g.fillStyle = 'rgba(0,0,0,0.28)';
        const low = MC.OPP[f];
        const o = { n: [x, y, s, s / 2], s: [x, cy, s, s / 2], w: [x, y, s / 2, s], e: [cx, y, s / 2, s] }[low];
        g.fillRect(o[0], o[1], o[2], o[3]);
        arrow(g, cx, cy, r * 0.8, f, contrast);
        if (c.half === 'top') { g.fillStyle = contrast; g.fillRect(x + 2, y + 2, s * 0.2, s * 0.2); }
        break;
      }
      case 'hopper':
        g.fillStyle = def.color; g.fillRect(x, y, s, s);
        g.fillStyle = '#1e1e21'; g.fillRect(x + s * 0.18, y + s * 0.18, s * 0.64, s * 0.64);
        arrow(g, cx, cy, r * 0.75, f || 'd', '#f2f2f2');
        break;
      default: {
        if (def.ghost || def.auto) {
          g.setLineDash([3, 2]); g.strokeStyle = def.color; g.lineWidth = 2; g.strokeRect(x + 2.5, y + 2.5, s - 5, s - 5); g.setLineDash([]);
          g.globalAlpha = 0.25; g.fillStyle = def.color; g.fillRect(x, y, s, s); g.globalAlpha = 1;
          break;
        }
        g.fillStyle = def.color; g.globalAlpha = def.transparent ? 0.5 : 1; g.fillRect(x, y, s, s); g.globalAlpha = 1;
        if (def.transparent) { g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + s * 0.25, y + s * 0.6); g.lineTo(x + s * 0.6, y + s * 0.25); g.stroke(); }
        if (f && (def.shape === 'piston' || def.shape === 'chest' || (def.tex && def.tex.front))) arrow(g, cx, cy, r * 0.8, f, contrast);
        if (def.shape === 'piston') { g.fillStyle = '#c9a76a'; const k = s * 0.18; const o = { n: [x, y, s, k], s: [x, y + s - k, s, k], w: [x, y, k, s], e: [x + s - k, y, k, s] }[f]; if (o) g.fillRect(o[0], o[1], o[2], o[3]); }
      }
    }
  }

  function gridPick(ev) {
    if (!gridGeom) return;
    const r = $('#layerCanvas').getBoundingClientRect();
    const px = ev.clientX - r.left - gridGeom.lab, pz = ev.clientY - r.top - gridGeom.lab;
    const x = Math.floor(px / gridGeom.s), z = Math.floor(pz / gridGeom.s);
    if (x < 0 || z < 0 || x >= gridGeom.W || z >= gridGeom.Dp) return;
    select(at(state.build, x, state.layer, z) || null);
  }

  /* ---------- Auswahl ---------- */
  function select(c) {
    state.sel = c;
    viewer.select(c);
    if (c && c.y !== state.layer) { state.layer = c.y; setLayer(c.y, false); return; }
    drawGrid();
    renderInfo();
  }

  function renderInfo() {
    const wrap = $('#info');
    wrap.textContent = '';
    const c = state.sel;
    if (!c) {
      wrap.append(el('p', 'info-empty', 'Tippe auf einen Block im Raster oder in der 3D-Ansicht, um zu sehen, wie du ihn platzierst.'));
      return;
    }
    const def = D(c);
    const box = el('div', 'info');
    const sw = swatchCanvas(c.id, 34); sw.className = 'sw';
    box.append(sw, el('div', 'info-name', def.name), el('div', 'info-pos', 'X ' + c.x + ' · Y ' + c.y + ' · Z ' + c.z));
    const tags = el('div', 'info-tags');
    if (c.facing && def.hint) tags.append(el('span', 'pill mid', 'Richtung: ' + MC.DIR_NAME[c.facing]));
    if (c.half) tags.append(el('span', 'pill mid', c.half === 'top' ? 'obere Hälfte' : 'untere Hälfte'));
    if (def.auto) tags.append(el('span', 'pill easy', 'entsteht von selbst'));
    if (def.entity) tags.append(el('span', 'pill hard', 'Kreatur'));
    if (tags.children.length) box.append(tags);
    const hint = MC.hintFor(c);
    if (hint) box.append(el('div', 'info-hint', hint));
    wrap.append(box);
  }

  /* ---------- Material ---------- */
  function collect(cells) {
    const items = new Map(), mobs = new Map();
    cells.forEach((c) => {
      const def = D(c);
      MC.itemsFor(c).forEach(([name, n, stack]) => {
        const target = def.entity ? mobs : items;
        const e = target.get(name) || { name, n: 0, stack, id: c.id };
        e.n += n;
        target.set(name, e);
      });
    });
    const sort = (m) => [...m.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, 'de'));
    return { items: sort(items), mobs: sort(mobs) };
  }

  function matRows(target, list) {
    list.forEach((e) => {
      const row = el('div', 'mat-row');
      const sw = swatchCanvas(e.id, 22); sw.className = 'mat-sw';
      const cnt = el('div', 'mat-count', String(e.n));
      const st = stackText(e.n, e.stack);
      if (st) cnt.append(el('small', null, st));
      row.append(sw, el('div', 'mat-name', e.name), cnt);
      target.append(row);
    });
  }

  function renderMatList(target, cells) {
    target.textContent = '';
    const { items, mobs } = collect(cells);
    if (!items.length && !mobs.length) { target.append(el('p', 'info-empty', 'Auf dieser Ebene wird nichts platziert. Hier entsteht etwas von selbst.')); return; }
    matRows(target, items.concat(mobs));
  }

  function renderMats() {
    const { items, mobs } = collect(state.build.cells);
    const all = $('#allMats'); all.textContent = '';
    matRows(all, items);
    $('#mobsWrap').hidden = !mobs.length;
    const mm = $('#mobMats'); mm.textContent = '';
    matRows(mm, mobs);
  }

  function shoppingText() {
    const b = state.build, { items, mobs } = collect(b.cells);
    const lines = ['Blockplan: ' + b.name, ''];
    items.forEach((e) => { const st = stackText(e.n, e.stack); lines.push('- ' + e.n + '× ' + e.name + (st ? ' (' + st + ')' : '')); });
    if (mobs.length) { lines.push('', 'Kreaturen:'); mobs.forEach((e) => lines.push('- ' + e.n + '× ' + e.name)); }
    return lines.join('\n');
  }

  function copyList() {
    const text = shoppingText();
    const done = () => toast('Einkaufsliste kopiert');
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      toast(ok ? 'Einkaufsliste kopiert' : 'Kopieren nicht möglich. Liste bitte abschreiben.');
    };
    try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
  }

  function copyText(text, okMsg) {
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      toast(ok ? okMsg : 'Kopieren nicht möglich.');
    };
    try { navigator.clipboard.writeText(text).then(() => toast(okMsg), fallback); } catch (e) { fallback(); }
  }

  function copyCommands(layerOnly) {
    const b = state.build;
    const cells = layerOnly ? b.layers[state.layer] : b.cells;
    const lines = MC.javaCommands(cells);
    const head = ['# Blockplan: ' + b.name + (layerOnly ? ' – Ebene ' + state.layer : ''), '# Java Edition, Kreativmodus mit Cheats. Der Bau entsteht 2 Blöcke östlich von dir.'];
    copyText(head.concat(lines).join('\n'), lines.length + ' Befehle kopiert');
  }

  /* ---------- Funktionsweise ---------- */
  function renderHow() {
    const b = state.build;
    const how = $('#howList'), tips = $('#tipList');
    how.textContent = ''; tips.textContent = '';
    (b.how || []).forEach((t) => how.append(el('li', null, t)));
    (b.tips || []).forEach((t) => tips.append(el('li', null, t)));
    $('#howWrap').hidden = !(b.how && b.how.length);
    $('#tipWrap').hidden = !(b.tips && b.tips.length);
    const leg = $('#legend'); leg.textContent = '';
    const sample = [
      [{ id: 'piston', facing: 'e', x: 0, y: 0, z: 0 }, 'Pfeil: Blickrichtung / Ausgang'],
      [{ id: 'hopper', facing: 'd', x: 0, y: 0, z: 0 }, '⊗ nach unten, ⊙ nach oben'],
      [{ id: 'oak_stairs', facing: 'n', x: 0, y: 0, z: 0 }, 'Treppe: dunkel = niedrige Seite'],
      [{ id: 'sugar_cane_auto', x: 0, y: 0, z: 0 }, 'Gestrichelt: wächst von selbst'],
      [{ id: 'water', x: 0, y: 0, z: 0 }, 'Wasserquelle (Eimer)'],
      [{ id: 'water_flow', x: 0, y: 0, z: 0 }, 'Fließt von selbst']
    ];
    const fake = { lookup: new Map() };
    sample.forEach(([c, label]) => {
      const cv = document.createElement('canvas');
      const s = 22, dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = cv.height = s * dpr; cv.style.width = cv.style.height = s + 'px';
      const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawCell(g, fake, c, 0, 0, s);
      const d = el('div'); d.append(cv, el('span', null, label));
      leg.append(d);
    });
  }

  /* ---------- Bau-Video ---------- */
  let video = null;
  const ICON = {
    pause: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7 5l12 7-12 7z"/></svg>',
    again: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5"/></svg>'
  };
  const setPlayIcon = (k, label) => { $('#vPlay').innerHTML = ICON[k]; $('#vPlay').setAttribute('aria-label', label); };
  function startVideo() {
    const b = state.build, total = b.cells.length;
    const seconds = Math.max(15, Math.min(80, total * 0.06));
    video = { n: 0, total, rate: total / seconds, speed: 1, playing: true, last: 0 };
    $('#videoBar').hidden = false; $('#videoCap').hidden = false; $('.hud').hidden = true;
    $('#vSpeed').textContent = '1×';
    setPlayIcon('pause', 'Pause');
    $('#videoBtn').setAttribute('aria-pressed', 'true');
    $('.stage').classList.add('playing');
    viewer.select(null);
    viewer.preset('iso');
    viewer.setAutoRotate(true);
    viewer.reveal(0);
    requestAnimationFrame(tickVideo);
  }
  function stopVideo() {
    if (!video) return;
    video = null;
    $('#videoBar').hidden = true; $('#videoCap').hidden = true; $('.hud').hidden = false;
    $('#videoBtn').setAttribute('aria-pressed', 'false');
    $('.stage').classList.remove('playing');
    viewer.setAutoRotate(state.rotate);
    viewer.setLayer(state.layer, state.mode, true);
    viewer.select(state.sel);
  }
  function toggleVideoPlay() {
    if (!video) return;
    if (video.n >= video.total) video.n = 0;
    video.playing = !video.playing;
    setPlayIcon(video.playing ? 'pause' : 'play', video.playing ? 'Pause' : 'Abspielen');
    viewer.setAutoRotate(video.playing);
  }
  function tickVideo(ts) {
    if (!video) return;
    const dt = video.last ? Math.min(0.1, (ts - video.last) / 1000) : 0;
    video.last = ts;
    if (video.playing) video.n = Math.min(video.total, video.n + dt * video.rate * video.speed);
    const n = Math.floor(video.n);
    viewer.reveal(n);
    const b = state.build, c = b.cells[Math.max(0, n - 1)];
    if (c) {
      viewer.focusY(c.y + 1);
      const note = (b.layerNotes && b.layerNotes[c.y]) || (b.layers[c.y].length + ' Blöcke auf dieser Ebene');
      const d = D(c);
      $('#vCapTitle').textContent = 'Ebene ' + c.y + ' von ' + (b.size[1] - 1);
      $('#vCapNote').textContent = note;
      $('#vCapBlock').textContent = 'Jetzt: ' + d.name + (c.facing && d.hint ? ' → ' + MC.DIR_NAME[c.facing] : '');
    }
    $('#vProg').style.width = (video.n / video.total * 100) + '%';
    if (video.n >= video.total && video.playing) {
      video.playing = false;
      viewer.setAutoRotate(false);
      setPlayIcon('again', 'Nochmal abspielen');
      $('#vCapTitle').textContent = 'Fertig!';
      $('#vCapNote').textContent = 'So sieht der fertige Bau aus. Schließe das Video und baue Ebene für Ebene nach.';
      $('#vCapBlock').textContent = '';
    }
    requestAnimationFrame(tickVideo);
  }

  /* ---------- Tabs, Drawer, Dialog ---------- */
  function setTab(t) {
    state.tab = t;
    document.querySelectorAll('.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
    ['layer', 'mats', 'how'].forEach((k) => { $('#tab-' + k).hidden = k !== t; });
    if (t === 'layer') drawGrid();
  }
  function openDrawer() { $('#sidebar').classList.add('open'); $('#backdrop').hidden = false; }
  function closeDrawer() { $('#sidebar').classList.remove('open'); if ($('#keysDialog').hidden) $('#backdrop').hidden = true; }
  function openKeys() { $('#keysDialog').hidden = false; $('#backdrop').hidden = false; $('#keysClose').focus(); }
  function closeKeys() { $('#keysDialog').hidden = true; if (!$('#sidebar').classList.contains('open')) $('#backdrop').hidden = true; }

  /* ---------- Bildschirm wach halten ---------- */
  let lock = null, wantLock = false;
  async function requestLock() {
    try {
      lock = await navigator.wakeLock.request('screen');
      lock.addEventListener('release', () => { lock = null; });
      return true;
    } catch (e) { return false; }
  }
  async function toggleWake() {
    wantLock = !wantLock;
    if (wantLock) {
      const ok = 'wakeLock' in navigator && await requestLock();
      if (!ok) { wantLock = false; toast('Dieses Gerät erlaubt das nicht. Stell die Bildschirmsperre in den Einstellungen länger.'); }
      else toast('Bildschirm bleibt an');
    } else {
      try { if (lock) await lock.release(); } catch (e) { /* egal */ }
      lock = null;
    }
    $('#wakeBtn').setAttribute('aria-pressed', String(wantLock));
  }
  document.addEventListener('visibilitychange', () => { if (wantLock && !lock && document.visibilityState === 'visible') requestLock(); });

  /* ---------- Ereignisse ---------- */
  function bind() {
    $('#search').addEventListener('input', renderList);
    $('#prevBtn').addEventListener('click', () => setLayer(state.layer - 1, true));
    $('#nextBtn').addEventListener('click', () => setLayer(state.layer + 1, true));
    $('#doneBox').addEventListener('change', (e) => toggleDone(e.target.checked));
    $('#resetBtn').addEventListener('click', () => { state.done.clear(); store.set('done.' + state.build.id, []); setLayer(0, false); toast('Fortschritt zurückgesetzt'); });
    document.querySelectorAll('#modeSeg button').forEach((b) => b.addEventListener('click', () => { state.mode = b.dataset.mode; setLayer(state.layer, false); }));
    document.querySelectorAll('#camSeg button[data-cam]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.cam === 'rotate') { state.rotate = !state.rotate; viewer.setAutoRotate(state.rotate); b.setAttribute('aria-pressed', String(state.rotate)); }
      else viewer.preset(b.dataset.cam);
    }));
    document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));
    $('#layerCanvas').addEventListener('click', gridPick);
    $('#copyBtn').addEventListener('click', copyList);
    $('#videoBtn').addEventListener('click', () => (video ? stopVideo() : startVideo()));
    $('#vPlay').addEventListener('click', toggleVideoPlay);
    $('#vClose').addEventListener('click', stopVideo);
    $('#vSpeed').addEventListener('click', () => { if (!video) return; video.speed = video.speed >= 4 ? 1 : video.speed * 2; $('#vSpeed').textContent = video.speed + '×'; });
    $('#vTrack').addEventListener('click', (e) => { if (!video) return; const r = e.currentTarget.getBoundingClientRect(); video.n = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * video.total; });
    $('#howVideoBtn').addEventListener('click', startVideo);
    $('#cmdBtn').addEventListener('click', () => copyCommands(false));
    $('#cmdLayerBtn').addEventListener('click', () => copyCommands(true));
    document.querySelectorAll('#diffSeg button').forEach((b) => b.addEventListener('click', () => { state.diff = state.diff === b.dataset.diff ? '' : b.dataset.diff; renderList(); }));
    $('#menuBtn').addEventListener('click', openDrawer);
    $('#backdrop').addEventListener('click', () => { closeDrawer(); closeKeys(); });
    $('#keysBtn').addEventListener('click', openKeys);
    $('#keysClose').addEventListener('click', closeKeys);
    $('#wakeBtn').addEventListener('click', toggleWake);
    new ResizeObserver(() => { if (state.tab === 'layer') drawGrid(); }).observe($('#gridWrap'));
    window.addEventListener('keydown', (e) => {
      const tg = e.target && e.target.matches ? e.target : null;
      if (tg && tg.matches('input[type="search"], textarea')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      const H = state.build.size[1];
      const map = {
        ArrowRight: () => setLayer(state.layer + 1, true), PageUp: () => setLayer(state.layer + 1, true), ArrowUp: () => setLayer(state.layer + 1, true),
        ArrowLeft: () => setLayer(state.layer - 1, true), PageDown: () => setLayer(state.layer - 1, true), ArrowDown: () => setLayer(state.layer - 1, true),
        Home: () => setLayer(0, true), End: () => setLayer(H - 1, true),
        ' ': () => toggleDone(),
        a: () => { state.mode = 'all'; setLayer(state.layer, false); },
        b: () => { state.mode = 'upto'; setLayer(state.layer, false); },
        n: () => { state.mode = 'only'; setLayer(state.layer, false); },
        i: () => viewer.preset('iso'), t: () => viewer.preset('top'), f: () => viewer.preset('front'),
        r: () => { state.rotate = !state.rotate; viewer.setAutoRotate(state.rotate); $('#rotBtn').setAttribute('aria-pressed', String(state.rotate)); },
        '?': openKeys,
        v: () => (video ? stopVideo() : startVideo()),
        Escape: () => { if (video) stopVideo(); else if (!$('#keysDialog').hidden) closeKeys(); else if ($('#sidebar').classList.contains('open')) closeDrawer(); else select(null); }
      };
      const fn = map[k] || map[k.toLowerCase()];
      if (fn) {
        if (tg && tg.matches('input[type="checkbox"], button') && k === ' ') return;
        e.preventDefault();
        fn();
      }
    });
  }

  function init() {
    viewer = new BlockViewer($('#viewport'), { onPick: (c) => select(c) });
    applyTheme();
    try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme); } catch (e) { /* alt */ }
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    bind();
    const hashId = (location.hash || '').slice(1);
    const last = store.get('last', null);
    const id = BUILDS.some((b) => b.id === hashId) ? hashId : BUILDS.some((b) => b.id === last) ? last : BUILDS[0].id;
    open(id);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { drawGrid(); renderHow(); });
  }

  if (!window.THREE || !THREE.OrbitControls) {
    document.getElementById('viewport').innerHTML = '<p style="padding:24px">Die 3D-Bibliothek konnte nicht geladen werden. Prüfe die Internetverbindung und lade die Seite neu.</p>';
    return;
  }
  init();
})();
