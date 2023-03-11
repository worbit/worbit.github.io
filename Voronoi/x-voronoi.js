//https://github.com/gorhill/Javascript-Voronoi

let slider, checkbox, button;
let sky, sal;
let voronoi;
let diagram;
let bbox;
let sites;
function setup() {
  createCanvas(500, 500);
  noStroke();
  sky = color(135, 206, 235);
  sal = color(250, 128, 114);
  fill(sal);
  slider = createSlider(150,350,250);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(init);
  
  voronoi = new Voronoi();
  bbox = {xl: 0, xr: width, yt: 0, yb: height};
  sites = [ {x: 250, y: 250}, 
               {x: 181.596, y: 62.061}, 
               {x: 531.908, y: 147.394}, 
               {x: 318.404, y: 437.939},
               {x: -31.908, y: 352.606}
              ];

  diagram = voronoi.compute(sites, bbox);
}

function draw() {
  background(sky);
  
  let val = slider.value();
  sites[0].x = val;
  diagram = voronoi.compute(sites, bbox);
  
  //var vc = diagram.cells[2];
  var vc = diagram.cells[sites[0].voronoiId];
  beginShape();
  var first = vc.halfedges[0];
  vertex(first.getStartpoint().x,first.getStartpoint().y);
  for (var he of vc.halfedges) {
    vertex(he.getEndpoint().x,he.getEndpoint().y);
  }
  endShape(CLOSE);
  
  //debug view
  if (checkbox.checked()) {
    stroke(255);
    fill(255);
    for (var c of diagram.cells) {
      for (var he of c.halfedges) {
        line(c.site.x,c.site.y, he.edge.lSite.x, he.edge.lSite.y);
      }
    }
    stroke(0);
    for (var e of diagram.edges) {
      line(e.va.x,e.va.y,e.vb.x,e.vb.y);
    }
    for (var s of sites) {
      ellipse(s.x,s.y,10,10);
    }
    noStroke();
    fill(sal);
  }
}

function mousePressed() {
  if (mouseY<500 && mouseX<500)
    sites.push({x:mouseX, y:mouseY});
}

function init() {
  slider.value(250);
  sites = sites.slice(0,5);
}