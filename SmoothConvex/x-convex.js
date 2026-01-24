let slider, checkbox, button;
let deltaSlider, sigmaSlider;
let myShader;
let verts;
let dragging = -1;
const handleR = 10;
const np = 4;
let bggl, fggl;

async function setup() {
    pixelDensity(1);
    createCanvas(500, 500, WEBGL);
    myShader = await loadShader('smocon.vert', 'smocon.frag');

    // create a ? with tooltip describing the pattern
    let d = createDiv('?');
    d.class('tooltip');
    let tt = createSpan('description goes here');
    tt.class('tooltiptext');
    tt.parent(d);

    let cbg = color('skyblue');
    let cfg = color('salmon');
    bggl = [red(cbg) / 255.0, green(cbg) / 255.0, blue(cbg) / 255.0, 1.0];
    fggl = [red(cfg) / 255.0, green(cfg) / 255.0, blue(cfg) / 255.0, 1.0];
    let dir = get_name();
    createA("https://worbit.github.io/" + dir + "/", '&rarr; ', '_top');
    //slider = createSlider(0, 1, 0, 0.01);
    createElement('label', '&#948;');
    deltaSlider = createSlider(0.1, 10, 1, 0.01);
    createElement('label', '&#963;');
    sigmaSlider = createSlider(0.1, 10, 10, 0.01);
    deltaSlider.style('width', '80px')
    sigmaSlider.style('width', '80px')
    checkbox = createCheckbox('info', false);
    button = createButton('reset');
    button.mousePressed(resetinitial);
    createElement('label', dir);

    // Initial convex quad (CCW) in top-left coordinates (y down)
    // (A slightly skewed rectangle so you can see rounding immediately)
    // verts = [
    //     createVector(120, 170),
    //     createVector(360, 150),
    //     createVector(380, 380),
    //     createVector(222, 450),
    //     createVector(40, 410),
    // ];
    verts = [];
    let angle = TWO_PI / np;
    for (let i = 0; i < np; i++) {
        verts.push(createVector(150 * cos(i * angle + 2), 150 * sin(i * angle + 2)));
    }
    verts.reverse();

    let res = computeEdgesYup(verts, width, height);
    NN = [];
    for (let n of res.N) {
            NN.push(n[0]);
            NN.push(n[1]);
    }
    BB = res.B;
}

let v = 1.0;
let NN, BB;
function draw() {
    background('skyblue');

    fill('salmon');

    // Compute edge half-spaces in y-up coordinates
    if (dragging >= 0) {
        let res = computeEdgesYup(verts, width, height);
        NN = [];
        for (let n of res.N) {
            NN.push(n[0]);
            NN.push(n[1]);
        }
        BB = res.B;
        print(NN);
    }
    //const { N, B } = computeEdgesYup(verts, width, height);

    shader(myShader);
    // Set shader uniforms
    myShader.setUniform('u_resolution', [width, height]);
    myShader.setUniform('u_color', fggl);     // salmon
    myShader.setUniform('u_bg', bggl);         // skyblue
    myShader.setUniform('u_delta', deltaSlider.value());    // softness/pointiness
    myShader.setUniform('u_sigma', sigmaSlider.value());    // edge hardness
    myShader.setUniform('u_B', BB);                          // float[5]
    myShader.setUniform('u_np', NN);                          // vec2[5]
    // myShader.setUniform('u_N', NN);                          // vec2[5]

    //noStroke();
    fill('salmon');
    noStroke();
    plane(width, height);
    if (checkbox.checked()) {
        drawVerts(NN, BB);
    }
    // } else {
        //quad(-v, -v, v, -v, v, v, -v, v);
    // }

    resetShader();
}

function drawVerts(N, B) {
    stroke('white');
    noFill();
    beginShape();
    verts.forEach(v => {
        const xw = v.x;
        const yw = v.y;
        vertex(xw, yw);
    });
    endShape(CLOSE);

    for (let v of verts) {
        ellipse(v.x, v.y, 8, 8);
    }

    for (let i = 0; i < np; i++) {
        let di = B[i];
        //if (di < 0) di *= -1;
        line(0, 0, NN[i*2] * di, NN[i*2+1] * di);
    }
}

// Build half-spaces for a CCW convex quad.
// Input vertices are in TOP-LEFT pixel coords (y down).
// We convert to y-up, compute outward normals (CCW), then b = -n·v0.
function computeEdgesYup(vsDown, W, H) {
    // Convert to y-up
    const vs = vsDown; //.map(v => createVector(v.x, H - v.y));
    //print(vs);

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

        // alternative distance calculation

        // let slope = (vj.y - vi.y) / (vj.x - vi.x);
        // let intercept = vi.y - slope * vi.x;
        // // general form: Ax + By + C = 0
        // let A = slope;
        // let B_ = -1;
        // let C = intercept;
        // let distToOrigin = Math.abs(C) / Math.sqrt(A * A + B_ * B_);
        //print("dist to origin edge ", i, distToOrigin);

        ////////////////////////////////////

        // delta in x an y for all edges
        const ex = vj.x - vi.x;
        const ey = vj.y - vi.y;
        let len = Math.sqrt(ex * ex + ey * ey);
        //print(len);

        // Outward normal for CCW polygon in y-up is rotate by -90: (ey, -ex)
        // normal is perp to edge
        let nx = ey;
        let ny = -ex;

        // Normalize
        let nv = createVector(nx, ny);
        nv.normalize();
        nx = nv.x;
        ny = nv.y;
        //print(i,'normalized',nx,ny);
        // const len = Math.sqrt(nx*nx + ny*ny);
        // if (len > 1e-6) {
        //     nx /= len; ny /= len;
        // } // what else?

        // calculate "offset", i.e. distance of edge from origin
        let b = (nx * vi.x + ny * vi.y);
        // let tt = vj.x * vi.y - vi.x * vj.y;
        // let b = tt/len;
        //print(b);

        N.push([nx, ny]);
        B.push(b);
    }
    //print(N);
    //print(B);
    return { N, B };
}

// Signed area (y-up) to check orientation
// area of a random polygon?
function signedArea(vs) {
    let a = 0;
    for (let i = 0; i < np; i++) {
        const j = (i + 1) % vs.length;
        a += vs[i].x * vs[j].y - vs[j].x * vs[i].y;
    }
    return 0.5 * a;
}

function mousePressed() {
    // Find closest vertex in screen top-left coordinates
    const mx = mouseX - width / 2;
    const my = mouseY - height / 2;
    let minD = 1e9;
    dragging = -1;
    for (let i = 0; i < np; i++) {
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
        verts[dragging].x = constrain(mouseX - width / 2, - width / 2, width / 2);
        verts[dragging].y = constrain(mouseY - height / 2, - height / 2, height / 2);
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