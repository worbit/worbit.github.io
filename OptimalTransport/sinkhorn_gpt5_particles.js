/*  Optimal Transport (Entropic) Density Interpolation in p5.js
    Author: Prototype for "Languages of Geometry – Rosetta Form"
    Idea: Compute Sinkhorn scalings u,v for Gaussian kernel K = exp(-||x-y||^2 / eps),
          then entropic (Schrödinger-bridge) interpolation:
              ρ_t  ∝  (G_{t} * u) ⊙ (G_{1-t} * v)     (pointwise product)
          with G_{τ} a Gaussian blur with variance τ * Var(K).
    References:
      - Cuturi (2013) Sinkhorn distances (entropic OT with matrix scaling).
      - Peyré (Course notes) – Sinkhorn algorithm & Gaussian kernels on grids.
      - Pavon/Tabak/Trigila – ρ_t(x) = φ_t(x) φ̂_t(x) with forward/backward heat evolutions.
*/

let W = 500, H = 500;
let NX = 100, NY = 100;      // grid resolution (tune for perf/quality)
let rectParams = { w: 1.2, h: 0.8, angleDeg: -20 };
let ringParams = { R: 0.5, thickness: 0.2 }; // torus in 2D (annulus)
let epsSigma = 9.0;        // base Gaussian sigma in grid cells for Sinkhorn kernel
let iters = 120;            // Sinkhorn iterations
// let tSlider, epsSlider, iterSlider, btnRecompute, modeSelect;

let rho0, rho1;            // source/target densities (Float32Array, length NX*NY)
let u, v;                  // Sinkhorn scaling vectors
let needsSinkhorn = true;  // flag to recompute u,v
let lastComputed = 0;

let slider, button, checkbox, linot;

// ---------- Particle debug state ----------
let gridX = null, gridY = null;    // per-cell normalized coordinates in [-1,1]^2
let baryX = null, baryY = null;    // barycentric targets of entropic plan (destinations)
let particles = [];                 // active particles
let animClock = 0;                  // animation phase (seconds)
let lastSigmaForBary = -1;
let lastVHash = 0;                  // quick change detector to recompute targets
let USE_STOCHASTIC = false;         // set true for random sampling of destinations (slower)
let MAX_PARTICLES = 600;            // keep it readable; tune as you like
let DEBUG_SPEED = 0.25;             // cycles per second (for looping animations)

function initGridXY() {
  gridX = new Float32Array(NX * NY);
  gridY = new Float32Array(NX * NY);
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      const x = (i + 0.5) / NX * 2 - 1;
      const y = (j + 0.5) / NY * 2 - 1;
      gridX[j*NX+i] = x;
      gridY[j*NX+i] = y;
    }
  }
}
if (!gridX) initGridXY();

function hashArraySample(arr) {
  // cheap hash for change detection (sample every ~1% entries)
  let h = 2166136261 >>> 0;
  const stepg = Math.max(1, Math.floor(arr.length / 257));
  for (let k = 0; k < arr.length; k += stepg) {
    const x = Math.fround(arr[k]);
    h ^= (x * 1e7) | 0;           // float -> int-ish
    h = (h * 16777619) >>> 0;
  }
  return h;
}

function gridToCanvas(ix, iy) {
  // ix,iy in grid cell center coords normalized [-1,1]
  const X = (ix + 1) * 0.5 * W;
  const Y = (iy + 1) * 0.5 * H;
  return {X, Y};
}

function computeBarycentricTargets() {
  // Recompute only if v or sigma changed, since barycenter depends on K and v.
  const vHash = hashArraySample(v);
  if (baryX && lastSigmaForBary === epsSigma && lastVHash === vHash) return;

  if (!baryX) { baryX = new Float32Array(NX*NY); baryY = new Float32Array(NX*NY); }

  // den = K v
  const den = convolveGaussian(v, epsSigma);

  // numX = K (x * v), numY = K (y * v)
  const xv = new Float32Array(NX*NY);
  const yv = new Float32Array(NX*NY);
  for (let i = 0; i < xv.length; i++) { xv[i] = gridX[i] * v[i]; yv[i] = gridY[i] * v[i]; }
  const numX = convolveGaussian(xv, epsSigma);
  const numY = convolveGaussian(yv, epsSigma);

  // barycentric targets per source cell
  const eps = 1e-30;
  for (let i = 0; i < baryX.length; i++) {
    const d = Math.max(den[i], eps);
    baryX[i] = numX[i] / d;
    baryY[i] = numY[i] / d;
  }

  lastSigmaForBary = epsSigma;
  lastVHash = vHash;
}

