// Rosetta Form – VAE
// A variational autoencoder trained on thousands of procedural shapes.
// The slider walks a path through its latent space: A → hello rectangle → B.
// The decoder outputs a per-pixel probability of "inside"; the form is the 0.5 iso-line.

const SIZE = 500;
const SKY = [135, 206, 235], SALMON = [250, 128, 114];
const GRID = 7;                       // thumbnails per side in the latent-slice inset

let decoder, L, RES;
let slider, infoBox;
let prob = null;                      // current decoded field, RES×RES
let slice = null;                     // { img, toInset(s,t), ... } for debug mode
let status = 'loading model …';

function setup() {
  pixelDensity(1);
  createCanvas(SIZE, SIZE);

  let dir = get_name();
  createA("https://worbit.github.io/" + dir + "/", '&rarr; ', '_top');
  slider = createSlider(0, 1, 0.5, 0.001)
  slider.input(update);
  infoBox = createCheckbox(' info', false)
  infoBox.changed(() => redraw());
  createButton('reset').mousePressed(() => { slider.value(0.5); infoBox.checked(false); update(); });
  createElement('label', dir);
  //noLoop();
  loadAll().catch(e => { status = 'could not load model: ' + e.message; redraw(); });
}

async function loadAll() {
  L = await (await fetch('model/latents.json')).json();
  RES = L.res;
  decoder = await tf.loadLayersModel('model/decoder/model.json');
  buildSlice();
  update();
}

// ---------- latent path ----------
const lerpV = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function zAt(t) {
  return t <= 0.5 ? lerpV(L.A.z, L.rect, t * 2) : lerpV(L.rect, L.B.z, t * 2 - 1);
}

function decode(zs) {   // array of latent vectors -> Float32Array of probabilities
  return tf.tidy(() => tf.sigmoid(decoder.predict(tf.tensor2d(zs))).dataSync());
}

function update() {
  if (!decoder) return;
  prob = decode([zAt(slider.value())]);
  redraw();
}

// ---------- debug: the plane through A, rect and B, decoded as a grid ----------
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
function buildSlice() {
  const u = L.A.z.map((v, i) => v - L.rect[i]);
  const w = L.B.z.map((v, i) => v - L.rect[i]);
  const e1 = u.map(v => v / Math.sqrt(dot(u, u)));
  const wp = w.map((v, i) => v - dot(w, e1) * e1[i]);            // Gram–Schmidt
  const e2 = wp.map(v => v / Math.sqrt(dot(wp, wp)));
  const P = { R: [0, 0], A: [dot(u, e1), 0], B: [dot(w, e1), dot(w, e2)] };
  const xs = [0, P.A[0], P.B[0]], ys = [0, P.A[1], P.B[1]];
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const half = 0.65 * Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  const coord = k => -half + 2 * half * (k + 0.5) / GRID;

  const zs = [];
  for (let j = 0; j < GRID; j++) for (let i = 0; i < GRID; i++) {
    const s = cx + coord(i), t = cy - coord(j);
    zs.push(L.rect.map((v, d) => v + s * e1[d] + t * e2[d]));
  }
  const data = decode(zs);
  const img = createImage(GRID * RES, GRID * RES);
  img.loadPixels();
  for (let n = 0; n < GRID * GRID; n++) {
    const ox = (n % GRID) * RES, oy = Math.floor(n / GRID) * RES;
    for (let j = 0; j < RES; j++) for (let i = 0; i < RES; i++) {
      const p = data[n * RES * RES + j * RES + i];
      const g = 255 - p * 200;
      const k = 4 * ((oy + j) * GRID * RES + ox + i);
      img.pixels[k] = g; img.pixels[k + 1] = g; img.pixels[k + 2] = g; img.pixels[k + 3] = 255;
    }
  }
  img.updatePixels();
  // maps plane coordinates to 0..1 inside the inset
  const toUnit = ([s, t]) => [(s - cx + half) / (2 * half), 1 - (t - cy + half) / (2 * half)];
  slice = { img, P, toUnit };
}

