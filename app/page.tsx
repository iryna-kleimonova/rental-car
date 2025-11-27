import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './Home.module.css';

export const metadata: Metadata = {
  title: 'Find Your Perfect Rental Car',
  description:
    'Reliable and budget-friendly car rentals for any journey. Browse our catalog of premium vehicles and find the perfect car for your next trip.',
  openGraph: {
    title: 'RentalCar - Premium Car Rentals',
    description: 'Reliable and budget-friendly car rentals for any journey.',
    type: 'website',
  },
};

export default function Home() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.title}>Find your perfect rental car</h1>
        <p className={styles.description}>
          Reliable and budget-friendly rentals for any journey
        </p>

        <div className={styles.btnContainer}>
          <Link
            href="/catalog"
            className={styles.button}
            prefetch={false}
            aria-label="Open the catalog page"
          >
            View Catalog
          </Link>
        </div>
      </div>
    </section>
  );
}
