/* =========================================================
   Finiti landing — interactivity
   - Footer year stamp
   - Live year dot grid in the hero (the product demo, in-page)
   - UTM -> Apple Campaign Link (ct token) rewriting on every App Store badge
   - PostHog click capture (PostHog itself is initialized inline in <head>)
   - IntersectionObserver-based scroll reveals (respects prefers-reduced-motion)
   - Sticky mobile CTA fade-in once the hero scrolls out of view
   Loaded with `defer` so DOM is ready when this runs.
   ========================================================= */

(function () {
  'use strict';

  // ---- Footer year ----
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Live year dot grid ----
  var grid = document.getElementById('year-grid');
  if (grid) {
    var now = new Date();
    var y = now.getFullYear();
    // Local calendar dates mapped through UTC so DST shifts can't skew the
    // day index by an hour and misplace "today".
    var MS_DAY = 86400000;
    var totalDays = Math.round((Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / MS_DAY);
    var dayIndex = Math.round(
      (Date.UTC(y, now.getMonth(), now.getDate()) - Date.UTC(y, 0, 1)) / MS_DAY
    );

    var frag = document.createDocumentFragment();
    for (var i = 0; i < totalDays; i++) {
      var dot = document.createElement('span');
      dot.className =
        i < dayIndex ? 'dot dot--gone' : i === dayIndex ? 'dot dot--today' : 'dot';
      frag.appendChild(dot);
    }
    grid.appendChild(frag);

    var pctGone = Math.round((dayIndex / totalDays) * 100);
    var daysLeft = totalDays - dayIndex - 1;
    var summary = y + ' · ' + pctGone + '% gone · ' + daysLeft + ' days left';
    grid.setAttribute('aria-label', summary);
    var label = document.getElementById('year-grid-label');
    if (label) label.textContent = summary;
  }

  // ---- App Store badge: rewrite href + capture click ----
  var params = new URLSearchParams(location.search);
  var term = params.get('utm_term') || 'unknown';
  var content = params.get('utm_content') || 'organic';
  var ctTag = 'tiktok-' + term + '-' + content;
  var STORE_URL = 'https://apps.apple.com/us/app/finiti-days-left/id6761764736';

  var badges = document.querySelectorAll('a.app-store-badge');
  badges.forEach(function (a) {
    a.href = STORE_URL + '?ct=' + encodeURIComponent(ctTag) + '&mt=8';
    a.addEventListener('click', function () {
      if (typeof window.posthog === 'undefined') return;
      window.posthog.capture('app_store_click', {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_content: content,
        utm_term: term,
        ct_tag: ctTag,
        source: a.getAttribute('data-source') || 'unknown'
      });
    });
  });

  // ---- Scroll reveals ----
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (!reduced && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  // ---- Sticky CTA fade-in past the hero ----
  var sticky = document.querySelector('.sticky-cta');
  var hero = document.querySelector('.hero');
  if (sticky && hero) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var heroBottom = hero.getBoundingClientRect().bottom;
      sticky.classList.toggle('is-visible', heroBottom < 80);
    };
    var onScroll = function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    update();
  }
})();
