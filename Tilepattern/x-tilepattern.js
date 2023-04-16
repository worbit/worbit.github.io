let slider, checkbox, button;
let sky, sal;
let pent;

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
  for (let i=-3; i<6; i++) {
    for (let j=-3; j<6; j++) {
      tile_4(i,j);
    }
  }
}

function resetinitial() {
  slider.value(4);
}

function tile_4(i,j) {
  noStroke();
  if (checkbox.checked()) stroke(0);

  push();
  let m = abs(j%2);
  let cs = abs(i%2);
  translate(i*300 + m* 150, j*100);

  let c1 = sky;
  let c2 = sal;
  if (cs==0 && m==1) {
    c1 = sal;
    c2 = sky;
  }

  switch(m) {
    case 0:
      fill(c1);
      beginShape();
      vertex(0,100);
      vertex(150,0);
      vertex(-150,0);
      endShape();
    
      fill(c2);
      beginShape();
      vertex(0,-100);
      vertex(150,0);
      vertex(-150,0);
      endShape();
      break;

    case 1:
      fill(c1);
      beginShape();
      vertex(0,100);
      vertex(150,0);
      vertex(0,-100);
      endShape();
    
      fill(c2);
      beginShape();
      vertex(0,100);
      vertex(0,-100);
      vertex(-150,0);
      endShape();
      break;
  }

  if (checkbox.checked()) {
    fill(255);
    text(i+"/"+j, 0,0);
  }
  pop();
}
