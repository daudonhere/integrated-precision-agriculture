# SmartFarm Node - ESP32 Firmware

ESP32 firmware for SmartFarm IoT sensor node. Supports Wokwi simulation and physical device deployment.

## 📋 Specifications

| Item | Detail |
|------|--------|
| **Board** | ESP32-S3-DevKitC-1 |
| **Framework** | Arduino (PlatformIO) |
| **Sensors** | DHT22, Soil Moisture, pH, NPK, Ultrasonic |
| **Output** | LCD I2C, LEDs, Buzzer |
| **Communication** | WiFi + MQTT |
| **MQTT Broker** | `broker.hivemq.com:1883` |
| **MQTT Topic** | `daud/smartfarm/data` |

---

## 🛠️ Required VSCode Extensions

Install these 3 extensions for development:

| Extension | ID | Purpose |
|-----------|-----|---------|
| **Wokwi Simulator** | `wokwi.wokwi-vscode` | Simulate ESP32 without hardware |
| **PlatformIO IDE** | `platformio.platformio-ide` | Compile & upload firmware |
| **C/C++** | `ms-vscode.cpptools` | IntelliSense for C++ |

### Installation

**Via Command Line:**
```bash
code --install-extension wokwi.wokwi-vscode
code --install-extension platformio.platformio-ide
code --install-extension ms-vscode.cpptools
```

**Via VSCode UI:**
1. Press `Ctrl+Shift+X` (Extensions)
2. Search extension name
3. Click **Install**

---

## 🚀 How to Run

### Option 1: Wokwi Simulation (No Hardware Required)

**Step 1: Open Diagram**
```bash
cd ~/Documents/github/integrated-precision-agriculture/smartfarm-node
```

In VSCode Explorer:
1. Open `smartfarm-node/` folder
2. Click on `diagram.json` file
3. Click **"Start Simulation"** button above the editor

**Step 2: Wait for Boot**
- ESP32 will boot automatically
- LCD displays "SmartFarm Node"
- Serial Monitor opens automatically

**Step 3: View JSON Output**
In Serial Monitor, wait for output like this:
```
WiFi Connected
MQTT Connected
{"id":"NODE-01","ts":12345678,"lat":-6.92148,"lon":106.92617,"message":"System Normal","payload":{"temp":28.5,"hum":65,"moist":55,"ph":6.8,"n":200,"p":160,"k":100,"water":25}}
```

Data publishes every **3 seconds**.

**Step 4: Interact**
- Slide potentiometers to simulate sensors:
  - `pot1` → Soil Moisture
  - `pot2` → Soil pH
  - `pot3` → Soil NPK
- LCD updates in real-time
- Red LED turns on when anomaly detected

**Stop Simulation:**
- Click **"Stop"** button in Wokwi window

---

### Option 2: Build Firmware (Without Upload)

```bash
cd ~/Documents/github/integrated-precision-agriculture/smartfarm-node

# Build firmware
pio run

# Output: .pio/build/esp32-s3-devkitc-1/firmware.bin
```

---

### Option 3: Upload to Physical Device

**Prerequisites:**
- ESP32-S3-DevKitC-1 connected via USB
- WiFi credentials updated in `src/main.cpp`

**Step 1: Update WiFi Credentials**

Edit `src/main.cpp`:
```cpp
// Replace these lines:
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// With your WiFi:
const char* ssid = "Your-WiFi-Name";
const char* password = "Your-WiFi-Password";
```

**Step 2: Upload**
```bash
# Build and upload
pio run --target upload

# Or via PlatformIO UI:
# Ctrl+Shift+P → "PlatformIO: Upload"
```

**Step 3: Monitor Serial**
```bash
# Monitor output
pio device monitor --speed 115200

# Or via UI:
# Click "Plug" icon in bottom status bar
```

**Expected Output:**
```
SmartFarm Node
WiFi Connected
MQTT Connected
{"id":"NODE-01","ts":12345678,...}
```

---

## 📊 MQTT Data Format

**Topic:** `daud/smartfarm/data`

**Payload JSON:**
```json
{
  "id": "NODE-01",
  "ts": 1234567890,
  "lat": -6.92148,
  "lon": 106.92617,
  "message": "System Normal",
  "payload": {
    "temp": 28.5,
    "hum": 65,
    "moist": 55,
    "ph": 6.8,
    "n": 200,
    "p": 160,
    "k": 100,
    "water": 25
  }
}
```

