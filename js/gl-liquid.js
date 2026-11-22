/* =========================================================
   HERO — "Blue liquid reveal"
   A real-time fluid simulation (advection, vorticity, pressure)
   painted in brand blue. Moving through it pushes the liquid
   aside and reveals the showreel underneath.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

const BASE_V = /* glsl */`
uniform vec2 texel;
varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
void main(){
  vUv = uv;
  vL = vUv - vec2(texel.x, 0.0); vR = vUv + vec2(texel.x, 0.0);
  vT = vUv + vec2(0.0, texel.y); vB = vUv - vec2(0.0, texel.y);
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;
const HEAD = `precision highp float; varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;`;

const F = {
  splat: `${HEAD} uniform sampler2D uTarget; uniform float aspect; uniform vec3 color; uniform vec2 point; uniform float radius;
    void main(){ vec2 p = vUv - point; p.x *= aspect; vec3 s = exp(-dot(p, p) / radius) * color; gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + s, 1.0); }`,
  advect: `${HEAD} uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 simTexel; uniform float dt; uniform float dissipation;
    void main(){ vec2 c = vUv - dt * texture2D(uVelocity, vUv).xy * simTexel; gl_FragColor = vec4(dissipation * texture2D(uSource, c).xyz, 1.0); }`,
  divergence: `${HEAD} uniform sampler2D uVelocity;
    void main(){ float L = texture2D(uVelocity, vL).x, R = texture2D(uVelocity, vR).x, T = texture2D(uVelocity, vT).y, B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x; if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
      gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0); }`,
  curl: `${HEAD} uniform sampler2D uVelocity;
    void main(){ float L = texture2D(uVelocity, vL).y, R = texture2D(uVelocity, vR).y, T = texture2D(uVelocity, vT).x, B = texture2D(uVelocity, vB).x;
      gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0); }`,
  vorticity: `${HEAD} uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
    void main(){ float L = texture2D(uCurl, vL).x, R = texture2D(uCurl, vR).x, T = texture2D(uCurl, vT).x, B = texture2D(uCurl, vB).x, C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L)); force /= length(force) + 0.0001; force *= curl * C; force.y *= -1.0;
      vec2 v = texture2D(uVelocity, vUv).xy + force * dt; gl_FragColor = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0); }`,
  clear: `${HEAD} uniform sampler2D uTexture; uniform float value; void main(){ gl_FragColor = value * texture2D(uTexture, vUv); }`,
  pressure: `${HEAD} uniform sampler2D uPressure; uniform sampler2D uDivergence;
    void main(){ float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x, T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
      gl_FragColor = vec4((L + R + B + T - texture2D(uDivergence, vUv).x) * 0.25, 0.0, 0.0, 1.0); }`,
  gradient: `${HEAD} uniform sampler2D uPressure; uniform sampler2D uVelocity;
    void main(){ float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x, T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
      vec2 v = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B); gl_FragColor = vec4(v, 0.0, 1.0); }`,
  display: `${HEAD}
    uniform sampler2D uDye; uniform sampler2D uVel; uniform sampler2D uVideo;
    uniform float uTime; uniform float uVidA; uniform float uScrA; uniform float uOpen; uniform vec3 uBlue; uniform vec2 dyeTexel;
    vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x){ return mod289(((x * 34.0) + 1.0) * x); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy)); vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0); m = m * m; m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5); vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw; return 130.0 * dot(m, g);
    }
    void main(){
      float m = max(texture2D(uDye, vUv).r, uOpen);
      vec2 vel = texture2D(uVel, vUv).xy;
      vec2 s = uScrA > uVidA ? vec2(1.0, uVidA / uScrA) : vec2(uScrA / uVidA, 1.0);
      vec2 vuv = (vUv - 0.5) * s + 0.5;
      float edge = 1.0 - smoothstep(0.35, 0.95, m);
      vec2 refr = vel * 0.00022 * edge;
      vec3 vid = vec3(texture2D(uVideo, vuv + refr * 1.25).r, texture2D(uVideo, vuv + refr).g, texture2D(uVideo, vuv + refr * 0.75).b);
      float n = snoise(vUv * vec2(uScrA, 1.0) * 1.8 + vec2(uTime * 0.04, uTime * 0.025));
      float n2 = snoise(vUv * vec2(uScrA, 1.0) * 6.0 - vec2(uTime * 0.06));
      vec3 blue = uBlue * (0.93 + 0.09 * n + 0.025 * n2);
      // liquid surface lighting from the dye height
      float dx = texture2D(uDye, vUv + vec2(dyeTexel.x * 2.0, 0.0)).r - texture2D(uDye, vUv - vec2(dyeTexel.x * 2.0, 0.0)).r;
      float dy = texture2D(uDye, vUv + vec2(0.0, dyeTexel.y * 2.0)).r - texture2D(uDye, vUv - vec2(0.0, dyeTexel.y * 2.0)).r;
      float spec = smoothstep(0.0, 1.0, clamp((-dx + dy) * 2.2, 0.0, 1.0));
      float a = smoothstep(0.2, 0.6, m);
      vec3 col = mix(blue, vid, a);
      float rim = smoothstep(0.05, 0.2, m) * (1.0 - smoothstep(0.2, 0.45, m));
      col = mix(col, vec3(0.70, 0.77, 1.0), rim * 0.22 * (1.0 - uOpen));   // soft glassy edge
      col += spec * 0.10 * (1.0 - a) * (1.0 - uOpen);                      // gentle surface sheen
      // deep-blue vignette at the bottom keeps the headline readable
      float vg = smoothstep(0.55, 0.0, vUv.y) * 0.42 * (1.0 - uOpen * 0.7);
      col = mix(col, vec3(0.04, 0.09, 0.38), vg);
      gl_FragColor = vec4(col, 1.0);
    }`,
};

export function createLiquid(container, { video }) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' }); }
  catch (e) { return null; }
  const gl = renderer.getContext();
  if (!gl || !(renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float'))) { renderer.dispose(); return null; }
  const mobile = Math.min(innerWidth, innerHeight) < 700;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.5));
  renderer.autoClear = false;
  container.appendChild(renderer.domElement);

  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const scene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  quad.frustumCulled = false; scene.add(quad);

  const mat = (frag, uniforms) => new THREE.ShaderMaterial({ vertexShader: BASE_V, fragmentShader: frag, uniforms: { texel: { value: new THREE.Vector2() }, ...uniforms }, depthTest: false, depthWrite: false });
  const M = {
    splat: mat(F.splat, { uTarget: { value: null }, aspect: { value: 1 }, color: { value: new THREE.Vector3() }, point: { value: new THREE.Vector2() }, radius: { value: .002 } }),
    advect: mat(F.advect, { uVelocity: { value: null }, uSource: { value: null }, simTexel: { value: new THREE.Vector2() }, dt: { value: .016 }, dissipation: { value: 1 } }),
    divergence: mat(F.divergence, { uVelocity: { value: null } }),
    curl: mat(F.curl, { uVelocity: { value: null } }),
    vorticity: mat(F.vorticity, { uVelocity: { value: null }, uCurl: { value: null }, curl: { value: 22 }, dt: { value: .016 } }),
    clear: mat(F.clear, { uTexture: { value: null }, value: { value: .8 } }),
    pressure: mat(F.pressure, { uPressure: { value: null }, uDivergence: { value: null } }),
    gradient: mat(F.gradient, { uPressure: { value: null }, uVelocity: { value: null } }),
    display: mat(F.display, { uDye: { value: null }, uVel: { value: null }, uVideo: { value: null }, uTime: { value: 0 }, uVidA: { value: 16 / 9 }, uScrA: { value: 1 }, uOpen: { value: 0 }, uBlue: { value: new THREE.Vector3(35 / 255, 73 / 255, 236 / 255) }, dyeTexel: { value: new THREE.Vector2() } }),
  };

  const vtex = new THREE.VideoTexture(video);
  vtex.colorSpace = THREE.NoColorSpace; vtex.minFilter = THREE.LinearFilter; vtex.generateMipmaps = false;
  M.display.uniforms.uVideo.value = vtex;
  video.addEventListener('loadedmetadata', () => { if (video.videoWidth) M.display.uniforms.uVidA.value = video.videoWidth / video.videoHeight; });

  const rtOpts = { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping };
  const fbo = (w, h) => new THREE.WebGLRenderTarget(w, h, rtOpts);
  const dbl = (w, h) => { const o = { read: fbo(w, h), write: fbo(w, h), w, h, swap() { const t = o.read; o.read = o.write; o.write = t; } }; return o; };
  const res = base => { const w = container.clientWidth || innerWidth, h = container.clientHeight || innerHeight; let a = w / h; if (a < 1) a = 1 / a; const mx = Math.round(base * a), mn = Math.round(base); return w > h ? [mx, mn] : [mn, mx]; };

  let vel, dye, div, curlT, pres, simTexel = new THREE.Vector2(), dyeTexel = new THREE.Vector2();
  const SIM = mobile ? 96 : 128, DYE = mobile ? 384 : 640, ITER = mobile ? 10 : 18;
  function build() {
    [vel, dye, pres].forEach(d => d && (d.read.dispose(), d.write.dispose())); [div, curlT].forEach(t => t && t.dispose());
    const [sw, sh] = res(SIM), [dw, dh] = res(DYE);
    vel = dbl(sw, sh); dye = dbl(dw, dh); pres = dbl(sw, sh); div = fbo(sw, sh); curlT = fbo(sw, sh);
    simTexel.set(1 / sw, 1 / sh); dyeTexel.set(1 / dw, 1 / dh);
  }
  function size() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    M.display.uniforms.uScrA.value = w / h;
    build();
  }
  size();

  const blit = (material, target) => { quad.material = material; renderer.setRenderTarget(target); renderer.render(scene, cam); };
  const aspect = () => container.clientWidth / container.clientHeight;

  function splat(x, y, dx, dy, amount = 1, radius = 1) {
    const a = aspect();
    M.splat.uniforms.texel.value.copy(simTexel);
    M.splat.uniforms.aspect.value = a;
    M.splat.uniforms.point.value.set(x, y);
    M.splat.uniforms.radius.value = .0018 * radius * (a > 1 ? a : 1);
    M.splat.uniforms.uTarget.value = vel.read.texture; M.splat.uniforms.color.value.set(dx, dy, 0);
    blit(M.splat, vel.write); vel.swap();
    M.splat.uniforms.radius.value = .0042 * radius * (a > 1 ? a : 1);
    M.splat.uniforms.uTarget.value = dye.read.texture; M.splat.uniforms.color.value.set(amount, amount, amount);
    blit(M.splat, dye.write); dye.swap();
  }

  function step(dt) {
    const set = (m, k, v) => (m.uniforms[k].value = v);
    [M.curl, M.vorticity, M.divergence, M.clear, M.pressure, M.gradient, M.advect].forEach(m => m.uniforms.texel.value.copy(simTexel));
    set(M.curl, 'uVelocity', vel.read.texture); blit(M.curl, curlT);
    set(M.vorticity, 'uVelocity', vel.read.texture); set(M.vorticity, 'uCurl', curlT.texture); set(M.vorticity, 'dt', dt); blit(M.vorticity, vel.write); vel.swap();
    set(M.divergence, 'uVelocity', vel.read.texture); blit(M.divergence, div);
    set(M.clear, 'uTexture', pres.read.texture); set(M.clear, 'value', .8); blit(M.clear, pres.write); pres.swap();
    set(M.pressure, 'uDivergence', div.texture);
    for (let i = 0; i < ITER; i++) { set(M.pressure, 'uPressure', pres.read.texture); blit(M.pressure, pres.write); pres.swap(); }
    set(M.gradient, 'uPressure', pres.read.texture); set(M.gradient, 'uVelocity', vel.read.texture); blit(M.gradient, vel.write); vel.swap();
    set(M.advect, 'simTexel', simTexel); set(M.advect, 'dt', dt);
    set(M.advect, 'uVelocity', vel.read.texture); set(M.advect, 'uSource', vel.read.texture); set(M.advect, 'dissipation', .985); blit(M.advect, vel.write); vel.swap();
    M.advect.uniforms.texel.value.copy(dyeTexel);
    set(M.advect, 'uVelocity', vel.read.texture); set(M.advect, 'uSource', dye.read.texture); set(M.advect, 'dissipation', .982); blit(M.advect, dye.write); dye.swap();
  }

  // ---- input
  const FORCE = 5200;
  const ptr = { x: .5, y: .5, px: .5, py: .5, moved: false, last: 0, inside: false };
  const local = e => { const r = container.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]; };
  container.addEventListener('pointermove', e => {
    const [x, y] = local(e);
    if (!ptr.inside) { ptr.px = x; ptr.py = y; ptr.inside = true; }
    ptr.x = x; ptr.y = y; ptr.moved = true; ptr.last = performance.now();
  });
  container.addEventListener('pointerleave', () => { ptr.inside = false; });
  container.addEventListener('pointerdown', e => {
    const [x, y] = local(e); ptr.last = performance.now();
    burst(x, y, 1);
  });

  function burst(x, y, k = 1) {
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + Math.random() * .3;
      splat(x + Math.cos(a) * .012, y + Math.sin(a) * .012 * aspect(), Math.cos(a) * 1100 * k, Math.sin(a) * 1100 * k, .3 * k, 1.2);
    }
    splat(x, y, 0, 0, .8 * k, 2.2 * k);
  }

  // idle "ghost cursor" so the liquid is alive before anyone touches it
  const ghost = { x: .5, y: .5, px: .5, py: .5 };
  let t0 = performance.now(), last = t0, running = true, open = 0, introDone = false;

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 1 / 30); last = now;
    const t = (now - t0) / 1000;
    if (ptr.moved) {
      const dx = (ptr.x - ptr.px) * FORCE, dy = (ptr.y - ptr.py) * FORCE;
      if (Math.abs(dx) + Math.abs(dy) > .01) splat(ptr.x, ptr.y, dx, dy, .55, 1);
      ptr.px = ptr.x; ptr.py = ptr.y; ptr.moved = false;
    }
    if (introDone && now - ptr.last > 2200) {
      ghost.px = ghost.x; ghost.py = ghost.y;
      ghost.x = .5 + Math.sin(t * .55) * .32 + Math.sin(t * 1.3) * .05;
      ghost.y = .5 + Math.sin(t * .8 + 1.2) * .22;
      splat(ghost.x, ghost.y, (ghost.x - ghost.px) * FORCE * .8, (ghost.y - ghost.py) * FORCE * .8, .42, .9);
    }
    step(dt);
    const d = M.display.uniforms;
    d.uDye.value = dye.read.texture; d.uVel.value = vel.read.texture; d.uTime.value = t; d.uOpen.value = open; d.dyeTexel.value.copy(dyeTexel);
    d.texel.value.copy(dyeTexel);
    blit(M.display, null);
  }
  renderer.setAnimationLoop(frame);

  new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) last = performance.now(); }, { threshold: 0 }).observe(container);
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(size, 150); });

  return {
    intro() {
      // a big splash in the middle, then a few drops — the reel shows through
      burst(.5, .58, 1.1);
      setTimeout(() => burst(.3, .66, .6), 260);
      setTimeout(() => burst(.72, .44, .6), 480);
      setTimeout(() => { introDone = true; }, 900);
    },
    setOpen(p) { open = p; },
    burst,
  };
}
