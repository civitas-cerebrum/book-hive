import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './CreateListingPage.module.css';

const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [bookId, setBookId] = useState('');
  const [condition, setCondition] = useState('LIKE_NEW');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/books?size=100').then(res => setBooks(res.data.content));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/marketplace/listings', { bookId, condition, price: parseFloat(price) });
      navigate('/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} data-testid="create-listing-page">
      <h1 className={styles.title}>Sell a Book</h1>
      {error && <div className={styles.error} data-testid="listing-error">{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="book">Book</label>
          <select id="book" data-testid="listing-book-select" value={bookId}
                  onChange={e => setBookId(e.target.value)} required>
            <option value="">Select a book...</option>
            {books.map(b => <option key={b.id} value={b.id}>{b.title} - {b.author}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="condition">Condition</label>
          <select id="condition" data-testid="listing-condition" value={condition}
                  onChange={e => setCondition(e.target.value)}>
            {CONDITIONS.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="price">Price ($)</label>
          <input id="price" type="number" step="0.01" min="0.01" data-testid="listing-price"
                 value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <button type="submit" className={styles.submitBtn} data-testid="listing-create" disabled={loading}>
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
}
