import { useState } from 'react';
import styles from './SearchBar.module.css';

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    const next = e.target.value;
    setValue(next);
    onSearch(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.wrapper}>
      <span className={styles.icon}>🔍</span>
      <input
        className={styles.input}
        data-testid="search-input"
        type="text"
        placeholder="Search books by title or author..."
        value={value}
        onChange={handleChange}
      />
    </form>
  );
}
