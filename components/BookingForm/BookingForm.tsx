import {
  ErrorMessage,
  Field,
  Form,
  Formik,
  FormikHelpers,
  FormikProps,
  type FieldProps,
} from 'formik';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './BookingForm.module.css';

type BookingFormValues = {
  name: string;
  email: string;
  bookingDate: string;
  comment: string;
};

const DEFAULT_FORM_VALUES: BookingFormValues = {
  name: '',
  email: '',
  bookingDate: '',
  comment: '',
};

const bookingSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Enter at least 2 characters')
    .max(60, 'Too long')
    .required('Name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  bookingDate: Yup.string().required('Choose a booking date'),
  comment: Yup.string().max(500, 'Maximum 500 characters'),
});

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const BookingForm = ({ storageKey }: { storageKey: string }) => {
  const [initialValues, setInitialValues] =
    useState<BookingFormValues>(DEFAULT_FORM_VALUES);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;
    const timers: number[] = [];
    const schedule = (callback: () => void) => {
      const id = window.setTimeout(() => {
        if (!cancelled) {
          callback();
        }
      }, 0);
      timers.push(id);
    };

    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as BookingFormValues;
        schedule(() =>
          setInitialValues({
            ...DEFAULT_FORM_VALUES,
            ...parsed,
          })
        );
      } catch (err) {
        console.warn('Failed to parse saved booking form', err);
      }
    }

    schedule(() => setIsReady(true));

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [storageKey]);

  const handleSubmit = useCallback(
    async (
      values: BookingFormValues,
      helpers: FormikHelpers<BookingFormValues>
    ) => {
      await new Promise((resolve) => setTimeout(resolve, 800));

      helpers.resetForm({ values: DEFAULT_FORM_VALUES });
      helpers.setSubmitting(false);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(storageKey);
      }

      toast.success('Your booking has been successfully submitted! We will contact you soon.');
    },
    [storageKey]
  );

  if (!isReady) {
    return <div className={styles.formSkeleton} aria-hidden="true" />;
  }

  return (
    <div className={styles.formCard}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Book your car now</h2>
        <p className={styles.formSubtitle}>
          Stay connected! We are always ready to help you.
        </p>
      </div>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={bookingSchema}
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnChange
      >
        {(formikProps) => (
          <BookingFormFields storageKey={storageKey} {...formikProps} />
        )}
      </Formik>
    </div>
  );
};

type BookingFormFieldsProps = FormikProps<BookingFormValues> & {
  storageKey: string;
};

