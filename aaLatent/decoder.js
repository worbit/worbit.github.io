// decoder.js
// Minimal TF.js decoder: maps latent z -> 128x128 occupancy via analytic SDF.
// D = 3 (z[0]=rounding, z[1]=aspect tweak, z[2]=spare for future).

const GRID = 128;
const CANVAS = 500;
const SCALE = GRID / CANVAS; // 0.256

// Base rectangle: 300x200 rotated -20°
const BASE_W = 300 * SCALE;  // grid units
const BASE_H = 200 * SCALE;
const THETA = 20 * Math.PI / 180;

// Map latent z -> shape params (grid units)
function latentToParams(z) {
  // z: Float32Array or JS array length>=3
  const z0 = z[0] || 0;     // rounding
  const z1 = z[1] || 0;     // aspect tweak (subtle)
  const z2 = z[2] || 0;     // reserved

  // rounding radius in grid px: 0..12 approx across t in [-1,1]
  const r = Math.max(0, 6 + 6 * z0);  // centered around 6 px
  // aspect: +/- 6% tweak
  const w = BASE_W * (1 + 0.06 * z1);
  const h = BASE_H * (1 - 0.06 * z1);

  return { w, h, r, theta: THETA };
}

// Build coordinate grid centered at 0
function makeGrid() {
  return tf.tidy(() => {
    const rng = tf.linspace(-GRID/2 + 0.5, GRID/2 - 0.5, GRID); // pixel centers
    const X = tf.tile(rng.reshape([1, GRID]), [GRID, 1]);
    const Y = tf.tile(rng.reshape([GRID, 1]), [1, GRID]);
    return { X, Y };
  });
}

// SDF for rounded rectangle (vectorized)
// Reference form: length(max(q,0)) + min(max(q.x,q.y),0) - r
function sdfRoundedRect(X, Y, w, h, r, theta) {
  return tf.tidy(() => {
    const ct = Math.cos(theta), st = Math.sin(theta);
    // rotate coordinates by +theta to align box axes
    const Xr = X.mul(ct).sub(Y.mul(st));
    const Yr = X.mul(st).add(Y.mul(ct));
    // half-sizes
    const hx = w / 2, hy = h / 2;

    // q = abs([Xr, Yr]) - [hx, hy] + r
    const ax = Xr.abs().sub(hx).add(r);
    const ay = Yr.abs().sub(hy).add(r);

    const qx = tf.maximum(ax, tf.scalar(0));
    const qy = tf.maximum(ay, tf.scalar(0));
    const outside = qx.square().add(qy.square()).sqrt();
    const inside = tf.minimum(tf.maximum(ax, ay), tf.scalar(0));

    const sdf = outside.add(inside).sub(r);
    return sdf; // shape [GRID, GRID]
  });
}

// Decode latent z (JS array) -> occupancy tensor [1, GRID, GRID, 1] in [0,1]
async function decodeOccupancyFromZ(z) {
  return tf.tidy(() => {
    const { w, h, r, theta } = latentToParams(z);
    const { X, Y } = makeGrid();
    const sdf = sdfRoundedRect(X, Y, w, h, r, theta);

    // Smooth step around 0 to reduce aliasing
    const k = 1.5; // softness
    const occ = sdf.mul(-k).sigmoid(); // inside ~1, outside ~0

    const out = occ.reshape([1, GRID, GRID, 1]);
    X.dispose(); Y.dispose(); sdf.dispose(); // tidy up
    return out;
  });
}

// Export a "model-like" facade to match .predict(zTensor) if you prefer that API.
const LatentDecoder = {
  predict: (zTensor) => {
    // zTensor: [1, D]
    const z = Array.from(zTensor.dataSync());
    const t = decodeOccupancyFromZ(z);
    zTensor.dispose();
    return t; // tf.Tensor [1, GRID, GRID, 1]
  }
};

// Expose globally
window.LatentDecoder = LatentDecoder;
window.decodeOccupancyFromZ = decodeOccupancyFromZ;
window.GRID = GRID;