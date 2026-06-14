import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import { CreditCard, Calendar, Users, Award, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const OrganizationDashboard = () => {
  const { user } = useContext(AuthContext);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await client.get('/subscriptions');
        if (res.data.success) {
          setSubscriptions(res.data.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load subscription metrics.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  const activeSubs = subscriptions.filter(s => s.status === 'active');

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>
          Academy Portal
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage academy schedules, monthly subscriptions, and recurring sessions for {user?.name}</p>
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
          {/* Quick Stats */}
          <div className="grid-cols-3" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>ACTIVE CONTRACTS</span>
                <strong style={{ fontSize: '1.75rem', color: '#fff' }}>{activeSubs.length}</strong>
              </div>
            </div>

            <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>WEEKLY SESSIONS</span>
                <strong style={{ fontSize: '1.75rem', color: '#fff' }}>
                  {activeSubs.reduce((acc, sub) => acc + (sub.sessions ? sub.sessions.length : 0), 0)}
                </strong>
              </div>
            </div>

            <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>DISCOUNT LEVEL</span>
                <strong style={{ fontSize: '1.25rem', color: '#34d399' }}>15% bulk rate</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }} className="grid-cols-1">
            {/* Subscriptions Overviews */}
            <div className="glass" style={{ padding: '2rem' }}>
              <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#fff' }}>My Contracts</h3>
                <Link to="/organization/subscriptions" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>Manage</Link>
              </div>

              {subscriptions.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No recurring contracts created yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {subscriptions.map((sub) => (
                    <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <div>
                        <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{sub.field?.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          Ends on: {new Date(sub.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`badge ${sub.status === 'active' ? 'badge-success' : 'badge-pending'}`}>
                        {sub.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick action card */}
            <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</span>
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Lock a Training Slot</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '300px' }}>
                Create a weekly contract with Nador Municipality to guarantee field availability for your academy.
              </p>
              <Link to="/organization/subscriptions" className="btn btn-primary" style={{ width: '100%' }}>
                Request Subscription
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrganizationDashboard;
