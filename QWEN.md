# Integrated Precision Agriculture

## Project Overview

A full-stack precision agriculture solution combining IoT sensor nodes with a modern Next.js web dashboard. The system monitors farm conditions (temperature, humidity, soil moisture, pH, NPK levels, water supply) using ESP32-based sensor nodes and publishes data via MQTT for real-time visualization and anomaly detection.

### Development Roadmap (FASE.md)

| Phase | Focus | Technologies |
|-------|-------|--------------|
| 1 | IoT Prototype | ESP32, NPK/pH/Moisture Sensors, Wokwi (simulation) |
| 2 | Dashboard & Maps | Node-RED/React, Leaflet.js, OpenStreetMap |
| 3 | Intelligence | Python (Flask/FastAPI), ML Models, OpenWeather API |
| 4 | Logistics | OpenRouteService API integration |
| 5 | Web3 Integration | Solidity (Smart Contract), Ethers.js, IPFS (NFT metadata) |

---

## Technology Stack

### Web Application (Next.js)

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript 5
- **UI Library:** React 19.2.3
- **Styling:** Tailwind CSS 4 with PostCSS
- **State Management:** Zustand 5.0.11
- **MQTT Client:** mqtt 5.15.0 (WebSocket connection to HiveMQ)
- **Maps:** Leaflet 1.9.4 with react-leaflet 5.0.0
- **Visualization:** react-konva 19.2.2, konva 10.2.0
- **Fonts:** Geist Sans & Geist Mono (via `next/font`)
- **Linting:** ESLint 9 with Next.js configs

### IoT Node (ESP32)

- **Platform:** PlatformIO (ESP32 Arduino framework)
- **Board:** ESP32-S3-DevKitC-1
- **Communication:** WiFi + MQTT (HiveMQ broker)
- **Sensors:**
  - DHT22 (temperature & humidity)
  - Soil moisture sensor
  - pH sensor
  - NPK sensor
  - Ultrasonic sensor (water level)
- **Output:** LCD (I2C), RGB LED indicator, Buzzer
- **Libraries:** ArduinoJson, LiquidCrystal_I2C, PubSubClient, DHT sensor library

---

## Project Structure

```
integrated-precision-agriculture/
├── src/                      # Next.js application source
│   ├── app/                  # App Router pages & layouts
│   │   ├── (app)/            # Main app layout with sidebar
│   │   │   ├── dashboard/    # Overview dashboard
│   │   │   ├── farm/         # Farm mapping
│   │   │   ├── analysis/     # Farm analysis
│   │   │   ├── forecasting/  # Harvest forecasting
│   │   │   ├── warehouse/    # Warehouse location
│   │   │   ├── node/         # Node monitoring
│   │   │   └── supply-chain/ # Supply tracking
│   │   ├── api/              # API routes
│   │   ├── globals.css       # Global styles with Tailwind
│   │   ├── layout.tsx        # Root layout component
│   │   └── page.tsx          # Home page
│   ├── components/           # Reusable React components
│   │   ├── maps/             # Map-related components
│   │   ├── warehouse/        # Warehouse components
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   ├── SensorCard.tsx    # Sensor display card
│   │   ├── StatusBadge.tsx   # Status indicator
│   │   └── ProgressBar.tsx   # Progress bar component
│   ├── hooks/                # Custom React hooks
│   │   ├── useMqtt.ts        # MQTT connection hook
│   │   ├── useMapSearch.ts   # Map search functionality
│   │   ├── useShapeManagement.ts  # Shape/polygon management
│   │   └── useWarehouseManagement.ts
│   ├── lib/                  # Utility libraries
│   │   └── mqtt.ts           # MQTT client utilities
│   ├── store/                # Zustand state management
│   │   └── index.ts          # Global state store
│   ├── types/                # TypeScript type definitions
│   │   └── sensor.ts         # Sensor data interfaces
│   └── utils/                # Utility functions
│       ├── calculateArea.ts  # Polygon area calculation
│       ├── formatAddress.ts  # Address formatting
│       └── mapConstants.ts   # Map configuration
├── smartfarm-node*           # ESP32 IoT firmware (PlatformIO)
│   ├── src/
│   │   └── main.cpp          # Main firmware code
│   ├── include/              # Header files
│   ├── lib/                  # Local libraries
│   ├── test/                 # Unit tests
│   ├── platformio.ini        # PlatformIO configuration
│   ├── diagram.json          # Wokwi circuit diagram
│   ├── wokwi.toml            # Wokwi simulation config
│   └── README.md             # Firmware documentation
├── public/                   # Static assets
├── package.json              # Node.js dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── next.config.ts            # Next.js configuration
├── eslint.config.mjs         # ESLint flat config
├── postcss.config.mjs        # PostCSS configuration
└── FASE.md                   # Development roadmap
```

