import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [books, setBooks] = useState({});

  useEffect(() => {
    api.get('/marketplace').then(res => {
      const mine = res.data.filter(l => l.sellerId === user?.userId);
      setListings(mine);
      mine.forEach(l => {
        if (!books[l.bookId]) {
          api.get(`/books/${l.bookId}`).then(r =>
            setBooks(prev => ({ ...prev, [l.bookId]: r.data })));
        }
      });
    });
  }, [user]);

  const handleCancel = async (id) => {
    await api.delete(`/marketplace/listings/${id}`);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className={styles.container} data-testid="profile-page">
      <h1 className={styles.title} data-testid="profile-username">{user?.username}</h1>
      <p className={styles.email} data-testid="profile-email">{user?.email}</p>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '16px', marginBottom: '24px', border: '1px solid var(--border)' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Balance</div>
        <div style={{ color: 'var(--accent)', fontSize: '28px', fontWeight: 700 }} data-testid="profile-balance">
          ${user?.balance?.toFixed(2) ?? '0.00'}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>My Listings</h2>
        {listings.length === 0 ? (
          <p className={styles.empty} data-testid="no-listings">No active listings</p>
        ) : (
          <div className={styles.listings}>
            {listings.map(l => (
              <div key={l.id} className={styles.listing} data-testid={`my-listing-${l.id}`}>
                <div className={styles.listingInfo}>
                  <div className={styles.listingTitle}>{books[l.bookId]?.title || '...'}</div>
                  <div className={styles.listingMeta}>
                    {l.condition.replace('_', ' ')} - ${l.price.toFixed(2)} - {l.status}
                  </div>
                </div>
                {l.status === 'ACTIVE' && (
                  <button className={styles.cancelBtn} data-testid={`cancel-listing-${l.id}`}
                          onClick={() => handleCancel(l.id)}>
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
