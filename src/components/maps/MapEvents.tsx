'use client';

import { useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface MapEventsProps {
  isDrawingMode: boolean;
  onRectangleDraw: (points: [number, number][]) => void;
  onPreview: (points: [number, number][] | null) => void;
}

export function MapEvents({ isDrawingMode, onRectangleDraw, onPreview }: MapEventsProps) {
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
