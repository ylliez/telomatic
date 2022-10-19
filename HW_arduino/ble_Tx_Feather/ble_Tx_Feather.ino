// TELOMATIC - ble - Adafruit Feather M0/32u4 Bluefruit - HW SPI

#include "Adafruit_BluefruitLE_SPI.h"

#define BUFSIZE                        128
#define VERBOSE_MODE                   true

#define BLUEFRUIT_SPI_CS               8
#define BLUEFRUIT_SPI_IRQ              7
#define BLUEFRUIT_SPI_RST              4

Adafruit_BluefruitLE_SPI ble(BLUEFRUIT_SPI_CS, BLUEFRUIT_SPI_IRQ, BLUEFRUIT_SPI_RST);

#define FACTORYRESET_ENABLE         1
#define MINIMUM_FIRMWARE_VERSION    "0.7.0"
#define MODE_LED_BEHAVIOUR          "DISABLE"

const int teloPin = 9;
int teloVal = 0;

void error(const __FlashStringHelper*err) {
  Serial.println(err);
  while (1);
}

void connected(void) {
  Serial.println("Telomatic connected!");
  for (int i = 0 ; i < 2; i++) {
    analogWrite(teloPin, 255);
    delay(100);
    analogWrite(teloPin, 0);
    delay(100);
  }
}

void disconnected(void) {
    Serial.println("Telomatic disconnected!");
    for (int i = 0 ; i < 3; i++) {
      analogWrite(teloPin, 255);
      delay(50);
      analogWrite(teloPin, 0);
      delay(500);
    }
}

void setup(void) {
  
  pinMode(teloPin, OUTPUT);

//  while (!Serial);
//  delay(500);

  Serial.begin(115200);
  Serial.println(F("----------------"));

  /* Initialise the module */
  Serial.print(F("Initialising: "));

  if ( !ble.begin(VERBOSE_MODE) ) { error(F("Couldn't find Bluefruit")); }
  Serial.println( F("OK!") );

  ble.verbose(false);

  if ( FACTORYRESET_ENABLE ) {
    Serial.print(F("Resetting: "));
    if ( ! ble.factoryReset() ) { error(F("Couldn't factory reset")); }
    Serial.println( F("OK!") );
  }

  /* Disable command echo from Bluefruit */
  ble.echo(false); 
  
  /* Wait for connection */
  Serial.print(F("Connecting: "));
  while (! ble.isConnected()) {
    delay(500);
  }
  Serial.println( F("OK!") );

  // Set module to DATA mode
  ble.setMode(BLUEFRUIT_MODE_DATA);

  // Set connection callbacks
  ble.setConnectCallback(connected);
  ble.setDisconnectCallback(disconnected);
  
  Serial.println(F("----------------"));
}

void loop(void) {
  if ( ble.available() ) {
    teloVal = ble.read();
    Serial.print("Intensity: ");
    Serial.println(teloVal);
    analogWrite(teloPin, teloVal);
  }
  ble.update(100);
}
