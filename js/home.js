import { boot, S, $, $$, byId, media, reduce, fine, reelModal, enhance, previews, splitWords, lenis, ARROW } from './core.js';
import { SERVICES } from './content.js';
import { curvePlayground } from './curve.js';

const gsap = window.gsap, ST = window.ScrollTrigger;
const { ready, after } = await boot();

$$('.js-avail').forEach(e => e.textContent = S.availability);

/* ---------- selected work rows ---------- */
$('.js-rows').innerHTML = S.featured.map((id, i) => {
  const w = byId[id];
  return `<li class="row"><a href="project.html?p=${w.slug}" data-pt="${w.brand}" data-id="${id}" data-cur="bub" data-cur-label="View">
    <span class="row__n mono">${String(i + 1).padStart(2, '0')}</span>
    <span class="row__thumb"><img src="${media.img(id)}" alt="" loading="lazy"></span>
    <span><span class="row__t">${w.brand}</span></span>
    <span class="row__d">${w.title}</span>
    <span class="row__c mono">${w.discipline} · ${w.format}</span>
    <span class="row__arr">${ARROW}</span></a></li>`;
}).join('');

/* ---------- clients marquee ---------- */
const mq = S.clients.map(c => `<span>${c}</span><i></i>`).join('');
$('.js-mq').innerHTML = mq + mq;

/* ---------- capability cards ---------- */
$('.js-caps').innerHTML = SERVICES.map((s, i) => `
  <article class="cap">
    <div class="cap__l">
      <span class="cap__n">(${String(i + 1).padStart(2, '0')}) — ${s.short}</span>
      <h3 class="cap__t">${s.name}</h3>
      <p class="cap__p">${s.line}</p>
      <ul class="cap__list">${s.deliver.slice(0, 5).map(d => `<li>${d}</li>`).join('')}</ul>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:28px">
        <a class="btn ${i === 1 ? 'btn--white' : i === 2 ? 'btn--blue' : ''} btn--sm" data-wa="Hi Arshad! I'm interested in a ${s.name.toLowerCase()} project." data-mag data-cur="link"><span class="roll">Start this project</span><span class="btn__ic"></span></a>
        <a class="btn btn--line btn--sm" href="services.html#${s.key}" data-mag data-cur="link"><span class="roll">Details</span><span class="btn__ic"></span></a>
      </div>
    </div>
    <div class="cap__m"><video muted loop playsinline preload="none" data-src="${media.prev(s.preview)}" poster="${media.img(s.preview)}"></video></div>
  </article>`).join('');

/* ---------- stills rail ---------- */
$('.js-rail').innerHTML = S.stills.map(s => `<figure><img src="img/ph/${s.id}.webp" alt="${s.brand}" loading="lazy" decoding="async"><figcaption class="mono">${s.brand}</figcaption></figure>`).join('');

enhance();

/* ---------- lazy autoplay videos (pills, caps) ---------- */
$$('.pillv[data-v]').forEach(p => p.innerHTML = `<video muted loop playsinline preload="none" data-src="${media.prev(p.dataset.v)}" poster="${media.img(p.dataset.v)}"></video>`);
const auto = new IntersectionObserver(es => es.forEach(e => {
  const v = e.target; if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
}), { rootMargin: '120px' });
$$('.pillv video, .cap__m video').forEach(v => auto.observe(v));

/* ---------- hero: the reel plays inside the name ---------- */
const heroReel = document.createElement('video');
Object.assign(heroReel, { muted: true, loop: true, playsInline: true, autoplay: true, preload: 'auto' });
heroReel.setAttribute('playsinline', ''); heroReel.setAttribute('muted', '');
heroReel.src = 'media/reel-loop.mp4';
heroReel.play().catch(() => {});
const { createNameHero } = await import('./hero-name.js');
const nameHero = createNameHero($('.js-nh'), heroReel, { word: 'ARSHAD', focus: 3 });
$('.js-nh').addEventListener('click', () => reelModal('media/reel-loop.mp4'));
$('.js-reel-play').addEventListener('click', () => reelModal('media/reel-loop.mp4'));

/* ---------- hero intro (after loader / transition) ---------- */
const titleWords = splitWords($('[data-hero-title]'));
if (gsap && !reduce) {
  gsap.set(titleWords, { yPercent: 115 });
  gsap.set('[data-hero-fade], .nh__top > *', { opacity: 0, y: 24 });
}
await ready;
if (gsap && !reduce) {
  gsap.to(titleWords, { yPercent: 0, duration: 1.4, stagger: .06, ease: 'expo.out', delay: .25 });
  gsap.to('[data-hero-fade], .nh__top > *', { opacity: 1, y: 0, duration: 1.1, stagger: .07, ease: 'expo.out', delay: .5 });
}
nameHero.start();
after();

