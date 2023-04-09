let slider, checkbox, button;
let sky, sal;
let img;
let pim;
let bools;
function preload() {
    img = loadImage("rect.png");
}

function setup() {
    createCanvas(500,500);
    sky = color(135, 206, 235);
    sal = color(250, 128, 114);
    slider = createSlider(0,100,0);
    button = createButton('reset');
    button.mousePressed(resetinitial);

    let loc = window.location.pathname;
    let elems = loc.split('/');
    let dir = elems[elems.length-2];
    createElement('label', dir);  
    
    img.loadPixels();
    bools = [];
    for (let i=0; i<img.pixels.length; i+=4) {
        bools.push(img.pixels[i]>240);
    }
    pim = createImage(250,250);
    pim.loadPixels();

}

function draw() {
    background(0);
    let val = slider.value();
    //pim.loadPixels();
    randomSeed(658);

    for (let i = 0; i < pim.width; i++) {
        for (let j = 0; j < pim.height; j++) {
            let dsq = sq(i-pim.width/2) + sq(j-pim.height/2)
            let r = val/100.0>random();
            let c1 = sky;
            let c2 = sal;
            if (!r) {
                c1 = sal;
                c2 = sky;
            }
            if (bools[j*250+i])
                pim.set(i,j,c1);
            else
                pim.set(i,j,c2);
        }
    }
    pim.updatePixels();
    image(pim,0,0,width,height);
}

function resetinitial() {
    slider.value(0);
}