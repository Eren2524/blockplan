/* Blockplan – Sprachen. Deutsch ist eingebaut, weitere Sprachen liegen in js/i18n/<code>.js
   und werden bei Bedarf nachgeladen. Fehlt ein Text, gilt: gewählte Sprache → Englisch → Deutsch. */
(function (global) {
  'use strict';

  const LANGS = [
    { code: 'de', name: 'Deutsch' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'pl', name: 'Polski' }
  ];

  const DE = {
    dir: { n: 'Norden', s: 'Süden', e: 'Osten', w: 'Westen', u: 'oben', d: 'unten' },
    dirShort: { n: 'N', s: 'S', e: 'O', w: 'W', u: '↑', d: '↓' },
    ui: {
      'meta.description': '3D-Bauanleitungen für Minecraft-Farmen und Gebäude, Ebene für Ebene.',
      'top.builds': 'Bauten', 'top.buildsAria': 'Bauliste öffnen',
      'top.wake': 'Bildschirm an', 'top.wakeTitle': 'Verhindert, dass Handy oder Tablet beim Bauen ausgehen',
      'top.keys': 'Tasten', 'top.keysTitle': 'Tastenkürzel',
      'top.favs': 'Merkliste', 'top.favsTitle': 'Gemerkte Bauten und gemeinsame Einkaufsliste',
      'top.support': 'Unterstützen', 'top.supportTitle': 'Blockplan unterstützen',
      'top.lang': 'Sprache',
      'side.search': 'Farm oder Gebäude suchen', 'side.searchAria': 'Suchen',
      'side.diffAria': 'Nach Schwierigkeit filtern', 'side.favOnly': '★ Nur gemerkte',
      'side.import': 'Eigenen Bau importieren', 'side.importHint': '.litematic, .schem oder .nbt',
      'side.edition': 'Die Farmen sind für die Java Edition ausgelegt. Gebäude funktionieren in jeder Version.',
      'side.about': 'Über Blockplan', 'side.legal': 'Impressum & Datenschutz',
      'side.disclaimer': 'Kein offizielles Minecraft-Produkt. Nicht von Mojang oder Microsoft genehmigt oder mit ihnen verbunden.',
      'side.none': 'Kein Bau passt zu „{q}“.', 'side.noneDiff': 'Kein Bau mit dieser Schwierigkeit.', 'side.noneFav': 'Du hast noch nichts gemerkt. Tippe bei einem Bau auf ☆ Merken.',
      'cat.mine': 'Eigene Bauten', 'cat.secret': 'Geheimhäuser', 'cat.mega': 'Mega-Bauten', 'cat.farm': 'Automatische Farmen', 'cat.project': 'Bauprojekte', 'cat.building': 'Gebäude',
      'one.mine': 'Eigener Bau', 'one.secret': 'Geheimhaus', 'one.mega': 'Mega-Bau', 'one.farm': 'Automatische Farm', 'one.project': 'Bauprojekt', 'one.building': 'Gebäude',
      'diff.Leicht': 'Leicht', 'diff.Mittel': 'Mittel', 'diff.Fortgeschritten': 'Profi', 'diff.FortgeschrittenLong': 'Fortgeschritten',
      'ed.Alle Versionen': 'Alle Versionen', 'ed.Java & Bedrock': 'Java & Bedrock',
      'mode.aria': 'Ansicht', 'mode.all': 'Alles', 'mode.allTitle': 'Ganzer Bau (A)', 'mode.upto': 'Bis Ebene', 'mode.uptoTitle': 'Alle Ebenen bis zur aktuellen (B)', 'mode.only': 'Nur Ebene', 'mode.onlyTitle': 'Nur die aktuelle Ebene (N)',
      'cam.aria': 'Kamera', 'cam.iso': 'Schräg', 'cam.isoTitle': 'Schräg von oben (I)', 'cam.top': 'Oben', 'cam.topTitle': 'Von oben, Norden oben (T)', 'cam.front': 'Vorne', 'cam.frontTitle': 'Von Norden, meist die Eingangsseite (F)', 'cam.rotate': 'Kreisen', 'cam.rotateTitle': 'Kamera langsam kreisen lassen (R)', 'cam.video': '▶ Video', 'cam.videoTitle': 'Bau-Video abspielen (V)',
      'orient.aria': 'Bau ausrichten', 'orient.rot': '↻ 90°', 'orient.rotTitle': 'Bau um 90° im Uhrzeigersinn drehen (D)', 'orient.mirror': '⇋ Spiegeln', 'orient.mirrorTitle': 'Bau spiegeln, Osten und Westen tauschen (S)', 'orient.reset': 'Original',
      'orient.note': 'Der Bau ist {how}. Richtungen in den Texten beziehen sich auf das Original: Original-Norden zeigt jetzt nach {dir}. Raster, 3D-Ansicht, Hinweise und Exporte sind schon angepasst.',
      'orient.rotated': 'um {deg}° gedreht', 'orient.mirrored': 'gespiegelt', 'orient.and': ' und ',
      'hud.aria': 'Ebene wechseln', 'hud.prev': 'Ebene darunter', 'hud.next': 'Ebene darüber', 'hud.layer': 'Ebene (Y {y})', 'hud.done': 'Ebene fertig',
      'stage.hint': 'Ziehen: drehen · Scrollen: zoomen · Rechtsklick ziehen: verschieben · Block anklicken: Infos',
      'stage.viewport': '3D-Ansicht des Baus',
      'video.pause': 'Pause', 'video.play': 'Abspielen', 'video.again': 'Nochmal abspielen', 'video.track': 'Video-Fortschritt', 'video.speed': 'Geschwindigkeit', 'video.close': 'Video schließen',
      'video.layerOf': 'Ebene {y} von {max}', 'video.blocksHere': '{n} Blöcke auf dieser Ebene', 'video.now': 'Jetzt: {name}', 'video.done': 'Fertig!', 'video.doneNote': 'So sieht der fertige Bau aus. Schließe das Video und baue Ebene für Ebene nach.',
      'panel.fav': '☆ Merken', 'panel.faved': '★ Gemerkt',
      'stat.area': 'Grundfläche', 'stat.height': 'Höhe', 'stat.heightVal': '{n} Ebenen', 'stat.blocks': 'Blöcke', 'stat.time': 'Bauzeit', 'stat.version': 'Version',
      'stat.timeTitle': 'Geschätzt: nur Platzieren, mit allem Material im Inventar. Sammeln ist nicht eingerechnet.',
      'time.min': 'ca. {m} Min.', 'time.h': 'ca. {h} Std.', 'time.hm': 'ca. {h} Std. {m} Min.', 'time.short': '{m} Min.', 'time.shortH': '{h} h {m}',
      'prog.text': '{n} von {max} Ebenen gebaut', 'prog.reset': 'Fortschritt zurücksetzen', 'prog.resetDone': 'Fortschritt zurückgesetzt', 'prog.chips': 'Ebenen',
      'prog.layerTitle': 'Ebene {y}', 'prog.layerDone': 'Ebene {y} (fertig)', 'prog.next': 'Ebene {y} fertig. Weiter mit Ebene {n}.',
      'tab.layer': 'Ebene', 'tab.mats': 'Material', 'tab.how': "So funktioniert's",
      'layer.title': 'Ebene {y}', 'layer.blocks': '{n} Blöcke', 'layer.done': 'Ebene fertig',
      'layer.caption': 'Blick von oben, Norden ist oben. Blassere Felder zeigen die Ebene darunter. Feld antippen für Infos.',
      'layer.mats': 'Material für diese Ebene', 'layer.nothing': 'Auf dieser Ebene wird nichts platziert. Hier entsteht etwas von selbst.',
      'info.empty': 'Tippe auf einen Block im Raster oder in der 3D-Ansicht, um zu sehen, wie du ihn platzierst.',
      'info.dir': 'Richtung: {d}', 'info.top': 'obere Hälfte', 'info.bottom': 'untere Hälfte', 'info.auto': 'entsteht von selbst', 'info.mob': 'Kreatur',
      'mats.copy': 'Einkaufsliste kopieren', 'mats.copied': 'Einkaufsliste kopiert', 'mats.copyFail': 'Kopieren nicht möglich. Liste bitte abschreiben.', 'mats.mobs': 'Kreaturen',
      'mats.listHead': 'Blockplan: {name}',
      'exp.title': 'Export & Kreativ-Test',
      'exp.text': 'Lade den Bau als Datei herunter. Mit Litematica (Mod) siehst du ihn als Hologramm im Spiel, mit WorldEdit setzt du ihn per //paste ein. Die Exporte nutzen die aktuelle Ausrichtung.',
      'exp.litematic': 'Litematica (.litematic)', 'exp.schem': 'WorldEdit (.schem)', 'exp.datapack': 'Datapack (.zip)', 'exp.cmdAll': 'Befehle: ganzer Bau', 'exp.cmdLayer': 'Befehle: aktuelle Ebene',
      'exp.datapackText': 'Datapack: Zip in den Ordner „datapacks“ deiner Welt legen, im Spiel /reload und dann /function blockplan:{id}. Der Bau entsteht 2 Blöcke östlich von dir. Nur Java Edition 1.21+.',
      'exp.cmdCopied': '{n} Befehle kopiert', 'exp.cmdHead': '# Java Edition, Kreativmodus mit Cheats. Der Bau entsteht 2 Blöcke östlich von dir.', 'exp.saved': '{file} gespeichert', 'exp.fail': 'Export fehlgeschlagen: {msg}',
      'exp.layerSuffix': ' – Ebene {y}',
      'how.videoTitle': 'Video-Tutorial:', 'how.videoText': 'Sieh dir an, wie der Bau Block für Block entsteht, mit Hinweisen zu jeder Ebene.',
      'how.videoBtn': '▶ Bau-Video abspielen', 'how.yt': 'Tutorials auf YouTube', 'how.ytQuery': 'minecraft {name} tutorial deutsch',
      'how.community': 'Eigener Entwurf im Stil beliebter Community-Bauten.', 'how.how': 'Funktionsweise', 'how.tips': 'Tipps', 'how.legend': 'Zeichen im 2D-Raster',
      'how.edition': 'Ausgelegt für {ed}. Koordinaten sind relativ: Die Ecke ganz im Nordwesten unten ist X 0 · Y 0 · Z 0 (rot markiert).',
      'how.translated': 'Automatisch übersetzt. Blocknamen folgen den Namen im Spiel.',
      'leg.arrow': 'Pfeil: Blickrichtung / Ausgang', 'leg.updown': '⊗ nach unten, ⊙ nach oben', 'leg.stairs': 'Treppe: dunkel = niedrige Seite', 'leg.grows': 'Gestrichelt: wächst von selbst', 'leg.water': 'Wasserquelle (Eimer)', 'leg.flow': 'Fließt von selbst',
      'keys.title': 'Tastenkürzel', 'keys.next': 'Nächste Ebene', 'keys.prev': 'Vorherige Ebene', 'keys.home': 'Erste / letzte Ebene', 'keys.space': 'Ebene als fertig markieren', 'keys.modes': 'Alles / Bis Ebene / Nur Ebene', 'keys.cams': 'Kamera schräg / oben / vorne',
      'keys.rotate': 'Kamera kreisen an/aus', 'keys.video': 'Bau-Video starten/stoppen', 'keys.orient': 'Bau drehen / spiegeln', 'keys.esc': 'Auswahl aufheben', 'keys.pos1': 'Pos1', 'keys.end': 'Ende', 'keys.spaceKey': 'Leertaste', 'keys.pgup': 'Bild ↑', 'keys.pgdn': 'Bild ↓',
      'keys.tip': 'Tipp: Im Spiel mit F3 siehst du, in welche Richtung du schaust („Facing“). Norden ist in jedem Plan oben.',
      'common.close': 'Schließen', 'common.copy': 'Kopieren', 'common.delete': 'Löschen', 'common.cancel': 'Abbrechen',
      'wake.on': 'Bildschirm bleibt an', 'wake.fail': 'Dieses Gerät erlaubt das nicht. Stell die Bildschirmsperre in den Einstellungen länger.',
      'fav.title': 'Merkliste', 'fav.empty': 'Noch nichts gemerkt. Öffne einen Bau und tippe auf ☆ Merken.',
      'fav.total': 'Gemeinsame Einkaufsliste', 'fav.totalHint': 'Alles, was du für die angehakten Bauten brauchst, zusammengezählt.', 'fav.copy': 'Gesamtliste kopieren', 'fav.open': 'Öffnen', 'fav.remove': 'Entfernen', 'fav.added': 'Zur Merkliste hinzugefügt', 'fav.removed': 'Von der Merkliste entfernt',
      'fav.listHead': 'Blockplan: Einkaufsliste für {n} Bauten',
      'imp.title': 'Eigenen Bau importieren', 'imp.reading': 'Datei wird gelesen …', 'imp.ok': '„{name}“ importiert: {n} Blöcke', 'imp.fail': 'Import fehlgeschlagen: {msg}', 'imp.tooBig': 'Der Bau ist zu groß ({n} Blöcke). Erlaubt sind bis zu {max}.',
      'imp.unknownFormat': 'Unbekanntes Format. Unterstützt: .litematic, .schem, .schematic (Sponge), .nbt (Strukturblock).', 'imp.empty': 'In der Datei sind keine Blöcke.',
      'imp.unknownBlocks': '{n} Blocksorten kennt Blockplan noch nicht. Sie werden grau mit ihrem Namen angezeigt.',
      'imp.desc': 'Importiert aus {file}. Eigene Bauten bleiben nur in diesem Browser gespeichert.', 'imp.tagline': 'Importiert · {n} Blöcke', 'imp.notStored': 'Zu groß für den Browser-Speicher. Der Bau bleibt nur bis zum Neuladen.',
      'imp.delete': 'Eigenen Bau löschen', 'imp.deleted': 'Bau gelöscht', 'imp.confirm': '„{name}“ wirklich löschen?',
      'share.btn': 'Link teilen', 'share.copied': 'Link kopiert. Wer ihn öffnet, sieht deinen Bau.', 'share.tooLong': 'Der Bau ist zu groß für einen Link. Teile lieber die Datei.', 'share.loaded': 'Geteilter Bau geladen: {name}', 'share.bad': 'Dieser Link ist beschädigt.',
      'sup.title': 'Blockplan unterstützen',
      'sup.text': 'Alle Baupläne bleiben kostenlos. Mit einem kleinen Unterstützer-Abo hilfst du, dass neue Farmen und Gebäude dazukommen. Als Dankeschön gibt es Unterstützer-Farben und ein Abzeichen.',
      'sup.month': '/ Monat', 'sup.notReady': 'Die Zahlung ist noch nicht eingerichtet.', 'sup.codeLabel': 'Unterstützer-Code', 'sup.codePh': 'Code eingeben', 'sup.codeBtn': 'Freischalten',
      'sup.codeOk': 'Danke für deine Unterstützung! Farben freigeschaltet.', 'sup.codeBad': 'Dieser Code passt nicht.', 'sup.themes': 'Unterstützer-Farben', 'sup.badge': 'Unterstützer',
      'sup.where': 'Den Code bekommst du nach der Zahlung auf der Unterstützer-Seite.',
      'about.title': 'Über Blockplan',
      'about.text': 'Blockplan zeigt Farmen und Gebäude als 3D-Bauanleitung, Ebene für Ebene. Die Seite funktioniert auch offline und lässt sich auf dem Handy wie eine App installieren.',
      'about.privacy': 'Blockplan speichert Fortschritt, Merkliste und eigene Bauten nur in deinem Browser. Es gibt keine Konten, kein Tracking und keine Werbung.',
      'about.version': 'Version {v}', 'about.install': 'Als App installieren', 'about.installed': 'Blockplan ist installiert.', 'about.offline': 'Offline bereit',
      'theme.default': 'Standard', 'theme.emerald': 'Smaragd', 'theme.diamond': 'Diamant', 'theme.gold': 'Gold', 'theme.amethyst': 'Amethyst', 'theme.nether': 'Nether',
      'err.three': 'Die 3D-Bibliothek konnte nicht geladen werden. Lade die Seite neu.',
      'lang.loading': 'Sprache wird geladen …', 'lang.fail': 'Sprache konnte nicht geladen werden.'
    },
    hints: {
      front: { u: 'Vorderseite nach oben: beim Platzieren steil nach unten schauen.', d: 'Vorderseite nach unten: von unten platzieren und steil nach oben schauen.', h: 'Vorderseite zeigt nach {f}: beim Platzieren nach {o} schauen.' },
      piston: { u: 'Kolbenkopf zeigt nach oben: beim Platzieren nach unten schauen.', d: 'Kolbenkopf zeigt nach unten: beim Platzieren nach oben schauen.', h: 'Kolbenkopf zeigt nach {f}. Stell dich auf die {f}-Seite und schau nach {o}.' },
      observer: { d: 'Gesicht schaut nach unten, roter Punkt nach oben: beim Platzieren nach unten schauen.', u: 'Gesicht schaut nach oben, roter Punkt nach unten: beim Platzieren nach oben schauen.', h: 'Gesicht schaut nach {f}, roter Punkt nach {o}. Beim Platzieren nach {f} schauen.' },
      hopper: { d: 'Ausgang nach unten: einfach von oben auf den Block darunter setzen.', h: 'Ausgang zeigt nach {f}: Shift + Rechtsklick auf die Seite des Zielblocks im {f}.' },
      stairs: { h: 'Hohe Seite nach {f}: beim Platzieren nach {f} schauen.', topAdd: ' Umgedreht: die obere Hälfte eines Blocks anklicken.' },
      slab: { top: 'Obere Hälfte: an die obere Hälfte eines Blocks klicken.', bottom: 'Untere Hälfte: auf den Boden setzen.' },
      dirt_path: 'Mit einer Schaufel auf Gras rechtsklicken.',
      farmland: 'Erde hinlegen und mit einer Hacke umgraben.',
      oak_log: 'Stehend platzieren (auf die Oberseite des Blocks darunter klicken).',
      spruce_log: 'Stehend platzieren (auf die Oberseite des Blocks darunter klicken).',
      oak_door: 'Tür: beim Platzieren nach {f} schauen (Türblatt auf der {o}-Seite).',
      ladder: 'Leiter an der Wand im {o} anbringen (zeigt nach {f}).',
      water: 'Mit einem Wassereimer platzieren (Quellblock).',
      water_env: 'Vorhandenes Wasser: Baue diesen Teil einfach in einem Fluss, See oder Meer.',
      water_flow: 'Entsteht von selbst aus den Quellen. Nicht platzieren.',
      lava: 'Mit einem Lavaeimer platzieren, erst wenn alle Schilder hängen.',
      chest: { base: 'front', add: ' Zwei Truhen nebeneinander werden zur Doppeltruhe.' },
      dispenser: { base: 'front', add: ' Einen Wassereimer hineinlegen.' },
      redstone: 'Redstone auf den Block darunter streuen.',
      stone_button: 'Knopf an der Wand im {o} anbringen (zeigt nach {f}).',
      oak_wall_sign: 'Schild an der Wand im {o} anbringen (zeigt nach {f}). Text leer lassen (Esc).',
      rail_cart: 'Zuerst die Schiene, dann eine Trichterlore daraufsetzen. Die Lore bleibt stehen, weil die Enden blockiert sind.',
      red_bed: 'Kopfteil zeigt nach {f}: nach {f} schauen und auf das Fußende klicken.',
      sugar_cane: 'Auf die Erde pflanzen (Wasser muss direkt daneben liegen).',
      sugar_cane_auto: 'Wächst von selbst nach. Nicht platzieren.',
      pumpkin_stem: 'Kerne auf den Ackerboden pflanzen.',
      pumpkin_auto: 'Hier wächst der Kürbis. Der Platz muss frei bleiben.',
      wheat: 'Weizenkörner auf den Ackerboden pflanzen.',
      villager: 'Dorfbewohner hierher bringen, z. B. mit Boot oder Lore. Kinder zählen nicht.',
      zombie: 'Zombie hierher locken und mit einem Namensschild benennen, damit er nicht verschwindet.',
      chicken: 'Eier in das Gehege werfen, bis Küken schlüpfen.',
      bamboo: 'Bambus auf die Erde pflanzen.',
      bamboo_auto: 'Wächst von selbst nach. Nicht platzieren.',
      oak_trapdoor: 'Auf die untere Hälfte der Blockseite im {o} klicken, dann rechtsklicken, damit sie offen an der Wand steht.',
      cauldron: 'Direkt unter die Spitze des Tropfsteins stellen. Später mit einem leeren Eimer ernten.',
      pointed_dripstone: 'Von unten an den Block kleben (an die Unterseite klicken), Spitze zeigt nach unten.',
      obsidian: 'Nur mit einer Diamant- oder Netheritspitzhacke abbaubar. Alternativ Wasser auf Lavaquellen gießen.',
      nether_portal: 'Mit Feuerzeug den Rahmen innen anzünden. Das Portal entsteht von selbst.',
      iron_block: 'Geht auch mit Gold-, Smaragd-, Diamant- oder Netheritblöcken, auch gemischt.',
      beacon: 'In die Mitte oben setzen. Darüber muss freier Himmel sein (Glas ist erlaubt).',
      lectern: 'Arbeitsplatz für Bibliothekare.',
      composter: 'Arbeitsplatz für Bauern.',
      blast_furnace: { base: 'front', add: ' Arbeitsplatz für Rüstungsschmiede.' },
      fletching_table: 'Arbeitsplatz für Pfeilmacher (Smaragde für Stöcke).',
      smithing_table: 'Arbeitsplatz für Werkzeugschmiede.',
      oak_trapdoor_closed: 'Geschlossene Falltür in der oberen Blockhälfte: von unten an die obere Hälfte klicken. Sieht aus wie Holzboden.',
      stone_env: 'Vorhandener Fels oder Berg. Am besten grabst du den Bau in einen echten Berg, dann sparst du diese Blöcke.',
      grass_env: 'Vorhandener Boden. Nur nachbauen, wenn er fehlt.',
      redstone_lamp: 'Leuchtet, sobald sie Strom bekommt (hier: nachts über den Tageslichtsensor).',
      daylight_detector: 'Nach dem Setzen einmal rechtsklicken: Er wird blau und gibt dann nachts Strom ab.',
      note_block: 'Der Block darüber muss frei bleiben, sonst bleibt er stumm. Rechtsklick ändert den Ton.',
      lever: 'Hebel an die Wand im {o} setzen. Hebel an = Tür zu, Hebel aus = Tür offen.',
      piston_head: 'So sieht es aus, wenn der Kolben ausgefahren ist. Nicht platzieren.',
      stonecutter: 'Macht aus Stein Stufen, Treppen und Ziegel ohne Verlust.',
      anvil: 'Amboss: Lange Seite zeigt quer zu deiner Blickrichtung.',
      bell: 'Auf den Block darunter setzen.',
      beehive: 'Eingang zeigt nach {f}, davor muss frei sein. Mit Bienen drin: Bienennest mit Behutsamkeit abbauen oder Bienen mit Blumen anlocken.',
      soul_soil: 'Gibt es im Seelensandtal im Nether.',
      soul_sand: 'Erzeugt im Wasser darüber eine Blasensäule nach oben.',
      magma_block: 'Erzeugt im Wasser darüber eine Blasensäule nach unten.',
      blue_ice: 'Aus 9 Packeis herstellen oder in Eisbergen finden.',
      basalt_auto: 'Hier entsteht Basalt. Abbauen, er bildet sich sofort neu.',
      stone_auto: 'Hier entsteht Stein. Mit Behutsamkeit bekommst du Stein, sonst Bruchstein.',
      powered_rail: 'Wird durch den Redstone-Block darunter dauerhaft angetrieben.',
      spruce_fence_gate: 'Zauntor: beim Platzieren nach {f} oder {o} schauen.',
      cobble_auto: 'Hier entsteht der Bruchstein. Abbauen, er bildet sich sofort neu.',
      imported: 'Importierter Block. Blockplan kennt ihn noch nicht genau: Richtung und Form bitte im Original prüfen.'
    }
  };

  const dict = { de: DE };
  const listeners = [];
  let lang = 'de';

  function merge(a, b) {
    for (const k in b) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) merge(a[k], b[k]);
      else a[k] = b[k];
    }
    return a;
  }
  function add(code, part) { dict[code] = merge(dict[code] || {}, part); }
  const chain = () => [lang, 'en', 'de'].filter((c, i, a) => a.indexOf(c) === i && dict[c]);
  function look(section, key) {
    for (const c of chain()) { const s = dict[c][section]; if (s && s[key] != null) return s[key]; }
    return null;
  }
  function fmt(s, vars) {
    if (!vars) return s;
    return polish(s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)));
  }
  /* Kleine Grammatik-Korrekturen nach dem Einsetzen von Richtungen */
  function polish(s) {
    if (lang === 'fr') {
      s = s.replace(/\b(vers|de|à) le (est|ouest)\b/g, (m, p, d) => (p === 'de' ? "de l'" : p === 'à' ? "à l'" : "vers l'") + d)
        .replace(/\bdu (est|ouest)\b/g, "de l'$1").replace(/\bau (est|ouest)\b/g, "à l'$1").replace(/\ble (est|ouest)\b/g, "l'$1");
    }
    return s;
  }
  function sentence(s) {
    return polish(s).replace(/(^|[.!?] )(\p{Ll})/gu, (m, a, b) => a + b.toLocaleUpperCase(lang));
  }
  function t(key, vars) { const s = look('ui', key); return fmt(s == null ? key : s, vars); }
  function has(key) { return look('ui', key) != null; }

  function detect() {
    let saved = null;
    try { saved = localStorage.getItem('blockplan.lang'); } catch (e) { /* kein Speicher */ }
    if (saved && LANGS.some((l) => l.code === saved)) return saved;
    const nav = (navigator.languages || [navigator.language || 'de']).map((x) => String(x).slice(0, 2).toLowerCase());
    return nav.find((c) => LANGS.some((l) => l.code === c)) || 'en';
  }

  function load(code) {
    if (dict[code] && dict[code].ready) return Promise.resolve();
    if (code === 'de') return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'js/i18n/' + code + '.js';
      s.onload = () => { (dict[code] = dict[code] || {}).ready = true; res(); };
      s.onerror = () => rej(new Error('lang ' + code));
      document.head.append(s);
    });
  }

  async function set(code) {
    if (!LANGS.some((l) => l.code === code)) code = 'de';
    // Englisch ist die Rückfallsprache für alle anderen
    if (code !== 'de' && code !== 'en') { try { await load('en'); } catch (e) { /* weiter */ } }
    await load(code);
    lang = code;
    try { localStorage.setItem('blockplan.lang', code); } catch (e) { /* kein Speicher */ }
    document.documentElement.lang = code;
    listeners.forEach((fn) => fn(code));
  }

  /* Bau-Texte: build(b, 'name'), Arrays für how/tips, Objekt für layerNotes */
  function build(b, field) {
    if (b.custom) return b[field];
    for (const c of chain()) {
      if (c === 'de') break;
      const d = dict[c].builds && dict[c].builds[b.id];
      if (d && d[field] != null) return d[field];
    }
    return b[field];
  }
  function translated(b) { return !b.custom && lang !== 'de' && !!(dict[lang] && dict[lang].builds && dict[lang].builds[b.id]); }
  function block(id, fallback) { return look('blocks', id) || fallback; }
  function item(name) { return look('items', name) || name; }

  global.I18N = {
    LANGS, add, t, has, set, load, build, block, item, translated, fmt, sentence,
    hint: (k) => look('hints', k),
    dir: (d) => look('dir', d) || d,
    dirShort: (d) => look('dirShort', d) || d,
    get lang() { return lang; },
    detect, onChange: (fn) => listeners.push(fn)
  };
})(window);
