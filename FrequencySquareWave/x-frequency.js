// https://github.com/turbomaze/JS-Fourier-Image-Analysis

let slider, checkbox, button;
let sky, sal;
let img;
let pim;
let out;
let dims;
let mod, ix;
function preload() {
    img = loadImage("rect_256.png");
}

function setup() {
    createCanvas(500,500);
    sky = color(135, 206, 235);
    sal = color(250, 128, 114);
    slider = createSlider(1,77,77);
    button = createButton('reset');
    button.mousePressed(init);
    
    img.loadPixels();
    let data = [];
    out = [];
    for (let i = 0; i < img.height; i++) {
        for (let j = 0; j < img.width; j++) {
            data.push(100*int(red(img.get(j,i))>240));
        }
    }
    dims = [256,256];
    Fourier.transform(data, out);

    // let mx = -1;
    // let i = 0;
    // ix = 0;
    // for (c of out) {
    //     let m = c.magnitude2();
    //     if (i>5 && m>mx) {
    //         mx = m;
    //         ix = i;
    //     }
    //     i++;
    // }
    // print(ix, mx, out[ix]);

    // mod = out[ix].real;

    let fftshift = Fourier.shift(out, dims);
    Fourier.filter(fftshift, dims, 0, 8);
    let fftunshift = Fourier.unshift(fftshift, dims);
    let sig = [];
    Fourier.invert(fftunshift, sig);

    pim = createImage(256,256);
    pim.loadPixels();
    for (let i = 0; i < pim.width; i++) {
        for (let j = 0; j < pim.height; j++) {
            let col = color(sig[j*pim.width+i]);
            pim.set(i,j,col);
        }
    }
    pim.updatePixels();
}

function draw() {
    let val = slider.value();
    let fftshift = Fourier.shift(out, dims);
    Fourier.filter(fftshift, dims, 0, val);
    let fftunshift = Fourier.unshift(fftshift, dims);
    // out[ix].real = mod*val;
    // print(mod,val);
    let sig = [];
    // Fourier.invert(out, sig);
    Fourier.invert(fftunshift, sig);

    // pim.loadPixels();
    for (let i = 0; i < pim.width; i++) {
        for (let j = 0; j < pim.height; j++) {
            let col = sig[j*pim.width+i]>95 ? sal : sky;
            pim.set(i,j,col);
        }
    }
    pim.updatePixels();
    image(pim,-3,-3,512,512);
}

function init() {
    slider.value(77);
}