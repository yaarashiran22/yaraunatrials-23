import React, { createContext, useContext, useState, useEffect } from 'react';

export interface FavoriteItem {
  id: string;
  type: 'item' | 'event' | 'business';
  title: string;
  subtitle?: string;
  image: string;
  price?: string;
  data: any; // Store the complete item data for popup functionality
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  isFavorite: (id: string, type: string) => boolean;
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (id: string, type: string) => void;
  toggleFavorite: (item: FavoriteItem) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: React.ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      return [];
    }
  });

  // Save to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [favorites]);

  const isFavorite = (id: string, type: string) => {
    return favorites.some(item => item.id === id && item.type === type);
  };

  const addToFavorites = (item: FavoriteItem) => {
    setFavorites(prev => {
      // Avoid duplicates
      if (prev.some(fav => fav.id === item.id && fav.type === item.type)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeFromFavorites = (id: string, type: string) => {
    setFavorites(prev => prev.filter(item => !(item.id === id && item.type === type)));
  };

  const toggleFavorite = (item: FavoriteItem) => {
    if (isFavorite(item.id, item.type)) {
      removeFromFavorites(item.id, item.type);
    } else {
      addToFavorites(item);
    }
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      isFavorite,
      addToFavorites,
      removeFromFavorites,
      toggleFavorite
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};