// ---------- drawing ----------
function sampleField(x, y) {          // bilinear lookup, x,y in canvas pixels
  const u = Math.min(RES - 1, Math.max(0, x / SIZE * RES - 0.5));
  const v = Math.min(RES - 1, Math.max(0, y / SIZE * RES - 0.5));
  const i = Math.min(RES - 2, Math.floor(u)), j = Math.min(RES - 2, Math.floor(v));
  const fu = u - i, fv = v - j, o = j * RES + i;
  return (prob[o] * (1 - fu) + prob[o + 1] * fu) * (1 - fv) + (prob[o + RES] * (1 - fu) + prob[o + RES + 1] * fu) * fv;
}

function draw() {
  background(SKY);
  if (!prob) { fill(20, 40, 70); noStroke(); textAlign(CENTER, CENTER); text(status, SIZE / 2, SIZE / 2); return; }
  const info = infoBox.checked();
  loadPixels();
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const p = sampleField(x + 0.5, y + 0.5);
    // rendered: threshold at 0.5 with a thin anti-aliasing band; info: the raw probability
    let a = info ? p : Math.min(1, Math.max(0, (p - 0.5) / 0.08 + 0.5));
    const k = 4 * (y * SIZE + x);
    pixels[k] = SKY[0] + (SALMON[0] - SKY[0]) * a;
    pixels[k + 1] = SKY[1] + (SALMON[1] - SKY[1]) * a;
    pixels[k + 2] = SKY[2] + (SALMON[2] - SKY[2]) * a;
    if (info && Math.abs(p - 0.5) < 0.012) { pixels[k] = 20; pixels[k + 1] = 40; pixels[k + 2] = 70; }   // 0.5 iso-line
  }
  updatePixels();
  if (info) drawInfo();
}

function drawInfo() {
  // pixel grid of the decoder's native resolution, faint
  stroke(255, 255, 255, 35); strokeWeight(1);
  for (let k = 1; k < RES; k++) { const c = k * SIZE / RES; line(c, 0, c, SIZE); line(0, c, SIZE, c); }

  // latent slice inset
  const S = 160, X = SIZE - S - 10, Y = SIZE - S - 10;
  image(slice.img, X, Y, S, S);
  noFill(); stroke(20, 40, 70); rect(X, Y, S, S);
  const at = q => { const [u, v] = slice.toUnit(q); return [X + u * S, Y + v * S]; };
  const [ax, ay] = at(slice.P.A), [rx, ry] = at(slice.P.R), [bx, by] = at(slice.P.B);
  stroke('salmon'); strokeWeight(1.5);
  line(ax, ay, rx, ry); line(rx, ry, bx, by);
  const t = slider.value();
  const [cx, cy] = t <= 0.5 ? [ax + (rx - ax) * t * 2, ay + (ry - ay) * t * 2] : [rx + (bx - rx) * (t * 2 - 1), ry + (by - ry) * (t * 2 - 1)];
  noStroke(); fill('salmon'); circle(cx, cy, 8);
  //fill(20, 40, 70); textSize(11); textAlign(CENTER, BOTTOM);
  //text(L.A.label, ax, ay - 5); text('rectangle', rx, ry - 5); text(L.B.label, bx, by - 5);

  // latent vector as bars
  const z = zAt(t), bw = 6, bx0 = 10, by0 = SIZE - 40;
  stroke(20, 40, 70, 120); line(bx0, by0, bx0 + z.length * (bw + 2), by0);
  noStroke(); fill(20, 40, 70);
  z.forEach((v, i) => rect(bx0 + i * (bw + 2), by0, bw, -Math.max(-30, Math.min(30, v * 12))));

  /*
  textAlign(LEFT, TOP); textSize(12);
  text(`latent z ∈ ℝ^${L.latentDim}, t = ${t.toFixed(3)}`, 10, 10);
  text(`${L.A.label} → rectangle → ${L.B.label}`, 10, 26);
  text(`decoder output ${RES}×${RES}, form = p(inside) > 0.5`, 10, 42);
  */
}

function get_name() {
  let path = document.location.pathname;
  let dirs = path.split('/');
  let name = dirs[dirs.length - 2];
  return name;
}
