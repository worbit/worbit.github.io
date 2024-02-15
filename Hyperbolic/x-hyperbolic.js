let m1, m2, txt;
let verts;
let sky, sal;
let slider, checkbox, button;
let cam;

function preload() {
    m1 = loadModel('inside.obj');
    m2 = loadModel('outside.obj');
    txt = loadStrings('curvepoints.txt');
}

function setup() {
    createCanvas(500, 500, WEBGL);
    cam = createCamera();
    cam.ortho(-width / 2, width / 2, height / 2, -height / 2, 0, 500);
    sky = color(135, 206, 235);
    sal = color(250, 128, 114);
    noStroke();
    slider = createSlider(-50, 50, 0);
    checkbox = createCheckbox('info', false);
    button = createButton('reset');
    button.mousePressed(resetinitial);

    createElement('label', get_name());

    verts = [];
    for (let i=0; i<txt.length; i++) {
      let t = txt[i];
      let coords = t.split(',');
      verts.push(createVector(float(coords[0]), float(coords[1]),float(coords[2])));
    }
}

function draw() {
    let v = slider.value();
    let a = v/100.0 * PI;
    push();
    translate(0,0,100);
    rotateX(a);
    background(sky);
    if (checkbox.checked()) {
        stroke(220);
        // directionalLight(color(255), createVector(1.0,1.0,-1.0));
    } else {
        noStroke();
    }
    fill(sal);
    model(m1);
    fill(sky);
    model(m2);

    if (checkbox.checked()) {
      stroke(0);
      strokeWeight(3);
      beginShape();
      for (let v of verts) {
        vertex(v.x, v.y, v.z);
      }
      endShape();
      noStroke();
    }
    pop();

}

function rotatePointAroundXAxis(p, a) {
  let matrix = [[1,0,0],[0,cos(a),-sin(a)],[0,sin(a),cos(a)]];
  return matrixMult(p, matrix);
}

function matrixMult(p,m) {
  var rx = p.x*m[0][0]+p.y*m[1][0]+p.z*m[2][0];
  var ry = p.x*m[0][1]+p.y*m[1][1]+p.z*m[2][1];
  var rz = p.x*m[0][2]+p.y*m[1][2]+p.z*m[2][2];
  return {x:rx,y:ry,z:rz};
}

function sgn(a) {
  if (a<0) {
    return -1;
  } else if (a>0) {
    return 1;
  } else {
    return 0;
  }
}

function polar(x,y,z, r) {
  return Math.acos(z/r);
}

function azimuth(x,y,z, xy) {
  if (x==0) {
    if (y>0) {
      return Math.PI/2.0;
    } else {
      return -Math.PI/2.0;
    }
  }
  return sgn(y) * Math.acos(x / xy);
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
  
  // written with the help of github copilot
  // https://stackoverflow.com/questions/11870910/proper-spherical-mapping-of-a-rectangular-texture
  function mercator(x,y,z) {
    let r = Math.sqrt(x**2 + y**2 + z**2);
    let lat = Math.asin(z/r);
    let lon = Math.atan2(y,x);
    return {lat:lat,lon:lon};
  }