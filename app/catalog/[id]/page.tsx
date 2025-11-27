import type { Metadata } from 'next';
import { fetchCarDetails } from '@/lib/api';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import CarDetailsClient from './CarDetails.client';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;
  const car = await fetchCarDetails(id);

  return {
    title: `${car.brand} ${car.model} ${car.year}`,
    description: `Rent ${car.brand} ${car.model} ${car.year} for $${car.rentalPrice}/hour. ${car.description}`,
    openGraph: {
      title: `${car.brand} ${car.model} ${car.year} - RentalCar`,
      description: car.description,
      type: 'website',
      images: car.img ? [{ url: car.img, alt: `${car.brand} ${car.model}` }] : undefined,
    },
  };
}

const CarDetails = async ({ params }: Props) => {
  const { id } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['car', id],
    queryFn: () => fetchCarDetails(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CarDetailsClient />
    </HydrationBoundary>
  );
};

export default CarDetails;
