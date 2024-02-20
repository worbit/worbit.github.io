// global variables
var rhino = null;
let pts;

// wait for the rhino3dm web assembly to load asynchronously
rhino3dm().then(function(m) {
    rhino = m; // global
    run();
});

function setup() {
    createCanvas(500, 500);
    fill('salmon');
    noStroke();
    rectMode(CENTER);

    slider = createSlider(1,5,1);
    checkbox = createCheckbox('info', false);
    button = createButton('reset');
    
    createElement('label', get_name());
  
    button.mousePressed(resetinitial);  
}

function draw() {
    background('skyblue');
    drawNurbsCurve(pts);
    if (checkbox.checked())
        drawControlPolygon(pts);
}

function run() {
    pts = new rhino.Point3dList();
    pts.add(74.844,207.334,0);
    pts.add(356.752,104.728,0);
    pts.add(425.156,292.666,0);
    pts.add(143.248,395.272,0);
}

function drawNurbsCurve(controlPoints) {
    if( controlPoints.count<2 )
        return;
    let degree = slider.value();
    let curve = rhino.NurbsCurve.create(true, degree, controlPoints);
    
    const divisions = 300;

    let [t0,t1] = curve.domain;
    let [x,y,z] = curve.pointAt(t0);
    beginShape();
    for(j=1; j<=divisions; j++) {
        let t = t0 + j / divisions * (t1-t0);
        let [x,y,z] = curve.pointAt(t);
        vertex(x,y);
    }
    endShape(CLOSE);
    curve.delete();
}

function drawControlPolygon(controlPoints) {
    noFill();
    stroke(0);
    setLineDash([7,7]);
    for(i=0; i<controlPoints.count; i++) {
        let [ax,ay,az] = controlPoints.get(i);
        let [bx,by,bz] = controlPoints.get((i+1)%4);
        line(ax,ay,bx,by);
    }
    setLineDash([]);
    
    fill('white');
    for(i=0; i<controlPoints.count; i++) {
        let [x,y,z] = controlPoints.get(i);
        rect(x,y,7,7);
    }
    noStroke();
    fill('salmon');
}

function setLineDash(list) {
    drawingContext.setLineDash(list);
}

function resetinitial() {
    slider.value(3);
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