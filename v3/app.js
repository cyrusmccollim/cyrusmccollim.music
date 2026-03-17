const audioData = {
  "original": {
    "Acoustic": [
      "original/acoustic/Halloween Mischief.mp3",
      "original/acoustic/The Instigator Variation.mp3",
      "original/acoustic/The Instigator.mp3",
      "original/acoustic/Western Suite.mp3"
    ],
    "Orchestral": [
      "original/orchestral/Alarms Triggered.wav",
      "original/orchestral/Breach Protocol.mp3",
      "original/orchestral/Extraction Operation.wav",
      "original/orchestral/Falling.mp3"
    ],
    "Piano": [
      "original/piano/Falling.wav",
      "original/piano/Gentle Goodbye.wav",
      "original/piano/Memory.wav"
    ]
  }
};

const AUDIO_BASE = "../files/audio/";
const IS_OPEN_TO_COMMISSIONS = false;
const WAVEFORM_BARS = 70;

var currentAudio = null;
var currentTrackEl = null;
var currentTab = "original";
var isPlaying = false;
var isSeeking = false;
var isStickySeek = false;
var durations = {};
var waveformCache = {};
var audioCtx = null;

if (typeof CanvasRenderingContext2D !== "undefined" &&
    !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (r > h / 2) r = h / 2;
    if (r > w / 2) r = w / 2;
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.arcTo(x + w, y, x + w, y + r, r);
    this.lineTo(x + w, y + h - r);
    this.arcTo(x + w, y + h, x + w - r, y + h, r);
    this.lineTo(x + r, y + h);
    this.arcTo(x, y + h, x, y + h - r, r);
    this.lineTo(x, y + r);
    this.arcTo(x, y, x + r, y, r);
    this.closePath();
    return this;
  };
}

var trackList = document.getElementById("track-list");
var stickyPlayer = document.getElementById("sticky-player");
var stickyTitle = document.getElementById("sticky-title");
var stickyPlayBtn = document.getElementById("sticky-play-btn");
var stickyProgress = document.getElementById("sticky-progress");
var stickyProgressFill = document.getElementById("sticky-progress-fill");
var stickyProgressHandle = document.getElementById("sticky-progress-handle");
var stickyTime = document.getElementById("sticky-time");
var volumeSlider = document.getElementById("volume-slider");
var emailBtn = document.getElementById("email-btn");
var emailTooltip = document.getElementById("email-tooltip");
var nav = document.getElementById("nav");
var hamburger = document.getElementById("hamburger");
var mobileNav = document.getElementById("mobile-nav");

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  var m = Math.floor(s / 60);
  var sec = Math.floor(s % 60);
  return m + ":" + (sec < 10 ? "0" : "") + sec;
}

function getTrackName(path) {
  return decodeURIComponent(path.split("/").pop().replace(/\.\w+$/, ""));
}

function getFileKey(path) {
  return path.split("/").pop().replace(/\.\w+$/, "");
}

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function computePeaks(audioBuffer, barCount) {
  var channelData = audioBuffer.getChannelData(0);
  var samplesPerBar = Math.floor(channelData.length / barCount);
  var peaks = [];
  for (var i = 0; i < barCount; i++) {
    var start = i * samplesPerBar;
    var end = start + samplesPerBar;
    var max = 0;
    for (var j = start; j < end; j++) {
      var abs = Math.abs(channelData[j]);
      if (abs > max) max = abs;
    }
    peaks.push(max);
  }
  var globalMax = 0;
  for (var k = 0; k < peaks.length; k++) {
    if (peaks[k] > globalMax) globalMax = peaks[k];
  }
  if (globalMax > 0) {
    for (var k = 0; k < peaks.length; k++) {
      peaks[k] = peaks[k] / globalMax;
    }
  }
  return peaks;
}

