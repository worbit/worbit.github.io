let m1, m2;
let sky, sal;
let slider, checkbox, button;
let cam;

function preload() {
    m1 = loadModel('rect.obj');
    m2 = loadModel('sphere.obj');
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
}

function draw() {
    let v = slider.value();
    rotateX(HALF_PI + v/100.0 * PI);
    background(sky);
    if (checkbox.checked()) {
        stroke(0);
        // directionalLight(color(255), createVector(1.0,1.0,-1.0));
    } else {
        noStroke();
    }
    fill(sal);
    model(m1);
    fill(sky);
    model(m2);
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