import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await client.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchNotifications();
      // Poll every 30 seconds to fetch notifications (simulating real-time alerts)
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [token, user]);

  const markAsRead = async (id) => {
    try {
      const res = await client.post(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(prev =>
          prev.map(notif => notif.id === id ? { ...notif, read_at: new Date().toISOString() } : notif)
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await client.post('/notifications/read-all');
      if (res.data.success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
