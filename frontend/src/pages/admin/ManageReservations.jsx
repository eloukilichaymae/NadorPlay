import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { Calendar, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      // In a real application we would fetch all reservations from admin endpoint.
      // Let's call /reservations which yields matching role data. Since logged in as admin, 
      // Laravel controller returns all reservations automatically.
      const res = await client.get('/reservations');
      if (res.data.success) {
        setReservations(res.data.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await client.post(`/reservations/${id}/cancel`);
      if (res.data.success) {
        toast.success("Reservation cancelled successfully.");
        fetchReservations();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel reservation.");
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>
          Manage Bookings
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitor and cancel active, pending, and historic sports reservations</p>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '3rem 0' }}>
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
          <ShieldAlert size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Bookings</h3>
          <p style={{ color: 'var(--text-muted)' }}>No bookings exist in the database.</p>
        </div>
      ) : (
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
                    <span className={`badge ${res.payment_status === 'paid' ? 'badge-success' : 'badge-pending'}`}>
                      {res.payment_status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {res.status !== 'cancelled' && res.status !== 'attended' && (
                      <button 
                        onClick={() => handleCancel(res.id)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                        title="Cancel Booking"
                      >
                        <Trash2 size={16} />
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
  );
};

export default ManageReservations;
