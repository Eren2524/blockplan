/* Blockplan – Special-Bauten: große Prunkbauten im Stil bekannter Community-Projekte, alles eigene Entwürfe.
   Die Farmen darin sind die geprüften Module aus den anderen Dateien. */
(function (global) {
  'use strict';
  const BUILDS = global.BUILDS;
  const { place, nightLights, pyramid } = BP;

  const door = (b, x, y, z, f) => { b.set(x, y, z, 'oak_door:' + f + ':lower').set(x, y + 1, z, 'oak_door:' + f + ':upper'); };
  const add = (o) => { o.cat = 'special'; o.edition = o.edition || 'Java 1.20+'; o.how = o.how || []; o.tips = o.tips || []; o.layerNotes = o.layerNotes || {}; BUILDS.push(o); };
  const yt = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent('minecraft ' + q + ' tutorial deutsch');
  const OPP = { n: 's', s: 'n', e: 'w', w: 'e' };
  const SIDE = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };

  /* Wasserfahrstuhl: Seelensand (hoch) oder Magma (runter) bei y0, Wasser bis yTop, Glas drumherum.
     doors: [[seite, y], …] setzt eine Tür in den Ring (hält das Wasser). skip: Ringseiten, die schon eine Wand haben. */
  function elevator(b, x, z, y0, yTop, up, doors, skip) {
    b.set(x, y0, z, up ? 'soul_sand' : 'magma_block');
    for (let y = y0 + 1; y <= yTop; y++) {
      b.set(x, y, z, 'water');
      for (const s in SIDE) if (!(skip || []).includes(s)) b.set(x + SIDE[s][0], y, z + SIDE[s][1], 'glass');
    }
    (doors || []).forEach(([s, y]) => door(b, x + SIDE[s][0], y, z + SIDE[s][1], OPP[s]));
  }
  /* Kolbentür (wie im Agentenhaus): Tür bei x, Spieler steht auf der Seite z−1, Hebel an = zu. */
  function pistonVault(b, x, y, z, mat) {
    b.set(x, y, z - 1, null).set(x, y + 1, z - 1, null);
    b.set(x - 2, y, z, 'sticky_piston:e').set(x - 2, y + 1, z, 'sticky_piston:e');
    b.set(x - 1, y, z, 'piston_head:e').set(x - 1, y + 1, z, 'piston_head:e');
    b.set(x, y, z, mat).set(x, y + 1, z, mat);
    b.set(x - 3, y + 1, z, mat).set(x - 3, y, z, 'redstone');
    b.set(x - 3, y + 1, z - 1, 'lever:n');
  }
  /* Feuerwerk: Werfer nach oben mit Redstone darauf, Knopf an der Seite des ersten Werfers. */
  function fireworks(b, x0, x1, y, z, button) {
    b.fill(x0, y, z, x1, y, z, 'dispenser:u').fill(x0, y + 1, z, x1, y + 1, z, 'redstone');
    b.set(x1 + 1, y, z, 'stone_button:' + (button || 'e'));
  }
  function ellipsoid(b, cx, cy, cz, rx, ry, rz, fn) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
        for (let z = Math.floor(cz - rz); z <= Math.ceil(cz + rz); z++) {
          const d = Math.hypot((x - cx) / rx, (y - cy) / ry, (z - cz) / rz);
          if (d <= 1.02) fn(x, y, z, d);
        }
  }
  function cherryTree(b, x, y, z, h) {
    for (let i = 0; i < h; i++) b.set(x, y + i, z, 'cherry_log');
    ellipsoid(b, x, y + h, z, 3, 2, 3, (xx, yy, zz) => { if (!b.get(xx, yy, zz)) b.set(xx, yy, zz, 'cherry_leaves'); });
  }

  /* ================================================================ */

  add({
    id: 'koenigsschloss', name: 'Königsschloss', tagline: 'Burgmauer, 4 Türme, Thronsaal, 5 Farmen im Hof',
    difficulty: 'Fortgeschritten', extraMin: 60, youtube: yt('mittelalter schloss'),
    description: 'Ein riesiges Schloss im Stil großer Server-Projekte: eine Burgmauer mit Wehrgang und Zinnen, vier Ecktürme, ein Torhaus mit Fallgitter und in der Mitte der Bergfried mit Thronsaal, Bibliothek und Schlafgemach. Im Burghof versorgen dich eine Weizenfarm, eine Kürbisfarm, eine Eierfarm, eine Zuckerrohrfarm und die automatische Schmelze. Nachts gehen die Lampen auf dem Wehrgang von selbst an.',
    how: [
      'Nachtlicht: Auf dem Wehrgang sitzen Redstone-Lampen im Boden. Ein umgedrehter Tageslichtsensor am Ende jeder Reihe schaltet sie nachts ein.',
      'Torklingel: Ein Knopf am Notenblock vor dem Tor spielt einen Ton, wenn Besuch kommt.',
      'Die Türme sind über Leitern und Durchgänge mit dem Wehrgang verbunden. So kommst du einmal rund ums Schloss.',
      'Die Farmen im Hof sind genau wie die einzelnen Module aufgebaut. Ihre Erklärungen findest du bei den Farmen.'
    ],
    tips: [
      'Baue zuerst den Boden und die Mauer, dann die Ecktürme, dann den Bergfried. Die Farmen kommen zum Schluss.',
      'Du brauchst rund 4.000 Steinziegel. Eine Steinsäge spart viel Material.',
      'Den Tageslichtsensor einmal rechtsklicken, damit er blau wird (umgedreht).'
    ],
    layerNotes: {
      0: 'Boden: Gras im Hof, Wege aus Bruchstein, der Brunnen vor dem Bergfried und die Farm-Böden.',
      1: 'Mauer, Türme und Bergfried beginnen. Tore der Türme zum Hof, Tür und roter Teppich im Thronsaal.',
      5: 'Erster Zwischenboden im Bergfried mit Loch für die Leiter.',
      7: 'Wehrgang: Mauerkrone und Stufen innen. In der Nord- und Südseite sitzen die Nachtlampen.',
      8: 'Zinnen auf der Mauer, Redstone auf den Lampen, Tageslichtsensoren. Durchgänge vom Wehrgang in die Türme.',
      12: 'Turmdächer beginnen.',
      16: 'Das große Dach des Bergfrieds.'
    },
    build(b) {
      b.fill(0, 0, 0, 34, 0, 34, 'grass_block');
      b.fill(14, 0, 35, 20, 0, 38, 'cobblestone');
      // Wege
      b.fill(16, 0, 17, 18, 0, 34, 'cobblestone').fill(12, 0, 17, 22, 0, 19, 'cobblestone');
      b.fill(7, 0, 4, 27, 0, 4, 'cobblestone').fill(7, 0, 29, 27, 0, 30, 'cobblestone');
      // Mauer mit Wehrgang und Zinnen
      b.walls(0, 1, 0, 34, 7, 34, 'stone_bricks');
      for (let i = 7; i <= 27; i++) {
        b.set(i, 7, 1, 'stone_brick_slab:top').set(i, 7, 33, 'stone_brick_slab:top').set(1, 7, i, 'stone_brick_slab:top').set(33, 7, i, 'stone_brick_slab:top');
        if (i % 2 === 1) b.set(i, 8, 0, 'stone_bricks').set(i, 8, 34, 'stone_bricks').set(0, 8, i, 'stone_bricks').set(34, 8, i, 'stone_bricks');
      }
      // Torhaus mit Fallgitter
      b.fill(16, 1, 34, 18, 3, 34, null);
      b.set(16, 4, 34, 'stone_brick_stairs:w:top').set(18, 4, 34, 'stone_brick_stairs:e:top').set(17, 4, 34, 'oak_fence');
      for (const tx of [12, 19]) {
        b.walls(tx, 1, 31, tx + 3, 10, 35, 'stone_bricks');
        for (let x = tx; x <= tx + 3; x += 3) b.set(x, 11, 31, 'stone_bricks').set(x, 11, 35, 'stone_bricks');
        b.fill(tx + 1, 10, 32, tx + 2, 10, 34, 'stone_brick_slab');
        b.set(tx + 1, 6, 35, 'glass_pane').set(tx + 2, 6, 35, 'glass_pane');
      }
      b.set(14, 1, 37, 'note_block').set(14, 1, 38, 'stone_button:s');
      b.set(15, 1, 36, 'lantern').set(19, 1, 36, 'lantern');
      // Ecktürme 7×7
      for (const tx of [0, 28]) for (const tz of [0, 28]) {
        const xf = tx === 0 ? 6 : 28, zf = tz === 0 ? 6 : 28;
        b.walls(tx, 1, tz, tx + 6, 11, tz + 6, 'stone_bricks');
        b.fill(tx + 1, 1, tz + 1, tx + 5, 6, tz + 5, null).fill(tx + 1, 8, tz + 1, tx + 5, 11, tz + 5, null);
        b.fill(tx + 1, 7, tz + 1, tx + 5, 7, tz + 5, 'spruce_planks');
        pyramid(b, tx, tx + 6, tz, tz + 6, 12, 'dark_oak_stairs', 'dark_oak_planks');
        for (const y of [4, 9]) { b.set(tx + 3, y, tz === 0 ? 0 : 34, 'glass_pane'); b.set(tx === 0 ? 0 : 34, y, tz + 3, 'glass_pane'); }
        door(b, xf, 1, tz + 3, tx === 0 ? 'e' : 'w');
        const lz = tz === 0 ? tz + 1 : tz + 5;
        for (let y = 1; y <= 10; y++) b.set(tx + 3, y, lz, 'ladder:' + (tz === 0 ? 's' : 'n'));
        // Durchgänge zum Wehrgang
        const wz = tz === 0 ? 1 : 33, wx = tx === 0 ? 1 : 33;
        b.set(xf, 8, wz, null).set(xf, 9, wz, null).set(wx, 8, zf, null).set(wx, 9, zf, null);
        b.set(tx + 3, 9, tz + 3, 'lantern');
      }
      // Nachtlicht auf dem Wehrgang (Nord und Süd, je zwei Reihen)
      nightLights(b, [7, 1], [[8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1]], 7);
      nightLights(b, [27, 1], [[20, 1], [21, 1], [22, 1], [23, 1], [24, 1], [25, 1], [26, 1]], 7);
      nightLights(b, [7, 33], [[8, 33], [9, 33], [10, 33], [11, 33]], 7);
      nightLights(b, [27, 33], [[23, 33], [24, 33], [25, 33], [26, 33]], 7);
      for (const x of [12, 15, 19, 22]) b.set(x, 8, 33, null).set(x, 9, 33, null);
      // Bergfried
      b.walls(12, 1, 6, 22, 15, 16, 'stone_bricks');
      b.fill(13, 5, 7, 21, 5, 15, 'spruce_planks').fill(13, 10, 7, 21, 10, 15, 'spruce_planks').fill(12, 15, 6, 22, 15, 16, 'smooth_stone');
      pyramid(b, 12, 22, 6, 16, 16, 'dark_oak_stairs', 'dark_oak_planks');
      for (const y of [3, 8, 13]) {
        for (const x of [14, 16, 18, 20]) { b.set(x, y, 6, 'glass_pane'); if (x !== 16 && x !== 18) b.set(x, y, 16, 'glass_pane'); }
        for (const z of [8, 10, 12, 14]) { b.set(12, y, z, 'glass_pane').set(22, y, z, 'glass_pane'); }
      }
      door(b, 17, 1, 16, 's');
      b.set(15, 1, 17, 'lantern').set(19, 1, 17, 'lantern');
      for (let y = 1; y <= 14; y++) b.set(21, y, 15, 'ladder:n');
      // Thronsaal
      b.fill(17, 1, 9, 17, 1, 15, 'red_carpet');
      b.set(17, 1, 7, 'dark_oak_stairs:n').set(16, 1, 7, 'dark_oak_fence').set(18, 1, 7, 'dark_oak_fence');
      b.fill(17, 2, 6, 17, 4, 6, 'red_wool').set(16, 1, 8, 'iron_block').set(18, 1, 8, 'iron_block');
      b.set(17, 4, 10, 'lantern').set(17, 4, 13, 'lantern').set(13, 4, 11, 'lantern').set(21, 4, 11, 'lantern');
      // Bibliothek
      b.fill(13, 6, 7, 21, 8, 7, 'bookshelf').set(15, 6, 10, 'lectern').set(19, 6, 10, 'lectern');
      b.set(13, 6, 14, 'crafting_table').set(14, 6, 14, 'anvil:e').set(17, 9, 11, 'lantern');
      // Schlafgemach
      b.set(14, 11, 8, 'red_bed:n:head').set(14, 11, 9, 'red_bed:n:foot').set(16, 11, 8, 'red_bed:n:head').set(16, 11, 9, 'red_bed:n:foot');
      b.set(19, 11, 7, 'chest:s').set(20, 11, 7, 'chest:s').set(13, 11, 13, 'barrel').set(17, 14, 11, 'lantern');
      // Burghof: Brunnen und Farmen
      place(b, 'springbrunnen', 13, 0, 20);
      place(b, 'weizen', 1, 0, 8);
      place(b, 'kuerbis', 23, 0, 9);
      place(b, 'ofen', 27, 0, 15);
      place(b, 'eier', 23, 0, 18);
      place(b, 'zuckerrohr', 24, 0, 23);
      cherryTree(b, 4, 1, 21, 4);
      cherryTree(b, 8, 1, 25, 4);
      b.set(9, 1, 20, 'bell');
    }
  });

  /* ================================================================ */

  add({
    id: 'streamervilla', name: 'Streamer-Villa', tagline: 'Studio, Geheimraum, Pool, Wasserlift, Keller-Farm',
    difficulty: 'Fortgeschritten', extraMin: 25, youtube: yt('moderne villa'),
    description: 'Eine moderne Villa für Content-Creator: unten Wohnzimmer mit Glasfront und Pool, oben das Streaming-Studio mit Gaming-Platz und „ON AIR“-Lampe, auf dem Dach eine Party-Terrasse mit Feuerwerk. Ein Wasserfahrstuhl verbindet alle Etagen. Hinter dem Bücherregal liegt ein Geheimraum mit Kolbentür. Von dort führt eine Bodenklappe in den Keller mit der großen Zuckerrohrfarm.',
    how: [
      '„ON AIR“-Lampe: Der Hebel hängt direkt an der Redstone-Lampe. Hebel an, Lampe an.',
      'Kolbentür: Hebel an = Bücherregal zu. Hebel aus: Die klebrigen Kolben ziehen die Regale zur Seite.',
      'Wasserfahrstuhl: Seelensand schießt dich nach oben. Die Türen halten das Wasser, durch sie steigst du in jeder Etage aus. Oben kommst du auf dem Dach heraus.',
      'Feuerwerk: Der Knopf am letzten Werfer versorgt den Redstone auf allen drei Werfern, sie schießen nach oben.',
      'Nachtlicht: Der umgedrehte Tageslichtsensor schaltet nachts die Lampen in der Dachkante ein.'
    ],
    tips: [
      'Fülle die Werfer auf dem Dach mit Feuerwerksraketen.',
      'Die Wassersäule am besten von oben nach unten mit Quellen füllen (oder mit dem Seetang-Trick).',
      'Die Bodenklappe zum Keller liegt im Geheimraum. Sie sieht aus wie normaler Boden.'
    ],
    layerNotes: {
      0: 'Bodenplatte, Pool mit Seelaternen, Seelensand für den Fahrstuhl, Bodenklappe zum Keller (im Geheimraum).',
      1: 'Erdgeschoss: Glasfront im Norden, Tür, Fahrstuhltür, Bücherwand mit Kolbentür zum Geheimraum.',
      6: 'Decke des Erdgeschosses, Boden des Studios.',
      7: 'Studio: Gaming-Tisch, Bildschirme aus Seelaternen, Fahrstuhltür.',
      11: 'Dach mit Nachtlampen in der Kante.',
      12: 'Dachterrasse: Geländer, Redstone auf den Lampen, Feuerwerk.'
    },
    build(b) {
      // Keller mit großer Zuckerrohrfarm
      b.fill(0, -7, 0, 17, -7, 10, 'stone');
      b.walls(0, -6, 0, 17, -1, 10, 'stone_bricks');
      place(b, 'zuckerrohrgross', 2, -6, 2);
      for (let y = -6; y <= -1; y++) b.set(16, y, 9, 'ladder:w');
      b.set(16, -2, 2, 'sea_lantern').set(4, -1, 9, 'sea_lantern').set(10, -1, 1, 'sea_lantern');
      // Bodenplatte und Pool
      b.fill(-2, 0, -7, 19, 0, 12, 'smooth_stone');
      b.fill(1, 0, 1, 16, 0, 9, 'quartz_block');
      b.set(16, 0, 9, 'oak_trapdoor_closed');
      b.fill(3, -1, -6, 12, -1, -2, 'sea_lantern').fill(3, 0, -6, 12, 0, -2, 'water');
      b.fill(2, -1, -7, 13, -1, -7, 'smooth_stone').fill(2, -1, -1, 13, -1, -1, 'smooth_stone').fill(2, -1, -6, 2, -1, -2, 'smooth_stone').fill(13, -1, -6, 13, -1, -2, 'smooth_stone');
      // Erdgeschoss
      b.walls(0, 1, 0, 17, 5, 10, 'white_concrete');
      b.fill(2, 1, 0, 15, 4, 0, 'glass').fill(17, 2, 2, 17, 4, 5, 'glass');
      door(b, 8, 1, 0, 's');
      b.fill(0, 6, 0, 17, 6, 10, 'gray_concrete');
      for (const [x, z] of [[4, 3], [9, 3], [13, 3]]) b.set(x, 6, z, 'sea_lantern');
      // Bücherwand mit Kolbentür zum Geheimraum (z 7–9, x 10–16)
      b.fill(1, 1, 6, 9, 3, 6, 'bookshelf').fill(10, 1, 6, 14, 3, 6, 'bookshelf');
      pistonVault(b, 13, 1, 6, 'bookshelf');
      b.fill(15, 1, 6, 16, 3, 6, 'white_concrete').fill(1, 4, 6, 16, 5, 6, 'white_concrete').fill(9, 1, 7, 9, 5, 9, 'white_concrete');
      b.fill(10, 1, 7, 16, 4, 9, null);
      b.set(10, 1, 9, 'chest:n').set(11, 1, 9, 'chest:n').set(12, 1, 9, 'iron_block').set(14, 1, 9, 'iron_block').set(12, 4, 8, 'lantern');
      // Wohnen und Küche
      b.set(2, 1, 4, 'oak_stairs:w').set(2, 1, 5, 'oak_stairs:w').set(3, 1, 3, 'oak_stairs:s').set(4, 1, 3, 'oak_stairs:s').set(4, 1, 5, 'red_carpet').set(3, 1, 5, 'red_carpet');
      b.set(1, 1, 1, 'furnace:s').set(2, 1, 1, 'crafting_table').set(3, 1, 1, 'barrel');
      // Studio
      b.walls(0, 7, 0, 17, 10, 10, 'gray_concrete');
      b.fill(1, 8, 0, 16, 9, 0, 'glass').fill(0, 8, 2, 0, 9, 8, 'glass');
      b.fill(3, 7, 2, 7, 7, 2, 'smooth_stone_slab:top');
      b.set(4, 8, 2, 'sea_lantern').set(5, 8, 2, 'sea_lantern').set(6, 8, 2, 'sea_lantern');
      b.set(5, 7, 3, 'dark_oak_stairs:s');
      b.set(9, 9, 10, 'redstone_lamp').set(9, 9, 9, 'lever:n');
      b.set(3, 7, 8, 'red_bed:w:head').set(4, 7, 8, 'red_bed:w:foot').set(2, 7, 9, 'chest:e');
      // Dach mit Nachtlicht, Geländer und Feuerwerk
      b.fill(0, 11, 0, 17, 11, 10, 'smooth_stone');
      const lamps = [];
      for (let x = 2; x <= 14; x++) lamps.push([x, 1]);
      nightLights(b, [1, 1], lamps, 11);
      for (let x = 0; x <= 17; x++) { b.set(x, 12, 0, 'glass_pane').set(x, 12, 10, 'glass_pane'); }
      for (let z = 1; z <= 9; z++) { b.set(0, 12, z, 'glass_pane').set(17, 12, z, 'glass_pane'); }
      fireworks(b, 5, 7, 12, 6);
      // Wasserfahrstuhl Erdgeschoss → Studio → Dach
      elevator(b, 15, 2, 0, 11, true, [['w', 1], ['w', 7]]);
    }
  });

  /* ================================================================ */

  add({
    id: 'luftschiff', name: 'Luftschiff', tagline: 'Fliegendes Schiff mit Ballon, Kabine und Hühnerfarm',
    difficulty: 'Fortgeschritten', extraMin: 30, youtube: yt('luftschiff'),
    description: 'Ein Steampunk-Luftschiff hoch über der Welt: ein Holzrumpf mit Laderaum, ein Deck mit Reling, eine Kapitänskabine, zwei Masten und darüber ein riesiger gestreifter Ballon aus Wolle. Hinten drehen sich die Propeller, an Deck legen Hühner Eier in eine Truhe, und am Bug startet auf Knopfdruck ein Feuerwerk.',
    how: [
      'Feuerwerk am Bug: Der Knopf versorgt den Block dahinter. Der Redstone auf dem Block verteilt das Signal auf beide Werfer.',
      'Eierfarm: Die Hühner stehen auf Trichtern. Die Eier fallen in die Trichter und landen in der Truhe.',
      'Laderaum: Durch die Bodenklappe im Deck springst du in den Rumpf mit den Vorratstruhen.'
    ],
    tips: [
      'Baue das Schiff hoch am Himmel. Ein Turm aus Erde oder Gerüst hilft am Anfang, danach abbauen.',
      'Wolle bekommst du schnell mit einer Schaffarm oder von Hirten-Dorfbewohnern.',
      'Mit Elytra und Raketen kommst du am bequemsten hinauf.'
    ],
    layerNotes: {
      0: 'Kiel: die unterste Reihe des Rumpfs.',
      4: 'Deck aus Eichenholz. Die Bodenklappe führt in den Laderaum, die Eierfarm sitzt mittschiffs.',
      5: 'Reling, Kabine, Masten, Glocke und das Feuerwerk am Bug.',
      12: 'Der Ballon beginnt auf den Masten.',
      16: 'Mitte des Ballons mit roten Streifen.'
    },
    build(b) {
      const W = [1, 2, 3, 4, 4];
      const inHull = (x, y, z) => {
        const w = W[y] - Math.max(0, x - 21) - (x < 1 ? 9 : 0) - (y === 0 && (x < 3 || x > 22) ? 9 : 0);
        return x >= 0 && x <= 26 && Math.abs(z - 4) < w;
      };
      for (let x = 0; x <= 26; x++) for (let y = 0; y <= 4; y++) for (let z = 0; z <= 8; z++) {
        if (!inHull(x, y, z)) continue;
        const shell = y === 4 || !inHull(x - 1, y, z) || !inHull(x + 1, y, z) || !inHull(x, y, z - 1) || !inHull(x, y, z + 1) || y === 0 || !inHull(x, y - 1, z);
        if (y === 4) b.set(x, y, z, 'oak_planks');
        else if (shell) b.set(x, y, z, y === 3 ? 'dark_oak_planks' : 'spruce_planks');
      }
      // Reling
      for (let x = 0; x <= 26; x++) for (let z = 0; z <= 8; z++) {
        if (!inHull(x, 4, z)) continue;
        const edge = !inHull(x - 1, 4, z) || !inHull(x + 1, 4, z) || !inHull(x, 4, z - 1) || !inHull(x, 4, z + 1);
        if (edge) b.set(x, 5, z, 'oak_fence');
      }
      // Kapitänskabine
      b.walls(1, 5, 1, 7, 8, 7, 'dark_oak_planks');
      b.fill(1, 9, 1, 7, 9, 7, 'dark_oak_slab');
      for (const z of [3, 5]) b.set(1, 7, z, 'glass_pane');
      b.set(3, 7, 1, 'glass_pane').set(5, 7, 1, 'glass_pane').set(3, 7, 7, 'glass_pane').set(5, 7, 7, 'glass_pane');
      door(b, 7, 5, 4, 'e');
      b.set(2, 5, 2, 'red_bed:e:foot').set(3, 5, 2, 'red_bed:e:head').set(2, 5, 6, 'chest:e').set(5, 5, 6, 'crafting_table').set(4, 8, 4, 'lantern');
      // Propeller hinten
      b.set(-1, 3, 4, 'dark_oak_log').fill(-2, 1, 4, -2, 5, 4, 'spruce_fence').fill(-2, 3, 2, -2, 3, 6, 'spruce_fence');
      // Laderaum
      b.set(11, 4, 3, 'oak_trapdoor_closed');
      b.set(10, 1, 4, 'chest:n').set(11, 1, 4, 'chest:n').set(12, 1, 4, 'barrel').set(13, 2, 3, 'lantern');
      // Eierfarm mittschiffs
      place(b, 'eier', 13, 4, 2);
      // Masten und Ballon
      for (const x of [9, 20]) for (let y = 5; y <= 12; y++) b.set(x, y, 4, 'oak_log');
      ellipsoid(b, 14.5, 16, 4, 12, 4, 5, (x, y, z, d) => {
        if (d < 0.78) return;
        b.set(x, y, z, x % 5 === 0 ? 'red_wool' : 'white_wool');
      });
      for (const [x, z] of [[4, 1], [4, 7], [24, 2], [24, 6]]) for (let y = 6; y <= 12; y++) if (!b.get(x, y, z)) b.set(x, y, z, 'oak_fence');
      // Bug: Glocke und Feuerwerk
      b.set(21, 5, 4, 'bell');
      b.set(23, 5, 3, 'dispenser:u').set(23, 5, 5, 'dispenser:u').set(23, 5, 4, 'spruce_planks');
      b.set(23, 6, 3, 'redstone').set(23, 6, 4, 'redstone').set(23, 6, 5, 'redstone');
      b.set(22, 5, 4, 'stone_button:w');
      b.set(2, 5, 0, 'lantern').set(2, 5, 8, 'lantern');
    }
  });

  /* ================================================================ */

  add({
    id: 'unterwasserstation', name: 'Unterwasserstation', tagline: '3 Glaskuppeln, Tunnel, Blasen-Lift zur Oberfläche',
    difficulty: 'Fortgeschritten', extraMin: 60, youtube: yt('unterwasser basis'),
    description: 'Eine Forschungsstation auf dem Meeresgrund: eine große Hauptkuppel mit Küche und Zauberecke, eine Schlafkuppel und eine Farmkuppel mit Eierfarm, verbunden durch Glastunnel. Zwei Blasensäulen bringen dich in Sekunden zum Steg an der Wasseroberfläche und wieder hinunter.',
    how: [
      'Blasen-Lift hoch: Seelensand unter Wasser erzeugt eine Blasensäule, die dich nach oben schießt.',
      'Blasen-Lift runter: Magma erzeugt eine Säule, die dich nach unten zieht.',
      'In der Kuppel stecken die Säulen in Glasröhren. Die Türen halten das Wasser draußen. Über der Kuppel geht die Säule direkt im Meer weiter.',
      'Eierfarm: Hühner auf Trichtern, die Eier landen in der Truhe. Sie funktioniert auch unter Wasser, solange die Kuppel dicht ist.'
    ],
    tips: [
      'Baue zuerst die Kuppeln im Wasser. Fülle das Innere mit Sand und grabe ihn ab, so verschwindet das Wasser.',
      'Trank der Wasseratmung, Atmung und Wasserläufer auf den Stiefeln machen den Bau viel leichter.',
      'Die Wasserblöcke über der Kuppel sind das Meer selbst. Dort musst du nichts setzen.'
    ],
    layerNotes: {
      0: 'Böden der drei Kuppeln und der Tunnel. Seelensand und Magma für die Lifte in der Hauptkuppel.',
      1: 'Erste Glasreihe, Türen der Lifte, Einrichtung, Eierfarm in der Ostkuppel.',
      9: 'Über der Hauptkuppel: Hier ist schon Meer, die Säulen gehen von selbst weiter.',
      19: 'Steg an der Wasseroberfläche mit Laternen.'
    },
    build(b) {
      const domes = [[14, 14, 8], [32, 14, 5], [14, -4, 5]];
      const inDome = (x, y, z) => domes.some(([cx, cz, r]) => Math.hypot(x - cx, y - 0.5, z - cz) <= r - 0.6);
      for (const [cx, cz, r] of domes) {
        for (let x = cx - r; x <= cx + r; x++) for (let z = cz - r; z <= cz + r; z++) {
          if (Math.hypot(x - cx, z - cz) > r + 0.4) continue;
          b.set(x, 0, z, (x - cx) % 3 === 0 && (z - cz) % 3 === 0 ? 'sea_lantern' : 'prismarine_bricks');
          for (let y = 1; y <= r + 1; y++) {
            const d = Math.hypot(x - cx, y - 0.5, z - cz);
            if (d > r - 0.6 && d <= r + 0.4 && !inDome(x, y, z)) b.set(x, y, z, 'glass');
          }
        }
      }
      // Tunnel
      const tunnel = (x0, z0, x1, z1) => {
        for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
          b.set(x, 0, z, 'prismarine_bricks');
          const alongX = x1 - x0 > z1 - z0;
          const edge = alongX ? (z === z0 || z === z1) : (x === x0 || x === x1);
          for (let y = 1; y <= 3; y++) {
            if (inDome(x, y, z)) continue;
            if (y === 3 || edge) b.set(x, y, z, 'glass'); else b.set(x, y, z, null);
          }
        }
      };
      tunnel(21, 12, 28, 16);
      tunnel(12, 0, 16, 7);
      // Lifte in der Hauptkuppel, darüber Meer bis zur Oberfläche
      for (const [x, up] of [[12, true], [16, false]]) {
        b.set(x, 0, 14, up ? 'soul_sand' : 'magma_block');
        for (let y = 1; y <= 18; y++) {
          if (inDome(x, y, 14) && inDome(x, y, 13) && inDome(x, y, 15)) {
            b.set(x, y, 14, 'water');
            b.set(x - 1, y, 14, 'glass').set(x + 1, y, 14, 'glass').set(x, y, 13, 'glass').set(x, y, 15, 'glass');
          } else b.set(x, y, 14, 'water_env');
        }
        door(b, x, 1, 15, 'n');
      }
      // Steg an der Oberfläche
      b.fill(9, 19, 11, 19, 19, 17, 'oak_planks');
      b.set(12, 19, 14, 'water_env').set(16, 19, 14, 'water_env');
      for (const [x, z] of [[9, 11], [19, 11], [9, 17], [19, 17]]) b.set(x, 20, z, 'lantern');
      for (let x = 9; x <= 19; x++) { b.set(x, 20, 11, b.get(x, 20, 11) || 'oak_fence'); b.set(x, 20, 17, b.get(x, 20, 17) || 'oak_fence'); }
      // Hauptkuppel: Küche, Zauberecke, Lager
      b.set(10, 1, 9, 'furnace:s').set(11, 1, 9, 'crafting_table').set(12, 1, 9, 'smithing_table').set(13, 1, 8, 'barrel');
      b.fill(16, 1, 9, 18, 2, 9, 'bookshelf').set(17, 1, 11, 'lectern');
      b.set(8, 1, 13, 'chest:e').set(8, 1, 14, 'chest:e').set(8, 1, 15, 'chest:e');
      b.set(14, 7, 14, 'sea_lantern');
      // Schlafkuppel (Norden)
      b.set(12, 1, -6, 'red_bed:n:head').set(12, 1, -5, 'red_bed:n:foot').set(16, 1, -6, 'red_bed:n:head').set(16, 1, -5, 'red_bed:n:foot');
      b.set(14, 1, -7, 'chest:s').set(14, 4, -4, 'lantern');
      // Farmkuppel (Osten)
      place(b, 'eier', 29, 0, 12);
    }
  });

  /* ================================================================ */

  add({
    id: 'farmhochhaus', name: 'Farm-Hochhaus', tagline: '6 Etagen, 9 Farmen, 2 Wasserlifte, Leuchtfeuer',
    difficulty: 'Fortgeschritten', extraMin: 45, youtube: yt('vertical farm hochhaus'),
    description: 'Ein gläserner Wolkenkratzer, in dem jede Etage eine eigene Farm hat: Schmelze in der Lobby, die große Zuckerrohrfarm, Kürbis und Bambus, Weizen, Hühnerbrut und Eier, ganz oben die Honigfarm. Außen fahren zwei Wasserlifte hoch und runter, auf dem Dach leuchtet ein Leuchtfeuer, und nachts gehen die Lampen in der Dachkante von selbst an.',
    how: [
      'Wasserlift hoch (Seelensand) und runter (Magma) an der Ostseite. In jeder Etage steigst du durch eine Tür ein und aus.',
      'Oben kommst du aus dem Aufzug direkt auf das Dach. Zum Runterfahren springst du dort in die zweite Säule.',
      'Jede Etage ist eine eigene Farm. Ihre Funktionsweise steht bei den einzelnen Farmen.',
      'Leuchtfeuer: Eine Ebene aus 9 Eisenblöcken reicht für die erste Stufe.',
      'Seelaternen in jeder Decke sorgen dafür, dass alles wächst und keine Monster entstehen.'
    ],
    tips: [
      'Baue Etage für Etage: erst Boden, dann Glaswand, dann die Farm.',
      'Lass zwischen den Farmen und der Ostwand den Gang frei, er führt zum Aufzug.',
      'Die Wassersäulen am Ende füllen, wenn alle Türen sitzen.'
    ],
    layerNotes: {
      0: 'Bodenplatte, Seelensand und Magma für die Lifte.',
      1: 'Lobby mit Eingang und automatischer Schmelze.',
      9: 'Etage 1: große Zuckerrohrfarm.',
      17: 'Etage 2: Kürbis- und Bambusfarm.',
      25: 'Etage 3: Weizenfarm mit Knopf.',
      33: 'Etage 4: Hühner-Brutstation und Eierfarm.',
      41: 'Etage 5: Honigwabenfarm.',
      48: 'Dach mit Nachtlampen.',
      49: 'Dachterrasse mit Leuchtfeuer auf Eisenblöcken.'
    },
    build(b) {
      const FLOORS = [0, 8, 16, 24, 32, 40, 48];
      b.walls(0, 1, 0, 16, 47, 16, 'glass');
      FLOORS.forEach((Y) => {
        b.fill(0, Y, 0, 16, Y, 16, 'white_concrete');
        if (Y > 0) for (const x of [4, 8, 12]) for (const z of [4, 8, 12]) b.set(x, Y, z, 'sea_lantern');
      });
      for (const [x, z] of [[0, 0], [16, 0], [0, 16], [16, 16], [8, 0], [8, 16], [0, 8], [16, 8]]) b.fill(x, 1, z, x, 47, z, 'quartz_block');
      // Eingang
      door(b, 4, 1, 0, 's');
      b.set(3, 3, 1, 'lantern').set(5, 3, 1, 'lantern');
      // Farmen
      place(b, 'ofen', 2, 1, 6);
      b.set(10, 1, 3, 'crafting_table').set(11, 1, 3, 'furnace:s').set(12, 1, 3, 'chest:s');
      place(b, 'zuckerrohrgross', 1, 9, 2);
      place(b, 'kuerbis', 1, 17, 2);
      place(b, 'bambus', 1, 17, 9);
      place(b, 'weizen', 1, 25, 2);
      place(b, 'brutstation', 1, 33, 2);
      place(b, 'eier', 1, 33, 9);
      place(b, 'honigwaben', 1, 41, 2);
      b.set(3, 41, 12, 'red_bed:e:foot').set(4, 41, 12, 'red_bed:e:head').set(6, 41, 13, 'chest:n');
      // Lifte an der Ostseite
      b.fill(17, 48, 6, 20, 48, 12, 'white_concrete');
      const doorsUp = FLOORS.slice(0, 6).map((Y) => ['w', Y + 1]);
      elevator(b, 18, 8, 0, 48, true, doorsUp);
      elevator(b, 18, 10, 0, 48, false, doorsUp, ['n']);
      FLOORS.slice(0, 6).forEach((Y) => { b.set(16, Y + 1, 8, null).set(16, Y + 2, 8, null).set(16, Y + 1, 10, null).set(16, Y + 2, 10, null); });
      // Dach: Nachtlicht, Geländer, Leuchtfeuer
      const lamps = [];
      for (let x = 2; x <= 14; x++) lamps.push([x, 1]);
      nightLights(b, [1, 1], lamps, 48);
      for (let i = 0; i <= 16; i++) { b.set(i, 49, 16, 'glass_pane').set(0, 49, i, 'glass_pane'); if (i > 1) b.set(i, 49, 0, 'glass_pane'); if (i < 7 || i > 11) b.set(16, 49, i, 'glass_pane'); }
      b.fill(6, 49, 6, 8, 49, 8, 'iron_block').set(7, 50, 7, 'beacon');
    }
  });

  /* ================================================================ */

  add({
    id: 'kirschtempel', name: 'Kirschblüten-Tempel', tagline: 'Dreistöckige Pagode, Torii, Koiteich, Bambusfarm',
    difficulty: 'Mittel', extraMin: 20, youtube: yt('japanischer tempel kirschblüten'),
    description: 'Ein japanischer Tempelberg auf drei Steinterrassen: vorne ein rotes Torii-Tor, Steinlaternen am Weg, in der Mitte eine dreistöckige Pagode mit geschwungenen Dächern und einer Glocke. Vier Kirschbäume, ein Koiteich und hinter dem Tempel eine automatische Bambusfarm runden alles ab.',
    how: [
      'Die Dächer sind Zeltdächer aus Schwarzeichentreppen. Jedes Stockwerk steht eine Reihe weiter innen.',
      'Bambusfarm: Beobachter merken, wenn der Bambus wächst, und lösen die Kolben aus. Der Bambus fällt in die Trichterloren.'
    ],
    tips: [
      'Kirschholz und Kirschblätter findest du im Kirschhain-Biom.',
      'Bambus ist der perfekte Brennstoff für deinen Ofen.',
      'Leg ein paar Fische in den Koiteich (mit einem Fischeimer).'
    ],
    layerNotes: {
      0: 'Unterste Terrasse und Wiese mit dem Torii-Tor davor.',
      2: 'Oberste Terrasse mit Weg, Koiteich und den Plätzen für die Bäume.',
      3: 'Erdgeschoss der Pagode aus weißer Wolle mit Pfosten aus Schwarzeiche. Tür im Norden.',
      7: 'Erstes Dach.',
      12: 'Zweites Dach.',
      16: 'Drittes Dach mit Spitze.'
    },
    build(b) {
      b.fill(-2, 0, -7, 28, 0, -1, 'grass_block');
      b.fill(0, 0, 0, 26, 0, 26, 'stone_bricks').fill(2, 1, 2, 24, 1, 24, 'stone_bricks').fill(4, 2, 4, 22, 2, 22, 'stone_bricks');
      b.fill(12, 1, 1, 14, 1, 1, 'stone_brick_stairs:s').fill(12, 2, 3, 14, 2, 3, 'stone_brick_stairs:s');
      b.fill(12, 0, -6, 14, 0, -1, 'dirt_path').fill(12, 2, 4, 14, 2, 7, 'smooth_stone');
      // Torii
      for (const x of [9, 17]) b.fill(x, 1, -4, x, 6, -4, 'red_concrete');
      b.fill(9, 4, -4, 17, 4, -4, 'red_concrete').fill(8, 7, -4, 18, 7, -4, 'red_concrete').fill(7, 8, -4, 19, 8, -4, 'dark_oak_slab');
      // Steinlaternen
      for (const x of [10, 16]) b.set(x, 3, 6, 'cobblestone_wall').set(x, 4, 6, 'lantern');
      // Pagode
      const posts = (x0, x1, z0, z1, y0, y1) => { for (const x of [x0, (x0 + x1) / 2, x1]) for (const z of [z0, (z0 + z1) / 2, z1]) if (x === x0 || x === x1 || z === z0 || z === z1) b.fill(x, y0, z, x, y1, z, 'dark_oak_log'); };
      b.fill(8, 2, 8, 18, 2, 18, 'dark_oak_planks');
      b.walls(8, 3, 8, 18, 6, 18, 'white_wool'); posts(8, 18, 8, 18, 3, 6);
      door(b, 13, 3, 8, 's');
      b.set(13, 3, 15, 'bell').set(11, 3, 14, 'lantern').set(15, 3, 14, 'lantern').fill(12, 3, 16, 14, 3, 16, 'red_carpet');
      pyramid(b, 8, 18, 8, 18, 7, 'dark_oak_stairs', 'dark_oak_planks', 2);
      b.fill(9, 8, 9, 17, 8, 17, 'dark_oak_planks');
      b.walls(10, 9, 10, 16, 11, 16, 'white_wool'); posts(10, 16, 10, 16, 9, 11);
      pyramid(b, 10, 16, 10, 16, 12, 'dark_oak_stairs', 'dark_oak_planks', 2);
      b.fill(11, 13, 11, 15, 13, 15, 'dark_oak_planks');
      b.walls(12, 14, 12, 14, 15, 14, 'white_wool');
      pyramid(b, 12, 14, 12, 14, 16, 'dark_oak_stairs', 'dark_oak_planks');
      b.fill(13, 19, 13, 13, 21, 13, 'dark_oak_fence');
      // Koiteich
      b.fill(4, 2, 12, 7, 2, 17, 'water').fill(4, 1, 12, 7, 1, 17, 'sea_lantern');
      // Kirschbäume
      for (const [x, z] of [[6, 6], [20, 6], [20, 20], [6, 21]]) cherryTree(b, x, 3, z, 4);
      // Bambusfarm hinter dem Tempel
      place(b, 'bambus', 9, 1, 20);
    }
  });

  /* ================================================================ */

  add({
    id: 'riesenbaumhaus', name: 'Riesenbaumhaus', tagline: 'Hohler Riesenbaum, 2 Baumhäuser, Ausguck, Farmen',
    difficulty: 'Fortgeschritten', extraMin: 40, youtube: yt('riesen baumhaus'),
    description: 'Ein gigantischer Baum mit hohlem Stamm, durch den eine Leiter bis über die Krone führt. Auf zwei Plattformen hängen Baumhäuser: unten Werkstatt und Küche, oben das Schlafzimmer. Ganz oben siehst du vom Ausguck über die ganze Gegend. Unten am Stamm arbeiten eine Kürbisfarm und eine Honigfarm.',
    how: [
      'Die Leiter hängt innen an der Nordwand des Stamms. An jeder Plattform führt eine Tür nach draußen.',
      'Die Krone ist eine große Kugel aus Laub. Damit sie nicht verschwindet, muss sie den Stamm berühren oder du baust sie mit Behutsamkeit-Laub (gesetztes Laub verschwindet nicht).',
      'Kürbisfarm: Beobachter merken den neuen Kürbis, Kolben schieben ihn ab. Honigfarm: Beobachter auf den Bienenstöcken schalten Werfer mit Schere.'
    ],
    tips: [
      'Gesetztes Laub zerfällt nie. Du kannst die Krone also bedenkenlos bauen.',
      'Bienen lieben Bäume und Blumen. Pflanze rund um die Honigfarm noch mehr Blumen.',
      'Baue den Stamm zuerst bis ganz oben, dann die Plattformen, dann die Krone.'
    ],
    layerNotes: {
      0: 'Wiese, Wurzeln und Farmen am Fuß des Baums.',
      1: 'Der Stamm (5 × 5, innen hohl) mit Leiter und Eingangstür im Süden.',
      8: 'Untere Plattform mit Werkstatt-Häuschen.',
      16: 'Obere Plattform mit Schlafzimmer.',
      21: 'Die Krone beginnt.',
      32: 'Ausguck über der Krone.'
    },
    build(b) {
      b.fill(-3, 0, -3, 27, 0, 27, 'grass_block');
      // Stamm
      b.walls(10, 1, 10, 14, 31, 14, 'oak_log');
      for (let y = 1; y <= 32; y++) b.set(12, y, 11, 'ladder:s');
      door(b, 12, 1, 14, 's');
      // Wurzeln
      for (const [dx, dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        for (let i = 3; i <= 5; i++) { b.set(12 + dx * i, 1, 12 + dz * i, 'oak_log'); if (i === 3) b.set(12 + dx * i, 2, 12 + dz * i, 'oak_log'); }
      }
      // Untere Plattform y 8
      for (let x = 5; x <= 19; x++) for (let z = 5; z <= 19; z++) {
        if (x >= 10 && x <= 14 && z >= 10 && z <= 14) continue;
        if (Math.hypot(x - 12, z - 12) > 7.5) continue;
        b.set(x, 8, z, 'spruce_planks');
        if (Math.hypot(x - 12, z - 12) > 6.6) b.set(x, 9, z, 'spruce_fence');
      }
      door(b, 12, 9, 14, 's');
      b.fill(11, 8, 12, 13, 8, 13, 'spruce_planks').fill(11, 16, 12, 13, 16, 13, 'spruce_planks');
      b.walls(15, 9, 13, 18, 12, 16, 'spruce_planks');
      b.fill(15, 13, 13, 18, 13, 16, 'spruce_slab');
      b.set(15, 9, 15, null).set(15, 10, 15, null);
      b.set(17, 9, 14, 'crafting_table').set(17, 9, 15, 'furnace:w').set(16, 9, 14, 'chest:s').set(16, 12, 15, 'lantern');
      b.set(18, 11, 14, 'glass_pane').set(17, 11, 16, 'glass_pane');
      // Obere Plattform y 16
      for (let x = 6; x <= 18; x++) for (let z = 6; z <= 18; z++) {
        if (x >= 10 && x <= 14 && z >= 10 && z <= 14) continue;
        if (Math.hypot(x - 12, z - 12) > 6.5) continue;
        b.set(x, 16, z, 'spruce_planks');
        if (Math.hypot(x - 12, z - 12) > 5.6) b.set(x, 17, z, 'spruce_fence');
      }
      door(b, 12, 17, 14, 's');
      b.walls(6, 17, 9, 9, 19, 14, 'spruce_planks');
      b.fill(6, 20, 9, 9, 20, 14, 'spruce_slab');
      b.set(9, 17, 12, null).set(9, 18, 12, null);
      b.set(7, 17, 10, 'red_bed:w:head').set(8, 17, 10, 'red_bed:w:foot').set(7, 17, 13, 'chest:e').set(7, 19, 12, 'lantern');
      b.set(6, 18, 11, 'glass_pane');
      // Laternen unter den Plattformen
      for (const [x, z] of [[7, 12], [17, 12], [12, 7], [12, 17]]) { b.set(x, 7, z, 'lantern'); }
      // Krone
      ellipsoid(b, 12, 26, 12, 9, 5, 9, (x, y, z) => { if (!b.get(x, y, z) && !(x >= 11 && x <= 13 && z >= 11 && z <= 13)) b.set(x, y, z, 'oak_leaves'); });
      // Ausguck
      b.fill(9, 32, 9, 15, 32, 15, 'spruce_planks');
      b.set(12, 32, 11, 'ladder:s');
      for (let i = 9; i <= 15; i++) { b.set(i, 33, 9, 'spruce_fence').set(i, 33, 15, 'spruce_fence').set(9, 33, i, 'spruce_fence').set(15, 33, i, 'spruce_fence'); }
      b.set(9, 34, 9, 'lantern').set(15, 34, 15, 'lantern');
      // Farmen am Fuß
      place(b, 'kuerbis', 1, 0, 21);
      place(b, 'honigwaben', 15, 0, 21);
      for (const [x, z] of [[2, 3], [4, 5], [20, 4], [22, 7], [18, 2]]) b.set(x, 1, z, x % 2 ? 'poppy' : 'dandelion');
    }
  });

  BP.finishAll();
})(window);
