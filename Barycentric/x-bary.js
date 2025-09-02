let Vs;
let cons;
let slider, checkbox, button;

function setup() {
  createCanvas(500, 500);
  textSize(20);
  slider = createSlider(-30, 30, 0);
  slider.elt.disabled = true;
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  let dir = get_name();
  let lab = createElement('label', dir);
  createA("https://worbit.github.io/" + dir + "/", ' X', '_top');


  Vs = [
    createVector(-150, -100),
    createVector(150, -100),
    createVector(150, 100),
    createVector(-150, 100)
  ].map(v => p5.Vector.add(v.rotate(-PI / 9), createVector(250, 250)));
}

function draw() {
  loadPixels();
  let mn = 9999999;
  let mx = -9999999;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let P = createVector(x, y);
      let a1 = getCoefficients(P, Vs[0], Vs[1], Vs[2]);
      let a2 = getCoefficients(P, Vs[0], Vs[2], Vs[3]);
      mn = min(mn, ...a1, ...a2);
      mx = max(mx, ...a1, ...a2);
      let mycol;
      // cons.html(`a1: ${a1.map(n => n.toFixed(2))} <br> a2: ${a2.map(n => n.toFixed(2))}`);
      if (inTriCoff(a1) || inTriCoff(a2)) {
        mycol = color('salmon');
      } else {
        mycol = color('skyBlue');
      }
      if (checkbox.checked()) {
        let r = max(a1[0], a2[0]);
        let g = max(a1[1], a2[1]);
        let b = max(a1[2], a2[2]);
        r = ((r + 2) / 5) * 255;
        g = ((g + 2) / 5) * 255;
        b = ((b + 2) / 5) * 255;
        mycol = color(r, g, b);
      }
      set(x, y, mycol);
    }
  }
  updatePixels();
  if (checkbox.checked()) {
    beginShape();
    noFill();
    stroke(0);
    Vs.forEach(v => {
      vertex(v.x, v.y);
    });
    endShape(CLOSE);
    line(Vs[0].x, Vs[0].y, Vs[2].x, Vs[2].y);
    let mox = mouseX;
    let moy = mouseY;
    let P = createVector(mox, moy);
    let a1 = getCoefficients(P, Vs[0], Vs[1], Vs[2]);
    let a2 = getCoefficients(P, Vs[0], Vs[2], Vs[3]);
    Vs.forEach(v => {
      line(v.x, v.y, mox, moy);
    });
    noStroke();
    textAlign(CENTER, BOTTOM);
    a1.forEach((n, i) => {
      if (n >= 0 && n <= 1) {
        fill('limeGreen');
      } else if (n < 0) {
        fill('salmon');
      } else if (n > 1) {
        fill('skyBlue');
      }
      text(n.toFixed(2), (Vs[i].x + mox) / 2, (Vs[i].y + moy) / 2);
    });

    textAlign(CENTER, TOP);
    a2.forEach((n, i) => {
      if (n >= 0 && n <= 1) {
        fill('limeGreen');
      } else if (n < 0) {
        fill('salmon');
      } else if (n > 1) {
        fill('skyBlue');
      }
      text(n.toFixed(2), (Vs[i].x + mox) / 2, (Vs[i].y + moy) / 2);
    });
  }
}

// Returns true if P is inside triangle ABC
function inTriangle(P, A, B, C) {
  let area = signedArea(A, B, C);
  let a1 = signedArea(P, B, C) / area;
  let a2 = signedArea(A, P, C) / area;
  let a3 = signedArea(A, B, P) / area;
  return a1 >= 0 && a2 >= 0 && a3 >= 0;
}

function inTriCoff(arr) {
  return arr[0] >= 0 && arr[1] >= 0 && arr[2] >= 0;
}

function getCoefficients(P, A, B, C) {
  let area = signedArea(A, B, C);
  let a1 = signedArea(P, B, C) / area;
  let a2 = signedArea(A, P, C) / area;
  let a3 = signedArea(A, B, P) / area;
  return [a1, a2, a3];
}

function signedArea(U, V, W) {
  return 0.5 * ((V.x - U.x) * (W.y - U.y) - (W.x - U.x) * (V.y - U.y));
}

function resetinitial() {
  slider.value(0);
}

function get_name() {
  let loc = window.location.pathname;
  let elems = loc.split('/');
  let dir = elems[elems.length - 2];
  return dir;
}