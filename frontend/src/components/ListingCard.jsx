import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import styles from './ListingCard.module.css';

export default function ListingCard({ listing, onBought }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    api.get(`/books/${listing.bookId}`).then(res => setBook(res.data));
  }, [listing.bookId]);

  const handleBuy = async () => {
    if (!user) { navigate('/login'); return; }
    setBuying(true);
    try {
      const res = await api.post(`/marketplace/listings/${listing.id}/buy`);
      if (onBought) onBought(listing.id);
      navigate(`/orders/${res.data.id}`);
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className={styles.card} data-testid={`listing-card-${listing.id}`}>
      <div className={styles.header}>
        <div className={styles.title} data-testid={`listing-title-${listing.id}`}>
          {book?.title || 'Loading...'}
        </div>
        <span className={`${styles.condition} ${styles[listing.condition]}`}
              data-testid={`listing-condition-badge-${listing.id}`}>
          {listing.condition.replace('_', ' ')}
        </span>
      </div>
      <div className={styles.seller}>by {book?.author || '...'}</div>
      <div className={styles.footer}>
        <span className={styles.price} data-testid={`listing-price-${listing.id}`}>
          ${listing.price.toFixed(2)}
        </span>
        {user && user.userId !== listing.sellerId && (
          <button className={styles.buyBtn} data-testid={`listing-buy-${listing.id}`}
                  onClick={handleBuy} disabled={buying}>
            {buying ? 'Buying...' : 'Buy'}
          </button>
        )}
      </div>
    </div>
  );
}
