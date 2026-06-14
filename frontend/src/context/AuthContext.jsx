import React, { createContext, useState, useEffect } from 'react';
import client from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('np_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await client.get('/profile');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('np_user', JSON.stringify(res.data.data));
          }
        } catch (error) {
          console.error("Failed to load user profile:", error);
          logoutState();
        }
      }
      setLoading(false);
    };

    fetchUser();

    // Listen to global logout event triggered by interceptor
    const handleLogoutEvent = () => {
      logoutState();
    };
    window.addEventListener('auth_logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('auth_logout', handleLogoutEvent);
    };
  }, [token]);

  const logoutState = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('np_token');
    localStorage.removeItem('np_user');
  };

  const login = async (email, password) => {
    const res = await client.post('/login', { email, password });
    if (res.data.success) {
      const { token: userToken, user: userData } = res.data.data;
      localStorage.setItem('np_token', userToken);
      localStorage.setItem('np_user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
    }
    return res.data;
  };

  const register = async (name, email, phone, role, password, password_confirmation) => {
    const res = await client.post('/register', {
      name,
      email,
      phone,
      role,
      password,
      password_confirmation,
    });
    if (res.data.success) {
      const { token: userToken, user: userData } = res.data.data;
      localStorage.setItem('np_token', userToken);
      localStorage.setItem('np_user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await client.post('/logout');
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      logoutState();
    }
  };

  const updateProfile = async (name, phone, avatar) => {
    const res = await client.put('/profile', { name, phone, avatar });
    if (res.data.success) {
      setUser(res.data.data);
      localStorage.setItem('np_user', JSON.stringify(res.data.data));
    }
    return res.data;
  };

  const changePassword = async (current_password, new_password, new_password_confirmation) => {
    const res = await client.post('/change-password', {
      current_password,
      new_password,
      new_password_confirmation,
    });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      isAdmin: user?.role === 'admin',
      isGuard: user?.role === 'guard',
      isOrganization: user?.role === 'organization',
      isUser: user?.role === 'user',
    }}>
      {children}
    </AuthContext.Provider>
  );
};
