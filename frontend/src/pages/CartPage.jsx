import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import CartItemRow from '../components/CartItemRow';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { items, fetchCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [books, setBooks] = useState({});

  useEffect(() => { fetchCart(); }, [fetchCart]);

  useEffect(() => {
    items.forEach(item => {
      if (!books[item.bookId]) {
        api.get(`/books/${item.bookId}`).then(res =>
          setBooks(prev => ({ ...prev, [item.bookId]: res.data })));
      }
    });
  }, [items]);

  const total = items.reduce((sum, item) => {
    const book = books[item.bookId];
    return sum + (book ? book.price * item.quantity : 0);
  }, 0);

  const handleCheckout = async () => {
    setChecking(true);
    setError('');
    try {
      const res = await api.post('/orders');
      navigate(`/orders/${res.data.id}`);
    } catch (e) {
      setError(e.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.container} data-testid="cart-page">
        <h1 className={styles.title}>Shopping Cart</h1>
        <div className={styles.empty} data-testid="cart-empty">Your cart is empty</div>
      </div>
    );
  }

  return (
    <div className={styles.container} data-testid="cart-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={styles.title}>Shopping Cart</h1>
        <button className={styles.clearBtn} data-testid="cart-clear" onClick={clearCart}>Clear cart</button>
      </div>
      <div className={styles.items}>
        {items.map(item => <CartItemRow key={item.id} item={item} />)}
      </div>
      <div className={styles.footer}>
        <div className={styles.total}>
          Total: <span className={styles.totalAmount} data-testid="cart-total">${total.toFixed(2)}</span>
        </div>
        <button className={styles.checkoutBtn} data-testid="checkout-btn"
                onClick={handleCheckout} disabled={checking}>
          {checking ? 'Processing...' : 'Checkout'}
        </button>
      </div>
      {error && (
        <div data-testid="checkout-error" role="alert" style={{
          marginTop: 12, padding: 12, borderRadius: 6,
          background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
