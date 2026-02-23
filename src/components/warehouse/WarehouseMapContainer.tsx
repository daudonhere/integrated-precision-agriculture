'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { MapController } from '../maps/MapController';
import { SearchMarker } from '../maps/MapMarkers';
import { SearchBox, NavigationOverlay } from '../maps/MapSearch';
import { Toolbar } from '../maps/MapToolbar';
import { WarehouseDrawer } from './MapDrawer';
import { WarehouseDialog, DeleteConfirmDialog, RoutesDialog } from './MapDialogs';
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
  const [routeData, setRouteData] = useState<{ coordinates: [number, number][]; distance: number; duration: number } | null>(null);
  const [showRoutesDialog, setShowRoutesDialog] = useState(false);
  const [selectedWarehouseForRoute, setSelectedWarehouseForRoute] = useState<Warehouse | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
  }, [selectedWarehouse, setSelectedWarehouse, handleAddWarehouse]);

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

  const handleOpenRoutesDialog = useCallback((warehouse: Warehouse) => {
    setSelectedWarehouseForRoute(warehouse);
    setShowRoutesDialog(true);
  }, []);

  const handleShowRoute = useCallback((route: { coordinates: [number, number][]; distance: number; duration: number }) => {
    setRouteData(route);
    if (mapRef.current && route.coordinates.length > 0) {
      const bounds = L.latLngBounds(route.coordinates.map(coord => [coord[0], coord[1]]));
      mapRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 14 });
    }
  }, []);

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes} min`;
  };

  const RouteLabel = ({ routeData, map, containerRef }: { routeData: { coordinates: [number, number][]; distance: number; duration: number }; map: L.Map; containerRef: HTMLDivElement | null }) => {
    const [, forceUpdate] = useState(0);

    useEffect(() => {
      const updatePosition = () => {
        forceUpdate(n => n + 1);
      };

      map.on('move', updatePosition);
      map.on('zoom', updatePosition);
      return () => {
        map.off('move', updatePosition);
        map.off('zoom', updatePosition);
      };
    }, [map]);

    if (!containerRef || routeData.coordinates.length < 2) return null;

    const midIndex = Math.floor(routeData.coordinates.length / 2);
    const midPoint = routeData.coordinates[midIndex];
    const containerPoint = map.latLngToContainerPoint(midPoint);

    const prevIndex = Math.max(0, midIndex - 5);
    const nextIndex = Math.min(routeData.coordinates.length - 1, midIndex + 5);
    const prevPoint = routeData.coordinates[prevIndex];
    const nextPoint = routeData.coordinates[nextIndex];

    const dx = nextPoint[1] - prevPoint[1];
    const dy = nextPoint[0] - prevPoint[0];
    const length = Math.sqrt(dx * dx + dy * dy);

    const offsetX = length === 0 ? 0 : (-dy / length) * 25;
    const offsetY = length === 0 ? -25 : (dx / length) * 25;

    return createPortal(
      <div
        style={{
          position: 'absolute',
          left: containerPoint.x + offsetX,
          top: containerPoint.y + offsetY,
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
          backgroundColor: 'white',
          border: '2px solid #16a34a',
          borderRadius: '8px',
          padding: '6px 10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
        }}
      >
        <div className="flex gap-2 text-xs font-medium whitespace-nowrap">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-gray-700">{formatDistance(routeData.distance)}</span>
          </div>
          <div className="w-px h-3 bg-gray-300" />
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-700">{formatDuration(routeData.duration)}</span>
          </div>
        </div>
      </div>,
      containerRef
    );
  };

  return (
    <div className="flex h-full flex-col" ref={containerRef}>
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

          {routeData && (
            <>
              <Polyline
                positions={routeData.coordinates}
                pathOptions={{ color: '#16a34a', weight: 5, opacity: 0.8 }}
              />
              {mapRef.current && <RouteLabel routeData={routeData} map={mapRef.current} containerRef={containerRef.current} />}
            </>
          )}
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
        onOpenRoutesDialog={handleOpenRoutesDialog}
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

      <RoutesDialog
        show={showRoutesDialog}
        warehouse={selectedWarehouseForRoute}
        warehouses={warehouses}
        onClose={() => {
          setShowRoutesDialog(false);
          setSelectedWarehouseForRoute(null);
        }}
        onShowRoute={handleShowRoute}
      />
    </div>
  );
}
