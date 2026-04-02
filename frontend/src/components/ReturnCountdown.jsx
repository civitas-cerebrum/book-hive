import { useState, useEffect } from 'react';
import styles from './ReturnCountdown.module.css';

export default function ReturnCountdown({ purchasedAt }) {
  const [remaining, setRemaining] = useState(() => {
    const deadline = new Date(purchasedAt).getTime() + 600000;
    return Math.max(0, Math.floor((deadline - Date.now()) / 1000));
  });

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => {
      const deadline = new Date(purchasedAt).getTime() + 600000;
      const secs = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [purchasedAt]);

  if (remaining <= 0) {
    return <span className={styles.expired} data-testid="return-expired">Return window expired</span>;
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className={styles.countdown} data-testid="return-countdown">
      Return window: <span className={styles.time}>{mins}:{secs.toString().padStart(2, '0')}</span>
    </div>
  );
}
