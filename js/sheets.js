/**
 * DFLB Google Sheets Integration
 *
 * Fetches event schedule and sale info from a published Google Sheet
 * and dynamically updates the website. Falls back gracefully to the
 * hardcoded HTML if the fetch fails.
 *
 * SETUP:
 * The Google Sheet is already connected (published URL + tab GIDs are below).
 * The flyer PDF on Google Drive is connected via FLYER_FILE_ID.
 *
 * ─── "Sale Info" tab (two columns) ───
 *
 *   Setting          | Value
 *   ─────────────────┼──────────────────────
 *   Sale Dates       | August 15-17, 2026
 *   Countdown Date   | 08/15/2026
 *   Countdown Time   | 10:00 AM
 *
 * ─── "Schedule" tab (eight columns) ───
 *
 *   Day | Date | Month | Title | Time | Details | Tags | Sale Day
 *
 *   - "Tags" applies to the whole day. Only fill it in on the first
 *     row for that date. Comma-separate multiple tags: "Sale Day 3, 50% Off"
 *   - "Sale Day" adds the accent border. Put "yes" on the first row
 *     for each date that is part of the sale.
 *   - Rows with the same Day/Date/Month are grouped into one day card.
 *   - Consecutive rows with the same Title are merged under one heading.
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════════════
  //  CONFIGURATION
  // ═══════════════════════════════════════════════════

  var FLYER_FILE_ID = '1cfszb8XnT3VELGdxhk2f5RKR8nNZDnNM';

  // Published Google Sheet CSV endpoints
  var PUB_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTLyGRLifqA6Ni29q6TgUAeWvRVu-0R8VjMeV4OjVaU9vscyukWIRspIHxa4Y8cWuNPvlTp6hF57BA2/pub?output=csv';
  var SALE_INFO_URL = PUB_BASE + '&gid=2100860675';
  var SCHEDULE_URL = PUB_BASE + '&gid=1583214057';
  var FLYER_URL = 'https://drive.google.com/uc?export=download&id=' + FLYER_FILE_ID;


  // ═══════════════════════════════════════════════════
  //  CSV PARSER
  // ═══════════════════════════════════════════════════

  function parseCSV(text) {
    var rows = [];
    var row = [];
    var field = '';
    var inQuotes = false;

    for (var i = 0; i < text.length; i++) {
      var ch = text[i];

      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          row.push(field.trim());
          field = '';
        } else if (ch === '\n') {
          row.push(field.trim());
          if (row.some(function (f) { return f !== ''; })) {
            rows.push(row);
          }
          row = [];
          field = '';
        } else if (ch !== '\r') {
          field += ch;
        }
      }
    }

    row.push(field.trim());
    if (row.some(function (f) { return f !== ''; })) {
      rows.push(row);
    }

    return rows;
  }

  function csvToObjects(text) {
    var rows = parseCSV(text);
    if (rows.length < 2) return [];

    var headers = rows[0].map(function (h) {
      return h.toLowerCase().replace(/\s+/g, '_');
    });

    var objects = [];
    for (var i = 1; i < rows.length; i++) {
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = (rows[i][j] || '').trim();
      }
      objects.push(obj);
    }
    return objects;
  }

  function csvToMap(text) {
    var rows = parseCSV(text);
    var map = {};
    for (var i = 1; i < rows.length; i++) {
      if (rows[i].length >= 2 && rows[i][0]) {
        var key = rows[i][0].toLowerCase().replace(/\s+/g, '_');
        map[key] = (rows[i][1] || '').trim();
      }
    }
    return map;
  }


  // ═══════════════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════════════

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function convertTo24(timeStr) {
    var match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return '10:00';
    var h = parseInt(match[1], 10);
    var m = match[2];
    var period = match[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return (h < 10 ? '0' + h : String(h)) + ':' + m;
  }

  function parseSaleDate(dateStr, timeStr) {
    timeStr = timeStr || '10:00 AM';

    var slashParts = dateStr.split('/');
    if (slashParts.length === 3) {
      var iso = slashParts[2] + '-'
        + (slashParts[0].length < 2 ? '0' + slashParts[0] : slashParts[0]) + '-'
        + (slashParts[1].length < 2 ? '0' + slashParts[1] : slashParts[1])
        + 'T' + convertTo24(timeStr) + ':00';
      var d = new Date(iso);
      if (!isNaN(d.getTime())) return d.getTime();
    }

    var natural = new Date(dateStr + ' ' + timeStr);
    if (!isNaN(natural.getTime())) return natural.getTime();

    return null;
  }


  // ═══════════════════════════════════════════════════
  //  SCHEDULE RENDERING
  // ═══════════════════════════════════════════════════

  function groupByDate(events) {
    var groups = [];
    var currentKey = '';
    var currentGroup = null;

    events.forEach(function (event) {
      var key = event.day + '|' + event.date + '|' + event.month;
      if (key !== currentKey) {
        currentGroup = {
          day: event.day,
          date: event.date,
          month: event.month,
          tags: event.tags || '',
          isSaleDay: (event.sale_day || '').toLowerCase() === 'yes',
          events: []
        };
        groups.push(currentGroup);
        currentKey = key;
      }
      currentGroup.events.push(event);
    });

    return groups;
  }

  function mergeEvents(events) {
    var merged = [];
    var current = null;

    events.forEach(function (event) {
      if (current && current.title.toLowerCase() === event.title.toLowerCase()) {
        current.lines.push({ time: event.time, details: event.details });
      } else {
        current = {
          title: event.title,
          lines: [{ time: event.time, details: event.details }]
        };
        merged.push(current);
      }
    });

    return merged;
  }

  function buildTimelineHTML(groups) {
    var html = '';

    groups.forEach(function (group, gi) {
      var isLast = gi === groups.length - 1;

      html += '<div class="d-flex gap-3 gap-sm-4' + (isLast ? '' : ' mb-4') + '" data-aos="fade-up">';

      html += '<div class="flex-shrink-0 text-center rounded-3 p-2 p-sm-3" style="background:var(--dflb-pop);color:white;min-width:5rem;">';
      html += '<p class="small fw-semibold text-uppercase mb-0" style="letter-spacing:0.08em;">' + escapeHTML(group.day) + '</p>';
      html += '<p class="h3 fw-bold mb-0">' + escapeHTML(group.date) + '</p>';
      html += '<p class="small fw-semibold text-uppercase mb-0" style="letter-spacing:0.08em;">' + escapeHTML(group.month) + '</p>';
      html += '</div>';

      html += '<div class="section-cream rounded-3 p-3 p-sm-4 flex-grow-1"';
      if (group.isSaleDay) {
        html += ' style="border-left:4px solid var(--dflb-pop);"';
      }
      html += '>';

      if (group.tags) {
        var tags = group.tags.split(',');
        tags.forEach(function (tag, ti) {
          tag = tag.trim();
          if (!tag) return;
          var isDiscount = /50%|off/i.test(tag);
          var bg = isDiscount ? 'var(--dflb-charcoal)' : 'var(--dflb-pop)';
          html += '<span class="badge rounded-pill mb-2' + (ti > 0 ? ' ms-1' : '') + '"'
            + ' style="background:' + bg + ';font-size:0.6875rem;letter-spacing:0.08em;text-transform:uppercase;">'
            + escapeHTML(tag) + '</span>';
        });
      }

      var merged = mergeEvents(group.events);
      merged.forEach(function (event, ei) {
        if (ei > 0) {
          html += '<hr class="my-3" style="border-color:var(--dflb-grey-200);">';
        }

        html += '<p class="fw-bold mb-1">' + escapeHTML(event.title) + '</p>';

        event.lines.forEach(function (line, li) {
          var isLastLine = (ei === merged.length - 1) && (li === event.lines.length - 1);
          if (!line.time && !line.details) return;

          html += '<p class="text-muted-dflb small mb-' + (isLastLine ? '0' : '1') + '">';
          if (line.time) {
            html += '<strong>' + escapeHTML(line.time) + '</strong>';
            if (line.details) html += ' &mdash; ';
          }
          if (line.details) {
            html += escapeHTML(line.details);
          }
          html += '</p>';
        });
      });

      html += '</div></div>';
    });

    return html;
  }


  // ═══════════════════════════════════════════════════
  //  DOM UPDATES
  // ═══════════════════════════════════════════════════

  function updateSaleDates(saleInfo) {
    var dateText = saleInfo.sale_dates;
    if (!dateText) return;

    var els = document.querySelectorAll('[data-dflb="sale-dates"]');
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = dateText;
    }
  }

  function updateCountdown(saleInfo) {
    var dateStr = saleInfo.countdown_date;
    if (!dateStr) return;

    var timestamp = parseSaleDate(dateStr, saleInfo.countdown_time);
    if (timestamp && typeof window.dflbUpdateCountdown === 'function') {
      window.dflbUpdateCountdown(timestamp);
    }
  }

  function updateScheduleTimeline(events) {
    var container = document.getElementById('schedule-timeline');
    if (!container) return;

    var groups = groupByDate(events);
    if (groups.length === 0) return;

    container.innerHTML = buildTimelineHTML(groups);

    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 700, easing: 'ease-out', once: true, offset: 80 });
    }
  }

  function updateFlyerLink() {
    var links = document.querySelectorAll('[data-dflb="flyer-download"]');
    for (var i = 0; i < links.length; i++) {
      links[i].href = FLYER_URL;
      links[i].removeAttribute('download');
      links[i].setAttribute('target', '_blank');
      links[i].setAttribute('rel', 'noopener noreferrer');
    }
  }


  // ═══════════════════════════════════════════════════
  //  INITIALIZATION
  // ═══════════════════════════════════════════════════

  function init() {
    updateFlyerLink();

    var saleInfoPromise = fetch(SALE_INFO_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('Sale Info: HTTP ' + r.status);
        return r.text();
      })
      .then(csvToMap);

    var schedulePromise = fetch(SCHEDULE_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('Schedule: HTTP ' + r.status);
        return r.text();
      })
      .then(csvToObjects);

    Promise.all([saleInfoPromise, schedulePromise])
      .then(function (results) {
        var saleInfo = results[0];
        var schedule = results[1];

        updateSaleDates(saleInfo);
        updateCountdown(saleInfo);
        updateScheduleTimeline(schedule);
      })
      .catch(function (err) {
        console.warn('DFLB Sheets: Could not load data, using fallback content.', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
