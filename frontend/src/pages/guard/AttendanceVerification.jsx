import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { ClipboardList, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const AttendanceVerification = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTodayAttendance = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await client.get(`/reservations?page=${pageNumber}`);
      if (res.data.success) {
        setLogs(res.data.data.data || []);
        setPage(res.data.data.current_page || 1);
        setTotalPages(res.data.data.last_page || 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load today's reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance(page);
  }, [page]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0 0.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Page {page} of {totalPages}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
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
          Daily Attendance
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time overview of scheduled games and checked-in players for today</p>
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
      ) : logs.length === 0 ? (
        <div className="glass text-center" style={{ padding: '4rem 2rem' }}>
          <ClipboardList size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Matches Scheduled Today</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are no reservations booked for the current date.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Reservation ID</th>
                  <th>Player / Contact</th>
                  <th>Field</th>
                  <th>Scheduled Time</th>
                  <th>Payment Status</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>#{log.id}</td>
                    <td>
                      <strong>{log.user?.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        📞 {log.user?.phone || 'N/A'}
                      </span>
                    </td>
                    <td>{log.field?.name}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} color="var(--primary)" /> {log.time} ({log.duration} hr)
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${log.payment_status === 'paid' ? 'badge-success' : 'badge-pending'}`}>
                        {log.payment_status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${log.status === 'attended' ? 'badge-success' : 'badge-pending'}`}>
                        {log.status === 'attended' ? 'Admitted' : 'Waiting'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default AttendanceVerification;
