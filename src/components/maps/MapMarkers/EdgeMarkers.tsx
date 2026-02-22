'use client';

import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { DrawnShape } from '@/types/map';

interface EdgeMarkersProps {
  shapes: DrawnShape[];
  onAddVertex: (shapeId: number, edgeIndex: number, latlng: L.LatLng) => void;
}

export function EdgeMarkers({ shapes, onAddVertex }: EdgeMarkersProps) {
  return (
    <>
      {shapes.map((shape) =>
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
                  L.DomEvent.stopPropagation((e as unknown as { originalEvent: MouseEvent }).originalEvent);
                  onAddVertex(shape.id, idx, e.latlng);
                },
              }}
            />
          );
        })
      )}
    </>
  );
}
