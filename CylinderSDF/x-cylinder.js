let slider, checkbox;
let sky, sal;
let matrix;
let img;
function setup() {
  createCanvas(500, 500, WEBGL);
  //ortho();
  noStroke();
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);

  slider = createSlider(-31,31,0);
  checkbox = createCheckbox('info', false);
  img = createImage(250,250);
}

function draw() {
  // debug view
  if (checkbox.checked()) {
    push();
    directionalLight(255, 255, 255,1,1,-2);
    ambientLight(70);
    fill(sky);
    plane(500,500);
    fill(250, 128, 114, 100);
    rotateZ(7*PI/18);
    rotateX(slider.value()/20.0);
    cylinder(100,300, 32,1);
    pop();
  } else {
    background(200);
    calcImage();
    texture(img);
    textureMode(NORMAL);
    plane(500,500);
  }
}

function matrixMult(p,m) {
  var rx = p.x*m[0][0]+p.y*m[1][0]+p.z*m[2][0];
  var ry = p.x*m[0][1]+p.y*m[1][1]+p.z*m[2][1];
  var rz = p.x*m[0][2]+p.y*m[1][2]+p.z*m[2][2];
  return {x:rx,y:ry,z:rz};
}

function cylinderDist(p) {
  var dxy = sqrt(p.x*p.x + p.y*p.y) - 100;
  var dh = abs(p.z) - 150;
  var v = {x:dxy, y:dh};
  var vx = {x:max(v.x,0),y:max(v.y,0)};
  var d = min(max(v.x,v.y),0) + sqrt(vx.x*vx.x +vx.y*vx.y);
  return d;
}

function rotate_c(cx, cy, x, y, angle) {
    var radians = (PI / 180) * angle,
        cosa = cos(radians),
        sina = sin(radians),
        nx = (cosa * (x - cx)) + (sina * (y - cy)) + cx,
        ny = (cosa * (y - cy)) - (sina * (x - cx)) + cy;
    return {x:nx,y:ny,z:0};
}

function calcImage() {
  img.loadPixels();
  val = slider.value();
  var a = PI/2 + val/20.0;
  matrix = [[cos(a),0,sin(a)],[0,1,0],[-sin(a),0,cos(a)]];
  for (let i = 0; i < img.width; i++) {
    for (let j = 0; j < img.height; j++) {
      var px = (i-125)*2;
      var py = (j-125)*2;
      var rp = rotate_c(0,0,px,py,-20);
      var rp = matrixMult(rp,matrix);
      var d = cylinderDist(rp);
      // debug view
      // if (checkbox.checked()) {
      //   img.set(i,j, color(255-abs(d)));
      // } else {
      if (d>0)
        img.set(i, j, sky);
      else
        img.set(i, j, sal);
      // }
    }
  }
  img.updatePixels();
}