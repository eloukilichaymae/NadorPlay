import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { Search, MapPin, Filter, Star, Info } from 'lucide-react';

const FieldsPage = () => {
  const [fields, setFields] = useState([]);
  const [search, setSearch] = useState('');
  const [surface, setSurface] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const res = await client.get('/fields', {
        params: { search, surface, status, page }
      });
      if (res.data.success) {
        setFields(res.data.data.data);
        setLastPage(res.data.data.last_page);
      }
    } catch (error) {
      console.error("Failed to fetch fields:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, [surface, status, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFields();
  };

  return (
    <div className="container" style={{ padding: '2rem 0', animation: 'fadeIn 0.5s ease-out' }}>
      <div className="text-center" style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>
          Explore Sports Fields
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Find and reserve football and mini-football pitches in Nador</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search */}
          <div style={{ flex: 2, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Surface */}
          <div style={{ flex: 1, minWidth: '150px' }}>
            <select
              className="form-input"
              value={surface}
              onChange={(e) => { setSurface(e.target.value); setPage(1); }}
            >
              <option value="">All Surfaces</option>
              <option value="Natural Grass">Natural Grass</option>
              <option value="Artificial Turf">Artificial Turf</option>
              <option value="Hybrid Grass">Hybrid Grass</option>
            </select>
          </div>

          {/* Status */}
          <div style={{ flex: 1, minWidth: '150px' }}>
            <select
              className="form-input"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '44px' }}>
            Search
          </button>
        </form>
      </div>

      {/* Fields List */}
      {loading ? (
        <div className="text-center" style={{ padding: '5rem 0' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Retrieving fields...</p>
        </div>
      ) : fields.length === 0 ? (
        <div className="glass text-center" style={{ padding: '4rem 2rem' }}>
          <Info size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Fields Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try resetting your search query or choosing another filter option.</p>
        </div>
      ) : (
        <>
          <div className="grid-cols-3" style={{ gap: '2rem', marginBottom: '3rem' }}>
            {fields.map((field) => (
              <div key={field.id} className="glass" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={field.image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'}
                    alt={field.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '0.5rem' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{field.surface}</span>
                    <span className={`badge ${field.status === 'available' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                      {field.status}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>{field.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    📍 {field.location}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', color: '#fbbf24' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          fill={i < Math.round(field.reviews_avg_rating || 0) ? '#fbbf24' : 'none'} 
                          color={i < Math.round(field.reviews_avg_rating || 0) ? '#fbbf24' : '#4b5563'} 
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      ({field.reviews_avg_rating ? parseFloat(field.reviews_avg_rating).toFixed(1) : 'No reviews'})
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                    {field.description ? field.description.substring(0, 110) + '...' : 'Premium field in Nador Municipality.'}
                  </p>

                  <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                    <div>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>{field.price} MAD</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / hour</span>
                    </div>
                    <Link to={`/fields/${field.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex-center" style={{ gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary" 
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Page {page} of {lastPage}
              </span>
              <button 
                className="btn btn-secondary" 
                disabled={page === lastPage}
                onClick={() => setPage(prev => Math.min(prev + 1, lastPage))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FieldsPage;
