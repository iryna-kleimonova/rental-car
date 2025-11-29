'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './error.module.css';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Catalog error:', error);
  }, [error]);

  return (
    <section className={styles.error}>
      <div className="container">
        <div className={styles.content}>
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.description}>
            We encountered an error while loading the catalog. Please try again.
          </p>
          {error.message && (
            <div className={styles.errorMessage}>
              <p className={styles.errorText}>{error.message}</p>
            </div>
          )}
          <div className={styles.actions}>
            <button onClick={reset} className={styles.button}>
              Try Again
            </button>
            <Link href="/" className={styles.buttonSecondary}>
              Go to Home
            </Link>
            <Link href="/catalog" className={styles.buttonSecondary}>
              Reload Catalog
            </Link>
          </div>
        </div>
    </div>
    </section>
  );
}
