'use client';

import { Polygon } from 'react-leaflet';

interface PreviewPolygonProps {
  points: [number, number][] | null;
}

export function PreviewPolygon({ points }: PreviewPolygonProps) {
  if (!points) return null;

  return (
    <Polygon
      positions={points}
      pathOptions={{
        color: '#22c55e',
        fillColor: '#22c55e',
        fillOpacity: 0.2,
        weight: 2,
        dashArray: '5, 5',
      }}
    />
  );
}
