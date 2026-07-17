// WCAG AA check for every text/bg pair the dflb/ design uses.
// System: bright candy backgrounds carry INK text (vibrancy + AA).
// Exception: the injected schedule chips/badges use white on --dflb-pop
// (#FF1F9C) at ~3.5:1 — AA only for large/bold text; the owner explicitly
// chose neon vibrancy over 4.5:1 there (same call as the old site's buttons).
const pairs = [
  // [fg, bg, minRatio, label]
  ['#231F2E', '#FFFFFF', 4.5, 'ink on white'],
  ['#4A4458', '#FFFFFF', 4.5, 'body on white'],
  ['#231F2E', '#FFFBF7', 4.5, 'ink on cream'],
  ['#4A4458', '#FFFBF7', 4.5, 'body on cream'],
  // bright candy surfaces with ink text (buttons, banners, steps, gradient)
  ['#231F2E', '#FF3DAE', 4.5, 'ink on hot pink'],
  ['#231F2E', '#18C1FF', 4.5, 'ink on electric sky'],
  ['#231F2E', '#AB84FF', 4.5, 'ink on vivid purple'],
  ['#231F2E', '#1FE39F', 4.5, 'ink on bright mint'],
  ['#231F2E', '#FFD60A', 4.5, 'ink on sunshine'],
  // deep shades now used only as TEXT on white (links, eyebrows)
  ['#C7256E', '#FFFFFF', 4.5, 'deep pink text on white (links)'],
  ['#0273AE', '#FFFFFF', 4.5, 'deep sky text on white (eyebrows)'],
  ['#6D28D9', '#FFFFFF', 4.5, 'deep purple text on white (eyebrows)'],
  ['#047857', '#FFFFFF', 4.5, 'deep green text on white (eyebrows)'],
  ['#92600A', '#FFFFFF', 4.5, 'deep amber text on white (eyebrows)'],
  // neon pop — large/bold text only (injected date chips, badges)
  ['#FFFFFF', '#FF1F9C', 3.0, 'white on neon pop (large/bold only)'],
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
console.log('All palette pairs pass their thresholds.');
