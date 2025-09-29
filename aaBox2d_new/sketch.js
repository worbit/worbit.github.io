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
// function preload() {
//   coords = loadStrings('aaBox2d_new/dims.txt');
// }

async function setup() {
  cnv = createCanvas(500, 500);
  // createElement('p','hallo').id('gui');
  fill('salmon');
  // noStroke(); 
  setupWorld();

  coords = await loadStrings('dims.txt');
  boxes = await loadStrings('bxs.txt');
  for (let i=0; i<coords.length; i++){
    coords[i] = coords[i].split(',').map(x=>parseFloat(x));
    createBox(coords[i][2],height-coords[i][3],coords[i][0]/2,coords[i][1]/2);
  }
  for (let i=0; i<boxes.length; i++){
    boxes[i] = boxes[i].split(',').map(x=>parseFloat(x));
    createBox(boxes[i][2],height-boxes[i][3],boxes[i][0]/2,boxes[i][1]/2, -PI/9);
  }
  // frameRate(10)
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
  createBody(grodef,fixdef);
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
  fixdef.restirution = 1;
  //ground def
  var boxdef = new b2.BodyDef();
  boxdef.type = b2.Body.b2_dynamicBody;
  boxdef.position.x = b2s(x);
  boxdef.position.y = b2s(y);
  boxdef.angle = a ? a : 0;
  fixdef.shape = new b2.PolygonShape();
  fixdef.shape.SetAsBox(b2s(w),b2s(h));
  createBody(boxdef,fixdef);
}

function createBody(body,fixture){
  world.CreateBody(body).CreateFixture(fixture);
}

function draw() {
  background('skyblue');
  let idx=0;
  var node = world.GetBodyList();
  while (node) {
    fill('skyblue');
    if (idx<6) fill('salmon');
    var body = node;
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

    // fill(0);
    // text(idx,0,0);
    // }
    // rectMode(CENTER);
    // ellipse(0, 0, 20, 20);
    pop();
    idx++;
  }
  //world.DrawDebugData();
  
  world.Step(1/frameRate(),10,10);
  world.ClearForces();
  //console.log(frameRate())
}

function mousePressed(){
  createBox(mouseX,mouseY,random(5,50),random(5,50));
}

function keyPressed() {
  let idx = 0;
  for (var body = world.GetBodyList(); body; body = body.GetNext())
  {
    if (idx==8) break;
    idx++;
  }
  // let b = world.GetBodyList()[8];
  world.DestroyBody(body);
}