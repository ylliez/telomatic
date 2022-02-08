// The serviceUuid must match the serviceUuid of the device you would like to connect
const serviceUuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
let myBLE, myCharacteristic;
let connectButton, onButton, offButton;

function setup() {
  myBLE = new p5ble();
  createBleButtons();
}

function createBleButtons() {
  // connect button
  connectButton = createButton('Connect')
  connectButton.mousePressed(connectToBle);
  // on button
  onButton = createButton('On');
  onButton.mousePressed(bleOn);
  // off button
  offButton = createButton('Off');
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

function bleOn() { myBLE.write(myCharacteristic, 255); }

function bleOff() { myBLE.write(myCharacteristic, 0); }
