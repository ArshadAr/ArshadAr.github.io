(() => {
  const S = window.SITE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const byId = Object.fromEntries(S.works.map(w => [w.id, w]));
  const CAT = { film: 'Brand film', motion: 'Motion design', cgi: 'CGI / VFX', ai: 'AI film', edit: 'Edit' };
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
  const waLink = msg => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;

  /* ---------- content from data.js ---------- */
  $('.js-avail').textContent = S.availability;
  $('.js-email').textContent = S.email;
  $('.js-phone').textContent = S.phone;
  $('.js-tel').href = 'tel:' + S.phone.replace(/\s/g, '');
  $('.js-behance').href = S.behance;
  $('.js-year').textContent = new Date().getFullYear();
  const bindWA = el => { el.href = waLink(el.dataset.msg || 'Hi Arshad!'); el.target = '_blank'; el.rel = 'noopener'; };
  $$('.js-wa').forEach(bindWA);

  // clock — humanises: "it's 3:20 PM in Kerala"
  const clock = () => {
    const t = new Date().toLocaleTimeString('en-US', { timeZone: S.timezone, hour: 'numeric', minute: '2-digit' });
    $('.js-clock').textContent = `Kerala ${t}`;
    $('.js-clock2').textContent = `It's ${t} in Kerala`;
  };
  clock(); setInterval(clock, 30000);

  // clients marquee
  const brands = ['LuLu', 'Hive', 'AIBI', 'Boba Live', 'Coralreef', 'Maccao', 'Clinava', 'Fruitice', 'Eleven 11', 'Oxmentor', 'Gaana', 'Basari', 'Calivra', 'Truesence', 'Crave in', 'Meckavo', 'Aima', 'Gloveda', 'Trinity', 'Exito', 'KAS', 'NMC', 'Loft', 'Toddle'];
  const bHTML = brands.map(b => `<span>${b}</span><i>✦</i>`).join('');
  $('.js-clients').innerHTML = bHTML + bHTML;

  // media helpers
  const img = id => `img/${id}.webp`;
  const prev = id => `media/${id}-p.mp4`;
  const full = id => `media/${id}.mp4`;

  // featured cards
  $('.js-featured').insertAdjacentHTML('beforeend', S.featured.map((id, i) => {
    const w = byId[id]; if (!w) return '';
    return `<button class="fcard ${w.orient}" data-id="${id}" data-cursor="play" data-cursor-label="Watch">
      <img src="${img(id)}" alt="${w.brand} — ${w.title}" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async">
      <video muted loop playsinline preload="none" data-src="${prev(id)}"></video>
      <span class="fcard__n">${String(i + 1).padStart(2, '0')} / ${String(S.featured.length).padStart(2, '0')}</span>
      <span class="fcard__info"><span><span class="fcard__b">${w.brand}</span><span class="fcard__t">${w.title}</span></span><span class="fcard__tag">${w.tag}</span></span>
    </button>`;
  }).join(''));

  // on phones the heading sits above the swipe rail
  if (innerWidth <= 820) { const fh = $('.featured__head'); $('.featured__pin').insertBefore(fh, $('.js-featured')); }
  if (!fine) $('.featured__hint').textContent = 'Swipe → tap any film to watch';

  // library grid
  const order = ['motion', 'cgi', 'film', 'ai', 'edit'];
  const lib = [...S.works].sort((a, b) => {
    // interleave categories so the first screen shows range
    return 0;
  });
  const rr = []; const buckets = order.map(c => lib.filter(w => w.cat === c));
  while (buckets.some(b => b.length)) buckets.forEach(b => b.length && rr.push(b.shift()));
  $('.js-grid').innerHTML = rr.map(w => `<button class="card ${w.orient}" data-id="${w.id}" data-cat="${w.cat}" data-cursor="play" data-cursor-label="Play">
      <span class="card__m"><img src="${img(w.id)}" alt="${w.brand} — ${w.title}" loading="lazy" decoding="async"><video muted loop playsinline preload="none" data-src="${prev(w.id)}"></video></span>
      <span class="card__d">${fmt(w.dur)}</span>
      <span class="card__info"><span class="card__b">${w.brand} · ${w.tag}</span><span class="card__t">${w.title}</span></span>
    </button>`).join('');
  $$('.filter').forEach(f => { const c = f.dataset.f; $('sup', f).textContent = c === 'all' ? S.works.length : S.works.filter(w => w.cat === c).length; });

  // stills
  $('.js-stills').innerHTML = S.stills.map(s => `<figure class="still"><img src="img/ph/${s.id}.webp" alt="${s.brand}" loading="lazy" decoding="async"><span>${/Untitled|full/.test(s.brand) ? 'Product photo' : s.brand}</span></figure>`).join('');

  // AI service preview
  const ai = S.works.find(w => w.cat === 'ai'); const aiRow = $('[data-preview="__AI__"]'); if (ai && aiRow) aiRow.dataset.preview = ai.id;

  /* ---------- preview videos: play in view (touch) or on hover (desktop) ---------- */
  const load = v => { if (!v.src && v.dataset.src) v.src = v.dataset.src; };
  const play = card => { const v = $('video', card); if (!v) return; load(v); const p = v.play(); p && p.then(() => card.classList.add('is-playing')).catch(() => {}); };
  const stop = card => { const v = $('video', card); if (!v) return; v.pause(); card.classList.remove('is-playing'); };
  const cards = () => $$('.fcard, .card');
  if (fine) {
    document.addEventListener('pointerover', e => { const c = e.target.closest('.fcard, .card'); if (c && !c.contains(e.relatedTarget)) play(c); });
    document.addEventListener('pointerout', e => { const c = e.target.closest('.fcard, .card'); if (c && !c.contains(e.relatedTarget)) stop(c); });
  } else {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.intersectionRatio > .6 ? play(e.target) : stop(e.target)), { threshold: [0, .6] });
    cards().forEach(c => io.observe(c));
  }

  /* ---------- modal player ---------- */
  const modal = $('.modal'), mv = $('.modal__video');
  let list = [], idx = 0;
  const show = i => {
    idx = (i + list.length) % list.length; const id = list[idx];
    if (id === 'reel') {
      mv.src = 'media/reel-loop.mp4'; mv.poster = 'img/reel-poster.webp';
      $('.modal__tag').textContent = 'Showreel · 2026';
      $('.modal__title').textContent = 'A few frames from 160+ projects';
      $('.modal__desc').textContent = 'Motion design, CGI, brand films and AI ads — cut together. Tap next to dive into the full projects.';
      $('.modal__cta').dataset.msg = 'Hi Arshad, I watched your reel and I want to work with you.';
    } else {
      const w = byId[id];
      mv.src = full(id); mv.poster = img(id);
      $('.modal__tag').textContent = `${w.brand} · ${w.tag}`;
      $('.modal__title').textContent = w.title;
      $('.modal__desc').textContent = w.desc || `${CAT[w.cat]} for ${w.brand}.`;
      $('.modal__cta').dataset.msg = `Hi Arshad, I saw "${w.brand} — ${w.title}" on your portfolio. I want something like this for my brand.`;
    }
    bindWA($('.modal__cta'));
    mv.muted = false; mv.play().catch(() => { mv.muted = true; mv.play().catch(() => {}); });
  };
  const open = (l, i) => {
    list = l; modal.hidden = false; document.documentElement.style.overflow = 'hidden'; lenis && lenis.stop();
    show(i);
    if (!reduce && window.gsap) { gsap.fromTo('.modal__bg', { opacity: 0 }, { opacity: 1, duration: .4 }); gsap.fromTo('.modal__inner', { y: 60, opacity: 0, scale: .96 }, { y: 0, opacity: 1, scale: 1, duration: .7, ease: 'expo.out' }); }
  };
  const close = () => { mv.pause(); mv.removeAttribute('src'); mv.load(); modal.hidden = true; document.documentElement.style.overflow = ''; lenis && lenis.start(); };
  document.addEventListener('click', e => {
    const c = e.target.closest('.fcard, .card');
    if (c) { const scope = c.classList.contains('fcard') ? S.featured : $$('.card:not(.is-hidden)').map(x => x.dataset.id); open(scope, scope.indexOf(c.dataset.id)); }
    if (e.target.closest('.js-reel, .reel')) open(['reel', ...S.featured], 0);
  });
  $('.modal__close').onclick = close; $('.modal__bg').onclick = close;
  $('.js-prev').onclick = () => show(idx - 1); $('.js-next').onclick = () => show(idx + 1);
  document.addEventListener('keydown', e => { if (modal.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });

  /* ---------- filters + show more ---------- */
  const PAGE = innerWidth < 600 ? 10 : 16; let limit = PAGE, filt = 'all';
  const applyGrid = (animate) => {
    const cs = $$('.card'); let n = 0;
    cs.forEach(c => { const ok = filt === 'all' || c.dataset.cat === filt; const vis = ok && n < limit; if (ok) n++; c.classList.toggle('is-hidden', !vis); });
    $('.js-more').parentElement.style.display = n > limit ? '' : 'none';
    if (animate && window.gsap && !reduce) gsap.fromTo($$('.card:not(.is-hidden)'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .03, ease: 'expo.out', overwrite: true });
    window.ScrollTrigger && ScrollTrigger.refresh();
  };
  $('.js-filters').addEventListener('click', e => {
    const b = e.target.closest('.filter'); if (!b) return;
    $$('.filter').forEach(x => x.classList.toggle('is-active', x === b)); filt = b.dataset.f; limit = PAGE; applyGrid(true);
  });
  $('.js-more').onclick = () => { limit += PAGE; applyGrid(true); };
  applyGrid(false);

  /* ---------- copy email ---------- */
  const toast = m => { const t = $('.toast'); t.textContent = m; t.classList.add('is-on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('is-on'), 2200); };
  $('.js-copy').onclick = () => { navigator.clipboard ? navigator.clipboard.writeText(S.email).then(() => toast('Email copied — talk soon ✦')) : (location.href = 'mailto:' + S.email); };

  /* ---------- stills drag ---------- */
  const rail = $('.js-stills'); let down = false, sx = 0, sl = 0;
  rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = rail.scrollLeft; rail.setPointerCapture(e.pointerId); });
  rail.addEventListener('pointermove', e => { if (down) rail.scrollLeft = sl - (e.clientX - sx) * 1.4; });
  rail.addEventListener('pointerup', () => down = false);

  /* ---------- motion layer (GSAP) — page is fully usable without it ---------- */
  let lenis = null;
  const startMotion = () => {
    if (!window.gsap) { document.body.classList.remove('is-loading'); return; }
    gsap.registerPlugin(ScrollTrigger);

    if (!reduce && window.Lenis) {
      lenis = new Lenis({ duration: 1.1, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
      $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = a.getAttribute('href'); if (t.length > 1 || t === '#top') { e.preventDefault(); lenis.scrollTo(t === '#top' ? 0 : t, { offset: -20 }); } }));
    }

    // scroll progress + hide nav on scroll down
    gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
    let lastY = 0; ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { const y = s.scroll(); $('.nav').classList.toggle('is-hidden', y > lastY && y > 300); lastY = y; } });

    // split headings into lines (by <br>) for reveals
    $$('.split').forEach(h => { h.innerHTML = h.innerHTML.split(/<br\s*\/?>/i).map(l => `<span class="sl"><span>${l}</span></span>`).join(''); });

    if (reduce) { document.body.classList.remove('is-loading'); return; }

    /* intro → hero (≈0.9s total, never waits on network) */
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    const cnt = { v: 0 };
    tl.from('.intro__word', { yPercent: 110, duration: .55 })
      .to(cnt, { v: 100, duration: .5, ease: 'power2.inOut', onUpdate: () => { $('.intro__count span').textContent = String(Math.round(cnt.v)).padStart(2, '0'); } }, 0)
      .to('.intro__word', { yPercent: -110, duration: .45, ease: 'expo.in' }, .55)
      .to('.intro', { clipPath: 'inset(0 0 100% 0)', duration: .6, ease: 'expo.inOut' }, .7)
      .add(() => document.body.classList.remove('is-loading'))
      .from('.hero__title .word', { yPercent: 115, rotate: 4, duration: 1.1, stagger: .05 }, .95)
      .from('.hero__top > *, .hero__lede, .hero__ctas > *', { y: 24, opacity: 0, duration: .9, stagger: .06 }, 1.1)
      .from('.reel__frame', { y: 120, scale: .9, opacity: 0, duration: 1.3 }, 1.05)
      .from('.nav > *', { y: -30, opacity: 0, duration: .8, stagger: .06 }, 1.1);
    gsap.set('.intro', { clipPath: 'inset(0 0 0% 0)' });

    // reel grows to full-bleed on scroll (scroll-driven, the "wow" moment)
    gsap.fromTo('.reel__frame', { scale: .86, borderRadius: 28 }, { scale: 1, borderRadius: 0, ease: 'none', scrollTrigger: { trigger: '.reel', start: 'top 85%', end: 'top 10%', scrub: true } });
    gsap.to('.hero__title', { yPercent: -30, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // headings reveal
    $$('.split').forEach(h => gsap.from($$('.sl>span', h), { yPercent: 110, duration: 1.1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%' } }));
    $$('.eyebrow').forEach(e => gsap.from(e, { opacity: 0, x: -20, duration: .8, scrollTrigger: { trigger: e, start: 'top 90%' } }));

    // counters
    $$('.js-count').forEach(el => { const o = { v: 0 }; gsap.to(o, { v: +el.dataset.to, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => el.textContent = Math.round(o.v) }); });
    gsap.from('.stat', { y: 40, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 85%' } });

    // featured horizontal scroll (desktop)
    ScrollTrigger.matchMedia({
      '(min-width: 821px)': () => {
        const track = $('.js-featured');
        const dist = () => Math.max(0, track.scrollWidth - innerWidth + innerWidth * .04);
        const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.featured', start: 'top top', end: () => '+=' + dist(), pin: '.featured__pin', scrub: .8, invalidateOnRefresh: true, anticipatePin: 1 } });
        // cards tilt/parallax inside
        $$('.fcard', track).forEach(c => gsap.fromTo($('img', c), { xPercent: -6, scale: 1.12 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } }));
      }
    });

    // grid cards reveal
    ScrollTrigger.batch('.card', { start: 'top 92%', onEnter: b => gsap.fromTo(b, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .06, ease: 'expo.out', overwrite: true }) });

    // services rows + floating preview following cursor
    gsap.from('.svc__row', { y: 50, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.svc', start: 'top 85%' } });
    if (fine) {
      const fl = $('.svc__float'), fv = $('video', fl);
      const xTo = gsap.quickTo(fl, 'x', { duration: .6, ease: 'power3' }), yTo = gsap.quickTo(fl, 'y', { duration: .6, ease: 'power3' });
      $('.js-svc').addEventListener('pointermove', e => { xTo(e.clientX + 40); yTo(e.clientY); });
      $$('.svc__row').forEach(r => {
        r.addEventListener('pointerenter', () => { const s = prev(r.dataset.preview); if (!fv.src.endsWith(s)) fv.src = s; fv.play().catch(() => {}); gsap.to(fl, { opacity: 1, scale: 1, duration: .5, ease: 'expo.out' }); });
        r.addEventListener('pointerleave', () => gsap.to(fl, { opacity: 0, scale: .6, duration: .4 }));
      });
      gsap.set(fl, { xPercent: 0, yPercent: -50, scale: .6 });
    }

    // process steps
    gsap.from('.step', { y: 80, opacity: 0, rotate: 2, duration: 1.1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.steps', start: 'top 85%' } });

    // stills: drift with scroll
    gsap.fromTo('.js-stills', { x: 120 }, { x: -120, ease: 'none', scrollTrigger: { trigger: '.stills', start: 'top bottom', end: 'bottom top', scrub: true } });

    // about: word-by-word light-up
    const ab = $('.js-words');
    ab.innerHTML = ab.innerHTML.replace(/(<em>|<\/em>)|([^\s<>]+)/g, (m, tag, w) => tag ? tag : `<span class="w">${w}</span>`);
    gsap.to($$('.w', ab), { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: ab, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    gsap.from('.about__cols > div', { y: 40, opacity: 0, duration: 1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.about__cols', start: 'top 88%' } });

    // CTA title
    gsap.from('.cta__title .line > span', { yPercent: 110, duration: 1.2, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.cta', start: 'top 70%' } });
    gsap.from('.cta__big', { scale: .4, rotate: -30, opacity: 0, duration: 1.4, ease: 'elastic.out(1,.6)', scrollTrigger: { trigger: '.cta__actions', start: 'top 85%' } });
    gsap.fromTo('.foot__giant', { yPercent: 60 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.foot__giant', start: 'top bottom', end: 'bottom bottom', scrub: true } });

    // marquee speeds up with scroll velocity
    const track = $('.js-clients');
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { const v = Math.min(4, 1 + Math.abs(s.getVelocity()) / 800); track.getAnimations().forEach(a => a.playbackRate = v); } });

    /* cursor + magnetic */
    if (fine) {
      const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), lab = $('.cursor__label');
      const dx = gsap.quickTo(dot, 'x', { duration: .1 }), dy = gsap.quickTo(dot, 'y', { duration: .1 });
      const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
      addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
      document.addEventListener('pointerover', e => {
        const t = e.target.closest('[data-cursor]'); cur.classList.remove('is-hover', 'is-label');
        if (!t) return; const k = t.dataset.cursor;
        if (k === 'hover') cur.classList.add('is-hover'); else { lab.textContent = t.dataset.cursorLabel || (k === 'play' ? 'Play' : 'Drag'); cur.classList.add('is-label'); }
      });
      $$('.magnetic').forEach(m => {
        const mx = gsap.quickTo(m, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), my = gsap.quickTo(m, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
        m.addEventListener('pointermove', e => { const r = m.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .3); my((e.clientY - r.top - r.height / 2) * .4); });
        m.addEventListener('pointerleave', () => { mx(0); my(0); });
      });
    }
    addEventListener('load', () => ScrollTrigger.refresh());
  };

  if (document.readyState === 'complete' || window.gsap) startMotion();
  else addEventListener('DOMContentLoaded', startMotion);
  // safety: never keep the intro longer than 2.5s
  setTimeout(() => document.body.classList.remove('is-loading'), 2500);
})();