function loadWaveform(path, canvas) {
  if (waveformCache[path]) {
    drawWaveform(canvas, waveformCache[path], 0);
    return;
  }

  fetch(AUDIO_BASE + path)
    .then(function(res) { return res.arrayBuffer(); })
    .then(function(buf) {
      return getAudioContext().decodeAudioData(buf);
    })
    .then(function(audioBuffer) {
      durations[path] = audioBuffer.duration;
      var el = canvas.closest(".track-item");
      if (el) {
        var td = el.querySelector(".time-display");
        if (td) td.textContent = "0:00 / " + formatTime(audioBuffer.duration);
      }
      var peaks = computePeaks(audioBuffer, WAVEFORM_BARS);
      waveformCache[path] = peaks;
      drawWaveform(canvas, peaks, 0);
    })
    .catch(function() {
      var peaks = [];
      for (var i = 0; i < WAVEFORM_BARS; i++) peaks.push(0.15);
      waveformCache[path] = peaks;
      drawWaveform(canvas, peaks, 0);
    });
}

function drawWaveform(canvas, peaks, playedPct) {
  var ctx = canvas.getContext("2d");
  var dpr = window.devicePixelRatio || 1;
  var w = canvas.clientWidth;
  var h = canvas.clientHeight;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  var barCount = peaks.length;
  var gap = 2;
  var barWidth = (w - gap * (barCount - 1)) / barCount;
  if (barWidth < 1) barWidth = 1;
  var minBarH = 2;
  var maxBarH = h;
  var centerY = h / 2;

  for (var i = 0; i < barCount; i++) {
    var barH = Math.max(minBarH, peaks[i] * maxBarH);
    var x = i * (barWidth + gap);
    var barPct = (x + barWidth) / w;

    if (barPct <= playedPct) {
      ctx.fillStyle = "#c9a84c";
    } else if (x / w < playedPct) {
      ctx.fillStyle = "#c9a84c";
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    }

    var y = centerY - barH / 2;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barH, 1);
    ctx.fill();
  }
}

function renderTracks(tab) {
  trackList.textContent = "";
  var data = audioData[tab];
  if (!data || Object.keys(data).length === 0) {
    var empty = document.createElement("p");
    empty.className = "loading-state";
    empty.textContent = "No tracks available yet.";
    trackList.appendChild(empty);
    return;
  }

  Object.entries(data).forEach(function(entry) {
    var category = entry[0];
    var tracks = entry[1];

    var block = document.createElement("div");
    block.className = "category-block reveal";

    var header = document.createElement("div");
    header.className = "category-header";

    var catName = document.createElement("span");
    catName.className = "category-name";
    catName.textContent = category;

    var catCount = document.createElement("span");
    catCount.className = "category-count";
    catCount.textContent = tracks.length + " track" + (tracks.length !== 1 ? "s" : "");

    header.appendChild(catName);
    header.appendChild(catCount);
    block.appendChild(header);

    var grid = document.createElement("div");
    grid.className = "track-grid";

    tracks.forEach(function(path, idx) {
      var name = getTrackName(path);
      var dur = durations[path] ? formatTime(durations[path]) : "—:——";

      var item = document.createElement("div");
      item.className = "track-item";
      item.dataset.path = path;

      var topRow = document.createElement("div");
      topRow.className = "track-top-row";

      var info = document.createElement("div");
      info.className = "track-info";

      var num = document.createElement("span");
      num.className = "track-number";
      num.textContent = String(idx + 1).padStart(2, "0");

      var title = document.createElement("span");
      title.className = "track-title";
      title.textContent = name;

      info.appendChild(num);
      info.appendChild(title);

      var eqBars = document.createElement("div");
      eqBars.className = "eq-bars";
      for (var b = 0; b < 4; b++) eqBars.appendChild(document.createElement("span"));
      info.appendChild(eqBars);

      var actions = document.createElement("div");
      actions.className = "track-actions";

      var copyBtn = document.createElement("button");
      copyBtn.className = "track-action-btn copy-btn";
      copyBtn.dataset.path = path;
      copyBtn.setAttribute("aria-label", "Copy link for " + name);
      copyBtn.title = "Copy track link";

      var copySvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      copySvg.setAttribute("viewBox", "0 0 24 24");
      copySvg.setAttribute("fill", "none");
      copySvg.setAttribute("stroke", "currentColor");
      copySvg.setAttribute("stroke-width", "2");
      copySvg.setAttribute("stroke-linecap", "round");
      copySvg.setAttribute("stroke-linejoin", "round");
      var p1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p1.setAttribute("d", "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71");
      var p2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p2.setAttribute("d", "M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71");
      copySvg.appendChild(p1);
      copySvg.appendChild(p2);
      copyBtn.appendChild(copySvg);
      actions.appendChild(copyBtn);

      topRow.appendChild(info);
      topRow.appendChild(actions);

      var controls = document.createElement("div");
      controls.className = "track-controls";

      var playBtn = document.createElement("button");
      playBtn.className = "play-btn";
      playBtn.setAttribute("aria-label", "Play " + name);
      var playIcon = document.createElement("span");
      playIcon.className = "play-icon";
      playBtn.appendChild(playIcon);

      var progressContainer = document.createElement("div");
      progressContainer.className = "progress-container";
      var waveCanvas = document.createElement("canvas");
      waveCanvas.className = "waveform-canvas";
      waveCanvas.dataset.path = path;
      progressContainer.appendChild(waveCanvas);

      var timeDisplay = document.createElement("span");
      timeDisplay.className = "time-display";
      timeDisplay.textContent = "0:00 / " + dur;

      controls.appendChild(playBtn);
      controls.appendChild(progressContainer);
      controls.appendChild(timeDisplay);

      item.appendChild(topRow);
      item.appendChild(controls);
      grid.appendChild(item);
    });

    block.appendChild(grid);
    trackList.appendChild(block);
  });

  observeReveals();
  highlightFromURL();
  loadVisibleWaveforms();
}

