import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './BookDetailPage.module.css';

export default function BookDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get(`/books/${id}`)
      .then(res => setBook(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    setAdding(true);
    try { await addItem(book.id); } finally { setAdding(false); }
  };

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (!book) return <div data-testid="not-found">Book not found</div>;

  return (
    <div className={styles.container} data-testid="book-detail-page">
      <div className={styles.header}>
        <div className={styles.cover}>📖</div>
        <div className={styles.info}>
          <h1 className={styles.title} data-testid="book-detail-title">{book.title}</h1>
          <p className={styles.author} data-testid="book-detail-author">{book.author}</p>
          <span className={styles.genre} data-testid="book-detail-genre">{book.genre}</span>
          <p className={styles.description} data-testid="book-detail-description">{book.description}</p>
          <div className={styles.price} data-testid="book-detail-price">${book.price.toFixed(2)}</div>
          <p className={styles.stock} data-testid="book-detail-stock">
            {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
          </p>
          {user && book.stock > 0 ? (
            <button className={styles.addBtn} data-testid="add-to-cart-detail"
                    onClick={handleAdd} disabled={adding}>
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          ) : book.stock === 0 ? (
            <span className={styles.outOfStock} data-testid="out-of-stock">Out of Stock</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
