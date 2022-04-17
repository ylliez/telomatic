/* script.js
main script
populates HTML page, creates canvas, implements libraries, displays output, affords server interactions
creates video feed, p5.js canvas, GUI elements (sliders & buttons) and graphics element
sets up hand position detection and BLE communication
*/

"use strict";

/* GENERAL */
// program state (load, sim)
let state = `load`;
// video capture element, input feed and dimensions
const captureElement = document.getElementById('capture');
// 16:9 -> 1280 * 720
// let capture, captureWidth = 1280, captureHeight = 720;
// 4:3 -> 640 * 480
let capture, captureWidth = 640, captureHeight = 480;
// CCTV dims: 768 * 494 pixels (https://www.manualslib.com/manual/118015/Panasonic-Aw-E300.html?page=52#manual)
// let capture, captureWidth = 768, captureHeight = 494;
// dynamic -> window width & height
// let capture, captureWidth = window.Width, captureHeight = window.Height;
// display aspect ratio
const aspectRatio = captureWidth / captureHeight;
// dynamic canvas dimensions
let canvasWidth, canvasHeight;
// GUI and elements
let guiDiv, sliders, icons;
// sliders
let sliderCol, sliderColWidth, sliderColHeight, sliderColYPos, sliderColHandle;
let sliderColR, sliderColG, sliderColB, sliderColRXPos, sliderColGXPos, sliderColBXPos;
let sliderSize, sliderSizeBox, sliderSizeRad, sliderSizeHeight, sliderSizeYPos, sliderSizeXPos, sliderSizeHandle;
// buttons
let buttonClear, buttonClearXPos, buttonClearYPos, buttonClearWidth, buttonClearHeight;
let buttonQR, buttonQRXPos, buttonQRYPos, buttonQRWidth, buttonQRHeight;
// photobooth
let photoboothDiv, qrDiv, cdDiv, flashDiv;
// QR trigger boolean
let qrTrig = false;
// GUI reset timer
let resetGUI;
// output graphics display element
let trailBlazer;
// MediaPipe handpose recognition model, results and ad hoc object to manipulate data
let hands, predictions = [], hand;
// BLE UUID address of actuating microcontroller
const TELO_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
// BLE object, characteristic and value to be sent
let teloBLE, teloCharacteristic, teloIntensity;

/* SETUP: initialize canvas, video and model */
function setup() {
  // setup canvas relative to window dimension ratio
  if (windowWidth < windowHeight * aspectRatio) {
    createCanvas(windowWidth, windowWidth / aspectRatio);
  } else {
    createCanvas(windowHeight * aspectRatio, windowHeight);
  }
  // setup MediaPipe model
  handposeSetup();
  // instantiate hand object to manipulate Handpose data
  hand = new Hand();
  // get DOM element of video
  capture = select(`#capture`);
  // instantiate graphics element
  trailBlazer = createGraphics(width, height);
  // instantiate ble
  teloBLE = new p5ble();
  // create and style GUI elements
  setupGuiElements();
}

