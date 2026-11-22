import { boot, S, $, $$, byId, bySlug, media, fmt, wa, reduce, enhance, previews, reveals, scrollTo, toast, ARROW } from './core.js';
import { SERVICES, PROCESS, FAQ } from './content.js';

const gsap = window.gsap, ST = window.ScrollTrigger;
const page = document.body.dataset.page;
const CATS = [['all', 'All'], ['motion', 'Motion design'], ['cgi', 'CGI / VFX'], ['film', 'Brand films'], ['ai', 'AI films'], ['edit', 'Edit & post']];
const ROLE = { motion: 'Concept, design & animation', cgi: '3D, tracking, lighting & compositing', film: 'Direction, shoot, edit & colour', ai: 'AI direction, edit & finishing', edit: 'Edit, sound & finishing' };
const HOW = {
  motion: 'The approach: find the one movement that feels like the brand, then build every frame around it — timing, easing and typography designed to be recognisable within the first second and consistent in every format.',
  cgi: 'The approach: start from a real plate, track the camera, build and light the 3D to match the location, then composite until the line between real and rendered disappears.',
  film: 'The approach: plan every shot around the story beat it serves, shoot for texture and light, then cut, colour and sound-design so the film holds attention until the last frame.',
  ai: 'The approach: use AI for what would be impossible or slow to shoot, then direct, edit, grade and composite every generation so the result feels crafted and on brand — not generated.',
  edit: 'The approach: find the hook, cut to rhythm and remove everything that doesn’t earn its place — so every second pulls the viewer forward.',
};

export const acard = w => `<a class="acard ${w.orient === 'wide' ? 'wide' : ''}" href="project.html?p=${w.slug}" data-pt="${w.brand}" data-cat="${w.cat}" data-cur="bub" data-cur-label="View">
  <div class="mc" data-prev><img src="${media.img(w.id)}" alt="${w.brand} — ${w.title}" loading="lazy" decoding="async"><video muted loop playsinline preload="none" data-src="${media.prev(w.id)}"></video><span class="mc__dur">${fmt(w.dur)}</span></div>
  <div class="acard__meta"><div><div class="acard__t">${w.title}</div><div class="acard__b">${w.brand}</div></div><span class="acard__c">${w.discipline}</span></div></a>`;

