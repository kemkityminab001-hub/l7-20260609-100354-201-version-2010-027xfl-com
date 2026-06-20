(function () {
    var body = document.body;
    var toggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            body.classList.toggle('nav-open', open);
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = Number(dot.getAttribute('data-hero-dot')) || 0;
            showSlide(index);
            startHero();
        });
    });

    startHero();

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupFilter(panel) {
        var parent = panel.parentElement || document;
        var input = panel.querySelector('.movie-search');
        var year = panel.querySelector('.filter-year');
        var type = panel.querySelector('.filter-type');
        var reset = panel.querySelector('.filter-reset');
        var cards = Array.prototype.slice.call(parent.querySelectorAll('.searchable-card'));

        function apply() {
            var q = normalize(input && input.value);
            var y = normalize(year && year.value);
            var t = normalize(type && type.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-keywords')
                ].join(' '));
                var okQuery = !q || haystack.indexOf(q) !== -1;
                var okYear = !y || normalize(card.getAttribute('data-year')) === y;
                var okType = !t || normalize(card.getAttribute('data-type')) === t;
                card.classList.toggle('is-hidden', !(okQuery && okYear && okType));
            });
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (type) {
                    type.value = '';
                }
                apply();
            });
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('.filter-panel')).forEach(setupFilter);
})();
