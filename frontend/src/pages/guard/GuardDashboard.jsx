import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { ScanQrCode, ClipboardList, Shield, Activity, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const GuardDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await client.get('/reservations');
        if (res.data.success) {
          // Filter attended reservations for today
          const todayStr = new Date().toISOString().split('T')[0];
          const todayAttended = res.data.data.data.filter(r => r.status === 'attended');
          setAttendance(todayAttended);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load attendance logs.");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>
          Guard Portal
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Scan player passes, verify booking schedules, and check entry logs</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }} className="grid-cols-1">
        {/* QR Scan Action Card */}
        <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <ScanQrCode size={36} />
          </div>
          <h2 style={{ color: '#fff', marginBottom: '0.75rem' }}>Scan Pass</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '320px' }}>
            Verify player QR code codes to grant access to stadium football fields.
          </p>
          <Link to="/guard/scan" className="btn btn-primary" style={{ width: '100%' }}>
            Open QR Code Scanner
          </Link>
        </div>

        {/* Security Info Card */}
        <div className="glass" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="var(--primary)" /> Guard Guidelines
          </h3>
          <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>Verify booking time slot coincides with current time (+/- 15 mins).</li>
            <li>Scan QR Code on the player's mobile device.</li>
            <li>Only confirmed, paid, and matching signatures can pass.</li>
            <li>In case of disputes, refer players to the municipal office.</li>
          </ul>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="glass" style={{ padding: '2rem' }}>
        <h3 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={22} color="var(--primary)" /> Checked-In Players Today
        </h3>

        {loading ? (
          <div className="text-center" style={{ padding: '2rem' }}>Loading logs...</div>
        ) : attendance.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No players have been checked in today yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Reservation ID</th>
                  <th>Player Name</th>
                  <th>Field</th>
                  <th>Scheduled Time</th>
                  <th>Check-In Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((att) => (
                  <tr key={att.id}>
                    <td>#{att.id}</td>
                    <td><strong>{att.user?.name}</strong></td>
                    <td>{att.field?.name}</td>
                    <td>{att.time} ({att.duration} hr)</td>
                    <td>
                      <span className="badge badge-success">Checked In</span>
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

export default GuardDashboard;
