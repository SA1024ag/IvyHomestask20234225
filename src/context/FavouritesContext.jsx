import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from './AuthContext';

const FavouritesContext = createContext(null);

export function FavouritesProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  // Storage key scoped to user email
  const storageKey = user ? `ivy_favs_${user.email}` : 'ivy_favs_guest';

  const [favourites, setFavourites] = useState(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [favouriteIds, setFavouriteIds] = useState(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      if (!cached) return new Set();
      const items = JSON.parse(cached);
      return new Set(items.map((it) => it.listing_id || it.id));
    } catch {
      return new Set();
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load favourites from API & localStorage
  const fetchFavourites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavourites([]);
      setFavouriteIds(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const items = await apiClient.getFavourites();
      setFavourites(items);
      const ids = new Set(items.map((it) => it.listing_id || it.id));
      setFavouriteIds(ids);

      // Cache locally
      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
      } catch {}
    } catch (err) {
      console.warn('Failed to load favourites from API, falling back to local storage:', err);
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          setFavourites(parsed);
          setFavouriteIds(new Set(parsed.map((it) => it.listing_id || it.id)));
        }
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, storageKey]);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  const isFavourite = (id) => {
    if (!id) return false;
    return favouriteIds.has(id);
  };

  const toggleFavourite = async (listing) => {
    if (!listing || !listing.listing_id) return;
    const id = listing.listing_id;
    const currentlySaved = favouriteIds.has(id);

    // 1. Optimistic UI update
    setFavouriteIds((prev) => {
      const next = new Set(prev);
      if (currentlySaved) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    setFavourites((prev) => {
      let updated;
      if (currentlySaved) {
        updated = prev.filter((item) => item.listing_id !== id);
      } else {
        updated = [listing, ...prev];
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Perform API request
    try {
      if (currentlySaved) {
        await apiClient.removeFavourite(id);
      } else {
        await apiClient.addFavourite(id);
      }
    } catch (err) {
      console.error('Failed to sync favourite state with API:', err);
      // Revert optimistic update on failure
      fetchFavourites();
    }
  };

  const value = {
    favourites,
    favouriteIds,
    isFavourite,
    toggleFavourite,
    isLoading,
    refetchFavourites: fetchFavourites,
    count: favourites.length,
  };

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
}
