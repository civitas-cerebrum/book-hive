import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './SignupPage.module.css';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateUsername = (name) => {
    if (name.includes('<script>')) return 'Username cannot contain script tags';
    if (name.length < 3) return 'Username must be at least 3 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await signup(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} data-testid="signup-page">
      <h1 className={styles.title}>Create an account</h1>
      <p className={styles.subtitle}>Join BookHive to start buying and selling books</p>

      {error && <div className={styles.error} data-testid="signup-error">{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit} data-testid="signup-form">
        <div className={styles.field}>
          <label htmlFor="username">Username</label>
          <input id="username" type="text" data-testid="signup-username" value={username}
                 onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" data-testid="signup-email" value={email}
                 onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" data-testid="signup-password" value={password}
                 onChange={e => setPassword(e.target.value)} required minLength={8} />
        </div>
        <button type="submit" className={styles.submitBtn} data-testid="signup-submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className={styles.link} style={{ marginTop: '16px' }}>
        Already have an account? <Link to="/login" data-testid="login-link">Sign in</Link>
      </p>
    </div>
  );
}
