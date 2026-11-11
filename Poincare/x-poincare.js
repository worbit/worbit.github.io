// Rosetta Form – Poincaré
// The hyperbolic plane as the interior of a disc of radius R (curvature K = -1/R²).
// Corners keep their screen positions; edges are geodesics, i.e. circular arcs
// orthogonal to the boundary circle. Slider: R (right end = Euclidean limit).
// Click: hyperbolic translation (Möbius transform) moving the form's centre there.

const SIZE = 500, CX = 250, CY = 250;
const ROT = -20 * Math.PI / 180;
const LOCAL = [[-150, -100], [150, -100], [150, 100], [-150, 100]];
const R_MIN = 185;      // just outside the corner distance (≈180.3 px)
const GROWTH = 4;       // R spans R_MIN … R_MIN·e^4 before jumping to ∞

let slider, checkbox;
let offset = { x: 0, y: 0 };

function setup() {
    const cnv = createCanvas(SIZE, SIZE);
    cnv.mousePressed(onCanvasPress);
    let dir = get_name();
    createA("https://worbit.github.io/" + dir + "/", '&rarr; ', '_top');
    slider = createSlider(0, 100, 100, 0.1);
    checkbox = createCheckbox('info', false);
    button = createButton('reset');
    button.mousePressed(resetAll);
    createElement('label', dir);
}

function getR() {
    const s = slider.value();
    return s >= 100 ? Infinity : R_MIN * Math.exp(GROWTH * s / 100);
}

// ---------- complex helpers ----------
function cdiv(a, b) {
    const d = b.x * b.x + b.y * b.y;
    return { x: (a.x * b.x + a.y * b.y) / d, y: (a.y * b.x - a.x * b.y) / d };
}
// disc isometry sending 0 to a: (z + a) / (1 + conj(a)·z)
function mobius(z, a) {
    const num = { x: z.x + a.x, y: z.y + a.y };
    const den = { x: 1 + a.x * z.x + a.y * z.y, y: a.x * z.y - a.y * z.x };
    return cdiv(num, den);
}

function corners(R) {
    const base = LOCAL.map(([x, y]) => ({
        x: x * Math.cos(ROT) - y * Math.sin(ROT),
        y: x * Math.sin(ROT) + y * Math.cos(ROT)
    }));
    if (!isFinite(R)) return base.map(p => ({ x: p.x + offset.x, y: p.y + offset.y }));
    let a = { x: offset.x / R, y: offset.y / R };
    const m = Math.hypot(a.x, a.y);
    if (m > 0.97) { a.x *= 0.97 / m; a.y *= 0.97 / m; }
    return base.map(p => {
        const w = mobius({ x: p.x / R, y: p.y / R }, a);
        return { x: w.x * R, y: w.y * R };
    });
}

// ---------- geodesics ----------
function unit(v) { const l = Math.hypot(v.x, v.y); return { x: v.x / l, y: v.y / l }; }

function geodesic(p, q, R) {
    const cr = p.x * q.y - p.y * q.x;
    const lp = Math.hypot(p.x, p.y), lq = Math.hypot(q.x, q.y);
    if (!isFinite(R) || lp < 1e-6 || lq < 1e-6 || Math.abs(cr) / (lp * lq) < 1e-7) {
        // Euclidean limit, or edge on a diameter: straight segment
        return {
            pts: [p], circle: null,
            t0: unit({ x: q.x - p.x, y: q.y - p.y }),
            t1: unit({ x: p.x - q.x, y: p.y - q.y })
        };
    }
    // circle through p, q orthogonal to the boundary: c·p = (|p|²+R²)/2, c·q = (|q|²+R²)/2
    const bp = (lp * lp + R * R) / 2, bq = (lq * lq + R * R) / 2;
    const c = { x: (bp * q.y - p.y * bq) / cr, y: (p.x * bq - bp * q.x) / cr };
    const r = Math.hypot(p.x - c.x, p.y - c.y);
    const a1 = Math.atan2(p.y - c.y, p.x - c.x);
    const a2 = Math.atan2(q.y - c.y, q.x - c.x);
    let da = a2 - a1;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;   // minor arc = the part inside the disc
    const n = Math.min(400, Math.max(2, Math.ceil(Math.abs(da) * r / 3)));
    const pts = [];
    for (let i = 0; i < n; i++) {
        const t = a1 + da * i / n;
        pts.push({ x: c.x + r * Math.cos(t), y: c.y + r * Math.sin(t) });
    }
    const s = Math.sign(da);
    return {
        pts, circle: { c, r },
        t0: { x: -Math.sin(a1) * s, y: Math.cos(a1) * s },   // at p, towards q
        t1: { x: Math.sin(a2) * s, y: -Math.cos(a2) * s }
    }; // at q, towards p
}

