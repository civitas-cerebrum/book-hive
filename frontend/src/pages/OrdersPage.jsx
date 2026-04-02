import { useState, useEffect } from 'react';
import api from '../services/api';
import OrderCard from '../components/OrderCard';
import styles from './OrdersPage.module.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(res => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.container} data-testid="orders-page">
      <h1 className={styles.title}>Your Orders</h1>
      {loading ? (
        <div data-testid="loading">Loading...</div>
      ) : orders.length === 0 ? (
        <div className={styles.empty} data-testid="no-orders">No orders yet</div>
      ) : (
        <div className={styles.list}>
          {orders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}
