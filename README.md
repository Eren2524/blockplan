# Blockplan

3D-Bauanleitungen für Minecraft: automatische Farmen und Gebäude, Ebene für Ebene zum 1:1-Nachbauen.
Gedacht für den zweiten Bildschirm oder das Handy, während du spielst.

## Starten

`index.html` im Browser öffnen. Es wird nichts installiert. Three.js und die Schriften liegen in `vendor/`,
die Seite braucht also kein Internet. Für den Offline-Modus (App installieren) einen Server nutzen:
`python3 -m http.server` im Ordner und dann `http://localhost:8000` öffnen.

**Veröffentlichen, Unterstützer-Abo, Rechtliches:** siehe [VEROEFFENTLICHEN.md](VEROEFFENTLICHEN.md).

## Funktionen

- **3D-Ansicht** mit drei Modi: *Alles*, *Bis Ebene* (bisher Gebautes + aktuelle Ebene), *Nur Ebene*
- **2D-Raster** pro Ebene, Norden oben, mit Koordinaten, Pfeilen für die Blickrichtung und der Ebene darunter als Orientierung
- **Platzierungshilfe**: Block antippen und du siehst, in welche Richtung du schauen musst (Kolben, Beobachter, Trichter, Treppen, Betten …)
- **Materialliste** pro Ebene und für den ganzen Bau, mit Stapeln (64er) und einer kopierbaren Einkaufsliste
- **Fortschritt**: Ebenen als fertig markieren, wird im Browser gespeichert
- **Kreativ-Test**: `/setblock`-Befehle für den ganzen Bau oder eine Ebene kopieren (Java Edition, als Datapack-Funktion)
- **Filter** nach Schwierigkeit und Suche
- **Bau-Video**: animiertes Tutorial, das den Bau Block für Block aufbaut, mit Hinweisen zu jeder Ebene (Taste `V`), dazu ein Link zu passenden YouTube-Tutorials
- **Bauzeit**: geschätzte Zeit fürs Platzieren (ohne Material sammeln) bei jedem Bau
- **Spielmodus**: große Weiter/Zurück-Tasten, Tastenkürzel (← → Leertaste), *Bildschirm an* hält Handy/Tablet wach
- **Drehen und Spiegeln**: jeden Bau um 90° drehen oder spiegeln, Raster, Hinweise und Exporte passen sich an
- **Export**: Litematica (`.litematic`, Hologramm im Spiel), WorldEdit (`.schem`) und fertiges Datapack (`.zip`)
- **Import**: eigene Bauten aus `.litematic`, `.schem` oder `.nbt` (Strukturblock) laden, auch per Drag & Drop
- **Teilen**: eigene Bauten als Link verschicken, ganz ohne Server
- **Merkliste**: Bauten merken und eine gemeinsame Einkaufsliste für mehrere Bauten kopieren
- **Sprachen**: Deutsch, Englisch, Spanisch, Französisch, Türkisch, Polnisch (alle Baupläne übersetzt)
- **Offline & App**: läuft ohne Internet und lässt sich auf dem Handy installieren
- **Unterstützer-Abo**: freiwillig, mit Unterstützer-Farben als Dankeschön (Links in `js/config.js`)

### Tastenkürzel

| Taste | Aktion |
| --- | --- |
| `→` / `Bild ↑` | nächste Ebene |
| `←` / `Bild ↓` | vorherige Ebene |
| `Leertaste` | Ebene fertig, weiter zur nächsten |
| `A` `B` `N` | Alles / Bis Ebene / Nur Ebene |
| `I` `T` `F` | Kamera schräg / oben / vorne |
| `R` | Kamera kreisen |
| `D` / `S` | Bau drehen / spiegeln |

## Enthaltene Baupläne

**Geheimhäuser** (versteckte Räume, Geheimgänge, Redstone und Farmen, `js/builds-secret.js`):
Agentenhaus (Bodenklappe, Geheimkeller, Kolben-Tresor, Zuckerrohrfarm), Wasserfall-Versteck (Höhle hinter dem
Wasserfall, Bambusfarm, Fahrstuhl), Brunnen-Bunker (Blasensäule in die Basis, Kürbis- und Eierfarm),
Teichhaus (Tür am Teichgrund, Aquarium-Raum, Bodenklappe, Bienenfarm, Nachtlicht).

