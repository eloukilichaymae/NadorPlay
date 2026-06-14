import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { Star, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // We fetch fields first, then iterate or have a special endpoint. 
  // Let's call /admin/stats or just get fields and read their nested reviews, or search reviews.
  // Wait, let's look at what endpoints we have for reviews.
  // We have FieldController which returns fields with reviews, or we can fetch fields and gather reviews.
  // Let's fetch fields and build a list of all reviews from them.
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await client.get('/fields');
      if (res.data.success) {
        const allFields = res.data.data.data;
        const gatheredReviews = [];
        allFields.forEach(f => {
          if (f.reviews && f.reviews.length > 0) {
            f.reviews.forEach(r => {
              gatheredReviews.push({
                ...r,
                field_name: f.name
              });
            });
          }
        });
        setReviews(gatheredReviews);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await client.delete(`/admin/reviews/${id}`);
      if (res.data.success) {
        toast.success("Review deleted successfully.");
        // filter local state
        setReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete review.");
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>
          Manage Reviews
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Moderate public reviews, feedback ratings, and comments left by players</p>
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
      ) : reviews.length === 0 ? (
        <div className="glass text-center" style={{ padding: '4rem 2rem' }}>
          <ShieldAlert size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Reviews Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>No feedback reviews have been posted yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Author</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.field_name}</strong></td>
                  <td>{r.user?.name || 'Anonymous'}</td>
                  <td>
                    <div style={{ display: 'flex', color: '#fbbf24', gap: '2px' }}>
                      {[...Array(5)].map((_, idx) => (
                        <Star 
                          key={idx} 
                          size={12} 
                          fill={idx < r.rating ? '#fbbf24' : 'none'} 
                          color={idx < r.rating ? '#fbbf24' : '#4b5563'} 
                        />
                      ))}
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.comment}
                  </td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(r.id)}
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                      title="Delete Review"
                    >
                      <Trash2 size={16} />
                    </button>
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

export default ManageReviews;
