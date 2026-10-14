/* Blockplan – Baupläne. Jeder Bau wird mit einem kleinen Builder Block für Block beschrieben.
   Koordinaten: x = Osten, y = oben, z = Süden (wie in Minecraft). Nach dem Bauen wird alles so
   verschoben, dass die kleinste Ecke bei (0,0,0) liegt. */
(function (global) {
  'use strict';

  class Builder {
    constructor() { this.m = new Map(); }
    set(x, y, z, id) {
      const k = x + ',' + y + ',' + z;
      if (!id) this.m.delete(k); else this.m.set(k, { x, y, z, s: id });
      return this;
    }
    fill(x1, y1, z1, x2, y2, z2, id) {
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++)
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++)
          for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z++) this.set(x, y, z, id);
      return this;
    }
    /* Nur der Rand eines Rechtecks, für jede Ebene y1..y2 */
    walls(x1, y1, z1, x2, y2, z2, id) {
      for (let y = y1; y <= y2; y++)
        for (let x = x1; x <= x2; x++)
          for (let z = z1; z <= z2; z++)
            if (x === x1 || x === x2 || z === z1 || z === z2) this.set(x, y, z, id);
      return this;
    }
    get(x, y, z) { const c = this.m.get(x + ',' + y + ',' + z); return c ? c.s : null; }
    finish() {
      let mx = Infinity, my = Infinity, mz = Infinity, Mx = -Infinity, My = -Infinity, Mz = -Infinity;
      for (const c of this.m.values()) {
        mx = Math.min(mx, c.x); my = Math.min(my, c.y); mz = Math.min(mz, c.z);
        Mx = Math.max(Mx, c.x); My = Math.max(My, c.y); Mz = Math.max(Mz, c.z);
      }
      const cells = [];
      for (const c of this.m.values()) {
        const p = MC.parse(c.s);
        cells.push(Object.assign(p, { x: c.x - mx, y: c.y - my, z: c.z - mz }));
      }
      cells.sort((a, b) => a.y - b.y || a.z - b.z || a.x - b.x);
      return { cells, size: [Mx - mx + 1, My - my + 1, Mz - mz + 1] };
    }
  }

  /* Kreis-Grundriss (Leuchtturm) */
  function circle(r) {
    const pts = [];
    for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) {
      const d = Math.sqrt(x * x + z * z);
      if (d <= r + 0.35) pts.push([x, z, d > r - 0.75]);
    }
    return pts;
  }

  const BUILDS = [];

  /* ================================================================
     FARMEN
     ================================================================ */

  BUILDS.push({
    id: 'zuckerrohr',
    cat: 'farm',
    name: 'Zuckerrohrfarm',
    tagline: 'Beobachter + Kolben, sammelt in eine Truhe',
    difficulty: 'Leicht',
    edition: 'Java 1.20+',
    description: 'Acht Zuckerrohr-Pflanzen. Sobald eine Pflanze den dritten Block erreicht, schieben alle Kolben gleichzeitig und ernten zwei Blöcke pro Pflanze. Trichterloren unter der Erde saugen die Items durch den Block an und geben sie über die Trichterkette in die Truhe.',
    how: [
      'Die Beobachter schauen auf die Höhe des dritten Zuckerrohr-Blocks.',
      'Wächst dort ein Block, gibt der Beobachter hinten einen Impuls in den Redstone-Staub.',
      'Der Staub versorgt den Stein darunter, und der Stein schaltet die Kolben daneben.',
      'Die Kolben zerstören den zweiten und dritten Block, die unterste Pflanze bleibt stehen.',
      'Trichterloren können Items durch einen vollen Block hindurch einsammeln.'
    ],
    tips: [
      'Bau die Truhe zuerst, dann die Trichter mit Shift + Rechtsklick nach Osten.',
      'Das Zuckerrohr braucht Wasser direkt neben dem Erdblock.',
      'Die Kette lässt sich nach Osten verlängern, solange das Redstone-Signal reicht (bis ca. 14 Blöcke).'
    ],
    layerNotes: {
      0: 'Trichterkette: Alle Trichter geben nach Osten in die Truhe ab. Fang an der Truhe an und arbeite nach Westen.',
      1: 'Schienen auf die Trichter, dann auf jede Schiene eine Trichterlore. Unter dem Wasser liegt Stein, sonst läuft es aus.',
      2: 'Erde vorne, Wasser direkt dahinter. Die Steinreihen an den Seiten halten das Wasser.',
      3: 'Zuckerrohr auf die Erde pflanzen. Die Glasreihe vorne hält die Items auf der Erde.',
      4: 'Kolben schieben nach Norden zum Zuckerrohr. Dahinter eine Reihe Stein.',
      5: 'Beobachter schauen nach Norden auf das Zuckerrohr, der rote Punkt zeigt nach Süden. Redstone auf die Steinreihe.'
    },
    build(b) {
      b.fill(0, 0, 1, 7, 0, 1, 'hopper:e').set(8, 0, 1, 'chest:n');
      b.fill(0, 1, 1, 7, 1, 1, 'rail_cart:e').set(-1, 1, 1, 'stone').set(8, 1, 1, 'glass');
      b.fill(0, 1, 2, 7, 1, 2, 'stone');
      b.fill(-1, 2, 0, 8, 2, 0, 'stone');
      b.fill(0, 2, 1, 7, 2, 1, 'dirt').fill(0, 2, 2, 7, 2, 2, 'water').fill(0, 2, 3, 7, 2, 3, 'stone');
      b.fill(-1, 2, 1, -1, 2, 2, 'stone').fill(8, 2, 1, 8, 2, 2, 'stone');
      b.fill(0, 3, 1, 7, 3, 1, 'sugar_cane').fill(0, 3, 2, 7, 3, 2, 'glass');
      b.fill(0, 3, 0, 7, 5, 0, 'glass');
      b.fill(-1, 3, 0, -1, 5, 1, 'glass').fill(8, 3, 0, 8, 5, 1, 'glass');
      b.fill(0, 4, 1, 7, 5, 1, 'sugar_cane_auto');
      b.fill(0, 4, 2, 7, 4, 2, 'piston:n').fill(0, 4, 3, 7, 4, 3, 'stone');
      b.fill(0, 5, 2, 7, 5, 2, 'observer:n').fill(0, 5, 3, 7, 5, 3, 'redstone');
    }
  });

  BUILDS.push({
    id: 'kuerbis',
    cat: 'farm',
    name: 'Kürbis- & Melonenfarm',
    tagline: 'Beobachter am Stiel, Kolben ernten',
    difficulty: 'Mittel',
    edition: 'Java 1.20+',
    description: 'Acht Stiele auf Ackerboden. Jeder Stiel kann nur auf den Erdblock vor dem Kolben wachsen. Ein Beobachter über jedem Stiel merkt, wenn der Stiel eine Frucht ansetzt. Dann schlagen alle Kolben die Kürbisse ab. Mit Melonenkernen funktioniert es genauso.',
    how: [
      'Setzt ein Stiel eine Frucht an, ändert er seine Form. Der Beobachter darüber sieht das.',
      'Der Beobachter gibt nach oben ein Signal in das Redstone-Feld.',
      'Das Redstone liegt auf dem Stein über den Kolben und schaltet sie.',
      'Kolben zerstören Kürbisse und Melonen, statt sie zu schieben.',
      'Zwei Reihen Trichterloren unter Acker und Erde sammeln alles ein.'
    ],
    tips: [
      'Die Wasserquelle in der Mitte hält den ganzen Acker feucht. Glas darüber schützt sie.',
      'Die Kolben feuern auch, wenn ein Stiel nur wächst. Das schadet nicht.',
      'Lichtlevel 9 ist nötig. Bei Nacht wächst ohne Fackeln nichts.'
    ],
    layerNotes: {
      0: 'Zwei Trichterketten nach Osten. Die zwei Truhen am Ende bilden eine Doppeltruhe.',
      1: 'Schienen mit Trichterloren. Unter dem Wasser in der Mitte liegt ein Stein statt einer Schiene.',
      2: 'Ackerboden (Erde + Hacke) in der Stielreihe, Erde in der Kürbisreihe, Wasser in der Mitte.',
      3: 'Kerne pflanzen. Kürbisreihe frei lassen. Kolben schieben nach Norden.',
      4: 'Beobachter schauen nach unten auf die Stiele. Glas über der Kürbisreihe, Stein über den Kolben.',
      5: 'Redstone auf die ganze Fläche streuen.'
    },
    build(b) {
      b.fill(0, 0, 1, 8, 0, 2, 'hopper:e').set(9, 0, 1, 'chest:n').set(9, 0, 2, 'chest:n');
      for (let x = 0; x <= 8; x++) {
        b.set(x, 1, 1, x === 4 ? 'stone' : 'rail_cart:e');
        b.set(x, 1, 2, 'rail_cart:e');
      }
      b.fill(-1, 1, 1, -1, 1, 2, 'stone').fill(9, 1, 1, 9, 1, 2, 'glass');
      b.fill(-1, 2, 0, 9, 2, 0, 'stone').fill(-1, 2, 1, -1, 2, 2, 'stone').fill(9, 2, 1, 9, 2, 2, 'stone');
      for (let x = 0; x <= 8; x++) {
        b.set(x, 2, 1, x === 4 ? 'water' : 'farmland');
        b.set(x, 2, 2, 'dirt');
        b.set(x, 2, 3, 'stone');
        b.set(x, 3, 1, x === 4 ? 'glass' : 'pumpkin_stem');
        b.set(x, 3, 2, x === 4 ? 'stone' : 'pumpkin_auto');
        b.set(x, 3, 3, x === 4 ? 'stone' : 'piston:n');
        b.set(x, 4, 1, x === 4 ? 'stone' : 'observer:d');
        b.set(x, 4, 2, 'glass');
        b.set(x, 4, 3, 'stone');
        b.fill(x, 5, 1, x, 5, 3, 'redstone');
      }
      b.fill(-1, 3, 0, 9, 4, 0, 'glass').fill(-1, 3, 1, -1, 4, 2, 'glass').fill(9, 3, 1, 9, 4, 2, 'glass');
    }
  });

  BUILDS.push({
    id: 'eisen',
    extraMin: 40,
    cat: 'farm',
    name: 'Eisenfarm',
    tagline: '3 Dorfbewohner, 1 Zombie, Lava-Klinge',
    difficulty: 'Fortgeschritten',
    edition: 'Java 1.14+',
    description: 'Drei Dorfbewohner sehen einen eingesperrten Zombie und bekommen Panik. Dabei rufen sie Eisengolems herbei. Die Golems erscheinen auf der Plattform über den Dorfbewohnern, werden vom Wasser in das Loch in der Mitte gespült und fallen in die Lava-Kammer. Eisen und Mohnblumen landen in den Trichtern und dann in den Truhen.',
    how: [
      'Panik-Mechanik: Dorfbewohner, die einen Zombie sehen und vor kurzem geschlafen haben, rufen Golems.',
      'Golems erscheinen bis zu 8 Blöcke seitlich und 6 Blöcke über oder unter den Dorfbewohnern.',
      'Golems können nicht auf Glas erscheinen. Darum sind alle Wände aus Glas.',
      'Das Wasser fließt genau 7 Blöcke weit und endet am Rand des Lochs. Es läuft nicht hinein.',
      'Die Lava hängt 2 Blöcke über dem Boden an Schildern. Golems berühren sie mit dem Kopf, die Items fallen darunter in die Trichter.'
    ],
    tips: [
      'Ebene 0 muss mindestens 3 Blöcke über dem Boden oder über Wasser schweben, sonst erscheinen Golems außerhalb.',
      'Im Umkreis von etwa 50 Blöcken dürfen keine anderen Dorfbewohner oder Betten sein.',
      'Den Zombie mit einem Namensschild benennen. Schwierigkeit mindestens „Leicht“.',
      'Die Lava kommt zum Schluss, erst wenn alle Schilder hängen.',
      'Stell dich beim Warten nicht weiter als etwa 100 Blöcke weg.'
    ],
    layerNotes: {
      0: 'Arbeitsboden aus Stein. Von hier erreichst du die Truhen.',
      1: 'Zwei Doppeltruhen in der Mitte.',
      2: 'Vier Trichter zeigen nach unten in die Truhen. Darum der Schacht aus Steinziegeln.',
      3: 'Schacht weiter hochziehen. Hier stehen später die Golems.',
      4: 'Ein Schild an der Westwand unter der späteren Lava.',
      5: 'Drei Schilder an den Schachtwänden, in das vierte Feld kommt die Lava (zuletzt!). Boden für die Dorfbewohner.',
      6: 'Drei Betten nebeneinander, Kopfteil nach Süden. Glaswände um Betten und Zombie-Zelle.',
      7: 'Dorfbewohner auf die Betten, Zombie in die Zelle östlich davon. Beide sehen sich durch das Glas.',
      8: 'Glaswände schließen.',
      9: 'Plattform 20 × 20 aus Stein, das 2 × 2 Loch genau über dem Schacht frei lassen.',
      10: 'Wasserquellen nur auf den äußersten Ring. Der Rest fließt von selbst zum Loch. Glasrand außen.',
      11: 'Zweite Glasreihe als Rand.'
    },
    build(b) {
      // Arbeitsboden und Truhen
      b.fill(6, 0, 6, 13, 0, 13, 'stone');
      b.set(9, 1, 9, 'chest:n').set(10, 1, 9, 'chest:n').set(9, 1, 10, 'chest:s').set(10, 1, 10, 'chest:s');
      // Tötungskammer + Schacht
      b.fill(9, 2, 9, 10, 2, 10, 'hopper:d');
      b.walls(8, 2, 8, 11, 8, 11, 'stone_bricks');
      b.set(9, 4, 9, 'oak_wall_sign:e');
      b.set(9, 5, 9, 'lava').set(10, 5, 9, 'oak_wall_sign:w').set(9, 5, 10, 'oak_wall_sign:e').set(10, 5, 10, 'oak_wall_sign:w');
      // Dorfbewohner-Raum unter der Plattform
      b.fill(7, 5, 11, 13, 5, 14, 'stone');
      b.walls(8, 5, 8, 11, 5, 11, 'stone_bricks');
      for (let x = 8; x <= 10; x++) { b.set(x, 6, 12, 'red_bed:s:foot').set(x, 6, 13, 'red_bed:s:head'); }
      b.fill(7, 6, 12, 7, 8, 13, 'glass').fill(7, 6, 14, 11, 8, 14, 'glass');
      b.fill(11, 6, 13, 11, 8, 13, 'glass').fill(11, 6, 12, 11, 8, 12, 'glass');
      b.set(12, 6, 12, 'stone');
      b.fill(12, 7, 11, 12, 8, 11, 'glass').fill(12, 7, 13, 12, 8, 13, 'glass').fill(13, 7, 12, 13, 8, 12, 'glass');
      b.set(8, 7, 12, 'villager').set(9, 7, 13, 'villager').set(10, 7, 12, 'villager');
      b.set(12, 7, 12, 'zombie');
      // Plattform
      b.fill(0, 9, 0, 19, 9, 19, 'stone');
      b.fill(9, 9, 9, 10, 9, 10, null);
      b.walls(0, 10, 0, 19, 11, 19, 'glass');
      for (let x = 1; x <= 18; x++) for (let z = 1; z <= 18; z++) {
        const d = Math.min(x - 1, 18 - x, z - 1, 18 - z);
        if (d === 0) b.set(x, 10, z, 'water');
        else if (d <= 7) b.set(x, 10, z, 'water_flow');
      }
    }
  });

  BUILDS.push({
    id: 'eier',
    extraMin: 5,
    cat: 'farm',
    name: 'Eierfarm',
    tagline: 'Hühner auf Trichtern, null Redstone',
    difficulty: 'Leicht',
    edition: 'Java & Bedrock',
    description: 'Hühner stehen direkt auf Trichtern. Jedes gelegte Ei fällt in den Trichter darunter und wandert in die Doppeltruhe. Perfekt als erste Farm und als Nachschub für eine Hühnerzucht.',
    how: [
      'Hühner legen etwa alle 5 bis 10 Minuten ein Ei.',
      'Trichter saugen Items an, die auf ihnen liegen.',
      'Die Glaswände sind zwei Blöcke hoch, damit kein Huhn herausflattert.'
    ],
    tips: [
      'Eier ins Gehege werfen, bis 6 bis 8 Hühner drin sind. Küken wachsen nach 20 Minuten.',
      'Die Stufen oben verhindern, dass Hühner herausfliegen.',
      'Über der Truhe liegt Glas. Die Truhe lässt sich damit trotzdem öffnen.'
    ],
    layerNotes: {
      0: 'Zwei Trichterreihen nach Osten in die Doppeltruhe. Steinrand außen.',
      1: 'Glaswand rundherum. Hühner in das Gehege setzen.',
      2: 'Zweite Glasreihe.',
      3: 'Deckel aus Holzstufen (untere Hälfte).'
    },
    build(b) {
      b.walls(-1, 0, -1, 4, 0, 2, 'stone');
      b.fill(0, 0, 0, 3, 0, 1, 'hopper:e').set(4, 0, 0, 'chest:n').set(4, 0, 1, 'chest:n');
      b.walls(-1, 1, -1, 4, 2, 2, 'glass');
      b.fill(-1, 3, -1, 4, 3, 2, 'oak_slab:bottom');
      b.set(0, 1, 0, 'chicken').set(2, 1, 0, 'chicken').set(1, 1, 1, 'chicken').set(3, 1, 1, 'chicken');
    }
  });

  BUILDS.push({
    id: 'weizen',
    cat: 'farm',
    name: 'Weizenfarm mit Knopf',
    tagline: 'Ein Knopfdruck spült das ganze Feld',
    difficulty: 'Leicht',
    edition: 'Java & Bedrock',
    description: 'Ein 9 × 7 Feld. Drückst du den Knopf, setzen neun Werfer gleichzeitig Wasser. Das Wasser bricht jede Pflanze ab und spült alles in die Trichterreihe vorne. Zweiter Knopfdruck: Die Werfer holen das Wasser zurück. Danach neu pflanzen. Halbautomatisch, aber sehr schnell.',
    how: [
      'Der Knopf versorgt den letzten Werfer direkt und den Redstone-Staub darauf.',
      'Der Staub schaltet alle Werfer gleichzeitig.',
      'Wasser fließt 7 Blöcke weit. Die Trichterreihe liegt genau am Ende des Wassers.',
      'Die Wasserquelle in der Mitte hält den Acker feucht und stört das Spülen nicht.'
    ],
    tips: [
      'In jeden Werfer einen Wassereimer legen.',
      'Erst ernten, wenn das Weizen goldgelb ist.',
      'Funktioniert auch mit Karotten und Kartoffeln.'
    ],
    layerNotes: {
      0: 'Acker (Erde + Hacke), in der Mitte eine Wasserquelle. Vorne die Trichterreihe nach Osten in die Truhe.',
      1: 'Weizen pflanzen. Steinrand rundherum, über der Truhe Glas.',
      2: 'Neun Werfer zeigen nach unten auf die hinterste Reihe. Knopf an die Ostseite des letzten Werfers.',
      3: 'Redstone auf alle Werfer.'
    },
    build(b) {
      for (let x = 0; x <= 8; x++) for (let z = 0; z <= 6; z++) {
        b.set(x, 0, z, x === 4 && z === 3 ? 'water' : 'farmland');
        if (!(x === 4 && z === 3)) b.set(x, 1, z, 'wheat');
      }
      b.fill(0, 0, 7, 8, 0, 7, 'hopper:e').set(9, 0, 7, 'chest:s');
      b.fill(-1, 0, -1, -1, 0, 8, 'cobblestone').fill(9, 0, -1, 9, 0, 6, 'cobblestone').set(9, 0, 8, 'cobblestone');
      b.fill(0, 0, -1, 8, 0, -1, 'cobblestone').fill(0, 0, 8, 8, 0, 8, 'cobblestone');
      b.walls(-1, 1, -1, 9, 1, 8, 'cobblestone');
      b.set(9, 1, 7, 'glass');
      b.fill(0, 2, 0, 8, 2, 0, 'dispenser:d').set(9, 2, 0, 'stone_button:e');
      b.fill(0, 3, 0, 8, 3, 0, 'redstone');
    }
  });

  BUILDS.push({
    id: 'ofen',
    cat: 'farm',
    name: 'Automatische Schmelze',
    tagline: '4 Öfen, Kiste rein, Barren raus',
    difficulty: 'Leicht',
    edition: 'Java & Bedrock',
    description: 'Erze oben in die Truhe legen, Brennstoff in die hintere Truhe. Die Trichter verteilen alles auf vier Öfen. Die fertigen Barren landen unten in der Ausgabetruhe. Mehr Öfen gehen genauso, einfach nach Osten verlängern.',
    how: [
      'Trichter von oben füllen das Schmelzgut-Feld eines Ofens.',
      'Trichter von der Seite füllen das Brennstoff-Feld.',
      'Trichter unter dem Ofen holen das Ergebnis heraus.',
      'Die obere Trichterkette gibt Items weiter, während die Trichter darunter mitziehen. So bekommt jeder Ofen etwas.'
    ],
    tips: [
      'Mit 8 Erzen pro Ofen und einer Kohle arbeiten alle Öfen ohne Verlust.',
      'Seetangblöcke oder Bambus sind guter Brennstoff aus einer anderen Farm.',
      'Die Truhen vor dem Öffnen nicht mit Blöcken zubauen.'
    ],
    layerNotes: {
      0: 'Ausgabe: Trichterkette nach Osten in die Doppeltruhe.',
      1: 'Vier Öfen mit der Vorderseite nach Norden. Dahinter Trichter, die nach Norden in die Öfen zeigen (Brennstoff).',
      2: 'Trichter nach unten in die Öfen. Hinten die Brennstoff-Truhen.',
      3: 'Verteiler-Trichterkette nach Osten.',
      4: 'Eingabe-Doppeltruhe für Erze.'
    },
    build(b) {
      b.fill(0, 0, 0, 3, 0, 0, 'hopper:e').set(4, 0, 0, 'chest:n').set(5, 0, 0, 'chest:n');
      b.fill(0, 1, 0, 3, 1, 0, 'furnace:n').fill(0, 1, 1, 3, 1, 1, 'hopper:n');
      b.fill(0, 2, 0, 3, 2, 0, 'hopper:d').fill(0, 2, 1, 3, 2, 1, 'chest:s');
      b.fill(0, 3, 0, 3, 3, 0, 'hopper:e');
      b.set(0, 4, 0, 'chest:n').set(1, 4, 0, 'chest:n');
    }
  });

  BUILDS.push({
    id: 'bambus',
    cat: 'farm',
    name: 'Bambusfarm',
    tagline: 'Brennstoff ohne Ende für die Schmelze',
    difficulty: 'Leicht',
    edition: 'Java 1.20+',
    description: 'Gleicher Aufbau wie die Zuckerrohrfarm, nur ohne Wasser. Bambus wächst schnell und ist ein guter Brennstoff: Zwei Bambus schmelzen ein Item. Schließ die Truhe mit einer Trichterkette an die Brennstoff-Truhe der Automatischen Schmelze an, dann läuft alles von allein.',
    how: [
      'Die Beobachter schauen auf die Höhe des dritten Bambusblocks.',
      'Wächst dort ein Block, schaltet der Impuls über Redstone und Stein alle Kolben.',
      'Kolben zerbrechen Bambus. Alles über dem Kolben fällt ab, der unterste Block bleibt stehen.',
      'Trichterloren unter der Erde sammeln die Items durch den Block hindurch ein.'
    ],
    tips: [
      'Bambus braucht kein Wasser, aber Licht. Die Glaswand vorne lässt Licht durch.',
      'Bambus findest du im Dschungel oder bekommst ihn vom Fahrenden Händler.',
      'Wenn der Bambus zu hoch wird, prüfe, ob alle Beobachter nach Norden schauen.'
    ],
    layerNotes: {
      0: 'Trichterkette nach Osten in die Truhe.',
      1: 'Schienen mit Trichterloren. Die Blöcke an beiden Enden halten die Loren fest.',
      2: 'Erde für den Bambus, dahinter eine Reihe Stein.',
      3: 'Bambus pflanzen. Glas vorne.',
      4: 'Kolben schieben nach Norden zum Bambus. Dahinter Stein.',
      5: 'Beobachter schauen nach Norden, roter Punkt nach Süden. Redstone auf den Stein.'
    },
    build(b) {
      b.fill(0, 0, 1, 7, 0, 1, 'hopper:e').set(8, 0, 1, 'chest:n');
      b.fill(0, 1, 1, 7, 1, 1, 'rail_cart:e').set(-1, 1, 1, 'stone').set(8, 1, 1, 'glass');
      b.fill(-1, 2, 0, 8, 2, 0, 'stone');
      b.fill(0, 2, 1, 7, 2, 1, 'dirt').fill(0, 2, 2, 7, 2, 3, 'stone');
      b.set(-1, 2, 1, 'stone').set(8, 2, 1, 'stone');
      b.fill(0, 3, 1, 7, 3, 1, 'bamboo').fill(0, 3, 2, 7, 3, 2, 'stone');
      b.fill(0, 3, 0, 7, 5, 0, 'glass');
      b.fill(-1, 3, 0, -1, 5, 1, 'glass').fill(8, 3, 0, 8, 5, 1, 'glass');
      b.fill(0, 4, 1, 7, 5, 1, 'bamboo_auto');
      b.fill(0, 4, 2, 7, 4, 2, 'piston:n').fill(0, 4, 3, 7, 4, 3, 'stone');
      b.fill(0, 5, 2, 7, 5, 2, 'observer:n').fill(0, 5, 3, 7, 5, 3, 'redstone');
    }
  });

  BUILDS.push({
    id: 'mobturm',
    extraMin: 15,
    cat: 'farm',
    name: 'Mob-Fallturm',
    tagline: 'Knochen, Pfeile, Schießpulver, Fäden',
    difficulty: 'Fortgeschritten',
    edition: 'Java 1.18+',
    description: 'Eine dunkle Spawn-Etage mit vier Wasserkanälen. Monster laufen auf die offenen Falltüren, fallen ins Wasser und werden in den 2 × 2 Schacht in der Mitte gespült. Nach 30 Blöcken Fall sind sie tot. Die Beute landet unten in den Trichtern und dann in den Truhen.',
    how: [
      'Monster spawnen seit 1.18 nur bei Lichtstufe 0. Deshalb sind Dach und Wände dicht.',
      'Monster halten offene Falltüren für Boden und laufen darauf. Dann fallen sie ins Wasser.',
      'Jeder Kanal ist genau 8 Felder lang. Das Wasser endet am Schacht und läuft nicht hinein.',
      'Die Spawnflächen sind nur 2 Blöcke hoch und 2 breit. Endermen haben keinen Platz.',
      'Ein Fall aus 30 Blöcken macht 27 Schaden. Das tötet Zombies, Skelette, Creeper und Spinnen.'
    ],
    tips: [
      'Warte unten an den Truhen. Du musst mindestens 24 Blöcke von der Spawn-Etage entfernt sein.',
      'Am besten über einem Ozean bauen. Höhlen in der Nähe ausleuchten, sonst spawnen Monster dort.',
      'Leg Fackeln oder Stufen aufs Dach, sonst spawnen dort nachts Monster.',
      'Die Spawn-Etage ist absichtlich dunkel. Nimm zum Bauen Fackeln mit und entferne sie danach.',
      'Schwierigkeit mindestens „Leicht“.'
    ],
    layerNotes: {
      0: 'Standfläche für dich unten am Turm.',
      1: 'Zwei Doppeltruhen in der Mitte.',
      2: 'Vier Trichter nach unten in die Truhen. Schacht aus Steinziegeln darum.',
      3: 'Leuchtstein in der Schachtwand verhindert, dass unten Monster spawnen. Glas zum Zuschauen.',
      5: 'Ab hier nur noch den Schacht hochziehen bis Ebene 31 (2 × 2 innen frei).',
      32: 'Boden der Spawn-Etage. Das 2 × 2 Loch über dem Schacht frei lassen.',
      33: 'Kanäle: Wasserquellen nur ganz außen an jedem Kanal. Daneben die 2 breiten Spawnflächen aus Bruchstein. Außenwand.',
      34: 'Offene Falltüren über jedem Kanalfeld, jeweils an die Spawnfläche geklappt.',
      36: 'Dach komplett dicht machen.'
    },
    build(b) {
      const shape = new Map();
      const put = (x, z, t) => shape.set(x + ',' + z, t);
      for (let i = 1; i <= 8; i++) {
        for (const c of [9, 10]) { put(c, i, 'ch'); put(c, 19 - i, 'ch'); put(i, c, 'ch'); put(19 - i, c, 'ch'); }
        for (const c of [7, 8, 11, 12]) { put(c, i, 'st'); put(c, 19 - i, 'st'); put(i, c, 'st'); put(19 - i, c, 'st'); }
      }
      for (const x of [9, 10]) for (const z of [9, 10]) put(x, z, 'sh');
      const kind = (x, z) => shape.get(x + ',' + z);
      const B = 32;
      // Spawn-Etage
      for (let x = -1; x <= 20; x++) for (let z = -1; z <= 20; z++) {
        const k = kind(x, z);
        let near = false;
        for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) if (kind(x + dx, z + dz)) near = true;
        if (!k && !near) continue;
        if (k !== 'sh') b.set(x, B, z, 'stone');
        b.set(x, B + 4, z, 'cobblestone');
        if (!k) b.fill(x, B + 1, z, x, B + 3, z, 'cobblestone');
        else if (k === 'st') b.set(x, B + 1, z, 'cobblestone');
        else if (k === 'ch') {
          const end = x === 1 || x === 18 || z === 1 || z === 18;
          b.set(x, B + 1, z, end ? 'water' : 'water_flow');
        }
      }
      // Falltüren: Brett liegt an der Spawnfläche
      for (let i = 1; i <= 8; i++) {
        for (const z of [i, 19 - i]) { b.set(9, B + 2, z, 'oak_trapdoor:e'); b.set(10, B + 2, z, 'oak_trapdoor:w'); }
        for (const x of [i, 19 - i]) { b.set(x, B + 2, 9, 'oak_trapdoor:s'); b.set(x, B + 2, 10, 'oak_trapdoor:n'); }
      }
      // Schacht
      b.walls(8, 2, 8, 11, B - 1, 11, 'stone_bricks');
      b.set(8, 3, 10, 'glowstone').set(9, 3, 11, 'glass').set(10, 3, 11, 'glass').set(9, 4, 11, 'glass').set(10, 4, 11, 'glass');
      // Unten: Trichter, Truhen, Standfläche
      b.fill(9, 2, 9, 10, 2, 10, 'hopper:d');
      b.set(9, 1, 9, 'chest:n').set(10, 1, 9, 'chest:n').set(9, 1, 10, 'chest:s').set(10, 1, 10, 'chest:s');
      b.fill(6, 0, 6, 13, 0, 14, 'stone');
    }
  });

  BUILDS.push({
    id: 'lava',
    cat: 'farm',
    name: 'Lavafarm',
    tagline: 'Tropfstein füllt Kessel mit Lava',
    difficulty: 'Leicht',
    edition: 'Java & Bedrock 1.17+',
    description: 'Unter einem Block mit Lava darüber hängt ein spitzer Tropfstein. Er tropft langsam Lava in den Kessel darunter. Die Lavaquelle wird dabei nicht verbraucht. Vier Kessel liefern genug Lava als Brennstoff, für Obsidian oder für die Eisenfarm.',
    how: [
      'Lava muss direkt über dem Block liegen, an dem der Tropfstein hängt.',
      'Der Kessel steht unter der Spitze. Er darf bis zu 11 Blöcke tiefer stehen.',
      'Die Lavaquellen bleiben erhalten, du brauchst sie nur einmal.'
    ],
    tips: [
      'Kessel mit einem leeren Eimer leeren. Ein voller Kessel ist genau ein Lavaeimer.',
      'Es dauert eine Weile. Je mehr Kessel, desto mehr Lava. Die Farm arbeitet nur, wenn du in der Nähe bist.',
      'Spitzen Tropfstein findest du in Tropfsteinhöhlen.'
    ],
    layerNotes: {
      0: 'Boden aus Stein.',
      1: 'Vier Kessel mit einem Feld Abstand. Säulen an den Enden.',
      2: 'Spitzer Tropfstein hängt über jedem Kessel.',
      3: 'Steinreihe: An deren Unterseite hängen die Tropfsteine.',
      4: 'Becken: Lavaquellen genau über den Tropfsteinen, Stein dazwischen und drumherum.'
    },
    build(b) {
      b.fill(-1, 0, -1, 7, 0, 1, 'stone');
      for (const x of [0, 2, 4, 6]) { b.set(x, 1, 0, 'cauldron').set(x, 2, 0, 'pointed_dripstone').set(x, 4, 0, 'lava'); }
      b.fill(-1, 1, 0, -1, 2, 0, 'stone_bricks').fill(7, 1, 0, 7, 2, 0, 'stone_bricks');
      b.fill(-1, 3, 0, 7, 3, 0, 'stone');
      b.fill(-1, 4, -1, 7, 4, -1, 'stone').fill(-1, 4, 1, 7, 4, 1, 'stone');
      for (const x of [-1, 1, 3, 5, 7]) b.set(x, 4, 0, 'stone');
    }
  });

  BUILDS.push({
    id: 'bruchstein',
    cat: 'farm',
    name: 'Bruchstein-Generator',
    tagline: 'Wasser + Lava = unendlich Stein',
    difficulty: 'Leicht',
    edition: 'Java & Bedrock',
    description: 'Der klassische Generator: Lava fließt auf ein Feld, das an fließendes Wasser grenzt, und wird sofort zu Bruchstein. Abbauen, kurz warten, wieder abbauen. Perfekt als Nachschub für alle Bauten hier.',
    how: [
      'Das Wasser fällt in die Grube und breitet sich deshalb nicht seitlich aus.',
      'Fließende Lava neben Wasser wird zu Bruchstein, eine Lavaquelle würde zu Obsidian.',
      'Die Lavaquelle berührt das Wasser nie und bleibt darum erhalten.'
    ],
    tips: [
      'Zuerst das Wasser setzen, dann die Lava.',
      'Mit einer Effizienz-Spitzhacke geht es am schnellsten.',
      'Entsteht Obsidian, hat das Wasser die Lavaquelle erreicht: Grube und Abstände prüfen.'
    ],
    layerNotes: {
      0: 'Untere Steinplatte.',
      1: 'Boden mit einer Grube (1 Block tief) an der dritten Stelle.',
      2: 'Westen: Lavaquelle. Daneben bildet sich Bruchstein. Osten: Wasserquelle, die in die Grube fließt. Rand rundherum.'
    },
    build(b) {
      b.fill(-1, 0, -1, 4, 0, 1, 'stone');
      b.fill(-1, 1, -1, 4, 1, 1, 'stone').set(2, 1, 0, 'water_flow');
      b.walls(-1, 2, -1, 4, 2, 1, 'stone_bricks');
      b.set(0, 2, 0, 'lava').set(1, 2, 0, 'cobble_auto').set(2, 2, 0, 'water_flow').set(3, 2, 0, 'water');
    }
  });

  /* ================================================================
     GEBÄUDE
     ================================================================ */

  BUILDS.push({
    id: 'starterhaus',
    cat: 'building',
    name: 'Starterhaus',
    tagline: '7 × 7 Eichenhaus mit Satteldach',
    difficulty: 'Leicht',
    edition: 'Alle Versionen',
    description: 'Ein gemütliches erstes Haus aus Eichenholz auf einem Bruchstein-Fundament. Mit Bett, Werkbank, Ofen, Truhe und zwei Laternen am Eingang. In einer Spielnacht gebaut.',
    how: [],
    tips: [
      'Erst das Fundament, dann die Stämme an den Ecken: So siehst du sofort, ob die Maße stimmen.',
      'Das Dach steht an jeder Seite einen Block über.',
      'Die Treppen schauen beim Platzieren immer zum Dachfirst.'
    ],
    layerNotes: {
      0: 'Bruchstein-Rand, innen Eichenholzbretter. Weg vor der Tür.',
      1: 'Ecken aus Stämmen, Wände aus Brettern. Tür in der Mitte der Nordseite. Möbel innen.',
      2: 'Fenster: Glasscheiben in jeder Wand.',
      4: 'Erste Dachreihe: Treppen außen, Giebel aus Brettern. Treppen zeigen zur Mitte.',
      7: 'Firstbalken aus Brettern, darauf Stufen.'
    },
    build(b) {
      b.fill(0, 0, 0, 6, 0, 6, 'cobblestone').fill(1, 0, 1, 5, 0, 5, 'oak_planks');
      b.set(3, 0, -1, 'dirt_path').set(3, 0, -2, 'dirt_path');
      b.walls(0, 1, 0, 6, 3, 6, 'oak_planks');
      [[0, 0], [6, 0], [0, 6], [6, 6]].forEach(([x, z]) => b.fill(x, 1, z, x, 3, z, 'oak_log'));
      b.set(3, 1, 0, 'oak_door:s:lower').set(3, 2, 0, 'oak_door:s:upper');
      b.set(1, 2, 0, 'glass_pane').set(5, 2, 0, 'glass_pane');
      b.set(0, 2, 2, 'glass_pane').set(0, 2, 4, 'glass_pane').set(6, 2, 2, 'glass_pane').set(6, 2, 4, 'glass_pane');
      b.set(2, 2, 6, 'glass_pane').set(4, 2, 6, 'glass_pane');
      // Möbel
      b.set(1, 1, 5, 'crafting_table').set(2, 1, 5, 'furnace:n').set(3, 1, 5, 'chest:n');
      b.set(5, 1, 4, 'red_bed:s:foot').set(5, 1, 5, 'red_bed:s:head');
      b.set(1, 1, 1, 'lantern');
      // Laternen am Eingang
      b.set(1, 1, -1, 'oak_fence').set(1, 2, -1, 'lantern').set(5, 1, -1, 'oak_fence').set(5, 2, -1, 'lantern');
      // Dach
      for (let i = 0; i < 4; i++) {
        b.fill(-1, 4 + i, -1 + i, 7, 4 + i, -1 + i, 'oak_stairs:s');
        b.fill(-1, 4 + i, 7 - i, 7, 4 + i, 7 - i, 'oak_stairs:n');
      }
      for (const x of [0, 6]) for (let i = 0; i < 3; i++) b.fill(x, 4 + i, i, x, 4 + i, 6 - i, 'oak_planks');
      b.set(0, 5, 3, 'glass_pane').set(6, 5, 3, 'glass_pane');
      b.fill(-1, 7, 3, 7, 7, 3, 'oak_planks').fill(-1, 8, 3, 7, 8, 3, 'oak_slab:bottom');
    }
  });

  BUILDS.push({
    id: 'wachturm',
    cat: 'building',
    name: 'Wachturm',
    tagline: '13 Blöcke hoch, mit Zinnen',
    difficulty: 'Mittel',
    edition: 'Alle Versionen',
    description: 'Ein schlanker Turm aus Steinziegeln mit Zwischenboden, Leiter innen und einer überstehenden Aussichtsplattform mit Zinnen und Laternen an den Ecken.',
    how: [],
    tips: [
      'Die Leiter klebt an der Südwand. Lass das Loch in beiden Böden frei.',
      'Die Treppen unter der Plattform sind umgedreht (obere Blockhälfte anklicken).',
      'Bruchstein an den Ecken macht die Kanten sichtbar.'
    ],
    layerNotes: {
      0: 'Boden 5 × 5 aus Steinziegeln.',
      1: 'Wände mit Bruchstein-Ecken, Tür im Norden, Leiter innen an der Südwand.',
      5: 'Zwischenboden aus Brettern. Das Feld der Leiter frei lassen.',
      9: 'Umgedrehte Treppen rundum als Stütze für die Plattform.',
      10: 'Plattform 7 × 7, Leiterloch frei lassen.',
      11: 'Zinnen: jeder zweite Block.',
      12: 'Laternen auf die Eck-Zinnen.'
    },
    build(b) {
      b.fill(0, 0, 0, 4, 0, 4, 'stone_bricks');
      b.walls(0, 1, 0, 4, 9, 4, 'stone_bricks');
      [[0, 0], [4, 0], [0, 4], [4, 4]].forEach(([x, z]) => b.fill(x, 1, z, x, 9, z, 'cobblestone'));
      b.set(2, 1, 0, 'oak_door:s:lower').set(2, 2, 0, 'oak_door:s:upper');
      for (const y of [4, 7]) { b.set(0, y, 2, 'glass_pane').set(4, y, 2, 'glass_pane'); }
      b.set(2, 4, 0, 'glass_pane').set(2, 7, 0, 'glass_pane');
      b.fill(1, 5, 1, 3, 5, 3, 'oak_planks');
      for (let y = 1; y <= 10; y++) b.set(2, y, 3, 'ladder:n');
      b.set(1, 1, 1, 'lantern').set(1, 6, 1, 'lantern');
      for (let x = -1; x <= 5; x++) { b.set(x, 9, -1, 'stone_brick_stairs:s:top').set(x, 9, 5, 'stone_brick_stairs:n:top'); }
      for (let z = 0; z <= 4; z++) { b.set(-1, 9, z, 'stone_brick_stairs:e:top').set(5, 9, z, 'stone_brick_stairs:w:top'); }
      b.fill(-1, 10, -1, 5, 10, 5, 'stone_bricks').set(2, 10, 3, 'ladder:n');
      for (let x = -1; x <= 5; x++) for (let z = -1; z <= 5; z++) {
        const edge = x === -1 || x === 5 || z === -1 || z === 5;
        if (edge && (x + z) % 2 === 0) b.set(x, 11, z, 'stone_bricks');
      }
      [[-1, -1], [5, -1], [-1, 5], [5, 5]].forEach(([x, z]) => b.set(x, 12, z, 'lantern'));
    }
  });

  BUILDS.push({
    id: 'brunnen',
    cat: 'building',
    name: 'Dorfbrunnen',
    tagline: 'Klein, mit Dach und Wasser',
    difficulty: 'Leicht',
    edition: 'Alle Versionen',
    description: 'Ein Brunnen wie im Dorf: Bruchstein, vier Zaunpfosten und ein kleines Dach. Liefert unendlich Wasser, weil vier Quellen zusammen liegen.',
    how: [],
    tips: ['Zwei Wassereimer in gegenüberliegende Ecken reichen. Die anderen Felder füllen sich selbst.'],
    layerNotes: {
      0: 'Boden 4 × 4 aus Bruchstein.',
      1: 'Rand aus Bruchstein, in der Mitte 2 × 2 Wasser.',
      2: 'Zaunpfosten auf die Ecken.',
      4: 'Dach 4 × 4 aus Bruchstein.',
      5: 'Stufen in der Mitte als Spitze.'
    },
    build(b) {
      b.fill(0, 0, 0, 3, 0, 3, 'cobblestone');
      b.walls(0, 1, 0, 3, 1, 3, 'cobblestone').fill(1, 1, 1, 2, 1, 2, 'water');
      [[0, 0], [3, 0], [0, 3], [3, 3]].forEach(([x, z]) => b.fill(x, 2, z, x, 3, z, 'oak_fence'));
      b.fill(0, 4, 0, 3, 4, 3, 'cobblestone').fill(1, 5, 1, 2, 5, 2, 'cobblestone_slab:bottom');
      b.set(1, 3, 1, 'lantern');
    }
  });

  BUILDS.push({
    id: 'scheune',
    cat: 'building',
    name: 'Scheune',
    tagline: '9 × 11 mit großem Tor und Heuboden',
    difficulty: 'Mittel',
    edition: 'Alle Versionen',
    description: 'Eine rote Scheune aus Mangrovenholz mit Fichtenbalken, großem Tor, Strohballen und einem hohen Dach aus Fichtentreppen. Platz für Tiere oder eine Lagerhalle.',
    how: [],
    tips: [
      'Erst alle Fichtenstämme setzen, dann die Wände dazwischen füllen.',
      'Das Dach hat fünf Treppenreihen pro Seite. Die Treppen zeigen zur Mitte.'
    ],
    layerNotes: {
      0: 'Boden aus Fichtenholzbrettern mit Bruchstein-Rand.',
      1: 'Fichtenstämme an Ecken und Seitenmitte, Wände aus Mangrovenbrettern. Tor im Norden 3 Blöcke breit.',
      5: 'Erste Dachreihe. Giebelwände aus Fichtenholz.',
      10: 'Firststufen.'
    },
    build(b) {
      b.fill(0, 0, 0, 8, 0, 10, 'cobblestone').fill(1, 0, 1, 7, 0, 9, 'spruce_planks');
      b.walls(0, 1, 0, 8, 4, 10, 'mangrove_planks');
      [[0, 0], [8, 0], [0, 10], [8, 10], [0, 5], [8, 5], [2, 0], [6, 0], [2, 10], [6, 10]].forEach(([x, z]) => b.fill(x, 1, z, x, 4, z, 'spruce_log'));
      b.fill(3, 1, 0, 5, 3, 0, null);
      b.fill(0, 2, 2, 0, 3, 3, 'glass_pane').fill(0, 2, 7, 0, 3, 8, 'glass_pane');
      b.fill(8, 2, 2, 8, 3, 3, 'glass_pane').fill(8, 2, 7, 8, 3, 8, 'glass_pane');
      b.fill(3, 4, 0, 5, 4, 0, 'spruce_log');
      for (let i = 0; i < 5; i++) {
        b.fill(-1 + i, 5 + i, -1, -1 + i, 5 + i, 11, 'spruce_stairs:e');
        b.fill(9 - i, 5 + i, -1, 9 - i, 5 + i, 11, 'spruce_stairs:w');
      }
      for (const z of [0, 10]) for (let i = 0; i < 4; i++) b.fill(i, 5 + i, z, 8 - i, 5 + i, z, 'spruce_planks');
      b.fill(4, 9, -1, 4, 9, 11, 'spruce_planks').fill(4, 10, -1, 4, 10, 11, 'spruce_slab:bottom');
      b.set(4, 7, 0, 'glass_pane').set(4, 7, 10, 'glass_pane');
      // Innenraum
      b.fill(1, 1, 7, 2, 2, 9, 'hay_block').fill(6, 1, 8, 7, 1, 9, 'hay_block').set(7, 2, 9, 'hay_block');
      b.fill(5, 1, 3, 7, 1, 3, 'spruce_fence').fill(5, 1, 1, 5, 1, 2, 'spruce_fence');
      b.set(1, 1, 1, 'lantern').set(7, 1, 6, 'lantern');
    }
  });

  BUILDS.push({
    id: 'leuchtturm',
    cat: 'building',
    name: 'Leuchtturm',
    tagline: 'Rot-weiß gestreift, 20 Blöcke hoch',
    difficulty: 'Fortgeschritten',
    edition: 'Alle Versionen',
    description: 'Ein runder Leuchtturm mit rot-weißen Streifen, Umgang mit Geländer und einer Laternenkammer aus Glas mit Leuchtstein. Ideal an der Küste als Wegweiser bei Nacht.',
    how: [],
    tips: [
      'Der Grundriss ist ein Kreis mit 7 Blöcken Durchmesser. Im 2D-Raster siehst du jede Reihe.',
      'Die Streifen wechseln alle drei Ebenen die Farbe.',
      'Die Leiter klebt innen an der Südwand.'
    ],
    layerNotes: {
      0: 'Volle Kreisscheibe aus Steinziegeln als Fundament.',
      1: 'Kreiswand, Tür im Norden, Leiter innen an der Südwand.',
      15: 'Umgang 9 × 9 als Kreis, Leiterloch frei lassen.',
      16: 'Geländer aus Zäunen außen, Glaskammer mit Leuchtstein innen.',
      18: 'Dach der Laternenkammer.'
    },
    build(b) {
      const r3 = circle(3), r4 = circle(4);
      r3.forEach(([x, z]) => b.set(x + 3, 0, z + 3, 'stone_bricks'));
      for (let y = 1; y <= 14; y++) {
        const band = Math.floor((y - 1) / 3) % 2 === 0 ? 'white_concrete' : 'red_concrete';
        r3.forEach(([x, z, edge]) => { if (edge) b.set(x + 3, y, z + 3, band); });
      }
      b.set(3, 1, 0, 'oak_door:s:lower').set(3, 2, 0, 'oak_door:s:upper');
      for (const y of [5, 9, 13]) b.set(0, y, 3, 'glass_pane').set(6, y, 3, 'glass_pane');
      for (let y = 1; y <= 15; y++) b.set(3, y, 5, 'ladder:n');
      r4.forEach(([x, z]) => { if (!(x === 0 && z === 2)) b.set(x + 3, 15, z + 3, 'stone_bricks'); });
      r4.forEach(([x, z, edge]) => { if (edge) b.set(x + 3, 16, z + 3, 'oak_fence'); });
      for (let y = 16; y <= 17; y++) {
        b.walls(2, y, 2, 4, y, 4, 'glass');
        b.set(3, y, 3, 'glowstone');
      }
      b.fill(2, 18, 2, 4, 18, 4, 'red_concrete').set(3, 19, 3, 'stone_brick_slab:bottom');
    }
  });

  BUILDS.push({
    id: 'netherportal',
    cat: 'project',
    name: 'Netherportal',
    tagline: '10 Obsidian, mit Laternen',
    difficulty: 'Leicht',
    edition: 'Alle Versionen',
    description: 'Der kleinstmögliche Rahmen für ein Netherportal: 4 breit, 5 hoch. Die Ecken brauchen kein Obsidian, darum reichen 10 Blöcke. Mit Feuerzeug innen anzünden.',
    how: [],
    tips: [
      'Ohne Diamantspitzhacke: Wasser über Lavaquellen gießen und den Rahmen direkt aus Obsidian gießen.',
      'Ein Portal im Nether bei X/8 und Z/8 verbindet sich mit diesem Portal.'
    ],
    layerNotes: {
      0: 'Sockel aus Steinziegeln, zwei Obsidian als Boden des Rahmens.',
      1: 'Seiten des Rahmens. Das Innere bleibt leer.',
      4: 'Oberkante: zwei Obsidian. Dann innen mit Feuerzeug anzünden.'
    },
    build(b) {
      b.fill(-1, 0, -1, 4, 0, 1, 'stone_bricks').fill(1, 0, 0, 2, 0, 0, 'obsidian');
      b.fill(0, 1, 0, 0, 3, 0, 'obsidian').fill(3, 1, 0, 3, 3, 0, 'obsidian').fill(1, 4, 0, 2, 4, 0, 'obsidian');
      b.fill(1, 1, 0, 2, 3, 0, 'nether_portal:e');
      b.set(-1, 1, -1, 'lantern').set(4, 1, -1, 'lantern');
    }
  });

  BUILDS.push({
    id: 'leuchtfeuer',
    cat: 'project',
    name: 'Leuchtfeuer-Pyramide',
    tagline: 'Stufe 4: Eile II oder Stärke',
    difficulty: 'Mittel',
    edition: 'Alle Versionen',
    description: 'Eine volle Pyramide aus 164 Mineralblöcken mit dem Leuchtfeuer oben. Stufe 4 schaltet alle Effekte frei, zum Beispiel Eile II für schnelles Abbauen. Reichweite 50 Blöcke.',
    how: [
      'Jede Ebene der Pyramide ist eine Stufe: 3 × 3, 5 × 5, 7 × 7, 9 × 9.',
      'Über dem Leuchtfeuer muss freier Himmel sein. Glas darf darüber liegen und färbt den Strahl.'
    ],
    tips: [
      'Erst die 3 × 3 Spitze bauen und testen, dann nach unten erweitern.',
      'Zum Aktivieren einen Eisenbarren, Goldbarren, Smaragd, Diamant oder Netheritbarren ins Leuchtfeuer legen.'
    ],
    layerNotes: {
      0: 'Unterste Stufe 9 × 9 (81 Blöcke).',
      1: '7 × 7 (49 Blöcke).',
      2: '5 × 5 (25 Blöcke).',
      3: '3 × 3 (9 Blöcke).',
      4: 'Leuchtfeuer in die Mitte.'
    },
    build(b) {
      for (let i = 0; i < 4; i++) b.fill(i, i, i, 8 - i, i, 8 - i, 'iron_block');
      b.set(4, 4, 4, 'beacon');
    }
  });

  BUILDS.push({
    id: 'handelshalle',
    extraMin: 30,
    cat: 'project',
    name: 'Handelshalle',
    tagline: '6 Dorfbewohner sicher in Zellen',
    difficulty: 'Mittel',
    edition: 'Java & Bedrock',
    description: 'Sechs Zellen für Dorfbewohner, jede mit eigenem Arbeitsplatz davor. Du handelst durch die Lücke über dem Arbeitsplatz. Die Dorfbewohner kommen nicht heraus, weil über der Lücke nur ein Block Platz ist.',
    how: [
      'Der Block vor dem Dorfbewohner bestimmt seinen Beruf.',
      'Über dem Arbeitsplatz ist nur ein Block frei. Ein Dorfbewohner ist fast zwei Blöcke groß und passt nicht hindurch.',
      'Dorfbewohner füllen ihre Angebote am Arbeitsplatz wieder auf. Betten brauchen sie dafür nicht.'
    ],
    tips: [
      'Dorfbewohner mit Lore oder Boot bis vor die Zelle bringen und hineinschieben, dann den Deckel schließen.',
      'Bibliothekar mit schlechtem Angebot? Lesepult abbauen und neu setzen, solange du noch nicht gehandelt hast.',
      'Die Laternen auf dem Gang verhindern, dass Zombies spawnen.'
    ],
    layerNotes: {
      0: 'Boden aus Steinziegeln, vorne ein Gang zum Handeln.',
      1: 'Arbeitsplätze vorne, Dorfbewohner dahinter. Glas zwischen den Zellen, Rückwand aus Steinziegeln.',
      2: 'Vorne bleibt die Lücke über dem Arbeitsplatz offen.',
      3: 'Deckel über Zellen und Arbeitsplätzen.'
    },
    build(b) {
      b.fill(0, 0, -2, 12, 0, 2, 'stone_bricks');
      b.fill(0, 1, 2, 12, 3, 2, 'stone_bricks');
      const stations = ['lectern', 'lectern', 'composter', 'blast_furnace:n', 'fletching_table', 'smithing_table'];
      for (let i = 0; i < 6; i++) {
        const x = 1 + i * 2;
        b.set(x, 1, 0, stations[i]).set(x, 1, 1, 'villager');
      }
      for (let x = 0; x <= 12; x += 2) b.fill(x, 1, 0, x, 2, 1, 'glass');
      b.fill(0, 3, 0, 12, 3, 1, 'stone_bricks');
      b.fill(0, 4, 0, 12, 4, 2, 'stone_brick_slab:bottom');
      for (const x of [0, 6, 12]) b.set(x, 1, -2, 'lantern');
    }
  });

  BUILDS.push({
    id: 'windmuehle',
    cat: 'building',
    name: 'Windmühle',
    tagline: 'Holzturm mit vier Flügeln',
    difficulty: 'Fortgeschritten',
    edition: 'Alle Versionen',
    description: 'Eine Windmühle mit breitem Sockel, schmalerem Oberteil, Pyramidendach und vier Flügeln aus Zäunen und Wolle an der Nordseite. Passt gut neben eine Weizenfarm.',
    how: [],
    tips: [
      'Die Flügel drehen sich im Uhrzeigersinn: Jeder Flügel hat sein Tuch auf derselben Drehseite.',
      'Zäune verbinden sich nur seitlich. Senkrechte Flügel bestehen aus einzelnen Pfosten.',
      'Baue die Flügel von der Nabe aus nach außen, dann brauchst du kein Gerüst.'
    ],
    layerNotes: {
      0: 'Boden 7 × 7 aus Bruchstein.',
      1: 'Unterteil: Stämme an den Ecken, Bretter dazwischen, Tür im Süden.',
      6: 'Stufen als Sims auf dem Unterteil. Oberteil 5 × 5 beginnt.',
      8: 'Nabe und Achse der Flügel an der Nordseite.',
      10: 'Pyramidendach aus Fichtentreppen.'
    },
    build(b) {
      b.fill(0, 0, 0, 6, 0, 6, 'cobblestone');
      b.walls(0, 1, 0, 6, 5, 6, 'oak_planks');
      [[0, 0], [6, 0], [0, 6], [6, 6]].forEach(([x, z]) => b.fill(x, 1, z, x, 5, z, 'spruce_log'));
      b.set(3, 1, 6, 'oak_door:n:lower').set(3, 2, 6, 'oak_door:n:upper');
      b.set(0, 3, 3, 'glass_pane').set(6, 3, 3, 'glass_pane').set(3, 3, 0, 'glass_pane');
      for (let x = 0; x <= 6; x++) for (let z = 0; z <= 6; z++) if (x === 0 || x === 6 || z === 0 || z === 6) b.set(x, 6, z, 'spruce_slab:bottom');
      b.walls(1, 6, 1, 5, 9, 5, 'oak_planks');
      [[1, 1], [5, 1], [1, 5], [5, 5]].forEach(([x, z]) => b.fill(x, 6, z, x, 9, z, 'spruce_log'));
      b.set(3, 7, 5, 'glass_pane').set(1, 8, 3, 'glass_pane').set(5, 8, 3, 'glass_pane');
      for (let x = 1; x <= 5; x++) { b.set(x, 10, 1, 'spruce_stairs:s').set(x, 10, 5, 'spruce_stairs:n'); }
      for (let z = 2; z <= 4; z++) { b.set(1, 10, z, 'spruce_stairs:e').set(5, 10, z, 'spruce_stairs:w'); }
      b.fill(2, 10, 2, 4, 10, 4, 'spruce_planks');
      for (let x = 2; x <= 4; x++) { b.set(x, 11, 2, 'spruce_stairs:s').set(x, 11, 4, 'spruce_stairs:n'); }
      b.set(2, 11, 3, 'spruce_stairs:e').set(4, 11, 3, 'spruce_stairs:w').set(3, 11, 3, 'spruce_planks').set(3, 12, 3, 'spruce_slab:bottom');
      // Flügel
      b.set(3, 8, 0, 'spruce_planks').set(3, 8, -1, 'spruce_planks');
      for (let i = 1; i <= 4; i++) {
        b.set(3, 8 + i, -1, 'oak_fence').set(4, 8 + i, -1, 'white_wool');
        b.set(3, 8 - i, -1, 'oak_fence').set(2, 8 - i, -1, 'white_wool');
        b.set(3 - i, 8, -1, 'oak_fence').set(3 - i, 9, -1, 'white_wool');
        b.set(3 + i, 8, -1, 'oak_fence').set(3 + i, 7, -1, 'white_wool');
      }
    }
  });

  BUILDS.push({
    id: 'modernhaus',
    cat: 'building',
    name: 'Modernes Haus',
    tagline: 'Beton, Glas, Dachterrasse',
    difficulty: 'Mittel',
    edition: 'Alle Versionen',
    description: 'Zwei Etagen aus weißem Beton mit großen Fensterfronten. Das Obergeschoss ist versetzt und ragt nach Osten über den Eingang hinaus. Oben links gibt es eine Dachterrasse mit Glasgeländer.',
    how: [],
    tips: [
      'Beton bekommst du, wenn Trockenbeton Wasser berührt.',
      'Statt Beton gehen auch Quarz oder Glattstein.',
      'Die Leiter innen führt durch ein Loch in der Decke nach oben.'
    ],
    layerNotes: {
      0: 'Bodenplatte aus grauem Beton, vorne ein kleiner Garten.',
      1: 'Erdgeschoss: Glasfront nach Norden, Tür links.',
      4: 'Decke des Erdgeschosses, nach Osten verlängert. Leiterloch frei lassen.',
      5: 'Obergeschoss, Glasgeländer an der Terrasse im Westen.',
      8: 'Flachdach mit Überstand.'
    },
    build(b) {
      b.fill(0, 0, -2, 12, 0, 8, 'gray_concrete');
      b.fill(0, 0, -2, 12, 0, -1, 'grass_block');
      [1, 4, 8, 11].forEach((x) => b.set(x, 1, -2, 'oak_leaves'));
      b.walls(0, 1, 0, 10, 3, 8, 'white_concrete');
      b.fill(3, 1, 0, 9, 3, 0, 'glass');
      b.set(1, 1, 0, 'oak_door:s:lower').set(1, 2, 0, 'oak_door:s:upper');
      b.fill(0, 2, 3, 0, 2, 5, 'glass').fill(10, 2, 3, 10, 2, 5, 'glass').fill(3, 2, 8, 7, 2, 8, 'glass');
      b.fill(0, 4, 0, 12, 4, 8, 'white_concrete');
      b.fill(12, 1, 0, 12, 3, 0, 'gray_concrete').fill(12, 1, 8, 12, 3, 8, 'gray_concrete');
      b.walls(3, 5, 0, 12, 7, 8, 'white_concrete');
      b.fill(4, 5, 0, 11, 7, 0, 'glass').fill(12, 6, 2, 12, 6, 6, 'glass').fill(5, 6, 8, 10, 6, 8, 'glass');
      b.fill(0, 5, 0, 2, 5, 0, 'glass_pane').fill(0, 5, 1, 0, 5, 8, 'glass_pane').fill(1, 5, 8, 2, 5, 8, 'glass_pane');
      b.fill(2, 8, -1, 13, 8, 9, 'gray_concrete');
      for (let y = 1; y <= 5; y++) b.set(9, y, 7, 'ladder:n');
      b.set(2, 1, 6, 'lantern').set(8, 1, 6, 'chest:n').set(6, 1, 7, 'crafting_table').set(5, 5, 6, 'red_bed:s:foot').set(5, 5, 7, 'red_bed:s:head').set(8, 5, 3, 'lantern');
    }
  });

  BUILDS.push({
    id: 'bruecke',
    cat: 'project',
    name: 'Holzbrücke',
    tagline: '13 Blöcke über Fluss oder Schlucht',
    difficulty: 'Leicht',
    edition: 'Alle Versionen',
    description: 'Eine 3 breite Brücke aus Fichtenholz auf drei Steinpfeilern, mit Bögen aus umgedrehten Treppen, Geländer und Laternen. Länger machen: einfach Pfeiler im Abstand von 6 Blöcken wiederholen.',
    how: [],
    tips: [
      'Erst die Pfeiler bis zur Wasseroberfläche bauen, dann die Fahrbahn von einem Ufer aus legen.',
      'Die Bögen sind umgedrehte Treppen: an die obere Hälfte der Blockseite klicken.'
    ],
    layerNotes: {
      0: 'Drei Pfeiler aus Steinziegeln (z. B. im Flussbett).',
      2: 'Bögen: umgedrehte Treppen an den Pfeilern.',
      3: 'Fahrbahn aus Fichtenholzbrettern.',
      4: 'Geländer aus Fichtenzäunen.',
      5: 'Laternen auf den Pfosten über den Pfeilern.'
    },
    build(b) {
      for (const x of [0, 6, 12]) b.fill(x, 0, 0, x, 2, 2, 'stone_bricks');
      for (const x of [1, 7]) b.fill(x, 2, 0, x, 2, 2, 'spruce_stairs:w:top');
      for (const x of [5, 11]) b.fill(x, 2, 0, x, 2, 2, 'spruce_stairs:e:top');
      b.fill(0, 3, 0, 12, 3, 2, 'spruce_planks');
      b.fill(0, 4, 0, 12, 4, 0, 'spruce_fence').fill(0, 4, 2, 12, 4, 2, 'spruce_fence');
      for (const x of [0, 6, 12]) { b.set(x, 5, 0, 'lantern').set(x, 5, 2, 'lantern'); }
    }
  });

  BUILDS.push({
    id: 'lagerraum',
    cat: 'project',
    name: 'Lagerraum',
    tagline: '16 Doppeltruhen an drei Wänden',
    difficulty: 'Leicht',
    edition: 'Alle Versionen',
    description: 'Ein Lagerraum aus Steinziegeln mit 32 Truhen, also 16 Doppeltruhen, an der Nord-, West- und Ostwand. In der Mitte stehen Werkbank, Ofen und Schmelzofen. Zusammen sind das 864 Plätze für je einen Stapel.',
    how: [],
    tips: [
      'Truhen lassen sich übereinander stapeln und trotzdem öffnen.',
      'Beschrifte die Truhen mit Schildern oder Rahmen, zum Beispiel „Stein“, „Holz“, „Erze“.',
      'Zwei Truhen nebeneinander werden zur Doppeltruhe. Setze die zweite direkt neben die erste.'
    ],
    layerNotes: {
      0: 'Boden aus Fichtenholzbrettern, Rand aus Steinziegeln.',
      1: 'Untere Truhenreihe an drei Wänden, Tür im Süden.',
      2: 'Obere Truhenreihe direkt auf die untere.',
      4: 'Decke.'
    },
    build(b) {
      b.fill(0, 0, 0, 9, 0, 7, 'stone_bricks').fill(1, 0, 1, 8, 0, 6, 'spruce_planks');
      b.walls(0, 1, 0, 9, 3, 7, 'stone_bricks');
      b.set(4, 1, 7, 'oak_door:n:lower').set(4, 2, 7, 'oak_door:n:upper');
      b.set(2, 2, 7, 'glass_pane').set(7, 2, 7, 'glass_pane');
      for (let y = 1; y <= 2; y++) {
        b.fill(1, y, 1, 8, y, 1, 'chest:s');
        b.fill(1, y, 2, 1, y, 5, 'chest:e');
        b.fill(8, y, 2, 8, y, 5, 'chest:w');
      }
      b.set(3, 1, 4, 'crafting_table').set(5, 1, 4, 'furnace:s').set(6, 1, 4, 'blast_furnace:s');
      b.fill(0, 4, 0, 9, 4, 7, 'spruce_planks');
      b.set(2, 3, 3, 'lantern').set(7, 3, 3, 'lantern');
    }
  });

  BUILDS.push({
    id: 'kastell',
    cat: 'building',
    name: 'Kastell',
    tagline: 'Burg mit 4 Türmen, Mauern und Bergfried',
    difficulty: 'Fortgeschritten',
    edition: 'Alle Versionen',
    description: 'Eine kleine Burg auf 17 × 17 Blöcken: vier Ecktürme mit Leitern und Zinnen, 2 Blöcke dicke Mauern mit Wehrgang, ein Tor im Süden und ein Bergfried in der Mitte des Burghofs.',
    how: [],
    tips: [
      'Baue zuerst die vier Türme bis Ebene 1, dann siehst du, ob das Quadrat stimmt.',
      'Auf den Mauern kannst du hinter den Zinnen entlanglaufen.',
      'Bruchstein ist billiger als Steinziegel. Mischen sieht auch gut aus.'
    ],
    layerNotes: {
      0: 'Rasen für den Burghof, Steinziegel unter den Türmen.',
      1: 'Türme (5 × 5), Mauern dazwischen, Tor im Süden, Türen in den Burghof. Leitern innen in den Türmen.',
      5: 'Zwischenboden in den Türmen. Oberkante der Mauern = Wehrgang.',
      6: 'Zinnen außen auf den Mauern.',
      10: 'Turmplattformen, Leiterloch frei lassen.',
      11: 'Zinnen auf den Türmen.'
    },
    build(b) {
      b.fill(0, 0, 0, 16, 0, 16, 'grass_block');
      const towers = [[0, 0], [12, 0], [0, 12], [12, 12]];
      // Mauern
      b.fill(5, 1, 1, 11, 5, 2, 'stone_bricks').fill(5, 1, 14, 11, 5, 15, 'stone_bricks');
      b.fill(1, 1, 5, 2, 5, 11, 'stone_bricks').fill(14, 1, 5, 15, 5, 11, 'stone_bricks');
      for (let i = 5; i <= 11; i += 2) { b.set(i, 6, 1, 'stone_bricks').set(i, 6, 15, 'stone_bricks').set(1, 6, i, 'stone_bricks').set(15, 6, i, 'stone_bricks'); }
      b.fill(7, 1, 14, 9, 3, 15, null);
      b.fill(7, 4, 14, 9, 4, 15, 'stone_brick_slab:top');
      b.set(6, 1, 13, 'lantern').set(10, 1, 13, 'lantern');
      // Türme
      towers.forEach(([tx, tz]) => {
        b.fill(tx, 0, tz, tx + 4, 0, tz + 4, 'stone_bricks');
        b.walls(tx, 1, tz, tx + 4, 9, tz + 4, 'stone_bricks');
        b.fill(tx + 1, 5, tz + 1, tx + 3, 5, tz + 3, 'spruce_planks');
        b.fill(tx, 10, tz, tx + 4, 10, tz + 4, 'stone_bricks');
        for (let x = tx; x <= tx + 4; x++) for (let z = tz; z <= tz + 4; z++) {
          const edge = x === tx || x === tx + 4 || z === tz || z === tz + 4;
          if (edge && (x + z) % 2 === 0) b.set(x, 11, z, 'stone_bricks');
        }
        b.set(tx + 2, 7, tz, 'glass_pane').set(tx, 7, tz + 2, 'glass_pane').set(tx + 4, 7, tz + 2, 'glass_pane').set(tx + 2, 7, tz + 4, 'glass_pane');
        const lx = tx + 2, lz = tz + 2;
        for (let y = 1; y <= 10; y++) b.set(lx, y, lz, 'ladder:n');
      });
      // Leitern brauchen eine Wand: Mittelsäule im Turm, Leiter davor
      towers.forEach(([tx, tz]) => { for (let y = 1; y <= 9; y++) b.set(tx + 2, y, tz + 3, 'stone_bricks'); });
      b.set(4, 1, 3, 'oak_door:w:lower').set(4, 2, 3, 'oak_door:w:upper');
      b.set(12, 1, 3, 'oak_door:e:lower').set(12, 2, 3, 'oak_door:e:upper');
      b.set(4, 1, 13, 'oak_door:w:lower').set(4, 2, 13, 'oak_door:w:upper');
      b.set(12, 1, 13, 'oak_door:e:lower').set(12, 2, 13, 'oak_door:e:upper');
      // Bergfried
      b.walls(6, 1, 6, 10, 7, 10, 'cobblestone');
      [[6, 6], [10, 6], [6, 10], [10, 10]].forEach(([x, z]) => b.fill(x, 1, z, x, 7, z, 'spruce_log'));
      b.set(8, 1, 10, 'oak_door:n:lower').set(8, 2, 10, 'oak_door:n:upper');
      b.set(8, 4, 6, 'glass_pane').set(6, 4, 8, 'glass_pane').set(10, 4, 8, 'glass_pane').set(8, 5, 10, 'glass_pane');
      b.fill(5, 8, 5, 11, 8, 11, 'stone_brick_slab:bottom');
      b.set(8, 1, 8, 'lantern');
    }
  });

  BUILDS.push({
    id: 'fachwerkhaus',
    cat: 'building',
    name: 'Fachwerkhaus',
    tagline: 'Zwei Etagen, Obergeschoss kragt vor',
    difficulty: 'Mittel',
    edition: 'Alle Versionen',
    description: 'Ein mittelalterliches Haus mit Erdgeschoss aus Bruchstein und einem Obergeschoss in Fachwerk-Optik: dunkle Fichtenbalken, helle Wandfelder. Das Obergeschoss steht vorne und hinten einen Block über.',
    how: [],
    tips: [
      'Für die hellen Felder passen auch weiße Wolle, Birkenbretter oder Glattquarz.',
      'Setze zuerst alle senkrechten Balken, dann die Felder dazwischen.',
      'Die Leiter in der Ecke führt ins Obergeschoss.'
    ],
    layerNotes: {
      0: 'Fundament aus Bruchstein.',
      1: 'Erdgeschoss aus Bruchstein mit Balken an den Ecken, Tür im Norden.',
      4: 'Boden des Obergeschosses, vorne und hinten 1 Block länger.',
      5: 'Fachwerk: Fichtenbalken an Ecken und jeder zweiten Stelle, helle Felder dazwischen.',
      8: 'Dach: Treppen zeigen zur Mitte, Giebel in Weiß.'
    },
    build(b) {
      b.fill(0, 0, 0, 6, 0, 8, 'cobblestone');
      b.walls(0, 1, 0, 6, 3, 8, 'cobblestone');
      [[0, 0], [6, 0], [0, 8], [6, 8]].forEach(([x, z]) => b.fill(x, 1, z, x, 3, z, 'spruce_log'));
      b.set(3, 1, 0, 'oak_door:s:lower').set(3, 2, 0, 'oak_door:s:upper');
      b.set(1, 2, 0, 'glass_pane').set(5, 2, 0, 'glass_pane').set(0, 2, 4, 'glass_pane').set(6, 2, 4, 'glass_pane');
      b.fill(0, 4, -1, 6, 4, 9, 'spruce_planks');
      b.walls(0, 5, -1, 6, 7, 9, 'white_concrete');
      for (let x = 0; x <= 6; x += 2) { b.fill(x, 5, -1, x, 7, -1, 'spruce_log'); b.fill(x, 5, 9, x, 7, 9, 'spruce_log'); }
      for (let z = 1; z <= 7; z += 2) { b.fill(0, 5, z, 0, 7, z, 'spruce_log'); b.fill(6, 5, z, 6, 7, z, 'spruce_log'); }
      b.fill(0, 7, -1, 6, 7, -1, 'spruce_planks').fill(0, 7, 9, 6, 7, 9, 'spruce_planks');
      b.set(1, 6, -1, 'glass_pane').set(5, 6, -1, 'glass_pane').set(3, 6, 9, 'glass_pane').set(0, 6, 4, 'glass_pane').set(6, 6, 4, 'glass_pane');
      for (let i = 0; i < 4; i++) {
        b.fill(-1 + i, 8 + i, -2, -1 + i, 8 + i, 10, 'spruce_stairs:e');
        b.fill(7 - i, 8 + i, -2, 7 - i, 8 + i, 10, 'spruce_stairs:w');
      }
      for (const z of [-1, 9]) for (let i = 0; i < 3; i++) b.fill(i, 8 + i, z, 6 - i, 8 + i, z, 'white_concrete');
      b.fill(3, 11, -2, 3, 11, 10, 'spruce_planks').fill(3, 12, -2, 3, 12, 10, 'spruce_slab:bottom');
      b.set(3, 9, -1, 'glass_pane');
      for (let y = 1; y <= 4; y++) b.set(5, y, 7, 'ladder:w');
      b.set(1, 1, 7, 'crafting_table').set(1, 1, 6, 'furnace:e').set(1, 1, 1, 'lantern');
      b.set(2, 5, 6, 'red_bed:s:foot').set(2, 5, 7, 'red_bed:s:head').set(4, 5, 1, 'chest:s').set(4, 5, 7, 'lantern');
      b.set(2, 2, -1, 'lantern');
      b.set(2, 1, -1, 'oak_fence');
    }
  });

  BUILDS.push({
    id: 'gewaechshaus',
    cat: 'building',
    name: 'Gewächshaus-Kuppel',
    tagline: 'Glaskuppel mit Acker und Wasser',
    difficulty: 'Mittel',
    edition: 'Alle Versionen',
    description: 'Eine halbkugelförmige Glaskuppel mit 11 Blöcken Durchmesser. Innen liegt ein runder Acker um eine Wasserquelle, außen ein Rasenring mit Büschen. Oben in der Mitte hängt eine Seelaterne, damit die Pflanzen auch nachts wachsen.',
    how: [],
    tips: [
      'Die Kuppel ist rund. Halte dich Ebene für Ebene genau an das 2D-Raster.',
      'Durch die Seelaterne bleibt es hell genug, und es spawnen keine Monster.',
      'Statt Weizen kannst du Karotten, Kartoffeln oder Rote Bete pflanzen.'
    ],
    layerNotes: {
      0: 'Fundament: runde Scheibe aus Steinziegeln.',
      1: 'Boden: Steinziegelring außen, Rasen, runder Acker, Wasser in der Mitte. Weg zur Tür.',
      2: 'Unterste Glasreihe und Pflanzen. Tür im Norden.',
      6: 'Oberste Ebene der Kuppel mit Seelaterne.'
    },
    build(b) {
      const C = 5;
      for (let x = 0; x <= 10; x++) for (let z = 0; z <= 10; z++) {
        const d2 = Math.hypot(x - C, z - C);
        if (d2 > 5.5) continue;
        b.set(x, 0, z, 'stone_bricks');
        if (d2 > 4.6) b.set(x, 1, z, 'stone_bricks');
        else if (x === C && z === C) b.set(x, 1, z, 'water');
        else if (d2 <= 3.6 && !(x === C && z < C)) { b.set(x, 1, z, 'farmland'); b.set(x, 2, z, 'wheat'); }
        else b.set(x, 1, z, 'grass_block');
        for (let y = 2; y <= 6; y++) {
          const d3 = Math.hypot(x - C, y - 1, z - C);
          if (d3 > 4.6 && d3 <= 5.5) b.set(x, y, z, 'glass');
        }
      }
      for (let z = 1; z < C; z++) b.set(C, 1, z, 'dirt_path');
      b.set(C, 2, 0, 'oak_door:s:lower').set(C, 3, 0, 'oak_door:s:upper');
      b.set(C, 6, C, 'sea_lantern');
      [[1, 5], [9, 5], [5, 9], [2, 8], [8, 8]].forEach(([x, z]) => { if (b.get(x, 1, z) === 'grass_block') b.set(x, 2, z, 'oak_leaves'); });
    }
  });

  BUILDS.push({
    id: 'pferdestall',
    cat: 'building',
    name: 'Pferdestall',
    tagline: '4 Boxen mit Zauntoren und Heu',
    difficulty: 'Leicht',
    edition: 'Alle Versionen',
    description: 'Ein offener Stall aus Fichtenholz mit vier Boxen, je 2 Blöcke breit. Vorne verläuft ein Gang, jede Box hat ein Zauntor und Strohballen. Passt auch für Esel, Maultiere oder Lamas.',
    how: [],
    tips: [
      'Pferde mit einer Leine in die Box führen, dann das Zauntor schließen.',
      'Strohballen sind Deko. Füttern geht mit Weizen, Äpfeln oder Heu aus der Hand.',
      'Das Dach aus Stufen verhindert, dass auf ihm Monster spawnen.'
    ],
    layerNotes: {
      0: 'Boden aus Erde, Gang vorne aus Trampelpfad.',
      1: 'Pfosten vorne, Rückwand und Seitenwände, Trennzäune zwischen den Boxen, ein Zauntor pro Box.',
      4: 'Dach aus Fichtenstufen.'
    },
    build(b) {
      b.fill(0, 0, 0, 12, 0, 6, 'dirt').fill(0, 0, 0, 12, 0, 1, 'dirt_path');
      b.fill(0, 1, 6, 12, 3, 6, 'spruce_planks').fill(0, 1, 0, 0, 3, 6, 'spruce_planks').fill(12, 1, 0, 12, 3, 6, 'spruce_planks');
      for (const x of [0, 3, 6, 9, 12]) b.fill(x, 1, 0, x, 3, 0, 'spruce_log');
      for (const x of [3, 6, 9]) { b.fill(x, 1, 2, x, 1, 5, 'spruce_fence'); b.fill(x, 1, 6, x, 3, 6, 'spruce_log'); }
      for (const x0 of [1, 4, 7, 10]) { b.set(x0, 1, 2, 'spruce_fence_gate:s').set(x0 + 1, 1, 2, 'spruce_fence'); b.set(x0, 1, 5, 'hay_block').set(x0 + 1, 1, 5, 'hay_block').set(x0 + 1, 2, 5, 'hay_block'); }
      b.fill(0, 4, -1, 12, 4, 6, 'spruce_slab:bottom');
      for (const x of [2, 5, 8, 11]) b.set(x, 3, 1, 'lantern');
    }
  });

  BUILDS.push({
    id: 'baumhaus',
    cat: 'building',
    name: 'Baumhaus',
    tagline: 'Hütte auf einer Riesen-Eiche',
    difficulty: 'Mittel',
    edition: 'Alle Versionen',
    description: 'Ein 2 × 2 dicker Eichenstamm trägt eine Plattform mit Geländer und einer kleinen Hütte. Darüber wächst eine runde Laubkrone. Eine Leiter am Stamm führt direkt in die Hütte.',
    how: [],
    tips: [
      'Laub mit einer Schere abbauen, damit du es wieder setzen kannst. Gesetztes Laub verwelkt nicht.',
      'Den Stamm kannst du auch aus Fichte oder Tropenholz bauen.',
      'Baue die Krone zum Schluss, sonst ist sie beim Bauen im Weg.'
    ],
    layerNotes: {
      0: 'Stamm aus 2 × 2 Eichenstämmen, Leiter an der Südseite.',
      7: 'Plattform 10 × 10 aus Brettern, Leiterloch frei lassen.',
      8: 'Hütte aus Brettern um den Stamm, Geländer am Rand, Tür nach Süden.',
      11: 'Dach aus Stufen.',
      12: 'Laubkrone.'
    },
    build(b) {
      b.fill(4, 0, 4, 5, 13, 5, 'oak_log');
      for (let y = 0; y <= 7; y++) b.set(4, y, 6, 'ladder:s');
      b.fill(0, 7, 0, 9, 7, 9, 'oak_planks').fill(4, 7, 4, 5, 7, 5, 'oak_log').set(4, 7, 6, 'ladder:s');
      for (let x = 0; x <= 9; x++) for (let z = 0; z <= 9; z++) if (x === 0 || x === 9 || z === 0 || z === 9) b.set(x, 8, z, 'oak_fence');
      b.walls(2, 8, 2, 7, 10, 7, 'oak_planks');
      [[2, 2], [7, 2], [2, 7], [7, 7]].forEach(([x, z]) => b.fill(x, 8, z, x, 10, z, 'oak_log'));
      b.set(3, 8, 7, 'oak_door:n:lower').set(3, 9, 7, 'oak_door:n:upper');
      b.set(2, 9, 4, 'glass_pane').set(7, 9, 4, 'glass_pane').set(5, 9, 2, 'glass_pane').set(6, 9, 7, 'glass_pane');
      b.fill(1, 11, 1, 8, 11, 8, 'oak_slab:bottom').fill(4, 11, 4, 5, 11, 5, 'oak_log');
      b.set(3, 8, 3, 'lantern').set(6, 8, 6, 'chest:n');
      for (let x = -1; x <= 10; x++) for (let z = -1; z <= 10; z++) for (let y = 12; y <= 16; y++) {
        const d = Math.hypot(x - 4.5, (y - 12.5) * 1.3, z - 4.5);
        if (d <= 5.2 && !b.get(x, y, z)) b.set(x, y, z, 'oak_leaves');
      }
    }
  });

  /* Bauzeit schätzen: reines Bauen mit Material im Inventar, ohne Sammeln. */
  const SLOW = { piston: 1, hopper: 1, dust: 1, rail_cart: 1, trapdoor: 1, door: 1, stairs: 1, slab: 1, bed: 1, ladder: 1, wall_sign: 1, button: 1, chest: 1, gate: 1, rail: 1 };
  function estimateMinutes(def) {
    let sec = 0;
    def.cells.forEach((c) => {
      const d = MC.BLOCKS[c.id];
      if (!d || d.auto) return;
      if (d.entity) sec += 90;
      else if (d.shape === 'liquid') sec += 5;
      else if (SLOW[d.shape] || (d.tex && d.tex.front)) sec += 4.5;
      else sec += 2.2;
    });
    sec += def.size[1] * 30;
    const min = sec / 60 + (def.extraMin || 0);
    return Math.max(5, Math.round(min / 5) * 5);
  }

  /* Fertigstellen: verarbeitet alle Pläne, die noch keine Zellen haben (auch aus weiteren Dateien). */
  function finishAll() {
    for (const def of BUILDS) {
      if (def.cells) continue;
      const b = new Builder();
      def.build(b);
      const res = b.finish();
      def.cells = res.cells;
      def.size = res.size;
      def.minutes = estimateMinutes(def);
    }
  }
  finishAll();

  global.BUILDS = BUILDS;
  global.BP = { Builder, circle, finishAll };
})(window);
