/* Blockplan – 3D-Ansicht mit Three.js (r128). */
(function (global) {
  'use strict';
  const D = (c) => MC.BLOCKS[c.id] || MC.BLOCKS.stone;
  const ORDER = ['e', 'w', 'u', 'd', 's', 'n'];

  /* ---------- Materialien ---------- */
  const texCache = new Map(), matCache = new Map(), geoCache = new Map(), ghostCache = new Map();
  function texture(key) {
    if (texCache.has(key)) return texCache.get(key);
    const t = new THREE.CanvasTexture(MC.texCanvas(key));
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    texCache.set(key, t);
    return t;
  }
  function mat(key, o) {
    o = o || {};
    const ck = key + '|' + JSON.stringify(o);
    if (matCache.has(ck)) return matCache.get(ck);
    const p = { map: texture(key) };
    if (o.transparent) { p.transparent = true; p.depthWrite = false; }
    if (o.opacity != null) { p.opacity = o.opacity; p.transparent = true; }
    if (o.alphaTest) p.alphaTest = o.alphaTest;
    if (o.double) p.side = THREE.DoubleSide;
    const m = o.basic ? new THREE.MeshBasicMaterial(p) : new THREE.MeshLambertMaterial(p);
    matCache.set(ck, m);
    return m;
  }
  function colorMat(color, o) {
    o = o || {};
    const ck = 'c' + color + JSON.stringify(o);
    if (matCache.has(ck)) return matCache.get(ck);
    const m = o.basic ? new THREE.MeshBasicMaterial({ color }) : new THREE.MeshLambertMaterial({ color });
    matCache.set(ck, m);
    return m;
  }
  function ghostOf(m, level) {
    const k = m.uuid + level;
    if (ghostCache.has(k)) return ghostCache.get(k);
    const g = m.clone();
    g.transparent = true;
    g.opacity = (m.opacity != null ? m.opacity : 1) * level;
    g.depthWrite = false;
    ghostCache.set(k, g);
    return g;
  }

  function faceTex(def, dir, facing) {
    const t = def.tex || { all: 'stone' };
    if (t.all) return t.all;
    if (t.front && facing) {
      if (dir === facing) return t.front;
      if (dir === MC.OPP[facing]) return t.back || t.side;
      if (dir === 'u') return t.top || t.side;
      if (dir === 'd') return t.bottom || t.top || t.side;
      return t.side;
    }
    if (dir === 'u') return t.top || t.side;
    if (dir === 'd') return t.bottom || t.top || t.side;
    return t.side;
  }

  /* ---------- Geometrie ---------- */
  /* Box in lokalen Blockkoordinaten 0..1. UVs werden passend zugeschnitten, damit Stufen & Co. die Textur nicht stauchen. */
  function boxGeo(x0, y0, z0, x1, y1, z1) {
    const key = [x0, y0, z0, x1, y1, z1].join(',');
    if (geoCache.has(key)) return geoCache.get(key);
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    const uv = g.attributes.uv;
    const ranges = [
      [1 - z1, 1 - z0, y0, y1], [z0, z1, y0, y1],
      [x0, x1, 1 - z1, 1 - z0], [x0, x1, z0, z1],
      [x0, x1, y0, y1], [1 - x1, 1 - x0, y0, y1]
    ];
    for (let f = 0; f < 6; f++) {
      const [u0, u1, v0, v1] = ranges[f];
      for (let i = 0; i < 4; i++) {
        const idx = f * 4 + i;
        uv.setXY(idx, u0 + uv.getX(idx) * (u1 - u0), v0 + uv.getY(idx) * (v1 - v0));
      }
    }
    geoCache.set(key, g);
    return g;
  }
  function bx(x0, y0, z0, x1, y1, z1, m) { return new THREE.Mesh(boxGeo(x0, y0, z0, x1, y1, z1), m); }

  /* Teilstück entlang der Blickrichtung: a0..a1 von hinten (0) nach vorne (1) */
  function orient(f, a0, a1, inset) {
    const i0 = inset || 0, i1 = 1 - (inset || 0);
    const r = { x: [i0, i1], y: [0, 1], z: [i0, i1] };
    const axis = f === 'e' || f === 'w' ? 'x' : f === 'u' || f === 'd' ? 'y' : 'z';
    const pos = f === 'e' || f === 's' || f === 'u';
    r[axis] = pos ? [a0, a1] : [1 - a1, 1 - a0];
    if (axis === 'y') { r.x = [0, 1]; r.z = [0, 1]; }
    return [r.x[0], r.y[0], r.z[0], r.x[1], r.y[1], r.z[1]];
  }

  function planeFace(dir, x0, y0, z0, x1, y1, z1, m) {
    let g, p;
    const w = x1 - x0, h = y1 - y0, d = z1 - z0;
    switch (dir) {
      case 'u': g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); p = [x0 + w / 2, y1, z0 + d / 2]; break;
      case 'd': g = new THREE.PlaneGeometry(w, d); g.rotateX(Math.PI / 2); p = [x0 + w / 2, y0, z0 + d / 2]; break;
      case 'e': g = new THREE.PlaneGeometry(d, h); g.rotateY(Math.PI / 2); p = [x1, y0 + h / 2, z0 + d / 2]; break;
      case 'w': g = new THREE.PlaneGeometry(d, h); g.rotateY(-Math.PI / 2); p = [x0, y0 + h / 2, z0 + d / 2]; break;
      case 's': g = new THREE.PlaneGeometry(w, h); p = [x0 + w / 2, y0 + h / 2, z1]; break;
      default: g = new THREE.PlaneGeometry(w, h); g.rotateY(Math.PI); p = [x0 + w / 2, y0 + h / 2, z0]; break;
    }
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(p[0], p[1], p[2]);
    return mesh;
  }

  const ENTITY = {
    villager: [
      [0.28, 0, 0.36, 0.72, 1.2, 0.64, '#6e4a2c'], [0.3, 1.2, 0.3, 0.7, 1.7, 0.7, '#c79a74'],
      [0.45, 1.3, 0.7, 0.55, 1.5, 0.82, '#b58463'], [0.22, 0.75, 0.62, 0.78, 0.95, 0.8, '#5d3e24']
    ],
    zombie: [
      [0.25, 0, 0.375, 0.75, 0.75, 0.625, '#3c3f8f'], [0.25, 0.75, 0.375, 0.75, 1.45, 0.625, '#2fa3a3'],
      [0.25, 1.45, 0.25, 0.75, 1.95, 0.75, '#5f9a4f'], [0.02, 1.2, 0.375, 0.25, 1.42, 1.05, '#5f9a4f'],
      [0.75, 1.2, 0.375, 0.98, 1.42, 1.05, '#5f9a4f']
    ],
    chicken: [
      [0.3, 0.2, 0.3, 0.7, 0.55, 0.75, '#f2f2f2'], [0.38, 0.5, 0.15, 0.62, 0.85, 0.35, '#f7f7f7'],
      [0.42, 0.62, 0.04, 0.58, 0.72, 0.15, '#e8a23a'], [0.45, 0.52, 0.1, 0.55, 0.62, 0.16, '#c9302c'],
      [0.4, 0, 0.48, 0.45, 0.2, 0.53, '#e8a23a'], [0.55, 0, 0.48, 0.6, 0.2, 0.53, '#e8a23a']
    ]
  };

  function makeObject(c, nb) {
    const def = D(c), f = c.facing || 'n', grp = new THREE.Group();
    const add = (m) => grp.add(m);
    const tOpts = def.transparent ? { transparent: true } : (def.ghost ? { opacity: 0.45 } : (def.emissive ? { basic: true } : undefined));
    const faces = (o) => ORDER.map((dir) => mat(faceTex(def, dir, c.facing), o || tOpts));
    const isCube = (n) => n && D(n).shape === 'cube';

    switch (def.shape) {
      case 'cube': add(bx(0, 0, 0, 1, 1, 1, faces())); break;
      case 'farmland': add(bx(0, 0, 0, 1, 0.9375, 1, faces())); break;
      case 'slab': add(c.half === 'top' ? bx(0, 0.5, 0, 1, 1, 1, faces()) : bx(0, 0, 0, 1, 0.5, 1, faces())); break;
      case 'stairs': {
        const top = c.half === 'top';
        add(top ? bx(0, 0.5, 0, 1, 1, 1, faces()) : bx(0, 0, 0, 1, 0.5, 1, faces()));
        const s = orient(f, 0.5, 1);
        add(bx(s[0], top ? 0 : 0.5, s[2], s[3], top ? 0.5 : 1, s[5], faces()));
        break;
      }
      case 'pane':
      case 'fence': {
        const pane = def.shape === 'pane';
        const m = pane ? mat(def.tex.all, { transparent: true }) : mat(def.tex.all);
        const conn = ['e', 'w', 's', 'n'].filter((d) => {
          const n = nb(MC.DIRS[d]);
          return n && (isCube(n) || D(n).shape === def.shape || D(n).shape === 'gate' || (pane && D(n).shape === 'door'));
        });
        if (pane && conn.length === 0) conn.push('e', 'w');
        if (pane) {
          add(bx(0.4375, 0, 0.4375, 0.5625, 1, 0.5625, m));
          conn.forEach((d) => {
            const r = { e: [0.5625, 0.4375, 1, 0.5625], w: [0, 0.4375, 0.4375, 0.5625], s: [0.4375, 0.5625, 0.5625, 1], n: [0.4375, 0, 0.5625, 0.4375] }[d];
            add(bx(r[0], 0, r[1], r[2], 1, r[3], m));
          });
        } else {
          add(bx(0.375, 0, 0.375, 0.625, 1, 0.625, m));
          conn.forEach((d) => {
            const r = { e: [0.625, 0.4375, 1, 0.5625], w: [0, 0.4375, 0.375, 0.5625], s: [0.4375, 0.625, 0.5625, 1], n: [0.4375, 0, 0.5625, 0.375] }[d];
            add(bx(r[0], 0.375, r[1], r[2], 0.5625, r[3], m));
            add(bx(r[0], 0.75, r[1], r[2], 0.9375, r[3], m));
          });
        }
        break;
      }
      case 'door': {
        const s = orient(MC.OPP[f], 0.8125, 1);
        add(bx(s[0], 0, s[2], s[3], 1, s[5], mat(c.part === 'upper' ? 'door' : 'door_lower')));
        break;
      }
      case 'ladder': {
        const s = orient(MC.OPP[f], 0.92, 0.98);
        add(bx(s[0], 0, s[2], s[3], 1, s[5], mat('ladder', { alphaTest: 0.5, double: true })));
        break;
      }
      case 'cross': {
        const m = def.auto ? mat(def.tex.all, { alphaTest: 0.3, double: true, opacity: 0.5 }) : mat(def.tex.all, { alphaTest: 0.5, double: true });
        for (const a of [Math.PI / 4, -Math.PI / 4]) {
          const g = new THREE.PlaneGeometry(1.2, 1);
          const p = new THREE.Mesh(g, m);
          p.rotation.y = a;
          p.position.set(0.5, 0.5, 0.5);
          add(p);
        }
        break;
      }
      case 'dust': {
        const m = colorMat('#d42a1e', { basic: true });
        const has = (d) => {
          const v = MC.DIRS[d];
          for (const dy of [0, -1, 1]) { const n = nb([v[0], dy, v[2]]); if (n && n.id === 'redstone') return true; }
          return false;
        };
        let conn = ['e', 'w', 's', 'n'].filter(has);
        if (conn.length === 0) conn = ['e', 'w', 's', 'n'];
        if (conn.length === 1) conn.push(MC.OPP[conn[0]]);
        add(bx(0.3125, 0, 0.3125, 0.6875, 0.0625, 0.6875, m));
        conn.forEach((d) => {
          const r = { e: [0.6875, 0.4, 1, 0.6], w: [0, 0.4, 0.3125, 0.6], s: [0.4, 0.6875, 0.6, 1], n: [0.4, 0, 0.6, 0.3125] }[d];
          add(bx(r[0], 0, r[1], r[2], 0.0625, r[3], m));
        });
        break;
      }
      case 'rail_cart': {
        const g = new THREE.PlaneGeometry(1, 1);
        g.rotateX(-Math.PI / 2);
        const rail = new THREE.Mesh(g, mat('rail', { alphaTest: 0.5, double: true }));
        rail.position.set(0.5, 0.02, 0.5);
        if (f === 'e' || f === 'w') rail.rotation.y = Math.PI / 2;
        add(rail);
        const alongX = f === 'e' || f === 'w';
        const cm = mat('cart');
        add(alongX ? bx(0.06, 0.1, 0.2, 0.94, 0.62, 0.8, cm) : bx(0.2, 0.1, 0.06, 0.8, 0.62, 0.94, cm));
        add(alongX ? bx(0.22, 0.5, 0.3, 0.78, 0.64, 0.7, mat('hopper_in')) : bx(0.3, 0.5, 0.22, 0.7, 0.64, 0.78, mat('hopper_in')));
        break;
      }
      case 'button': {
        const s = orient(MC.OPP[f], 0.875, 1, 0.3125);
        add(bx(s[0], 0.375, s[2], s[3], 0.625, s[5], mat('button')));
        break;
      }
      case 'wall_sign': {
        const s = orient(MC.OPP[f], 0.9, 1);
        add(bx(s[0], 0.28, s[2], s[3], 0.78, s[5], mat('sign')));
        break;
      }
      case 'hopper': {
        const m = mat('hopper');
        add(bx(0, 0.625, 0, 1, 1, 1, [m, m, mat('hopper_in'), m, m, m]));
        add(bx(0.25, 0.25, 0.25, 0.75, 0.625, 0.75, m));
        const spout = {
          d: [0.375, 0, 0.375, 0.625, 0.25, 0.625], e: [0.75, 0.25, 0.375, 1, 0.5, 0.625], w: [0, 0.25, 0.375, 0.25, 0.5, 0.625],
          s: [0.375, 0.25, 0.75, 0.625, 0.5, 1], n: [0.375, 0.25, 0, 0.625, 0.5, 0.25]
        }[f] || [0.375, 0, 0.375, 0.625, 0.25, 0.625];
        add(bx(spout[0], spout[1], spout[2], spout[3], spout[4], spout[5], m));
        break;
      }
      case 'chest': {
        const side = mat('chest'), top = mat('chest_top');
        add(bx(0.0625, 0, 0.0625, 0.9375, 0.875, 0.9375, [side, side, top, top, side, side]));
        const l = orient(f, 0.9375, 1, 0.4375);
        add(bx(l[0], 0.4375, l[2], l[3], 0.6875, l[5], colorMat('#2b2b2b')));
        break;
      }
      case 'piston': {
        const head = orient(f, 0.75, 1), body = orient(f, 0, 0.75);
        add(bx(head[0], head[1], head[2], head[3], head[4], head[5], ORDER.map((d) => mat(d === f ? 'piston_face' : 'piston_wood'))));
        add(bx(body[0], body[1], body[2], body[3], body[4], body[5], ORDER.map((d) => mat(d === MC.OPP[f] ? 'piston_back' : 'piston_body'))));
        break;
      }
      case 'bed': {
        const red = mat('bed_foot'), side = mat('bed_side');
        add(bx(0, 0, 0, 1, 0.5625, 1, [side, side, red, side, side, side]));
        if (c.part === 'head') {
          const p = orient(f, 0.55, 0.95, 0.1);
          add(bx(p[0], 0.5625, p[2], p[3], 0.69, p[5], colorMat('#f1eee6')));
        }
        break;
      }
      case 'liquid': {
        const isWater = c.id !== 'lava';
        const above = nb([0, 1, 0]);
        const sameAbove = above && D(above).shape === 'liquid';
        const h = sameAbove ? 1 : def.flow ? 0.7 : 0.875;
        const m = isWater ? mat(def.tex.all, { transparent: true, opacity: def.flow ? 0.38 : 0.62 }) : mat('lava', { basic: true });
        ORDER.forEach((d) => {
          const n = nb(MC.DIRS[d]);
          if (n && D(n).shape === 'liquid' && (n.id === 'lava') === !isWater) return;
          if (n && d !== 'u' && D(n).shape === 'cube' && !D(n).transparent) return;
          add(planeFace(d, 0, 0, 0, 1, h, 1, m));
        });
        break;
      }
      case 'lantern': {
        const above = nb([0, 1, 0]), below = nb([0, -1, 0]);
        const hanging = above && (isCube(above) || (D(above).shape === 'slab' && above.half !== 'top')) && !(below && (isCube(below) || D(below).shape === 'fence'));
        const y0 = hanging ? 0.3 : 0;
        add(bx(0.3125, y0, 0.3125, 0.6875, y0 + 0.4375, 0.6875, mat('lantern', { basic: true })));
        add(bx(0.375, y0 + 0.4375, 0.375, 0.625, y0 + 0.5625, 0.625, colorMat('#2f2f33')));
        if (hanging) add(bx(0.47, y0 + 0.5625, 0.47, 0.53, 1, 0.53, colorMat('#4a4a50')));
        break;
      }
      case 'gate': {
        const m = mat(def.tex.all);
        const ax = f === 'n' || f === 's';
        const post = (a) => ax ? bx(a, 0.3125, 0.4375, a + 0.125, 1, 0.5625, m) : bx(0.4375, 0.3125, a, 0.5625, 1, a + 0.125, m);
        add(post(0)); add(post(0.875));
        for (const y of [0.375, 0.75]) add(ax ? bx(0.125, y, 0.4375, 0.875, y + 0.1875, 0.5625, m) : bx(0.4375, y, 0.125, 0.5625, y + 0.1875, 0.875, m));
        break;
      }
      case 'trapdoor': {
        const s = orient(MC.OPP[f], 0.8125, 1);
        add(bx(s[0], 0, s[2], s[3], 1, s[5], mat('trapdoor')));
        break;
      }
      case 'cauldron': {
        const m = mat('cauldron');
        add(bx(0, 0.1875, 0, 1, 0.3125, 1, m));
        add(bx(0, 0.1875, 0, 0.125, 1, 1, m)); add(bx(0.875, 0.1875, 0, 1, 1, 1, m));
        add(bx(0.125, 0.1875, 0, 0.875, 1, 0.125, m)); add(bx(0.125, 0.1875, 0.875, 0.875, 1, 1, m));
        [[0, 0], [0.75, 0], [0, 0.75], [0.75, 0.75]].forEach(([a, b]) => add(bx(a, 0, b, a + 0.25, 0.1875, b + 0.25, m)));
        break;
      }
      case 'bamboo': {
        const o = def.auto ? { opacity: 0.5 } : undefined;
        add(bx(0.40625, 0, 0.40625, 0.59375, 1, 0.59375, ORDER.map((d) => mat(d === 'u' || d === 'd' ? def.tex.top : def.tex.side, o))));
        break;
      }
      case 'portal': {
        const m = mat('portal', { transparent: true, opacity: 0.7, basic: true });
        add(f === 'e' || f === 'w' ? bx(0, 0, 0.375, 1, 1, 0.625, m) : bx(0.375, 0, 0, 0.625, 1, 1, m));
        break;
      }
      case 'beacon': {
        add(bx(0.1875, 0.1875, 0.1875, 0.8125, 0.8125, 0.8125, mat('beacon_core', { basic: true })));
        add(bx(0, 0, 0, 1, 1, 1, mat('beacon', { transparent: true })));
        break;
      }
      case 'entity': {
        (ENTITY[def.kind] || []).forEach((p) => add(bx(p[0], p[1], p[2], p[3], p[4], p[5], colorMat(p[6]))));
        break;
      }
      default: add(bx(0, 0, 0, 1, 1, 1, faces()));
    }
    grp.position.set(c.x, c.y, c.z);
    grp.userData.cell = c;
    grp.traverse((o) => { if (o.isMesh) o.userData.orig = o.material; });
    return grp;
  }

  function setLook(obj, level) {
    obj.traverse((o) => {
      if (!o.isMesh) return;
      const orig = o.userData.orig;
      if (level >= 1) o.material = orig;
      else o.material = Array.isArray(orig) ? orig.map((m) => ghostOf(m, level)) : ghostOf(orig, level);
    });
  }

  function textSprite(text, color) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    g.font = '600 40px "Pixelify Sans", system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = color;
    g.fillText(text, 32, 34);
    const t = new THREE.CanvasTexture(c);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true }));
    s.scale.set(1.2, 1.2, 1.2);
    s.renderOrder = 10;
    return s;
  }

  /* ---------- Viewer ---------- */
  function Viewer(el, opts) {
    this.el = el;
    this.opts = opts || {};
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    el.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;
    this.controls.screenSpacePanning = true;
    this.controls.autoRotateSpeed = 1.2;
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x6a6f72, 0.78));
    const sun = new THREE.DirectionalLight(0xffffff, 0.55);
    sun.position.set(0.6, 1, 0.35);
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.12));
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.helpers = new THREE.Group();
    this.scene.add(this.helpers);
    this.selBox = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.04, 1.04, 1.04)), new THREE.LineBasicMaterial({ color: 0xd8342a, depthTest: false }));
    this.selBox.renderOrder = 20;
    this.selBox.visible = false;
    this.scene.add(this.selBox);
    this.dirty = true;
    this.layerGroups = [];
    this.objects = [];
    this.raycaster = new THREE.Raycaster();
    this._bindPointer();
    this.controls.addEventListener('change', () => { this.dirty = true; });
    new ResizeObserver(() => this.resize()).observe(el);
    this.resize();
    const loop = () => {
      const moved = this.controls.update();
      if (moved || this.dirty || this.controls.autoRotate) { this.renderer.render(this.scene, this.camera); this.dirty = false; }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  Viewer.prototype.setColors = function (bg, grid, accent, ink) {
    this.colors = { bg, grid, accent, ink };
    this.scene.background = new THREE.Color(bg);
    this.selBox.material.color.set(accent);
    if (this.build) this._helpers();
    this.dirty = true;
  };

  Viewer.prototype.resize = function () {
    const w = this.el.clientWidth || 1, h = this.el.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = w + 'px';
    this.renderer.domElement.style.height = h + 'px';
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  };

  Viewer.prototype.load = function (build) {
    this.build = build;
    while (this.root.children.length) this.root.remove(this.root.children[0]);
    const map = new Map();
    build.cells.forEach((c) => map.set(c.x + ',' + c.y + ',' + c.z, c));
    this.map = map;
    const H = build.size[1];
    this.layerGroups = [];
    for (let y = 0; y < H; y++) { const g = new THREE.Group(); this.layerGroups.push(g); this.root.add(g); }
    this.objects = [];
    build.cells.forEach((c) => {
      const o = makeObject(c, (v) => map.get((c.x + v[0]) + ',' + (c.y + v[1]) + ',' + (c.z + v[2])));
      this.layerGroups[c.y].add(o);
      this.objects.push(o);
    });
    this.selBox.visible = false;
    this._helpers();
    this.preset('iso');
    this.dirty = true;
  };

  Viewer.prototype._helpers = function () {
    const hg = this.helpers;
    while (hg.children.length) hg.remove(hg.children[0]);
    const [W, H, Dp] = this.build.size;
    const col = (this.colors && this.colors.grid) || '#8a9590';
    const pad = 2, pts = [];
    for (let x = -pad; x <= W + pad; x++) pts.push(x, 0, -pad, x, 0, Dp + pad);
    for (let z = -pad; z <= Dp + pad; z++) pts.push(-pad, 0, z, W + pad, 0, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const grid = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.35 }));
    grid.position.y = -0.002;
    hg.add(grid);
    // aktuelle Ebene
    const lp = [];
    for (let x = 0; x <= W; x++) lp.push(x, 0, 0, x, 0, Dp);
    for (let z = 0; z <= Dp; z++) lp.push(0, 0, z, W, 0, z);
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
    this.layerGrid = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: (this.colors && this.colors.accent) || '#d8342a', transparent: true, opacity: 0.55, depthTest: true }));
    this.layerGrid.visible = false;
    hg.add(this.layerGrid);
    // Himmelsrichtungen
    const ink = (this.colors && this.colors.ink) || '#333';
    const accent = (this.colors && this.colors.accent) || '#d8342a';
    const n = textSprite('N', accent); n.position.set(W / 2, 0.6, -pad - 0.8); hg.add(n);
    const s = textSprite('S', ink); s.position.set(W / 2, 0.6, Dp + pad + 0.8); hg.add(s);
    const o = textSprite('O', ink); o.position.set(W + pad + 0.8, 0.6, Dp / 2); hg.add(o);
    const w = textSprite('W', ink); w.position.set(-pad - 0.8, 0.6, Dp / 2); hg.add(w);
    // Ursprung (0,0,0)
    const op = [0, 0.01, 0, 1.5, 0.01, 0, 0, 0.01, 0, 0, 0.01, 1.5, 0, 0, 0, 0, 1.5, 0];
    const og = new THREE.BufferGeometry();
    og.setAttribute('position', new THREE.Float32BufferAttribute(op, 3));
    hg.add(new THREE.LineSegments(og, new THREE.LineBasicMaterial({ color: accent, depthTest: false })));
    this.dirty = true;
  };

  /* mode: 'all' | 'upto' | 'only' */
  Viewer.prototype.setLayer = function (cur, mode, dimBelow) {
    this.cur = cur; this.mode = mode;
    this.layerGroups.forEach((g, y) => {
      let vis = true, look = 1;
      if (mode === 'upto') { vis = y <= cur; look = y < cur && dimBelow ? 0.32 : 1; }
      else if (mode === 'only') { vis = y === cur || y === cur - 1; look = y === cur ? 1 : 0.14; }
      g.visible = vis;
      if (vis) g.children.forEach((o) => setLook(o, look));
    });
    if (this.layerGrid) {
      this.layerGrid.visible = mode !== 'all';
      this.layerGrid.position.y = cur + 0.003;
    }
    // Hohe Bauten: Kamera wandert mit der aktuellen Ebene mit
    if (this.build && this.build.size[1] > 10) {
      const H = this.build.size[1];
      const ty = mode === 'all' ? H * 0.42 : Math.min(H, cur + 1);
      const dy = ty - this.controls.target.y;
      this.controls.target.y += dy;
      this.camera.position.y += dy;
    }
    this.dirty = true;
  };

  Viewer.prototype.select = function (c) {
    this.selected = c;
    if (c) { this.selBox.position.set(c.x + 0.5, c.y + 0.5, c.z + 0.5); this.selBox.visible = true; }
    else this.selBox.visible = false;
    this.dirty = true;
  };

  Viewer.prototype.preset = function (name) {
    if (!this.build) return;
    const [W, H, Dp] = this.build.size;
    const center = new THREE.Vector3(W / 2, H * 0.42, Dp / 2);
    const fit = this.camera.aspect < 1 ? 1 / Math.max(0.55, this.camera.aspect) : 1;
    const r = (Math.max(W, H, Dp) * 1.5 + 4) * fit;
    this.controls.target.copy(center);
    if (name === 'top') this.camera.position.set(W / 2, H + r * 1.1, Dp / 2 + 0.01);
    else if (name === 'front') this.camera.position.set(W / 2, center.y + r * 0.25, Dp / 2 - r * 1.05);
    else this.camera.position.set(center.x + r * 0.62, center.y + r * 0.62, center.z - r * 0.78);
    if (name === 'top') this.controls.target.set(W / 2, 0, Dp / 2);
    this.camera.updateProjectionMatrix();
    this.controls.update();
    this.dirty = true;
  };

  Viewer.prototype.setAutoRotate = function (on) { this.controls.autoRotate = !!on; this.dirty = true; };

  Viewer.prototype._bindPointer = function () {
    const dom = this.renderer.domElement;
    let down = null;
    dom.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: Date.now() }; });
    dom.addEventListener('pointerup', (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const dt = Date.now() - down.t;
      down = null;
      if (moved > 6 || dt > 600) return;
      const rect = dom.getBoundingClientRect();
      const p = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      this.raycaster.setFromCamera(p, this.camera);
      const pick = [];
      this.layerGroups.forEach((g, y) => {
        if (!g.visible) return;
        if (this.mode === 'only' && y !== this.cur) return;
        if (this.mode === 'upto' && y > this.cur) return;
        pick.push(g);
      });
      const hits = this.raycaster.intersectObjects(pick, true);
      for (const h of hits) {
        let o = h.object;
        while (o && !o.userData.cell) o = o.parent;
        if (o) { if (this.opts.onPick) this.opts.onPick(o.userData.cell); return; }
      }
      if (this.opts.onPick) this.opts.onPick(null);
    });
  };

  global.BlockViewer = Viewer;
})(window);
