let slider, checkbox, button;
let sky, sal;
let pent;

function preload() {
  pent = loadImage('pentagon_tiles.svg');
}

function setup() {
  createCanvas(500, 500);

  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  noStroke();
  fill(sal);
  textSize(18);
  textAlign(CENTER,CENTER);
  rectMode(CENTER);

  slider = createSlider(3,6,4);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  
  let loc = window.location.pathname;
  let elems = loc.split('/');
  let dir = elems[elems.length-2];
  createElement('label', dir);

  button.mousePressed(resetinitial);
}

function draw() {
  background(sky);
  
  let val = slider.value();
  translate(width/2, height/2);
  rotate(radians(-20));
  switch(val) {
    case 3:
      break;
    case 4:
      for (let i=-3; i<6; i++) {
        for (let j=-3; j<6; j++) {
          tile_4(i,j);
        }
      }
      break;
    case 5:
      image(pent, 0,0);
      break;
    case 6:
      for (let i=-3; i<6; i++) {
        for (let j=-3; j<6; j++) {
          tile_6(i,j);
        }
      }
      break;
  }
    
  
  

  if (checkbox.checked()) {
    //debug view
    
  }
}

function resetinitial() {
  slider.value(4);
}

function tile_4(i,j) {
  noStroke();
  if (checkbox.checked()) stroke(0);
  fill(sky);
  if (i==0 && j==0) fill(sal);
  push();
  translate(i*300,j*200);
  rect(0,0,300,200);
  if (checkbox.checked()) {
    fill(255);
    text(i+"/"+j, 0,0);
  }
  pop();
}

function tile_3(i,j) {

}

function tile_5() {

}

function tile_6(i,j) {
  noStroke();
  if (checkbox.checked()) stroke(0);
  fill(sky);
  if (i==0 && j==0) fill(sal);
  push();
  let m = abs(j%2) * 150;
  translate(i*300 + m, j*200);
  beginShape();
  vertex(0,125);
  vertex(150,75);
  vertex(150,-75);
  vertex(0,-125);
  vertex(-150,-75);
  vertex(-150,75);
  endShape(CLOSE);
  if (checkbox.checked()) {
    fill(255);
    text(i+"/"+j, 0,0);
  }
  pop();
}