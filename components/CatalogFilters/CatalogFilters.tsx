'use client';

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { useCatalogStore } from '@/store/catalogStore';
import { fetchBrands } from '@/lib/api';
import { FilterState } from '@/types';
import styles from './CatalogFilters.module.css';
import Dropdown, { DropdownOption } from '@/components/Dropdown/Dropdown';

const PRICE_OPTIONS = Array.from(
  { length: 8 },
  (_, idx) => `${(idx + 3) * 10}`
);

type CatalogFiltersProps = {
  brandOptions?: string[];
  defaultFilters?: FilterState;
};

export default function CatalogFilters({
  brandOptions: initialBrands = [],
  defaultFilters,
}: CatalogFiltersProps) {
  const setFilters = useCatalogStore((state) => state.setFilters);
  const isLoading = useCatalogStore((state) => state.isLoading);

  const initialFormState = useMemo(
    () => ({
      brand: (defaultFilters?.brand ?? '') as string,
      rentalPrice: (defaultFilters?.rentalPrice ?? '') as string,
      minMileage: defaultFilters?.minMileage
        ? String(defaultFilters.minMileage)
        : '',
      maxMileage: defaultFilters?.maxMileage
        ? String(defaultFilters.maxMileage)
        : '',
    }),
    [defaultFilters]
  );

  const [formState, setFormState] = useState(initialFormState);

  const [brandOptions, setBrandOptions] = useState<string[]>(initialBrands);
  const brandsLoadedRef = useRef(initialBrands.length > 0);

  useEffect(() => {
    if (brandsLoadedRef.current) {
      return;
    }

    let mounted = true;

    const loadBrands = async () => {
      try {
        const brands = await fetchBrands();
        if (mounted) {
          setTimeout(() => {
            if (mounted) {
              setBrandOptions(brands);
              brandsLoadedRef.current = true;
            }
          }, 0);
        }
      } catch (error) {
        console.error('Failed to fetch brands', error);
      }
    };

    loadBrands();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (
    event: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    const numValue = Number(value);

    if ((name === 'minMileage' || name === 'maxMileage') && value !== '') {
      if (numValue < 0 || isNaN(numValue)) {
        return;
      }
    }

    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFilters({
      brand: formState.brand || null,
      rentalPrice: formState.rentalPrice || null,
      minMileage: formState.minMileage ? Number(formState.minMileage) : null,
      maxMileage: formState.maxMileage ? Number(formState.maxMileage) : null,
    });
  };

  const brandDropdownOptions: DropdownOption[] = useMemo(() => {
    const sorted = [...brandOptions].sort((a, b) => a.localeCompare(b));
    return sorted.map((brand) => ({ label: brand, value: brand }));
  }, [brandOptions]);

  const priceDropdownOptions: DropdownOption[] = useMemo(
    () =>
      PRICE_OPTIONS.map((price) => ({
        label: price,
        value: price,
      })),
    []
  );

  return (
    <form onSubmit={handleSubmit} aria-label="Filters" className={styles.form}>
      <Dropdown
        label="Car brand"
        placeholder="Choose a brand"
        value={formState.brand}
        options={brandDropdownOptions}
        clearLabel="All brands"
        maxHeight={272}
        onChange={(value) =>
          setFormState((prev) => ({ ...prev, brand: value }))
        }
      />

      <Dropdown
        label="Price/ 1 hour"
        placeholder="Choose a price"
        value={formState.rentalPrice}
        options={priceDropdownOptions}
        clearLabel="Any price"
        maxHeight={188}
        formatSelectedLabel={(label) => `To $${label}`}
        onChange={(value) =>
          setFormState((prev) => ({ ...prev, rentalPrice: value }))
        }
      />

      <div className={styles.mileageField}>
        <span className={styles.label}>Car mileage / km</span>
        <div className={styles.mileageInputs}>
          <div className={styles.mileageInputWrapper}>
            <span className={styles.mileageLabel}>From</span>
            <input
              name="minMileage"
              type="number"
              min={0}
              value={formState.minMileage}
              onChange={handleChange}
              aria-label="Minimum mileage"
              className={styles.mileageInput}
            />
          </div>
          <span className={styles.mileageDivider} aria-hidden="true"></span>
          <div className={styles.mileageInputWrapper}>
            <span className={styles.mileageLabel}>To</span>
            <input
              name="maxMileage"
              type="number"
              min={0}
              value={formState.maxMileage}
              onChange={handleChange}
              aria-label="Maximum mileage"
              className={styles.mileageInput}
            />
          </div>
        </div>
      </div>

      <button type="submit" disabled={isLoading} className={styles.submit}>
        Search
      </button>
    </form>
  );
}
