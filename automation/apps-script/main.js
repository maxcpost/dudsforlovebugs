// Apps Script engine. Paste this + render.js into the Sheet's Apps Script project.
// Reads Sheet + Drive natively; commits regenerated files to GitHub in one commit.

function _props() { return PropertiesService.getScriptProperties(); }
function _gh(path, method, payload) {
  var p = _props();
  var url = 'https://api.github.com/repos/' + p.getProperty('GITHUB_REPO') + path;
  var res = UrlFetchApp.fetch(url, {
    method: method || 'get',
    contentType: 'application/json',
    headers: { Authorization: 'token ' + p.getProperty('GITHUB_TOKEN'),
               Accept: 'application/vnd.github+json', 'User-Agent': 'dflb-appsscript' },
    payload: payload ? JSON.stringify(payload) : undefined,
    muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  if (code >= 300) throw new Error('GitHub ' + method + ' ' + path + ' -> ' + code + ': ' + res.getContentText());
  return JSON.parse(res.getContentText());
}

function readContent() {
  var ss = SpreadsheetApp.openById(_props().getProperty('SHEET_ID'));
  var info = {}, infoRows = ss.getSheetByName('Sale Info').getDataRange().getValues();
  for (var i = 0; i < infoRows.length; i++) {
    var key = String(infoRows[i][0]).trim(); if (key) info[key] = infoRows[i][1];
  }
  function iso(v) { // Date cell -> 'YYYY-MM-DD'
    var d = (v instanceof Date) ? v : new Date(v);
    return Utilities.formatDate(d, 'America/New_York', 'yyyy-MM-dd');
  }
  function isoDT(v) { var d = (v instanceof Date) ? v : new Date(v);
    return Utilities.formatDate(d, 'America/New_York', "yyyy-MM-dd'T'HH:mm:ss") + '-04:00'; }

  var schedule = [], rows = ss.getSheetByName('Schedule').getDataRange().getValues();
  for (var r = 1; r < rows.length; r++) { // row 0 = headers
    if (!rows[r][0]) continue;
    schedule.push({ dateISO: iso(rows[r][0]), time: String(rows[r][1] || ''),
      event: String(rows[r][2] || ''), details: String(rows[r][3] || ''), tag: String(rows[r][4] || '') });
  }
  return {
    saleName: String(info['Sale name'] || ''),
    startISO: iso(info['Sale start date']), endISO: iso(info['Sale end date']),
    countdownISO: isoDT(info['Countdown to']),
    locationName: String(info['Location name'] || 'Jewish Community Center (JCC)'),
    address: String(info['Address'] || ''), schedule: schedule
  };
}

function readFlyer() {
  var folder = DriveApp.getFolderById(_props().getProperty('DRIVE_FOLDER_ID'));
  var it = folder.getFiles(), newest = null;
  while (it.hasNext()) { var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f; }
  if (!newest) return null;
  var name = newest.getName(), ext = (name.match(/\.([A-Za-z0-9]+)$/) || [null,'pdf'])[1].toLowerCase();
  return { ext: ext, base64: Utilities.base64Encode(newest.getBlob().getBytes()) };
}

function renderFlyerAnchor(ext) {
  return '<a href="/images/flyer.' + ext + '" download="dflb-flyer.' + ext + '" '
    + 'class="btn btn-outline-gold d-inline-flex align-items-center gap-2" data-aos="fade-up" data-aos-delay="200">'
    + '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">'
    + '<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/></svg>'
    + 'Download Printable Flyer</a>';
}

var DFLB_HOMES = ['new-site/index.html', 'new-site/bold/index.html', 'new-site/bold2/index.html'];
var DFLB_SCHEDULES = ['new-site/schedule/index.html', 'new-site/bold/schedule/index.html', 'new-site/bold2/schedule/index.html'];

function run() {
  var c = readContent();
  if (!c.startISO || !c.endISO) { Logger.log('Core dates blank; skipping.'); return; } // safety guard
  var range = formatDateRange(c.startISO, c.endISO);
  var timeline = renderScheduleTimeline(c.schedule);
  var eventLd = renderEventJsonLd(c);
  var flyer = readFlyer();

  var files = {}; // path -> new UTF-8 string (null = binary handled separately)
  // Home pages
  for (var h = 0; h < DFLB_HOMES.length; h++) {
    var html = _ghGetText(DFLB_HOMES[h]);
    html = replaceRegion(html, 'sale-dates', range);
    html = replaceRegion(html, 'sale-dates2', range);
    html = replaceRegion(html, 'event-jsonld', eventLd);
    files[DFLB_HOMES[h]] = html;
  }
  // Schedule pages
  for (var s = 0; s < DFLB_SCHEDULES.length; s++) {
    var sh = _ghGetText(DFLB_SCHEDULES[s]);
    sh = replaceRegion(sh, 'sale-dates', range);
    sh = replaceRegion(sh, 'schedule', timeline);
    if (flyer) sh = replaceRegion(sh, 'flyer', renderFlyerAnchor(flyer.ext));
    files[DFLB_SCHEDULES[s]] = sh;
  }
  // countdown target
  files['new-site/js/sale-date.js'] = saleDateFileContents(c.countdownISO);

  commitAll(files, flyer);
}

function _ghGetText(path) {
  var p = _props();
  var res = _gh('/contents/' + path + '?ref=' + p.getProperty('GITHUB_BRANCH'), 'get');
  return Utilities.newBlob(Utilities.base64Decode(res.content)).getDataAsString();
}

function commitAll(textFiles, flyer) {
  var p = _props(), branch = p.getProperty('GITHUB_BRANCH');
  var ref = _gh('/git/ref/heads/' + branch, 'get');
  var baseSha = ref.object.sha;
  var baseCommit = _gh('/git/commits/' + baseSha, 'get');
  var tree = [];
  for (var path in textFiles) {
    var blob = _gh('/git/blobs', 'post', { content: textFiles[path], encoding: 'utf-8' });
    tree.push({ path: path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  if (flyer) {
    var fblob = _gh('/git/blobs', 'post', { content: flyer.base64, encoding: 'base64' });
    tree.push({ path: 'new-site/images/flyer.' + flyer.ext, mode: '100644', type: 'blob', sha: fblob.sha });
  }
  var newTree = _gh('/git/trees', 'post', { base_tree: baseCommit.tree.sha, tree: tree });
  var commit = _gh('/git/commits', 'post', {
    message: 'chore(content): sync dates/schedule/flyer from Google', tree: newTree.sha, parents: [baseSha] });
  _gh('/git/refs/heads/' + branch, 'patch', { sha: commit.sha });
  Logger.log('Committed ' + commit.sha);
}
