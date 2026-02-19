'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const SENSOR_LOCATIONS = [
  { id: 'NODE-01', lat: -6.92148, lon: 106.92617, temp: 28.5, hum: 65, moist: 55, status: 'normal' },
  { id: 'NODE-02', lat: -6.92248, lon: 106.92717, temp: 29.1, hum: 62, moist: 48, status: 'normal' },
  { id: 'NODE-03', lat: -6.92048, lon: 106.92517, temp: 27.8, hum: 68, moist: 62, status: 'warning' },
  { id: 'NODE-04', lat: -6.92348, lon: 106.92417, temp: 30.2, hum: 58, moist: 35, status: 'critical' },
];

function getMarkerIcon(status: string) {
  const colors: Record<string, string> = {
    normal: '#22c55e',
    warning: '#eab308',
    critical: '#ef4444',
  };
  
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${colors[status]}" class="w-6 h-6">
      <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapComponent() {
  const [selectedSensor, setSelectedSensor] = useState<typeof SENSOR_LOCATIONS[0] | null>(null);
  const mapCenter: [number, number] = [-6.92148, 106.92617];

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Map Monitoring</h1>
          <p className="text-xs text-gray-500">Farm location and sensor mapping</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500"></span> Normal
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-yellow-500"></span> Warning
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500"></span> Critical
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 border-r border-gray-200 bg-white p-4 overflow-y-auto">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Sensor Locations</h2>
          <div className="space-y-2">
            {SENSOR_LOCATIONS.map((sensor) => (
              <button
                key={sensor.id}
                onClick={() => setSelectedSensor(sensor)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selectedSensor?.id === sensor.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{sensor.id}</span>
                  <span className={`h-2 w-2 rounded-full ${
                    sensor.status === 'normal' ? 'bg-green-500' :
                    sensor.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {sensor.temp}°C • {sensor.hum}% • {sensor.moist}%
                </div>
              </button>
            ))}
          </div>

          {selectedSensor && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <h3 className="text-sm font-semibold text-gray-900">{selectedSensor.id} Details</h3>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Temperature</span>
                  <span className="font-medium">{selectedSensor.temp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Humidity</span>
                  <span className="font-medium">{selectedSensor.hum}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Moisture</span>
                  <span className="font-medium">{selectedSensor.moist}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium">{selectedSensor.lat.toFixed(4)}, {selectedSensor.lon.toFixed(4)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <MapContainer
            center={mapCenter}
            zoom={15}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} />
            {SENSOR_LOCATIONS.map((sensor) => (
              <Marker
                key={sensor.id}
                position={[sensor.lat, sensor.lon]}
                icon={getMarkerIcon(sensor.status)}
                eventHandlers={{
                  click: () => setSelectedSensor(sensor),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{sensor.id}</strong><br />
                    Temp: {sensor.temp}°C<br />
                    Humidity: {sensor.hum}%<br />
                    Moisture: {sensor.moist}%
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
