(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var panel = document.querySelector('.mobile-panel');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      var willOpen = panel.hasAttribute('hidden');
      panel.toggleAttribute('hidden', !willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
      button.textContent = willOpen ? '×' : '☰';
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('.hero-slider');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var previous = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (!slides.length) {
      return;
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function initFilters() {
    var toolbars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-toolbar]'));

    toolbars.forEach(function (toolbar) {
      var section = toolbar.closest('section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
      var input = toolbar.querySelector('[data-local-search]');
      var regionSelect = toolbar.querySelector('[data-filter-region]');
      var typeSelect = toolbar.querySelector('[data-filter-type]');
      var count = toolbar.querySelector('[data-filter-count]');
      var empty = section.querySelector('[data-empty-state]');

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var region = regionSelect ? regionSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardRegion = card.getAttribute('data-region') || '';
          var cardType = card.getAttribute('data-type') || '';
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesRegion = !region || cardRegion === region;
          var matchesType = !type || cardType.indexOf(type) !== -1;
          var shouldShow = matchesQuery && matchesRegion && matchesType;

          card.hidden = !shouldShow;
          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
        }

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, regionSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function initBackToTop() {
    var button = document.querySelector('.back-to-top');

    if (!button) {
      return;
    }

    window.addEventListener('scroll', function () {
      button.classList.toggle('is-visible', window.scrollY > 500);
    }, { passive: true });

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initImageFallbacks() {
    Array.prototype.forEach.call(document.querySelectorAll('img'), function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing-cover');
      });
    });
  }

  function initPlayers() {
    Array.prototype.forEach.call(document.querySelectorAll('.player-card'), function (card) {
      var video = card.querySelector('video[data-m3u8]');
      var overlay = card.querySelector('.play-overlay');

      if (!video) {
        return;
      }

      function loadAndPlay() {
        var source = video.getAttribute('data-m3u8');

        if (!source) {
          return;
        }

        if (overlay) {
          overlay.classList.add('is-hidden');
        }

        if (video.dataset.loaded === 'true') {
          video.play().catch(function () {});
          return;
        }

        video.dataset.loaded = 'true';

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              hls.destroy();
              video.src = source;
              video.play().catch(function () {});
            }
          });
          video._hls = hls;
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
          return;
        }

        video.src = source;
        video.play().catch(function () {});
      }

      if (overlay) {
        overlay.addEventListener('click', loadAndPlay);
      }

      video.addEventListener('play', loadAndPlay, { once: true });
    });
  }

  function initSearchPage() {
    var page = document.querySelector('[data-search-page]');

    if (!page || !window.MOVIE_INDEX) {
      return;
    }

    var form = page.querySelector('.search-page-form');
    var input = page.querySelector('[data-search-input]');
    var summary = page.querySelector('[data-search-summary]');
    var results = page.querySelector('[data-search-results]');
    var fallback = page.querySelector('[data-search-fallback]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card is-compact" data-search="">',
        '  <a class="movie-card-link" href="' + escapeAttribute(movie.url) + '">',
        '    <figure class="poster-frame">',
        '      <img class="poster-image" src="' + escapeAttribute(movie.cover) + '" alt="' + escapeAttribute(movie.title) + '" loading="lazy" decoding="async">',
        '      <span class="play-mark">▶</span>',
        '      <figcaption>' + escapeHtml(movie.year) + '</figcaption>',
        '    </figure>',
        '    <div class="movie-card-body">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine || '') + '</p>',
        '      <div class="meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
        '      <div class="tag-row">' + tags + '</div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function runSearch(query) {
      var clean = query.trim().toLowerCase();

      if (!clean) {
        results.innerHTML = '';
        if (fallback) {
          fallback.hidden = false;
        }
        if (summary) {
          summary.textContent = '输入关键词后显示搜索结果。';
        }
        return;
      }

      var terms = clean.split(/\s+/).filter(Boolean);
      var matches = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();

        return terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
      }).slice(0, 120);

      results.innerHTML = matches.map(card).join('');
      if (fallback) {
        fallback.hidden = true;
      }
      if (summary) {
        summary.textContent = '关键词“' + query + '”找到 ' + matches.length + ' 条结果，最多显示前 120 条。';
      }
      initImageFallbacks();
    }

    if (input) {
      input.value = initialQuery;
      input.addEventListener('input', function () {
        runSearch(input.value);
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input ? input.value : '';
        var url = new URL(window.location.href);
        url.searchParams.set('q', query);
        window.history.replaceState({}, '', url.toString());
        runSearch(query);
      });
    }

    runSearch(initialQuery);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/\n/g, ' ');
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initFilters();
    initBackToTop();
    initImageFallbacks();
    initPlayers();
    initSearchPage();
  });
}());
