let slider, checkbox, button;
let sky,sal;

function setup() {
  createCanvas(500, 500);
  
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  fill(sal);
  noStroke();
  rectMode(CENTER);
  
  slider = createSlider(0,100,0);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
}

function draw() {
  background(sky);
  push();
  translate(250,250);
  rotate(radians(-20));
  rect(0,0,300,200);
  pop();
  filter(BLUR,slider.value());
}

function resetinitial() {
  slider.value(0);
}