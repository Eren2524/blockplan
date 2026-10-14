# Blockplan

3D-Bauanleitungen für Minecraft: automatische Farmen und Gebäude, Ebene für Ebene zum 1:1-Nachbauen.
Gedacht für den zweiten Bildschirm oder das Handy, während du spielst.

## Starten

`index.html` im Browser öffnen. Es wird nichts installiert. Three.js kommt per CDN, daher braucht die Seite Internet.
Wer lieber einen lokalen Server nutzt: `python3 -m http.server` im Ordner und dann `http://localhost:8000` öffnen.

## Funktionen

- **3D-Ansicht** mit drei Modi: *Alles*, *Bis Ebene* (bisher Gebautes + aktuelle Ebene), *Nur Ebene*
- **2D-Raster** pro Ebene, Norden oben, mit Koordinaten, Pfeilen für die Blickrichtung und der Ebene darunter als Orientierung
- **Platzierungshilfe**: Block antippen und du siehst, in welche Richtung du schauen musst (Kolben, Beobachter, Trichter, Treppen, Betten …)
- **Materialliste** pro Ebene und für den ganzen Bau, mit Stapeln (64er) und einer kopierbaren Einkaufsliste
- **Fortschritt**: Ebenen als fertig markieren, wird im Browser gespeichert
- **Spielmodus**: große Weiter/Zurück-Tasten, Tastenkürzel (← → Leertaste), *Bildschirm an* hält Handy/Tablet wach

### Tastenkürzel

| Taste | Aktion |
| --- | --- |
| `→` / `Bild ↑` | nächste Ebene |
| `←` / `Bild ↓` | vorherige Ebene |
| `Leertaste` | Ebene fertig, weiter zur nächsten |
| `A` `B` `N` | Alles / Bis Ebene / Nur Ebene |
| `I` `T` `F` | Kamera schräg / oben / vorne |
| `R` | Drehen |

## Enthaltene Baupläne

**Automatische Farmen** (Mechanik für Java Edition ausgelegt)

- Zuckerrohrfarm (Beobachter + Kolben, Trichterloren)
- Kürbis- & Melonenfarm
- Eisenfarm (Panik-Mechanik, Lava-Klinge)
- Eierfarm
- Weizenfarm mit Knopf (Wasserspülung)
- Automatische Schmelze (4 Öfen)
- Bambusfarm (Brennstoff für die Schmelze)
- Mob-Fallturm (30 Blöcke Fall, Beute in Truhen)
- Lavafarm (Tropfstein + Kessel)
- Bruchstein-Generator

**Gebäude**: Starterhaus, Wachturm, Dorfbrunnen, Scheune, Leuchtturm, Netherportal,
Leuchtfeuer-Pyramide, Handelshalle, Windmühle, Modernes Haus, Holzbrücke

## Eigene Baupläne hinzufügen

Alle Pläne stehen in `js/builds.js`. Ein Bau wird mit einem kleinen Builder beschrieben:

```js
BUILDS.push({
  id: 'mein-bau', cat: 'building', name: 'Mein Bau', tagline: 'Kurzbeschreibung',
  difficulty: 'Leicht', edition: 'Alle Versionen', description: '…',
  how: [], tips: [], layerNotes: { 0: 'Text zu Ebene 0' },
  build(b) {
    b.fill(0, 0, 0, 4, 0, 4, 'cobblestone');        // Quader füllen
    b.walls(0, 1, 0, 4, 3, 4, 'oak_planks');        // nur die Außenwände
    b.set(2, 1, 0, 'oak_door:s:lower');             // einzelner Block mit Richtung
  }
});
```

Koordinaten: `x` = Osten, `y` = oben, `z` = Süden, wie in Minecraft. Richtungen: `n s e w u d`.
Zusätze: `top`/`bottom` (Stufen, Treppen), `upper`/`lower` (Türen), `head`/`foot` (Betten).
Verfügbare Blöcke, Texturen und Platzierungshinweise stehen in `js/blocks.js`.

## Dateien

- `index.html`: Layout und Stil
- `js/blocks.js`: Block-Registry, prozedurale Texturen, Platzierungshinweise
- `js/builds.js`: alle Baupläne
- `js/viewer.js`: 3D-Ansicht (Three.js r128)
- `js/app.js`: Oberfläche, 2D-Raster, Material, Fortschritt
