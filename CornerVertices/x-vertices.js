let slider, checkbox;
let sky, sal;
function setup() {
  createCanvas(500, 500);
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  noStroke();
  fill(sal);
  textSize(16);

  pts = [];
  pts.push(createVector(74.844,207.334));
  pts.push(createVector(356.752,104.728));
  pts.push(createVector(425.156,292.666));
  pts.push(createVector(143.248,395.272));

  slider = createSlider(300,500,395.272);
  checkbox = createCheckbox('info', false);
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
    stroke(0);
    fill(255);
    for (let p of pts) {
      ellipse(p.x,p.y, d,d);
      text(round(p.x)+" / "+round(p.y),p.x+d,p.y);
    }
    noStroke();
    fill(sal);
  }
}