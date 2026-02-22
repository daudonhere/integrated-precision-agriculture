'use client';

import { Marker } from 'react-leaflet';
import L from 'leaflet';

interface SearchMarkerProps {
  position: { lat: number; lon: number } | null;
}

export function SearchMarker({ position }: SearchMarkerProps) {
  if (!position) return null;

  return (
    <Marker
      position={[position.lat, position.lon]}
      icon={L.divIcon({
        className: 'search-marker',
        html: `<div style="width: 12px; height: 12px; background: #22c55e; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4); animation: bounce 0.5s ease-in-out;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })}
    />
  );
}
