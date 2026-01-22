
//
// Smooth Convex Quad (p5.js + WEBGL)
// Bernhard’s Rosetta Form: "Smooth Convexes" (quad starter)
// Controls:
//  - Drag the 4 white handles to reshape the quad (keep it convex).
//  - "delta" slider: soft-max temperature (higher → crisper corners).
//  - "sigma" slider: logistic steepness (higher → harder edge).
//

let theShader;
let deltaSlider, sigmaSlider;
let deltaLabel, sigmaLabel;

let verts = [];          // vertices in TOP-LEFT pixel coordinates (y down)
let dragging = -1;
const handleR = 10;

async function setup() {
    pixelDensity(1);                // keep shader coords and pixels aligned
    createCanvas(800, 560, WEBGL);
    noStroke();
    theShader = await loadShader('smocon.vert', 'smocon.frag');

    // Initial convex quad (CCW) in top-left coordinates (y down)
    // (A slightly skewed rectangle so you can see rounding immediately)
    verts = [
        createVector(220, 170),
        createVector(560, 150),
        createVector(580, 380),
        createVector(240, 410),
    ];

    // UI
    textFont('monospace');
    deltaLabel = createDiv('delta');
    deltaLabel.style('position', 'absolute').style('left', '14px').style('top', '12px').style('color', '#eee');
    deltaSlider = createSlider(0.5, 50.0, 8.0, 0.1);
    deltaSlider.position(70, 12);
    deltaSlider.style('width', '200px');

    sigmaLabel = createDiv('sigma');
    sigmaLabel.style('position', 'absolute').style('left', '14px').style('top', '40px').style('color', '#eee');
    sigmaSlider = createSlider(0.5, 50.0, 20.0, 0.1);
    sigmaSlider.position(70, 40);
    sigmaSlider.style('width', '200px');
}

function draw() {
    background(0);
    shader(theShader);

    // Compute edge half-spaces in y-up coordinates
    const { N, B } = computeEdgesYup(verts, width, height);

    // Set shader uniforms
    theShader.setUniform('u_resolution', [width, height]);
    theShader.setUniform('u_color', [0.95, 0.55, 0.15]);     // orange fill
    theShader.setUniform('u_bg', [0.05, 0.07, 0.1]);         // dark bluish bg
    theShader.setUniform('u_delta', deltaSlider.value());    // softness/pointiness
    theShader.setUniform('u_sigma', sigmaSlider.value());    // edge hardness
    theShader.setUniform('u_N', N);                          // vec2[4]
    theShader.setUniform('u_B', B);                          // float[4]

    // Draw full-screen quad (shader computes color per pixel)
    noStroke();
    rectMode(CENTER);
    rect(0, 0, width, height);

    // Overlay: outlines and handles (no shader)
    resetShader();
    drawOverlay();
}

// --- Geometry helpers ----

// Build half-spaces for a CCW convex quad.
// Input vertices are in TOP-LEFT pixel coords (y down).
// We convert to y-up, compute outward normals (CCW), then b = -n·v0.
function computeEdgesYup(vsDown, W, H) {
    // Convert to y-up
    const vs = vsDown.map(v => createVector(v.x, H - v.y));

    // Ensure CCW order (simple area check; if negative, reverse)
    if (signedArea(vs) < 0) {
        vs.reverse();
    }

    const N = []; // array of [nx, ny]
    const B = []; // array of b
    for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4;
        const vi = vs[i];
        const vj = vs[j];

        // delta in x an y for all edges
        const ex = vj.x - vi.x;
        const ey = vj.y - vi.y;

        // Outward normal for CCW polygon in y-up is rotate by -90: (ey, -ex)
        // normal is perp to edge
        let nx = ey;
        let ny = -ex;

        // Normalize
        const len = Math.hypot(nx, ny);
        if (len > 1e-6) {
            nx /= len; ny /= len;
        } // what else?

        // calculate "offset", i.e. distance of edge from origin
        const b = -(nx * vi.x + ny * vi.y);

        N.push([nx, ny]);
        B.push(b);
    }
    return { N, B };
}

// Signed area (y-up) to check orientation
// area of a random polygon?
function signedArea(vs) {
    let a = 0;
    for (let i = 0; i < vs.length; i++) {
        const j = (i + 1) % vs.length;
        a += vs[i].x * vs[j].y - vs[j].x * vs[i].y;
    }
    return 0.5 * a;
}

// --- Interaction & overlay ----

function drawOverlay() {
    // Convert top-left to WEBGL coords (origin center, y down)
    // xWeb = x - W/2, yWeb = y - H/2
    stroke(255, 90);
    noFill();
    beginShape();
    verts.forEach(v => {
        const xw = v.x - width / 2;
        const yw = v.y - height / 2;
        vertex(xw, yw);
    });
    endShape(CLOSE);

    // Draw handles
    noStroke();
    fill(255);
    for (let i = 0; i < verts.length; i++) {
        const v = verts[i];
        const xw = v.x - width / 2;
        const yw = v.y - height / 2;
        circle(xw, yw, handleR * 2);
    }

    // HUD text
    push();
    resetMatrix(); // Use default 2D canvas space for text
    noStroke();
    fill(230);
    textSize(12);
    text(`delta = ${nf(deltaSlider.value(), 1, 2)}`, 290, 22);
    text(`sigma = ${nf(sigmaSlider.value(), 1, 2)}`, 290, 50);
    text('Drag white dots to reshape (keep quad convex & CCW).', 14, 72);
    pop();
}

function mousePressed() {
    // Find closest vertex in screen top-left coordinates
    const mx = mouseX;
    const my = mouseY;
    let minD = 1e9;
    dragging = -1;
    for (let i = 0; i < verts.length; i++) {
        const v = verts[i];
        const d = dist(mx, my, v.x, v.y);
        if (d < minD && d <= handleR * 2.0) {
            minD = d;
            dragging = i;
        }
    }
}

function mouseDragged() {
    if (dragging >= 0) {
        verts[dragging].x = constrain(mouseX, 0, width);
        verts[dragging].y = constrain(mouseY, 0, height);
    }
}

function mouseReleased() {
    dragging = -1;
}
