import { Task, TaskStatus } from '../types/task.js';
import { isPartiallyComplete, SubtreeStats } from '../utils/tree.js';
import { STATUS_LABELS } from '../utils/labels.js';
import { formatRelativeDate } from '../utils/format.js';

interface MobileTaskCardProps {
  task: Task;
  stats: SubtreeStats;
  onOpen: (task: Task) => void;
}

export function MobileTaskCard({ task, stats, onOpen }: MobileTaskCardProps) {
  const displayStatus = isPartiallyComplete(task, stats)
    ? TaskStatus.IN_PROGRESS
    : task.status;
  return (
    <button
      type="button"
      onClick={() => onOpen(task)}
      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
    >
      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-display text-sm font-semibold ${
            task.status === TaskStatus.COMPLETE
              ? 'text-ink-faint line-through'
              : 'text-ink'
          }`}
        >
          {task.title}
        </p>
        <p className="mt-0.5 text-xs text-ink-faint">
          {STATUS_LABELS[displayStatus]} · {formatRelativeDate(task.createdAt)}
        </p>
      </div>
      {stats.total > 0 ? (
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
            stats.complete > 0
              ? 'bg-brand-light text-brand-deep'
              : 'bg-slate-100 text-ink-faint'
          }`}
        >
          {stats.complete}/{stats.total}
        </span>
      ) : null}
    </button>
  );
}