**Mega-Bauten** (Gebäude mit eingebauten Farmen und Redstone, `js/builds-mega.js`):
Redstone-Villa, Bauernhof-Anwesen, Golem-Festung, Monsterturm-Festung, Fabrikhalle (Bambus heizt die Öfen),
Gelehrten-Bibliothek, Bienen-Gewächshaus, Party-Turm, Kolbentür-Bunker, Ranch, Steinmetz-Werkstatt, Vulkan-Schmiede.
Redstone-Techniken: Nachtlicht mit Tageslichtsensor, Kolbentür mit Hebel, Feuerwerk-Startrampe,
Notenblock-Klingel, Snack-Automat, Wasserfahrstühle, automatische Brennstoff-Zufuhr.

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
- Honigwabenfarm (Beobachter + Werfer mit Schere)
- Basalt-Generator, Stein-Generator
- Hühner-Brutstation (Beobachter-Uhr wirft Eier)
- Zuckerrohr-Großfarm (24 Pflanzen)

**Bauprojekte**: Netherportal, Leuchtfeuer-Pyramide, Handelshalle, Holzbrücke, Lagerraum, Wasserfahrstuhl, Eisstraße, Bahnstrecke

**Gebäude**: Starterhaus, Wachturm, Dorfbrunnen, Scheune, Leuchtturm, Windmühle, Modernes Haus,
Kastell, Fachwerkhaus, Gewächshaus-Kuppel, Pferdestall, Baumhaus

**Gebäude im Community-Stil** (eigene Entwürfe nach beliebten Bauideen, `js/builds-community.js`):
Taverne, Wikinger-Langhaus, Japanische Pagode, Japanisches Teehaus, Schmiede, Dorfkirche, Marktplatz,
Imkerei, Bootshaus mit Steg, Hobbit-Höhle, Magierturm, Torhaus, Bauernhof-Silo, Wüstenhaus, Iglu,
Strandhaus, Berghütte, Moderne Villa mit Pool, Bäckerei, Bibliothek, Rathaus, Holz-Wachturm,
Gartenpavillon, Springbrunnen, Unterwasser-Kuppel

## Eigene Baupläne hinzufügen

Pläne stehen in `js/builds*.js`. Ein Bau wird mit einem kleinen Builder beschrieben:

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

## Übersetzungen

Deutsch steht direkt im Code (`js/i18n.js`, Baupläne, Blöcke). Die anderen Sprachen liegen in `js/i18n/<code>.js`
und überschreiben nur die Texte. Fehlt ein Text, gilt: gewählte Sprache → Englisch → Deutsch.
Neue Sprache: Datei kopieren, übersetzen und in `LANGS` in `js/i18n.js` sowie in `sw.js` eintragen.

## Dateien

- `index.html`: Layout und Stil
- `js/config.js`: Version, Unterstützer-Links und -Codes, Link zu Impressum/Datenschutz
- `js/i18n.js`, `js/i18n/*.js`: Sprachen
- `js/formats.js`: NBT, Litematica, WorldEdit, Datapack-Zip, Import, Teilen-Links
- `sw.js`, `manifest.webmanifest`, `icons/`: Offline-Modus und App-Installation
- `legal.html`: Vorlage für Impressum und Datenschutz
- `vendor/`: Three.js r128 (MIT) und Schriften (SIL OFL)
- `.github/workflows/pages.yml`: veröffentlicht `main` automatisch auf GitHub Pages
- `tools/code-hash.js`: erzeugt Prüfsummen für Unterstützer-Codes
- `js/blocks.js`: Block-Registry, prozedurale Texturen, Platzierungshinweise
- `js/builds.js`: Farmen, Bauprojekte und die ersten Gebäude, Builder und Bauzeit-Schätzung
- `js/builds-community.js`: Gebäude im Community-Stil, weitere Farmen und Projekte, Dach-Helfer
- `js/builds-mega.js`: Mega-Bauten, setzt geprüfte Farm-Module in Gebäude ein
- `js/builds-secret.js`: Geheimhäuser mit Kolben-Tresor-Helfer
- `js/viewer.js`: 3D-Ansicht (Three.js r128)
- `js/app.js`: Oberfläche, 2D-Raster, Material, Fortschritt
