// https://dornob.com/diy-tile-design-rotate-to-create-your-own-custom-patterns/

const w = 365;
const h = 243.3333;

const seq = ['h0', 'v1', 'v0', 'h1'];
const si = [0,2,3,1,2,0,1,3];
let slider, checkbox, button, randomize;
let ny = 8;
let nx = 4;

function setup() {
  createCanvas(500, 500);

  let dir = get_name();
  createA("https://worbit.github.io/"+dir+"/", '&rarr; ', '_top');
  slider = createSlider(0.35,1.5,1.0,0.01);
  checkbox = createCheckbox('info', false);
  randomize = createCheckbox('rnd', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  createElement('label', dir);

  noStroke();
  
  textAlign(CENTER, CENTER);
  textSize(24);
}

function draw() {
  background(220);
  translate(250,250);
  rotate(-PI/9)
  scale(slider.value());
  randomSeed(minute());
  
  let item = 0;
  let ix = 0;
  let off = 4;
  for (let j=-ny; j<ny; j++) {
    ix = si[(j+ny)%8];
    for (let i=-nx; i<nx; i++) {
      let s = ((j+ny)%2) * w/2;
      //draw_h_tile(i*w + s, j*h/2, 0);
      let tile = seq[ix%4];
      if (randomize.checked()) {
        let r = floor(random(4));
        tile = seq[r];
      }
      draw_tile((i+1)*w + s, j*h/2 + h/2, tile);
      ix++;
      item++;
    }
  }
}

function draw_tile(x,y,ide) {
  let t = ide[0];
  let o = int(ide[1]);
  switch(t) {
    case 'v':
      draw_v_tile(x,y,o);
      break;
    case 'h':
      draw_h_tile(x,y,o);
      break;
  }
  //print(t +": " + (o-1));
}

function draw_v_tile(x,y,i) {
  push();
  translate(x,y);
  rotate(i*PI);
  
  noStroke();
  fill('skyblue');
  one_tile()
  
  fill('salmon');
  beginShape();
  vertex(-w/2, 0);
  vertex(-w/2+150, 100);
  vertex(-w/2+150, -100);
  endShape(CLOSE);
  
  if (checkbox.checked()) {
    stroke(0);
    noFill();
    one_tile();
    fill(255);
    text("VER",0,0);
  }
  pop();
}

function draw_h_tile(x,y,i) {
  push();
  translate(x,y);
  rotate(i*PI)
  
  fill('skyblue');
  one_tile()
  
  fill('salmon');
  beginShape();
  vertex(-150, h/2-100);
  vertex(0, h/2);
  vertex(150, h/2-100);
  endShape(CLOSE);
  
  if (checkbox.checked()) {
    stroke(0);
    noFill();
    one_tile();
    fill(255);
    text("HOR",0,0);
  }
  pop();
}

function one_tile() {
  beginShape();
  vertex(-w/2, 0);
  vertex(0, h/2);
  vertex(w/2, 0);
  vertex(0, -h/2);
  endShape(CLOSE);
}

function resetinitial() {
  slider.value(1.0);
}

function get_name() {
  let loc = window.location.pathname;
  let elems = loc.split('/');
  let dir = elems[elems.length-2];
  return dir;
}