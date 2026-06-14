import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Clock, Users, ShieldAlert, Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const FieldDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingDuration, setBookingDuration] = useState(1);
  const [playersCount, setPlayersCount] = useState(10);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchFieldDetails = async () => {
      try {
        const res = await client.get(`/fields/${id}`);
        if (res.data.success) {
          setField(res.data.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load field details.");
      } finally {
        setLoading(false);
      }
    };
    fetchFieldDetails();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!user) {
      toast.error("Please login to reserve a field.");
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await client.post('/reservations', {
        field_id: id,
        date: bookingDate,
        time: bookingTime,
        duration: bookingDuration,
        number_of_players: playersCount
      });

      if (res.data.success) {
        toast.success("Reservation created! Please complete payment.");
        navigate(`/reservations/${res.data.data.id}`);
      }
    } catch (err) {
      console.error(err);
      setBookingError(err.response?.data?.message || 'Error occurred while creating reservation. Check for overlapping time slots.');
      toast.error("Booking failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '50vh' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="container text-center" style={{ padding: '4rem 0' }}>
        <h2>Field Not Found</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Back Button */}
      <button className="btn btn-secondary" style={{ marginBottom: '2rem' }} onClick={() => navigate('/fields')}>
        ← Back to Fields
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem', alignItems: 'start' }} className="details-grid">
        
        {/* Left Column: Details */}
        <div>
          <div style={{ borderRadius: '16px', overflow: 'hidden', height: '400px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            <img 
              src={field.image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'} 
              alt={field.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem', textAlign: 'left' }}>
            {field.name}
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            📍 {field.location}
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div className="glass" style={{ padding: '1rem 1.5rem', flex: 1, minWidth: '130px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>SURFACE</span>
              <strong style={{ color: 'var(--primary)' }}>{field.surface}</strong>
            </div>
            <div className="glass" style={{ padding: '1rem 1.5rem', flex: 1, minWidth: '130px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>DIMENSIONS</span>
              <strong style={{ color: '#fff' }}>{field.dimensions}</strong>
            </div>
            <div className="glass" style={{ padding: '1rem 1.5rem', flex: 1, minWidth: '130px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>PRICE</span>
              <strong style={{ color: 'var(--primary)' }}>{field.price} MAD/hr</strong>
            </div>
          </div>

          <div className="glass" style={{ padding: '2rem', marginBottom: '2.5rem', textAlign: 'left' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Description</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7' }}>
              {field.description || 'No description provided for this municipal field.'}
            </p>
          </div>

          {/* Reviews List */}
          <div className="glass" style={{ padding: '2rem', textAlign: 'left' }}>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={22} /> Reviews & Ratings
            </h3>

            {(!field.reviews || field.reviews.length === 0) ? (
              <p style={{ color: 'var(--text-muted)' }}>No reviews for this pitch yet. Be the first to leave one after your session.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {field.reviews.map((rev) => (
                  <div key={rev.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#fff' }}>{rev.user?.name || 'Anonymous User'}</strong>
                      <div style={{ display: 'flex', color: '#fbbf24', gap: '2px' }}>
                        {[...Array(5)].map((_, idx) => (
                          <Star 
                            key={idx} 
                            size={12} 
                            fill={idx < rev.rating ? '#fbbf24' : 'none'} 
                            color={idx < rev.rating ? '#fbbf24' : '#4b5563'} 
                          />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{rev.comment}</p>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Booking panel */}
        <div className="glass" style={{ padding: '2.5rem', position: 'sticky', top: '100px', textAlign: 'left' }}>
          <h3 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={22} color="var(--primary)" /> Reserve Time Slot
          </h3>

          {field.status !== 'available' ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--danger)',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              marginBottom: '1.5rem'
            }}>
              <ShieldAlert size={20} />
              <span>This field is currently closed for maintenance and is not accepting bookings.</span>
            </div>
          ) : (
            <form onSubmit={handleBooking}>
              {bookingError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: 'var(--danger)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '1.5rem'
                }}>
                  {bookingError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Select Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Time</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <select
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  >
                    <option value="">Choose Time Slot</option>
                    <option value="08:00">08:00 AM</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="18:00">06:00 PM</option>
                    <option value="19:00">07:00 PM</option>
                    <option value="20:00">08:00 PM</option>
                    <option value="21:00">09:00 PM</option>
                    <option value="22:00">10:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Duration (Hours)</label>
                <select
                  className="form-input"
                  value={bookingDuration}
                  onChange={(e) => setBookingDuration(parseInt(e.target.value))}
                >
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={4}>4 Hours</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Number of Expected Players</label>
                <div style={{ position: 'relative' }}>
                  <Users size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="number"
                    min={2}
                    max={30}
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={playersCount}
                    onChange={(e) => setPlayersCount(parseInt(e.target.value))}
                  />
                </div>
              </div>

              {bookingDate && bookingTime && (
                <div className="glass" style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex-between" style={{ marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Rental Rate:</span>
                    <span>{field.price} MAD/hr</span>
                  </div>
                  <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                    <strong>Total Amount:</strong>
                    <strong style={{ color: 'var(--primary)' }}>{field.price * bookingDuration} MAD</strong>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem' }}
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Checking Availability...' : 'Confirm and Book'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FieldDetailsPage;
