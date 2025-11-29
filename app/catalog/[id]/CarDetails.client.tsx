'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Image from 'next/image';

import { fetchCarDetails } from '@/lib/api';
import BookingForm from '@/components/BookingForm/BookingForm';
import Loader from '@/components/Loader/Loader';
import { formatMileage } from '@/lib/utils';
import styles from './CarDetails.module.css';

const CarDetailsClient = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: car,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['car', id],
    queryFn: () => fetchCarDetails(id),
    refetchOnMount: false,
  });

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <Loader />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className={styles.errorContainer}>
        <p>Failed to load car details. Please try again later.</p>
      </div>
    );
  }

  const addressParts = car.address?.split(', ') ?? [];
  const city = addressParts.slice(1, -1).join(', ');
  const country = addressParts.slice(-1).join('');
  const location = [city, country].filter(Boolean).join(', ');
  const mileageFormatted = `${formatMileage(car.mileage)} km`;

  const rentalConditions = car.rentalConditions.map((condition) => {
    const [label, value] = condition.split(':');
    return {
      label: label.trim(),
      value: value ? value.trim() : null,
    };
  });

  const specifications = [
    { label: 'Year', value: car.year, icon: '#icon-calendar' },
    { label: 'Type', value: car.type, icon: '#icon-car' },
    {
      label: 'Fuel Consumption',
      value: `${car.fuelConsumption}`,
      icon: '#icon-fuel',
    },
    { label: 'Engine Size', value: car.engineSize, icon: '#icon-gear' },
  ];

  const accessories = [...car.accessories, ...car.functionalities];

  return (
    <section className={styles.carDetails}>
      <div className="container">
        <div className={styles.detailsWrapper}>
          <div className={styles.mediaColumn}>
            <div className={styles.imageWrapper}>
            <Image
                className={styles.image}
              src={car.img}
                alt={`${car.brand} ${car.model}`}
              width={640}
              height={512}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
            />
            </div>
            <BookingForm storageKey={`booking-form-${car.id}`} />
          </div>

          <div className={styles.infoPanel}>
            <div className={styles.titleRow}>
              <h1 className={styles.carTitle}>
                {car.brand} {car.model}, {car.year}
              </h1>

              <div className={styles.metaRow}>
                <span className={styles.metaItem}>
                  <svg
                    className={styles.metaIcon}
                    width="16"
                    height="16"
                    viewBox="0 0 32 32"
                  >
                    <use href="#icon-location" />
                  </svg>
                  {location}
                </span>
                <span className={styles.metaItem}>
                  Mileage: {mileageFormatted}
                </span>
              </div>
              <p className={styles.price}>${car.rentalPrice}</p>
              <p className={styles.description}>{car.description}</p>
                </div>
            <div className={styles.mainDesc}>
              <div className={styles.wrapper}>
                <h3 className={styles.wrapperTitle}>Rental Conditions:</h3>
                <ul className={styles.conditionsList}>
                  {rentalConditions.map((condition, index) => (
                    <li
                      className={styles.conditionItem}
                      key={`${condition.label}-${index}`}
                    >
                      <svg
                        className={styles.conditionIcon}
                        width="16"
                        height="16"
                        viewBox="0 0 32 32"
                      >
                        <use href="#icon-check-circle" />
                      </svg>
                      <span>
                        {condition.label}
                        {condition.value && (
                          <span className={styles.conditionValue}>
                            : {condition.value}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                </div>

              <div className={styles.wrapper}>
                <h3 className={styles.wrapperTitle}>Car Specifications:</h3>
                <ul className={styles.specList}>
                  {specifications.map((spec) => (
                    <li className={styles.specItem} key={spec.label}>
                      <svg
                        className={styles.specIcon}
                        width="16"
                        height="16"
                        viewBox="0 0 32 32"
                      >
                        <use href={spec.icon} />
                      </svg>
                      <span>
                        {spec.label}: {spec.value}
                      </span>
                    </li>
                  ))}
                </ul>
                </div>

              <div className={styles.wrapper}>
                <h3 className={styles.wrapperTitle}>
                  Accessories and functionalities:
                </h3>
                <ul className={styles.specList}>
                  {accessories.map((item) => (
                    <li className={styles.specItem} key={item}>
                      <svg
                        className={styles.specIcon}
                        width="16"
                        height="16"
                        viewBox="0 0 32 32"
                      >
                        <use href="#icon-check-circle" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarDetailsClient;
