/* Erzeugt die Prüfsumme für einen Unterstützer-Code.
   Aufruf: node tools/code-hash.js MEINCODE
   Die ausgegebene Zeile in js/config.js unter supporterCodes eintragen. */
const crypto = require('crypto');
const code = (process.argv[2] || '').trim().toUpperCase().replace(/\s+/g, '');
if (!code) { console.error('Bitte einen Code angeben, z. B.: node tools/code-hash.js DIAMANT2026'); process.exit(1); }
console.log("'" + crypto.createHash('sha256').update(code).digest('hex') + "',");
