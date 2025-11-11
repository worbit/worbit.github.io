let slider, checkbox,button;

function setup() {
  createCanvas(500, 500);

  let dir = get_name();
  createA("https://worbit.github.io/"+dir+"/", '&rarr; ', '_top');
  slider = createSlider(0, 1, 0, 0.01);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  createElement('label', dir);

  fill('salmon');
  rectMode(CENTER);
  noStroke();
}

function draw() {
    background('skyblue');

    translate(250,250);
    rotate(-PI/9);
    rect(0,0,300,200);
}

function resetinitial() {
    slider.value(0);
}

function get_name() {
    let path = document.location.pathname;
    let dirs = path.split('/');
    let name = dirs[dirs.length-2];
    return name;
}