let slider, checkbox, button;
let sky, sal;
let pts;

function setup() {
  createCanvas(windowWidth, 500);
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  noStroke();
  fill(sal);
  textSize(20);

  pts = [];
  pts.push(createVector(74.844,207.334));
  pts.push(createVector(356.752,104.728));
  pts.push(createVector(425.156,292.666));
  pts.push(createVector(143.248,395.272));

  slider = createSlider(50,500,395.272);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  
  createElement('label', get_name());

  button.mousePressed(resetinitial);
}

function windowResized() {
  resizeCanvas(windowWidth, 500);
}

function draw() {
  background(sky);
  
  let val = slider.value();
  pts[3].y = val;
  beginShape();
  
  for (let p of pts) {
    vertex(p.x,p.y);
  }
  endShape(CLOSE);

  if (checkbox.checked()) {
    //debug view
    let d = 15;
    push();
    stroke(0);
    fill(255);
    line(0,height/2,width,height/2);
    line(width/2,0,width/2,height);
    for (let p of pts) {
      setLineDash([7,7]);
      line(p.x,height/2,p.x,p.y);
      line(width/2,p.y,p.x,p.y);
      setLineDash([]);
      ellipse(p.x,p.y, d,d);
      let tx = round(p.x-250);
      let ty = round((500-p.y)-250);
      text("x: "+tx+"\ny: "+ty,p.x+d,p.y);
    }
    pop();
  }
}

function resetinitial() {
  slider.value(395.272);
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