import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ReturnCountdown from '../components/ReturnCountdown';
import styles from './OrderDetailPage.module.css';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [books, setBooks] = useState({});
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(res => {
      setOrder(res.data);
      res.data.items.forEach(item => {
        api.get(`/books/${item.bookId}`).then(r =>
          setBooks(prev => ({ ...prev, [item.bookId]: r.data })));
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const handleReturn = async () => {
    setReturning(true);
    try {
      const res = await api.post(`/orders/${id}/return`);
      setOrder(res.data);
    } finally {
      setReturning(false);
    }
  };

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (!order) return <div data-testid="not-found">Order not found</div>;

  const statusClass = order.status === 'RETURNED' ? styles.returned : styles.completed;
  const deadline = new Date(order.purchasedAt).getTime() + 600000;
  const canReturn = order.status === 'COMPLETED' && Date.now() < deadline;

  return (
    <div className={styles.container} data-testid="order-detail-page">
      <div className={styles.header}>
        <h1 className={styles.title}>Order #{order.id.slice(-8)}</h1>
        <span className={`${styles.status} ${statusClass}`} data-testid={`order-status-${order.id}`}>
          {order.status}
        </span>
      </div>

      <div className={styles.items}>
        {order.items.map((item, idx) => (
          <div key={idx} className={styles.item} data-testid={`order-item-${idx}`}>
            <div>
              <div className={styles.itemTitle}>{books[item.bookId]?.title || 'Loading...'}</div>
              <div className={styles.itemQty}>Qty: {item.quantity}</div>
            </div>
            <div className={styles.itemPrice}>${(item.priceAtPurchase * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.total}>
          Total: <span className={styles.totalAmount} data-testid="order-total">
            ${order.totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {order.status === 'COMPLETED' && (
        <div className={styles.returnSection}>
          <ReturnCountdown purchasedAt={order.purchasedAt} />
          {canReturn && (
            <button className={styles.returnBtn} data-testid={`return-order-${order.id}`}
                    onClick={handleReturn} disabled={returning}>
              {returning ? 'Returning...' : 'Return Order'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
