import { Metadata } from 'next';
import CatalogClient from '@/components/Catalog/CatalogClient';
import { fetchBrands, fetchCars } from '@/lib/api';
import { INITIAL_FILTERS } from '@/store/catalogStore';

export const metadata: Metadata = {
  title: 'Catalog of cars for rent',
  description:
    'Browse our catalog of premium rental cars. Filter by brand, price, and mileage to find the perfect vehicle for your next trip.',
  openGraph: {
    title: 'RentalCar Catalog',
    description: 'Premium cars available for rent with flexible mileage and price filters.',
    url: 'https://rentalcar.example.com/catalog',
    type: 'website',
  },
};

const Catalog = async () => {
  const [initialCarsResponse, brandOptions] = await Promise.all([
    fetchCars(INITIAL_FILTERS, 1),
    fetchBrands(),
  ]);

  return (
    <CatalogClient
      initialCars={initialCarsResponse.cars}
      initialPage={initialCarsResponse.page}
      initialTotalPages={initialCarsResponse.totalPages}
      brands={brandOptions}
      defaultFilters={INITIAL_FILTERS}
    />
  );
};

export default Catalog;
