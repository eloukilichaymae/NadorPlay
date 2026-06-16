import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { Star, Trash2, ShieldAlert, MessageSquare, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchReviews = async (p = 1) => {
    setLoading(true);
    try {
      const res = await client.get(`/admin/reviews?per_page=15&page=${p}`);
      if (res.data.success) {
        const data = res.data.data;
        setReviews(data.data || []);
        setPage(data.current_page || 1);
        setTotalPages(data.last_page || 1);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(1); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await client.delete(`/admin/reviews/${id}`);
      if (res.data.success) {
        toast.success('Review deleted successfully.');
        setReviews(prev => prev.filter(r => r.id !== id));
        setTotal(t => t - 1);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete review.');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MessageSquare size={32} color="var(--primary)" /> Manage Reviews
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Moderate public reviews, feedback ratings, and comments left by players
            {total > 0 && <span style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}>({total} total)</span>}
          </p>
        </div>
        <button
          onClick={() => fetchReviews(page)}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '4rem 0' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="glass text-center" style={{ padding: '4rem 2rem' }}>
          <ShieldAlert size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Reviews Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>No feedback reviews have been posted yet.</p>
        </div>
      ) : (
        <>
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
                    <td><strong style={{ color: 'var(--primary)' }}>{r.field?.name || '—'}</strong></td>
                    <td>
                      <div>
                        <span style={{ color: '#fff', fontWeight: '500' }}>{r.user?.name || 'Anonymous'}</span>
                        {r.user?.email && (
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.user.email}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ display: 'flex', color: '#fbbf24', gap: '1px' }}>
                          {[...Array(5)].map((_, idx) => (
                            <Star
                              key={idx}
                              size={13}
                              fill={idx < r.rating ? '#fbbf24' : 'none'}
                              color={idx < r.rating ? '#fbbf24' : '#4b5563'}
                            />
                          ))}
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.rating}/5</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <span style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem',
                        lineHeight: '1.4'
                      }}>
                        {r.comment || <em style={{ opacity: 0.5 }}>No comment</em>}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.6rem', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                        title="Delete Review"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => { const p = page - 1; setPage(p); fetchReviews(p); }}
                  disabled={page === 1}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >Previous</button>
                <button
                  onClick={() => { const p = page + 1; setPage(p); fetchReviews(p); }}
                  disabled={page === totalPages}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageReviews;
