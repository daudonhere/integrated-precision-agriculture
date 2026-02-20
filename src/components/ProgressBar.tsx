'use client';

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}

export function ProgressBar({ label, value, max, unit, color }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="text-gray-400">{value} {unit}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[color] || 'bg-gray-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
