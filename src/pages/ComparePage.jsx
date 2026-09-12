import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowLeftRight,
  Trash2,
  X,
  Building2,
  ShieldCheck,
  Heart,
  Check,
  Plus,
  ExternalLink,
  MapPin,
  Sparkles,
  BedDouble,
  Maximize2
} from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useFavourites } from '../context/FavouritesContext';
import { formatINR } from '../components/PropertyCard';

export default function ComparePage() {
  const navigate = useNavigate();
  const { compareListings, removeFromCompare, clearCompare, maxLimit } = useCompare();
  const { isFavourite, toggleFavourite } = useFavourites();

  const count = compareListings.length;

  if (count === 0) {
    return (
      <div className="main-content" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="ivy-card" style={{
          padding: '4rem 2rem',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-50)',
            color: 'var(--primary-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            <ArrowLeftRight size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No Properties Selected
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
            You haven't selected any properties to compare yet. Return to the property catalog and check the <strong>Compare</strong> box on up to 3 listings.
          </p>
          <NavLink to="/listings" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
            Browse Listings to Compare →
          </NavLink>
        </div>
      </div>
    );
  }

  // Find lowest price and largest area for subtle highlights
  const prices = compareListings.map((l) => Number(l.price) || 0).filter((p) => p > 0);
  const minPrice = prices.length > 1 ? Math.min(...prices) : null;

  const areas = compareListings.map((l) => Number(l.carpet_area) || 0).filter((a) => a > 0);
  const maxArea = areas.length > 1 ? Math.max(...areas) : null;

  return (
    <div className="main-content" style={{ paddingBottom: '6rem' }}>
      {/* Top Header & Breadcrumb */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/listings')}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '1rem', paddingLeft: 0, color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={16} /> Back to Listings
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeftRight size={12} /> Side-by-Side Analysis
              </span>
              <span className="badge badge-slate">{count} of {maxLimit} Slots Used</span>
            </div>
            <h1 className="page-title">Compare Properties</h1>
            <p className="page-subtitle">
              Detailed technical and financial side-by-side comparison across your chosen homes.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {count < maxLimit && (
              <NavLink to="/listings" className="btn btn-secondary btn-sm">
                <Plus size={15} /> Add Another Property ({maxLimit - count} slot remaining)
              </NavLink>
            )}
            <button onClick={clearCompare} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}>
              <Trash2 size={15} /> Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Table Container */}
      <div className="ivy-card" style={{ overflow: 'hidden', border: '1px solid var(--border-light)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: count === 1 ? '500px' : count === 2 ? '700px' : '900px',
            fontSize: '0.9rem'
          }}>
            {/* Column Widths */}
            <colgroup>
              <col style={{ width: '220px', minWidth: '180px' }} />
              {compareListings.map((l) => (
                <col key={l.listing_id} style={{ width: `${(100 - 20) / count}%` }} />
              ))}
            </colgroup>

            {/* Header Row: Property Cards & Remove Button */}
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '2px solid var(--border-light)' }}>
                <th style={{
                  padding: '1.5rem 1.25rem',
                  textAlign: 'left',
                  verticalAlign: 'top',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Property Specs
                </th>

                {compareListings.map((item) => {
                  const saved = isFavourite(item.listing_id);
                  return (
                    <th key={item.listing_id} style={{
                      padding: '1.25rem',
                      textAlign: 'left',
                      verticalAlign: 'top',
                      borderLeft: '1px solid var(--border-light)',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span className="badge badge-emerald" style={{ textTransform: 'capitalize' }}>
                          {item.property_type || 'Apartment'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => toggleFavourite(item)}
                            title={saved ? 'Remove from saved' : 'Save to favourites'}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: saved ? '#ef4444' : '#94a3b8',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                          >
                            <Heart size={16} fill={saved ? '#ef4444' : 'none'} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCompare(item.listing_id)}
                            title="Remove from comparison"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                          >
                            <X size={17} />
                          </button>
                        </div>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                        {item.apartment_name || `${item.bedroom} BHK in ${item.locality}`}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'capitalize', marginBottom: '1rem' }}>
                        <MapPin size={13} color="var(--primary-600)" />
                        <span>{item.locality}, Mumbai</span>
                      </div>

                      <NavLink
                        to={`/listings/${item.listing_id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                      >
                        <ExternalLink size={13} /> View Full Listing
                      </NavLink>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {/* Row 1: PRICE (Mandatory requirement) */}
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Price
                </td>
                {compareListings.map((item) => {
                  const isLowest = minPrice && Number(item.price) === minPrice;
                  return (
                    <td key={item.listing_id} style={{
                      padding: '1rem 1.25rem',
                      borderLeft: '1px solid var(--border-light)',
                      backgroundColor: isLowest ? 'rgba(236, 253, 245, 0.4)' : 'transparent'
                    }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                        {formatINR(item.price)}
                      </div>
                      {item.carpet_area && item.price && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          ₹{Math.round(item.price / item.carpet_area).toLocaleString('en-IN')} / sqft
                        </div>
                      )}
                      {isLowest && (
                        <span className="badge badge-emerald" style={{ fontSize: '0.68rem', marginTop: '4px', display: 'inline-block' }}>
                          Lowest Price
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: BEDROOMS (BHK) (Mandatory requirement) */}
              <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Bedrooms (BHK)
                </td>
                {compareListings.map((item) => (
                  <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-light)', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BedDouble size={16} color="var(--primary-600)" />
                      <span>{item.bedroom ? `${item.bedroom} BHK` : 'N/A'}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 3: CARPET AREA (Mandatory requirement) */}
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Carpet Area
                </td>
                {compareListings.map((item) => {
                  const isLargest = maxArea && Number(item.carpet_area) === maxArea;
                  return (
                    <td key={item.listing_id} style={{
                      padding: '1rem 1.25rem',
                      borderLeft: '1px solid var(--border-light)',
                      fontWeight: 700,
                      backgroundColor: isLargest ? 'rgba(236, 253, 245, 0.4)' : 'transparent'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Maximize2 size={16} color="var(--accent-blue)" />
                        <span>{item.carpet_area ? `${Number(item.carpet_area).toLocaleString('en-IN')} sqft` : 'N/A'}</span>
                      </div>
                      {item.super_built_up_area && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 400 }}>
                          Super: {Number(item.super_built_up_area).toLocaleString('en-IN')} sqft
                        </div>
                      )}
                      {isLargest && (
                        <span className="badge badge-blue" style={{ fontSize: '0.68rem', marginTop: '4px', display: 'inline-block' }}>
                          Largest Space
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 4: FURNISHING (Mandatory requirement) */}
              <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Furnishing
                </td>
                {compareListings.map((item) => {
                  const furnish = item.furnishing
                    ? item.furnishing.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                    : 'Unspecified';
                  return (
                    <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-light)' }}>
                      <span className={`badge ${
                        item.furnishing?.includes('fully')
                          ? 'badge-emerald'
                          : item.furnishing?.includes('semi')
                          ? 'badge-blue'
                          : 'badge-slate'
                      }`} style={{ textTransform: 'capitalize' }}>
                        {furnish}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Row 5: LOCALITY (Mandatory requirement) */}
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Locality
                </td>
                {compareListings.map((item) => (
                  <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-light)', textTransform: 'capitalize', fontWeight: 600 }}>
                    {item.locality ? `${item.locality}, Mumbai` : 'Mumbai'}
                  </td>
                ))}
              </tr>

              {/* Row 6: BATHROOMS */}
              <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Bathrooms
                </td>
                {compareListings.map((item) => (
                  <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-light)' }}>
                    {item.bathroom ? `${item.bathroom} Baths` : '2 Baths'}
                  </td>
                ))}
              </tr>

              {/* Row 7: FLOOR */}
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Floor Elevation
                </td>
                {compareListings.map((item) => (
                  <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-light)' }}>
                    {item.floor ? `Floor ${item.floor}${item.total_floors ? ` of ${item.total_floors}` : ''}` : 'Mid-level Floor'}
                  </td>
                ))}
              </tr>

              {/* Row 8: FACING DIRECTION */}
              <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Facing Direction
                </td>
                {compareListings.map((item) => (
                  <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-light)', textTransform: 'capitalize' }}>
                    {item.facing_direction ? item.facing_direction.replace('-', ' ') : 'Vastu compliant'}
                  </td>
                ))}
              </tr>

              {/* Row 9: VERIFICATION */}
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Audit Status
                </td>
                {compareListings.map((item) => (
                  <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-light)' }}>
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

              {/* Row 10: POSTED BY */}
              <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Posted By
                </td>
                {compareListings.map((item) => (
                  <td key={item.listing_id} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border-light)', textTransform: 'capitalize' }}>
                    {item.posted_by ? `${item.posted_by}${item.posted_by_name ? ` (${item.posted_by_name})` : ''}` : 'Verified Lister'}
                  </td>
                ))}
              </tr>

              {/* Bottom Row: Actions */}
              <tr>
                <td style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Actions
                </td>
                {compareListings.map((item) => (
                  <td key={item.listing_id} style={{ padding: '1.25rem', borderLeft: '1px solid var(--border-light)' }}>
                    <NavLink
                      to={`/listings/${item.listing_id}`}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      Inquire / View Specs →
                    </NavLink>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
