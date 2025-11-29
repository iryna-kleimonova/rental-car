import Link from 'next/link';
import Image from 'next/image';
import { memo, useMemo, useCallback } from 'react';
import { Car } from '@/types';
import { useFavoriteStore } from '@/store/favoriteStore';
import { formatMileage } from '@/lib/utils';
import styles from './CarItem.module.css';

type Props = {
  item: Car;
};

const CarItem = memo(({ item }: Props) => {
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
  const isFavorite = useFavoriteStore((state) => state.isFavorite(item.id));

  const handleFavoriteClick = useCallback(() => {
    toggleFavorite(item.id);
  }, [toggleFavorite, item.id]);

  const { city, country, formattedMileage, carTitle, carAlt } = useMemo(() => {
    const addressParts = item.address?.split(', ') ?? [];
    const countryPart = addressParts.slice(-1);
    const cityPart = addressParts.slice(1, -1);
    
    return {
      city: cityPart,
      country: countryPart,
      formattedMileage: formatMileage(item.mileage),
      carTitle: `${item.brand} ${item.model}`,
      carAlt: `${item.brand} ${item.model}`,
    };
  }, [item.address, item.mileage, item.brand, item.model]);

  return (
    <li className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={item.img}
          alt={carAlt}
          width={274}
          height={268}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 274px"
        />
        <button
          type="button"
          aria-pressed={isFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={handleFavoriteClick}
          className={styles.favoriteButton}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 32 32"
            role="presentation"
            aria-hidden="true"
          >
            <use
              href={isFavorite ? '#icon-like-active' : '#icon-like-default'}
            />
          </svg>
        </button>
      </div>

      <div>
        <div className={styles.headerRow}>
          <p className={styles.heading}>
            {item.brand} <span className={styles.model}>{item.model}</span>,{' '}
            {item.year}
          </p>
          <span className={styles.price}>{`$${item.rentalPrice}`}</span>
        </div>
        <ul className={styles.description}>
          <li>{city}</li>
          <li>{country}</li>
          <li>{item.rentalCompany}</li>
          <li>{item.type}</li>
          <li>{formattedMileage} km</li>
        </ul>
      </div>

      <Link href={`/catalog/${item.id}`} className={styles.readMore}>
        Read more
      </Link>
    </li>
  );
});

CarItem.displayName = 'CarItem';

export default CarItem;
