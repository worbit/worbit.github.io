let slider, checkbox, button;
let deltaSlider, sigmaSlider;
let myShader;
let verts;
let dragging = -1;
const handleR = 10;
const np = 5;

async function setup() {
    pixelDensity(1);
    createCanvas(500, 500, WEBGL);
    myShader = await loadShader('smocon.vert', 'smocon.frag');

    // create a ? with tooltip describing the pattern
    let d = createDiv('&nbsp;&nbsp;?');
    d.class('tooltip');
    let tt = createSpan('description goes here');
    tt.class('tooltiptext');
    tt.parent(d);

    let dir = get_name();
    createA("https://worbit.github.io/" + dir + "/", '&rarr; ', '_top');
    //slider = createSlider(0, 1, 0, 0.01);
    deltaSlider = createSlider(0.1, 10, 1, 0.01);
    sigmaSlider = createSlider(0.1, 10, 10, 0.01);
    checkbox = createCheckbox('info', false);
    button = createButton('reset');
    button.mousePressed(resetinitial);
    createElement('label', dir);

    // Initial convex quad (CCW) in top-left coordinates (y down)
    // (A slightly skewed rectangle so you can see rounding immediately)
    verts = [
        createVector(120, 170),
        createVector(360, 150),
        createVector(380, 380),
        createVector(222, 450),
        createVector(40, 410),
    ];

    fill('salmon');
    rectMode(CENTER);
    //noStroke();
    noLoop();
}

let v = 1.0;
function draw() {
    background('skyblue');

    //fill('salmon');
    
    // Compute edge half-spaces in y-up coordinates
    const { N, B } = computeEdgesYup(verts, width, height);
    
    shader(myShader);
    // Set shader uniforms
    myShader.setUniform('u_resolution', [width, height]);
    myShader.setUniform('u_color', [0.95, 0.55, 0.15]);     // orange fill
    myShader.setUniform('u_bg', [0.05, 0.07, 0.1]);         // dark bluish bg
    myShader.setUniform('u_delta', deltaSlider.value());    // softness/pointiness
    myShader.setUniform('u_sigma', sigmaSlider.value());    // edge hardness
    myShader.setUniform('u_N', N);                          // vec2[5]
    myShader.setUniform('u_B', B);                          // float[5]

    noStroke();
    //quad(-v, -v, v, -v, v, v, -v, v);

    resetShader();

    drawVerts(N,B);
}

function drawVerts(N, B) {
    stroke('white');
    noFill();
    beginShape();
    verts.forEach(v => {
        const xw = v.x - width / 2;
        const yw = v.y - height / 2;
        vertex(xw, yw);
    });
    endShape(CLOSE);

    for (let v of verts) {
        ellipse(v.x - width / 2, v.y - height / 2, 8, 8);
    }

    for (let i=0; i<np; i++) {
        let di = 50; //B[i];
        if (di<0) di *= -1;
        line(0,0, N[i][0]*di, -N[i][1]*di);
    }
}

// Build half-spaces for a CCW convex quad.
// Input vertices are in TOP-LEFT pixel coords (y down).
// We convert to y-up, compute outward normals (CCW), then b = -n·v0.
function computeEdgesYup(vsDown, W, H) {
    // Convert to y-up
    const vs = vsDown.map(v => createVector(v.x, H - v.y));
    print(vs);

    // Ensure CCW order (simple area check; if negative, reverse)
    let area = signedArea(vs);
    if (area < 0) {
        vs.reverse();
    }

    const N = []; // array of [nx, ny]
    const B = []; // array of b
    for (let i = 0; i < np; i++) {
        const j = (i + 1) % np;
        const vi = vs[i];
        const vj = vs[j];

        // delta in x an y for all edges
        const ex = vj.x - vi.x;
        const ey = vj.y - vi.y;
        //print(i,ex,ey);

        // Outward normal for CCW polygon in y-up is rotate by -90: (ey, -ex)
        // normal is perp to edge
        let nx = ey;
        let ny = -ex;

        // Normalize
        let nv = createVector(nx, ny);
        nv.normalize();
        nx = nv.x;
        ny = nv.y;
        // const len = Math.sqrt(nx*nx + ny*ny);
        // if (len > 1e-6) {
        //     nx /= len; ny /= len;
        // } // what else?

        // calculate "offset", i.e. distance of edge from origin
        const b = -(nx * vi.x + ny * vi.y);

        N.push([nx, ny]);
        B.push(b);
    }
    print(N);
    print(B);
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

function resetinitial() {
    slider.value(0);
}

function get_name() {
    let path = document.location.pathname;
    let dirs = path.split('/');
    let name = dirs[dirs.length - 2];
    return name;
}