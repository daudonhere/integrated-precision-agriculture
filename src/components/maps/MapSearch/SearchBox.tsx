'use client';

import { SearchBoxProps } from '@/types/map';

export function SearchBox({
  searchQuery,
  searchSuggestions,
  showSuggestions,
  isSearching,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  onSelect,
}: SearchBoxProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Search address, city, or coordinates..."
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm text-gray-900 placeholder-gray-400 shadow-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {isSearching && (
        <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {showSuggestions && searchSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl z-50">
          {searchSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(suggestion)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 border-b border-gray-100 last:border-0"
            >
              <p className="text-gray-900 line-clamp-2">{suggestion.display_name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