function loadVisibleWaveforms() {
  var canvases = document.querySelectorAll(".waveform-canvas");
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var canvas = entry.target;
        loadWaveform(canvas.dataset.path, canvas);
        observer.unobserve(canvas);
      }
    });
  }, { rootMargin: "200px" });
  canvases.forEach(function(c) { observer.observe(c); });
}

document.querySelectorAll(".music-tab").forEach(function(tab) {
  tab.addEventListener("click", function() {
    document.querySelectorAll(".music-tab").forEach(function(t) { t.classList.remove("active"); });
    tab.classList.add("active");
    currentTab = tab.dataset.tab;
    renderTracks(currentTab);
  });
});

trackList.addEventListener("click", function(e) {
  var playBtn = e.target.closest(".play-btn");
  var copyBtn = e.target.closest(".copy-btn");

  if (copyBtn) {
    var path = copyBtn.dataset.path;
    var key = getFileKey(path);
    var url = window.location.origin + window.location.pathname + "?track=" + encodeURIComponent(key);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function() {
        copyBtn.classList.add("copy-success");
        setTimeout(function() { copyBtn.classList.remove("copy-success"); }, 1500);
      }).catch(function() {
        fallbackCopy(url, copyBtn);
      });
    } else {
      fallbackCopy(url, copyBtn);
    }
    return;
  }

  if (!playBtn) return;

  var item = playBtn.closest(".track-item");
  var path = item.dataset.path;

  if (currentTrackEl === item && currentAudio) {
    if (isPlaying) {
      currentAudio.pause();
      setPlayingState(false);
    } else {
      currentAudio.play().catch(handlePlayError);
      setPlayingState(true);
    }
    return;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    if (currentTrackEl) {
      currentTrackEl.classList.remove("active-track", "playing");
      resetTrackUI(currentTrackEl);
    }
  }

  currentAudio = new Audio(AUDIO_BASE + path);
  currentAudio.volume = parseFloat(volumeSlider.value);
  currentTrackEl = item;
  item.classList.add("active-track", "playing");

  currentAudio.play().then(function() {
    setPlayingState(true);
    showStickyPlayer(getTrackName(path));
  }).catch(function(err) {
    handlePlayError(err);
    item.classList.remove("active-track", "playing");
    currentTrackEl = null;
  });

  currentAudio.addEventListener("timeupdate", updateProgress);
  currentAudio.addEventListener("ended", function() {
    setPlayingState(false);
    resetTrackUI(item);
    item.classList.remove("active-track", "playing");
    stickyPlayer.classList.remove("visible");
    currentTrackEl = null;
  });
  currentAudio.addEventListener("loadedmetadata", function() {
    durations[path] = currentAudio.duration;
    var td = item.querySelector(".time-display");
    if (td) td.textContent = "0:00 / " + formatTime(currentAudio.duration);
  });
});

