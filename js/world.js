/* =========================================================
   WORLD — Arshad's 3D identity: glossy keyframe diamonds.
   One persistent scene. The diamonds re-arrange themselves
   into "formations" as you scroll: cloud → timeline → curve
   → four crafts → field → ring. The mouse stirs them.
   ========================================================= */
import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';

const PALETTE = [['#2349ec', .56], ['#f4f3ed', .26], ['#20221f', .12], ['#8da5ff', .06]];
const BG = { paper: new THREE.Color('#f4f3ed'), ink: new THREE.Color('#141613'), blue: new THREE.Color('#2349ec') };

const rand = (a, b) => a + Math.random() * (b - a);
const clamp01 = v => Math.min(1, Math.max(0, v));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function createWorld(container, { mode = 'home', count } = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' }); }
  catch (e) { return null; }
  if (!renderer.getContext()) return null;
  const mobile = Math.min(innerWidth, innerHeight) < 700;
  const N = count || (mode === 'home' ? (mobile ? 200 : 420) : (mobile ? 70 : 140));
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const bg = BG.paper.clone(), bgTarget = BG.paper.clone();
  scene.background = bg;
  scene.fog = new THREE.Fog(bg, 16, 34);
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.set(0, 0, 14);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;
  const key = new THREE.DirectionalLight('#ffffff', 1.6); key.position.set(4, 6, 8); scene.add(key);
  scene.add(new THREE.AmbientLight('#ffffff', .35));

  // the keyframe diamond: a slightly stretched octahedron
  const geo = new THREE.OctahedronGeometry(1, 0); geo.scale(.82, 1, .82);
  const mat = new THREE.MeshPhysicalMaterial({ roughness: .14, metalness: .2, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.0, flatShading: true });
  const mesh = new THREE.InstancedMesh(geo, mat, N);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  // playhead for the timeline formation
  const playhead = new THREE.Mesh(new THREE.BoxGeometry(.03, 7, .03), new THREE.MeshBasicMaterial({ color: '#2349ec', transparent: true, opacity: 0 }));
  scene.add(playhead);

  // per-instance data
  const P = [];
  const col = new THREE.Color();
  for (let i = 0; i < N; i++) {
    let r = Math.random(), c = PALETTE[0][0];
    for (const [hex, w] of PALETTE) { if (r < w) { c = hex; break; } r -= w; }
    col.set(c); mesh.setColorAt(i, col);
    const big = Math.random() < .08;
    P.push({
      s: (big ? rand(.42, .62) : rand(.13, .3)) * (mobile ? .62 : 1),
      axis: new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize(),
      spin: rand(.2, 1.1) * (Math.random() < .5 ? -1 : 1),
      d: Math.random(),               // stagger delay
      u: Math.random(), v: Math.random(), w: Math.random(), // stable random seeds
      off: new THREE.Vector3(), vel: new THREE.Vector3(),
      pos: new THREE.Vector3(),
    });
  }
  mesh.instanceColor.needsUpdate = true;

  let W = 1, H = 1, visW = 1, visH = 1;
  function size() {
    W = container.clientWidth; H = container.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z; visW = visH * camera.aspect;
  }
  size();

  /* ---------- formations: f(p, i, t) → writes into v ---------- */
  const tmp = new THREE.Vector3();
  const F = {
    cloud(p, i, t, v) {           // a living swarm
      const R = Math.min(visW * .2, 2.9);
      const th = p.u * Math.PI * 2 + t * .08 * (1 + p.w), ph = Math.acos(2 * p.v - 1);
      const rr = R * Math.cbrt(p.w) * (1 + .06 * Math.sin(t * 1.3 + p.u * 9));
      v.set(Math.sin(ph) * Math.cos(th) * rr * 1.18, Math.cos(ph) * rr * .9 + visH * .08, Math.sin(ph) * Math.sin(th) * rr);
    },
    timeline(p, i, t, v) {        // keyframes on layer tracks, scrolling past a playhead
      const tracks = mobile ? 5 : 7, tr = Math.floor(p.u * tracks);
      const span = visW * 2.4;
      let x = ((p.v * span - t * .9 * (1 + tr * .08)) % span + span) % span - span / 2;
      v.set(x, (tr - (tracks - 1) / 2) * (mobile ? .55 : .62), -1.6 - tr * .25 + Math.sin(x * .3) * .1);
    },
    curve(p, i, t, v) {           // a flowing motion curve (bezier-like ribbon)
      const span = visW * 1.3, x = (p.v - .5) * span;
      const k = x / span * Math.PI * 2;
      const amp = visH * .22 * (1 + mouse.y * .6);
      const strand = (p.u - .5) * .9;
      v.set(x, Math.sin(k * 1.2 + t * .8) * amp + strand * .5 + Math.sin(k * 3 + t) * .15 + visH * .12, Math.cos(k + t * .6) * 1.4 + strand - 1.2);
    },
    crafts(p, i, t, v) {          // four shapes, one per craft
      const g = i % 4, cx = (g - 1.5) * Math.min(visW * .245, 4.4) * (mobile ? .9 : 1), cy = visH * (mobile ? .2 : .17);
      const s = Math.min(visW * .07, 1.05);
      const a = p.u * Math.PI * 2 + t * .4;
      if (g === 0) { const rr = s * (1 + (p.v - .5) * .25); v.set(Math.cos(a) * rr, Math.sin(a) * rr, (p.w - .5) * .3); }          // ring  — motion
      else if (g === 1) { const n = 5, q = Math.floor(p.u * n * n * n); v.set(((q % n) / (n - 1) - .5) * s * 1.5, ((Math.floor(q / n) % n) / (n - 1) - .5) * s * 1.5, ((Math.floor(q / n / n)) / (n - 1) - .5) * s * 1.5); v.applyAxisAngle(tmp.set(.3, 1, .1).normalize(), t * .3); } // cube — CGI
      else if (g === 2) { const ph = Math.acos(2 * p.v - 1), th = p.u * Math.PI * 2; v.set(Math.sin(ph) * Math.cos(th) * s, Math.cos(ph) * s, Math.sin(ph) * Math.sin(th) * s); v.applyAxisAngle(tmp.set(0, 1, 0), t * .25); } // sphere — film
      else { const hh = (p.v - .5) * s * 2.4; v.set(Math.cos(p.v * 12 + t) * s * .6, hh, Math.sin(p.v * 12 + t) * s * .6); }          // helix — AI
      v.x += cx; v.y += cy;
    },
    field(p, i, t, v) {           // calm ambient field (inner pages / brands)
      v.set((p.u - .5) * visW * 2.2, (p.v - .5) * visH * 2 + Math.sin(t * .3 + p.u * 6) * .25, -6 - p.w * 12);
    },
    corner(p, i, t, v) {          // small cluster for page headers
      const R = Math.min(visW * .14, 2.2);
      const th = p.u * Math.PI * 2 + t * .1, ph = Math.acos(2 * p.v - 1), rr = R * Math.cbrt(p.w);
      v.set(Math.sin(ph) * Math.cos(th) * rr + visW * (mobile ? .18 : .27), Math.cos(ph) * rr + visH * (mobile ? .26 : .12), Math.sin(ph) * Math.sin(th) * rr);
    },
    ring(p, i, t, v) {            // a halo around the call to action
      const a = p.u * Math.PI * 2 + t * .15, R = Math.min(visW * .42, 6.2) * (1 + (p.v - .5) * .18);
      v.set(Math.cos(a) * R * 1.25, Math.sin(a) * R * .62, -3.5 + (p.w - .5) * 2 + Math.sin(a * 3 + t) * .4);
    },
  };

  // timeline of formations driven by scroll: [{ f: 'cloud', at: 0 }, ...]
  let stops = mode === 'home' ? [{ f: 'cloud', at: 0 }] : [{ f: 'corner', at: 0 }];
  let pos = 0;                    // float index into stops, set from scroll
  let smooth = 0;
  const mouse = new THREE.Vector2(0, 0), mouseW = new THREE.Vector3(9e3, 9e3, 0), mouseOn = { v: false };
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  addEventListener('pointermove', e => {
    mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); mouseOn.v = true;
    ray.setFromCamera(mouse, camera); ray.ray.intersectPlane(plane, mouseW);
  });
  document.addEventListener('pointerleave', () => { mouseOn.v = false; mouseW.set(9e3, 9e3, 0); });
  let burstT = -9;
  addEventListener('pointerdown', e => { if (e.target.closest('a,button,input,textarea,.mc,.card')) return; burstT = clock.elapsedTime; });

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3();
  const clock = new THREE.Clock();
  let running = true, alpha = 1;
  function frame() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
    smooth += (pos - smooth) * Math.min(1, dt * 4.5);
    const i0 = Math.max(0, Math.min(stops.length - 1, Math.floor(smooth))), i1 = Math.min(stops.length - 1, i0 + 1);
    const fr = smooth - i0, fA = F[stops[i0].f], fB = F[stops[i1].f];
    bg.lerp(bgTarget, Math.min(1, dt * 3)); scene.fog.color.copy(bg);
    playhead.material.opacity = (stops[i0].f === 'timeline' ? 1 - fr : stops[i1].f === 'timeline' ? fr : 0) * .9;
    camera.position.x += (mouse.x * .5 - camera.position.x) * .03;
    camera.position.y += (mouse.y * .35 - camera.position.y) * .03;
    camera.lookAt(0, 0, 0);
    const bt = t - burstT;

    for (let i = 0; i < N; i++) {
      const p = P[i];
      fA(p, i, t, a);
      if (fB !== fA) { fB(p, i, t, b); const k = ease(clamp01((fr - p.d * .35) / .65)); a.lerp(b, k); }
      // mouse stir: spring-damped push away from the cursor
      const dx = a.x + p.off.x - mouseW.x, dy = a.y + p.off.y - mouseW.y, d2 = dx * dx + dy * dy, R = 2.1;
      if (d2 < R * R) { const d = Math.sqrt(d2) || .001, f = (1 - d / R) ** 2 * 26 * dt; p.vel.x += dx / d * f; p.vel.y += dy / d * f; p.vel.z += f * .6 * (p.u - .5); }
      if (bt < 1.2) { const k = (1 - bt / 1.2) * 18 * dt; p.vel.x += (a.x - mouseW.x) * k * .06; p.vel.y += (a.y - mouseW.y) * k * .06; }
      p.vel.addScaledVector(p.off, -dt * 6);   // spring home
      p.vel.multiplyScalar(1 - Math.min(1, dt * 4.2));
      p.off.addScaledVector(p.vel, dt * 6);
      p.pos.copy(a).add(p.off);
      q.setFromAxisAngle(p.axis, t * p.spin + p.u * 6);
      const s = p.s * alpha * (1 + p.vel.length() * .15);
      sc.set(s, s, s);
      m4.compose(p.pos, q, sc);
      mesh.setMatrixAt(i, m4);
    }
    mesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(frame);
  addEventListener('resize', size);
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) clock.getDelta(); });

  return {
    setStops(s) { stops = s; },
    setPos(v) { pos = v; },
    setBg(name) { bgTarget.copy(BG[name] || BG.paper); },
    setAlpha(v) { alpha = v; },
    pause(v) { running = !v; if (running) clock.getDelta(); },
  };
}
