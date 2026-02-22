'use client';

import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { DrawnShape } from '@/types/map';
import { formatArea } from '@/utils/calculateArea';

interface AreaLabelsProps {
  shapes: DrawnShape[];
}

export function AreaLabels({ shapes }: AreaLabelsProps) {
  return (
    <>
      {shapes.map((shape) => {
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
              html: `<div style="display: flex; flex-direction: column; align-items: center; gap: 2px; pointer-events: none; min-width: 100%; max-width: 100%;">
                <div style="font-size: 14px; font-weight: 700; color: ${shape.color}; text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 0 3px black; white-space: nowrap;">${shape.name}</div>
                <div style="font-size: 12px; font-weight: 600; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 0 3px black; white-space: nowrap;">${formatArea(shape.area)}</div>
              </div>`,
              iconSize: [120, 40],
              iconAnchor: [60, 20],
            })}
          />
        );
      })}
    </>
  );
}
