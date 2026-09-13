import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Maximize2,
  Award,
  Info
} from 'lucide-react';

const PROPERTY_COLORS = [
  { stroke: '#4f46e5', fill: '#6366f1', name: 'Property 1' },
  { stroke: '#0284c7', fill: '#0ea5e9', name: 'Property 2' },
  { stroke: '#059669', fill: '#10b981', name: 'Property 3' },
  { stroke: '#d97706', fill: '#f59e0b', name: 'Property 4' },
];

function formatPriceINR(val) {
  if (!val || isNaN(val)) return '—';
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

// Custom Tooltip with theme variables and crisp formatting
function CustomBarTooltip({ active, payload, label, unit = '' }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
        fontSize: '0.825rem',
        minWidth: '180px'
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
          {label}
        </div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
            <span style={{ color: entry.color || 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color, display: 'inline-block' }} />
              {entry.name}:
            </span>
            <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
              {entry.unit === '₹' ? formatPriceINR(entry.value) : `${entry.value?.toLocaleString('en-IN') || 0} ${entry.unit || unit}`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function CompareCharts({ items = [], type = 'sale' }) {
  const [activeView, setActiveView] = useState('financial'); // 'financial' | 'spatial' | 'radar'

  // 1. Prepare Bar Chart Data
  const { barData, radarData, quickHighlights } = useMemo(() => {
    let bData = [];
    let rData = [];
    let highlights = [];

    if (type === 'sale') {
      bData = items.map((item, idx) => {
        const name = item.apartment_name || `${item.bedroom || 2} BHK ${item.locality || ''}`;
        const shortName = name.length > 18 ? name.slice(0, 16) + '…' : name;
        const price = Number(item.price) || 0;
        const priceLakhs = Number((price / 100000).toFixed(2));
        const carpet = Number(item.carpet_area || item.super_built_up_area || 0);
        const ratePerSqft = carpet > 0 && price > 0 ? Math.round(price / carpet) : 0;
        const bedroom = Number(item.bedroom) || 0;
        const bathroom = Number(item.bathroom) || 0;

        return {
          id: item.listing_id || idx,
          fullName: name,
          name: shortName,
          price,
          priceLakhs,
          carpet,
          ratePerSqft,
          bedroom,
          bathroom,
          color: PROPERTY_COLORS[idx % PROPERTY_COLORS.length].fill,
          stroke: PROPERTY_COLORS[idx % PROPERTY_COLORS.length].stroke
        };
      });

      // Quick highlights for sales
      const validPrices = bData.filter(d => d.price > 0);
      const validRates = bData.filter(d => d.ratePerSqft > 0);
      const validCarpet = bData.filter(d => d.carpet > 0);

      if (validRates.length > 1) {
        const bestValue = [...validRates].sort((a, b) => a.ratePerSqft - b.ratePerSqft)[0];
        highlights.push({
          icon: Award,
          title: 'Best Rate Value',
          desc: `${bestValue.fullName} at ₹${bestValue.ratePerSqft.toLocaleString('en-IN')}/sqft`
        });
      }

      if (validCarpet.length > 1) {
        const largestSpace = [...validCarpet].sort((a, b) => b.carpet - a.carpet)[0];
        highlights.push({
          icon: Maximize2,
          title: 'Largest Living Space',
          desc: `${largestSpace.fullName} with ${largestSpace.carpet.toLocaleString('en-IN')} sqft`
        });
      }

      if (validPrices.length > 1) {
        const mostAffordable = [...validPrices].sort((a, b) => a.price - b.price)[0];
        highlights.push({
          icon: TrendingUp,
          title: 'Most Accessible Price',
          desc: `${mostAffordable.fullName} (${formatPriceINR(mostAffordable.price)})`
        });
      }

      // Radar metrics normalization (0 - 100)
      if (items.length >= 2) {
        const maxPrice = Math.max(...bData.map(d => d.price), 1);
        const minPrice = Math.min(...bData.map(d => d.price), 0);
        const maxCarpet = Math.max(...bData.map(d => d.carpet), 1);
        const maxBhk = Math.max(...bData.map(d => d.bedroom), 1);
        const maxRate = Math.max(...bData.map(d => d.ratePerSqft), 1);

        const dimensions = [
          { key: 'affordability', label: 'Price Value' },
          { key: 'space', label: 'Carpet Area' },
          { key: 'rateEfficiency', label: 'Rate / sqft' },
          { key: 'rooms', label: 'Bedrooms' },
          { key: 'bathRatio', label: 'Bathrooms' }
        ];

        rData = dimensions.map(dim => {
          const row = { metric: dim.label };
          bData.forEach((d, idx) => {
            let score = 50;
            if (dim.key === 'affordability') {
              // Cheaper is better (100 = cheapest)
              score = maxPrice === minPrice ? 75 : Math.round(100 - ((d.price - minPrice) / (maxPrice - minPrice)) * 70);
            } else if (dim.key === 'space') {
              score = maxCarpet > 0 ? Math.round((d.carpet / maxCarpet) * 100) : 50;
            } else if (dim.key === 'rateEfficiency') {
              const minRate = Math.min(...bData.map(x => x.ratePerSqft || 999999));
              score = maxRate === minRate ? 75 : Math.round(100 - ((d.ratePerSqft - minRate) / (maxRate - minRate || 1)) * 60);
            } else if (dim.key === 'rooms') {
              score = maxBhk > 0 ? Math.round((d.bedroom / maxBhk) * 100) : 50;
            } else if (dim.key === 'bathRatio') {
              score = Math.min(100, (d.bathroom || 1) * 35);
            }
            row[`prop_${idx}`] = Math.max(15, Math.min(100, score));
          });
          return row;
        });
      }

    } else if (type === 'rentals') {
      bData = items.map((r, idx) => {
        const name = r.title || r.apartment_name || `${r.bedroom || 2} BHK in ${r.locality || 'Mumbai'}`;
        const shortName = name.length > 18 ? name.slice(0, 16) + '…' : name;
        const rent = Number(r.price) || 0;
        const deposit = Number(r.deposit) || 0;
        const carpet = Number(r.carpet_area) || 0;
        const rentPerSqft = carpet > 0 && rent > 0 ? Math.round(rent / carpet) : 0;
        const bedroom = Number(r.bedroom) || 0;

        return {
          id: r.listing_id || idx,
          fullName: name,
          name: shortName,
          rent,
          deposit,
          carpet,
          rentPerSqft,
          bedroom,
          color: PROPERTY_COLORS[idx % PROPERTY_COLORS.length].fill,
          stroke: PROPERTY_COLORS[idx % PROPERTY_COLORS.length].stroke
        };
      });

      const validRent = bData.filter(d => d.rent > 0);
      const validCarpet = bData.filter(d => d.carpet > 0);

      if (validRent.length > 1) {
        const lowestRent = [...validRent].sort((a, b) => a.rent - b.rent)[0];
        highlights.push({
          icon: TrendingUp,
          title: 'Lowest Monthly Outflow',
          desc: `${lowestRent.fullName} (₹${lowestRent.rent.toLocaleString('en-IN')}/mo)`
        });
      }

      if (validCarpet.length > 1) {
        const largestSpace = [...validCarpet].sort((a, b) => b.carpet - a.carpet)[0];
        highlights.push({
          icon: Maximize2,
          title: 'Maximum Rental Area',
          desc: `${largestSpace.fullName} with ${largestSpace.carpet.toLocaleString('en-IN')} sqft`
        });
      }

      if (items.length >= 2) {
        const maxRent = Math.max(...bData.map(d => d.rent), 1);
        const minRent = Math.min(...bData.map(d => d.rent), 0);
        const maxCarpet = Math.max(...bData.map(d => d.carpet), 1);
        const maxBhk = Math.max(...bData.map(d => d.bedroom), 1);

        const dimensions = [
          { key: 'rentValue', label: 'Rent Affordability' },
          { key: 'space', label: 'Living Space' },
          { key: 'depositRatio', label: 'Deposit Ratio' },
          { key: 'rooms', label: 'Bedrooms' },
          { key: 'efficiency', label: 'Rent / sqft' }
        ];

        rData = dimensions.map(dim => {
          const row = { metric: dim.label };
          bData.forEach((d, idx) => {
            let score = 50;
            if (dim.key === 'rentValue') {
              score = maxRent === minRent ? 75 : Math.round(100 - ((d.rent - minRent) / (maxRent - minRent)) * 70);
            } else if (dim.key === 'space') {
              score = maxCarpet > 0 ? Math.round((d.carpet / maxCarpet) * 100) : 50;
            } else if (dim.key === 'depositRatio') {
              const ratio = d.rent > 0 ? d.deposit / d.rent : 5;
              score = Math.max(20, Math.round(100 - (ratio * 8)));
            } else if (dim.key === 'rooms') {
              score = maxBhk > 0 ? Math.round((d.bedroom / maxBhk) * 100) : 50;
            } else if (dim.key === 'efficiency') {
              const maxEff = Math.max(...bData.map(x => x.rentPerSqft), 1);
              score = maxEff > 0 ? Math.round(100 - (d.rentPerSqft / maxEff) * 60) : 50;
            }
            row[`prop_${idx}`] = Math.max(15, Math.min(100, score));
          });
          return row;
        });
      }

    } else {
      // Projects
      bData = items.map((p, idx) => {
        const name = p.apartment_name || p.project_name || `Project ${p.project_id || idx + 1}`;
        const shortName = name.length > 18 ? name.slice(0, 16) + '…' : name;
        const minPriceCr = Number((Number(p.price_min || 0) / 10000000).toFixed(2));
        const maxPriceCr = Number((Number(p.price_max || 0) / 10000000).toFixed(2));
        const totalUnits = Number(p.total_units) || 0;
        const minArea = Number(p.min_area_sqft) || 0;
        const maxArea = Number(p.max_area_sqft) || 0;

        return {
          id: p.project_id || idx,
          fullName: name,
          name: shortName,
          minPriceCr,
          maxPriceCr,
          totalUnits,
          minArea,
          maxArea,
          color: PROPERTY_COLORS[idx % PROPERTY_COLORS.length].fill,
          stroke: PROPERTY_COLORS[idx % PROPERTY_COLORS.length].stroke
        };
      });

      const validMin = bData.filter(d => d.minPriceCr > 0);
      const validUnits = bData.filter(d => d.totalUnits > 0);

      if (validMin.length > 1) {
        const lowestEntry = [...validMin].sort((a, b) => a.minPriceCr - b.minPriceCr)[0];
        highlights.push({
          icon: TrendingUp,
          title: 'Lowest Entry Point',
          desc: `${lowestEntry.fullName} starts at ₹${lowestEntry.minPriceCr} Cr`
        });
      }

      if (validUnits.length > 1) {
        const largestProject = [...validUnits].sort((a, b) => b.totalUnits - a.totalUnits)[0];
        highlights.push({
          icon: Award,
          title: 'Highest Project Scale',
          desc: `${largestProject.fullName} with ${largestProject.totalUnits.toLocaleString('en-IN')} units`
        });
      }
    }

    return { barData: bData, radarData: rData, quickHighlights: highlights };
  }, [items, type]);

  if (!items || items.length === 0) return null;

  return (
    <div className="ivy-card" style={{
      marginBottom: '2rem',
      padding: '1.75rem',
      border: '1px solid var(--border-subtle)',
      background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-surface-subtle) 100%)',
      borderRadius: '16px',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header & View Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'var(--accent-subtle)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BarChart3 size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
              Comparative Visual Analytics
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Graphical benchmarks across {items.length} selected {type === 'sale' ? 'properties' : type === 'rentals' ? 'rental homes' : 'developments'}
            </p>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-surface-subtle)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveView('financial')}
            className={`btn btn-sm ${activeView === 'financial' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
          >
            Financial Comparison
          </button>
          <button
            onClick={() => setActiveView('spatial')}
            className={`btn btn-sm ${activeView === 'spatial' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
          >
            Space & Specs
          </button>
          {items.length >= 2 && type !== 'projects' && (
            <button
              onClick={() => setActiveView('radar')}
              className={`btn btn-sm ${activeView === 'radar' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
            >
              Multi-Metric Radar
            </button>
          )}
        </div>
      </div>

      {/* Property Legend Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {barData.map((d) => (
          <div
            key={d.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface)',
              border: `1.5px solid ${d.stroke}`,
              fontSize: '0.825rem',
              fontWeight: 600,
              color: 'var(--text-heading)'
            }}
          >
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: d.color }} />
            <span>{d.fullName}</span>
          </div>
        ))}
      </div>

      {/* Main Visualizations Container */}
      <div style={{ minHeight: '320px', width: '100%' }}>
        {activeView === 'financial' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {type === 'sale' ? 'Total Price (₹ Lakhs) & Rate/sqft' : type === 'rentals' ? 'Monthly Rent vs Security Deposit' : 'Price Band (₹ Crores)'}
              </span>
            </div>

            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                {type === 'sale' ? (
                  <BarChart data={barData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-muted)"
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      axisLine={{ stroke: 'var(--border-subtle)' }}
                    />
                    <YAxis
                      stroke="var(--text-muted)"
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      axisLine={{ stroke: 'var(--border-subtle)' }}
                      tickFormatter={(val) => `₹${val}L`}
                    />
                    <Tooltip content={<CustomBarTooltip unit="L" />} />
                    <Legend
                      verticalAlign="top"
                      wrapperStyle={{ paddingBottom: '10px', fontSize: '0.825rem' }}
                    />
                    <Bar
                      dataKey="priceLakhs"
                      name="Total Price (₹ Lakhs)"
                      radius={[6, 6, 0, 0]}
                    >
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : type === 'rentals' ? (
                  <BarChart data={barData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-muted)"
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      axisLine={{ stroke: 'var(--border-subtle)' }}
                    />
                    <YAxis
                      stroke="var(--text-muted)"
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      axisLine={{ stroke: 'var(--border-subtle)' }}
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomBarTooltip unit="₹" />} />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px', fontSize: '0.825rem' }} />
                    <Bar dataKey="rent" name="Monthly Rent (₹)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="deposit" name="Deposit (₹)" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={barData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-muted)"
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      axisLine={{ stroke: 'var(--border-subtle)' }}
                    />
                    <YAxis
                      stroke="var(--text-muted)"
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      axisLine={{ stroke: 'var(--border-subtle)' }}
                      tickFormatter={(val) => `₹${val} Cr`}
                    />
                    <Tooltip content={<CustomBarTooltip unit="Cr" />} />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px', fontSize: '0.825rem' }} />
                    <Bar dataKey="minPriceCr" name="Starting Price (₹ Cr)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="maxPriceCr" name="Max Price (₹ Cr)" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeView === 'spatial' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {type === 'projects' ? 'Planned Inventory & Unit Scale' : 'Carpet Area Breakdown (sq.ft)'}
              </span>
            </div>

            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                {type === 'projects' ? (
                  <BarChart data={barData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Tooltip content={<CustomBarTooltip unit="units" />} />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px', fontSize: '0.825rem' }} />
                    <Bar dataKey="totalUnits" name="Total Planned Units" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={barData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <YAxis
                      stroke="var(--text-muted)"
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      tickFormatter={(val) => `${val} sqft`}
                    />
                    <Tooltip content={<CustomBarTooltip unit="sqft" />} />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px', fontSize: '0.825rem' }} />
                    <Bar dataKey="carpet" name="Carpet Area (sqft)" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-carpet-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeView === 'radar' && radarData.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Multi-Dimensional Spec Balance (Score 0 – 100)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Info size={12} /> Higher score indicates superior value or capacity
              </span>
            </div>

            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="var(--border-subtle)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: 'var(--text-heading)', fontSize: 11, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border-subtle)" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  {barData.map((d, idx) => (
                    <Radar
                      key={d.id}
                      name={d.fullName}
                      dataKey={`prop_${idx}`}
                      stroke={d.stroke}
                      fill={d.color}
                      fillOpacity={0.25}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: '0.825rem', paddingTop: '10px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-subtle)',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      color: 'var(--text-heading)'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Quick Takeaways / Highlights */}
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
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <h.icon size={16} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {h.title}
                </div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
