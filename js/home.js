import { boot, S, $, $$, byId, media, reduce, fine, enhance, previews, splitWords, lenis } from './core.js';
import { SERVICES } from './content.js';
import { curvePlayground } from './curve.js';

const gsap = window.gsap, ST = window.ScrollTrigger;

/* ---------- content ---------- */
$$('.js-avail').forEach(e => e.textContent = S.availability);
const name = $('.js-name');
name.innerHTML = name.textContent.split('').map(c => `<span>${c}</span>`).join('');

const CRAFTS = [
  { L: 'M', t: 'Motion', s: SERVICES[0], list: ['Logo animation', 'Brand motion systems', 'Social & ad creatives', '3D product animation', 'Explainers & UI motion'] },
  { L: 'C', t: 'CGI / VFX', s: SERVICES[1], list: ['FOOH billboards', 'Photoreal product renders', 'Launch films', 'Compositing & clean-up', 'Landmark CGI'] },
  { L: 'F', t: 'Film', s: SERVICES[3], list: ['Concept & direction', 'Product & food shoots', 'Edit & colour', 'Reels & series', 'Photography'] },
  { L: 'A', t: 'AI films', s: SERVICES[4], list: ['AI commercials', 'AI brand characters', 'Pitch visualisation', 'Hybrid AI + VFX', 'Rapid ad variations'] },
];
$('.js-crafts').innerHTML = CRAFTS.map(c => `<div class="h3-col" data-fade><b>${c.L}</b><h3>${c.t}</h3><ul>${c.list.map(x => `<li>${x}</li>`).join('')}</ul><a href="services.html#${c.s.key}" class="ul mono" data-cur="link">Learn more →</a></div>`).join('');

const mq = S.clients.map(c => `<span>${c}</span><i></i>`).join('');
$('.js-mq').innerHTML = mq + mq;

$('.js-cards').innerHTML = S.featured.slice(0, 4).map(id => { const w = byId[id]; return `<a href="project.html?p=${w.slug}" data-pt="${w.brand}" data-cur="bub" data-cur-label="View"><span class="mc" data-prev style="display:block"><img src="${media.img(id)}" alt="${w.brand} — ${w.title}" loading="lazy"><video muted loop playsinline preload="none" data-src="${media.prev(id)}"></video></span><p><b>${w.brand}</b><span class="mono muted">${w.discipline}</span></p></a>`; }).join('');

const { ready, after } = await boot();
curvePlayground($('.js-curve'), $('.js-presets'));
enhance($('.js-curve'));
previews();
$('.foot').dataset.form = 'ring'; $('.foot').dataset.bg = 'blue';

/* ---------- the 3D world ---------- */
let world = null;
try { const { createWorld } = await import('./world.js'); world = createWorld($('.world'), { mode: 'home' }); }
catch (e) { console.warn('3D off', e); }
if (world) document.body.classList.add('has-world');
if (!fine) $('.js-hint').textContent = 'Touch · tap — every diamond is a keyframe';

const secs = $$('[data-form]');
if (world) world.setStops(secs.map(s => ({ f: s.dataset.form })));
let tops = [];
const measure = () => { tops = secs.map(s => s.getBoundingClientRect().top + scrollY); };
measure(); addEventListener('resize', measure); if (ST) ST.addEventListener('refresh', measure);
const onScroll = y => {
  if (!world) return;
  const vh = innerHeight; let p = 0;
  for (let k = 1; k < secs.length; k++) { const st = tops[k] - vh, en = tops[k] - vh * .2; p += Math.min(1, Math.max(0, (y - st) / (en - st))); }
  world.setPos(p);
  // background follows the section in the middle of the screen
  let bgName = 'paper';
  secs.forEach((s, k) => { const r = s.getBoundingClientRect(); if (r.top < vh * .5 && r.bottom > vh * .5) bgName = s.dataset.bg || 'paper'; });
  world.setBg(bgName);
  document.body.classList.toggle('on-dark-world', bgName !== 'paper');
};
if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll)); else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
onScroll(scrollY);

/* ---------- name: variable-weight wave following the cursor ---------- */
const letters = $$('span', name);
let nx = .5, tnx = .5, lastMove = 0;
addEventListener('pointermove', e => { tnx = e.clientX / innerWidth; lastMove = performance.now(); });
const nameLoop = now => {
  requestAnimationFrame(nameLoop);
  if (now - lastMove > 2500) tnx = .5 + Math.sin(now / 2200) * .45;
  nx += (tnx - nx) * .08;
  letters.forEach((l, i) => {
    const c = (i + .5) / letters.length, d = (c - nx) / .16, g = Math.exp(-d * d);
    l.style.fontWeight = Math.round(360 + 340 * g);
    l.style.transform = `translateY(${-g * 2.2}vw) scaleY(${1 + g * .08})`;
  });
};
if (!reduce) requestAnimationFrame(nameLoop);

/* ---------- intro + motion ---------- */
if (gsap && !reduce) {
  gsap.set(letters, { yPercent: 105 });
  gsap.set('[data-hero-fade], .h3-top > *', { opacity: 0, y: 20 });
}
await ready;
if (gsap && !reduce) {
  gsap.to(letters, { yPercent: 0, duration: 1.5, stagger: .07, ease: 'expo.out' });
  gsap.to('[data-hero-fade], .h3-top > *', { opacity: 1, y: 0, duration: 1.1, stagger: .08, ease: 'expo.out', delay: .4 });
}
after();

if (gsap && ST && !reduce) {
  // hero name sinks away as you leave
  gsap.to('.h3-name', { yPercent: 35, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.h3-hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.h3-top, .h3-mid, .h3-scroll', { opacity: 0, y: -40, ease: 'none', scrollTrigger: { trigger: '.h3-hero', start: '10% top', end: '60% top', scrub: true } });

  // intro lines rise word by word, scrubbed to scroll (pinned by CSS sticky)
  const lines = $$('[data-line]');
  lines.forEach(l => splitWords(l));
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.h3-intro', start: 'top 70%', end: '55% center', scrub: .6 } });
  lines.forEach((l, i) => tl.from($$('.sw>span', l), { yPercent: 115, stagger: .04, ease: 'power3.out', duration: .6 }, i * .18));
  gsap.to('.h3-stick', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '.h3-intro', start: '78% center', end: 'bottom center', scrub: true } });

  // brands stack slides sideways in opposite directions
  $$('.h3-stack div').forEach((row, i) => gsap.fromTo(row, { xPercent: i % 2 ? 12 : -12 }, { xPercent: i % 2 ? -12 : 12, ease: 'none', scrollTrigger: { trigger: '.h3-brands', start: 'top bottom', end: 'bottom top', scrub: true } }));

  // marquee reacts to scroll velocity
  const mqEl = $('.js-mq');
  if (lenis) lenis.on('scroll', ({ velocity }) => mqEl.getAnimations().forEach(a => a.playbackRate = 1 + Math.min(5, Math.abs(velocity) * .25)));
}
