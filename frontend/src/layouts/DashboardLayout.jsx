import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import {
  LayoutDashboard,
  Map,
  PlusCircle,
  CalendarCheck,
  Users,
  MessageSquare,
  Settings,
  Bell,
  Building2,
  Menu,
  X,
  LogOut
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount = 0 } = useContext(NotificationContext) ?? {};
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getMenuLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
          { name: 'Manage Fields', path: '/admin/fields', icon: <Map size={20} /> },
          { name: 'Add Field', path: '/admin/fields/add', icon: <PlusCircle size={20} /> },
          { name: 'Manage Bookings', path: '/admin/reservations', icon: <CalendarCheck size={20} /> },
          { name: 'Subscriptions', path: '/admin/subscriptions', icon: <Building2 size={20} /> },
          { name: 'Manage Users', path: '/admin/users', icon: <Users size={20} /> },
          { name: 'Manage Reviews', path: '/admin/reviews', icon: <MessageSquare size={20} /> },
        ];
      default: // user
        return [
          { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
          { name: 'My Bookings', path: '/reservations', icon: <CalendarCheck size={20} /> },
          { name: 'Notifications', path: '/account/notifications', icon: <Bell size={20} /> },
          { name: 'Profile Settings', path: '/account', icon: <Settings size={20} /> },
        ];
    }
  };

  const menuLinks = getMenuLinks();
  const isAdmin = user?.role === 'admin';

  return (
    <div style={{ display: 'flex', minHeight: isAdmin ? '100vh' : 'calc(100vh - 70px)', position: 'relative' }}>
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99,
          background: 'var(--primary)',
          color: '#052e16',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
          cursor: 'pointer'
        }}
        className="mobile-sidebar-btn"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Panel */}
      <aside 
        className={`glass ${sidebarOpen ? 'active' : ''}`}
        style={{
          position: 'sticky',
          top: isAdmin ? '0' : '70px',
          height: isAdmin ? '100vh' : 'calc(100vh - 70px)',
          flexShrink: 0,
          width: '260px',
          borderRadius: '0',
          borderTop: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          padding: '2rem 1rem',
          backgroundColor: 'rgba(10, 10, 10, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '2rem',
          transition: 'var(--transition)'
        }}
        id="dashboard-sidebar"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Brand/Logo for Sidebar */}
          <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem' }}>🏟️</span>
              <span style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                color: '#fff',
                letterSpacing: '-0.5px'
              }}>
                Nador<span style={{ color: '#10b981' }}>Play</span>
              </span>
            </Link>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', paddingLeft: '0.75rem', marginBottom: '1rem' }}>
              {user?.role} Portal
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {menuLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      fontWeight: isActive ? '600' : '500',
                      transition: 'var(--transition)'
                    }}
                    className="sidebar-link"
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Menu for Administrator */}
        {isAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            {/* Notifications */}
            <Link
              to="/account/notifications"
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: location.pathname === '/account/notifications' ? '#fff' : 'var(--text-muted)',
                backgroundColor: location.pathname === '/account/notifications' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                fontWeight: location.pathname === '/account/notifications' ? '600' : '500',
                transition: 'var(--transition)'
              }}
              className="sidebar-link"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Bell size={20} />
                <span>Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span style={{
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

            {/* Profile Settings */}
            <Link
              to="/account"
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: location.pathname === '/account' ? '#fff' : 'var(--text-muted)',
                backgroundColor: location.pathname === '/account' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                fontWeight: location.pathname === '/account' ? '600' : '500',
                transition: 'var(--transition)'
              }}
              className="sidebar-link"
            >
              <Settings size={20} />
              <span>Profile Settings</span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(239, 68, 68, 0.08)',
                color: 'var(--danger)',
                cursor: 'pointer',
                fontWeight: '600',
                width: '100%',
                textAlign: 'left',
                marginTop: '0.5rem',
                transition: 'var(--transition)'
              }}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Panel Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          #dashboard-sidebar {
            position: fixed;
            top: ${isAdmin ? '0' : '70px'};
            bottom: 0;
            left: -260px;
            z-index: 90;
            background: var(--bg-sidebar) !important;
            width: 260px;
          }
          #dashboard-sidebar.active {
            left: 0;
          }
          .mobile-sidebar-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
