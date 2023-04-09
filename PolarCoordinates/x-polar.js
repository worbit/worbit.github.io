let slider, checkbox, button;
let sky, sal;
let angles,radius;

function setup() {
  createCanvas(500, 500);
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  noStroke();
  fill(sal);
  textSize(16);

  radius = 180.278;
  let a = 13.690;
  let d1 = 112.620;
  let d2 = 67.380;
  angles = [a, a+d1, a+d1+d2, a+d1+d2+d1];

  slider = createSlider(-50,50,0);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);

  let loc = window.location.pathname;
  let elems = loc.split('/');
  let dir = elems[elems.length-2];
  createElement('label', dir);  
}

function draw() {
  background(sky);
  translate(width/2,height/2);
  let val = slider.value();
  beginShape();
  for (let i=0; i<angles.length; i++) {
    let a = angles[i];
    let r = radius;
    if (i==1) r = r+val;
    let px = r * cos(radians(a));
    let py = r * sin(radians(a));
    vertex(px,py);
  }
  endShape(CLOSE);

  if (checkbox.checked()) {
    //debug view
    let d = 15;
    stroke(0);
    noFill();
    ellipse(0,0,200,200);
    ellipse(0,0,400,400);
    fill(255);
    for (let i=0; i<angles.length; i++) {
      let a = angles[i];
      let r = radius;
      if (i==1) r = r+val;
      let px = r * cos(radians(a));
      let py = r * sin(radians(a));
      line(0,0,px,py);
      ellipse(px,py, d,d);
      text(round(r)+" / "+round(a),px+d,py);
    }
    noStroke();
    fill(sal);
  }
}

function resetinitial() {
  slider.value(0);
}