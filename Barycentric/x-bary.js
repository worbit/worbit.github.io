let slider, checkbox, button;
let rectVert = [], pentVert = [];
let tris = [];
let center;

function setup() {
    createCanvas(500, 500);
    center = createVector(width / 2, height / 2);
    textSize(18);
    //pixelDensity(1);
    //noLoop();

    let dir = get_name();
    createA("https://worbit.github.io/" + dir + "/", '&rarr; ', '_top');
    slider = createSlider(0, 1, 0, 0.01);
    checkbox = createCheckbox('info', false);
    button = createButton('reset');
    button.mousePressed(resetinitial);
    let lab = createElement('label', dir);

    // Triangle from rectangle (rotated -20°)
    let w = 300;
    let h = 200;
    let baseRect = [
        createVector(-w / 2, -h / 2),
        createVector(-w / 2, h / 2),
        createVector(w / 2, h / 2),
        createVector(w / 2, -h / 2),
        createVector(0, -h / 2),
    ];
    rectVert = baseRect.map(v => rotateAndTranslate(v, radians(-20), createVector(center.x, center.y)));

    // Triangle from pentagon (3 adjacent vertices)
    let r = 150;
    for (let i = 0; i < 5; i++) {
        let angle = TWO_PI * i / 5 - TWO_PI / 5 - PI / 2;
        pentVert.push(createVector(center.x + r * cos(-angle), center.y + r * sin(-angle)));
    }

    tris = [[0, 1, 4],
    [1, 2, 4],
    [2, 3, 4]];
}

function draw() {
    background('skyBlue'); // sky blue
    loadPixels();
    let t = slider.value();

    // Interpolate triangle vertices
    let lerpos = [];
    for (let i = 0; i < 5; i++) {
        lerpos.push(p5.Vector.lerp(rectVert[i], pentVert[i], t));
    }

    // For each pixel, check if inside triangle
    let mn = 9999999;
    let mx = -9999999;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let barys = [];
            let P = createVector(x, y);
            //let bary = getCoefficients(P, tri[0], tri[1], tri[2]);
            let mycol = color('skyBlue');
            for (let i = 0; i < 3; i++) {
                let ti = tris[i];
                let A = lerpos[ti[0]];
                let B = lerpos[ti[1]];
                let C = lerpos[ti[2]];
                let bary = getCoefficients(P, A, B, C);
                mx = max(mx, max(bary));
                mn = min(mn, min(bary));
                barys.push(bary);
                if (inTriCoff(bary)) {
                    mycol = color('salmon'); // salmon
                    /*
                    //if (bary && bary.every(w => w >= 0 && w <= 1)) {
                    // Use barycentric weights to compute interpolated position
                    let interpPos = p5.Vector.mult(rectVert[0], bary[0])
                        .add(p5.Vector.mult(rectVert[1], bary[1]))
                        .add(p5.Vector.mult(rectVert[2], bary[2]));

                    // Color based on interpolated position (e.g., x-based gradient)
                    let r = map(interpPos.x, 150, 350, 250, 100); // salmon fade
                    let g = map(interpPos.y, 100, 400, 128, 80);
                    let b = 114;
                    // if (bary.every(v => int(v*10)%2==0)) {
                    if (interpPos.x % 20 == 0 || interpPos.y % 20 == 0) {
                        r = g = b = 0;
                    }

                    let idx = 4 * (y * width + x);
                    pixels[idx] = r;
                    pixels[idx + 1] = g;
                    pixels[idx + 2] = b;
                    pixels[idx + 3] = 255;
                    */
                }
            }
            if (checkbox.checked()) {
                let r = min(barys[0][0], barys[1][0], barys[2][0]);
                let g = min(barys[0][1], barys[1][1], barys[2][1]);
                let b = min(barys[0][2], barys[1][2], barys[2][2]);
                r = ((r + 3.9) / 7.1) * 255;
                g = ((g + 3.9) / 7.1) * 255;
                b = ((b + 3.9) / 7.1) * 255;
                if (barys[1].some(v => abs(v)%0.3333<0.005)) {
                    r = g = b = 255;
                }
                // if (r%20<1 || g%20<1 || b%20<1) {
                //     r = g = b = 255;
                // }
                mycol = color(r, g, b);
            }
            set(x, y, mycol);
        }
    }
    updatePixels();
    //console.log(mn, mx);
    if (checkbox.checked()) {
        let mox = mouseX;
        let moy = mouseY;
        let P = createVector(mox, moy);
        stroke(0);
        strokeWeight(2);
        for (let i = 0; i < 5; i++) {
            line(lerpos[i].x, lerpos[i].y, mox, moy);
        }
        // Draw triangles
        for (let i = 0; i < 3; i++) {
            stroke(0);
            noFill();
            let ti = tris[i];
            let A = lerpos[ti[0]];
            let B = lerpos[ti[1]];
            let C = lerpos[ti[2]];
            let Vs = [A, B, C];
            beginShape();
            vertex(A.x, A.y);
            vertex(B.x, B.y);
            vertex(C.x, C.y);
            endShape(CLOSE);
            let ax = (A.x + B.x + C.x) / 3;
            let ay = (A.y + B.y + C.y) / 3;

            // Draw lines from vertices to mouse
            // line(A.x, A.y, mox, moy);
            // line(B.x, B.y, mox, moy);
            // line(C.x, C.y, mox, moy);

            // Compute and display barycentric coordinates
            // for triangle i
            let bary = getCoefficients(P, A, B, C);
            console.log(i,bary);
            noStroke();
            textAlign(CENTER, CENTER);
            fill(0);
            text(['A','B','C'][i],ax,ay);

            textAlign(LEFT, CENTER);
            fill(255);
            text(['A','B','C'][i],mox+i*70,moy-18);
            // ['a','b','c'].forEach((n,j)=>{
            //     text(n, mox + i*70, moy + j*18);
            // });
            bary.forEach((n, j) => {
                if (n >= 0 && n <= 1) {
                    fill('limeGreen');
                } else if (n < 0) {
                    fill('salmon');
                } else if (n > 1) {
                    fill('skyBlue');
                }

                text(n.toFixed(2), mox + i*70, moy + j*18);
                // text(i+' : '+j+' : '+n.toFixed(2), (Vs[j].x + mox) / 2, (Vs[j].y + moy) / 2 + i*16);
            });
            
        }
    }
}

function rotateAndTranslate(v, angle, offset) {
    let x = v.x * cos(angle) - v.y * sin(angle);
    let y = v.x * sin(angle) + v.y * cos(angle);
    return createVector(x + offset.x, y + offset.y);
}

function getCoefficients(P, A, B, C) {
    let area = signedArea(A, B, C);
    let a1 = signedArea(P, B, C) / area;
    let a2 = signedArea(A, P, C) / area;
    let a3 = signedArea(A, B, P) / area;
    return [a1, a2, a3];
}

function inTriCoff(arr) {
    return arr[0] >= 0 && arr[1] >= 0 && arr[2] >= 0;
}

function signedArea(U, V, W) {
    return 0.5 * ((V.x - U.x) * (W.y - U.y) - (W.x - U.x) * (V.y - U.y));
}

function resetinitial() {
    slider.value(0);
}

function get_name() {
    let loc = window.location.pathname;
    let elems = loc.split('/');
    let dir = elems[elems.length - 2];
    return dir;
}