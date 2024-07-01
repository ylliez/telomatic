"use strict";

/* GENERAL */
// Program state (load, sim)
let state = `load`;
// Video capture element, input feed, and dimensions
const captureElement = document.getElementById('capture');
const captureDimensions = {
    width: 1280,
    height: 720,
    // Alternatively:
    // width: 640, height: 480,
    // width: 768, height: 494,
    // width: window.innerWidth, height: window.innerHeight,
};
const aspectRatio = captureDimensions.width / captureDimensions.height;
let capture;
let canvasDimensions = { width: 0, height: 0 };

// GUI elements
let guiDiv, sliders, icons;
let sliderCol, sliderSize;
let buttonClear, buttonQR;
let photoboothDiv, qrDiv, cdDiv, flashDiv;

// QR trigger boolean
let qrTrig = false;
// GUI reset timer
let resetGUI;
// Output graphics display element
let trailBlazer;

// MediaPipe handpose recognition model
let hands, predictions = [], hand;

// BLE settings
const TELO_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
let teloBLE, teloCharacteristic, teloIntensity;

/* SETUP: Initialize canvas, video, and model */
function setup() {
    setupCanvas();
    handposeSetup();
    hand = new Hand();
    capture = select(`#capture`);
    trailBlazer = createGraphics(width, height);
    teloBLE = new p5ble();
    setupGuiElements();
}

function setupCanvas() {
    const { width, height } = window;
    createCanvas(width, width / aspectRatio);
}

