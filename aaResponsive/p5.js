function setup() {
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    background(0);
    circle(width/2,height/2,width/2)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// alternative

var w = window.innerWidth;
var h = window.innerHeight;  

function setup() {
  canvas=createCanvas(w, h);
}

function draw() {
  background(255,255,128);
  // A rectangle
  fill(200, 200, 200);
  noStroke();
  rect(20, 20, w-40, h-40);
  // uses global variables for width and height
  }

window.onresize = function() {
  // assigns new values for width and height variables
  w = window.innerWidth;
  h = window.innerHeight;  
  canvas.size(w,h);
}