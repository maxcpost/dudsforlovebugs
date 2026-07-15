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

function replaceRegion(html, name, inner) {
  var open = '<!-- dflb:' + name + ' -->';
  var close = '<!-- /dflb:' + name + ' -->';
  var i = html.indexOf(open), j = html.indexOf(close);
  if (i === -1 || j === -1 || j < i) throw new Error('missing marker pair: ' + name);
  return html.slice(0, i + open.length) + inner + html.slice(j);
}

function saleDateFileContents(targetISO) {
  return 'window.DFLB_SALE_TARGET = "' + targetISO + '";\n';
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
var DFLB_DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function _dayParts(dateISO) {
  var p = _ymd(dateISO);
  // Zeller-free DOW via UTC Date (calendar parts only; safe, no TZ drift for the label).
  var dow = new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay();
  return { dow: DFLB_DOW[dow], d: p.d, mon: DFLB_MONTHS[p.m - 1].slice(0, 3) };
}

function renderScheduleTimeline(rows) {
  // group preserving first-seen order
  var order = [], byDay = {};
  for (var i = 0; i < rows.length; i++) {
    var k = rows[i].dateISO;
    if (!byDay[k]) { byDay[k] = []; order.push(k); }
    byDay[k].push(rows[i]);
  }
  var out = [];
  for (var o = 0; o < order.length; o++) {
    var k2 = order[o], parts = _dayParts(k2), evs = byDay[k2];
    var chip = '<div class="flex-shrink-0 text-center rounded-3 p-2 p-sm-3" '
      + 'style="background:var(--dflb-pop);color:white;min-width:5rem;">'
      + '<p class="small fw-semibold text-uppercase mb-0" style="letter-spacing:0.08em;">' + parts.dow + '</p>'
      + '<p class="h3 fw-bold mb-0">' + parts.d + '</p>'
      + '<p class="small fw-semibold text-uppercase mb-0" style="letter-spacing:0.08em;">' + parts.mon + '</p></div>';
    var body = [];
    var hasTag = false;
    for (var e = 0; e < evs.length; e++) {
      var ev = evs[e];
      if (e > 0) body.push('<hr class="my-3" style="border-color:var(--dflb-grey-200);">');
      if (ev.tag) {
        hasTag = true;
        var badges = String(ev.tag).split('·');
        var k = 0;
        for (var b = 0; b < badges.length; b++) {
          var t = badges[b].trim(); if (!t) continue;
          var cls = 'badge rounded-pill mb-2' + (k > 0 ? ' ms-1' : '');
          var bg = /off/i.test(t) ? 'var(--dflb-charcoal)' : 'var(--dflb-pop)';
          body.push('<span class="' + cls + '" style="background:' + bg + ';'
            + 'font-size:0.6875rem;letter-spacing:0.08em;text-transform:uppercase;">' + escapeHtml(t) + '</span>');
          k++;
        }
      }
      body.push('<p class="fw-bold mb-1">' + escapeHtml(ev.event) + '</p>');
      var line = ev.time ? '<strong>' + escapeHtml(ev.time) + '</strong> &mdash; ' + escapeHtml(ev.details)
                         : escapeHtml(ev.details);
      var pCls = 'text-muted-dflb small ' + (e === evs.length - 1 ? 'mb-0' : 'mb-2');
      body.push('<p class="' + pCls + '">' + line + '</p>');
    }
    var contentDivOpen = hasTag
      ? '<div class="section-cream rounded-3 p-3 p-sm-4 flex-grow-1" style="border-left:4px solid var(--dflb-pop);">'
      : '<div class="section-cream rounded-3 p-3 p-sm-4 flex-grow-1">';
    out.push('<div class="d-flex gap-3 gap-sm-4 mb-4" data-dflb-day="' + escapeHtml(k2) + '" data-aos="fade-up">'
      + chip + contentDivOpen + body.join('') + '</div></div>');
  }
  return out.join('\n');
}

function renderEventJsonLd(c) {
  var ev = {
    '@type': 'Event',
    name: 'Duds for Love Bugs Consignment Sale',
    startDate: c.startISO + 'T10:00:00-04:00',
    endDate: c.endISO + 'T14:00:00-04:00',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: c.locationName,
      address: { '@type': 'PostalAddress', streetAddress: '1200 Edgewood Ave',
        addressLocality: 'Rochester', addressRegion: 'NY', postalCode: '14618', addressCountry: 'US' } },
    description: 'Semi-annual children’s consignment sale featuring gently used clothing, toys, books, and baby gear at 50-90% off retail. Free admission.',
    organizer: { '@id': 'https://dudsforlovebugs.com/#org' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD',
      availability: 'https://schema.org/InStock', url: 'https://dudsforlovebugs.com/schedule/' }
  };
  ev['@context'] = 'https://schema.org';
  var json = JSON.stringify(ev).replace(/<\//g, '<\\/');
  return '<script type="application/ld+json">' + json + '<\/script>';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatDateRange: formatDateRange,
    replaceRegion: replaceRegion,
    saleDateFileContents: saleDateFileContents,
    escapeHtml: escapeHtml,
    renderScheduleTimeline: renderScheduleTimeline,
    renderEventJsonLd: renderEventJsonLd
  };
}
