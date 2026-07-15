/* =========================================================
   ARCO · Arquitectura & Construcción — main.js
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Header al hacer scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var links = document.querySelector('.nav__links');
  function setMenu(open) {
    if (!links || !toggle) return;
    links.classList.toggle('open', open);
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('no-scroll', open);
  }
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      setMenu(!links.classList.contains('open'));
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    // Cerrar con Escape o al ampliar a escritorio
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) setMenu(false);
    });
  }

  /* ---------- Hero slider ---------- */
  var slides = document.querySelectorAll('.hero__slide');
  var dots = document.querySelectorAll('.hero__dots button');
  if (slides.length) {
    var idx = 0, timer;
    function go(n) {
      slides[idx].classList.remove('is-active');
      if (dots[idx]) dots[idx].classList.remove('is-active');
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add('is-active');
      if (dots[idx]) dots[idx].classList.add('is-active');
    }
    function loop() { timer = setInterval(function () { go(idx + 1); }, 5500); }
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { clearInterval(timer); go(i); loop(); });
    });
    go(0); loop();
  }

  /* ---------- Filtros de galería ---------- */
  var filters = document.querySelectorAll('.filter');
  var tiles = document.querySelectorAll('.grid-gallery .tile');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (f) { f.classList.remove('active'); });
      btn.classList.add('active');
      var cat = btn.getAttribute('data-filter');
      tiles.forEach(function (t) {
        var show = cat === '*' || t.getAttribute('data-cat').indexOf(cat) !== -1;
        t.classList.toggle('hide', !show);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.querySelector('.lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('.lb-cap');
    var gallery = [];
    var current = 0;

    function refresh() {
      gallery = Array.prototype.slice.call(document.querySelectorAll('.grid-gallery .tile:not(.hide)'));
    }
    function open(tile) {
      refresh();
      current = gallery.indexOf(tile);
      render();
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function render() {
      var t = gallery[current];
      if (!t) return;
      var img = t.querySelector('img');
      lbImg.src = img.getAttribute('data-full') || img.src;
      var h = t.querySelector('h4');
      var s = t.querySelector('.tile__cap span');
      lbCap.textContent = (h ? h.textContent : '') + (s ? ' · ' + s.textContent : '');
    }
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }
    function move(d) { current = (current + d + gallery.length) % gallery.length; render(); }

    document.querySelectorAll('.grid-gallery .tile').forEach(function (t) {
      t.addEventListener('click', function () { open(t); });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-next').addEventListener('click', function () { move(1); });
    lb.querySelector('.lb-prev').addEventListener('click', function () { move(-1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    });
  }

  /* ---------- Reveal al hacer scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14 });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add('in'); });
  }

  /* ---------- Nav activo por sección ---------- */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__links a[href^="#"]');
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (l) {
            l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ---------- Formulario (demo, sin backend) ---------- */
  var form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.form__note');
      if (note) note.textContent = 'Gracias por tu mensaje. Te contactaremos muy pronto.';
      form.reset();
    });
  }

  /* ---------- Año en footer ---------- */
  var y = document.querySelector('.year');
  if (y) y.textContent = new Date().getFullYear();
})();
