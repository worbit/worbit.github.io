let slider;
let rectVerts = [];
let pentVerts = [];

function setup() {
  createCanvas(500, 500);
  slider = createSlider(0, 1, 0, 0.01);
  slider.position(10, height + 10);

  // Rectangle centered at (250,250), size 200x300
  let w = 300, h = 200;
  rectVerts = [
    createVector(-w/2, -h/2),
    createVector( w/2, -h/2),
    createVector( w/2,  h/2),
    createVector(-w/2,  h/2)
  ].map(v => rotateAndTranslate(v, radians(-20), createVector(250,250)));

  // Pentagon centered at (250,250), radius ~150
  for (let i = 0; i < 5; i++) {
    let angle = TWO_PI * i / 5 - PI/2;
    let r = 150;
    pentVerts.push(createVector(250 + r * cos(angle), 250 + r * sin(angle)));
  }
}

function draw() {
  background(135, 206, 235); // sky blue
  let t = slider.value();

  // Interpolate vertices
  let morphedVerts = [];
  for (let i = 0; i < 5; i++) {
    let vRect = i < 4 ? rectVerts[i] : p5.Vector.lerp(rectVerts[3], rectVerts[0], 0.5);
    let vPent = pentVerts[i];
    morphedVerts.push(p5.Vector.lerp(vRect, vPent, t));
  }

  // Triangulate: split into 3 triangles from center
  let center = morphedVerts.reduce((acc, v) => acc.add(v.copy()), createVector(0,0)).div(5);
//   noStroke();
  fill(250, 128, 114); // salmon
  for (let i = 0; i < 5; i++) {
    let a = morphedVerts[i];
    let b = morphedVerts[(i+1)%5];
    triangle(center.x, center.y, a.x, a.y, b.x, b.y);
  }
}

function rotateAndTranslate(v, angle, offset) {
  let x = v.x * cos(angle) - v.y * sin(angle);
  let y = v.x * sin(angle) + v.y * cos(angle);
  return createVector(x + offset.x, y + offset.y);
}