// MediaPipe hand position model setup (from https://google.github.io/mediapipe/solutions/hands.html#javascript-solution-api)
function handposeSetup() {
  hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
  });
  // set options of handpose model (horizontally flipped image, maximum number of hands detected, detection confidence)
  hands.setOptions({
    selfieMode: true,
    maxNumHands: 6,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  // return and store handpose detection results
  hands.onResults((results) => {
    state = `sim`;
    predictions = results;
  });
  // create and launch camera for model detection
  const camera = new Camera(captureElement, {
    onFrame: async () => {
      await hands.send({
        image: captureElement,
      });
    },
    width: captureWidth,
    height: captureHeight
  });
  camera.start();
}

function setupGuiElements() {
  // obtain canvas element and style for GUI formatting
  canvas = $("#defaultCanvas0");
  canvasWidth = parseInt(canvas.css("width"));
  canvasHeight = parseInt(canvas.css("height"));
  // obtain and style GUI and photobooth divs
  guiDiv = $("#GUI");
  guiDiv.css("width", canvasWidth);
  photoboothDiv = $("#photobooth");
  photoboothDiv.css("width", canvasWidth);
  // create and style sliders, buttons and photobooth
  setupSliders();
  setupIcons();
  setupPhotobooth();
}

// create and style graphics trail color and size sliders
function setupSliders() {
  // create jQuery sliders
  $("#sliderColR, #sliderColG, #sliderColB").slider({
    orientation: "horizontal",
    range: "min",
    min: 0,
    max: 255
  });
  $("#sliderSize").slider({
    orientation: "vertical",
    range: "min",
    min: 1,
    max: 30
  });
  // obtain slider elements
  sliderCol = $(".sliderCol");
  sliderColR = $("#sliderColR");
  sliderColG = $("#sliderColG");
  sliderColB = $("#sliderColB");
  sliderColHandle = $(".ui-slider-handle");
  sliderSize = $("#sliderSize");
  sliderSizeBox = $("#sliderSizeBox");
  sliderSizeHandle = document.getElementsByClassName('ui-slider-handle')[0];
  // force jQueryUI sliders into absolute position
  $(".ui-slider").css("position", "absolute");
  // style slider elements
  sliderCol.css("top", canvasHeight / 100 * 5);
  sliderCol.css("height", canvasHeight / 100 * 5);
  sliderColHandle.css("height", canvasHeight / 100 * 6);
  sliderColR.css("left", canvasWidth / 100 * 20);
  sliderColG.css("left", canvasWidth / 100 * 43);
  sliderColB.css("left", canvasWidth / 100 * 65);
  sliderSize.css("top", canvasHeight / 100 * 30);
  sliderSize.css("height", canvasHeight / 100 * 50);
  sliderSize.css("left", canvasWidth / 100 * 92.5);
  sliderSizeHandle.style.height = `${hand.size}px`;
  sliderSizeHandle.style.width = `${hand.size}px`;
  sliderSizeBox.css("border-top", `${canvasHeight / 100 * 50}px solid #ccc`);
  sliderSizeBox.css("border-left", `${canvasWidth / 100 * 2}px solid transparent`);
  sliderSizeBox.css("border-right", `${canvasWidth / 100 * 2}px solid transparent`);
  sliderSizeBox.css("left", `-${canvasWidth / 100 * 2}px`);
  // set slider initial values
  sliderColR.slider("value", hand.color.r);
  sliderColG.slider("value", hand.color.g);
  sliderColB.slider("value", hand.color.b);
  sliderSize.slider("value", hand.size);
  // obtain slider style
  sliderColHeight = parseInt(sliderColR.css("height"));
  sliderColYPos = parseInt(sliderColR.css("top"));
  sliderColWidth = parseInt(sliderColR.css("width"));
  sliderColRXPos = parseInt(sliderColR.css("left"));
  sliderColGXPos = parseInt(sliderColG.css("left"));
  sliderColBXPos = parseInt(sliderColB.css("left"));
  sliderSizeYPos = parseInt(sliderSize.css("top"));
  sliderSizeHeight = parseInt(sliderSize.css("height"));
  sliderSizeXPos = parseInt(sliderSize.css("left"));
  sliderSizeRad = parseInt(sliderSizeBox.css("border-left-width"));
}

// create and style graphics clearing and screenshotting buttons
function setupIcons() {
  // obtain clear & screenshot button elements
  buttonQR = $("#qrIcon");
  buttonClear = $("#xIcon");
  // style button elements
  buttonQR.css("top", canvasHeight / 100 * 5);
  buttonQR.css("left", canvasWidth / 100 * 5);
  buttonQR.css("font-size", canvasWidth / 100 * 6);
  buttonClear.css("top", canvasHeight / 100 * 5);
  buttonClear.css("left", canvasWidth / 100 * 88);
  buttonClear.css("font-size", canvasWidth / 100 * 6);
  // store button parameters
  buttonClearYPos = parseInt(buttonClear.css("top"));
  buttonClearXPos = parseInt(buttonClear.css("left"));
  buttonClearHeight = parseInt(buttonClear.css("height"));
  buttonClearWidth = parseInt(buttonClear.css("width"));
  buttonQRXPos = parseInt(buttonQR.css("left"));
  buttonQRYPos = parseInt(buttonQR.css("top"));
  buttonQRHeight = parseInt(buttonQR.css("height"));
  buttonQRWidth = parseInt(buttonQR.css("width"));
}

// create and style photobooth (countdown, flash effect & QR code display)
function setupPhotobooth() {
  // obtain and style jQuery elements of photobooth
  cdDiv = $("#countdownDiv");
  cdDiv.css("left", canvasWidth / 100 * 45);
  cdDiv.css("top", canvasHeight / 100 * 35);
  cdDiv.css("font-size", canvasWidth / 5);
  flashDiv = $('#flashDiv');
  qrDiv = $("#qrCodeDiv");
  qrDiv.css("left", canvasWidth / 2 - canvasHeight / 4);
  qrDiv.css("top", canvasHeight / 2 - canvasHeight / 4);
}

/* DRAW: handle program state */
function draw() {
  switch (state) {
    case `load`: load(); break;
    case `sim`: sim(); break;
  }
}

// display loading screen
function load() {
  background(255);
  push();
  textSize(canvasWidth / 15);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(`LOADING...`, canvasWidth / 2, canvasHeight / 2);
  pop();
}

// display video feed, GUI and graphic element, store & update hand predictions
function sim() {
  // display mirrored video feed
  displayVideo();
  // display graphic element (not conditional on hand being present)
  image(trailBlazer, 0, 0);
  // update GUI slider values
  updateGuiValues();
  // send handpose model results to hand object & update
  hand.predictions = predictions;
  hand.update();
}

// display mirrored grayscale video feed
function displayVideo() {
  push();
  // mirror video feed
  translate(width,0);
  scale(-1, 1);
  // display video feed
  image(capture, 0, 0, width, height);
  pop();
  // apply grayscale image filter
  filter(GRAY);
}

// update trail styling based on slider values
function updateGuiValues() {
  hand.color.r = sliderColR.slider("value");
  hand.color.g = sliderColG.slider("value");
  hand.color.b = sliderColB.slider("value");
  hand.size = sliderSize.slider("value");

}

// send value to BLE receiver if connected and above threshold
function writeToBLE(yPos) {
  // check if BLE is connected and characteristic is communicating
  if (teloBLE.isConnected() && teloCharacteristic) {
    // constrain received value to range of window height to avoid rollover
    let yPosConstrained = constrain(yPos, 0, height);
    // divide constrained value by height to get percentage relative to total height
    let yPosPercent = yPosConstrained / height;
    // multiply by 255 to remap y position relative to window height to byte range for microcontroller
    let yPosByte = yPosPercent * 255;
    // if y position below threshold vertical position (and last hand present garde-fou check, set inverse value
    // otherwise set value as 0
    if (hand.numberHands > 0 && yPosByte < 200) { teloIntensity = 255 - floor(yPosByte); }
    else { teloIntensity = 0; }
    // console.log(teloIntensity);
    // write constrained relative percentage mapped inverted value (or 0) to BLE
    teloBLE.write(teloCharacteristic, teloIntensity);
  }
}

// keyboard controls for BLE connection and functionality debugging
function keyPressed() {
  // 'c' key toggles connection
  if (keyCode === 67) {
    if (!teloBLE.isConnected()) { connectToBLE(); }
    else { disconnectFromBLE(); }
  }
  // 'f' key toggles fullscreen
  if (keyCode === 70) {
    if (!document.fullscreen) { document.body.requestFullscreen(); }
    else { document.body.exitFullscreen(); }
  }
  // DEBUGGING: 'p' key screenprints
  if (keyCode === 80) { triggerQR(); }
  // DEBUGGING: 'x' key clears graphics elements
  if (keyCode === 88) { trailBlazer.clear(); }
}

// hide GUI elements and trigger screenshot and QR code generation process
function triggerQR() {
  qrTrig = true;
  guiDiv.css("display", "none");
  // trigger countdown and screenshot
  photoboothEffect();
}

// create photobooth effect with countdown and flash
function photoboothEffect() {
  // set countdown duration to three seconds
  let seconds = 3;
  // create interval to iterate through GUI countdown
  let photoboothCountdown = setInterval( () => {
    // when countdown over, clear the interval & take screenshot
    if (seconds <= 0){
      // clear countdown interval
      clearInterval(photoboothCountdown);
      // generate QR Code
      generateQRcode();
      // flash effect
      flashEffect();
    }
    else {
      // write countdown to displayed div with fade in & out effect
      cdDiv.html(seconds);
      cdDiv.fadeTo(400, 1);
      cdDiv.fadeOut(400);
    }
    // count down
    seconds -= 1;
  }, 1000);
}

// flash effect using opacity fading
function flashEffect() {
  flashDiv.fadeTo(100, 0.7);
  flashDiv.fadeOut(100);
}

// take screenshot, send to server and generate QR code with echoed URL
function generateQRcode() {
  // clear contents of QR code div; if a code has already been generated, removes it
  qrDiv.html("");
  // get p5 canvas element, screenshot it, convert to URI and tag with key for PHP retrieval
  let canvas  = document.getElementById("defaultCanvas0");
  let canvasURL = canvas.toDataURL("image/png", 1);
  let data = new FormData();
  data.append("canvasImage", canvasURL);
  // send canvas screenshot URI to server using upload PHP script
  $.ajax({
    type: "POST",
    enctype: 'multipart/form-data',
    url: "upload.php",
    data: data,
    processData: false,
    contentType: false,
    cache: false,
    timeout: 600000,
    // upon upload, generate QR code with image URL
    success: function (response) {
      // append header to returned image URL
      let imageURL = `http://hybrid.concordia.ca/i_planch/telomatic/${response}`;
      // DEBUGGING: output headed image URL to console
      console.log(imageURL);
      // make styled QR code with headed image URL
      let qrcode = new QRCode("qrCodeDiv", {
        text: imageURL,
        width: height/2,
        height: height/2,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
      // display div QR code is appended to
        qrDiv.css("display", "block");
      // create 10s timeout for QR display and GUI hiding
      resetGUI = setTimeout( () => { resetGUIElements(); }, 10000);
    },
    // helper function
    error: function() { console.log("error occurred"); }
  });
}

// hide QR code div and re-display GUI elements
function resetGUIElements() {
  qrDiv.css("display", "none");
  guiDiv.css("display", "block");
  qrTrig = false;
}

// connect to device by passing the service UUID
function connectToBLE() {
  teloBLE.connect(TELO_UUID, gotCharacteristics);
}

// set BLE write characteristic
function gotCharacteristics(error, characteristics) {
  // print connection error, if applicable
  if (error) console.log('error: ', error);
  console.log('characteristics: ', characteristics);
  // Set the first characteristic as writing characteristic
  teloCharacteristic = characteristics[0];
}

// disconnect from BLE, sending preemptive kill value
function disconnectFromBLE() {
  teloBLE.write(teloCharacteristic, 0);
  teloBLE.disconnect();
}
