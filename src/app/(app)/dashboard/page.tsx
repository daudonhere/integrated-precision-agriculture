'use client';

import { useEffect, useState } from 'react';
import { SensorData } from '@/types/sensor';
import { SensorCard } from '@/components/SensorCard';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';

const DUMMY_DATA: SensorData = {
  id: 'NODE-01',
  ts: Date.now(),
  lat: -6.92148,
  lon: 106.92617,
  message: 'System Normal',
  payload: {
    temp: 28.5,
    hum: 65,
    moist: 55,
    ph: 6.8,
    n: 200,
    p: 160,
    k: 100,
    water: 25,
  },
};

function ThermometerIcon() {
  return (
    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function HumidityIcon() {
  return (
    <svg className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}

function SoilIcon() {
  return (
    <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PHIcon() {
  return (
    <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}

function WaterIcon() {
  return (
    <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  );
}

function IrrigationIcon() {
  return (
    <svg className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}

function HarvestIcon() {
  return (
    <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<SensorData | null>(DUMMY_DATA);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        if (!prev) return DUMMY_DATA;
        return {
          ...prev,
          ts: Date.now(),
          payload: {
            temp: prev.payload.temp + (Math.random() - 0.5) * 2,
            hum: Math.min(100, Math.max(0, prev.payload.hum + (Math.random() - 0.5) * 5)),
            moist: Math.min(100, Math.max(0, prev.payload.moist + (Math.random() - 0.5) * 3)),
            ph: Math.min(14, Math.max(0, prev.payload.ph + (Math.random() - 0.5) * 0.2)),
            n: Math.min(500, Math.max(0, prev.payload.n + (Math.random() - 0.5) * 10)),
            p: Math.min(500, Math.max(0, prev.payload.p + (Math.random() - 0.5) * 10)),
            k: Math.min(500, Math.max(0, prev.payload.k + (Math.random() - 0.5) * 10)),
            water: Math.min(50, Math.max(0, prev.payload.water + (Math.random() - 0.5) * 2)),
          },
        };
      });
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const isAnomaly = data?.message !== 'System Normal';

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Overview</h1>
          <p className="text-xs text-gray-500">Farm monitoring dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-green-600">Live</span>
          </div>
          <span className="text-xs text-gray-400">{lastUpdate.toLocaleTimeString()}</span>
        </div>
      </header>

      {data && (
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-between">
            <StatusBadge message={data.message} isAnomaly={isAnomaly} />
            <div className="text-xs text-gray-500">
              Node: <span className="font-medium text-gray-900">{data.id}</span>
              {data.lat && data.lon && (
                <span className="ml-3">
                  <span className="font-medium text-gray-900">{data.lat.toFixed(4)}, {data.lon.toFixed(4)}</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <DeviceIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active Sensors</p>
                  <p className="text-xl font-bold text-gray-900">4</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-100 p-2">
                  <IrrigationIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Irrigation Status</p>
                  <p className="text-sm font-semibold text-green-600">Active</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2">
                  <HarvestIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Harvest Prediction</p>
                  <p className="text-sm font-semibold text-gray-900">45 days</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-2">
                  <AlertIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Critical Alerts</p>
                  <p className={`text-sm font-semibold ${isAnomaly ? 'text-red-600' : 'text-green-600'}`}>
                    {isAnomaly ? '1 Active' : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Real-time Sensors</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SensorCard
                title="Temperature"
                value={data.payload.temp.toFixed(1)}
                unit="°C"
                icon={<ThermometerIcon />}
                color="blue"
                status={data.payload.temp < 18 || data.payload.temp > 35 ? 'critical' : 'normal'}
              />
              <SensorCard
                title="Humidity"
                value={data.payload.hum.toFixed(0)}
                unit="%"
                icon={<HumidityIcon />}
                color="cyan"
                status={data.payload.hum < 40 || data.payload.hum > 90 ? 'warning' : 'normal'}
              />
              <SensorCard
                title="Soil Moisture"
                value={data.payload.moist.toFixed(0)}
                unit="%"
                icon={<SoilIcon />}
                color="amber"
                status={data.payload.moist < 40 ? 'warning' : data.payload.moist > 85 ? 'warning' : 'normal'}
              />
              <SensorCard
                title="Soil pH"
                value={data.payload.ph.toFixed(1)}
                unit=""
                icon={<PHIcon />}
                color="purple"
                status={data.payload.ph < 5.5 || data.payload.ph > 7.5 ? 'warning' : 'normal'}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Nutrient Levels (NPK)</h3>
              <div className="space-y-3">
                <ProgressBar
                  label="Nitrogen (N)"
                  value={Math.round(data.payload.n)}
                  max={500}
                  unit=""
                  color="green"
                />
                <ProgressBar
                  label="Phosphorus (P)"
                  value={Math.round(data.payload.p)}
                  max={500}
                  unit=""
                  color="blue"
                />
                <ProgressBar
                  label="Potassium (K)"
                  value={Math.round(data.payload.k)}
                  max={500}
                  unit=""
                  color="orange"
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Water Supply</h3>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                  <div
                    className="absolute bottom-0 w-full bg-blue-500 transition-all duration-500"
                    style={{ height: `${Math.min((data.payload.water / 50) * 100, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600 to-blue-400 opacity-80" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white drop-shadow">{Math.round(data.payload.water)}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="text-lg font-bold text-gray-900">{Math.round(data.payload.water)}</span>
                    <span className="ml-0.5 text-xs text-gray-500">cm</span>
                  </div>
                  <p className="mb-2 text-xs text-gray-500">
                    {data.payload.water < 10 
                      ? 'Critical - refill needed' 
                      : data.payload.water < 20 
                        ? 'Low' 
                        : 'Adequate'}
                  </p>
                  <ProgressBar
                    label="Tank"
                    value={Math.round(data.payload.water)}
                    max={50}
                    unit="cm"
                    color="blue"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
