# RentalCar - Car Rental Web Application

A modern web application for renting cars, built with Next.js and TypeScript. This project provides a user-friendly interface for browsing, filtering, and booking rental cars.

## Project Description

RentalCar is a frontend web application for a car rental company. The application allows users to:

- Browse a catalog of available rental cars
- Filter cars by brand, price, and mileage
- Save favorite cars
- View detailed information about each car
- Book a car rental through an intuitive form

## Main Features

- **Home Page**: Hero section with a call-to-action button to view the catalog
- **Catalog Page**:
  - Display all available rental cars
  - Filter by brand, price, and mileage (backend filtering)
  - Add cars to favorites (persisted in localStorage)
  - Pagination with "Load More" button
  - Formatted mileage display (e.g., "5 000 km")
- **Car Details Page**:
  - Detailed car information with images
  - Rental conditions and specifications
  - Accessories and functionalities list
  - Booking form with validation (Formik + Yup)
  - Form data persistence in localStorage

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Form Management**: Formik + Yup
- **Styling**: CSS Modules
- **Data Fetching**: TanStack Query (React Query)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd rental-car
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Routes

- `/` - Home page with hero section
- `/catalog` - Catalog page with car listings and filters
- `/catalog/:id` - Individual car details page with booking form

### Features Usage

1. **Filtering Cars**:
   - Select a car brand from the dropdown
   - Choose a maximum price per hour
   - Set minimum and maximum mileage range
   - Click "Search" to apply filters

2. **Favorites**:
   - Click the heart icon on any car card to add/remove from favorites
   - Favorites are saved in localStorage and persist across page reloads

3. **Pagination**:
   - Click "Load More" to load additional cars
   - Pagination is handled by the backend API

4. **Booking**:
   - Navigate to a car's detail page
   - Fill out the booking form (name, email, date, comment)
   - Form data is automatically saved as you type
   - Submit the form to complete the booking

## Backend API

The application uses the external backend API documented at:
https://car-rental-api.goit.global/api-docs/

All filtering and pagination is handled by the backend to ensure optimal performance.

## Project Structure

```
rental-car/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── catalog/           # Catalog pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── BookingForm/       # Booking form component
│   ├── CarItem/           # Car card component
│   ├── CarList/           # Car list component
│   ├── Catalog/           # Catalog page component
│   ├── CatalogFilters/    # Filter component
│   ├── Dropdown/          # Custom dropdown component
│   └── Header/            # Header component
├── store/                 # Zustand stores
│   ├── catalogStore.ts    # Catalog state management
│   └── favoriteStore.ts   # Favorites state management
├── lib/                   # Utility functions
│   ├── api.ts             # API client
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript type definitions
```

## Development

The project follows these principles:

- **Component-based approach**: Reusable, modular components
- **DRY (Don't Repeat Yourself)**: Shared logic and utilities
- **Clean code**: Readable, well-commented code
- **Type safety**: Full TypeScript coverage

## Deployment

The application is deployed on Vercel/Netlify. The deployment process is automated through the platform's CI/CD pipeline.

To deploy manually:

1. Build the project: `npm run build`
2. Start the production server: `npm start`

## Author

Iryna Kleimonova

## License

This project is created for educational purposes.
