let slider, checkbox, button;
let polys = [];
let originalPoly;

function setup() {
    createCanvas(500, 500);

    let dir = get_name();
    createA("https://worbit.github.io/" + dir + "/", '&rarr; ', '_top');
    slider = createSlider(0.0000,1.0000,0.5308,0.0001); //0.53085
    checkbox = createCheckbox('info', false);
    button = createButton('reset');
    button.mousePressed(resetinitial);
    createElement('label', dir);

    fill('skyblue');
    textSize(20);
    textAlign(CENTER,CENTER);
    strokeWeight(2);
    // noStroke();

    // let p = new Polygon([createVector(-150, -100), createVector(150, -100), createVector(150, 100), createVector(-150, 100)]);
    // polys.push(p);
    originalPoly = new Polygon([]);
    originalPoly.addVertex(createVector(0,0));
    originalPoly.addVertex(createVector(width,0));
    originalPoly.addVertex(createVector(width,height));
    originalPoly.addVertex(createVector(0,height));

    createPolys(0.53085);
}

function draw() {
    background('salmon');
    fill('skyblue');
    // translate(width / 2, height / 2);
    polys.forEach((p,i) => p.display(i));
    // polys[0].display();
    // polys[1].display();

    let v = slider.value();
    createPolys(v);

    translate(width / 2, height / 2);
    rotate(-20 * Math.PI / 180);
    noFill();
    rectMode(CENTER);
    rect(0, 0, 300, 200);
}

function createPolys(f) {
    polys = [];
    // calculated in rhino gh
    let [sub1, sub2] = subdividePolygon(originalPoly, [1,3], [f, 0.105179]);
    // polys.push(sub1);
    polys.push(sub2);

    // approximated by eye
    let [sub3, sub4] = subdividePolygon(sub1, [1,3], [0.15,0.64]);
    polys.push(sub3);

    let [sub5, sub6] = subdividePolygon(sub4, [1,3], [0.35,0.47]);
    polys.push(sub5);

    let [sub7, sub8] = subdividePolygon(sub6, [1,3], [0.21,0.66]);
    polys.push(sub7);
}

function get_name() {
    let loc = window.location.pathname;
    let elems = loc.split('/');
    let dir = elems[elems.length - 2];
    return dir;
}

function resetinitial() {
    slider.value(0.53085);
}

class Polygon {
    constructor(vertices) {
        this.vertices = vertices; // array of p5.Vector
    }

    addVertex(v) {
        this.vertices.push(v);
    }

    display(ind) {
        beginShape();
        for (let v of this.vertices) {
            vertex(v.x, v.y);
        }
        endShape(CLOSE);

        push();
        fill('black');
        let p = this.center;
        text(ind, p.x, p.y);
        pop();
    }

    get center() {
        let c = createVector(0, 0);
        for (let v of this.vertices) {
            c.add(v);
        }
        c.div(this.vertices.length);
        return c;
    }
}

function subdividePolygon(polygon, edges, factors) {
    sp1 = polygon.vertices[edges[0]];
    ep1 = polygon.vertices[(edges[0] + 1) % polygon.vertices.length];

    sp2 = polygon.vertices[edges[1]];
    ep2 = polygon.vertices[(edges[1] + 1) % polygon.vertices.length];

    let newPoint1 = p5.Vector.lerp(sp1, ep1, factors[0]);
    let newPoint2 = p5.Vector.lerp(sp2, ep2, factors[1]);

    let newPoly1 = new Polygon([]);
    newPoly1.addVertex(sp1);
    newPoly1.addVertex(newPoint1);
    newPoly1.addVertex(newPoint2);
    newPoly1.addVertex(ep2);

    let newPoly2 = new Polygon([]);
    newPoly2.addVertex(sp2);
    newPoly2.addVertex(newPoint2);
    newPoly2.addVertex(newPoint1);
    newPoly2.addVertex(ep1);
    console.log(newPoly1);

    return [newPoly1, newPoly2];
}