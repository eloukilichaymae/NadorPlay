import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { Users, CalendarCheck, DollarSign, Star, TrendingUp, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const getPastDateString = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState(getPastDateString(6));
  const [endDate, setEndDate] = useState(getPastDateString(0));
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const res = await client.get('/admin/stats', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      if (res.data.success) {
        setStatsData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, [startDate, endDate]);

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

  const { stats, popular_fields, peak_hours } = statsData || {};

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>
          Municipality Analytics
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time indicators of sports facilities, reservations, and municipal revenue</p>
      </div>

      {/* Date Range Selector */}
      <div className="glass" style={{ padding: '1.5rem', marginBottom: '2.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>Filter Analytics</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>Select custom date ranges to filter reservation metrics</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Start Date</label>
            <input 
              type="date" 
              className="form-input" 
              style={{ width: '160px', padding: '0.5rem' }} 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>End Date</label>
            <input 
              type="date" 
              className="form-input" 
              style={{ width: '160px', padding: '0.5rem' }} 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid-cols-3" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL REVENUE</span>
            <strong style={{ fontSize: '1.75rem', color: '#fff' }}>{stats?.total_revenue || 0} MAD</strong>
          </div>
        </div>

        <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarCheck size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL RESERVATIONS</span>
            <strong style={{ fontSize: '1.75rem', color: '#fff' }}>{stats?.total_reservations || 0}</strong>
          </div>
        </div>

        <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>REGISTERED USERS</span>
            <strong style={{ fontSize: '1.75rem', color: '#fff' }}>{stats?.total_users || 0}</strong>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Aggregations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }} className="grid-cols-1">
        
        {/* Popular Fields */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--primary)" /> Most Popular Fields
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {popular_fields?.map((field, index) => (
              <div key={field.id} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>#{index + 1}</span>
                  <strong style={{ color: '#fff' }}>{field.name}</strong>
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.8rem' }}>
                  {field.reservations_count} bookings
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="var(--primary)" /> Peak Booking Hours
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {peak_hours?.map((hour, index) => (
              <div key={hour.hour_slot} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>#{index + 1}</span>
                  <span style={{ color: '#fff', fontWeight: '500' }}>{hour.hour_slot}</span>
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.8rem' }}>
                  {hour.count} matches
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
