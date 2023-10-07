let myShader;

function preload() {
    myShader = loadShader('thesh.vert', 'thesh.frag');
}

function setup() {
    createCanvas(500, 500, WEBGL);
    shader(myShader);
    noStroke();
}

function draw() {
    clear();
    rect(0, 0, width, height);
}