/* ---------- page builders (run before boot so reveals see the markup) ---------- */
const builders = {
  work() {
    $('.js-count-all').textContent = `${S.works.length} projects`;
    $('.js-filters').innerHTML = CATS.map(([k, n]) => `<button class="chip${k === 'all' ? ' on' : ''}" data-f="${k}" data-cur="link">${n} <sup>${k === 'all' ? S.works.length : S.works.filter(w => w.cat === k).length}</sup></button>`).join('');
    // interleave so the first screen shows range
    const order = ['motion', 'cgi', 'film', 'ai', 'edit'], b = order.map(c => S.works.filter(w => w.cat === c)), list = [];
    while (b.some(x => x.length)) b.forEach(x => x.length && list.push(x.shift()));
    $('.js-agrid').innerHTML = list.map(acard).join('');
  },
  project() {
    const slug = new URLSearchParams(location.search).get('p');
    const w = bySlug[slug] || S.works.find(x => x.id === S.featured[0]);
    const i = S.works.indexOf(w), nx = S.works[(i + 1) % S.works.length];
    document.title = `${w.brand} — ${w.title} | Arshad`;
    $('.js-pj-idx').textContent = `${String(i + 1).padStart(2, '0')} / ${S.works.length}`;
    $('.js-pj-disc').textContent = `${w.discipline} — ${w.tag}`;
    $('.js-pj-brand').textContent = w.brand; $('.js-pj-brand').setAttribute('data-split', '');
    $('.js-pj-title').textContent = w.title;
    $('.js-pj-meta').innerHTML = [['Client', w.brand], ['Discipline', w.discipline], ['My role', ROLE[w.cat]], ['Format', `${w.format} · ${fmt(w.dur)}`]].map(([k, v]) => `<div data-fade><span class="mono muted">${k}</span><p>${v}</p></div>`).join('');
    const pl = $('.js-player'), v = $('video', pl);
    v.src = media.full(w.id); v.poster = media.img(w.id);
    if (w.orient !== 'wide') pl.classList.add('tall');
    $('.js-pj-desc').textContent = w.desc;
    $('.js-pj-how').textContent = HOW[w.cat];
    const st = $('.js-stills'); if (w.orient === 'wide') st.classList.add('wide');
    st.innerHTML = [1, 2, 3].map(n => `<figure data-fade data-delay="${n * .08}"><img src="${media.still(w.id, n)}" alt="${w.brand} frame ${n}" loading="lazy" style="aspect-ratio:${w.orient === 'wide' ? '16/9' : w.orient === 'square' ? '1' : '9/16'}"></figure>`).join('');
    $('.js-pj-wa').dataset.wa = `Hi Arshad! I saw "${w.brand} — ${w.title}" on your portfolio. I'd like something similar for my brand.`;
    $('.js-more').innerHTML = S.works.filter(x => x.cat === w.cat && x !== w).slice(0, 3).map(acard).join('');
    $$('.js-more .acard').forEach(a => a.classList.remove('wide'));
    const n = $('.js-next'); n.href = `project.html?p=${nx.slug}`; n.dataset.pt = nx.brand;
    $('.js-next-b').textContent = nx.brand; $('.js-next-t').textContent = nx.title; $('.js-next-img').src = media.img(nx.id);
  },
  services() {
    $('.js-svc-idx').innerHTML = SERVICES.map(s => `<button class="chip" data-go="${s.key}" data-cur="link">${s.short}</button>`).join('');
    const worksFor = s => s.key === 'explainer'
      ? ['Basari|A vision, explained', 'App explainer|Product walkthrough', 'Triaura|Create it from your phone'].map(k => S.works.find(w => w.brand + '|' + w.title === k)).filter(Boolean)
      : S.works.filter(w => w.cat === s.cat && w.id !== s.preview && !/Basari|App explainer|Triaura|Onboarding/.test(w.brand)).slice(0, 3);
    $('.js-svcs').innerHTML = SERVICES.map((s, i) => `
      <article class="svc" id="${s.key}" data-hud="${s.short}">
        <div class="svc__l">
          <span class="svc__n">(${String(i + 1).padStart(2, '0')})</span>
          <h2 class="d3 svc__t" data-split>${s.name}</h2>
          <div class="svc__m"><video muted loop playsinline preload="none" data-src="${media.prev(s.preview)}" poster="${media.img(s.preview)}"></video></div>
        </div>
        <div class="svc__r">
          <p class="d4" data-fade>${s.line}</p>
          <p class="lead muted" style="margin-top:24px" data-fade>${s.long}</p>
          <div class="svc__cols">
            <div data-fade><span class="mono muted">What you get</span><ul>${s.deliver.map(d => `<li>${d}</li>`).join('')}</ul></div>
            <div data-fade data-delay=".1"><span class="mono muted">Great for</span><ul>${s.good.map(d => `<li>${d}</li>`).join('')}</ul></div>
          </div>
          <div class="svc__works">${worksFor(s).map(w => `<a class="mc" href="project.html?p=${w.slug}" data-pt="${w.brand}" data-prev data-cur="bub" data-cur-label="View"><img src="${media.img(w.id)}" alt="${w.brand}" loading="lazy"><video muted loop playsinline preload="none" data-src="${media.prev(w.id)}"></video></a>`).join('')}</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:32px" data-fade>
            <a class="btn btn--blue" data-wa="Hi Arshad! I'm interested in ${s.name.toLowerCase()} for my brand." data-mag data-cur="link"><span class="roll">Start a ${s.short.toLowerCase()} project</span><span class="btn__ic"></span></a>
            <a class="btn btn--line" href="contact.html" data-mag data-cur="link"><span class="roll">Send a brief</span><span class="btn__ic"></span></a>
          </div>
        </div>
      </article>`).join('');
    $('.js-steps').insertAdjacentHTML('beforeend', PROCESS.map((p, i) => `<div class="step" data-fade data-delay="${i * .1}"><span class="mono" style="color:var(--blue2)">Step ${String(i + 1).padStart(2, '0')}</span><h3>${p.t}</h3><p>${p.d}</p></div>`).join(''));
    $('.js-faq').innerHTML = FAQ.map(([q, a]) => `<li><button data-cur="link" aria-expanded="false">${q}<span class="faq__pm"></span></button><div class="faq__a"><p>${a}</p></div></li>`).join('');
  },
  about() {
    const bts = S.works.find(w => w.title === 'VFX breakdown') || S.works[0];
    $('.js-ab-v').src = media.prev(bts.id); $('.js-ab-v').poster = media.img(bts.id);
    const tools = [['After Effects', 'Motion'], ['Cinema 4D', '3D'], ['Blender', '3D'], ['Premiere Pro', 'Edit'], ['DaVinci Resolve', 'Colour'], ['Photoshop', 'Design'], ['Illustrator', 'Design'], ['AI video tools', 'Generative']];
    $('.js-tools').innerHTML = tools.map(([t, c]) => `<div class="tool" data-cur="link"><b>${t}</b><span class="mono muted">${c}</span></div>`).join('');
    $('.js-cwall').innerHTML = S.clients.slice(0, 24).map(c => `<span data-cur="link">${c}</span>`).join('');
  },
  contact() {
    $$('.js-avail').forEach(e => e.textContent = S.availability);
    $$('.js-copy').forEach(b => { if (!b.textContent.trim()) b.textContent = S.email; });
    const ph = $('.js-phone'); ph.textContent = S.phone; ph.href = `tel:${S.phone.replace(/\s/g, '')}`;
    $('.js-behance').href = S.behance;
  },
};
builders[page] && builders[page]();

