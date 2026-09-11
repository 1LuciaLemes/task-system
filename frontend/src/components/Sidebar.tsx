import { Task } from '../types/task.js';
import { computeSubtreeStats, getRootTasks } from '../utils/tree.js';
import { VIEW_LABELS, ViewFilter } from '../utils/labels.js';
import { getEffortSummary, getWeightedProgress } from '../utils/effort.js';

interface SidebarProps {
  view: ViewFilter;
  onViewChange: (view: ViewFilter) => void;
  tasks: Task[];
  onClose?: () => void;
  className?: string;
}

export function Sidebar({
  view,
  onViewChange,
  tasks,
  onClose,
  className = '',
}: SidebarProps) {
  const stats = computeSubtreeStats(tasks);
  const roots = getRootTasks(tasks);
  let total = 0;
  let complete = 0;
  for (const root of roots) {
    const rootStats = stats.get(root.id);
    if (rootStats) {
      total += rootStats.total;
      complete += rootStats.complete;
    }
  }
  const pendingRoots = roots.filter((task) => task.status !== 'COMPLETE').length;
  const completedRoots = roots.filter((task) => task.status === 'COMPLETE').length;
  const effortSummary = getEffortSummary(tasks);
  const weighted = getWeightedProgress(tasks);
  const progressPercent =
    weighted.total > 0 ? (weighted.complete / weighted.total) * 100 : 0;
  const views: { key: ViewFilter; count: number }[] = [
    { key: 'board', count: roots.length },
    { key: 'pending', count: pendingRoots },
    { key: 'completed', count: completedRoots },
  ];
  return (
    <aside className={`flex shrink-0 flex-col space-y-5 self-start ${className}`}>
      <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-[0_1px_0_rgba(15,22,32,0.04)]">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-lg bg-ink">
              <span className="font-display text-lg font-bold leading-none text-surface">T</span>
            </div>
            <div>
              <p className="font-display text-[15px] font-bold leading-none tracking-tight">
                Task System
              </p>
              <p className="mt-1 text-[11px] text-ink/45">Panel de tareas</p>
            </div>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar panel"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft hover:bg-slate-100"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-3 shadow-[0_1px_0_rgba(15,22,32,0.04)]">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/40">
          Vistas
        </p>
        <div className="flex flex-col gap-1 text-sm">
          {views.map(({ key, count }) => (
            <span
              key={key}
              onClick={() => onViewChange(key)}
              className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                view === key
                  ? 'bg-brand/10 font-semibold text-brand'
                  : 'text-ink/70 hover:bg-slate-100'
              }`}
            >
              {VIEW_LABELS[key]}
              <span className={`text-[11px] ${view === key ? '' : 'text-ink/35'}`}>{count}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-[#d9e5fb] p-5 shadow-[0_1px_0_rgba(15,22,32,0.04)]">
        <p className="font-display text-[15px] font-bold leading-tight text-ink">Progreso</p>
        <p className="mb-3 mt-0.5 text-[12px] text-ink/55">Tareas del tablero</p>
        <div className="h-2 overflow-hidden rounded-full bg-slate-300">
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-ink/55">
          {complete} de {total} tareas completadas
        </p>
        <p className="mt-0.5 text-[11px] text-ink/55">
          {Math.round(effortSummary.complete * 100) / 100} de{' '}
          {Math.round(effortSummary.total * 100) / 100} h completadas
        </p>
      </div>
    </aside>
  );
}