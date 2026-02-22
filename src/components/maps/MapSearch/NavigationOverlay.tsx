'use client';

import { NavigationOverlayProps } from '@/types/map';

export function NavigationOverlay({ isNavigating }: NavigationOverlayProps) {
  if (!isNavigating) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-40">
      <div className="bg-white rounded-xl p-6 shadow-2xl text-center">
        <svg className="h-12 w-12 animate-spin text-green-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm font-medium text-gray-900">Navigating to location...</p>
        <p className="text-xs text-gray-500 mt-1">Please wait</p>
      </div>
    </div>
  );
}
