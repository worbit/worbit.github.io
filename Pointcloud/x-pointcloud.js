let slider, checkbox, button;
let sky, sal;
let pts, cen;

function setup() {
  createCanvas(500, 500);
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  noStroke();
  fill(sal);
  textSize(16);

  cen = createVector(250,250);

  let p1 = createVector(74.844,207.334);
  let p2 = createVector(356.752,104.728);
  let p3 = createVector(425.156,292.666);
  let p4 = createVector(143.248,395.272);

  pts = [];
  pts.push(p1);
  let pt = p5.Vector.sub(p2, p1);
  for (let i=1; i<15; i++) {
    let v = p5.Vector.mult(pt, i/15.0);
    let p = p5.Vector.add(p1, v);
    pts.push(p);
  }
  pts.push(p2);
  pt = p5.Vector.sub(p3, p2);
  for (let i=1; i<10; i++) {
    let v = p5.Vector.mult(pt, i/10.0);
    let p = p5.Vector.add(p2, v);
    pts.push(p);
  }
  pts.push(p3);
  pt = p5.Vector.sub(p4, p3);
  for (let i=1; i<15; i++) {
    let v = p5.Vector.mult(pt, i/15.0);
    let p = p5.Vector.add(p3, v);
    pts.push(p);
  }
  pts.push(p4);
  pt = p5.Vector.sub(p1, p4);
  for (let i=1; i<10; i++) {
    let v = p5.Vector.mult(pt, i/10.0);
    let p = p5.Vector.add(p4, v);
    pts.push(p);
  }
  console.log(pts.length);

  slider = createSlider(-50,50,0);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);

  createElement('label', get_name());  
}

function draw() {
  background(sky);
  
  let val = slider.value();
  let ptsdef = []
  for (let i=0; i<pts.length; i++) {
    let dir = p5.Vector.sub(pts[i], cen);
    dir.normalize();
    dir.mult(val * (noise(i/5.0)-0.5));
    ptsdef.push(p5.Vector.add(pts[i], dir));
  }

  beginShape();
  for (let p of ptsdef) {
    vertex(p.x,p.y);
  }
  endShape(CLOSE);

  if (checkbox.checked()) {
    //debug view
    let d = 8;
    stroke(0);
    fill(255);
    for (let i=0; i<pts.length; i++) {
      let po = pts[i];
      let pd = ptsdef[i];
      // ellipse(po.x,po.y, d,d);
      ellipse(pd.x,pd.y, d,d);
      line(po.x,po.y,pd.x,pd.y);
    }
    
    noStroke();
    fill(sal);
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