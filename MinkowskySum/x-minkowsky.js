let slider, checkbox, button;
let rot;
let r = 7;
let ptsA = [];
let ptsB = [];
let minkowskiPts = [];
let hullPts = [];

function setup() {
  createCanvas(500, 500);

  let dir = get_name();
  createA("https://worbit.github.io/"+dir+"/", '&rarr; ', '_top');
  slider = createSlider(-50, 50, 0, 0.1);
  checkbox = createCheckbox('info', false);
  rot = createCheckbox('r', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  createElement('label', dir);

  fill('salmon');
  rectMode(CENTER);
  noStroke();

    // Define two rectangles as sets of points
    ptsA = [createVector(-100, -50), createVector(100, -50), createVector(100, 50), createVector(-100, 50)];
    ptsB = [createVector(-50, -50), createVector(50, -50), createVector(50, 50), createVector(-50, 50)];

    // Compute Minkowski sum
    minkowskiPts = [];
    for (let pA of ptsA) {
        for (let pB of ptsB) {
            minkowskiPts.push(createVector(pA.x + pB.x, pA.y + pB.y));
        }
    }
    // Compute convex hull of the Minkowski sum points
    hullPts = convexhull.makeHull(minkowskiPts);

}

function draw() {
    background('skyblue');

    translate(250,250);
    rotate(-PI/9);

    let v = slider.value();
    ptsA[2].x = 100 + v;
    ptsA[2].y = 50 + v;
    // Compute Minkowski sum
    minkowskiPts = [];
    for (let pA of ptsA) {
        for (let pB of ptsB) {
            minkowskiPts.push(createVector(pA.x + pB.x, pA.y + pB.y));
        }
    }
    // Compute convex hull of the Minkowski sum points
    hullPts = convexhull.makeHull(minkowskiPts);

    if (checkbox.checked()) { 
        push();
        fill(255);
        stroke(0);
        for (let p of minkowskiPts) {
            ellipse(p.x, p.y, r,r);
        }
        noFill();
        beginShape();
        for (let p of ptsA) {
            vertex(p.x, p.y, r,r);
        }
        endShape(CLOSE);
        for (let p of ptsA) {
            ellipse(p.x, p.y, r,r);
            push();
            translate(p.x, p.y);
            beginShape();
            for (let pB of ptsB) {
                vertex(pB.x, pB.y, r,r);
            }
            endShape(CLOSE);
            pop();
        }
            for (let pB of ptsB) {
            pop();
        }
        pop();

    } else { 

        beginShape();
        for (let p of hullPts) {
            vertex(p.x, p.y);
        }
        endShape(CLOSE);
    }


    //rect(0,0,300,200);
}

function resetinitial() {
    slider.value(0);
}

function get_name() {
    let path = document.location.pathname;
    let dirs = path.split('/');
    let name = dirs[dirs.length-2];
    return name;
}