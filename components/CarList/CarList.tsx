import { memo } from 'react';
import { Car } from '@/types';
import CarItem from '../CarItem/CarItem';
import styles from './CarList.module.css';

type Props = {
  cars: Car[];
};

const CarList = memo(({ cars }: Props) => {
  if (!cars.length) {
    return <p className={styles.empty}>No cars found. Try adjusting the filters.</p>;
  }

  return (
    <ul className={styles.list}>
      {cars.map((car) => (
        <CarItem key={car.id} item={car} />
      ))}
    </ul>
  );
});

CarList.displayName = 'CarList';

export default CarList;
