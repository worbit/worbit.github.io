let button;

function setup() {
    createCanvas(500, 500);
    background('skyblue');
    stroke('salmon');
    strokeWeight(3);

    button = createButton('╳');
    button.mousePressed(clearCanvas);
}

function draw() {
    //background(220);
    if (mouseIsPressed) {
        line(pmouseX,pmouseY, mouseX, mouseY);   
    }
}

function clearCanvas() {
    background('skyblue');
}