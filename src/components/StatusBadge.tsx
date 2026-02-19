'use client';

interface StatusBadgeProps {
  message: string;
  isAnomaly: boolean;
}

export function StatusBadge({ message, isAnomaly }: StatusBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
      isAnomaly 
        ? 'bg-red-100 text-red-700' 
        : 'bg-green-100 text-green-700'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        isAnomaly ? 'bg-red-500 animate-pulse' : 'bg-green-500'
      }`} />
      {message}
    </div>
  );
}
