'use client';

import { LayerButton } from './LayerButton';
import { CompassButton } from './CompassButton';

interface ToolbarProps {
  showDrawer: boolean;
  onToggleDrawer: () => void;
  isDrawingMode: boolean;
  onToggleDrawingMode: () => void;
  showMeasurementTooltip: boolean;
  setShowMeasurementTooltip: (show: boolean) => void;
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
  showSatelliteTooltip: boolean;
  setShowSatelliteTooltip: (show: boolean) => void;
  showTerrainTooltip: boolean;
  setShowTerrainTooltip: (show: boolean) => void;
  showStreetsTooltip: boolean;
  setShowStreetsTooltip: (show: boolean) => void;
  mapRotation: number;
  onResetRotation: () => void;
  showCompassTooltip: boolean;
  setShowCompassTooltip: (show: boolean) => void;
  getCardinalDirection: (rotation: number) => string;
}

export function Toolbar({
  showDrawer,
  onToggleDrawer,
  isDrawingMode,
  onToggleDrawingMode,
  showMeasurementTooltip,
  setShowMeasurementTooltip,
  activeTheme,
  setActiveTheme,
  showSatelliteTooltip,
  setShowSatelliteTooltip,
  showTerrainTooltip,
  setShowTerrainTooltip,
  showStreetsTooltip,
  setShowStreetsTooltip,
  mapRotation,
  onResetRotation,
  showCompassTooltip,
  setShowCompassTooltip,
  getCardinalDirection,
}: ToolbarProps) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
      {!showDrawer && (
        <button onClick={onToggleDrawer} className="rounded-lg bg-white p-2 shadow-lg hover:bg-gray-100">
          <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      <div className="relative">
        <button
          onClick={onToggleDrawingMode}
          onMouseEnter={() => setShowMeasurementTooltip(true)}
          onMouseLeave={() => setShowMeasurementTooltip(false)}
          className={`rounded-lg p-2.5 shadow-lg transition-colors ${isDrawingMode ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
          </svg>
        </button>
        {showMeasurementTooltip && (
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white whitespace-nowrap shadow-lg">
            Measurement
            <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-gray-900" />
          </div>
        )}
      </div>
      <LayerButton
        active={activeTheme === 'satellite'}
        onClick={() => setActiveTheme('satellite')}
        label="Satellite"
        showTooltip={showSatelliteTooltip}
        setShowTooltip={setShowSatelliteTooltip}
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <LayerButton
        active={activeTheme === 'terrain'}
        onClick={() => setActiveTheme('terrain')}
        label="Terrain"
        showTooltip={showTerrainTooltip}
        setShowTooltip={setShowTerrainTooltip}
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      />
      <LayerButton
        active={activeTheme === 'streets'}
        onClick={() => setActiveTheme('streets')}
        label="Streets"
        showTooltip={showStreetsTooltip}
        setShowTooltip={setShowStreetsTooltip}
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        }
      />
      <CompassButton
        rotation={mapRotation}
        onReset={onResetRotation}
        showTooltip={showCompassTooltip}
        setShowTooltip={setShowCompassTooltip}
        getCardinalDirection={getCardinalDirection}
      />
    </div>
  );
}
