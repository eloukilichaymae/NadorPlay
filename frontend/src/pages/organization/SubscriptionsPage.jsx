import React, { useEffect, useState, useContext } from 'react';
import client from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import { Plus, CreditCard, Calendar, Check, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SubscriptionsPage = () => {
  const { user } = useContext(AuthContext);

  const [subscriptions, setSubscriptions] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedField, setSelectedField] = useState('');
  const [durationMonths, setDurationMonths] = useState(1);
  const [selectedDays, setSelectedDays] = useState([]);
  const [sessionTime, setSessionTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Payment State for simulated modal
  const [activePaymentSub, setActivePaymentSub] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const fetchSubscriptionsAndFields = async () => {
    setLoading(true);
    try {
      const subRes = await client.get('/subscriptions');
      const fieldRes = await client.get('/fields');
      
      if (subRes.data.success) setSubscriptions(subRes.data.data);
      if (fieldRes.data.success) {
        const list = fieldRes.data.data.data.filter(f => f.status === 'available');
        setFields(list);
        if (list.length > 0) setSelectedField(list[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subscriptions data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionsAndFields();
  }, []);

  const handleDayToggle = (dayNum) => {
    if (selectedDays.includes(dayNum)) {
      setSelectedDays(prev => prev.filter(d => d !== dayNum));
    } else {
      setSelectedDays(prev => [...prev, dayNum]);
    }
  };

  const handleRequestSubscription = async (e) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      toast.error("Please choose at least one training day of the week.");
      return;
    }
    if (!sessionTime) {
      toast.error("Please select session time slot.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await client.post('/subscriptions', {
        field_id: selectedField,
        duration_months: durationMonths,
        days_of_week: selectedDays,
        session_time: sessionTime
      });

      if (res.data.success) {
        toast.success("Subscription requested! Proceed to pay.");
        // Open payment simulator
        setActivePaymentSub(res.data.data);
        fetchSubscriptionsAndFields();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create subscription contract.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    try {
      const res = await client.post('/payments/process', {
        subscription_id: activePaymentSub.id,
        amount: activePaymentSub.total_price,
        provider: 'stripe',
        card_name: cardName || user.name,
        simulated_status: 'success'
      });

      if (res.data.success) {
        toast.success("Academy subscription activated successfully!");
        setActivePaymentSub(null);
        setCardName('');
        setCardNumber('');
        fetchSubscriptionsAndFields();
      }
    } catch (err) {
      console.error(err);
      toast.error("Payment authorization failed.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const daysOfWeekMap = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday'
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>
          Academy Subscriptions
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Request monthly contracts, schedule training hours, and unlock volume rates</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }} className="grid-cols-1">
        
        {/* Subscriptions List */}
        <div>
          <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Active Contracts</h3>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading contracts...</p>
          ) : subscriptions.length === 0 ? (
            <div className="glass text-center" style={{ padding: '3rem 2rem' }}>
              <Calendar size={36} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>No contracts registered. Fill the form on the right to lock a field.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {subscriptions.map((sub) => (
                <div key={sub.id} className="glass" style={{ padding: '1.5rem' }}>
                  <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>{sub.field?.name}</h4>
                    <span className={`badge ${sub.status === 'active' ? 'badge-success' : 'badge-pending'}`}>
                      {sub.status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    <span>Start: {new Date(sub.start_date).toLocaleDateString()}</span>
                    <span>End: {new Date(sub.end_date).toLocaleDateString()}</span>
                    <span>Cost: <strong>{sub.total_price} MAD</strong></span>
                  </div>

                  {sub.sessions && sub.sessions.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>TRAINING SCHEDULES</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {sub.sessions.map(sess => (
                          <span key={sess.id} className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                            {daysOfWeekMap[sess.day_of_week]} at {sess.session_time.substring(0,5)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {sub.status === 'pending' && (
                    <button 
                      onClick={() => setActivePaymentSub(sub)}
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '0.5rem', marginTop: '1rem', fontSize: '0.85rem' }}
                    >
                      Pay Now ({sub.total_price} MAD)
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wizard Form */}
        <div className="glass" style={{ padding: '2.5rem' }}>
          <h3 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} color="var(--primary)" /> Request Subscription
          </h3>

          <form onSubmit={handleRequestSubscription}>
            <div className="form-group">
              <label className="form-label">Select Field</label>
              <select className="form-input" value={selectedField} onChange={(e) => setSelectedField(e.target.value)}>
                {fields.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.price} MAD/hr)</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Months)</label>
              <select className="form-input" value={durationMonths} onChange={(e) => setDurationMonths(parseInt(e.target.value))}>
                <option value={1}>1 Month Contract</option>
                <option value={3}>3 Months Contract (10% Disc.)</option>
                <option value={6}>6 Months Contract (15% Disc.)</option>
                <option value={12}>1 Year Contract (20% Disc.)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Weekly Training Days</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <label key={d} style={{ color: 'var(--text-main)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedDays.includes(d)} 
                      onChange={() => handleDayToggle(d)} 
                    />
                    {daysOfWeekMap[d]}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Training Hours Slot</label>
              <div style={{ position: 'relative' }}>
                <Clock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select 
                  required
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem' }} 
                  value={sessionTime} 
                  onChange={(e) => setSessionTime(e.target.value)}
                >
                  <option value="">Select Time Slot</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                  <option value="18:00">06:00 PM</option>
                  <option value="19:00">07:00 PM</option>
                  <option value="20:00">08:00 PM</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '1rem' }} disabled={submitting}>
              {submitting ? 'Creating draft...' : 'Request Contract'}
            </button>
          </form>
        </div>
      </div>

      {/* Simulated Checkout Modal */}
      {activePaymentSub && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', textAlign: 'left' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#fff' }}>Contract Checkout</h3>
              <button 
                onClick={() => setActivePaymentSub(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monthly subscription total:</span>
              <h2 style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: '800' }}>{activePaymentSub.total_price} MAD</h2>
            </div>

            <form onSubmit={handlePayment}>
              <div className="form-group">
                <label className="form-label">Name on Card</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  placeholder="e.g. Academy Coach" 
                  value={cardName} 
                  onChange={(e) => setCardName(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  placeholder="4000 1234 5678 9010" 
                  value={cardNumber} 
                  onChange={(e) => setCardNumber(e.target.value)} 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '1rem' }} disabled={paymentLoading}>
                {paymentLoading ? 'Processing transaction...' : 'Pay & Activate Subscription'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
