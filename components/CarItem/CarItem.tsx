import Link from 'next/link';
import Image from 'next/image';
import { Car } from '@/types';
import { useFavoriteStore } from '@/store/favoriteStore';
import styles from './CarItem.module.css';

type Props = {
  item: Car;
};

const CarItem = ({ item }: Props) => {
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
  const isFavorite = useFavoriteStore((state) => state.isFavorite(item.id));

  const handleFavoriteClick = () => {
    toggleFavorite(item.id);
  };

  const addressParts = item.address?.split(', ') ?? [];
  const country = addressParts.slice(-1);
  const city = addressParts.slice(1, -1);

  return (
    <li className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={item.img}
          alt={`${item.brand} ${item.model}`}
          width={274}
          height={268}
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
          <li>{item.mileage} km</li>
        </ul>
      </div>

      <Link href={`/catalog/${item.id}`} className={styles.readMore}>
        Read more
      </Link>
    </li>
  );
};

export default CarItem;
