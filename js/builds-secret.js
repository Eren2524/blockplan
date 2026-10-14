/* Blockplan – Geheimhäuser: Häuser mit versteckten Räumen, Geheimgängen, Redstone und eingebauten Farmen.
   Die Techniken sind in der Community verbreitete Ideen (Kolbentür mit Hebel, Bodenklappe, Wasserfall-Eingang,
   Brunnen-Abstieg, Tür als Luftschleuse unter Wasser), hier als eigene Entwürfe umgesetzt. */
(function (global) {
  'use strict';
  const BUILDS = global.BUILDS;
  const add = (o) => { o.cat = 'secret'; o.edition = o.edition || 'Java 1.20+'; o.how = o.how || []; o.tips = o.tips || []; o.layerNotes = o.layerNotes || {}; BUILDS.push(o); };
  const yt = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent('minecraft ' + q + ' tutorial deutsch');
  const door = (b, x, y, z, f, kind) => { b.set(x, y, z, (kind || 'oak_door') + ':' + f + ':lower').set(x, y + 1, z, (kind || 'oak_door') + ':' + f + ':upper'); };

  /* Kolben-Tresortür in einer doppelten Wand (Ebene z = innere Lage, z-1 = äußere Lage).
     Durchgang bei x, y..y+1. Klebrige Kolben kommen von Westen. Hebel sitzt außen in einer kleinen Nische.
     Hebel an: Block B wird stark gepowert, der obere Kolben steht daneben, der Redstone darunter versorgt den unteren. */
  function pistonVault(b, x, y, z, mat) {
    b.set(x, y, z - 1, null).set(x, y + 1, z - 1, null);
    b.set(x - 2, y, z, 'sticky_piston:e').set(x - 2, y + 1, z, 'sticky_piston:e');
    b.set(x - 1, y, z, 'piston_head:e').set(x - 1, y + 1, z, 'piston_head:e');
    b.set(x, y, z, mat).set(x, y + 1, z, mat);
    b.set(x - 3, y + 1, z, mat).set(x - 3, y, z, 'redstone');
    b.set(x - 3, y + 1, z - 1, 'lever:n');
  }
  const VAULT_HOW = [
    'Kolbentür: Hebel an = Tür zu. Der Hebel powert den Block, an dem er hängt. Daneben sitzt der obere klebrige Kolben, der Redstone unter dem Block versorgt den unteren.',
    'Hebel aus: Die klebrigen Kolben ziehen die Türblöcke zur Seite, der Durchgang ist frei.'
  ];

  /* ================================================================ */

  add({
    id: 'agentenhaus', name: 'Agentenhaus', tagline: 'Bodenklappe, Geheimkeller, Tresor, Zuckerrohrfarm',
    difficulty: 'Fortgeschritten', extraMin: 15, youtube: yt('geheimbasis unter haus'),
    description: 'Von außen ein ganz normales Holzhaus. Unter einer Falltür, die wie Holzboden aussieht, führt eine Leiter in einen großen Geheimkeller. Dort gibt es eine automatische Zuckerrohrfarm, die automatische Schmelze und einen Tresorraum hinter einer Kolbentür. Den Hebel für die Kolbentür versteckst du in einer kleinen Wandnische.',
    how: [
      'Bodenklappe: Eine geschlossene Falltür in der oberen Blockhälfte liegt bündig im Holzboden. Rechtsklick öffnet sie, darunter ist die Leiter.',
      'Zuckerrohr wächst auch im Dunkeln. Die Farm funktioniert deshalb im Keller, sie braucht nur Wasser.',
      ...VAULT_HOW,
      'Leuchtstein in der Kellerdecke verhindert, dass im Keller Monster spawnen.'
    ],
    tips: ['Lege einen Teppich neben die Klappe, dann fällt sie noch weniger auf.', 'Der Keller liegt komplett unter der Erde. Grabe ihn aus, bevor du das Haus baust.', 'Die Kolbentür ist auf die Java Edition ausgelegt.'],
    layerNotes: {
      0: 'Kellerboden. Trichter der Zuckerrohrfarm, Schmelze, Redstone für die Tresortür.',
      1: 'Leiter an der Säule unter der Klappe. Kolbentür zum Tresor im Südwesten, Hebel in der Nische daneben.',
      6: 'Kellerdecke = Erdgeschoss. Holzboden mit Bodenklappe über der Leiter.',
      7: 'Holzhaus mit Tür im Norden.'
    },
    build(b) {
      b.fill(-1, 0, -1, 21, 6, 10, 'stone_env');
      b.fill(0, 1, 0, 20, 5, 9, null);
      b.fill(0, 0, 0, 20, 0, 9, 'smooth_stone');
      b.fill(-2, 6, -2, 22, 6, 11, 'grass_env');
      BP.place(b, 'zuckerrohr', 11, 0, 0);
      BP.place(b, 'ofen', 13, 0, 7);
      // Tresor im Südwesten
      b.fill(0, 1, 4, 9, 5, 5, 'stone_bricks').fill(9, 1, 6, 9, 5, 9, 'stone_bricks');
      pistonVault(b, 6, 1, 5, 'stone_bricks');
      b.fill(0, 1, 9, 3, 1, 9, 'chest:n').fill(0, 2, 9, 3, 2, 9, 'chest:n').set(7, 1, 8, 'iron_block').set(8, 1, 8, 'iron_block').set(5, 1, 7, 'lantern');
      // Leiter
      b.fill(2, 1, 1, 2, 5, 1, 'stone_bricks');
      for (let y = 1; y <= 5; y++) b.set(2, y, 2, 'ladder:s');
      for (const [x, z] of [[5, 2], [9, 2], [16, 6], [11, 8]]) b.set(x, 5, z, 'glowstone');
      b.set(7, 1, 2, 'crafting_table').set(8, 1, 2, 'red_bed:e:foot').set(9, 1, 2, 'red_bed:e:head');
      // Haus
      b.fill(0, 6, 0, 10, 6, 8, 'oak_planks').set(2, 6, 2, 'oak_trapdoor_closed:n');
      b.walls(0, 7, 0, 10, 9, 8, 'spruce_planks');
      for (const [x, z] of [[0, 0], [10, 0], [0, 8], [10, 8]]) b.fill(x, 7, z, x, 9, z, 'spruce_log');
      door(b, 5, 7, 0, 's');
      b.set(2, 8, 0, 'glass_pane').set(8, 8, 0, 'glass_pane').set(0, 8, 4, 'glass_pane').set(10, 8, 4, 'glass_pane').set(5, 8, 8, 'glass_pane');
      for (let i = 0; ; i++) {
        const l = -1 + i, r = 9 - i, y = 10 + i;
        if (l > r) break;
        if (l === r) { b.fill(-1, y, l, 11, y, l, 'spruce_slab:bottom'); break; }
        b.fill(-1, y, l, 11, y, l, 'spruce_stairs:s'); b.fill(-1, y, r, 11, y, r, 'spruce_stairs:n');
        if (l + 1 <= r - 1) { b.fill(0, y, l + 1, 0, y, r - 1, 'spruce_planks'); b.fill(10, y, l + 1, 10, y, r - 1, 'spruce_planks'); }
      }
      b.set(3, 7, 2, 'red_carpet').set(8, 7, 6, 'bookshelf').set(9, 7, 6, 'bookshelf').set(8, 8, 6, 'bookshelf').set(1, 7, 7, 'crafting_table').set(6, 9, 4, 'lantern');
      b.set(8, 7, 2, 'red_bed:s:foot').set(8, 7, 3, 'red_bed:s:head');
    }
  });

  add({
    id: 'wasserfallversteck', name: 'Wasserfall-Versteck', tagline: 'Höhle hinter dem Wasserfall mit Bambusfarm',
    difficulty: 'Fortgeschritten', edition: 'Java & Bedrock 1.20+', extraMin: 10, youtube: yt('wasserfall geheimbasis'),
    description: 'Ein Wasserfall stürzt vor einer Felswand in einen kleinen Teich. Direkt dahinter liegt ein Höhleneingang, den man von außen nicht sieht. Innen wartet eine Höhlenbasis mit automatischer Bambusfarm unter Leuchtsteinen, Lager, Bett und einem Wasserfahrstuhl, der dich oben auf die Klippe schießt.',
    how: [
      'Die Wasserquelle sitzt in einer Kerbe oben in der Wand. Das Wasser fließt einen Block heraus und fällt dann senkrecht nach unten.',
      'Fallendes Wasser breitet sich nicht seitlich aus. Unten landet es im Teich, deshalb bleibt der Eingang dahinter trocken.',
      'Bambus braucht oben Licht der Stufe 9. Die Leuchtsteine an der Höhlendecke liefern das.',
      'Seelensand unter der Wassersäule schießt dich nach oben auf die Klippe.'
    ],
    tips: ['Am einfachsten gräbst du die Basis in einen echten Berg mit Wasserfall. Der graue Fels ist als „vorhanden“ markiert.', 'Erst die Kerbe mit der Quelle bauen, dann den Teich, dann die Höhle.'],
    layerNotes: {
      0: 'Teich vor der Wand, Boden der Höhle, Trichter der Bambusfarm, Seelensand.',
      1: 'Eingang direkt hinter dem Wasserfall, Gang in die Höhle.',
      6: 'Leuchtsteine an der Höhlendecke über dem Bambus.',
      8: 'Kerbe mit der Wasserquelle des Wasserfalls.',
      9: 'Klippe oben, Ausstieg des Fahrstuhls mit Zaun.'
    },
    build(b) {
      b.fill(-2, -1, -4, 22, -1, 1, 'stone_env').fill(-2, 0, -4, 22, 0, 1, 'grass_env');
      b.fill(8, 0, -1, 12, 0, 1, 'water');
      b.fill(0, -1, 2, 20, 8, 14, 'stone_env').fill(0, 9, 2, 20, 9, 14, 'grass_env');
      b.fill(10, 1, 2, 10, 2, 4, null);
      b.fill(3, 1, 5, 17, 6, 12, null);
      b.set(10, 8, 2, 'water');
      for (let y = 1; y <= 8; y++) b.set(10, y, 1, 'water_flow');
      BP.place(b, 'bambus', 4, 0, 7);
      for (const x of [5, 8, 11]) b.set(x, 6, 8, 'glowstone');
      b.set(15, 6, 9, 'glowstone');
      b.set(16, 0, 11, 'soul_sand');
      for (let y = 1; y <= 9; y++) b.set(16, y, 11, 'water');
      for (let y = 1; y <= 6; y++) { b.set(15, y, 11, 'glass').set(17, y, 11, 'glass').set(16, y, 12, 'glass').set(16, y, 10, 'glass'); }
      door(b, 16, 1, 10, 's');
      for (const [x, z] of [[15, 10], [17, 10], [15, 12], [17, 12]]) b.set(x, 10, z, 'oak_fence');
      b.set(16, 10, 13, 'lantern');
      b.fill(15, 1, 5, 17, 1, 5, 'chest:s').set(15, 1, 8, 'red_bed:w:head').set(16, 1, 8, 'red_bed:w:foot').set(17, 1, 7, 'crafting_table').set(17, 1, 6, 'furnace:w');
    }
  });

  add({
    id: 'brunnenbunker', name: 'Brunnen-Bunker', tagline: 'Spring in den Brunnen und tauch in die Geheimbasis',
    difficulty: 'Fortgeschritten', edition: 'Java & Bedrock', extraMin: 20, youtube: yt('brunnen geheimbasis'),
    description: 'Neben einem kleinen Häuschen steht ein Dorfbrunnen. Wer hineinspringt, wird von einer Blasensäule zehn Blöcke in die Tiefe gezogen, mitten in eine Geheimbasis. Dort laufen eine Kürbis- und Melonenfarm und eine Eierfarm. Über die zweite Säule schießt dich der Brunnen wieder nach oben.',
    how: [
      'Unter der linken Brunnensäule liegt ein Magmablock: Die Blasen ziehen dich nach unten.',
      'Unter der rechten liegt Seelensand: Die Blasen schießen dich nach oben.',
      'Unten halten Türen das Wasser in den Glasröhren, du gehst einfach hinaus.',
      'Die Kürbisstiele brauchen Licht der Stufe 9. Leuchtsteine über der Glasreihe liefern es.'
    ],
    tips: ['Jedes Feld der Säulen muss eine Wasserquelle sein. Nutze den Seetang-Trick.', 'Unten bekommst du in der Blasensäule genug Luft, keine Sorge.'],
    layerNotes: {
      0: 'Basisboden mit Magmablock (runter) und Seelensand (hoch). Trichter der Farmen.',
      1: 'Glasröhren mit Türen nach Norden. Kürbisfarm und Eierfarm.',
      5: 'Leuchtsteine über der Glasreihe der Kürbisfarm.',
      11: 'Brunnenrand mit den zwei Wassersäulen, daneben das Häuschen.'
    },
    build(b) {
      b.fill(-2, 0, -2, 22, 9, 14, 'stone_env').fill(-2, 10, -2, 22, 10, 14, 'grass_env');
      b.fill(2, 1, 2, 18, 5, 12, null).fill(2, 0, 2, 18, 0, 12, 'smooth_stone');
      BP.place(b, 'kuerbis', 7, 0, 8);
      BP.place(b, 'eier', 12, 0, 3);
      for (const x of [8, 12, 16]) b.set(x, 5, 8, 'glowstone');
      b.set(4, 0, 4, 'magma_block').set(5, 0, 4, 'soul_sand');
      for (let y = 1; y <= 11; y++) { b.set(4, y, 4, 'water').set(5, y, 4, 'water'); }
      for (let y = 1; y <= 5; y++) { b.set(3, y, 4, 'glass').set(6, y, 4, 'glass').set(4, y, 5, 'glass').set(5, y, 5, 'glass').set(4, y, 3, 'glass').set(5, y, 3, 'glass'); }
      door(b, 4, 1, 3, 's'); door(b, 5, 1, 3, 's');
      b.fill(4, 6, 5, 5, 11, 5, 'stone_env');
      for (let x = 3; x <= 6; x++) for (let z = 3; z <= 6; z++) if (x === 3 || x === 6 || z === 3 || z === 6) b.set(x, 11, z, 'cobblestone');
      b.set(4, 11, 5, 'cobblestone').set(5, 11, 5, 'cobblestone');
      for (const [x, z] of [[3, 3], [6, 3], [3, 6], [6, 6]]) b.fill(x, 12, z, x, 13, z, 'oak_fence');
      b.fill(3, 14, 3, 6, 14, 6, 'cobblestone_slab:bottom');
      b.set(8, 1, 3, 'chest:s').set(9, 1, 3, 'chest:s').set(2, 1, 11, 'crafting_table').set(3, 1, 11, 'furnace:n').set(8, 1, 5, 'red_bed:e:foot').set(9, 1, 5, 'red_bed:e:head');
      for (const [x, z] of [[10, 4], [3, 8]]) b.set(x, 5, z, 'glowstone');
      // Häuschen
      b.fill(10, 10, 0, 16, 10, 5, 'oak_planks');
      b.walls(10, 11, 0, 16, 13, 5, 'oak_planks');
      for (const [x, z] of [[10, 0], [16, 0], [10, 5], [16, 5]]) b.fill(x, 11, z, x, 13, z, 'oak_log');
      door(b, 13, 11, 0, 's');
      b.set(11, 12, 0, 'glass_pane').set(15, 12, 0, 'glass_pane').set(16, 12, 3, 'glass_pane');
      for (let i = 0; ; i++) {
        const l = -1 + i, r = 6 - i, y = 14 + i;
        if (l > r) break;
        b.fill(9, y, l, 17, y, l, 'oak_stairs:s'); b.fill(9, y, r, 17, y, r, 'oak_stairs:n');
        if (l + 1 <= r - 1) { b.fill(10, y, l + 1, 10, y, r - 1, 'oak_planks'); b.fill(16, y, l + 1, 16, y, r - 1, 'oak_planks'); }
      }
      b.set(14, 11, 4, 'crafting_table').set(11, 11, 4, 'red_bed:s:head').set(11, 11, 3, 'red_bed:s:foot').set(12, 13, 2, 'lantern');
    }
  });

  add({
    id: 'teichhaus', name: 'Teichhaus', tagline: 'Tauch-Eingang, Aquarium-Raum, Bienenfarm, Nachtlicht',
    difficulty: 'Fortgeschritten', extraMin: 15, youtube: yt('unterwasser geheimraum teich'),
    description: 'Ein helles Haus mit Garten-Teich. Der Teich ist das Geheimnis: Wer bis zum Grund taucht, findet eine Tür. Dahinter ist es trocken, eine Leiter führt hinunter in einen Raum direkt unter dem Teich mit Glasdecke. Über dir schwimmt das Wasser wie in einem Aquarium. Ein zweiter geheimer Weg führt durch eine Bodenklappe im Haus. Im Garten läuft die Honigwabenfarm, und das Dach leuchtet nachts.',
    how: [
      'Eine Tür unter Wasser hält das Wasser zurück. Dahinter bleibt Luft. In der Java Edition funktioniert das ohne Add-ons.',
      'Der Raum liegt unter einer Glasdecke, auf der der Teich steht. Glas hält Wasser, du siehst durch.',
      'Bodenklappe im Haus: geschlossene Falltür bündig im Boden, darunter eine Leiter in den Gang.',
      'Nachtlicht: umgedrehter Tageslichtsensor auf dem Dach, Redstone auf der Lampenreihe.',
      'Am Teichrand wächst Zuckerrohr, weil es direkt neben Wasser steht.'
    ],
    tips: ['In der Bedrock Edition hält eine Tür unter Wasser die Luft nicht. Nutze dort nur den Weg über die Bodenklappe.', 'Baue erst den Raum und die Glasdecke, dann fülle den Teich.'],
    layerNotes: {
      0: 'Boden des Geheimraums, Seelaternen.',
      1: 'Geheimraum, Gänge zur Leiter und zur Bodenklappe.',
      3: 'Glasdecke unter dem Teich.',
      4: 'Teichgrund: Tür in der Ostwand, dahinter trockener Gang zur Leiter.',
      7: 'Erdoberfläche, Teich, Haus mit Bodenklappe, Honigwabenfarm, Zuckerrohr am Ufer.',
      11: 'Flachdach mit Lampenreihe, Redstone und Tageslichtsensor.'
    },
    build(b) {
      b.fill(-2, -1, -2, 23, 6, 16, 'stone_env').fill(-2, 7, -2, 23, 7, 16, 'grass_env');
      // Teich und Geheimraum
      b.fill(2, 4, 8, 9, 7, 13, 'water');
      b.fill(3, 3, 9, 8, 3, 12, 'glass');
      b.fill(3, 1, 9, 8, 2, 12, null).fill(3, 0, 9, 8, 0, 12, 'prismarine_bricks');
      b.set(4, 0, 10, 'sea_lantern').set(7, 0, 11, 'sea_lantern');
      b.set(3, 1, 12, 'chest:n').set(4, 1, 12, 'chest:n').set(8, 1, 9, 'red_bed:s:foot').set(8, 1, 10, 'red_bed:s:head').set(5, 1, 9, 'bookshelf').set(6, 1, 9, 'lectern');
      // Tür am Teichgrund + Gang + Leiter
      door(b, 10, 4, 10, 'e');
      b.set(11, 4, 10, null).set(11, 5, 10, null);
      for (let y = 1; y <= 5; y++) b.set(12, y, 10, 'ladder:s');
      b.fill(9, 1, 10, 11, 2, 10, null);
      // Bodenklappe aus dem Haus
      for (let y = 1; y <= 6; y++) b.set(14, y, 6, 'ladder:w');
      b.fill(14, 1, 7, 14, 2, 10, null).fill(13, 1, 10, 13, 2, 10, null);
      b.set(14, 3, 8, 'glowstone').set(10, 3, 10, 'glowstone');
      // Haus
      b.fill(12, 7, 0, 20, 7, 6, 'oak_planks').set(14, 7, 6, 'oak_trapdoor_closed:n');
      b.walls(12, 8, 0, 20, 10, 6, 'white_concrete');
      for (const [x, z] of [[12, 0], [20, 0], [12, 6], [20, 6]]) b.fill(x, 8, z, x, 10, z, 'birch_log');
      door(b, 16, 8, 0, 's');
      b.fill(13, 8, 0, 15, 9, 0, 'glass').fill(17, 8, 0, 19, 9, 0, 'glass').fill(20, 9, 2, 20, 9, 4, 'glass');
      b.fill(11, 11, -1, 21, 11, 7, 'smooth_stone');
      const lamps = [];
      for (let x = 13; x <= 19; x++) lamps.push([x, 3]);
      BP.nightLights(b, [12, 3], lamps, 11);
      b.set(18, 8, 5, 'red_bed:w:head').set(19, 8, 5, 'red_bed:w:foot').set(13, 8, 5, 'crafting_table').set(17, 8, 2, 'red_carpet');
      // Garten
      BP.place(b, 'honigwaben', 12, 7, 9);
      for (let z = 9; z <= 12; z++) b.set(1, 8, z, 'sugar_cane');
      b.fill(15, 7, 7, 15, 7, 8, 'dirt_path');
    }
  });

  BP.finishAll();
})(window);
