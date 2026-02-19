'use client';

import { SensorData } from '@/types/sensor';

interface SensorCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  status?: 'normal' | 'warning' | 'critical';
  color: string;
}

export function SensorCard({ title, value, unit, icon, status = 'normal', color }: SensorCardProps) {
  const statusColors = {
    normal: 'border-transparent',
    warning: 'border-yellow-400',
    critical: 'border-red-400',
  };

  const statusBg = {
    normal: `bg-${color}-50`,
    warning: 'bg-yellow-50',
    critical: 'bg-red-50',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border ${statusColors[status]} bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{title}</p>
          <div className="mt-1 flex items-baseline gap-0.5">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            <span className="text-xs text-gray-500">{unit}</span>
          </div>
        </div>
        <div className={`rounded-lg ${statusBg[status]} p-2`}>
          {icon}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-0.5 w-full ${color === 'blue' ? 'bg-blue-500' : color === 'green' ? 'bg-green-500' : color === 'orange' ? 'bg-orange-500' : color === 'purple' ? 'bg-purple-500' : color === 'cyan' ? 'bg-cyan-500' : 'bg-gray-500'}`} />
    </div>
  );
}
