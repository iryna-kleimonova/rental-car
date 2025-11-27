export const formatMileage = (mileage: number): string => {
  if (mileage === undefined || mileage === null) return 'N/A';
  return mileage.toLocaleString('en-US').replace(/,/g, ' ');
};
