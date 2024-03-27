let slider, checkbox, button;
let pattern = [];
let colors;

function setup() {
  createCanvas(500, 500);
  noStroke();
  slider = createSlider(0,3,1);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  createElement('label', get_name());

  colors = ['skyblue', 'salmon'];

  // hard coded cellular automaton with
  // red (1) cells having 0, 1, 2, and 3
  // red neighbors
  
  pattern.push([0,0,0,0,1,0,
                0,1,0,0,0,1,
                0,0,0,1,0,0,
                0,1,0,0,1,0,
                1,0,0,0,0,0]);
  
  pattern.push([0,0,0,0,0,0,
                0,0,0,0,0,0,
                0,0,1,1,0,0,
                0,0,0,0,0,0,
                0,0,0,0,0,0]);
                
  pattern.push([0,0,0,0,0,0,
                0,0,0,1,1,1,
                0,1,1,1,0,0,
                0,1,0,0,0,0,
                1,1,0,0,0,0]);

  pattern.push([0,1,0,0,0,0,
                0,1,0,1,1,1,
                0,1,1,1,0,0,
                0,1,1,0,1,0,
                1,1,1,1,1,0]);      
  }

function draw() {
  background('skyblue');
  let nn = slider.value();
  let pat = pattern[nn];
  translate(250,250);
  rotate(-PI/9);
  translate(-450,-500);
  if (checkbox.checked()) stroke(0);
  else noStroke();

  for (let i=0; i<30; i++) {
    let t = pat[i];
    fill(colors[t]);
    let x = i % 6;
    let y = Math.floor(i / 6);
    rect(x*150,y*200,150,200);
  }
}

function resetinitial() {
  slider.value(1);
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