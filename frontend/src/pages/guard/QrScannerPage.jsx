import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { Scan, ShieldAlert, CheckCircle, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const QrScannerPage = () => {
  const navigate = useNavigate();
  
  const [qrInput, setQrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorResult, setErrorResult] = useState('');
  
  // Test helpers to make demonstration super easy
  const [demoReservations, setDemoReservations] = useState([]);
  const [demoLoading, setDemoLoading] = useState(true);

  const fetchDemoReservations = async () => {
    setDemoLoading(true);
    try {
      const res = await client.get('/reservations');
      if (res.data.success) {
        // Only show confirmed or attended ones to test
        setDemoReservations(res.data.data.data.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoReservations();
  }, []);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!qrInput) {
      toast.error("Please enter or select a QR code payload.");
      return;
    }

    setLoading(true);
    setScanResult(null);
    setErrorResult('');

    try {
      const res = await client.post('/reservations/verify-qr', {
        code: qrInput,
        confirm: false
      });

      if (res.data.success) {
        setScanResult(res.data.data);
        toast.success("QR Signature verified successfully!");
      }
    } catch (err) {
      console.error(err);
      setErrorResult(err.response?.data?.message || "Invalid QR Code or signature verification failed.");
      toast.error("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    setLoading(true);
    try {
      const res = await client.post('/reservations/verify-qr', {
        code: qrInput,
        confirm: true
      });

      if (res.data.success) {
        toast.success("Player checked in successfully!");
        setScanResult(null);
        setQrInput('');
        fetchDemoReservations(); // reload demo state
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to confirm check-in.");
    } finally {
      setLoading(false);
    }
  };

  const loadDemoQr = (qrPayload) => {
    setQrInput(qrPayload);
    setScanResult(null);
    setErrorResult('');
    toast.success("Demo QR payload loaded into scanner!");
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <button className="btn btn-secondary" style={{ marginBottom: '2rem' }} onClick={() => navigate('/guard')}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }} className="grid-cols-1">
        
        {/* Scanner Simulation */}
        <div className="glass" style={{ padding: '2.5rem' }}>
          <h2 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scan size={22} color="var(--primary)" /> Interactive QR Scanner
          </h2>

          {/* Scanner Simulation viewbox */}
          <div style={{
            position: 'relative',
            height: '220px',
            backgroundColor: '#000',
            borderRadius: '12px',
            border: '2px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '140px',
              height: '140px',
              border: '3px dashed var(--primary)',
              borderRadius: '8px',
              position: 'relative'
            }}>
              {/* Scan laser animation */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                backgroundColor: 'var(--primary)',
                boxShadow: '0 0 10px var(--primary)',
                animation: 'scanLine 2s linear infinite'
              }}></div>
            </div>
            
            <p style={{ position: 'absolute', bottom: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              SIMULATED CAMERA STREAM ACTIVE
            </p>
          </div>

          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label className="form-label">QR Code Payload / Code Signature</label>
              <textarea
                rows={3}
                required
                className="form-input"
                style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                placeholder='{"reservation_id": 1, "field_id": 1, ...}'
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }} disabled={loading}>
              {loading ? 'Decrypting signature...' : 'Scan & Verify Ticket'}
            </button>
          </form>

          {/* Keyframe animation styling */}
          <style>{`
            @keyframes scanLine {
              0% { top: 0%; }
              50% { top: 100%; }
              100% { top: 0%; }
            }
          `}</style>
        </div>

        {/* Verification Result / Demos */}
        <div>
          {/* Result Render */}
          {scanResult && (
            <div className="glass" style={{ padding: '2.5rem', marginBottom: '1.5rem', borderColor: 'var(--primary)' }}>
              <h3 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={24} color="var(--primary)" /> Signature Authenticated
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Reservation ID:</span>
                  <strong style={{ color: '#fff' }}>#{scanResult.reservation?.id}</strong>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Player Name:</span>
                  <strong style={{ color: '#fff' }}>{scanResult.user?.name}</strong>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Field:</span>
                  <strong style={{ color: 'var(--primary)' }}>{scanResult.field?.name}</strong>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Time Slot:</span>
                  <strong style={{ color: '#fff' }}>{scanResult.reservation?.time} ({scanResult.reservation?.duration} hrs)</strong>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Payment Status:</span>
                  <span className="badge badge-success">PAID</span>
                </div>
              </div>

              {scanResult.reservation?.status === 'attended' ? (
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  color: '#60a5fa',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '0.9rem'
                }}>
                  Player is already checked in.
                </div>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleConfirmCheckIn}>
                  Confirm Attendance & Admit Entry
                </button>
              )}
            </div>
          )}

          {errorResult && (
            <div className="glass" style={{ padding: '2rem', marginBottom: '1.5rem', borderColor: 'var(--danger)' }}>
              <h3 style={{ color: 'var(--danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={24} /> Ticket Verification Failed
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {errorResult}
              </p>
            </div>
          )}

          {/* Quick Demos Box */}
          <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Test QR Payloads</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Select a reservation below to auto-load its valid security signature.
            </p>

            {demoLoading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading tickets...</p>
            ) : demoReservations.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No bookings created yet. Go to fields to create one.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {demoReservations.map(res => (
                  <button
                    key={res.id}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'space-between', padding: '0.6rem 1rem', fontSize: '0.8rem' }}
                    onClick={() => loadDemoQr(res.qr_code)}
                  >
                    <span>{res.field?.name} (#{res.id})</span>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Load payload</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrScannerPage;
