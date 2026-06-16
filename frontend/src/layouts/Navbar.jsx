import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { Menu, X, Bell, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    setProfileOpen(false);
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin';
      default: return '/dashboard';
    }
  };

  // Admins get no top navbar — they use the sidebar
  if (user && user.role === 'admin') return null;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={{
        borderRadius: '0',
        borderTop: 'none',
        borderInline: 'none',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0 2rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🏟️</span>
          <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>
            Nador<span style={{ color: '#10b981' }}>Play</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Link
            to="/fields"
            style={{
              ...navLinkBase,
              color: isActive('/fields') ? '#fff' : 'var(--text-muted)',
              background: isActive('/fields') ? 'rgba(255,255,255,0.06)' : 'transparent',
            }}
          >
            Explore Fields
          </Link>

          {loading && !user ? (
            <div style={{ width: '120px' }} />
          ) : user ? (
            <>
              <Link
                to={getDashboardPath()}
                style={{
                  ...navLinkBase,
                  color: isActive(getDashboardPath()) ? '#fff' : 'var(--text-muted)',
                  background: isActive(getDashboardPath()) ? 'rgba(255,255,255,0.06)' : 'transparent',
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/reservations"
                style={{
                  ...navLinkBase,
                  color: isActive('/reservations') ? '#fff' : 'var(--text-muted)',
                  background: isActive('/reservations') ? 'rgba(255,255,255,0.06)' : 'transparent',
                }}
              >
                My Bookings
              </Link>

              {/* Divider */}
              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }} />

              {/* Notifications Bell */}
              <Link to="/account/notifications" style={{ position: 'relative', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0.4rem', borderRadius: '8px', transition: 'var(--transition)' }} className="nav-icon-btn">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '2px', right: '2px',
                    background: '#ef4444', color: 'white',
                    borderRadius: '50%', minWidth: '16px', height: '16px',
                    fontSize: '0.6rem', fontWeight: '700',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: profileOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px', padding: '0.4rem 0.75rem 0.4rem 0.5rem',
                    cursor: 'pointer', color: '#fff', transition: 'var(--transition)'
                  }}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: '700', color: '#052e16', flexShrink: 0
                  }}>
                    {user.name?.[0]?.toUpperCase() || <UserIcon size={14} />}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </span>
                  <ChevronDown size={14} color="var(--text-muted)" style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'rgba(18, 18, 18, 0.98)', border: '1px solid var(--border-color)',
                    borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(20px)', minWidth: '200px', overflow: 'hidden', zIndex: 100,
                    animation: 'fadeIn 0.15s ease-out'
                  }}>
                    <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(16,185,129,0.04)' }}>
                      <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.875rem' }}>{user.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1px' }}>{user.email}</div>
                    </div>
                    <div style={{ padding: '0.5rem' }}>
                      <Link to="/account" onClick={() => setProfileOpen(false)} style={dropdownItemStyle}>
                        <UserIcon size={15} /> Profile Settings
                      </Link>
                      <Link to="/account/notifications" onClick={() => setProfileOpen(false)} style={dropdownItemStyle}>
                        <Bell size={15} />
                        <span>Notifications</span>
                        {unreadCount > 0 && <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', borderRadius: '9999px', padding: '1px 6px', fontSize: '0.65rem', fontWeight: '700' }}>{unreadCount}</span>}
                      </Link>
                    </div>
                    <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                      <button onClick={handleLogout} style={{ ...dropdownItemStyle, color: '#f87171', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.875rem', height: '36px' }}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.875rem', height: '36px' }}>
                Sign Up Free
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="mobile-toggle"
          style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.4rem' }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          className="mobile-drawer"
          style={{
            position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0,
            background: 'rgba(8, 8, 8, 0.98)', backdropFilter: 'blur(20px)',
            zIndex: 49, padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
            animation: 'fadeIn 0.2s ease-out', overflowY: 'auto'
          }}
        >
          <Link to="/fields" style={mobileItemStyle} onClick={() => setIsOpen(false)}>Explore Fields</Link>

          {user ? (
            <>
              <Link to={getDashboardPath()} style={mobileItemStyle} onClick={() => setIsOpen(false)}>Dashboard</Link>
              <Link to="/reservations" style={mobileItemStyle} onClick={() => setIsOpen(false)}>My Bookings</Link>
              <Link to="/account/notifications" style={mobileItemStyle} onClick={() => setIsOpen(false)}>
                Notifications {unreadCount > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '9999px', padding: '1px 6px', fontSize: '0.7rem', marginLeft: '0.5rem' }}>{unreadCount}</span>}
              </Link>
              <Link to="/account" style={mobileItemStyle} onClick={() => setIsOpen(false)}>Profile Settings</Link>
              <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button onClick={handleLogout} style={{ ...mobileItemStyle, background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', width: '100%', cursor: 'pointer', textAlign: 'left', borderRadius: '10px', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }} onClick={() => setIsOpen(false)}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }} onClick={() => setIsOpen(false)}>
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {profileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 49 }}
          onClick={() => setProfileOpen(false)}
        />
      )}

      <style>{`
        @media (max-width: 1024px) {
          .desktop-menu { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
        @media (min-width: 1025px) {
          .mobile-drawer { display: none !important; }
        }
        .nav-icon-btn:hover { background: rgba(255,255,255,0.06); color: #fff !important; }
      `}</style>
    </>
  );
};

const navLinkBase = {
  textDecoration: 'none',
  fontSize: '0.875rem',
  fontWeight: '500',
  padding: '0.4rem 0.75rem',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
};

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
  padding: '0.6rem 0.75rem',
  borderRadius: '8px',
  textDecoration: 'none',
  color: 'var(--text-muted)',
  fontSize: '0.875rem',
  fontWeight: '500',
  transition: 'all 0.15s ease',
  cursor: 'pointer',
};

const mobileItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.875rem 1.25rem',
  borderRadius: '10px',
  textDecoration: 'none',
  color: 'var(--text-main)',
  fontSize: '1rem',
  fontWeight: '500',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border-color)',
};

export default Navbar;
