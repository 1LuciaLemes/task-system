import { Task } from '../types/task.js';
import { computeSubtreeStats, getRootTasks } from '../utils/tree.js';
import {
  SORT_LABELS,
  SortBy,
  VIEW_LABELS,
  ViewFilter,
} from '../utils/labels.js';
import { ProgressBar } from './ProgressBar.js';

interface SidebarProps {
  view: ViewFilter;
  onViewChange: (view: ViewFilter) => void;
  sortBy: SortBy;
  onSortChange: (sortBy: SortBy) => void;
  tasks: Task[];
  className?: string;
}

export function Sidebar({
  view,
  onViewChange,
  sortBy,
  onSortChange,
  tasks,
  className = '',
}: SidebarProps) {
  const stats = computeSubtreeStats(tasks);
  let total = 0;
  let complete = 0;
  for (const value of stats.values()) {
    total += value.total;
    complete += value.complete;
  }
  const percentage = total > 0 ? Math.round((complete / total) * 100) : 0;
  const roots = getRootTasks(tasks);
  const pendingRoots = roots.filter((task) => task.status !== 'COMPLETE').length;
  const completedRoots = roots.filter((task) => task.status === 'COMPLETE').length;
  const views: { key: ViewFilter; count: number }[] = [
    { key: 'board', count: roots.length },
    { key: 'pending', count: pendingRoots },
    { key: 'completed', count: completedRoots },
  ];
  return (
    <aside
      className={`flex w-64 shrink-0 flex-col gap-3 overflow-y-auto p-3 pt-10 ${className}`}
    >
      <div className="flex items-center gap-2.5 rounded-xl bg-white p-3.5 shadow-sm">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink font-display text-base font-bold text-white">
          T
        </span>
        <div className="min-w-0">
          <h1 className="truncate font-display text-base font-bold text-ink">
            Task System
          </h1>
          <p className="text-xs text-ink-faint">Panel de tareas</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 rounded-xl bg-white p-3.5 shadow-sm">
        <p className="px-2 pb-0.5 pt-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Vistas
        </p>
        {views.map(({ key, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => onViewChange(key)}
            className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm font-medium transition-colors ${
              view === key ? 'bg-brand-light text-brand-deep' : 'text-ink-soft hover:bg-slate-100'
            }`}
          >
            <span>{VIEW_LABELS[key]}</span>
            <span className="shrink-0 text-xs tabular-nums text-ink-faint">
              {count}
            </span>
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-1 rounded-xl bg-white p-3.5 shadow-sm">
        <p className="px-2 pb-0.5 pt-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Ordenar
        </p>
        {Object.entries(SORT_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSortChange(key as SortBy)}
            className={`rounded-lg px-2 py-1.5 text-left text-sm font-medium transition-colors ${
              sortBy === key ? 'bg-brand-light text-brand-deep' : 'text-ink-soft hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5 rounded-xl bg-white p-3.5 shadow-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Progreso
          </span>
          <span className="text-sm font-semibold tabular-nums text-ink">{percentage}%</span>
        </div>
        <ProgressBar complete={complete} total={total} />
        <p className="text-xs text-ink-faint">
          {complete} de {total} tareas completadas
        </p>
      </div>
    </aside>
  );
}