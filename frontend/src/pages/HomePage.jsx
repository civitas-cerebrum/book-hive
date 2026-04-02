import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import GenreFilter from '../components/GenreFilter';
import styles from './HomePage.module.css';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get('query') || '';
  const genre = searchParams.get('genre') || '';

  useEffect(() => {
    setLoading(true);
    const params = { page, size: 12 };
    if (query) params.query = query;
    if (genre) params.genre = genre;

    api.get('/books', { params })
      .then(res => {
        setBooks(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, query, genre]);

  const handleSearch = (q) => {
    setPage(0);
    setSearchParams(q ? { query: q } : {});
  };

  const handleGenre = (g) => {
    setPage(0);
    setSearchParams(g ? { genre: g } : {});
  };

  return (
    <div data-testid="home-page">
      <div className={styles.header}>
        <SearchBar onSearch={handleSearch} />
      </div>
      <GenreFilter active={genre} onChange={handleGenre} />

      {loading ? (
        <div className={styles.empty} data-testid="loading-books">Loading...</div>
      ) : books.length === 0 ? (
        <div className={styles.empty} data-testid="no-books">No books found</div>
      ) : (
        <>
          <div className={styles.grid} data-testid="book-grid">
            {books.map(book => <BookCard key={book.id} book={book} />)}
          </div>
          {totalPages > 1 && (
            <div className={styles.pagination} data-testid="pagination">
              <button
                className={styles.pageBtn}
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                data-testid="prev-page"
              >
                Previous
              </button>
              <span style={{ color: 'var(--text-secondary)', padding: '8px' }}>
                {page + 1} / {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                data-testid="next-page"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
