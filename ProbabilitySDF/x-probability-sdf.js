let slider, checkbox, button;
let sky, sal;
let img;
let val;
let debug;
function setup() {
  createCanvas(500, 500);
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  slider = createSlider(0,100,0);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  debug = createP('');

  let loc = window.location.pathname;
  let elems = loc.split('/');
  let dir = elems[elems.length-2];
  createElement('label', dir);  

  img = createImage(250,250);
}

function draw() {
  calcImage();
  image(img,0,0,width,height);
}

function rectDist(x,y) {
  //return max(abs(x)-val/2,abs(y)-200/2);
  let r = 0;
  let dx = abs(x) - (150 - r);
  let dy = abs(y) - (100 - r);
  let inside = max(dx, dy) - r;
  dx = max(dx, 0);
  dy = max(dy, 0);
  if (inside + r > 0) {
    return sqrt(dx * dx + dy * dy) - r;
  } else {
    return inside;
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

function calcImage() {
  img.loadPixels();
  val = slider.value()/100.0;
  let influence = abs((val-0.5) * 2);
  debug.html(influence);

  randomSeed(658);
  
  for (let i = 0; i < img.width; i++) {
    for (let j = 0; j < img.height; j++) {
      let px = (i-125)*2;
      let py = (j-125)*2;
      let rp = rotate_c(0,0,px,py,-20);
      let d = rectDist(rp[0],rp[1]);
      let dice = random();
      // for val >= 0.5 correct, before wrong :/
      let r = influence * sqrt(abs(d)/200.0) + val > dice;
      let c1 = sal;
      let c2 = sky;
      if (!r) {
          c1 = sky;
          c2 = sal;
      }
      // debug view
      if (checkbox.checked()) {
        // let f = abs(sin(d/8));
        // if (d > 0)
        //   img.set(i,j, color(135*f, 206*f, 235*f));
        // else
        //   img.set(i,j, color(250*f, 128*f, 114*f));
      } else {
        if (d > 0)
          img.set(i, j, c1);
        else
          img.set(i, j, c2);
      }
    }
  }
  img.updatePixels();
}

function resetinitial() {
  slider.value(50);
}