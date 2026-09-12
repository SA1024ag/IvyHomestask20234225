import React from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowLeftRight,
  Trash2,
  X,
  Building2,
  ShieldCheck,
  Heart,
  Plus,
  ExternalLink,
  MapPin,
  BedDouble,
  Maximize2,
  Building,
  KeyRound,
  FolderKanban,
  Phone
} from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useFavourites } from '../context/FavouritesContext';
import { formatINR } from '../components/PropertyCard';

// Helper: Format project price range using price_min and price_max
function formatProjectPrice(val) {
  if (val === null || val === undefined || isNaN(val)) return 'Price on Request';
  const num = Number(val);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num > 0) {
    return `₹${num.toFixed(2)} Cr`;
  }
  return 'Price on Request';
}

function formatDate(dateStr) {
  if (!dateStr) return 'TBA';
  try {
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return dateStr.slice(0, 10);
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
}

export default function ComparePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    compareSales,
    compareRentals,
    compareProjects,
    removeFromCompare,
    clearCompare,
    salesCount,
    rentalsCount,
    projectsCount,
    maxLimit
  } = useCompare();

  const { isFavourite, toggleFavourite } = useFavourites();

  // Determine active tab from URL query param or smart default based on counts
  const paramTab = searchParams.get('tab');
  let activeTab = 'sale';
  if (paramTab === 'rentals' || paramTab === 'projects' || paramTab === 'sale') {
    activeTab = paramTab;
  } else if (rentalsCount > 0 && salesCount === 0) {
    activeTab = 'rentals';
  } else if (projectsCount > 0 && salesCount === 0 && rentalsCount === 0) {
    activeTab = 'projects';
  }

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const tabs = [
    { key: 'sale', label: 'Properties for Sale', icon: Building2, count: salesCount, browseUrl: '/listings' },
    { key: 'rentals', label: 'Rental Homes', icon: KeyRound, count: rentalsCount, browseUrl: '/rentals' },
    { key: 'projects', label: 'Builder Projects', icon: FolderKanban, count: projectsCount, browseUrl: '/projects' },
  ];

  const currentTabObj = tabs.find((t) => t.key === activeTab) || tabs[0];
  const currentList =
    activeTab === 'rentals'
      ? compareRentals
      : activeTab === 'projects'
      ? compareProjects
      : compareSales;

  const currentCount = currentList.length;

  return (
    <div className="main-content" style={{ paddingBottom: '6rem' }}>
      {/* Top Header & Breadcrumb */}
      <div style={{ marginBottom: '1.75rem' }}>
        <button
          onClick={() => navigate(currentTabObj.browseUrl)}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '0.75rem', paddingLeft: 0, color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={16} /> Back to {currentTabObj.label}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeftRight size={12} /> Side-by-Side Analysis
              </span>
              <span className="badge badge-slate">{currentCount} of {maxLimit} Slots Used</span>
            </div>
            <h1 className="page-title">Compare Homes & Developments</h1>
            <p className="page-subtitle">
              Comprehensive side-by-side technical and financial breakdown across Mumbai properties, rentals, and builder projects.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {currentCount < maxLimit && (
              <NavLink to={currentTabObj.browseUrl} className="btn btn-secondary btn-sm">
                <Plus size={15} /> Add Another ({maxLimit - currentCount} remaining)
              </NavLink>
            )}
            {currentCount > 0 && (
              <button onClick={() => clearCompare(activeTab)} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}>
                <Trash2 size={15} /> Clear {currentTabObj.label}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Segmented Tabs Switcher (3 Options) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem',
        backgroundColor: 'var(--bg-surface-subtle)',
        padding: '0.4rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        width: 'fit-content',
        maxWidth: '100%',
        overflowX: 'auto'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.2s ease',
                backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                color: isActive ? 'var(--accent-text)' : 'var(--text-muted)',
                boxShadow: isActive ? 'var(--shadow-card)' : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
              <span>{tab.label}</span>
              <span style={{
                fontSize: '0.72rem',
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isActive ? 'var(--accent-subtle)' : 'var(--badge-bg)',
                color: isActive ? 'var(--accent-text)' : 'var(--text-muted)',
                fontWeight: 800
              }}>
                {tab.count}/{maxLimit}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty State for Selected Tab */}
      {currentCount === 0 ? (
        <div className="ivy-card" style={{
          padding: '4rem 2rem',
          maxWidth: '540px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-subtle)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            <currentTabObj.icon size={28} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
            No {currentTabObj.label} Selected
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
            Select up to {maxLimit} items from the {currentTabObj.label.toLowerCase()} catalog using the <strong>Compare</strong> checkbox to see their specs side-by-side.
          </p>
          <NavLink to={currentTabObj.browseUrl} className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
            Browse {currentTabObj.label} →
          </NavLink>
        </div>
      ) : activeTab === 'sale' ? (
        /* ================= TAB 1: SALE PROPERTIES ================= */
        <div className="ivy-card" style={{ overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: currentCount === 1 ? '500px' : currentCount === 2 ? '700px' : '900px',
              fontSize: '0.9rem'
            }}>
              <colgroup>
                <col style={{ width: '220px', minWidth: '180px' }} />
                {compareSales.map((l) => (
                  <col key={l.listing_id} style={{ width: `${(100 - 20) / currentCount}%` }} />
                ))}
              </colgroup>

              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '1.5rem 1.25rem', textAlign: 'left', verticalAlign: 'top', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Sale Property Specs
                  </th>
                  {compareSales.map((item) => {
                    const saved = isFavourite(item.listing_id);
                    return (
                      <th key={item.listing_id} style={{ padding: '1.25rem', textAlign: 'left', verticalAlign: 'top', borderLeft: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <span className="badge badge-emerald" style={{ textTransform: 'capitalize' }}>
                            {item.property_type || 'Apartment'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => toggleFavourite(item)}
                              title={saved ? 'Remove from saved' : 'Save to favourites'}
                              style={{ background: 'none', border: 'none', color: saved ? '#ef4444' : 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                            >
                              <Heart size={16} fill={saved ? '#ef4444' : 'none'} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFromCompare(item.listing_id, 'sale')}
                              title="Remove from comparison"
                              style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: '4px' }}
                            >
                              <X size={17} />
                            </button>
                          </div>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                          {item.apartment_name || `${item.bedroom} BHK in ${item.locality}`}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'capitalize', marginBottom: '1rem' }}>
                          <MapPin size={13} color="var(--accent-primary)" />
                          <span>{item.locality}, Mumbai</span>
                        </div>

                        <NavLink to={`/listings/${item.listing_id}`} className="btn btn-secondary btn-sm" style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
                          <ExternalLink size={13} /> View Full Listing
                        </NavLink>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {/* Price */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Price</td>
                  {compareSales.map((item) => (
                    <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-text)' }}>
                        {formatINR(item.price)}
                      </div>
                      {item.carpet_area && item.price && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          ₹{Math.round(item.price / item.carpet_area).toLocaleString('en-IN')} / sqft
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* BHK */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Bedrooms (BHK)</td>
                  {compareSales.map((item) => (
                    <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', fontWeight: 700, color: 'var(--text-heading)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BedDouble size={16} color="var(--accent-primary)" />
                        <span>{item.bedroom ? `${item.bedroom} BHK` : 'N/A'}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Carpet Area */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Carpet Area</td>
                  {compareSales.map((item) => (
                    <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', fontWeight: 700, color: 'var(--text-heading)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Maximize2 size={16} color="var(--accent-text)" />
                        <span>{item.carpet_area ? `${Number(item.carpet_area).toLocaleString('en-IN')} sqft` : 'N/A'}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Furnishing */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Furnishing</td>
                  {compareSales.map((item) => (
                    <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)' }}>
                      <span className="badge badge-emerald" style={{ textTransform: 'capitalize' }}>
                        {item.furnishing ? item.furnishing.replace('-', ' ') : 'Unspecified'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Locality */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Locality</td>
                  {compareSales.map((item) => (
                    <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', textTransform: 'capitalize', fontWeight: 600, color: 'var(--text-heading)' }}>
                      {item.locality ? `${item.locality}, Mumbai` : 'Mumbai'}
                    </td>
                  ))}
                </tr>

                {/* Bathrooms */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Bathrooms</td>
                  {compareSales.map((item) => (
                    <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', color: 'var(--text-heading)' }}>
                      {item.bathroom ? `${item.bathroom} Baths` : '2 Baths'}
                    </td>
                  ))}
                </tr>

                {/* Floor */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Floor Elevation</td>
                  {compareSales.map((item) => (
                    <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', color: 'var(--text-heading)' }}>
                      {item.floor ? `Floor ${item.floor}${item.total_floors ? ` of ${item.total_floors}` : ''}` : 'Mid-level Floor'}
                    </td>
                  ))}
                </tr>

                {/* Facing */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Facing Direction</td>
                  {compareSales.map((item) => (
                    <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', textTransform: 'capitalize', color: 'var(--text-heading)' }}>
                      {item.facing_direction ? item.facing_direction.replace('-', ' ') : 'Vastu compliant'}
                    </td>
                  ))}
                </tr>

                {/* Audit Status */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Verification</td>
                  {compareSales.map((item) => (
                    <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)' }}>
                      {item.is_verified ? (
                        <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={12} /> Verified by Operations
                        </span>
                      ) : (
                        <span className="badge badge-slate">Standard Listing</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Action */}
                <tr>
                  <td style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Actions</td>
                  {compareSales.map((item) => (
                    <td key={item.listing_id} style={{ padding: '1.25rem', borderLeft: '1px solid var(--border-subtle)' }}>
                      <NavLink to={`/listings/${item.listing_id}`} className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: '0.85rem' }}>
                        View Full Specs →
                      </NavLink>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'rentals' ? (
        /* ================= TAB 2: RENTALS ================= */
        <div className="ivy-card" style={{ overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: currentCount === 1 ? '500px' : currentCount === 2 ? '700px' : '900px',
              fontSize: '0.9rem'
            }}>
              <colgroup>
                <col style={{ width: '220px', minWidth: '180px' }} />
                {compareRentals.map((r) => (
                  <col key={r.listing_id} style={{ width: `${(100 - 20) / currentCount}%` }} />
                ))}
              </colgroup>

              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '1.5rem 1.25rem', textAlign: 'left', verticalAlign: 'top', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Rental Home Specs
                  </th>
                  {compareRentals.map((rental) => (
                    <th key={rental.listing_id} style={{ padding: '1.25rem', textAlign: 'left', verticalAlign: 'top', borderLeft: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span className="badge badge-emerald" style={{ textTransform: 'capitalize' }}>
                          {rental.furnishing ? rental.furnishing.replace('-', ' ') : 'Rental'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCompare(rental.listing_id, 'rentals')}
                          title="Remove from comparison"
                          style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: '4px' }}
                        >
                          <X size={17} />
                        </button>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                        {rental.apartment_name || rental.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'capitalize', marginBottom: '1rem' }}>
                        <MapPin size={13} color="var(--accent-primary)" />
                        <span>{rental.locality || 'Mumbai'}</span>
                      </div>

                      <div style={{
                        padding: '0.5rem',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        color: 'var(--text-body)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <strong>Lister:</strong> {rental.posted_by_name || rental.posted_by || 'Owner'} ({rental.posted_by_contact || 'Verified Contact'})
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Monthly Rent */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Monthly Rent</td>
                  {compareRentals.map((r) => (
                    <td key={r.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-text)' }}>
                        ₹{Number(r.price).toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ mo</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Deposit */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Security Deposit</td>
                  {compareRentals.map((r) => (
                    <td key={r.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', fontWeight: 700, color: 'var(--text-heading)' }}>
                      ₹{Number(r.deposit || 0).toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                {/* Maintenance */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Maintenance</td>
                  {compareRentals.map((r) => (
                    <td key={r.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', fontWeight: 600, color: 'var(--text-heading)' }}>
                      {r.maintenance ? `₹${Number(r.maintenance).toLocaleString('en-IN')} / mo` : 'Included in rent'}
                    </td>
                  ))}
                </tr>

                {/* Carpet Area */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Carpet Area</td>
                  {compareRentals.map((r) => (
                    <td key={r.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', fontWeight: 700, color: 'var(--text-heading)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Maximize2 size={16} color="var(--accent-text)" />
                        <span>{r.carpet_area ? `${r.carpet_area} sqft` : 'N/A'}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* BHK */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Bedrooms (BHK)</td>
                  {compareRentals.map((r) => (
                    <td key={r.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', fontWeight: 700, color: 'var(--text-heading)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BedDouble size={16} color="var(--accent-primary)" />
                        <span>{r.bedroom ? `${r.bedroom} BHK` : 'N/A'}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Furnishing */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Furnishing</td>
                  {compareRentals.map((r) => (
                    <td key={r.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)' }}>
                      <span className="badge badge-emerald" style={{ textTransform: 'capitalize' }}>
                        {r.furnishing ? r.furnishing.replace('-', ' ') : 'Semi Furnished'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Locality */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Locality</td>
                  {compareRentals.map((r) => (
                    <td key={r.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', textTransform: 'capitalize', fontWeight: 600, color: 'var(--text-heading)' }}>
                      {r.locality ? `${r.locality}, Mumbai` : 'Mumbai'}
                    </td>
                  ))}
                </tr>

                {/* Floor */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Floor</td>
                  {compareRentals.map((r) => (
                    <td key={r.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', color: 'var(--text-heading)' }}>
                      {r.floor ? `Floor ${r.floor}${r.total_floors ? ` of ${r.total_floors}` : ''}` : 'Floor TBA'}
                    </td>
                  ))}
                </tr>

                {/* Contact Action */}
                <tr>
                  <td style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Contact Lister</td>
                  {compareRentals.map((r) => (
                    <td key={r.listing_id} style={{ padding: '1.25rem', borderLeft: '1px solid var(--border-subtle)' }}>
                      <a
                        href={`tel:${r.posted_by_contact || '+919820012345'}`}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      >
                        <Phone size={14} /> Call {r.posted_by_contact || 'Lister'}
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= TAB 3: BUILDER PROJECTS ================= */
        <div className="ivy-card" style={{ overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: currentCount === 1 ? '500px' : currentCount === 2 ? '700px' : '900px',
              fontSize: '0.9rem'
            }}>
              <colgroup>
                <col style={{ width: '220px', minWidth: '180px' }} />
                {compareProjects.map((p) => (
                  <col key={p.project_id} style={{ width: `${(100 - 20) / currentCount}%` }} />
                ))}
              </colgroup>

              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '1.5rem 1.25rem', textAlign: 'left', verticalAlign: 'top', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Builder Project Specs
                  </th>
                  {compareProjects.map((proj) => (
                    <th key={proj.project_id} style={{ padding: '1.25rem', textAlign: 'left', verticalAlign: 'top', borderLeft: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span className="badge badge-amber" style={{ textTransform: 'capitalize' }}>
                          {proj.project_status || 'Under Construction'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCompare(proj.project_id, 'projects')}
                          title="Remove from comparison"
                          style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: '4px' }}
                        >
                          <X size={17} />
                        </button>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-text)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
                        {proj.developer_name}
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                        {proj.apartment_name}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'capitalize', marginBottom: '1rem' }}>
                        <MapPin size={13} color="var(--accent-primary)" />
                        <span>{proj.locality || 'Mumbai'}</span>
                      </div>

                      <span className="badge badge-slate" style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                        {proj.rera_number || proj.project_id}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Price Range */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Price Range</td>
                  {compareProjects.map((p) => (
                    <td key={p.project_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                        {formatProjectPrice(p.price_min)} – {formatProjectPrice(p.price_max)}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Developer */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Developer Name</td>
                  {compareProjects.map((p) => (
                    <td key={p.project_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', fontWeight: 700, color: 'var(--text-heading)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building size={15} color="var(--accent-text)" />
                        <span>{p.developer_name}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Project Status */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Development Status</td>
                  {compareProjects.map((p) => (
                    <td key={p.project_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', textTransform: 'capitalize' }}>
                      <span className="badge badge-amber">{p.project_status}</span>
                    </td>
                  ))}
                </tr>

                {/* Total Units / Active Listings */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Inventory Status</td>
                  {compareProjects.map((p) => (
                    <td key={p.project_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', fontWeight: 600, color: 'var(--text-heading)' }}>
                      <div>{p.total_listings ?? 0} active listings</div>
                      {p.total_units && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {p.total_units.toLocaleString('en-IN')} total units planned
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Launch Date */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Launch Date</td>
                  {compareProjects.map((p) => (
                    <td key={p.project_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', fontWeight: 600, color: 'var(--text-heading)' }}>
                      {formatDate(p.launch_date)}
                    </td>
                  ))}
                </tr>

                {/* Possession Date */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Possession Date</td>
                  {compareProjects.map((p) => (
                    <td key={p.project_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', fontWeight: 700, color: 'var(--accent-text)' }}>
                      {formatDate(p.possession_date)}
                    </td>
                  ))}
                </tr>

                {/* Area Span */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Unit Area Span</td>
                  {compareProjects.map((p) => (
                    <td key={p.project_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', fontWeight: 600, color: 'var(--text-heading)' }}>
                      {p.min_area_sqft && p.max_area_sqft ? `${p.min_area_sqft} – ${p.max_area_sqft} sqft` : 'Multiple layouts'}
                    </td>
                  ))}
                </tr>

                {/* Towers & Floors */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Towers & Floors</td>
                  {compareProjects.map((p) => (
                    <td key={p.project_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)', color: 'var(--text-heading)' }}>
                      {p.total_towers ? `${p.total_towers} Towers • ${p.total_floors || 'Highrise'} Floors` : 'Master development'}
                    </td>
                  ))}
                </tr>

                {/* Amenities */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Amenities</td>
                  {compareProjects.map((p) => (
                    <td key={p.project_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-subtle)' }}>
                      {Array.isArray(p.amenities) && p.amenities.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {p.amenities.map((am, i) => (
                            <span key={i} style={{ fontSize: '0.72rem', padding: '2px 6px', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '4px', textTransform: 'capitalize', color: 'var(--text-body)' }}>
                              {am}
                            </span>
                          ))}
                        </div>
                      ) : 'Clubhouse, gym, park'}
                    </td>
                  ))}
                </tr>

                {/* Action */}
                <tr>
                  <td style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Actions</td>
                  {compareProjects.map((p) => (
                    <td key={p.project_id} style={{ padding: '1.25rem', borderLeft: '1px solid var(--border-subtle)' }}>
                      <NavLink to="/projects" className="btn btn-secondary btn-sm" style={{ width: '100%', fontSize: '0.85rem' }}>
                        Browse Inventory →
                      </NavLink>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
