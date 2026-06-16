import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { Plus, Trash2, CheckCircle, X } from 'lucide-react';
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
  const [fields, setFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(true);

  // Helper to format/get today's date in local time string YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to count exact occurrences of selected sessions between startDate and endDate
  const countSessions = (startStr, endStr, sessionsList) => {
    if (!startStr || !endStr || !sessionsList || sessionsList.length === 0) return 0;
    let totalCount = 0;
    
    const [startY, startM, startD] = startStr.split('-').map(Number);
    const [endY, endM, endD] = endStr.split('-').map(Number);
    
    const start = new Date(startY, startM - 1, startD);
    const end = new Date(endY, endM - 1, endD);
    
    if (start > end) return 0;
    
    sessionsList.forEach(sess => {
      const targetDay = parseInt(sess.day_of_week);
      let current = new Date(start);
      
      const diff = (targetDay - current.getDay() + 7) % 7;
      current.setDate(current.getDate() + diff);
      
      while (current <= end) {
        totalCount++;
        current.setDate(current.getDate() + 7);
      }
    });
    
    return totalCount;
  };

  // Form state
  const [orgName, setOrgName]       = useState('');
  const [fieldId, setFieldId]       = useState('');
  const [startDate, setStartDate]   = useState(getTodayString());
  const [endDate, setEndDate]       = useState('');
  const [sessions, setSessions]     = useState([emptySession()]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState(null);

  // Auto-calculated price
  const selectedField = fields.find(f => String(f.id) === String(fieldId));
  const totalSessionsCount = countSessions(startDate, endDate, sessions);
  const totalPrice = selectedField && totalSessionsCount > 0
    ? (selectedField.price * totalSessionsCount).toFixed(2)
    : '';

  const fetchFields = async () => {
    setLoadingFields(true);
    try {
      const fieldsRes = await client.get('/fields?per_page=100');
      if (fieldsRes.data.success) {
        const list = (fieldsRes.data.data.data || []).filter(f => f.status === 'available');
        setFields(list);
        if (list.length > 0 && !fieldId) setFieldId(String(list[0].id));
      }
    } catch (err) {
      toast.error('Failed to load fields.');
    } finally {
      setLoadingFields(false);
    }
  };

  useEffect(() => { fetchFields(); }, []);

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
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m));
      else toast.error(err.response?.data?.message || 'Failed to create subscription.');
    } finally {
      setSubmitting(false);
    }
  };

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
              <label className="form-label">Field <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '400' }}>(available only)</span></label>
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
                min={getTodayString()}
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
                min={startDate || getTodayString()}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem' }}>
              {sessions.map((sess, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.35rem 0.6rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                    <select className="form-input" style={{ margin: 0, padding: '0.35rem 0.5rem', fontSize: '0.85rem', height: '34px', flex: 1 }} value={sess.day_of_week} onChange={e => updateSession(i, 'day_of_week', parseInt(e.target.value))}>
                      {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    <select className="form-input" style={{ margin: 0, padding: '0.35rem 0.5rem', fontSize: '0.85rem', height: '34px', flex: 1 }} value={sess.session_time} onChange={e => updateSession(i, 'session_time', e.target.value)}>
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSession(i)}
                    disabled={sessions.length === 1}
                    style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: 'none', borderRadius: '6px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: sessions.length === 1 ? 'not-allowed' : 'pointer', opacity: sessions.length === 1 ? 0.4 : 1, flexShrink: 0 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-calculated Price */}
          <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              {selectedField && totalSessionsCount > 0
                ? <>{selectedField.price} MAD/hr × {totalSessionsCount} session{totalSessionsCount > 1 ? 's' : ''} total</>
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
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                The subscription is now active. View generated bookings under <strong style={{ color: 'var(--primary)' }}>Manage Bookings → Organization Subscriptions</strong>.
              </span>
            </div>
            <button onClick={() => setResult(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 'auto' }}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSubscriptions;
