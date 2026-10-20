/* Ando by Gamatek — interaksi halaman. Tanpa dependensi. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.min(b, Math.max(a, v)); };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobileMQ = window.matchMedia('(max-width: 960px)');

  /* ---------- Header & menu ---------- */
  var header = $('#header');
  var nav = $('#nav');
  var toggle = $('.nav-toggle');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  $$('#nav-links a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  var seen = function (els, opts, once) {
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); if (once !== false) io.unobserve(e.target); }
      });
    }, opts);
    els.forEach(function (el) { io.observe(el); });
  };
  seen($$('[data-reveal]'), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  seen($$('#flow, #chat'), { threshold: 0.35 });

  /* ---------- Mengapa Ando: dua jalur menyatu ke kartu Ando ---------- */
  var whyFlow = $('#why-flow');
  if (whyFlow) {
    var donaCard = $('.dona-card', whyFlow);
    if ('IntersectionObserver' in window) {
      var whyIO = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { whyFlow.classList.add('is-in'); whyIO.disconnect(); }
      }, { threshold: 0.2 });
      whyIO.observe(donaCard);
    } else {
      whyFlow.classList.add('is-in');
    }
    // Arahkan kursor ke sebuah kendala untuk menyorot jawabannya di kartu Ando, dan sebaliknya.
    var setPair = function (key) {
      $$('[data-pair]', whyFlow).forEach(function (el) { el.classList.toggle('is-paired', !!key && el.getAttribute('data-pair') === key); });
    };
    whyFlow.addEventListener('mouseover', function (e) {
      var li = e.target.closest('[data-pair]');
      setPair(li ? li.getAttribute('data-pair') : null);
    });
    whyFlow.addEventListener('mouseleave', function () { setPair(null); });
  }

  /* ---------- Ownership list: highlight item yang sedang di tengah layar ---------- */
  var ownItems = $$('[data-own]');
  if ('IntersectionObserver' in window && ownItems.length) {
    var ownIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        ownItems.forEach(function (li) { li.classList.toggle('is-active', li === e.target); });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    ownItems.forEach(function (li) { ownIO.observe(li); });
  }

  /* ---------- Tabs ---------- */
  var tabs = $$('[role="tab"]');
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (on) {
        panel.hidden = false;
        panel.classList.remove('is-entering');
        void panel.offsetWidth;
        panel.classList.add('is-entering');
      } else {
        panel.hidden = true;
      }
    });
    if (focus) tab.focus();
    if (tab.id === 'tab-aiwa') { var chat = $('#chat'); chat.classList.remove('is-in'); requestAnimationFrame(function () { requestAnimationFrame(function () { chat.classList.add('is-in'); }); }); }
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });

  /* ---------- Hero: animasi yang digerakkan scroll ---------- */
  var hero = $('.hero');
  var stageCol = $('.stage-col');
  var spacer = $('.hero-spacer');
  var brandName = $('.steps .brand-name');
  var stepItems = $$('.steps li');
  var kpiEls = {
    total: $('[data-count="total"]'),
    trx: $('[data-count="trx"]'),
    donor: $('[data-count="donor"]')
  };
  var BRANDS = ['Teduh Bersama', 'Pundi Pelosok', 'Lembaga Anda'];
  var KPI = { total: 838938904, trx: 1027, donor: 245 };
  var state = { brand: -1, step: -1, intro: 0, kpi: '' };
  var fmt = function (n) { return n.toLocaleString('id-ID'); };

  function sizeStage() {
    var colW = stageCol.clientWidth;
    var s = colW / 600;
    if (mobileMQ.matches) s = Math.min(s, (window.innerHeight - 84 - 80) / 540);
    else s = Math.min(s, (window.innerHeight - 200) / 540);
    hero.style.setProperty('--s', clamp(s, 0.42, 1).toFixed(4));
    // Ponsel ilustrasi di bagian Contoh mengikuti lebar layarnya.
    $$('.show-phone > div').forEach(function (d) { d.style.setProperty('--ms', (d.clientWidth / 214).toFixed(4)); });
  }

  function heroProgress() {
    if (reduceMQ.matches) return 1;
    if (mobileMQ.matches) {
      var top = parseFloat(getComputedStyle(stageCol).top) || 84;
      var r = spacer.getBoundingClientRect();
      return clamp((top + stageCol.offsetHeight - r.top) / r.height);
    }
    var hr = hero.getBoundingClientRect();
    return clamp(-hr.top / (hero.offsetHeight - window.innerHeight));
  }

  function setKPIs(step) {
    var b = easeOut(state.intro);
    var total = Math.round(KPI.total * b) + (step >= 2 ? 250000 : 0);
    var trx = Math.round(KPI.trx * b) + (step >= 2 ? 1 : 0);
    var donor = Math.round(KPI.donor * b) + (step >= 3 ? 1 : 0);
    var key = total + '|' + trx + '|' + donor;
    if (key === state.kpi) return;
    state.kpi = key;
    kpiEls.total.textContent = 'Rp ' + fmt(total);
    kpiEls.trx.textContent = fmt(trx);
    kpiEls.donor.textContent = fmt(donor);
  }

  function flash(name) {
    var el = $('[data-kpi="' + name + '"]');
    if (!el) return;
    el.classList.add('flash');
    setTimeout(function () { el.classList.remove('flash'); }, 900);
  }

  function renderHero() {
    var p = heroProgress();
    var a = reduceMQ.matches ? 1 : easeOut(clamp(p / 0.18));
    hero.style.setProperty('--a', a.toFixed(4));
    hero.style.setProperty('--b', easeOut(state.intro).toFixed(4));
    hero.style.setProperty('--p', p.toFixed(4));

    var brand = p < 0.22 ? 0 : p < 0.38 ? 1 : 2;
    var step = p < 0.52 ? 1 : p < 0.74 ? 2 : 3;

    if (brand !== state.brand) {
      var first = state.brand === -1;
      state.brand = brand;
      hero.setAttribute('data-brand', String(brand));
      brandName.textContent = BRANDS[brand];
      if (!first) {
        brandName.classList.remove('is-swap');
        void brandName.offsetWidth;
        brandName.classList.add('is-swap');
      }
    }
    if (step !== state.step) {
      var prev = state.step;
      state.step = step;
      hero.setAttribute('data-step', String(step));
      stepItems.forEach(function (li, i) { li.classList.toggle('is-on', i < step); });
      if (prev !== -1 && step > prev) { if (step === 2) { flash('total'); flash('trx'); } if (step === 3) flash('donor'); }
    }
    setKPIs(step);
  }

  function runIntro() {
    if (reduceMQ.matches) { state.intro = 1; renderHero(); return; }
    var start = null;
    var dur = 1600;
    var tick = function (t) {
      if (start === null) start = t;
      state.intro = clamp((t - start) / dur);
      hero.style.setProperty('--b', easeOut(state.intro).toFixed(4));
      setKPIs(state.step === -1 ? 1 : state.step);
      if (state.intro < 1) requestAnimationFrame(tick);
    };
    setTimeout(function () { requestAnimationFrame(tick); }, 250);
  }

  /* ---------- Showcase parallax (desktop) ---------- */
  var showGrid = $('#show-grid');
  var shows = $$('.show[data-speed]');
  function renderShowcase() {
    if (!showGrid) return;
    if (reduceMQ.matches || mobileMQ.matches) { shows.forEach(function (s) { s.querySelector('.show-phone').style.removeProperty('--py'); }); return; }
    var r = showGrid.getBoundingClientRect();
    if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
    var prog = (window.innerHeight - r.top) / (window.innerHeight + r.height) - 0.5;
    shows.forEach(function (s) {
      var speed = parseFloat(s.getAttribute('data-speed')) || 0;
      s.querySelector('.show-phone').style.setProperty('--py', (prog * speed * 140).toFixed(1) + 'px');
    });
  }

  /* ---------- Header: mode gelap di atas section gelap + progress scroll ---------- */
  var darkZones = [], maxScroll = 1, isDark = false, lastSp = -1;
  function measureChrome() {
    var y = window.scrollY;
    darkZones = $$('.eco, .footer').map(function (el) {
      var r = el.getBoundingClientRect();
      return [r.top + y, r.bottom + y];
    });
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }
  function renderChrome() {
    var y = window.scrollY, probe = y + 50;
    header.classList.toggle('is-scrolled', y > 8);
    var dark = darkZones.some(function (z) { return probe >= z[0] && probe < z[1]; });
    if (dark !== isDark) { isDark = dark; header.classList.toggle('is-dark', dark); }
    var sp = Math.round(clamp(y / maxScroll) * 1000) / 1000;
    if (sp !== lastSp) { lastSp = sp; header.style.setProperty('--sp', String(sp)); }
  }
  var remeasureChrome = function () { requestAnimationFrame(function () { measureChrome(); update(); }); };
  if ('ResizeObserver' in window) new ResizeObserver(remeasureChrome).observe(document.body);
  window.addEventListener('load', remeasureChrome);

  /* ---------- Sinematik (estetika saja) ---------- */
  var renderCinema = function () {};
  (function () {
    var root = document.documentElement;
    var eco = $('.eco');
    var drop = function () {
      root.classList.remove('cine-ready', 'cine-intro');
      if (eco) eco.style.removeProperty('--ck');
      renderCinema = function () {};
    };
    if (reduceMQ.matches) { drop(); return; }
    var onReduce = function () { if (reduceMQ.matches) drop(); };
    if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', onReduce); else if (reduceMQ.addListener) reduceMQ.addListener(onReduce);
    var vh = window.innerHeight;

    // Key light di belakang perangkat hero, warnanya mengikuti lembaga di ponsel.
    var stageBox = $('.stage-box');
    if (stageBox) {
      var key = document.createElement('span');
      key.className = 'cine-key';
      key.setAttribute('aria-hidden', 'true');
      key.innerHTML = '<i></i><i></i><i></i>';
      stageBox.insertBefore(key, stageBox.firstChild);
    }

    // Judul bab dipecah per kata supaya bisa muncul dari slot masing-masing.
    // Judul yang sudah terlihat saat halaman dibuka (deep link, reload) dibiarkan utuh.
    var titles = $$('.section .h2').map(function (h) { return { h: h, box: h.closest('[data-reveal]') }; })
      .filter(function (t) { return t.box; });
    titles.map(function (t) { return t.box.getBoundingClientRect().top; }).forEach(function (top, i) { titles[i].late = top >= vh * 0.92; });
    titles.forEach(function (t) {
      if (!t.late) return;
      var h = t.h, box = t.box;
      var walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), nodes = [], n, w = 0;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(function (tn) {
        var frag = document.createDocumentFragment();
        tn.nodeValue.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var outer = document.createElement('span'), inner = document.createElement('span');
          outer.className = 'cw';
          outer.style.setProperty('--w', String(Math.min(w++, 14)));
          inner.textContent = part;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        tn.parentNode.replaceChild(frag, tn);
      });
      box.classList.add('cine-head');
      // Setelah semua kata mendarat, slot dilepas lagi jadi teks biasa (find-in-page tetap jalan).
      var left = w;
      box.addEventListener('transitionend', function done(e) {
        if (e.propertyName !== 'transform' || !box.classList.contains('is-in') || !e.target.parentNode || !e.target.parentNode.classList.contains('cw')) return;
        if (--left <= 0) { box.classList.add('cine-done'); box.removeEventListener('transitionend', done); }
      });
    });
    // Dipasang sebelum ada pembacaan layout, supaya kata yang baru dibuat langsung mulai dari posisi tersembunyi.
    root.classList.add('cine-ready');

    // Layar baru "menyala" setelah gambarnya benar-benar termuat.
    $$('.shot-laptop, .shot-phone img').forEach(function (img) {
      var ok = function () { img.classList.add('cine-ld'); };
      if (img.complete) ok();
      else { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ok, { once: true }); }
    });
    // Browser tidak memuat gambar lazy yang sedang ter-clip penuh, jadi wadahnya
    // (yang tidak ter-clip) yang dipantau, lalu gambarnya dimuat sebelum masuk layar.
    if ('IntersectionObserver' in window) {
      var lazyIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          $$('img', e.target).forEach(function (img) { img.loading = 'eager'; });
          lazyIO.unobserve(e.target);
        });
      }, { rootMargin: (navigator.connection && /2g|3g/.test(navigator.connection.effectiveType || '') ? '2500px' : '1250px') + ' 0px' });
      $$('.shot, .footer-brand').forEach(function (el) { lazyIO.observe(el); });
    } else {
      $$('.shot img, .footer-brand img').forEach(function (img) { img.loading = 'eager'; });
    }

    // Satu sapuan cahaya pada kartu Ando dan kotak CTA.
    $$('.dona-card, .cta-box').forEach(function (c) {
      var s = document.createElement('span');
      s.className = 'cine-sheen';
      s.setAttribute('aria-hidden', 'true');
      s.addEventListener('transitionend', function () { s.remove(); }, { once: true });
      c.insertBefore(s, c.firstChild);
    });

    // Scene ekosistem: desktop di-scrub scroll (hanya baca scrollY), mobile sekali jalan.
    var ecoM = null, ecoK = -1;
    var measure = function () {
      if (!eco) return;
      var r = eco.getBoundingClientRect(), y = window.scrollY;
      ecoM = { t: r.top + y, b: r.bottom + y, vh: window.innerHeight };
      ecoK = -1;
      renderCinema();
    };
    renderCinema = function () {
      if (!ecoM || mobileMQ.matches) return;
      var y = window.scrollY, a = ecoM.vh * 0.75;
      var k = Math.max(clamp((ecoM.t - y - ecoM.vh + a) / a), clamp(1 - (ecoM.b - y) / a));
      k = Math.round(k * k * (3 - 2 * k) * 1000) / 1000;
      if (k !== ecoK) { ecoK = k; eco.style.setProperty('--ck', String(k)); }
    };
    if (eco) {
      if (eco.getBoundingClientRect().top < vh * 0.75) eco.classList.add('is-in');
      else seen([eco], { rootMargin: '0px 0px -25% 0px' });
      var remeasure = function () { requestAnimationFrame(measure); };
      if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.body);
      window.addEventListener('resize', remeasure);
      window.addEventListener('load', remeasure);
      if (mobileMQ.addEventListener) mobileMQ.addEventListener('change', remeasure); else if (mobileMQ.addListener) mobileMQ.addListener(remeasure);
      measure();
    }

    // End credits.
    var foot = $('.footer');
    if (foot && foot.getBoundingClientRect().top > vh) {
      foot.classList.add('cine-credits');
      seen([foot], { threshold: 0.2 });
    }

    setTimeout(function () { root.classList.remove('cine-intro'); }, 2400);
  })();

  /* ---------- Loop ---------- */
  var ticking = false;
  function update() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      renderHero();
      renderShowcase();
      renderChrome();
      renderCinema();
    });
  }

  sizeStage();
  measureChrome();
  renderHero();
  runIntro();
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', function () { sizeStage(); measureChrome(); update(); });
  var onMQ = function () { sizeStage(); update(); };
  [reduceMQ, mobileMQ].forEach(function (mq) {
    if (mq.addEventListener) mq.addEventListener('change', onMQ); else if (mq.addListener) mq.addListener(onMQ);
  });

  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
