'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapControllerProps {
  onMapReady: (map: L.Map) => void;
  isDrawingMode: boolean;
  onRotationChange: (rotation: number) => void;
}

export function MapController({ onMapReady, isDrawingMode, onRotationChange }: MapControllerProps) {
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
