let cen, w1, w2, s1,s2, d1, d2;
let slider, checkbox;

function setup() {
  createCanvas(500, 500);
  noStroke();
  textSize(20);

  slider = createSlider(0,40,20);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);

  createElement('label', get_name());
  
  cen = createVector(250,250);
  w1 = createVector(150,0);
  w2 = createVector(0,100);
  
  let st = rotate_c(0,0, w1.x, w1.y, 20);
  s1 = createVector(st[0], st[1]);
  st = rotate_c(0,0, w2.x, w2.y, 20);
  s2 = createVector(st[0], st[1]);
  d1 = createVector(s1.y, -s1.x);
  d2 = createVector(s2.y, -s2.x);
}

function draw() {
  background('skyblue');
  val = slider.value();
  
  let st = rotate_c(0,0, w1.x, w1.y, val);
  s1 = createVector(st[0], st[1]);
  d1 = createVector(s1.y, -s1.x);
  
  let i1 = line_line_intersection(p5.Vector.add(cen,s1), d1, p5.Vector.add(cen,s2), d2);
  let i2 = line_line_intersection(p5.Vector.sub(cen,s1), d1, p5.Vector.add(cen,s2), d2);
  let i3 = line_line_intersection(p5.Vector.add(cen,s1), d1, p5.Vector.sub(cen,s2), d2);
  let i4 = line_line_intersection(p5.Vector.sub(cen,s1), d1, p5.Vector.sub(cen,s2), d2);

  if (checkbox.checked()) {
    rectMode(CENTER);
    fill(100,128);
    translate(250,250);

    push();
    rotate(-1/9*PI);
    rect(0,0,1000,200);
    stroke(0);
    line(0,-100,0,100);
    line(0,-100,10,-90);
    line(0,-100,-10,-90);
    line(0,100,10,90);
    line(0,100,-10,90);
    noStroke();
    fill(255);
    text('200', 10,70);
    pop();

    push();
    rotate((-val/180)*PI);
    rect(0,0,300,1000);
    stroke(0);
    line(-150,0,150,0);
    line(-150,0,-140,10);
    line(-150,0,-140,-10);
    line(150,0,140,10);
    line(150,0,140,-10);
    fill(255);
    text('300', 90,25);
    pop();
  } else {
    fill('salmon');
    beginShape();
    vertex(i1[0], i1[1]);
    vertex(i2[0], i2[1]);
    vertex(i4[0], i4[1]);
    vertex(i3[0], i3[1]);
    endShape(CLOSE);
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

// sa,sb = support points
// da,db = direction vectors
function line_line_intersection(sa, da, sb, db) {
  let x1 = sa.x;
  let y1 = sa.y;
  let x2 = sa.x + da.x;
  let y2 = sa.y + da.y;
  let x3 = sb.x;
  let y3 = sb.y;
  let x4 = sb.x + db.x;
  let y4 = sb.y + db.y;
  let t = ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) / ((x1-x2)*(y3-y4) - (y1-y2)*(x3-x4));
  return [x1+t*(x2-x1), y1+t*(y2-y1)];
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

function resetinitial() {
  slider.value(20);
}
