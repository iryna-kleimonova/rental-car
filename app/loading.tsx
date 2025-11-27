import Loader from '@/components/Loader/Loader';
import css from './Home.module.css';

export default function Loading() {
  return (
    <>
      <div className={css.loaderContainer}>
        <Loader />
      </div>
    </>
  );
}
