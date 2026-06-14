import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await client.post('/forgot-password', { email });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        toast.success("Instructions sent!");
      } else {
        setErrorMsg(res.data.message || 'Error occurred.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit request.');
      toast.error("Failed to process.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: 'calc(100vh - 150px)', padding: '2rem 1rem' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🏟️</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff', marginTop: '1rem', marginBottom: '0.25rem' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>We'll send recovery details to your email address</p>
        </div>

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: 'var(--primary)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--danger)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', marginTop: '1.5rem' }}
            disabled={loading}
          >
            {loading ? 'Sending Reset Link...' : 'Send Recovery Email'}
          </button>
        </form>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '1.5rem', textAlign: 'center' }}>
          Back to{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
            Login page
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
