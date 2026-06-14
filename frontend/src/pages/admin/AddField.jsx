import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const AddField = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [surface, setSurface] = useState('Natural Grass');
  const [dimensions, setDimensions] = useState('100x60m');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState('available');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await client.post('/fields', {
        name,
        location,
        description,
        price: parseFloat(price),
        surface,
        dimensions,
        image,
        status
      });

      if (res.data.success) {
        toast.success("Field added successfully!");
        navigate('/admin/fields');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create field.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <button className="btn btn-secondary" style={{ marginBottom: '2rem' }} onClick={() => navigate('/admin/fields')}>
        <ArrowLeft size={16} /> Back to Fields
      </button>

      <div className="glass" style={{ padding: '2.5rem', maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ color: '#fff', marginBottom: '2rem' }}>Add New Sports Field</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Field Name</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Marchica Lagoon Mini Turf"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location Address</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Corniche Marchica, Nador"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Field Description</label>
            <textarea
              rows={4}
              className="form-input"
              style={{ resize: 'vertical' }}
              placeholder="Provide information about stadium facilities, lighting, parking, rules, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid-cols-3" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Price (MAD / hr)</label>
              <input
                type="number"
                required
                min={0}
                className="form-input"
                placeholder="200"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Surface Material</label>
              <select className="form-input" value={surface} onChange={(e) => setSurface(e.target.value)}>
                <option value="Natural Grass">Natural Grass</option>
                <option value="Artificial Turf">Artificial Turf</option>
                <option value="Hybrid Grass">Hybrid Grass</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Dimensions</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="40x20m"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/... (optional)"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Operational Status</label>
              <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="available">Available (Accepting Reservations)</option>
                <option value="maintenance">Maintenance (Closed for works)</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '0.5rem', marginTop: '1.5rem', padding: '0.8rem' }} disabled={loading}>
            <Save size={18} /> {loading ? 'Saving field details...' : 'Save Field'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddField;
