(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- tape measure progress + header state + call dock ---- */
  const blade = $('#tapeBlade');
  const bar = $('.bar');
  const house = $('#house');
  const dock = $('.dock');
  const hero = $('.hero');
  let ticking = false;
  function onScroll() {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    blade.style.width = (p * 100).toFixed(2) + '%';
    const hr = house.getBoundingClientRect();
    bar.classList.toggle('on-dusk', hr.top < 64 && hr.bottom > 0);
    dock.classList.toggle('show', hero.getBoundingClientRect().bottom < 0);
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

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
        const v = target * (1 - Math.pow(1 - k, 3));
        el.textContent = v.toFixed(1);
        if (k < 1) requestAnimationFrame(step); else el.textContent = target.toFixed(1);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    o.observe(el);
  });

  /* ---- rooms light up as chapters are read ---- */
  const rooms = new Map($$('.cutaway .room').map((g) => [g.dataset.room, g]));
  const key = $('#stageKey');
  const names = { kitchen: '01 Kitchen: lights on.', ceilings: '02 Ceilings & walls: lights on.', heater: '03 Water heater: lights on.', other: '04 The rest of the list: lights on.' };
  const order = ['kitchen', 'ceilings', 'heater', 'other'];
  const chapters = $$('.ch');
  function light(room) {
    const idx = order.indexOf(room);
    order.forEach((r, i) => {
      const g = rooms.get(r);
      g.classList.toggle('lit', i === idx);
      g.classList.toggle('done', i < idx);
    });
    chapters.forEach((c) => c.classList.toggle('current', c.dataset.room === room));
    key.textContent = names[room] || '';
  }
  const chObs = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) light(e.target.dataset.room); });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  chapters.forEach((c) => chObs.observe(c));

  // clicking a room in the drawing jumps to its chapter
  rooms.forEach((g, r) => {
    g.style.cursor = 'pointer';
    g.addEventListener('click', () => $('#' + r).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }));
  });

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

  /* ---- flashlight in the dusk section (fine pointers only) ---- */
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    house.addEventListener('pointermove', (e) => {
      const r = house.getBoundingClientRect();
      house.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      house.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  /* ---- request form -> pre-filled text message ---- */
  const form = $('#reqForm');
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
    const room = form.elements.room.value;
    const body = `Hi, this is ${form.elements.name.value.trim()}. ${room}: ${form.elements.msg.value.trim()}`;
    // "?&body=" is the form both iOS and Android messaging apps accept
    location.href = `sms:+14076682768?&body=${encodeURIComponent(body)}`;
  });
})();
