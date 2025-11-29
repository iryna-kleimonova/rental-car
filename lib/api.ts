import axios from 'axios';
import { Car, FilterState, CarsResponse } from '@/types';

const PAGE_LIMIT = 12;

const BASE_URL = process.env.API_BASE_URL?.replace(/\/$/, '');

const serverApi = axios.create({ baseURL: BASE_URL });
const clientApi = axios.create({ baseURL: '/api' });

const getApiClient = () =>
  typeof window === 'undefined' ? serverApi : clientApi;

const buildCarParams = (filters: FilterState, page: number) => ({
  page,
  limit: PAGE_LIMIT,
  ...(filters.brand && { brand: filters.brand }),
  ...(filters.rentalPrice && { rentalPrice: filters.rentalPrice }),
  ...(filters.minMileage !== null && { minMileage: filters.minMileage }),
  ...(filters.maxMileage !== null && { maxMileage: filters.maxMileage }),
});

export const fetchCars = async (
  filters: FilterState,
  page: number
): Promise<CarsResponse> => {
  try {
    const params = buildCarParams(filters, page);
    const response = await getApiClient().get<CarsResponse>('/cars', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cars:', error);
    throw new Error('Failed to fetch cars from API.');
  }
};

export const fetchBrands = async (): Promise<string[]> => {
  try {
    const apiClient = getApiClient();
    const response = await apiClient.get<string[]>('/brands');
    return response.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
};

export const fetchCarDetails = async (id: string): Promise<Car> => {
  try {
    const apiClient = getApiClient();
    const response = await apiClient.get<Car>(`/cars/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching car details for ID ${id}:`, error);
    throw new Error('Failed to fetch car details.');
  }
};
