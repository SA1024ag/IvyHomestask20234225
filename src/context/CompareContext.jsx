import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext(null);

const STORAGE_KEY = 'ivy_compare_listings';
const MAX_COMPARE_LIMIT = 3;

export function CompareProvider({ children }) {
  const [compareListings, setCompareListings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE_LIMIT) : [];
    } catch {
      return [];
    }
  });

  const [warningMessage, setWarningMessage] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareListings));
    } catch (e) {
      console.warn('Failed to save compare listings to localStorage:', e);
    }
  }, [compareListings]);

  // Auto-dismiss warning after 3.5 seconds
  useEffect(() => {
    if (!warningMessage) return;
    const timer = setTimeout(() => {
      setWarningMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [warningMessage]);

  const isCompared = (listingId) => {
    if (!listingId) return false;
    return compareListings.some((item) => item.listing_id === listingId);
  };

  const toggleCompare = (listing) => {
    if (!listing || !listing.listing_id) return;
    const id = listing.listing_id;

    if (isCompared(id)) {
      setCompareListings((prev) => prev.filter((item) => item.listing_id !== id));
      setWarningMessage(null);
    } else {
      if (compareListings.length >= MAX_COMPARE_LIMIT) {
        setWarningMessage(`Maximum ${MAX_COMPARE_LIMIT} properties can be compared at once. Remove one to add this.`);
        return false;
      }
      setCompareListings((prev) => [...prev, listing]);
      setWarningMessage(null);
      return true;
    }
  };

  const removeFromCompare = (listingId) => {
    setCompareListings((prev) => prev.filter((item) => item.listing_id !== listingId));
  };

  const clearCompare = () => {
    setCompareListings([]);
    setWarningMessage(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const value = {
    compareListings,
    isCompared,
    toggleCompare,
    removeFromCompare,
    clearCompare,
    count: compareListings.length,
    maxLimit: MAX_COMPARE_LIMIT,
    warningMessage,
    dismissWarning: () => setWarningMessage(null)
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
