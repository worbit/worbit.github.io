// Conformal: the rectangle (300 x 200, rotated by -20°) is morphed into a disk
// by a conformal (angle preserving) map, built from Jacobi elliptic functions
// (Schwarz-Christoffel). The slider s scales the map: F_s(z) = f(s z) / (s f'(0)),
// which is the identity for s -> 0 and the full rectangle -> disk map for s = 1.

let slider, checkbox, button, gridbutton;
let sky, sal;
let polarGrid = false;

const W = 300, H = 200;          // rectangle size
const ROT = -Math.PI / 9;        // -20°
const EXT = 380;                 // half extent of the (local) grid, covers the canvas

// elliptic constants, set in initMap()
let M, KK, KP, ALPHA, A_IM, C0, RHO, LAM1;

// cached geometry
let formZ = [];                  // rectangle boundary (local coords)
let gridZ = { ortho: [], polar: [] };  // polylines of {z, inside}
let cache = { key: null, form: [], grid: [] };

// ---------------------------------------------------------------- setup / draw

function setup() {
  createCanvas(500, 500);
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);

  let dir = get_name();
  let d = createDiv('&nbsp;&nbsp;?');
  d.class('tooltip');
  let tt = createSpan('Conformal: The rectangle is transformed by a conformal map, a function of the complex plane that preserves angles locally: every infinitesimally small square stays a square, only scaled and rotated. The Riemann mapping theorem guarantees that any simply connected shape can be mapped conformally onto a disk; for the rectangle the map is given by Jacobi elliptic functions (Schwarz–Christoffel).<br>a) The parameter scales the map from the identity (0) to the full rectangle-to-disk map (1). The grid lines in the info view (toggle ⊞ orthogonal / ◎ polar) stay mutually perpendicular throughout, also beyond the shape, where the map is continued by reflection.<br>b) Conformal maps are used in cartography (Mercator, Peirce quincuncial), aerodynamics (Joukowsky airfoil), electrostatics and texture mapping, where preserving angles (and thus local shapes) is more important than preserving areas or lengths.<br>c) Empty, Interpolation, Approximation');
  tt.class('tooltiptext');
  tt.parent(d);

  createA("https://worbit.github.io/rosettaform/", '&#8962; ', '_top');
  slider = createSlider(0, 1, 0, 0.01);
  checkbox = createCheckbox('info', false);
  gridbutton = createButton('⊞');
  gridbutton.mousePressed(toggleGrid);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  createElement('label', dir);

  initMap();
  initGeometry();
}

function draw() {
  background(sky);
  let s = slider.value();
  let info = checkbox.checked();
  updateCache(s, info);

  translate(width / 2, height / 2);
  rotate(ROT);

  noStroke();
  fill(sal);
  beginShape();
  for (let p of cache.form) vertex(p[0], p[1]);
  endShape(CLOSE);

  if (info) {
    noFill();
    strokeWeight(1);
    for (let run of cache.grid) {
      stroke(0, run.inside ? 170 : 45);
      beginShape();
      for (let p of run.pts) vertex(p[0], p[1]);
      endShape();
    }
  }
}

function toggleGrid() {
  polarGrid = !polarGrid;
  gridbutton.html(polarGrid ? '◎' : '⊞');
}

function resetinitial() {
  slider.value(0);
}

// ---------------------------------------------------------------- geometry

function updateCache(s, info) {
  let key = s + '|' + info + '|' + polarGrid;
  if (key === cache.key) return;
  cache.key = key;
  cache.form = formZ.map(z => F(s, z));
  cache.grid = [];
  if (!info) return;
  for (let line of (polarGrid ? gridZ.polar : gridZ.ortho)) {
    // map, then split into runs (inside / outside, broken at poles & jumps)
    let run = null;
    let prev = null;
    for (let q of line) {
      let p = q.z ? F(s, q.z) : null;
      let ok = p && isFinite(p[0]) && isFinite(p[1]) && Math.abs(p[0]) < 2 * EXT && Math.abs(p[1]) < 2 * EXT;
      if (ok && prev && Math.hypot(p[0] - prev[0], p[1] - prev[1]) > 60) ok = false;
      if (!ok) { run = null; prev = null; continue; }
      if (!run || run.inside !== q.inside) {
        let start = run ? [run.pts[run.pts.length - 1]] : [];
        run = { inside: q.inside, pts: start };
        cache.grid.push(run);
      }
      run.pts.push(p);
      prev = p;
    }
  }
}

