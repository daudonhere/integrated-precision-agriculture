'use client';

import { Warehouse } from '@/store/warehouseStore';

interface WarehouseDialogProps {
  selectedWarehouse: Warehouse;
  onClose: () => void;
  onUpdateWarehouse: (id: number, warehouse: Partial<Warehouse>) => void;
  onDeleteClick: () => void;
  validationErrors?: { name?: string; capacity?: string };
  onValidate?: () => boolean;
}

export function WarehouseDialog({ 
  selectedWarehouse, 
  onClose, 
  onUpdateWarehouse, 
  onDeleteClick,
  validationErrors,
  onValidate,
}: WarehouseDialogProps) {
  const errors = validationErrors || {};
  const hasNameError = !!errors.name;
  const hasCapacityError = !!errors.capacity;

  return (
    <>
      <div className="absolute inset-0 bg-black/50 z-[500]" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-[501] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Warehouse Details</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="relative">
            <label className="block text-xs text-gray-500 mb-1">Warehouse Name</label>
            <input
              type="text"
              value={selectedWarehouse.name}
              onChange={(e) => onUpdateWarehouse(selectedWarehouse.id, { name: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 ${
                hasNameError 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
              }`}
              placeholder="Enter warehouse name..."
            />
            {hasNameError && (
              <div className="absolute -top-8 left-0 rounded bg-red-600 px-2 py-1 text-xs text-white whitespace-nowrap shadow-lg">
                {errors.name}
                <div className="absolute -bottom-1 left-2 h-2 w-2 rotate-45 bg-red-600" />
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block text-xs text-gray-500 mb-1">Capacity (units)</label>
            <input
              type="number"
              value={selectedWarehouse.capacity}
              onChange={(e) => onUpdateWarehouse(selectedWarehouse.id, { capacity: parseInt(e.target.value) || 0 })}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 ${
                hasCapacityError 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
              }`}
              placeholder="Enter capacity..."
            />
            {hasCapacityError && (
              <div className="absolute -top-8 left-0 rounded bg-red-600 px-2 py-1 text-xs text-white whitespace-nowrap shadow-lg">
                {errors.capacity}
                <div className="absolute -bottom-1 left-2 h-2 w-2 rotate-45 bg-red-600" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Elevation</p>
              <p className="text-lg font-bold text-gray-900">
                {selectedWarehouse.elevation !== undefined && selectedWarehouse.elevation !== 0
                  ? `${selectedWarehouse.elevation.toFixed(1)} m`
                  : '-'}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Coordinates</p>
              <p className="text-xs font-mono text-gray-700 mt-1">
                {selectedWarehouse.lat.toFixed(4)}, {selectedWarehouse.lng.toFixed(4)}
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500 mb-2">Location</p>
            {selectedWarehouse.location && selectedWarehouse.location !== 'Address not found' ? (
              <p className="text-xs text-gray-600 mb-2">{selectedWarehouse.location}</p>
            ) : selectedWarehouse.location === 'Address not found' ? (
              <p className="text-xs text-gray-400 mb-2">Address not found</p>
            ) : (
              <p className="text-xs text-gray-400 mb-2">Loading address...</p>
            )}
          </div>
        </div>
        <div className="flex p-4 border-t border-gray-200 gap-2">
          <button 
            onClick={() => {
              if (onValidate && onValidate()) {
                onClose();
              } else if (!onValidate) {
                onClose();
              }
            }} 
            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Save
          </button>
          <button onClick={onDeleteClick} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            Delete Warehouse
          </button>
        </div>
      </div>
    </>
  );
}
