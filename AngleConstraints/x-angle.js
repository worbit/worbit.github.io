let slider, checkbox;
let sky, sal;
let rot;
function setup() {
  createCanvas(500, 500);
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  fill(sal);
  noStroke();
  textSize(16);
  slider = createSlider(-30,30,0);
  checkbox = createCheckbox('info', false);
  rot = 340.0/360.0*TWO_PI;
}

function draw() {
  background(sky);
  let di = slider.value()/100.0;
  let a = PI/2 + di;
  
  // remaining angle
  let ra = TWO_PI - (3*a);
  
  beginShape();
  let x = 74.844;
  let y = 207.334;

  let as = createVector(x,y);
  let ad = createVector(cos(rot+ra),sin(rot+ra));
  ad.normalize();
  let bs,bd;
  for (let i=0; i<3; i++) {
    vertex(x,y);
    var rad = 300 - (i%2)*100;
    bd = createVector(rad * cos(rot + i*(PI-a)), rad * sin(rot + i*(PI-a)));
    bs = createVector(x,y);
    x += bd.x;
    y += bd.y;
    bd.normalize();
  }
  // calculate intersection with this angle through p0
  let p;
  dx = bs.x - as.x;
  dy = bs.y - as.y;
  det = bd.x * ad.y - bd.y * ad.x;
  if (det==0) p = createVector(0,0);
  u = (dy * bd.x - dx * bd.y) / det;
  v = (dy * ad.x - dx * ad.y) / det;
  p = createVector(as.x + ad.x*u, as.y + ad.y*u);
  vertex(p.x,p.y);

  endShape(CLOSE);
  
  // debug view
  if (checkbox.checked()) {
    stroke(0);
    fill(255);
    
    x = 74.844;
    y = 207.334;
    for (let i=0; i<3; i++) {
      var rad = 300 - (i%2)*100;
      x += rad * cos(rot + i*(PI-a));
      y += rad * sin(rot + i*(PI-a));
      if (i==2) {
        x = p.x;
        y = p.y;
      }
      arc(x,y,40,40,rot + (i+1)*(PI-a),rot + (i+1)*(PI-a) + a);
      text(round(a/PI*180)+'°', x,y);
    }
    noStroke();
    fill(sal);
  }
}