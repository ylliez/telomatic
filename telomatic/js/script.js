// The serviceUuid must match the serviceUuid of the device you would like to connect
const serviceUuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
let myCharacteristic;
let input;
let myBLE;

function setup() {
  myBLE = new p5ble();

  createBleButtons();

}

function createBleButtons() {
  // connect button
  const connectButton = createButton('Connect');
  connectButton.position(10, 10);
  connectButton.mousePressed(connectToBle);

  // text input
  input = createInput();
  input.position(10, 30);

  // write button
  const writeButton = createButton('Write');
  writeButton.mousePressed(writeToBle);
  writeButton.position(10, 50);
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

function writeToBle() {
  const inputValue = input.value();
  // Write the value of the input to the myCharacteristic
  myBLE.write(myCharacteristic, inputValue);
}
