(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                activate(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                activate(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    const filterPanels = Array.from(document.querySelectorAll('[data-filter-panel]'));

    filterPanels.forEach(function (panel) {
        const container = panel.parentElement || document;
        const input = panel.querySelector('[data-filter-input]');
        const year = panel.querySelector('[data-filter-year]');
        const type = panel.querySelector('[data-filter-type]');
        const list = container.querySelector('[data-movie-list]');
        const empty = container.querySelector('[data-empty-state]');

        if (!list) {
            return;
        }

        const cards = Array.from(list.children);
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');

        if (input && query) {
            input.value = query;
        }

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function cardText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].map(normalize).join(' ');
        }

        function applyFilter() {
            const text = normalize(input ? input.value : '');
            const yearValue = normalize(year ? year.value : '');
            const typeValue = normalize(type ? type.value : '');
            let visible = 0;

            cards.forEach(function (card) {
                const matchesText = !text || cardText(card).includes(text);
                const matchesYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                const matchesType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
                const show = matchesText && matchesYear && matchesType;

                card.style.display = show ? '' : 'none';

                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    });
})();
