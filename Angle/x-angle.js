let slider, checkbox, button, desc;
let rot;
function setup() {
  createCanvas(500, 500);
  fill('salmon');
  noStroke();
  textSize(20);

  // create a ? with tooltip describing the pattern
  let d = createDiv('&nbsp;&nbsp;?');
  d.class('tooltip');
  let tt = createSpan('Angle: This is, strictly speaking, the only real rectangle in the collection, as it is defined by constraining the interior angle α at three corners (the fourth being 2π-3α), along with two edge lengths a and b. A form with only right angles having four corners is true only in the Euclidean plane. On a sphere, such an object can have three corners and more than four corners on a hyperbolic surface.<br>a) Modifying the angle α turns the form into an arbitrary quadrilateral, with the fourth angle and lengths c and d calculated to close the shape.<br>b) The ability to construct precise angles or regular subdivisions of the full circle with a compass and ruler is a fundamental and foundational principle of all geometry. The “right” angle (90°, or π/2) has a particularly prominent position, is the subject of Euclid’s Elements’ 4th postulate, and is inseparably linked to human – especially “man” [28] – made structures, distinguishes the artificial from the natural and is important for civilization and industrialization.<br>c) Empty, Typology');
  tt.class('tooltiptext');
  tt.parent(d);

  let dir = get_name();
  createA("https://worbit.github.io/"+dir+"/", '&rarr; ', '_top');
  slider = createSlider(-30,30,0);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  let lab = createElement('label', dir);

  // desc = createButton('desc');
  // desc.mousePressed(toggleDesc);

  // slider.parent('gui');
  // checkbox.parent('gui');
  // button.parent('gui');
  // // desc.parent('gui');
  // lab.parent('gui');

  rot = radians(-20);//340.0/360.0*TWO_PI;
}

function draw() {
  background('skyblue');
  let di = slider.value()/100.0;
  let a = PI/2 + di;
  
  // remaining angle
  let ra = TWO_PI - (3*a);
  
  let x = 74.844;
  let y = 207.334;
  
  let as = createVector(x,y);
  let ad = createVector(cos(rot+ra),sin(rot+ra));
  ad.normalize();
  let bs,bd;
  
  beginShape();
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
      let nx = x + rad * cos(rot + i*(PI-a));
      let ny = y + rad * sin(rot + i*(PI-a));
      if (i<2) {
        line(x,y,nx,ny);
        text(rad, (x+nx)/2, (y+ny)/2);
      }
      if (i==2) {
        nx = p.x;
        ny = p.y;
      }
      arc(nx, ny, 40, 40, rot + (i+1)*(PI-a),rot + (i+1)*(PI-a) + a);
      text(round(a/PI*180)+'°', nx,ny);
      x = nx;
      y = ny;
    }
    ellipse(74.844,207.334,10,10);
    noStroke();
    fill('salmon');
  }
}

function resetinitial() {
  slider.value(0);
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
      save_pic();
  }
  if (key === 'g') {
    save_gif(5);
  }
}

function save_pic() {
  let n = get_name();
  let c = str(checkbox.checked());
  let v = str(slider.value());
  save(n+'_'+c+'_'+v+'.png');
}

function save_gif(d) {
  let n = get_name();
  let c = str(checkbox.checked());
  let v = str(slider.value());
  saveGif(n+'_'+c+'_'+v, d);
}

function get_name() {
  let loc = window.location.pathname;
  let elems = loc.split('/');
  let dir = elems[elems.length-2];
  return dir;
}

function toggleDesc() {
  var x = document.getElementById("description");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}