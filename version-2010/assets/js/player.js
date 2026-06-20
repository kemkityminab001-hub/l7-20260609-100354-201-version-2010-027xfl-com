(function () {
    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
        script.onload = callback;
        script.onerror = callback;
        document.head.appendChild(script);
    }

    function setup(player) {
        const video = player.querySelector('video');
        const overlay = player.querySelector('.player-overlay');

        if (!video || !overlay) {
            return;
        }

        const source = video.getAttribute('data-hls');
        let attached = false;
        let hls = null;

        function attachSource() {
            if (attached || !source) {
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function play() {
            loadHls(function () {
                attachSource();
                overlay.classList.add('is-hidden');
                video.setAttribute('controls', 'controls');
                const promise = video.play();

                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            });
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!attached) {
                play();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(setup);
})();
