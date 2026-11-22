/* =========================================================
   CORE — shared shell, motion & micro-interactions
   ========================================================= */
export const S = window.SITE;
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
export const byId = Object.fromEntries(S.works.map(w => [w.id, w]));
export const bySlug = Object.fromEntries(S.works.map(w => [w.slug, w]));
export const media = { img: id => `img/${id}.webp`, prev: id => `media/${id}-p.mp4`, full: id => `media/${id}.mp4`, still: (id, n) => `img/s/${id}-${n}.webp` };
export const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
export const wa = msg => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;
export const ARROW = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 13 13 1M4 1h9v9"/></svg>';
const gsap = window.gsap, ST = window.ScrollTrigger;
export let lenis = null;

const PAGE_NAMES = { 'index': 'Home', '': 'Home', 'work': 'Work', 'services': 'Services', 'about': 'About', 'contact': "Let's talk", 'project': 'Project' };

/* ---------- shell markup ---------- */
function shell() {
  const page = document.body.dataset.page;
  const nav = `
  <header class="nav">
    <a href="index.html" class="nav__logo" data-cur="link" aria-label="Arshad — home">arshad<b></b></a>
    <nav class="nav__mid mono" aria-label="Primary">
      <a href="work.html" class="roll" data-cur="link">Work</a>
      <a href="services.html" class="roll" data-cur="link">Services</a>
      <a href="about.html" class="roll" data-cur="link">About</a>
      <a href="contact.html" class="roll" data-cur="link">Contact</a>
    </nav>
    <div class="nav__r">
      <span class="nav__time js-time">Kerala</span>
      <button class="menu-btn" data-cur="link" aria-expanded="false" aria-controls="menu"><span class="roll js-menu-l">Menu</span><span class="menu-btn__ic"><i></i><i></i></span></button>
    </div>
  </header>
  <div class="menu" id="menu" aria-hidden="true">
    <ul class="menu__links">
      ${[['index.html', 'Home', ''], ['work.html', 'Work', S.works.length], ['services.html', 'Services', '05'], ['about.html', 'About', ''], ['contact.html', "Let's talk", '']].map(([h, t, n], i) => `<li><a href="${h}" data-cur="link" data-v="${S.featured[i % S.featured.length]}">${t}${n !== '' ? `<sup>${n}</sup>` : ''}</a></li>`).join('')}
    </ul>
    <div class="menu__side">
      <div class="menu__media"></div>
      <div class="menu__info">
        <div><span class="mono muted">Say hello</span><a href="mailto:${S.email}" class="ul" data-cur="link">${S.email}</a><a href="${wa('Hi Arshad! I found your portfolio.')}" target="_blank" rel="noopener" class="ul" data-cur="link">WhatsApp ↗</a></div>
        <div><span class="mono muted">Elsewhere</span><a href="${S.behance}" target="_blank" rel="noopener" class="ul" data-cur="link">Behance ↗</a>${S.instagram ? `<a href="${S.instagram}" target="_blank" rel="noopener" class="ul" data-cur="link">Instagram ↗</a>` : ''}${S.linkedin ? `<a href="${S.linkedin}" target="_blank" rel="noopener" class="ul" data-cur="link">LinkedIn ↗</a>` : ''}<span class="avail mono" style="margin-top:14px"><i></i>${S.availability}</span></div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('afterbegin', nav + `
  <div class="loader" aria-hidden="true">
    <div class="loader__top mono"><span>Arshad — Portfolio ©${new Date().getFullYear()}</span><span class="js-ltc">00:00:00:00</span></div>
    <div><div class="loader__name">${'ARSHAD'.split('').map(c => `<span>${c}</span>`).join('')}</div>
    <div class="loader__bar"><div class="loader__fill"></div><div class="loader__keys"><i></i><i></i><i></i><i></i><i></i></div></div></div>
  </div>
  <div class="pt" aria-hidden="true"><div class="pt__panel"><div class="pt__title"><span class="js-ptt"></span></div><div class="pt__tc js-pttc">00:00:00:00</div></div></div>
  <div class="cur" aria-hidden="true"><div class="cur__dot"></div><div class="cur__ring"><div class="cur__bub js-bub">View</div></div></div>
  <div class="toast" role="status" aria-live="polite"></div>`);

  if (document.body.dataset.foot !== 'off') {
    const ftitle = document.body.dataset.footTitle || 'Have a story<br>worth <em style="font-style:normal;opacity:.55">moving?</em>';
    document.querySelector('main').insertAdjacentHTML('afterend', `
    <footer class="foot dk-cur" data-hud="Contact">
      <div class="foot__in">
        <p class="label mono" style="color:rgba(255,255,255,.7)">Let's work together</p>
        <h2 class="foot__t" data-split style="margin-top:28px">${ftitle}</h2>
        <div class="foot__row">
          <a class="foot__big" href="${wa("Hi Arshad, I'd like to start a project with you.")}" target="_blank" rel="noopener" data-mag data-cur="link">Start a<br>project<small>Replies same day</small></a>
          <div class="foot__links">
            <div><span class="mono">Contact</span><button class="ul js-copy" data-cur="link">${S.email}</button><a class="ul" href="tel:${S.phone.replace(/\s/g, '')}" data-cur="link">${S.phone}</a><a class="ul" href="contact.html" data-cur="link">Send a brief →</a></div>
            <div><span class="mono">Pages</span><a class="ul" href="work.html" data-cur="link">Work</a><a class="ul" href="services.html" data-cur="link">Services</a><a class="ul" href="about.html" data-cur="link">About</a></div>
            <div><span class="mono">Social</span><a class="ul" href="${S.behance}" target="_blank" rel="noopener" data-cur="link">Behance ↗</a><a class="ul" href="${wa('Hi Arshad!')}" target="_blank" rel="noopener" data-cur="link">WhatsApp ↗</a>${S.instagram ? `<a class="ul" href="${S.instagram}" target="_blank" rel="noopener" data-cur="link">Instagram ↗</a>` : ''}${S.linkedin ? `<a class="ul" href="${S.linkedin}" target="_blank" rel="noopener" data-cur="link">LinkedIn ↗</a>` : ''}</div>
          </div>
        </div>
        <div class="foot__bar mono"><span>© ${new Date().getFullYear()} Arshad. Made frame by frame in Kerala.</span><span class="js-time2"></span><button class="ul js-top" data-cur="link">Back to top ↑</button></div>
      </div>
      <div class="foot__giant" aria-hidden="true">${'ARSHAD'.split('').map(c => `<span>${c}</span>`).join('')}</div>
    </footer>`);
  }
  if (document.body.dataset.hud !== 'off') {
    document.body.insertAdjacentHTML('beforeend', `<div class="hud" aria-hidden="true"><span class="hud__tc js-tc">00:00:00:00</span><div class="hud__track"><div class="hud__fill"></div></div><span class="hud__fps js-fps">25 FPS</span></div>`);
  }
}

/* ---------- small helpers ---------- */
export function toast(msg) { const t = $('.toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2400); }
const tc = (sec, fps = 25) => { const f = Math.floor((sec % 1) * fps), s = Math.floor(sec) % 60, m = Math.floor(sec / 60) % 60, h = Math.floor(sec / 3600); return [h, m, s, f].map(v => String(v).padStart(2, '0')).join(':'); };

export function enhance(root = document) {
  // roll text
  $$('.roll:not([data-r])', root).forEach(r => { r.dataset.r = 1; const t = r.textContent.trim(); r.innerHTML = `<span data-t="${t.replace(/"/g, '&quot;')}">${t}</span>`; });
  // arrow icons
  $$('.btn__ic:empty', root).forEach(i => i.innerHTML = ARROW + ARROW);
  // whatsapp links
  $$('[data-wa]', root).forEach(a => { a.href = wa(a.dataset.wa || 'Hi Arshad!'); a.target = '_blank'; a.rel = 'noopener'; });
  if (fine) magnetic(root);
}

