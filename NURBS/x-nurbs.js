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

    let dir = get_name();
    // create a ? with tooltip describing the pattern
    let d = createDiv('&nbsp;&nbsp;?');
    d.class('tooltip');
    let tt = createSpan('NURBS: The form is represented as in Point by four corners with specific coordinates. In non-uniform rational base splines (NURBS), the points can have different degrees, controlling the shape of the curve interpolated in between. If all points have degree 1, the form is a polyline with straight edges.<br>a) The parameter modifies the degree of the vertices between 1 and 5.<br>b) NURBS, a generalized form of Bézier-Splines invented for the car industry in the 1950s, was central for the Blobitecture of the 2000s, the curved shapes of ZHA and liked by many for their organic appearance. They have – for better or worse – become the figurehead of computational, parametric, digital architecture.<br>c) Empty, Typology');
    tt.class('tooltiptext');
    tt.parent(d);

    createA("https://worbit.github.io/"+dir+"/", '&rarr; ', '_top');
    slider = createSlider(1,5,1);
    checkbox = createCheckbox('info', false);
    button = createButton('reset');
    
    createElement('label', dir);
  
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
    if (controlPoints==null)
        return;
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
    slider.value(1);
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