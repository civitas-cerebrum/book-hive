import { useState, useEffect } from 'react';
import api from '../services/api';
import ListingCard from '../components/ListingCard';
import styles from './MarketplacePage.module.css';

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/marketplace').then(res => setListings(res.data)).finally(() => setLoading(false));
  }, []);

  const handleBought = (id) => {
    setListings(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className={styles.container} data-testid="marketplace-page">
      <h1 className={styles.title}>Marketplace</h1>
      {loading ? (
        <div data-testid="loading">Loading...</div>
      ) : listings.length === 0 ? (
        <div className={styles.empty} data-testid="no-listings">No listings available</div>
      ) : (
        <div className={styles.grid}>
          {listings.map(l => <ListingCard key={l.id} listing={l} onBought={handleBought} />)}
        </div>
      )}
    </div>
  );
}
