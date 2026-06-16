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
  LogOut,
  ChevronRight,
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
          { name: 'Dashboard',        path: '/admin',               icon: <LayoutDashboard size={18} />,  section: 'main' },
          { name: 'Manage Fields',    path: '/admin/fields',        icon: <Map size={18} />,              section: 'main' },
          { name: 'Add Field',        path: '/admin/fields/add',    icon: <PlusCircle size={18} />,       section: 'main' },
          { name: 'Manage Bookings',  path: '/admin/reservations',  icon: <CalendarCheck size={18} />,    section: 'operations' },
          { name: 'Subscriptions',    path: '/admin/subscriptions', icon: <Building2 size={18} />,        section: 'operations' },
          { name: 'Manage Users',     path: '/admin/users',         icon: <Users size={18} />,            section: 'operations' },
          { name: 'Manage Reviews',   path: '/admin/reviews',       icon: <MessageSquare size={18} />,    section: 'operations' },
        ];
      default:
        return [
          { name: 'Dashboard',        path: '/dashboard',               icon: <LayoutDashboard size={18} />, section: 'main' },
          { name: 'My Bookings',      path: '/reservations',            icon: <CalendarCheck size={18} />,   section: 'main' },
          { name: 'Notifications',    path: '/account/notifications',   icon: <Bell size={18} />,            section: 'main', badge: unreadCount },
          { name: 'Profile Settings', path: '/account',                 icon: <Settings size={18} />,        section: 'main' },
        ];
    }
  };

  const menuLinks = getMenuLinks();
  const isAdmin = user?.role === 'admin';

  // Group admin links by section
  const sections = isAdmin ? [
    { key: 'main',       label: 'Overview',    links: menuLinks.filter(l => l.section === 'main') },
    { key: 'operations', label: 'Operations',  links: menuLinks.filter(l => l.section === 'operations') },
  ] : [
    { key: 'main', label: null, links: menuLinks },
  ];

  return (
    <div style={{ display: 'flex', minHeight: isAdmin ? '100vh' : 'calc(100vh - 64px)', position: 'relative' }}>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 89, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 99,
          background: 'var(--primary)', color: '#052e16',
          border: 'none', borderRadius: '50%',
          width: '52px', height: '52px',
          display: 'none', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.5)',
          cursor: 'pointer', transition: 'var(--transition)'
        }}
        className="mobile-sidebar-btn"
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        id="dashboard-sidebar"
        className={sidebarOpen ? 'active' : ''}
        style={{
          position: 'sticky',
          top: isAdmin ? '0' : '64px',
          height: isAdmin ? '100vh' : 'calc(100vh - 64px)',
          flexShrink: 0,
          width: '256px',
          borderRadius: '0',
          borderTop: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          borderRight: '1px solid var(--border-color)',
          padding: '0',
          backgroundColor: 'rgba(8, 8, 8, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🏟️</span>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>
              Nador<span style={{ color: '#10b981' }}>Play</span>
            </span>
          </Link>
          {user && (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', fontWeight: '700', color: '#052e16', flexShrink: 0
              }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ color: 'var(--primary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>{user.role} Portal</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
          {sections.map(section => (
            <div key={section.key}>
              {section.label && (
                <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
                  {section.label}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {section.links.map((link) => {
                  const isActive = location.pathname === link.path ||
                    (link.path !== '/' && link.path !== '/admin' && link.path !== '/dashboard' && location.pathname.startsWith(link.path));
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setSidebarOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.6rem 0.875rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive ? '#fff' : 'var(--text-muted)',
                        backgroundColor: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                        fontWeight: isActive ? '600' : '500',
                        fontSize: '0.875rem',
                        transition: 'all 0.15s ease',
                        borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                        position: 'relative',
                      }}
                      className="sidebar-link"
                    >
                      <span style={{ color: isActive ? 'var(--primary)' : 'inherit', flexShrink: 0 }}>{link.icon}</span>
                      <span style={{ flex: 1 }}>{link.name}</span>
                      {link.badge > 0 && (
                        <span style={{ background: '#ef4444', color: '#fff', borderRadius: '9999px', minWidth: '18px', height: '18px', fontSize: '0.65rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                          {link.badge > 99 ? '99+' : link.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight size={14} color="var(--primary)" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0.875rem', borderRadius: '8px',
              border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
              background: 'rgba(239, 68, 68, 0.07)',
              color: '#f87171', fontWeight: '600', fontSize: '0.875rem',
              transition: 'all 0.15s ease',
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          #dashboard-sidebar {
            position: fixed !important;
            top: ${isAdmin ? '0' : '64px'} !important;
            bottom: 0;
            left: -280px;
            z-index: 90;
            width: 256px !important;
          }
          #dashboard-sidebar.active {
            left: 0 !important;
          }
          .mobile-sidebar-btn {
            display: flex !important;
          }
          main {
            padding: 1.25rem !important;
          }
        }
        .sidebar-link:hover {
          background: rgba(255,255,255,0.04) !important;
          color: #fff !important;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
