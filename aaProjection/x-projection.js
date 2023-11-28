let sal, sky;
let slider, checkbox, button;
let pts;
let lightsource, planenormal;

function setup() {
    createCanvas(500, 500);
    sky = color(135, 206, 235);
    sal = color(250, 128, 114);
    fill(sal);
    //noStroke();

    pts = [];
    // pts.push(createVector(74.844,207.334));
    // pts.push(createVector(356.752,104.728));
    // pts.push(createVector(425.156,292.666));
    // pts.push(createVector(143.248,395.272));

    pts.push(createVector(197.453228, 237.200128, 100));
    pts.push(createVector(282.025564, 206.418315, 100));
    pts.push(createVector(302.546772, 262.799872, 100));
    pts.push(createVector(217.974436, 293.581685, 100));

    lightsource = createVector(width/2, height/2, 142.857143);
    planenormal = createVector(width/2, height/2, 50);
  
    slider = createSlider(0,360,0);
    checkbox = createCheckbox('info', false);
    createElement('label', get_name());
    // noLoop();
  }

function draw() {
    background(sky);

    let svalue = slider.value();
    let a = radians(svalue - 180);
    planenormal.x = 50 + width/2  + 50 * cos(a);
    planenormal.y = height/2 + 50 * sin(a);
    planenormal.z = 250;
    let pn = p5.Vector.normalize(planenormal);
    let negls = p5.Vector.sub(createVector(width/2,height/2,0), lightsource);
    let inv = (negls.dot(pn));

    beginShape();
    for (let p of pts) {
        let linedir = p5.Vector.sub(p, lightsource);
        linedir.normalize();
        let d = inv / linedir.dot(pn);
        let pp = p5.Vector.add(lightsource, p5.Vector.mult(linedir, d));
        print(pp.z);
        vertex(pp.x,pp.y);
    }
    endShape(CLOSE);

    // beginShape();
    // for (let p of pts) {
    //   vertex(p.x,p.y);
    // }
    // endShape(CLOSE);

    if (checkbox.checked()) {
        push();
        fill(0);
        ellipse(width/2, height/2, 5,5);
        ellipse(planenormal.x, planenormal.y, 5,5);
        pop();
    }
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