const { ready, after } = await boot();

/* the same 3D identity: a small cluster of keyframe diamonds in the page header */
if (!reduce && $('.world')) {
  try {
    const { createWorld } = await import('./world.js');
    const world = createWorld($('.world'), { mode: 'page' });
    if (world) {
      document.body.classList.add('has-world');
      world.setStops([{ f: 'corner' }, { f: 'field' }]);
      const upd = y => { const p = Math.min(1, y / (innerHeight * .9)); world.setPos(p); world.setAlpha(1 - p * .55); };
      const lenisRef = (await import('./core.js')).lenis;
      if (lenisRef) lenisRef.on('scroll', ({ scroll }) => upd(scroll)); else addEventListener('scroll', () => upd(scrollY), { passive: true });
      upd(scrollY);
    }
  } catch (e) { console.warn('3D off', e); }
}

await ready;
after();

/* ---------- page behaviours ---------- */
if (page === 'work') {
  const grid = $('.js-agrid');
  const apply = (f, animate = true) => {
    $$('.chip', $('.js-filters')).forEach(c => c.classList.toggle('on', c.dataset.f === f));
    const show = $$('.acard', grid).filter(a => f === 'all' || a.dataset.cat === f);
    const run = () => { $$('.acard', grid).forEach(a => a.classList.toggle('hid', !show.includes(a))); ST && ST.refresh();
      if (gsap && !reduce && animate) gsap.fromTo(show.slice(0, 16), { y: 60, opacity: 0, scale: .96 }, { y: 0, opacity: 1, scale: 1, duration: .9, stagger: .04, ease: 'expo.out' }); };
    if (gsap && !reduce && animate) gsap.to($$('.acard:not(.hid)', grid), { opacity: 0, y: -20, duration: .25, stagger: .01, onComplete: run }); else run();
    const u = new URL(location); f === 'all' ? u.searchParams.delete('cat') : u.searchParams.set('cat', f); history.replaceState(null, '', u);
  };
  $('.js-filters').addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) apply(c.dataset.f); });
  const initial = new URLSearchParams(location.search).get('cat'); if (initial) apply(initial, false);
  $$('.views button').forEach(b => b.addEventListener('click', () => {
    $$('.views button').forEach(x => x.classList.toggle('on', x === b));
    if (gsap && !reduce) gsap.to(grid, { opacity: 0, duration: .2, onComplete: () => { grid.classList.toggle('list', b.dataset.v === 'list'); ST.refresh(); gsap.to(grid, { opacity: 1, duration: .4 }); } });
    else grid.classList.toggle('list', b.dataset.v === 'list');
  }));
  if (gsap && !reduce) ST.batch('.acard', { start: 'top 95%', onEnter: els => gsap.fromTo(els, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: .06, ease: 'expo.out', overwrite: true }) });
}

