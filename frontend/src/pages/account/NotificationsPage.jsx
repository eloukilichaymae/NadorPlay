import React, { useContext } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import { Bell, Check, Trash2, MailOpen } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, loading, markAsRead, markAllAsRead } = useContext(NotificationContext);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <div className="flex-between" style={{ marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Keep track of reservation statuses, payments, and academy subscriptions</p>
        </div>
        {notifications.some(n => !n.read_at) && (
          <button className="btn btn-secondary" onClick={markAllAsRead} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
            <MailOpen size={16} /> Mark all as read
          </button>
        )}
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
      ) : notifications.length === 0 ? (
        <div className="glass text-center" style={{ padding: '4rem 2rem' }}>
          <Bell size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Inbox is Empty</h3>
          <p style={{ color: 'var(--text-muted)' }}>You will receive notifications here when your bookings are confirmed, modified, or scanned.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((notif) => {
            const isRead = !!notif.read_at;
            return (
              <div 
                key={notif.id} 
                className="glass" 
                style={{ 
                  padding: '1.25rem 1.5rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderColor: isRead ? 'var(--border-color)' : 'rgba(16, 185, 129, 0.3)',
                  backgroundColor: isRead ? 'rgba(18, 18, 18, 0.4)' : 'rgba(16, 185, 129, 0.03)'
                }}
              >
                <div style={{ flex: 1, marginRight: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: isRead ? 'transparent' : 'var(--primary)',
                      display: 'inline-block'
                    }}></span>
                    <strong style={{ color: isRead ? 'var(--text-main)' : '#fff', fontSize: '1rem' }}>
                      {notif.title}
                    </strong>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', paddingLeft: '1.25rem' }}>
                    {notif.message}
                  </p>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>

                {!isRead && (
                  <button 
                    onClick={() => markAsRead(notif.id)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem', borderRadius: '50%', color: 'var(--primary)', border: 'none', background: 'rgba(16, 185, 129, 0.1)' }}
                    title="Mark as Read"
                  >
                    <Check size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
