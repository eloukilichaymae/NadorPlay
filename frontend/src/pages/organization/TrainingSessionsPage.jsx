import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { Calendar, Clock, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const TrainingSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await client.get('/subscriptions');
        if (res.data.success) {
          const activeSubs = res.data.data.filter(s => s.status === 'active');
          const allSessions = [];
          activeSubs.forEach(sub => {
            if (sub.sessions && sub.sessions.length > 0) {
              sub.sessions.forEach(sess => {
                allSessions.push({
                  ...sess,
                  field_name: sub.field?.name,
                  end_date: sub.end_date
                });
              });
            }
          });
          setSessions(allSessions);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load academy schedules.");
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

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
          Weekly Training Sessions
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Recurring timeslots booked and locked by Nador Municipality for your student training activities</p>
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
      ) : sessions.length === 0 ? (
        <div className="glass text-center" style={{ padding: '4rem 2rem' }}>
          <Calendar size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Sessions Active</h3>
          <p style={{ color: 'var(--text-muted)' }}>You do not have any active training sessions. Please make sure you have an active paid subscription.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Day of Week</th>
                <th>Session Time</th>
                <th>Sports Field</th>
                <th>Contract Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((sess) => (
                <tr key={sess.id}>
                  <td><strong>{daysOfWeekMap[sess.day_of_week]}</strong></td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} color="var(--primary)" /> {sess.session_time.substring(0, 5)}
                    </span>
                  </td>
                  <td>{sess.field_name}</td>
                  <td>{new Date(sess.end_date).toLocaleDateString()}</td>
                  <td>
                    <span className="badge badge-success">Active slot</span>
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

export default TrainingSessionsPage;