function angleBetween(u, v) {
    return Math.acos(Math.max(-1, Math.min(1, u.x * v.x + u.y * v.y)));
}

// points at equal hyperbolic spacing along the geodesic p→q, index from -k to n+k
function divide(p, q, R, n, k) {
    const out = [];
    if (!isFinite(R)) {
        for (let i = -k; i <= n + k; i++) {
            const t = i / n;
            out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
        }
        return out;
    }
    const P = { x: p.x / R, y: p.y / R }, Q = { x: q.x / R, y: q.y / R };
    const q2 = mobius(Q, { x: -P.x, y: -P.y });          // move p to the centre
    const m = Math.hypot(q2.x, q2.y);
    const d = 2 * Math.atanh(Math.min(m, 0.999999999));  // hyperbolic length of the edge
    const dir = { x: q2.x / m, y: q2.y / m };
    for (let i = -k; i <= n + k; i++) {
        const rr = Math.tanh(d * i / n / 2);
        const w = mobius({ x: dir.x * rr, y: dir.y * rr }, P); // and back
        out.push({ x: w.x * R, y: w.y * R });
    }
    return out;
}

// the complete geodesic through u and v, from boundary to boundary
function fullLine(u, v, R) {
    if (!isFinite(R)) {
        const d = unit({ x: v.x - u.x, y: v.y - u.y });
        return [{ x: u.x - d.x * 2000, y: u.y - d.y * 2000 }, { x: u.x + d.x * 2000, y: u.y + d.y * 2000 }];
    }
    const g = geodesic(u, v, R);
    if (!g.circle) {
        const d = unit(Math.hypot(u.x, u.y) > 1e-6 ? u : v);
        return [{ x: -d.x * R, y: -d.y * R }, { x: d.x * R, y: d.y * R }];
    }
    const { c, r } = g.circle;
    const phi0 = Math.atan2(-c.y, -c.x), half = Math.atan(R / r);
    const n = Math.min(600, Math.max(8, Math.ceil(2 * half * r / 4)));
    const pts = [];
    for (let i = 0; i <= n; i++) {
        const t = phi0 - half + 2 * half * i / n;
        pts.push({ x: c.x + r * Math.cos(t), y: c.y + r * Math.sin(t) });
    }
    return pts;
}

function polyline(pts) {
    beginShape();
    pts.forEach(v => { if (isFinite(v.x) && isFinite(v.y)) vertex(v.x, v.y); });
    endShape();
}

// 6×4 grid of "parallels": opposite edges divided into equal hyperbolic lengths,
// division points joined by geodesics, continued beyond the form to the boundary
function drawGrid(R, P) {
    const K = 8;
    const families = [
        [divide(P[0], P[1], R, 6, K), divide(P[3], P[2], R, 6, K), 6],
        [divide(P[0], P[3], R, 4, K), divide(P[1], P[2], R, 4, K), 4]
    ];
    noFill();
    families.forEach(([A, B, n]) => {
        for (let j = 0; j < A.length; j++) {
            const i = j - K;
            const a = A[j], b = B[j];
            if (!isFinite(a.x) || !isFinite(b.x) || Math.hypot(a.x - b.x, a.y - b.y) < 0.5) continue;
            stroke(255, 255, 255, 110); strokeWeight(1);
            polyline(fullLine(a, b, R));
            if (i > 0 && i < n) {
                stroke(255, 255, 255, 230); strokeWeight(1.3);
                polyline(geodesic(a, b, R).pts.concat([b]));
            }
        }
    });
}

