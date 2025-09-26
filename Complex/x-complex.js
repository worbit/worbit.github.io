// born from a a conversation with Gemini: https://gemini.google.com/u/1/app/6db632e7c3f09108

// Rectangle properties
const RECT_WIDTH = 300;
const RECT_HEIGHT = 200;
const RECT_ROTATION_DEGREES = -20; // The visual rectangle's rotation

// Inverse rotation for test points (z -> z')
const Z_PRIME_ROTATION_DEGREES = -RECT_ROTATION_DEGREES; // +20 degrees
const Z_PRIME_ROTATION_RADIANS = Z_PRIME_ROTATION_DEGREES * Math.PI / 180;
const COS_Z_PRIME_ROT = Math.cos(Z_PRIME_ROTATION_RADIANS);
const SIN_Z_PRIME_ROT = Math.sin(Z_PRIME_ROTATION_RADIANS);

// Corners of the UNROTATED canonical rectangle, centered at (0,0) in the z' plane
const W_HALF = RECT_WIDTH / 2;
const H_HALF = RECT_HEIGHT / 2;
const CORNERS = [
    { re: -W_HALF, im: -H_HALF }, // c1 (top-left in standard math coords)
    { re:  W_HALF, im: -H_HALF }, // c2 (top-right)
    { re:  W_HALF, im:  H_HALF }, // c3 (bottom-right)
    { re: -W_HALF, im:  H_HALF }  // c4 (bottom-left)
];

// Epsilon for numerical stability
const DENOMINATOR_EPSILON_SQ = 1e-6; // Min squared magnitude for 1/diff denominator
const LOG_ARG_EPSILON = 1e-9;      // Min value for log argument to avoid log(0)

// Colors
let salmonColorP5;
let skyBlueColorP5;

let thresholdSlider;
let thresholdValueSpan;
let currentLogMagThreshold = -5.0;

let slider, checkbox, button

function setup() {
    let canvasWidth = 500;
    let canvasHeight = 500; // Make it square for better complex plane viz
    const canvas = createCanvas(canvasWidth, canvasHeight);
    //canvas.parent('canvas-container');

    salmonColorP5 = color(250, 128, 114); 
    skyBlueColorP5 = color(135, 206, 235);

    slider = createSlider(-15.0, 5.0, -5.0, 0.1);
    checkbox = createCheckbox('info', false);
    button = createButton('reset');
    button.mousePressed(resetinitial);

    createElement('label', get_name());

    pixelDensity(1);
    
    // thresholdSlider = select('#thresholdSlider');
    // thresholdValueSpan = select('#thresholdValue');
    // thresholdSlider.input(() => {
    //     currentLogMagThreshold = parseFloat(thresholdSlider.value());
    //     thresholdValueSpan.html(currentLogMagThreshold.toFixed(1));
    //     redraw(); // Re-render when threshold changes
    // });
    // currentLogMagThreshold = parseFloat(thresholdSlider.value()); // Initial value
    // thresholdValueSpan.html(currentLogMagThreshold.toFixed(1));

    currentLogMagThreshold = slider.value(); // Initial value for log magnitude threshold
    // redraw();

    //noLoop(); // Initially draw once
    redraw(); // Call draw once setup is complete
}

function draw() {
    // console.time("drawComplexPlane");
    background(200); 
    loadPixels();
    currentLogMagThreshold = slider.value(); // Initial value for log magnitude threshold


    const complexPlaneOriginX = width / 2;
    const complexPlaneOriginY = height / 2;

    for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
            const zx = px - complexPlaneOriginX;
            const zy = py - complexPlaneOriginY; // p5.js y is inverted from typical math y

            const func_val = calculatePoleInfluence(zx, zy);
            const magnitude_sq = func_val.re * func_val.re + func_val.im * func_val.im;
            const magnitude = Math.sqrt(magnitude_sq);
            
            const valueToThreshold = Math.log(magnitude + LOG_ARG_EPSILON);

            if (valueToThreshold < currentLogMagThreshold) {
                setPixelInArray(px, py, salmonColorP5);
            } else {
                setPixelInArray(px, py, skyBlueColorP5);
            }
            if (checkbox.checked()) {
              let val = (sin(valueToThreshold*30)+1)/2; // Normalize to [0, 1]
              setPixelInArray(px, py, color(255 * val, 255 * val, 255 * val, 100));
              if (abs(valueToThreshold - currentLogMagThreshold) < 0.03) {
                setPixelInArray(px, py, salmonColorP5); // Highlight near threshold
              }
            }
        }
    }
    updatePixels();
    // console.timeEnd("drawComplexPlane");
}

/**
 * Calculates sum(1/(z' - c_k))
 * @param {number} zx - Real part of the input complex point z from canvas plane.
 * @param {number} zy - Imaginary part of the input complex point z from canvas plane.
 * @returns {{re: number, im: number}} The complex value of the sum.
 */
function calculatePoleInfluence(zx, zy) {
    // Transform z to z' (rotate z by Z_PRIME_ROTATION_RADIANS)
    const z_prime_re = zx * COS_Z_PRIME_ROT - zy * SIN_Z_PRIME_ROT;
    const z_prime_im = zx * SIN_Z_PRIME_ROT + zy * COS_Z_PRIME_ROT;

    let sum_re = 0;
    let sum_im = 0;

    for (const corner_ck of CORNERS) {
        const diff_re = z_prime_re - corner_ck.re;
        const diff_im = z_prime_im - corner_ck.im;

        let den_sq = diff_re * diff_re + diff_im * diff_im;

        if (den_sq < DENOMINATOR_EPSILON_SQ) {
            den_sq = DENOMINATOR_EPSILON_SQ; 
        }

        sum_re += diff_re / den_sq;
        sum_im += -diff_im / den_sq; // Conjugate for 1/(a+bi) = (a-bi)/(a^2+b^2)
    }
    return { re: sum_re, im: sum_im };
}

function setPixelInArray(x, y, c) {
    const idx = (y * width + x) * 4;
    pixels[idx]     = red(c);
    pixels[idx + 1] = green(c);
    pixels[idx + 2] = blue(c);
    pixels[idx + 3] = alpha(c); // alpha
}

function resetinitial() {
  slider.value(-5.0);
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