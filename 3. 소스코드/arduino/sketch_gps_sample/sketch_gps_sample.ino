#include <SoftwareSerial.h>

int gpsTx=6; // Tx (보내는핀 설정)
int gpsRx=5; // Rx (받는핀 설정)
SoftwareSerial gpsSerial(gpsTx,gpsRx);

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  Serial.println("Start GPS...");
  gpsSerial.begin(9600);
}

void loop() {
  // put your main code here, to run repeatedly:
    if(gpsSerial.available()) {
    Serial.write(gpsSerial.read());
  }
}
