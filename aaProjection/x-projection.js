let sal, sky;
let slider, checkbox, button;
let pts;

function setup() {
    createCanvas(500, 500);
    sky = color(135, 206, 235);
    sal = color(250, 128, 114);
    fill(sal);
    noStroke();

    pts = [];
    pts.push(createVector(74.844,207.334));
    pts.push(createVector(356.752,104.728));
    pts.push(createVector(425.156,292.666));
    pts.push(createVector(143.248,395.272));
  
    slider = createSlider(0,360,0);
    checkbox = createCheckbox('info', false);
    createElement('label', get_name());
  }

function draw() {
    background(sky);

    beginShape();
    for (let p of pts) {
      vertex(p.x,p.y);
    }
    endShape(CLOSE);
  
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