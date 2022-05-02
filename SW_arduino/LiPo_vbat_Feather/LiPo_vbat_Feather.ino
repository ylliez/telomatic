// https://learn.adafruit.com/adafruit-feather-m0-adalogger/power-management

void setup(void) {}

void loop(void) {
   Serial.println(analogRead(A7) * 2 * 3.3 / 1024);
}
