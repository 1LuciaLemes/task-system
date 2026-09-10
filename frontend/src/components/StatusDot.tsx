import { TaskStatus } from '../types/task.js';

interface StatusDotProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

const SIZE_CLASSES = {
  sm: 'h-4 w-4',
  md: 'h-[18px] w-[18px]',
} as const;

const CHECK_CLASSES = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
} as const;

export function StatusDot({ status, size = 'md' }: StatusDotProps) {
  if (status === TaskStatus.PENDING) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full border-2 border-slate-400 bg-white ${SIZE_CLASSES[size]}`}
        aria-label="Pendiente"
      />
    );
  }
  if (status === TaskStatus.IN_PROGRESS) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-slate-600 ${SIZE_CLASSES[size]}`}
        aria-label="En progreso"
      />
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand ${SIZE_CLASSES[size]}`}
      aria-label="Completada"
    >
      <svg
        viewBox="0 0 10 10"
        className={`${CHECK_CLASSES[size]} text-white`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 5.5 L4 7.5 L8 3" />
      </svg>
    </span>
  );
}