function sampleIndicesFromRho0(targetCount) {
  // Probabilistic sampling of source cells ∝ rho0[i]
  // (fast reservoir via cumulative thresholding on a sparse scan)
  const picks = [];
  const stepg = Math.max(1, Math.floor((NX*NY) / (targetCount*2)));
  let total = 0;
  for (let i = 0; i < rho0.length; i += stepg) total += rho0[i];
  let taken = 0;
  for (let i = 0; i < rho0.length && taken < targetCount; i += stepg) {
    const p = rho0[i] / Math.max(total, 1e-32);
    if (Math.random() < p * targetCount) { picks.push(i); taken++; }
  }
  // Fallback if undersampled
  for (let i = 0; i < rho0.length && picks.length < targetCount; i++) {
    if (rho0[i] > 0) picks.push(i);
  }
  return picks.slice(0, targetCount);
}

function ensureParticlesReady() {
  computeBarycentricTargets();

  particles = [];
  const idxs = sampleIndicesFromRho0(MAX_PARTICLES);
  for (const k of idxs) {
    const gx0 = gridX[k], gy0 = gridY[k];
    let gx1, gy1;
    if (USE_STOCHASTIC) {
      const dest = sampleDestinationIndexFromRow(k);
      gx1 = gridX[dest]; gy1 = gridY[dest];
    } else {
      gx1 = baryX[k]; gy1 = baryY[k];
    }
    // Slight jitter so markers don’t overlap perfectly
    const jx = (Math.random()-0.5) * (2.0/NX);
    const jy = (Math.random()-0.5) * (2.0/NY);

    particles.push({
      gx0, gy0, gx1, gy1,
      jitterX: jx, jitterY: jy,
      phase: Math.random() // desynchronize easing
    });
  }
}

function drawParticlesDebug(val_t) {
  if (!particles.length) ensureParticlesReady();

  // Looping animation: alpha goes 0→1→0 (yo-yo) using a cosine ease.
  // If you prefer to tie this to your t-slider, set `alpha = tSlider.value();`
  animClock += (deltaTime || 16.7) / 1000.0;
  const cyc = animClock * DEBUG_SPEED;
  const alphag = val_t; //0.5 - 0.5*Math.cos(2*Math.PI*(cyc % 1)); // [0,1]

  // Style
  stroke(30, 120); strokeWeight(1.25);
  fill(255, 220, 180, 180); // salmon-ish markers

  // Draw trajectories and particles
  for (const p of particles) {
    // Per-particle eased progress (slight desync)
    const a = easeInOutCubic((alphag + p.phase) % 1.0);

    const x0 = p.gx0 + p.jitterX, y0 = p.gy0 + p.jitterY;
    const x1 = p.gx1,           y1 = p.gy1;

    const x = lerp_gpt(x0, x1, a);
    const y = lerp_gpt(y0, y1, a);

    const A = gridToCanvas(x0, y0);
    const B = gridToCanvas(x,  y);
    const T = gridToCanvas(x1, y1);

    // Path segment (current partial trajectory)
    line(A.X, A.Y, B.X, B.Y);

    // Destination hint (small dot)
    noStroke(); fill(50, 140);
    circle(T.X, T.Y, 3);

    // Particle marker
    fill(250, 128, 114); // salmon
    noStroke();
    circle(B.X, B.Y, 4);
  }

  // Legend box
  fill(0, 90); noStroke();
  rect(8, H-58, 236, 50, 6);
  fill(255);
  textSize(12);
  text(`Debug: particle trajectories
${USE_STOCHASTIC ? 'stochastic' : 'barycentric'} targets  |  σ=${epsSigma.toFixed(2)}  N=${particles.length}`, 16, H-36);
}