function magnetic(root) {
  if (!gsap) return;
  $$('[data-mag]:not([data-magd])', root).forEach(m => {
    m.dataset.magd = 1;
    const k = +(m.dataset.mag || .35);
    const xT = gsap.quickTo(m, 'x', { duration: .8, ease: 'elastic.out(1,.35)' }), yT = gsap.quickTo(m, 'y', { duration: .8, ease: 'elastic.out(1,.35)' });
    m.addEventListener('pointermove', e => { const r = m.getBoundingClientRect(); xT((e.clientX - r.left - r.width / 2) * k); yT((e.clientY - r.top - r.height / 2) * k); });
    m.addEventListener('pointerleave', () => { xT(0); yT(0); });
  });
}

/* split into words with mask, keeps <em>/<br> */
export function splitWords(el) {
  if (el.dataset.splitd) return $$('.sw>span', el);
  el.dataset.splitd = 1;
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(' '));
          else { const w = document.createElement('span'); w.className = 'sw'; w.innerHTML = `<span>${p}</span>`; frag.appendChild(w); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('pillv')) walk(n);
    });
  };
  walk(el);
  return $$('.sw>span', el);
}

/* text scramble for mono labels */
const GLYPHS = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export function scramble(el, dur = 700) {
  const final = el.dataset.txt || (el.dataset.txt = el.textContent);
  const start = performance.now();
  const step = now => {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = final.split('').map((c, i) => c === ' ' ? ' ' : (i / final.length < p ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- cursor ---------- */
function cursor() {
  if (!fine || !gsap) return;
  document.documentElement.classList.add('has-cur');
  const c = $('.cur'), dot = $('.cur__dot'), ring = $('.cur__ring'), bub = $('.js-bub');
  const dx = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: .55, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .55, ease: 'power3' });
  addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
  addEventListener('pointerdown', () => c.classList.add('is-down'));
  addEventListener('pointerup', () => c.classList.remove('is-down'));
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('[data-cur]');
    c.classList.remove('is-link', 'is-bub', 'is-text');
    c.classList.toggle('on-dark', !!e.target.closest('.dk,.bl,.foot,.menu,.cap:nth-child(2),.cap:nth-child(3),.reel'));
    if (!t) { if (e.target.closest('p,h1,h2,h3')) c.classList.add('is-text'); return; }
    const k = t.dataset.cur;
    if (k === 'link') c.classList.add('is-link');
    else { bub.textContent = t.dataset.curLabel || k; c.classList.add('is-bub'); }
  });
  document.addEventListener('pointerleave', () => gsap.to(c, { opacity: 0, duration: .3 }));
  document.addEventListener('pointerenter', () => gsap.to(c, { opacity: 1, duration: .3 }));
}

