/* general */
"use strict";

// program state (loading, running)
let state = `loading`;

/* ble */
const serviceUuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
let myBLE, myCharacteristic, writeOn, intensity;
let connectButton, onButton, offButton;

/* ml5 */
// webcam feed & handpose object
let video, handpose;
// holder for handpose predictions
let predictions = [];
let index;
// graphics elements for drawing overlay
let trailBlazer;

function setup() {
  /* general setup */
  // options for different displays (4:3 || relative) -> adapt createGraphics
  // createCanvas(640, 480);
  // createCanvas(windowWidth, windowHeight);
  createCanvas(1280, 960);
  // createCanvas(1920, 1440);

  /* ble setup */
  myBLE = new p5ble();
  createBleButtons();

  /* ml5 setup */
  // Start webcam and hide the resulting HTML element
  video = createCapture(VIDEO);
  video.hide();
  // start the Handpose model and switch to our running state when it loads
  handpose = ml5.handpose(video, { flipHorizontal: true }, () => { state = `running`; });
  // listen for prediction events from Handpose and store the results in our predictions array when they occur
  handpose.on(`predict`, (results) => { predictions = results; });
  // index finger object
  index = new Index();
  // holder for graphics overlay
  trailBlazer = createGraphics(width, height);
}

function createBleButtons() {
  // connect button
  connectButton = createButton('Connect');
  connectButton.position(width/10, height/10);
  connectButton.mousePressed(connectToBle);
  // on button
  onButton = createButton('On');
  onButton.position(width/10, 2*height/10);
  onButton.mousePressed(bleOn);
  // off button
  offButton = createButton('Off');
  offButton.position(width/10, 3*height/10);
  offButton.mousePressed(bleOff);
}

function connectToBle() {
  // Connect to a device by passing the service UUID
  myBLE.connect(serviceUuid, gotCharacteristics);
}

function gotCharacteristics(error, characteristics) {
  if (error) console.log('error: ', error);
  console.log('characteristics: ', characteristics);
  // Set the first characteristic as myCharacteristic
  myCharacteristic = characteristics[0];
}

function bleOn() {
  writeOn = true;
  trailBlazer.clear();
}

function bleOff() {
  writeOn = false;
  myBLE.write(myCharacteristic, 0);
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

/* displays webcam feed, if hand found, draws path at index fingertip */
function running() {
  // Display mirror webcam feed
  let flippedVideo = ml5.flipImage(video);
  image(flippedVideo, 0, 0, width, height);

  // Check if there currently predictions to display
  if (predictions.length > 0) {
    index.coordinates = predictions[0];
    index.coordinate();
  }
  drawIndexTip();
  triggerTelomatic();
}

//
function drawIndexTip() {
  trailBlazer.push();
  trailBlazer.stroke(255,0,0);
  trailBlazer.strokeWeight(3);
  // console.log(`${index.prev.x}, ${index.prev.y}, ${index.tip.x}, ${index.tip.y}`);
  // adapt graphics to selected canvas AR
  // 640 x 480
  // trailBlazer.line(index.prev.x, index.prev.y, index.tip.x, index.tip.y);
  // width x height
  // trailBlazer.line(index.prev.x/640*width, index.prev.y/480*height, index.tip.x/640*width, index.tip.y/480*height);
  // 1280 x 960
  trailBlazer.line(index.prev.x*2, index.prev.y*2, index.tip.x*2, index.tip.y*2);
  // 1920 x 1440
  // trailBlazer.line(index.prev.x*3, index.prev.y*3, index.tip.x*3, index.tip.y*3);
  trailBlazer.pop();
  image(trailBlazer, 0, 0);
}

function triggerTelomatic() {
  if (writeOn) {
    // intensity = 255 - floor(index.tip.y / height * 255);
    intensity = 255 - floor(index.tip.y*2 / 960 * 255);
    console.log(intensity);
    if (intensity > 50) {
      myBLE.write(myCharacteristic, intensity);
    }
    else {
      myBLE.write(myCharacteristic, 0);
    }
  }
}