function easeInOutCubic(t){ return t<0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
function lerp_gpt(a,b,t){ return a + (b-a)*t; }


async function setup() {
  createCanvas(W, H);
  //pixelDensity(1);
  noStroke();

  // UI
  let dir = get_name();
  createA("https://worbit.github.io/"+dir+"/", '&rarr; ', '_top');
  slider = createSlider(0, 1, 0.0, 0.001);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  createElement('label', dir);
  linot = createCheckbox('lin/ot', false);

  // createP('t (interpolation)').style('margin:8px 0 0 0');
  // tSlider = createSlider(0, 1, 0.0, 0.001);
  // tSlider.style('width', W + 'px');

  // createP('ε (Gaussian sigma for Sinkhorn kernel, grid units)').style('margin:8px 0 0 0');
  // epsSlider = createSlider(0.8, 8.0, epsSigma, 0.1);
  // epsSlider.style('width', W + 'px');

  // createP('Sinkhorn iterations').style('margin:8px 0 0 0');
  // iterSlider = createSlider(10, 200, iters, 1);
  // iterSlider.style('width', W + 'px');

  // modeSelect = createSelect();
  // modeSelect.option('Entropic OT (Schrödinger interpolation)', 'ot');
  // modeSelect.option('Linear density blend (baseline)', 'lin');
  // modeSelect.option('Show ρ₀ (rectangle)', 'r0');
  // modeSelect.option('Show ρ₁ (torus)', 'r1');
  // modeSelect.selected('ot');

  // btnRecompute = createButton('Recompute Sinkhorn');
  // btnRecompute.mousePressed(() => { needsSinkhorn = true; });

  // Build densities
  rho0 = new Float32Array(NX * NY);
  rho1 = new Float32Array(NX * NY);

  // await loadImage('imgs/01.png').then(img => {
  //   makeDensityFromImage(rho0, img);
  // });
  // await loadImage('imgs/02.png').then(img => {
  //   makeDensityFromImage(rho1, img);
  // });
  // console.log(Math.min(...rho0), Math.max(...rho0));
  makeRectangleDensity(rho0, rectParams);
  makeRingDensity(rho1, ringParams);

  normalize_gpt(rho0);
  normalize_gpt(rho1);

  u = new Float32Array(NX * NY);
  v = new Float32Array(NX * NY);
  fillOnes(u); fillOnes(v);

  needsSinkhorn = true;
  //background('#87CEEB'); // sky blue, to echo Rosetta Form
}

function draw() {
  // Update params if sliders changed
  // let newSigma = epsSlider.value();
  // let newIters = iterSlider.value();
  // if (abs(newSigma - epsSigma) > 1e-6 || newIters !== iters) {
  //   epsSigma = newSigma;
  //   iters = newIters;
  //   needsSinkhorn = true;
  // }

  if (needsSinkhorn) {
    computeSinkhorn(); // updates u,v
    ensureParticlesReady();
    needsSinkhorn = false;
    lastComputed = millis();
  }

  // Render chosen mode
  //background('skyblue'); // sky
  const mode = linot.checked() ? 'lin' : 'ot'; //modeSelect.value();

  if (mode === 'r0') {
    // Render ρ0
    renderDensity(rho0);
    //overlayInfo('ρ₀ (rectangle)');
    return;
  }
  if (mode === 'r1') {
    // Render ρ1
    renderDensity(rho1);
    //overlayInfo('ρ₁ (torus)');
    return;
  }

  //let t = tSlider.value();
  let t = slider.value();

  if (mode === 'lin') {
    // Linear baseline
    let rhoLin = new Float32Array(NX * NY);
    for (let i = 0; i < rhoLin.length; i++) rhoLin[i] = (1 - t) * rho0[i] + t * rho1[i];
    normalize_gpt(rhoLin);
    renderDensity(rhoLin);
    //overlayInfo('Linear blend (non-OT)');
    return;
  }

  // Entropic OT (Schrödinger interpolation):
  // φ_t = G_{t} * u   and   φ̂_{1-t} = G_{1-t} * v;   ρ_t ∝ φ_t ⊙ φ̂_{1-t}
  // Where G_{τ} is Gaussian with σ_τ = sqrt(τ) * σ_base (variance adds under composition).
  const sigmaBase = epsSigma;
  const sigmaT = Math.max(1e-6, Math.sqrt(Math.max(0, t)) * sigmaBase);
  const sigma1T = Math.max(1e-6, Math.sqrt(Math.max(0, 1 - t)) * sigmaBase);

  let phi_t = convolveGaussian(u, sigmaT);     // forward
  let phihat = convolveGaussian(v, sigma1T);   // backward

  // ρ_t ∝ φ_t .* φ̂_{1-t}
  let rhoT = new Float32Array(NX * NY);
  for (let i = 0; i < rhoT.length; i++) rhoT[i] = phi_t[i] * phihat[i] + 1e-30;
  normalize_gpt(rhoT);

  if (!checkbox.checked()) { 
    renderDensity(rhoT);
  } else {
    // background(220);
    renderDensityD(rhoT);
    drawParticlesDebug(t);
  }
  //overlayInfo('Entropic OT (Schrödinger interpolation)');
}

// ---------------------- Geometry -> density fields ------------------------
// not true signed distance functions
// 1 if inside, 0 if outside, smoothed a bit (low value floor for stability)

function makeDensityFromImage(out, img) {
  out.fill(1e-12); // strictly positive to keep Sinkhorn stable
  img.loadPixels();
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      let v = img.get(i, j);
      let b = brightness(v);
      out[idx(i, j)] = b > 0.2 ? 1.0 : 1e-12;
    }
  }
  // for (let i=0; i<out.length; i++) {
  //   out[i] = brightness(img.pixels[i])>0.5 ? 1.0 : 1e-12;
  // }
}

