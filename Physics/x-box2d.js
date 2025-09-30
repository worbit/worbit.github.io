//import Box2D
var b2
b2 = {
    Vec2: Box2D.Common.Math.b2Vec2,
    BodyDef: Box2D.Dynamics.b2BodyDef,
    Body: Box2D.Dynamics.b2Body,
    FixtureDef: Box2D.Dynamics.b2FixtureDef,
    Fixture: Box2D.Dynamics.b2Fixture,
    World: Box2D.Dynamics.b2World,
    MassData: Box2D.Collision.Shapes.b2MassData,
    PolygonShape: Box2D.Collision.Shapes.b2PolygonShape,
    CircleShape: Box2D.Collision.Shapes.b2CircleShape,
    DebugDraw: Box2D.Dynamics.b2DebugDraw,
    //Color: Box2D.Common.b2Color
  }

const SCALE = 30;

let coords, boxes;

let slider, checkbox, button;

async function setup() {
  cnv = createCanvas(500, 500);
  // createElement('p','hallo').id('gui');
  coords = await loadStrings('dims.txt');
  boxes = await loadStrings('bxs.txt');

  setupWorld();
  setupBoxes();

  console.log(act);
  console.log(env);

  // frameRate(10)
  let dir = get_name();
  createA("https://worbit.github.io/" + dir + "/", '&rarr; ', '_top');
  slider = createSlider(-31, 31, 0);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);
  createElement('label', get_name());

}

let env = [];
let act = [];
let mod;
let mh = 0;
let mw = 0;
function setupBoxes() {
  let coordsf = [];
  let boxesf = [];
  let b;
  //create boxes
  for (let i=0; i<coords.length; i++){
    coordsf[i] = coords[i].split(',').map(x=>parseFloat(x));
    b = createBox(coordsf[i][2],height-coordsf[i][3],coordsf[i][0]/2,coordsf[i][1]/2);
    if (i==2) {
      mod = b;
      mh = coordsf[i][1]/2;
      mw = coordsf[i][0]/2;
    }
    env.push(b);
    // b.SetUserData({'c':0});
    // b.userData = {'c':0};
  }
  for (let i=0; i<boxes.length; i++){
    boxesf[i] = boxes[i].split(',').map(x=>parseFloat(x));
    b = createBox(boxesf[i][2],height-boxesf[i][3],boxesf[i][0]/2,boxesf[i][1]/2, -PI/9);
    act.push(b);
    // b.SetUserData({'c':1});
    // document.getElementById('gui').innerHTML = b.GetUserData().c;
    // b.userData = {'c':1};
  }
}

function setupWorld(){
  //createWorld
  world = new b2.World(new b2.Vec2(0,10),true);
  //ground properties
  var fixdef = new b2.FixtureDef();
  fixdef.density = 1;
  fixdef.friction = 0.5;
  //ground def
  var grodef = new b2.BodyDef();
  grodef.type = b2.Body.b2_staticBody;
  grodef.position.x = b2s(width/2);
  grodef.position.y = b2s(height);
  fixdef.shape = new b2.PolygonShape()
  fixdef.shape.SetAsBox(b2s(width*2),b2s(1));
  let b = createBody(grodef,fixdef);
  env.push(b);
  // b.SetUserData({'c':0});
  // world.CreateBody(grodef).CreateFixture(fixdef)
  var debug = new b2.DebugDraw();
  debug.SetSprite(cnv.canvas.getContext('2d'));
  debug.SetDrawScale(SCALE)
  debug.SetFlags(b2.DebugDraw.e_shapeBit|b2.DebugDraw.e_jointBit)
  world.SetDebugDraw(debug);
}

function b2s(val){
  return val/SCALE;
}

function createBox(x,y,w,h, a){
  var fixdef = new b2.FixtureDef();
  fixdef.density = 1;
  fixdef.friction = 0.5;
  fixdef.restitution = 0.2;
  //ground def
  var boxdef = new b2.BodyDef();
  boxdef.type = b2.Body.b2_dynamicBody;
  boxdef.position.x = b2s(x);
  boxdef.position.y = b2s(y);
  boxdef.angle = a ? a : 0;
  fixdef.shape = new b2.PolygonShape();
  fixdef.shape.SetAsBox(b2s(w),b2s(h));
  return createBody(boxdef,fixdef);
}

function createBody(body,fixture){
  return world.CreateBody(body).CreateFixture(fixture);
}

function draw() {
  if (mod) {
    let v = slider.value();
    mod.GetShape().SetAsBox(b2s(mw),b2s(mh+v));
    let b = mod.GetBody();
    b.SetAwake(true);
    // mod.shape.SetAsBox(b2s(mw),b2s(mh+v));
  }

  background('skyblue');
  let idx=0;
  var node = world.GetBodyList();
  if (checkbox.checked()) { stroke(0); } else { noStroke(); }
  while (node) {
    if (act.includes(node.GetFixtureList())) fill('salmon');
    if (env.includes(node.GetFixtureList())) fill('skyblue');
    // fill('skyblue');
    // if (idx<6) fill('salmon');
    var body = node;

    // let ud = body.GetUserData().GetNext();
    // let ud = body.m_userData;
    // document.getElementById('gui').innerHTML = 'ud: '+ud;
    // if (ud==null) fill('lightgreen');
    // else if (ud.c==0) fill('skyblue');
    // else if (ud.c==1) fill('salmon');
    node = node.GetNext();
    var px = body.GetPosition().x * SCALE;
    var py = body.GetPosition().y * SCALE;
    var f = body.GetFixtureList();
    if (!f) continue;
    var shape = f.GetShape();
    //var poly = ((shape instanceof b2PolygonShape ? shape : null));
    var vertexCount = parseInt(shape.GetVertexCount());
    // document.getElementById('gui').innerHTML = vertexCount;//'bodies: '+world.GetBodyCount(); //+'<br>fps: '+frameRate().toFixed(2);
    var localVertices = shape.GetVertices();
    // if (type == 0) { //circle
    var angle = body.GetAngle();
    push();
    translate(px, py);
    rotate(angle);
    beginShape();
    for (var i = 0; i < vertexCount; i++) {
      var v = localVertices[i];
      vertex(v.x * SCALE, v.y * SCALE);
    }
    endShape(CLOSE);
    if (checkbox.checked()) {
      fill(0);
      text(idx,0,0);
    }
    pop();
    idx++;
  }
  //world.DrawDebugData();
  
  world.Step(1/frameRate(),10,10);
  world.ClearForces();
  //console.log(frameRate())
}

function mousePressed(){
  let cx = mouseX;
  let cy = mouseY;
  if (cx<0 || cx>width || cy<0 || cy>height) return;
  //create box
  let b = createBox(mouseX,mouseY,random(5,50),random(5,50));
  act.push(b);
}

// function keyPressed() {
//   let idx = 0;
//   for (var body = world.GetBodyList(); body; body = body.GetNext())
//   {
//     if (idx==8) break;
//     idx++;
//   }
//   // let b = world.GetBodyList()[8];
//   world.DestroyBody(body);
// }

function get_name() {
  let loc = window.location.pathname;
  let elems = loc.split('/');
  let dir = elems[elems.length - 2];
  return dir;
}

function resetinitial() {
  slider.value(0);
  setupWorld();
  setupBoxes();
}