// Adafruit Feather M0 Bluefruit - HW SPI

#include <Arduino.h>
#include <SPI.h>
#include "Adafruit_BLE.h"
#include "Adafruit_BluefruitLE_SPI.h"

#define BUFSIZE                        128
#define VERBOSE_MODE                   true

#define BLUEFRUIT_SPI_CS               8
#define BLUEFRUIT_SPI_IRQ              7
#define BLUEFRUIT_SPI_RST              4

Adafruit_BluefruitLE_SPI ble(BLUEFRUIT_SPI_CS, BLUEFRUIT_SPI_IRQ, BLUEFRUIT_SPI_RST);

#define FACTORYRESET_ENABLE         1
#define MINIMUM_FIRMWARE_VERSION    "0.6.6"
#define MODE_LED_BEHAVIOUR          "MODE"

// A small helper
void error(const __FlashStringHelper*err) {
  Serial.println(err);
  while (1);
}

const int teloPin = 9;
int teloVal = 0;

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

  Serial.println(F("----------------"));
}

void loop(void) {
  while ( ble.available() ) {
    teloVal = ble.read();
    Serial.print("Intensity: ");
    Serial.println(teloVal);
    analogWrite(teloPin, teloVal);
  }
}
