import { Fragment, useEffect, useRef, useState } from 'react';
import { CreateTaskInput, Task, TaskKind, TaskStatus, UpdateTaskInput } from '../types/task.js';
import { STATUS_LABELS } from '../utils/labels.js';
import { isPartiallyComplete, SubtreeStats, TaskNode } from '../utils/tree.js';
import { formatDate } from '../utils/format.js';
import { pluralize } from '../utils/plural.js';
import { DropIndicator } from './DropIndicator.js';
import { PriorityBadge } from './PriorityBadge.js';
import { ProgressBar } from './ProgressBar.js';
import { StatusDot } from './StatusDot.js';
import { SubtaskRow } from './SubtaskRow.js';
import { InlineSubtaskForm } from './InlineSubtaskForm.js';
import { TaskForm } from './TaskForm.js';

interface DetailModalProps {
  task: Task;
  children: TaskNode[];
  allTasks: Task[];
  subtreeStats: Map<string, SubtreeStats>;
  initialEdit: boolean;
  onClose: () => void;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onUpdate: (id: string, input: UpdateTaskInput) => Promise<void>;
  onCreateSubtask: (parentId: string, input: CreateTaskInput) => Promise<Task>;
  onCycleStatus: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
  onMoveTask: (
    taskId: string,
    newParentId: string | null,
    position?: number,
  ) => void;
}

export function DetailModal({
  task,
  children,
  allTasks,
  subtreeStats,
  initialEdit,
  onClose,
  onOpen,
  onEdit,
  onUpdate,
  onCreateSubtask,
  onCycleStatus,
  onRequestDelete,
  onMoveTask,
}: DetailModalProps) {
  const [editing, setEditing] = useState(initialEdit);
  const [closeOnCancel, setCloseOnCancel] = useState(initialEdit);
  const [showAddForm, setShowAddForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditing(initialEdit);
    setCloseOnCancel(initialEdit);
  }, [initialEdit, task.id]);

  const handleCancelEdit = () => {
    if (closeOnCancel) {
      onClose();
    } else {
      setEditing(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
  const displayStatus = isPartiallyComplete(task, stats)
    ? TaskStatus.IN_PROGRESS
    : task.status;

  const handleIndicatorDrop = (taskId: string, index: number) => {
    let target = index;
    const currentIndex = children.findIndex((child) => child.id === taskId);
    if (currentIndex !== -1 && currentIndex < index) {
      target = index - 1;
    }
    onMoveTask(taskId, task.id, target);
  };

  return (
    <div
      className="fixed inset-0 z-40 overflow-hidden bg-white lg:flex lg:items-center lg:justify-center lg:bg-ink/40 lg:px-4 lg:py-6"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full flex-col overflow-hidden bg-white lg:h-auto lg:max-h-[92vh] lg:max-w-2xl lg:rounded-2xl lg:shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-slate-100 px-5 py-4">
          {editing ? (
            <h2 className="font-display text-base font-semibold text-ink">
              Editar tarea
              <span className="ml-2 text-sm font-normal text-ink-faint">{task.title}</span>
            </h2>
          ) : (
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => onCycleStatus(task)}
                    className="mt-0.5 shrink-0"
                    title={`Cambiar estado: ${STATUS_LABELS[displayStatus]}`}
                  >
                    <StatusDot status={displayStatus} />
                  </button>
                  <h2
                    className={`min-w-0 font-display text-base font-semibold leading-snug ${
                      task.status === TaskStatus.COMPLETE
                        ? 'text-ink-faint line-through'
                        : 'text-ink'
                    }`}
                  >
                    {task.title}
                  </h2>
                  {task.kind === TaskKind.MAIN ? (
                    <span className="shrink-0">
                      <PriorityBadge priority={task.priority} />
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 ml-6 text-sm text-ink-faint">
                  {STATUS_LABELS[displayStatus]} · {formatDate(task.createdAt)}
                </p>
              </div>
              <div ref={menuRef} className="relative flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft hover:bg-slate-100"
                  title="Acciones"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <circle cx="5" cy="12" r="1.6" />
                    <circle cx="12" cy="12" r="1.6" />
                    <circle cx="19" cy="12" r="1.6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft hover:bg-slate-100"
                  title="Cerrar"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
                {menuOpen ? (
                  <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setCloseOnCancel(false);
                        setEditing(true);
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
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {editing ? (
            <TaskForm
              task={task}
              submitLabel="Confirmar"
              onSubmit={async (input) => {
                await onUpdate(task.id, input as UpdateTaskInput);
                setEditing(false);
              }}
              onCancel={handleCancelEdit}
            />
          ) : (
            <>
              <p className="mb-1 text-xs text-ink-faint">
                {stats.complete} de {stats.total} tareas completadas
              </p>
              <ProgressBar
                complete={stats.complete}
                total={stats.total}
                className="w-full"
              />

              {task.description ? (
                <div className="mt-4">
                  <p className="mb-1 text-xs font-medium text-ink-faint">Descripción</p>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {task.description}
                  </p>
                </div>
              ) : null}

              <div className="mt-4 text-xs text-ink-faint">
                Creada el {formatDate(task.createdAt)} · Actualizada el{' '}
                {formatDate(task.updatedAt)}
              </div>
            </>
          )}

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-ink">Subtareas</h3>
                {children.length > 0 ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs tabular-nums text-ink-soft">
                    {
                      children.filter(
                        (child) => child.status === TaskStatus.COMPLETE,
                      ).length
                    }
                    /{pluralize(children.length, 'subtarea')}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm((value) => !value)}
                className="rounded-lg px-2 py-1 text-sm font-medium text-brand hover:bg-brand-light"
              >
                + Añadir subtarea
              </button>
            </div>

            {showAddForm ? (
              <InlineSubtaskForm
                onSubmit={async (input) => {
                  await onCreateSubtask(task.id, input);
                  setShowAddForm(false);
                }}
                onCancel={() => setShowAddForm(false)}
              />
            ) : null}

            {children.length > 0 ? (
              <div className="mt-2 flex flex-col">
                {children.map((child, index) => (
                  <Fragment key={child.id}>
                    <DropIndicator
                      index={index}
                      onDrop={handleIndicatorDrop}
                      block
                    />
                    <SubtaskRow
                      task={child}
                      children={child.children}
                      depth={0}
                      variant={child.kind === TaskKind.MAIN ? 'card' : 'row'}
                      stats={
                        child.kind === TaskKind.MAIN
                          ? subtreeStats.get(child.id) ?? { total: 0, complete: 0 }
                          : undefined
                      }
                      subtreeStats={subtreeStats}
                      onOpen={onOpen}
                      onEdit={onEdit}
                      onCycleStatus={onCycleStatus}
                      onCreateSubtask={onCreateSubtask}
                      onRequestDelete={onRequestDelete}
                      onMoveTask={onMoveTask}
                    />
                  </Fragment>
                ))}
                <DropIndicator
                  index={children.length}
                  onDrop={handleIndicatorDrop}
                  block
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}