**Field Descriptions:**

| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `id` | String | - | Node identifier |
| `ts` | Integer | ms | Timestamp (millis) |
| `lat` | Float | - | Latitude coordinate |
| `lon` | Float | - | Longitude coordinate |
| `message` | String | - | Status message |
| `payload.temp` | Float | °C | Air temperature |
| `payload.hum` | Float | % | Air humidity |
| `payload.moist` | Integer | % | Soil moisture |
| `payload.ph` | Float | - | Soil pH |
| `payload.n` | Integer | ppm | Nitrogen |
| `payload.p` | Integer | ppm | Phosphorus |
| `payload.k` | Integer | ppm | Potassium |
| `payload.water` | Integer | cm | Water level (ultrasonic) |

---

## 🔧 PlatformIO Commands

| Command | Description |
|---------|-------------|
| `pio run` | Build firmware |
| `pio run --target upload` | Build + upload to device |
| `pio device monitor --speed 115200` | Serial monitor |
| `pio test` | Run unit tests |
| `pio run --target clean` | Clean build files |
| `pio lib list` | List installed libraries |

**Via UI (Ctrl+Shift+P):**
- `PlatformIO: Build`
- `PlatformIO: Upload`
- `PlatformIO: Serial Monitor`
- `PlatformIO: Clean`

---

## 📁 Folder Structure

```
smartfarm-node/
├── src/
│   └── main.cpp          # Main firmware code
├── include/              # Header files (.h)
├── lib/                  # Local libraries
├── test/                 # Unit tests
├── platformio.ini        # PlatformIO config
├── diagram.json          # Wokwi circuit diagram
├── wokwi.toml            # Wokwi simulation config
└── README.md             # This file
```

---

## 🔌 Pin Mapping

| Component | Pin | Type |
|-----------|-----|------|
| **I2C SDA** | GPIO 2 | Output |
| **I2C SCL** | GPIO 1 | Output |
| **DHT22** | GPIO 10 | Digital |
| **Ultrasonic TRIG** | GPIO 17 | Output |
| **Ultrasonic ECHO** | GPIO 18 | Input |
| **Soil Moisture** | GPIO 5 | Analog |
| **Soil pH** | GPIO 6 | Analog |
| **Soil NPK** | GPIO 7 | Analog |
| **LED Red** | GPIO 12 | Output |
| **LED Green** | GPIO 13 | Output |
| **Buzzer** | GPIO 14 | PWM |

---

## ⚠️ Troubleshooting

### Wokwi Simulation

| Problem | Solution |
|---------|----------|
| "Start Simulation" button not visible | Restart VSCode, ensure Wokwi extension is installed |
| Serial Monitor shows nothing | Wait 5-10 seconds (WiFi connect time) |
| MQTT not connecting | Ensure Wokwi-GUEST is connected (automatic) |
| LCD blank | Check I2C connections in diagram.json |

### PlatformIO

| Problem | Solution |
|---------|----------|
| "pio: command not found" | Install PlatformIO extension, restart VSCode |
| Build failed | Run `pio run --target clean` then rebuild |
| Upload failed | Check USB connection, select correct board |
| Serial monitor garbled | Ensure `monitor_speed = 115200` in platformio.ini |

---

## 📝 Development Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Edit Code                                                    │
│     → src/main.cpp                                               │
│                                                                  │
│  2. Test in Wokwi                                                │
│     → Open diagram.json                                          │
│     → Start Simulation                                           │
│     → Verify Serial Monitor output                               │
│                                                                  │
│  3. Build Firmware                                               │
│     → pio run                                                    │
│                                                                  │
│  4. Upload (if device available)                                 │
│     → pio run --target upload                                    │
│                                                                  │
│  5. Monitor                                                      │
│     → pio device monitor --speed 115200                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Resources

- [Wokwi Documentation](https://docs.wokwi.com/)
- [PlatformIO Documentation](https://docs.platformio.org/)
- [ESP32-S3 Datasheet](https://www.espressif.com/en/products/socs/esp32s3)
- [MQTT Protocol](https://mqtt.org/)
- [ArduinoJson Library](https://arduinojson.org/)

---

## 📄 License

Same as parent project license.