*Note: `smartfarm-node/` directory may be in a separate location or git-ignored.

### Path Aliases

- `@/*` resolves to `./src/*` (configured in `tsconfig.json`)

---

## Building and Running

### Web Application

#### Prerequisites

- Node.js 20+
- npm, yarn, pnpm, or bun

#### Installation

```bash
npm install
```

#### Development

```bash
npm run dev
```

Starts the Next.js development server on `http://localhost:3000`.

#### Production Build

```bash
npm run build    # Build for production
npm run start    # Start production server
```

#### Linting

```bash
npm run lint
```

### IoT Firmware (smartfarm-node)

#### Prerequisites

- PlatformIO CLI or VS Code PlatformIO extension
- Wokwi Simulator extension (for simulation)

#### Commands

```bash
# Build firmware
pio run

# Upload to device
pio run --target upload

# Start serial monitor
pio device monitor --speed 115200

# Run tests
pio test

# Clean build files
pio run --target clean
```

#### Wokwi Simulation

1. Open `smartfarm-node/diagram.json` in VSCode
2. Click **"Start Simulation"** button
3. View serial output for MQTT data

---

## Development Conventions

### TypeScript

- Strict mode enabled
- Module resolution: `bundler`
- JSX: `react-jsx`
- No emit (Next.js handles compilation)
- Incremental builds enabled

### Code Style

- ESLint 9 with flat config format
- Extends `eslint-config-next` for:
  - Core Web Vitals compliance
  - TypeScript rules
- Custom ignores in `eslint.config.mjs`

### Styling

- Tailwind CSS 4 with `@tailwindcss/postcss` plugin
- CSS custom properties for theming
- Dark mode support via `prefers-color-scheme`
- Font variables: `--font-geist-sans`, `--font-geist-mono`

### State Management

- Zustand for client-side state
- Store located in `src/store/index.ts`
- TypeScript-first store definitions

### Component Patterns

- Server Components by default (App Router)
- Client Components (`'use client'`) when hooks/state needed
- Responsive design with Tailwind utility classes
- Dark mode support throughout

### IoT Code Structure

- Modular function design (`readSensors`, `checkHealth`, `updateLCD`, `publishData`)
- Non-blocking sensor reading (3-second intervals via `millis()`)
- MQTT auto-reconnect with status feedback
- Real-time LCD display updates
- Anomaly detection with LED/buzzer alerts

---

## MQTT Data Format

The ESP32 node publishes JSON data to `daud/smartfarm/data`:

```json
{
  "id": "NODE-01",
  "ts": 1234567890,
  "lat": -6.92148,
  "lon": 106.92617,
  "message": "System Normal",
  "payload": {
    "temp": 28.5,
    "hum": 65.0,
    "moist": 55,
    "ph": 6.8,
    "n": 200,
    "p": 160,
    "k": 100,
    "water": 25
  }
}
```

### Field Descriptions

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

### MQTT Brokers

- **Web Dashboard:** `wss://broker.emqx.io:8084/mqtt` (WebSocket)
- **ESP32 Firmware:** `broker.hivemq.com:1883` (TCP)

---

## Application Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/dashboard` | Overview dashboard |
| `/farm` | Farm mapping with Leaflet |
| `/analysis` | Farm analysis |
| `/forecasting` | Harvest forecasting |
| `/warehouse` | Warehouse location management |
| `/node` | IoT node monitoring |
| `/supply-chain` | Supply chain tracking |

---

## Deployment

### Web Application

Deploy via Vercel (recommended) or any Node.js hosting platform:

```bash
vercel deploy
```

Or build and run the production server:

```bash
npm run build && npm run start
```

### IoT Firmware

- Flash compiled `.bin` from `.pio/build/esp32-s3-devkitc-1/` to ESP32 device
- Configure WiFi credentials in `src/main.cpp` before deployment
- MQTT broker: `broker.hivemq.com:1883` (public HiveMQ broker)

---

## Environment

- `.env*` files are git-ignored
- Use `.env.local` for local development variables
- See `.gitignore` for all ignored patterns

---

## Resources

- [Wokwi Documentation](https://docs.wokwi.com/)
- [PlatformIO Documentation](https://docs.platformio.org/)
- [ESP32-S3 Datasheet](https://www.espressif.com/en/products/socs/esp32s3)
- [MQTT Protocol](https://mqtt.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Leaflet.js](https://leafletjs.com/)
