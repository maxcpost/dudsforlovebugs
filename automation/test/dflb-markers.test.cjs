// Dry-run every region the Apps Script replaces against the dflb/ pages —
// proves a Sheet sync can never hit "missing marker pair". Run from repo root.
const fs = require('fs');
const { replaceRegion } = require('../apps-script/render.js');
const checks = [
  ['dflb/index.html', ['sale-dates', 'sale-dates2', 'event-jsonld']],
  ['dflb/schedule/index.html', ['sale-dates', 'schedule', 'flyer']],
];
let fail = 0;
for (const [path, regions] of checks) {
  const html = fs.readFileSync(path, 'utf8');
  for (const r of regions) {
    try { replaceRegion(html, r, 'X'); console.log(`PASS ${path} ${r}`); }
    catch (e) { console.error(`FAIL ${path} ${r}: ${e.message}`); fail++; }
  }
}
process.exit(fail ? 1 : 0);
