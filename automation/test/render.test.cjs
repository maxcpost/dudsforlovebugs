const test = require('node:test');
const assert = require('node:assert');
const R = require('../apps-script/render.js');

test('formatDateRange: same month', () => {
  assert.strictEqual(R.formatDateRange('2026-08-15', '2026-08-17'), 'August 15–17, 2026');
});
test('formatDateRange: cross month', () => {
  assert.strictEqual(R.formatDateRange('2026-08-30', '2026-09-01'), 'August 30 – September 1, 2026');
});
test('formatDateRange: cross year', () => {
  assert.strictEqual(R.formatDateRange('2026-12-31', '2027-01-02'), 'December 31, 2026 – January 2, 2027');
});
test('formatDateRange: single day', () => {
  assert.strictEqual(R.formatDateRange('2026-08-15', '2026-08-15'), 'August 15, 2026');
});

test('replaceRegion swaps only inner content, keeps markers', () => {
  const html = 'A<!-- dflb:x -->OLD<!-- /dflb:x -->B';
  assert.strictEqual(R.replaceRegion(html, 'x', 'NEW'), 'A<!-- dflb:x -->NEW<!-- /dflb:x -->B');
});
test('replaceRegion throws on missing markers', () => {
  assert.throws(() => R.replaceRegion('nope', 'x', 'NEW'), /marker/);
});
test('saleDateFileContents', () => {
  assert.strictEqual(R.saleDateFileContents('2026-08-15T10:00:00-04:00'),
    'window.DFLB_SALE_TARGET = "2026-08-15T10:00:00-04:00";\n');
});

const CONTENT = {
  saleName: 'Fall 2026', startISO: '2026-08-15', endISO: '2026-08-17',
  countdownISO: '2026-08-15T10:00:00-04:00',
  locationName: 'Jewish Community Center (JCC)',
  address: '1200 Edgewood Ave, Rochester, NY 14618',
  schedule: [
    { dateISO: '2026-08-13', time: '1 PM – 7 PM', event: 'Drop-Off', details: 'Bring tagged items.', tag: '' },
    { dateISO: '2026-08-15', time: '10 AM – 6 PM', event: 'Public Shopping', details: 'Doors open.', tag: 'Sale Day 1' },
    { dateISO: '2026-08-15', time: '9 – 10 AM', event: 'Early Access', details: 'Military & diapers.', tag: '' }
  ]
};
test('escapeHtml', () => {
  assert.strictEqual(R.escapeHtml('a & <b> "c"'), 'a &amp; &lt;b&gt; &quot;c&quot;');
});
test('timeline groups by day and renders each event', () => {
  const html = R.renderScheduleTimeline(CONTENT.schedule);
  assert.match(html, /Aug/);
  assert.match(html, /Public Shopping/);
  assert.match(html, /Early Access/);       // second event on Aug 15 present
  assert.strictEqual((html.match(/data-dflb-day/g) || []).length, 2); // two day cards
  assert.match(html, /Sale Day 1/);         // badge from tag
});

test('timeline: only tagged days get the sale-day border accent', () => {
  const html = R.renderScheduleTimeline(CONTENT.schedule);
  const aug13 = html.slice(html.indexOf('data-dflb-day="2026-08-13"'), html.indexOf('data-dflb-day="2026-08-15"'));
  const aug15 = html.slice(html.indexOf('data-dflb-day="2026-08-15"'));
  assert.match(aug15, /section-cream rounded-3 p-3 p-sm-4 flex-grow-1" style="border-left:4px solid var\(--dflb-pop\);"/);
  assert.doesNotMatch(aug13, /border-left:4px solid var\(--dflb-pop\);/);
});

test('timeline: "Off" badges get the charcoal background and non-first badges get ms-1', () => {
  const schedule = CONTENT.schedule.concat([
    { dateISO: '2026-08-17', time: '10 AM – 2 PM', event: 'Half-Price Shopping', details: 'Best deals.', tag: 'Sale Day 3 · 50% Off' }
  ]);
  const html = R.renderScheduleTimeline(schedule);
  assert.match(html, /<span class="badge rounded-pill mb-2" style="background:var\(--dflb-pop\);[^"]*">Sale Day 3<\/span>/);
  assert.match(html, /<span class="badge rounded-pill mb-2 ms-1" style="background:var\(--dflb-charcoal\);[^"]*">50% Off<\/span>/);
});

test('timeline: detail paragraph uses mb-2 for non-last events and mb-0 for the last event in the day', () => {
  const schedule = [
    { dateISO: '2026-08-14', time: '9 AM – 4 PM', event: 'Drop-Off', details: 'Final drop-off window.', tag: '' },
    { dateISO: '2026-08-14', time: '5 – 8 PM', event: 'VIP Pre-Sale', details: 'Consignors shop first.', tag: '' }
  ];
  const html = R.renderScheduleTimeline(schedule);
  assert.match(html, /<p class="text-muted-dflb small mb-2"><strong>9 AM/);
  assert.match(html, /<p class="text-muted-dflb small mb-0"><strong>5 – 8 PM/);
});
test('event json-ld carries the dates', () => {
  const s = R.renderEventJsonLd(CONTENT);
  assert.match(s, /"startDate":"2026-08-15T10:00:00-04:00"/);
  assert.match(s, /"endDate":"2026-08-17T14:00:00-04:00"/);
  assert.match(s, /application\/ld\+json/);
});
