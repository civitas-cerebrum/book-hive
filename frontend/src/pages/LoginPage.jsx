import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} data-testid="login-page">
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>Sign in to your BookHive account</p>

      {error && <div className={styles.error} data-testid="login-error">{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit} data-testid="login-form">
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" data-testid="login-email" value={email}
                 onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" data-testid="login-password" value={password}
                 onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className={styles.submitBtn} data-testid="login-submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className={styles.link} style={{ marginTop: '16px' }}>
        Don't have an account? <Link to="/signup" data-testid="signup-link">Sign up</Link>
      </p>
    </div>
  );
}
