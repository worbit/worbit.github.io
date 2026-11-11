// Superellipse
// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/019-superellipse.html
// https://youtu.be/z86cx2A4_3E

let slider;
let sky, sal;
let a,b;
function setup() {
  createCanvas(500, 500);
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  let dir = get_name();
  // create a ? with tooltip describing the pattern
  let d = createDiv('&nbsp;&nbsp;?');
  d.class('tooltip');
  let tt = createSpan('Superellipse: This is an example of a class of purely mathematical descriptions, where the perceived form is the limit that the function (abcd) approaches asymptotically as the exponent n → ∞, but will never reach.<br>a) The modified parameter is the exponent n, where small numbers make the form bend inwards towards a cross shape, medium numbers result in ellipsoids of different roundness and as n gets very high, the “corners” of the form become sharper.<br>b) Superellipses, related but not identical to Squircles, are primarily theoretical constructs with few practical applications. However, there are two applications – a conference table and a public circulation space (avoiding the terms “roundabout” and “square”) – where a superellipse has the correct and continuously adjustable level of roundness as it blurs the binary distinction between a rectangle and an ellipse.<br>c) Empty, Approximation');
  tt.class('tooltiptext');
  tt.parent(d);

  createA("https://worbit.github.io/"+dir+"/", '&rarr; ', '_top');
  slider = createSlider(0.1, 50, 50, 0.1);
  checkbox = createCheckbox('info', false);
  
  createElement('label', dir);

  noStroke();
  fill(sal);
  a = 150;
  b = 100;
}

function draw() {
  background(sky);
  translate(width / 2, height / 2);
  rotate(-1/9*PI);

  let val = slider.value();
  let na = 1 / val;

  beginShape();
  for (let angle = 0; angle < TWO_PI; angle += 0.1) {
    // Simple ellipse
    // let x = r * cos(angle);
    // let y = r * sin(angle);

    // Superellipse
    let x = pow(abs(cos(angle)), na) * a * sgn(cos(angle));
    let y = pow(abs(sin(angle)), na) * b * sgn(sin(angle));
    vertex(x, y);
  }
  endShape(CLOSE);

  if (checkbox.checked()) {
    background(sky);
    noFill();
    stroke(0);

    for (let i=0; i<400; i++) {
      //stroke(i);
      let v = (i+0.1)**0.9;
      let na = 6/v;
      beginShape();
      for (let angle = 0; angle < TWO_PI; angle += 0.1) {
        let x = pow(abs(cos(angle)), na) * a * sgn(cos(angle));
        let y = pow(abs(sin(angle)), na) * b * sgn(sin(angle));
        vertex(x, y);
      }
      endShape(CLOSE);
    }

    noStroke();
    fill(sal);
  }
}

function sgn(val) {
  if (val == 0) {
    return 0;
  }
  return val / abs(val);
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