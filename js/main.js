// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('mobile-nav-toggle');
  var menu = document.getElementById('mobile-menu');
  var body = document.body;

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('hidden');
      body.classList.toggle('overflow-hidden');

      // Update icon
      var iconOpen = toggle.querySelector('.icon-open');
      var iconClose = toggle.querySelector('.icon-close');
      if (iconOpen && iconClose) {
        iconOpen.classList.toggle('hidden');
        iconClose.classList.toggle('hidden');
      }
    });

    // Close on escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.add('hidden');
        body.classList.remove('overflow-hidden');
        var iconOpen = toggle.querySelector('.icon-open');
        var iconClose = toggle.querySelector('.icon-close');
        if (iconOpen && iconClose) {
          iconOpen.classList.remove('hidden');
          iconClose.classList.add('hidden');
        }
        toggle.focus();
      }
    });
  }

  // Consign dropdown (desktop)
  var dropdownBtn = document.getElementById('consign-dropdown-btn');
  var dropdownMenu = document.getElementById('consign-dropdown-menu');

  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener('click', function () {
      var expanded = dropdownBtn.getAttribute('aria-expanded') === 'true';
      dropdownBtn.setAttribute('aria-expanded', String(!expanded));
      dropdownMenu.classList.toggle('hidden');
    });

    // Close dropdown on outside click
    document.addEventListener('click', function (e) {
      if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownBtn.setAttribute('aria-expanded', 'false');
        dropdownMenu.classList.add('hidden');
      }
    });

    // Close dropdown on escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !dropdownMenu.classList.contains('hidden')) {
        dropdownBtn.setAttribute('aria-expanded', 'false');
        dropdownMenu.classList.add('hidden');
        dropdownBtn.focus();
      }
    });
  }

  // Initialize AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing: 'ease-out',
      once: true,
      offset: 80
    });
  }
});
