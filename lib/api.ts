import axios, { AxiosError } from 'axios';
import { Car, FilterState, CarsResponse } from '@/types';
import { retry } from './retry';

const PAGE_LIMIT = 12;

const BASE_URL = process.env.API_BASE_URL?.replace(/\/$/, '');

const serverApi = axios.create({ baseURL: BASE_URL });
const clientApi = axios.create({ baseURL: '/api' });

const getApiClient = () =>
  typeof window === 'undefined' ? serverApi : clientApi;

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      switch (axiosError.response.status) {
        case 404:
          return 'The requested resource was not found.';
        case 500:
          return 'Server error. Please try again later.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return 'An error occurred while fetching data.';
      }
    }
    if (axiosError.request) {
      return 'Network error. Please check your connection.';
    }
  }
  return 'An unexpected error occurred.';
};

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
    return await retry(async () => {
      const params = buildCarParams(filters, page);
      const response = await getApiClient().get<CarsResponse>('/cars', {
        params,
      });
      return response.data;
    });
  } catch (error) {
    console.error('Error fetching cars:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const fetchBrands = async (): Promise<string[]> => {
  try {
    return await retry(async () => {
      const apiClient = getApiClient();
      const response = await apiClient.get<string[]>('/brands');
      return response.data;
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
};

export const fetchCarDetails = async (id: string): Promise<Car> => {
  try {
    return await retry(async () => {
      const apiClient = getApiClient();
      const response = await apiClient.get<Car>(`/cars/${id}`);
      return response.data;
    });
  } catch (error) {
    console.error(`Error fetching car details for ID ${id}:`, error);
    const message = getErrorMessage(error);
    throw new Error(message || 'Failed to fetch car details.');
  }
};
