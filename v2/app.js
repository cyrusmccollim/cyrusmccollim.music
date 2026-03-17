/* ═══════════════════════════════════════════════════════════════
   CYRUS McCOLLIM — Portfolio v2 — Application Logic
   ═══════════════════════════════════════════════════════════════ */

// ── Audio Data (auto-updated by GitHub Actions) ──────────────
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

// ── State ────────────────────────────────────────────────────
let currentAudio = null;
let currentTrackEl = null;
let currentTab = "original";
let isPlaying = false;
let isSeeking = false;
let isStickySeek = false;
let durations = {};

// ── DOM References ───────────────────────────────────────────
const trackList = document.getElementById("track-list");
const stickyPlayer = document.getElementById("sticky-player");
const stickyTitle = document.getElementById("sticky-title");
const stickyPlayBtn = document.getElementById("sticky-play-btn");
const stickyProgress = document.getElementById("sticky-progress");
const stickyProgressFill = document.getElementById("sticky-progress-fill");
const stickyProgressHandle = document.getElementById("sticky-progress-handle");
const stickyTime = document.getElementById("sticky-time");
const volumeSlider = document.getElementById("volume-slider");
const emailBtn = document.getElementById("email-btn");
const emailTooltip = document.getElementById("email-tooltip");
const nav = document.getElementById("nav");
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobile-nav");

// ── Utility ──────────────────────────────────────────────────
function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ":" + (sec < 10 ? "0" : "") + sec;
}

function getTrackName(path) {
  return decodeURIComponent(path.split("/").pop().replace(/\.\w+$/, ""));
}

function getFileKey(path) {
  return path.split("/").pop().replace(/\.\w+$/, "");
}

// ── Preload Durations ────────────────────────────────────────
function preloadDurations() {
  Object.values(audioData).forEach(function(tabData) {
    Object.values(tabData).forEach(function(tracks) {
      tracks.forEach(function(path) {
        var audio = new Audio();
        audio.preload = "metadata";
        audio.src = AUDIO_BASE + path;
        audio.addEventListener("loadedmetadata", function() {
          durations[path] = audio.duration;
          var el = document.querySelector('[data-path="' + CSS.escape(path) + '"] .time-display');
          if (el) el.textContent = "0:00 / " + formatTime(audio.duration);
        });
      });
    });
  });
}

