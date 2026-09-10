interface ProgressBarProps {
  complete: number;
  total: number;
  className?: string;
  fillClassName?: string;
}

export function ProgressBar({
  complete,
  total,
  className = '',
  fillClassName = total > 0 && complete >= total ? 'bg-emerald-500' : 'bg-brand',
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((complete / total) * 100) : 0;
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <div
        className={`h-full rounded-full transition-all ${fillClassName}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}