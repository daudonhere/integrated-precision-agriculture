'use client';

import { useState, useCallback, useRef } from 'react';
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
import { FarmArea } from '@/store/farmStore';
import { useFarmStore } from '@/store/farmStore';
import { Polygon } from 'react-leaflet';

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
  const [showMeasurementTooltip, setShowMeasurementTooltip] = useState(false);
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

  const [isDrawingMode, setIsDrawingMode] = useState(false);

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

  const { data: farmAreas } = useFarmStore();

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
    if (isDrawingMode) {
      handleAddWarehouse(e.latlng.lat, e.latlng.lng);
      return;
    }
    if (selectedWarehouse) {
      setSelectedWarehouse(null);
      return;
    }
  }, [isDrawingMode, handleAddWarehouse, selectedWarehouse, setSelectedWarehouse]);

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

  const handleShowRouteFromHistory = useCallback((fromWarehouse: Warehouse, to: Warehouse | FarmArea, vehicle: 'motorcycle' | 'car' | 'truck', isFarm: boolean) => {
    const vehicleProfiles: Record<string, string> = {
      motorcycle: 'driving-car',
      car: 'driving-car',
      truck: 'driving-hgv',
    };

    const profile = vehicleProfiles[vehicle];
    const toLat = isFarm 
      ? (to as FarmArea).points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]).map(v => v / (to as FarmArea).points.length)
      : [(to as Warehouse).lat, (to as Warehouse).lng];
    const toLng = toLat[1];

    fetch(
      `${process.env.NEXT_PUBLIC_ORS_BASE_URL}/directions/${profile}`,
      {
        method: 'POST',
        headers: {
          'Authorization': process.env.NEXT_PUBLIC_ORS_API_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [
            [toLng, toLat[0]],
            [fromWarehouse.lng, fromWarehouse.lat],
          ],
        }),
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch route');
        return res.json();
      })
      .then((data) => {
        const route = data.routes[0];
        const geometry = route.geometry;

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

        const decodedCoords = decodePolyline(geometry);
        const distance = route.summary.distance;
        const duration = route.summary.duration;

        setRouteData({ coordinates: decodedCoords, distance, duration });

        if (mapRef.current && decodedCoords.length > 0) {
          const bounds = L.latLngBounds(decodedCoords.map(coord => [coord[0], coord[1]]));
          mapRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 14 });
        }
      })
      .catch(() => {
      });
  }, []);

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
          <style>{`${isDrawingMode ? '.leaflet-container { cursor: crosshair !important; }' : ''}`}</style>
          <MapController onMapReady={handleMapReady} isDrawingMode={isDrawingMode} onRotationChange={setMapRotation} />
          <TileLayer attribution={currentTheme.attribution} url={currentTheme.url} />

          {warehouses.map((warehouse) => (
            <Marker
              key={warehouse.id}
              position={[warehouse.lat, warehouse.lng]}
              icon={warehouseIcon}
              eventHandlers={{ click: () => handleMarkerClick(warehouse) }}
            />
          ))}

          {routeData && farmAreas && farmAreas.map((area) => (
            <Polygon
              key={area.id}
              positions={area.points}
              pathOptions={{ color: area.color, fillColor: area.color, fillOpacity: 0.3, weight: 2 }}
            />
          ))}

          <SearchMarker position={searchMarker} />

          {routeData && (
            <Polyline
              positions={routeData.coordinates}
              pathOptions={{ color: '#16a34a', weight: 5, opacity: 0.8 }}
            />
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
          isDrawingMode={isDrawingMode}
          onToggleDrawingMode={() => setIsDrawingMode(!isDrawingMode)}
          showMeasurementTooltip={showMeasurementTooltip}
          setShowMeasurementTooltip={setShowMeasurementTooltip}
          measurementLabel="Add Warehouse"
          measurementIcon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
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
          hideDrawingControls={false}
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
          warehouses={warehouses}
          farmAreas={farmAreas || []}
          onClose={() => setSelectedWarehouse(null)}
          onUpdateWarehouse={handleUpdateWarehouse}
          onDeleteClick={() => setShowDeleteConfirm(true)}
          onShowRoute={handleShowRouteFromHistory}
        />
      )}

      <RoutesDialog
        show={showRoutesDialog}
        warehouse={selectedWarehouseForRoute}
        warehouses={warehouses}
        farmAreas={farmAreas || []}
        onClose={() => {
          setShowRoutesDialog(false);
          setSelectedWarehouseForRoute(null);
        }}
        onShowRoute={handleShowRoute}
      />
    </div>
  );
}
