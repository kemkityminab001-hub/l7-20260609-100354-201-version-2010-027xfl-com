document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setSlide(current + 1);
    }, 5200);
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function applyFilter(value) {
    var query = String(value || '').trim().toLowerCase();
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-meta') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
      card.classList.toggle('hidden-card', query && haystack.indexOf(query) === -1);
    });
  }

  filterInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      applyFilter(input.value);
    });
  });

  var searchInput = document.querySelector('#searchInput');
  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q') || '';
    if (keyword) {
      searchInput.value = keyword;
      applyFilter(keyword);
    }
  }
});
