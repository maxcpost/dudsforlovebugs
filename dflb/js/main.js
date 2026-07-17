// Mobile navigation toggle (full-screen overlay)
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('mobile-nav-toggle');
  var menu = document.getElementById('mobile-menu');
  var body = document.body;

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.add('hidden');
    body.classList.remove('menu-open');
    var iconOpen = toggle.querySelector('.icon-open');
    var iconClose = toggle.querySelector('.icon-close');
    if (iconOpen && iconClose) {
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
    }
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) { closeMenu(); return; }
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.remove('hidden');
      body.classList.add('menu-open');
      var iconOpen = toggle.querySelector('.icon-open');
      var iconClose = toggle.querySelector('.icon-close');
      if (iconOpen && iconClose) {
        iconOpen.classList.add('hidden');
        iconClose.classList.remove('hidden');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
        closeMenu();
        toggle.focus();
      }
    });

    // Close when a menu link is chosen
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
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

    document.addEventListener('click', function (e) {
      if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownBtn.setAttribute('aria-expanded', 'false');
        dropdownMenu.classList.add('hidden');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !dropdownMenu.classList.contains('hidden')) {
        dropdownBtn.setAttribute('aria-expanded', 'false');
        dropdownMenu.classList.add('hidden');
        dropdownBtn.focus();
      }
    });
  }

  // Photo carousel
  var carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-dot]'));
    var prevBtn = carousel.querySelector('[data-carousel-prev]');
    var nextBtn = carousel.querySelector('[data-carousel-next]');
    var index = 0;
    var timer = null;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        s.classList.toggle('is-active', n === index);
        s.setAttribute('aria-hidden', String(n !== index));
      });
      dots.forEach(function (d, n) {
        d.classList.toggle('is-active', n === index);
        d.setAttribute('aria-current', n === index ? 'true' : 'false');
      });
    }

    function start() {
      if (reduceMotion || timer) return;
      timer = setInterval(function () { show(index + 1); }, 5000);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { show(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { show(index + 1); });
    dots.forEach(function (d, n) {
      d.addEventListener('click', function () { show(n); });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);

    show(0);
    start();
  }

  // Scroll reveal — progressive enhancement. Content is visible by default;
  // we only enable the hide/reveal styling once the observer is guaranteed.
  var reduceMotionReveal = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotionReveal) {
    var targets = Array.prototype.slice.call(document.querySelectorAll('[data-aos]'));
    if (targets.length) {
      document.documentElement.classList.add('js-anim');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      targets.forEach(function (el) { io.observe(el); });
      // Failsafe: nothing may stay hidden for long, no matter what.
      setTimeout(function () {
        targets.forEach(function (el) { el.classList.add('revealed'); });
      }, 4000);
    }
  }
});
