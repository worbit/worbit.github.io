let slider, checkbox, button;
let val;
let tree;

function setup() {
  createCanvas(500, 500);

  let dir = get_name();
  createA("https://worbit.github.io/"+dir+"/", '&rarr; ', '_top');
  slider = createSlider(3,10,10);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  createElement('label', dir);

  // create a ? with tooltip describing the pattern
  let d = createDiv('&nbsp;&nbsp;?');
  d.class('tooltip');
  let tt = createSpan('Aggregation: The base language is a signed distance function (SDF) (see DistanceFunction), but instead of sampling space in a uniform, dense grid (raster), the function is evaluated sparsely with a quadtree. Squares are recursively subdivided into four smaller squares if the absolute distance value d at the center is smaller than half the square’s diagonal, meaning the form’s boundary passes through the respective square.<br>a) The parameter controls the level of recursions, with lower numbers resulting in a coarse approximation, and higher numbers in a more accurate definition of the form with smaller leaf nodes.<br>b) The assembly of a big form from small discrete elements is the core and essence of most architecture, from simple brick walls to highly elaborate mosaics. Unlike with Tiles, this aggregation type uses differently sized elements and thereby allows for an adaptive resolution [26]. Concepts like recursion and hierarchical data structure are also fundamental in computer science, and quadtree subdivision for rendering (z-buffer) is one of the oldest algorithms in computer graphics [27].<br>c) Empty, Field, Approximation');
  tt.class('tooltiptext');
  tt.parent(d);

  fill('salmon');
  noStroke();
  rectMode(CENTER);
  textSize(20);
  textAlign(CENTER,CENTER);

  tree = new QuadTree(0,0, 500);
}

function draw() {
  val = slider.value();
  translate(width/2, height/2);
  // background('skyblue');
  tree.set_level(val);
  tree.divide(tree.root);
  tree.display();
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
      fill('salmon');
      // if (l.dist < 0) {
      //   ellipse(l.x, l.y, l.edge);
      // }
      if (l.dist > 0) fill('skyblue');
      rect(l.x, l.y, l.edge, l.edge);
      if (checkbox.checked() && l.level<6) {
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



// function calcImage() {
//   img.loadPixels();
//   val = slider.value();
  
//   for (let i = 0; i < img.width; i++) {
//     for (let j = 0; j < img.height; j++) {
//       let px = (i-125)*2;
//       let py = (j-125)*2;
//       let rp = rotate_c(0,0,px,py,-20);
//       let d = rectDist(rp[0],rp[1]);
//       let dof = d + val;
//       // debug view
//       if (checkbox.checked()) {
//         let f = abs(sin(d/8));
//         if (dof > 0)
//           img.set(i,j, color(135*f, 206*f, 235*f));
//         else
//           img.set(i,j, color(250*f, 128*f, 114*f));
//       } else {
//         if (dof > 0)
//           img.set(i, j, sky);
//         else
//           img.set(i, j, sal);
//       }
//     }
//   }
//   img.updatePixels();
// }

function resetinitial() {
  slider.value(50);
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