import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Clock, CreditCard, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const MyReservationsPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await client.get('/reservations');
        if (res.data.success) {
          setReservations(res.data.data.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load your reservations.");
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge badge-success">Confirmed</span>;
      case 'attended':
        return <span className="badge badge-info">Attended</span>;
      case 'cancelled':
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge badge-pending">Pending</span>;
    }
  };

  const getPaymentBadge = (pStatus) => {
    switch (pStatus) {
      case 'paid':
        return <span className="badge badge-success">Paid</span>;
      case 'failed':
        return <span className="badge badge-danger">Failed</span>;
      case 'refunded':
        return <span className="badge badge-info">Refunded</span>;
      default:
        return <span className="badge badge-pending">Unpaid</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>
          My Reservations
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>View and manage your upcoming and historical sport field bookings</p>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '4rem 0' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
        </div>
      ) : reservations.length === 0 ? (
        <div className="glass text-center" style={{ padding: '4rem 2rem' }}>
          <Calendar size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Bookings Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You haven't made any reservations. Explore fields and schedule a game.</p>
          <Link to="/fields" className="btn btn-primary">Browse Pitches</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reservations.map((res) => (
            <div key={res.id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              
              {/* Left Info */}
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem'
                }}>
                  ⚽
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '0.25rem' }}>
                    {res.field?.name || 'Sports Field'}
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} /> {new Date(res.date).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} /> {res.time} ({res.duration} hr{res.duration > 1 ? 's' : ''})
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Tags */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Booking Status</span>
                  {getStatusBadge(res.status)}
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Payment</span>
                  {getPaymentBadge(res.payment_status)}
                </div>
              </div>

              {/* Action */}
              <div>
                <Link to={`/reservations/${res.id}`} className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem', gap: '0.25rem', fontSize: '0.85rem' }}>
                  View Pass <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReservationsPage;
