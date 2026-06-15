import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { Plus, Trash2, Calendar, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const TIME_SLOTS = [
  '08:00','09:00','10:00','11:00','12:00','13:00',
  '14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00',
];

const emptySession = () => ({ day_of_week: 1, session_time: '18:00' });

const ManageSubscriptions = () => {
  const [fields, setFields]           = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // Form state
  const [orgName, setOrgName]       = useState('');
  const [fieldId, setFieldId]       = useState('');
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');
  const [sessions, setSessions]     = useState([emptySession()]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState(null);

  // Auto-calculated price
  const selectedField = fields.find(f => String(f.id) === String(fieldId));
  const weeks = (startDate && endDate)
    ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (7 * 24 * 60 * 60 * 1000)))
    : 0;
  const totalPrice = selectedField && weeks > 0
    ? (selectedField.price * sessions.length * weeks).toFixed(2)
    : '';

  const fetchAll = async () => {
    setLoadingList(true);
    try {
      const [fieldsRes, subsRes] = await Promise.all([
        client.get('/fields?per_page=100'),
        client.get('/subscriptions?per_page=50'),
      ]);
      if (fieldsRes.data.success) {
        const list = fieldsRes.data.data.data || [];
        setFields(list);
        if (list.length > 0 && !fieldId) setFieldId(String(list[0].id));
      }
      if (subsRes.data.success) setSubscriptions(subsRes.data.data.data || []);
    } catch (err) {
      toast.error('Failed to load data.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const addSession    = () => setSessions(prev => [...prev, emptySession()]);
  const removeSession = (i) => setSessions(prev => prev.filter((_, idx) => idx !== i));
  const updateSession = (i, key, value) =>
    setSessions(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: value } : s));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fieldId)   { toast.error('Please select a field.'); return; }
    if (!startDate || !endDate) { toast.error('Please set start and end dates.'); return; }
    if (!totalPrice) { toast.error('Price could not be calculated.'); return; }

    setSubmitting(true);
    setResult(null);
    try {
      const res = await client.post('/admin/subscriptions', {
        organization_name: orgName,
        field_id:   fieldId,
        start_date: startDate,
        end_date:   endDate,
        total_price: totalPrice,
        sessions,
      });
      if (res.data.success) {
        setResult(res.data);
        toast.success(res.data.message);
        setOrgName(''); setStartDate(''); setEndDate(''); setSessions([emptySession()]);
        fetchAll();
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m));
      else toast.error(err.response?.data?.message || 'Failed to create subscription.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this subscription?')) return;
    try {
      const res = await client.post(`/subscriptions/${id}/cancel`);
      if (res.data.success) { toast.success('Subscription cancelled.'); fetchAll(); }
    } catch { toast.error('Failed to cancel subscription.'); }
  };

  const statusClass = (s) =>
    s === 'active' ? 'badge-success' : s === 'cancelled' ? 'badge-danger' : 'badge-pending';

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>
          Manage Subscriptions
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Create long-term field rental contracts for schools, academies and clubs
        </p>
      </div>

      {/* ── New Subscription Form ── */}
      <div className="glass" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
        <h3 style={{ color: '#fff', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} color="var(--primary)" /> New Subscription
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Organization Name */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Organization / Club Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. FC Nador Academy"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                required
              />
            </div>

            {/* Field */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Field</label>
              <select className="form-input" value={fieldId} onChange={e => setFieldId(e.target.value)} required>
                <option value="">-- Select field --</option>
                {fields.map(f => (
                  <option key={f.id} value={f.id}>{f.name} — {f.price} MAD/hr</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>

            {/* End Date */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                min={startDate}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Weekly Sessions */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Weekly Sessions</label>
              <button type="button" onClick={addSession} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                <Plus size={14} /> Add Session
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
              {sessions.map((sess, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.6rem', alignItems: 'center', padding: '0.75rem', background: 'rgba(16,185,129,0.05)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <select className="form-input" style={{ margin: 0 }} value={sess.day_of_week} onChange={e => updateSession(i, 'day_of_week', parseInt(e.target.value))}>
                    {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                  <select className="form-input" style={{ margin: 0 }} value={sess.session_time} onChange={e => updateSession(i, 'session_time', e.target.value)}>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeSession(i)}
                    disabled={sessions.length === 1}
                    style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: 'none', borderRadius: '6px', padding: '0.5rem', cursor: sessions.length === 1 ? 'not-allowed' : 'pointer', opacity: sessions.length === 1 ? 0.4 : 1 }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-calculated Price */}
          <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              {selectedField && weeks > 0
                ? <>{selectedField.price} MAD/hr × {sessions.length} session{sessions.length > 1 ? 's' : ''}/week × {weeks} week{weeks > 1 ? 's' : ''}</>
                : 'Select a field and dates to calculate price'}
            </div>
            <div style={{ fontWeight: '700', fontSize: '1.3rem', color: totalPrice ? '#34d399' : 'var(--text-muted)' }}>
              {totalPrice ? `${totalPrice} MAD` : '—'}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={submitting || !totalPrice}>
            {submitting ? 'Creating...' : 'Create Subscription'}
          </button>
        </form>

        {/* Result feedback */}
        {result && (
          <div style={{ marginTop: '1.5rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#fff', display: 'block', marginBottom: '0.25rem' }}>{result.message}</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>The subscription has been saved and is now active.</span>
            </div>
            <button onClick={() => setResult(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 'auto' }}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── All Subscriptions Table ── */}
      <div className="glass" style={{ padding: '2rem' }}>
        <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>All Subscriptions</h3>

        {loadingList ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center" style={{ padding: '3rem 0' }}>
            <Calendar size={36} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>No subscriptions yet. Create one above.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Organization</th>
                  <th>Field</th>
                  <th>Period</th>
                  <th>Sessions / Week</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(sub => (
                  <tr key={sub.id}>
                    <td>#{sub.id}</td>
                    <td><strong>{sub.organization_name || '—'}</strong></td>
                    <td>{sub.field?.name}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(sub.start_date).toLocaleDateString()} → {new Date(sub.end_date).toLocaleDateString()}
                    </td>
                    <td>
                      {sub.sessions?.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {sub.sessions.map(s => (
                            <span key={s.id} className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                              {DAYS.find(d => d.value === s.day_of_week)?.label ?? `Day ${s.day_of_week}`} {s.session_time?.substring(0,5)}
                            </span>
                          ))}
                        </div>
                      ) : '—'}
                    </td>
                    <td><strong style={{ color: 'var(--primary)' }}>{sub.total_price} MAD</strong></td>
                    <td><span className={`badge ${statusClass(sub.status)}`}>{sub.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      {sub.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(sub.id)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSubscriptions;
