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
  let dir = get_name();
  // create a ? with tooltip describing the pattern
  let d = createDiv('&nbsp;&nbsp;?');
  d.class('tooltip');
  let tt = createSpan('Tessellation: The form is the total area of the plane closer to its centroid than to any other cell. This form of tessellation of the plane is also known as Voronoi diagram. It is a generic version of tiling (all 3 regular tilings can be created with a Voronoi tessellation) as points (cell centroids) can be moved, removed or added and the topology adapts.<br>a) The parameter moves the centroid of the central cell along the x-axis. Furthermore, clicking on the canvas adds additional cell centers.<br>b) Tessellations, especially Voronoi, seem to have an irresistible appeal to architects, primarily for their formal and aesthetic appearance. It is essential to distinguish what looks like a Voronoi tessellation (giraffe skin, cracked porcelain, leaf veins) from what really is (closest distance cell logic). They are also relevant in data science, unsupervised ML (k-means), on graphs, and can be computed with different distance metrics. A cell’s form is defined by the positions of its surrounding cells.<br>c) Field, Fluid Topology, 3D');
  tt.class('tooltiptext');
  tt.parent(d);

  createA("https://worbit.github.io/"+dir+"/", '&rarr; ', '_top');
  slider = createSlider(150,350,250);
  checkbox = createCheckbox('info', false);
  button = createButton('reset');
  button.mousePressed(resetinitial);

  createElement('label', dir);  

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

function resetinitial() {
  slider.value(250);
  sites = sites.slice(0,5);
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