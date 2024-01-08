let slider, checkbox, button;
let sky, sal;
let startpoint;
let lengths, angles;
let trtl;

function preload() {
  trtl = loadImage('turtle.svg');
}

function setup() {
  createCanvas(500, 500);

  // library from: https://github.com/bohnacker/p5js-screenPosition
  addScreenPositionFunction();

  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  noStroke();
  fill(sal);
  textSize(16);

  startpoint = createVector(74.844,207.334);
  lengths = [300,200,300,200];
  angles = [-20, 90, 90, 90, 90];

  slider = createSlider(70,110,90);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  
  createElement('label', get_name());

  button.mousePressed(resetinitial);
}

function draw() {
  background(sky);
  
  let val = slider.value();
  angles[1] = val;
  var ps = [];

  push();
  translate(startpoint.x, startpoint.y);
  rotate(radians(angles[0]));
  for (let i=0; i<5; i++) {
    // ellipse(0,0,10,10);
    ps.push(screenPosition(0,0,0));
    translate(lengths[i], 0);
    rotate(radians(angles[(i+1)%4]));
  }
  pop();

  beginShape();
  for (let p of ps) {
    vertex(p.x,p.y);
  }
  endShape();

  if (checkbox.checked()) {
    //debug view
    let d = 15;
    stroke(0);
    // fill(255);
    line(0,0,startpoint.x,startpoint.y);
    beginShape();
    for (let p of ps) {
      vertex(p.x,p.y);
    }
    endShape();
    noStroke();
    image(trtl,0,0,50,50);
    // fill(sal);
  }
}

function resetinitial() {
  slider.value(250);
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
  save(n+'_'+c+'_'+v+'.png');
}

function get_name() {
  let loc = window.location.pathname;
  let elems = loc.split('/');
  let dir = elems[elems.length-2];
  return dir;
}