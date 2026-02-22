'use client';

import { useState } from 'react';

const SOIL_ZONES = [
  { id: 'Zone A', name: 'Area Utara', ph: 6.8, n: 200, p: 160, k: 100, moist: 55, status: 'optimal' },
  { id: 'Zone B', name: 'Area Timur', ph: 6.5, n: 180, p: 140, k: 90, moist: 48, status: 'optimal' },
  { id: 'Zone C', name: 'Area Barat', ph: 7.2, n: 220, p: 175, k: 110, moist: 62, status: 'warning' },
  { id: 'Zone D', name: 'Area Selatan', ph: 6.9, n: 150, p: 120, k: 75, moist: 35, status: 'critical' },
];

const RECOMMENDATIONS = [
  { zone: 'Zone D', type: 'Irigasi', message: 'Tanah terlalu kering, segera lakukan penyiraman', priority: 'high' },
  { zone: 'Zone D', type: 'Pupuk N', message: 'Kadar Nitrogen rendah, tambahkan pupuk urea', priority: 'high' },
  { zone: 'Zone C', type: 'pH Adjustment', message: 'pH sedikit tinggi, tambahkan belerang', priority: 'medium' },
  { zone: 'Zone A', type: 'Maintenance', message: 'Kondisi optimal, lanjutkan pemeliharaan', priority: 'low' },
];

export default function LandPage() {
  const [selectedZone, setSelectedZone] = useState<typeof SOIL_ZONES[0] | null>(null);

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Farm Analysis</h1>
          <p className="text-xs text-gray-500">Land health and nutrient monitoring</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Soil Zones</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SOIL_ZONES.map((zone) => (
              <div
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md ${
                  selectedZone?.id === zone.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      zone.status === 'optimal'
                        ? 'bg-green-100 text-green-700'
                        : zone.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {zone.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">pH</span>
                    <span
                      className={`font-medium ${
                        zone.ph < 5.5 || zone.ph > 7.5
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {zone.ph}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Moisture</span>
                    <span
                      className={`font-medium ${
                        zone.moist < 40
                          ? 'text-red-600'
                          : zone.moist > 85
                            ? 'text-yellow-600'
                            : 'text-gray-900'
                      }`}
                    >
                      {zone.moist}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-4 text-gray-500">N</span>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${(zone.n / 500) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-4 text-gray-500">P</span>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${(zone.p / 500) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-4 text-gray-500">K</span>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{ width: `${(zone.k / 500) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {selectedZone && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">
                {selectedZone.name} - Detailed Analysis
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">pH Level</span>
                    <span
                      className={`text-lg font-bold ${
                        selectedZone.ph < 5.5 || selectedZone.ph > 7.5
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {selectedZone.ph}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full ${
                        selectedZone.ph < 5.5 || selectedZone.ph > 7.5
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${(selectedZone.ph / 14) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Range optimal: 5.5 - 7.5</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Moisture</span>
                    <span
                      className={`text-lg font-bold ${
                        selectedZone.moist < 40
                          ? 'text-red-600'
                          : selectedZone.moist > 85
                            ? 'text-yellow-600'
                            : 'text-gray-900'
                      }`}
                    >
                      {selectedZone.moist}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full ${
                        selectedZone.moist < 40
                          ? 'bg-red-500'
                          : selectedZone.moist > 85
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${selectedZone.moist}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Range optimal: 40% - 85%</p>
                </div>
              </div>

              <h3 className="mt-4 mb-2 text-sm font-semibold text-gray-900">
                Nutrient Levels
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Nitrogen (N)</span>
                    <span className="font-medium text-gray-900">{selectedZone.n} ppm</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${(selectedZone.n / 500) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Phosphorus (P)</span>
                    <span className="font-medium text-gray-900">{selectedZone.p} ppm</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${(selectedZone.p / 500) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Potassium (K)</span>
                    <span className="font-medium text-gray-900">{selectedZone.k} ppm</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${(selectedZone.k / 500) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Recommendations</h2>
            <div className="space-y-3">
              {RECOMMENDATIONS.map((rec, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border-l-4 p-3 ${
                    rec.priority === 'high'
                      ? 'border-red-500 bg-red-50'
                      : rec.priority === 'medium'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-green-500 bg-green-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{rec.type}</p>
                      <p className="text-xs text-gray-600">{rec.message}</p>
                      <p className="mt-1 text-xs text-gray-500">{rec.zone}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        rec.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : rec.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
