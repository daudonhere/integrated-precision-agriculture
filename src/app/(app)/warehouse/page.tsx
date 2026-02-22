'use client';

import dynamic from 'next/dynamic';

const WarehouseMapComponent = dynamic(() => import('@/components/warehouse/WarehouseMapContainer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-500" />
        <p className="mt-2 text-sm text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

export default function WarehousePage() {
  return <WarehouseMapComponent />;
}
