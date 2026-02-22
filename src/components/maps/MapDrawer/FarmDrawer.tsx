'use client';

import { DrawnShape } from '@/types/map';
import { formatArea } from '@/utils/calculateArea';
import { formatAddress } from '@/utils/formatAddress';

interface FarmDrawerProps {
  showDrawer: boolean;
  onClose: () => void;
  shapes: DrawnShape[];
  onNavigateToArea: (shape: DrawnShape) => void;
}

export function FarmDrawer({ showDrawer, onClose, shapes, onNavigateToArea }: FarmDrawerProps) {
  if (!showDrawer) return null;

  return (
    <>
      <div className="absolute inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col">
        <style>{`@keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } } .animate-slide-in { animation: slide-in 0.3s ease-out; }`}</style>
        
        <div className="shrink-0 border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Farm Mapping</h2>
              <p className="text-xs text-gray-500 mt-1">{shapes.length} {shapes.length === 1 ? 'Area' : 'Areas'} Created</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-200 transition-colors">
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {shapes.length > 0 ? (
              shapes.map((shape) => (
                <div
                  key={shape.id}
                  onClick={() => onNavigateToArea(shape)}
                  className="cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md hover:border-gray-300"
                  style={{ borderColor: shape.color }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded" style={{ backgroundColor: shape.color }} />
                    <span className="text-sm font-semibold text-gray-900">{shape.name}</span>
                  </div>
                  {shape.varieties && (
                    <p className="text-xs text-gray-600 mb-1">
                      <span className="font-medium">Varieties:</span> {shape.varieties}
                    </p>
                  )}
                  {shape.address && <p className="text-xs text-gray-500 line-clamp-2">{formatAddress(shape.address)}</p>}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{formatArea(shape.area)}</span>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No areas created yet</p>
                <p className="text-xs text-gray-400 mt-1">Click the Measurement button to start drawing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
