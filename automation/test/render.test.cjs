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
test('event json-ld carries the dates', () => {
  const s = R.renderEventJsonLd(CONTENT);
  assert.match(s, /"startDate":"2026-08-15T10:00:00-04:00"/);
  assert.match(s, /"endDate":"2026-08-17T14:00:00-04:00"/);
  assert.match(s, /application\/ld\+json/);
});
