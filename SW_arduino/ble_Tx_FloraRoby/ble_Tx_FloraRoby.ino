/* TELOMATIC - ble - Flora + Flora Bluefruit */

#include <Arduino.h>
#include <SPI.h>
#include "Adafruit_BluefruitLE_UART.h"

#define BUFSIZE                        128   // Size of the read buffer for incoming data
#define VERBOSE_MODE                   true  // If set to 'true' enables debug output

#define BLUEFRUIT_HWSERIAL_NAME      Serial1

#define BLUEFRUIT_UART_MODE_PIN        12    // Set to -1 if unused
#define BLUEFRUIT_UART_CTS_PIN         -1   // Required for software serial
#define BLUEFRUIT_UART_RTS_PIN         -1   // Optional, set to -1 if unused

Adafruit_BluefruitLE_UART ble(BLUEFRUIT_HWSERIAL_NAME, BLUEFRUIT_UART_MODE_PIN);

#define FACTORYRESET_ENABLE         0   // set to 0 when deploying!
#define MINIMUM_FIRMWARE_VERSION    "0.6.6"
#define MODE_LED_BEHAVIOUR          "DISABLE"

const int teloPin = 9;
int teloVal = 0;

// A small helper
void error(const __FlashStringHelper*err) {
  Serial.println(err);
  while (1);
}

void connected(void) {
  ble.setMode(BLUEFRUIT_MODE_DATA);
  for (int i = 0 ; i < 3; i++) {
    analogWrite(teloPin, 255);
    delay(100);
    analogWrite(teloPin, 0);
    delay(100);
  }
  Serial.println( "Connected CB" );
  ble.setMode(BLUEFRUIT_MODE_COMMAND);
}

void disconnected(void) {
  ble.setMode(BLUEFRUIT_MODE_DATA);
    for (int i = 0 ; i < 3; i++) {
    analogWrite(teloPin, 255);
    delay(50);
    analogWrite(teloPin, 0);
    delay(500);
  }
  Serial.println( "Disconnected CB" );
  ble.setMode(BLUEFRUIT_MODE_COMMAND);
}

void setup(void) {

  pinMode(teloPin, OUTPUT);
  
  //  while (!Serial);
  //  delay(500);

  Serial.begin(115200);
  Serial.println(F("----------------"));

  /* Initialise the module */
  Serial.print(F("Initialising: "));
  if ( !ble.begin(VERBOSE_MODE) ) {
    error(F("Couldn't find Bluefruit"));
  }
  Serial.println( F("OK!") );

  ble.verbose(false);

  if ( FACTORYRESET_ENABLE ) {
    Serial.print(F("Resetting: "));
    if ( ! ble.factoryReset() ) {
      error(F("Couldn't factory reset"));
    }
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

  //  // Set disconnect callback
  ble.setConnectCallback(connected);
  ble.setDisconnectCallback(disconnected);
  //  ble.setBleUartRxCallback(

  Serial.println(F("----------------"));
}

void loop(void) {
  //Serial.println("hello");
  //  ble.setMode(BLUEFRUIT_MODE_COMMAND);
  //  bool c = ble.isConnected();
  //  ble.setMode(BLUEFRUIT_MODE_DATA);
  //  Serial.println(c);

  //  delay(50);
  //  Serial.println("hello");
  //  Serial.println(c);
  //  delay(100);
  //
  //ble.setMode(BLUEFRUIT_MODE_DATA);

    if ( ble.available() ) {
       teloVal = ble.read();
       Serial.print("Intensity: ");
       Serial.println(teloVal);
       analogWrite(teloPin, teloVal);
     }
  //   else {
  //    analogWrite(teloPin, 0);
  //    Serial.println("NOTHING");
  //   }
  //    delay(50);
  //bool c = ble.isConnected();
  //Serial.println(c);
    ble.update(100);
  //Serial.println("bye");
  
//  ble.update(200);
    
//  teloVal = ble.read();
//  Serial.print("Intensity: ");
//  Serial.println(teloVal);

//  if (!ble.available()) {
//    Serial.println("Disconnected!");
//    analogWrite(teloPin, 0);
//  }

//  if (!ble.isConnected()) {
//  Serial.println("Disconnected!");
//  analogWrite(teloPin, 0);
//  }
}
