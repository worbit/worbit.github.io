// --- Complex helpers ---
function C(re, im=0){ return {re, im}; }
function cAdd(z,w){ return C(z.re + w.re, z.im + w.im); }
function cSub(z,w){ return C(z.re - w.re, z.im - w.im); }
function cMul(z,w){ return C(z.re*w.re - z.im*w.im, z.re*w.im + z.im*w.re); }
function cDiv(z,w){
  const den = w.re*w.re + w.im*w.im;
  return C((z.re*w.re + z.im*w.im)/den, (z.im*w.re - z.re*w.im)/den);
}
function cAbs(z){ return Math.hypot(z.re, z.im); }

// Möbius transform f(z) = (a z + b) / (c z + d)
function mobius(z, a, b, c, d, eps=1e-9){
  const czd = cMul(c, z);
  const den = C(czd.re + d.re, czd.im + d.im);
  const den2 = den.re*den.re + den.im*den.im;
  if (den2 < eps) return null; // singular / near-pole
  const az = cMul(a, z);
  const num = C(az.re + b.re, az.im + b.im);
  return cDiv(num, den);
}

// Canvas <-> Complex mapping
const S = 200; // px per complex unit
function toComplex(x_px, y_px){
  const x = (x_px - width/2) / S;
  const y = (height/2 - y_px) / S; // invert Y
  return C(x, y);
}
function toScreen(z){
  return [width/2 + z.re * S, height/2 - z.im * S];
}

// Parameters (one slider: lambda)
let lambda = 0; // in [-0.9, 0.9]

// Fixed matrix entries for our one-parameter family
function coeffs(lambda, phi=0){ // phi optional; keep 0 for purely real c
  const a = C(1,0), b = C(0,0), d = C(1,0);
  const c = C(lambda*Math.cos(phi), lambda*Math.sin(phi));
  return {a,b,c,d};
}

// Adaptive subdivision of a segment under Möbius map
function mapSegmentAdaptive(p0, p1, a,b,c,d, eps=0.75, depth=0, maxDepth=12){
  const z0 = toComplex(p0[0], p0[1]);
  const z1 = toComplex(p1[0], p1[1]);
  const w0 = mobius(z0,a,b,c,d); if(!w0) return []; // near pole
  const w1 = mobius(z1,a,b,c,d); if(!w1) return [];
  const m = [(p0[0]+p1[0])/2, (p0[1]+p1[1])/2];
  const zm = toComplex(m[0], m[1]);
  const wm = mobius(zm,a,b,c,d); if(!wm) return [];

  // Screen coords
  const W0 = toScreen(w0), W1 = toScreen(w1), WM = toScreen(wm);
  // Deviation test: midpoint of mapped endpoints vs. mapped midpoint
  const midW = [(W0[0]+W1[0])/2, (W0[1]+W1[1])/2];
  const dev = Math.hypot(WM[0]-midW[0], WM[1]-midW[1]);

  if (dev < eps || depth >= maxDepth){
    return [W0, W1];
  }
  const left  = mapSegmentAdaptive(p0, m, a,b,c,d, eps, depth+1, maxDepth);
  const right = mapSegmentAdaptive(m, p1, a,b,c,d, eps, depth+1, maxDepth);
  // splice, avoiding duplicate midpoint
  return left.slice(0,-1).concat(right);
}

// Draw mapped polyline from source polyline (array of [x,y] in screen coords)
function drawMappedPolyline(srcPts, a,b,c,d, strokeCol, doClose=false){
  let mappedPts = [];
  for (let i=0; i<srcPts.length-1; i++){
    const seg = mapSegmentAdaptive(srcPts[i], srcPts[i+1], a,b,c,d);
    mappedPts = mappedPts.concat(seg.slice(0, -1));
  }
  if (doClose){
    const seg = mapSegmentAdaptive(srcPts[srcPts.length-1], srcPts[0], a,b,c,d);
    mappedPts = mappedPts.concat(seg);
  } else {
    const last = mapSegmentAdaptive(
      srcPts[srcPts.length-1],
      srcPts[srcPts.length-1], // no-op to get last point mapped
      a,b,c,d
    );
    if (last.length) mappedPts.push(last[last.length-1]);
  }

  noFill();
  stroke(strokeCol);
  beginShape();
  for (const p of mappedPts){
    if (!p) { endShape(); beginShape(); continue; } // break at singularities
    vertex(p[0], p[1]);
  }
  endShape();
}

