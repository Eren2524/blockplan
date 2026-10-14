/* Blockplan – Oberfläche: Bauliste, Ebenen, 2D-Raster, Material, Ausrichtung, Merkliste,
   Export/Import, Teilen, Sprachen und Unterstützer-Bereich. */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const D = (c) => MC.BLOCKS[c.id] || MC.BLOCKS.stone;
  const t = (k, v) => I18N.t(k, v);
  const bt = (b, f) => I18N.build(b, f);
  const bname = (id) => { const d = MC.BLOCKS[id]; return d.generic ? d.name : I18N.block(id, d.name); };
  const CFG = window.BLOCKPLAN_CONFIG || { support: { tiers: [] }, supporterCodes: [] };
  const store = {
    get(k, d) { try { const v = localStorage.getItem('blockplan.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('blockplan.' + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const CATS = ['mine', 'secret', 'mega', 'farm', 'project', 'building'];
  const DIFF = { 'Leicht': 'easy', 'Mittel': 'mid', 'Fortgeschritten': 'hard' };
  const CW = ['n', 'e', 's', 'w'];

  const state = { diff: '', favOnly: false, build: null, base: null, layer: 0, mode: 'all', sel: null, tab: 'layer', rotate: false, done: new Set(), rot: 0, mirror: false };
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
    const tt = $('#toast');
    tt.textContent = msg;
    tt.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { tt.hidden = true; }, 2600);
  }

  function fmtTime(min) {
    if (min < 60) return t('time.min', { m: min });
    const h = Math.floor(min / 60), m = min % 60;
    return m ? t('time.hm', { h, m }) : t('time.h', { h });
  }
  const shortTime = (min) => (min < 60 ? t('time.short', { m: min }) : t('time.shortH', { h: Math.floor(min / 60), m: min % 60 ? min % 60 : '' }).trim());
  const ytLink = (b) => b.youtube || 'https://www.youtube.com/results?search_query=' + encodeURIComponent(t('how.ytQuery', { name: bt(b, 'name') }));
  const diffLabel = (d) => (d === 'Fortgeschritten' ? t('diff.FortgeschrittenLong') : t('diff.' + d));
  const edLabel = (e) => (I18N.has('ed.' + e) ? t('ed.' + e) : e);
  const fileName = (b, ext) => (b.id.replace(/[^\w-]+/g, '_') || 'bau') + (state.rot || state.mirror ? '_' + (state.rot * 90) + (state.mirror ? 'm' : '') : '') + ext;

  function copyText(text, okMsg) {
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      toast(ok ? okMsg : t('mats.copyFail'));
    };
    try { navigator.clipboard.writeText(text).then(() => toast(okMsg), fallback); } catch (e) { fallback(); }
  }

  /* ---------- Statische Texte übersetzen ---------- */
  function applyStatic() {
    document.querySelectorAll('[data-i18n]').forEach((e) => { e.textContent = t(e.dataset.i18n); });
    document.querySelectorAll('[data-i18n-title]').forEach((e) => { e.title = t(e.dataset.i18nTitle); });
    document.querySelectorAll('[data-i18n-aria]').forEach((e) => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
    document.querySelectorAll('[data-i18n-ph]').forEach((e) => { e.placeholder = t(e.dataset.i18nPh); });
    const md = document.querySelector('meta[name="description"]');
    if (md) md.content = t('meta.description');
  }

  /* ---------- Theme ---------- */
  function applyTheme() {
    if (!viewer) return;
    viewer.setColors(css('--stage'), css('--grid'), css('--accent'), css('--muted'));
    if (state.build) drawGrid();
  }

  /* ---------- Eigene Bauten ---------- */
  function packCells(cells) {
    const pal = [], pi = new Map(), out = [];
    cells.forEach((c) => {
      const spec = [c.id, c.facing, c.half, c.part].filter(Boolean).join(':');
      if (!pi.has(spec)) { pi.set(spec, pal.length); pal.push(spec); }
      out.push(c.x, c.y, c.z, pi.get(spec));
    });
    return { pal, data: out.join(',') };
  }
  function unpackCells(pal, data) {
    pal.forEach((spec) => { const id = spec.split(':')[0]; if (id.startsWith('x.') && !MC.BLOCKS[id]) MC.generic(id.slice(2)); });
    const parsed = pal.map((s) => MC.parse(s));
    const nums = data ? data.split(',').map(Number) : [];
    const cells = [];
    for (let i = 0; i + 3 < nums.length; i += 4) {
      const p = parsed[nums[i + 3]];
      if (!p || !MC.BLOCKS[p.id]) continue;
      cells.push(Object.assign({}, p, { x: nums[i], y: nums[i + 1], z: nums[i + 2] }));
    }
    return cells;
  }
  function makeCustom(o) {
    const cells = unpackCells(o.pal, o.data);
    let W = 0, H = 0, Dp = 0;
    cells.forEach((c) => { W = Math.max(W, c.x + 1); H = Math.max(H, c.y + 1); Dp = Math.max(Dp, c.z + 1); });
    cells.sort((a, b) => a.y - b.y || a.z - b.z || a.x - b.x);
    const b = {
      id: o.id, cat: 'mine', custom: true, name: o.name, file: o.file || '', shared: !!o.shared,
      tagline: '', description: '', difficulty: '', edition: 'Java', how: [], tips: [], layerNotes: {},
      cells, size: [W || 1, H || 1, Dp || 1]
    };
    b.minutes = BP.estimateMinutes(b);
    b.tagline = t('imp.tagline', { n: placed(cells).length });
    return b;
  }
  const customList = () => store.get('custom', []);
  function saveCustom(o) {
    const list = customList().filter((x) => x.id !== o.id);
    list.push(o);
    return store.set('custom', list);
  }
  function loadCustomBuilds() {
    customList().forEach((o) => { try { if (!BUILDS.some((b) => b.id === o.id)) BUILDS.push(makeCustom(o)); } catch (e) { /* kaputter Eintrag */ } });
  }
  function refreshCustomText() { BUILDS.forEach((b) => { if (b.custom) { b.tagline = t('imp.tagline', { n: placed(b.cells).length }); b.description = b.shared ? '' : t('imp.desc', { file: b.file }); } }); }

  /* ---------- Ausrichtung (drehen, spiegeln) ---------- */
  function orient(base, rot, mirror) {
    if (!rot && !mirror) return base;
    let [W, H, Dp] = base.size;
    let cells = base.cells.map((c) => Object.assign({}, c));
    if (mirror) cells.forEach((c) => { c.x = W - 1 - c.x; if (c.facing === 'e') c.facing = 'w'; else if (c.facing === 'w') c.facing = 'e'; });
    for (let r = 0; r < rot; r++) {
      cells.forEach((c) => {
        const x = c.x;
        c.x = Dp - 1 - c.z; c.z = x;
        const i = CW.indexOf(c.facing);
        if (i >= 0) c.facing = CW[(i + 1) % 4];
      });
      [W, Dp] = [Dp, W];
    }
    cells.sort((a, b) => a.y - b.y || a.z - b.z || a.x - b.x);
    return Object.assign(Object.create(base), { cells, size: [W, H, Dp], layers: null, lookup: null });
  }
  function applyOrient(keepCam) {
    const b = orient(state.base, state.rot, state.mirror);
    index(b);
    state.build = b;
    state.sel = null;
    store.set('orient.' + b.id, [state.rot, state.mirror]);
    viewer.load(b);
    if (keepCam) viewer.preset('iso');
    renderOrient();
    setLayer(state.layer, false);
  }
  function renderOrient() {
    const on = state.rot || state.mirror;
    $('#orientReset').hidden = !on;
    $('#mirrorBtn').setAttribute('aria-pressed', String(state.mirror));
    $('#rotBtn90').setAttribute('aria-pressed', String(!!state.rot));
    $('#rotBtn90').textContent = state.rot ? '↻ ' + state.rot * 90 + '°' : t('orient.rot');
    const note = $('#orientNote');
    note.hidden = !on;
    if (on) {
      const how = [state.rot ? t('orient.rotated', { deg: state.rot * 90 }) : '', state.mirror ? t('orient.mirrored') : ''].filter(Boolean).join(t('orient.and'));
      note.textContent = t('orient.note', { how, dir: I18N.dir(CW[state.rot]) });
    }
  }

  /* ---------- Bauliste ---------- */
  const favs = () => store.get('favs', []);
  function renderList() {
    const q = $('#search').value.trim().toLowerCase();
    const wrap = $('#buildList');
    wrap.textContent = '';
    let any = false;
    const fv = new Set(favs());
    CATS.forEach((cat) => {
      const items = BUILDS.filter((b) => b.cat === cat && (!state.diff || b.difficulty === state.diff) && (!state.favOnly || fv.has(b.id)) &&
        (!q || [bt(b, 'name'), bt(b, 'tagline'), bt(b, 'description'), b.name].join(' ').toLowerCase().includes(q)));
      if (!items.length) return;
      any = true;
      const grp = el('div', 'list-group');
      const head = el('div', 'list-head');
      head.append(el('span', null, t('cat.' + cat)), el('span', null, String(items.length)));
      grp.append(head);
      items.forEach((b) => {
        const btn = el('button', 'item');
        btn.dataset.id = b.id;
        btn.setAttribute('aria-current', state.build && state.build.id === b.id ? 'true' : 'false');
        const nm = el('span', 'item-name', bt(b, 'name'));
        if (fv.has(b.id)) nm.append(el('span', 'item-star', ' ★'));
        btn.append(nm, el('span', 'item-tag', bt(b, 'tagline')));
        const meta = el('span', 'item-meta');
        if (b.difficulty) meta.append(el('span', 'pill ' + DIFF[b.difficulty], diffLabel(b.difficulty)));
        meta.append(el('span', null, b.size[0] + '×' + b.size[2] + '×' + b.size[1]), el('span', null, '⏱ ' + shortTime(b.minutes)));
        btn.append(meta);
        btn.addEventListener('click', () => open(b.id));
        grp.append(btn);
      });
      wrap.append(grp);
    });
    if (!any) wrap.append(el('p', 'empty-note', state.favOnly && !q ? t('side.noneFav') : q ? t('side.none', { q }) : t('side.noneDiff')));
    document.querySelectorAll('#diffSeg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.diff === state.diff)));
    $('#favOnly').setAttribute('aria-pressed', String(state.favOnly));
    $('#favCount').textContent = fv.size ? String(fv.size) : '';
  }

  /* ---------- Bau öffnen ---------- */
  function open(id) {
    stopVideo();
    const base = BUILDS.find((x) => x.id === id) || BUILDS.find((x) => !x.custom) || BUILDS[0];
    index(base);
    state.base = base;
    const o = store.get('orient.' + base.id, [0, false]);
    state.rot = o[0] || 0; state.mirror = !!o[1];
    state.mode = 'all';
    state.done = new Set(store.get('done.' + base.id, []));
    const firstOpen = [...Array(base.size[1]).keys()].find((y) => !state.done.has(y));
    state.layer = firstOpen == null ? 0 : firstOpen;
    store.set('last', base.id);
    if (!base.shared) { try { history.replaceState(null, '', '#' + base.id); } catch (e) { /* egal */ } }
    const b = orient(base, state.rot, state.mirror);
    index(b);
    state.build = b;
    state.sel = null;
    viewer.load(b);
    renderHead();
    renderMats();
    renderHow();
    renderList();
    renderOrient();
    setLayer(state.layer, false);
    closeDrawer();
  }

  function renderHead() {
    const b = state.build;
    $('#topTitle').textContent = bt(b, 'name');
    $('#eyebrow').textContent = t('one.' + b.cat) + (b.difficulty ? ' · ' + diffLabel(b.difficulty) : '');
    $('#title').textContent = bt(b, 'name');
    $('#desc').textContent = bt(b, 'description');
    $('#desc').hidden = !bt(b, 'description');
    const st = $('#stats');
    st.textContent = '';
    const pairs = [
      ['stat.area', b.size[0] + ' × ' + b.size[2]],
      ['stat.height', t('stat.heightVal', { n: b.size[1] })],
      ['stat.blocks', String(placed(b.cells).length)],
      ['stat.time', fmtTime(b.minutes)],
      ['stat.version', edLabel(b.edition)]
    ];
    pairs.forEach(([k, v], i) => {
      const d = el('div', 'stat' + (i === 4 ? ' wide' : ''));
      d.append(el('dt', null, t(k)), el('dd', null, v));
      d.title = k === 'stat.time' ? t('stat.timeTitle') : t(k) + ': ' + v;
      st.append(d);
    });
    $('#ytLink').href = ytLink(b);
    $('#community').hidden = !b.community;
    $('#translated').hidden = !I18N.translated(b);
    $('#edition').textContent = t('how.edition', { ed: edLabel(b.edition) });
    renderFavBtn();
    $('#customTools').hidden = !b.custom;
  }
  function renderFavBtn() {
    const on = favs().includes(state.build.id);
    const btn = $('#favBtn');
    btn.textContent = on ? t('panel.faved') : t('panel.fav');
    btn.setAttribute('aria-pressed', String(on));
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
    $('#hudSub').textContent = state.done.has(state.layer) ? t('hud.done') : t('hud.layer', { y: state.layer });
    $('#prevBtn').disabled = state.layer === 0;
    $('#nextBtn').disabled = state.layer === H - 1;
    document.querySelectorAll('#modeSeg button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.mode === state.mode)));
    const cells = b.layers[state.layer];
    $('#layerTitle').textContent = '';
    $('#layerTitle').append(t('layer.title', { y: state.layer }));
    $('#layerTitle').append(el('small', null, t('layer.blocks', { n: placed(cells).length })));
    const notes = bt(b, 'layerNotes');
    const note = notes && notes[state.layer];
    $('#layerNote').hidden = !note;
    $('#layerNote').textContent = note || '';
    const on = state.done.has(state.layer);
    $('#doneBox').checked = on;
    $('#doneLabel').classList.toggle('on', on);
    renderChips();
    renderProgress();
    drawGrid();
    renderInfo();
    renderMatList($('#layerMats'), cells);
  }

  function renderChips() {
    const b = state.build, wrap = $('#chips');
    wrap.textContent = '';
    for (let y = 0; y < b.size[1]; y++) {
      const c = el('button', 'chip' + (state.done.has(y) ? ' done' : ''), String(y));
      c.setAttribute('aria-current', String(y === state.layer));
      c.title = state.done.has(y) ? t('prog.layerDone', { y }) : t('prog.layerTitle', { y });
      c.addEventListener('click', () => setLayer(y, true));
      wrap.append(c);
    }
  }

  function renderProgress() {
    const H = state.build.size[1], n = state.done.size;
    $('#progText').textContent = t('prog.text', { n, max: H });
    $('#progBar').style.width = (n / H * 100) + '%';
  }

  function toggleDone(force) {
    const y = state.layer;
    const on = force != null ? force : !state.done.has(y);
    if (on) state.done.add(y); else state.done.delete(y);
    store.set('done.' + state.build.id, [...state.done]);
    if (on && y < state.build.size[1] - 1 && force == null) { setLayer(y + 1, true); toast(t('prog.next', { y, n: y + 1 })); }
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
    if (y > 0) {
      g.globalAlpha = 0.22;
      b.layers[y - 1].forEach((c) => { if (!at(b, c.x, y, c.z)) { g.fillStyle = D(c).color; g.fillRect(lab + c.x * s, lab + c.z * s, s, s); } });
      g.globalAlpha = 1;
    }
    b.layers[y].forEach((c) => drawCell(g, b, c, lab + c.x * s, lab + c.z * s, s));
    g.strokeStyle = line; g.lineWidth = 1;
    g.beginPath();
    for (let x = 0; x <= W; x++) { g.moveTo(lab + x * s + 0.5, lab); g.lineTo(lab + x * s + 0.5, lab + Dp * s); }
    for (let z = 0; z <= Dp; z++) { g.moveTo(lab, lab + z * s + 0.5); g.lineTo(lab + W * s, lab + z * s + 0.5); }
    g.stroke();
    g.strokeStyle = muted; g.globalAlpha = 0.45;
    g.beginPath();
    for (let x = 5; x < W; x += 5) { g.moveTo(lab + x * s + 0.5, lab); g.lineTo(lab + x * s + 0.5, lab + Dp * s); }
    for (let z = 5; z < Dp; z += 5) { g.moveTo(lab, lab + z * s + 0.5); g.lineTo(lab + W * s, lab + z * s + 0.5); }
    g.stroke();
    g.globalAlpha = 1;
    g.fillStyle = muted; g.font = '600 10px "JetBrains Mono", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const step = s < 18 ? 2 : 1;
    for (let x = 0; x < W; x += step) g.fillText(String(x), lab + x * s + s / 2, lab / 2 + 2);
    g.textAlign = 'right';
    for (let z = 0; z < Dp; z += step) g.fillText(String(z), lab - 4, lab + z * s + s / 2);
    g.fillStyle = accent; g.textAlign = 'center'; g.font = '700 11px "Pixelify Sans", monospace';
    g.beginPath(); g.moveTo(8, 4); g.lineTo(13, 12); g.lineTo(3, 12); g.closePath(); g.fill();
    g.fillText(I18N.dirShort('n'), 8, 19);
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
      case 'trapdoor_top':
        g.fillStyle = def.color; g.fillRect(x, y, s, s);
        g.strokeStyle = '#3b2c18'; g.lineWidth = 1.5; g.strokeRect(x + 2.5, y + 2.5, s - 5, s - 5);
        g.fillStyle = '#3b2c18'; g.fillRect(cx - 1, cy - 1, 2, 2);
        break;
      case 'detector':
        g.fillStyle = def.color; g.fillRect(x + 1, y + 1, s - 2, s - 2);
        g.fillStyle = '#9ec7e6'; g.fillRect(x + s * 0.2, y + s * 0.2, s * 0.25, s * 0.25); g.fillRect(x + s * 0.55, y + s * 0.55, s * 0.25, s * 0.25);
        break;
      case 'lever': edgeRect(g, x, y, s, MC.OPP[f], 0.3, def.color); g.fillStyle = '#6b5232'; g.fillRect(cx - s * 0.08, cy - s * 0.08, s * 0.16, s * 0.16); break;
      case 'piston_head':
        g.globalAlpha = 0.6; g.fillStyle = def.color; g.fillRect(x, y, s, s); g.globalAlpha = 1;
        arrow(g, cx, cy, r * 0.7, f, '#1b1b1b');
        break;
      case 'stonecutter':
        g.fillStyle = def.color; g.fillRect(x, y, s, s); g.fillStyle = '#3a3a3a'; g.fillRect(x + s * 0.1, cy - 1, s * 0.8, 2);
        break;
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
        g.fillText(bname(c.id)[0], cx, cy + 1);
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
        if (def.ghost || (def.auto && !def.env)) {
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
    if (!c) { wrap.append(el('p', 'info-empty', t('info.empty'))); return; }
    const def = D(c);
    const box = el('div', 'info');
    const sw = swatchCanvas(c.id, 34); sw.className = 'sw';
    box.append(sw, el('div', 'info-name', bname(c.id)), el('div', 'info-pos', 'X ' + c.x + ' · Y ' + c.y + ' · Z ' + c.z));
    const tags = el('div', 'info-tags');
    if (c.facing && def.hint) tags.append(el('span', 'pill mid', t('info.dir', { d: I18N.dir(c.facing) })));
    if (c.half) tags.append(el('span', 'pill mid', c.half === 'top' ? t('info.top') : t('info.bottom')));
    if (def.auto) tags.append(el('span', 'pill easy', t('info.auto')));
    if (def.entity) tags.append(el('span', 'pill hard', t('info.mob')));
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
        const label = def.items || def.item ? I18N.item(name) : bname(c.id);
        const target = def.entity ? mobs : items;
        const e = target.get(label) || { name: label, n: 0, stack, id: c.id };
        e.n += n;
        target.set(label, e);
      });
    });
    const sort = (m) => [...m.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, I18N.lang));
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
    if (!items.length && !mobs.length) { target.append(el('p', 'info-empty', t('layer.nothing'))); return; }
    matRows(target, items.concat(mobs));
  }

  function renderMats() {
    const { items, mobs } = collect(state.build.cells);
    const all = $('#allMats'); all.textContent = '';
    matRows(all, items);
    $('#mobsWrap').hidden = !mobs.length;
    const mm = $('#mobMats'); mm.textContent = '';
    matRows(mm, mobs);
    $('#dpText').textContent = t('exp.datapackText', { id: fnName(state.build) });
  }

  function listLines(head, cells) {
    const { items, mobs } = collect(cells);
    const lines = [head, ''];
    items.forEach((e) => { const st = stackText(e.n, e.stack); lines.push('- ' + e.n + '× ' + e.name + (st ? ' (' + st + ')' : '')); });
    if (mobs.length) { lines.push('', t('mats.mobs') + ':'); mobs.forEach((e) => lines.push('- ' + e.n + '× ' + e.name)); }
    return lines.join('\n');
  }
  const copyList = () => copyText(listLines(t('mats.listHead', { name: bt(state.build, 'name') }), state.build.cells), t('mats.copied'));

  /* ---------- Export ---------- */
  const fnName = (b) => b.id.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'bau';
  function commandLines(layerOnly) {
    const b = state.build;
    const cells = layerOnly ? b.layers[state.layer] : b.cells;
    const head = ['# Blockplan: ' + bt(b, 'name') + (layerOnly ? t('exp.layerSuffix', { y: state.layer }) : ''), t('exp.cmdHead')];
    return { head, lines: MC.javaCommands(cells) };
  }
  function copyCommands(layerOnly) {
    const { head, lines } = commandLines(layerOnly);
    copyText(head.concat(lines).join('\n'), t('exp.cmdCopied', { n: lines.length }));
  }
  async function exportFile(kind) {
    const b = state.build;
    const meta = { name: bt(b, 'name'), author: 'Blockplan', description: bt(b, 'tagline') };
    try {
      let blob, name;
      if (kind === 'litematic') { blob = new Blob([await Formats.litematic(b.cells, b.size, meta)]); name = fileName(b, '.litematic'); }
      else if (kind === 'schem') { blob = new Blob([await Formats.schem(b.cells, b.size, meta)]); name = fileName(b, '.schem'); }
      else {
        const { head, lines } = commandLines(false);
        blob = Formats.datapack(fnName(b), head.map((l) => l).concat(lines), 'Blockplan: ' + meta.name);
        name = 'blockplan_' + fnName(b) + '.zip';
      }
      Formats.download(blob, name);
      toast(t('exp.saved', { file: name }));
    } catch (e) { toast(t('exp.fail', { msg: e.message })); }
  }

  /* ---------- Funktionsweise ---------- */
  function renderHow() {
    const b = state.build;
    const how = $('#howList'), tips = $('#tipList');
    how.textContent = ''; tips.textContent = '';
    const H = bt(b, 'how') || [], Tp = bt(b, 'tips') || [];
    H.forEach((x) => how.append(el('li', null, x)));
    Tp.forEach((x) => tips.append(el('li', null, x)));
    $('#howWrap').hidden = !H.length;
    $('#tipWrap').hidden = !Tp.length;
    const leg = $('#legend'); leg.textContent = '';
    const sample = [
      [{ id: 'piston', facing: 'e', x: 0, y: 0, z: 0 }, 'leg.arrow'],
      [{ id: 'hopper', facing: 'd', x: 0, y: 0, z: 0 }, 'leg.updown'],
      [{ id: 'oak_stairs', facing: 'n', x: 0, y: 0, z: 0 }, 'leg.stairs'],
      [{ id: 'sugar_cane_auto', x: 0, y: 0, z: 0 }, 'leg.grows'],
      [{ id: 'water', x: 0, y: 0, z: 0 }, 'leg.water'],
      [{ id: 'water_flow', x: 0, y: 0, z: 0 }, 'leg.flow']
    ];
    const fake = { lookup: new Map() };
    sample.forEach(([c, label]) => {
      const cv = document.createElement('canvas');
      const s = 22, dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = cv.height = s * dpr; cv.style.width = cv.style.height = s + 'px';
      const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawCell(g, fake, c, 0, 0, s);
      const d = el('div'); d.append(cv, el('span', null, t(label)));
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
  const setPlayIcon = (k, label) => { $('#vPlay').innerHTML = ICON[k]; $('#vPlay').setAttribute('aria-label', t(label)); };
  function startVideo() {
    const b = state.build, total = b.cells.length;
    const seconds = Math.max(15, Math.min(80, total * 0.06));
    video = { n: 0, total, rate: total / seconds, speed: 1, playing: true, last: 0 };
    $('#videoBar').hidden = false; $('#videoCap').hidden = false; $('.hud').hidden = true;
    $('#vSpeed').textContent = '1×';
    setPlayIcon('pause', 'video.pause');
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
    setPlayIcon(video.playing ? 'pause' : 'play', video.playing ? 'video.pause' : 'video.play');
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
      const notes = bt(b, 'layerNotes');
      const note = (notes && notes[c.y]) || t('video.blocksHere', { n: b.layers[c.y].length });
      const d = D(c);
      $('#vCapTitle').textContent = t('video.layerOf', { y: c.y, max: b.size[1] - 1 });
      $('#vCapNote').textContent = note;
      $('#vCapBlock').textContent = t('video.now', { name: bname(c.id) + (c.facing && d.hint ? ' → ' + I18N.dir(c.facing) : '') });
    }
    $('#vProg').style.width = (video.n / video.total * 100) + '%';
    if (video.n >= video.total && video.playing) {
      video.playing = false;
      viewer.setAutoRotate(false);
      setPlayIcon('again', 'video.again');
      $('#vCapTitle').textContent = t('video.done');
      $('#vCapNote').textContent = t('video.doneNote');
      $('#vCapBlock').textContent = '';
    }
    requestAnimationFrame(tickVideo);
  }

  /* ---------- Dialoge ---------- */
  let openDialog = null;
  function showDialog(id) {
    closeDialog();
    openDialog = $(id);
    openDialog.hidden = false;
    $('#backdrop').hidden = false;
    const f = openDialog.querySelector('[data-close]');
    if (f) f.focus();
  }
  function closeDialog() {
    if (openDialog) openDialog.hidden = true;
    openDialog = null;
    if (!$('#sidebar').classList.contains('open')) $('#backdrop').hidden = true;
  }

  /* ---------- Merkliste ---------- */
  function toggleFav() {
    const id = state.build.id;
    let f = favs();
    const on = f.includes(id);
    f = on ? f.filter((x) => x !== id) : f.concat(id);
    store.set('favs', f);
    toast(on ? t('fav.removed') : t('fav.added'));
    renderFavBtn();
    renderList();
  }
  function renderFavs() {
    const list = $('#favList'), off = new Set(store.get('favsOff', []));
    list.textContent = '';
    const builds = favs().map((id) => BUILDS.find((b) => b.id === id)).filter(Boolean);
    $('#favEmpty').hidden = !!builds.length;
    $('#favTotalWrap').hidden = !builds.length;
    builds.forEach((b) => {
      const row = el('div', 'fav-row');
      const lab = el('label', 'fav-check');
      const cb = el('input'); cb.type = 'checkbox'; cb.checked = !off.has(b.id);
      cb.addEventListener('change', () => { if (cb.checked) off.delete(b.id); else off.add(b.id); store.set('favsOff', [...off]); renderFavTotal(); });
      lab.append(cb, el('span', null, bt(b, 'name')));
      const go = el('button', 'btn small', t('fav.open'));
      go.addEventListener('click', () => { closeDialog(); open(b.id); });
      const rm = el('button', 'btn small ghost', '✕');
      rm.setAttribute('aria-label', t('fav.remove'));
      rm.addEventListener('click', () => { store.set('favs', favs().filter((x) => x !== b.id)); renderFavs(); renderList(); if (state.build) renderFavBtn(); });
      row.append(lab, go, rm);
      list.append(row);
    });
    renderFavTotal();
  }
  function favCells() {
    const off = new Set(store.get('favsOff', []));
    return favs().filter((id) => !off.has(id)).map((id) => BUILDS.find((b) => b.id === id)).filter(Boolean);
  }
  function renderFavTotal() {
    const bs = favCells();
    const target = $('#favMats');
    target.textContent = '';
    const { items, mobs } = collect([].concat(...bs.map((b) => b.cells)));
    matRows(target, items.concat(mobs));
  }
  function copyFavList() {
    const bs = favCells();
    const head = t('fav.listHead', { n: bs.length }) + '\n' + bs.map((b) => '· ' + bt(b, 'name')).join('\n');
    copyText(listLines(head, [].concat(...bs.map((b) => b.cells))), t('mats.copied'));
  }

  /* ---------- Import & Teilen ---------- */
  const MAX_BLOCKS = 120000;
  async function importFiles(files) {
    for (const file of files) {
      toast(t('imp.reading'));
      try {
        const res = await Formats.importFile(file);
        const cells = [];
        let mx = Infinity, my = Infinity, mz = Infinity;
        res.blocks.forEach(([x, y, z]) => { mx = Math.min(mx, x); my = Math.min(my, y); mz = Math.min(mz, z); });
        const before = Object.keys(MC.BLOCKS).length;
        res.blocks.forEach(([x, y, z, name, props]) => {
          const spec = Formats.toSpec(name, props);
          if (spec) cells.push(Object.assign(MC.parse(spec), { x: x - mx, y: y - my, z: z - mz }));
        });
        if (!cells.length) throw new Error(t('imp.empty'));
        if (cells.length > MAX_BLOCKS) throw new Error(t('imp.tooBig', { n: cells.length, max: MAX_BLOCKS }));
        const unknown = Object.keys(MC.BLOCKS).length - before;
        const id = 'eigen-' + Date.now().toString(36);
        const o = Object.assign({ id, name: res.name || file.name, file: file.name }, packCells(cells));
        const b = makeCustom(o);
        b.description = t('imp.desc', { file: file.name });
        BUILDS.push(b);
        const ok = saveCustom(o);
        open(id);
        toast(t('imp.ok', { name: b.name, n: placed(cells).length }) + (unknown ? ' ' + t('imp.unknownBlocks', { n: unknown }) : '') + (ok ? '' : ' ' + t('imp.notStored')));
      } catch (e) {
        const msg = e.message === 'format' || e.message === 'kein NBT' ? t('imp.unknownFormat') : e.message === 'old' ? t('imp.unknownFormat') : e.message;
        toast(t('imp.fail', { msg }));
      }
    }
  }
  function deleteCustom() {
    const b = state.build;
    if (!b.custom || !confirm(t('imp.confirm', { name: b.name }))) return;
    store.set('custom', customList().filter((x) => x.id !== b.id));
    store.set('favs', favs().filter((x) => x !== b.id));
    const i = BUILDS.findIndex((x) => x.id === b.id);
    if (i >= 0) BUILDS.splice(i, 1);
    toast(t('imp.deleted'));
    open(BUILDS.find((x) => !x.custom).id);
  }
  async function shareCustom() {
    const b = state.base;
    try {
      const code = await Formats.encodeShare(Object.assign({ v: 1, n: b.name }, packCells(b.cells)));
      if (code.length > 60000) { toast(t('share.tooLong')); return; }
      const url = location.href.split('#')[0] + '#share=' + code;
      copyText(url, t('share.copied'));
    } catch (e) { toast(t('exp.fail', { msg: e.message })); }
  }
  async function loadShare(code) {
    try {
      const o = await Formats.decodeShare(code);
      const id = 'geteilt-' + Date.now().toString(36);
      const b = makeCustom({ id, name: String(o.n || 'Bau').slice(0, 80), pal: o.pal, data: o.data, shared: true });
      BUILDS.push(b);
      saveCustom({ id, name: b.name, pal: o.pal, data: o.data, shared: true });
      try { history.replaceState(null, '', '#' + id); } catch (e) { /* egal */ }
      toast(t('share.loaded', { name: b.name }));
      return id;
    } catch (e) { toast(t('share.bad')); return null; }
  }

  /* ---------- Unterstützer ---------- */
  const THEMES = ['default', 'emerald', 'diamond', 'gold', 'amethyst', 'nether'];
  const isSupporter = () => !!store.get('supporter', false);
  function applyAccent() {
    const th = isSupporter() ? store.get('accent', 'default') : 'default';
    if (th === 'default') document.documentElement.removeAttribute('data-accent');
    else document.documentElement.setAttribute('data-accent', th);
    $('#supBadge').hidden = !isSupporter();
    applyTheme();
  }
  function renderSupport() {
    const tiers = $('#supTiers');
    tiers.textContent = '';
    (CFG.support.tiers || []).forEach((tier) => {
      const a = el(tier.url ? 'a' : 'div', 'tier' + (tier.url ? '' : ' off'));
      if (tier.url) { a.href = tier.url; a.target = '_blank'; a.rel = 'noopener'; }
      a.append(el('b', null, tier.name), el('span', null, tier.price + ' ' + t('sup.month')));
      if (!tier.url) a.append(el('small', null, t('sup.notReady')));
      tiers.append(a);
    });
    $('#supPage').hidden = !CFG.support.page;
    if (CFG.support.page) $('#supPage').href = CFG.support.page;
    const sw = $('#supThemes');
    sw.textContent = '';
    $('#supThemeWrap').hidden = !isSupporter();
    const cur = store.get('accent', 'default');
    THEMES.forEach((th) => {
      const b = el('button', 'theme-sw');
      b.dataset.theme = th;
      b.setAttribute('aria-pressed', String(th === cur));
      b.append(el('i'), el('span', null, t('theme.' + th)));
      b.addEventListener('click', () => { store.set('accent', th); applyAccent(); renderSupport(); });
      sw.append(b);
    });
  }
  async function sha256(s) {
    const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(h)].map((x) => x.toString(16).padStart(2, '0')).join('');
  }
  async function redeem() {
    const code = $('#supCode').value.trim().toUpperCase().replace(/\s+/g, '');
    if (!code) return;
    let ok = false;
    try { ok = (CFG.supporterCodes || []).includes(await sha256(code)); } catch (e) { ok = false; }
    if (ok) { store.set('supporter', true); applyAccent(); renderSupport(); $('#supCode').value = ''; }
    toast(ok ? t('sup.codeOk') : t('sup.codeBad'));
  }

  /* ---------- Über / App installieren ---------- */
  let installEvt = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; renderAbout(); });
  function renderAbout() {
    $('#aboutVer').textContent = t('about.version', { v: CFG.version || '' });
    $('#installBtn').hidden = !installEvt;
    $('#legalLink').href = CFG.legalUrl || 'legal.html';
    $('#legalLink2').href = CFG.legalUrl || 'legal.html';
  }
  function registerSW() {
    if (!('serviceWorker' in navigator) || location.protocol !== 'https:' && location.hostname !== 'localhost') return;
    try { if (window.top !== window.self) return; } catch (e) { return; }
    navigator.serviceWorker.register('sw.js').then(() => { $('#offlineTag').hidden = false; }).catch(() => { /* egal */ });
  }

  /* ---------- Sprache ---------- */
  function renderLangSelect() {
    const s = $('#langSel');
    s.textContent = '';
    I18N.LANGS.forEach((l) => { const o = el('option', null, l.name); o.value = l.code; if (l.code === I18N.lang) o.selected = true; s.append(o); });
  }
  async function changeLang(code) {
    try { await I18N.set(code); } catch (e) { toast(t('lang.fail')); }
  }
  function rerender() {
    applyStatic();
    renderLangSelect();
    refreshCustomText();
    if (!state.build) return;
    renderHead(); renderMats(); renderHow(); renderList(); renderOrient(); setLayer(state.layer, false);
    renderAbout();
    if (openDialog && openDialog.id === 'favDialog') renderFavs();
    if (openDialog && openDialog.id === 'supDialog') renderSupport();
  }

  /* ---------- Tabs, Drawer ---------- */
  function setTab(k) {
    state.tab = k;
    document.querySelectorAll('.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === k)));
    ['layer', 'mats', 'how'].forEach((x) => { $('#tab-' + x).hidden = x !== k; });
    if (k === 'layer') drawGrid();
  }
  function openDrawer() { $('#sidebar').classList.add('open'); $('#backdrop').hidden = false; }
  function closeDrawer() { $('#sidebar').classList.remove('open'); if (!openDialog) $('#backdrop').hidden = true; }

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
      if (!ok) { wantLock = false; toast(t('wake.fail')); }
      else toast(t('wake.on'));
    } else {
      try { if (lock) await lock.release(); } catch (e) { /* egal */ }
      lock = null;
    }
    $('#wakeBtn').setAttribute('aria-pressed', String(wantLock));
  }
  document.addEventListener('visibilitychange', () => { if (wantLock && !lock && document.visibilityState === 'visible') requestLock(); });

  /* ---------- Ereignisse ---------- */
  function rotateBuild() { state.rot = (state.rot + 1) % 4; applyOrient(true); }
  function mirrorBuild() { state.mirror = !state.mirror; applyOrient(false); }
  function bind() {
    $('#search').addEventListener('input', renderList);
    $('#prevBtn').addEventListener('click', () => setLayer(state.layer - 1, true));
    $('#nextBtn').addEventListener('click', () => setLayer(state.layer + 1, true));
    $('#doneBox').addEventListener('change', (e) => toggleDone(e.target.checked));
    $('#resetBtn').addEventListener('click', () => { state.done.clear(); store.set('done.' + state.build.id, []); setLayer(0, false); toast(t('prog.resetDone')); });
    document.querySelectorAll('#modeSeg button').forEach((b) => b.addEventListener('click', () => { state.mode = b.dataset.mode; setLayer(state.layer, false); }));
    document.querySelectorAll('#camSeg button[data-cam]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.cam === 'rotate') { state.rotate = !state.rotate; viewer.setAutoRotate(state.rotate); b.setAttribute('aria-pressed', String(state.rotate)); }
      else viewer.preset(b.dataset.cam);
    }));
    $('#rotBtn90').addEventListener('click', rotateBuild);
    $('#mirrorBtn').addEventListener('click', mirrorBuild);
    $('#orientReset').addEventListener('click', () => { state.rot = 0; state.mirror = false; applyOrient(true); });
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
    $('#expLitematic').addEventListener('click', () => exportFile('litematic'));
    $('#expSchem').addEventListener('click', () => exportFile('schem'));
    $('#expDatapack').addEventListener('click', () => exportFile('datapack'));
    document.querySelectorAll('#diffSeg button').forEach((b) => b.addEventListener('click', () => { state.diff = state.diff === b.dataset.diff ? '' : b.dataset.diff; renderList(); }));
    $('#favOnly').addEventListener('click', () => { state.favOnly = !state.favOnly; renderList(); });
    $('#favBtn').addEventListener('click', toggleFav);
    $('#favsBtn').addEventListener('click', () => { renderFavs(); showDialog('#favDialog'); });
    $('#favCopy').addEventListener('click', copyFavList);
    $('#importBtn').addEventListener('click', () => $('#importFile').click());
    $('#importFile').addEventListener('change', (e) => { const f = [...e.target.files]; e.target.value = ''; importFiles(f); });
    const stage = $('.stage');
    stage.addEventListener('dragover', (e) => { e.preventDefault(); stage.classList.add('drop'); });
    stage.addEventListener('dragleave', () => stage.classList.remove('drop'));
    stage.addEventListener('drop', (e) => { e.preventDefault(); stage.classList.remove('drop'); importFiles([...e.dataTransfer.files]); });
    $('#deleteBtn').addEventListener('click', deleteCustom);
    $('#shareBtn').addEventListener('click', shareCustom);
    $('#supportBtn').addEventListener('click', () => { renderSupport(); showDialog('#supDialog'); });
    $('#supRedeem').addEventListener('click', redeem);
    $('#supCode').addEventListener('keydown', (e) => { if (e.key === 'Enter') redeem(); });
    $('#aboutBtn').addEventListener('click', () => { renderAbout(); showDialog('#aboutDialog'); });
    $('#installBtn').addEventListener('click', async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch (e) { /* egal */ } installEvt = null; renderAbout(); });
    $('#langSel').addEventListener('change', (e) => changeLang(e.target.value));
    $('#menuBtn').addEventListener('click', openDrawer);
    $('#backdrop').addEventListener('click', () => { closeDrawer(); closeDialog(); });
    $('#keysBtn').addEventListener('click', () => showDialog('#keysDialog'));
    document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeDialog));
    $('#wakeBtn').addEventListener('click', toggleWake);
    new ResizeObserver(() => { if (state.tab === 'layer') drawGrid(); }).observe($('#gridWrap'));
    window.addEventListener('keydown', (e) => {
      const tg = e.target && e.target.matches ? e.target : null;
      if (tg && tg.matches('input[type="search"], input[type="text"], textarea, select')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (openDialog && k !== 'Escape') return;
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
        d: rotateBuild, s: mirrorBuild,
        '?': () => showDialog('#keysDialog'),
        v: () => (video ? stopVideo() : startVideo()),
        Escape: () => { if (video) stopVideo(); else if (openDialog) closeDialog(); else if ($('#sidebar').classList.contains('open')) closeDrawer(); else select(null); }
      };
      const fn = map[k] || map[k.toLowerCase()];
      if (fn) {
        if (tg && tg.matches('input[type="checkbox"], button') && k === ' ') return;
        e.preventDefault();
        fn();
      }
    });
  }

  async function init() {
    viewer = new BlockViewer($('#viewport'), { onPick: (c) => select(c) });
    try { await I18N.set(I18N.detect()); } catch (e) { /* Deutsch bleibt */ }
    I18N.onChange(rerender);
    applyStatic();
    renderLangSelect();
    loadCustomBuilds();
    refreshCustomText();
    applyAccent();
    try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme); } catch (e) { /* alt */ }
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-accent'] });
    bind();
    renderAbout();
    let hashId = decodeURIComponent((location.hash || '').slice(1));
    if (hashId.startsWith('share=')) hashId = (await loadShare(hashId.slice(6))) || '';
    const last = store.get('last', null);
    const id = BUILDS.some((b) => b.id === hashId) ? hashId : BUILDS.some((b) => b.id === last) ? last : BUILDS[0].id;
    open(id);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { drawGrid(); renderHow(); });
    registerSW();
  }

  if (!window.THREE || !THREE.OrbitControls) {
    document.getElementById('viewport').innerHTML = '<p style="padding:24px">' + t('err.three') + '</p>';
    return;
  }
  init();
})();
