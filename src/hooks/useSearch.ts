
import { useState, useMemo } from "react";
import React from "react";

interface UseSearchOptions<T> {
  items: T[];
  searchFields: (keyof T)[];
  onSearch?: (query: string, results: T[]) => void;
}

export const useSearch = <T>({ items, searchFields, onSearch }: UseSearchOptions<T>) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const results = items.filter(item => 
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return false;
      })
    );
    
    onSearch?.(searchQuery, results);
    return results;
  }, [items, searchFields, searchQuery, onSearch]);

  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        React.createElement('mark', {
          key: index,
          className: "bg-primary/20 text-primary font-medium"
        }, part) : 
        part
    );
  };

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    highlightText
  };
};
