'use client';

import { useState, useCallback, useRef } from 'react';
import { SearchSuggestion } from '@/types/map';

export function useMapSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (query.length < 3) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
          { headers: { 'User-Agent': 'SmartFarm/1.0' } }
        );
        const data = await response.json();
        setSearchSuggestions(data);
        setShowSuggestions(true);
      } catch {
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, []);

  const handleSelectSuggestion = useCallback((suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    return {
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    };
  }, []);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, onSelect: () => void) => {
    if (e.key === 'Enter' && searchSuggestions.length > 0) {
      onSelect();
    }
  }, [searchSuggestions]);

  return {
    searchQuery,
    setSearchQuery,
    searchSuggestions,
    showSuggestions,
    isSearching,
    setShowSuggestions,
    handleSearchChange,
    handleSelectSuggestion,
    handleSearchKeyDown,
  };
}
