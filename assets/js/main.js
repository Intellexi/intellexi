/* INTELLEXI — behavior layer
   Everything here is progressive enhancement: the site is fully usable
   with JavaScript disabled. */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header state ---------------------------------------------------------- */

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Mobile navigation ------------------------------------------------------ */

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "{ close }" : "{ menu }";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "{ menu }";
      }
    });
  }

  /* Scroll reveals --------------------------------------------------------- */

  var revealed = document.querySelectorAll(".reveal");
  if (revealed.length && "IntersectionObserver" in window && !reducedMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealed.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealed.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // Failsafe: instant jumps (End key, anchor links) can outrun the observer —
  // sweep anything already above the fold on every frame the user scrolls.
  if (revealed.length && !reducedMotion) {
    var sweeping = false;
    var sweep = function () {
      sweeping = false;
      var limit = window.innerHeight * 0.96;
      revealed.forEach(function (el) {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < limit) {
          el.classList.add("is-visible");
        }
      });
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!sweeping) {
          sweeping = true;
          requestAnimationFrame(sweep);
        }
      },
      { passive: true }
    );
    window.addEventListener("load", sweep);
  }

  /* Headline decode ---------------------------------------------------------
     "Be understood." resolves out of noise, character by character —
     understanding emerging from static. */

  var decodeTarget = document.querySelector("[data-decode]");
  if (decodeTarget && !reducedMotion) {
    var finalText = decodeTarget.textContent;
    decodeTarget.setAttribute("aria-label", finalText);
    var holder = document.createElement("span");
    holder.setAttribute("aria-hidden", "true");
    decodeTarget.textContent = "";
    decodeTarget.appendChild(holder);

    var GLYPHS = "intelexi{}<>/·»abcdehmorsu";
    var chars = finalText.split("").map(function (ch, i) {
      var span = document.createElement("span");
      span.className = "glyph";
      var still = ch === " " || ch === "." || ch === "\n";
      span.textContent = still ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      if (!still) span.classList.add("is-noise");
      holder.appendChild(span);
      return {
        el: span,
        ch: ch,
        still: still,
        lockAt: 420 + i * 52 + Math.random() * 160
      };
    });

    var decodeStart = performance.now();
    (function tick(now) {
      var pending = false;
      var elapsed = now - decodeStart;
      chars.forEach(function (c) {
        if (c.still || !c.el.classList.contains("is-noise")) return;
        if (elapsed >= c.lockAt) {
          c.el.textContent = c.ch;
          c.el.classList.remove("is-noise");
        } else {
          if (Math.random() < 0.35) {
            c.el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          pending = true;
        }
      });
      if (pending) requestAnimationFrame(tick);
    })(decodeStart);
  }

  /* Card spotlight ----------------------------------------------------------- */

  if (!reducedMotion) {
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - rect.left + "px");
        card.style.setProperty("--my", e.clientY - rect.top + "px");
      });
    });
  }

  /* Footer year ------------------------------------------------------------ */

  var year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  /* The Loom ---------------------------------------------------------------
     Hero canvas: drifting points weaving a living lattice. Threads of the
     old craft joining into a network — quiet, slow, deliberate. Skipped
     entirely for users who prefer reduced motion. */

  var mount = document.querySelector(".hero-canvas");
  if (!mount || reducedMotion) return;

  var canvas = document.createElement("canvas");
  mount.prepend(canvas);
  var ctx = canvas.getContext("2d");

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0;
  var H = 0;
  var nodes = [];
  var pulses = [];
  var pointer = { x: -9999, y: -9999 };
  var LINK_DIST = 130;
  var running = true;

  function accentColor() {
    var v = getComputedStyle(document.documentElement).getPropertyValue("--blue-bright").trim();
    return v || "#8fa2ff";
  }
  var ACCENT = accentColor();

  function resize() {
    var rect = mount.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var target = Math.min(110, Math.round((W * H) / 16000));
    nodes = [];
    for (var i = 0; i < target; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 0.8 + Math.random() * 1.4
      });
    }
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);

    var i, j, a, b;
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];

      // gentle pull toward the pointer — the loom notices you
      var pdx = pointer.x - a.x;
      var pdy = pointer.y - a.y;
      var pd2 = pdx * pdx + pdy * pdy;
      if (pd2 < 240 * 240 && pd2 > 1) {
        var pd = Math.sqrt(pd2);
        a.vx += (pdx / pd) * 0.008;
        a.vy += (pdy / pd) * 0.008;
      }

      a.x += a.vx;
      a.y += a.vy;
      a.vx *= 0.995;
      a.vy *= 0.995;

      if (a.x < -20) a.x = W + 20;
      if (a.x > W + 20) a.x = -20;
      if (a.y < -20) a.y = H + 20;
      if (a.y > H + 20) a.y = -20;
    }

    ctx.strokeStyle = ACCENT;
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      for (j = i + 1; j < nodes.length; j++) {
        b = nodes[j];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          var t = 1 - Math.sqrt(d2) / LINK_DIST;
          ctx.globalAlpha = t * 0.13;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = ACCENT;
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Signal pulses — a spark of understanding travels a thread */
    if (pulses.length < 6 && Math.random() < 0.03 && nodes.length > 1) {
      a = nodes[Math.floor(Math.random() * nodes.length)];
      var best = null;
      for (j = 0; j < nodes.length; j++) {
        b = nodes[j];
        if (b === a) continue;
        var ddx = a.x - b.x;
        var ddy = a.y - b.y;
        if (ddx * ddx + ddy * ddy < LINK_DIST * LINK_DIST) {
          best = b;
          break;
        }
      }
      if (best) pulses.push({ a: a, b: best, t: 0 });
    }
    for (i = pulses.length - 1; i >= 0; i--) {
      var p = pulses[i];
      p.t += 0.022;
      if (p.t >= 1) {
        pulses.splice(i, 1);
        continue;
      }
      var px = p.a.x + (p.b.x - p.a.x) * p.t;
      var py = p.a.y + (p.b.y - p.a.y) * p.t;
      var fade = Math.sin(p.t * Math.PI);
      ctx.globalAlpha = fade * 0.35;
      ctx.beginPath();
      ctx.moveTo(p.a.x, p.a.y);
      ctx.lineTo(p.b.x, p.b.y);
      ctx.stroke();
      ctx.globalAlpha = fade * 0.9;
      ctx.beginPath();
      ctx.arc(px, py, 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = fade * 0.25;
      ctx.beginPath();
      ctx.arc(px, py, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(frame);
  }

  /* Hero parallax — content drifts and settles as you leave the fold */
  var heroSection = mount.closest(".hero");
  var heroContent = heroSection.querySelector(".container");
  var parallaxQueued = false;
  function parallax() {
    parallaxQueued = false;
    var y = window.scrollY;
    var h = heroSection.offsetHeight || 1;
    if (y < h) {
      heroContent.style.transform = "translateY(" + y * 0.16 + "px)";
      heroContent.style.opacity = String(Math.max(0, 1 - y / (h * 0.85)));
      mount.style.opacity = String(Math.max(0, 1 - y / h));
    }
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!parallaxQueued) {
        parallaxQueued = true;
        requestAnimationFrame(parallax);
      }
    },
    { passive: true }
  );

  mount.closest(".hero").addEventListener("pointermove", function (e) {
    var rect = mount.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });
  mount.closest(".hero").addEventListener("pointerleave", function () {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  // pause when the hero is off-screen or the tab is hidden
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting && !document.hidden;
      if (visible && !running) {
        running = true;
        requestAnimationFrame(frame);
      } else if (!visible) {
        running = false;
      }
    }).observe(mount);
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();
  requestAnimationFrame(frame);
})();
