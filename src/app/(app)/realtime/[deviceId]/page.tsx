'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMqtt } from '@/hooks/useMqtt';
import { ProgressBar } from '@/components/ProgressBar';

function ThermometerIcon({ status }: { status: 'normal' | 'critical' }) {
  if (status === 'critical') {
    return (
      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function HumidityIcon() {
  return (
    <svg className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17a2.25 2.25 0 01-2.25-2.25m0 0a2.25 2.25 0 012.25-2.25m-2.25 2.25h4.5m-4.5 0a2.25 2.25 0 002.25 2.25m-2.25-2.25v-2.25m2.25 2.25v-2.25m2.25 2.25a2.25 2.25 0 01-2.25-2.25m0 0a2.25 2.25 0 012.25-2.25m-2.25 2.25h4.5m-4.5 0a2.25 2.25 0 002.25 2.25m-2.25-2.25v-2.25m2.25 2.25v-2.25" />
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

function MqttIcon() {
  return (
    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
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

function AlertIcon() {
  return (
    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

interface SensorCardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  status: 'normal' | 'critical';
  alertMessage?: string;
}

function SensorCard({ title, value, unit, icon, status, alertMessage }: SensorCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${
      status === 'critical' ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{title}</p>
          <div className="mt-1 flex items-baseline gap-0.5">
            <span className={`text-2xl font-bold ${
              status === 'critical' ? 'text-red-900' : 'text-gray-900'
            }`}>{value}</span>
            <span className="text-xs text-gray-500">{unit}</span>
          </div>
        </div>
        <div className={`rounded-lg p-2 ${
          status === 'critical' ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {status === 'normal' ? (
          <div className="flex items-center gap-1 text-xs text-green-700">
            <CheckIcon />
            <span>Normal</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-red-700">
            <AlertIcon />
            <span>{alertMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.deviceId as string;
  
  const { data, isConnected, lastReceived } = useMqtt();
  const [copied, setCopied] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastReceived) {
        setSecondsAgo(Math.floor((Date.now() - lastReceived.getTime()) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastReceived]);

  const handleCopyRaw = () => {
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSensorStatus = (value: number, min: number, max: number, isTemp = false) => {
    if (isTemp) {
      if (value < min || value > max) return 'critical';
      return 'normal';
    }
    if (value < min || value > max) return 'critical';
    return 'normal';
  };

  if (!data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-8 w-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Loading device data...</h2>
          <p className="mt-1 text-sm text-gray-500">Please wait</p>
        </div>
      </div>
    );
  }

  const tempStatus = getSensorStatus(data.payload.temp, 18, 35, true);
  const humStatus = getSensorStatus(data.payload.hum, 40, 90);
  const moistStatus = getSensorStatus(data.payload.moist, 40, 85);
  const phStatus = getSensorStatus(data.payload.ph, 5.5, 7.5);

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push('/realtime')}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeftIcon />
          Back to Devices
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyRaw}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <CopyIcon />
            {copied ? 'Copied!' : 'Copy Raw'}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{deviceId}</h1>
            <p className="text-xs text-gray-500">Real-time sensor data</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {isConnected && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                )}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              </span>
              <span className={`text-xs font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {lastReceived && (
              <span className="text-xs text-gray-400">
                {lastReceived.toLocaleTimeString()}
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
                <p className="text-xs text-gray-500">Node ID</p>
                <p className="text-sm font-bold text-gray-900">{data.id}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <MqttIcon />
              </div>
              <div>
                <p className="text-xs text-gray-500">MQTT Status</p>
                <p className="text-sm font-semibold text-green-600">Active</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Update</p>
                <p className="text-sm font-semibold text-gray-900">
                  {lastReceived ? `${secondsAgo}s ago` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${data.message === 'System Normal' ? 'bg-green-100' : 'bg-red-100'}`}>
                {data.message === 'System Normal' ? <CheckIcon /> : <AlertIcon />}
              </div>
              <div>
                <p className="text-xs text-gray-500">System Status</p>
                <p className={`text-sm font-semibold ${data.message === 'System Normal' ? 'text-green-600' : 'text-red-600'}`}>
                  {data.message === 'System Normal' ? 'All Normal' : 'Alert'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SensorCard
              title="Temperature"
              value={data.payload.temp.toFixed(1)}
              unit="C"
              icon={<ThermometerIcon status={tempStatus} />}
              status={tempStatus}
              alertMessage={
                data.payload.temp < 18 ? 'Too cold' :
                data.payload.temp > 35 ? 'Too hot' :
                undefined
              }
            />
            <SensorCard
              title="Humidity"
              value={data.payload.hum.toFixed(0)}
              unit="%"
              icon={<HumidityIcon />}
              status={humStatus}
              alertMessage={
                data.payload.hum < 40 ? 'Too dry' :
                data.payload.hum > 90 ? 'Too humid' :
                undefined
              }
            />
            <SensorCard
              title="Soil Moisture"
              value={data.payload.moist.toFixed(0)}
              unit="%"
              icon={<SoilIcon />}
              status={moistStatus}
              alertMessage={
                data.payload.moist < 40 ? 'Too dry' :
                data.payload.moist > 85 ? 'Too wet' :
                undefined
              }
            />
            <SensorCard
              title="Soil pH"
              value={data.payload.ph.toFixed(1)}
              unit=""
              icon={<PHIcon />}
              status={phStatus}
              alertMessage={
                data.payload.ph < 5.5 ? 'Too acidic' :
                data.payload.ph > 7.5 ? 'Too alkaline' :
                undefined
              }
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className={`rounded-xl border p-4 ${
            data.payload.n < 50 || data.payload.n > 450
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 bg-white'
          }`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Nutrient Levels (NPK)</h3>
              {data.payload.n < 50 || data.payload.n > 450 ? (
                <div className="flex items-center gap-1 text-xs text-red-700">
                  <AlertIcon />
                  <span>Low nutrient</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-green-700">
                  <CheckIcon />
                  <span>Normal</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <ProgressBar
                label="Nitrogen (N)"
                value={Math.round(data.payload.n)}
                max={500}
                unit=""
                color={data.payload.n < 50 || data.payload.n > 450 ? 'red' : 'green'}
              />
              <ProgressBar
                label="Phosphorus (P)"
                value={Math.round(data.payload.p)}
                max={500}
                unit=""
                color={data.payload.p < 40 || data.payload.p > 400 ? 'red' : 'blue'}
              />
              <ProgressBar
                label="Potassium (K)"
                value={Math.round(data.payload.k)}
                max={500}
                unit=""
                color={data.payload.k < 35 || data.payload.k > 350 ? 'red' : 'orange'}
              />
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${
            data.payload.water < 10
              ? 'border-red-300 bg-red-50'
              : data.payload.water < 20
                ? 'border-yellow-300 bg-yellow-50'
                : 'border-gray-200 bg-white'
          }`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Water Supply</h3>
              {data.payload.water < 10 ? (
                <div className="flex items-center gap-1 text-xs text-red-700">
                  <AlertIcon />
                  <span>Critical</span>
                </div>
              ) : data.payload.water < 20 ? (
                <div className="flex items-center gap-1 text-xs text-yellow-700">
                  <AlertIcon />
                  <span>Low</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-green-700">
                  <CheckIcon />
                  <span>Normal</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                <div
                  className="absolute bottom-0 w-full transition-all duration-500"
                  style={{ 
                    height: `${Math.min((data.payload.water / 50) * 100, 100)}%`,
                    backgroundColor: data.payload.water < 10 ? '#ef4444' : data.payload.water < 20 ? '#eab308' : '#3b82f6'
                  }}
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
                      ? 'Low level'
                      : 'Adequate level'}
                </p>
                <ProgressBar
                  label="Tank"
                  value={Math.round(data.payload.water)}
                  max={50}
                  unit="cm"
                  color={data.payload.water < 10 ? 'red' : data.payload.water < 20 ? 'yellow' : 'blue'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
