'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MAP_THEMES = [
  { id: 'satellite', name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: 'Esri World Imagery' },
  { id: 'terrain', name: 'Terrain', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: 'OpenTopoMap' },
  { id: 'streets', name: 'Streets', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', attribution: 'CartoDB Voyager' },
];

const POLYGON_COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

function calculateArea(latLngs: [number, number][]): number {
  if (latLngs.length < 3) return 0;
  const R = 6378137;
  let area = 0;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  for (let i = 0; i < latLngs.length; i++) {
    const p1 = latLngs[i];
    const p2 = latLngs[(i + 1) % latLngs.length];
    area += toRad(p2[0] - p1[0]) * (2 + Math.sin(toRad(p1[1])) + Math.sin(toRad(p2[1])));
  }
  return Math.abs(area * R * R / 2);
}

function formatArea(area: number): string {
  if (area >= 1000000) return `${(area / 1000000).toFixed(2)} km²`;
  if (area >= 10000) return `${(area / 10000).toFixed(2)} ha`;
  return `${area.toFixed(0)} m²`;
}

interface DrawnShape {
  id: number;
  name: string;
  points: [number, number][];
  color: string;
  area: number;
  elevation?: number;
  address?: string;
  varieties?: string;
  harvestDate?: string;
}

interface UpdateShapeData {
  points?: [number, number][];
  area?: number;
  address?: string;
  elevation?: number;
}