if (page === 'project') {
  const pl = $('.js-player'), v = $('video', pl), bar = $('.js-seek i'), t = $('.js-pt'), pp = $('.js-pp');
  const toggle = () => v.paused ? v.play() : v.pause();
  $('.player__big').addEventListener('click', toggle); v.addEventListener('click', toggle); pp.addEventListener('click', toggle);
  v.addEventListener('play', () => { pl.classList.add('playing'); pp.textContent = '❚❚'; pl.dataset.curLabel = 'Pause'; });
  v.addEventListener('pause', () => { pl.classList.remove('playing'); pp.textContent = '▶'; pl.dataset.curLabel = 'Play'; });
  v.addEventListener('timeupdate', () => { bar.style.transform = `scaleX(${v.currentTime / (v.duration || 1)})`; t.textContent = `${fmt(v.currentTime)} / ${fmt(v.duration || 0)}`; });
  $('.js-seek').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(); v.currentTime = (e.clientX - r.left) / r.width * v.duration; });
  $('.js-mute').addEventListener('click', e => { v.muted = !v.muted; e.currentTarget.textContent = v.muted ? '🔇' : '🔊'; });
  $('.js-fs').addEventListener('click', () => (pl.requestFullscreen || pl.webkitRequestFullscreen || (() => v.webkitEnterFullscreen && v.webkitEnterFullscreen())).call(pl));
  if (gsap && !reduce) {
    gsap.from(pl, { y: 120, scale: .94, opacity: 0, duration: 1.4, ease: 'expo.out', delay: .2 });
    gsap.fromTo('.next__m', { clipPath: 'inset(30% 30% 30% 30% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', ease: 'none', scrollTrigger: { trigger: '.next', start: 'top bottom', end: 'center center', scrub: true } });
  }
}

if (page === 'services') {
  $$('[data-go]').forEach(b => b.addEventListener('click', () => scrollTo('#' + b.dataset.go, { offset: -80 })));
  const io = new IntersectionObserver(es => es.forEach(e => { const vv = e.target; if (e.isIntersecting) { if (!vv.src) vv.src = vv.dataset.src; vv.play().catch(() => {}); } else vv.pause(); }), { rootMargin: '100px' });
  $$('.svc__m video').forEach(vv => io.observe(vv));
  if (gsap && !reduce) {
    gsap.to('.steps__line i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.js-steps', start: 'top 75%', end: 'bottom 55%', scrub: true,
      onUpdate: s => $$('.step').forEach((st, i, a) => st.classList.toggle('on', s.progress >= i / (a.length - 1) - .02)) } });
  }
  $$('.faq li').forEach(li => $('button', li).addEventListener('click', () => {
    const open = !li.classList.contains('open'), a = $('.faq__a', li);
    $$('.faq li.open').forEach(o => { if (o !== li) { o.classList.remove('open'); $('button', o).setAttribute('aria-expanded', 'false'); gsap ? gsap.to($('.faq__a', o), { height: 0, duration: .5, ease: 'expo.out' }) : ($('.faq__a', o).style.height = 0); } });
    li.classList.toggle('open', open); $('button', li).setAttribute('aria-expanded', open);
    if (gsap) gsap.to(a, { height: open ? 'auto' : 0, duration: .7, ease: 'expo.out', onComplete: () => ST.refresh() }); else a.style.height = open ? 'auto' : 0;
  }));
  if (location.hash) setTimeout(() => scrollTo(location.hash, { offset: -80 }), 300);
}

