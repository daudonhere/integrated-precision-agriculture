'use client';

import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { DrawnShape } from '@/types/map';

interface VertexMarkersProps {
  shapes: DrawnShape[];
  onVertexDrag: (shapeId: number, vertexIndex: number, latlng: L.LatLng) => void;
}

export function VertexMarkers({ shapes, onVertexDrag }: VertexMarkersProps) {
  return (
    <>
      {shapes.map((shape) =>
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
                onVertexDrag(shape.id, idx, marker.getLatLng());
              },
            }}
          />
        ))
      )}
    </>
  );
}
