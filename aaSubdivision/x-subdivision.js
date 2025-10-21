let slider, checkbox, button;
let polys = [];

function setup() {
    createCanvas(500, 500);

    let dir = get_name();
    createA("https://worbit.github.io/" + dir + "/", '&rarr; ', '_top');
    slider = createSlider(3, 10, 10);
    checkbox = createCheckbox('info', false);
    button = createButton('reset');
    button.mousePressed(resetinitial);
    createElement('label', dir);

    fill('skyblue');
    // noStroke();

    let p = new Polygon([createVector(-150, -100), createVector(150, -100), createVector(150, 100), createVector(-150, 100)]);
    // polys.push(p);
    let o = new Polygon([]);
    o.addVertex(createVector(0,0));
    o.addVertex(createVector(width,0));
    o.addVertex(createVector(width,height));
    o.addVertex(createVector(0,height));

    let [sub1, sub2] = subdividePolygon(o, [1,3], [0.5,0.1]);
    polys.push(sub1);
    polys.push(sub2);
}

function draw() {
    background('salmon');
    // translate(width / 2, height / 2);
    polys[0].display();
    // polys[1].display();
}

function get_name() {
    let loc = window.location.pathname;
    let elems = loc.split('/');
    let dir = elems[elems.length - 2];
    return dir;
}

function resetinitial() {
    slider.value(10);
}

class Polygon {
    constructor(vertices) {
        this.vertices = vertices; // array of p5.Vector
    }

    addVertex(v) {
        this.vertices.push(v);
    }

    display() {
        beginShape();
        for (let v of this.vertices) {
            vertex(v.x, v.y);
        }
        endShape(CLOSE);
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