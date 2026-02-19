'use client';

import { useState } from 'react';

const HARVEST_PREDICTIONS = [
  { crop: 'Tomat', variety: 'Cherry', planted: '2025-01-15', estimatedHarvest: '2025-03-01', daysRemaining: 10, confidence: 85, yield: '2.5 ton', status: 'on-track' },
  { crop: 'Cabai', variety: 'Rawit', planted: '2025-01-10', estimatedHarvest: '2025-02-28', daysRemaining: 9, confidence: 92, yield: '1.8 ton', status: 'on-track' },
  { crop: 'Timun', variety: 'Japan', planted: '2025-01-20', estimatedHarvest: '2025-03-05', daysRemaining: 14, confidence: 78, yield: '3.2 ton', status: 'delayed' },
  { crop: 'Selada', variety: 'Romaine', planted: '2025-01-25', estimatedHarvest: '2025-02-25', daysRemaining: 6, confidence: 95, yield: '800 kg', status: 'ready-soon' },
];

const PEST_RISKS = [
  { pest: 'Ulat Grayak', risk: 'high', affected: 'Tomat Zone A', recommendation: 'Semprot pestisida organik' },
  { pest: 'Kutu Daun', risk: 'medium', affected: 'Cabai Zone B', recommendation: 'Gunakan predator alami' },
  { pest: 'Jamur Downy', risk: 'low', affected: 'Timun Zone C', recommendation: 'Perbaiki drainase' },
];

const WEATHER_IMPACT = [
  { factor: 'Curah Hujan', value: 'Normal', impact: 'positive', description: 'Curah hujan optimal untuk pertumbuhan' },
  { factor: 'Suhu', value: '28-32C', impact: 'positive', description: 'Suhu ideal untuk fotosintesis' },
  { factor: 'Kelembaban', value: '65-75%', impact: 'neutral', description: 'Dalam batas toleransi' },
];

export default function HarvestPage() {
  const [selectedCrop, setSelectedCrop] = useState<typeof HARVEST_PREDICTIONS[0] | null>(null);

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Harvest Prediction</h1>
          <p className="text-xs text-gray-500">AI-powered harvest forecasting</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Total Crops</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">4</p>
            <p className="text-xs text-green-600">All healthy</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Ready to Harvest</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">1</p>
            <p className="text-xs text-amber-600">Within 7 days</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Predicted Yield</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">8.3 ton</p>
            <p className="text-xs text-green-600">+12% vs last</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Avg Confidence</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">87.5%</p>
            <p className="text-xs text-gray-500">AI accuracy</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Crop Predictions</h2>
            <div className="space-y-3">
              {HARVEST_PREDICTIONS.map((crop, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedCrop(crop)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md ${
                    selectedCrop?.crop === crop.crop
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{crop.crop} <span className="text-sm font-normal text-gray-500">({crop.variety})</span></h3>
                        <p className="text-xs text-gray-500">Planted: {crop.planted}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{crop.daysRemaining} days</p>
                      <p className="text-xs text-gray-500">{crop.estimatedHarvest}</p>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        crop.status === 'on-track' ? 'bg-green-100 text-green-700' :
                        crop.status === 'delayed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {crop.status === 'ready-soon' ? 'Ready Soon' : crop.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Confidence</span>
                        <span className="font-medium text-gray-900">{crop.confidence}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-gray-200">
                        <div className="h-full rounded-full bg-green-500" style={{ width: `${crop.confidence}%` }} />
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Yield: </span>
                      <span className="font-medium text-gray-900">{crop.yield}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Pest Risk Analysis</h2>
            <div className="space-y-3">
              {PEST_RISKS.map((risk, idx) => (
                <div key={idx} className={`rounded-xl border-l-4 p-3 ${
                  risk.risk === 'high' ? 'border-red-500 bg-red-50' :
                  risk.risk === 'medium' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{risk.pest}</p>
                      <p className="text-xs text-gray-600">{risk.affected}</p>
                      <p className="mt-1 text-xs text-gray-500">{risk.recommendation}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      risk.risk === 'high' ? 'bg-red-100 text-red-700' :
                      risk.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {risk.risk}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="mb-3 mt-6 text-sm font-semibold text-gray-900">Weather Impact</h2>
            <div className="space-y-3">
              {WEATHER_IMPACT.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.factor}</p>
                      <p className="text-xs text-gray-500">{item.value}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.impact === 'positive' ? 'bg-green-100 text-green-700' :
                      item.impact === 'neutral' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.impact}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedCrop && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">{selectedCrop.crop} - Detailed Prediction</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Days Remaining</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{selectedCrop.daysRemaining}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Confidence</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{selectedCrop.confidence}%</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Predicted Yield</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{selectedCrop.yield}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Harvest Date</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{selectedCrop.estimatedHarvest}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                Export Report
              </button>
              <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Set Reminder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
