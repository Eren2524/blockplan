/* Blockplan – Block-Registry, prozedurale 16×16-Texturen und Platzierungshinweise.
   Richtungen wie in Minecraft: n = Norden (−Z), s = Süden (+Z), e = Osten (+X), w = Westen (−X), u = oben, d = unten. */
(function (global) {
  'use strict';

  const DIRS = { n: [0, 0, -1], s: [0, 0, 1], e: [1, 0, 0], w: [-1, 0, 0], u: [0, 1, 0], d: [0, -1, 0] };
  const OPP = { n: 's', s: 'n', e: 'w', w: 'e', u: 'd', d: 'u' };
  const DIR_NAME = { n: 'Norden', s: 'Süden', e: 'Osten', w: 'Westen', u: 'oben', d: 'unten' };
  const DIR_SHORT = { n: 'N', s: 'S', e: 'O', w: 'W', u: '↑', d: '↓' };

  /* ---------- Texturen ---------- */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let s = seed || 1;
    return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
  }
  function hex(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mul(c, f) { return [Math.max(0, Math.min(255, c[0] * f)), Math.max(0, Math.min(255, c[1] * f)), Math.max(0, Math.min(255, c[2] * f))]; }
  function P(g, x, y, c, a) {
    g.fillStyle = 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a == null ? 1 : a) + ')';
    g.fillRect(x, y, 1, 1);
  }
  function R(g, x, y, w, h, c, a) {
    g.fillStyle = 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a == null ? 1 : a) + ')';
    g.fillRect(x, y, w, h);
  }
  function noise(g, r, base, amt) {
    const b = hex(base);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) P(g, x, y, mul(b, 1 + (r() - 0.5) * 2 * amt));
  }
  function specks(g, r, col, n, f) {
    const b = hex(col);
    for (let i = 0; i < n; i++) P(g, (r() * 16) | 0, (r() * 16) | 0, mul(b, f || 1));
  }
  function voronoi(g, r, base, count, border, amt) {
    const pts = [];
    for (let i = 0; i < count; i++) pts.push([r() * 16, r() * 16, 0.8 + r() * 0.35]);
    const b = hex(base);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      let d1 = 99, d2 = 99, idx = 0;
      for (let i = 0; i < pts.length; i++) {
        for (let ox = -16; ox <= 16; ox += 16) for (let oy = -16; oy <= 16; oy += 16) {
          const dx = x + 0.5 - pts[i][0] - ox, dy = y + 0.5 - pts[i][1] - oy, d = Math.sqrt(dx * dx + dy * dy);
          if (d < d1) { d2 = d1; d1 = d; idx = i; } else if (d < d2) d2 = d;
        }
      }
      const edge = d2 - d1 < border;
      P(g, x, y, mul(b, edge ? 0.55 : pts[idx][2] * (1 + (r() - 0.5) * amt)));
    }
  }
  function planks(g, r, base) {
    const b = hex(base);
    for (let band = 0; band < 4; band++) {
      const f = 0.92 + r() * 0.16, seam = 2 + ((r() * 12) | 0);
      for (let y = band * 4; y < band * 4 + 4; y++) for (let x = 0; x < 16; x++) {
        let c = mul(b, f * (1 + (r() - 0.5) * 0.1));
        if (y === band * 4 + 3) c = mul(b, 0.62);
        if (x === seam && y !== band * 4 + 3) c = mul(b, 0.7);
        P(g, x, y, c);
      }
    }
  }
  function logSide(g, r, base) {
    const b = hex(base);
    for (let x = 0; x < 16; x++) {
      const f = 0.8 + r() * 0.35;
      for (let y = 0; y < 16; y++) P(g, x, y, mul(b, f * (1 + (r() - 0.5) * 0.15) * (r() < 0.06 ? 0.7 : 1)));
    }
  }
  function logTop(g, r, inner, bark) {
    const i = hex(inner), k = hex(bark);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
      let c = d > 6.6 ? mul(k, 0.9 + r() * 0.2) : mul(i, (Math.floor(d) % 2 ? 0.88 : 1.02) * (1 + (r() - 0.5) * 0.08));
      P(g, x, y, c);
    }
  }
  function bricks(g, r, base, mortar, bw, bh) {
    const b = hex(base), m = hex(mortar);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const row = Math.floor(y / bh), off = row % 2 ? bw / 2 : 0;
      const isM = y % bh === bh - 1 || (x + off) % bw === bw - 1;
      P(g, x, y, isM ? mul(m, 1 + (r() - 0.5) * 0.1) : mul(b, (1 + (r() - 0.5) * 0.22) * (y % bh === 0 ? 1.08 : 1)));
    }
  }
  function frame(g, col, w) { const c = hex(col); R(g, 0, 0, 16, w, c); R(g, 0, 16 - w, 16, w, c); R(g, 0, 0, w, 16, c); R(g, 16 - w, 0, w, 16, c); }

  const TEX = {
    stone: (g, r) => { noise(g, r, '#7f7f7f', 0.1); specks(g, r, '#666666', 18); },
    cobble: (g, r) => voronoi(g, r, '#8a8a8a', 9, 0.9, 0.12),
    stone_bricks: (g, r) => bricks(g, r, '#7c7c7c', '#4d4d4d', 8, 8),
    dirt: (g, r) => { noise(g, r, '#866043', 0.16); specks(g, r, '#5c3f28', 14); specks(g, r, '#a07a55', 8); },
    grass_top: (g, r) => { noise(g, r, '#6aa84f', 0.18); specks(g, r, '#4f8a3a', 20); },
    grass_side: (g, r) => {
      TEX.dirt(g, r); const gr = hex('#6aa84f');
      for (let x = 0; x < 16; x++) { const h = 3 + ((r() * 3) | 0); for (let y = 0; y < h; y++) P(g, x, y, mul(gr, 0.9 + r() * 0.2)); }
    },
    path_top: (g, r) => { noise(g, r, '#9a8456', 0.14); specks(g, r, '#7d6a42', 16); },
    farmland_top: (g, r) => {
      noise(g, r, '#56371f', 0.14);
      for (let y = 0; y < 16; y += 4) for (let x = 0; x < 16; x++) P(g, x, y, mul(hex('#3d2614'), 1 + (r() - 0.5) * 0.2));
    },
    sand: (g, r) => { noise(g, r, '#dccf9e', 0.07); specks(g, r, '#c4b37f', 14); },
    glass: (g) => {
      g.clearRect(0, 0, 16, 16);
      R(g, 0, 0, 16, 16, [200, 225, 240], 0.08);
      frame(g, '#e8f4fa', 1);
      const hl = [235, 248, 255];
      P(g, 3, 3, hl, 0.9); P(g, 4, 4, hl, 0.9); P(g, 4, 3, hl, 0.6); P(g, 11, 9, hl, 0.8); P(g, 12, 10, hl, 0.8);
    },
    oak_planks: (g, r) => planks(g, r, '#a8864f'),
    spruce_planks: (g, r) => planks(g, r, '#715231'),
    mangrove_planks: (g, r) => planks(g, r, '#7a3330'),
    oak_log: (g, r) => logSide(g, r, '#6b5232'),
    oak_log_top: (g, r) => logTop(g, r, '#b4935a', '#6b5232'),
    spruce_log: (g, r) => logSide(g, r, '#3b2a18'),
    spruce_log_top: (g, r) => logTop(g, r, '#7a5a35', '#3b2a18'),
    leaves: (g, r) => { noise(g, r, '#3f7a2c', 0.25); specks(g, r, '#244a18', 30); },
    crafting_top: (g, r) => {
      planks(g, r, '#9c7a45'); frame(g, '#5d4426', 1);
      R(g, 5, 1, 1, 14, hex('#5d4426')); R(g, 10, 1, 1, 14, hex('#5d4426')); R(g, 1, 5, 14, 1, hex('#5d4426')); R(g, 1, 10, 14, 1, hex('#5d4426'));
    },
    crafting_side: (g, r) => {
      planks(g, r, '#9c7a45'); R(g, 0, 0, 16, 3, hex('#6e5330'));
      R(g, 3, 6, 4, 1, hex('#8a8a8a')); R(g, 4, 7, 1, 5, hex('#5d4426')); R(g, 10, 6, 1, 6, hex('#5d4426')); R(g, 9, 6, 3, 2, hex('#9a9a9a'));
    },
    furnace_side: (g, r) => { noise(g, r, '#7b7b7b', 0.1); frame(g, '#5b5b5b', 1); },
    furnace_top: (g, r) => { noise(g, r, '#8a8a8a', 0.08); frame(g, '#6a6a6a', 1); },
    furnace_front: (g, r) => {
      TEX.furnace_side(g, r);
      R(g, 3, 8, 10, 6, hex('#1c1c1c')); R(g, 3, 8, 10, 1, hex('#4a4a4a')); R(g, 4, 11, 8, 2, hex('#3b2210'));
      R(g, 3, 3, 10, 2, hex('#4a4a4a'));
    },
    dispenser_front: (g, r) => {
      TEX.furnace_side(g, r);
      R(g, 5, 4, 6, 7, hex('#1a1a1a')); R(g, 4, 5, 8, 5, hex('#1a1a1a')); R(g, 6, 6, 4, 3, hex('#3a3a3a'));
    },
    piston_face: (g, r) => { planks(g, r, '#b08f58'); frame(g, '#7a7a7a', 2); R(g, 6, 6, 4, 4, hex('#8a8a8a')); },
    piston_wood: (g, r) => planks(g, r, '#b08f58'),
    piston_body: (g, r) => { noise(g, r, '#7a7a76', 0.1); frame(g, '#5a5a56', 1); },
    piston_back: (g, r) => { noise(g, r, '#6c6c68', 0.1); frame(g, '#4f4f4b', 1); R(g, 5, 5, 6, 6, hex('#555551')); },
    observer_front: (g, r) => {
      noise(g, r, '#5a5a5a', 0.08); frame(g, '#3d3d3d', 1);
      R(g, 3, 4, 3, 4, hex('#1d1d1d')); R(g, 10, 4, 3, 4, hex('#1d1d1d'));
      R(g, 3, 11, 10, 2, hex('#2a2a2a')); R(g, 4, 5, 1, 1, hex('#9b9b9b')); R(g, 11, 5, 1, 1, hex('#9b9b9b'));
    },
    observer_back: (g, r) => {
      noise(g, r, '#6a6a6a', 0.08); frame(g, '#474747', 1);
      R(g, 5, 5, 6, 6, hex('#3a1212')); R(g, 6, 6, 4, 4, hex('#d42a1e')); R(g, 7, 7, 1, 1, hex('#ff8a7a'));
    },
    observer_side: (g, r) => {
      noise(g, r, '#666666', 0.08); frame(g, '#474747', 1);
      for (let x = 2; x < 14; x += 3) R(g, x, 2, 1, 12, hex('#4c4c4c'));
    },
    hopper: (g, r) => { noise(g, r, '#3e3e42', 0.14); frame(g, '#2a2a2d', 1); },
    hopper_in: (g, r) => { noise(g, r, '#232326', 0.1); frame(g, '#4a4a4f', 2); },
    chest: (g, r) => {
      noise(g, r, '#a8702b', 0.1); frame(g, '#5e3c14', 1); R(g, 0, 5, 16, 1, hex('#5e3c14'));
    },
    chest_top: (g, r) => { noise(g, r, '#a8702b', 0.1); frame(g, '#5e3c14', 1); },
    hay_side: (g, r) => {
      for (let x = 0; x < 16; x++) for (let y = 0; y < 16; y++) P(g, x, y, mul(hex('#c9a227'), (x % 3 === 0 ? 0.82 : 1) * (1 + (r() - 0.5) * 0.12)));
      R(g, 0, 3, 16, 2, hex('#8a3b1a')); R(g, 0, 11, 16, 2, hex('#8a3b1a'));
    },
    hay_top: (g, r) => { noise(g, r, '#c9a227', 0.15); frame(g, '#8a6a14', 1); },
    white_concrete: (g, r) => noise(g, r, '#e4e8e8', 0.03),
    red_concrete: (g, r) => noise(g, r, '#8e2420', 0.04),
    sea_lantern: (g, r) => {
      noise(g, r, '#cfe3dc', 0.08); frame(g, '#9ec4b7', 1);
      R(g, 7, 1, 2, 14, hex('#eef8f3')); R(g, 1, 7, 14, 2, hex('#eef8f3'));
    },
    glowstone: (g, r) => { voronoi(g, r, '#e2b65a', 7, 0.7, 0.3); specks(g, r, '#fff1b8', 16); },
    bed_foot: (g, r) => { noise(g, r, '#a82a24', 0.08); R(g, 0, 0, 16, 1, hex('#7a1d18')); },
    bed_head: (g, r) => { noise(g, r, '#a82a24', 0.08); R(g, 1, 1, 14, 6, hex('#f1eee6')); R(g, 1, 6, 14, 1, hex('#cfcac0')); },
    bed_side: (g, r) => { noise(g, r, '#a82a24', 0.08); R(g, 0, 10, 16, 6, hex('#9a7449')); },
    rail: (g) => {
      g.clearRect(0, 0, 16, 16);
      for (let y = 1; y < 16; y += 3) R(g, 2, y, 12, 2, hex('#6b4f2c'));
      R(g, 3, 0, 1, 16, hex('#a7a7a7')); R(g, 12, 0, 1, 16, hex('#a7a7a7'));
    },
    sugar_cane: (g) => {
      g.clearRect(0, 0, 16, 16);
      [[3, 0], [7, 2], [11, 1]].forEach(([x, o]) => {
        R(g, x, 0, 2, 16, hex('#8ccf6a'));
        for (let y = o; y < 16; y += 5) R(g, x, y, 2, 1, hex('#5f9a45'));
      });
      R(g, 5, 4, 2, 1, hex('#8ccf6a')); R(g, 9, 9, 2, 1, hex('#8ccf6a'));
    },
    wheat: (g, r) => {
      g.clearRect(0, 0, 16, 16);
      for (let x = 1; x < 16; x += 3) {
        R(g, x, 6, 1, 10, hex('#9aa83a'));
        R(g, x - 0, 1 + ((r() * 2) | 0), 1, 5, hex('#d9b64a'));
        P(g, x + 1, 3, hex('#c79b32'));
      }
    },
    stem: (g) => {
      g.clearRect(0, 0, 16, 16);
      R(g, 7, 4, 2, 12, hex('#6f9a2e')); R(g, 9, 8, 3, 1, hex('#6f9a2e')); R(g, 4, 6, 3, 1, hex('#6f9a2e'));
      R(g, 11, 6, 1, 3, hex('#8bb53a'));
    },
    pumpkin_side: (g, r) => {
      for (let x = 0; x < 16; x++) for (let y = 0; y < 16; y++) P(g, x, y, mul(hex('#c97614'), (x % 4 === 0 ? 0.72 : 1) * (1 + (r() - 0.5) * 0.12)));
    },
    pumpkin_top: (g, r) => {
      noise(g, r, '#c07012', 0.12); R(g, 6, 6, 4, 4, hex('#6b5a1e')); R(g, 7, 7, 2, 2, hex('#4c4012'));
    },
    ladder: (g) => {
      g.clearRect(0, 0, 16, 16);
      R(g, 2, 0, 2, 16, hex('#7d5b33')); R(g, 12, 0, 2, 16, hex('#7d5b33'));
      for (let y = 1; y < 16; y += 4) R(g, 2, y, 12, 2, hex('#9a7445'));
    },
    door: (g, r) => {
      planks(g, r, '#a07a45'); frame(g, '#6b4f2b', 1);
      R(g, 3, 3, 4, 4, hex('#3b2c18')); R(g, 9, 3, 4, 4, hex('#3b2c18'));
      R(g, 12, 9, 2, 1, hex('#2b2b2b'));
    },
    door_lower: (g, r) => {
      planks(g, r, '#a07a45'); frame(g, '#6b4f2b', 1);
      R(g, 3, 3, 10, 1, hex('#7d5d33')); R(g, 3, 9, 10, 1, hex('#7d5d33')); R(g, 12, 2, 2, 1, hex('#2b2b2b'));
    },
    lava: (g, r) => { noise(g, r, '#d55a0c', 0.25); specks(g, r, '#f6b13a', 26); specks(g, r, '#a8320a', 10); },
    water: (g, r) => { noise(g, r, '#3d6ad6', 0.12); },
    water_flow: (g, r) => { noise(g, r, '#5f8fe8', 0.1); },
    lantern: (g, r) => { R(g, 0, 0, 16, 16, hex('#2f2f33')); R(g, 3, 3, 10, 10, hex('#f1b54b')); R(g, 5, 5, 6, 6, hex('#ffe3a0')); },
    sign: (g, r) => { planks(g, r, '#a8864f'); R(g, 3, 4, 10, 1, hex('#3a2a14')); R(g, 3, 7, 8, 1, hex('#3a2a14')); R(g, 3, 10, 9, 1, hex('#3a2a14')); },
    button: (g, r) => noise(g, r, '#7f7f7f', 0.06),
    cart: (g, r) => { noise(g, r, '#5d5d62', 0.12); frame(g, '#3c3c40', 1); },
    bamboo: (g, r) => {
      for (let x = 0; x < 16; x++) for (let y = 0; y < 16; y++) P(g, x, y, mul(hex('#5f9e2f'), (x % 5 === 0 ? 0.8 : 1) * (1 + (r() - 0.5) * 0.1)));
      R(g, 0, 5, 16, 1, hex('#3f6e1d')); R(g, 0, 13, 16, 1, hex('#3f6e1d'));
    },
    bamboo_top: (g, r) => { noise(g, r, '#9cc25a', 0.1); frame(g, '#5f9e2f', 2); },
    trapdoor: (g, r) => {
      planks(g, r, '#a07a45'); frame(g, '#6b4f2b', 1);
      R(g, 3, 3, 3, 3, hex('#3b2c18')); R(g, 10, 3, 3, 3, hex('#3b2c18')); R(g, 3, 10, 3, 3, hex('#3b2c18')); R(g, 10, 10, 3, 3, hex('#3b2c18'));
    },
    cauldron: (g, r) => { noise(g, r, '#45464b', 0.12); frame(g, '#2d2e31', 1); },
    dripstone: (g) => {
      g.clearRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) { const w = Math.max(1, Math.round(7 - y * 0.42)); R(g, 8 - w, y, w * 2, 1, hex(y % 4 === 0 ? '#8a6a52' : '#a5836a')); }
    },
    obsidian: (g, r) => { noise(g, r, '#1c1528', 0.25); specks(g, r, '#3d2a5c', 24); specks(g, r, '#0c0912', 14); },
    portal: (g, r) => { noise(g, r, '#7a2fd0', 0.25); specks(g, r, '#c68cff', 30); },
    iron_block: (g, r) => { noise(g, r, '#d6d8da', 0.04); frame(g, '#b3b6b9', 1); R(g, 1, 1, 14, 1, hex('#eceef0')); },
    beacon: (g, r) => { g.clearRect(0, 0, 16, 16); R(g, 0, 0, 16, 16, [180, 235, 240], 0.25); frame(g, '#e8fbff', 1); },
    beacon_core: (g, r) => { noise(g, r, '#7fe8e0', 0.12); R(g, 5, 5, 6, 6, hex('#e6fffd')); },
    wool: (g, r) => { noise(g, r, '#eaeceb', 0.07); specks(g, r, '#d2d5d4', 30); },
    gray_concrete: (g, r) => noise(g, r, '#3b3f44', 0.04),
    lectern_top: (g, r) => { planks(g, r, '#a8864f'); R(g, 3, 4, 10, 8, hex('#e9e1c8')); R(g, 7, 4, 2, 8, hex('#8a5a2a')); },
    lectern_side: (g, r) => { planks(g, r, '#a8864f'); R(g, 0, 12, 16, 4, hex('#6b4f2b')); R(g, 5, 2, 6, 10, hex('#8b6a3a')); },
    composter_side: (g, r) => { planks(g, r, '#8a6a3c'); frame(g, '#5a4426', 1); for (let x = 3; x < 16; x += 4) R(g, x, 1, 1, 14, hex('#5a4426')); },
    composter_top: (g, r) => { noise(g, r, '#4b3a1e', 0.2); frame(g, '#8a6a3c', 2); specks(g, r, '#6a8f2f', 10); },
    blast_front: (g, r) => { noise(g, r, '#5b5c60', 0.1); frame(g, '#3a3b3e', 1); R(g, 4, 7, 8, 6, hex('#151515')); R(g, 4, 7, 8, 1, hex('#9a9da0')); R(g, 2, 2, 12, 2, hex('#9a9da0')); },
    blast_side: (g, r) => { noise(g, r, '#5b5c60', 0.1); frame(g, '#3a3b3e', 1); R(g, 0, 7, 16, 2, hex('#7d8084')); },
    fletching_top: (g, r) => { planks(g, r, '#d9c88a'); R(g, 3, 3, 2, 10, hex('#f4f4f4')); R(g, 9, 5, 2, 8, hex('#c9302c')); },
    fletching_side: (g, r) => { planks(g, r, '#c9b77a'); R(g, 2, 3, 12, 6, hex('#e9e1c8')); },
    smithing_top: (g, r) => { noise(g, r, '#2e2f35', 0.1); frame(g, '#1d1e22', 1); R(g, 3, 3, 10, 10, hex('#3c3e45')); },
    smithing_side: (g, r) => { planks(g, r, '#4a3424'); R(g, 0, 0, 16, 4, hex('#2e2f35')); },
    sandstone: (g, r) => { noise(g, r, '#d8c98f', 0.06); R(g, 0, 0, 16, 2, hex('#c9b878')); R(g, 0, 13, 16, 3, hex('#c2b070')); },
    sandstone_top: (g, r) => noise(g, r, '#ded0a0', 0.05),
    birch_planks: (g, r) => planks(g, r, '#c8b77a'),
    birch_log: (g, r) => { noise(g, r, '#dcd8cc', 0.05); for (let i = 0; i < 9; i++) R(g, (r() * 13) | 0, (r() * 16) | 0, 2 + ((r() * 3) | 0), 1, hex('#3d3a33')); },
    birch_log_top: (g, r) => logTop(g, r, '#d6c48a', '#dcd8cc'),
    dark_oak_planks: (g, r) => planks(g, r, '#4a3020'),
    dark_oak_log: (g, r) => logSide(g, r, '#3a2a1a'),
    dark_oak_log_top: (g, r) => logTop(g, r, '#5a3d24', '#3a2a1a'),
    cherry_planks: (g, r) => planks(g, r, '#e4b4a8'),
    cherry_log: (g, r) => logSide(g, r, '#3b2028'),
    cherry_log_top: (g, r) => logTop(g, r, '#d79a90', '#3b2028'),
    cherry_leaves: (g, r) => { noise(g, r, '#f2b6cf', 0.18); specks(g, r, '#e58fb4', 26); },
    bricks: (g, r) => bricks(g, r, '#9a4a3a', '#c9b8a8', 8, 4),
    snow: (g, r) => noise(g, r, '#f4f8fa', 0.03),
    bookshelf: (g, r) => {
      planks(g, r, '#a8864f');
      const cols = ['#8a2a2a', '#2a4a8a', '#2a7a3a', '#c9a13a', '#5a2a6a'];
      for (const y of [1, 9]) for (let x = 1; x < 15; x += 2) R(g, x, y, 2, 6, hex(cols[(r() * cols.length) | 0]));
    },
    barrel_side: (g, r) => { planks(g, r, '#7a5a34'); R(g, 0, 3, 16, 1, hex('#3c3c3c')); R(g, 0, 12, 16, 1, hex('#3c3c3c')); },
    barrel_top: (g, r) => { noise(g, r, '#8a6a3c', 0.08); frame(g, '#3c3c3c', 1); R(g, 6, 6, 4, 4, hex('#4a3420')); },
    anvil: (g, r) => { noise(g, r, '#45464a', 0.08); frame(g, '#2f3033', 1); },
    bell: (g, r) => { noise(g, r, '#e8c04a', 0.1); R(g, 0, 13, 16, 3, hex('#b88e22')); },
    quartz: (g, r) => noise(g, r, '#ece6de', 0.03),
    smooth_stone: (g, r) => { noise(g, r, '#a3a3a3', 0.04); frame(g, '#8f8f8f', 1); },
    beehive_side: (g, r) => { planks(g, r, '#b98c4c'); R(g, 0, 0, 16, 2, hex('#d7b25a')); },
    beehive_front: (g, r) => { planks(g, r, '#b98c4c'); R(g, 0, 0, 16, 2, hex('#d7b25a')); R(g, 5, 9, 6, 3, hex('#2a1e10')); },
    beehive_top: (g, r) => { noise(g, r, '#d7b25a', 0.1); frame(g, '#a7782f', 1); },
    soul_soil: (g, r) => { noise(g, r, '#4b3a2e', 0.18); specks(g, r, '#2e231b', 18); },
    blue_ice: (g, r) => { noise(g, r, '#74b4f0', 0.08); specks(g, r, '#a8d4fa', 20); },
    basalt: (g, r) => { for (let x = 0; x < 16; x++) for (let y = 0; y < 16; y++) P(g, x, y, mul(hex('#4b4b50'), (x % 4 === 0 ? 0.75 : 1) * (1 + (r() - 0.5) * 0.12))); },
    powered_rail: (g) => {
      g.clearRect(0, 0, 16, 16);
      for (let y = 1; y < 16; y += 3) R(g, 2, y, 12, 2, hex('#6b4f2c'));
      R(g, 3, 0, 1, 16, hex('#e0b23a')); R(g, 12, 0, 1, 16, hex('#e0b23a')); R(g, 7, 0, 2, 16, hex('#b0221a'));
    },
    redstone_block: (g, r) => { noise(g, r, '#b0170e', 0.1); frame(g, '#7a0e08', 1); },
    magma: (g, r) => { voronoi(g, r, '#4a1d0c', 8, 0.9, 0.2); specks(g, r, '#f08a1a', 22); },
    soul_sand: (g, r) => { noise(g, r, '#5b4535', 0.15); for (const [x, y] of [[3, 4], [10, 3], [6, 10], [12, 11]]) R(g, x, y, 2, 2, hex('#2e2219')); },
    poppy: (g) => { g.clearRect(0, 0, 16, 16); R(g, 7, 7, 2, 9, hex('#4f8a2a')); R(g, 5, 3, 6, 5, hex('#c8221c')); R(g, 7, 4, 2, 2, hex('#2a1a10')); },
    dandelion: (g) => { g.clearRect(0, 0, 16, 16); R(g, 7, 8, 2, 8, hex('#4f8a2a')); R(g, 5, 4, 6, 4, hex('#f2d22a')); },
    red_wool: (g, r) => { noise(g, r, '#a82a24', 0.07); specks(g, r, '#8a1e1a', 24); },
    terracotta: (g, r) => noise(g, r, '#a0583a', 0.05),
    prismarine: (g, r) => bricks(g, r, '#5aa89a', '#3b7a70', 8, 8)
  };

  const texCache = new Map();
  function texCanvas(key) {
    if (texCache.has(key)) return texCache.get(key);
    const c = document.createElement('canvas');
    c.width = c.height = 16;
    const g = c.getContext('2d');
    (TEX[key] || TEX.stone)(g, rng(hash(key)));
    texCache.set(key, c);
    return c;
  }

  /* ---------- Platzierungshinweise ---------- */
  const H = {
    facingFront(f) {
      if (f === 'u') return 'Vorderseite nach oben: beim Platzieren steil nach unten schauen.';
      if (f === 'd') return 'Vorderseite nach unten: von unten platzieren und steil nach oben schauen.';
      return 'Vorderseite zeigt nach ' + DIR_NAME[f] + ': beim Platzieren nach ' + DIR_NAME[OPP[f]] + ' schauen.';
    },
    piston(f) {
      if (f === 'u') return 'Kolbenkopf zeigt nach oben: beim Platzieren nach unten schauen.';
      if (f === 'd') return 'Kolbenkopf zeigt nach unten: beim Platzieren nach oben schauen.';
      return 'Kolbenkopf zeigt nach ' + DIR_NAME[f] + '. Stell dich auf die ' + DIR_NAME[f] + '-Seite und schau nach ' + DIR_NAME[OPP[f]] + '.';
    },
    observer(f) {
      if (f === 'd') return 'Gesicht schaut nach unten, roter Punkt nach oben: beim Platzieren nach unten schauen.';
      if (f === 'u') return 'Gesicht schaut nach oben, roter Punkt nach unten: beim Platzieren nach oben schauen.';
      return 'Gesicht schaut nach ' + DIR_NAME[f] + ', roter Punkt nach ' + DIR_NAME[OPP[f]] + '. Beim Platzieren nach ' + DIR_NAME[f] + ' schauen.';
    },
    hopper(f) {
      if (f === 'd') return 'Ausgang nach unten: einfach von oben auf den Block darunter setzen.';
      return 'Ausgang zeigt nach ' + DIR_NAME[f] + ': Shift + Rechtsklick auf die Seite des Zielblocks im ' + DIR_NAME[f] + '.';
    },
    stairs(f, p) {
      let t = 'Hohe Seite nach ' + DIR_NAME[f] + ': beim Platzieren nach ' + DIR_NAME[f] + ' schauen.';
      if (p.half === 'top') t += ' Umgedreht: die obere Hälfte eines Blocks anklicken.';
      return t;
    },
    attached(f, what) {
      return what + ' an der Wand im ' + DIR_NAME[OPP[f]] + ' anbringen (zeigt nach ' + DIR_NAME[f] + ').';
    }
  };

  /* ---------- Registry ----------
     shape: Geometrie im 3D-Viewer; color: Farbe im 2D-Raster; item: Name in der Materialliste;
     auto: entsteht von selbst (nicht in Materialliste); stack: Stapelgröße. */
  const B = {
    stone: { name: 'Stein', shape: 'cube', tex: { all: 'stone' }, color: '#7f7f7f' },
    cobblestone: { name: 'Bruchstein', shape: 'cube', tex: { all: 'cobble' }, color: '#8a8a8a' },
    stone_bricks: { name: 'Steinziegel', shape: 'cube', tex: { all: 'stone_bricks' }, color: '#7a7a7a' },
    dirt: { name: 'Erde', shape: 'cube', tex: { all: 'dirt' }, color: '#866043' },
    grass_block: { name: 'Grasblock', shape: 'cube', tex: { top: 'grass_top', bottom: 'dirt', side: 'grass_side' }, color: '#6aa84f' },
    dirt_path: { name: 'Trampelpfad', shape: 'farmland', tex: { top: 'path_top', bottom: 'dirt', side: 'dirt' }, color: '#9a8456', hint: () => 'Mit einer Schaufel auf Gras rechtsklicken.' },
    farmland: { name: 'Ackerboden', shape: 'farmland', tex: { top: 'farmland_top', bottom: 'dirt', side: 'dirt' }, color: '#56371f', item: 'Erde (mit Hacke umgraben)', hint: () => 'Erde hinlegen und mit einer Hacke umgraben.' },
    sand: { name: 'Sand', shape: 'cube', tex: { all: 'sand' }, color: '#dccf9e' },
    glass: { name: 'Glas', shape: 'cube', tex: { all: 'glass' }, transparent: true, color: '#cfe8f3' },
    glass_pane: { name: 'Glasscheibe', shape: 'pane', tex: { all: 'glass' }, transparent: true, color: '#cfe8f3' },
    oak_planks: { name: 'Eichenholzbretter', shape: 'cube', tex: { all: 'oak_planks' }, color: '#a8864f' },
    spruce_planks: { name: 'Fichtenholzbretter', shape: 'cube', tex: { all: 'spruce_planks' }, color: '#715231' },
    mangrove_planks: { name: 'Mangrovenholzbretter', shape: 'cube', tex: { all: 'mangrove_planks' }, color: '#7a3330' },
    oak_log: { name: 'Eichenstamm', shape: 'cube', tex: { top: 'oak_log_top', bottom: 'oak_log_top', side: 'oak_log' }, color: '#6b5232', hint: () => 'Stehend platzieren (auf die Oberseite des Blocks darunter klicken).' },
    spruce_log: { name: 'Fichtenstamm', shape: 'cube', tex: { top: 'spruce_log_top', bottom: 'spruce_log_top', side: 'spruce_log' }, color: '#3b2a18', hint: () => 'Stehend platzieren (auf die Oberseite des Blocks darunter klicken).' },
    oak_leaves: { name: 'Eichenlaub', shape: 'cube', tex: { all: 'leaves' }, color: '#3f7a2c' },
    oak_stairs: { name: 'Eichenholztreppe', shape: 'stairs', tex: { all: 'oak_planks' }, color: '#b8955c', hint: H.stairs },
    spruce_stairs: { name: 'Fichtenholztreppe', shape: 'stairs', tex: { all: 'spruce_planks' }, color: '#7f5e3a', hint: H.stairs },
    stone_brick_stairs: { name: 'Steinziegeltreppe', shape: 'stairs', tex: { all: 'stone_bricks' }, color: '#8a8a8a', hint: H.stairs },
    cobblestone_stairs: { name: 'Bruchsteintreppe', shape: 'stairs', tex: { all: 'cobble' }, color: '#969696', hint: H.stairs },
    oak_slab: { name: 'Eichenholzstufe', shape: 'slab', tex: { all: 'oak_planks' }, color: '#b8955c', hint: (f, p) => p.half === 'top' ? 'Obere Hälfte: an die obere Hälfte eines Blocks klicken.' : 'Untere Hälfte: auf den Boden setzen.' },
    spruce_slab: { name: 'Fichtenholzstufe', shape: 'slab', tex: { all: 'spruce_planks' }, color: '#7f5e3a', hint: (f, p) => p.half === 'top' ? 'Obere Hälfte: an die obere Hälfte eines Blocks klicken.' : 'Untere Hälfte: auf den Boden setzen.' },
    stone_brick_slab: { name: 'Steinziegelstufe', shape: 'slab', tex: { all: 'stone_bricks' }, color: '#8a8a8a', hint: (f, p) => p.half === 'top' ? 'Obere Hälfte: an die obere Hälfte eines Blocks klicken.' : 'Untere Hälfte: auf den Boden setzen.' },
    cobblestone_slab: { name: 'Bruchsteinstufe', shape: 'slab', tex: { all: 'cobble' }, color: '#969696', hint: (f, p) => p.half === 'top' ? 'Obere Hälfte: an die obere Hälfte eines Blocks klicken.' : 'Untere Hälfte: auf den Boden setzen.' },
    oak_fence: { name: 'Eichenholzzaun', shape: 'fence', tex: { all: 'oak_planks' }, color: '#a8864f' },
    spruce_fence: { name: 'Fichtenholzzaun', shape: 'fence', tex: { all: 'spruce_planks' }, color: '#715231' },
    oak_door: { name: 'Eichenholztür', shape: 'door', tex: { all: 'door' }, color: '#a07a45', partCount: 'lower', hint: (f) => 'Tür: beim Platzieren nach ' + DIR_NAME[f] + ' schauen (Türblatt auf der ' + DIR_NAME[OPP[f]] + '-Seite).' },
    ladder: { name: 'Leiter', shape: 'ladder', tex: { all: 'ladder' }, color: '#9a7445', hint: (f) => H.attached(f, 'Leiter') },
    lantern: { name: 'Laterne', shape: 'lantern', tex: { all: 'lantern' }, color: '#f1b54b', emissive: true },
    crafting_table: { name: 'Werkbank', shape: 'cube', tex: { top: 'crafting_top', bottom: 'oak_planks', side: 'crafting_side' }, color: '#9c7a45' },
    hay_block: { name: 'Strohballen', shape: 'cube', tex: { top: 'hay_top', bottom: 'hay_top', side: 'hay_side' }, color: '#c9a227' },
    white_concrete: { name: 'Weißer Beton', shape: 'cube', tex: { all: 'white_concrete' }, color: '#e4e8e8' },
    red_concrete: { name: 'Roter Beton', shape: 'cube', tex: { all: 'red_concrete' }, color: '#8e2420' },
    sea_lantern: { name: 'Seelaterne', shape: 'cube', tex: { all: 'sea_lantern' }, color: '#cfe3dc', emissive: true },
    glowstone: { name: 'Leuchtstein', shape: 'cube', tex: { all: 'glowstone' }, color: '#e2b65a', emissive: true },

    water: { name: 'Wasserquelle', shape: 'liquid', tex: { all: 'water' }, transparent: true, color: '#3d6ad6', item: 'Wassereimer', stack: 1, hint: () => 'Mit einem Wassereimer platzieren (Quellblock).' },
    water_env: { name: 'Gewässer (vorhanden)', shape: 'liquid', tex: { all: 'water' }, transparent: true, color: '#4f7bdc', auto: true, hint: () => 'Vorhandenes Wasser: Baue diesen Teil einfach in einem Fluss, See oder Meer.' },
    water_flow: { name: 'Fließendes Wasser', shape: 'liquid', tex: { all: 'water_flow' }, transparent: true, color: '#8fb3f0', auto: true, flow: true, hint: () => 'Entsteht von selbst aus den Quellen. Nicht platzieren.' },
    lava: { name: 'Lavaquelle', shape: 'liquid', tex: { all: 'lava' }, color: '#e06a12', emissive: true, item: 'Lavaeimer', stack: 1, hint: () => 'Mit einem Lavaeimer platzieren, erst wenn alle Schilder hängen.' },

    hopper: { name: 'Trichter', shape: 'hopper', tex: { all: 'hopper' }, color: '#45454a', hint: H.hopper },
    chest: { name: 'Truhe', shape: 'chest', tex: { all: 'chest' }, color: '#a8702b', hint: (f) => H.facingFront(f) + ' Zwei Truhen nebeneinander werden zur Doppeltruhe.' },
    furnace: { name: 'Ofen', shape: 'cube', tex: { front: 'furnace_front', side: 'furnace_side', top: 'furnace_top', bottom: 'furnace_top' }, color: '#6f6f6f', hint: H.facingFront },
    dispenser: { name: 'Werfer', shape: 'cube', tex: { front: 'dispenser_front', side: 'furnace_side', top: 'furnace_top', bottom: 'furnace_top' }, color: '#6a6a6a', hint: (f) => H.facingFront(f) + ' Einen Wassereimer hineinlegen.' },
    piston: { name: 'Kolben', shape: 'piston', tex: { all: 'piston_body' }, color: '#9a8455', hint: H.piston },
    observer: { name: 'Beobachter', shape: 'cube', tex: { front: 'observer_front', back: 'observer_back', side: 'observer_side' }, color: '#5a5a5a', hint: H.observer },
    redstone: { name: 'Redstone-Staub', shape: 'dust', color: '#d42a1e', item: 'Redstone', hint: () => 'Redstone auf den Block darunter streuen.' },
    stone_button: { name: 'Steinknopf', shape: 'button', tex: { all: 'button' }, color: '#9a9a9a', hint: (f) => H.attached(f, 'Knopf') },
    oak_wall_sign: { name: 'Eichenholzschild', shape: 'wall_sign', tex: { all: 'sign' }, color: '#c7a56b', stack: 16, item: 'Eichenholzschild', hint: (f) => H.attached(f, 'Schild') + ' Text leer lassen (Esc).' },
    rail_cart: { name: 'Schiene + Trichterlore', shape: 'rail_cart', tex: { all: 'rail' }, color: '#8a8a8a', items: [['Schiene', 1, 64], ['Trichterlore', 1, 1]], hint: () => 'Zuerst die Schiene, dann eine Trichterlore daraufsetzen. Die Lore bleibt stehen, weil die Enden blockiert sind.' },
    red_bed: { name: 'Rotes Bett', shape: 'bed', color: '#a82a24', partCount: 'foot', stack: 1, item: 'Rotes Bett', hint: (f) => 'Kopfteil zeigt nach ' + DIR_NAME[f] + ': nach ' + DIR_NAME[f] + ' schauen und auf das Fußende klicken.' },

    sugar_cane: { name: 'Zuckerrohr', shape: 'cross', tex: { all: 'sugar_cane' }, color: '#8ccf6a', hint: () => 'Auf die Erde pflanzen (Wasser muss direkt daneben liegen).' },
    sugar_cane_auto: { name: 'Zuckerrohr (wächst)', shape: 'cross', tex: { all: 'sugar_cane' }, color: '#8ccf6a', auto: true, hint: () => 'Wächst von selbst nach. Nicht platzieren.' },
    pumpkin_stem: { name: 'Kürbiskerne', shape: 'cross', tex: { all: 'stem' }, color: '#6f9a2e', item: 'Kürbis- oder Melonenkerne', hint: () => 'Kerne auf den Ackerboden pflanzen.' },
    pumpkin_auto: { name: 'Kürbis (wächst)', shape: 'cube', tex: { top: 'pumpkin_top', bottom: 'pumpkin_top', side: 'pumpkin_side' }, color: '#c97614', auto: true, ghost: true, hint: () => 'Hier wächst der Kürbis. Der Platz muss frei bleiben.' },
    wheat: { name: 'Weizen', shape: 'cross', tex: { all: 'wheat' }, color: '#d9b64a', item: 'Weizenkörner', hint: () => 'Weizenkörner auf den Ackerboden pflanzen.' },

    villager: { name: 'Dorfbewohner', shape: 'entity', kind: 'villager', color: '#7b5a3a', entity: true, hint: () => 'Dorfbewohner hierher bringen, z. B. mit Boot oder Lore. Kinder zählen nicht.' },
    zombie: { name: 'Zombie', shape: 'entity', kind: 'zombie', color: '#4f8a4a', entity: true, hint: () => 'Zombie hierher locken und mit einem Namensschild benennen, damit er nicht verschwindet.' },
    chicken: { name: 'Huhn', shape: 'entity', kind: 'chicken', color: '#f2f2f2', entity: true, hint: () => 'Eier in das Gehege werfen, bis Küken schlüpfen.' },

    bamboo: { name: 'Bambus', shape: 'bamboo', tex: { side: 'bamboo', top: 'bamboo_top' }, color: '#5f9e2f', hint: () => 'Bambus auf die Erde pflanzen.' },
    bamboo_auto: { name: 'Bambus (wächst)', shape: 'bamboo', tex: { side: 'bamboo', top: 'bamboo_top' }, color: '#5f9e2f', auto: true, ghost: true, hint: () => 'Wächst von selbst nach. Nicht platzieren.' },
    oak_trapdoor: { name: 'Falltür (offen)', shape: 'trapdoor', tex: { all: 'trapdoor' }, color: '#a07a45', item: 'Eichenholzfalltür', hint: (f) => 'Auf die untere Hälfte der Blockseite im ' + DIR_NAME[OPP[f]] + ' klicken, dann rechtsklicken, damit sie offen an der Wand steht.' },
    cauldron: { name: 'Kessel', shape: 'cauldron', tex: { all: 'cauldron' }, color: '#45464b', hint: () => 'Direkt unter die Spitze des Tropfsteins stellen. Später mit einem leeren Eimer ernten.' },
    pointed_dripstone: { name: 'Spitzer Tropfstein', shape: 'cross', tex: { all: 'dripstone' }, color: '#a5836a', hint: () => 'Von unten an den Block kleben (an die Unterseite klicken), Spitze zeigt nach unten.' },
    obsidian: { name: 'Obsidian', shape: 'cube', tex: { all: 'obsidian' }, color: '#2a1e3c', hint: () => 'Nur mit einer Diamant- oder Netheritspitzhacke abbaubar. Alternativ Wasser auf Lavaquellen gießen.' },
    nether_portal: { name: 'Portal', shape: 'portal', tex: { all: 'portal' }, color: '#8a3cdc', auto: true, hint: () => 'Mit Feuerzeug den Rahmen innen anzünden. Das Portal entsteht von selbst.' },
    iron_block: { name: 'Eisenblock', shape: 'cube', tex: { all: 'iron_block' }, color: '#d6d8da', hint: () => 'Geht auch mit Gold-, Smaragd-, Diamant- oder Netheritblöcken, auch gemischt.' },
    beacon: { name: 'Leuchtfeuer', shape: 'beacon', tex: { all: 'beacon' }, color: '#7fe8e0', emissive: true, stack: 64, hint: () => 'In die Mitte oben setzen. Darüber muss freier Himmel sein (Glas ist erlaubt).' },
    white_wool: { name: 'Weiße Wolle', shape: 'cube', tex: { all: 'wool' }, color: '#eaeceb' },
    gray_concrete: { name: 'Grauer Beton', shape: 'cube', tex: { all: 'gray_concrete' }, color: '#3b3f44' },
    lectern: { name: 'Lesepult', shape: 'cube', tex: { top: 'lectern_top', bottom: 'oak_planks', side: 'lectern_side' }, color: '#a8864f', hint: () => 'Arbeitsplatz für Bibliothekare.' },
    composter: { name: 'Komposter', shape: 'cube', tex: { top: 'composter_top', bottom: 'oak_planks', side: 'composter_side' }, color: '#8a6a3c', hint: () => 'Arbeitsplatz für Bauern.' },
    blast_furnace: { name: 'Schmelzofen', shape: 'cube', tex: { front: 'blast_front', side: 'blast_side', top: 'blast_side', bottom: 'blast_side' }, color: '#5b5c60', hint: (f) => H.facingFront(f) + ' Arbeitsplatz für Rüstungsschmiede.' },
    fletching_table: { name: 'Bognertisch', shape: 'cube', tex: { top: 'fletching_top', bottom: 'oak_planks', side: 'fletching_side' }, color: '#d9c88a', hint: () => 'Arbeitsplatz für Pfeilmacher (Smaragde für Stöcke).' },
    smithing_table: { name: 'Schmiedetisch', shape: 'cube', tex: { top: 'smithing_top', bottom: 'smithing_side', side: 'smithing_side' }, color: '#2e2f35', hint: () => 'Arbeitsplatz für Werkzeugschmiede.' },
    sandstone: { name: 'Sandstein', shape: 'cube', tex: { top: 'sandstone_top', bottom: 'sandstone_top', side: 'sandstone' }, color: '#d8c98f' },
    sandstone_stairs: { name: 'Sandsteintreppe', shape: 'stairs', tex: { all: 'sandstone_top' }, color: '#e2d6a6', hint: H.stairs },
    sandstone_slab: { name: 'Sandsteinstufe', shape: 'slab', tex: { all: 'sandstone_top' }, color: '#e2d6a6' },
    birch_planks: { name: 'Birkenholzbretter', shape: 'cube', tex: { all: 'birch_planks' }, color: '#c8b77a' },
    birch_log: { name: 'Birkenstamm', shape: 'cube', tex: { top: 'birch_log_top', bottom: 'birch_log_top', side: 'birch_log' }, color: '#dcd8cc' },
    birch_stairs: { name: 'Birkenholztreppe', shape: 'stairs', tex: { all: 'birch_planks' }, color: '#d4c48a', hint: H.stairs },
    dark_oak_planks: { name: 'Schwarzeichenbretter', shape: 'cube', tex: { all: 'dark_oak_planks' }, color: '#4a3020' },
    dark_oak_log: { name: 'Schwarzeichenstamm', shape: 'cube', tex: { top: 'dark_oak_log_top', bottom: 'dark_oak_log_top', side: 'dark_oak_log' }, color: '#3a2a1a' },
    dark_oak_stairs: { name: 'Schwarzeichentreppe', shape: 'stairs', tex: { all: 'dark_oak_planks' }, color: '#5a3c28', hint: H.stairs },
    dark_oak_slab: { name: 'Schwarzeichenstufe', shape: 'slab', tex: { all: 'dark_oak_planks' }, color: '#5a3c28' },
    dark_oak_fence: { name: 'Schwarzeichenzaun', shape: 'fence', tex: { all: 'dark_oak_planks' }, color: '#4a3020' },
    cherry_planks: { name: 'Kirschholzbretter', shape: 'cube', tex: { all: 'cherry_planks' }, color: '#e4b4a8' },
    cherry_log: { name: 'Kirschholzstamm', shape: 'cube', tex: { top: 'cherry_log_top', bottom: 'cherry_log_top', side: 'cherry_log' }, color: '#3b2028' },
    cherry_stairs: { name: 'Kirschholztreppe', shape: 'stairs', tex: { all: 'cherry_planks' }, color: '#e9c0b4', hint: H.stairs },
    cherry_leaves: { name: 'Kirschblätter', shape: 'cube', tex: { all: 'cherry_leaves' }, color: '#f2b6cf' },
    bricks: { name: 'Ziegelsteine', shape: 'cube', tex: { all: 'bricks' }, color: '#9a4a3a' },
    brick_stairs: { name: 'Ziegeltreppe', shape: 'stairs', tex: { all: 'bricks' }, color: '#a8584a', hint: H.stairs },
    snow_block: { name: 'Schneeblock', shape: 'cube', tex: { all: 'snow' }, color: '#f4f8fa' },
    bookshelf: { name: 'Bücherregal', shape: 'cube', tex: { top: 'oak_planks', bottom: 'oak_planks', side: 'bookshelf' }, color: '#8a5a3a' },
    barrel: { name: 'Fass', shape: 'cube', tex: { top: 'barrel_top', bottom: 'barrel_top', side: 'barrel_side' }, color: '#7a5a34' },
    anvil: { name: 'Amboss', shape: 'anvil', tex: { all: 'anvil' }, color: '#45464a', hint: (f) => 'Amboss: Lange Seite zeigt quer zu deiner Blickrichtung.' },
    bell: { name: 'Glocke', shape: 'bell', tex: { all: 'bell' }, color: '#e8c04a', hint: () => 'Auf den Block darunter setzen.' },
    quartz_block: { name: 'Quarzblock', shape: 'cube', tex: { all: 'quartz' }, color: '#ece6de' },
    smooth_stone: { name: 'Glatter Stein', shape: 'cube', tex: { all: 'smooth_stone' }, color: '#a3a3a3' },
    smooth_stone_slab: { name: 'Glatte Steinstufe', shape: 'slab', tex: { all: 'smooth_stone' }, color: '#a3a3a3' },
    cobblestone_wall: { name: 'Bruchsteinmauer', shape: 'wall', tex: { all: 'cobble' }, color: '#8a8a8a' },
    red_carpet: { name: 'Roter Teppich', shape: 'carpet', tex: { all: 'red_wool' }, color: '#a82a24' },
    red_wool: { name: 'Rote Wolle', shape: 'cube', tex: { all: 'red_wool' }, color: '#a82a24' },
    terracotta: { name: 'Keramik', shape: 'cube', tex: { all: 'terracotta' }, color: '#a0583a' },
    prismarine_bricks: { name: 'Prismarinziegel', shape: 'cube', tex: { all: 'prismarine' }, color: '#5aa89a' },
    beehive: { name: 'Bienenstock', shape: 'cube', tex: { front: 'beehive_front', side: 'beehive_side', top: 'beehive_top', bottom: 'beehive_top' }, color: '#b98c4c', hint: (f) => 'Eingang zeigt nach ' + DIR_NAME[f] + ', davor muss frei sein. Mit Bienen drin: Bienennest mit Behutsamkeit abbauen oder Bienen mit Blumen anlocken.' },
    soul_soil: { name: 'Seelenerde', shape: 'cube', tex: { all: 'soul_soil' }, color: '#4b3a2e', hint: () => 'Gibt es im Seelensandtal im Nether.' },
    soul_sand: { name: 'Seelensand', shape: 'cube', tex: { all: 'soul_sand' }, color: '#5b4535', hint: () => 'Erzeugt im Wasser darüber eine Blasensäule nach oben.' },
    magma_block: { name: 'Magmablock', shape: 'cube', tex: { all: 'magma' }, color: '#6a2a10', emissive: true, hint: () => 'Erzeugt im Wasser darüber eine Blasensäule nach unten.' },
    blue_ice: { name: 'Blaues Eis', shape: 'cube', tex: { all: 'blue_ice' }, color: '#74b4f0', hint: () => 'Aus 9 Packeis herstellen oder in Eisbergen finden.' },
    basalt_auto: { name: 'Basalt (entsteht)', shape: 'cube', tex: { all: 'basalt' }, color: '#4b4b50', auto: true, ghost: true, hint: () => 'Hier entsteht Basalt. Abbauen, er bildet sich sofort neu.' },
    stone_auto: { name: 'Stein (entsteht)', shape: 'cube', tex: { all: 'stone' }, color: '#7f7f7f', auto: true, ghost: true, hint: () => 'Hier entsteht Stein. Mit Behutsamkeit bekommst du Stein, sonst Bruchstein.' },
    powered_rail: { name: 'Antriebsschiene', shape: 'rail', tex: { all: 'powered_rail' }, color: '#e0b23a', hint: () => 'Wird durch den Redstone-Block darunter dauerhaft angetrieben.' },
    rail: { name: 'Schiene', shape: 'rail', tex: { all: 'rail' }, color: '#a7a7a7' },
    redstone_block: { name: 'Redstone-Block', shape: 'cube', tex: { all: 'redstone_block' }, color: '#b0170e' },
    poppy: { name: 'Mohn', shape: 'cross', tex: { all: 'poppy' }, color: '#c8221c' },
    dandelion: { name: 'Löwenzahn', shape: 'cross', tex: { all: 'dandelion' }, color: '#f2d22a' },
    spruce_fence_gate: { name: 'Fichtenholzzauntor', shape: 'gate', tex: { all: 'spruce_planks' }, color: '#715231', hint: (f) => 'Zauntor: beim Platzieren nach ' + DIR_NAME[f] + ' oder ' + DIR_NAME[OPP[f]] + ' schauen.' },
    cobble_auto: { name: 'Bruchstein (entsteht)', shape: 'cube', tex: { all: 'cobble' }, color: '#8a8a8a', auto: true, ghost: true, hint: () => 'Hier entsteht der Bruchstein. Abbauen, er bildet sich sofort neu.' }
  };

  for (const id in B) B[id].id = id;

  /* "piston:n", "oak_stairs:s:top", "oak_door:s:upper", "red_bed:e:head" */
  const PROPS = { top: 'half', bottom: 'half', upper: 'part', lower: 'part', head: 'part', foot: 'part' };
  function parse(str) {
    const parts = str.split(':');
    const out = { id: parts[0], facing: null, half: null, part: null };
    for (let i = 1; i < parts.length; i++) {
      const p = parts[i];
      if (DIRS[p]) out.facing = p;
      else if (PROPS[p]) out[PROPS[p]] = p;
    }
    if (!B[out.id]) console.warn('Unbekannter Block:', out.id);
    return out;
  }

  function hintFor(cell) {
    const def = B[cell.id];
    if (!def) return '';
    if (def.hint) return def.hint(cell.facing || 'n', cell);
    return '';
  }

  /* Liefert [[Name, Anzahl, Stapelgröße]] für die Materialliste. */
  function itemsFor(cell) {
    const def = B[cell.id];
    if (!def || def.auto) return [];
    if (def.partCount && cell.part && cell.part !== def.partCount) return [];
    if (def.items) return def.items;
    return [[def.item || def.name, 1, def.stack || (def.entity ? 0 : 64)]];
  }


  /* ---------- Java-Befehle (Kreativ-Test) ---------- */
  const MC_ID = { barrel: 'barrel[facing=up]', bell: 'bell[attachment=floor]', cherry_leaves: 'cherry_leaves[persistent=true]', farmland: 'farmland[moisture=7]', oak_leaves: 'oak_leaves[persistent=true]', redstone: 'redstone_wire', hay_block: 'hay_block[axis=y]',
    sugar_cane: 'sugar_cane', pumpkin_stem: 'pumpkin_stem', pointed_dripstone: 'pointed_dripstone[vertical_direction=down,thickness=tip]' };
  const FACING_PROP = { hopper: 1, chest: 1, furnace: 1, dispenser: 1, piston: 1, observer: 1, ladder: 1, oak_wall_sign: 1, lectern: 1, blast_furnace: 1, spruce_fence_gate: 1, beehive: 1, anvil: 1 };
  function javaState(c) {
    const def = B[c.id];
    if (!def || def.auto || def.entity) return null;
    if (c.id === 'rail_cart') return 'rail[shape=' + (c.facing === 'e' || c.facing === 'w' ? 'east_west' : 'north_south') + ']';
    if (def.shape === 'rail') return c.id + '[shape=' + (c.facing === 'e' || c.facing === 'w' ? 'east_west' : 'north_south') + (c.id === 'powered_rail' ? ',powered=true' : '') + ']';
    if (MC_ID[c.id]) return MC_ID[c.id];
    const f = MC.DIR_NAME_EN[c.facing || 'n'];
    switch (def.shape) {
      case 'stairs': return c.id + '[facing=' + f + ',half=' + (c.half || 'bottom') + ']';
      case 'slab': return c.id + '[type=' + (c.half || 'bottom') + ']';
      case 'door': return c.id + '[facing=' + f + ',half=' + (c.part || 'lower') + ']';
      case 'bed': return c.id + '[facing=' + f + ',part=' + (c.part || 'foot') + ']';
      case 'trapdoor': return c.id + '[facing=' + f + ',open=true,half=bottom]';
      case 'button': return c.id + '[face=wall,facing=' + f + ']';
    }
    if (FACING_PROP[c.id] && c.facing) return c.id + '[facing=' + f + ']';
    return c.id;
  }
  const LATE = { rail: 1, carpet: 1, bell: 1, ladder: 1, wall_sign: 1, button: 1, trapdoor: 1, door: 1, lantern: 1, dust: 1, cross: 1, bamboo: 1, rail_cart: 1 };
  /* Liefert .mcfunction-Zeilen. Der Bau beginnt 2 Blöcke östlich vom Ausführenden. */
  function javaCommands(cells, ox) {
    ox = ox == null ? 2 : ox;
    const pos = (c, dx) => '~' + (c.x + ox + (dx || 0)) + ' ~' + c.y + ' ~' + c.z;
    const rank = (c) => { const d = B[c.id]; return d.shape === 'liquid' ? 2 : LATE[d.shape] ? 1 : 0; };
    const list = cells.slice().sort((a, b) => rank(a) - rank(b) || a.y - b.y || a.z - b.z || a.x - b.x);
    const out = [];
    list.forEach((c) => { const st = javaState(c); if (st) out.push('setblock ' + pos(c) + ' minecraft:' + st); });
    cells.forEach((c) => {
      const p = '~' + (c.x + ox) + '.5 ~' + c.y + ' ~' + c.z + '.5';
      if (c.id === 'rail_cart') out.push('summon minecraft:hopper_minecart ' + p);
      if (c.id === 'villager') out.push('summon minecraft:villager ' + p + ' {PersistenceRequired:1b}');
      if (c.id === 'zombie') out.push('summon minecraft:zombie ' + p + ' {PersistenceRequired:1b,CustomName:\'"Zombie"\'}');
      if (c.id === 'chicken') out.push('summon minecraft:chicken ' + p + ' {PersistenceRequired:1b}');
    });
    return out;
  }

  global.MC = { DIRS, OPP, DIR_NAME, DIR_SHORT, DIR_NAME_EN: { n: 'north', s: 'south', e: 'east', w: 'west', u: 'up', d: 'down' }, BLOCKS: B, parse, texCanvas, hintFor, itemsFor, javaCommands };
})(window);