/* ---------- smooth scroll ---------- */
function smooth() {
  if (reduce || !window.Lenis) return;
  lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: .95 });
  lenis.on('scroll', ST.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
export const scrollTo = (target, opts = {}) => lenis ? lenis.scrollTo(target, { duration: 1.4, ...opts }) : (typeof target === 'number' ? scrollTo({ top: target }) : document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' }));

/* ---------- nav, menu, clock ---------- */
function navMenu() {
  const nav = $('.nav'), menu = $('#menu'), btn = $('.menu-btn'), mediaBox = $('.menu__media');
  let lastY = 0;
  const onScroll = y => { nav.classList.toggle('hide', y > lastY && y > 200 && !document.body.classList.contains('menu-open')); lastY = y; };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll)); else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

  let open = false, tl;
  if (gsap) {
    tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
      .set(menu, { visibility: 'visible' })
      .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: .9 })
      .from($$('.menu__links a', menu), { yPercent: 110, duration: .9, stagger: .05, ease: 'expo.out' }, .35)
      .from($$('.menu__side > *', menu), { opacity: 0, y: 30, duration: .8, stagger: .08, ease: 'expo.out' }, .5);
  }
  const toggle = (state = !open) => {
    open = state; document.body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open); menu.setAttribute('aria-hidden', !open);
    const l = $('.js-menu-l span'); if (l) { l.textContent = open ? 'Close' : 'Menu'; l.dataset.t = open ? 'Close' : 'Menu'; }
    if (tl) open ? tl.timeScale(1).play() : tl.timeScale(1.6).reverse(); else { menu.style.visibility = open ? 'visible' : 'hidden'; menu.style.clipPath = open ? 'none' : ''; }
    lenis && (open ? lenis.stop() : lenis.start());
  };
  btn.addEventListener('click', () => toggle());
  addEventListener('keydown', e => e.key === 'Escape' && open && toggle(false));
  // menu link previews
  $$('.menu__links a', menu).forEach(a => a.addEventListener('pointerenter', () => {
    let v = $(`video[data-id="${a.dataset.v}"]`, mediaBox);
    if (!v) { v = document.createElement('video'); Object.assign(v, { muted: true, loop: true, playsInline: true, src: media.prev(a.dataset.v) }); v.dataset.id = a.dataset.v; mediaBox.appendChild(v); }
    $$('video', mediaBox).forEach(x => { x.classList.toggle('on', x === v); x === v ? x.play().catch(() => {}) : x.pause(); });
  }));

  const clock = () => {
    const t = new Date().toLocaleTimeString('en-US', { timeZone: S.timezone, hour: 'numeric', minute: '2-digit' });
    $$('.js-time').forEach(e => e.textContent = `Kerala, IN — ${t}`);
    $$('.js-time2').forEach(e => e.textContent = `It's ${t} in Kerala`);
  };
  clock(); setInterval(clock, 20000);

  $$('.js-copy').forEach(b => b.addEventListener('click', () => {
    (navigator.clipboard ? navigator.clipboard.writeText(S.email) : Promise.reject()).then(() => toast('Email copied — talk soon')).catch(() => location.href = 'mailto:' + S.email);
  }));
  $$('.js-top').forEach(b => b.addEventListener('click', () => scrollTo(0)));
}

