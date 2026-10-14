// sketch.js
let t = 0;                 // slider value [-1,1]
let showInfo = false;
let z0 = null;             // [D]
let vhat = null;           // [D] unit vector
let anchors = [];          // tiny synthetic dataset for debug HUD

let cachedOcc = null;      // tf.Tensor
let lastT = null;

function projectZ(t){
  // z(t) = z0 + t * vhat * alpha (alpha=1 here; decoder maps scale internally)
  const D = z0.length;
  const z = new Array(D).fill(0).map((_,i)=> z0[i] + t * vhat[i]);
  return z;
}

async function recompute(){
  if (!z0 || !vhat) return;
  if (cachedOcc) { cachedOcc.dispose(); cachedOcc = null; }
  const z = projectZ(t);
  cachedOcc = await decodeOccupancyFromZ(z); // tf.Tensor [1, H, W, 1]
}

function setup(){
  const holder = document.getElementById('p5-holder');
  const cnv = createCanvas(500, 500);
  cnv.parent(holder);

  // UI wiring
  const slider = document.getElementById('sliderT');
  slider.addEventListener('input', async (e) => {
    t = parseFloat(e.target.value);
    await recompute();
    redraw();
  });
  document.getElementById('chkInfo').addEventListener('change', (e)=>{
    showInfo = e.target.checked; redraw();
  });
  document.getElementById('btnReset').addEventListener('click', async ()=>{
    t = 0; document.getElementById('sliderT').value = '0';
    await recompute(); redraw();
  });

  noLoop();
  tf.setBackend('webgl').then(async ()=>{
    // Load placeholders and anchors
    z0 = await (await fetch('./z0.json')).json();
    vhat = await (await fetch('./v_hat.json')).json();
    anchors = await (await fetch('./anchors.json')).json();

    await recompute();
    redraw();
  });
}

function draw(){
  background('#87CEEB');

  if (cachedOcc){
    // Render occupancy via marching squares -> polygon
    const occ = cachedOcc.squeeze(); // [H,W]
    const H = GRID, W = GRID;

    const data = occ.dataSync(); // Float32Array length H*W
    const contour = marchingSquares(data, W, H, 0.5); // array of [x,y] in grid coords
    const simplified = simplifyPolyline(contour, 0.6);

    // scale to canvas
    noStroke(); fill('salmon');
    beginShape();
    const sx = width / W, sy = height / H;
    for (const [x,y] of simplified){
      vertex(x * sx, y * sy);
    }
    endShape(CLOSE);

    occ.dispose(); // we used dataSync already
  }

  // HUD
  const hud = document.getElementById('hud');
  hud.textContent = `t = ${t.toFixed(2)}`;

  if (showInfo) {
    drawLatentHUD();
    drawAnchors();
    drawTargetOutline(); // exact rectangle for t=0 overlay
  }
}

// --- Debug layers ---
function drawLatentHUD(){
  // simple bar for z(t) dims
  const z = projectZ(t);
  const x0 = 14, y0 = 22, w = 120, h = 6, gap = 4;
  noStroke(); fill(0,120);
  textSize(12);
  text('latent z', x0, y0-8);
  for (let i=0; i<z.length; i++){
    const v = Math.max(-1, Math.min(1, z[i]));
    const ww = (v+1)/2 * w;
    fill('#ddd'); rect(x0, y0 + i*(h+gap), w, h);
    fill('#444'); rect(x0, y0 + i*(h+gap), ww, h);
  }
}

function drawAnchors(){
  // show anchor z-projections as dots along the active direction (optional schematic)
  const x = width - 120, y = 20;
  fill(0, 120); noStroke(); textSize(12);
  text('anchors', x, y);
  let yy = y + 10;
  for (const a of anchors){
    yy += 14;
    fill('#333'); text(a.name, x, yy);
  }
}

function drawTargetOutline(){
  // draw the exact 300x200 rect rotated -20° (cyan stroke)
  push();
  translate(width/2, height/2);
  rotate(-20 * Math.PI/180);
  noFill(); stroke(0,255,255,160); strokeWeight(1.2);
  beginShape();
  const w = 300, h = 200;
  vertex(-w/2, -h/2);
  vertex( w/2, -h/2);
  vertex( w/2,  h/2);
  vertex(-w/2,  h/2);
  endShape(CLOSE);
  pop();
}
