'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { MapController } from './MapController';
import { MapEvents } from './MapEvents';
import { VertexMarkers, EdgeMarkers, AreaLabels, SearchMarker } from './MapMarkers';
import { SearchBox, NavigationOverlay } from './MapSearch';
import { Toolbar } from './MapToolbar';
import { FarmDrawer, PreviewPolygon } from './MapDrawer';
import { AreaDetailsDialog, DeleteConfirmDialog } from './MapDialogs';
import { useMapSearch, useShapeManagement } from '@/hooks';
import { DrawnShape, SearchSuggestion } from '@/types/map';
import { MAP_THEMES } from '@/utils/mapConstants';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function MapComponent() {
  const [activeTheme, setActiveTheme] = useState('satellite');
  const [showDrawer, setShowDrawer] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.92148, 106.92617]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showMeasurementTooltip, setShowMeasurementTooltip] = useState(false);
  const [showCompassTooltip, setShowCompassTooltip] = useState(false);
  const [showSatelliteTooltip, setShowSatelliteTooltip] = useState(false);
  const [showTerrainTooltip, setShowTerrainTooltip] = useState(false);
  const [showStreetsTooltip, setShowStreetsTooltip] = useState(false);
  const [previewPoints, setPreviewPoints] = useState<[number, number][] | null>(null);
  const [mapRotation, setMapRotation] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchMarker, setSearchMarker] = useState<{ lat: number; lon: number } | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const isDrawingModeRef = useRef(isDrawingMode);

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
    shapes,
    selectedShape,
    setSelectedShape,
    showDeleteConfirm,
    setShowDeleteConfirm,
    validationErrors,
    updateShapePoints,
    handleRectangleDraw,
    handleUpdateShapeName,
    handleUpdateShapeField,
    handleVertexDrag,
    handleAddVertex,
    handleDeleteShape,
    handleFetchLocationData,
    validateShapeFields,
  } = useShapeManagement();

  const currentTheme = MAP_THEMES.find(t => t.id === activeTheme) || MAP_THEMES[0];

  useEffect(() => {
    isDrawingModeRef.current = isDrawingMode;
  }, [isDrawingMode]);

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

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  const handlePolygonClick = useCallback((e: L.LeafletEvent, shape: DrawnShape) => {
    L.DomEvent.stopPropagation((e as unknown as { originalEvent: MouseEvent }).originalEvent);
    const latlng = (e as L.LeafletMouseEvent).latlng;
    let minDist = Infinity;
    let edgeIndex = 0;

    for (let i = 0; i < shape.points.length; i++) {
      const p1 = shape.points[i];
      const p2 = shape.points[(i + 1) % shape.points.length];
      const midLat = (p1[0] + p2[0]) / 2;
      const midLng = (p1[1] + p2[1]) / 2;
      const dist = Math.sqrt(Math.pow(latlng.lat - midLat, 2) + Math.pow(latlng.lng - midLng, 2));
      if (dist < minDist) {
        minDist = dist;
        edgeIndex = i;
      }
    }

    if (minDist < 0.0015) {
      const newPoints = [...shape.points];
      newPoints.splice(edgeIndex + 1, 0, [latlng.lat, latlng.lng]);
      updateShapePoints(shape.id, newPoints);
    } else {
      setSelectedShape({ ...shape });
      if (!shape.elevation || !shape.address) {
        handleFetchLocationData(shape.points[0][0], shape.points[0][1], shape.id);
      }
    }
  }, [updateShapePoints, handleFetchLocationData, setSelectedShape]);

  const handleNavigateToArea = useCallback((shape: DrawnShape) => {
    setMapCenter([shape.points[0][0], shape.points[0][1]]);
    if (mapRef.current) {
      mapRef.current.flyTo([shape.points[0][0], shape.points[0][1]], 16, { duration: 1.5 });
    }
  }, []);

  return (
    <div className="flex h-screen flex-col">
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
          <MapEvents isDrawingMode={isDrawingMode} onRectangleDraw={handleRectangleDraw} onPreview={setPreviewPoints} />

          <PreviewPolygon points={previewPoints} />

          {shapes.map((shape) => (
            <Polygon
              key={shape.id}
              positions={shape.points}
              pathOptions={{ color: shape.color, fillColor: shape.color, fillOpacity: 0.4, weight: 3, className: 'cursor-pointer' }}
              eventHandlers={{ click: (e) => handlePolygonClick(e, shape) }}
            />
          ))}

          <VertexMarkers shapes={shapes} onVertexDrag={handleVertexDrag} />
          <EdgeMarkers shapes={shapes} onAddVertex={handleAddVertex} />
          <AreaLabels shapes={shapes} />
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
          isDrawingMode={isDrawingMode}
          onToggleDrawingMode={() => setIsDrawingMode(!isDrawingMode)}
          showMeasurementTooltip={showMeasurementTooltip}
          setShowMeasurementTooltip={setShowMeasurementTooltip}
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
        />
      </div>

      <FarmDrawer
        showDrawer={showDrawer}
        onClose={() => setShowDrawer(false)}
        shapes={shapes}
        onNavigateToArea={handleNavigateToArea}
      />

      {showDeleteConfirm && selectedShape && (
        <DeleteConfirmDialog onClose={() => setShowDeleteConfirm(false)} onConfirm={() => handleDeleteShape(selectedShape.id)} />
      )}

      {selectedShape && (
        <AreaDetailsDialog
          selectedShape={selectedShape}
          onClose={() => setSelectedShape(null)}
          onUpdateName={handleUpdateShapeName}
          onUpdateField={handleUpdateShapeField}
          onDeleteClick={() => setShowDeleteConfirm(true)}
          validationErrors={validationErrors?.[selectedShape.id]}
          onValidate={() => validateShapeFields(selectedShape.id)}
        />
      )}
    </div>
  );
}
