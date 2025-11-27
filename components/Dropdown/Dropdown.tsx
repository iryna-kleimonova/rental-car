'use client';

import {
  KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './Dropdown.module.css';

export type DropdownOption = {
  value: string;
  label: string;
};

type DropdownProps = {
  label: string;
  placeholder: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  clearLabel?: string;
  formatSelectedLabel?: (label: string) => string;
  maxHeight?: number;
};

export default function Dropdown({
  label,
  placeholder,
  value,
  options,
  onChange,
  clearLabel,
  formatSelectedLabel,
  maxHeight = 272,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const enhancedOptions = useMemo(() => options, [options]);
  const listOptions = useMemo(() => {
    if (clearLabel) {
      return [{ value: '', label: clearLabel }, ...enhancedOptions];
    }
    return enhancedOptions;
  }, [clearLabel, enhancedOptions]);

  const selectedIndex = enhancedOptions.findIndex(
    (option) => option.value === value
  );
  const selectedListIndex = listOptions.findIndex(
    (option) => option.value === value
  );
  const isDisabled = listOptions.length === 0;
  const rawDisplayLabel =
    selectedIndex >= 0 ? enhancedOptions[selectedIndex].label : placeholder;
  const displayLabel =
    selectedIndex >= 0 && formatSelectedLabel
      ? formatSelectedLabel(rawDisplayLabel)
      : rawDisplayLabel;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const newIndex = selectedListIndex >= 0 ? selectedListIndex : 0;
      setTimeout(() => {
        setHighlightedIndex(newIndex);
      }, 0);
    }
  }, [isOpen, selectedListIndex]);

  const handleToggle = () => {
    if (isDisabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) =>
        prev + 1 < listOptions.length ? prev + 1 : 0
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) =>
        prev - 1 >= 0 ? prev - 1 : listOptions.length - 1
      );
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const option = listOptions[highlightedIndex];
        if (option) {
          selectOption(option.value);
        }
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectOption = (newValue: string) => {
    onChange(newValue);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div className={styles.dropdown} ref={wrapperRef}>
      <span className={styles.label} id={`${dropdownId}-label`}>
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${dropdownId}-label`}
        className={styles.trigger}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        ref={buttonRef}
        disabled={isDisabled}
      >
        <span className={selectedIndex >= 0 ? undefined : styles.placeholder}>
          {displayLabel}
        </span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          width="16"
          height="16"
          viewBox="0 0 32 32"
          role="presentation"
        >
          <use href="#icon-down" />
        </svg>
      </button>

      {isOpen && (
        <ul
          className={styles.list}
          role="listbox"
          aria-labelledby={`${dropdownId}-label`}
          style={{ maxHeight: `${maxHeight}px` }}
        >
          {listOptions.map((option, index) => {
            const isSelected = option.value === value;
            const optionClass = [
              styles.option,
              index === highlightedIndex ? styles.optionActive : '',
              isSelected && option.value !== '' ? styles.optionSelected : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <li
                key={`${option.value || option.label}-${index}`}
                role="option"
                aria-selected={isSelected}
                className={optionClass}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option.value);
                }}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
