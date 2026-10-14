# Blockplan veröffentlichen und Unterstützer-Abos einrichten

Diese Anleitung führt dich Schritt für Schritt von deinem Repo zu einer öffentlichen Seite mit kleinen Abos.
Rechnen solltest du mit etwa einem Nachmittag.

## 1. Seite online stellen (kostenlos, GitHub Pages)

1. Den Pull Request auf GitHub mergen (Button **Merge pull request**).
2. Im Repo **Settings → Pages** öffnen.
3. Bei **Build and deployment → Source** die Option **GitHub Actions** wählen.
4. Unter **Actions** startet jetzt „Blockplan auf GitHub Pages veröffentlichen“. Nach 1–2 Minuten ist die Seite da:
   `https://eren2524.github.io/game/`
5. Tipp: Benenne das Repo unter **Settings → General** in `blockplan` um. Dann lautet die Adresse
   `https://eren2524.github.io/blockplan/`.

Jeder neue Merge in `main` aktualisiert die Seite automatisch. Danach in `sw.js` die Versionsnummer erhöhen,
damit Besucher die neue Version bekommen.

### Eigene Adresse (optional, ca. 10 € im Jahr)

`blockplan.com` ist schon vergeben. `blockplan.shop` und `blockplan.store` waren bei der Prüfung frei.
Domain bei einem Anbieter deiner Wahl kaufen, dann unter **Settings → Pages → Custom domain** eintragen
und beim Anbieter einen CNAME-Eintrag auf `eren2524.github.io` setzen. Die Anleitung von GitHub zeigt die Details.

## 2. Name „Blockplan“

- Meine Suche hat keine App und kein Tool mit dem Namen „Blockplan“ für Minecraft gefunden.
  Es gibt eine Mod namens „Block Planner“, die ist aber etwas anderes.
- Eine Websuche ersetzt keine Markenrecherche. Prüfe selbst kostenlos:
  - **DPMA** (deutsche Marken): register.dpma.de → DPMAregister → Marken
  - **EUIPO / TMview** (EU-weit): tmdn.org/tmview
  - Suche dort nach „Blockplan“ in den Klassen 9 (Software) und 42 (Online-Dienste).
- Eine eigene Marke anmelden kostet beim DPMA ab 290 €. Für den Start ist das nicht nötig.

## 3. Was Mojang erlaubt (wichtig, bevor du Geld nimmst)

Lies die offiziellen **Minecraft Usage Guidelines**: https://www.minecraft.net/en-us/usage-guidelines

Kurz zusammengefasst:
- Kein „Minecraft“ im Namen, kein offizielles Logo. Die Seite darf nicht offiziell wirken.
  Der Hinweis „Kein offizielles Minecraft-Produkt …“ ist schon eingebaut.
- Für Minecraft-Inhalte selbst Geld zu verlangen, ist heikel. Deshalb ist Blockplan so gebaut:
  **Alle Baupläne und Funktionen bleiben kostenlos.** Das Abo ist eine freiwillige Unterstützung.
  Als Dankeschön gibt es nur Extras ohne Spielbezug: Unterstützer-Farben und ein Abzeichen.
- Sperre also keine Baupläne hinter dem Abo. Damit bist du auf der sicheren Seite.

## 4. Unterstützer-Abo einrichten

### Anbieter wählen

Am einfachsten sind Plattformen, die Zahlungen, Rechnungen und Abos für dich erledigen:

| Anbieter | Gut für |
| --- | --- |
| **Ko-fi** (ko-fi.com) | Einfach, Mitgliedschaften und einmalige Spenden, Auszahlung über PayPal/Stripe |
| **Patreon** (patreon.com) | Bekannt bei Minecraft-Creatorn, Beiträge nur für Unterstützer |
| **Steady** (steadyhq.com) | Deutscher Anbieter, gut für Abos im deutschsprachigen Raum |

Vergleiche die Gebühren auf den Seiten der Anbieter, sie ändern sich.

**Wichtig:** Diese Anbieter verlangen meist, dass du volljährig bist. Bist du jünger als 18,
muss ein Elternteil das Konto anlegen und auszahlen lassen.

### Stufen anlegen

Lege beim Anbieter drei Mitgliedschaften an, passend zu `js/config.js`:

| Stufe | Preis | Idee |
| --- | --- | --- |
| Stein | 1,99 € / Monat | Dankeschön, Unterstützer-Farben |
| Eisen | 3,99 € / Monat | Zusätzlich: Wunschbau vorschlagen |
| Diamant | 6,99 € / Monat | Zusätzlich: Name in den Danksagungen |

Dann in `js/config.js` die Links eintragen:

```js
support: {
  page: 'https://ko-fi.com/DEINNAME',
  tiers: [
    { id: 'stein', name: 'Stein', price: '1,99 €', url: 'https://ko-fi.com/DEINNAME/tiers' },
    ...
  ]
}
```

### Unterstützer-Code

So schalten Unterstützer die Farben frei, ganz ohne Server:

1. Denk dir einen Code aus, z. B. `DIAMANT2026`.
2. Im Repo-Ordner ausführen: `node tools/code-hash.js DIAMANT2026`
3. Die ausgegebene Zeile in `js/config.js` bei `supporterCodes: [ ... ]` eintragen.
4. Den Code in einem Beitrag **nur für Unterstützer** beim Anbieter posten.
5. Ab und zu einen neuen Code hinzufügen.

Der Code wird nur im Browser geprüft. Wer sich auskennt, kann ihn umgehen.
Das ist in Ordnung, weil nur Farben freigeschaltet werden und keine Inhalte.

## 5. Rechtliches in Deutschland

Sobald du Geld annimmst, gilt die Seite als geschäftsmäßig:

1. **Impressum und Datenschutz:** `legal.html` ist eine Vorlage. Alles in [eckigen Klammern] ausfüllen
   (Name, Anschrift, E-Mail). Bei Minderjährigen: mit den Eltern klären, wessen Angaben dort stehen.
2. **Steuern:** Regelmäßige Einnahmen aus Abos sind meist ein Gewerbe. Gewerbeanmeldung beim Ordnungsamt
   (ca. 20–60 €), bei kleinen Umsätzen hilft die Kleinunternehmerregelung (§ 19 UStG).
   Unter 18 braucht ein Gewerbe die Zustimmung der Eltern und des Familiengerichts.
   Frag im Zweifel beim Finanzamt oder bei einer Steuerberatung nach.
3. **Datenschutz ist schon gelöst:** Schriften und 3D-Bibliothek liegen jetzt im Repo. Die Seite lädt nichts
   von Google oder anderen Servern und setzt keine Cookies.

Dies ist keine Rechtsberatung. Lass die Texte im Zweifel prüfen.

## 6. Bekannt machen

- Ein kurzes Video: Du baust eine Farm mit Blockplan auf dem Handy nach (YouTube Shorts, TikTok).
- Beiträge in r/Minecraft, r/technicalminecraft, r/redstone und Minecraft-Discords.
  Lies vorher die Regeln, viele erlauben Eigenwerbung nur an bestimmten Tagen.
- Den Link „Link teilen“ bei eigenen Bauten nutzen: So zeigen Spieler ihre Bauten anderen.
