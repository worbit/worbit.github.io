let slider, checkbox;
let sky, sal;
let img;
let val;
function setup() {
  createCanvas(500, 500);
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  slider = createSlider(250,350,300);
  checkbox = createCheckbox('info', false);
  img = createImage(250,250);
}

function draw() {
  calcImage();
  image(img,0,0,width,height);
}

function rectDist(x,y) {
  return max(abs(x)-val/2,abs(y)-200/2);
}

function rotate_c(cx, cy, x, y, angle) {
    var radians = (PI / 180) * angle,
        cosa = cos(radians),
        sina = sin(radians),
        nx = (cosa * (x - cx)) + (sina * (y - cy)) + cx,
        ny = (cosa * (y - cy)) - (sina * (x - cx)) + cy;
    return [nx, ny];
}

function calcImage() {
  img.loadPixels();
  val = slider.value();
  
  for (let i = 0; i < img.width; i++) {
    for (let j = 0; j < img.height; j++) {
      var px = (i-125)*2;
      var py = (j-125)*2;
      var rp = rotate_c(0,0,px,py,-20);
      var d = rectDist(rp[0],rp[1]);
      // debug view
      if (checkbox.checked()) {
        img.set(i,j, color(255-abs(d)));
      } else {
        if (d>0)
          img.set(i, j, sky);
        else
          img.set(i, j, sal);
      }
    }
  }
  img.updatePixels();
}

// function keyPressed() {
//   img.save('rect','png');
// }