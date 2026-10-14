/* Blockplan – Dateiformate: NBT lesen/schreiben, Litematica (.litematic), WorldEdit/Sponge (.schem),
   Strukturblock (.nbt), Datapack als .zip und kompakte Teilen-Links. */
(function (global) {
  'use strict';

  const DATA_VERSION = 3465; // 1.20.1 – neuere Versionen rechnen ältere Dateien automatisch um

  /* ---------- gzip / deflate ---------- */
  async function pipe(bytes, stream) {
    const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
    return new Uint8Array(await res.arrayBuffer());
  }
  const gzip = (b) => pipe(b, new CompressionStream('gzip'));
  const gunzip = (b) => pipe(b, new DecompressionStream('gzip'));
  const deflate = (b) => pipe(b, new CompressionStream('deflate-raw'));
  const inflate = (b) => pipe(b, new DecompressionStream('deflate-raw'));

  /* ---------- NBT schreiben ----------
     Werte werden mit Typ-Helfern beschrieben: N.int(5), N.string('x'), N.compound({...}) … */
  const T = { end: 0, byte: 1, short: 2, int: 3, long: 4, float: 5, double: 6, byteArray: 7, string: 8, list: 9, compound: 10, intArray: 11, longArray: 12 };
  const N = {};
  Object.keys(T).forEach((k) => { N[k] = (v, sub) => ({ t: T[k], v, sub }); });

  class Writer {
    constructor() { this.buf = new Uint8Array(1 << 16); this.n = 0; this.dv = new DataView(this.buf.buffer); }
    need(k) {
      if (this.n + k <= this.buf.length) return;
      let len = this.buf.length;
      while (len < this.n + k) len *= 2;
      const nb = new Uint8Array(len); nb.set(this.buf); this.buf = nb; this.dv = new DataView(nb.buffer);
    }
    u8(v) { this.need(1); this.dv.setUint8(this.n, v); this.n += 1; }
    i8(v) { this.need(1); this.dv.setInt8(this.n, v); this.n += 1; }
    i16(v) { this.need(2); this.dv.setInt16(this.n, v); this.n += 2; }
    i32(v) { this.need(4); this.dv.setInt32(this.n, v); this.n += 4; }
    i64(v) { this.need(8); this.dv.setBigInt64(this.n, BigInt.asIntN(64, BigInt(v))); this.n += 8; }
    str(s) { const b = new TextEncoder().encode(s); this.need(2 + b.length); this.dv.setUint16(this.n, b.length); this.n += 2; this.buf.set(b, this.n); this.n += b.length; }
    bytes(b) { this.need(b.length); this.buf.set(b, this.n); this.n += b.length; }
    payload(tag) {
      const v = tag.v;
      switch (tag.t) {
        case T.byte: this.i8(v); break;
        case T.short: this.i16(v); break;
        case T.int: this.i32(v); break;
        case T.long: this.i64(v); break;
        case T.float: this.need(4); this.dv.setFloat32(this.n, v); this.n += 4; break;
        case T.double: this.need(8); this.dv.setFloat64(this.n, v); this.n += 8; break;
        case T.byteArray: this.i32(v.length); this.bytes(v instanceof Uint8Array ? v : Uint8Array.from(v)); break;
        case T.string: this.str(v); break;
        case T.list: this.u8(v.length ? tag.sub : (tag.sub || T.end)); this.i32(v.length); v.forEach((x) => this.payload({ t: tag.sub, v: x.t != null ? x.v : x })); break;
        case T.compound:
          for (const k in v) { const c = v[k]; this.u8(c.t); this.str(k); this.payload(c); }
          this.u8(T.end); break;
        case T.intArray: this.i32(v.length); v.forEach((x) => this.i32(x)); break;
        case T.longArray: this.i32(v.length); v.forEach((x) => this.i64(x)); break;
      }
    }
    root(name, tag) { this.u8(T.compound); this.str(name); this.payload(tag); return this.buf.slice(0, this.n); }
  }
  const writeNbt = (name, compound) => new Writer().root(name, compound);

  /* ---------- NBT lesen ---------- */
  function readNbt(bytes) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let p = 0;
    const dec = new TextDecoder();
    const str = () => { const n = dv.getUint16(p); p += 2; const s = dec.decode(bytes.subarray(p, p + n)); p += n; return s; };
    function payload(t) {
      switch (t) {
        case T.byte: return dv.getInt8(p++);
        case T.short: { const v = dv.getInt16(p); p += 2; return v; }
        case T.int: { const v = dv.getInt32(p); p += 4; return v; }
        case T.long: { const v = dv.getBigInt64(p); p += 8; return v; }
        case T.float: { const v = dv.getFloat32(p); p += 4; return v; }
        case T.double: { const v = dv.getFloat64(p); p += 8; return v; }
        case T.byteArray: { const n = dv.getInt32(p); p += 4; const v = bytes.slice(p, p + n); p += n; return v; }
        case T.string: return str();
        case T.list: { const st = dv.getUint8(p++); const n = dv.getInt32(p); p += 4; const a = []; for (let i = 0; i < n; i++) a.push(payload(st)); return a; }
        case T.compound: { const o = {}; for (;;) { const ct = dv.getUint8(p++); if (ct === T.end) break; const k = str(); o[k] = payload(ct); } return o; }
        case T.intArray: { const n = dv.getInt32(p); p += 4; const a = new Int32Array(n); for (let i = 0; i < n; i++) { a[i] = dv.getInt32(p); p += 4; } return a; }
        case T.longArray: { const n = dv.getInt32(p); p += 4; const a = new BigInt64Array(n); for (let i = 0; i < n; i++) { a[i] = dv.getBigInt64(p); p += 8; } return a; }
        default: throw new Error('NBT tag ' + t);
      }
    }
    const t = dv.getUint8(p++);
    if (t !== T.compound) throw new Error('kein NBT');
    str();
    return payload(T.compound);
  }

  /* ---------- Blockzustände ---------- */
  /* "piston[facing=east]" → { name: 'minecraft:piston', props: { facing: 'east' } } */
  function splitState(s) {
    const m = /^([^[]+)(?:\[(.*)\])?$/.exec(s);
    const name = m[1].includes(':') ? m[1] : 'minecraft:' + m[1];
    const props = {};
    if (m[2]) m[2].split(',').forEach((kv) => { const [k, v] = kv.split('='); props[k] = v; });
    return { name, props };
  }
  const stateKey = (st) => st.name + (Object.keys(st.props).length ? '[' + Object.keys(st.props).sort().map((k) => k + '=' + st.props[k]).join(',') + ']' : '');

  /* Verbindungen für Redstone, Zäune, Scheiben und Mauern berechnen, damit Litematica/WorldEdit
     den Bau ohne Block-Updates richtig zeigen. */
  const SIDES = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] };
  const SOLID = new Set(['cube', 'piston', 'detector', 'stonecutter']);
  function exportStates(cells) {
    const map = new Map();
    cells.forEach((c) => map.set(c.x + ',' + c.y + ',' + c.z, c));
    const at = (x, y, z) => map.get(x + ',' + y + ',' + z);
    const def = (c) => c && MC.BLOCKS[c.id];
    const solid = (c) => { const d = def(c); return !!d && SOLID.has(d.shape) && !d.transparent && !d.auto; };
    const POWER = new Set(['redstone', 'redstone_block', 'lever', 'stone_button', 'daylight_detector']);
    const out = [];
    cells.forEach((c) => {
      const s = MC.javaState(c);
      if (!s) return;
      const st = splitState(s);
      const d = def(c);
      if (c.id === 'redstone') {
        const up = !solid(at(c.x, c.y + 1, c.z));
        const conn = {};
        for (const k in SIDES) {
          const [dx, dz] = SIDES[k];
          const n = at(c.x + dx, c.y, c.z + dz);
          if (n && (POWER.has(n.id) || (n.id === 'observer' && n.facing === { north: 's', south: 'n', east: 'w', west: 'e' }[k]))) conn[k] = 'side';
          else if (up && solid(n) && at(c.x + dx, c.y + 1, c.z + dz) && at(c.x + dx, c.y + 1, c.z + dz).id === 'redstone') conn[k] = 'up';
          else if (!solid(n) && at(c.x + dx, c.y - 1, c.z + dz) && at(c.x + dx, c.y - 1, c.z + dz).id === 'redstone') conn[k] = 'side';
        }
        const ks = Object.keys(conn);
        if (ks.length === 0) Object.keys(SIDES).forEach((k) => { conn[k] = 'side'; });
        if (ks.length === 1) conn[{ north: 'south', south: 'north', east: 'west', west: 'east' }[ks[0]]] = 'side';
        Object.keys(SIDES).forEach((k) => { st.props[k] = conn[k] || 'none'; });
        st.props.power = '0';
      } else if (d.shape === 'fence' || d.shape === 'pane' || d.shape === 'wall') {
        for (const k in SIDES) {
          const [dx, dz] = SIDES[k];
          const n = at(c.x + dx, c.y, c.z + dz), nd = def(n);
          const ok = n && (solid(n) || nd.shape === d.shape || (d.shape === 'fence' && nd.shape === 'gate') || (d.shape === 'pane' && n.id === 'glass') || (d.shape === 'wall' && nd.shape === 'gate'));
          st.props[k] = d.shape === 'wall' ? (ok ? 'low' : 'none') : String(!!ok);
        }
        if (d.shape === 'wall') st.props.up = 'true';
      }
      out.push({ c, st });
    });
    return out;
  }

  /* ---------- Litematica ---------- */
  async function litematic(cells, size, meta) {
    const [W, H, D] = size;
    const vol = W * H * D;
    const states = exportStates(cells);
    const palette = [{ name: 'minecraft:air', props: {} }];
    const pIndex = new Map([['minecraft:air', 0]]);
    const idx = new Uint32Array(vol);
    states.forEach(({ c, st }) => {
      const k = stateKey(st);
      if (!pIndex.has(k)) { pIndex.set(k, palette.length); palette.push(st); }
      idx[(c.y * D + c.z) * W + c.x] = pIndex.get(k);
    });
    const bits = Math.max(2, Math.ceil(Math.log2(palette.length)));
    const longs = new BigUint64Array(Math.ceil(vol * bits / 64));
    const mask = (1n << BigInt(bits)) - 1n;
    for (let i = 0; i < vol; i++) {
      const v = BigInt(idx[i]);
      if (!v) continue;
      const bit = i * bits, s = bit >> 6, e = (bit + bits - 1) >> 6, off = BigInt(bit & 63);
      longs[s] = (longs[s] & ~(mask << off)) | ((v & mask) << off);
      if (s !== e) { const sh = 64n - off; longs[e] = (longs[e] & ~(mask >> sh)) | ((v & mask) >> sh); }
    }
    const xyz = (x, y, z) => N.compound({ x: N.int(x), y: N.int(y), z: N.int(z) });
    const now = Date.now();
    const pal = palette.map((st) => {
      const o = { Name: N.string(st.name) };
      if (Object.keys(st.props).length) { const p = {}; for (const k in st.props) p[k] = N.string(st.props[k]); o.Properties = N.compound(p); }
      return o;
    });
    const region = N.compound({
      Position: xyz(0, 0, 0), Size: xyz(W, H, D),
      BlockStatePalette: N.list(pal, T.compound),
      BlockStates: N.longArray(Array.from(longs, (x) => BigInt.asIntN(64, x))),
      TileEntities: N.list([], T.compound), Entities: N.list([], T.compound),
      PendingBlockTicks: N.list([], T.compound), PendingFluidTicks: N.list([], T.compound)
    });
    const root = N.compound({
      Version: N.int(5), SubVersion: N.int(1), MinecraftDataVersion: N.int(DATA_VERSION),
      Metadata: N.compound({
        Name: N.string(meta.name), Author: N.string(meta.author || 'Blockplan'), Description: N.string(meta.description || ''),
        RegionCount: N.int(1), TotalVolume: N.int(vol), TotalBlocks: N.int(states.length),
        TimeCreated: N.long(now), TimeModified: N.long(now), EnclosingSize: xyz(W, H, D)
      }),
      Regions: N.compound({ [meta.name.slice(0, 40) || 'Blockplan']: region })
    });
    return gzip(writeNbt('', root));
  }

  /* ---------- Sponge-Schematic v2 (WorldEdit, FAWE) ---------- */
  async function schem(cells, size, meta) {
    const [W, H, D] = size;
    const states = exportStates(cells);
    const pIndex = new Map([['minecraft:air', 0]]);
    const idx = new Uint32Array(W * H * D);
    states.forEach(({ c, st }) => {
      const k = stateKey(st);
      if (!pIndex.has(k)) pIndex.set(k, pIndex.size);
      idx[c.x + c.z * W + c.y * W * D] = pIndex.get(k);
    });
    const data = [];
    idx.forEach((v) => { while (v >= 0x80) { data.push((v & 0x7f) | 0x80); v >>>= 7; } data.push(v); });
    const pal = {};
    pIndex.forEach((v, k) => { pal[k] = N.int(v); });
    const root = N.compound({
      Version: N.int(2), DataVersion: N.int(DATA_VERSION),
      Width: N.short(W), Height: N.short(H), Length: N.short(D),
      Offset: N.intArray([0, 0, 0]), PaletteMax: N.int(pIndex.size), Palette: N.compound(pal),
      BlockData: N.byteArray(Uint8Array.from(data)), BlockEntities: N.list([], T.compound),
      Metadata: N.compound({ Name: N.string(meta.name), Author: N.string(meta.author || 'Blockplan') })
    });
    return gzip(writeNbt('Schematic', root));
  }

  /* ---------- Zip (ohne Kompression) für Datapacks ---------- */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function zip(files) {
    const enc = new TextEncoder(), parts = [], central = [];
    let off = 0;
    files.forEach(({ name, data }) => {
      const nb = enc.encode(name), db = typeof data === 'string' ? enc.encode(data) : data, crc = crc32(db);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint32(14, crc, true); h.setUint32(18, db.length, true); h.setUint32(22, db.length, true); h.setUint16(26, nb.length, true);
      parts.push(new Uint8Array(h.buffer), nb, db);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
      c.setUint32(16, crc, true); c.setUint32(20, db.length, true); c.setUint32(24, db.length, true); c.setUint16(28, nb.length, true); c.setUint32(42, off, true);
      central.push(new Uint8Array(c.buffer), nb);
      off += 30 + nb.length + db.length;
    });
    const csize = central.reduce((s, b) => s + b.length, 0);
    const e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, csize, true); e.setUint32(16, off, true);
    return new Blob(parts.concat(central, [new Uint8Array(e.buffer)]), { type: 'application/zip' });
  }
  function datapack(fnName, lines, description) {
    const mcmeta = JSON.stringify({ pack: { pack_format: 48, supported_formats: [48, 999], min_format: 48, max_format: 999, description } }, null, 2);
    return zip([
      { name: 'pack.mcmeta', data: mcmeta },
      { name: 'data/blockplan/function/' + fnName + '.mcfunction', data: lines.join('\n') + '\n' }
    ]);
  }

  /* ---------- Import ---------- */
  const SLAB_FULL = { oak_slab: 'oak_planks', spruce_slab: 'spruce_planks', stone_brick_slab: 'stone_bricks', cobblestone_slab: 'cobblestone', sandstone_slab: 'sandstone', dark_oak_slab: 'dark_oak_planks', smooth_stone_slab: 'smooth_stone' };
  const FACE = { north: 'n', south: 's', east: 'e', west: 'w', up: 'u', down: 'd' };
  const SKIP = new Set(['air', 'cave_air', 'void_air', 'structure_void', 'moving_piston']);
  let reverse = null;
  function reverseIndex() {
    if (reverse) return reverse;
    reverse = new Map();
    for (const id in MC.BLOCKS) {
      const d = MC.BLOCKS[id];
      if (d.entity || d.auto || d.generic || id === 'rail_cart' || id === 'oak_trapdoor_closed') continue;
      const st = MC.javaState({ id, facing: 'n' });
      if (!st) continue;
      const base = st.split('[')[0];
      if (!reverse.has(base) || base === id) reverse.set(base, id);
    }
    return reverse;
  }
  /* Java-Blockzustand → Blockplan-Kürzel wie "piston:e" oder "x.light_blue_concrete" */
  function toSpec(name, props) {
    props = props || {};
    const n = name.replace(/^minecraft:/, '');
    if (SKIP.has(n)) return null;
    if (n === 'water') return props.level && props.level !== '0' ? 'water_flow' : 'water';
    if (n === 'lava') return 'lava';
    if (n === 'redstone_wire') return 'redstone';
    if (n === 'rail' || n === 'powered_rail') return n + ':' + (props.shape && props.shape.startsWith('east') ? 'e' : 'n');
    if (n === 'oak_trapdoor') return props.open === 'true' ? 'oak_trapdoor:' + (FACE[props.facing] || 'n') : 'oak_trapdoor_closed';
    if (n === 'piston_head') return 'piston_head:' + (FACE[props.facing] || 'n');
    if (props.type === 'double' && SLAB_FULL[n]) return SLAB_FULL[n];
    const id = reverseIndex().get(n);
    if (!id) return MC.generic(n, props);
    const d = MC.BLOCKS[id];
    const parts = [id];
    if (props.facing && FACE[props.facing]) parts.push(FACE[props.facing]);
    if (d.shape === 'stairs' && props.half === 'top') parts.push('top');
    if (d.shape === 'slab' && props.type === 'top') parts.push('top');
    if (d.shape === 'door') parts.push(props.half === 'upper' ? 'upper' : 'lower');
    if (d.shape === 'bed') parts.push(props.part === 'head' ? 'head' : 'foot');
    return parts.join(':');
  }

  function unpackLitematic(longs, n, bits) {
    const out = new Uint32Array(n), mask = (1n << BigInt(bits)) - 1n;
    const u = Array.from(longs, (x) => BigInt.asUintN(64, x));
    for (let i = 0; i < n; i++) {
      const bit = i * bits, s = bit >> 6, e = (bit + bits - 1) >> 6, off = BigInt(bit & 63);
      let v = u[s] >> off;
      if (s !== e) v |= u[e] << (64n - off);
      out[i] = Number(v & mask);
    }
    return out;
  }
  function varints(bytes, n) {
    const out = new Uint32Array(n);
    let p = 0;
    for (let i = 0; i < n && p < bytes.length; i++) {
      let v = 0, sh = 0, b;
      do { b = bytes[p++] & 0xff; v |= (b & 0x7f) << sh; sh += 7; } while (b & 0x80);
      out[i] = v;
    }
    return out;
  }
  const propsOf = (o) => { const p = {}; if (o) for (const k in o) p[k] = String(o[k]); return p; };

  /* Liefert { name, blocks: [[x,y,z,'minecraft:name', props]] } */
  function decode(root, fileName) {
    const blocks = [];
    let name = fileName.replace(/\.[^.]+$/, '');
    if (root.Regions) {
      if (root.Metadata && root.Metadata.Name) name = root.Metadata.Name;
      for (const rk in root.Regions) {
        const r = root.Regions[rk];
        const sx = r.Size.x, sy = r.Size.y, sz = r.Size.z;
        const W = Math.abs(sx), H = Math.abs(sy), D = Math.abs(sz);
        const ox = r.Position.x + (sx < 0 ? sx + 1 : 0), oy = r.Position.y + (sy < 0 ? sy + 1 : 0), oz = r.Position.z + (sz < 0 ? sz + 1 : 0);
        const pal = r.BlockStatePalette;
        const bits = Math.max(2, Math.ceil(Math.log2(pal.length)));
        const idx = unpackLitematic(r.BlockStates, W * H * D, bits);
        for (let y = 0; y < H; y++) for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
          const p = pal[idx[(y * D + z) * W + x]];
          if (p && !SKIP.has(p.Name.replace(/^minecraft:/, ''))) blocks.push([ox + x, oy + y, oz + z, p.Name, propsOf(p.Properties)]);
        }
      }
      return { name, blocks };
    }
    const sp = root.Schematic && root.Schematic.Blocks ? root.Schematic : root;
    if (sp.Width != null && (sp.BlockData || (sp.Blocks && sp.Blocks.Data))) {
      const W = sp.Width & 0xffff, H = sp.Height & 0xffff, D = sp.Length & 0xffff;
      const palObj = sp.Blocks ? sp.Blocks.Palette : sp.Palette;
      const data = sp.Blocks ? sp.Blocks.Data : sp.BlockData;
      const pal = [];
      for (const k in palObj) pal[palObj[k]] = splitState(k);
      const idx = varints(data, W * H * D);
      for (let y = 0; y < H; y++) for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
        const p = pal[idx[x + z * W + y * W * D]];
        if (p && !SKIP.has(p.name.replace(/^minecraft:/, ''))) blocks.push([x, y, z, p.name, p.props]);
      }
      if (sp.Metadata && sp.Metadata.Name) name = sp.Metadata.Name;
      return { name, blocks };
    }
    if (root.Blocks && root.Data && root.Width != null) throw new Error('old');
    if (root.blocks && (root.palette || root.palettes)) {
      const pal = root.palette || root.palettes[0];
      root.blocks.forEach((b) => {
        const p = pal[b.state];
        if (p && !SKIP.has(p.Name.replace(/^minecraft:/, ''))) blocks.push([b.pos[0], b.pos[1], b.pos[2], p.Name, propsOf(p.Properties)]);
      });
      return { name, blocks };
    }
    throw new Error('format');
  }

  async function importFile(file) {
    let bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes[0] === 0x1f && bytes[1] === 0x8b) bytes = await gunzip(bytes);
    const res = decode(readNbt(bytes), file.name);
    return res;
  }

  /* ---------- Teilen-Links ---------- */
  function b64url(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function unb64url(s) {
    const b = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
    const out = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
    return out;
  }
  async function encodeShare(obj) { return b64url(await deflate(new TextEncoder().encode(JSON.stringify(obj)))); }
  async function decodeShare(s) { return JSON.parse(new TextDecoder().decode(await inflate(unb64url(s)))); }

  function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  global.Formats = { readNbt, writeNbt, N, T, gzip, gunzip, litematic, schem, datapack, zip, importFile, decode, toSpec, splitState, exportStates, encodeShare, decodeShare, download };
})(window);
