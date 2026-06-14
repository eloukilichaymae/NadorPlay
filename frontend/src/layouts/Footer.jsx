import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="glass" style={{
      borderRadius: '0',
      borderBottom: 'none',
      borderInline: 'none',
      marginTop: 'auto',
      padding: '3rem 2rem 1.5rem',
      backgroundColor: 'rgba(5, 5, 5, 0.9)',
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2.5rem',
        textAlign: 'left',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏟️</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
              Nador<span style={{ color: '#10b981' }}>Play</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Municipal sports field reservation and management platform for Nador Municipality. Enabling active communities.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <li><Link to="/fields" style={footerLinkStyle}>Browse Fields</Link></li>
            <li><Link to="/register" style={footerLinkStyle}>Register Account</Link></li>
            <li><Link to="/login" style={footerLinkStyle}>Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1rem' }}>Municipality Office</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>
            Boulevard Prince Sidi Mohammed<br />
            Nador 62000, Morocco<br />
            Email: contact@nadorplay.ma<br />
            Phone: +212 536 606 000
          </p>
        </div>
      </div>

      <div className="container" style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <p>&copy; {new Date().getFullYear()} NadorPlay - Municipality of Nador. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="#" style={footerLinkStyle}>Privacy Policy</a>
          <a href="#" style={footerLinkStyle}>Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

const footerLinkStyle = {
  color: 'var(--text-muted)',
  textDecoration: 'none',
  transition: 'var(--transition)'
};

export default Footer;
