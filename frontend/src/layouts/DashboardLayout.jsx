import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Map, 
  PlusCircle, 
  CalendarCheck, 
  Users, 
  MessageSquare, 
  ScanQrCode, 
  Clock, 
  UserCheck, 
  Settings, 
  Bell, 
  CreditCard,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getMenuLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
          { name: 'Manage Fields', path: '/admin/fields', icon: <Map size={20} /> },
          { name: 'Add Field', path: '/admin/fields/add', icon: <PlusCircle size={20} /> },
          { name: 'Manage Bookings', path: '/admin/reservations', icon: <CalendarCheck size={20} /> },
          { name: 'Manage Users', path: '/admin/users', icon: <Users size={20} /> },
          { name: 'Manage Reviews', path: '/admin/reviews', icon: <MessageSquare size={20} /> },
        ];
      case 'guard':
        return [
          { name: 'Dashboard', path: '/guard', icon: <LayoutDashboard size={20} /> },
          { name: 'QR Scanner', path: '/guard/scan', icon: <ScanQrCode size={20} /> },
          { name: 'Daily Attendance', path: '/guard/attendance', icon: <UserCheck size={20} /> },
        ];
      case 'organization':
        return [
          { name: 'Dashboard', path: '/organization', icon: <LayoutDashboard size={20} /> },
          { name: 'Subscriptions', path: '/organization/subscriptions', icon: <CreditCard size={20} /> },
          { name: 'Training Sessions', path: '/organization/sessions', icon: <Clock size={20} /> },
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

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', position: 'relative' }}>
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
          width: '260px',
          borderRadius: '0',
          borderTop: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          padding: '2rem 1rem',
          backgroundColor: 'rgba(10, 10, 10, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          transition: 'var(--transition)'
        }}
        id="dashboard-sidebar"
      >
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
      </aside>

      {/* Main Panel Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          #dashboard-sidebar {
            position: fixed;
            top: 70px;
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
