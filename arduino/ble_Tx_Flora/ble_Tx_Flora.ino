/* TELOMATIC - ble - Flora + Flora Bluefruit */

#include <Arduino.h>
#include <SPI.h>
#include "Adafruit_BLE.h"
#include "Adafruit_BluefruitLE_UART.h"

#define BUFSIZE                        128   // Size of the read buffer for incoming data
#define VERBOSE_MODE                   true  // If set to 'true' enables debug output

#define BLUEFRUIT_HWSERIAL_NAME      Serial1

#define BLUEFRUIT_UART_MODE_PIN        -1    // Set to -1 if unused
#define BLUEFRUIT_UART_CTS_PIN         -1   // Required for software serial
#define BLUEFRUIT_UART_RTS_PIN         -1   // Optional, set to -1 if unused

Adafruit_BluefruitLE_UART ble(BLUEFRUIT_HWSERIAL_NAME, BLUEFRUIT_UART_MODE_PIN);

#define FACTORYRESET_ENABLE         1   // set to 0 when deploying!
#define MINIMUM_FIRMWARE_VERSION    "0.6.6"
#define MODE_LED_BEHAVIOUR          "DISABLE"

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
