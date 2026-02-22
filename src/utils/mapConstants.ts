export const POLYGON_COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export const MAP_THEMES = [
  { id: 'satellite', name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: 'Esri World Imagery' },
  { id: 'terrain', name: 'Terrain', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: 'OpenTopoMap' },
  { id: 'streets', name: 'Streets', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', attribution: 'CartoDB Voyager' },
];