// ---------- drawing ----------
function draw() {
    background('skyblue');
    const R = getR();
    const P = corners(R);
    const E = P.map((p, i) => geodesic(p, P[(i + 1) % 4], R));
    const info = checkbox.checked();

    push();
    translate(CX, CY);
    if (info) drawInfoBack(R, E);
    noStroke();
    fill('salmon');
    beginShape();
    E.forEach(e => e.pts.forEach(v => vertex(v.x, v.y)));
    endShape(CLOSE);
    if (info) drawGrid(R, P);
    if (info) drawInfoFront(R, P, E);
    pop();
}

function drawInfoBack(R, E) {
    if (!isFinite(R)) return;
    // shade everything beyond the boundary at infinity
    noStroke();
    fill(20, 50, 80, 45);
    beginShape();
    vertex(-CX, -CY); vertex(CX, -CY); vertex(CX, CY); vertex(-CX, CY);
    beginContour();
    for (let i = 0; i < 180; i++) {
        const t = -i / 180 * TWO_PI;
        vertex(R * Math.cos(t), R * Math.sin(t));
    }
    endContour();
    endShape(CLOSE);
    // complete geodesic circles
    noFill();
    stroke(255, 255, 255, 120);
    strokeWeight(1);
    E.forEach(e => { if (e.circle) circle(e.circle.c.x, e.circle.c.y, 2 * e.circle.r); });
    // boundary circle
    stroke(255);
    strokeWeight(1.5);
    circle(0, 0, 2 * R);
}

function drawInfoFront(R, P, E) {
    const ctr = { x: P.reduce((s, p) => s + p.x, 0) / 4, y: P.reduce((s, p) => s + p.y, 0) / 4 };
    let sum = 0;
    textSize(12);
    textAlign(CENTER, CENTER);
    P.forEach((p, i) => {
        const prev = E[(i + 3) % 4], next = E[i];
        const ang = angleBetween(prev.t1, next.t0);
        sum += ang;
        stroke(20, 40, 70); strokeWeight(1); fill(255);
        circle(p.x, p.y, 7);
        const d = unit({ x: p.x - ctr.x, y: p.y - ctr.y });
        noStroke(); fill(20, 40, 70);
        text((ang * 180 / Math.PI).toFixed(1) + '°', p.x + d.x * 22, p.y + d.y * 22);
    });

    resetMatrix();
    const sumDeg = sum * 180 / Math.PI;
    textAlign(LEFT, TOP);
    noStroke(); fill(20, 40, 70);
    const lines = [
        isFinite(R) ? 'R = ' + R.toFixed(0) + ' px,  K = −1/R²' : 'R = ∞  (Euclidean limit)',
        'Σ angles = ' + sumDeg.toFixed(2) + '°',
        'deficit = ' + (360 - sumDeg).toFixed(2) + '°  = area · |K|'
    ];
    lines.forEach((l, i) => text(l, 10, 10 + i * 16));
    textAlign(LEFT, BOTTOM);
    text('click to move the form (hyperbolic translation)', 10, SIZE - 10);
}

// ---------- interaction ----------
function onCanvasPress() {
    const mx = mouseX - CX, my = mouseY - CY;
    const R = getR();
    if (isFinite(R) && Math.hypot(mx, my) >= 0.97 * R) return;
    offset = { x: mx, y: my };
}

function resetAll() {
    slider.value(100);
    offset = { x: 0, y: 0 };
    checkbox.checked(false);
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
    save(n + '_' + c + '_' + v + '.png');
}

function get_name() {
    let loc = window.location.pathname;
    let elems = loc.split('/');
    let dir = elems[elems.length - 2];
    return dir;
}