let slider, checkbox, button;
let sky, sal;
let angles,radius;

function setup() {
  createCanvas(500, 500);
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  noStroke();
  fill(sal);
  textSize(20);

  radius = 180.278;
  let a = 13.690;
  let d1 = 112.620;
  let d2 = 67.380;
  angles = [a, a+d1, a+d1+d2, a+d1+d2+d1];

  let dir = get_name();
  // create a ? with tooltip describing the pattern
  let d = createDiv('&nbsp;&nbsp;?');
  d.class('tooltip');
  let tt = createSpan('Polar: The form is also described as a quadrilateral with four corner points (like Point), but instead of x and y coordinates in a Cartesian coordinate system, they are encoded with radius r and angle α in a polar coordinate system.<br>a) The parameter modifies r (distance from the origin) of one of the points, thereby affecting both the visible x and y position, but not the angle α.<br>b) While switching to polar coordinates in a CAD environment would be easy to implement and very helpful for the planning of circular or arc-shaped buildings, they are relatively few. Polar coordinates are nevertheless important for planetary motion, rotational mechanics and the mathematics of complex numbers to name but a few.<br>c) Empty, Trigonometry');
  tt.class('tooltiptext');
  tt.parent(d);

  createA("https://worbit.github.io/"+dir+"/", '&rarr; ', '_top');
  slider = createSlider(-50,50,0);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);

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
      text("r: "+round(r)+"\nɑ: "+round(360-a),px+d,py);
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