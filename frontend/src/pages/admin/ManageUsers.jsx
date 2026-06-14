import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { Users, Shield, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await client.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user directories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await client.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        toast.success(`User role successfully changed to ${newRole}!`);
        // Refresh local state
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user role.");
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>
          Manage Users & Roles
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Audit user accounts and assign operational roles (Guard, Admin, Organization, Player)</p>
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
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Current Role</th>
                <th>Assign Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.phone || 'N/A'}</td>
                  <td>
                    <span className={`badge ${
                      u.role === 'admin' ? 'badge-success' : 
                      u.role === 'guard' ? 'badge-info' : 
                      u.role === 'organization' ? 'badge-pending' : 
                      'badge-info'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-input"
                      style={{ width: '150px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="user">User / Player</option>
                      <option value="guard">Guard</option>
                      <option value="organization">Organization</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
