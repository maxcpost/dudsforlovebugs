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
