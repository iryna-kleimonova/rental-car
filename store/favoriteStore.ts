import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteStore {
  favoriteIds: string[];
  toggleFavorite: (carId: string) => void;
  isFavorite: (carId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      toggleFavorite: (carId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(carId)
            ? state.favoriteIds.filter((id) => id !== carId)
            : [...state.favoriteIds, carId],
        })),

      isFavorite: (carId) => get().favoriteIds.includes(carId),
    }),
    {
      name: 'rentalcar-favorites-storage',
    }
  )
);
