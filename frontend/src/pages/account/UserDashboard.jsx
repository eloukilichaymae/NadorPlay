import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Trophy, Bell, ChevronRight, Activity, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalBookings: 0, upcomingBookings: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await client.get('/reservations');
        if (res.data.success) {
          const bookings = res.data.data.data || [];
          const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
          setRecentBookings(confirmedBookings.slice(0, 4));

          const total = confirmedBookings.length;
          const upcoming = confirmedBookings.length;

          setStats({ totalBookings: total, upcomingBookings: upcoming });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>
          Welcome back, {user?.name}!
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Here is a summary of your sports reservation activities in Nador</p>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '3rem 0' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      ) : (
        <>
          {/* Quick Metrics */}
          <div className="grid-cols-3" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL RESERVATIONS</span>
                <strong style={{ fontSize: '1.75rem', color: '#fff' }}>{stats.totalBookings}</strong>
              </div>
            </div>

            <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>UPCOMING MATCHES</span>
                <strong style={{ fontSize: '1.75rem', color: '#fff' }}>{stats.upcomingBookings}</strong>
              </div>
            </div>

            <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>ACCOUNT STATUS</span>
                <strong style={{ fontSize: '1.25rem', color: '#34d399' }}>Active</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }} className="grid-cols-1">
            {/* Recent Bookings */}
            <div className="glass" style={{ padding: '2rem' }}>
              <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#fff' }}>Recent Activity</h3>
                <Link to="/reservations" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>View All</Link>
              </div>

              {recentBookings.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No recent bookings. Find a field and schedule your match.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentBookings.map((res) => (
                    <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <div>
                        <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{res.field?.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          📅 {new Date(res.date).toLocaleDateString()} at {res.time}
                        </span>
                      </div>
                      <Link to={`/reservations/${res.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick booking card */}
            <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚽</span>
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Need a Pitch?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '300px' }}>
                Book high-quality grass or turf fields for you and your friends in Nador.
              </p>
              <Link to="/fields" className="btn btn-primary" style={{ width: '100%' }}>
                Book a Field Now
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDashboard;
