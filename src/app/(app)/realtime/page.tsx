'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useMqtt } from '@/hooks/useMqtt';

const DEVICES = [
  {
    id: 'NODE-01',
    name: 'ESP32 Sensor Node',
    type: 'ESP32-S3',
    status: 'online',
    battery: 85,
    lastSeen: 'Now',
    location: 'Zone A',
  },
];

export default function RealtimePage() {
  const router = useRouter();
  const { lastReceived } = useMqtt();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(n => n + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getDeviceStatus = () => {
    if (lastReceived) {
      const secondsSinceLastData = Math.floor((Date.now() - lastReceived.getTime()) / 1000);
      if (secondsSinceLastData <= 30) {
        return 'online';
      }
    }
    return 'offline';
  };

  const deviceStatus = getDeviceStatus();
  const devices = DEVICES.map(d => ({
    ...d,
    status: deviceStatus,
    lastSeen: deviceStatus === 'online' && lastReceived 
      ? `${Math.floor((Date.now() - lastReceived.getTime()) / 1000)}s ago`
      : lastReceived 
        ? `${Math.floor((Date.now() - lastReceived.getTime()) / 1000)}s ago`
        : 'Never',
  }));

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Realtime Monitoring</h1>
          <p className="text-xs text-gray-500">Live sensor data from devices</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-gray-700">{devices.filter(d => d.status === 'online').length} Online</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            <span className="text-gray-700">{devices.filter(d => d.status === 'offline').length} Offline</span>
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <div
              key={device.id}
              className={`group relative rounded-xl border p-4 transition-all ${
                device.status === 'online'
                  ? 'cursor-pointer border-gray-200 bg-white hover:shadow-md hover:border-green-500'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
              onClick={() => device.status === 'online' && router.push(`/realtime/${device.id}`)}
            >
              {device.status === 'offline' && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="rounded-lg bg-black/80 px-4 py-2 text-xs font-medium text-white whitespace-nowrap">
                    Device offline - Turn on your device to view data
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    device.status === 'online' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg className={`h-5 w-5 ${
                      device.status === 'online' ? 'text-green-600' : 'text-red-600'
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
                  device.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
                <span>Last seen: {lastReceived ? `${Math.floor((Date.now() - lastReceived.getTime()) / 1000)}s ago` : device.lastSeen}</span>
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
      </div>
    </div>
  );
}
