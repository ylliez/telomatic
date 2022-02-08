"use strict";

// program state (loading, running)
let state = `loading`;
// user webcam feed
let video;
// handpose object
let handpose;
// current set of predictions made by Handpose once it's running
let predictions = [];
let index;
// graphics elements for drawing overlay
let trailBlazer;

/**
Starts the webcam and the Handpose
*/
function setup() {
  createCanvas(640, 480);

  // Start webcam and hide the resulting HTML element
  video = createCapture(VIDEO);
  video.hide();

  // start the Handpose model and switch to our running state when it loads
  handpose = ml5.handpose(video, { flipHorizontal: true }, () => { state = `running`; });

  // listen for prediction events from Handpose and store the results in our predictions array when they occur
  handpose.on(`predict`, (results) => { predictions = results; });

  index = new Index();
  trailBlazer = createGraphics(width, height);

  // startButton = new Clickable();
}

/**
Handles the two states of the program: loading, running
*/
function draw() {
  switch (state) {
    case `loading`: loading(); break;
    case `running`: running(); break;
  }
}

/**
Displays a simple loading screen with the loading model's name
*/
function loading() {
  background(255);

  push();
  textSize(32);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(`Loading...`, width / 2, height / 2);
  pop();
}

/**
Displays the webcam.
If there is a hand it outlines it and highlights the tip of the index finger
*/
function running() {
  // Display the webcam with reveresd image so it's a mirror
  let flippedVideo = ml5.flipImage(video);
  image(flippedVideo, 0, 0, width, height);

  startButton.draw();

  // Check if there currently predictions to display
  if (predictions.length > 0) {
    index.coordinates = predictions[0];
    index.coordinate();
  }


  drawIndexTip();
}

//
function drawIndexTip() {
  trailBlazer.push();
  trailBlazer.stroke(255,0,0);
  trailBlazer.strokeWeight(3);
  // console.log(`${index.prev.x}, ${index.prev.y}, ${index.tip.x}, ${index.tip.y}`);
  trailBlazer.line(index.prev.x, index.prev.y, index.tip.x, index.tip.y);
  trailBlazer.pop();
  image(trailBlazer, 0, 0);
}