function handposeSetup() {
    hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    hands.setOptions({
        selfieMode: true,
        maxNumHands: 6,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    hands.onResults((results) => {
        state = `sim`;
        predictions = results;
    });

    const camera = new Camera(captureElement, {
        onFrame: async () => {
            await hands.send({ image: captureElement });
        },
        width: captureDimensions.width,
        height: captureDimensions.height
    });
    camera.start();
}

function setupGuiElements() {
    canvasDimensions.width = parseInt($("#defaultCanvas0").css("width"));
    canvasDimensions.height = parseInt($("#defaultCanvas0").css("height"));

    guiDiv = $("#GUI").css("width", canvasDimensions.width);
    photoboothDiv = $("#photobooth").css("width", canvasDimensions.width);

    setupSliders();
    setupIcons();
    setupPhotobooth();
}

function setupSliders() {
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

    sliderCol = $(".sliderCol");
    sliderSize = $("#sliderSize");

    $(".ui-slider").css("position", "absolute");
    styleSliderElements();

    sliderCol.slider("value", hand.color.r);
    sliderCol.slider("value", hand.color.g);
    sliderCol.slider("value", hand.color.b);
    sliderSize.slider("value", hand.size);
}

function styleSliderElements() {
    const { width, height } = canvasDimensions;

    sliderCol.css("top", height * 0.05).css("height", height * 0.05);
    $(".ui-slider-handle").css("height", height * 0.06);
    $("#sliderColR").css("left", width * 0.20);
    $("#sliderColG").css("left", width * 0.43);
    $("#sliderColB").css("left", width * 0.65);
    sliderSize.css("top", height * 0.30).css("height", height * 0.50).css("left", width * 0.925);
    $(".ui-slider-handle")[0].style.height = `${hand.size}px`;
    $(".ui-slider-handle")[0].style.width = `${hand.size}px`;
}

function setupIcons() {
    buttonQR = $("#qrIcon");
    buttonClear = $("#xIcon");

    buttonQR.css({ top: canvasDimensions.height * 0.05, left: canvasDimensions.width * 0.05, fontSize: canvasDimensions.width * 0.06 });
    buttonClear.css({ top: canvasDimensions.height * 0.05, left: canvasDimensions.width * 0.88, fontSize: canvasDimensions.width * 0.06 });
}

function setupPhotobooth() {
    cdDiv = $("#countdownDiv").css({ left: canvasDimensions.width * 0.45, top: canvasDimensions.height * 0.35, fontSize: canvasDimensions.width / 5 });
    flashDiv = $('#flashDiv');
    qrDiv = $("#qrCodeDiv").css({ left: canvasDimensions.width / 2 - canvasDimensions.height / 4, top: canvasDimensions.height / 2 - canvasDimensions.height / 4 });
}

function draw() {
    if (state === `load`) loadScreen();
    else if (state === `sim`) simulate();
}

function loadScreen() {
    background(255);
    push();
    textSize(canvasDimensions.width / 15);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(`LOADING...`, canvasDimensions.width / 2, canvasDimensions.height / 2);
    pop();
}

function simulate() {
    displayVideo();
    image(trailBlazer, 0, 0);
    updateGuiValues();
    hand.predictions = predictions;
    hand.update();
}

function displayVideo() {
    push();
    translate(width, 0);
    scale(-1, 1);
    image(capture, 0, 0, width, height);
    pop();
    filter(GRAY);
}

function updateGuiValues() {
    hand.color.r = $("#sliderColR").slider("value");
    hand.color.g = $("#sliderColG").slider("value");
    hand.color.b = $("#sliderColB").slider("value");
    hand.size = $("#sliderSize").slider("value");
}

function writeToBLE(yPos) {
    if (teloBLE.isConnected() && teloCharacteristic) {
        let yPosConstrained = constrain(yPos, 0, height);
        let yPosPercent = yPosConstrained / height;
        let yPosByte = yPosPercent * 255;

        teloIntensity = (hand.numberHands > 0 && yPosByte < 200) ? 255 - floor(yPosByte) : 0;
        teloBLE.write(teloCharacteristic, teloIntensity);
    }
}

function keyPressed() {
    if (keyCode === 67) { toggleBLEConnection(); }
    if (keyCode === 70) { toggleFullscreen(); }
    if (keyCode === 80) { triggerQR(); }
    if (keyCode === 88) { trailBlazer.clear(); }
}

function toggleBLEConnection() {
    if (!teloBLE.isConnected()) connectToBLE();
    else disconnectFromBLE();
}

function toggleFullscreen() {
    if (!document.fullscreen) document.body.requestFullscreen();
    else document.body.exitFullscreen();
}

function triggerQR() {
    qrTrig = true;
    guiDiv.css("display", "none");
    photoboothEffect();
}

function photoboothEffect() {
    let seconds = 3;
    let photoboothCountdown = setInterval(() => {
        if (seconds <= 0) {
            clearInterval(photoboothCountdown);
            generateQRcode();
            flashEffect();
        } else {
            cdDiv.html(seconds);
            cdDiv.fadeTo(400, 1);
            cdDiv.fadeOut(400);
            seconds -= 1;
        }
    }, 1000);
}

function flashEffect() {
    flashDiv.fadeTo(100, 0.7);
    flashDiv.fadeOut(100);
}

function generateQRcode() {
    qrDiv.html("");
    let canvas = document.getElementById("defaultCanvas0");
    let canvasURL = canvas.toDataURL("image/png", 1);
    let data = new FormData();
    data.append("canvasImage", canvasURL);

    $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: "upload.php",
        data: data,
        processData: false,
        contentType: false,
        cache: false,
        timeout: 800000,
        success: (data) => {
            let qr = new QRCode("qrCodeDiv");
            qr.makeCode(data);
            qrDiv.fadeIn(200);
            setTimeout(() => { qrDiv.fadeOut(200); guiDiv.css("display", "block"); }, 3000);
        },
        error: (error) => console.error("Error uploading image: ", error)
    });
}

function connectToBLE() {
    teloBLE.connect(TELO_UUID, (error, characteristics) => {
        if (error) {
            console.error("Connection failed: ", error);
            return;
        }
        teloCharacteristic = characteristics[0];
        console.log("BLE connected");
    });
}

function disconnectFromBLE() {
    teloBLE.disconnect();
    console.log("BLE disconnected");
}

function windowResized() {
    const { width } = window;
    resizeCanvas(width, width / aspectRatio);
    setupGuiElements();
}