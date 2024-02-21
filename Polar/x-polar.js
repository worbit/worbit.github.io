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

  createElement('label', get_name());  
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
    push();
    stroke(0);
    noFill();
    line(0,-height/2,0,height/2);
    line(-width/2,0,width/2,0);
    ellipse(0,0,200,200);
    ellipse(0,0,400,400);
    ellipse(0,0,600,600);
    fill(255);
    for (let i=0; i<angles.length; i++) {
      let a = angles[i];
      let r = radius;
      if (i==1) r = r+val;
      let px = r * cos(radians(a));
      let py = r * sin(radians(a));
      setLineDash([7,7]);
      line(0,0,px,py);
      setLineDash([]);
      ellipse(px,py, d,d);
      text("r: "+round(r)+", ɑ: "+round(a),px+d,py);
    }
    pop();
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

function setLineDash(list) {
  drawingContext.setLineDash(list);
}