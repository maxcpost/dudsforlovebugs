// Verbatim-content check: every piece of visible copy on each new-site root
// page must appear, unchanged, in the matching dflb/ page. Rewording or
// dropping content fails; added UI chrome (carousel buttons etc.) is allowed.
// Also: "mysalemanager" may never appear in dflb/ visible text. Run from repo root.
const fs = require('fs');

const SLUGS = ['', 'schedule', 'consign', 'registration', 'what-can-i-sell',
  'tagging-merchandise', 'vip-tagging', 'purple-play-rack-ppr', 'volunteering',
  'donate', 'vendors', 'gallery', 'contact'];

// Old-page text that intentionally has no counterpart in the fresh site:
// the Safe/Bold comparison switcher, plus the owner-approved homepage hero
// trim (2026-07-20): shorter subheadline, countdown label dropped.
const IGNORE_LINES = new Set(['Version', 'Safe', 'Bold', 'Bold 2', 'Bold 3', 'Bold 4',
  "Shop incredible deals on kids' clothing, toys, and gear at 50–90% off retail — or earn money selling what your kids have outgrown.",
  'Sale Starts In']);

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
    .replace(/&middot;/g, '·').replace(/&rarr;/g, '→')
    .replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
    .replace(/&hellip;/g, '…');
}
function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
function lines(html) {
  return visibleText(html).split('\n').map(norm)
    .filter((l) => l.length >= 3 && !IGNORE_LINES.has(l));
}

let fail = 0;
for (const slug of SLUGS) {
  const p = slug ? slug + '/index.html' : 'index.html';
  const oldHtml = fs.readFileSync('new-site/' + p, 'utf8');
  const newHtml = fs.readFileSync('dflb/' + p, 'utf8');
  const hay = norm(visibleText(newHtml));
  const missing = [];
  for (const line of new Set(lines(oldHtml))) {
    if (!hay.includes(line)) missing.push(line);
  }
  if (missing.length) {
    fail++;
    console.error(`FAIL /${slug || ''} — ${missing.length} missing line(s):`);
    for (const m of missing) console.error('   ✗ ' + m);
  } else {
    console.log(`PASS /${slug || ''} — all source copy present verbatim`);
  }
  // MySaleManager must never be visible text (href attributes are fine).
  if (/mysalemanager/i.test(hay)) {
    fail++;
    console.error(`FAIL /${slug || ''} — "MySaleManager" appears in visible text`);
  }
}
process.exit(fail ? 1 : 0);
