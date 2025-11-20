let slider, checkbox, button, play;
let sky, sal;
let val;
let tree;

let world;
let boundaries = [];
let boxes = [];
let falling;

function setup() {
  createCanvas(500, 500);
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  slider = createSlider(3,10,8);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  play = createButton('run');
  play.mousePressed(faaall);

  falling = false;

  let dir = get_name();
  createElement('label', dir);

  fill(sal);
  noStroke();
  rectMode(CENTER);
  textSize(12);
  textAlign(CENTER,CENTER);

  tree = new QuadTree(0,0, 500);

  world = createWorld();
  boundaries.push(new Boundary(width/2, height, width, 20));

  for (let i=0; i<10; i++) {
    let b = new Box(30+i*50,50, 30,30);
    boxes.push(b);
  }
}

function draw() {
  background(0);
  val = slider.value();
  push();
  translate(width/2, height/2);
  tree.set_level(val);
  tree.divide(tree.root);
  tree.display();
  pop();

  if (falling) {
    world.Step(0.03, 10, 10);
  }
  for (let i=0; i<boundaries.length; i++) {
    boundaries[i].display();
  }
  for (let i=0; i<boxes.length; i++) {
    boxes[i].display();
  }
}

class QuadTree {
  constructor(x,y, w) {
    this.world = w;
    this.maxlevels = 3;
    //this.pos = createVector(x,y);
    this.root = new QuadNode(x,y, w, 1);
    this.leaves = [];
  }

  set_level(n) {
    this.maxlevels = n;
  }

  divide(n) {
    let rp = rotate_c(0,0,n.x, n.y, -20);
    let d = rectDist(rp[0],rp[1]);

    n.dist = d;
    if (n.level < this.maxlevels) {
      if (abs(d) < n.edge/2 * sqrt(2)) {
        n.divide_node();
        for (let b of n.branches) {
          this.divide(b);
        }
      } else {
        this.leaves.push(n);
      }
    } else {
      this.leaves.push(n);
    }
  }

  display() {
    for (let l of this.leaves) {
      // draw box
      // push();
      // translate(l.x, l.y);
      noStroke();
      if (checkbox.checked()) stroke(0);
      fill(sal);
      if (l.dist > 0) fill(sky);
      rect(l.x, l.y, l.edge, l.edge);
      if (checkbox.checked() && l.level<7) {
        fill(255);
        text(l.level, l.x, l.y);
      }
      // pop();
    }
  }
}

class QuadNode {
  constructor(x,y, s, l) {
    this.x = x;
    this.y = y;
    this.dist = 0;
    this.edge = s;
    this.level = l;
    this.branches = null;
  }

  divide_node() {
    this.branches = [];
    let qs = this.edge/4.0;
    let nl = this.level + 1;
    this.branches.push(new QuadNode(this.x-qs, this.y-qs, qs*2, nl));
    this.branches.push(new QuadNode(this.x+qs, this.y-qs, qs*2, nl));
    this.branches.push(new QuadNode(this.x+qs, this.y+qs, qs*2, nl));
    this.branches.push(new QuadNode(this.x-qs, this.y+qs, qs*2, nl));
  }
}

function rectDist(x,y) {
  //return max(abs(x)-val/2,abs(y)-200/2);
  let r = 0;
  let dx = abs(x) - (150 - r);
  let dy = abs(y) - (100 - r);
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

function resetinitial() {
  slider.value(50);
}

function faaall() {
  falling = !falling;
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