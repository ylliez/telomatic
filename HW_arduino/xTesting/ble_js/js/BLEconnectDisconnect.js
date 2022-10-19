// from https://editor.p5js.org/jingwen_zhu/sketches/R3-iiTn8H

// The serviceUuid must match the serviceUuid of the device you would like to connect
/* invalid UUIDs
const serviceUuid = "19b10010-e8f2-537e-4f6c-d104768a1214";
const serviceUuid = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
// device information (primary service)
const serviceUuid = "0x180A";
const serviceUuid = "0x180a";
// generic access
const serviceUuid = "0x1800";
// UART alias?
const serviceUuid = "0x2900";
*/

/* valid UUIDs
// generic access
const serviceUuid = "00002a00-0000-1000-8000-00805f9b34fb";
// UART
const serviceUuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
*/

const serviceUuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
let myBLE;
let isConnected = false;

function setup() {
  // Create a p5ble class
  myBLE = new p5ble();

  createCanvas(200, 200);
  textSize(20);
  textAlign(CENTER, CENTER);

  // Create a 'Connect' button
  const connectButton = createButton('Connect')
  connectButton.mousePressed(connectToBle);

  // Create a 'Disconnect' button
  const disconnectButton = createButton('Disconnect')
  disconnectButton.mousePressed(disconnectToBle);
}

function connectToBle() {
  // Connect to a device by passing the service UUID
  myBLE.connect(serviceUuid, gotCharacteristics);
}

function disconnectToBle() {
  // Disonnect to the device
  myBLE.disconnect();
  // Check if myBLE is connected
  isConnected = myBLE.isConnected();
}

function onDisconnected() {
  console.log('Device got disconnected.');
  isConnected = false;
}

// A function that will be called once got characteristics
function gotCharacteristics(error, characteristics) {
  if (error) console.log('error: ', error);
  console.log('characteristics: ', characteristics);

  // Check if myBLE is connected
  isConnected = myBLE.isConnected();

  // Add a event handler when the device is disconnected
  myBLE.onDisconnected(onDisconnected)
}

function draw() {
  if (isConnected) {
    background(0, 255, 0);
    text('Connected!', 100, 100);
  } else {
    background(255, 0, 0);
    text('Disconnected :/', 100, 100);
  }
}
