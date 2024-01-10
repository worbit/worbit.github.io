let sal, sky;
let slider, checkbox, button;
let pts;
let lightsource, planenormal, planepoint;
let grid;

function setup() {
    createCanvas(500, 500);
    sky = color(135, 206, 235);
    sal = color(250, 128, 114);
    fill(sal);
    noStroke();

    pts = [];

    pts.push(createVector(197.453228, 237.200128, 100));
    pts.push(createVector(282.025564, 206.418315, 100));
    pts.push(createVector(302.546772, 262.799872, 100));
    pts.push(createVector(217.974436, 293.581685, 100));

    grid = [];
    for (let x=-200; x<201; x+=40) {
        for (let y=-200; y<201; y+=40) {
            grid.push(createVector(x,y,-143));
        }
    }

    lightsource = createVector(width/2, height/2, 142.857143);
    planenormal = createVector(0, 0, 250);
    planepoint = createVector(width/2, height/2, 0);
  
    slider = createSlider(0,360,0);
    checkbox = createCheckbox('info', false);
    button = createButton('reset');
    button.mousePressed(resetinitial);
  
    createElement('label', get_name());
    // noLoop();
  }

function draw() {
    background(sky);

    let svalue = slider.value();
    let a = radians(svalue - 180);
    planenormal.x = 50 + 50 * cos(a);
    planenormal.y = 50 * sin(a);
    planenormal.z = 250;
    // let pn = p5.Vector.normalize(planenormal);
    // let diff = p5.Vector.sub(planepoint, lightsource);
    // let prod1 = (diff.dot(pn));

    let ptsp = [];
    beginShape();
    for (let p of pts) {
        let linedir = p5.Vector.sub(p, lightsource);
        let pp = linePlaneIntersection(planepoint, planenormal, lightsource, linedir);
        // linedir.normalize();
        // let prod2 = linedir.dot(pn);
        // let prod3 = prod1 / prod2;
        // let pp = p5.Vector.sub(lightsource, p5.Vector.mult(linedir, prod3));
        vertex(pp.x,pp.y);
        ptsp.push(pp);
    }
    endShape(CLOSE);

    // beginShape();
    // for (let p of pts) {
    //   vertex(p.x,p.y);
    // }
    // endShape(CLOSE);

    if (checkbox.checked()) {
        push();
        stroke(255);
        for (let p of ptsp) {
            line(lightsource.x, lightsource.y, p.x, p.y);
        }
        noStroke();
        fill(0);
        for (let p of pts) {
            ellipse(p.x,p.y, 5,5);
        }
        for (let p of ptsp) {
            ellipse(p.x,p.y, 5,5);
        }
        stroke(0);
        line(width/2, height/2, width/2+planenormal.x, height/2+planenormal.y);
        noStroke();
        ellipse(width/2, height/2, 5,5);
        ellipse(width/2+planenormal.x, height/2+planenormal.y, 5,5);

        for (let d of grid) {
            let pp = linePlaneIntersection(planepoint, planenormal, lightsource, d);
            ellipse(pp.x,pp.y, 2,2);
        }
        pop();
    }
}

function linePlaneIntersection(plpt, plno, lipt, lidi) {
    let plnon = p5.Vector.normalize(plno);
    let diff = p5.Vector.sub(plpt, lipt);
    let prod1 = (diff.dot(plnon));
    lidi.normalize();
    let prod2 = lidi.dot(plnon);
    let prod3 = prod1 / prod2;
    let pp = p5.Vector.sub(lipt, p5.Vector.mult(lidi, prod3));
    return pp;
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