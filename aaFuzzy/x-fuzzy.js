let slider, checkbox, button;
let sky,sal;
let img;

function setup() {
  createCanvas(500, 500, P2D);
  
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  img = createGraphics(250,250);
  img.background(sky);
  img.fill(sal);
  img.noStroke();
  img.translate(125,125);
  img.rotate(radians(-20));
  img.rectMode(CENTER);
  img.rect(0,0,150,100);
  
  slider = createSlider(0,100,0);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);

  createElement('label', get_name());
}

function draw() {
  image(img, 0, 0, width, height);
  filter(BLUR, slider.value(), true);
}

function resetinitial() {
  slider.value(0);
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