let slider, checkbox, button;
let img, txt;
let d;

function preload() {
  img = loadImage('chatgpt.svg');
  txt = loadStrings('chatgpt.svg');
}

function setup() {
  createCanvas(500, 500);
  
  textFont('Andale Mono');
  textSize(11);
  d = 10;
  
  slider = createSlider(0,100,0);
  slider.elt.disabled = true;
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  button.elt.disabled = true;

  createElement('label', get_name());
}

function draw() {
  image(img, 0, 0, width, height);

  if (checkbox.checked()) {
    fill("#444653");
    noStroke();
    rect(d,d,500-2*d,500-2*d);
    fill("#d2d5da");
    for (let i=0; i<txt.length; i++) {
      let t = txt[i];
      text(t, d+2, 40+i*16);
    }
  }
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