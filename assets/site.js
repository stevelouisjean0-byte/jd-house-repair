(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- tape measure progress + header state + call dock ---- */
  const blade = $('#tapeBlade');
  const bar = $('.bar');
  const dusks = $$('.house, .gallery');
  const dock = $('.dock');
  const hero = $('.hero');
  let ticking = false;
  function onScroll() {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    blade.style.width = (p * 100).toFixed(2) + '%';
    const h = bar.offsetHeight;
    bar.classList.toggle('on-dusk', dusks.some((d) => { const r = d.getBoundingClientRect(); return r.top < h && r.bottom > 0; }));
    dock.classList.toggle('show', hero ? hero.getBoundingClientRect().bottom < 0 : scrollY > 240);
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---- menu (narrow screens) ---- */
  const menuBtn = $('.menu-btn');
  const nav = $('#siteNav');
  const setMenu = (open) => {
    bar.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && bar.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); } });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', (e) => { if (!bar.contains(e.target)) setMenu(false); });

  /* ---- reveal on scroll ---- */
  const rvObs = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rvObs.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  $$('.rv').forEach((el) => rvObs.observe(el));

  /* ---- count-up for the real numbers only ---- */
  $$('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    if (reduce) return;
    const o = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      o.disconnect();
      const t0 = performance.now(), dur = 1100;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = (target * (1 - Math.pow(1 - k, 3))).toFixed(1);
        if (k < 1) requestAnimationFrame(step); else el.textContent = target.toFixed(1);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    o.observe(el);
  });

  /* ---- home: the list and the drawing light each other up ---- */
  const cut = $('.menu-stage .cutaway');
  if (cut) {
    const rooms = new Map($$('.room', cut).map((g) => [g.dataset.room, g]));
    const links = $$('.room-link');
    let touched = false;
    const show = (key) => {
      rooms.forEach((g, k) => g.classList.toggle('lit', k === key));
      links.forEach((l) => l.classList.toggle('hot', l.dataset.room === key));
    };
    links.forEach((l) => {
      const on = () => { touched = true; show(l.dataset.room); };
      l.addEventListener('mouseenter', on);
      l.addEventListener('focus', on);
    });
    rooms.forEach((g, k) => {
      g.addEventListener('mouseenter', () => { touched = true; show(k); });
      g.addEventListener('focus', () => { touched = true; show(k); });
    });
    $('.room-list').addEventListener('mouseleave', () => show(null));
    // once in view, walk the lights through each room, then leave the kitchen on
    if (!reduce) {
      const order = ['kitchen', 'ceilings', 'heater', 'other'];
      const o = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        o.disconnect();
        order.forEach((k, i) => setTimeout(() => { if (!touched) show(k); }, 400 + i * 900));
        setTimeout(() => { if (!touched) show('kitchen'); }, 400 + order.length * 900);
      }, { threshold: 0.5 });
      o.observe(cut);
    } else show('kitchen');
  }

  /* ---- videos: play only while on screen ---- */
  const vids = $$('video.lazyvid');
  if (reduce) {
    vids.forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
  } else {
    const vObs = new IntersectionObserver((es) => {
      es.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) {
          if (v.preload === 'none') { v.preload = 'auto'; v.load(); }
          const p = v.play(); if (p && p.catch) p.catch(() => {});
        } else v.pause();
      });
    }, { rootMargin: '120px 0px', threshold: 0.15 });
    vids.forEach((v) => vObs.observe(v));
  }

  /* ---- flashlight in dusk sections (fine pointers only) ---- */
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    $$('.house').forEach((sec) => sec.addEventListener('pointermove', (e) => {
      const r = sec.getBoundingClientRect();
      sec.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      sec.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));
  }

  /* ---- contact form -> pre-filled text message ---- */
  const form = $('#reqForm');
  if (form) {
    const want = new URLSearchParams(location.search).get('room');
    const pre = want && $(`input[data-key="${CSS.escape(want)}"]`, form);
    if (pre) pre.checked = true;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      ['name', 'msg'].forEach((n) => {
        const f = form.elements[n];
        const bad = !f.value.trim();
        f.closest('.fld').classList.toggle('bad', bad);
        if (bad && ok) { f.focus(); ok = false; }
      });
      if (!ok) return;
      const body = `Hi, this is ${form.elements.name.value.trim()}. ${form.elements.room.value}: ${form.elements.msg.value.trim()}`;
      // "?&body=" is the form both iOS and Android messaging apps accept
      location.href = `sms:+14076682768?&body=${encodeURIComponent(body)}`;
    });
  }
})();
