import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ThemeToggle from './ThemeToggle';
import styles from './Sidebar.module.css';
import { useState, useEffect } from 'react';

const GENRES = ['Fiction', 'Sci-Fi', 'Non-Fiction', 'Biography', 'Fantasy', 'Mystery'];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(o => !o);
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, []);

  const navClass = ({ isActive }) =>
    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`;

  return (
    <>
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}
      <nav
        data-testid="sidebar"
        className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}
      >
        <div className={styles.logo} data-testid="logo">BookHive</div>

        <div className={styles.sectionLabel}>Browse</div>
        <NavLink to="/" className={navClass} data-testid="nav-all-books" onClick={() => setOpen(false)}>
          All Books
        </NavLink>
        <NavLink to="/marketplace" className={navClass} data-testid="nav-marketplace" onClick={() => setOpen(false)}>
          Marketplace
        </NavLink>

        <div className={styles.sectionLabel}>Categories</div>
        {GENRES.map(genre => (
          <NavLink
            key={genre}
            to={`/?genre=${genre}`}
            className={styles.navItem}
            data-testid={`genre-filter-${genre.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setOpen(false)}
          >
            {genre}
          </NavLink>
        ))}

        {user && (
          <>
            <div className={styles.sectionLabel}>Account</div>
            <div style={{ padding: '8px 12px', color: 'var(--accent)', fontSize: '14px', fontWeight: 700 }} data-testid="user-balance">
              Balance: ${user.balance?.toFixed(2) ?? '0.00'}
            </div>
            <NavLink to="/cart" className={navClass} data-testid="nav-cart" onClick={() => setOpen(false)}>
              Cart
              {items.length > 0 && (
                <span className={styles.badge} data-testid="cart-badge">{items.length}</span>
              )}
            </NavLink>
            <NavLink to="/orders" className={navClass} data-testid="nav-orders" onClick={() => setOpen(false)}>
              Orders
            </NavLink>
            <NavLink to="/marketplace/sell" className={navClass} data-testid="nav-sell" onClick={() => setOpen(false)}>
              Sell a Book
            </NavLink>
            <NavLink to="/profile" className={navClass} data-testid="nav-profile" onClick={() => setOpen(false)}>
              Profile
            </NavLink>
            <button className={styles.navItem} data-testid="logout-btn" onClick={() => { logout(); setOpen(false); }}>
              Logout
            </button>
          </>
        )}

        {!user && (
          <>
            <div className={styles.sectionLabel}>Account</div>
            <NavLink to="/login" className={navClass} data-testid="nav-login" onClick={() => setOpen(false)}>
              Login
            </NavLink>
            <NavLink to="/signup" className={navClass} data-testid="nav-signup" onClick={() => setOpen(false)}>
              Sign Up
            </NavLink>
          </>
        )}

        <div style={{ marginTop: '24px' }}>
          <ThemeToggle />
        </div>
      </nav>
    </>
  );
}
