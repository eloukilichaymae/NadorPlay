import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Trophy, Bell, ChevronRight, Activity, Clock, ChevronLeft, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper: get week boundaries (Mon–Sun) for a given offset
const getWeekRange = (offsetWeeks = 0) => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
};

const fmt = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [weekOffset, setWeekOffset] = useState(0);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const [stats, setStats] = useState({ totalBookings: 0, confirmedBookings: 0, pendingBookings: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Compute the active date range
  const weekRange = getWeekRange(weekOffset);
  const rangeStart = useCustom && customStart ? new Date(customStart) : weekRange.start;
  const rangeEnd   = useCustom && customEnd   ? new Date(customEnd + 'T23:59:59') : weekRange.end;

  const weekLabel = (() => {
    if (useCustom && customStart && customEnd) {
      return `${new Date(customStart).toLocaleDateString()} – ${new Date(customEnd).toLocaleDateString()}`;
    }
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === -1) return 'Last Week';
    if (weekOffset === 1) return 'Next Week';
    return `${weekRange.start.toLocaleDateString()} – ${weekRange.end.toLocaleDateString()}`;
  })();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await client.get('/reservations?per_page=100');
        if (res.data.success) {
          setAllBookings(res.data.data.data || []);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filter bookings by current range whenever range or data changes
  useEffect(() => {
    const filtered = allBookings.filter(b => {
      const d = new Date(b.date);
      return d >= rangeStart && d <= rangeEnd;
    });
    const confirmed  = filtered.filter(b => b.status === 'confirmed' || b.status === 'attended');
    const pending    = filtered.filter(b => b.status === 'pending');

    setStats({
      totalBookings:     filtered.length,
      confirmedBookings: confirmed.length,
      pendingBookings:   pending.length,
    });
    setRecentBookings(filtered.slice(0, 5));
  }, [allBookings, weekOffset, useCustom, customStart, customEnd]);

  const handlePrevWeek = () => { setUseCustom(false); setWeekOffset(w => w - 1); };
  const handleNextWeek = () => { setUseCustom(false); setWeekOffset(w => w + 1); };
  const handleThisWeek = () => { setUseCustom(false); setWeekOffset(0); };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.25rem' }}>
          Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.name}</span>!
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Here is a summary of your sports reservation activities in Nador</p>
      </div>

      {/* ── Date Range Filter ── */}
      <div className="glass" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
        {/* Week Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={handlePrevWeek} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleThisWeek}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 1rem', fontWeight: weekOffset === 0 && !useCustom ? '700' : '500', borderColor: weekOffset === 0 && !useCustom ? 'var(--primary)' : undefined, color: weekOffset === 0 && !useCustom ? 'var(--primary)' : undefined }}
          >
            {weekLabel}
          </button>
          <button onClick={handleNextWeek} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Custom Date Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Filter size={15} color="var(--text-muted)" />
          <input
            type="date"
            className="form-input"
            style={{ width: '145px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            value={customStart}
            onChange={e => { setCustomStart(e.target.value); setUseCustom(true); }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>to</span>
          <input
            type="date"
            className="form-input"
            style={{ width: '145px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            value={customEnd}
            onChange={e => { setCustomEnd(e.target.value); setUseCustom(true); }}
          />
          {useCustom && (
            <button
              onClick={() => { setUseCustom(false); setCustomStart(''); setCustomEnd(''); setWeekOffset(0); }}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '3rem 0' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
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
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total in Period</span>
                <strong style={{ fontSize: '1.75rem', color: '#fff' }}>{stats.totalBookings}</strong>
              </div>
            </div>

            <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirmed</span>
                <strong style={{ fontSize: '1.75rem', color: '#fff' }}>{stats.confirmedBookings}</strong>
              </div>
            </div>

            <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</span>
                <strong style={{ fontSize: '1.75rem', color: '#fff' }}>{stats.pendingBookings}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }} className="grid-cols-1">
            {/* Filtered Bookings */}
            <div className="glass" style={{ padding: '2rem' }}>
              <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}>
                  Reservations — <span style={{ color: 'var(--primary)', fontWeight: '500', fontSize: '0.95rem' }}>{weekLabel}</span>
                </h3>
                <Link to="/reservations" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>
                  View All
                </Link>
              </div>

              {recentBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <Calendar size={36} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No reservations in this period.</p>
                  <Link to="/fields" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                    Book a Field
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentBookings.map((res) => (
                    <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>⚽</div>
                        <div>
                          <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>{res.field?.name || 'Sports Field'}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            📅 {new Date(res.date).toLocaleDateString()} · ⏰ {res.time}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`badge ${res.status === 'confirmed' || res.status === 'attended' ? 'badge-success' : res.status === 'cancelled' ? 'badge-danger' : 'badge-pending'}`} style={{ fontSize: '0.7rem' }}>
                          {res.status}
                        </span>
                        <Link to={`/reservations/${res.id}`} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}>
                          View <ChevronRight size={13} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick booking card */}
            <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundImage: 'radial-gradient(circle at center, rgba(16,185,129,0.07), transparent)' }}>
              <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚽</span>
              <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontWeight: '700' }}>Need a Pitch?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '260px', lineHeight: '1.6' }}>
                Book high-quality grass or turf fields for you and your friends in Nador.
              </p>
              <Link to="/fields" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                Book a Field Now
              </Link>
              <Link to="/reservations" className="btn btn-secondary" style={{ width: '100%', padding: '0.65rem', marginTop: '0.75rem', fontSize: '0.875rem' }}>
                My Bookings
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDashboard;
