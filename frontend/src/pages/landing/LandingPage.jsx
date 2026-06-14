import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { Shield, Users, Clock, Calendar, Star, Trophy, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const [popularFields, setPopularFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await client.get('/fields');
        if (res.data.success) {
          // Slice first 3 fields as popular fields
          setPopularFields(res.data.data.data.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to load fields for landing:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Hero Section */}
      <header style={{
        position: 'relative',
        padding: '8rem 2rem 6rem',
        textAlign: 'center',
        backgroundImage: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '0.5rem 1.25rem',
            borderRadius: '99px',
            color: 'var(--primary)',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '2rem'
          }}>
            <span>🏟️ Official Sports Reservation Portal</span>
          </div>

          <h1 style={{
            fontSize: '3.75rem',
            fontWeight: '800',
            lineHeight: '1.15',
            letterSpacing: '-1.5px',
            color: '#fff',
            marginBottom: '1.5rem'
          }}>
            Book Your <span style={{
              background: 'linear-gradient(to right, #10b981, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Perfect Match</span> Today
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            marginBottom: '3rem',
            lineHeight: '1.6'
          }}>
            Discover and reserve the best municipal football and mini-football fields in Nador. Real-time availability, instant confirmations, and secure access gates.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/fields" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}>
              Explore Fields <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}>
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section style={{ padding: '2rem 0 5rem' }}>
        <div className="container">
          <div className="grid-cols-3" style={{ gap: '2rem' }}>
            <div className="glass text-center" style={{ padding: '2.5rem 2rem' }}>
              <h3 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem' }}>10k+</h3>
              <p style={{ color: '#fff', fontWeight: '600', marginBottom: '0.25rem' }}>Completed Bookings</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>By local players & teams</p>
            </div>
            <div className="glass text-center" style={{ padding: '2.5rem 2rem' }}>
              <h3 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem' }}>15+</h3>
              <p style={{ color: '#fff', fontWeight: '600', marginBottom: '0.25rem' }}>Premium Fields</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Across Nador Municipality</p>
            </div>
            <div className="glass text-center" style={{ padding: '2.5rem 2rem' }}>
              <h3 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem' }}>4.9/5</h3>
              <p style={{ color: '#fff', fontWeight: '600', marginBottom: '0.25rem' }}>User Rating</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>From reviews and attendance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 0', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>Engineered for Sports Enthusiasts</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              NadorPlay bridges the gap between digital convenience and the pitch, giving you full control of your football schedule.
            </p>
          </div>

          <div className="grid-cols-3" style={{ gap: '2rem' }}>
            <div className="glass" style={{ padding: '2rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Clock size={24} />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Real-time Booking</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Instant booking calendar displaying conflicts immediately. Check slots and check out in under a minute.
              </p>
            </div>

            <div className="glass" style={{ padding: '2rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Shield size={24} />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Secure QR Passes</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Each reservation generates a secure QR code which the stadium guard scans at the gate to verify attendance.
              </p>
            </div>

            <div className="glass" style={{ padding: '2rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Users size={24} />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Academy Subscriptions</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Organizations and schools can lock down recurring weekly training sessions with discounted bulk prices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Fields */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="flex-between" style={{ marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#fff' }}>Featured Playing Fields</h2>
              <p style={{ color: 'var(--text-muted)' }}>The highest-rated pitches in Nador according to our active community</p>
            </div>
            <Link to="/fields" className="btn btn-secondary">View All Fields</Link>
          </div>

          {loading ? (
            <div className="text-center" style={{ padding: '3rem' }}>Loading pitches...</div>
          ) : (
            <div className="grid-cols-3" style={{ gap: '2rem' }}>
              {popularFields.map((field) => (
                <div key={field.id} className="glass" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={field.image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'} 
                      alt={field.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition)' }}
                      className="card-image"
                    />
                    <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                      <span className="badge badge-success">{field.surface}</span>
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{field.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      📍 {field.location}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                      {field.description ? field.description.substring(0, 100) + '...' : 'Premium field in Nador.'}
                    </p>

                    <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                      <div>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>{field.price} MAD</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ hour</span>
                      </div>
                      <Link to={`/fields/${field.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '5rem 2rem' }}>
        <div className="container">
          <div className="glass text-center" style={{
            padding: '4rem 2rem',
            backgroundImage: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>Ready to Take the Pitch?</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2.5rem', fontSize: '1.05rem' }}>
              Create an account now to start browsing, booking, and managing football games instantly.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.9rem 2rem' }}>Create Free Account</Link>
              <Link to="/fields" className="btn btn-secondary" style={{ padding: '0.9rem 2rem' }}>Explore Pitches</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