function MapController({ onMapReady, isDrawingMode, onRotationChange }: {
  onMapReady: (map: L.Map) => void;
  isDrawingMode: boolean;
  onRotationChange: (rotation: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  useEffect(() => {
    if (isDrawingMode) {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
    } else {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
    }
  }, [isDrawingMode, map]);

  useEffect(() => {
    const handleRotate = () => {
      const bearing = (map as unknown as { getBearing?: () => number }).getBearing?.() || 0;
      onRotationChange(bearing);
    };
    map.on('rotate', handleRotate);
    return () => {
      map.off('rotate', handleRotate);
    };
  }, [map, onRotationChange]);

  return null;
}

function MapEvents({ onRectangleDraw, isDrawingMode, onPreview }: {
  onRectangleDraw: (points: [number, number][]) => void;
  isDrawingMode: boolean;
  onPreview: (points: [number, number][] | null) => void;
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<L.LatLng | null>(null);

  useMapEvents({
    mousedown: (e) => {
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.leaflet-marker-icon') ||
        target.closest('.vertex-marker') ||
        target.closest('.leaflet-interactive')) return;

      if (isDrawingMode && !isDrawing) {
        L.DomEvent.stopPropagation(e.originalEvent);
        setIsDrawing(true);
        setStartPoint(e.latlng);
      }
    },
    mousemove: (e) => {
      if (isDrawingMode && isDrawing && startPoint) {
        onPreview([
          [startPoint.lat, startPoint.lng],
          [startPoint.lat, e.latlng.lng],
          [e.latlng.lat, e.latlng.lng],
          [e.latlng.lat, startPoint.lng],
        ]);
      }
    },
    mouseup: (e) => {
      if (isDrawingMode && isDrawing && startPoint) {
        L.DomEvent.stopPropagation(e.originalEvent);
        onRectangleDraw([
          [startPoint.lat, startPoint.lng],
          [startPoint.lat, e.latlng.lng],
          [e.latlng.lat, e.latlng.lng],
          [e.latlng.lat, startPoint.lng],
        ]);
        setIsDrawing(false);
        setStartPoint(null);
        onPreview(null);
      }
    },
  });

  return null;
}

function LayerButton({ active, onClick, label, icon, showTooltip, setShowTooltip }: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  showTooltip: boolean;
  setShowTooltip: (show: boolean) => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`rounded-lg p-2.5 shadow-lg transition-colors ${active ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
      >
        {icon}
      </button>
      {showTooltip && (
        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white whitespace-nowrap shadow-lg">
          {label}
          <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-gray-900" />
        </div>
      )}
    </div>
  );
}

export default function MapComponent() {
  const [activeTheme, setActiveTheme] = useState('satellite');
  const [shapes, setShapes] = useState<DrawnShape[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.92148, 106.92617]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showMeasurementTooltip, setShowMeasurementTooltip] = useState(false);
  const [showCompassTooltip, setShowCompassTooltip] = useState(false);
  const [showSatelliteTooltip, setShowSatelliteTooltip] = useState(false);
  const [showTerrainTooltip, setShowTerrainTooltip] = useState(false);
  const [showStreetsTooltip, setShowStreetsTooltip] = useState(false);
  const [previewPoints, setPreviewPoints] = useState<[number, number][] | null>(null);
  const [selectedShape, setSelectedShape] = useState<DrawnShape | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mapRotation, setMapRotation] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{ lat: string; lon: string; display_name: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMarker, setSearchMarker] = useState<{ lat: number; lon: number } | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const isDrawingModeRef = useRef(isDrawingMode);

  const currentTheme = MAP_THEMES.find(t => t.id === activeTheme) || MAP_THEMES[0];

  useEffect(() => {
    isDrawingModeRef.current = isDrawingMode;
  }, [isDrawingMode]);

  const updateShapePoints = useCallback((shapeId: number, newPoints: [number, number][]) => {
    const area = calculateArea(newPoints);
    setShapes(prev => prev.map(s =>
      s.id === shapeId ? { ...s, points: newPoints, area } : s
    ));
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (query.length < 3) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
          { headers: { 'User-Agent': 'SmartFarm/1.0' } }
        );
        const data = await response.json();
        setSearchSuggestions(data);
        setShowSuggestions(true);
      } catch {
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, []);

  const handleRectangleDraw = useCallback((points: [number, number][]) => {
    const color = POLYGON_COLORS[shapes.length % POLYGON_COLORS.length];
    const area = calculateArea(points);
    setShapes(prev => [...prev, {
      id: Date.now(),
      name: `Area ${shapes.length + 1}`,
      points,
      color,
      area,
    }]);
  }, [shapes.length]);

  const handleUpdateShapeName = useCallback((shapeId: number, name: string) => {
    setShapes(prev => prev.map(s => s.id === shapeId ? { ...s, name } : s));
  }, []);

  const handleUpdateShapeField = useCallback((shapeId: number, field: 'varieties' | 'harvestDate', value: string) => {
    setShapes(prev => prev.map(s => s.id === shapeId ? { ...s, [field]: value } : s));
  }, []);

  const handleRotationChange = useCallback((rotation: number) => setMapRotation(rotation), []);

  const getCardinalDirection = (rotation: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(rotation / 45) % 8;
    return directions[index >= 0 ? index : index + 8];
  };

  const handleSelectSuggestion = useCallback((suggestion: { lat: string; lon: string; display_name: string }) => {
    setIsNavigating(true);
    setShowSuggestions(false);
    setSearchQuery(suggestion.display_name);

    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    setSearchMarker({ lat, lon });
    setMapCenter([lat, lon]);

    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 16, { duration: 2 });
    }
    setTimeout(() => setIsNavigating(false), 2000);
  }, []);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchSuggestions.length > 0) {
      handleSelectSuggestion(searchSuggestions[0]);
    }
  }, [searchSuggestions, handleSelectSuggestion]);

  const handleFetchLocationData = useCallback(async (lat: number, lng: number, shapeId: number) => {
    try {
      const addressResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'SmartFarm/1.0' } }
      );
      const addressData = await addressResponse.json();

      const elevationResponse = await fetch(
        `https://api.opentopodata.org/v1/aster30m?locations=${lat},${lng}`
      );
      const elevationData = await elevationResponse.json();

      const address = addressData.display_name || 'Address not found';
      const elevation = elevationData.results?.[0]?.elevation || 0;
      const updateData: UpdateShapeData = { address, elevation };

      setShapes(prev => prev.map(s => s.id === shapeId ? { ...s, ...updateData } : s));
      setSelectedShape(prev => prev && prev.id === shapeId ? { ...prev, ...updateData } : prev);
    } catch {
      const updateData: UpdateShapeData = { address: 'Failed to load', elevation: 0 };
      setShapes(prev => prev.map(s => s.id === shapeId ? { ...s, ...updateData } : s));
      setSelectedShape(prev => prev && prev.id === shapeId ? { ...prev, ...updateData } : prev);
    }
  }, []);

  const handleVertexDrag = useCallback((shapeId: number, vertexIndex: number, newLatLng: L.LatLng) => {
    setShapes(prev => {
      const shape = prev.find(s => s.id === shapeId);
      if (!shape) return prev;
      const newPoints = [...shape.points];
      newPoints[vertexIndex] = [newLatLng.lat, newLatLng.lng];
      updateShapePoints(shapeId, newPoints);
      return prev;
    });
  }, [updateShapePoints]);

  const handleAddVertex = useCallback((shapeId: number, edgeIndex: number, latlng: L.LatLng) => {
    setShapes(prev => {
      const shape = prev.find(s => s.id === shapeId);
      if (!shape) return prev;
      const newPoints = [...shape.points];
      newPoints.splice(edgeIndex + 1, 0, [latlng.lat, latlng.lng]);
      updateShapePoints(shapeId, newPoints);
      return prev;
    });
  }, [updateShapePoints]);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  const handlePolygonClick = useCallback((e: L.LeafletEvent, shape: DrawnShape) => {
    L.DomEvent.stopPropagation((e as any).originalEvent);
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
  }, [updateShapePoints, handleFetchLocationData]);

  const renderVertexMarkers = useCallback(() => shapes.map((shape) =>
    shape.points.map((point, idx) => (
      <Marker
        key={`vertex-${shape.id}-${idx}`}
        position={point}
        icon={L.divIcon({
          className: 'vertex-marker',
          html: `<div style="width: 8px; height: 8px; background: white; border: 0.5px solid ${shape.color}; border-radius: 50%; cursor: move !important; box-shadow: 0 1px 2px rgba(0,0,0,0.3);"></div>`,
          iconSize: [8, 8],
          iconAnchor: [4, 4],
        })}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            handleVertexDrag(shape.id, idx, marker.getLatLng());
          },
        }}
      />
    ))
  ), [shapes, handleVertexDrag]);

  const renderEdgeMarkers = useCallback(() => shapes.map((shape) =>
    shape.points.map((point, idx) => {
      const nextPoint = shape.points[(idx + 1) % shape.points.length];
      const midLat = (point[0] + nextPoint[0]) / 2;
      const midLng = (point[1] + nextPoint[1]) / 2;
      return (
        <Marker
          key={`edge-${shape.id}-${idx}`}
          position={[midLat, midLng]}
          icon={L.divIcon({
            className: 'edge-marker',
            html: `<div style="width: 8px; height: 8px; background: white; border-radius: 50%; cursor: pointer !important; opacity: 0.5; box-shadow: 0 1px 2px rgba(0,0,0,0.3);"></div>`,
            iconSize: [8, 8],
            iconAnchor: [4, 4],
          })}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e.originalEvent);
              handleAddVertex(shape.id, idx, e.latlng);
            },
          }}
        />
      );
    })
  ), [shapes, handleAddVertex]);

  const renderAreaLabels = useCallback(() => shapes.map((shape) => {
    const center = shape.points.reduce((acc, [lat, lng]) => {
      acc[0] += lat;
      acc[1] += lng;
      return acc;
    }, [0, 0]).map(v => v / shape.points.length) as [number, number];
    return (
      <Marker
        key={`label-${shape.id}`}
        position={center}
        icon={L.divIcon({
          className: 'bg-transparent',
          html: `<div style="background: transparent; padding: 4px 8px; border-radius: 4px; font-size: 14px; font-weight: 700; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 0 3px black; pointer-events: none;">${formatArea(shape.area)}</div>`,
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        })}
      />
    );
  }), [shapes]);

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
          <MapController onMapReady={handleMapReady} isDrawingMode={isDrawingMode} onRotationChange={handleRotationChange} />
          <TileLayer attribution={currentTheme.attribution} url={currentTheme.url} />
          <MapEvents onRectangleDraw={handleRectangleDraw} isDrawingMode={isDrawingMode} onPreview={setPreviewPoints} />

          {previewPoints && (
            <Polygon positions={previewPoints} pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.2, weight: 2, dashArray: '5, 5' }} />
          )}

          {shapes.map((shape) => (
            <Polygon
              key={shape.id}
              positions={shape.points}
              pathOptions={{ color: shape.color, fillColor: shape.color, fillOpacity: 0.4, weight: 3, className: 'cursor-pointer' }}
              eventHandlers={{ click: (e) => handlePolygonClick(e, shape) }}
            />
          ))}

          {renderVertexMarkers()}
          {renderEdgeMarkers()}
          {renderAreaLabels()}

          {searchMarker && (
            <Marker
              position={[searchMarker.lat, searchMarker.lon]}
              icon={L.divIcon({
                className: 'search-marker',
                html: `<div style="width: 12px; height: 12px; background: #22c55e; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4); animation: bounce 0.5s ease-in-out;"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6],
              })}
            />
          )}
        </MapContainer>

        <div className="absolute top-4 left-4 z-[400] w-80">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search address, city, or coordinates..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm text-gray-900 placeholder-gray-400 shadow-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {isSearching && (
              <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl z-[401]">
                {searchSuggestions.map((suggestion, idx) => (
                  <button key={idx} onClick={() => handleSelectSuggestion(suggestion)} className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 border-b border-gray-100 last:border-0">
                    <p className="text-gray-900 line-clamp-2">{suggestion.display_name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isNavigating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-[350]">
            <div className="bg-white rounded-xl p-6 shadow-2xl text-center">
              <svg className="h-12 w-12 animate-spin text-green-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm font-medium text-gray-900">Navigating to location...</p>
              <p className="text-xs text-gray-500 mt-1">Please wait</p>
            </div>
          </div>
        )}

        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
          {!showDrawer && (
            <button onClick={() => setShowDrawer(true)} className="rounded-lg bg-white p-2 shadow-lg hover:bg-gray-100">
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setIsDrawingMode(!isDrawingMode)}
              onMouseEnter={() => setShowMeasurementTooltip(true)}
              onMouseLeave={() => setShowMeasurementTooltip(false)}
              className={`rounded-lg p-2.5 shadow-lg transition-colors ${isDrawingMode ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
              </svg>
            </button>
            {showMeasurementTooltip && (
              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white whitespace-nowrap shadow-lg">
                Measurement
                <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-gray-900" />
              </div>
            )}
          </div>
          <LayerButton active={activeTheme === 'satellite'} onClick={() => setActiveTheme('satellite')} label="Satellite" showTooltip={showSatelliteTooltip} setShowTooltip={setShowSatelliteTooltip} icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } />
          <LayerButton active={activeTheme === 'terrain'} onClick={() => setActiveTheme('terrain')} label="Terrain" showTooltip={showTerrainTooltip} setShowTooltip={setShowTerrainTooltip} icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          } />
          <LayerButton active={activeTheme === 'streets'} onClick={() => setActiveTheme('streets')} label="Streets" showTooltip={showStreetsTooltip} setShowTooltip={setShowStreetsTooltip} icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          } />
          <div className="relative">
            <button
              onClick={() => { (mapRef.current as any)?.setRotation(0); setMapRotation(0); }}
              onMouseEnter={() => setShowCompassTooltip(true)}
              onMouseLeave={() => setShowCompassTooltip(false)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 shadow-lg hover:bg-gray-100"
            >
              <span className="text-sm font-bold">{getCardinalDirection(mapRotation)}</span>
            </button>
            {showCompassTooltip && (
              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white whitespace-nowrap shadow-lg">
                Reset North
                <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-gray-900" />
              </div>
            )}
          </div>
        </div>
      </div>

      {showDrawer && (
        <>
          <div className="absolute inset-0 bg-black/50 z-[400]" onClick={() => setShowDrawer(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl z-[401] overflow-y-auto animate-slide-in">
            <style>{`@keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } } .animate-slide-in { animation: slide-in 0.3s ease-out; }`}</style>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Farm Mapping</h2>
                <button onClick={() => setShowDrawer(false)} className="rounded-lg p-1 hover:bg-gray-100">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Your Areas ({shapes.length})</h3>
                <div className="space-y-2">
                  {shapes.length > 0 ? (
                    shapes.map((shape) => (
                      <div
                        key={shape.id}
                        onClick={() => {
                          setMapCenter([shape.points[0][0], shape.points[0][1]]);
                          if (mapRef.current) mapRef.current.flyTo([shape.points[0][0], shape.points[0][1]], 16, { duration: 1.5 });
                        }}
                        className="cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md"
                        style={{ borderColor: shape.color }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-3 w-3 rounded" style={{ backgroundColor: shape.color }} />
                          <span className="text-sm font-semibold text-gray-900">{shape.name}</span>
                        </div>
                        {shape.varieties && <p className="text-xs text-gray-600 mb-1"><span className="font-medium">Varieties:</span> {shape.varieties}</p>}
                        {shape.address && <p className="text-xs text-gray-500 line-clamp-2">{shape.address}</p>}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-400">{formatArea(shape.area)}</span>
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No areas created yet. Click the Measurement button to start drawing.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showDeleteConfirm && selectedShape && (
        <>
          <div className="absolute inset-0 bg-black/50 z-[510]" onClick={() => setShowDeleteConfirm(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-xl shadow-2xl z-[520] overflow-hidden">
            <div className="p-6 text-center">
              <div className="flex flex-col items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Are you sure want to delete area?</h3>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={() => { setShapes(prev => prev.filter(s => s.id !== selectedShape.id)); setSelectedShape(null); setShowDeleteConfirm(false); }} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedShape && (
        <>
          <div className="absolute inset-0 bg-black/50 z-[500]" onClick={() => setSelectedShape(null)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-[501] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Area Details</h3>
              <button onClick={() => setSelectedShape(null)} className="rounded-lg p-1 hover:bg-gray-100">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Area Name</label>
                <input type="text" value={selectedShape.name} onChange={(e) => { handleUpdateShapeName(selectedShape.id, e.target.value); setSelectedShape({ ...selectedShape, name: e.target.value }); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" placeholder="Enter area name..." />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Varieties Name</label>
                <input type="text" value={selectedShape.varieties || ''} onChange={(e) => { handleUpdateShapeField(selectedShape.id, 'varieties', e.target.value); setSelectedShape({ ...selectedShape, varieties: e.target.value }); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" placeholder="e.g., Cherry Tomato, Red Chili..." />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Harvest Date</label>
                <input type="date" value={selectedShape.harvestDate || ''} onChange={(e) => { handleUpdateShapeField(selectedShape.id, 'harvestDate', e.target.value); setSelectedShape({ ...selectedShape, harvestDate: e.target.value }); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Area</p>
                  <p className="text-lg font-bold text-gray-900">{formatArea(selectedShape.area)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Elevation</p>
                  <p className="text-lg font-bold text-gray-900">{selectedShape.elevation !== undefined && selectedShape.elevation !== 0 ? `${selectedShape.elevation.toFixed(1)} m` : '-'}</p>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500 mb-2">Location</p>
                {selectedShape.address && selectedShape.address !== 'Address not found' ? (<p className="text-xs text-gray-600 mb-2">{selectedShape.address}</p>) : selectedShape.address === 'Address not found' ? (<p className="text-xs text-gray-400 mb-2">Address not found</p>) : (<p className="text-xs text-gray-400 mb-2">Loading address...</p>)}
                <p className="text-xs font-mono text-gray-700">Latitude: {selectedShape.points[0][0].toFixed(6)}<br />Longitude: {selectedShape.points[0][1].toFixed(6)}</p>
              </div>
            </div>
            <div className="flex p-4 border-t border-gray-200">
              <button onClick={() => setShowDeleteConfirm(true)} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete Area</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
