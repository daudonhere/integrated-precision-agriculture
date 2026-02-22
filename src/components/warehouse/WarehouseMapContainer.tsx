'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { MapController } from '../maps/MapController';
import { SearchMarker } from '../maps/MapMarkers';
import { SearchBox, NavigationOverlay } from '../maps/MapSearch';
import { Toolbar } from '../maps/MapToolbar';
import { WarehouseDrawer } from './MapDrawer';
import { WarehouseDialog, DeleteConfirmDialog } from './MapDialogs';
import { useMapSearch, useWarehouseManagement } from '@/hooks';
import { SearchSuggestion } from '@/types/map';
import { MAP_THEMES } from '@/utils/mapConstants';
import { Warehouse } from '@/store/warehouseStore';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const warehouseIcon = L.divIcon({
  className: 'warehouse-marker',
  html: `<div style="background: #16a34a; border: 3px solid white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg style="width: 24px; height: 24px; color: white;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export default function WarehouseMapComponent() {
  const [activeTheme, setActiveTheme] = useState('satellite');
  const [showDrawer, setShowDrawer] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.92148, 106.92617]);
  const [showSatelliteTooltip, setShowSatelliteTooltip] = useState(false);
  const [showTerrainTooltip, setShowTerrainTooltip] = useState(false);
  const [showStreetsTooltip, setShowStreetsTooltip] = useState(false);
  const [mapRotation, setMapRotation] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchMarker, setSearchMarker] = useState<{ lat: number; lon: number } | null>(null);
  const [showCompassTooltip, setShowCompassTooltip] = useState(false);

  const mapRef = useRef<L.Map | null>(null);

  const {
    searchQuery,
    searchSuggestions,
    showSuggestions,
    isSearching,
    setShowSuggestions,
    handleSearchChange,
    handleSelectSuggestion,
    handleSearchKeyDown,
  } = useMapSearch();

  const {
    warehouses,
    selectedWarehouse,
    setSelectedWarehouse,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleAddWarehouse,
    handleUpdateWarehouse,
    handleDeleteWarehouse,
    handleFetchLocationData,
  } = useWarehouseManagement();

  const currentTheme = MAP_THEMES.find(t => t.id === activeTheme) || MAP_THEMES[0];

  const getCardinalDirection = (rotation: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(rotation / 45) % 8;
    return directions[index >= 0 ? index : index + 8];
  };

  const handleSelectSuggestionWithNav = useCallback((suggestion: SearchSuggestion) => {
    const coords = handleSelectSuggestion(suggestion);
    setIsNavigating(true);
    setSearchMarker({ lat: coords.lat, lon: coords.lon });
    setMapCenter([coords.lat, coords.lon]);

    if (mapRef.current) {
      mapRef.current.flyTo([coords.lat, coords.lon], 16, { duration: 2 });
    }
    setTimeout(() => setIsNavigating(false), 2000);
  }, [handleSelectSuggestion]);

  const handleSearchKeyDownWrapper = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    handleSearchKeyDown(e, () => {
      handleSelectSuggestionWithNav(searchSuggestions[0]);
    });
  }, [handleSearchKeyDown, handleSelectSuggestionWithNav, searchSuggestions]);

  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    if (selectedWarehouse) {
      setSelectedWarehouse(null);
      return;
    }
    handleAddWarehouse(e.latlng.lat, e.latlng.lng);
  }, [selectedWarehouse, handleAddWarehouse]);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
    map.on('click', handleMapClick);
  }, [handleMapClick]);

  const handleMarkerClick = useCallback((warehouse: Warehouse) => {
    setSelectedWarehouse({ ...warehouse });
    if (!warehouse.elevation || !warehouse.location) {
      handleFetchLocationData(warehouse.lat, warehouse.lng, warehouse.id);
    }
  }, [handleFetchLocationData, setSelectedWarehouse]);

  const handleNavigateToWarehouse = useCallback((warehouse: Warehouse) => {
    setMapCenter([warehouse.lat, warehouse.lng]);
    if (mapRef.current) {
      mapRef.current.flyTo([warehouse.lat, warehouse.lng], 16, { duration: 1.5 });
    }
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex flex-1 overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={15}
          className="h-full w-full"
          style={{ zIndex: 1 }}
          scrollWheelZoom={true}
          zoomControl={false}
          dragging={true}
        >
          <MapController onMapReady={handleMapReady} isDrawingMode={false} onRotationChange={setMapRotation} />
          <TileLayer attribution={currentTheme.attribution} url={currentTheme.url} />

          {warehouses.map((warehouse) => (
            <Marker
              key={warehouse.id}
              position={[warehouse.lat, warehouse.lng]}
              icon={warehouseIcon}
              eventHandlers={{ click: () => handleMarkerClick(warehouse) }}
            />
          ))}

          <SearchMarker position={searchMarker} />
        </MapContainer>

        <div className="absolute top-4 left-4 z-50 w-80">
          <SearchBox
            searchQuery={searchQuery}
            searchSuggestions={searchSuggestions}
            showSuggestions={showSuggestions}
            isSearching={isSearching}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDownWrapper}
            onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onSelect={handleSelectSuggestionWithNav}
          />
        </div>

        <NavigationOverlay isNavigating={isNavigating} />

        <Toolbar
          showDrawer={showDrawer}
          onToggleDrawer={() => setShowDrawer(true)}
          activeTheme={activeTheme}
          setActiveTheme={setActiveTheme}
          showSatelliteTooltip={showSatelliteTooltip}
          setShowSatelliteTooltip={setShowSatelliteTooltip}
          showTerrainTooltip={showTerrainTooltip}
          setShowTerrainTooltip={setShowTerrainTooltip}
          showStreetsTooltip={showStreetsTooltip}
          setShowStreetsTooltip={setShowStreetsTooltip}
          mapRotation={mapRotation}
          onResetRotation={() => { (mapRef.current as unknown as { setRotation: (r: number) => void })?.setRotation(0); setMapRotation(0); }}
          showCompassTooltip={showCompassTooltip}
          setShowCompassTooltip={setShowCompassTooltip}
          getCardinalDirection={getCardinalDirection}
          hideDrawingControls
        />
      </div>

      <WarehouseDrawer
        showDrawer={showDrawer}
        onClose={() => setShowDrawer(false)}
        warehouses={warehouses}
        onNavigateToWarehouse={handleNavigateToWarehouse}
      />

      {showDeleteConfirm && selectedWarehouse && (
        <DeleteConfirmDialog onClose={() => setShowDeleteConfirm(false)} onConfirm={() => handleDeleteWarehouse(selectedWarehouse.id)} />
      )}

      {selectedWarehouse && (
        <WarehouseDialog
          selectedWarehouse={selectedWarehouse}
          onClose={() => setSelectedWarehouse(null)}
          onUpdateWarehouse={handleUpdateWarehouse}
          onDeleteClick={() => setShowDeleteConfirm(true)}
        />
      )}
    </div>
  );
}