const BookingFormFields = ({
  storageKey,
  values,
  errors,
  touched,
  isSubmitting,
  isValid,
  dirty,
  setFieldValue,
}: BookingFormFieldsProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const bookingInputRef = useRef<HTMLInputElement | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    values.bookingDate ? new Date(values.bookingDate) : new Date()
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(values));
  }, [storageKey, values]);

  useEffect(() => {
    if (!values.bookingDate) return;
    const timer = window.setTimeout(() => {
      setVisibleMonth(new Date(values.bookingDate));
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [values.bookingDate]);

  useEffect(() => {
    if (!isCalendarOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        calendarRef.current &&
        !calendarRef.current.contains(target) &&
        bookingInputRef.current &&
        !bookingInputRef.current.contains(target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCalendarOpen]);

  const calendarDays = useMemo(
    () => buildCalendarMatrix(visibleMonth),
    [visibleMonth]
  );

  const formattedBookingDate = values.bookingDate
    ? new Date(values.bookingDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const handleDateSelect = (date: Date) => {
    setFieldValue('bookingDate', date.toISOString());
    setIsCalendarOpen(false);
  };

  return (
    <Form className={styles.form}>
      <FloatingField
        name="name"
        placeholder="Name*"
        type="text"
        disabled={isSubmitting}
        hasError={Boolean(errors.name && touched.name)}
      />
      <ErrorMessage component="span" name="name" className={styles.errorText} />

      <FloatingField
        name="email"
        placeholder="Email*"
        type="email"
        disabled={isSubmitting}
        hasError={Boolean(errors.email && touched.email)}
      />
      <ErrorMessage
        component="span"
        name="email"
        className={styles.errorText}
      />

      <div className={styles.fieldWrapper}>
        <Field name="bookingDate">
          {({ field }: FieldProps) => (
            <input
              {...field}
              ref={bookingInputRef}
              readOnly
              value={formattedBookingDate}
              onClick={() => setIsCalendarOpen((prev) => !prev)}
              onFocus={() => setIsCalendarOpen(true)}
              className={`${styles.inputBase} ${
                errors.bookingDate && touched.bookingDate
                  ? styles.inputError
                  : ''
              }`}
              placeholder="Booking date"
            />
          )}
        </Field>
        {isCalendarOpen && (
          <div className={styles.calendarPopover} ref={calendarRef}>
            <div className={styles.calendarHeader}>
              <div className={styles.calendarControls}>
                <button
                  type="button"
                  onClick={() => setVisibleMonth((prev) => addMonths(prev, -1))}
                  aria-label="Previous month"
                >
                  <svg
                    className={`${styles.navIcon} ${styles.navIconLeft}`}
                    viewBox="0 0 32 32"
                  >
                    <use href="#icon-up" />
                  </svg>
                </button>
                <p className={styles.calendarTitle}>
                  {visibleMonth.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <button
                  type="button"
                  onClick={() => setVisibleMonth((prev) => addMonths(prev, 1))}
                  aria-label="Next month"
                >
                  <svg
                    className={`${styles.navIcon} ${styles.navIconRight}`}
                    viewBox="0 0 32 32"
                  >
                    <use href="#icon-up" />
                  </svg>
                </button>
              </div>
            </div>
            <div className={styles.weekdays}>
              {weekdayLabels.map((day) => (
                <span key={day}>{day.toUpperCase()}</span>
              ))}
            </div>
            <div className={styles.calendarGrid}>
              {calendarDays.map((day) => {
                const isOutside = day.getMonth() !== visibleMonth.getMonth();
                const isSelected =
                  values.bookingDate &&
                  isSameDate(new Date(values.bookingDate), day);
                const isToday = isSameDate(new Date(), day);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    className={`${styles.calendarDay} ${isOutside ? styles.dayMuted : ''} ${
                      isSelected ? styles.daySelected : ''
                    } ${isToday ? styles.dayToday : ''}`}
                    onClick={() => handleDateSelect(day)}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <ErrorMessage
        component="span"
        name="bookingDate"
        className={styles.errorText}
      />

      <FloatingField
        name="comment"
        placeholder="Comment"
        as="textarea"
        rows={4}
        disabled={isSubmitting}
        hasError={Boolean(errors.comment && touched.comment)}
      />
      <ErrorMessage
        component="span"
        name="comment"
        className={styles.errorText}
      />
      <div className={styles.btnWrapper}>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting || !isValid || !dirty}
        >
          {isSubmitting ? 'Sending…' : 'Send'}
        </button>
      </div>
    </Form>
  );
};

type FloatingFieldProps = {
  name: keyof BookingFormValues;
  placeholder: string;
  type?: string;
  as?: 'input' | 'textarea';
  rows?: number;
  disabled?: boolean;
  hasError?: boolean;
};

const FloatingField = ({
  name,
  placeholder,
  type = 'text',
  as = 'input',
  rows,
  disabled,
  hasError,
}: FloatingFieldProps) => (
  <div className={styles.fieldWrapper}>
    <Field
      as={as}
      type={type}
      name={name}
      rows={rows}
      disabled={disabled}
      placeholder={placeholder}
      className={`${styles.inputBase} ${hasError ? styles.inputError : ''} ${
        as === 'textarea' ? styles.textarea : ''
      }`}
    />
  </div>
);

const addMonths = (date: Date, count: number) => {
  const next = new Date(date.getTime());
  next.setMonth(next.getMonth() + count);
  return next;
};

const buildCalendarMatrix = (currentMonth: Date) => {
  const startOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const startOffset = (startOfMonth.getDay() + 6) % 7;
  const firstVisibleDay = new Date(startOfMonth);
  firstVisibleDay.setDate(firstVisibleDay.getDate() - startOffset);

  return Array.from({ length: 35 }, (_, index) => {
    const day = new Date(firstVisibleDay);
    day.setDate(firstVisibleDay.getDate() + index);
    return day;
  });
};

const isSameDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default BookingForm;