if (gsap && ST && !reduce) {
  /* hero: dive through the H until the reel fills the screen */
  ST.create({ trigger: '.nh', start: 'top top', end: 'bottom bottom', onUpdate: s => nameHero.setProgress(s.progress) });
  gsap.to('.nh__ui, .nh__cue', { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: '.nh', start: 'top top', end: '25% top', scrub: true } });
  gsap.fromTo('.nh__end', { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: '.nh', start: '52% top', end: '72% top', scrub: true } });
  gsap.fromTo('.nh__end .d1, .nh__end .reel__play', { scale: .7, y: 40 }, { scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: '.nh', start: '52% top', end: '80% top', scrub: true } });

  /* statement — words light up as you read */
  const st = $('.js-state'); const words = splitWords(st);
  gsap.set(words, { opacity: .14 });
  gsap.to(words, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: st, start: 'top 78%', end: 'bottom 50%', scrub: true } });
  gsap.from('.pillv', { scale: 0, duration: 1, stagger: .15, ease: 'expo.out', scrollTrigger: { trigger: st, start: 'top 75%' } });

  /* capability cards stack and recede */
  const caps = $$('.cap');
  caps.forEach((c, i) => {
    const next = caps[i + 1]; if (!next) return;
    gsap.fromTo(c, { scale: 1, '--dim': 0 }, { scale: .9, '--dim': .35, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 90px', scrub: true } });
  });

  /* rows stagger in */
  gsap.from('.row', { y: 50, opacity: 0, duration: 1, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: '.rows', start: 'top 85%' } });

  /* stills drift */
  gsap.fromTo('.js-rail', { x: 120 }, { x: -120, ease: 'none', scrollTrigger: { trigger: '.js-rail', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* marquee reacts to scroll velocity */
  const mqEl = $('.js-mq');
  if (lenis) lenis.on('scroll', ({ velocity }) => mqEl.getAnimations().forEach(a => a.playbackRate = 1 + Math.min(5, Math.abs(velocity) * .25) * Math.sign(velocity || 1)));
}

/* ---------- floating preview for rows ---------- */
if (fine && gsap) {
  const fl = $('.float'), inner = $('.float__in');
  const xT = gsap.quickTo(fl, 'x', { duration: .7, ease: 'power3' }), yT = gsap.quickTo(fl, 'y', { duration: .7, ease: 'power3' });
  const rT = gsap.quickTo(fl, 'rotation', { duration: .8, ease: 'power3' });
  let lx = 0, shown = false;
  const rows = $('.js-rows');
  rows.addEventListener('pointermove', e => { xT(e.clientX - fl.offsetWidth / 2); yT(e.clientY - fl.offsetHeight / 2); rT(Math.max(-12, Math.min(12, (e.clientX - lx) * .6))); lx = e.clientX; });
  $$('.row a', rows).forEach(a => a.addEventListener('pointerenter', () => {
    const id = a.dataset.id;
    let v = $(`video[data-id="${id}"]`, inner);
    if (!v) { inner.insertAdjacentHTML('beforeend', `<video data-id="${id}" muted loop playsinline src="${media.prev(id)}" poster="${media.img(id)}"></video>`); v = $(`video[data-id="${id}"]`, inner); }
    $$('video', inner).forEach(x => { if (x !== v) { gsap.to(x, { clipPath: 'inset(0 0 100% 0)', duration: .5, ease: 'expo.out' }); x.pause(); } });
    gsap.fromTo(v, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: .7, ease: 'expo.out' });
    inner.appendChild(v); v.play().catch(() => {});
    if (!shown) { shown = true; gsap.fromTo(fl, { scale: .3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .6, ease: 'expo.out' }); }
  }));
  rows.addEventListener('pointerleave', () => { shown = false; gsap.to(fl, { scale: .3, autoAlpha: 0, duration: .4, ease: 'expo.in' }); });
}

/* ---------- stills drag ---------- */
const rail = $('.js-rail'); let down = null;
rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = { x: e.clientX, s: rail.scrollLeft }; rail.setPointerCapture(e.pointerId); });
rail.addEventListener('pointermove', e => { if (down) rail.scrollLeft = down.s - (e.clientX - down.x) * 1.5; });
rail.addEventListener('pointerup', () => down = null);

/* ---------- playground ---------- */
curvePlayground($('.js-curve'), $('.js-presets'));
enhance($('.js-curve'));
