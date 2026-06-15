import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const EditField = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [surface, setSurface] = useState('Natural Grass');
  const [dimensions, setDimensions] = useState('100x60m');
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [status, setStatus] = useState('available');
  
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchField = async () => {
      try {
        const res = await client.get(`/fields/${id}`);
        if (res.data.success) {
          const field = res.data.data;
          setName(field.name);
          setLocation(field.location);
          setDescription(field.description || '');
          setPrice(field.price);
          setSurface(field.surface);
          setDimensions(field.dimensions);
          setExistingImage(field.image || '');
          setStatus(field.status);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load field details.");
      } finally {
        setLoading(false);
      }
    };
    fetchField();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('name', name);
    formData.append('location', location);
    formData.append('description', description);
    formData.append('price', parseFloat(price));
    formData.append('surface', surface);
    formData.append('dimensions', dimensions);
    formData.append('status', status);
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await client.post(`/fields/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        toast.success("Field updated successfully!");
        navigate('/admin/fields');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update field.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '50vh' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <button className="btn btn-secondary" style={{ marginBottom: '2rem' }} onClick={() => navigate('/admin/fields')}>
        <ArrowLeft size={16} /> Back to Fields
      </button>

      <div className="glass" style={{ padding: '2.5rem', maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ color: '#fff', marginBottom: '2rem' }}>Edit Sports Field Details</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Field Name</label>
              <input
                type="text"
                required
                className="form-input"
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
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Upload New Image</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={(e) => setImage(e.target.files[0])}
              />
              {existingImage && !image && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Has active image. Uploading a new one will replace it.
                </span>
              )}
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '0.5rem', marginTop: '1.5rem', padding: '0.8rem' }} disabled={saveLoading}>
            <Save size={18} /> {saveLoading ? 'Updating details...' : 'Save Field'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditField;
