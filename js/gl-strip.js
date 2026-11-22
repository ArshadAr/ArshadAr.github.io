/* =========================================================
   HERO WEBGL — an endless, curved film strip of real work.
   drag / scroll to scrub · hover plays the clip inside WebGL
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

const VERT = /* glsl */`
uniform float uTime; uniform float uVel; uniform float uCurve; uniform float uLift;
varying vec2 vUv; varying float vDepth;
void main(){
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  float x = wp.x;
  wp.z -= x * x * uCurve;                                   // bend into a curved strip
  wp.y += sin(x * .55 + uTime * 1.6) * uVel * .55;           // velocity → flag wave
  wp.y += uLift;
  vDepth = clamp(-wp.z / 6.0, 0.0, 1.0);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const FRAG = /* glsl */`
precision highp float;
uniform sampler2D uTex; uniform sampler2D uVid; uniform float uMix; uniform float uHover; uniform float uVel;
uniform float uImgA; uniform float uPlaneA; uniform float uRadius; uniform float uAlpha; uniform vec3 uBg; uniform float uDim;
varying vec2 vUv; varying float vDepth;
vec2 cover(vec2 uv){ vec2 s = uPlaneA > uImgA ? vec2(1.0, uImgA / uPlaneA) : vec2(uPlaneA / uImgA, 1.0); return (uv - .5) * s + .5; }
vec3 samp(vec2 uv){ return mix(texture2D(uTex, uv).rgb, texture2D(uVid, uv).rgb, uMix); }
void main(){
  vec2 uv = cover(vUv);
  uv = (uv - .5) * (1.0 - uHover * .07) + .5;
  vec2 off = vec2(uVel * .018, 0.0);
  vec3 col = vec3(samp(uv + off).r, samp(uv).g, samp(uv - off).b);
  float l = dot(col, vec3(.299, .587, .114));
  col = mix(col, vec3(l), uDim * (1.0 - uHover) * .85);     // others go mono while one is hovered
  col = mix(col, uBg, vDepth * .35);
  vec2 p = (vUv - .5) * vec2(uPlaneA, 1.0);
  vec2 b = vec2(uPlaneA, 1.0) * .5 - uRadius;
  float d = length(max(abs(p) - b, 0.0)) - uRadius;
  float a = 1.0 - smoothstep(-.002, .002, d);
  gl_FragColor = vec4(col, a * uAlpha);
}`;

export function createStrip(container, items, { onHover, onClick } = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { return null; }
  if (!renderer.getContext()) return null;
  const isMobile = innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.z = 10;
  const group = new THREE.Group(); scene.add(group);
  const loader = new THREE.TextureLoader();
  const blank = new THREE.DataTexture(new Uint8Array([233, 233, 223, 255]), 1, 1); blank.needsUpdate = true;
  const geo = new THREE.PlaneGeometry(1, 1, 32, 16);
  const bg = new THREE.Color('#f4f3ed');

  let visH = 1, visW = 1, pw = 1, ph = 1, gap = .2, total = 1;
  const planes = items.map((it, i) => {
    const u = {
      uTex: { value: blank }, uVid: { value: blank }, uMix: { value: 0 }, uHover: { value: 0 }, uVel: { value: 0 },
      uImgA: { value: it.orient === 'wide' ? 16 / 9 : it.orient === 'square' ? 1 : 9 / 16 }, uPlaneA: { value: .8 },
      uRadius: { value: .035 }, uAlpha: { value: 0 }, uBg: { value: bg }, uDim: { value: 0 },
      uTime: { value: 0 }, uCurve: { value: .022 }, uLift: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: u, transparent: true, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat); mesh.userData = { i, it, u, hover: 0, mix: 0 };
    group.add(mesh);
    loader.load(`img/${it.id}.webp`, t => { t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; u.uTex.value = t; if (t.image) u.uImgA.value = t.image.width / t.image.height; });
    return mesh;
  });

  function layout() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z; visW = visH * camera.aspect;
    const mob = w < 760;
    ph = visH * (mob ? .34 : .46); pw = ph * (mob ? .74 : .8); gap = pw * (mob ? .12 : .1);
    total = (pw + gap) * planes.length;
    planes.forEach(m => { m.scale.set(pw, ph, 1); m.userData.u.uPlaneA.value = pw / ph; m.userData.u.uRadius.value = .028; m.userData.u.uCurve.value = mob ? .05 : .018; });
  }
  layout();

  // ---- state
  let offset = 0, target = 0, vel = 0, lift = 0, scrollP = 0, running = true, intro = 0, introOn = false;
  const mouse = new THREE.Vector2(-9, -9), look = { x: 0, y: 0 };
  let drag = null, hovered = null, moved = 0;
  const ray = new THREE.Raycaster();

  const el = renderer.domElement;
  el.style.touchAction = 'pan-y';
  el.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, t: target }; moved = 0; });
  addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    look.x = mouse.x; look.y = mouse.y;
    if (drag) { const dx = e.clientX - drag.x; moved = Math.max(moved, Math.abs(dx)); if (Math.abs(e.clientY - drag.y) > Math.abs(dx) * 1.2 && e.pointerType !== 'mouse') { drag = null; return; } target = drag.t + dx / r.width * visW * 1.4; }
  });
  addEventListener('pointerup', () => {
    if (drag && moved < 6 && hovered && onClick) onClick(hovered.userData.it);
    drag = null;
  });
  el.addEventListener('pointerleave', () => { mouse.set(-9, -9); });

  const vids = {};
  function setHover(m) {
    if (m === hovered) return;
    hovered = m;
    onHover && onHover(m ? m.userData.it : null);
    if (m) {
      const id = m.userData.it.id;
      if (!vids[id]) {
        const v = document.createElement('video');
        Object.assign(v, { src: `media/${id}-p.mp4`, muted: true, loop: true, playsInline: true, crossOrigin: 'anonymous' });
        const t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
        vids[id] = { v, t };
      }
      Object.values(vids).forEach(o => o.v !== vids[id].v && o.v.pause());
      vids[id].v.play().then(() => { m.userData.u.uVid.value = vids[id].t; m.userData.vidOn = true; }).catch(() => {});
    }
  }

  const clock = new THREE.Clock();
  function tick() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), .05), time = clock.elapsedTime;
    if (!drag) target -= dt * (isMobile ? .35 : .45) * (hovered ? .15 : 1);
    const prev = offset;
    offset += (target - offset) * .075;
    vel += ((offset - prev) * 12 - vel) * .1;
    if (introOn) intro += (1 - intro) * .045;
    lift += ((scrollP * visH * .35) - lift) * .1;

    // hover pick
    let hit = null;
    if (!drag && mouse.x > -2) { ray.setFromCamera(mouse, camera); const r = ray.intersectObjects(planes, false); hit = r.length ? r[0].object : null; }
    setHover(hit);

    camera.rotation.y += (-look.x * .045 - camera.rotation.y) * .05;
    camera.rotation.x += (look.y * .03 - camera.rotation.x) * .05;

    planes.forEach((m, i) => {
      const d = m.userData, u = d.u;
      let x = ((i * (pw + gap) + offset) % total + total) % total - total / 2 + (pw + gap) / 2;
      m.position.x = x;
      m.position.y = (1 - intro) * -visH * .5 * (1 + i % 3 * .2);
      d.hover += ((m === hovered ? 1 : 0) - d.hover) * .1;
      d.mix += (((m === hovered && d.vidOn) ? 1 : 0) - d.mix) * .08;
      m.position.z = d.hover * .35;
      u.uHover.value = d.hover; u.uMix.value = d.mix; u.uVel.value = THREE.MathUtils.clamp(vel, -1.5, 1.5);
      u.uTime.value = time; u.uLift.value = lift; u.uDim.value += ((hovered ? 1 : 0) - u.uDim.value) * .08;
      u.uAlpha.value = Math.min(1, intro * 1.4);
    });
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(tick);

  // pause when off-screen
  new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) clock.getDelta(); }, { threshold: 0 }).observe(container);
  addEventListener('resize', layout);

  return {
    setScroll: p => { scrollP = p; },
    nudge: v => { target -= v; },
    start: () => { introOn = true; target -= 1.2; },
  };
}
