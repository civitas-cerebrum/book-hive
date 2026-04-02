import { Link } from 'react-router-dom';
import styles from './OrderCard.module.css';

export default function OrderCard({ order }) {
  const date = new Date(order.purchasedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const statusClass = order.status === 'RETURNED' ? styles.returned : styles.completed;

  return (
    <Link to={`/orders/${order.id}`} className={styles.card} data-testid={`order-card-${order.id}`}>
      <div className={styles.left}>
        <div className={styles.orderId}>Order #{order.id.slice(-8)}</div>
        <div className={styles.date}>{date}</div>
        <div>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
      </div>
      <div className={styles.right}>
        <span className={styles.total}>${order.totalPrice.toFixed(2)}</span>
        <span className={`${styles.statusBadge} ${statusClass}`} data-testid={`order-status-${order.id}`}>
          {order.status}
        </span>
      </div>
    </Link>
  );
}
