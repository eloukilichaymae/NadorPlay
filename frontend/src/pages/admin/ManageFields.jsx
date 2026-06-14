import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageFields = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const res = await client.get('/fields');
      if (res.data.success) {
        setFields(res.data.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load fields.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this field? This action is permanent.")) return;

    try {
      const res = await client.delete(`/fields/${id}`);
      if (res.data.success) {
        toast.success("Field deleted successfully.");
        fetchFields();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete field.");
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <div className="flex-between" style={{ marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>
            Manage Fields
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Create, update, and manage Nador municipal sports fields</p>
        </div>
        <Link to="/admin/fields/add" className="btn btn-primary" style={{ gap: '0.25rem' }}>
          <Plus size={18} /> Add New Field
        </Link>
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
      ) : fields.length === 0 ? (
        <div className="glass text-center" style={{ padding: '4rem 2rem' }}>
          <ShieldAlert size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Fields Seeded</h3>
          <p style={{ color: 'var(--text-muted)' }}>Get started by adding a sports pitch field to the system.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Location</th>
                <th>Surface</th>
                <th>Hourly Price</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.id}>
                  <td>
                    <img 
                      src={field.image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'} 
                      alt={field.name} 
                      style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                  </td>
                  <td><strong>{field.name}</strong></td>
                  <td>{field.location}</td>
                  <td>{field.surface}</td>
                  <td>{field.price} MAD</td>
                  <td>
                    <span className={`badge ${field.status === 'available' ? 'badge-success' : 'badge-danger'}`}>
                      {field.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <Link 
                        to={`/admin/fields/edit/${field.id}`} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem', border: 'none', background: 'rgba(255,255,255,0.05)' }}
                        title="Edit Field"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(field.id)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                        title="Delete Field"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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

export default ManageFields;
