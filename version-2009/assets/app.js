(function () {
  var body = document.body;
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(parseInt(dot.getAttribute('data-slide') || '0', 10));
      });
    });
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.getElementById('movieSearchInput');
  var categoryFilter = document.getElementById('movieCategoryFilter');
  var clearSearch = document.getElementById('clearSearch');
  var cards = Array.prototype.slice.call(document.querySelectorAll('#searchMovieGrid .movie-card'));
  var emptyState = document.getElementById('emptyState');

  if (searchInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      searchInput.value = initial;
    }

    var normalize = function (value) {
      return (value || '').toString().trim().toLowerCase();
    };

    var applyFilter = function () {
      var keyword = normalize(searchInput.value);
      var category = normalize(categoryFilter ? categoryFilter.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region')
        ].join(' '));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchCategory = !category || cardCategory === category;
        var show = matchKeyword && matchCategory;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    };

    searchInput.addEventListener('input', applyFilter);
    if (categoryFilter) {
      categoryFilter.addEventListener('change', applyFilter);
    }
    if (clearSearch) {
      clearSearch.addEventListener('click', function () {
        searchInput.value = '';
        if (categoryFilter) {
          categoryFilter.value = '';
        }
        applyFilter();
      });
    }
    applyFilter();
  }
})();
