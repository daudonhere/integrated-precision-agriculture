export interface DrawnShape {
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

export interface UpdateShapeData {
  points?: [number, number][];
  area?: number;
  address?: string;
  elevation?: number;
}

export interface SearchSuggestion {
  lat: string;
  lon: string;
  display_name: string;
}

export interface MapTheme {
  id: string;
  name: string;
  url: string;
  attribution: string;
}

export interface SearchBoxProps {
  searchQuery: string;
  searchSuggestions: SearchSuggestion[];
  showSuggestions: boolean;
  isSearching: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSelect: (suggestion: SearchSuggestion) => void;
}

export interface NavigationOverlayProps {
  isNavigating: boolean;
}
