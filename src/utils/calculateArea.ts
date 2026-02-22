export function calculateArea(latLngs: [number, number][]): number {
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

export function formatArea(area: number): string {
  if (area >= 1000000) return `${(area / 1000000).toFixed(2)} km²`;
  if (area >= 10000) return `${(area / 10000).toFixed(2)} ha`;
  return `${area.toFixed(0)} m²`;
}