// ── Build Track List (DOM-only, no innerHTML) ────────────────
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

    // Category block
    var block = document.createElement("div");
    block.className = "category-block reveal";

    // Category header
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

    // Track grid
    var grid = document.createElement("div");
    grid.className = "track-grid";

    tracks.forEach(function(path, idx) {
      var name = getTrackName(path);
      var dur = durations[path] ? formatTime(durations[path]) : "—:——";

      var item = document.createElement("div");
      item.className = "track-item";
      item.dataset.path = path;

      // ── Top row: number, title, copy button ──
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

      // EQ bars (shown when playing)
      var eqBars = document.createElement("div");
      eqBars.className = "eq-bars";
      for (var b = 0; b < 4; b++) eqBars.appendChild(document.createElement("span"));
      info.appendChild(eqBars);

      var actions = document.createElement("div");
      actions.className = "track-actions";

      var copyBtn = document.createElement("button");
      copyBtn.className = "track-action-btn copy-btn";
      copyBtn.dataset.path = path;
      copyBtn.setAttribute("aria-label", "Copy link");
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

      // ── Controls row: play, progress, time ──
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
      var progressTrack = document.createElement("div");
      progressTrack.className = "progress-track";
      var progressFill = document.createElement("div");
      progressFill.className = "progress-fill";
      var progressHandle = document.createElement("div");
      progressHandle.className = "progress-handle";
      progressTrack.appendChild(progressFill);
      progressTrack.appendChild(progressHandle);
      progressContainer.appendChild(progressTrack);

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
}

// ── Tabs ─────────────────────────────────────────────────────
document.querySelectorAll(".music-tab").forEach(function(tab) {
  tab.addEventListener("click", function() {
    document.querySelectorAll(".music-tab").forEach(function(t) { t.classList.remove("active"); });
    tab.classList.add("active");
    currentTab = tab.dataset.tab;
    renderTracks(currentTab);
  });
});

// ── Audio Playback ───────────────────────────────────────────
trackList.addEventListener("click", function(e) {
  var playBtn = e.target.closest(".play-btn");
  var copyBtn = e.target.closest(".copy-btn");

  if (copyBtn) {
    var path = copyBtn.dataset.path;
    var key = getFileKey(path);
    var url = window.location.origin + window.location.pathname + "?track=" + encodeURIComponent(key);
    navigator.clipboard.writeText(url).then(function() {
      copyBtn.classList.add("copy-success");
      setTimeout(function() { copyBtn.classList.remove("copy-success"); }, 1500);
    });
    return;
  }

  if (!playBtn) return;

  var item = playBtn.closest(".track-item");
  var path = item.dataset.path;

  // Same track — toggle
  if (currentTrackEl === item && currentAudio) {
    if (isPlaying) {
      currentAudio.pause();
      setPlayingState(false);
    } else {
      currentAudio.play();
      setPlayingState(true);
    }
    return;
  }

  // New track
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
  var fill = el.querySelector(".progress-fill");
  var handle = el.querySelector(".progress-handle");
  if (fill) fill.style.width = "0%";
  if (handle) handle.style.left = "0%";
  el.classList.remove("playing");
}

function updateProgress() {
  if (!currentAudio || !currentTrackEl) return;
  var pct = (currentAudio.currentTime / currentAudio.duration) * 100 || 0;
  var timeStr = formatTime(currentAudio.currentTime) + " / " + formatTime(currentAudio.duration);

  if (!isSeeking) {
    var fill = currentTrackEl.querySelector(".progress-fill");
    var handle = currentTrackEl.querySelector(".progress-handle");
    var td = currentTrackEl.querySelector(".time-display");
    if (fill) fill.style.width = pct + "%";
    if (handle) handle.style.left = pct + "%";
    if (td) td.textContent = timeStr;
  }

  if (!isStickySeek) {
    stickyProgressFill.style.width = pct + "%";
    stickyProgressHandle.style.left = pct + "%";
    stickyTime.textContent = timeStr;
  }
}

// ── Seeking (Track Progress) ─────────────────────────────────
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
    var fill = item.querySelector(".progress-fill");
    var handle = item.querySelector(".progress-handle");
    if (fill) fill.style.width = (pct * 100) + "%";
    if (handle) handle.style.left = (pct * 100) + "%";
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

// ── Seeking (Sticky Progress) ────────────────────────────────
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

// ── Sticky Player ────────────────────────────────────────────
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
    currentAudio.play();
    setPlayingState(true);
  }
});

// ── Volume ───────────────────────────────────────────────────
volumeSlider.addEventListener("input", function() {
  if (currentAudio) currentAudio.volume = parseFloat(volumeSlider.value);
});

// ── Email Copy ───────────────────────────────────────────────
emailBtn.addEventListener("click", function() {
  var email = emailBtn.dataset.email;
  navigator.clipboard.writeText(email).then(function() {
    emailTooltip.classList.add("show");
    setTimeout(function() { emailTooltip.classList.remove("show"); }, 2000);
  });
});

// ── Commission Status ────────────────────────────────────────
(function setCommissionStatus() {
  var dot = document.querySelector(".commission-status .status-dot");
  var text = document.getElementById("commission-text");
  if (!dot || !text) return;
  if (IS_OPEN_TO_COMMISSIONS) {
    dot.style.background = "#34d399";
    dot.style.boxShadow = "0 0 10px #34d399";
    text.textContent = "Open for commissions";
  } else {
    dot.style.background = "#9ca3af";
    dot.style.boxShadow = "0 0 10px #9ca3af";
    text.textContent = "Commissions currently closed";
  }
})();

// ── URL Parameter Support ────────────────────────────────────
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
      setTimeout(function() {
        item.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
      setTimeout(function() {
        item.style.outline = "";
        item.style.outlineOffset = "";
      }, 3000);
      break;
    }
  }
}

// ── Navigation Scroll State ──────────────────────────────────
window.addEventListener("scroll", function() {
  if (window.scrollY > 80) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
}, { passive: true });

// ── Hamburger Menu ───────────────────────────────────────────
hamburger.addEventListener("click", function() {
  hamburger.classList.toggle("open");
  mobileNav.classList.toggle("open");
});

mobileNav.querySelectorAll("a").forEach(function(link) {
  link.addEventListener("click", function() {
    hamburger.classList.remove("open");
    mobileNav.classList.remove("open");
  });
});

// ── Scroll Reveal ────────────────────────────────────────────
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

// ── Ambient Canvas ───────────────────────────────────────────
(function initCanvas() {
  var canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var w, h, particles;

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
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener("resize", function() { resize(); createParticles(); });
})();

// ── Init ─────────────────────────────────────────────────────
preloadDurations();
renderTracks(currentTab);
observeReveals();
