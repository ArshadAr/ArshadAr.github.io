/* Interactive easing-curve playground (graph editor) */
import { toast, ARROW } from './core.js';

const PRESETS = [
  ['Signature', [.16, 1, .3, 1]],
  ['Linear', [0, 0, 1, 1]],
  ['In-out', [.65, 0, .35, 1]],
  ['Overshoot', [.34, 1.56, .64, 1]],
  ['Anticipate', [.68, -.6, .32, 1.6]],
];

function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t, dx = t => (3 * ax * t + 2 * bx) * t + cx;
  const solve = x => {
    let t = x;
    for (let i = 0; i < 8; i++) { const e = sx(t) - x, d = dx(t); if (Math.abs(e) < 1e-6) return t; if (Math.abs(d) < 1e-6) break; t -= e / d; }
    let lo = 0, hi = 1; t = x;
    while (lo < hi) { const v = sx(t); if (Math.abs(v - x) < 1e-6) return t; x > v ? lo = t : hi = t; t = (hi - lo) / 2 + lo; if (hi - lo < 1e-7) break; }
    return t;
  };
  return x => sy(solve(x));
}

export function curvePlayground(box, presetBox) {
  const X0 = 40, W = 320, Y0 = 280, H = 240;
  const px = v => X0 + v * W, py = v => Y0 - v * H;
  let c = [.16, 1, .3, 1];
  box.innerHTML = `
    <div class="curve__bar"><span class="mono muted">Graph editor — value / time</span><span class="curve__val js-cv"></span></div>
    <svg class="curve__svg" viewBox="0 0 400 320" aria-label="Easing curve editor">
      <g class="curve__grid">${[0, .25, .5, .75, 1].map(v => `<line x1="${px(0)}" x2="${px(1)}" y1="${py(v)}" y2="${py(v)}"/><line y1="${py(0)}" y2="${py(1)}" x1="${px(v)}" x2="${px(v)}"/>`).join('')}</g>
      <line class="curve__h js-h1"/><line class="curve__h js-h2"/>
      <path class="curve__path js-path"/>
      <rect class="curve__k" width="12" height="12" transform="translate(${px(0)},${py(0)}) rotate(45) translate(-6,-6)"/>
      <rect class="curve__k" width="12" height="12" transform="translate(${px(1)},${py(1)}) rotate(45) translate(-6,-6)"/>
      <circle class="js-dot" r="6" fill="#20221f"/>
      <circle class="curve__p js-p1" r="11" data-cur="drag" data-cur-label="Drag"/>
      <circle class="curve__p js-p2" r="11" data-cur="drag" data-cur-label="Drag"/>
      <text x="${px(0)}" y="${py(0) + 26}" font-family="Space Mono" font-size="10" fill="#65685f">0f</text>
      <text x="${px(1) - 22}" y="${py(0) + 26}" font-family="Space Mono" font-size="10" fill="#65685f">30f</text>
    </svg>
    <div class="curve__track"><div class="curve__ghost"></div><div class="curve__obj"></div></div>
    <div class="curve__bar"><span class="mono muted">Blue: your curve · dashed: linear</span>
      <button class="btn btn--sm js-copycurve" data-cur="link"><span class="roll">Copy as CSS</span><span class="btn__ic">${ARROW + ARROW}</span></button></div>`;
  const svg = box.querySelector('svg'), path = box.querySelector('.js-path'), p1 = box.querySelector('.js-p1'), p2 = box.querySelector('.js-p2'),
    h1 = box.querySelector('.js-h1'), h2 = box.querySelector('.js-h2'), val = box.querySelector('.js-cv'), dot = box.querySelector('.js-dot'),
    obj = box.querySelector('.curve__obj'), ghost = box.querySelector('.curve__ghost'), track = box.querySelector('.curve__track');
  let ease = bezier(...c);
  const r2 = v => Math.round(v * 100) / 100;
  const draw = () => {
    path.setAttribute('d', `M${px(0)},${py(0)} C${px(c[0])},${py(c[1])} ${px(c[2])},${py(c[3])} ${px(1)},${py(1)}`);
    p1.setAttribute('cx', px(c[0])); p1.setAttribute('cy', py(c[1]));
    p2.setAttribute('cx', px(c[2])); p2.setAttribute('cy', py(c[3]));
    h1.setAttribute('x1', px(0)); h1.setAttribute('y1', py(0)); h1.setAttribute('x2', px(c[0])); h1.setAttribute('y2', py(c[1]));
    h2.setAttribute('x1', px(1)); h2.setAttribute('y1', py(1)); h2.setAttribute('x2', px(c[2])); h2.setAttribute('y2', py(c[3]));
    val.textContent = `cubic-bezier(${c.map(r2).join(', ')})`;
    ease = bezier(...c);
  };
  draw();

  // drag handles
  let active = null;
  const toLocal = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const l = pt.matrixTransform(svg.getScreenCTM().inverse()); return [Math.min(1, Math.max(0, (l.x - X0) / W)), Math.min(1.6, Math.max(-.6, (Y0 - l.y) / H))]; };
  [p1, p2].forEach((p, i) => p.addEventListener('pointerdown', e => { active = i; p.setPointerCapture(e.pointerId); e.preventDefault(); }));
  svg.addEventListener('pointermove', e => { if (active === null) return; const [x, y] = toLocal(e); c[active * 2] = x; c[active * 2 + 1] = y; draw(); setPreset(null); });
  addEventListener('pointerup', () => active = null);

  // presets
  presetBox.innerHTML = PRESETS.map(([n], i) => `<button class="chip${i === 0 ? ' on' : ''}" data-i="${i}" data-cur="link">${n}</button>`).join('');
  const setPreset = i => presetBox.querySelectorAll('.chip').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
  presetBox.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    const to = PRESETS[+b.dataset.i][1].slice(), from = c.slice(); const t0 = performance.now();
    setPreset(+b.dataset.i);
    const k = bezier(.16, 1, .3, 1);
    const step = now => { const p = Math.min(1, (now - t0) / 600), e = k(p); c = from.map((v, j) => v + (to[j] - v) * e); draw(); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
  box.querySelector('.js-copycurve').addEventListener('click', () => {
    const txt = `transition-timing-function: ${val.textContent};`;
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Curve copied — use it anywhere')).catch(() => toast(val.textContent));
  });

  // animate object with the curve (ping-pong, like a looping preview)
  const DUR = 1100, HOLD = 450; let t0 = performance.now(), visible = false;
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(box);
  const loop = now => {
    requestAnimationFrame(loop);
    if (!visible) return;
    const cyc = (now - t0) % (2 * (DUR + HOLD));
    let p, dir;
    if (cyc < DUR) { p = cyc / DUR; dir = 1; } else if (cyc < DUR + HOLD) { p = 1; dir = 1; } else if (cyc < 2 * DUR + HOLD) { p = (cyc - DUR - HOLD) / DUR; dir = -1; } else { p = 1; dir = -1; }
    const e = ease(p), w = track.clientWidth - 36;
    const pos = dir === 1 ? e : 1 - e, lin = dir === 1 ? p : 1 - p;
    obj.style.transform = `translateX(${pos * w}px) rotate(${pos * 180}deg)`;
    ghost.style.transform = `translateX(${lin * w}px)`;
    dot.setAttribute('cx', px(p)); dot.setAttribute('cy', py(e));
  };
  requestAnimationFrame(loop);
}
