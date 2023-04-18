let sky, sal;

function setup() {
    sky = color(135, 206, 235);
    sal = color(250, 128, 114);
}

function keyPressed() {
    if (keyCode === UP_ARROW) {
        save_pic();
    }
}

function save_pic() {
    alert('hello');
}