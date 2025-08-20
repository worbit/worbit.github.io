let slider, checkbox, button;
let sky, sal;
let w,h;
let arrowSize = 20;

function setup() {
  createCanvas(500, 500);
  // createCanvas(windowWidth, 500);
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  noStroke();
  fill(sal);
  textSize(20);
  textAlign(LEFT, CENTER);
  rectMode(CENTER);

  w = 300;
  h = 200;

  slider = createSlider(40,400,200);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  
  createElement('label', get_name());

  button.mousePressed(resetinitial);
}

// function windowResized() {
//   resizeCanvas(windowWidth, 500);
// }

function draw() {
  background(sky);
  
  h = slider.value();
  
  translate(width/2, height/2);
  rotate(radians(-20));
  rect(0,0, w, h);

  if (checkbox.checked()) {
    //debug view
    push();
    stroke(0);
    strokeWeight(2);
    line(0,-h/2, 0, h/2);
    //line(-w/2, 0, w/2, 0);
    noStroke();
    fill(0);
    translate(0,h/2-arrowSize);
    triangle(arrowSize / 2, 0, -arrowSize / 2, 0, 0, arrowSize);
    translate(0,-h+arrowSize*2);
    triangle(arrowSize / 2, 0, -arrowSize / 2, 0, 0, -arrowSize);
    translate(10, h/2-arrowSize);
    text('h = '+str(h), 0,0);
    pop();
  }
}

function resetinitial() {
  slider.value(200);
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

function setLineDash(list) {
  drawingContext.setLineDash(list);
}