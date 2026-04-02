import { useState, useEffect } from 'react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import styles from './CartItemRow.module.css';

export default function CartItemRow({ item }) {
  const { updateItem, removeItem } = useCart();
  const [book, setBook] = useState(null);

  useEffect(() => {
    api.get(`/books/${item.bookId}`).then(res => setBook(res.data));
  }, [item.bookId]);

  if (!book) return null;

  return (
    <div className={styles.row} data-testid={`cart-item-${item.id}`}>
      <div className={styles.info}>
        <div className={styles.title} data-testid={`cart-item-title-${item.id}`}>{book.title}</div>
        <div className={styles.price} data-testid={`cart-item-price-${item.id}`}>
          ${(book.price * item.quantity).toFixed(2)}
        </div>
      </div>
      <div className={styles.controls}>
        <button className={styles.qtyBtn} data-testid={`cart-qty-minus-${item.id}`}
                onClick={() => updateItem(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
          -
        </button>
        <span className={styles.qty} data-testid={`cart-qty-${item.id}`}>{item.quantity}</span>
        <button className={styles.qtyBtn} data-testid={`cart-qty-plus-${item.id}`}
                onClick={() => updateItem(item.id, item.quantity + 1)}>
          +
        </button>
      </div>
      <button className={styles.removeBtn} data-testid={`cart-remove-${item.id}`}
              onClick={() => removeItem(item.id)}>
        Remove
      </button>
    </div>
  );
}
