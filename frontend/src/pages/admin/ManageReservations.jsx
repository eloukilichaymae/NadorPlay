import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { Eye, Check, X, Plus, ShieldAlert, Calendar, Clock, User, MapPin, QrCode, XCircle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'normal', label: 'Client Reservations' },
  { key: 'subscription', label: 'Organization Subscriptions' },
];

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ManageReservations = () => {
  const [activeTab, setActiveTab]     = useState('normal');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);

  // Add form (only for normal reservations)
  const [showAddForm, setShowAddForm] = useState(false);
  const [users, setUsers]             = useState([]);
  const [fields, setFields]           = useState([]);
  const [addForm, setAddForm]         = useState({ user_id: '', field_id: '', date: getTodayString(), time: '', duration: 1, number_of_players: 10 });
  const [submitting, setSubmitting]   = useState(false);

  // View modal
  const [viewRes, setViewRes] = useState(null);

  const fetchReservations = async (p = 1, tab = activeTab) => {
    setLoading(true);
    try {
      const res = await client.get(`/reservations?page=${p}&reservation_type=${tab}`);
      if (res.data.success) {
        setReservations(res.data.data.data || []);
        setPage(res.data.data.current_page || 1);
        setTotalPages(res.data.data.last_page || 1);
      }
    } catch (err) {
      toast.error('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const [uRes, fRes] = await Promise.all([
        client.get('/admin/users?per_page=100'),
        client.get('/fields?per_page=100'),
      ]);
      if (uRes.data.success) setUsers(uRes.data.data.data || []);
      if (fRes.data.success) setFields(fRes.data.data.data || []);
    } catch (err) {
      toast.error('Failed to load users/fields.');
    }
  };

  useEffect(() => {
    setPage(1);
    fetchReservations(1, activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchReservations(page, activeTab);
  }, [page]);

  const openAddForm = () => {
    if (users.length === 0) fetchFormData();
    setShowAddForm(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.user_id) { toast.error('Please select a user.'); return; }
    if (!addForm.field_id) { toast.error('Please select a field.'); return; }
    setSubmitting(true);
    try {
      const res = await client.post('/reservations', addForm);
      if (res.data.success) {
        toast.success('Reservation created successfully!');
        setShowAddForm(false);
        setAddForm({ user_id: '', field_id: '', date: getTodayString(), time: '', duration: 1, number_of_players: 10 });
        fetchReservations(1, activeTab);
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m));
      else toast.error(err.response?.data?.message || 'Failed to create reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this reservation?')) return;
    try {
      const res = await client.post(`/reservations/${id}/approve`);
      if (res.data.success) { toast.success('Reservation approved!'); fetchReservations(page, activeTab); }
    } catch (err) { toast.error('Failed to approve.'); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      const res = await client.post(`/reservations/${id}/cancel`);
      if (res.data.success) { toast.success('Reservation cancelled.'); fetchReservations(page, activeTab); }
    } catch (err) { toast.error('Failed to cancel.'); }
  };

  const statusBadge = (s) => {
    const map = { confirmed: 'badge-success', attended: 'badge-info', cancelled: 'badge-danger', accepted: 'badge-success' };
    return <span className={`badge ${map[s] || 'badge-pending'}`}>{s}</span>;
  };

  const payBadge = (s) => {
    const map = { paid: 'badge-success', unpaid: 'badge-danger' };
    return <span className={`badge ${map[s] || 'badge-pending'}`}>{s}</span>;
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>Manage Bookings</h1>
          <p style={{ color: 'var(--text-muted)' }}>View, approve, cancel and create field reservations</p>
        </div>
        {activeTab === 'normal' && (
          <button
            onClick={openAddForm}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.4rem' }}
          >
            <Plus size={18} /> New Reservation
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--text-muted)',
              fontWeight: activeTab === tab.key ? '700' : '500',
              fontSize: '0.95rem',
              padding: '0.6rem 1.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '-1px',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.key === 'subscription' ? <Building2 size={16} /> : <Calendar size={16} />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add Reservation Form (only for normal tab) */}
      {showAddForm && activeTab === 'normal' && (
        <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(16,185,129,0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#fff', margin: 0 }}>New Reservation</h3>
            <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <XCircle size={20} />
            </button>
          </div>
          <form onSubmit={handleAddSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Player / User</label>
                <select className="form-input" value={addForm.user_id} onChange={e => setAddForm(f => ({ ...f, user_id: e.target.value }))} required>
                  <option value="">-- Select user --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Field</label>
                <select className="form-input" value={addForm.field_id} onChange={e => setAddForm(f => ({ ...f, field_id: e.target.value }))} required>
                  <option value="">-- Select field --</option>
                  {fields.map(f => <option key={f.id} value={f.id}>{f.name} — {f.price} MAD/hr</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={addForm.date} min={new Date().toISOString().split('T')[0]} onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Time</label>
                <input type="time" className="form-input" value={addForm.time} onChange={e => setAddForm(f => ({ ...f, time: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Duration (hrs)</label>
                <select className="form-input" value={addForm.duration} onChange={e => setAddForm(f => ({ ...f, duration: Number(e.target.value) }))}>
                  {[1,2,3,4].map(h => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Players</label>
                <input type="number" className="form-input" min={2} max={30} value={addForm.number_of_players} onChange={e => setAddForm(f => ({ ...f, number_of_players: Number(e.target.value) }))} required />
              </div>
            </div>
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Reservation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reservations Table */}
      {loading ? (
        <div className="text-center" style={{ padding: '3rem 0' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      ) : reservations.length === 0 ? (
        <div className="glass text-center" style={{ padding: '4rem 2rem' }}>
          <ShieldAlert size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>
            No {activeTab === 'normal' ? 'Client Reservations' : 'Organization Subscriptions'}
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {activeTab === 'normal'
              ? 'No client reservations found. Create one using the button above.'
              : 'No subscription-based session reservations found.'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Field</th>
                  <th>{activeTab === 'normal' ? 'Player' : 'Organization'}</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(res => (
                  <tr key={res.id}>
                    <td>#{res.id}</td>
                    <td><strong>{res.field?.name}</strong></td>
                    <td>
                      {activeTab === 'normal'
                        ? res.user?.name || '—'
                        : (res.subscription?.organization_name || res.user?.name || '—')}
                    </td>
                    <td>{new Date(res.date).toLocaleDateString()}</td>
                    <td>{res.time?.substring(0, 5)}</td>
                    <td>{res.duration} hr{res.duration > 1 ? 's' : ''}</td>
                    <td>{statusBadge(res.status)}</td>
                    <td>{payBadge(res.payment_status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setViewRes(res)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem', background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'none' }}
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>
                        {res.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(res.id)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem', background: 'rgba(16,185,129,0.12)', color: 'var(--primary)', border: 'none' }}
                            title="Approve"
                          >
                            <Check size={15} />
                          </button>
                        )}
                        {res.status !== 'cancelled' && res.status !== 'attended' && res.status !== 'accepted' && (
                          <button
                            onClick={() => handleCancel(res.id)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem', background: 'rgba(239,68,68,0.12)', color: 'var(--danger)', border: 'none' }}
                            title="Cancel"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Previous</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Modal */}
      {viewRes && (
        <div
          onClick={() => setViewRes(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass"
            style={{ width: '100%', maxWidth: '520px', padding: '2rem', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <h3 style={{ color: '#fff', margin: 0 }}>Reservation #{viewRes.id}</h3>
              <button onClick={() => setViewRes(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
              {[
                { icon: <User size={16} />, label: activeTab === 'normal' ? 'Player' : 'Organization', value: activeTab === 'normal' ? `${viewRes.user?.name} (${viewRes.user?.email || '—'})` : (viewRes.subscription?.organization_name || viewRes.user?.name || '—') },
                { icon: <MapPin size={16} />, label: 'Field', value: viewRes.field?.name },
                { icon: <Calendar size={16} />, label: 'Date', value: new Date(viewRes.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                { icon: <Clock size={16} />, label: 'Time', value: `${viewRes.time?.substring(0,5)} — ${viewRes.duration} hour${viewRes.duration > 1 ? 's' : ''}` },
                viewRes.number_of_players ? { icon: <User size={16} />, label: 'Players', value: viewRes.number_of_players } : null,
              ].filter(Boolean).map(({ icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }}>{icon}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', minWidth: '80px' }}>{label}:</span>
                  <span style={{ color: '#fff', fontSize: '0.9rem' }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Booking Status</span>
                  {statusBadge(viewRes.status)}
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Payment</span>
                  {payBadge(viewRes.payment_status)}
                </div>
              </div>
            </div>

            {viewRes.qr_code && (
              <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <QrCode size={14} /> QR Payload
                </p>
                <pre style={{ color: '#34d399', fontSize: '0.72rem', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {JSON.stringify(JSON.parse(viewRes.qr_code), null, 2)}
                </pre>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', justifyContent: 'flex-end' }}>
              {viewRes.status === 'pending' && (
                <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                  onClick={() => { handleApprove(viewRes.id); setViewRes(null); }}>
                  <Check size={15} /> Approve
                </button>
              )}
              {viewRes.status !== 'cancelled' && viewRes.status !== 'attended' && viewRes.status !== 'accepted' && (
                <button className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', color: 'var(--danger)' }}
                  onClick={() => { handleCancel(viewRes.id); setViewRes(null); }}>
                  <X size={15} /> Cancel
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setViewRes(null)} style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReservations;
