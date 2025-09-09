let cen, w1, w2, s1, s2, d1, d2;
let slider, checkbox;

function setup() {
  createCanvas(500, 500);
  // fill('salmon');
  //noStroke();

  let dir = get_name();
  createA("https://worbit.github.io/" + dir + "/", '&rarr; ', '_top');
  slider = createSlider(0, 300, 0);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  createElement('label', dir);
}

function draw() {
  background('skyblue');
  val = slider.value();

  translate(250, 250);
  rotate(-PI / 9);
  if (checkbox.checked()) {
    stroke(0);
    fill(200, 100);
    arc(-150, -100, 750, 750, 0, HALF_PI, PIE);
    translate(-50, 0);
    rotate(val / 100.0);
    arc(200, 100, 730, 730, PI, -HALF_PI, PIE);
    noStroke();
  } else {
    push();
    noStroke();
    fill('salmon');
    beginClip();
    arc(-150, -100, 750, 750, 0, HALF_PI, PIE);
    endClip();
    translate(-50, 0);
    rotate(val / 100.0);
    arc(200, 100, 730, 730, PI, -HALF_PI, PIE);
    pop();
    // rect(-250, -250, 500, 500);
  }
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
  save(n + '_' + c + '_' + v + '.png');
}

function get_name() {
  let loc = window.location.pathname;
  let elems = loc.split('/');
  let dir = elems[elems.length - 2];
  return dir;
}

function resetinitial() {
  slider.value(0);
}