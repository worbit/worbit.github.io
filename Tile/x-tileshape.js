let slider, checkbox, button;
let sky, sal;
let pent;

function preload() {
  pent = loadSVG('pentagon_tiles.svg');
}

function setup() {
  createCanvas(500, 500, SVG);

  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  noStroke();
  fill(sal);
  textSize(20);
  textAlign(CENTER,CENTER);
  rectMode(CENTER);

  slider = createSlider(3,6,4);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  
  createElement('label', get_name());

  button.mousePressed(resetinitial);
}

function draw() {
  background(sky);
  
  let val = slider.value();
  if ([3,4,6].includes(val)) {
    translate(width/2, height/2);
    rotate(radians(-20));
  }
  switch(val) {
    case 3:
      for (let i=-3; i<6; i++) {
        for (let j=-3; j<6; j++) {
          tile_3(i,j);
        }
      }
      break;
    case 4:
      for (let i=-3; i<6; i++) {
        for (let j=-3; j<6; j++) {
          tile_4(i,j);
        }
      }
      break;
    case 5:
      image(pent, -150,-150, width+300,height+300);

      // https://www.gorillasun.de/blog/working-with-svgs-in-p5js/
      let sw = 0.0;
      let fc = 'rgba(0,0,0,0)';
      if (checkbox.checked()) {
        sw = 0.2;
        fc = 'rgb(255,255,255)'
      }
      let paths = document.getElementsByTagName("polygon");
      for (let n = 0; n < paths.length; n++){
        paths[n].setAttribute('stroke-width', sw);
      }
      paths = document.getElementsByTagName("path");
      for (let n = 0; n < paths.length; n++){
        paths[n].setAttribute('stroke-width', sw);
      }
      texts = document.getElementsByClassName("st3");
      for (let n = 0; n < texts.length; n++){
        texts[n].setAttribute('fill', fc);
      }
      break;
    case 6:
      for (let i=-3; i<6; i++) {
        for (let j=-3; j<6; j++) {
          tile_6(i,j);
        }
      }
      break;
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
  noStroke();
  if (checkbox.checked()) stroke(0);
  fill(sky);
  if (i==0 && j==0) fill(sal);
  push();
  translate(i*300, j*200);
  if (abs(j%2)) {
    beginShape();
    vertex(0,100);
    vertex(150,-100);
    vertex(-150,-100);
    endShape(CLOSE);
    line(-150,100,150,100);
  } else {
    beginShape();
    vertex(0,-100);
    vertex(150,100);
    vertex(-150,100);
    endShape(CLOSE);
    line(-150,-100,150,-100);
  }
  if (checkbox.checked()) {
    fill(255);
    text(2*i+"/"+j, 0,0);
    text((2*i+1)+"/"+j, 150,0);
    text((2*i-1)+"/"+j, -150,0);
  }
  pop();
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