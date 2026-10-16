/* Everything that moves. Each block works on its own and the page reads fine without any of it. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  if (!reduce && hasIO) root.classList.add("motion");

  // ---------- Theme ----------
  var toggle = $("[data-theme-toggle]");
  var media = window.matchMedia("(prefers-color-scheme: light)");
  function currentTheme() {
    var set = root.getAttribute("data-theme");
    return set === "light" || set === "dark" ? set : (media.matches ? "light" : "dark");
  }
  function syncTheme() {
    var t = currentTheme();
    if (toggle) {
      toggle.textContent = t === "dark" ? "Light" : "Dark"; // names the theme it switches to
      toggle.setAttribute("aria-pressed", String(t === "light"));
      toggle.setAttribute("aria-label", "Switch to " + (t === "dark" ? "light" : "dark") + " theme");
    }
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#0a0a0a" : "#eeedea");
  }
  if (toggle) toggle.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    syncTheme();
  });
  if (media.addEventListener) media.addEventListener("change", syncTheme);
  syncTheme();

  // ---------- Phone menu ----------
  var menu = $("[data-menu]");
  var list = $("#nav-list");
  function setMenu(open) {
    if (!list || !menu) return;
    list.classList.toggle("is-open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.textContent = open ? "Close" : "Menu";
  }
  if (menu && list) {
    menu.addEventListener("click", function () { setMenu(!list.classList.contains("is-open")); });
    list.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  // ---------- Current section in the nav ----------
  var navLinks = $$(".bar__links a");
  if (hasIO && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || !byId[entry.target.id]) return;
        navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
        byId[entry.target.id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }

  // ---------- Intro: "HELLO," / "HI, I'M" typed in turn ----------
  var hello = $("[data-hello]");
  if (hello && !reduce) {
    var greetings = ["HELLO,", "HI, I’M"], g = 0, gi = greetings[0].length, gDeleting = true;
    var helloTick = function () {
      var word = greetings[g];
      if (gDeleting) {
        hello.textContent = word.slice(0, --gi);
        if (gi <= 0) { gDeleting = false; g = (g + 1) % greetings.length; }
        setTimeout(helloTick, 60);
      } else {
        word = greetings[g];
        hello.textContent = word.slice(0, ++gi);
        if (gi >= word.length) { gDeleting = true; setTimeout(helloTick, 3200); } else setTimeout(helloTick, 110);
      }
    };
    setTimeout(helloTick, 2600);
  }

  // ---------- Corner brackets around the photo card ----------
  $$(".brackets").forEach(function (el) {
    for (var k = 0; k < 4; k++) {
      var i = document.createElement("i");
      i.className = "b";
      i.setAttribute("aria-hidden", "true");
      el.appendChild(i);
    }
  });

  // ---------- Marquee: duplicate the list for a seamless loop ----------
  $$(".marquee__track").forEach(function (track) {
    var lists = $$(".marquee__list", track);
    if (lists.length === 2) lists[1].innerHTML = lists[0].innerHTML;
  });

  // ---------- Skills: tap toggles a card on touch screens ----------
  $$("[data-skill]").forEach(function (card) {
    card.addEventListener("click", function () {
      if (window.matchMedia("(hover: hover)").matches) return;
      var open = !card.classList.contains("is-open");
      $$("[data-skill]").forEach(function (c) { c.classList.remove("is-open"); });
      card.classList.toggle("is-open", open);
    });
  });

  // ---------- Experience: the line fills with scroll, dots light as cards are reached ----------
  var xp = $("[data-xp]");
  var xpItems = xp ? $$(".xp__item", xp) : [];
  function onScrollXp() {
    if (!xp) return;
    var rect = xp.getBoundingClientRect();
    var mark = window.innerHeight * 0.6;
    var p = (mark - rect.top) / rect.height;
    xp.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
    xpItems.forEach(function (it) { it.classList.toggle("is-reached", it.getBoundingClientRect().top + 32 < mark); });
  }

  // ---------- Bar: solid after the top, hides while scrolling down ----------
  var bar = $(".bar");
  var lastY = window.scrollY;
  function onScrollBar() {
    var y = window.scrollY;
    if (bar) {
      bar.classList.toggle("is-solid", y > 40);
      var menuOpen = list && list.classList.contains("is-open");
      bar.classList.toggle("is-hidden", !menuOpen && y > 600 && y > lastY + 4);
      if (y < lastY - 4) bar.classList.remove("is-hidden");
    }
    lastY = y;
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScrollBar(); onScrollXp(); ticking = false; });
  }, { passive: true });
  onScrollBar(); onScrollXp();

  // ---------- Fan of project cards ----------
  var fan = $("[data-fan]");
  if (fan) {
    if (reduce || !hasIO) fan.classList.add("is-open");
    else new IntersectionObserver(function (entries, o) {
      if (entries[0].isIntersecting) { fan.classList.add("is-open"); o.disconnect(); }
    }, { threshold: 0.35 }).observe(fan);
  }

  // ---------- Projects: show more / show less ----------
  var works = $("[data-works]");
  var moreBtn = $("[data-more]");
  if (works && moreBtn) {
    moreBtn.addEventListener("click", function () {
      var all = !works.classList.contains("is-all");
      works.classList.toggle("is-all", all);
      moreBtn.textContent = all ? "Show less" : "Show more";
      moreBtn.setAttribute("aria-expanded", String(all));
      if (all) {
        $$(".work[data-extra]", works).forEach(function (w, idx) {
          if (!reduce && w.animate) w.animate([{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }],
            { duration: 600, delay: idx * 80, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" });
        });
      } else {
        works.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    });
  }

  // ---------- Popups: open, and close with a short fade (no half-closed frame) ----------
  function openPopup(dialog, opener) {
    dialog._opener = opener || null;
    dialog.classList.remove("is-closing");
    dialog.showModal();
  }
  function closePopup(dialog) {
    if (!dialog.open || dialog.classList.contains("is-closing")) return;
    var finish = function () {
      dialog.classList.remove("is-closing");
      dialog.close();
      if (dialog._opener) dialog._opener.focus({ preventScroll: true });
    };
    if (reduce) return finish();
    dialog.classList.add("is-closing");
    setTimeout(finish, 230);
  }
  $$("dialog").forEach(function (dialog) {
    dialog.addEventListener("cancel", function (e) { e.preventDefault(); closePopup(dialog); }); // Esc
    dialog.addEventListener("click", function (e) { if (e.target === dialog) closePopup(dialog); }); // backdrop
    $$("[data-close]", dialog).forEach(function (b) { b.addEventListener("click", function () { closePopup(dialog); }); });
  });

  // ---------- Projects: details window ----------
  var win = $("[data-dialog]");
  if (win && typeof win.showModal === "function") {
    var winTitle = $("#win-title", win);
    var winMedia = $("[data-win-media]", win);
    var winAbout = $("[data-win-about]", win);
    var winTags = $("[data-win-tags]", win);

    $$("[data-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".work");
        var tpl = $("template.work__detail", card);
        var title = $(".work__title", card);
        var mediaEl = $(".work__media", card);
        var img = $("img", mediaEl);
        var fb = $(".slot__fallback", mediaEl);
        var showFallback = function () { winMedia.textContent = ""; if (fb) winMedia.appendChild(fb.cloneNode(true)); };

        winTitle.textContent = title ? title.textContent.replace(/\s+/g, " ").trim() : "";
        winMedia.textContent = "";
        winMedia.classList.toggle("is-paper", mediaEl.classList.contains("work__media--paper"));
        if (img && !mediaEl.classList.contains("is-empty")) {
          var copy = img.cloneNode();
          copy.removeAttribute("onerror");
          copy.onerror = showFallback;
          winMedia.appendChild(copy);
        } else showFallback();

        winAbout.textContent = ""; winTags.textContent = "";
        if (tpl) {
          var frag = tpl.content.cloneNode(true);
          var tags = $(".win__tags", frag);
          if (tags) winTags.appendChild(tags);
          winAbout.appendChild(frag);
        }
        openPopup(win, btn);
      });
    });
  }

  // ---------- Event photos: assets/img/events/<event>/1.jpg, 2.jpg, ... found automatically ----------
  var photoCache = {};
  function findPhotos(dir) {
    if (photoCache[dir]) return photoCache[dir];
    photoCache[dir] = new Promise(function (resolve) {
      var found = [];
      (function tryNext(n) {
        if (n > 30) return resolve(found); // up to 30 photos per event
        var img = new Image();
        img.onload = function () { found.push(img.src); tryNext(n + 1); };
        img.onerror = function () { resolve(found); };
        img.src = dir + "/" + n + ".jpg";
      })(1);
    });
    return photoCache[dir];
  }

  // ---------- Events carousel ----------
  var carousel = $("[data-carousel]");
  if (carousel) {
    var slides = $$(".event", carousel);
    var dotsWrap = $("[data-dots]");
    var dots = slides.map(function () {
      var d = document.createElement("span");
      if (dotsWrap) dotsWrap.appendChild(d);
      return d;
    });
    var stepSize = function () { var a = slides[0], b = slides[1]; return b ? b.offsetLeft - a.offsetLeft : a.offsetWidth; };
    var syncDots = function () {
      var idx = Math.min(slides.length - 1, Math.round(carousel.scrollLeft / stepSize()));
      dots.forEach(function (d, i) { d.classList.toggle("is-on", i === idx); });
    };
    var go = function (delta) {
      var max = carousel.scrollWidth - carousel.clientWidth;
      var now = carousel.scrollLeft;
      var target = now + delta * stepSize();
      // Go all the way to the end (or start) first; wrap around only once already there.
      if (target > max) target = now >= max - 4 ? 0 : max;
      else if (target < 0) target = now <= 4 ? max : 0;
      carousel.scrollTo({ left: target, behavior: reduce ? "auto" : "smooth" });
    };
    var prev = $("[data-prev]"), next = $("[data-next]");
    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });
    carousel.addEventListener("scroll", function () { requestAnimationFrame(syncDots); }, { passive: true });
    syncDots();

    // Drag with a mouse (touch scrolls natively). A drag never counts as a click.
    var dragging = false, startX = 0, startScroll = 0, moved = 0;
    carousel.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true; moved = 0; startX = e.clientX; startScroll = carousel.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 6) carousel.classList.add("is-dragging");
      carousel.scrollLeft = startScroll - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!dragging) return;
      dragging = false;
      if (moved > 6) {
        carousel.scrollTo({ left: Math.round(carousel.scrollLeft / stepSize()) * stepSize(), behavior: "smooth" });
        setTimeout(function () { carousel.classList.remove("is-dragging"); }, 0);
      } else carousel.classList.remove("is-dragging");
    });

    // Card photos: a slow slideshow while the card is on screen
    var boxes = $$("[data-photos]", carousel);
    function fillCard(box) {
      if (box.dataset.loaded) return;
      box.dataset.loaded = "1";
      findPhotos(box.getAttribute("data-photos")).then(function (srcs) {
        if (!srcs.length) return;
        var alt = box.getAttribute("data-alt") || "";
        box._imgs = srcs.map(function (src, i) {
          var img = document.createElement("img");
          img.src = src; img.alt = alt + (i ? ", photo " + (i + 1) : ""); img.decoding = "async";
          if (!i) img.classList.add("is-on");
          box.appendChild(img);
          return img;
        });
        box._i = 0;
        box.classList.add("has-photos");
        if (srcs.length > 1) {
          var pips = document.createElement("span");
          pips.className = "event__pips";
          pips.setAttribute("aria-hidden", "true");
          srcs.forEach(function (_, i) { var s = document.createElement("span"); if (!i) s.className = "is-on"; pips.appendChild(s); });
          box.appendChild(pips);
          box._pips = $$("span", pips);
        }
      });
    }
    function advance(box) {
      if (!box._imgs || box._imgs.length < 2) return;
      box._imgs[box._i].classList.remove("is-on"); box._pips[box._i].classList.remove("is-on");
      box._i = (box._i + 1) % box._imgs.length;
      box._imgs[box._i].classList.add("is-on"); box._pips[box._i].classList.add("is-on");
    }
    var visible = new Set();
    if (hasIO) {
      var photoIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { fillCard(entry.target); visible.add(entry.target); }
          else visible.delete(entry.target);
        });
      }, { rootMargin: "200px 400px" });
      boxes.forEach(function (b) { photoIO.observe(b); });
    } else boxes.forEach(fillCard);
    var paused = false;
    carousel.addEventListener("mouseenter", function () { paused = true; });
    carousel.addEventListener("mouseleave", function () { paused = false; });
    if (!reduce) setInterval(function () { if (!paused && !document.hidden) visible.forEach(advance); }, 3200);
  }

  // ---------- Event post popup: photos one at a time on the left, details on the right ----------
  var post = $("[data-post]");
  if (post && typeof post.showModal === "function") {
    var stage = $("[data-post-stage]", post);
    var pipsWrap = $("[data-post-pips]", post);
    var pPrev = $("[data-post-prev]", post), pNext = $("[data-post-next]", post);
    var pRank = $("[data-post-rank]", post), pEvent = $("[data-post-event]", post);
    var pWhen = $("[data-post-when]", post), pText = $("[data-post-text]", post), pCount = $("[data-post-count]", post);
    var shots = [], at = 0;

    function show(i) {
      if (!shots.length) return;
      at = (i + shots.length) % shots.length;
      shots.forEach(function (img, k) { img.classList.toggle("is-on", k === at); });
      $$("span", pipsWrap).forEach(function (s, k) { s.classList.toggle("is-on", k === at); });
      pCount.textContent = "Photo " + (at + 1) + " of " + shots.length;
    }

    $$("[data-event]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (carousel && carousel.classList.contains("is-dragging")) return;
        var card = btn.closest(".event");
        var box = $("[data-photos]", card);
        var tpl = $("template.event__detail", card);
        pRank.textContent = $(".event__rank", card).textContent;
        pEvent.textContent = $(".event__name", card).textContent;
        pWhen.textContent = $(".event__when", card).textContent;
        pText.textContent = "";
        if (tpl) pText.appendChild(tpl.content.cloneNode(true));

        // Fallback first so the popup never opens empty; photos replace it once found
        stage.textContent = ""; pipsWrap.textContent = ""; shots = []; at = 0;
        stage.appendChild($(".event__fallback", box).cloneNode(true));
        pPrev.hidden = pNext.hidden = true;
        pCount.textContent = "Photos coming soon";
        openPopup(post, btn);

        findPhotos(box.getAttribute("data-photos")).then(function (srcs) {
          if (!srcs.length || !post.open) return;
          stage.textContent = "";
          var alt = box.getAttribute("data-alt") || "";
          shots = srcs.map(function (src, k) {
            var img = document.createElement("img");
            img.src = src; img.alt = alt + ", photo " + (k + 1) + " of " + srcs.length;
            stage.appendChild(img);
            var pip = document.createElement("span");
            pipsWrap.appendChild(pip);
            return img;
          });
          pPrev.hidden = pNext.hidden = shots.length < 2;
          show(0);
        });
      });
    });
    pPrev.addEventListener("click", function () { show(at - 1); });
    pNext.addEventListener("click", function () { show(at + 1); });
    post.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); show(at + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); show(at - 1); }
    });
    // Swipe on touch screens
    var sx = null;
    stage.parentNode.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    stage.parentNode.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  // ---------- Section entrances ----------
  if (reduce || !hasIO) return;
  var items = $$("[data-rise]");
  var counts = new Map();
  items.forEach(function (el) {
    var n = counts.get(el.parentElement) || 0;
    el.style.setProperty("--i", Math.min(n, 5));
    counts.set(el.parentElement, n + 1);
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  items.forEach(function (el) { io.observe(el); });
})();
