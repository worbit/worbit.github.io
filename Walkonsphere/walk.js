let r;

let img;
function preload() {
  img = loadImage('rWyDiR.jpg');
}

function setup() {
  createCanvas(500, 500, WEBGL);
  r = 0;
  fill('salmon');
  noStroke();
}

function draw() {
  background('skyblue');
  translate(0,150,0);
  if (r<PI/2) {
    rotateX(-r);
  } else {
    rotateX(-PI/2);
    rotateY(r);
  }
  texture(img);
  sphere(250);
  r += 0.005;
}