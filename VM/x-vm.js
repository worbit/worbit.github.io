let objects = [];
let img;
let mode = true;
let nx, ny, num;
let distlist = [];
let mx, mn;
let cnv;
let sf;
let shell = false;

function setup() {
    cnv = createCanvas(640,360);
    nx = 320;
    ny = 180;
    num = nx * ny;
    sf = 2.0;

    let b1 = createButton('display mode');
    b1.mousePressed(switchMode);
    let b2 = createButton('flip');
    b2.mousePressed(flipobjs);
    let b3 = createButton('add');
    b3.mousePressed(addobjs);
    let b4 = createButton('subtract');
    b4.mousePressed(subobjs);
    let b5 = createButton('intersect');
    b5.mousePressed(intobjs);
    let b6 = createButton('smooth');
    b6.mousePressed(smoothadd);
    let b7 = createButton('shell');
    b7.mousePressed(toggleshell);

    objects.push(new Circ(120,60,55));
    objects.push(new Rect(180,120,130,80));

    img = createImage(nx,ny);
    calcDists();
    calcImage();
}

function draw() {
    background(img);
}

var obj = null;
function mousePressed() {
    if (!obj) {
        for (var j = 0; j < objects.length; j++) {
        ct = objects[j];
        if (ct.getDist(mouseX / sf, mouseY / sf) < 0) {
            obj = ct;
            break;
        }
        }
    }
}

function mouseDragged() {
    if (obj) {
        obj.px = mouseX / sf;
        obj.py = mouseY / sf;
        calcDists();
        calcImage();
    }
}

function mouseReleased() {
    obj = null;
}

function calcDists() {
    for (i = 0; i < num; i++) {
        distlist[i] = 9999.9;
    }
    var x, y, d, dl;
    ct = objects[0];
    for (i = 0; i < num; i++) {
        x = i % nx;
        y = floor(i / nx);
        d = ct.getDist(x, y);
        dl = distlist[i];
        distlist[i] = min(distlist[i], d);
    }
    ct = objects[1];
    for (i = 0; i < num; i++) {
        x = i % nx;
        y = floor(i / nx);
        d = ct.getDist(x, y);
        dl = distlist[i];
        switch (ct.mode) {
        case 0:
            distlist[i] = min(distlist[i], d);
            break;
        case 1:
            distlist[i] = max(distlist[i], -d);
            break;
        case 2:
            distlist[i] = max(distlist[i], d);
            break;
        case 3:
            var k = 0.1;
            var res = Math.exp(-k*dl) + Math.exp(-k*d);
            var ret = -Math.log(Math.max(0.0001,res)) / k;
            distlist[i] = ret;
            break;
        }
        if (shell)
        distlist[i] = abs(distlist[i])-4;
    }

    mx = max(distlist);
    mn = min(distlist);
}

function calcImage() {
    img.loadPixels();

    var f, col, dl;
    for (i = 0; i < num; i++) {
        x = i % nx;
        y = floor(i / nx);
        dl = distlist[i];

        if (mode) {
        var hc = min(abs(dl) * 100, 128);
        col = color(hc * 2, 127 + hc, 255);
        } else {

        if (dl < 0) {
            col = color(255, (1 - dl / mn) * 255, 127 + (1 - dl / mn) * 127);
        } else {
            col = color((1 - dl / mx) * 255, 127 + (1 - dl / mx) * 127, 255);
        }
        }
        img.set(x, y, col);
    }

    img.updatePixels();
}

function addobjs() {
    objects[0].mode = 0;
    objects[1].mode = 0;
    calcDists();
    calcImage();
}

function subobjs() {
    objects[0].mode = 0;
    objects[1].mode = 1;
    calcDists();
    calcImage();
}

function intobjs() {
    objects[1].mode = 2;
    calcDists();
    calcImage();
}

function smoothadd() {
    objects[1].mode = 3;
    calcDists();
    calcImage();
}

function flipobjs() {
    var temp = objects[0];
    temp.mode = objects[1].mode;
    objects[0] = objects[1];
    objects[1] = temp;
    objects[0].mode = 0;
    calcDists();
    calcImage();
}

function switchMode() {
    mode = !mode;
    calcImage();
}

function toggleshell() {
    shell = !shell;
    calcDists();
    calcImage();
}

var Circ = function(x, y, r) {
    this.rad = r;
    this.px = x;
    this.py = y;
    this.sub = false;
    this.mode = 0;

    this.getArea = function() {
        return this.rad * this.rad * 3.14159;
    }

    this.getDist = function(x, y) {
        return sqrt(sq(this.px - x) + sq(this.py - y)) - this.rad;
    }
}

var Rect = function(x, y, a, b) {
    this.px = x;
    this.py = y;
    this.sa = a;
    this.sb = b;
    this.sub = false;
    this.mode = 0;

    this.getArea = function() {
        return this.sa * this.sb;
    }

    this.getDist = function(x, y) {
        let r = 0;
        var dx = abs(this.px - x) - (this.sa / 2 - r);
        var dy = abs(this.py - y) - (this.sb / 2 - r);
        let inside = max(dx, dy) - r;
        dx = max(dx,0);
        dy = max(dy,0);
        if (inside + r > 0) {
            return sqrt(dx * dx + dy * dy) - r;
        } else {
            return inside;
        }
    }
}