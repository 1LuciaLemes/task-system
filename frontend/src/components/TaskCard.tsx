import { DragEvent, useEffect, useRef, useState } from 'react';
import { CreateTaskInput, Task, TaskStatus } from '../types/task.js';
import { isPartiallyComplete, SubtreeStats, TaskNode } from '../utils/tree.js';
import { STATUS_LABELS } from '../utils/labels.js';
import { formatRelativeDate, truncateDescription } from '../utils/format.js';
import { pluralize } from '../utils/plural.js';
import { PriorityBadge } from './PriorityBadge.js';
import { ProgressBar } from './ProgressBar.js';
import { StatusDot } from './StatusDot.js';
import { SubtaskRow } from './SubtaskRow.js';
import { InlineSubtaskForm } from './InlineSubtaskForm.js';

interface TaskCardProps {
  task: Task;
  children: TaskNode[];
  subtreeStats: Map<string, SubtreeStats>;
  focused?: boolean;
  onFocusConsumed?: () => void;
  onOpen: (task: Task) => void;
  onRequestEdit: (task: Task) => void;
  onEdit: (task: Task) => void;
  onCycleStatus: (task: Task) => void;
  onCreateSubtask: (parentId: string, input: CreateTaskInput) => Promise<Task>;
  onRequestDelete: (task: Task) => void;
  onMoveTask: (taskId: string, newParentId: string | null) => void;
}

export function TaskCard({
  task,
  children,
  subtreeStats,
  focused = false,
  onFocusConsumed,
  onOpen,
  onRequestEdit,
  onEdit,
  onCycleStatus,
  onCreateSubtask,
  onRequestDelete,
  onMoveTask,
}: TaskCardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focused && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      onFocusConsumed?.();
    }
  }, [focused, onFocusConsumed]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stats = subtreeStats.get(task.id) ?? { total: 0, complete: 0 };
  const directChildrenCount = children.length;
  const truncatedDescription = truncateDescription(task.description);
  const showDescription = task.description !== null && task.description !== undefined;
  const pct = stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0;
  const displayStatus = isPartiallyComplete(task, stats)
    ? TaskStatus.IN_PROGRESS
    : task.status;

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes('text/plain')) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      if (!dragOver) {
        setDragOver(true);
      }
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const taskId = event.dataTransfer.getData('text/plain');
    if (taskId && taskId !== task.id) {
      onMoveTask(taskId, task.id);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`flex w-[334px] max-h-full shrink-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow ${
        dragOver ? 'ring-2 ring-brand ring-offset-1' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="cursor-pointer px-4 pb-3 pt-4" onClick={() => onOpen(task)}>
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onCycleStatus(task);
            }}
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center"
            title={`Cambiar estado: ${STATUS_LABELS[task.status]}`}
          >
            <StatusDot status={displayStatus} size="sm" />
          </button>
          <h3
            className={`min-w-0 flex-1 font-display text-sm font-semibold leading-snug ${
              task.status === 'COMPLETE'
                ? 'text-ink-faint line-through'
                : 'text-ink'
            }`}
          >
            {task.title}
          </h3>
          <span className="shrink-0">
            <PriorityBadge priority={task.priority} />
          </span>
        </div>

        <div className="mt-1 pl-7 text-xs text-ink-faint">
          {pluralize(directChildrenCount, 'subtarea')} · {formatRelativeDate(task.createdAt)}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <ProgressBar complete={stats.complete} total={stats.total} className="flex-1" />
          {stats.total > 0 ? (
            <span
              className={`shrink-0 text-xs font-semibold tabular-nums ${
                pct === 100 ? 'text-emerald-500' : 'text-ink'
              }`}
            >
              {pct}%
            </span>
          ) : null}
        </div>

        {showDescription ? (
          <p
            className={`mt-2 text-xs leading-relaxed ${
              task.status === 'COMPLETE'
                ? 'text-ink-faint line-through'
                : 'text-ink-soft'
            }`}
          >
            {truncatedDescription}
          </p>
        ) : null}
      </div>

      {directChildrenCount > 0 ? (
        <div className="min-h-0 flex-1 overflow-y-auto rounded-b-2xl border-t border-slate-200 bg-slate-50 pb-4 pl-2 pr-3 pt-2">
          <div className="flex flex-col gap-2">
            {children.map((child) => (
              <SubtaskRow
                key={child.id}
                task={child}
                children={child.children}
                depth={0}
                onOpen={onOpen}
                onEdit={onEdit}
                onCycleStatus={onCycleStatus}
                onCreateSubtask={onCreateSubtask}
                onRequestDelete={onRequestDelete}
                onMoveTask={onMoveTask}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div
        className={`relative border-t border-slate-100 px-3 py-2 ${
          showAddForm ? '' : 'flex items-center justify-between gap-2'
        }`}
      >
        {showAddForm ? (
          <InlineSubtaskForm
            onSubmit={async (input) => {
              await onCreateSubtask(task.id, input);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="rounded-lg px-2 py-1 text-sm font-medium text-brand hover:bg-brand-light"
            >
              + Añadir subtarea
            </button>
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-soft hover:bg-slate-100"
                title="Acciones"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <circle cx="5" cy="12" r="1.6" />
                  <circle cx="12" cy="12" r="1.6" />
                  <circle cx="19" cy="12" r="1.6" />
                </svg>
              </button>
              {menuOpen ? (
                <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onRequestEdit(task);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-slate-50"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onRequestDelete(task);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}