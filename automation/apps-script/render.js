// Pure render helpers. Valid in Node (CommonJS) AND Google Apps Script (V8):
// no import/export statements; a guarded module.exports at the very bottom.
var DFLB_MONTHS = ['January','February','March','April','May','June','July',
  'August','September','October','November','December'];

function _ymd(iso) {
  // Accept 'YYYY-MM-DD' or full ISO; parse as plain calendar parts (no TZ math).
  var m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) throw new Error('bad date: ' + iso);
  return { y: +m[1], m: +m[2], d: +m[3] };
}

function formatDateRange(startISO, endISO) {
  var s = _ymd(startISO), e = _ymd(endISO);
  var sMon = DFLB_MONTHS[s.m - 1], eMon = DFLB_MONTHS[e.m - 1];
  if (s.y === e.y && s.m === e.m && s.d === e.d) return sMon + ' ' + s.d + ', ' + s.y;
  if (s.y !== e.y) return sMon + ' ' + s.d + ', ' + s.y + ' – ' + eMon + ' ' + e.d + ', ' + e.y;
  if (s.m !== e.m) return sMon + ' ' + s.d + ' – ' + eMon + ' ' + e.d + ', ' + s.y;
  return sMon + ' ' + s.d + '–' + e.d + ', ' + s.y;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatDateRange: formatDateRange };
}
