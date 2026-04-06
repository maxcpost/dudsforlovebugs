// Countdown to next sale date
// Default: August 15, 2026 at 10:00 AM EDT (hardcoded fallback)
// If sheets.js is loaded, it will call dflbUpdateCountdown() with the live date.
(function () {
  var saleDate = new Date('2026-08-15T10:00:00-04:00').getTime();

  var daysEl = document.getElementById('countdown-days');
  var hoursEl = document.getElementById('countdown-hours');
  var minutesEl = document.getElementById('countdown-minutes');
  var secondsEl = document.getElementById('countdown-seconds');

  if (!daysEl) return;

  function update() {
    var now = Date.now();
    var diff = saleDate - now;

    if (diff <= 0) {
      daysEl.textContent = '0';
      hoursEl.textContent = '0';
      minutesEl.textContent = '0';
      secondsEl.textContent = '0';
      return;
    }

    daysEl.textContent = Math.floor(diff / (1000 * 60 * 60 * 24));
    hoursEl.textContent = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutesEl.textContent = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    secondsEl.textContent = Math.floor((diff % (1000 * 60)) / 1000);
  }

  update();
  setInterval(update, 1000);

  // Exposed for sheets.js to push a live date from the Google Sheet
  window.dflbUpdateCountdown = function (timestamp) {
    saleDate = timestamp;
    update();
  };
})();
