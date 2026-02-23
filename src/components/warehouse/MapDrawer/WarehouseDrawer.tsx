'use client';

import { Warehouse } from '@/store/warehouseStore';
import { formatAddress } from '@/utils/formatAddress';

interface WarehouseDrawerProps {
  showDrawer: boolean;
  onClose: () => void;
  warehouses: Warehouse[];
  onNavigateToWarehouse: (warehouse: Warehouse) => void;
  onOpenRoutesDialog: (warehouse: Warehouse) => void;
}

export function WarehouseDrawer({ showDrawer, onClose, warehouses, onNavigateToWarehouse, onOpenRoutesDialog }: WarehouseDrawerProps) {
  const handleRoutesClick = (warehouse: Warehouse, e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenRoutesDialog(warehouse);
    onClose();
  };

  const handleMapsClick = (warehouse: Warehouse, e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigateToWarehouse(warehouse);
  };

  if (!showDrawer) return null;

  return (
    <>
      <div className="absolute inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col">
        <style>{`@keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } } .animate-slide-in { animation: slide-in 0.3s ease-out; }`}</style>

        <div className="flex-shrink-0 border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Warehouse Location</h2>
              <p className="text-xs text-gray-500 mt-1">{warehouses.length} {warehouses.length === 1 ? 'Warehouse' : 'Warehouses'} Created</p>
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
            {warehouses.length > 0 ? (
              warehouses.map((warehouse) => (
                <div
                  key={warehouse.id}
                  onClick={() => onNavigateToWarehouse(warehouse)}
                  className="cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md hover:border-gray-300"
                  style={{ borderColor: '#16a34a' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#16a34a' }} />
                    <span className="text-sm font-semibold text-gray-900">{warehouse.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">Capacity:</span> {warehouse.capacity.toLocaleString()} Kg
                  </p>
                  {warehouse.location && <p className="text-xs text-gray-500 line-clamp-2">{formatAddress(warehouse.location)}</p>}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => handleRoutesClick(warehouse, e)}
                      className="flex-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                    >
                      Routes
                    </button>
                    <button
                      onClick={(e) => handleMapsClick(warehouse, e)}
                      className="flex-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      Maps
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No warehouses added yet</p>
                <p className="text-xs text-gray-400 mt-1">Click on the map to add a warehouse</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
