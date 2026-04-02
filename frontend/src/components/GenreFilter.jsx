import styles from './GenreFilter.module.css';

const GENRES = ['All', 'Fiction', 'Sci-Fi', 'Non-Fiction', 'Biography', 'Fantasy', 'Mystery'];

export default function GenreFilter({ active, onChange }) {
  return (
    <div className={styles.chips} data-testid="genre-chips">
      {GENRES.map(genre => (
        <button
          key={genre}
          className={`${styles.chip} ${active === genre || (genre === 'All' && !active) ? styles.chipActive : ''}`}
          data-testid={`genre-chip-${genre.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={() => onChange(genre === 'All' ? null : genre)}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}
