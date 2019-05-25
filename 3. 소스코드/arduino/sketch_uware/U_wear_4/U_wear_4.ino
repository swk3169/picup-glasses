#include <SPI.h>
#include <SoftwareSerial.h>
#include <Wire.h>
#include <SparkFun_APDS9960.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define OLED_RESET 4
Adafruit_SSD1306 display(OLED_RESET);


SparkFun_APDS9960 apds = SparkFun_APDS9960();

int sec = 00;
int mn = 00;
int hr = 00;


SoftwareSerial BT(10,11);
String state;
enum mode {
    Camera,
    Time,
    Message
};
mode currentMode;
void loopCamera() {
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(40,25);
  display.println("Camera");
  display.display();
  if ( apds.isGestureAvailable() ){
    switch ( apds.readGesture() ) {
      case DIR_RIGHT:
      digitalWrite(12,HIGH);
      delay(100);
      digitalWrite(12, LOW);   
      delay(50);             
      digitalWrite(12, HIGH);  
      Serial.print("right");
      display.clearDisplay();
      display.setTextSize(1);
      display.setTextColor(WHITE);
      display.setCursor(35,20);
      display.println("Pic. Taken");
      Serial.println("serial pic taken");
      display.display();
      delay(800);
      display.clearDisplay();
      break;
      
      case DIR_LEFT:
      Serial.println("serial video taken");
      digitalWrite(12,HIGH);
      delay(100);
      digitalWrite(12, LOW);   
      delay(35000);            
      digitalWrite(12, HIGH);  
      display.clearDisplay();
      display.setTextSize(1);
      display.setTextColor(WHITE);
      display.setCursor(0,10);
      display.println("video");
            
      display.display();
      break;
      
      case DIR_DOWN:
      currentMode = Time;
    }
  }
}
   
void loopTime() {
  digitalWrite(12, LOW);
  Serial.println(BT.available());
  Serial.println("\n");
  while (BT.available()){
    char c = BT.read();
    state += c;
  }
  String currentTime=state.substring(0, 19);
  Serial.print("currentTime : ");
  Serial.println(currentTime);
  if(state.startsWith(""))
  {
    display.clearDisplay();
    Serial.println(state);
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.setCursor(0,10);
    display.print("current time");
    display.setCursor(0,20);
    display.print(currentTime);
    display.display();
    delay(990);
    state = ("");
  }
}

void setup() {
  pinMode(12, OUTPUT);
  digitalWrite(12, LOW);
  BT.begin(9600);
  // Set interrupt pin as input
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.display();
  delay(2000);
  display.clearDisplay();

  // Initialize Serial port
  Serial.begin(9600);
  Serial.println();
  Serial.println(F("--------------------------------"));
  Serial.println(F("SparkFun APDS-9960 - GestureTest"));
  Serial.println(F("--------------------------------"));
  
  // Initialize APDS-9960 (configure I2C and initial values)
  if ( apds.init() ) {
    Serial.println(F("APDS-9960 initialization complete"));
  } else {
    Serial.println(F("Something went wrong during APDS-9960 init!"));
  }
  
  // Start running the APDS-9960 gesture sensor engine
  if ( apds.enableGestureSensor(true) ) {
    Serial.println(F("Gesture sensor is now running"));
  } else {
    Serial.println(F("Something went wrong during gesture sensor init!"));
  }
  currentMode = Time;
}

void loop() {
  handleGesture();
  switch (currentMode) {
        case Camera:
        loopCamera();
        break;
        
        case Time:
        display.clearDisplay();
        loopTime();
        break;
}

void handleGesture() {
    if (apds.isGestureAvailable()) {
        if (DIR_UP) {
            display.clearDisplay();
            currentMode = Camera;
        } else if (DIR_DOWN) {
            currentMode = Time;
        }
    }
}
