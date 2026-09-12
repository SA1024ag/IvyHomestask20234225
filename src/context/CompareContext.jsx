import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext(null);

const STORAGE_KEYS = {
  sale: 'ivy_compare_sale',
  rentals: 'ivy_compare_rentals',
  projects: 'ivy_compare_projects'
};

const MAX_COMPARE_LIMIT = 3;

function getStored(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE_LIMIT) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }) {
  const [compareSales, setCompareSales] = useState(() => getStored(STORAGE_KEYS.sale));
  const [compareRentals, setCompareRentals] = useState(() => getStored(STORAGE_KEYS.rentals));
  const [compareProjects, setCompareProjects] = useState(() => getStored(STORAGE_KEYS.projects));

  const [warningMessage, setWarningMessage] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.sale, JSON.stringify(compareSales));
    } catch {}
  }, [compareSales]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.rentals, JSON.stringify(compareRentals));
    } catch {}
  }, [compareRentals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(compareProjects));
    } catch {}
  }, [compareProjects]);

  // Auto-dismiss warning after 3.5 seconds
  useEffect(() => {
    if (!warningMessage) return;
    const timer = setTimeout(() => {
      setWarningMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [warningMessage]);

  const getItemId = (item, category) => {
    if (!item) return null;
    if (category === 'projects') return item.project_id || item.id;
    return item.listing_id || item.id;
  };

  const getCategoryList = (category) => {
    if (category === 'rentals') return compareRentals;
    if (category === 'projects') return compareProjects;
    return compareSales;
  };

  const isCompared = (id, category = 'sale') => {
    if (!id) return false;
    const list = getCategoryList(category);
    return list.some((item) => getItemId(item, category) === id);
  };

  const toggleCompare = (item, category = 'sale') => {
    if (!item) return false;
    const id = getItemId(item, category);
    if (!id) return false;

    const list = getCategoryList(category);
    const alreadyCompared = list.some((it) => getItemId(it, category) === id);

    if (alreadyCompared) {
      if (category === 'rentals') {
        setCompareRentals((prev) => prev.filter((it) => getItemId(it, category) !== id));
      } else if (category === 'projects') {
        setCompareProjects((prev) => prev.filter((it) => getItemId(it, category) !== id));
      } else {
        setCompareSales((prev) => prev.filter((it) => getItemId(it, category) !== id));
      }
      setWarningMessage(null);
      return true;
    } else {
      if (list.length >= MAX_COMPARE_LIMIT) {
        const catName = category === 'rentals' ? 'rentals' : category === 'projects' ? 'projects' : 'properties';
        setWarningMessage(`Maximum ${MAX_COMPARE_LIMIT} ${catName} can be compared at once. Remove one to add this.`);
        return false;
      }

      if (category === 'rentals') {
        setCompareRentals((prev) => [...prev, item]);
      } else if (category === 'projects') {
        setCompareProjects((prev) => [...prev, item]);
      } else {
        setCompareSales((prev) => [...prev, item]);
      }
      setWarningMessage(null);
      return true;
    }
  };

  const removeFromCompare = (id, category = 'sale') => {
    if (category === 'rentals') {
      setCompareRentals((prev) => prev.filter((it) => getItemId(it, category) !== id));
    } else if (category === 'projects') {
      setCompareProjects((prev) => prev.filter((it) => getItemId(it, category) !== id));
    } else {
      setCompareSales((prev) => prev.filter((it) => getItemId(it, category) !== id));
    }
  };

  const clearCompare = (category = 'all') => {
    if (category === 'rentals' || category === 'all') {
      setCompareRentals([]);
      try { localStorage.removeItem(STORAGE_KEYS.rentals); } catch {}
    }
    if (category === 'projects' || category === 'all') {
      setCompareProjects([]);
      try { localStorage.removeItem(STORAGE_KEYS.projects); } catch {}
    }
    if (category === 'sale' || category === 'all') {
      setCompareSales([]);
      try { localStorage.removeItem(STORAGE_KEYS.sale); } catch {}
    }
    setWarningMessage(null);
  };

  const totalCount = compareSales.length + compareRentals.length + compareProjects.length;

  const value = {
    // Category lists
    compareSales,
    compareRentals,
    compareProjects,
    compareListings: compareSales, // alias for backwards compatibility

    // Methods
    isCompared,
    toggleCompare,
    removeFromCompare,
    clearCompare,

    // Counts
    count: compareSales.length, // default alias for sales
    salesCount: compareSales.length,
    rentalsCount: compareRentals.length,
    projectsCount: compareProjects.length,
    totalCount,

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