if (page === 'about') {
  // portrait lens — hover to look "behind the frame"
  const f = $('.js-lens'), lens = $('.ab__lens', f), v = $('.js-ab-v');
  const open = (r, x, y) => { v.play().catch(() => {}); if (gsap) gsap.to(lens, { '--r': r, duration: .9, ease: 'expo.out', overwrite: 'auto' }); else lens.style.setProperty('--r', r); };
  const close = () => { if (gsap) gsap.to(lens, { '--r': '0px', duration: .6, ease: 'expo.out', overwrite: 'auto', onComplete: () => v.pause() }); else lens.style.setProperty('--r', '0px'); };
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    f.addEventListener('pointerenter', () => open('150px'));
    f.addEventListener('pointerleave', close);
    f.addEventListener('pointermove', e => {
      const r = f.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      gsap ? gsap.to(lens, { '--x': x + 'px', '--y': y + 'px', duration: .45, ease: 'power3' }) : (lens.style.setProperty('--x', x + 'px'), lens.style.setProperty('--y', y + 'px'));
    });
  } else {
    $('.js-lens-hint').textContent = 'Tap to look behind the frame';
    let on = false;
    f.addEventListener('click', () => { on = !on; lens.style.setProperty('--x', '50%'); lens.style.setProperty('--y', '40%'); on ? open('120%') : close(); });
  }
  if (gsap && !reduce) gsap.fromTo('.ab__por', { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
}

if (page === 'contact') {
  const state = { need: [], budget: '', time: '' };
  $$('.opts').forEach(g => g.addEventListener('click', e => {
    const o = e.target.closest('.opt'); if (!o) return; const q = g.dataset.q, val = o.textContent.trim();
    if (g.hasAttribute('data-multi')) { o.classList.toggle('on'); state[q] = $$('.opt.on', g).map(x => x.textContent.trim()); }
    else { const was = o.classList.contains('on'); $$('.opt', g).forEach(x => x.classList.remove('on')); if (!was) o.classList.add('on'); state[q] = was ? '' : val; }
    if (gsap && !reduce) gsap.fromTo(o, { scale: .92 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.4)' });
    compose();
  }));
  const f = id => $('#' + id).value.trim();
  const compose = () => {
    const lines = [`Hi Arshad! 👋`, ``,
      f('f-name') || f('f-brand') ? `I'm ${f('f-name') || 'reaching out'}${f('f-brand') ? ` from ${f('f-brand')}` : ''}.` : null,
      state.need.length ? `I need: ${state.need.join(', ')}` : null,
      state.budget ? `Budget: ${state.budget}` : null,
      state.time ? `Timeline: ${state.time}` : null,
      f('f-msg') ? `\n${f('f-msg')}` : null,
      ``, `(Sent from your portfolio)`].filter(x => x !== null);
    const msg = lines.join('\n');
    $('.js-prev').textContent = msg;
    $('.js-send-wa').href = wa(msg);
    $('.js-send-mail').href = `mailto:${S.email}?subject=${encodeURIComponent(`New project${f('f-brand') ? ' — ' + f('f-brand') : ''}`)}&body=${encodeURIComponent(msg)}`;
  };
  $$('#f-name,#f-brand,#f-msg').forEach(i => i.addEventListener('input', compose));
  $('.js-send-wa').addEventListener('click', () => toast('Opening WhatsApp…'));
  compose();
}