function initGeometry() {
  // rectangle boundary
  let n = 120;
  let corners = [[-W / 2, -H / 2], [W / 2, -H / 2], [W / 2, H / 2], [-W / 2, H / 2]];
  for (let i = 0; i < 4; i++) {
    let a = corners[i], b = corners[(i + 1) % 4];
    for (let j = 0; j < n; j++) {
      let t = j / n;
      formZ.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }

  let inRect = z => Math.abs(z[0]) <= W / 2 + 1e-9 && Math.abs(z[1]) <= H / 2 + 1e-9;
  let step = 4;

  // ⊞ orthogonal: lines parallel to the rectangle's edges, every 25 px
  let sp = 25;
  for (let c = -Math.floor(EXT / sp) * sp; c <= EXT; c += sp) {
    let v = [], h = [];
    for (let t = -EXT; t <= EXT; t += step) {
      v.push({ z: [c, t], inside: inRect([c, t]) });
      h.push({ z: [t, c], inside: inRect([t, c]) });
    }
    gridZ.ortho.push(v, h);
  }

  // ◎ polar: circles and rays of the disk (at s = 1), pulled back into the rectangle
  let rings = 8;
  let rmax = EXT * 1.1 / RHO;    // in units of the disk radius
  for (let k = 1; k <= Math.ceil(rmax * rings); k++) {
    let r = k / rings;
    let line = [];
    let nseg = Math.ceil(2 * Math.PI * r * RHO / step);
    for (let j = 0; j <= nseg; j++) {
      let a = TWO_PI * j / nseg;
      line.push({ z: pullback(r * Math.cos(a), r * Math.sin(a)), inside: r <= 1 + 1e-9 });
    }
    gridZ.polar.push(line);
  }
  let rays = 24;
  for (let j = 0; j < rays; j++) {
    let a = TWO_PI * j / rays;
    let line = [];
    for (let rp = 0; rp <= rmax * RHO; rp += step) {
      let r = rp / RHO;
      line.push({ z: pullback(r * Math.cos(a), r * Math.sin(a)), inside: r <= 1 + 1e-9 });
    }
    gridZ.polar.push(line);
  }
}

// ---------------------------------------------------------------- the map

function initMap() {
  // parameter m such that the rectangle [-K, K] x [0, K'] has the aspect W : H
  let target = 2 * H / W;        // K'/K
  let lo = 1e-6, hi = 1 - 1e-6;
  for (let i = 0; i < 80; i++) {
    let mid = (lo + hi) / 2;
    if (ellipK(1 - mid) / ellipK(mid) > target) lo = mid; else hi = mid;
  }
  M = (lo + hi) / 2;
  KK = ellipK(M);
  KP = ellipK(1 - M);
  ALPHA = 2 * KK / W;            // px -> elliptic coordinates
  A_IM = 1 / Math.sqrt(Math.sqrt(M));   // a = i / sqrt(k): sn(iK'/2)
  // f'(0) numerically (central difference)
  let e = 1e-4;
  let fp = f([e, 0]), fm = f([-e, 0]);
  C0 = [(fp[0] - fm[0]) / (2 * e), (fp[1] - fm[1]) / (2 * e)];
  let rhoNat = 1 / cabs(C0);     // conformal radius in px
  RHO = Math.sqrt(W * H / Math.PI); // target: disk with the same area as the rectangle
  LAM1 = RHO / rhoNat;
}

// rectangle (local px, centered) -> unit disk, f(0) = 0
function f(z) {
  let u = [ALPHA * z[0], ALPHA * z[1] + KP / 2];
  let zeta = csn(u, M);
  let a = [0, A_IM];
  return cdiv(csub(zeta, a), cadd(zeta, a));
}

// the morph: identity at s = 0, rectangle -> disk (radius RHO) at s = 1
function F(s, z) {
  if (s < 1e-4) return [z[0], z[1]];
  let lam = Math.pow(LAM1, s);
  let w = cdiv(f([s * z[0], s * z[1]]), C0);
  return [w[0] * lam / s, w[1] * lam / s];
}

// inverse of f on the unit disk
function finv(w) {
  let a = [0, A_IM];
  let zeta = cdiv(cmul(a, cadd([1, 0], w)), csub([1, 0], w));
  let z2 = cmul(zeta, zeta);
  let u = cmul(zeta, carlsonRF(csub([1, 0], z2), csub([1, 0], cscale(z2, M)), [1, 0]));
  return [u[0] / ALPHA, (u[1] - KP / 2) / ALPHA];
}

// point (x, y) in the s = 1 disk (units of the disk radius) -> local rectangle coords;
// outside the disk via Schwarz reflection across the corresponding edge
function pullback(x, y) {
  let r = Math.hypot(x, y);
  // undo the normalisation F_1(z) = LAM1 * f(z) / C0, scaled to radius 1
  let toW = (px, py) => cmul([px, py], cscale(C0, 1 / cabs(C0)));
  if (r <= 1) {
    if (r > 0.999999) { x *= 0.999999 / r; y *= 0.999999 / r; }
    return finv(toW(x, y));
  }
  let zin = finv(toW(x / (r * r), y / (r * r)));
  let zb = finv(toW(0.999999 * x / r, 0.999999 * y / r));
  if (Math.abs(zb[0]) / W > Math.abs(zb[1]) / H) {
    return [Math.sign(zb[0]) * W - zin[0], zin[1]];
  }
  return [zin[0], Math.sign(zb[1]) * H - zin[1]];
}

// ---------------------------------------------------------------- elliptic functions

// complete elliptic integral of the first kind, parameter m
function ellipK(m) {
  let a = 1, b = Math.sqrt(1 - m);
  for (let i = 0; i < 30 && Math.abs(a - b) > 1e-15; i++) {
    let t = (a + b) / 2; b = Math.sqrt(a * b); a = t;
  }
  return Math.PI / (2 * a);
}

// real Jacobi sn, cn, dn (AGM / descending Landen, Abramowitz & Stegun 16.4)
const landenCache = new Map();   // the AGM sequence only depends on m
function landen(m) {
  let L = landenCache.get(m);
  if (L) return L;
  let a = [1], c = [Math.sqrt(m)], b = Math.sqrt(1 - m);
  let n = 0;
  while (Math.abs(c[n]) > 1e-15 && n < 20) {
    a.push((a[n] + b) / 2);
    c.push((a[n] - b) / 2);
    b = Math.sqrt(a[n] * b);
    n++;
  }
  L = { n, scale: Math.pow(2, n) * a[n], ratio: c.map((ci, j) => ci / a[j]) };
  landenCache.set(m, L);
  return L;
}

function ellipj(u, m) {
  if (m < 1e-12) return [Math.sin(u), Math.cos(u), 1];
  let L = landen(m);
  let phi = L.scale * u;
  for (let j = L.n; j > 0; j--) {
    phi = (Math.asin(L.ratio[j] * Math.sin(phi)) + phi) / 2;
  }
  let sn = Math.sin(phi), cn = Math.cos(phi);
  return [sn, cn, Math.sqrt(1 - m * sn * sn)];
}

// complex sn(x + iy | m) (A&S 16.21.2)
function csn(u, m) {
  let [s, c, d] = ellipj(u[0], m);
  let [s1, c1, d1] = ellipj(u[1], 1 - m);
  let den = c1 * c1 + m * s * s * s1 * s1;
  return [s * d1 / den, c * d * s1 * c1 / den];
}

// Carlson's symmetric elliptic integral R_F for complex arguments
function carlsonRF(x, y, z) {
  for (let i = 0; i < 16; i++) {
    let sx = csqrt(x), sy = csqrt(y), sz = csqrt(z);
    let lam = cadd(cadd(cmul(sx, sy), cmul(sy, sz)), cmul(sz, sx));
    x = cscale(cadd(x, lam), 0.25);
    y = cscale(cadd(y, lam), 0.25);
    z = cscale(cadd(z, lam), 0.25);
  }
  let A = cscale(cadd(cadd(x, y), z), 1 / 3);
  let X = cdiv(csub(A, x), A), Y = cdiv(csub(A, y), A);
  let Z = cscale(cadd(X, Y), -1);
  let E2 = csub(cmul(X, Y), cmul(Z, Z));
  let E3 = cmul(cmul(X, Y), Z);
  let series = cadd(cadd(cadd([1, 0], cscale(E2, -1 / 10)), cscale(E3, 1 / 14)),
    cadd(cscale(cmul(E2, E2), 1 / 24), cscale(cmul(E2, E3), -3 / 44)));
  return cdiv(series, csqrt(A));
}

// complex helpers ([re, im])
function cadd(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
function csub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
function cmul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
function cdiv(a, b) { let d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; }
function cscale(a, k) { return [a[0] * k, a[1] * k]; }
function cabs(a) { return Math.hypot(a[0], a[1]); }
function csqrt(a) {
  let r = cabs(a);
  let re = Math.sqrt((r + a[0]) / 2);
  let im = Math.sqrt(Math.max(0, (r - a[0]) / 2));
  return [re, a[1] < 0 ? -im : im];
}

// ---------------------------------------------------------------- misc

function keyPressed() {
  if (keyCode === UP_ARROW) {
    save_pic();
  }
}

function save_pic() {
  let n = get_name();
  let c = str(checkbox.checked());
  let g = polarGrid ? 'polar' : 'ortho';
  let v = str(slider.value());
  save(n + '_' + c + '_' + g + '_' + v + '.png');
}

function get_name() {
  let loc = window.location.pathname;
  let elems = loc.split('/');
  let dir = elems[elems.length - 2];
  return dir;
}
