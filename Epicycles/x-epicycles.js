let slider, checkbox, button;
let sky, sal;
let plist, cen, num;
let rlist, gears;
let res, da;

function setup() {
  createCanvas(500, 500);
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  noStroke();
  fill(sal);
  textSize(16);

  // cen = createVector(250,250);
  rlist = [];
  gears = [];
  res = 500;
  da = -1 * (TWO_PI / res);

  let p1 = createVector(74.844,207.334);
  let p2 = createVector(356.752,104.728);
  let p3 = createVector(425.156,292.666);
  let p4 = createVector(143.248,395.272);

  plist = [];
  plist.push(p1);
  let pt = p5.Vector.sub(p2, p1);
  for (let i=1; i<30; i++) {
    let v = p5.Vector.mult(pt, i/30.0);
    let p = p5.Vector.add(p1, v);
    plist.push(p);
  }
  plist.push(p2);
  pt = p5.Vector.sub(p3, p2);
  for (let i=1; i<20; i++) {
    let v = p5.Vector.mult(pt, i/20.0);
    let p = p5.Vector.add(p2, v);
    plist.push(p);
  }
  plist.push(p3);
  pt = p5.Vector.sub(p4, p3);
  for (let i=1; i<30; i++) {
    let v = p5.Vector.mult(pt, i/30.0);
    let p = p5.Vector.add(p3, v);
    plist.push(p);
  }
  plist.push(p4);
  pt = p5.Vector.sub(p1, p4);
  for (let i=1; i<20; i++) {
    let v = p5.Vector.mult(pt, i/20.0);
    let p = p5.Vector.add(p4, v);
    plist.push(p);
  }
  console.log(plist.length);
  num = plist.length;

  fourier();

  slider = createSlider(0,100,50);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);

  // fft from here: https://www.nayuki.io/page/free-small-fft-in-multiple-languages
  // previously done here: https://codepen.io/worbit/embed/YaLNWv

}

function draw() {
  background(sky);
  if (checkbox.checked()) {
    noFill();
    stroke(0);
    strokeWeight(1);
  } else {
    noStroke();
    fill(sal);
  }
  
  let val = slider.value();

  translate(width/2, height/2);
  push();
  let tx,ty;
  rlist = [];
  let t = frameCount % res;
  for (let c=0; c<res; c++) {
    if (gears && gears.length > 2) {
      tx = 0;
      ty = 0;
      for (let i=0; i<val / 100.0 * num/2 +1; i++) {
        // previous / next, angle / radius
        var pa, pr, na, nr;
        pa = gears[i + 1][0];
        pr = gears[i + 1][1];
        na = gears[num - i - 1][0];
        nr = gears[num - i - 1][1];
        if (checkbox.checked() && c==0) {
          ellipse(0, 0, 2 * pr, 2 * pr);
          line(0,0,
            pr * cos(pa + t * (i + 1) * da),
            pr * sin(pa + t * (i + 1) * da)
          );
          translate(
            pr * cos(pa + t * (i + 1) * da),
            pr * sin(pa + t * (i + 1) * da)
          );
        }
        tx = tx + pr * cos(pa + c * (i + 1) * da);
        ty = ty + pr * sin(pa + c * (i + 1) * da);
        if (checkbox.checked() && c==0) {
          ellipse(0, 0, 2 * nr, 2 * nr);
          line(0,0,
            nr * cos(na - t * (i + 1) * da),
            nr * sin(na - t * (i + 1) * da)
          );
          translate(
            nr * cos(na - t * (i + 1) * da),
            nr * sin(na - t * (i + 1) * da)
          );
        }
        tx = tx + nr * cos(na - c * (i + 1) * da);
        ty = ty + nr * sin(na - c * (i + 1) * da);
      }
      rlist.push(createVector(tx, ty));
    }
  }
  pop();

  if (checkbox.checked()) {
    //debug view
    stroke(sal);
    strokeWeight(3);
  }

  beginShape();
  for (let p of rlist) {
    vertex(p.x,p.y);
  }
  endShape(CLOSE);
}

// push();
//   var c = frameCount % res;
//   var tx, ty;
//   if (gears && gears.length > 2) {
//     tx = 0;
//     ty = 0;
//     for (i = 0; i < sldr.value() / 100.0 * num / 2 + 1; i++) {
//       var pa, pr, na, nr;

//       pa = gears[i + 1][0];
//       pr = gears[i + 1][1];

//       na = gears[num - i - 1][0];
//       nr = gears[num - i - 1][1];

//       ellipse(0, 0, 2 * pr, 2 * pr);
//       line(
//         0,
//         0,
//         pr * cos(pa + c * (i + 1) * da),
//         pr * sin(pa + c * (i + 1) * da)
//       );
//       translate(
//         pr * cos(pa + c * (i + 1) * da),
//         pr * sin(pa + c * (i + 1) * da)
//       );

//       tx = tx + pr * cos(pa + c * (i + 1) * da);
//       ty = ty + pr * sin(pa + c * (i + 1) * da);

//       ellipse(0, 0, 2 * nr, 2 * nr);
//       line(
//         0,
//         0,
//         nr * cos(na - c * (i + 1) * da),
//         nr * sin(na - c * (i + 1) * da)
//       );
//       translate(
//         nr * cos(na - c * (i + 1) * da),
//         nr * sin(na - c * (i + 1) * da)
//       );
//       //ellipse(0, 0, 5, 5);

//       tx = tx + nr * cos(na - c * (i + 1) * da);
//       ty = ty + nr * sin(na - c * (i + 1) * da);
//     }
//     if (rlist.length < res) {
//       rlist.push(createVector(tx, ty));
//     }
//   }
//   pop();

//   strokeWeight(4);
//   //stroke("#88B04B");
//   stroke("#fc6c85");
//   beginShape();
//   for (i = 0; i < rlist.length; i++) {
//     vertex(rlist[i].x, rlist[i].y);
//   }
//   if (rlist.length == res) endShape(CLOSE);
//   else endShape();

function resetinitial() {
  slider.value(0);
}

function fourier() {
  rlist = [];
  // num = plist.length;
  var arr = [];
  var ari = [];
  for (var j = 0; j < plist.length; j++) {
    pt = plist[j];
    arr.push(pt.x - width / 2);
    ari.push(pt.y - height / 2);
  }
  transformBluestein(arr, ari);
  gears = calc_gears(arr, ari);
}

function calc_gears(rv, iv) {
  var out = [];
  var pa, pr;
  for (var i = 0; i < rv.length; i++) {
    pa = angle(rv[i], iv[i]);
    pr = magni(rv[i], iv[i]);
    out.push([pa, pr]);
  }
  return out;
}

function angle(vr, vi) {
  return atan2(vi, vr);
}

function magni(vr, vi) {
  return sqrt(sq(vr) + sq(vi)) / num;
}