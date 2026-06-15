import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { Calendar, Trash2, ShieldAlert, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageReservations = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [reservations, setReservations] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(true);

  // Pagination states
  const [resPage, setResPage] = useState(1);
  const [resTotalPages, setResTotalPages] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);

  const fetchReservations = async (page = 1) => {
    setLoading(true);
    try {
      const res = await client.get(`/reservations?page=${page}`);
      if (res.data.success) {
        setReservations(res.data.data.data || []);
        setResPage(res.data.data.current_page || 1);
        setResTotalPages(res.data.data.last_page || 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async (page = 1) => {
    setSubLoading(true);
    try {
      const res = await client.get(`/subscriptions?page=${page}`);
      if (res.data.success) {
        setSubscriptions(res.data.data.data || []);
        setSubPage(res.data.data.current_page || 1);
        setSubTotalPages(res.data.data.last_page || 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subscriptions.");
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'clients') {
      fetchReservations(resPage);
    } else {
      fetchSubscriptions(subPage);
    }
  }, [activeTab, resPage, subPage]);

  const handleApproveReservation = async (id) => {
    if (!window.confirm("Approve this reservation and mark payment as Paid?")) return;
    try {
      const res = await client.post(`/reservations/${id}/approve`);
      if (res.data.success) {
        toast.success("Reservation approved and QR code generated!");
        fetchReservations(resPage);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve reservation.");
    }
  };

  const handleCancelReservation = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await client.post(`/reservations/${id}/cancel`);
      if (res.data.success) {
        toast.success("Reservation cancelled successfully.");
        fetchReservations(resPage);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel reservation.");
    }
  };

  const handleApproveSubscription = async (id) => {
    if (!window.confirm("Activate this academy subscription plan?")) return;
    try {
      const res = await client.post(`/subscriptions/${id}/approve`);
      if (res.data.success) {
        toast.success("Subscription activated successfully!");
        fetchSubscriptions(subPage);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to activate subscription.");
    }
  };

  const handleCancelSubscription = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this subscription?")) return;
    try {
      const res = await client.post(`/subscriptions/${id}/cancel`);
      if (res.data.success) {
        toast.success("Subscription cancelled successfully.");
        fetchSubscriptions(subPage);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel subscription.");
    }
  };

  const renderPagination = (currentPage, totalPages, onPageChange) => {
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0 0.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Page {currentPage} of {totalPages}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>
          Manage Bookings
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Approve payments, activate academy subscriptions, and control reservations</p>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('clients')}
          style={{
            padding: '1rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'clients' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'clients' ? '#fff' : 'var(--text-muted)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
        >
          Client Reservations
        </button>
        <button
          onClick={() => setActiveTab('orgs')}
          style={{
            padding: '1rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'orgs' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'orgs' ? '#fff' : 'var(--text-muted)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
        >
          Organization Subscriptions
        </button>
      </div>

      {activeTab === 'clients' ? (
        loading ? (
          <div className="text-center" style={{ padding: '3rem 0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(255, 255, 255, 0.1)',
              borderTopColor: '#10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="glass text-center" style={{ padding: '4rem 2rem' }}>
            <ShieldAlert size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Reservations</h3>
            <p style={{ color: 'var(--text-muted)' }}>No client reservations exist in the database.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Field</th>
                    <th>Player</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res) => (
                    <tr key={res.id}>
                      <td>#{res.id}</td>
                      <td><strong>{res.field?.name}</strong></td>
                      <td>{res.user?.name}</td>
                      <td>{new Date(res.date).toLocaleDateString()}</td>
                      <td>{res.time}</td>
                      <td>{res.duration} hr{res.duration > 1 ? 's' : ''}</td>
                      <td>
                        <span className={`badge ${
                          res.status === 'confirmed' ? 'badge-success' : 
                          res.status === 'attended' ? 'badge-info' : 
                          res.status === 'cancelled' ? 'badge-danger' : 
                          'badge-pending'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          res.payment_status === 'paid' ? 'badge-success' : 
                          res.payment_status === 'unpaid' ? 'badge-danger' : 
                          'badge-pending'
                        }`}>
                          {res.payment_status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {res.status === 'pending' && (
                            <button 
                              onClick={() => handleApproveReservation(res.id)}
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem', border: 'none', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)' }}
                              title="Approve Payment & Confirm"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          {res.status !== 'cancelled' && res.status !== 'attended' && (
                            <button 
                              onClick={() => handleCancelReservation(res.id)}
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                              title="Cancel / Reject Reservation"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination(resPage, resTotalPages, fetchReservations)}
          </>
        )
      ) : (
        subLoading ? (
          <div className="text-center" style={{ padding: '3rem 0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(255, 255, 255, 0.1)',
              borderTopColor: '#10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="glass text-center" style={{ padding: '4rem 2rem' }}>
            <ShieldAlert size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Subscriptions</h3>
            <p style={{ color: 'var(--text-muted)' }}>No academy subscriptions exist in the database.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Field</th>
                    <th>Organization</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td>#{sub.id}</td>
                      <td><strong>{sub.field?.name}</strong></td>
                      <td>{sub.organization?.name}</td>
                      <td>{new Date(sub.start_date).toLocaleDateString()}</td>
                      <td>{new Date(sub.end_date).toLocaleDateString()}</td>
                      <td>{sub.total_price} MAD</td>
                      <td>
                        <span className={`badge ${
                          sub.status === 'active' ? 'badge-success' : 
                          sub.status === 'cancelled' ? 'badge-danger' : 
                          'badge-pending'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {sub.status === 'pending' && (
                            <button 
                              onClick={() => handleApproveSubscription(sub.id)}
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem', border: 'none', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)' }}
                              title="Activate Subscription"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          {sub.status !== 'cancelled' && (
                            <button 
                              onClick={() => handleCancelSubscription(sub.id)}
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                              title="Cancel / Reject Subscription"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination(subPage, subTotalPages, fetchSubscriptions)}
          </>
        )
      )}
    </div>
  );
};

export default ManageReservations;
