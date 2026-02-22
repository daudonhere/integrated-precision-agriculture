'use client';

interface CompassButtonProps {
  rotation: number;
  onReset: () => void;
  showTooltip: boolean;
  setShowTooltip: (show: boolean) => void;
  getCardinalDirection: (rotation: number) => string;
}

export function CompassButton({ rotation, onReset, showTooltip, setShowTooltip, getCardinalDirection }: CompassButtonProps) {
  return (
    <div className="relative">
      <button
        onClick={onReset}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 shadow-lg hover:bg-gray-100"
      >
        <span className="text-sm font-bold">{getCardinalDirection(rotation)}</span>
      </button>
      {showTooltip && (
        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white whitespace-nowrap shadow-lg">
          Reset North
          <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-gray-900" />
        </div>
      )}
    </div>
  );
}
