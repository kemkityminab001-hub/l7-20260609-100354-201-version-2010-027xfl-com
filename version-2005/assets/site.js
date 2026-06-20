(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let active = 0;
        let timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const index = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(index);
                restart();
            });
        });

        restart();
    }

    const filterPanels = document.querySelectorAll('[data-filter-panel]');

    filterPanels.forEach(function (panel) {
        const input = panel.querySelector('[data-filter-input]');
        const kindSelect = panel.querySelector('[data-filter-select="kind"]');
        const yearSelect = panel.querySelector('[data-filter-select="year"]');
        const categorySelect = panel.querySelector('[data-filter-select="category"]');
        const container = panel.parentElement.querySelector('[data-card-grid]') || document;
        const cards = Array.from(container.querySelectorAll('[data-card]'));

        function applyFilter() {
            const keyword = input ? input.value.trim().toLowerCase() : '';
            const kind = kindSelect ? kindSelect.value : '';
            const year = yearSelect ? yearSelect.value : '';
            const category = categorySelect ? categorySelect.value : '';

            cards.forEach(function (card) {
                const text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-kind'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-category')
                ].join(' ').toLowerCase();

                const matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                const matchesKind = !kind || (card.getAttribute('data-kind') || '').indexOf(kind) !== -1;
                const matchesYear = !year || (card.getAttribute('data-year') || '').indexOf(year) !== -1;
                const matchesCategory = !category || (card.getAttribute('data-category') || '').indexOf(category) !== -1;

                card.hidden = !(matchesKeyword && matchesKind && matchesYear && matchesCategory);
            });
        }

        [input, kindSelect, yearSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q');
        if (input && initial) {
            input.value = initial;
            applyFilter();
        }
    });

    const players = document.querySelectorAll('[data-player]');

    players.forEach(function (player) {
        const video = player.querySelector('video');
        const overlay = player.querySelector('.watch-overlay');
        const stream = player.getAttribute('data-stream');
        let hls = null;
        let attached = false;

        function attach() {
            if (!video || !stream || attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            if (video) {
                video.setAttribute('controls', 'controls');
                const result = video.play();
                if (result && result.catch) {
                    result.catch(function () {});
                }
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
}());
