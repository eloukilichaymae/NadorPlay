import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Clock, CreditCard, Ticket, Check, ShieldAlert, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const ReservationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment Form State
  const [paymentProvider, setPaymentProvider] = useState('cmi');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [simulatedStatus, setSimulatedStatus] = useState('success');

  const fetchReservation = async () => {
    try {
      const res = await client.get(`/reservations/${id}`);
      if (res.data.success) {
        setReservation(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reservation details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservation();
  }, [id]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);

    try {
      const res = await client.post('/payments/process', {
        reservation_id: id,
        amount: reservation.field.price * reservation.duration,
        provider: paymentProvider,
        card_name: cardName || user.name,
        simulated_status: simulatedStatus
      });

      if (res.data.success) {
        toast.success(res.data.message || "Payment processed successfully!");
        fetchReservation();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Payment failed.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await client.post(`/reservations/${id}/cancel`);
      if (res.data.success) {
        toast.success("Reservation cancelled successfully!");
        fetchReservation();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel reservation.");
    }
  };

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

  if (!reservation) {
    return (
      <div className="container text-center" style={{ padding: '4rem 0' }}>
        <h2>Reservation Not Found</h2>
      </div>
    );
  }

  const isPaid = reservation.payment_status === 'paid';
  const isCancelled = reservation.status === 'cancelled';
  const totalAmount = reservation.field.price * reservation.duration;

  return (
    <div className="container" style={{ padding: '2rem 0', animation: 'fadeIn 0.5s ease-out' }}>
      
      <button className="btn btn-secondary" style={{ marginBottom: '2rem' }} onClick={() => navigate('/reservations')}>
        ← Back to Reservations
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }} className="details-grid">
        
        {/* Ticket & QR Pass */}
        <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', backgroundImage: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.08), transparent)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
            <Ticket size={48} />
          </div>

          <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            NadorPlay Access Pass
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
            Reservation ID: #{reservation.id}
          </p>

          {/* QR Code Container */}
          <div style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '16px',
            display: 'inline-block',
            marginBottom: '2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            border: isPaid ? '4px solid var(--primary)' : '4px solid #9ca3af'
          }}>
            {reservation.qr_code ? (
              <QRCodeSVG value={reservation.qr_code} size={180} />
            ) : (
              <p style={{ color: '#000' }}>QR code pending...</p>
            )}
          </div>

          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              PITCH DETAILS
            </h3>
            <p style={{ color: '#fff', fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{reservation.field?.name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>📍 {reservation.field?.location}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Date</span>
                <strong style={{ color: '#fff' }}>{new Date(reservation.date).toLocaleDateString()}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Time Slot</span>
                <strong style={{ color: '#fff' }}>{reservation.time} ({reservation.duration} hr{reservation.duration > 1 ? 's' : ''})</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Booking Status</span>
                <span className={`badge ${isCancelled ? 'badge-danger' : reservation.status === 'confirmed' ? 'badge-success' : 'badge-pending'}`}>
                  {reservation.status}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Payment Status</span>
                <span className={`badge ${isPaid ? 'badge-success' : 'badge-pending'}`}>
                  {reservation.payment_status}
                </span>
              </div>
            </div>
          </div>

          {!isCancelled && reservation.status !== 'attended' && (
            <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleCancelBooking}>
              Cancel Reservation
            </button>
          )}
        </div>

        {/* Payment Area or Success Confirmation */}
        <div>
          {isPaid ? (
            <div className="glass" style={{ padding: '3rem 2rem', textAlign: 'center', borderColor: 'var(--primary)' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--primary)',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <Check size={32} />
              </div>
              <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Reservation Confirmed!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                Your payment of <strong>{totalAmount} MAD</strong> was received. Present the QR code on the left to the stadium guard upon entry to the facility.
              </p>
              <div className="glass" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
                <Award size={24} color="var(--primary)" />
                <div>
                  <h4 style={{ color: '#fff', fontSize: '0.9rem' }}>Important Rule</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Please arrive 10 minutes prior to your time slot with appropriate athletic footwear.</p>
                </div>
              </div>
            </div>
          ) : isCancelled ? (
            <div className="glass" style={{ padding: '3rem 2rem', textAlign: 'center', borderColor: 'var(--danger)' }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--danger)',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <ShieldAlert size={32} />
              </div>
              <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Booking Cancelled</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                This reservation has been cancelled. If payment was made, a refund will be processed back to your original payment method.
              </p>
            </div>
          ) : (
            /* Payment Gateway Simulator */
            <div className="glass" style={{ padding: '2.5rem', textAlign: 'left' }}>
              <h3 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={22} color="var(--primary)" /> Secure Checkout
              </h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Amount to Pay:</span>
                <h2 style={{ color: '#fff', fontSize: '2.25rem', fontWeight: '800' }}>{totalAmount} MAD</h2>
              </div>

              <form onSubmit={handlePaymentSubmit}>
                
                {/* Provider Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {['cmi', 'stripe', 'paypal'].map(prov => (
                    <button
                      key={prov}
                      type="button"
                      className={`btn ${paymentProvider === prov ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.8rem', textTransform: 'uppercase', padding: '0.5rem' }}
                      onClick={() => setPaymentProvider(prov)}
                    >
                      {prov}
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">Name on Card</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Hassan El Nadori"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    className="form-input"
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                      className="form-input"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVC</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      placeholder="123"
                      className="form-input"
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                    />
                  </div>
                </div>

                {/* Simulated State Toggle (Success/Failure testing) */}
                <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px dashed var(--border-color)', marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>SIMULATED GATEWAY OUTCOME</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#34d399', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input type="radio" name="outcome" value="success" checked={simulatedStatus === 'success'} onChange={() => setSimulatedStatus('success')} />
                      Simulate Success
                    </label>
                    <label style={{ fontSize: '0.85rem', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input type="radio" name="outcome" value="fail" checked={simulatedStatus === 'fail'} onChange={() => setSimulatedStatus('fail')} />
                      Simulate Decline
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.8rem' }}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? 'Authorizing Payment...' : `Pay ${totalAmount} MAD`}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReservationDetailsPage;
