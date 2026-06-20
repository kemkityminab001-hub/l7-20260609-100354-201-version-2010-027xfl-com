(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var mobile = document.getElementById("mobileNav");
        if (!toggle || !mobile) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = mobile.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initMovieFilters() {
        var grid = document.getElementById("movieGrid");
        var search = document.getElementById("movieSearch");
        var empty = document.getElementById("emptyState");
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        if (!grid || !search) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var activeFilter = "all";
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (initial) {
            search.value = initial;
        }
        function apply() {
            var term = search.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var content = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
                var category = card.getAttribute("data-category") || "";
                var matchedTerm = !term || content.indexOf(term) !== -1;
                var matchedFilter = activeFilter === "all" || category === activeFilter;
                var ok = matchedTerm && matchedFilter;
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        search.addEventListener("input", apply);
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeFilter = chip.getAttribute("data-filter") || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                apply();
            });
        });
        apply();
    }

    function initBackTop() {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "back-top";
        button.textContent = "↑";
        button.setAttribute("aria-label", "返回顶部");
        document.body.appendChild(button);
        window.addEventListener("scroll", function () {
            button.classList.toggle("is-visible", window.scrollY > 560);
        });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initMovieFilters();
        initBackTop();
    });
})();