/* ---------- HUD: the page as a timeline ---------- */
function hud() {
  const h = $('.hud'); if (!h || !ST) return;
  const track = $('.hud__track', h), fill = $('.hud__fill', h), tcEl = $('.js-tc'), fpsEl = $('.js-fps');
  const secs = $$('[data-hud]');
  const build = () => {
    $$('.hud__key', track).forEach(k => k.remove());
    const max = document.documentElement.scrollHeight - innerHeight;
    secs.forEach(s => {
      const k = document.createElement('button');
      k.className = 'hud__key'; k.setAttribute('data-cur', 'link');
      k.style.left = Math.min(100, (s.getBoundingClientRect().top + scrollY) / max * 100) + '%';
      k.innerHTML = `<span>${s.dataset.hud}</span>`;
      k.onclick = () => scrollTo(s);
      k._s = s; track.appendChild(k);
    });
  };
  build(); ST.addEventListener('refresh', build);
  ST.create({ start: 0, end: 'max', onUpdate: self => {
    fill.style.transform = `scaleX(${self.progress})`;
    tcEl.textContent = tc(self.scroll() / 420);
    $$('.hud__key', track).forEach(k => k.classList.toggle('on', k._s.getBoundingClientRect().top < innerHeight * .5));
  } });
  // real fps readout — a tiny motion-nerd detail
  let n = 0, t0 = performance.now();
  gsap.ticker.add(() => { n++; const now = performance.now(); if (now - t0 > 1000) { fpsEl.textContent = `${Math.round(n * 1000 / (now - t0))} FPS`; n = 0; t0 = now; } });
}

/* ---------- reveals ---------- */
export function reveals(root = document) {
  if (!gsap || reduce) { $$('[data-fade]', root).forEach(e => e.style.opacity = 1); return; }
  $$('[data-split]:not([data-rv])', root).forEach(el => {
    el.dataset.rv = 1;
    const words = splitWords(el);
    gsap.from(words, { yPercent: 115, rotate: 3, duration: 1.2, stagger: .035, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' }, delay: +(el.dataset.delay || 0) });
  });
  $$('[data-fade]:not([data-rv])', root).forEach(el => {
    el.dataset.rv = 1;
    gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', delay: +(el.dataset.delay || 0), scrollTrigger: { trigger: el, start: 'top 92%' } });
  });
  $$('[data-scramble]:not([data-rv])', root).forEach(el => {
    el.dataset.rv = 1;
    ST.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => scramble(el) });
  });
  $$('[data-count]:not([data-rv])', root).forEach(el => {
    el.dataset.rv = 1; const o = { v: 0 }, to = +el.dataset.count;
    gsap.to(o, { v: to, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => el.firstChild.nodeValue = Math.round(o.v) });
  });
  $$('[data-parallax]', root).forEach(el => gsap.fromTo(el, { yPercent: -(+el.dataset.parallax || 10) }, { yPercent: +el.dataset.parallax || 10, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
}

function footerMotion() {
  const f = $('.foot'); if (!f || !gsap || reduce) return;
  gsap.from($$('.foot__giant span', f), { yPercent: 100, duration: 1.4, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: '.foot__giant', start: 'top 98%' } });
  gsap.from('.foot__big', { scale: .3, rotate: -40, duration: 1.6, ease: 'elastic.out(1,.55)', scrollTrigger: { trigger: '.foot__row', start: 'top 88%' } });
}

/* ---------- hover-to-play preview videos ---------- */
export function previews(root = document) {
  const play = el => { const v = $('video', el); if (!v) return; if (!v.src) v.src = v.dataset.src; v.play().then(() => el.classList.add('play')).catch(() => {}); };
  const stop = el => { const v = $('video', el); if (!v) return; v.pause(); el.classList.remove('play'); };
  const items = $$('[data-prev]:not([data-pv])', root);
  items.forEach(el => el.dataset.pv = 1);
  if (fine) items.forEach(el => { el.addEventListener('pointerenter', () => play(el)); el.addEventListener('pointerleave', () => stop(el)); });
  else {
    const io = new IntersectionObserver(es => es.forEach(e => (e.intersectionRatio > .65 ? play : stop)(e.target)), { threshold: [0, .65] });
    items.forEach(el => io.observe(el));
  }
}

/* ---------- loader & page transitions ---------- */
function loaderIn() {
  const first = !sessionStorage.getItem('seen');
  const arriving = sessionStorage.getItem('pt');
  sessionStorage.removeItem('pt');
  const loader = $('.loader'), pt = $('.pt');
  return new Promise(resolve => {
    if (!gsap || reduce) { loader.remove(); resolve(); return; }
    if (arriving) {
      loader.remove();
      $('.js-ptt').textContent = arriving;
      gsap.set(pt, { visibility: 'visible' }); gsap.set('.pt__panel', { yPercent: 0 });
      gsap.timeline({ onComplete: () => gsap.set(pt, { visibility: 'hidden' }) })
        .to('.pt__panel', { yPercent: -100, duration: .9, ease: 'expo.inOut', delay: .05 })
        .add(resolve, .35);
      return;
    }
    if (!first) { loader.remove(); resolve(); return; }
    sessionStorage.setItem('seen', 1);
    // first visit: short, honest loader (~1.1s) — waits for fonts, never for video
    const keys = $$('.loader__keys i'), tcl = $('.js-ltc'); const o = { p: 0 };
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    const tl = gsap.timeline();
    tl.from('.loader__name span', { yPercent: 105, duration: .8, stagger: .045, ease: 'expo.out' }, 0)
      .to(o, { p: 1, duration: 1.0, ease: 'power2.inOut', onUpdate: () => {
        $('.loader__fill').style.transform = `scaleX(${o.p})`;
        keys.forEach((k, i) => k.classList.toggle('on', o.p >= i / (keys.length - 1) - .001));
        tcl.textContent = tc(o.p * 4.2);
      } }, 0);
    Promise.all([fonts, new Promise(r => tl.eventCallback('onComplete', r))]).then(() => {
      gsap.timeline({ onComplete: () => loader.remove() })
        .to('.loader__name span', { yPercent: -105, duration: .6, stagger: .03, ease: 'expo.in' })
        .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'expo.inOut' }, .35)
        .add(resolve, .55);
    });
  });
}