// Rectangle corners (rotated -20°)
function rectCorners(){
  const w = 300, h = 200;
  const theta = radians(-20);
  const ct = Math.cos(theta), st = Math.sin(theta);
  const P = [
    [-w/2, -h/2], [ w/2, -h/2],
    [ w/2,  h/2], [-w/2,  h/2]
  ].map(([x,y]) => {
    const xr =  width/2 + x*ct - y*st;
    const yr = height/2 + x*st + y*ct;
    return [xr, yr];
  });
  return P;
}

let showDebug = false;
let slider, checkbox, button;

function setup(){
    let canvasWidth = 500;
    let canvasHeight = 500; // Make it square for better complex plane viz
    const canvas = createCanvas(canvasWidth, canvasHeight);
    //canvas.parent('canvas-container');

    slider = createSlider(-0.9, 0.9, 0, 0.01);
    checkbox = createCheckbox('info', false);
    button = createButton('reset');
    button.mousePressed(resetinitial);

    createElement('label', get_name());
}

function draw(){
  background('#87CEEB'); // sky blue
  lambda = slider.value();
  const {a,b,c,d} = coeffs(lambda, 0); // phi=0

  // Fill the mapped rectangle (draw boundary as a path and fill)
  // Build dense boundary polyline first:
  const rc = rectCorners();
  const boundary = [];
  const steps = 40;
  for (let i=0; i<rc.length; i++){
    const p0 = rc[i], p1 = rc[(i+1)%rc.length];
    for (let t=0; t<=steps; t++){
      const s = t/steps;
      boundary.push([
        p0[0]*(1-s) + p1[0]*s,
        p0[1]*(1-s) + p1[1]*s
      ]);
    }
  }
  // Map boundary and fill using shape()
  const mapped = [];
  for (let i=0; i<boundary.length; i++){
    const seg = mapSegmentAdaptive(boundary[i], boundary[(i+1)%boundary.length], a,b,c,d, 0.6, 0, 10);
    if (seg.length) mapped.push(seg[0]);
  }
  noStroke();
  fill('salmon');
  beginShape();
  for (const p of mapped){
    if (!p) { endShape(CLOSE); beginShape(); continue; }
    vertex(p[0], p[1]);
  }
  endShape(CLOSE);

  // Debug grid
  if (checkbox.checked()){
    stroke(30, 30, 30, 70);
    const step = 40;
    // vertical lines
    for (let x=-240; x<=240; x+=step){
      const linePts = [];
      for (let y=-240; y<=240; y+=8){
        linePts.push([width/2 + x, height/2 + y]);
      }
      drawMappedPolyline(linePts, a,b,c,d, color(0,0,0,90), false);
    }
    // horizontal lines
    for (let y=-240; y<=240; y+=step){
      const linePts = [];
      for (let x=-240; x<=240; x+=8){
        linePts.push([width/2 + x, height/2 + y]);
      }
      drawMappedPolyline(linePts, a,b,c,d, color(0,0,0,90), false);
    }
  }

  // UI overlay
//   noStroke();
//   fill(0,120);
//   textSize(12);
//   text(`λ = ${lambda.toFixed(2)}`, 12, 18);
}

function resetinitial() {
  slider.value(0.0);
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
      save_pic();
  }
}

function save_pic() {
  let n = get_name();
  let c = str(checkbox.checked());
  let v = str(slider.value());
  save(n+'_'+c+'_'+v+'.png');
}

function get_name() {
  let loc = window.location.pathname;
  let elems = loc.split('/');
  let dir = elems[elems.length-2];
  return dir;
}