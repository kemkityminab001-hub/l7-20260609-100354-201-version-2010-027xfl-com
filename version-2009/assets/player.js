(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-player');
    var cover = document.getElementById('player-cover');
    if (!video || !source) {
      return;
    }

    var hlsInstance = null;
    var initialized = false;

    var start = function () {
      if (initialized) {
        video.play().catch(function () {});
        return;
      }
      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      if (cover) {
        cover.classList.add('hidden');
      }
      video.play().catch(function () {});
    };

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
