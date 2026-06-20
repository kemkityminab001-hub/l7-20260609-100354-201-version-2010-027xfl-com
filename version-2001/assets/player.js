document.addEventListener('DOMContentLoaded', function () {
  var player = document.querySelector('[data-video]');
  if (!player) {
    return;
  }

  var streamUrl = player.getAttribute('data-video');
  var video = player.querySelector('video');
  var cover = player.querySelector('.player-cover');
  var button = player.querySelector('.play-trigger');
  var hlsReady = false;

  function begin() {
    if (!video || !streamUrl) {
      return;
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.setAttribute('controls', 'controls');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.getAttribute('src') !== streamUrl) {
        video.setAttribute('src', streamUrl);
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsReady) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hlsReady = true;
      }
      video.play().catch(function () {});
      return;
    }

    if (video.getAttribute('src') !== streamUrl) {
      video.setAttribute('src', streamUrl);
    }
    video.play().catch(function () {});
  }

  if (button) {
    button.addEventListener('click', begin);
  }
  if (cover) {
    cover.addEventListener('click', begin);
  }
  if (video) {
    video.addEventListener('click', begin);
  }
});
