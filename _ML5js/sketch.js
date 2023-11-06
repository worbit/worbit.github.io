// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Image classification using MobileNet and p5.js
This example uses a callback pattern to create the classifier
=== */

// Initialize the Image Classifier method with MobileNet. A callback needs to be passed.
let classifier;

// A variable to hold the image we want to classify
let img;

function preload() {
  classifier = ml5.imageClassifier('DarkNet'); // MobileNet DoodleNet Darknet
  img = loadImage('images/rect.png');
}

function setup() {
  createCanvas(500, 500);
  classifier.classify(img, gotResult);
  image(img, 0, 0, width, height);
}

// A function to run when we get any errors and the results
function gotResult(error, results) {
  // Display error in the console
  if (error) {
    console.error(error);
  }
  // The results are in an array ordered by confidence.
  console.log(results);
  for (let i=0; i<results.length; i++) {

      createDiv(`Label: ${results[i].label}` + `  –  Confidence: ${nf(results[i].confidence, 0, 2)}`);
    //   createDiv(`Confidence: ${nf(results[0].confidence, 0, 2)}`);
  }
}