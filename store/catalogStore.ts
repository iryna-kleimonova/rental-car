import { create } from 'zustand';
import { Car, FilterState } from '@/types';
import { fetchCars } from '@/lib/api';

export interface CatalogStoreState {
  cars: Car[];
  filters: FilterState;
  currentPage: number;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;

  setFilters: (newFilters: Partial<FilterState>) => void;
  fetchInitialCars: () => Promise<void>;
  loadMoreCars: () => Promise<void>;
  resetCatalog: () => void;
  hydrateCatalog: (payload: { cars: Car[]; page: number; totalPages: number }) => void;
}

export const INITIAL_FILTERS: FilterState = {
  brand: null,
  rentalPrice: null,
  minMileage: null,
  maxMileage: null,
};

export const useCatalogStore = create<CatalogStoreState & { totalPages: number }>((set, get) => ({
  cars: [],
  filters: INITIAL_FILTERS,
  currentPage: 1,
  isLoading: false,
  hasMore: true,
  error: null,
  totalPages: 0,

  resetCatalog: () => set({ cars: [], currentPage: 1, hasMore: true, totalPages: 0 }),

  hydrateCatalog: (payload) => {
    const pageNumber = Number(payload.page) || 1;
    const totalPagesNumber = Number(payload.totalPages) || 1;

    set({
      cars: payload.cars,
      currentPage: pageNumber + 1,
      totalPages: totalPagesNumber,
      hasMore: pageNumber < totalPagesNumber,
      error: null,
    });
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().fetchInitialCars();
  },

  fetchInitialCars: async () => {
    const { filters, resetCatalog } = get();
    resetCatalog();
    set({ isLoading: true, error: null });

    try {
      const data = await fetchCars(filters, 1);

      set({
        cars: data.cars,
        currentPage: 2,
        totalPages: data.totalPages,
        hasMore: data.page < data.totalPages,
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false, hasMore: false });
    }
  },

  loadMoreCars: async () => {
    const { filters, currentPage, hasMore, totalPages } = get();

    if (get().isLoading || !hasMore || currentPage > totalPages) return;

    set({ isLoading: true, error: null });

    try {
      const data = await fetchCars(filters, currentPage);

      set((state) => ({
        cars: [...state.cars, ...data.cars],
        currentPage: state.currentPage + 1,
        totalPages: data.totalPages,
        hasMore: data.page < data.totalPages,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },
}));
