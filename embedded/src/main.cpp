#include <WiFi.h>
#include <HTTPClient.h>
#include <MFRC522.h>
#include <SPI.h>

// Pin definitions
#define RST_PIN 5      // Reset pin
#define SS_PIN 4       // SDA pin (also called SS)
#define LED_RED 12     // Red pin of RGB LED
#define LED_GREEN 13   // Green pin of RGB LED
#define LED_BLUE 14    // Blue pin of RGB LED

MFRC522 mfrc522(SS_PIN, RST_PIN);

// Network configuration
const char *ssid = "Sharma."; // WIFI SSID
const char *password = "sharma97531"; // WIFI Password
const char *serverUrl = "https://epresence-server.shuttleapp.rs/scan";
const int group_id = 1; // Group ID to assiciate with the ESP32

// Session state
bool isSessionActive = false;

// LED control function
void setLEDColor(int redState, int greenState, int blueState) {
    // Remember: LOW is ON, HIGH is OFF for the LED
    digitalWrite(LED_RED, redState);
    digitalWrite(LED_GREEN, greenState);
    digitalWrite(LED_BLUE, blueState);
}

void turnOffLEDs() {
    setLEDColor(HIGH, HIGH, HIGH);
}

void blinkLED(int redState, int greenState, int blueState, int duration) {
    setLEDColor(redState, greenState, blueState);
    delay(duration);
    turnOffLEDs();
}

void setup() {
    Serial.begin(115200);
    
    // Initialize SPI bus
    SPI.begin(18, 19, 23, 21); // SCK, MISO, MOSI, SS
    mfrc522.PCD_Init();

    // Setup LED pins
    pinMode(LED_RED, OUTPUT);
    pinMode(LED_GREEN, OUTPUT);
    pinMode(LED_BLUE, OUTPUT);
    turnOffLEDs();

    // Connect to WiFi
    Serial.println("Connecting to WiFi...");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(800);
        Serial.println("Connecting...");
        blinkLED(LOW, HIGH, HIGH, 200); // Blink red during connection
    }
    
    Serial.println("Connected to WiFi");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
}

void handleServerResponse(int httpCode, String response) {
    if (httpCode == 201) {  // New session started
        Serial.println("Admin session started");
        isSessionActive = true;
        blinkLED(HIGH, LOW, HIGH, 2000);  // Green flash
    }
    else if (httpCode == 200) {
        if (response.indexOf("session ended") != -1) {  // Session ended
            Serial.println("Session ended");
            isSessionActive = false;
            blinkLED(HIGH, LOW, HIGH, 2000);  // Green flash
        }
        else {  // Attendance marked
            Serial.println("Attendance marked");
            blinkLED(HIGH, LOW, HIGH, 1000);  // Green flash
        }
    }
    else {  // Error
        Serial.println("Error: " + response);
        blinkLED(LOW, HIGH, HIGH, 1000);  // Red flash
    }
}

void loop() {
    // Show session state with blue LED
    if (isSessionActive) {
        digitalWrite(LED_BLUE, LOW);  // Blue ON during active session
    } else {
        digitalWrite(LED_BLUE, HIGH); // Blue OFF when no session
    }

    // Check for new card
    if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
        return;
    }

    // Turn off all LEDs before processing card
    turnOffLEDs();

    // Convert UID to string
    String uid = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        if (mfrc522.uid.uidByte[i] < 0x10) {
            uid += "0";  // Add leading zero for single-digit hex values
        }
        uid += String(mfrc522.uid.uidByte[i], HEX);
    }

    // Send request to server
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    String payload = "{\"rfid\": \"" + uid + "\", \"group_id\": " + String(group_id) + "}";
    
    int httpCode = http.POST(payload);
    if (httpCode > 0) {
        String response = http.getString();
        handleServerResponse(httpCode, response);
    } else {
        Serial.println("Failed to send HTTP request");
        blinkLED(LOW, HIGH, HIGH, 1000);  // Red flash for error
    }
    
    http.end();
    delay(1000);

    // Restore session state LED after processing
    if (isSessionActive) {
        digitalWrite(LED_BLUE, LOW);
    }
}