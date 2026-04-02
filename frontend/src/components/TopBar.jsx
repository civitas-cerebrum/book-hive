import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './TopBar.module.css';

export default function TopBar() {
  const { items } = useCart();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggle-sidebar'));
  };

  return (
    <div className={styles.topbar} data-testid="topbar">
      <div className={styles.left}>
        <button className={styles.hamburger} data-testid="sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <span className={styles.logo}>BookHive</span>
      </div>
      <div className={styles.right}>
        <button className={styles.iconBtn} data-testid="mobile-search-btn" onClick={() => navigate('/')}>
          🔍
        </button>
        <button className={styles.iconBtn} data-testid="mobile-cart-btn" onClick={() => navigate('/cart')}>
          🛒
          {items.length > 0 && (
            <span className={styles.cartBadge} data-testid="cart-badge-mobile">{items.length}</span>
          )}
        </button>
      </div>
    </div>
  );
}
