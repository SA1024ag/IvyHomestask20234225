import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import {
  Check,
  Award,
  Maximize2,
  TrendingUp,
  Coins,
  Building2,
  BedDouble,
  Bath,
  Sliders,
  ShieldCheck,
  Sparkles,
  RotateCcw
} from 'lucide-react';

const PROPERTY_PALETTE = [
  { stroke: '#6366f1', fill: '#4f46e5', name: 'Property 1' },
  { stroke: '#06b6d4', fill: '#0891b2', name: 'Property 2' },
  { stroke: '#10b981', fill: '#059669', name: 'Property 3' },
  { stroke: '#f59e0b', fill: '#d97706', name: 'Property 4' },
];

function formatPriceINR(val) {
  if (!val || isNaN(val)) return '—';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

function ExecutiveCompareTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 'var(--radius-xs)',
        padding: '0.85rem 1.1rem',
        boxShadow: '0 14px 35px -4px rgba(0, 0, 0, 0.45)',
        minWidth: '220px',
        color: '#ffffff',
        fontSize: '0.825rem'
      }}>
        <div style={{
          fontWeight: 800,
          fontSize: '0.85rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '0.4rem',
          marginBottom: '0.5rem',
          color: '#f8fafc'
        }}>
          {label}
        </div>
        {payload.map((entry, idx) => (
          <div
            key={`tt-${idx}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.25rem',
              marginTop: '0.35rem',
              fontSize: '0.78rem'
            }}
          >
            <span style={{ color: 'rgba(255, 255, 255, 0.75)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: entry.color, display: 'inline-block' }} />
              {entry.name}:
            </span>
            <span style={{ fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
              {typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN') : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function CompareCharts({ items = [], type = 'sale' }) {
  const [viewMode, setViewMode] = useState('multi-param'); // 'multi-param' | 'normalized' | 'radar'
  const [selectedParams, setSelectedParams] = useState({
    price: true,
    carpet: true,
    rate: true,
    bhk: true,
    bath: true,
    deposit: true,
    maxPrice: true,
    units: true
  });

  // Available parameters based on type with rich icons and metadata
  const availableParams = useMemo(() => {
    if (type === 'sale') {
      return [
        { id: 'price', label: 'Price (₹L)', fullLabel: 'Price (₹ Lakhs)', unit: '₹L', icon: Coins },
        { id: 'carpet', label: 'Carpet Area', fullLabel: 'Carpet Area (sqft)', unit: 'sqft', icon: Maximize2 },
        { id: 'rate', label: 'Rate / sqft', fullLabel: 'Rate (₹/sqft)', unit: '₹/sqft', icon: TrendingUp },
        { id: 'bhk', label: 'Bedrooms', fullLabel: 'Bedrooms (BHK)', unit: 'BHK', icon: BedDouble },
        { id: 'bath', label: 'Bathrooms', fullLabel: 'Bathrooms', unit: 'Bath', icon: Bath }
      ];
    }
    if (type === 'rentals') {
      return [
        { id: 'price', label: 'Rent (₹k)', fullLabel: 'Monthly Rent (₹k)', unit: '₹k', icon: Coins },
        { id: 'carpet', label: 'Carpet Area', fullLabel: 'Carpet Area (sqft)', unit: 'sqft', icon: Maximize2 },
        { id: 'rate', label: 'Rent / sqft', fullLabel: 'Rent / sqft (₹)', unit: '₹/sqft', icon: TrendingUp },
        { id: 'bhk', label: 'Bedrooms', fullLabel: 'Bedrooms (BHK)', unit: 'BHK', icon: BedDouble },
        { id: 'deposit', label: 'Deposit (₹k)', fullLabel: 'Security Deposit', unit: '₹k', icon: ShieldCheck }
      ];
    }
    return [
      { id: 'price', label: 'Min Price', fullLabel: 'Min Price (₹ Cr)', unit: '₹ Cr', icon: Coins },
      { id: 'maxPrice', label: 'Max Price', fullLabel: 'Max Price (₹ Cr)', unit: '₹ Cr', icon: Coins },
      { id: 'carpet', label: 'Min Area', fullLabel: 'Min Area (sqft)', unit: 'sqft', icon: Maximize2 },
      { id: 'units', label: 'Planned Units', fullLabel: 'Total Units', unit: 'Units', icon: Building2 }
    ];
  }, [type]);

  const activeCount = useMemo(() => {
    return availableParams.filter(p => !!selectedParams[p.id]).length;
  }, [availableParams, selectedParams]);

  const allSelected = useMemo(() => {
    return availableParams.every(p => !!selectedParams[p.id]);
  }, [availableParams, selectedParams]);

  const isCoreSelected = useMemo(() => {
    const coreIds = type === 'projects'
      ? ['price', 'maxPrice', 'carpet']
      : ['price', 'carpet', 'rate'];
    return availableParams.every(p => {
      if (coreIds.includes(p.id)) return !!selectedParams[p.id];
      return !selectedParams[p.id];
    });
  }, [availableParams, selectedParams, type]);

  const toggleParam = (id) => {
    setSelectedParams(prev => {
      const active = availableParams.filter(p => !!prev[p.id]);
      if (prev[id] && active.length <= 1) return prev; // Keep at least 1 param active
      return { ...prev, [id]: !prev[id] };
    });
  };

  const soloParam = (id) => {
    const next = {};
    availableParams.forEach(p => {
      next[p.id] = p.id === id;
    });
    setSelectedParams(next);
  };

  const selectAllParams = () => {
    const next = {};
    availableParams.forEach(p => {
      next[p.id] = true;
    });
    setSelectedParams(next);
  };

  const selectCoreParams = () => {
    const coreIds = type === 'projects'
      ? ['price', 'maxPrice', 'carpet']
      : ['price', 'carpet', 'rate'];
    const next = {};
    availableParams.forEach(p => {
      next[p.id] = coreIds.includes(p.id);
    });
    setSelectedParams(next);
  };

  const resetParams = () => {
    const next = {};
    availableParams.forEach(p => {
      next[p.id] = true;
    });
    setSelectedParams(next);
  };

  // Compute Multi-Parameter data & normalized radar data
  const { multiParamData, normalizedData, radarData, quickHighlights, propSummaries } = useMemo(() => {
    if (!items || items.length === 0) {
      return { multiParamData: [], normalizedData: [], radarData: [], quickHighlights: [], propSummaries: [] };
    }

    const summaries = items.map((item, idx) => {
      const name = item.apartment_name || item.title || `${item.bedroom || 2} BHK ${item.locality || ''}`;
      const shortName = name.length > 20 ? name.slice(0, 18) + '…' : name;
      const palette = PROPERTY_PALETTE[idx % PROPERTY_PALETTE.length];

      let priceVal = 0;
      let carpetVal = 0;
      let rateVal = 0;
      let bhkVal = Number(item.bedroom) || 0;
      let bathVal = Number(item.bathroom) || 0;
      let depositVal = 0;
      let unitsVal = 0;
      let maxPriceVal = 0;

      if (type === 'sale') {
        priceVal = Number(item.price) || 0;
        carpetVal = Number(item.carpet_area || item.super_built_up_area || 0);
        rateVal = carpetVal > 0 && priceVal > 0 ? Math.round(priceVal / carpetVal) : 0;
      } else if (type === 'rentals') {
        priceVal = Number(item.price) || 0;
        depositVal = Number(item.deposit) || 0;
        carpetVal = Number(item.carpet_area) || 0;
        rateVal = carpetVal > 0 && priceVal > 0 ? Math.round(priceVal / carpetVal) : 0;
      } else {
        priceVal = Number(item.price_min) || 0;
        maxPriceVal = Number(item.price_max) || 0;
        carpetVal = Number(item.min_area_sqft) || 0;
        unitsVal = Number(item.total_units) || 0;
      }

      return {
        id: item.listing_id || item.project_id || idx,
        fullName: name,
        shortName,
        priceVal,
        carpetVal,
        rateVal,
        bhkVal,
        bathVal,
        depositVal,
        unitsVal,
        maxPriceVal,
        palette
      };
    });

    // 1. Grouped parameter data (X-Axis = Parameters, Bars = Properties)
    const paramRows = [];

    if (type === 'sale') {
      if (selectedParams.price) {
        const row = { parameter: 'Price (₹ Lakhs)' };
        summaries.forEach((s, idx) => {
          row[`prop_${idx}`] = Number((s.priceVal / 100000).toFixed(1));
        });
        paramRows.push(row);
      }
      if (selectedParams.carpet) {
        const row = { parameter: 'Carpet Area (sqft)' };
        summaries.forEach((s, idx) => {
          row[`prop_${idx}`] = s.carpetVal;
        });
        paramRows.push(row);
      }
      if (selectedParams.rate) {
        const row = { parameter: 'Rate (₹ / 100 sqft)' };
        summaries.forEach((s, idx) => {
          // Scale by 100 for clean visual proportion alongside area/price
          row[`prop_${idx}`] = Math.round(s.rateVal / 100);
        });
        paramRows.push(row);
      }
      if (selectedParams.bhk) {
        const row = { parameter: 'Bedrooms (BHK × 100)' };
        summaries.forEach((s, idx) => {
          row[`prop_${idx}`] = s.bhkVal * 100;
        });
        paramRows.push(row);
      }
      if (selectedParams.bath) {
        const row = { parameter: 'Bathrooms (× 100)' };
        summaries.forEach((s, idx) => {
          row[`prop_${idx}`] = s.bathVal * 100;
        });
        paramRows.push(row);
      }
    } else if (type === 'rentals') {
      if (selectedParams.price) {
        const row = { parameter: 'Rent (₹k/mo)' };
        summaries.forEach((s, idx) => {
          row[`prop_${idx}`] = Math.round(s.priceVal / 1000);
        });
        paramRows.push(row);
      }
      if (selectedParams.deposit) {
        const row = { parameter: 'Deposit (₹k)' };
        summaries.forEach((s, idx) => {
          row[`prop_${idx}`] = Math.round(s.depositVal / 1000);
        });
        paramRows.push(row);
      }
      if (selectedParams.carpet) {
        const row = { parameter: 'Carpet Area (sqft)' };
        summaries.forEach((s, idx) => {
          row[`prop_${idx}`] = s.carpetVal;
        });
        paramRows.push(row);
      }
      if (selectedParams.rate) {
        const row = { parameter: 'Rent / sqft (₹ × 10)' };
        summaries.forEach((s, idx) => {
          row[`prop_${idx}`] = Math.round(s.rateVal * 10);
        });
        paramRows.push(row);
      }
      if (selectedParams.bhk) {
        const row = { parameter: 'Bedrooms (BHK × 100)' };
        summaries.forEach((s, idx) => {
          row[`prop_${idx}`] = s.bhkVal * 100;
        });
        paramRows.push(row);
      }
    } else {
      if (selectedParams.price) {
        const row = { parameter: 'Min Price (₹ Cr × 10)' };
        summaries.forEach((s, idx) => {
          row[`prop_${idx}`] = Number((s.priceVal / 1000000).toFixed(1));
        });
        paramRows.push(row);
      }
      if (selectedParams.maxPrice) {
        const row = { parameter: 'Max Price (₹ Cr × 10)' };
        summaries.forEach((s, idx) => {
          row[`prop_${idx}`] = Number((s.maxPriceVal / 1000000).toFixed(1));
        });
        paramRows.push(row);
      }
      if (selectedParams.carpet) {
        const row = { parameter: 'Min Area (sqft)' };
        summaries.forEach((s, idx) => {
          row[`prop_${idx}`] = s.carpetVal;
        });
        paramRows.push(row);
      }
      if (selectedParams.units) {
        const row = { parameter: 'Units (tens)' };
        summaries.forEach((s, idx) => {
          row[`prop_${idx}`] = Math.round(s.unitsVal / 10);
        });
        paramRows.push(row);
      }
    }

    // 2. Normalized 0-100 Score Comparison across all parameters
    const maxVals = {
      price: Math.max(...summaries.map(s => s.priceVal), 1),
      minPrice: Math.min(...summaries.map(s => s.priceVal), 0),
      carpet: Math.max(...summaries.map(s => s.carpetVal), 1),
      rate: Math.max(...summaries.map(s => s.rateVal), 1),
      minRate: Math.min(...summaries.map(s => s.rateVal), 0),
      bhk: Math.max(...summaries.map(s => s.bhkVal), 1),
      bath: Math.max(...summaries.map(s => s.bathVal), 1)
    };

    const normDimensions = [
      { key: 'affordability', label: 'Price Value' },
      { key: 'carpet', label: 'Living Space' },
      { key: 'rate', label: 'Rate Efficiency' },
      { key: 'bhk', label: 'Bedroom Capacity' },
      { key: 'bath', label: 'Bathrooms' }
    ];

    const normRows = normDimensions.map(dim => {
      const row = { parameter: dim.label };
      summaries.forEach((s, idx) => {
        let score = 50;
        if (dim.key === 'affordability') {
          // Cheaper is better: 100 = most affordable
          score = maxVals.price === maxVals.minPrice ? 80 : Math.round(100 - ((s.priceVal - maxVals.minPrice) / (maxVals.price - maxVals.minPrice || 1)) * 65);
        } else if (dim.key === 'carpet') {
          score = maxVals.carpet > 0 ? Math.round((s.carpetVal / maxVals.carpet) * 100) : 50;
        } else if (dim.key === 'rate') {
          score = maxVals.rate === maxVals.minRate ? 80 : Math.round(100 - ((s.rateVal - maxVals.minRate) / (maxVals.rate - maxVals.minRate || 1)) * 60);
        } else if (dim.key === 'bhk') {
          score = maxVals.bhk > 0 ? Math.round((s.bhkVal / maxVals.bhk) * 100) : 50;
        } else if (dim.key === 'bath') {
          score = Math.min(100, (s.bathVal || 1) * 35);
        }
        row[`prop_${idx}`] = Math.max(15, Math.min(100, score));
      });
      return row;
    });

    // 3. Radar data format
    const rData = normRows.map(nr => ({
      metric: nr.parameter,
      ...nr
    }));

    // 4. Quick Highlights
    const highlights = [];
    const validRates = summaries.filter(s => s.rateVal > 0);
    const validCarpet = summaries.filter(s => s.carpetVal > 0);

    if (validRates.length > 1) {
      const bestRate = [...validRates].sort((a, b) => a.rateVal - b.rateVal)[0];
      highlights.push({
        icon: Award,
        title: 'Best Rate Value',
        desc: `${bestRate.fullName} at ₹${bestRate.rateVal.toLocaleString('en-IN')}/sqft`
      });
    }

    if (validCarpet.length > 1) {
      const largest = [...validCarpet].sort((a, b) => b.carpetVal - a.carpetVal)[0];
      highlights.push({
        icon: Maximize2,
        title: 'Largest Living Space',
        desc: `${largest.fullName} (${largest.carpetVal.toLocaleString('en-IN')} sqft)`
      });
    }

    if (summaries.length > 1) {
      const affordable = [...summaries].sort((a, b) => a.priceVal - b.priceVal)[0];
      highlights.push({
        icon: TrendingUp,
        title: 'Lowest Valuation',
        desc: `${affordable.fullName} (${formatPriceINR(affordable.priceVal)})`
      });
    }

    return {
      multiParamData: paramRows,
      normalizedData: normRows,
      radarData: rData,
      quickHighlights: highlights,
      propSummaries: summaries
    };
  }, [items, type, selectedParams]);

  if (!items || items.length === 0) return null;

  return (
    <div className="ivy-card" style={{
      marginBottom: '2rem',
      padding: '1.75rem',
      border: '1px solid var(--border-subtle)',
      background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-surface-subtle) 100%)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header & View Mode Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '1.25rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
            Multi-Parameter Comparative Analytics
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Simultaneous cross-metric benchmarking across price, space, rate efficiency, and specs
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-surface-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid var(--border-subtle)',
          gap: '2px'
        }}>
          <button
            type="button"
            onClick={() => setViewMode('multi-param')}
            className={`btn btn-sm ${viewMode === 'multi-param' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}
          >
            Multi-Parameter Grouped
          </button>
          <button
            type="button"
            onClick={() => setViewMode('normalized')}
            className={`btn btn-sm ${viewMode === 'normalized' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}
          >
            0–100 Normalized Index
          </button>
          {items.length >= 2 && type !== 'projects' && (
            <button
              type="button"
              onClick={() => setViewMode('radar')}
              className={`btn btn-sm ${viewMode === 'radar' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}
            >
              Multi-Dimensional Radar
            </button>
          )}
        </div>
      </div>

      {/* Parameter Controls Bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.85rem 1.15rem',
        marginBottom: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {/* Top Header: Title, Active Count Badge, and Presets */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: 'var(--text-heading)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sliders size={13} style={{ color: 'var(--accent-primary)' }} />
              Graph Parameters
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: activeCount === availableParams.length ? 'rgba(16, 185, 129, 0.12)' : 'var(--accent-subtle)',
              color: activeCount === availableParams.length ? '#10b981' : 'var(--accent-text)',
              border: activeCount === availableParams.length ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)'
            }}>
              {activeCount} of {availableParams.length} Active
            </span>
            {activeCount === 1 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                (Single metric comparison mode)
              </span>
            )}
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={selectAllParams}
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: allSelected ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: allSelected ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={selectCoreParams}
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: isCoreSelected ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: isCoreSelected ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Core Metrics
            </button>
            <button
              type="button"
              onClick={resetParams}
              title="Reset parameters to default"
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCcw size={10} />
              Reset
            </button>
          </div>
        </div>

        {/* Interactive Parameter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          {availableParams.map(param => {
            const isChecked = !!selectedParams[param.id];
            const ParamIcon = param.icon || Sliders;
            return (
              <div
                key={param.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: '9999px',
                  border: isChecked ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  backgroundColor: isChecked ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                  boxShadow: isChecked ? '0 2px 6px rgba(99, 102, 241, 0.12)' : 'none',
                  transition: 'all 0.15s ease',
                  overflow: 'hidden'
                }}
              >
                {/* Main Toggle Button */}
                <button
                  type="button"
                  onClick={() => toggleParam(param.id)}
                  title={`Click to toggle ${param.fullLabel || param.label}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '0.35rem 0.75rem',
                    border: 'none',
                    background: 'none',
                    fontSize: '0.78rem',
                    fontWeight: isChecked ? 700 : 500,
                    cursor: 'pointer',
                    color: isChecked ? 'var(--accent-text)' : 'var(--text-muted)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '9999px',
                    backgroundColor: isChecked ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0
                  }}>
                    {isChecked ? <Check size={10} strokeWidth={3} /> : <ParamIcon size={9} strokeWidth={2} style={{ color: 'var(--text-faint)' }} />}
                  </span>
                  <span>{param.label}</span>
                  <span style={{
                    fontSize: '0.66rem',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: isChecked ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-subtle)',
                    color: isChecked ? 'var(--accent-text)' : 'var(--text-faint)',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    border: isChecked ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid var(--border-subtle)'
                  }}>
                    {param.unit}
                  </span>
                </button>

                {/* Quick "Only" button to isolate this parameter with 1 click */}
                <button
                  type="button"
                  onClick={() => soloParam(param.id)}
                  title={`Isolate and show ONLY ${param.fullLabel || param.label}`}
                  style={{
                    border: 'none',
                    borderLeft: isChecked ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid var(--border-subtle)',
                    background: 'none',
                    padding: '0.35rem 0.55rem',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: isChecked ? 'var(--accent-text)' : 'var(--text-faint)',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    opacity: 0.85,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.12)';
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.opacity = '0.85';
                  }}
                >
                  Only
                </button>
              </div>
            );
          })}
        </div>

        {/* User guidance helper hint */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>
          <span>💡 Tap any pill to toggle on/off • Click <strong>Only</strong> to isolate a single metric</span>
          <span style={{ fontStyle: 'italic' }}>At least 1 parameter is kept active</span>
        </div>
      </div>

      {/* Property Legend Chips with Color Indicators */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '1.5rem' }}>
        {propSummaries.map((s) => (
          <div
            key={s.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-surface)',
              border: `1.5px solid ${s.palette.stroke}`,
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-heading)'
            }}
          >
            <span style={{ width: '10px', height: '10px', borderRadius: '1px', backgroundColor: s.palette.fill }} />
            <span>{s.fullName}</span>
          </div>
        ))}
      </div>

      {/* Chart Visual Canvas (Strict flat 2D, zero grid lines, zero axis lines) */}
      <div style={{ minHeight: '320px', width: '100%' }}>
        {viewMode === 'multi-param' && (
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={multiParamData}
                margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
                barCategoryGap="25%"
                barGap={6}
              >
                <XAxis
                  dataKey="parameter"
                  stroke="var(--text-muted)"
                  tick={{ fill: 'var(--text-heading)', fontSize: 12, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  tick={{ fill: 'var(--text-faint)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ExecutiveCompareTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)', radius: 4 }} />
                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '0.8rem' }}
                  formatter={(value) => {
                    const match = value.match(/prop_(\d+)/);
                    if (match && propSummaries[match[1]]) {
                      return propSummaries[match[1]].shortName;
                    }
                    return value;
                  }}
                />
                {propSummaries.map((s, idx) => (
                  <Bar
                    key={s.id}
                    dataKey={`prop_${idx}`}
                    name={s.fullName}
                    fill={s.palette.fill}
                    radius={[5, 5, 0, 0]}
                    maxBarSize={48}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {viewMode === 'normalized' && (
          <div style={{ width: '100%', height: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Normalized 0–100 Scale: 100 denotes optimal affordability, maximum space, or highest spec.
              </span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={normalizedData}
                margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
                barCategoryGap="25%"
                barGap={6}
              >
                <XAxis
                  dataKey="parameter"
                  stroke="var(--text-muted)"
                  tick={{ fill: 'var(--text-heading)', fontSize: 12, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="var(--text-muted)"
                  tick={{ fill: 'var(--text-faint)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip content={<ExecutiveCompareTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)', radius: 4 }} />
                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '0.8rem' }}
                  formatter={(value) => {
                    const match = value.match(/prop_(\d+)/);
                    if (match && propSummaries[match[1]]) {
                      return propSummaries[match[1]].shortName;
                    }
                    return value;
                  }}
                />
                {propSummaries.map((s, idx) => (
                  <Bar
                    key={s.id}
                    dataKey={`prop_${idx}`}
                    name={s.fullName}
                    fill={s.palette.fill}
                    radius={[5, 5, 0, 0]}
                    maxBarSize={48}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {viewMode === 'radar' && radarData.length > 0 && (
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="72%" data={radarData}>
                <PolarGrid stroke="var(--border-subtle)" strokeOpacity={0.6} />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: 'var(--text-heading)', fontSize: 11, fontWeight: 700 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  stroke="transparent"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                />
                {propSummaries.map((s, idx) => (
                  <Radar
                    key={s.id}
                    name={s.fullName}
                    dataKey={`prop_${idx}`}
                    stroke={s.palette.stroke}
                    fill={s.palette.fill}
                    fillOpacity={0.22}
                    strokeWidth={2}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '8px' }} />
                <Tooltip content={<ExecutiveCompareTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Quick Takeaways Ribbon */}
      {quickHighlights.length > 0 && (
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.75rem'
        }}>
          {quickHighlights.map((h, i) => (
            <div
              key={i}
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {h.title}
                </div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                  {h.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
