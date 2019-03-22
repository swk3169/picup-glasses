int trig = 2;
 
void setup() {                
  // initialize the digital pins as output.
  pinMode(trig, OUTPUT);
  digitalWrite(trig, HIGH);              
}
 
// Hold HIGH and trigger quick (<250ms) LOW to take a photo. Holding LOW and trigger HIGH starts/stops video recording
 
void loop() {
  digitalWrite(trig, LOW);   
  delay(50);               
  digitalWrite(trig, HIGH);    
  //Delay between pictures
  delay(5000);               
  
}
