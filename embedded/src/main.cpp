#include <WiFi.h>
#include <HTTPClient.h>
#include <MFRC522.h>
#include <SPI.h>

#define RST_PIN 5         // Reset pin
#define SS_PIN 4          // SDA pin (also called SS)
#define LED_NEGATIVE 13   // Connect an LED for negative response
#define LED_POSITIVE 12    // Connect an LED for positive response

MFRC522 mfrc522(SS_PIN, RST_PIN);

const char *ssid = "Airtel_maya_1903";
const char *password = "Air@28270";
const char *serverUrl = "http://192.168.179.249:5000/log-rfid";
WiFiClient client;

String lastUid = "";  // Store last scanned UID to avoid duplicate logging

void setup() {
  Serial.begin(115200);
  SPI.begin(18, 19, 23, 21);  // SCK, MISO, MOSI, SS
  mfrc522.PCD_Init();

  // Initialize LED pins
  pinMode(LED_NEGATIVE, OUTPUT);
  pinMode(LED_POSITIVE, OUTPUT);
  digitalWrite(LED_NEGATIVE, HIGH);
  digitalWrite(LED_POSITIVE, HIGH);

  // Connect to Wi-Fi
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(800);
    Serial.println("Connecting...");
  }
  Serial.println("Connected to WiFi");

  // Print the ESP32's IP address
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // Read and format UID
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uid += String(mfrc522.uid.uidByte[i], HEX);
  }

  // Check if this UID has already been scanned
  if (uid == lastUid) {
    Serial.println("Card already scanned, ignoring...");
    digitalWrite(LED_NEGATIVE, LOW);
    delay(700);  // Keep LED on for a moment to indicate successful scan
    digitalWrite(LED_NEGATIVE, HIGH);
    return;
  }

  // Log UID to Flask server
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"uid\": \"" + uid + "\"}";  // Create JSON payload

  int httpCode = http.POST(payload);  // Send POST request
  if (httpCode > 0) {
    Serial.println("UID logged successfully");

    // Turn on positive LED
    digitalWrite(LED_POSITIVE, LOW);
    delay(700);  // Keep LED on for a moment to indicate successful scan
    digitalWrite(LED_POSITIVE, HIGH);

    // Update last scanned UID
    lastUid = uid;
  } else {
    Serial.println("Failed to log UID");

    // Turn on negative LED as an error indicator
    digitalWrite(LED_NEGATIVE, LOW);
    delay(700);  // Keep LED on for a moment
    digitalWrite(LED_NEGATIVE, HIGH);
  }

  http.end();
  delay(1000);  // Delay before scanning the next card
}
