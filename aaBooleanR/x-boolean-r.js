let cen, w1, w2, s1,s2, d1, d2;
let slider, checkbox;

function setup() {
  createCanvas(500, 500);
  fill('salmon');
  noStroke();

  slider = createSlider(50,250,150);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  createElement('label', get_name());
}

function draw() {
  background('skyblue');
  val = slider.value();

  // beginClip();
  // rect(30,30,300,300);
  // rect(200,200,300,300);
  // endClip();
  // ellipse(250,250,400);

  if (checkbox.checked()) {
    print('hello');
  } else {
    push();
    clip(mask);
    ellipse(200,0,400);
    pop();
  }
}

function mask() {
  rect(30,30,300,300);
  //rect(200,200,300,300);
}

function rotate_c(cx, cy, x, y, angle) {
  var radians = (PI / 180) * angle,
    cosa = cos(radians),
    sina = sin(radians),
    nx = (cosa * (x - cx)) + (sina * (y - cy)) + cx,
    ny = (cosa * (y - cy)) - (sina * (x - cx)) + cy;
  return [nx, ny];
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

function resetinitial() {
  slider.value(20);
}