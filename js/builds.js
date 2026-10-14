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

  /* Fertigstellen */
  for (const def of BUILDS) {
    const b = new Builder();
    def.build(b);
    const res = b.finish();
    def.cells = res.cells;
    def.size = res.size;
  }

  global.BUILDS = BUILDS;
})(window);
