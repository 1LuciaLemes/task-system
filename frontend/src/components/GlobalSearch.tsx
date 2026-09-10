import { useRef } from 'react';

interface GlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function GlobalSearch({ value, onChange, className = '' }: GlobalSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-ink-faint"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint"
          placeholder="Buscar: título, hoy, 14:30, 5 septiembre"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-faint hover:bg-slate-100 hover:text-ink"
            aria-label="Limpiar búsqueda"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}