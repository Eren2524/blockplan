/* Blockplan – Einstellungen für die Veröffentlichung. Hier trägst du deine Links ein,
   alles andere funktioniert ohne Änderung. Anleitung: VEROEFFENTLICHEN.md */
window.BLOCKPLAN_CONFIG = {
  version: '2.0.0',

  /* Unterstützer-Abo: Trage die Bezahl-Links deines Anbieters ein (z. B. Ko-fi, Patreon, Steady).
     Leere Links blenden die Stufe als „noch nicht eingerichtet“ ein. */
  support: {
    page: '',
    tiers: [
      { id: 'stein', name: 'Stein', price: '1,99 €', url: '' },
      { id: 'eisen', name: 'Eisen', price: '3,99 €', url: '' },
      { id: 'diamant', name: 'Diamant', price: '6,99 €', url: '' }
    ]
  },

  /* Unterstützer-Codes als SHA-256-Prüfsummen (Großbuchstaben, ohne Leerzeichen).
     Neuen Code erzeugen: node tools/code-hash.js MEINCODE
     Den Code selbst gibst du deinen Unterstützern (z. B. in einem Beitrag nur für Unterstützer). */
  supporterCodes: [],

  /* Rechtliches: Impressum und Datenschutz (Pflicht in Deutschland, sobald du Geld annimmst). */
  legalUrl: 'legal.html'
};
