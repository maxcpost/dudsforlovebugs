// WCAG AA check for every text/bg pair the dflb/ design uses.
const pairs = [
  // [fg, bg, minRatio, label]
  ['#231F2E', '#FFFFFF', 4.5, 'ink on white'],
  ['#4A4458', '#FFFFFF', 4.5, 'body on white'],
  ['#231F2E', '#FFFBF7', 4.5, 'ink on cream'],
  ['#4A4458', '#FFFBF7', 4.5, 'body on cream'],
  ['#FFFFFF', '#C7256E', 4.5, 'white on deep pink (--dflb-pop, chips, buttons)'],
  ['#FFFFFF', '#0273AE', 4.5, 'white on deep sky'],
  ['#FFFFFF', '#6D28D9', 4.5, 'white on deep purple'],
  ['#FFFFFF', '#047857', 4.5, 'white on deep green'],
  ['#92600A', '#FFFFFF', 4.5, 'deep amber text on white'],
  ['#231F2E', '#FBBF24', 4.5, 'ink on sunshine (banner text)'],
  ['#231F2E', '#F472B6', 4.5, 'ink on bright pink (banner text)'],
  ['#231F2E', '#38BDF8', 4.5, 'ink on bright sky (banner text)'],
  ['#231F2E', '#A78BFA', 4.5, 'ink on bright purple (banner text)'],
  ['#231F2E', '#34D399', 4.5, 'ink on bright mint (banner text)'],
];
function lum(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
let fail = 0;
for (const [fg, bg, min, label] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: ${r.toFixed(2)} (need ${min})`);
}
if (fail) { console.error(fail + ' pair(s) below AA'); process.exit(1); }
console.log('All palette pairs pass WCAG AA.');
