import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { Menu, X, Bell, User as UserIcon, LogOut, Shield, MapPin, Calendar } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'guard': return '/guard';
      case 'organization': return '/organization';
      default: return '/dashboard';
    }
  };

  return (
    <nav className="glass" style={{
      borderRadius: '0',
      borderTop: 'none',
      borderInline: 'none',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(10, 10, 10, 0.8)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.75rem' }}>🏟️</span>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            color: '#fff',
            letterSpacing: '-0.5px'
          }}>
            Nador<span style={{ color: '#10b981' }}>Play</span>
          </span>
        </Link>
      </div>

      {/* Desktop Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-menu">
        <Link to="/fields" style={navLinkStyle}>Explore Fields</Link>
        {user ? (
          <>
            <Link to={getDashboardPath()} style={navLinkStyle}>Dashboard</Link>
            <Link to="/reservations" style={navLinkStyle}>My Bookings</Link>
            
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/account/notifications" style={{ color: 'var(--text-main)', position: 'relative' }}>
                <Bell size={22} style={{ cursor: 'pointer' }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: 'var(--danger)',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '0.65rem',
                    fontWeight: 'bold'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </Link>

              <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#fff' }}>
                {user.avatar ? (
                  <img src={user.avatar} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserIcon size={16} />
                  </div>
                )}
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user.name}</span>
              </Link>

              <button onClick={handleLogout} style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem'
              }} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>Create Account</Link>
          </div>
        )}
      </div>

      {/* Hamburger icon */}
      <div className="mobile-toggle" style={{ display: 'none', cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--bg-sidebar)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          zIndex: 100
        }}>
          <Link to="/fields" style={mobileNavLinkStyle} onClick={() => setIsOpen(false)}>Explore Fields</Link>
          {user ? (
            <>
              <Link to={getDashboardPath()} style={mobileNavLinkStyle} onClick={() => setIsOpen(false)}>Dashboard</Link>
              <Link to="/reservations" style={mobileNavLinkStyle} onClick={() => setIsOpen(false)}>My Bookings</Link>
              <Link to="/account/notifications" style={mobileNavLinkStyle} onClick={() => setIsOpen(false)}>Notifications ({unreadCount})</Link>
              <Link to="/account" style={mobileNavLinkStyle} onClick={() => setIsOpen(false)}>Profile Settings</Link>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} style={{
                background: 'none',
                border: 'none',
                color: 'var(--danger)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%' }} onClick={() => setIsOpen(false)}>Create Account</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

const navLinkStyle = {
  color: 'var(--text-muted)',
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: '500',
  transition: 'var(--transition)'
};

const mobileNavLinkStyle = {
  color: 'var(--text-main)',
  textDecoration: 'none',
  fontSize: '1.05rem',
  fontWeight: '600'
};

export default Navbar;
