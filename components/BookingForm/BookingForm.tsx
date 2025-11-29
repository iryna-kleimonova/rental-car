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
  startDate: string;
  endDate: string;
  comment: string;
};

const DEFAULT_FORM_VALUES: BookingFormValues = {
  name: '',
  email: '',
  startDate: '',
  endDate: '',
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
  bookingDate: Yup.string(),
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
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [dateSelectionMode, setDateSelectionMode] = useState<'start' | 'end'>('start');
  
  const visibleMonth = useMemo(
    () => new Date(selectedYear, selectedMonth, 1),
    [selectedYear, selectedMonth]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(values));
  }, [storageKey, values]);

  useEffect(() => {
    const activeDate = values.startDate || values.endDate;
    if (!activeDate) return;
    const date = new Date(activeDate);
    const timer = setTimeout(() => {
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth());
    }, 0);
    return () => clearTimeout(timer);
  }, [values.startDate, values.endDate]);

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

  const formatDateRange = () => {
    if (values.startDate && values.endDate) {
      const start = new Date(values.startDate);
      const end = new Date(values.endDate);
      return `${start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} - ${end.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }
    if (values.startDate) {
      const start = new Date(values.startDate);
      return `From ${start.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }
    return '';
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const isInRange = (date: Date) => {
    if (!values.startDate || !values.endDate) return false;
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const start = new Date(values.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(values.endDate);
    end.setHours(0, 0, 0, 0);
    return checkDate >= start && checkDate <= end;
  };

  const handleDateSelect = (date: Date) => {
    if (isPastDate(date)) {
      return;
    }

    const dateStr = date.toISOString();
    const isStart = values.startDate && isSameDate(new Date(values.startDate), date);
    const isEnd = values.endDate && isSameDate(new Date(values.endDate), date);

    // Якщо клікнули на startDate, очистити обидві дати
    if (isStart) {
      setFieldValue('startDate', '');
      setFieldValue('endDate', '');
      setDateSelectionMode('start');
      return;
    }

    // Якщо клікнули на endDate, очистити тільки endDate
    if (isEnd) {
      setFieldValue('endDate', '');
      setDateSelectionMode('end');
      return;
    }

    if (dateSelectionMode === 'start' || !values.startDate) {
      // Якщо вибрана дата після endDate, очистити endDate
      if (values.endDate && date > new Date(values.endDate)) {
        setFieldValue('endDate', '');
      }
      setFieldValue('startDate', dateStr);
      setDateSelectionMode('end');
    } else {
      // Якщо вибрана дата до startDate, встановити її як startDate
      if (values.startDate && date < new Date(values.startDate)) {
        setFieldValue('startDate', dateStr);
        setFieldValue('endDate', '');
        setDateSelectionMode('end');
      } else if (dateStr === values.startDate) {
        // Якщо вибрали ту саму дату, очистити
        setFieldValue('startDate', '');
        setFieldValue('endDate', '');
        setDateSelectionMode('start');
      } else {
        setFieldValue('endDate', dateStr);
        // Закрити календар після вибору обох дат
        if (values.startDate) {
          setIsCalendarOpen(false);
        }
      }
    }
  };

  const handleYearChange = (year: number) => {
    const currentYear = new Date().getFullYear();
    const minYear = currentYear;
    const maxYear = currentYear + 9;
    const clampedYear = Math.max(minYear, Math.min(maxYear, year));
    setSelectedYear(clampedYear);
  };

  const handleMonthChange = (month: number) => {
    const clampedMonth = Math.max(0, Math.min(11, month));
    setSelectedMonth(clampedMonth);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
        <Field name="startDate">
          {({ field }: FieldProps) => (
            <input
              {...field}
              ref={bookingInputRef}
              readOnly
              value={formatDateRange()}
              onClick={() => {
                setIsCalendarOpen((prev) => !prev);
                if (!values.startDate) {
                  setDateSelectionMode('start');
                } else if (!values.endDate) {
                  setDateSelectionMode('end');
                }
              }}
              onFocus={() => {
                setIsCalendarOpen(true);
                if (!values.startDate) {
                  setDateSelectionMode('start');
                } else if (!values.endDate) {
                  setDateSelectionMode('end');
                }
              }}
              className={`${styles.inputBase} ${
                (errors.startDate && touched.startDate) ||
                (errors.endDate && touched.endDate)
                  ? styles.inputError
                  : ''
              }`}
              placeholder="Booking date range"
            />
          )}
        </Field>
        {isCalendarOpen && (
          <div className={styles.calendarPopover} ref={calendarRef}>
            <div className={styles.calendarHeader}>
              <div className={styles.calendarDateSelectors}>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMonth === 0) {
                      const newYear = selectedYear - 1;
                      if (newYear >= currentYear) {
                        setSelectedYear(newYear);
                        setSelectedMonth(11);
                      }
                    } else {
                      setSelectedMonth(selectedMonth - 1);
                    }
                  }}
                  disabled={selectedYear === currentYear && selectedMonth === 0}
                  className={styles.navButton}
                  aria-label="Previous month"
                >
                  <svg
                    className={`${styles.navIcon} ${styles.navIconLeft}`}
                    viewBox="0 0 32 32"
                  >
                    <use href="#icon-up" />
                  </svg>
                </button>
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(Number(e.target.value))}
                  className={styles.monthSelector}
                  aria-label="Select month"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
                <div className={styles.yearSelector}>
                  <input
                    type="text"
                    value={selectedYear}
                    readOnly
                    className={styles.yearInput}
                    aria-label="Selected year"
                  />
                  <div className={styles.yearButtons}>
                    <button
                      type="button"
                      onClick={() => {
                        const newYear = selectedYear + 1;
                        if (newYear <= currentYear + 9) {
                          handleYearChange(newYear);
                        }
                      }}
                      disabled={selectedYear >= currentYear + 9}
                      className={styles.yearButton}
                      aria-label="Increase year"
                    >
                      <svg
                        className={styles.yearButtonIcon}
                        viewBox="0 0 32 32"
                        width="12"
                        height="12"
                      >
                        <use href="#icon-up" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newYear = selectedYear - 1;
                        if (newYear >= currentYear) {
                          handleYearChange(newYear);
                        }
                      }}
                      disabled={selectedYear <= currentYear}
                      className={styles.yearButton}
                      aria-label="Decrease year"
                    >
                      <svg
                        className={`${styles.yearButtonIcon} ${styles.yearButtonIconDown}`}
                        viewBox="0 0 32 32"
                        width="12"
                        height="12"
                      >
                        <use href="#icon-up" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMonth === 11) {
                      const newYear = selectedYear + 1;
                      if (newYear <= currentYear + 9) {
                        setSelectedYear(newYear);
                        setSelectedMonth(0);
                      }
                    } else {
                      setSelectedMonth(selectedMonth + 1);
                    }
                  }}
                  disabled={selectedYear === currentYear + 9 && selectedMonth === 11}
                  className={styles.navButton}
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
                const isStartDate =
                  values.startDate && isSameDate(new Date(values.startDate), day);
                const isEndDate =
                  values.endDate && isSameDate(new Date(values.endDate), day);
                const isRange = isInRange(day) && !isStartDate && !isEndDate;
                const isToday = isSameDate(new Date(), day);
                const isPast = isPastDate(day);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={isPast}
                    className={`${styles.calendarDay} ${isOutside ? styles.dayMuted : ''} ${
                      isStartDate ? styles.dayStart : ''
                    } ${isEndDate ? styles.dayEnd : ''} ${
                      isRange ? styles.dayInRange : ''
                    } ${isToday ? styles.dayToday : ''} ${isPast ? styles.dayDisabled : ''}`}
                    onClick={() => handleDateSelect(day)}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
            <div className={styles.calendarHint}>
              {!values.startDate
                ? 'Select start date'
                : !values.endDate
                ? 'Select end date'
                : 'Click dates to change selection'}
            </div>
          </div>
        )}
      </div>
      {(errors.startDate && touched.startDate) ||
      (errors.endDate && touched.endDate) ? (
        <span className={styles.errorText}>
          {errors.startDate || errors.endDate}
        </span>
      ) : null}

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
