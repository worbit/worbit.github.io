let slider, checkbox, button;
let p1, p2, v;

function setup() {
  createCanvas(500, 500);
  let dir = get_name();
  // create a ? with tooltip describing the pattern
  let d = createDiv('&nbsp;&nbsp;?');
  d.class('tooltip');
  let tt = createSpan('Offset: The form is considered a thick line, like a brush stroke, resulting from offsetting its medial axis (the spine) to either side by half the final width.<br>a) The parameter moves the positions of two of the control points on the spine polyline, thereby turning the form from straight to zig-zag.<br>b) Offsetting is not only a fundamental function in design (basically a form with a material thickness) but also a widespread architectural typology. The flexibility of the spine adapts to odd-shaped plot outlines, while the constant thickness guarantees sufficient daylight and ventilation.<br>c) Empty, Typology');
  tt.class('tooltiptext');
  tt.parent(d);

  createA("https://worbit.github.io/"+dir+"/", '&rarr; ', '_top');
  slider = createSlider(-50,50,0);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  createElement('label', dir);  
  
  strokeCap(SQUARE);
  strokeWeight(200);
  stroke('salmon');
  noFill();
  
  p1 = createVector(203.015, 267.101);
  p2 = createVector(296.985, 232.899);
  v = createVector(34.202, 93.969);
  v.normalize();
}

function draw() {
  background('skyblue');
  //bezier(109.046, 301.303, mouseX,mouseY,mouseX,mouseY,390.954, 198.697);
  let val = slider.value();
  beginShape();
  vertex(109.046, 301.303);
  vertex(p1.x+val*v.x, p1.y+val*v.y);
  vertex(p2.x-val*v.x, p2.y-val*v.y);
  vertex(390.954, 198.697);
  endShape();
  
  // debug view
  if (checkbox.checked()) {
    stroke(0);
    strokeWeight(1);
    
    beginShape();
    vertex(109.046, 301.303);
    vertex(p1.x+val*v.x, p1.y+val*v.y);
    vertex(p2.x-val*v.x, p2.y-val*v.y);
    vertex(390.954, 198.697);
    endShape();
    
    let d = 15;
    fill(255);
    ellipse(109.046, 301.303, d, d);
    ellipse(p1.x+val*v.x, p1.y+val*v.y, d,d);
    ellipse(p2.x-val*v.x, p2.y-val*v.y, d,d);
    ellipse(390.954, 198.697, d,d);
    
    stroke('salmon');
    strokeWeight(200);
    noFill();
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