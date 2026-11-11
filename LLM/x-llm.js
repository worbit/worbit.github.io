let slider, checkbox, button;
let img, txt;
let d;

function preload() {
  img = loadImage('chatgpt.svg');
  txt = loadStrings('chatgpt.svg');
}

function setup() {
  createCanvas(500, 500);
  
  textFont('Andale Mono');
  textSize(11);
  d = 10;
  let dir = get_name();
  // create a ? with tooltip describing the pattern
  let tip = createDiv('&nbsp;&nbsp;?');
  tip.class('tooltip');
  let tt = createSpan('LLM: After verifying its familiarity with scalable vector graphics (SVG), a large language model (LLM, in this case ChatGPT v3.5) was prompted to generate SVG code for “a salmon-colored rectangle of 300 by 200, rotated by 20° on a sky-blue background, canvas size of 500 × 500” – which it provided after some initial misunderstandings.<br>a) n.a.<br>b) We are only at the beginning of grasping the future relevance of LLMs and other generative A.I. systems for architecture and design. Unlike for natural language, there is significantly less training data available for e.g. CAD or BIM file formats, and the physical meaning of a sequence of symbols is way more complex than a linear fairy tale. Combinations of natural language models with symbolic deduction engines like AlphaGeometry [41], achieving human gold-medalist accuracy at math Olympics questions are a promising solution.<br>c) Empty, Uncertainty');
  tt.class('tooltiptext');
  tt.parent(tip);

  createA("https://worbit.github.io/"+dir+"/", '&rarr; ', '_top');
  slider = createSlider(0,100,0);
  slider.elt.disabled = true;
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  button.elt.disabled = true;

  createElement('label', dir);
}

function draw() {
  image(img, 0, 0, width, height);

  if (checkbox.checked()) {
    fill("#444653");
    noStroke();
    rect(d,d,500-2*d,500-2*d);
    fill("#d2d5da");
    for (let i=0; i<txt.length; i++) {
      let t = txt[i];
      text(t, d+2, 40+i*16);
    }
  }
}

function resetinitial() {
  slider.value(0);
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