let slider, checkbox, button;
let sky, sal;
let startpoint;
let lengths, angles;
let trtl;

// function preload() {
//   trtl = loadImage('turtle.svg');
// }

async function setup() {
  createCanvas(500, 500);

  trtl = await loadImage('./turtle.svg');

  // library from: https://github.com/bohnacker/p5js-screenPosition
  addScreenPositionFunction();

  // sky = color(135, 206, 235);
  // sal = color(250, 128, 114);
  noStroke();
  fill('salmon');
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
  background('skyBlue'); // sky blue
  
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
    let d = 40;
    noFill();
    stroke(0);
    // strokeWeight(2);
    setLineDash([7,7]);
    line(0,0,startpoint.x,startpoint.y);
    setLineDash([]);
    beginShape();
    for (let p of ps) {
      vertex(p.x,p.y);
    }
    endShape();
    
    // arc
    fill(255);
    arc(ps[1].x, ps[1].y, d, d, radians(-20), radians(-20 + angles[1]));
    text(round(angles[1])+'°', ps[1].x, ps[1].y);

    // turtle
    translate(ps[ps.length-1].x, ps[ps.length-1].y);
    for (let a of angles) {
      rotate(radians(a));
    }
    image(trtl,-d/2,-d/2, d,d);

    noStroke();
    fill('salmon');
  }
}

function setLineDash(list) {
  drawingContext.setLineDash(list);
}

function resetinitial() {
  slider.value(90);
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