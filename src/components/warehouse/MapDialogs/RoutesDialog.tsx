'use client';

import { useState } from 'react';
import { Warehouse } from '@/store/warehouseStore';
import { formatAddress } from '@/utils/formatAddress';
import { Motorbike, Truck, Van } from 'lucide-react';
import { useRouteHistoryStore, RouteHistory } from '@/store/routeHistoryStore';
import { FarmArea } from '@/store/farmStore';

interface RoutesDialogProps {
  show: boolean;
  warehouse: Warehouse | null;
  warehouses: Warehouse[];
  farmAreas: FarmArea[];
  onClose: () => void;
  onShowRoute: (route: { coordinates: [number, number][]; distance: number; duration: number }) => void;
}

type VehicleType = 'motorcycle' | 'car' | 'truck';

const vehicleProfiles: Record<VehicleType, string> = {
  motorcycle: 'driving-car',
  car: 'driving-car',
  truck: 'driving-hgv',
};

export function RoutesDialog({ show, warehouse, warehouses, farmAreas, onClose, onShowRoute }: RoutesDialogProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('car');
  const [selectedDestination, setSelectedDestination] = useState<number | null>(null);
  const [selectedDestinationType, setSelectedDestinationType] = useState<'warehouse' | 'farm'>('warehouse');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addRoute } = useRouteHistoryStore();

  if (!show || !warehouse) return null;

  const otherWarehouses = warehouses.filter(w => w.id !== warehouse.id);

  const vehicles = [
    { id: 'motorcycle' as VehicleType, icon: Motorbike, label: 'Motorbike' },
    { id: 'car' as VehicleType, icon: Van, label: 'Van' },
    { id: 'truck' as VehicleType, icon: Truck, label: 'Truck' },
  ];

  const handleShowRoute = async () => {
    if (!selectedDestination) return;

    let destination: { id: number; name: string; lat: number; lng: number; points?: [number, number][] };
    
    if (selectedDestinationType === 'warehouse') {
      const dest = warehouses.find(w => w.id === selectedDestination);
      if (!dest) return;
      destination = { ...dest, points: [[dest.lat, dest.lng]] };
    } else {
      const dest = farmAreas.find(f => f.id === selectedDestination);
      if (!dest) return;
      const centerPoint = dest.points.reduce((acc, point) => [acc[0] + point[0], acc[1] + point[1]], [0, 0]);
      const lat = centerPoint[0] / dest.points.length;
      const lng = centerPoint[1] / dest.points.length;
      destination = {
        id: dest.id,
        name: dest.name,
        lat,
        lng,
        points: dest.points
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const profile = vehicleProfiles[selectedVehicle];
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ORS_BASE_URL}/directions/${profile}`,
        {
          method: 'POST',
          headers: {
            'Authorization': process.env.NEXT_PUBLIC_ORS_API_KEY || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coordinates: [
              [warehouse.lng, warehouse.lat],
              [destination.lng, destination.lat],
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch route');
      }

      const data = await response.json();
      const route = data.routes[0];
      const geometry = route.geometry;

      const decodedCoords = decodePolyline(geometry);
      const distance = route.summary.distance;
      const duration = route.summary.duration;

      const routeHistory: RouteHistory = {
        id: Date.now(),
        fromWarehouseId: warehouse.id,
        toWarehouseId: destination.id,
        fromWarehouseName: warehouse.name,
        toWarehouseName: destination.name,
        vehicle: selectedVehicle,
        distance,
        duration,
        createdAt: Date.now(),
        coordinates: decodedCoords,
        isFarm: selectedDestinationType === 'farm',
      };

      addRoute(routeHistory);
      onShowRoute({ coordinates: decodedCoords, distance, duration });
      onClose();
    } catch {
      setError('Failed to calculate route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const decodePolyline = (encoded: string): [number, number][] => {
    const coordinates: [number, number][] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b: number;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;

      coordinates.push([lat / 1e5, lng / 1e5]);
    }

    return coordinates;
  };

  return (
    <>
      <div className="absolute inset-0 bg-black/50 z-[60]" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-[61] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Select For Routes</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle.id)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors border ${
                  selectedVehicle === vehicle.id
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <vehicle.icon size={20} />
                <span className="hidden sm:inline">{vehicle.label}</span>
              </button>
            ))}
          </div>
          <div>
            <input
              type="text"
              value={warehouse.name}
              disabled
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none bg-gray-50"
            />
            {warehouse.location && (
              <p className="text-xs text-gray-500 mt-1">{formatAddress(warehouse.location)}</p>
            )}
          </div>
          <div className="flex justify-center">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div>
            <select
              value={selectedDestinationType}
              onChange={(e) => setSelectedDestinationType(e.target.value as 'warehouse' | 'farm')}
              disabled={otherWarehouses.length === 0 && farmAreas.length === 0}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="warehouse">Warehouse</option>
              <option value="farm">Farm Area</option>
            </select>
          </div>
          <div>
            <select
              value={selectedDestination || ''}
              onChange={(e) => setSelectedDestination(e.target.value ? Number(e.target.value) : null)}
              disabled={
                (selectedDestinationType === 'warehouse' && otherWarehouses.length === 0) ||
                (selectedDestinationType === 'farm' && farmAreas.length === 0)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              {selectedDestinationType === 'warehouse' ? (
                otherWarehouses.length === 0 ? (
                  <option value="">No other warehouse</option>
                ) : (
                  <>
                    <option value="">Select destination warehouse...</option>
                    {otherWarehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} - {w.location ? formatAddress(w.location) : 'No address'}
                      </option>
                    ))}
                  </>
                )
              ) : farmAreas.length === 0 ? (
                <option value="">No farm areas</option>
              ) : (
                <>
                  <option value="">Select destination farm...</option>
                  {farmAreas.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} - {f.location ? formatAddress(f.location) : f.varieties}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
        </div>
        <div className="flex p-4 border-t border-gray-200">
          <button
            onClick={handleShowRoute}
            disabled={!selectedDestination || isLoading || otherWarehouses.length === 0}
            className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Calculating...' : 'Show Route'}
          </button>
        </div>
      </div>
    </>
  );
}
