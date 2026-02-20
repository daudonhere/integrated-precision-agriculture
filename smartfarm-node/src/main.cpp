#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <PubSubClient.h>

#define I2C_SDA 2
#define I2C_SCL 1
#define DHTPIN 10
#define DHTTYPE DHT22
#define TRIG_PIN 17
#define ECHO_PIN 18
#define PIN_MOIST 5
#define PIN_PH 6
#define PIN_NPK 7
#define PIN_LED_RED 12
#define PIN_LED_GREEN 13
#define PIN_BUZZER 14

const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_topic = "daud/smartfarm/data";

LiquidCrystal_I2C lcd(0x27, 20, 4);
DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

struct FarmData {
  float temp, hum, ph;
  int moist, n, p, k, water;
  String message;
  bool isAnomaly;
} data;

unsigned long prevMillis = 0;
const int buzzerChan = 0;

void setup_wifi();
void reconnect();
void readSensors();
void checkHealth();
void updateLCD();
void publishData();

void setup() {
  Serial.begin(115200);
  
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  ledcSetup(buzzerChan, 2000, 8);
  ledcAttachPin(PIN_BUZZER, buzzerChan);

  Wire.begin(I2C_SDA, I2C_SCL);
  lcd.init();
  lcd.backlight();
  
  lcd.setCursor(0,0); lcd.print("SmartFarm Node");

  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  if (millis() - prevMillis > 3000) {
    prevMillis = millis();
    readSensors();
    checkHealth();
    updateLCD();
    publishData();
  }
}

void readSensors() {
  data.temp = dht.readTemperature();
  data.hum = dht.readHumidity();
  
  data.moist = map(analogRead(PIN_MOIST), 0, 4095, 0, 100);
  data.ph = (float)map(analogRead(PIN_PH), 0, 4095, 0, 140) / 10.0;
  
  int rawNPK = map(analogRead(PIN_NPK), 0, 4095, 0, 500);
  data.n = rawNPK;
  data.p = rawNPK * 0.8;
  data.k = rawNPK * 0.5;
  
  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  data.water = pulseIn(ECHO_PIN, HIGH) * 0.034 / 2;
}

void checkHealth() {
  data.isAnomaly = true;

  if (data.temp < 18.0 || data.temp > 35.0) {
    data.message = "Extreme temperature";
  } 
  else if (data.hum < 40.0 || data.hum > 90.0) {
    data.message = "Humidity not ideal";
  }
  else if (data.water < 10) {
    data.message = "Water supply critical";
  }
  else if (data.moist < 40) {
    data.message = "Soil too dry";
  }
  else if (data.moist > 85) {
    data.message = "Soil too wet";
  }
  else if (data.ph < 5.5 || data.ph > 7.5) {
    data.message = "Soil pH not ideal";
  }
  else if (data.n < 50) {
    data.message = "Low nutrient level";
  }
  else if (data.n > 450) {
    data.message = "Over nutrient detected";
  }
  else {
    data.isAnomaly = false;
    data.message = "System Normal";
  }

  if (data.isAnomaly) {
    digitalWrite(PIN_LED_RED, HIGH);
    digitalWrite(PIN_LED_GREEN, LOW);
    ledcWrite(buzzerChan, 128);
  } else {
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_LED_GREEN, HIGH);
    ledcWrite(buzzerChan, 0);
  }
}

void updateLCD() {
  lcd.clear();
  lcd.setCursor(0,0); 
  lcd.print(data.isAnomaly ? "!! ALERT !!" : "Status: Normal");
  
  lcd.setCursor(0,1); 
  lcd.printf("T:%.1fC H:%.0f%% W:%d", data.temp, data.hum, data.water);
  
  lcd.setCursor(0,2); 
  lcd.printf("Moist:%d%% pH:%.1f", data.moist, data.ph);
  
  lcd.setCursor(0,3); 
  lcd.printf("N:%d P:%d K:%d", data.n, data.p, data.k);
}

void publishData() {
  StaticJsonDocument<512> doc;
  doc["id"] = "NODE-01";
  doc["ts"] = millis();
  doc["lat"] = -6.92148;
  doc["lon"] = 106.92617;
  doc["message"] = data.message;
  
  JsonObject p = doc.createNestedObject("payload");
  p["temp"] = data.temp; p["hum"] = data.hum; p["moist"] = data.moist;
  p["ph"] = data.ph; p["n"] = data.n; p["p"] = data.p; p["k"] = data.k; 
  p["water"] = data.water;
  
  char buffer[512];
  serializeJson(doc, buffer);
  client.publish(mqtt_topic, buffer);
  Serial.println(buffer);
}

void setup_wifi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi Connected");
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("Node-01-Daud")) {
      Serial.println("MQTT Connected");
    } else {
      delay(5000);
    }
  }
}