function transitions() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search) { if (url.hash) return; e.preventDefault(); scrollTo(0); return; }
    e.preventDefault();
    const key = url.pathname.split('/').pop().replace('.html', '');
    const title = a.dataset.pt || PAGE_NAMES[key] || 'Arshad';
    if (!gsap || reduce) { location.href = url.href; return; }
    sessionStorage.setItem('pt', title);
    $('.js-ptt').textContent = title;
    const pt = $('.pt');
    gsap.set(pt, { visibility: 'visible' });
    const o = { t: 0 };
    gsap.timeline({ onComplete: () => { location.href = url.href; } })
      .fromTo('.pt__panel', { yPercent: 100 }, { yPercent: 0, duration: .75, ease: 'expo.inOut' })
      .from('.js-ptt', { yPercent: 110, duration: .6, ease: 'expo.out' }, .35)
      .to(o, { t: 1.2, duration: .75, onUpdate: () => $('.js-pttc').textContent = tc(o.t) }, 0);
  });
  // bfcache: hide panel when coming back
  addEventListener('pageshow', e => { if (e.persisted && gsap) { gsap.set('.pt', { visibility: 'hidden' }); gsap.set('.pt__panel', { yPercent: 100 }); } });
}

/* ---------- reel modal (shared) ---------- */
export function reelModal(src = 'media/reel-loop.mp4') {
  let m = $('.modal');
  if (!m) {
    document.body.insertAdjacentHTML('beforeend', `<div class="modal" role="dialog" aria-modal="true" aria-label="Showreel"><video controls playsinline></video><button class="modal__x" aria-label="Close" data-cur="link">✕</button></div>`);
    m = $('.modal');
    const close = () => { const v = $('video', m); v.pause(); gsap.to(m, { autoAlpha: 0, duration: .4 }); lenis && lenis.start(); };
    $('.modal__x', m).onclick = close; m.addEventListener('click', e => e.target === m && close());
    addEventListener('keydown', e => e.key === 'Escape' && close());
  }
  const v = $('video', m); v.src = src; v.muted = false;
  gsap.to(m, { autoAlpha: 1, duration: .5 }); gsap.fromTo(v, { scale: .9, y: 40 }, { scale: 1, y: 0, duration: .9, ease: 'expo.out' });
  lenis && lenis.stop();
  v.play().catch(() => { v.muted = true; v.play(); });
}

/* ---------- boot ---------- */
export async function boot() {
  document.documentElement.classList.add('js');
  shell();
  if (gsap) gsap.registerPlugin(ST);
  smooth();
  enhance();
  cursor();
  navMenu();
  transitions();
  previews();
  const ready = loaderIn();
  return { ready, after: () => { reveals(); footerMotion(); hud(); addEventListener('load', () => ST && ST.refresh()); } };
}
