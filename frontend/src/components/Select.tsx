import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  renderOption?: (option: SelectOption<T>) => ReactNode;
  renderValue?: (option: SelectOption<T> | undefined) => ReactNode;
  ariaLabel: string;
}

interface DropdownRect {
  top: number;
  left: number;
  width: number;
}

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-ink-faint"
    >
      <path d="M6 8 l4 4 l4 -4" />
    </svg>
  );
}

export function Select<T extends string>({
  value,
  options,
  onChange,
  renderOption,
  renderValue,
  ariaLabel,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DropdownRect | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!open && wrapperRef.current) {
      const bounds = wrapperRef.current.getBoundingClientRect();
      setRect({ top: bounds.bottom, left: bounds.left, width: bounds.width });
    }
    setOpen((value) => !value);
  };

  const handleSelect = (option: SelectOption<T>) => {
    onChange(option.value);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inWrapper = wrapperRef.current?.contains(target) ?? false;
      const inDropdown = dropdownRef.current?.contains(target) ?? false;
      if (!inWrapper && !inDropdown) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScrollOrResize = () => {
      if (open && wrapperRef.current) {
        const bounds = wrapperRef.current.getBoundingClientRect();
        setRect({ top: bounds.bottom, left: bounds.left, width: bounds.width });
      }
    };
    document.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [open]);

  const current = options.find((option) => option.value === value);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand"
      >
        <span className="flex min-w-0 items-center gap-2">
          {renderValue ? renderValue(current) : current?.label}
        </span>
        <span
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <ChevronDown />
        </span>
      </button>

      {open && rect
        ? createPortal(
            <div
              ref={dropdownRef}
              className="fixed z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
              style={{ top: rect.top, left: rect.left, width: rect.width }}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                    option.value === value
                      ? 'bg-brand-light text-brand-deep'
                      : 'text-ink hover:bg-slate-50'
                  }`}
                >
                  {renderOption ? renderOption(option) : option.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}