async function loadHls(video, source) {
    if (!source) {
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
    }

    try {
        const module = await import('./hls-vendor.js');
        const Hls = module.H;
        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
            return;
        }
    } catch (error) {
        video.dataset.ready = 'fallback';
    }

    video.src = source;
}

function setupPlayer(shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.player-overlay');
    const source = shell.getAttribute('data-src');

    if (!video || !source) {
        return;
    }

    loadHls(video, source);

    async function playVideo() {
        shell.classList.add('is-playing');
        try {
            await video.play();
        } catch (error) {
            shell.classList.remove('is-playing');
        }
    }

    if (button) {
        button.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
        shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
            shell.classList.remove('is-playing');
        }
    });
}

Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(setupPlayer);
