/* Blockplan – Mega-Bauten: Gebäude mit eingebauten Farmen und Redstone-Technik.
   Die Farmen sind die geprüften Module aus builds.js / builds-community.js, eingesetzt an festen Positionen. */
(function (global) {
  'use strict';
  const BUILDS = global.BUILDS;

  /* ---------- Module einsetzen ---------- */
  const find = (id) => BUILDS.find((d) => d.id === id);
  function rawMin(id) {
    const t = new BP.Builder();
    find(id).build(t);
    let mx = Infinity, my = Infinity, mz = Infinity;
    for (const c of t.m.values()) { mx = Math.min(mx, c.x); my = Math.min(my, c.y); mz = Math.min(mz, c.z); }
    return [mx, my, mz];
  }
  function proxy(b, dx, dy, dz, remap) {
    const p = {
      set(x, y, z, s) {
        if (s && remap) { const base = s.split(':')[0]; if (remap[base]) s = remap[base] + s.slice(base.length); }
        b.set(x + dx, y + dy, z + dz, s); return p;
      },
      fill(x1, y1, z1, x2, y2, z2, s) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z++) p.set(x, y, z, s);
        return p;
      },
      walls(x1, y1, z1, x2, y2, z2, s) {
        for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) for (let z = z1; z <= z2; z++) if (x === x1 || x === x2 || z === z1 || z === z2) p.set(x, y, z, s);
        return p;
      },
      get(x, y, z) { return b.get(x + dx, y + dy, z + dz); }
    };
    return p;
  }
  /* Setzt ein Modul so, dass seine kleinste Ecke bei (x, y, z) liegt. */
  function place(b, id, x, y, z, remap) {
    const [mx, my, mz] = rawMin(id);
    find(id).build(proxy(b, x - mx, y - my, z - mz, remap));
  }
  /* Setzt ein Modul mit seinen Originalkoordinaten plus Verschiebung. */
  function placeRaw(b, id, dx, dy, dz, remap) { find(id).build(proxy(b, dx, dy, dz, remap)); }

  const door = (b, x, y, z, f) => { b.set(x, y, z, 'oak_door:' + f + ':lower').set(x, y + 1, z, 'oak_door:' + f + ':upper'); };
  const add = (o) => { o.cat = 'mega'; o.edition = o.edition || 'Java 1.20+'; o.how = o.how || []; o.tips = o.tips || []; o.layerNotes = o.layerNotes || {}; BUILDS.push(o); };
  const yt = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent('minecraft ' + q + ' tutorial deutsch');

  /* Nachtlicht: Tageslichtsensor (umgedreht) + Redstone auf einer Lampenreihe. */
  function nightLights(b, sensor, lamps, y) {
    b.set(sensor[0], y + 1, sensor[1], 'daylight_detector');
    lamps.forEach(([x, z]) => { b.set(x, y, z, 'redstone_lamp').set(x, y + 1, z, 'redstone'); });
  }

  /* ================================================================ */

  add({
    id: 'redstonevilla', name: 'Redstone-Villa', tagline: 'Nachtlicht, Snack-Automat, Feuerwerk, Wasserlift',
    difficulty: 'Fortgeschritten', extraMin: 15, youtube: yt('redstone villa'),
    description: 'Eine moderne Villa voller Technik: Die Deckenlampen gehen nachts von selbst an, in der Küche gibt ein Snack-Automat per Knopfdruck Essen aus, zwei Wasserfahrstühle fahren aufs Dach, und dort startet ein Knopf ein Feuerwerk. Vor der Tür klingelt ein Notenblock.',
    how: [
      'Nachtlicht: Ein umgedrehter Tageslichtsensor auf dem Dach gibt nachts Strom in den Redstone auf den Lampen.',
      'Snack-Automat: Ein Knopf am Werfer wirft ein Item aus, zum Beispiel gebratenes Fleisch.',
      'Feuerwerk: Der Knopf am letzten Werfer versorgt den Redstone auf allen drei Werfern, die nach oben schießen.',
      'Wasserfahrstuhl: Seelensand schießt dich hoch, Magma zieht dich runter. Türen halten das Wasser.',
      'Türklingel: Ein Knopf am Notenblock spielt einen Ton. Über dem Notenblock muss Luft sein.'
    ],
    tips: ['Fülle die Werfer auf dem Dach mit Feuerwerksraketen.', 'Den Tageslichtsensor einmal rechtsklicken, damit er blau wird (umgedreht).', 'Die Wassersäulen am besten mit dem Seetang-Trick füllen.'],
    layerNotes: {
      0: 'Pool vor dem Haus mit Seelaternen im Boden. Seelensand und Magma unter den Fahrstühlen.',
      2: 'Erdgeschoss mit Glasfront, Fahrstuhltüren hinten rechts, Snack-Automat an der Südwand.',
      6: 'Obergeschoss in Weiß.',
      10: 'Dach: Lampen in der Decke, darauf Redstone und der Tageslichtsensor. Drei Werfer nach oben mit Knopf.'
    },
    build(b) {
      b.fill(-2, 0, -7, 16, 0, 12, 'smooth_stone');
      b.fill(2, 0, -6, 9, 0, -3, 'sea_lantern').fill(1, 1, -7, 10, 1, -2, 'smooth_stone').fill(2, 1, -6, 9, 1, -3, 'water');
      b.fill(0, 1, 0, 14, 1, 10, 'quartz_block');
      b.walls(0, 2, 0, 14, 5, 10, 'quartz_block');
      b.fill(2, 2, 0, 9, 4, 0, 'glass'); door(b, 12, 2, 0, 's');
      b.fill(0, 3, 3, 0, 4, 7, 'glass').fill(14, 3, 2, 14, 4, 5, 'glass');
      b.fill(0, 6, 0, 14, 6, 10, 'smooth_stone');
      b.walls(0, 7, 0, 14, 9, 10, 'white_concrete');
      b.fill(1, 7, 0, 13, 8, 0, 'glass').fill(0, 8, 3, 0, 8, 7, 'glass').fill(14, 8, 2, 14, 8, 6, 'glass');
      b.fill(-1, 10, -1, 15, 10, 11, 'smooth_stone');
      for (const [x, z] of [[4, 3], [9, 3], [4, 7], [9, 7]]) b.set(x, 6, z, 'sea_lantern');
      // Fahrstühle: Seelensand (x12, hoch) und Magma (x10, runter)
      b.set(12, 1, 8, 'soul_sand').set(10, 1, 8, 'magma_block');
      for (let y = 2; y <= 10; y++) {
        [[9, 8], [11, 8], [13, 8], [10, 7], [10, 9], [12, 7], [12, 9]].forEach(([x, z]) => b.set(x, y, z, 'glass'));
        b.set(10, y, 8, 'water').set(12, y, 8, 'water');
      }
      door(b, 10, 2, 7, 's'); door(b, 12, 2, 7, 's');
      // Nachtlicht im Dach
      const lamps = [];
      for (let x = 3; x <= 12; x++) lamps.push([x, 3]);
      for (let z = 4; z <= 8; z++) lamps.push([2, z]);
      nightLights(b, [2, 3], lamps, 10);
      // Feuerwerk
      b.fill(5, 11, 6, 7, 11, 6, 'dispenser:u').fill(5, 12, 6, 7, 12, 6, 'redstone').set(8, 11, 6, 'stone_button:e');
      for (let x = -1; x <= 15; x++) { b.set(x, 11, -1, 'glass_pane').set(x, 11, 11, 'glass_pane'); }
      for (let z = 0; z <= 10; z++) { b.set(-1, 11, z, 'glass_pane').set(15, 11, z, 'glass_pane'); }
      // Snack-Automat und Klingel
      b.set(3, 2, 9, 'quartz_block').set(3, 3, 9, 'dispenser:n').set(2, 3, 9, 'stone_button:w');
      b.set(11, 1, -2, 'note_block').set(11, 1, -3, 'stone_button:n');
      b.set(6, 2, 9, 'furnace:n').set(7, 2, 9, 'crafting_table').set(5, 7, 8, 'red_bed:s:foot').set(5, 7, 9, 'red_bed:s:head').set(7, 7, 9, 'chest:n');
    }
  });

  add({
    id: 'anwesen', name: 'Bauernhof-Anwesen', tagline: 'Haus + Weizen-, Kürbis- und Eierfarm',
    difficulty: 'Mittel', extraMin: 10, youtube: yt('bauernhof survival base'),
    description: 'Ein komplettes Bauernhof-Gelände: das Starterhaus, daneben die Weizenfarm mit Wasserspülung, dahinter die automatische Kürbis- und Melonenfarm und ein Hühnerstall mit Eierfarm. Alles eingezäunt, mit Wegen, Vogelscheuche und Laternen.',
    how: ['Jede Farm ist genau wie das einzelne Modul aufgebaut, nur auf dem Gelände angeordnet.', 'Weizen: Knopf drücken, Wasser spült alles in die Trichter. Kürbisse: läuft komplett von allein.'],
    tips: ['Baue zuerst das Haus, dann Farm für Farm.', 'Bei den einzelnen Farmen findest du die genauen Erklärungen.'],
    layerNotes: { 0: 'Rasen, Wege und die unterste Ebene aller Farmen.', 1: 'Zaun rundherum mit Tor im Norden.' },
    build(b) {
      b.fill(-3, 0, -3, 24, 0, 18, 'grass_block');
      b.fill(-3, 0, 10, 24, 0, 11, 'dirt_path').fill(9, 0, -3, 10, 0, 18, 'dirt_path');
      place(b, 'starterhaus', -1, 0, 0);
      place(b, 'weizen', 12, 0, 0);
      place(b, 'kuerbis', 12, 0, 13);
      place(b, 'eier', 1, 0, 13);
      for (let x = -3; x <= 24; x++) for (let z = -3; z <= 18; z++) if ((x === -3 || x === 24 || z === -3 || z === 18) && !(z === -3 && (x === 9 || x === 10))) b.set(x, 1, z, 'oak_fence');
      b.set(9, 1, -3, 'spruce_fence_gate:s').set(10, 1, -3, 'spruce_fence_gate:s');
      b.set(23, 1, 5, 'oak_fence').set(23, 2, 5, 'hay_block').set(23, 3, 5, 'hay_block');
      for (const [x, z] of [[8, -2], [11, -2], [8, 12], [11, 12]]) b.set(x, 1, z, 'cobblestone_wall').set(x, 2, z, 'lantern');
    }
  });

  add({
    id: 'golemfestung', name: 'Golem-Festung', tagline: 'Eisenfarm in einer Burg mit 4 Türmen',
    difficulty: 'Fortgeschritten', edition: 'Java 1.14+', extraMin: 45, youtube: yt('eisenfarm burg'),
    description: 'Die Eisenfarm sitzt mitten in einer Burg. Vier Ecktürme und eine Mauer mit Tor umschließen den Hof. Der Hof liegt 4 Blöcke tiefer als die Farm, und Mauern und Türme stehen außerhalb des Spawn-Bereichs. So erscheinen die Golems nur auf der Plattform. Über eine Leiter kommst du zu den Truhen.',
    how: [
      'Die Farm selbst ist die Eisenfarm aus dem Katalog.',
      'Golems erscheinen bis 8 Blöcke seitlich und 6 Blöcke unter den Dorfbewohnern. Der Burghof liegt tiefer, die Mauern stehen weiter weg. Deshalb erscheint dort kein Golem.'
    ],
    tips: ['Baue nichts zusätzlich in den Bereich direkt um die Plattform.', 'Lies vorher die Tipps zur einzelnen Eisenfarm.'],
    layerNotes: { 0: 'Burghof (Rasen), 4 Blöcke unter der Farm.', 4: 'Ebene 0 der Eisenfarm: Arbeitsboden mit Leiter vom Hof.', 13: 'Plattform der Farm.' },
    build(b) {
      const Y = 4;
      b.fill(-7, 0, -7, 26, 0, 26, 'grass_block');
      place(b, 'eisen', 0, Y, 0);
      for (const [x, z] of [[6, 6], [13, 6], [6, 13], [13, 13]]) b.fill(x, 1, z, x, Y - 1, z, 'stone_bricks');
      for (let y = 1; y <= Y; y++) b.set(6, y, 5, 'ladder:n');
      const T = [[-7, -7], [22, -7], [-7, 22], [22, 22]];
      T.forEach(([tx, tz]) => {
        b.walls(tx, 1, tz, tx + 4, 14, tz + 4, 'stone_bricks');
        b.fill(tx, 15, tz, tx + 4, 15, tz + 4, 'stone_bricks');
        for (let x = tx; x <= tx + 4; x++) for (let z = tz; z <= tz + 4; z++) if ((x === tx || x === tx + 4 || z === tz || z === tz + 4) && (x + z) % 2 === 0) b.set(x, 16, z, 'stone_bricks');
        b.set(tx + 2, 8, tz, 'glass_pane').set(tx + 2, 12, tz, 'glass_pane');
      });
      for (let x = -2; x <= 21; x++) { b.fill(x, 1, -5, x, 8, -5, 'stone_bricks'); b.fill(x, 1, 24, x, 8, 24, 'stone_bricks'); if (x % 2 === 0) { b.set(x, 9, -5, 'stone_bricks').set(x, 9, 24, 'stone_bricks'); } }
      for (let z = -2; z <= 21; z++) { b.fill(-5, 1, z, -5, 8, z, 'stone_bricks'); b.fill(24, 1, z, 24, 8, z, 'stone_bricks'); if (z % 2 === 0) { b.set(-5, 9, z, 'stone_bricks').set(24, 9, z, 'stone_bricks'); } }
      b.fill(8, 1, 24, 11, 4, 24, null);
      for (const x of [7, 12]) b.set(x, 2, 25, 'lantern');
    }
  });

  add({
    id: 'monsterfestung', name: 'Monsterturm-Festung', tagline: 'Mob-Fallturm mit AFK-Raum und Leuchtdach',
    difficulty: 'Fortgeschritten', edition: 'Java 1.18+', extraMin: 20, youtube: yt('mob farm turm'),
    description: 'Der Mob-Fallturm aus Steinziegeln, ergänzt um einen gemütlichen AFK-Raum unten mit Fenster zur Tötungskammer und Laternen auf dem ganzen Dach. Die Laternen verhindern, dass dort oben Monster spawnen, und lassen den Turm nachts leuchten.',
    how: ['Die Farm funktioniert genau wie der Mob-Fallturm.', 'Laternen auf dem Dach machen es dort hell: Monster spawnen nur noch im dunklen Inneren.'],
    tips: ['Warte im AFK-Raum. Die Truhen erreichst du durch die Tür.', 'Baue am besten über dem Meer.'],
    layerNotes: { 0: 'Boden und AFK-Raum um den Fuß des Turms.', 37: 'Laternen auf dem Dach.' },
    build(b) {
      place(b, 'mobturm', 0, 0, 0, { cobblestone: 'stone_bricks' });
      for (let x = 6; x <= 15; x++) for (let z = 6; z <= 16; z++) if (!b.get(x, 0, z)) b.set(x, 0, z, 'stone');
      for (let y = 1; y <= 3; y++) for (let x = 6; x <= 15; x++) for (let z = 6; z <= 16; z++) {
        const edge = x === 6 || x === 15 || z === 6 || z === 16;
        if (edge) b.set(x, y, z, y === 2 && (x === 6 || x === 15) ? 'glass' : 'stone_bricks');
      }
      door(b, 10, 1, 16, 'n');
      for (let x = 6; x <= 15; x++) for (let z = 6; z <= 16; z++) if (!(x >= 9 && x <= 12 && z >= 9 && z <= 12)) b.set(x, 4, z, 'stone_brick_slab:bottom');
      b.set(7, 1, 15, 'lantern').set(14, 1, 15, 'lantern').set(8, 1, 15, 'chest:n').set(13, 1, 15, 'crafting_table').set(7, 1, 7, 'red_bed:s:foot').set(7, 1, 8, 'red_bed:s:head');
      for (let x = 0; x <= 22; x++) for (let z = 0; z <= 22; z++) if (x % 4 === 1 && z % 4 === 1 && b.get(x, 36, z)) b.set(x, 37, z, 'lantern');
    }
  });

  add({
    id: 'fabrik', name: 'Fabrikhalle', tagline: 'Bambus heizt die Öfen von allein',
    difficulty: 'Fortgeschritten', extraMin: 10, youtube: yt('automatische schmelze bambus'),
    description: 'Eine Ziegelhalle mit Glasdach. Drinnen steht eine Bambusfarm auf einem Podest. Ihre Trichterkette führt direkt in die Brennstoff-Verteilung von vier Öfen. Du legst nur noch Erze oben in die Truhe, den Brennstoff liefert der Bambus. Nachts schaltet sich die Hallenbeleuchtung ein.',
    how: [
      'Die Bambusfarm steht 2 Blöcke höher als normal, damit ihre Trichter auf Höhe der Brennstoff-Verteilung liegen.',
      'Die Trichterkette läuft über den Öfen weiter. Die Trichter darunter ziehen den Bambus und schieben ihn seitlich in die Öfen.',
      'Erze kommen von oben aus der Eingabetruhe, die Barren landen unten in der Ausgabetruhe.',
      'Ein umgedrehter Tageslichtsensor schaltet die Lampen im Dach.'
    ],
    tips: ['Zwei Bambus schmelzen ein Item. Ein voller Trichter Bambus reicht lange.', 'Über die Leiter und den Steg kommst du an die Eingabetruhe.'],
    layerNotes: {
      0: 'Hallenboden. Ausgabe-Trichter der Öfen und Ausgabetruhen.',
      1: 'Öfen nach Norden, dahinter die Brennstoff-Trichter nach Norden.',
      2: 'Bambus-Trichterkette läuft nach Osten weiter über die Öfen (Brennstoff-Verteilung). Eingabe-Trichter nach unten.',
      4: 'Eingabetruhe für Erze, Steg mit Leiter.',
      10: 'Glasdach mit Lampen und Tageslichtsensor.'
    },
    build(b) {
      b.fill(-3, 0, -3, 16, 0, 5, 'smooth_stone');
      placeRaw(b, 'bambus', 0, 2, 0);
      b.set(8, 2, 1, 'hopper:e');
      b.fill(-1, 1, 0, 8, 1, 3, 'stone');
      b.fill(9, 0, 0, 12, 0, 0, 'hopper:e').set(13, 0, 0, 'chest:n').set(14, 0, 0, 'chest:n');
      b.fill(9, 1, 0, 12, 1, 0, 'furnace:n').fill(9, 1, 1, 12, 1, 1, 'hopper:n');
      b.fill(9, 2, 0, 12, 2, 0, 'hopper:d').fill(9, 2, 1, 12, 2, 1, 'hopper:e');
      b.fill(9, 3, 0, 12, 3, 0, 'hopper:e').set(9, 4, 0, 'chest:n').set(10, 4, 0, 'chest:n');
      b.fill(8, 3, -2, 13, 3, -1, 'spruce_planks');
      for (let x = 8; x <= 13; x++) b.set(x, 4, -2, 'spruce_fence');
      for (let y = 1; y <= 3; y++) b.set(14, y, -2, 'ladder:s');
      b.walls(-3, 1, -3, 16, 9, 5, 'bricks');
      for (const x of [-3, 2, 7, 12, 16]) b.fill(x, 1, -3, x, 9, -3, 'stone_bricks');
      for (const x of [0, 4, 9, 14]) b.fill(x, 4, 5, x, 6, 5, 'glass');
      b.fill(1, 1, -3, 2, 3, -3, null).set(1, 1, -3, 'oak_door:s:lower').set(1, 2, -3, 'oak_door:s:upper');
      b.fill(-3, 10, -3, 16, 10, 5, 'glass');
      const lamps = [];
      for (let x = -1; x <= 12; x++) lamps.push([x, 4]);
      nightLights(b, [-2, 4], lamps, 10);
      b.fill(15, 1, 4, 15, 15, 4, 'bricks');
    }
  });

  add({
    id: 'gelehrtenhaus', name: 'Gelehrten-Bibliothek', tagline: 'Bibliothek mit Papierfarm und Laternenmasten',
    difficulty: 'Fortgeschritten', extraMin: 5, youtube: yt('bibliothek zuckerrohr farm'),
    description: 'Die Bibliothek mit hoher Halle, daneben eine automatische Zuckerrohrfarm als Papier-Lieferant und ein Springbrunnen im Garten. Die Laternenmasten am Weg leuchten nachts von selbst: Auf jeder Lampe sitzt ein umgedrehter Tageslichtsensor.',
    how: ['Zuckerrohr wird zu Papier, Papier und Leder zu Büchern, Bücher und Holz zu Bücherregalen.', 'Ein Tageslichtsensor direkt auf einer Lampe schaltet genau diese Lampe.'],
    tips: ['Mit 15 Regalen um einen Zaubertisch bekommst du die besten Verzauberungen.'],
    layerNotes: { 0: 'Garten, Wege, Bibliothek, Zuckerrohrfarm.', 3: 'Lampen der Laternenmasten.', 4: 'Tageslichtsensoren auf den Lampen.' },
    build(b) {
      b.fill(-3, 0, -4, 27, 0, 17, 'grass_block');
      place(b, 'bibliothek', 0, 0, 0);
      place(b, 'zuckerrohr', 15, 0, 1);
      place(b, 'springbrunnen', 16, 0, 7);
      b.fill(5, 0, -4, 7, 0, -1, 'dirt_path').fill(8, 0, -2, 27, 0, -1, 'dirt_path');
      for (const [x, z] of [[4, -3], [8, -3], [14, -3], [20, -3], [26, -3]]) b.fill(x, 1, z, x, 2, z, 'dark_oak_fence').set(x, 3, z, 'redstone_lamp').set(x, 4, z, 'daylight_detector');
      for (const [x, z] of [[-2, 3], [-2, 9], [26, 10]]) b.set(x, 1, z, 'oak_leaves');
    }
  });

  add({
    id: 'bienenhaus', name: 'Bienen-Gewächshaus', tagline: 'Honigwabenfarm unter Glas mit Nachtlicht',
    difficulty: 'Mittel', extraMin: 10, youtube: yt('bienen farm gewächshaus'),
    description: 'Ein großes Gewächshaus aus Glas mit der Honigwabenfarm und einer Blumenwiese darin. Die Bienen fliegen geschützt vor Regen. Ein Lampenband im Glasdach geht nachts automatisch an.',
    how: ['Die Farm ist die Honigwabenfarm aus dem Katalog: Beobachter, Redstone und Werfer mit Schere.', 'Bienen fliegen bei Regen und nachts nicht aus. Unter Glas fliegen sie trotzdem nur tagsüber, das Licht ist für dich.'],
    tips: ['Lege Scheren in die Werfer.', 'Bring Bienen mit einem Bienennest (Behutsamkeit) oder locke sie mit Blumen in der Hand.'],
    layerNotes: { 0: 'Boden.', 1: 'Glaswände, Tür im Osten, die Honigwabenfarm.', 7: 'Glasdach mit Lampen, Redstone und Tageslichtsensor.' },
    build(b) {
      b.fill(0, 0, 0, 14, 0, 9, 'smooth_stone');
      place(b, 'honigwaben', 2, 1, 1);
      b.walls(0, 1, 0, 14, 6, 9, 'glass');
      door(b, 14, 1, 4, 'w');
      for (let x = 1; x <= 13; x++) for (const z of [7, 8]) if ((x + z) % 2 === 0) b.set(x, 1, z, x % 3 ? 'poppy' : 'dandelion');
      b.fill(1, 0, 7, 13, 0, 8, 'grass_block');
      b.fill(0, 7, 0, 14, 7, 9, 'glass');
      const lamps = [];
      for (let x = 2; x <= 13; x++) lamps.push([x, 5]);
      nightLights(b, [1, 5], lamps, 7);
    }
  });

  add({
    id: 'partyturm', name: 'Party-Turm', tagline: 'Feuerwerk, Lichtring, Glocke und Klingel',
    difficulty: 'Mittel', extraMin: 5, youtube: yt('redstone feuerwerk'),
    description: 'Ein weißer Rundturm mit Aussichtsplattform. Oben startet ein Knopf vier Feuerwerksraketen gleichzeitig, ein Ring aus Redstone-Lampen leuchtet nachts rund um die Plattform, und eine Glocke hängt für den großen Auftritt bereit. Unten an der Tür klingelt ein Notenblock.',
    how: [
      'Lichtring: Ein umgedrehter Tageslichtsensor gibt nachts Strom in den Redstone-Ring auf den Lampen.',
      'Feuerwerk: Der Knopf am letzten Werfer powert den Werfer direkt. Der Redstone darauf verteilt das Signal auf alle vier.',
      'Der Lichtring berührt die Werfer nicht. Nachts startet also kein Feuerwerk von selbst.'
    ],
    tips: ['Fülle die Werfer mit Feuerwerksraketen, gern mit Feuerwerkssternen in verschiedenen Farben.', 'Die Leiter innen führt durch ein Loch in der Plattform.'],
    layerNotes: { 1: 'Runde Wand, Tür im Norden, Leiter innen. Notenblock mit Knopf vor der Tür.', 16: 'Plattform mit Lampenring am Rand.', 17: 'Redstone-Ring, Tageslichtsensor, Werfer mit Knopf, Glocke, Geländer.' },
    build(b) {
      const C = 4, r3 = BP.circle(3), r5 = BP.circle(5);
      r3.forEach(([x, z]) => b.set(x + C, 0, z + C, 'quartz_block'));
      for (let y = 1; y <= 15; y++) r3.forEach(([x, z, e]) => { if (e) b.set(x + C, y, z + C, y % 5 === 0 ? 'red_concrete' : 'quartz_block'); });
      door(b, C, 1, C - 3, 's');
      for (const y of [4, 8, 12]) b.set(C - 3, y, C, 'glass_pane').set(C + 3, y, C, 'glass_pane');
      for (let y = 1; y <= 16; y++) b.set(C, y, C + 2, 'ladder:n');
      r5.forEach(([x, z, e]) => {
        const d = Math.hypot(x, z);
        if (e) { b.set(x + C, 17, z + C, 'oak_fence'); b.set(x + C, 16, z + C, 'quartz_block'); }
        else if (d > 2.9) { b.set(x + C, 16, z + C, 'redstone_lamp').set(x + C, 17, z + C, 'redstone'); }
        else if (!(x === 0 && z === 2)) b.set(x + C, 16, z + C, 'quartz_block');
      });
      const ring = r5.filter(([x, z, e]) => !e && Math.hypot(x, z) > 2.9);
      const [sx, sz] = ring[0];
      b.set(sx + C, 17, sz + C, 'daylight_detector');
      for (let x = C - 2; x <= C + 1; x++) b.set(x, 17, C, 'dispenser:u').set(x, 18, C, 'redstone');
      b.set(C + 2, 17, C, 'stone_button:e');
      b.set(C, 17, C - 2, 'bell');
      b.set(C + 2, 0, C - 5, 'quartz_block').set(C + 2, 1, C - 5, 'note_block').set(C + 2, 1, C - 6, 'stone_button:n');
    }
  });

  add({
    id: 'bunker', name: 'Kolbentür-Bunker', tagline: 'Hügelbasis mit Kolbentür, Schmelze, Fahrstuhl',
    difficulty: 'Fortgeschritten', extraMin: 15, youtube: yt('geheimbasis kolbentür'),
    description: 'Eine Basis im Inneren eines Hügels. Den Eingang verschließt eine Kolbentür: zwei klebrige Kolben schieben zwei Steinblöcke in den Durchgang, die Kolben selbst sind hinter der Außenwand versteckt. Innen gibt es Lager, die automatische Schmelze und einen Wasserfahrstuhl, der dich auf die Hügelspitze schießt.',
    how: [
      'Hebel an: Der Block am Hebel wird stark gepowert. Der obere Kolben steht daneben, der Redstone darunter versorgt den unteren Kolben.',
      'Ausgefahrene klebrige Kolben halten die Türblöcke im Durchgang. Hebel aus: Die Kolben ziehen die Blöcke zur Seite, der Weg ist frei.',
      'Von außen siehst du nur eine Nische mit Stein. Die Kolben liegen hinter der äußeren Wand.'
    ],
    tips: ['Die Kolbentür ist auf die Java Edition ausgelegt.', 'Baue zuerst den Hügel, dann höhle den Raum aus.', 'Der Hebel innen links neben der Tür öffnet und schließt.'],
    layerNotes: { 0: 'Boden, Redstone unter dem Hebelblock, Seelensand des Fahrstuhls.', 1: 'Kolbentür: klebrige Kolben nach Osten, ausgefahrene Köpfe, Türblock im Durchgang. Hebel innen.', 4: 'Ausgabe der Schmelze reicht bis hier.' },
    build(b) {
      const cx = 8, cz = 8;
      for (let x = -1; x <= 17; x++) for (let z = 2; z <= 16; z++) for (let y = 0; y <= 9; y++) {
        const d = Math.hypot((x - cx) / 8.6, y / 8.2, (z - cz) / 6.6);
        if (d > 1) continue;
        const above = Math.hypot((x - cx) / 8.6, (y + 1) / 8.2, (z - cz) / 6.6) > 1;
        b.set(x, y, z, above ? 'grass_block' : 'stone');
      }
      b.fill(4, 1, 4, 12, 4, 10, null);
      b.fill(4, 0, 4, 12, 0, 10, 'smooth_stone');
      b.set(8, 1, 2, null).set(8, 2, 2, null);
      b.set(6, 1, 3, 'sticky_piston:e').set(6, 2, 3, 'sticky_piston:e').set(7, 1, 3, 'piston_head:e').set(7, 2, 3, 'piston_head:e');
      b.set(8, 1, 3, 'stone').set(8, 2, 3, 'stone');
      b.set(5, 2, 3, 'stone').set(5, 1, 3, 'redstone').set(5, 2, 4, 'lever:s');
      b.fill(6, 0, 0, 10, 0, 1, 'dirt_path');
      b.set(7, 1, 1, 'lantern').set(9, 1, 1, 'lantern');
      place(b, 'ofen', 4, 0, 9);
      b.set(11, 0, 9, 'soul_sand');
      for (let y = 1; y <= 7; y++) b.set(11, y, 9, 'water');
      for (let y = 1; y <= 4; y++) { b.set(10, y, 9, 'glass').set(12, y, 9, 'glass').set(11, y, 10, 'glass').set(11, y, 8, 'glass'); }
      door(b, 11, 1, 8, 's');
      for (const [x, z] of [[10, 8], [12, 8], [10, 10], [12, 10]]) b.set(x, 8, z, 'oak_fence');
      b.set(11, 8, 11, 'lantern');
      b.fill(4, 1, 5, 4, 2, 8, 'chest:e');
      b.set(12, 1, 5, 'crafting_table').set(12, 1, 6, 'anvil:n').set(6, 4, 6, 'glowstone').set(10, 4, 6, 'glowstone');
    }
  });

  add({
    id: 'ranch', name: 'Ranch', tagline: 'Pferdestall, Eierfarm und Brutstation',
    difficulty: 'Mittel', extraMin: 15, youtube: yt('ranch pferdestall'),
    description: 'Eine Ranch mit Pferdestall, eingezäunter Koppel, Eierfarm und der Hühner-Brutstation, die neue Küken ausbrütet. Mit Heu, Wassertrog und Laternen.',
    how: ['Eierfarm: Hühner auf Trichtern legen Eier in die Truhe.', 'Brutstation: Eine Beobachter-Uhr lässt den Werfer die Eier ins Gehege werfen.'],
    tips: ['Führe Pferde mit der Leine in die Boxen.', 'Die Koppel ist groß genug zum Reiten üben.'],
    layerNotes: { 0: 'Rasen und Böden.', 1: 'Zaun der Koppel, Stall, Eierfarm und Brutstation.' },
    build(b) {
      b.fill(-3, 0, -4, 33, 0, 24, 'grass_block');
      place(b, 'pferdestall', 0, 0, 0);
      place(b, 'eier', 18, 0, 0);
      place(b, 'brutstation', 18, 0, 6);
      for (let x = -2; x <= 32; x++) for (let z = 12; z <= 23; z++) if (x === -2 || x === 32 || z === 12 || z === 23) b.set(x, 1, z, 'oak_fence');
      b.set(5, 1, 12, 'spruce_fence_gate:s').set(14, 1, 18, 'cauldron').set(20, 1, 20, 'hay_block').set(21, 1, 20, 'hay_block').set(20, 2, 20, 'hay_block');
      for (const [x, z] of [[-2, -3], [15, -3], [32, -3]]) b.set(x, 1, z, 'cobblestone_wall').set(x, 2, z, 'lantern');
    }
  });

  add({
    id: 'steinmetz', name: 'Steinmetz-Werkstatt', tagline: '3 Stein-Generatoren, Schmelze, Steinsägen',
    difficulty: 'Mittel', edition: 'Java & Bedrock 1.16+', extraMin: 5, youtube: yt('stein generator werkstatt'),
    description: 'Eine Werkhalle mit drei Generatoren nebeneinander: Bruchstein, Stein und Basalt. Daneben die automatische Schmelze, die Bruchstein zu Stein und Stein zu glattem Stein brennt, und zwei Steinsägen. Unendlich Baumaterial für alle Projekte.',
    how: ['Bruchstein: Lava fließt seitlich neben Wasser.', 'Stein: Lava kommt von oben auf Wasser.', 'Basalt: Lava über Seelenerde neben Blauem Eis.'],
    tips: ['Mit einer Effizienz-V-Spitzhacke bist du am schnellsten.', 'Glatter Stein entsteht, wenn du Stein noch einmal schmilzt.'],
    layerNotes: { 0: 'Hallenboden, Böden der Generatoren.', 1: 'Wände, Tür im Norden, Generatoren, Schmelze, Steinsägen.', 6: 'Dach.' },
    build(b) {
      b.fill(0, 0, 0, 22, 0, 11, 'stone');
      place(b, 'bruchstein', 2, 0, 3);
      place(b, 'steingenerator', 10, 0, 3);
      place(b, 'basalt', 17, 0, 3);
      place(b, 'ofen', 3, 0, 8);
      b.set(13, 1, 9, 'stonecutter').set(15, 1, 9, 'stonecutter').fill(17, 1, 9, 20, 1, 9, 'chest:n');
      b.walls(0, 1, 0, 22, 5, 11, 'stone_bricks');
      for (const x of [3, 8, 14, 19]) b.fill(x, 2, 0, x, 3, 0, 'glass_pane');
      door(b, 11, 1, 0, 's');
      const roof = function () {
        for (let i = 0; ; i++) {
          const l = -1 + i, r = 12 - i, yy = 6 + i;
          if (l > r) break;
          b.fill(-1, yy, l, 23, yy, l, 'dark_oak_stairs:s'); b.fill(-1, yy, r, 23, yy, r, 'dark_oak_stairs:n');
          if (l + 1 <= r - 1) { b.fill(0, yy, l + 1, 0, yy, r - 1, 'stone_bricks'); b.fill(22, yy, l + 1, 22, yy, r - 1, 'stone_bricks'); }
        }
      };
      roof();
      for (const [x, z] of [[6, 5], [16, 5]]) b.set(x, 5, z, 'lantern');
    }
  });

  add({
    id: 'vulkanschmiede', name: 'Vulkan-Schmiede', tagline: 'Schmiede im Vulkan mit Lavafarm und Kratersee',
    difficulty: 'Fortgeschritten', extraMin: 10, youtube: yt('vulkan base'),
    description: 'Ein Vulkan aus Stein und Magma mit einem glühenden Lavasee im Krater. Innen versteckt sich eine Schmiede mit Schmelzöfen, Amboss und Schmiedetisch, dazu die Lavafarm: Vier Tropfsteine füllen Kessel mit Lava, die nie ausgeht.',
    how: ['Der Kratersee ist eine Lavaquelle, ringsum von Stein gehalten.', 'Die Lavafarm innen ist das Modul aus dem Katalog: Lava über Stein, Tropfstein darunter, Kessel unten.'],
    tips: ['Magmablöcke verletzen dich, wenn du darauf läufst. Schleichen schützt.', 'Baue zuerst die Ringe des Vulkans von unten nach oben.'],
    layerNotes: { 0: 'Runde Bodenplatte des Vulkans.', 1: 'Höhle der Schmiede, Eingangstunnel im Norden, Lavafarm hinten.', 6: 'Decke der Schmiede.', 12: 'Krater mit Lavasee.' },
    build(b) {
      const C = 10;
      for (let y = 0; y <= 12; y++) {
        const R = 10 - y * 0.65;
        for (let x = 0; x <= 20; x++) for (let z = 0; z <= 20; z++) {
          const d = Math.hypot(x - C, z - C);
          if (y === 0) { if (d <= R + 0.3) b.set(x, 0, z, 'stone'); continue; }
          if (d > R + 0.3) continue;
          if (y <= 5 && d <= 5.6) continue;
          if (y === 6 && d <= 5.6) { b.set(x, y, z, 'stone'); continue; }
          if (d > R - 1.6 || y === 12) b.set(x, y, z, ((x * 7 + z * 3 + y) % 9 === 0) ? 'magma_block' : 'stone');
        }
      }
      b.fill(C - 1, 11, C - 1, C + 1, 11, C + 1, 'stone').set(C, 12, C, 'lava');
      for (let z = 0; z <= 5; z++) b.fill(C - 1, 1, z, C + 1, 3, z, null);
      b.fill(C - 1, 0, 0, C + 1, 0, 5, 'stone');
      for (let z = 0; z <= 5; z++) { b.set(C - 2, 1, z, 'stone').set(C + 2, 1, z, 'stone'); }
      b.set(C - 2, 1, -1, 'lantern').set(C + 2, 1, -1, 'lantern').fill(C - 1, 0, -2, C + 1, 0, -1, 'stone');
      place(b, 'lava', 6, 0, 11);
      b.set(7, 1, 7, 'blast_furnace:s').set(8, 1, 7, 'blast_furnace:s').set(12, 1, 7, 'anvil:e').set(13, 1, 8, 'smithing_table').set(6, 1, 9, 'chest:e');
      for (const [x, z] of [[7, 9], [13, 10]]) b.set(x, 5, z, 'glowstone');
    }
  });

  BP.finishAll();
})(window);
