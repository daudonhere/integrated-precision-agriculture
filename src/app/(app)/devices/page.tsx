'use client';

import { useState } from 'react';

const DEVICES = [
  {
    id: 'NODE-01',
    name: 'Sensor Utara',
    type: 'ESP32-S3',
    status: 'online',
    battery: 85,
    lastSeen: 'Now',
    location: 'Zone A',
    sensors: { temp: 28.5, hum: 65, moist: 55, ph: 6.8 },
  },
  {
    id: 'NODE-02',
    name: 'Sensor Timur',
    type: 'ESP32-S3',
    status: 'online',
    battery: 72,
    lastSeen: 'Now',
    location: 'Zone B',
    sensors: { temp: 29.1, hum: 62, moist: 48, ph: 6.5 },
  },
  {
    id: 'NODE-03',
    name: 'Sensor Barat',
    type: 'ESP32-S3',
    status: 'warning',
    battery: 45,
    lastSeen: '5m ago',
    location: 'Zone C',
    sensors: { temp: 27.8, hum: 68, moist: 62, ph: 7.2 },
  },
  {
    id: 'NODE-04',
    name: 'Sensor Selatan',
    type: 'ESP32-S3',
    status: 'offline',
    battery: 12,
    lastSeen: '2h ago',
    location: 'Zone D',
    sensors: { temp: 30.2, hum: 58, moist: 35, ph: 6.9 },
  },
];

export default function DevicesPage() {
  const [selectedDevice, setSelectedDevice] = useState<typeof DEVICES[0] | null>(null);

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Devices</h1>
          <p className="text-xs text-gray-500">Sensor node monitoring</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500"></span> {DEVICES.filter(d => d.status === 'online').length} Online
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-yellow-500"></span> {DEVICES.filter(d => d.status === 'warning').length} Warning
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500"></span> {DEVICES.filter(d => d.status === 'offline').length} Offline
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEVICES.map((device) => (
            <div
              key={device.id}
              onClick={() => setSelectedDevice(device)}
              className={`cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md ${
                selectedDevice?.id === device.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    device.status === 'online' ? 'bg-green-100' :
                    device.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <svg className={`h-5 w-5 ${
                      device.status === 'online' ? 'text-green-600' :
                      device.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{device.name}</h3>
                    <p className="text-xs text-gray-500">{device.id} - {device.location}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  device.status === 'online' ? 'bg-green-100 text-green-700' :
                  device.status === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  {device.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-gray-50 p-2">
                  <span className="text-gray-500">Type</span>
                  <p className="font-medium text-gray-900">{device.type}</p>
                </div>
                <div className="rounded bg-gray-50 p-2">
                  <span className="text-gray-500">Battery</span>
                  <p className={`font-medium ${device.battery < 20 ? 'text-red-600' : 'text-gray-900'}`}>
                    {device.battery}%
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Last seen: {device.lastSeen}</span>
                <div className="flex items-center gap-2">
                  <span>{device.sensors.temp}C</span>
                  <span>{device.sensors.hum}%</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Battery Level</span>
                  <span>{device.battery}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full ${
                      device.battery < 20 ? 'bg-red-500' :
                      device.battery < 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${device.battery}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedDevice && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              {selectedDevice.name} - Details
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Temperature</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{selectedDevice.sensors.temp}C</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Humidity</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{selectedDevice.sensors.hum}%</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Soil Moisture</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{selectedDevice.sensors.moist}%</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">pH Level</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{selectedDevice.sensors.ph}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                View Logs
              </button>
              <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Configure
              </button>
              <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Restart Device
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
