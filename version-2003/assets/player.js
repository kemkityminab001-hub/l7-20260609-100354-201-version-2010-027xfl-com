(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function fetchLibrary(done, fail) {
        if (window.Hls) {
            done();
            return;
        }
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
        script.onload = done;
        script.onerror = fail;
        document.head.appendChild(script);
    }

    function initVideoPlayer(mediaUrl) {
        ready(function () {
            var video = document.querySelector("[data-player-video]");
            var overlay = document.querySelector("[data-player-overlay]");
            var loading = document.querySelector("[data-player-loading]");
            if (!video || !mediaUrl) {
                return;
            }
            var attached = false;
            var hlsReady = false;

            function busy(value) {
                if (loading) {
                    loading.classList.toggle("is-visible", value);
                }
            }

            function hideOverlay() {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            }

            function showOverlay() {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            }

            function attach(after) {
                if (attached && hlsReady) {
                    after();
                    return;
                }
                busy(true);
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    if (!attached) {
                        video.src = mediaUrl;
                        attached = true;
                    }
                    hlsReady = true;
                    busy(false);
                    after();
                    return;
                }
                fetchLibrary(function () {
                    if (window.Hls && window.Hls.isSupported()) {
                        if (!attached) {
                            var hls = new window.Hls({ enableWorker: true });
                            hls.loadSource(mediaUrl);
                            hls.attachMedia(video);
                            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                                hlsReady = true;
                                busy(false);
                                after();
                            });
                            hls.on(window.Hls.Events.ERROR, function () {
                                busy(false);
                            });
                            attached = true;
                        }
                    } else {
                        video.src = mediaUrl;
                        attached = true;
                        hlsReady = true;
                        busy(false);
                        after();
                    }
                }, function () {
                    video.src = mediaUrl;
                    attached = true;
                    hlsReady = true;
                    busy(false);
                    after();
                });
            }

            function play() {
                hideOverlay();
                attach(function () {
                    var result = video.play();
                    if (result && typeof result.catch === "function") {
                        result.catch(function () {
                            showOverlay();
                        });
                    }
                });
            }

            if (overlay) {
                overlay.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", hideOverlay);
            video.addEventListener("ended", showOverlay);
        });
    }

    window.initVideoPlayer = initVideoPlayer;
})();