function makeRectangleDensity(out, params) {
  out.fill(1e-12); // strictly positive to keep Sinkhorn stable
  const { w, h, angleDeg } = params;
  const ang = radians(angleDeg);
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const hw = w * 0.5, hh = h * 0.5;

  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      // normalized coords in [-1,1] centered
      let x = (i + 0.5) / NX * 2 - 1;
      let y = (j + 0.5) / NY * 2 - 1;
      // rotate point by -ang (equivalent to rotating rect by +ang)
      let xr = x * ca + y * sa;
      let yr = -x * sa + y * ca;
      if (Math.abs(xr) <= hw && Math.abs(yr) <= hh) {
        out[idx(i, j)] = 1.0; // uniform density inside
      }
    }
  }
}

function makeRingDensity(out, params) {
  out.fill(1e-12);
  const { R, thickness } = params;  // R = mean radius in normalized coords, thickness = half-width
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      let x = (i + 0.5) / NX * 2 - 1;
      let y = (j + 0.5) / NY * 2 - 1;
      let d = Math.hypot(x, y);
      if (Math.abs(d - R) <= thickness * 0.5) {
        out[idx(i, j)] = 1.0;
      }
    }
  }
}

function idx(i, j) { return j * NX + i; }

function normalize_gpt(arr) {
  let s = 0.0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  if (s <= 0) return;
  const inv = 1.0 / s;
  for (let i = 0; i < arr.length; i++) arr[i] *= inv;
}

function fillOnes(arr) { for (let i = 0; i < arr.length; i++) arr[i] = 1.0; }

// --------------------------- Sinkhorn on grid -----------------------------

function computeSinkhorn() {
  // Entropic OT with Gaussian kernel using Sinkhorn: u <- a / (K v), v <- b / (K^T u)
  // On a grid with symmetric Gaussian kernel, K^T = K (with symmetric boundary handling).
  // a = rho0, b = rho1
  const a = rho0, b = rho1;
  u.fill(1.0);
  v.fill(1.0);

  const maxIter = iters;
  for (let k = 0; k < maxIter; k++) {
    // u = a / (K v)
    let Kv = convolveGaussian(v, epsSigma);
    for (let i = 0; i < u.length; i++) {
      u[i] = a[i] / Math.max(Kv[i], 1e-30);
    }

    // v = b / (K^T u)  (same as K for symmetric Gaussian)
    let Ku = convolveGaussian(u, epsSigma);
    for (let i = 0; i < v.length; i++) {
      v[i] = b[i] / Math.max(Ku[i], 1e-30);
    }
  }
}

