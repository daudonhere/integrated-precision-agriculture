'use client';

interface LayerButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  showTooltip: boolean;
  setShowTooltip: (show: boolean) => void;
}

export function LayerButton({ active, onClick, label, icon, showTooltip, setShowTooltip }: LayerButtonProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`rounded-lg p-2.5 shadow-lg transition-colors ${active ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
      >
        {icon}
      </button>
      {showTooltip && (
        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white whitespace-nowrap shadow-lg">
          {label}
          <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-gray-900" />
        </div>
      )}
    </div>
  );
}
