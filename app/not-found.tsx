import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description:
    'The page you are looking for does not exist. Return to the home page or browse our car catalog.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <section className={styles.notFound}>
      <div className="container">
        <div className={styles.content}>
          <h1 className={styles.title}>404</h1>
          <h2 className={styles.subtitle}>Page Not Found</h2>
          <p className={styles.description}>
            Sorry, the page you are looking for does not exist or has been moved.
          </p>
          <div className={styles.actions}>
            <Link href="/" className={styles.button}>
              Go to Home
            </Link>
            <Link href="/catalog" className={styles.buttonSecondary}>
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
