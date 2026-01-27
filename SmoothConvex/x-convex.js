let slider, checkbox, button;
let deltaSlider, sigmaSlider;
let myShader;
let pts, verts;
let dragging = -1;
const handleR = 10;
const np = 5;
let cp = 5; // number of polygon vertices
let bggl, fggl;
let NN, BB;

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
    deltaSlider = createSlider(0.2, 1, 1, 0.001);
    createElement('label', '&#963;');
    sigmaSlider = createSlider(0.001, 1, 1, 0.001);
    deltaSlider.style('width', '80px')
    sigmaSlider.style('width', '80px')
    checkbox = createCheckbox('info', false);
    button = createButton('reset');
    button.mousePressed(resetinitial);
    createElement('label', dir);


    pts = [];
    pts.push(createVector(74.844, 207.334));
    pts.push(createVector(356.752, 104.728));
    pts.push(createVector(425.156, 292.666));
    pts.push(createVector(143.248, 395.272));
    pts.push(p5.Vector.sub(pts[3], pts[0]).mult(0.5).add(pts[0])); // mid pt between pt0 and pt1

    verts = pts.map(v => createVector(v.x - width / 2, v.y - height / 2));

    //let res = computeEdgesYup(verts, width, height);
    convverts = convexhull.makeHull(verts);
    cp = convverts.length;
    let res = computeEdgesYup(convverts, width, height);
    NN = [];
    for (let n of res.N) {
        NN.push(n[0]);
        NN.push(n[1]);
    }
    BB = res.B;
}

let convverts;

function draw() {
    background('skyblue');

    fill('salmon');

    // Compute edge half-spaces in y-up coordinates
    if (dragging >= 0) {
        convverts = convexhull.makeHull(verts);
        cp = convverts.length;
        let res = computeEdgesYup(convverts, width, height);
        NN = [];
        for (let n of res.N) {
            NN.push(n[0]);
            NN.push(n[1]);
        }
        BB = res.B;
        // NN = res.N;
    }
    //const { N, B } = computeEdgesYup(verts, width, height);

    shader(myShader);
    // Set shader uniforms
    myShader.setUniform('u_resolution', [width, height]);
    myShader.setUniform('u_color', fggl);     // salmon
    myShader.setUniform('u_bg', bggl);         // skyblue
    myShader.setUniform('u_delta', pow(deltaSlider.value(), 3));    // softness/pointiness
    myShader.setUniform('u_sigma', pow(sigmaSlider.value(), 4));    // edge hardness
    myShader.setUniform('u_B', BB);                          // float[5]
    myShader.setUniform('u_np', NN);                          // vec2[5]
    // myShader.setUniform('u_N', NN);                          // vec2[5]
    myShader.setUniform('numpts', cp);

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
    stroke('black');
    noFill();
    beginShape();
    convverts.forEach(v => {
        const xw = v.x;
        const yw = v.y;
        vertex(xw, yw);
    });
    endShape(CLOSE);

    fill(0);
    for (let v of verts) {
        ellipse(v.x, v.y, 10, 10);
    }

    stroke(255);
    for (let i = 0; i < np; i++) {
        let di = B[i];
        //if (di < 0) di *= -1;
        // line(0, 0, NN[i][0] * di, NN[i][1] * di);
        let pn = createVector(N[i * 2], N[i * 2 + 1]);
        let pp = p5.Vector.mult(pn, di);
        pn.mult(10);
        let vperp = createVector(-pn.y, pn.x);
        line(0, 0, pp.x, pp.y);
        // draw perp icon
        line(pp.x - pn.x, pp.y - pn.y, pp.x - pn.x + vperp.x, pp.y - pn.y + vperp.y);
        line(pp.x + vperp.x, pp.y + vperp.y, pp.x - pn.x + vperp.x, pp.y - pn.y + vperp.y);
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
    for (let i = 0; i < cp; i++) {
        const j = (i + 1) % cp;
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

    return { N, B };
}

// Signed area (y-up) to check orientation
// area of a random polygon?
function signedArea(vs) {
    let a = 0;
    for (let i = 0; i < cp; i++) {
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
    //slider.value(0);
    verts = pts.map(v => createVector(v.x - width / 2, v.y - height / 2));
    let res = computeEdgesYup(verts, width, height);
    NN = [];
    for (let n of res.N) {
        NN.push(n[0]);
        NN.push(n[1]);
    }
    BB = res.B;
}

function get_name() {
    let path = document.location.pathname;
    let dirs = path.split('/');
    let name = dirs[dirs.length - 2];
    return name;
}

function keyPressed() {
    if (key === "ArrowUp") {
        print("saving pic");
        save_pic();
    }
    //   if (key === 'g') {
    //     save_gif(5);
    //   }
}

function save_pic() {
    let n = get_name();
    let c = str(checkbox.checked());
    let v = str(deltaSlider.value());
    save(n + '_' + c + '_' + v + '.png');
}