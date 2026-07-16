/* =========================================================
   ARCO · Arquitectura & Construcción — main.js
   Capa de interacción + animaciones premium
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var lerp = function (a, b, n) { return a + (b - a) * n; };

  /* =====================================================
     1. HEADER al hacer scroll
  ===================================================== */
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 60); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =====================================================
     2. MENÚ MÓVIL
  ===================================================== */
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
    toggle.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
    links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 760) setMenu(false); });
  }

  /* =====================================================
     3. HERO SLIDER
  ===================================================== */
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
    function loop() { timer = setInterval(function () { go(idx + 1); }, 6000); }
    dots.forEach(function (d, i) { d.addEventListener('click', function () { clearInterval(timer); go(i); loop(); }); });
    go(0); loop();
  }

  /* =====================================================
     4. FILTROS DE GALERÍA
  ===================================================== */
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

  /* =====================================================
     5. LIGHTBOX
  ===================================================== */
  var lb = document.querySelector('.lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lb-cap');
    var gallery = [], current = 0;
    function refresh() { gallery = [].slice.call(document.querySelectorAll('.grid-gallery .tile:not(.hide)')); }
    function openLb(tile) { refresh(); current = gallery.indexOf(tile); renderLb(); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function renderLb() {
      var t = gallery[current]; if (!t) return;
      var img = t.querySelector('img');
      lbImg.src = img.getAttribute('data-full') || img.src;
      var h = t.querySelector('h4'), s = t.querySelector('.tile__cap span');
      lbCap.textContent = (h ? h.textContent : '') + (s ? ' · ' + s.textContent : '');
    }
    function closeLb() { lb.classList.remove('open'); document.body.style.overflow = ''; }
    function move(d) { current = (current + d + gallery.length) % gallery.length; renderLb(); }
    document.querySelectorAll('.grid-gallery .tile').forEach(function (t) { t.addEventListener('click', function () { openLb(t); }); });
    lb.querySelector('.lb-close').addEventListener('click', closeLb);
    lb.querySelector('.lb-next').addEventListener('click', function () { move(1); });
    lb.querySelector('.lb-prev').addEventListener('click', function () { move(-1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    });
  }

  /* =====================================================
     6. DIVIDIR TÍTULOS EN PALABRAS (texto cinético)
  ===================================================== */
  function splitWords(el) {
    if (el.dataset.splitDone) return;
    var delay = 0;
    (function walk(node) {
      var kids = [].slice.call(node.childNodes);
      kids.forEach(function (child) {
        if (child.nodeType === 3) { // texto
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (part.trim() === '') { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span'); w.className = 'word';
            var inner = document.createElement('span'); inner.className = 'word__in';
            inner.textContent = part; inner.style.transitionDelay = (delay += 0.05) + 's';
            w.appendChild(inner); frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) { walk(child); }
      });
    })(el);
    el.dataset.splitDone = '1';
  }
  document.querySelectorAll('[data-split]').forEach(splitWords);

  /* =====================================================
     7. CONTADORES
  ===================================================== */
  function runCounter(el) {
    if (el.dataset.counted) return; el.dataset.counted = '1';
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var dur = 1500, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    // failsafe: garantiza el valor final aunque rAF no progrese
    setTimeout(function () { el.textContent = target + suffix; }, dur + 400);
  }

  /* =====================================================
     8-10. MOTOR DE SCROLL (revelados + parallax + nav)
     No depende de IntersectionObserver: recorre en rAF.
  ===================================================== */
  var revealSel = '.reveal, .reveal-img, .stagger, [data-split], .counter-group';
  var revealEls = [].slice.call(document.querySelectorAll(revealSel));
  function activate(el) {
    if (el.__revealed) return;
    el.__revealed = true;
    el.classList.add('in', 'is-in');
    el.querySelectorAll('[data-count]').forEach(runCounter);
    if (el.hasAttribute('data-count')) runCounter(el);
  }
  var pxEls = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var ctaBanner = document.querySelector('.cta-banner');
  var sections = [].slice.call(document.querySelectorAll('section[id]'));
  var navLinks = [].slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
  var ticking = false;

  function frame() {
    ticking = false;
    var vh = window.innerHeight;

    // --- revelados: se activa cuando el borde superior entra al 88% del viewport ---
    for (var i = 0; i < revealEls.length; i++) {
      var el = revealEls[i];
      if (el.__revealed) continue;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.88 && r.bottom > 0) activate(el);
    }

    // --- parallax ---
    if (!reduceMotion) {
      for (var p = 0; p < pxEls.length; p++) {
        var pe = pxEls[p], pr = pe.getBoundingClientRect();
        if (pr.bottom < -200 || pr.top > vh + 200) continue;
        var speed = parseFloat(pe.getAttribute('data-parallax')) || 0.1;
        var off = (pr.top + pr.height / 2 - vh / 2) * speed;
        pe.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
      }
      if (ctaBanner) {
        var cr = ctaBanner.getBoundingClientRect();
        if (cr.bottom > 0 && cr.top < vh) {
          var prog = (vh - cr.top) / (vh + cr.height);
          ctaBanner.style.backgroundPosition = '50% ' + (30 + prog * 40).toFixed(1) + '%';
        }
      }
    }

    // --- nav activo ---
    if (sections.length && navLinks.length) {
      var mid = vh * 0.35, activeId = null;
      for (var s = 0; s < sections.length; s++) {
        var sr = sections[s].getBoundingClientRect();
        if (sr.top <= mid && sr.bottom >= mid) { activeId = sections[s].id; break; }
      }
      if (activeId) navLinks.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + activeId); });
    }
  }
  // Se llama a frame() directamente en scroll/resize (sin depender de rAF,
  // que algunos entornos no ejecutan; garantiza que los revelados siempre corran).
  window.addEventListener('scroll', frame, { passive: true });
  window.addEventListener('resize', frame);
  if (reduceMotion) { revealEls.forEach(activate); }
  frame();
  // pasadas extra por si el layout tarda (fuentes/imágenes)
  window.addEventListener('load', function () { frame(); setTimeout(frame, 300); });
  setTimeout(frame, 400); setTimeout(frame, 1000);

  /* =====================================================
     11. CURSOR PERSONALIZADO + MAGNÉTICO (escritorio)
  ===================================================== */
  if (finePointer && !reduceMotion) {
    var ring = document.querySelector('.cursor');
    var dot = document.querySelector('.cursor-dot');
    var label = document.querySelector('.cursor__label');
    if (ring && dot) {
      document.body.classList.add('has-cursor');
      var mx = window.innerWidth / 2, my = window.innerHeight / 2;
      var rx = mx, ry = my;
      window.addEventListener('mousemove', function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
        if (label.classList.contains('show')) label.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%) scale(1)';
        ring.style.opacity = dot.style.opacity = '1';
      });
      (function ringLoop() {
        rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
        ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
        requestAnimationFrame(ringLoop);
      })();
      document.addEventListener('mouseleave', function () { ring.style.opacity = dot.style.opacity = '0'; });

      // estados hover
      document.querySelectorAll('a, button, .filter').forEach(function (el) {
        el.addEventListener('mouseenter', function () { ring.classList.add('is-hover'); });
        el.addEventListener('mouseleave', function () { ring.classList.remove('is-hover'); });
      });
      document.querySelectorAll('.tile, [data-cursor]').forEach(function (el) {
        var text = el.getAttribute('data-cursor') || 'Ver';
        el.addEventListener('mouseenter', function () { ring.classList.add('is-media'); if (label) { label.textContent = text; label.classList.add('show'); } });
        el.addEventListener('mouseleave', function () { ring.classList.remove('is-media'); if (label) label.classList.remove('show'); });
      });

      // botones magnéticos
      document.querySelectorAll('.btn, .nav__cta').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
          var r = btn.getBoundingClientRect();
          var x = (e.clientX - r.left - r.width / 2) * 0.3;
          var y = (e.clientY - r.top - r.height / 2) * 0.4;
          btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        });
        btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
      });
    }
  }

  /* =====================================================
     12. INTRO LOADER + entrada del hero
  ===================================================== */
  var loader = document.querySelector('.loader');
  var hero = document.querySelector('.hero');
  function enterHero() {
    if (!hero) return;
    hero.classList.add('enter');
    hero.querySelectorAll('[data-split]').forEach(function (el) { el.classList.add('is-in'); });
  }
  function removeLoaderNow() {
    document.body.classList.remove('loading');
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
  }
  function startWithLoader() {
    if (loader) loader.classList.add('done');
    document.body.classList.remove('loading');
    enterHero();
    setTimeout(function () { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); }, 1200);
  }
  // La pantalla de carga solo aparece la PRIMERA vez que entras al sitio
  // (no al navegar entre páginas dentro de la misma sesión).
  var alreadyEntered = false;
  try { alreadyEntered = sessionStorage.getItem('arcoEntered') === '1'; } catch (e) {}
  if (reduceMotion || alreadyEntered) {
    removeLoaderNow();
    enterHero();
  } else {
    try { sessionStorage.setItem('arcoEntered', '1'); } catch (e) {}
    var started = false;
    var kick = function () { if (started) return; started = true; startWithLoader(); };
    // arranca poco después de estar listo el DOM; no espera a todas las imágenes
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(kick, 900);
    } else {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(kick, 900); });
    }
    // failsafe: pase lo que pase, no bloquear más de 2.6s
    setTimeout(kick, 2600);
  }

  /* =====================================================
     13. FORMULARIO (FormSubmit) + AÑO
  ===================================================== */
  var form = document.querySelector('.form');
  if (form) {
    // Correo principal (respaldo) vía FormSubmit; copia al correo del sitio.
    var MAIL_ENDPOINT = 'https://formsubmit.co/ajax/luis.santi.tiger@gmail.com';
    var MAIL_CC = 'contacto@arco-rc.com';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var nombre = form.querySelector('#n').value.trim();
      var telefono = form.querySelector('#t').value.trim();
      var correo = form.querySelector('#e').value.trim();
      var mensaje = form.querySelector('#m').value.trim();
      var note = form.querySelector('.form__note');
      var btn = form.querySelector('button[type="submit"]');

      btn.disabled = true;
      var btnText = btn.textContent;
      btn.textContent = 'Enviando…';

      fetch(MAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          Nombre: nombre,
          Telefono: telefono || 'No proporcionado',
          Correo: correo,
          Mensaje: mensaje,
          _subject: 'Nuevo mensaje desde arco-rc.com — ' + nombre,
          _replyto: correo,
          _cc: MAIL_CC,
          _template: 'table',
          _captcha: 'false'
        })
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (j) {
        if (!j || String(j.success) !== 'true') throw new Error(j && j.message);
        if (note) note.textContent = 'Gracias por tu mensaje. Te contactaremos muy pronto.';
        form.reset();
      }).catch(function () {
        if (note) note.textContent = 'No se pudo enviar el correo. Escríbenos por WhatsApp o a ' + MAIL_CC + '.';
      }).finally(function () {
        btn.disabled = false;
        btn.textContent = btnText;
      });
    });
  }
  document.querySelectorAll('.year').forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();
