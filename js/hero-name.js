/* =========================================================
   HERO — "Name as a window"
   The showreel plays only inside the letters of ARSHAD.
   Letters breathe (variable weight + stretch) near the cursor.
   Scrolling dives through a letter until the reel fills the screen.
   ========================================================= */
export function createNameHero(canvas, video, { word = 'ARSHAD', focus = 3 } = {}) {
  const ctx = canvas.getContext('2d');
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FONT = '"Space Grotesk", system-ui, sans-serif';
  let W = 0, H = 0, dpr = 1, size = 100, slots = [], baseY = 0, gut = 24;
  let introT = 0, mx = .5, tmx = .5, mInside = false, lastMove = 0, prog = 0, sprog = 0, intro = 0, introOn = false, running = true;
  const letters = word.split('').map(() => ({ g: 0 }));

  function layout() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height; dpr = Math.min(devicePixelRatio || 1, W < 760 ? 1.5 : 1.75);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    gut = Math.max(16, Math.min(40, W * .026));
    // fit the word to the width at weight 500 — one line on desktop, two (ARS / HAD) on phones
    ctx.font = `500 100px ${FONT}`;
    const ls = -0.045; // letter spacing in em
    const mob = W < 760;
    const lines = mob ? [word.slice(0, Math.ceil(word.length / 2)), word.slice(Math.ceil(word.length / 2))] : [word];
    const lw = lines.map(l => l.split('').map(c => ctx.measureText(c).width));
    const tot = lw.map(ws => ws.reduce((a, b) => a + b, 0) + ls * 100 * (ws.length - 1));
    size = (W - gut * 2) / Math.max(...tot) * 100;
    const cap = size * .72, gap = size * .1;
    const top = mob ? H * .17 : H * .56 - cap / 2;
    slots = [];
    lines.forEach((l, k) => {
      let x = gut; const by = top + cap * (k + 1) + gap * k;
      lw[k].forEach(w => { const sw = w / 100 * size; slots.push({ x, w: sw, cx: x + sw / 2, by }); x += sw + ls * size; });
    });
    baseY = slots[0].by;
  }

  function cover(img, vw, vh) {
    const s = Math.max(W / vw, H / vh), w = vw * s, h = vh * s;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!running) return;
    const t = now / 1000;
    if (!mInside || now - lastMove > 2500) tmx = .5 + Math.sin(t * .45) * .42; // idle: a slow wave travels across
    mx += (tmx - mx) * .08;
    sprog += (prog - sprog) * .14;
    if (introOn) intro = Math.min(1, (now - introT) / 1500);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // dive: zoom around the focus letter
    const p = sprog, z = 1 + Math.pow(p, 2.2) * (W < 760 ? 34 : 60);
    const f = slots[focus] || slots[0];
    const fx = f ? f.cx : W / 2, fy = (f ? f.by : baseY) - size * .36;
    ctx.save();
    ctx.translate(fx, fy); ctx.scale(z, z); ctx.translate(-fx, -fy);

    // letters
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
    const glyphs = word.split('').map((c, i) => {
      const s = slots[i]; if (!s) return null;
      const d = (s.cx / W - mx) / (fine ? .13 : .16);
      const gT = reduce ? 0 : Math.exp(-d * d);
      const L = letters[i]; L.g += (gT - L.g) * .12;
      const enter = Math.min(1, Math.max(0, (intro - i * .07) / .6));
      return { c, x: s.cx, y: s.by + (1 - easeOut(enter)) * size * .9, wgt: Math.round(380 + 320 * L.g), sy: 1 + .16 * L.g, a: enter };
    }).filter(Boolean);
    const drawGlyphs = stroke => glyphs.forEach(g => {
      ctx.save(); ctx.translate(g.x, g.y); ctx.scale(1, g.sy);
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.font = `${g.wgt} ${size}px ${FONT}`; ctx.globalAlpha = g.a * (stroke ? .4 * (1 - p) : 1);
      stroke ? ctx.strokeText(g.c, 0, 0) : ctx.fillText(g.c, 0, 0);
      ctx.restore();
    });
    ctx.fillStyle = '#20221f';
    drawGlyphs(false);
    ctx.restore();

    // video only inside the letters (window effect: the video stays still while letters move)
    ctx.globalCompositeOperation = 'source-in';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (video.readyState >= 2) { ctx.filter = 'contrast(1.12) brightness(.86) saturate(1.1)'; cover(video, video.videoWidth, video.videoHeight); ctx.filter = 'none'; }
    else { ctx.fillStyle = '#2349ec'; ctx.fillRect(0, 0, W, H); }
    // brand-blue grade inside the letters: bright frames still read against the cream page
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = `rgba(35,73,236,${.3 * (1 - p)})`; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';

    // hairline outline keeps the name legible on bright frames
    ctx.save(); ctx.translate(fx, fy); ctx.scale(z, z); ctx.translate(-fx, -fy);
    ctx.strokeStyle = '#20221f'; ctx.lineWidth = 1.2 / z;
    drawGlyphs(true);
    ctx.restore();

    // at the end of the dive the reel takes the whole frame
    const fill = Math.min(1, Math.max(0, (p - .55) / .35));
    if (fill > 0 && video.readyState >= 2) { ctx.globalAlpha = fill; cover(video, video.videoWidth, video.videoHeight); ctx.globalAlpha = 1; }
  }
  const easeOut = x => 1 - Math.pow(1 - x, 4);

  layout();
  (document.fonts ? document.fonts.load(`500 100px "Space Grotesk"`) : Promise.resolve()).then(layout).catch(() => {});
  addEventListener('resize', () => layout());
  canvas.parentElement.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width; mInside = true; lastMove = performance.now(); });
  canvas.parentElement.addEventListener('pointerleave', () => { mInside = false; });
  new IntersectionObserver(([e]) => { running = e.isIntersecting; e.isIntersecting ? video.play().catch(() => {}) : video.pause(); }).observe(canvas);
  requestAnimationFrame(frame);

  return {
    start() { introOn = true; introT = performance.now(); },
    setProgress(v) { prog = v; },
  };
}
