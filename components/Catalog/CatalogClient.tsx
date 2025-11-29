'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Car, FilterState } from '@/types';
import CatalogFilters from '@/components/CatalogFilters/CatalogFilters';
import CarList from '@/components/CarList/CarList';
import Loader from '@/components/Loader/Loader';
import { useCatalogStore } from '@/store/catalogStore';
import styles from './CatalogClient.module.css';

type CatalogClientProps = {
  initialCars: Car[];
  initialPage: number;
  initialTotalPages: number;
  brands: string[];
  defaultFilters: FilterState;
};

export default function CatalogClient({
  initialCars,
  initialPage,
  initialTotalPages,
  brands,
  defaultFilters,
}: CatalogClientProps) {
  const cars = useCatalogStore((state) => state.cars);
  const hasMore = useCatalogStore((state) => state.hasMore);
  const isLoading = useCatalogStore((state) => state.isLoading);
  const error = useCatalogStore((state) => state.error);
  const loadMoreCars = useCatalogStore((state) => state.loadMoreCars);
  const fetchInitialCars = useCatalogStore((state) => state.fetchInitialCars);
  const hydrateCatalog = useCatalogStore((state) => state.hydrateCatalog);
  const hasHydrated = useRef(false);

  const showLoaderInsteadOfList = useMemo(
    () => isLoading && cars.length === 0,
    [isLoading, cars.length]
  );

  useEffect(() => {
    if (hasHydrated.current) return;

    if (initialCars.length) {
      hydrateCatalog({
        cars: initialCars,
        page: initialPage,
        totalPages: initialTotalPages,
      });
      hasHydrated.current = true;
      return;
    }

    fetchInitialCars().finally(() => {
      hasHydrated.current = true;
    });
  }, [
    fetchInitialCars,
    hydrateCatalog,
    initialCars,
    initialPage,
    initialTotalPages,
  ]);

  return (
    <section className={styles.catalogSection}>
      <div className={`container ${styles.container}`}>
        <CatalogFilters brandOptions={brands} defaultFilters={defaultFilters} />

        {error && (
          <p role="alert" aria-live="assertive" className={styles.error}>
            {error}
          </p>
        )}

        {showLoaderInsteadOfList ? (
          <div className={styles.loaderContainer}>
            <Loader />
          </div>
        ) : (
          <>
            {isLoading && cars.length > 0 && (
              <div className={styles.loaderOverlay}>
                <Loader />
              </div>
            )}
            <CarList cars={cars} />
          </>
        )}

        {hasMore && (
          <div className={styles.loadMoreWrapper}>
            <button
              type="button"
              onClick={loadMoreCars}
              disabled={isLoading}
              className={styles.loadMoreButton}
            >
              {isLoading ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}

        {!hasMore && !isLoading && cars.length > 0 && (
          <p aria-live="polite" className={styles.statusText}>
            You&apos;ve reached the end of the catalog.
          </p>
        )}
      </div>
    </section>
  );
}
