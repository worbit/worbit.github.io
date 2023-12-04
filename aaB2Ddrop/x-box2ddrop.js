let sal,sky;
let cnv;
let slider, checkbox, button;
const SCALE = 30;
var b2;
let world;
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
    DebugDraw: Box2D.Dynamics.b2DebugDraw
  }
function setup() {
    cnv = createCanvas(500, 500);
    sky = color(135, 206, 235); // #87CEEB
    sal = color(250, 128, 114); // #FA8072

    setupWorld();
    createBox(250,250,300,200);

    slider = createSlider(-30,30,0);
    checkbox = createCheckbox('info', false);
    button = createButton('reset');
    button.mousePressed(resetinitial);
    createElement('label', get_name());
}

function draw() {
    background(sky);
    world.DrawDebugData();
    world.Step(1/frameRate(), 10, 10);
    world.ClearForces();
}

function setupWorld() {
    // create World
    world = new b2.World(new b2.Vec2(0,10), true);
    // ground properties
    let fixdef = new b2.FixtureDef();
    fixdef.density = 1;
    fixdef.friction = 0.5;
    fixdef.shape = new b2.PolygonShape();
    fixdef.shape.SetAsBox(b2s(width), b2s(10));
    // ground definition
    let grodef = new b2.BodyDef();
    grodef.position.x = b2s(width/2);
    grodef.position.y = b2s(height+5);
    createBody(grodef, fixdef);

    // drawing world's objects
    let debug = new b2.DebugDraw();
    debug.SetSprite(cnv.canvas.getContext('2d'));
    debug.SetDrawScale(SCALE);
    debug.SetFlags(b2.DebugDraw.e_shapeBit|b2.DebugDraw.e_jointBit);
    world.SetDebugDraw(debug);
}

function b2s(val) {
    return val/SCALE;
}

function createBox(x, y, w, h) {
    let fixdef = new b2.FixtureDef();
    fixdef.density = 1;
    fixdef.friction = 0.5;
    fixdef.restitution = 1;
    fixdef.shape = new b2.PolygonShape();
    fixdef.shape.SetAsBox(b2s(w), b2s(h));
    // SetAsOrientedBox
    let boxdef = new b2.BodyDef();
    boxdef.type = b2.Body.b2_dynamicBody;
    boxdef.position.x = b2s(x);
    boxdef.position.y = b2s(y);
    createBody(boxdef, fixdef);
}

function createBody(body, fixture) {
    world.CreateBody(body).CreateFixture(fixture);
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