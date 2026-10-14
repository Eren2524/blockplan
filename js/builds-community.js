/* Blockplan – Gebäude im Stil beliebter Community-Bauten, weitere Farmen und Bauprojekte.
   Alle Pläne sind eigene Entwürfe, angelehnt an Bauideen, die in der Minecraft-Community verbreitet sind. */
(function (global) {
  'use strict';
  const BUILDS = global.BUILDS;

  /* ---------- Helfer ---------- */
  /* Satteldach, First entlang z (Dachflächen nach Osten/Westen). Wände stehen auf x0..x1, z0..z1. */
  function roofZ(b, x0, x1, z0, z1, y, stair, gable, cap) {
    for (let i = 0; ; i++) {
      const l = x0 - 1 + i, r = x1 + 1 - i, yy = y + i;
      if (l > r) break;
      if (l === r) { b.fill(l, yy, z0 - 1, l, yy, z1 + 1, cap); break; }
      b.fill(l, yy, z0 - 1, l, yy, z1 + 1, stair + ':e');
      b.fill(r, yy, z0 - 1, r, yy, z1 + 1, stair + ':w');
      if (gable && l + 1 <= r - 1) { b.fill(l + 1, yy, z0, r - 1, yy, z0, gable); b.fill(l + 1, yy, z1, r - 1, yy, z1, gable); }
    }
  }
  /* Satteldach, First entlang x (Dachflächen nach Norden/Süden). */
  function roofX(b, x0, x1, z0, z1, y, stair, gable, cap) {
    for (let i = 0; ; i++) {
      const l = z0 - 1 + i, r = z1 + 1 - i, yy = y + i;
      if (l > r) break;
      if (l === r) { b.fill(x0 - 1, yy, l, x1 + 1, yy, l, cap); break; }
      b.fill(x0 - 1, yy, l, x1 + 1, yy, l, stair + ':s');
      b.fill(x0 - 1, yy, r, x1 + 1, yy, r, stair + ':n');
      if (gable && l + 1 <= r - 1) { b.fill(x0, yy, l + 1, x0, yy, r - 1, gable); b.fill(x1, yy, l + 1, x1, yy, r - 1, gable); }
    }
  }
  /* Zeltdach (Pyramide) mit 1 Block Überstand. */
  function pyramid(b, x0, x1, z0, z1, y, stair, cap, rings) {
    for (let i = 0; rings == null || i < rings; i++) {
      const a0 = x0 - 1 + i, a1 = x1 + 1 - i, c0 = z0 - 1 + i, c1 = z1 + 1 - i, yy = y + i;
      if (a0 > a1 || c0 > c1) break;
      if (a0 === a1 || c0 === c1) { b.fill(a0, yy, c0, a1, yy, c1, cap); break; }
      for (let x = a0; x <= a1; x++) { b.set(x, yy, c0, stair + ':s'); b.set(x, yy, c1, stair + ':n'); }
      for (let z = c0 + 1; z < c1; z++) { b.set(a0, yy, z, stair + ':e'); b.set(a1, yy, z, stair + ':w'); }
    }
  }
  const door = (b, x, y, z, f, kind) => { b.set(x, y, z, (kind || 'oak_door') + ':' + f + ':lower').set(x, y + 1, z, (kind || 'oak_door') + ':' + f + ':upper'); };
  const disc = (r) => { const pts = []; for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) { const d = Math.hypot(x, z); if (d <= r + 0.35) pts.push([x, z, d]); } return pts; };
  const yt = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent('minecraft ' + q + ' tutorial deutsch');
  const add = (o) => { o.edition = o.edition || 'Alle Versionen'; o.how = o.how || []; o.tips = o.tips || []; o.layerNotes = o.layerNotes || {}; BUILDS.push(o); };

  /* ================================================================
     GEBÄUDE IM COMMUNITY-STIL
     ================================================================ */

  add({
    id: 'taverne', cat: 'building', community: true, name: 'Taverne', tagline: 'Fachwerk-Gasthaus mit Theke und Kamin', difficulty: 'Mittel',
    description: 'Ein zweistöckiges Gasthaus, wie man es aus vielen Mittelalter-Dörfern der Community kennt: unten Bruchstein mit Theke aus Fässern, oben helles Fachwerk mit Schlafzimmern, dazu ein Kamin aus Ziegeln und ein Wirtshausschild.',
    tips: ['Setze erst alle Schwarzeichen-Balken, dann die Felder dazwischen.', 'Der Kamin wird nach dem Dach gebaut und geht durch die Dachfläche.'],
    layerNotes: { 0: 'Boden aus Bruchstein.', 1: 'Erdgeschoss mit Balken, Tür im Norden, Theke aus Fässern.', 4: 'Zwischendecke, Leiterloch frei lassen.', 5: 'Obergeschoss in Weiß mit Balken.', 8: 'Dach aus Schwarzeichentreppen.' },
    youtube: yt('mittelalter taverne'),
    build(b) {
      b.fill(0, 0, 0, 10, 0, 8, 'cobblestone');
      b.walls(0, 1, 0, 10, 3, 8, 'cobblestone');
      for (const x of [0, 5, 10]) for (const z of [0, 8]) b.fill(x, 1, z, x, 7, z, 'dark_oak_log');
      b.fill(0, 1, 4, 0, 7, 4, 'dark_oak_log').fill(10, 1, 4, 10, 7, 4, 'dark_oak_log');
      door(b, 3, 1, 0, 's');
      b.set(7, 2, 0, 'glass_pane').set(8, 2, 0, 'glass_pane').set(0, 2, 2, 'glass_pane').set(10, 2, 6, 'glass_pane');
      b.fill(0, 4, 0, 10, 4, 8, 'dark_oak_planks');
      b.walls(0, 5, 0, 10, 7, 8, 'white_concrete');
      for (const x of [0, 5, 10]) for (const z of [0, 8]) b.fill(x, 5, z, x, 7, z, 'dark_oak_log');
      b.fill(0, 5, 4, 0, 7, 4, 'dark_oak_log').fill(10, 5, 4, 10, 7, 4, 'dark_oak_log');
      b.set(2, 6, 0, 'glass_pane').set(8, 6, 0, 'glass_pane').set(2, 6, 8, 'glass_pane').set(8, 6, 8, 'glass_pane');
      roofX(b, 0, 10, 0, 8, 8, 'dark_oak_stairs', 'dark_oak_planks', 'dark_oak_slab:bottom');
      b.fill(2, 1, 5, 7, 1, 5, 'barrel').set(1, 1, 7, 'crafting_table');
      for (const x of [3, 7]) { b.set(x, 1, 2, 'oak_fence').set(x, 2, 2, 'red_carpet'); }
      for (let y = 1; y <= 4; y++) b.set(9, y, 1, 'ladder:w');
      b.set(2, 3, 2, 'lantern').set(7, 3, 3, 'lantern');
      b.set(2, 5, 6, 'red_bed:s:foot').set(2, 5, 7, 'red_bed:s:head').set(4, 5, 6, 'red_bed:s:foot').set(4, 5, 7, 'red_bed:s:head');
      b.fill(9, 1, 7, 9, 14, 7, 'bricks');
      b.set(5, 2, -1, 'oak_wall_sign:n').set(1, 1, -1, 'oak_fence').set(1, 2, -1, 'lantern');
    }
  });

  add({
    id: 'langhaus', cat: 'building', community: true, name: 'Wikinger-Langhaus', tagline: 'Langes Holzhaus mit tiefem Dach', difficulty: 'Mittel',
    description: 'Ein 15 Blöcke langes Langhaus aus Fichtenstämmen. Das Dach reicht fast bis zum Boden, innen gibt es eine Feuerstelle in der Mitte und lange Bänke. Ein beliebter Stil für Wikinger- und Nordland-Welten.',
    tips: ['Die Wände sind nur 2 Blöcke hoch, das tiefe Dach macht den Look.', 'Statt der Laterne in der Mitte passt ein Lagerfeuer.'],
    layerNotes: { 0: 'Boden aus Fichtenbrettern.', 1: 'Niedrige Wände aus Fichtenstämmen, Tor im Norden.', 3: 'Dach beginnt: Treppen zeigen zur Mitte.' },
    youtube: yt('wikinger langhaus'),
    build(b) {
      b.fill(0, 0, 0, 6, 0, 14, 'spruce_planks');
      b.walls(0, 1, 0, 6, 2, 14, 'spruce_log');
      b.fill(2, 1, 0, 4, 2, 0, null); door(b, 3, 1, 0, 's', 'oak_door');
      b.set(2, 1, 0, 'spruce_log').set(4, 1, 0, 'spruce_log').set(2, 2, 0, 'spruce_log').set(4, 2, 0, 'spruce_log');
      roofZ(b, 0, 6, 0, 14, 3, 'spruce_stairs', 'spruce_planks', 'spruce_slab:bottom');
      b.set(3, 5, 0, 'glass_pane').set(3, 5, 14, 'glass_pane');
      b.walls(2, 0, 6, 4, 0, 8, 'cobblestone').set(3, 1, 7, 'lantern');
      for (const z of [3, 4, 10, 11]) { b.set(1, 1, z, 'spruce_stairs:w').set(5, 1, z, 'spruce_stairs:e'); }
      b.set(1, 1, 13, 'chest:s').set(5, 1, 13, 'barrel').set(3, 1, 13, 'red_bed:w:head').set(4, 1, 13, 'red_bed:w:foot');
      b.set(-1, 1, -1, 'spruce_fence').set(-1, 2, -1, 'lantern').set(7, 1, -1, 'spruce_fence').set(7, 2, -1, 'lantern');
    }
  });

  add({
    id: 'pagode', cat: 'building', community: true, name: 'Japanische Pagode', tagline: 'Drei Stockwerke, geschwungene Dächer', difficulty: 'Fortgeschritten',
    description: 'Eine dreistöckige Pagode mit roten Säulen, dunklen Holzwänden und überstehenden Dachkränzen auf jeder Etage. Oben sitzt eine Spitze mit Laterne. Ein Klassiker aus Asien-Builds der Community.',
    tips: ['Jede Etage ist 2 Blöcke schmaler als die darunter.', 'Kirschholz statt Schwarzeiche ergibt eine helle Frühlings-Pagode.'],
    layerNotes: { 0: 'Sockel 9 × 9 aus Steinziegeln.', 1: 'Erdgeschoss mit roten Ecksäulen, Tür im Norden.', 4: 'Erster Dachkranz und Boden der zweiten Etage.', 7: 'Zweiter Dachkranz.', 10: 'Zeltdach der obersten Etage.' },
    youtube: yt('japanische pagode'),
    build(b) {
      b.fill(0, 0, 0, 8, 0, 8, 'stone_bricks');
      b.walls(1, 1, 1, 7, 3, 7, 'dark_oak_planks');
      [[1, 1], [7, 1], [1, 7], [7, 7]].forEach(([x, z]) => b.fill(x, 1, z, x, 3, z, 'red_concrete'));
      door(b, 4, 1, 1, 's');
      b.set(1, 2, 4, 'glass_pane').set(7, 2, 4, 'glass_pane').set(4, 2, 7, 'glass_pane');
      pyramid(b, 1, 7, 1, 7, 4, 'dark_oak_stairs', null, 1);
      b.fill(1, 4, 1, 7, 4, 7, 'dark_oak_planks');
      b.walls(2, 5, 2, 6, 6, 6, 'dark_oak_planks');
      [[2, 2], [6, 2], [2, 6], [6, 6]].forEach(([x, z]) => b.fill(x, 5, z, x, 6, z, 'red_concrete'));
      b.set(4, 5, 2, 'glass_pane').set(2, 5, 4, 'glass_pane').set(6, 5, 4, 'glass_pane').set(4, 5, 6, 'glass_pane');
      pyramid(b, 2, 6, 2, 6, 7, 'dark_oak_stairs', null, 1);
      b.fill(2, 7, 2, 6, 7, 6, 'dark_oak_planks');
      b.walls(3, 8, 3, 5, 9, 5, 'dark_oak_planks');
      [[3, 3], [5, 3], [3, 5], [5, 5]].forEach(([x, z]) => b.fill(x, 8, z, x, 9, z, 'red_concrete'));
      pyramid(b, 3, 5, 3, 5, 10, 'dark_oak_stairs', 'dark_oak_planks');
      b.fill(4, 13, 4, 4, 14, 4, 'dark_oak_fence').set(4, 15, 4, 'lantern');
      b.set(4, 1, 4, 'lantern');
    }
  });

  add({
    id: 'teehaus', cat: 'building', community: true, name: 'Japanisches Teehaus', tagline: 'Kirschholz, Veranda und Kirschbaum', difficulty: 'Leicht',
    description: 'Ein kleines Teehaus aus Kirschholz auf einer Holzveranda, mit weißen Papierwänden, Steinlaternen am Weg und einem blühenden Kirschbaum daneben. Kirschholz gibt es seit Version 1.20.',
    tips: ['Kirschholz findest du im Kirschblütenhain.', 'Die Steinlaternen sind Bruchsteinmauern mit Laterne darauf.'],
    layerNotes: { 0: 'Veranda aus Kirschholzbrettern, Trittsteine im Norden.', 1: 'Weiße Wände mit Kirschholz-Pfosten, breiter Eingang.', 4: 'Satteldach aus Kirschholztreppen.' },
    youtube: yt('japanisches teehaus kirschholz'),
    build(b) {
      b.fill(0, 0, 0, 8, 0, 6, 'cherry_planks');
      b.walls(1, 1, 1, 7, 3, 5, 'white_concrete');
      for (const x of [1, 4, 7]) for (const z of [1, 5]) b.fill(x, 1, z, x, 3, z, 'cherry_log');
      b.fill(1, 3, 1, 7, 3, 1, 'cherry_planks').fill(1, 3, 5, 7, 3, 5, 'cherry_planks');
      b.fill(3, 1, 1, 5, 2, 1, null).set(4, 1, 1, null);
      b.set(1, 2, 3, 'glass_pane').set(7, 2, 3, 'glass_pane');
      roofX(b, 1, 7, 1, 5, 4, 'cherry_stairs', 'cherry_planks', 'cherry_planks');
      b.set(3, 1, 3, 'red_carpet').set(4, 1, 3, 'red_carpet').set(5, 1, 3, 'red_carpet').set(4, 1, 4, 'lantern');
      for (const z of [-1, -3]) b.set(4, 0, z, 'smooth_stone_slab:bottom');
      for (const x of [1, 7]) b.set(x, 1, -2, 'cobblestone_wall').set(x, 2, -2, 'lantern');
      b.fill(11, 0, 3, 11, 4, 3, 'cherry_log');
      for (let x = 8; x <= 14; x++) for (let z = 0; z <= 6; z++) for (let y = 4; y <= 7; y++) {
        if (Math.hypot(x - 11, (y - 5) * 1.4, z - 3) <= 3.1 && !b.get(x, y, z)) b.set(x, y, z, 'cherry_leaves');
      }
    }
  });

  add({
    id: 'schmiede', cat: 'building', community: true, name: 'Schmiede', tagline: 'Offene Werkstatt mit Esse und Amboss', difficulty: 'Mittel',
    description: 'Eine Dorfschmiede mit offener Vorderseite: hinten die Esse aus Ziegeln mit Lava, daneben Schmelzofen, Ofen und Schmiedetisch, vorne ein Amboss und ein Wasserkessel. Der Kamin ragt durchs Dach.',
    tips: ['Die Lava sitzt in einem Ziegelbecken. Setze sie als Letztes.', 'Brennbare Blöcke nie direkt neben Lava bauen.'],
    layerNotes: { 0: 'Boden aus Bruchstein.', 1: 'Rückwand aus Steinziegeln, vorne Pfosten. Esse mit Lava hinten links.', 4: 'Dach aus Fichtentreppen, Kamin danach.' },
    youtube: yt('dorf schmiede'),
    build(b) {
      b.fill(0, 0, 0, 8, 0, 6, 'cobblestone');
      b.fill(0, 1, 6, 8, 3, 6, 'stone_bricks').fill(0, 1, 3, 0, 3, 6, 'stone_bricks').fill(8, 1, 3, 8, 3, 6, 'stone_bricks');
      for (const x of [0, 4, 8]) b.fill(x, 1, 0, x, 3, 0, 'spruce_log');
      b.fill(1, 1, 4, 3, 1, 5, 'bricks').set(2, 1, 4, 'lava').set(1, 1, 3, 'bricks').set(2, 1, 3, 'bricks').set(3, 1, 3, 'bricks');
      b.fill(1, 2, 5, 3, 3, 5, 'bricks');
      roofX(b, 0, 8, 0, 6, 4, 'spruce_stairs', 'spruce_planks', 'spruce_slab:bottom');
      b.fill(2, 3, 4, 2, 10, 4, 'bricks');
      b.set(4, 1, 5, 'blast_furnace:n').set(5, 1, 5, 'furnace:n').set(6, 1, 5, 'smithing_table').set(7, 1, 5, 'chest:n');
      b.set(5, 1, 2, 'anvil:e').set(7, 1, 1, 'cauldron').set(1, 1, 1, 'barrel').set(6, 3, 3, 'lantern');
    }
  });

  add({
    id: 'kirche', cat: 'building', community: true, name: 'Dorfkirche', tagline: 'Kirchenschiff mit Glockenturm', difficulty: 'Fortgeschritten',
    description: 'Eine Steinkirche mit langem Kirchenschiff, hohen Fenstern, Bänken und Altar. Vorne steht ein Glockenturm mit echter Glocke und Turmspitze. Ein Herzstück für jedes größere Dorf.',
    tips: ['Die hohen Fenster sind drei Glasscheiben übereinander.', 'Die Glocke kannst du anklicken, dann läutet sie.'],
    layerNotes: { 0: 'Boden für Turm und Kirchenschiff.', 1: 'Turm vorne (5 × 5) mit Tür nach Norden, Kirchenschiff dahinter.', 6: 'Dach des Kirchenschiffs.', 9: 'Glockenboden im Turm.', 10: 'Schallöffnungen und Glocke.', 13: 'Turmspitze.' },
    youtube: yt('kirche'),
    build(b) {
      b.fill(0, 0, 4, 6, 0, 16, 'stone_bricks').fill(1, 0, 0, 5, 0, 4, 'stone_bricks');
      b.walls(0, 1, 4, 6, 5, 16, 'stone_bricks');
      for (const z of [7, 10, 13]) for (let y = 2; y <= 4; y++) b.set(0, y, z, 'glass_pane').set(6, y, z, 'glass_pane');
      for (let y = 2; y <= 4; y++) b.set(3, y, 16, 'glass_pane');
      roofZ(b, 0, 6, 4, 16, 6, 'spruce_stairs', 'stone_bricks', 'spruce_slab:bottom');
      b.walls(1, 1, 0, 5, 12, 4, 'stone_bricks');
      door(b, 3, 1, 0, 's'); door(b, 3, 1, 4, 's');
      b.fill(2, 9, 1, 4, 9, 3, 'spruce_planks');
      for (const [x, z] of [[3, 0], [3, 4], [1, 2], [5, 2]]) b.fill(x, 10, z, x, 11, z, null);
      b.set(3, 10, 3, null).set(3, 10, 2, 'bell');
      for (let y = 1; y <= 9; y++) b.set(4, y, 3, 'ladder:w');
      b.set(5, 1, 3, 'stone_bricks');
      pyramid(b, 1, 5, 0, 4, 13, 'spruce_stairs', 'spruce_planks');
      b.fill(3, 17, 2, 3, 18, 2, 'oak_fence');
      for (const z of [7, 9, 11, 13]) { b.fill(1, 1, z, 2, 1, z, 'oak_stairs:n'); b.fill(4, 1, z, 5, 1, z, 'oak_stairs:n'); }
      b.fill(3, 1, 5, 3, 1, 14, 'red_carpet').set(3, 1, 15, 'quartz_block').set(2, 1, 15, 'lantern').set(4, 1, 15, 'lantern');
    }
  });

  add({
    id: 'marktplatz', cat: 'building', community: true, name: 'Marktplatz', tagline: '4 Stände rund um einen Brunnen', difficulty: 'Leicht',
    description: 'Ein gepflasterter Platz mit vier Marktständen unter bunten Wollmarkisen und einem Brunnenbecken in der Mitte. Ideal als Treffpunkt im Dorf oder auf einem Server-Spawn.',
    tips: ['Die Markisen kannst du in jeder Wollfarbe bauen.', 'Fässer und Strohballen sind die Waren-Deko.'],
    layerNotes: { 0: 'Pflaster aus Bruchstein mit Weg aus glattem Stein.', 1: 'Brunnenrand mit Wasser, Zaunpfosten der Stände, Theken.', 3: 'Markisen aus Wolle.' },
    youtube: yt('marktplatz markt stand'),
    build(b) {
      b.fill(0, 0, 0, 14, 0, 14, 'cobblestone').fill(6, 0, 0, 8, 0, 14, 'smooth_stone').fill(0, 0, 6, 14, 0, 8, 'smooth_stone');
      b.walls(5, 1, 5, 9, 1, 9, 'stone_bricks').fill(6, 1, 6, 8, 1, 8, 'water').fill(7, 1, 7, 7, 3, 7, 'stone_bricks').set(7, 4, 7, 'lantern');
      [[1, 1, 'red_wool'], [11, 1, 'white_wool'], [1, 11, 'white_wool'], [11, 11, 'red_wool']].forEach(([x, z, w]) => {
        [[0, 0], [2, 0], [0, 2], [2, 2]].forEach(([dx, dz]) => b.fill(x + dx, 1, z + dz, x + dx, 2, z + dz, 'oak_fence'));
        b.fill(x, 3, z, x + 2, 3, z + 2, w).set(x + 1, 3, z + 1, w === 'red_wool' ? 'white_wool' : 'red_wool');
        b.set(x + 1, 1, z + (z < 7 ? 2 : 0), 'barrel').set(x + 1, 1, z + 1, 'hay_block');
      });
      for (const [x, z] of [[0, 7], [14, 7], [7, 0], [7, 14]]) b.set(x, 1, z, 'cobblestone_wall').set(x, 2, z, 'lantern');
    }
  });

  add({
    id: 'imkerei', cat: 'building', community: true, name: 'Imkerei', tagline: 'Blumenwiese mit Bienenstöcken und Hütte', difficulty: 'Leicht',
    description: 'Eine eingezäunte Blumenwiese mit drei Bienenstöcken und einer kleinen Imkerhütte. Bienen brauchen Blumen in der Nähe, dann füllen sie die Stöcke mit Honig.',
    tips: ['Bienenstöcke mit einer Schere ernten, wenn sie voll sind. Ein Lagerfeuer darunter beruhigt die Bienen.', 'Die automatische Version findest du bei den Farmen: Honigwabenfarm.'],
    layerNotes: { 0: 'Rasen.', 1: 'Zaun rundherum mit Lücke im Norden, Blumen, Bienenstöcke. Hütte im Südosten.', 4: 'Dach der Hütte.' },
    youtube: yt('bienen imkerei'),
    build(b) {
      b.fill(0, 0, 0, 12, 0, 9, 'grass_block');
      b.walls(0, 1, 0, 12, 1, 9, 'oak_fence').set(6, 1, 0, 'spruce_fence_gate:s');
      [2, 5, 8].forEach((x) => b.set(x, 1, 2, 'beehive:s'));
      for (let x = 1; x <= 6; x++) for (let z = 4; z <= 8; z++) if ((x + z) % 2 === 0) b.set(x, 1, z, (x * z) % 3 ? 'poppy' : 'dandelion');
      b.walls(8, 1, 5, 11, 3, 8, 'spruce_planks');
      door(b, 9, 1, 5, 's'); b.set(11, 2, 7, 'glass_pane');
      pyramid(b, 8, 11, 5, 8, 4, 'spruce_stairs', 'spruce_planks');
      b.set(10, 1, 7, 'barrel').set(9, 1, 7, 'lantern');
    }
  });

  add({
    id: 'bootshaus', cat: 'building', community: true, name: 'Bootshaus mit Steg', tagline: 'Holzsteg und Hütte über dem Wasser', difficulty: 'Mittel',
    description: 'Ein Steg führt vom Ufer aufs Wasser zu einem Bootshaus auf Pfählen. Unter dem Haus gibt es eine offene Einfahrt für Boote. Die blauen Felder sind das vorhandene Gewässer, das du nicht selbst füllen musst.',
    tips: ['Baue direkt an einem See, Fluss oder an der Küste.', 'Die Pfähle aus Fichtenstämmen stehen im Wasser auf dem Grund.'],
    layerNotes: { 0: 'Grund aus Sand.', 1: 'Ufer aus Rasen, Wasser, Pfähle.', 2: 'Steg und Boden des Bootshauses.', 3: 'Wände des Bootshauses, Geländer am Steg.', 6: 'Dach.' },
    youtube: yt('bootshaus steg'),
    build(b) {
      b.fill(0, 0, 0, 12, 0, 18, 'sand');
      b.fill(0, 1, 0, 12, 1, 3, 'grass_block');
      b.fill(0, 1, 4, 12, 1, 18, 'water_env');
      for (const z of [6, 10]) for (const x of [5, 7]) b.set(x, 1, z, 'spruce_log');
      for (const z of [11, 17]) for (const x of [2, 10]) b.set(x, 1, z, 'spruce_log');
      b.fill(5, 2, 2, 7, 2, 10, 'spruce_planks');
      b.fill(2, 2, 11, 10, 2, 17, 'spruce_planks').fill(4, 2, 13, 8, 2, 17, null);
      b.walls(2, 3, 11, 10, 5, 17, 'spruce_planks');
      for (const [x, z] of [[2, 11], [10, 11], [2, 17], [10, 17]]) b.fill(x, 3, z, x, 5, z, 'spruce_log');
      b.fill(4, 3, 17, 8, 4, 17, null);
      door(b, 6, 3, 11, 's');
      b.set(2, 4, 14, 'glass_pane').set(10, 4, 14, 'glass_pane');
      roofX(b, 2, 10, 11, 17, 6, 'spruce_stairs', 'spruce_planks', 'spruce_slab:bottom');
      b.fill(5, 3, 3, 5, 3, 10, 'spruce_fence').fill(7, 3, 3, 7, 3, 10, 'spruce_fence');
      b.set(5, 4, 3, 'lantern').set(7, 4, 3, 'lantern').set(3, 3, 12, 'chest:s').set(9, 3, 12, 'barrel');
    }
  });

  add({
    id: 'hobbithoehle', cat: 'building', community: true, name: 'Hobbit-Höhle', tagline: 'Wohnhügel mit runder Tür', difficulty: 'Mittel',
    description: 'Ein grasbewachsener Hügel mit einer runden Tür aus Holz und zwei Fenstern. Innen ist ein gemütlicher Wohnraum mit Holzboden. Einer der beliebtesten Bau-Ideen überhaupt.',
    tips: ['Die Rundung entsteht durch die Kuppel. Halte dich Ebene für Ebene an das Raster.', 'Pflanze Blumen und Büsche auf den Hügel, dann wirkt er natürlich.'],
    layerNotes: { 0: 'Boden: Holz innen, Rasen außen.', 1: 'Front aus Erde mit Holzrahmen um die Tür. Hügel aus Grasblöcken beginnt.', 6: 'Höchster Punkt des Hügels.' },
    youtube: yt('hobbit höhle'),
    build(b) {
      const r = 6, C = 6;
      for (let x = 0; x <= 12; x++) for (let z = 2; z <= 12; z++) for (let y = 0; y <= 6; y++) {
        const d = Math.hypot(x - C, y, z - C);
        if (d > r + 0.2) continue;
        if (y === 0) { b.set(x, 0, z, d <= r - 1 ? 'oak_planks' : 'grass_block'); continue; }
        if (z === 2) { b.set(x, y, z, 'dirt'); continue; }
        if (d > r - 1) b.set(x, y, z, 'grass_block');
      }
      for (let x = 3; x <= 9; x++) for (let y = 0; y <= 4; y++) {
        const dd = Math.hypot(x - C, y - 1.5);
        if (dd >= 1.2 && dd <= 2.3 && b.get(x, y, 2)) b.set(x, y, 2, 'spruce_planks');
      }
      door(b, C, 1, 2, 's', 'oak_door');
      b.set(3, 2, 2, 'glass_pane').set(9, 2, 2, 'glass_pane');
      b.fill(C, 0, 0, C, 0, 1, 'dirt_path').fill(0, 0, 0, 5, 0, 1, 'grass_block').fill(7, 0, 0, 12, 0, 1, 'grass_block');
      b.set(4, 1, 1, 'oak_fence').set(4, 2, 1, 'lantern');
      b.set(4, 1, 8, 'crafting_table').set(8, 1, 8, 'furnace:n').set(6, 1, 9, 'chest:n').set(6, 1, 6, 'red_carpet').set(5, 1, 6, 'red_carpet').set(7, 1, 6, 'red_carpet').set(8, 3, 5, 'lantern');
      [[3, 6], [9, 7], [6, 10]].forEach(([x, z]) => { for (let y = 6; y >= 1; y--) if (b.get(x, y, z) === 'grass_block') { b.set(x, y + 1, z, y % 2 ? 'poppy' : 'dandelion'); break; } });
    }
  });

  add({
    id: 'magierturm', cat: 'building', community: true, name: 'Magierturm', tagline: 'Runder Turm mit spitzem Zauberhut', difficulty: 'Fortgeschritten',
    description: 'Ein runder Steinturm mit drei Etagen, Bücherregalen, Lesepult und einem schiefen, spitzen Hutdach aus Schwarzeiche. Oben leuchtet ein Kristall. Perfekt für Zauberer- und Fantasy-Welten.',
    tips: ['Der Grundriss ist ein Kreis mit 7 Blöcken Durchmesser, genau wie beim Leuchtturm.', 'Das Hutdach kippt leicht nach Osten. So sieht es lebendiger aus.'],
    layerNotes: { 0: 'Runde Bodenplatte.', 1: 'Kreiswand, Tür im Norden, Leiter an der Südwand.', 5: 'Erster Zwischenboden.', 10: 'Zweiter Zwischenboden.', 15: 'Hutdach beginnt.' },
    youtube: yt('magierturm zauberer turm'),
    build(b) {
      const r3 = BP.circle(3);
      r3.forEach(([x, z]) => b.set(x + 3, 0, z + 3, 'stone_bricks'));
      for (let y = 1; y <= 14; y++) r3.forEach(([x, z, edge]) => { if (edge) b.set(x + 3, y, z + 3, y % 5 === 0 ? 'cobblestone' : 'stone_bricks'); });
      for (const y of [5, 10]) r3.forEach(([x, z, edge]) => { if (!edge) b.set(x + 3, y, z + 3, 'dark_oak_planks'); });
      door(b, 3, 1, 0, 's');
      for (const y of [3, 7, 12]) b.set(0, y, 3, 'glass_pane').set(6, y, 3, 'glass_pane');
      for (let y = 1; y <= 15; y++) b.set(3, y, 5, 'ladder:n');
      b.set(3, 1, 3, 'lectern').set(1, 1, 2, 'bookshelf').set(1, 1, 4, 'bookshelf').set(5, 1, 2, 'bookshelf').set(5, 1, 4, 'bookshelf');
      b.set(1, 6, 3, 'bookshelf').set(5, 6, 3, 'bookshelf').set(3, 6, 2, 'red_bed:w:head').set(4, 6, 2, 'red_bed:w:foot').set(3, 11, 3, 'lantern');
      for (let y = 15; y <= 22; y++) {
        const rr = 4.3 * (1 - (y - 15) / 8.5), cx = 3 + (y - 15) * 0.18;
        for (let x = -2; x <= 9; x++) for (let z = -2; z <= 8; z++) {
          const d = Math.hypot(x - cx, z - 3);
          if (d <= rr + 0.3 && (d > rr - 1.1 || y === 15)) if (!(x === 3 && z === 5 && y === 15)) b.set(x, y, z, 'dark_oak_planks');
        }
      }
      b.set(5, 23, 3, 'sea_lantern');
    }
  });

  add({
    id: 'torhaus', cat: 'building', community: true, name: 'Torhaus', tagline: 'Zwei Türme mit großem Burgtor', difficulty: 'Mittel',
    description: 'Ein Burgtor zwischen zwei Türmen, mit Bogen, hochgezogenem Fallgitter, Wehrgang und Zinnen. Davor kannst du eine Burgmauer in beide Richtungen anschließen.',
    tips: ['Das Fallgitter ist eine Reihe Schwarzeichenzäune oben im Torbogen.', 'Die Türen in den Türmen führen aus der Durchfahrt zu den Leitern.'],
    layerNotes: { 0: 'Fundament.', 1: 'Zwei Türme 5 × 5, dazwischen die Durchfahrt (3 breit, 4 hoch).', 4: 'Torbogen aus umgedrehten Treppen, Fallgitter.', 9: 'Wehrgang über dem Tor mit Zinnen.', 11: 'Zinnen auf den Türmen.' },
    youtube: yt('burgtor torhaus'),
    build(b) {
      b.fill(0, 0, 0, 14, 0, 4, 'stone_bricks');
      for (const tx of [0, 10]) {
        b.walls(tx, 1, 0, tx + 4, 10, 4, 'stone_bricks');
        b.fill(tx + 1, 5, 1, tx + 3, 5, 3, 'spruce_planks').fill(tx, 10, 0, tx + 4, 10, 4, 'stone_bricks');
        for (let x = tx; x <= tx + 4; x++) for (let z = 0; z <= 4; z++) if ((x === tx || x === tx + 4 || z === 0 || z === 4) && (x + z) % 2 === 0) b.set(x, 11, z, 'stone_bricks');
        b.set(tx + 2, 7, 0, 'glass_pane');
        for (let y = 1; y <= 10; y++) b.set(tx + 2, y, 2, 'ladder:n');
        for (let y = 1; y <= 9; y++) b.set(tx + 2, y, 3, 'stone_bricks');
      }
      b.fill(5, 1, 0, 9, 8, 4, 'stone_bricks').fill(6, 1, 0, 8, 4, 4, null).fill(5, 1, 1, 5, 3, 3, null).fill(9, 1, 1, 9, 3, 3, null);
      b.walls(5, 1, 0, 9, 3, 4, 'stone_bricks').fill(6, 1, 0, 8, 3, 0, null).fill(6, 1, 4, 8, 3, 4, null).fill(5, 1, 1, 5, 3, 3, null).fill(9, 1, 1, 9, 3, 3, null);
      for (let z = 0; z <= 4; z++) { b.set(6, 4, z, 'stone_brick_stairs:w:top').set(8, 4, z, 'stone_brick_stairs:e:top').set(7, 4, z, null); }
      b.fill(6, 4, 2, 8, 4, 2, 'dark_oak_fence');
      door(b, 4, 1, 2, 'w'); door(b, 10, 1, 2, 'e');
      for (let x = 5; x <= 9; x++) if (x % 2 === 1) b.set(x, 9, 0, 'stone_bricks').set(x, 9, 4, 'stone_bricks');
      b.set(5, 2, -1, 'lantern').set(9, 2, -1, 'lantern').set(5, 1, -1, 'cobblestone_wall').set(9, 1, -1, 'cobblestone_wall');
    }
  });

  add({
    id: 'silo', cat: 'building', community: true, name: 'Bauernhof-Silo', tagline: 'Runder Ziegelsilo mit Geräteschuppen', difficulty: 'Leicht',
    description: 'Ein hoher runder Silo aus Ziegelsteinen mit Kuppel aus glattem Stein, daneben ein Geräteschuppen voller Strohballen. Passt perfekt neben die Scheune oder die Weizenfarm.',
    tips: ['Der Silo ist ein Kreis mit 5 Blöcken Durchmesser.', 'Innen kann eine Leiter nach oben führen, wenn du eine Aussicht willst.'],
    layerNotes: { 0: 'Boden für Silo und Schuppen.', 1: 'Silowand und Schuppenwände.', 13: 'Kuppel des Silos.' },
    youtube: yt('silo bauernhof'),
    build(b) {
      const r2 = BP.circle(2);
      r2.forEach(([x, z]) => b.set(x + 2, 0, z + 2, 'stone_bricks'));
      for (let y = 1; y <= 12; y++) r2.forEach(([x, z, edge]) => { if (edge) b.set(x + 2, y, z + 2, y % 4 === 0 ? 'smooth_stone' : 'bricks'); });
      r2.forEach(([x, z]) => b.set(x + 2, 13, z + 2, 'smooth_stone'));
      b.set(2, 14, 2, 'smooth_stone_slab:bottom').fill(1, 14, 2, 3, 14, 2, 'smooth_stone_slab:bottom').fill(2, 14, 1, 2, 14, 3, 'smooth_stone_slab:bottom');
      b.fill(6, 0, 0, 11, 0, 5, 'cobblestone');
      b.walls(6, 1, 0, 11, 3, 5, 'spruce_planks');
      for (const [x, z] of [[6, 0], [11, 0], [6, 5], [11, 5]]) b.fill(x, 1, z, x, 3, z, 'spruce_log');
      b.fill(8, 1, 0, 9, 2, 0, null);
      roofX(b, 6, 11, 0, 5, 4, 'spruce_stairs', 'spruce_planks', 'spruce_slab:bottom');
      b.fill(7, 1, 3, 8, 2, 4, 'hay_block').set(10, 1, 4, 'hay_block').set(10, 1, 1, 'barrel');
    }
  });

  add({
    id: 'wuestenhaus', cat: 'building', community: true, name: 'Wüstenhaus', tagline: 'Sandstein, Flachdach, Dachterrasse', difficulty: 'Leicht',
    description: 'Ein Haus aus Sandstein mit Keramik-Band, flachem Dach mit Brüstung und einer Treppe zur Dachterrasse. Mit Palme neben dem Eingang. Ideal für Wüstendörfer.',
    tips: ['Glatter Sandstein oder geschnittener Sandstein sehen genauso gut aus.', 'Die Palme ist ein Stamm mit Laub-Wedeln oben.'],
    layerNotes: { 0: 'Boden aus Sandstein.', 1: 'Wände, Tür im Norden, Fenster.', 3: 'Keramik-Band.', 4: 'Flachdach mit Brüstung.' },
    youtube: yt('wüstenhaus sandstein'),
    build(b) {
      b.fill(0, 0, 0, 8, 0, 8, 'sandstone');
      b.walls(0, 1, 0, 8, 3, 8, 'sandstone');
      b.walls(0, 3, 0, 8, 3, 8, 'terracotta');
      door(b, 4, 1, 0, 's');
      b.set(2, 2, 0, 'glass_pane').set(6, 2, 0, 'glass_pane').set(0, 2, 4, 'glass_pane').set(8, 2, 4, 'glass_pane').set(4, 2, 8, 'glass_pane');
      b.fill(0, 4, 0, 8, 4, 8, 'sandstone');
      for (let x = 0; x <= 8; x++) for (let z = 0; z <= 8; z++) if (x === 0 || x === 8 || z === 0 || z === 8) b.set(x, 5, z, 'sandstone_slab:bottom');
      for (let y = 1; y <= 4; y++) b.set(7, y, 6, 'ladder:w');
      b.set(1, 1, 7, 'crafting_table').set(2, 1, 7, 'furnace:n').set(4, 1, 4, 'red_carpet').set(6, 3, 2, 'lantern').set(2, 5, 6, 'red_carpet');
      b.fill(-2, 1, -1, -2, 5, -1, 'oak_log');
      for (const [x, z] of [[-3, -1], [-1, -1], [-2, -2], [-2, 0], [-4, -1], [0, -1], [-2, -3], [-2, 1]]) b.set(x, 6, z, 'oak_leaves');
      b.set(-2, 6, -1, 'oak_leaves').set(-2, 7, -1, 'oak_leaves');
    }
  });

  add({
    id: 'iglu', cat: 'building', community: true, name: 'Iglu', tagline: 'Schneekuppel mit Eingangstunnel', difficulty: 'Leicht',
    description: 'Ein rundes Iglu aus Schneeblöcken mit kurzem Eingangstunnel. Innen gibt es Teppich, Bett, Ofen und eine Laterne. Schnell gebaut und perfekt für die erste Nacht in der Tundra.',
    tips: ['Schneeblöcke baust du aus 4 Schneebällen. Eine Schaufel sammelt Schnee schnell.', 'In warmen Biomen schmilzt Schnee nicht, nur Eis.'],
    layerNotes: { 0: 'Runde Bodenplatte aus Schnee.', 1: 'Kuppel beginnt, Tunnel im Norden.', 4: 'Spitze der Kuppel.' },
    youtube: yt('iglu'),
    build(b) {
      const C = 4;
      for (let x = 0; x <= 8; x++) for (let z = 0; z <= 8; z++) for (let y = 0; y <= 4; y++) {
        const d = Math.hypot(x - C, y, z - C);
        if (y === 0 && Math.hypot(x - C, z - C) <= 4.1) b.set(x, 0, z, 'snow_block');
        else if (y > 0 && d > 3.1 && d <= 4.15) b.set(x, y, z, 'snow_block');
      }
      for (let z = -2; z <= 1; z++) { b.set(C, 1, z, null).set(C, 2, z, null); }
      for (let z = -2; z <= 0; z++) { b.fill(C - 1, 1, z, C - 1, 2, z, 'snow_block').fill(C + 1, 1, z, C + 1, 2, z, 'snow_block').set(C, 3, z, 'snow_block').set(C, 0, z, 'snow_block'); }
      b.fill(3, 1, 3, 5, 1, 5, 'red_carpet').set(2, 1, 5, 'red_bed:e:foot').set(3, 1, 5, 'red_bed:e:head').set(6, 1, 4, 'furnace:w').set(4, 3, 4, 'lantern');
      b.set(3, 1, 5, 'red_bed:e:head').set(2, 1, 5, 'red_bed:e:foot');
    }
  });

  add({
    id: 'strandhaus', cat: 'building', community: true, name: 'Strandhaus', tagline: 'Birkenholz auf Stelzen mit Veranda', difficulty: 'Mittel',
    description: 'Ein helles Strandhaus aus Birkenholz auf Stelzen, mit großer Veranda, Treppe zum Sand und einem Sonnenschirm. Darunter bleibt Platz für Liegestühle.',
    tips: ['Baue am Strand oder an einem See.', 'Der Sonnenschirm ist ein Zaun mit Wolle darauf.'],
    layerNotes: { 0: 'Sand.', 1: 'Stelzen aus Birkenstämmen.', 3: 'Veranda aus Birkenholz.', 4: 'Wände des Hauses, große Fenster nach Norden.', 7: 'Dach.' },
    youtube: yt('strandhaus'),
    build(b) {
      b.fill(-2, 0, -4, 12, 0, 9, 'sand');
      for (const x of [0, 5, 10]) for (const z of [0, 4, 8]) b.fill(x, 1, z, x, 2, z, 'birch_log');
      b.fill(0, 3, 0, 10, 3, 8, 'birch_planks');
      b.walls(1, 4, 2, 7, 6, 7, 'white_concrete');
      for (const [x, z] of [[1, 2], [7, 2], [1, 7], [7, 7]]) b.fill(x, 4, z, x, 6, z, 'birch_log');
      b.fill(2, 4, 2, 3, 5, 2, 'glass').fill(5, 4, 2, 6, 5, 2, 'glass');
      door(b, 4, 4, 2, 's');
      b.set(7, 5, 4, 'glass_pane').set(1, 5, 5, 'glass_pane');
      roofX(b, 1, 7, 2, 7, 7, 'birch_stairs', 'birch_planks', 'birch_planks');
      for (let x = 0; x <= 10; x++) if (x !== 9) b.set(x, 4, 0, 'oak_fence');
      for (let z = 1; z <= 8; z++) { b.set(10, 4, z, 'oak_fence'); }
      b.set(9, 1, -3, 'birch_stairs:s').set(9, 2, -2, 'birch_stairs:s').set(9, 3, -1, 'birch_stairs:s');
      b.fill(-1, 1, -3, -1, 3, -3, 'oak_fence').fill(-2, 4, -4, 0, 4, -2, 'red_wool').set(-1, 4, -3, 'white_wool');
      b.set(3, 4, 5, 'red_bed:s:foot').set(3, 4, 6, 'red_bed:s:head').set(6, 4, 6, 'chest:n').set(5, 4, 4, 'lantern');
    }
  });

  add({
    id: 'berghuette', cat: 'building', community: true, name: 'Berghütte', tagline: 'Chalet mit Balkon und Steinsockel', difficulty: 'Mittel',
    description: 'Eine Alpenhütte mit Erdgeschoss aus Bruchstein, Obergeschoss aus Fichtenholz, Balkon über dem Eingang und einem weit überstehenden Satteldach. Sieht im Schnee besonders gut aus.',
    tips: ['Bau sie an einen Hang, dann wirkt der Steinsockel wie ein Fundament im Fels.', 'Die Balkontür ist eine zweite Tür im Obergeschoss.'],
    layerNotes: { 0: 'Boden.', 1: 'Erdgeschoss aus Bruchstein, Tür im Norden.', 4: 'Decke mit Balkon nach Norden.', 5: 'Obergeschoss aus Fichtenholz, Balkongeländer.', 7: 'Dach.' },
    youtube: yt('berghütte chalet'),
    build(b) {
      b.fill(0, 0, 0, 8, 0, 8, 'cobblestone');
      b.walls(0, 1, 0, 8, 3, 8, 'cobblestone');
      door(b, 4, 1, 0, 's');
      b.set(2, 2, 0, 'glass_pane').set(6, 2, 0, 'glass_pane').set(0, 2, 4, 'glass_pane').set(8, 2, 4, 'glass_pane');
      b.fill(0, 4, -2, 8, 4, 8, 'spruce_planks');
      b.walls(0, 5, 0, 8, 6, 8, 'spruce_planks');
      for (const [x, z] of [[0, 0], [8, 0], [0, 8], [8, 8], [4, 8]]) b.fill(x, 1, z, x, 6, z, 'spruce_log');
      door(b, 4, 5, 0, 'n');
      b.set(2, 6, 0, 'glass_pane').set(6, 6, 0, 'glass_pane').set(0, 6, 4, 'glass_pane').set(8, 6, 4, 'glass_pane');
      for (let x = 0; x <= 8; x++) b.set(x, 5, -2, 'spruce_fence');
      b.set(0, 5, -1, 'spruce_fence').set(8, 5, -1, 'spruce_fence');
      roofZ(b, 0, 8, 0, 8, 7, 'spruce_stairs', 'spruce_planks', 'spruce_slab:bottom');
      for (let y = 1; y <= 4; y++) b.set(7, y, 7, 'ladder:w');
      b.set(1, 1, 7, 'furnace:n').set(2, 1, 7, 'crafting_table').set(2, 5, 6, 'red_bed:s:foot').set(2, 5, 7, 'red_bed:s:head').set(5, 3, 4, 'lantern').set(6, 5, 2, 'chest:s');
    }
  });

  add({
    id: 'villa', cat: 'building', community: true, name: 'Moderne Villa mit Pool', tagline: 'Quarz, Glas und Pool-Terrasse', difficulty: 'Fortgeschritten',
    description: 'Eine moderne Villa aus Quarz auf zwei Etagen, mit versetztem Obergeschoss, großen Glasfronten, Terrasse aus glattem Stein und einem Pool davor. Der Look ist an die beliebten „Modern House“-Builds angelehnt.',
    tips: ['Der Pool ist nur 1 Block tief: Grabe ihn in den Boden.', 'Seelaternen unter Wasser lassen den Pool nachts leuchten.'],
    layerNotes: { 0: 'Untergrund aus glattem Stein, Seelaternen im Poolboden.', 1: 'Terrasse und Pool, Erdgeschoss mit Glasfront.', 5: 'Obergeschoss, nach Osten versetzt.', 9: 'Flachdach.' },
    youtube: yt('moderne villa pool'),
    build(b) {
      b.fill(0, 0, -6, 15, 0, 9, 'smooth_stone');
      b.fill(0, 1, -6, 15, 1, -1, 'smooth_stone').fill(2, 1, -5, 9, 1, -2, 'water');
      b.set(4, 0, -4, 'sea_lantern').set(7, 0, -3, 'sea_lantern');
      b.fill(0, 1, 0, 11, 1, 9, 'quartz_block');
      b.walls(0, 2, 0, 11, 4, 9, 'quartz_block');
      b.fill(2, 2, 0, 9, 4, 0, 'glass');
      door(b, 10, 2, 0, 's');
      b.fill(0, 3, 3, 0, 3, 6, 'glass').fill(11, 3, 3, 11, 3, 6, 'glass');
      b.fill(0, 5, 0, 15, 5, 9, 'quartz_block');
      b.walls(4, 6, 0, 15, 8, 9, 'quartz_block');
      b.fill(5, 6, 0, 14, 8, 0, 'glass').fill(15, 7, 2, 15, 7, 7, 'glass');
      b.fill(15, 2, 0, 15, 4, 0, 'quartz_block').fill(15, 2, 9, 15, 4, 9, 'quartz_block');
      b.fill(0, 6, 0, 3, 6, 0, 'glass_pane').fill(0, 6, 1, 0, 6, 9, 'glass_pane').fill(1, 6, 9, 3, 6, 9, 'glass_pane');
      b.fill(3, 9, -1, 16, 9, 10, 'smooth_stone');
      for (let y = 2; y <= 6; y++) b.set(10, y, 8, 'ladder:n');
      b.set(3, 2, 7, 'red_carpet').set(4, 2, 7, 'red_carpet').set(6, 2, 8, 'bookshelf').set(2, 4, 4, 'lantern').set(8, 6, 7, 'red_bed:s:foot').set(8, 6, 8, 'red_bed:s:head').set(12, 6, 5, 'lantern');
    }
  });

  add({
    id: 'baeckerei', cat: 'building', community: true, name: 'Bäckerei', tagline: 'Ziegelhaus mit Backofen und Markise', difficulty: 'Leicht',
    description: 'Eine kleine Dorfbäckerei aus Ziegelsteinen mit Ofen und Kamin, Mehlsäcken (Fässern) und einer roten Markise über dem Schaufenster.',
    tips: ['Ein Räucherofen passt statt des Ofens noch besser zum Thema.', 'Die Markise ist eine Reihe roter Wolle über dem Fenster.'],
    layerNotes: { 0: 'Boden.', 1: 'Ziegelwände, Tür und Schaufenster im Norden.', 3: 'Markise.', 4: 'Dach und Kamin.' },
    youtube: yt('bäckerei'),
    build(b) {
      b.fill(0, 0, 0, 6, 0, 6, 'oak_planks');
      b.walls(0, 1, 0, 6, 3, 6, 'bricks');
      door(b, 1, 1, 0, 's');
      b.fill(3, 1, 0, 5, 2, 0, 'glass');
      b.fill(2, 3, -1, 6, 3, -1, 'red_wool');
      roofX(b, 0, 6, 0, 6, 4, 'dark_oak_stairs', 'bricks', 'dark_oak_slab:bottom');
      b.fill(5, 1, 5, 5, 9, 5, 'bricks').set(4, 1, 5, 'furnace:n').set(3, 1, 5, 'furnace:n');
      b.fill(1, 1, 4, 1, 1, 5, 'barrel').set(1, 2, 5, 'barrel').fill(3, 1, 2, 5, 1, 2, 'oak_slab:top').set(2, 1, 3, 'lantern');
      b.set(0, 2, -1, 'oak_wall_sign:n');
    }
  });

  add({
    id: 'bibliothek', cat: 'building', community: true, name: 'Bibliothek', tagline: 'Hohe Halle voller Bücherregale', difficulty: 'Mittel',
    description: 'Eine Steinbibliothek mit hoher Halle, Bücherregalen an beiden Längswänden, Lesepulten in der Mitte und hängenden Laternen. Gut kombinierbar mit einem Zaubertisch-Raum.',
    tips: ['15 Bücherregale um einen Zaubertisch geben die stärksten Verzauberungen.', 'Fenster sitzen an den Stirnseiten, damit die Regale durchlaufen.'],
    layerNotes: { 0: 'Boden aus Fichtenholz, Rand aus Steinziegeln.', 1: 'Wände, Eingang im Norden, Regale innen an den Längswänden.', 7: 'Dach.' },
    youtube: yt('bibliothek'),
    build(b) {
      b.fill(0, 0, 0, 10, 0, 12, 'stone_bricks').fill(1, 0, 1, 9, 0, 11, 'spruce_planks');
      b.walls(0, 1, 0, 10, 6, 12, 'stone_bricks');
      door(b, 5, 1, 0, 's');
      for (let y = 3; y <= 5; y++) for (const x of [3, 7]) { b.set(x, y, 0, 'glass_pane').set(x, y, 12, 'glass_pane'); }
      b.fill(5, 4, 12, 5, 5, 12, 'glass_pane');
      b.fill(1, 1, 2, 1, 4, 11, 'bookshelf').fill(9, 1, 2, 9, 4, 11, 'bookshelf');
      b.fill(3, 1, 11, 7, 2, 11, 'bookshelf');
      for (const z of [4, 7]) { b.set(4, 1, z, 'lectern').set(6, 1, z, 'lectern'); }
      roofX(b, 0, 10, 0, 12, 7, 'dark_oak_stairs', 'stone_bricks', 'dark_oak_slab:bottom');
      b.fill(1, 7, 1, 9, 7, 11, 'dark_oak_planks');
      for (const [x, z] of [[3, 3], [7, 3], [3, 9], [7, 9], [5, 6]]) b.set(x, 6, z, 'lantern');
    }
  });

  add({
    id: 'rathaus', cat: 'building', community: true, name: 'Rathaus', tagline: 'Symmetrisch, mit Uhrturm in der Mitte', difficulty: 'Fortgeschritten',
    description: 'Ein repräsentatives Rathaus aus Quarz und Steinziegeln mit breiter Freitreppe, Säulen am Eingang und einem Uhrturm in der Mitte. Das Zifferblatt ist aus Seelaternen.',
    tips: ['Baue von der Mitte aus, dann bleibt alles symmetrisch.', 'Statt Quarz geht auch glatter Sandstein.'],
    layerNotes: { 0: 'Sockel mit Freitreppe im Norden.', 1: 'Hauptgebäude, Säulen am Eingang.', 5: 'Dach des Hauptgebäudes.', 9: 'Uhr mit Seelaternen.', 12: 'Turmspitze.' },
    youtube: yt('rathaus'),
    build(b) {
      b.fill(0, 0, 0, 14, 0, 9, 'stone_bricks').fill(4, 0, -2, 10, 0, -1, 'stone_brick_stairs:s');
      b.walls(0, 1, 0, 14, 4, 9, 'quartz_block');
      for (const x of [0, 4, 10, 14]) for (const z of [0, 9]) b.fill(x, 1, z, x, 4, z, 'stone_bricks');
      door(b, 7, 1, 0, 's');
      for (const x of [5, 9]) b.fill(x, 1, -1, x, 4, -1, 'quartz_block');
      b.fill(4, 5, -1, 10, 5, -1, 'stone_brick_slab:bottom');
      for (const x of [2, 12]) for (const z of [0, 9]) b.fill(x, 2, z, x, 3, z, 'glass_pane');
      for (const z of [3, 6]) { b.fill(0, 2, z, 0, 3, z, 'glass_pane'); b.fill(14, 2, z, 14, 3, z, 'glass_pane'); }
      roofX(b, 0, 14, 0, 9, 5, 'dark_oak_stairs', 'quartz_block', 'dark_oak_slab:bottom');
      b.walls(6, 5, 2, 8, 11, 4, 'quartz_block');
      for (const [x, z] of [[6, 2], [8, 2], [6, 4], [8, 4]]) b.fill(x, 5, z, x, 11, z, 'stone_bricks');
      b.set(7, 9, 2, 'sea_lantern').set(7, 9, 4, 'sea_lantern').set(6, 9, 3, 'sea_lantern').set(8, 9, 3, 'sea_lantern');
      b.fill(7, 5, 3, 7, 11, 3, null);
      pyramid(b, 6, 8, 2, 4, 12, 'dark_oak_stairs', 'dark_oak_planks');
      b.fill(7, 15, 3, 7, 16, 3, 'oak_fence');
      b.fill(5, 1, 7, 9, 1, 7, 'oak_slab:top').set(7, 1, 8, 'lectern').fill(7, 1, 1, 7, 1, 6, 'red_carpet').set(3, 1, 4, 'lantern').set(11, 1, 4, 'lantern');
    }
  });

  add({
    id: 'holzturm', cat: 'building', community: true, name: 'Holz-Wachturm', tagline: 'Turm auf Stelzen mit Ausguck', difficulty: 'Leicht',
    description: 'Ein schneller Wachturm auf vier Fichtenstämmen mit Plattform, Geländer und Dach. Mit Leiter am Stamm. Perfekt als Aussichtspunkt oder Grenzposten.',
    tips: ['In 10 Minuten gebaut. Gut, um sich in einer neuen Welt umzusehen.', 'Fackeln auf der Plattform halten Monster fern.'],
    layerNotes: { 0: 'Vier Stämme, Leiter an der Nordseite.', 9: 'Plattform 7 × 7.', 10: 'Geländer und Eckpfosten.', 12: 'Dach.' },
    youtube: yt('holz wachturm'),
    build(b) {
      for (const [x, z] of [[0, 0], [4, 0], [0, 4], [4, 4]]) b.fill(x, 0, z, x, 11, z, 'spruce_log');
      for (let y = 0; y <= 9; y++) b.set(0, y, -1, 'ladder:n');
      b.fill(-1, 9, -1, 5, 9, 5, 'spruce_planks').set(0, 9, -1, 'ladder:n');
      for (let x = -1; x <= 5; x++) for (let z = -1; z <= 5; z++) if ((x === -1 || x === 5 || z === -1 || z === 5) && !(x === 0 && z === -1)) b.set(x, 10, z, 'spruce_fence');
      for (const [x, z] of [[0, 0], [4, 0], [0, 4], [4, 4]]) b.fill(x, 10, z, x, 11, z, 'spruce_log');
      pyramid(b, 0, 4, 0, 4, 12, 'spruce_stairs', 'spruce_planks');
      b.set(2, 10, 2, 'lantern');
    }
  });

  add({
    id: 'pavillon', cat: 'building', community: true, name: 'Gartenpavillon', tagline: 'Offener Pavillon im Blumengarten', difficulty: 'Leicht',
    description: 'Ein offener Pavillon aus Eiche mit Zeltdach, Bänken innen und Blumenbeeten drumherum. Ein schöner Ruheplatz im Garten oder Park.',
    tips: ['Die Bänke sind Treppen mit der hohen Seite nach außen.', 'Kombiniere ihn mit dem Springbrunnen für einen Park.'],
    layerNotes: { 0: 'Boden aus glattem Stein, Rasen außen.', 1: 'Pfosten, Geländer, Bänke, Blumen.', 4: 'Zeltdach.' },
    youtube: yt('pavillon garten'),
    build(b) {
      b.fill(-2, 0, -2, 8, 0, 8, 'grass_block').fill(0, 0, 0, 6, 0, 6, 'smooth_stone').fill(3, 0, -2, 3, 0, -1, 'dirt_path');
      for (const [x, z] of [[0, 0], [3, 6], [6, 0], [0, 6], [6, 6], [0, 3], [6, 3]]) b.fill(x, 1, z, x, 3, z, 'oak_log');
      for (let x = 1; x <= 5; x++) { if (x !== 3) b.set(x, 1, 0, 'oak_fence'); b.set(x, 1, 6, x === 3 ? 'oak_log' : 'oak_fence'); }
      for (let z = 1; z <= 5; z++) if (z !== 3) { b.set(0, 1, z, 'oak_fence').set(6, 1, z, 'oak_fence'); }
      for (let z = 2; z <= 4; z++) { b.set(1, 1, z, 'oak_stairs:w').set(5, 1, z, 'oak_stairs:e'); }
      pyramid(b, 0, 6, 0, 6, 4, 'oak_stairs', 'oak_planks');
      b.set(3, 3, 3, 'lantern');
      for (let x = -2; x <= 8; x++) for (let z = -2; z <= 8; z++) {
        const ring = x === -2 || x === 8 || z === -2 || z === 8;
        if (ring && !(x === 3 && z === -2) && (x + z) % 2 === 0) b.set(x, 1, z, (x + 2 * z) % 3 ? 'poppy' : 'dandelion');
      }
    }
  });

  add({
    id: 'springbrunnen', cat: 'building', community: true, name: 'Springbrunnen', tagline: 'Zwei Becken mit Leuchtsäule', difficulty: 'Leicht',
    description: 'Ein zweistufiger Brunnen aus Steinziegeln: großes Becken unten, kleines Becken oben, in der Mitte eine Säule mit Seelaterne. Ein Blickfang für jeden Platz.',
    tips: ['Setze das Wasser zuletzt, dann läuft nichts über.', 'Für echtes Plätschern kannst du oben eine Wasserquelle auf die Säule setzen.'],
    layerNotes: { 0: 'Bodenplatte 9 × 9.', 1: 'Rand des unteren Beckens, Wasser.', 3: 'Oberes Becken mit Wasser.', 5: 'Seelaterne oben.' },
    youtube: yt('springbrunnen'),
    build(b) {
      b.fill(0, 0, 0, 8, 0, 8, 'stone_bricks');
      b.walls(0, 1, 0, 8, 1, 8, 'stone_bricks').fill(1, 1, 1, 7, 1, 7, 'water');
      b.fill(3, 1, 3, 5, 2, 5, 'stone_bricks');
      b.walls(2, 3, 2, 6, 3, 6, 'stone_bricks').fill(3, 3, 3, 5, 3, 5, 'water');
      b.fill(4, 3, 4, 4, 4, 4, 'stone_bricks').set(4, 5, 4, 'sea_lantern');
    }
  });

  add({
    id: 'unterwasserkuppel', cat: 'building', community: true, name: 'Unterwasser-Kuppel', tagline: 'Glaskuppel auf dem Meeresgrund', difficulty: 'Fortgeschritten',
    description: 'Eine Glaskuppel mit 13 Blöcken Durchmesser auf einem Boden aus Prismarinziegeln und Seelaternen. Von innen siehst du Fische, Seetang und Korallen vorbeiziehen.',
    tips: ['Baue zuerst die Kuppel im Wasser. Fülle dann das Innere mit Sand oder Kies und grabe ihn ab: So verschwindet das Wasser.', 'Ein Trank der Wasseratmung und Verzauberung „Atmung“ helfen sehr.'],
    layerNotes: { 0: 'Runder Boden aus Prismarinziegeln mit Seelaternen.', 1: 'Unterste Glasreihe.', 6: 'Spitze der Kuppel.' },
    youtube: yt('unterwasser basis kuppel'),
    build(b) {
      const C = 6;
      disc(6).forEach(([x, z, d]) => b.set(x + C, 0, z + C, (Math.round(x) % 3 === 0 && Math.round(z) % 3 === 0) ? 'sea_lantern' : 'prismarine_bricks'));
      for (let x = 0; x <= 12; x++) for (let z = 0; z <= 12; z++) for (let y = 1; y <= 6; y++) {
        const d = Math.hypot(x - C, y - 0.5, z - C);
        if (d > 5.4 && d <= 6.4) b.set(x, y, z, 'glass');
      }
      b.set(C, 6, C, 'sea_lantern').set(4, 1, 6, 'crafting_table').set(8, 1, 6, 'chest:w').set(6, 1, 8, 'red_bed:s:head').set(6, 1, 7, 'red_bed:s:foot');
    }
  });

  /* ================================================================
     FARMEN
     ================================================================ */

  add({
    id: 'honigwaben', cat: 'farm', name: 'Honigwabenfarm', tagline: 'Beobachter + Werfer mit Schere', difficulty: 'Mittel', edition: 'Java 1.20+',
    description: 'Drei Bienenstöcke auf Trichtern. Ein Beobachter auf jedem Stock merkt, wenn sich der Honigstand ändert, und schaltet über Redstone einen Werfer mit Schere. Bei vollem Stock schneidet die Schere drei Honigwaben ab, die sofort in den Trichter darunter fallen.',
    how: [
      'Der Beobachter schaut von oben auf den Bienenstock. Jede Änderung des Honigstands (0 bis 5) löst einen Impuls aus.',
      'Der Impuls geht in den Redstone auf dem Beobachter und von dort eine Stufe tiefer auf den Werfer.',
      'Eine Schere im Werfer erntet nur einen vollen Stock. Bei nicht vollem Stock passiert nichts, die Schere bleibt im Werfer.',
      'Die Honigwaben entstehen im Block des Stocks. Der Trichter darunter saugt sie direkt ein.'
    ],
    tips: [
      'In jeden Werfer eine Schere legen. Eine Schere hält 238 Ernten, lege mehrere hinein.',
      'Bienen brauchen Blumen in der Nähe. Der Eingang des Stocks zeigt nach Süden und muss frei bleiben.',
      'Bienen holst du, indem du ein Bienennest mit Behutsamkeit abbaust, oder du lockst sie mit Blumen in einen gebauten Stock.'
    ],
    layerNotes: {
      0: 'Trichterkette nach Westen in die Doppeltruhe.',
      1: 'Bienenstöcke mit Eingang nach Süden, östlich daneben Werfer, die nach Westen in den Stock zeigen. Blumenwiese davor.',
      2: 'Beobachter schauen nach unten auf die Stöcke. Redstone auf die Werfer.',
      3: 'Redstone oben auf die Beobachter. Er verbindet sich schräg nach unten mit dem Redstone auf dem Werfer.'
    },
    build(b) {
      b.fill(0, 0, 0, 7, 0, 0, 'hopper:w').set(-1, 0, 0, 'chest:n').set(-2, 0, 0, 'chest:n');
      for (const x of [0, 3, 6]) {
        b.set(x, 1, 0, 'beehive:s').set(x + 1, 1, 0, 'dispenser:w');
        b.set(x, 2, 0, 'observer:d').set(x, 3, 0, 'redstone').set(x + 1, 2, 0, 'redstone');
      }
      b.fill(-2, 0, 1, 8, 0, 5, 'grass_block');
      for (let x = -2; x <= 8; x++) for (let z = 2; z <= 5; z++) if ((x + z) % 2 === 0) b.set(x, 1, z, (x + z) % 4 ? 'poppy' : 'dandelion');
    }
  });

  add({
    id: 'basalt', cat: 'farm', name: 'Basalt-Generator', tagline: 'Lava + Seelenerde + Blaues Eis', difficulty: 'Leicht', edition: 'Java & Bedrock 1.16+',
    description: 'Fließt Lava auf ein Feld, das über Seelenerde liegt und an Blaues Eis grenzt, wird sie zu Basalt. Abbauen, kurz warten, wieder abbauen. Basalt ist ein schöner, dunkler Baustein.',
    how: [
      'Bedingung für Basalt: Unter dem Feld liegt Seelenerde, direkt daneben Blaues Eis.',
      'Die Lavaquelle berührt das Blaue Eis nicht und bleibt erhalten.',
      'Es funktioniert auch in der Oberwelt.'
    ],
    tips: ['Seelenerde gibt es im Seelensandtal im Nether.', 'Blaues Eis gibt es in Eisbergen oder aus 81 Eis.'],
    layerNotes: { 0: 'Boden aus Stein, unter dem Basalt-Feld Seelenerde.', 1: 'Westen: Lavaquelle. Daneben bildet sich Basalt. Südlich davon Blaues Eis. Nordseite offen zum Abbauen.' },
    build(b) {
      b.fill(-1, 0, -1, 2, 0, 2, 'stone').set(1, 0, 0, 'soul_soil');
      b.set(0, 1, 0, 'lava').set(1, 1, 0, 'basalt_auto').set(1, 1, 1, 'blue_ice');
      b.set(-1, 1, 0, 'stone_bricks').set(0, 1, -1, 'stone_bricks').set(0, 1, 1, 'stone_bricks').set(2, 1, 0, 'stone_bricks').set(2, 1, 1, 'stone_bricks').set(0, 2, 0, 'stone_bricks');
    }
  });

  add({
    id: 'steingenerator', cat: 'farm', name: 'Stein-Generator', tagline: 'Lava von oben auf Wasser = Stein', difficulty: 'Leicht', edition: 'Java & Bedrock',
    description: 'Eine Lavaquelle hängt direkt über einem Feld, in das Wasser fließt. Lava, die von oben auf Wasser trifft, macht daraus Stein statt Bruchstein. Mit Behutsamkeit abgebaut bekommst du echten Stein für Steinziegel und glatten Stein.',
    how: [
      'Lava von oben auf Wasser ergibt Stein. Lava von der Seite ergibt Bruchstein.',
      'Wird das Feld abgebaut, fließt zuerst Wasser hinein (es ist schneller als Lava), dann wird es zu Stein.',
      'Beim Abbauen schwappt kurz etwas Wasser aus der Öffnung. Es versickert, sobald der Stein nachwächst.'
    ],
    tips: ['Spitzhacke mit Behutsamkeit benutzen, sonst bekommst du Bruchstein.', 'Zuerst das Wasser setzen, dann die Lava ganz zum Schluss.'],
    layerNotes: { 0: 'Boden aus Stein.', 1: 'Wasserquelle im Osten, daneben das Stein-Feld. Rand rundherum, Öffnung nach Norden.', 2: 'Lavaquelle genau über dem Stein-Feld, ringsum Steinziegel.' },
    build(b) {
      b.fill(-1, 0, -1, 3, 0, 1, 'stone');
      b.set(2, 1, 0, 'water').set(1, 1, 0, 'stone_auto');
      b.set(0, 1, 0, 'stone_bricks').set(3, 1, 0, 'stone_bricks').fill(0, 1, 1, 3, 1, 1, 'stone_bricks').set(2, 1, -1, 'stone_bricks').set(0, 1, -1, 'stone_bricks').set(3, 1, -1, 'stone_bricks');
      b.set(1, 2, 0, 'lava').set(0, 2, 0, 'stone_bricks').set(2, 2, 0, 'stone_bricks').set(1, 2, -1, 'stone_bricks').set(1, 2, 1, 'stone_bricks').set(1, 3, 0, 'stone_bricks');
    }
  });

  add({
    id: 'brutstation', cat: 'farm', name: 'Hühner-Brutstation', tagline: 'Eier werden automatisch ausgebrütet', difficulty: 'Mittel', edition: 'Java 1.20+', extraMin: 5,
    description: 'Hühner legen Eier auf Trichter. Die Trichter bringen die Eier in einen Werfer, den eine Beobachter-Uhr ständig auslöst. Der Werfer wirft die Eier ins Gehege, und etwa jedes achte Ei wird zu einem Küken. So wächst dein Hühnerbestand von allein.',
    how: [
      'Zwei Beobachter, die sich gegenseitig anschauen, bilden eine Uhr: Sie lösen sich immer wieder gegenseitig aus.',
      'Der untere Beobachter gibt seinen Impuls nach unten direkt in den Werfer.',
      'Der Werfer wirft jedes Ei, das der Trichter hineinlegt, ins Gehege.'
    ],
    tips: [
      'Zum Abschalten einen der beiden Beobachter abbauen.',
      'Zu viele Hühner verursachen Ruckeln. Schlachte regelmäßig ältere Hühner im Gehege für Fleisch und Federn.',
      'Starte mit 2 bis 4 Hühnern auf den Trichtern.'
    ],
    layerNotes: {
      0: 'Boden des Geheges.',
      1: 'Zwei Trichter für die Hühner nach Osten, ein dritter nach Osten in den Werfer. Werfer zeigt nach Osten ins Gehege.',
      2: 'Glas um die Hühner. Beobachter auf dem Werfer schaut nach oben.',
      3: 'Zweiter Beobachter schaut nach unten auf den ersten. Beim Setzen startet die Uhr.'
    },
    build(b) {
      b.fill(4, 0, -2, 9, 0, 2, 'stone');
      b.set(0, 1, 0, 'hopper:e').set(1, 1, 0, 'hopper:e').set(2, 1, 0, 'hopper:e').set(3, 1, 0, 'dispenser:e');
      b.set(0, 2, 0, 'chicken').set(1, 2, 0, 'chicken');
      b.walls(-1, 2, -1, 2, 3, 1, 'glass').set(2, 2, 0, 'glass').fill(-1, 4, -1, 2, 4, 1, 'oak_slab:bottom');
      b.fill(0, 2, 0, 1, 3, 0, null).set(0, 2, 0, 'chicken').set(1, 2, 0, 'chicken');
      b.set(3, 2, 0, 'observer:u').set(3, 3, 0, 'observer:d');
      b.walls(4, 1, -2, 10, 3, 2, 'glass').set(4, 1, 0, null).fill(4, 0, -2, 10, 0, 2, 'stone');
      b.set(7, 1, 0, 'chicken').set(8, 1, 1, 'chicken');
    }
  });

  add({
    id: 'zuckerrohrgross', cat: 'farm', name: 'Zuckerrohr-Großfarm', tagline: '24 Pflanzen, zwei gespiegelte Reihen', difficulty: 'Mittel', edition: 'Java 1.20+',
    description: 'Zwei Reihen mit je 12 Zuckerrohr links und rechts eines gemeinsamen Wasserkanals. Kolben und Beobachter stehen außen und schieben nach innen. Trichterloren unter beiden Reihen sammeln alles ein. Das ist die erweiterte Version der kleinen Zuckerrohrfarm.',
    how: [
      'Jeder Beobachter schaut auf den dritten Block seiner Pflanze und schaltet über Redstone und Stein seinen Kolben.',
      'Das Glas über dem Wasser verhindert, dass Items in den Kanal fallen.',
      'Trichterloren saugen die Items durch die Erde hindurch an.'
    ],
    tips: ['Perfekt für Papier und den Handel mit Bibliothekaren.', 'Die Reihen lassen sich beliebig verlängern, weil jede Spalte ihren eigenen Beobachter hat.'],
    layerNotes: {
      0: 'Zwei Trichterketten nach Osten in zwei Truhen.',
      1: 'Schienen mit Trichterloren unter beiden Erde-Reihen. Stein unter dem Wasser.',
      2: 'Erde, Wasserkanal in der Mitte, Erde.',
      3: 'Zuckerrohr auf beiden Seiten, Glas über dem Wasser.',
      4: 'Kolben außen: Nordreihe schiebt nach Süden, Südreihe nach Norden.',
      5: 'Beobachter schauen zum Zuckerrohr, Redstone außen auf den Stein.'
    },
    build(b) {
      const L = 11;
      for (const z of [1, 3]) { b.fill(0, 0, z, L, 0, z, 'hopper:e').set(L + 1, 0, z, 'chest:n'); b.fill(0, 1, z, L, 1, z, 'rail_cart:e').set(-1, 1, z, 'stone').set(L + 1, 1, z, 'glass'); b.fill(0, 2, z, L, 2, z, 'dirt'); b.fill(0, 3, z, L, 3, z, 'sugar_cane'); b.fill(0, 4, z, L, 5, z, 'sugar_cane_auto'); }
      b.fill(0, 1, 2, L, 1, 2, 'stone').fill(0, 2, 2, L, 2, 2, 'water').fill(0, 3, 2, L, 5, 2, 'glass');
      b.fill(-1, 2, 1, -1, 2, 3, 'stone').fill(L + 1, 2, 1, L + 1, 2, 3, 'stone');
      b.fill(-1, 3, 1, -1, 5, 3, 'glass').fill(L + 1, 3, 1, L + 1, 5, 3, 'glass');
      b.fill(0, 1, 0, L, 3, 0, 'stone').fill(0, 1, 4, L, 3, 4, 'stone');
      b.fill(0, 4, 0, L, 4, 0, 'piston:s').fill(0, 5, 0, L, 5, 0, 'observer:s').fill(0, 4, -1, L, 4, -1, 'stone').fill(0, 5, -1, L, 5, -1, 'redstone');
      b.fill(0, 4, 4, L, 4, 4, 'piston:n').fill(0, 5, 4, L, 5, 4, 'observer:n').fill(0, 4, 5, L, 4, 5, 'stone').fill(0, 5, 5, L, 5, 5, 'redstone');
    }
  });

  /* ================================================================
     BAUPROJEKTE
     ================================================================ */

  add({
    id: 'wasserfahrstuhl', cat: 'project', name: 'Wasserfahrstuhl', tagline: 'Blasensäulen hoch und runter', difficulty: 'Mittel', edition: 'Java & Bedrock',
    description: 'Zwei Wassersäulen nebeneinander: Seelensand am Boden schießt dich nach oben, ein Magmablock zieht dich nach unten. Die Türen unten halten das Wasser zurück. Oben steigst du auf eine Plattform aus.',
    how: [
      'Seelensand unter Wasser erzeugt eine Blasensäule nach oben, Magmablock eine nach unten.',
      'Jedes Feld der Säule muss eine Wasserquelle sein, sonst reißt die Blasensäule ab.',
      'Wasser kann nicht in Türen fließen. Darum dienen sie als Eingang.'
    ],
    tips: [
      'Seetang-Trick: Wasser oben reingießen, unten bis oben Seetang pflanzen, dann den Seetang abbauen. Jetzt ist jedes Feld eine Quelle.',
      'Beim Runterfahren unten einfach aus der Tür gehen. Unter Wasser bekommst du genug Luft durch die Blasen.'
    ],
    layerNotes: {
      0: 'Westen Seelensand (hoch), Osten Magmablock (runter).',
      1: 'Glasröhren beginnen, Türen nach Norden.',
      12: 'Oberste Wasserebene.',
      13: 'Ausstieg und Plattform nach Norden.'
    },
    build(b) {
      b.set(0, 0, 0, 'soul_sand').set(2, 0, 0, 'magma_block');
      b.walls(-1, 0, -1, 3, 0, 1, 'stone_bricks').set(1, 0, 0, 'stone_bricks');
      for (let y = 1; y <= 13; y++) { b.walls(-1, y, -1, 3, y, 1, 'glass'); b.set(1, y, 0, 'glass'); }
      for (let y = 1; y <= 12; y++) { b.set(0, y, 0, 'water').set(2, y, 0, 'water'); }
      door(b, 0, 1, -1, 's'); door(b, 2, 1, -1, 's');
      b.set(0, 13, -1, null).set(2, 13, -1, null);
      b.fill(-1, 12, -4, 3, 12, -2, 'stone_bricks').fill(0, 12, -1, 2, 12, -1, 'stone_bricks');
      b.set(-1, 13, -4, 'lantern').set(3, 13, -4, 'lantern');
    }
  });

  add({
    id: 'eisstrasse', cat: 'project', name: 'Eisstraße', tagline: 'Blitzschneller Bootsweg aus Blauem Eis', difficulty: 'Leicht', edition: 'Java & Bedrock',
    description: 'Ein 24 Blöcke langes Stück Schnellstraße: eine Spur aus Blauem Eis mit niedrigen Wänden, auf der Boote sehr schnell gleiten. Im Nether gebaut, ist jeder Block wie 8 Blöcke in der Oberwelt.',
    how: ['Boote gleiten auf Blauem Eis viel schneller als auf Wasser.', 'Die Wände halten das Boot in der Spur.'],
    tips: ['Im Nether bauen und an beiden Enden ein Netherportal setzen.', 'Ein Deckel aus Glas oder Stufen schützt vor Ghasts.'],
    layerNotes: { 0: 'Unterbau aus Steinziegeln, in der Mitte Blaues Eis.', 1: 'Wände links und rechts, Laternen alle 8 Blöcke.' },
    build(b) {
      b.fill(0, 0, 0, 2, 0, 23, 'stone_bricks').fill(1, 0, 0, 1, 0, 23, 'blue_ice');
      b.fill(0, 1, 0, 0, 1, 23, 'stone_bricks').fill(2, 1, 0, 2, 1, 23, 'stone_bricks');
      for (const z of [0, 8, 16, 23]) { b.set(0, 2, z, 'lantern').set(2, 2, z, 'lantern'); }
    }
  });

  add({
    id: 'bahnstrecke', cat: 'project', name: 'Bahnstrecke', tagline: 'Schienen mit Bahnhof und Antrieb', difficulty: 'Leicht', edition: 'Java & Bedrock',
    description: 'Ein Bahnhof mit Bahnsteig, Dach und Prellbock, dazu ein Stück Strecke mit Antriebsschienen. Redstone-Blöcke unter den Antriebsschienen geben dauerhaft Schwung, du brauchst keine Fackeln oder Hebel.',
    how: ['Eine Antriebsschiene über einem Redstone-Block ist immer an.', 'Auf flacher Strecke reicht etwa alle 30 Blöcke eine Antriebsschiene.'],
    tips: ['Lore auf die Antriebsschiene setzen, einsteigen und kurz anschubsen.', 'Am Ziel stoppt der Prellbock (ein normaler Block) die Lore.'],
    layerNotes: { 0: 'Unterbau, Redstone-Blöcke unter den Antriebsschienen, Bahnsteig.', 1: 'Schienen, Antriebsschienen, Prellbock, Pfosten.', 4: 'Dach über dem Bahnsteig.' },
    build(b) {
      b.fill(0, 0, 0, 0, 0, 29, 'stone_bricks');
      for (const z of [1, 2, 3, 16, 17]) b.set(0, 0, z, 'redstone_block');
      b.set(0, 1, 0, 'stone_bricks');
      for (let z = 1; z <= 29; z++) b.set(0, 1, z, [1, 2, 3, 16, 17].includes(z) ? 'powered_rail:s' : 'rail:s');
      b.fill(1, 0, 0, 3, 0, 8, 'smooth_stone');
      for (const z of [0, 4, 8]) b.fill(3, 1, z, 3, 3, z, 'spruce_log');
      b.fill(1, 4, 0, 3, 4, 8, 'spruce_slab:bottom').fill(0, 4, 0, 0, 4, 8, 'spruce_slab:bottom');
      b.set(2, 1, 2, 'oak_stairs:e').set(2, 1, 6, 'oak_stairs:e').set(3, 1, 2, null).set(2, 3, 4, 'lantern');
    }
  });

  BP.finishAll();
})(window);
