let slider, checkbox,button;
let polys=[];
let vectors=[];

function setup() {
    createCanvas(500, 500);
    fill('salmon');
    rectMode(CENTER);

    let dir = get_name();
    createA("https://worbit.github.io/"+dir+"/", '&rarr; ', '_top');
    slider = createSlider(0, 1, 0, 0.01);
    checkbox = createCheckbox('info', false);
    button = createButton('reset');
    button.mousePressed(resetinitial);
    createElement('label', dir);

    p1 = [
        createVector(-94.948949, 100),
        createVector(-150, 100),
        createVector(-150, -100),
        createVector(94.949, -100),
        createVector(94.949, -55.051042)
    ];
    polys.push(p1);

    p2 = [
        createVector(150, 100),
        createVector(-94.948949, 100),
        createVector(150, -100)
    ];
    polys.push(p2);

    p3 = [
        createVector(94.949, -100),
        createVector(150, -100),
        createVector(94.949, -55.051042)
    ];
    polys.push(p3);

    vectors = [
        createVector(27.5255,-22.474479),
        createVector(-27.5255,22.474479),
        createVector(-217.423449,177.525521)
    ];
}

function draw() {
    background('skyblue');
    if (checkbox.checked()) {
        stroke(0);
    } else {
        noStroke();
    }

    translate(250,250);
    rotate(-PI/9);
    let v = slider.value();

    polys.forEach((p,i) => {
        let vec = vectors[i];
        let dx = vec.x * v;
        let dy = vec.y * v;
        beginShape();
        for (let v of p) {
            vertex(v.x + dx, v.y + dy);
        }
        endShape(CLOSE);
    });
}

function resetinitial() {
    slider.value(0);
}

function get_name() {
  let loc = window.location.pathname;
  let elems = loc.split('/');
  let dir = elems[elems.length-2];
  return dir;
}