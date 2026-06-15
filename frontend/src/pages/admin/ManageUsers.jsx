import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { Users, Shield, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await client.get(`/admin/users?page=${pageNumber}`);
      if (res.data.success) {
        setUsers(res.data.data.data || []);
        setPage(res.data.data.current_page || 1);
        setTotalPages(res.data.data.last_page || 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user directories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

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

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0 0.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Page {page} of {totalPages}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            Next
          </button>
        </div>
      </div>
    );
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
        <>
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
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default ManageUsers;
