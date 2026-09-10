import { EffortSummary } from '../types/task.js';

interface EffortSummaryStripProps {
  summary: EffortSummary;
}

function LegendItem({ colorClass, label, hours }: { colorClass: string; label: string; hours: number }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
      <span className="text-ink-soft">{label}</span>
      <span className="font-semibold tabular-nums text-ink">{hours}h</span>
    </span>
  );
}

export function EffortSummaryStrip({ summary }: EffortSummaryStripProps) {
  const total = summary.total > 0 ? summary.total : 1;
  const pendingWidth = (summary.pending / total) * 100;
  const inProgressWidth = (summary.inProgress / total) * 100;
  const completeWidth = (summary.complete / total) * 100;

  return (
    <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white px-5 py-3">
      <div className="shrink-0">
        <p className="text-xs text-ink-faint">Esfuerzo total</p>
        <p className="text-base font-bold tabular-nums text-ink">{summary.total}h</p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          {pendingWidth > 0 ? (
            <div className="h-full bg-slate-300" style={{ width: `${pendingWidth}%` }} />
          ) : null}
          {inProgressWidth > 0 ? (
            <div className="h-full bg-sky-400" style={{ width: `${inProgressWidth}%` }} />
          ) : null}
          {completeWidth > 0 ? (
            <div className="h-full bg-emerald-500" style={{ width: `${completeWidth}%` }} />
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <LegendItem colorClass="bg-slate-300" label="Pendiente" hours={summary.pending} />
          <LegendItem colorClass="bg-sky-400" label="En progreso" hours={summary.inProgress} />
          <LegendItem colorClass="bg-emerald-500" label="Completada" hours={summary.complete} />
        </div>
      </div>
    </div>
  );
}