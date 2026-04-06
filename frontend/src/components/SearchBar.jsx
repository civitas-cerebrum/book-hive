import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './SearchBar.module.css';

export default function SearchBar({ onSearch }) {
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState('');

  useEffect(() => {
    const query = searchParams.get('query') || '';
    setValue(query);
  }, [searchParams]);

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
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
