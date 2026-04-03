import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './BookCard.module.css';

export default function BookCard({ book }) {
  const { user } = useAuth();
  const { addItem } = useCart();

  const handleAdd = async (e) => {
    e.preventDefault();
    await addItem(book.id);
  };

  return (
    <Link to={`/books/${book.id}`} className={styles.card} data-testid={`book-card-${book.id}`}>
      <div className={styles.cover}>📖</div>
      <div className={styles.body}>
        <span className={styles.genre} data-testid={`book-genre-${book.id}`}>{book.genre}</span>
        <div className={styles.title} data-testid={`book-title-${book.id}`}>{book.title}</div>
        <div className={styles.author} data-testid={`book-author-${book.id}`}>{book.author}</div>
        <div className={styles.footer}>
          <span className={styles.price} data-testid={`book-price-${book.id}`}>
            ${(book.price * 1.1).toFixed(2)}
          </span>
          {user && book.stock >= 0 && (
            <button
              className={styles.addBtn}
              data-testid={`add-to-cart-${book.id}`}
              onClick={handleAdd}
            >
              Add to Cart
            </button>
          )}
          {book.stock === 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }} data-testid={`out-of-stock-${book.id}`}>
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
