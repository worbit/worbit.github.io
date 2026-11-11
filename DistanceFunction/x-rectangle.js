let slider, checkbox, button;
let sky, sal;
let img;
let val;
function setup() {
  createCanvas(500, 500);
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);

  let dir = get_name();
  // create a ? with tooltip describing the pattern
  let d = createDiv('&nbsp;&nbsp;?');
  d.class('tooltip');
  let tt = createSpan('DistanceFunction: In the history of computer graphics, alternative methods to the most widespread BReps have always existed [30], sometimes referred to as function representation FRep [31], implicit or volumetric modeling [21, 23]. Instead of placing points in the void, they describe space as a scalar field, mainly as the result of signed distance functions (SDF) of the form d = f(x,y,z), where d is the distance of point (x,y,z) to the object described by f with negative values being inside, positive values outside and the value 0 on the boundary of the object(s).<br>a) The parameter p is added (p > 0) to or subtracted (p < 0) from the result of the SDF, eroding or dilating the form respectively by shifting the iso-level 0. If p is negative, the offset form naturally has rounded corners – something difficult to achieve with other languages.<br>b) SDFs provide a very flexible and robust modeling experience with applications in architecture, design, medical or aerospace engineering [32], 3D-printing, and microstructure design [24]. They allow for smooth combinations, a compact and resolution-agnostic representation and effortless CSG operations, as forms are computed rather than constructed. Besides the creation of geometry, SDFs can serve as effective encoding for machine learning applications [33, 34] or collision control for robotics [35].<br>c) Field, Fluid Topology, 3D');
  tt.class('tooltiptext');
  tt.parent(d);

  createA("https://worbit.github.io/"+dir+"/", '&rarr; ', '_top');
  slider = createSlider(0,100,50);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);

  createElement('label', dir);  

  img = createImage(250,250);
}

function draw() {
  calcImage();
  image(img,0,0,width,height);
}

function rectDist(x,y) {
  //return max(abs(x)-val/2,abs(y)-200/2);
  let r = 50;
  let dx = abs(x) - (200 - r);
  let dy = abs(y) - (150 - r);
  let inside = max(dx, dy) - r;
  dx = max(dx, 0);
  dy = max(dy, 0);
  if (inside + r > 0) {
    return sqrt(dx * dx + dy * dy) - r;
  } else {
    return inside;
  }
}

function rotate_c(cx, cy, x, y, angle) {
    var radians = (PI / 180) * angle,
        cosa = cos(radians),
        sina = sin(radians),
        nx = (cosa * (x - cx)) + (sina * (y - cy)) + cx,
        ny = (cosa * (y - cy)) - (sina * (x - cx)) + cy;
    return [nx, ny];
}

function calcImage() {
  img.loadPixels();
  val = slider.value();
  
  for (let i = 0; i < img.width; i++) {
    for (let j = 0; j < img.height; j++) {
      let px = (i-125)*2;
      let py = (j-125)*2;
      let rp = rotate_c(0,0,px,py,-20);
      let d = rectDist(rp[0],rp[1]);
      let dof = d + val;
      // debug view
      if (checkbox.checked()) {
        let f = abs(sin(d/8));
        if (dof > 0)
          img.set(i,j, color(135*f, 206*f, 235*f));
        else
          img.set(i,j, color(250*f, 128*f, 114*f));
      } else {
        if (dof > 0)
          img.set(i, j, sky);
        else
          img.set(i, j, sal);
      }
    }
  }
  img.updatePixels();
}

function resetinitial() {
  slider.value(50);
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