function handlePlayError(err) {
  if (err.name !== "AbortError") {
    console.warn("Playback failed:", err.message);
  }
}

function fallbackCopy(text, btn) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    btn.classList.add("copy-success");
    setTimeout(function() { btn.classList.remove("copy-success"); }, 1500);
  } catch (e) {}
  document.body.removeChild(ta);
}

function setPlayingState(playing) {
  isPlaying = playing;
  if (currentTrackEl) {
    var icon = currentTrackEl.querySelector(".play-btn .play-icon, .play-btn .pause-icon");
    if (icon) icon.className = playing ? "pause-icon" : "play-icon";
    if (playing) {
      currentTrackEl.classList.add("playing");
    } else {
      currentTrackEl.classList.remove("playing");
    }
  }
  var stickyIcon = stickyPlayBtn.querySelector(".play-icon, .pause-icon");
  if (stickyIcon) stickyIcon.className = playing ? "pause-icon" : "play-icon";
}

function resetTrackUI(el) {
  var canvas = el.querySelector(".waveform-canvas");
  if (canvas) {
    var path = canvas.dataset.path;
    var peaks = waveformCache[path];
    if (peaks) drawWaveform(canvas, peaks, 0);
  }
  el.classList.remove("playing");
}

function updateProgress() {
  if (!currentAudio || !currentTrackEl) return;
  var pct = (currentAudio.currentTime / currentAudio.duration) * 100 || 0;
  var pctDecimal = pct / 100;
  var timeStr = formatTime(currentAudio.currentTime) + " / " + formatTime(currentAudio.duration);

  if (!isSeeking) {
    var canvas = currentTrackEl.querySelector(".waveform-canvas");
    if (canvas) {
      var path = canvas.dataset.path;
      var peaks = waveformCache[path];
      if (peaks) drawWaveform(canvas, peaks, pctDecimal);
    }
    var td = currentTrackEl.querySelector(".time-display");
    if (td) td.textContent = timeStr;
  }

  if (!isStickySeek) {
    stickyProgressFill.style.width = pct + "%";
    stickyProgressHandle.style.left = pct + "%";
    stickyTime.textContent = timeStr;
  }
}

trackList.addEventListener("mousedown", startTrackSeek);
trackList.addEventListener("touchstart", startTrackSeek, { passive: false });

function startTrackSeek(e) {
  var container = e.target.closest(".track-item .progress-container");
  if (!container) return;
  var item = container.closest(".track-item");
  if (item !== currentTrackEl || !currentAudio) return;

  e.preventDefault();
  isSeeking = true;

  function doSeek(ev) {
    var rect = container.getBoundingClientRect();
    var clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    var pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    currentAudio.currentTime = pct * currentAudio.duration;

    var canvas = item.querySelector(".waveform-canvas");
    if (canvas) {
      var path = canvas.dataset.path;
      var peaks = waveformCache[path];
      if (peaks) drawWaveform(canvas, peaks, pct);
    }
  }

  doSeek(e);

  function onMove(ev) { doSeek(ev); }
  function onEnd() {
    isSeeking = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onEnd);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onEnd);
  }

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onEnd);
  document.addEventListener("touchmove", onMove, { passive: false });
  document.addEventListener("touchend", onEnd);
}

stickyProgress.addEventListener("mousedown", startStickySeek);
stickyProgress.addEventListener("touchstart", startStickySeek, { passive: false });