// ------------------------- Gaussian convolution ---------------------------
// Separable convolution with symmetric-reflect padding
function convolveGaussian(field, sigma) {
  // Build 1D kernel
  let k1d = gaussianKernel1D(sigma);
  // Horizontal pass
  let tmp = new Float32Array(NX * NY);
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      let acc = 0.0;
      for (let s = -k1d.rad; s <= k1d.rad; s++) {
        let ii = reflect_gpt(i + s, NX);
        acc += k1d.w[s + k1d.rad] * field[idx(ii, j)];
      }
      tmp[idx(i, j)] = acc;
    }
  }
  // Vertical pass
  let out = new Float32Array(NX * NY);
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      let acc = 0.0;
      for (let s = -k1d.rad; s <= k1d.rad; s++) {
        let jj = reflect_gpt(j + s, NY);
        acc += k1d.w[s + k1d.rad] * tmp[idx(i, jj)];
      }
      out[idx(i, j)] = acc;
    }
  }
  return out;
}

function reflect_gpt(p, n) {
  // symmetric mirror boundary:  -1 -> 0, n -> n-1, etc.
  if (p < 0) return -p - 1;
  if (p >= n) return n - 1 - (p - n);
  return p;
}

function gaussianKernel1D(sigma) {
  const s = Math.max(0.3, sigma);
  const rad = Math.max(1, Math.ceil(3 * s));
  const size = 2 * rad + 1;
  let w = new Float32Array(size);
  const denom = 2 * s * s;
  let sum = 0;
  for (let i = -rad; i <= rad; i++) {
    let val = Math.exp(-(i * i) / denom);
    w[i + rad] = val;
    sum += val;
  }
  const invSum = 1.0 / sum;
  for (let i = 0; i < size; i++) w[i] *= invSum;
  return { w, rad };
}

// ----------------------------- Rendering ---------------------------------

function renderDensity(rho) {
  loadPixels();
  const skyd = { r: 0x87, g: 0xCE, b: 0xEB };     // sky blue
  const sald = { r: 0xFA, g: 0x80, b: 0x72 };     // salmon
  const sky = color('skyblue');
  const sal = color('salmon');
  // const sky = color(135, 206, 235);
  // const sal = color(250, 128, 114);
  //const col = lerpColor(sky, sal, v);
  const sx = W / NX, sy = H / NY;

  // Compute max for contrast scaling (optional gamma)
  // Here we scale linearly using a percentile for robustness
  //let arr = rho;
  let maxVal = percentile(rho, 99.5); // robust cap
  let invMax = maxVal > 0 ? 1.0 / maxVal : 1.0;

  // Draw cell-averaged colors
  // For speed, draw rects not per-pixel writes
  noStroke();
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      const v = Math.min(1.0, rho[idx(i, j)] * invMax);
      let col = v>0.5 ? sal : sky;
      fill(col);
      if (linot.checked()) {
        const r = skyd.r + v * (sald.r - skyd.r);
        const g = skyd.g + v * (sald.g - skyd.g);
        const b = skyd.b + v * (sald.b - skyd.b);
        fill(r, g, b);
      }
      rect(i * sx, j * sy, sx + 1, sy + 1);
    }
  }
}

function renderDensityD(arr) {
  let img = createImage(NX, NY);
  img.loadPixels();
  let mx = Math.max(...arr);
  let mn = Math.min(...arr);
  //console.log(arr.length, mn, mx, W*H);
  for (let i=0; i<img.width; i++) {
    for (let j=0; j<img.height; j++) {
      let v = (arr[idx(i,j)]-mn)/(mx-mn);
      img.set(i,j, color(255*v));
    }
  }
  img.updatePixels();
  image(img, 0, 0, W, H);
}

function percentile(arr, p) {
  // Quick and dirty: sample subset to avoid full sort for perf
  const N = arr.length;
  const stepp = Math.max(1, Math.floor(N / 2000));
  let samp = [];
  for (let i = 0; i < N; i += stepp) samp.push(arr[i]);
  samp.sort((a, b) => a - b);
  const k = Math.floor((p / 100) * (samp.length - 1));
  return samp[Math.min(Math.max(0, k), samp.length - 1)];
}

function overlayInfo(label) {
  fill(0, 80); rect(8, 8, 260, 64, 6);
  fill(255); textSize(12);
  const t = nf(tSlider.value(), 1, 3);
  text(`Mode: ${label}
t = ${t}
σ (base) = ${epsSlider.value().toFixed(2)}, Sinkhorn iters = ${iterSlider.value()}`, 16, 28);
}

function get_name() {
  let loc = window.location.pathname;
  let elems = loc.split('/');
  let dir = elems[elems.length-2];
  return dir;
}

function resetinitial() {
  slider.value(0);
}