function startStickySeek(e) {
  if (!currentAudio) return;
  e.preventDefault();
  isStickySeek = true;

  function doSeek(ev) {
    var rect = stickyProgress.getBoundingClientRect();
    var clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    var pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    currentAudio.currentTime = pct * currentAudio.duration;
    stickyProgressFill.style.width = (pct * 100) + "%";
    stickyProgressHandle.style.left = (pct * 100) + "%";
  }

  doSeek(e);

  function onMove(ev) { doSeek(ev); }
  function onEnd() {
    isStickySeek = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onEnd);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onEnd);
  }

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onEnd);
  document.addEventListener("touchmove", onMove, { passive: false });
  document.addEventListener("touchend", onEnd);
}

function showStickyPlayer(title) {
  stickyTitle.textContent = title;
  stickyPlayer.classList.add("visible");
}

stickyPlayBtn.addEventListener("click", function() {
  if (!currentAudio) return;
  if (isPlaying) {
    currentAudio.pause();
    setPlayingState(false);
  } else {
    currentAudio.play().catch(handlePlayError);
    setPlayingState(true);
  }
});

volumeSlider.addEventListener("input", function() {
  if (currentAudio) currentAudio.volume = parseFloat(volumeSlider.value);
});

emailBtn.addEventListener("click", function() {
  var email = emailBtn.dataset.email;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(email).then(function() {
      emailTooltip.classList.add("show");
      setTimeout(function() { emailTooltip.classList.remove("show"); }, 2000);
    }).catch(function() {
      fallbackEmailCopy(email);
    });
  } else {
    fallbackEmailCopy(email);
  }
});

function fallbackEmailCopy(email) {
  var ta = document.createElement("textarea");
  ta.value = email;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    emailTooltip.classList.add("show");
    setTimeout(function() { emailTooltip.classList.remove("show"); }, 2000);
  } catch (e) {}
  document.body.removeChild(ta);
}

(function setCommissionStatus() {
  var status = document.getElementById("commission-status");
  var text = document.getElementById("commission-text");
  if (!status || !text) return;
  if (IS_OPEN_TO_COMMISSIONS) {
    status.classList.add("open");
    text.textContent = "Open for commissions";
  } else {
    status.classList.remove("open");
    text.textContent = "Commissions currently closed";
  }
})();

function highlightFromURL() {
  var params = new URLSearchParams(window.location.search);
  var trackParam = params.get("track");
  if (!trackParam) return;

  var items = document.querySelectorAll(".track-item");
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var key = getFileKey(item.dataset.path);
    if (key === trackParam) {
      item.style.outline = "2px solid var(--gold)";
      item.style.outlineOffset = "2px";
      requestAnimationFrame(function() {
        item.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      setTimeout(function() {
        item.style.outline = "";
        item.style.outlineOffset = "";
      }, 3000);
      break;
    }
  }
}

window.addEventListener("scroll", function() {
  if (window.scrollY > 80) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
}, { passive: true });

hamburger.addEventListener("click", function() {
  var isOpen = hamburger.classList.toggle("open");
  mobileNav.classList.toggle("open");
  document.body.classList.toggle("nav-open", isOpen);
});

mobileNav.querySelectorAll("a").forEach(function(link) {
  link.addEventListener("click", function() {
    hamburger.classList.remove("open");
    mobileNav.classList.remove("open");
    document.body.classList.remove("nav-open");
  });
});

function observeReveals() {
  var els = document.querySelectorAll(".reveal:not(.visible)");
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  els.forEach(function(el) { observer.observe(el); });
}

(function initCanvas() {
  var canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var w, h, particles;
  var resizeTimer;
  var animId;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    var count = Math.min(60, Math.floor((w * h) / 25000));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.3 + 0.05
      });
    }
  }

  function draw() {
    if (document.hidden) {
      animId = requestAnimationFrame(draw);
      return;
    }
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(201, 168, 76, " + p.opacity + ")";
      ctx.fill();
    }
    animId = requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener("resize", function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      resize();
      createParticles();
    }, 150);
  });
})();

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape" && mobileNav.classList.contains("open")) {
    hamburger.classList.remove("open");
    mobileNav.classList.remove("open");
    document.body.classList.remove("nav-open");
  }
});

renderTracks(currentTab);
observeReveals();
