import { DragEvent, Fragment, MouseEvent, useEffect, useRef, useState } from 'react';
import { CreateTaskInput, Task, TaskKind, TaskStatus } from '../types/task.js';
import { STATUS_LABELS } from '../utils/labels.js';
import { pluralize } from '../utils/plural.js';
import { SubtreeStats, TaskNode } from '../utils/tree.js';
import { DropIndicator } from './DropIndicator.js';
import { InlineSubtaskForm } from './InlineSubtaskForm.js';
import { PriorityBadge } from './PriorityBadge.js';
import { ProgressBar } from './ProgressBar.js';
import { StatusDot } from './StatusDot.js';
import { createTransparentDragImage, useDragState } from '../state/DragState.js';

interface SubtaskRowProps {
  task: Task;
  children: TaskNode[];
  depth: number;
  variant?: 'row' | 'card';
  stats?: { total: number; complete: number };
  subtreeStats?: Map<string, SubtreeStats>;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onCycleStatus: (task: Task) => void;
  onCreateSubtask: (parentId: string, input: CreateTaskInput) => void;
  onRequestDelete: (task: Task) => void;
  onMoveTask: (
    taskId: string,
    newParentId: string | null,
    position?: number,
  ) => void;
}

export function SubtaskRow({
  task,
  children,
  depth,
  variant = 'row',
  stats,
  subtreeStats,
  onOpen,
  onEdit,
  onCycleStatus,
  onCreateSubtask,
  onRequestDelete,
  onMoveTask,
}: SubtaskRowProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    right: number;
    up: boolean;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { draggedId, beginDrag } = useDragState();

  const toggleMenu = (event: MouseEvent<HTMLButtonElement>) => {
    if (menuStyle) {
      setMenuStyle(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setMenuStyle({
      top: rect.top,
      right: window.innerWidth - rect.right,
      up: spaceBelow < 190,
    });
  };

  useEffect(() => {
    if (!menuStyle) {
      return;
    }
    const close = () => setMenuStyle(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menuStyle]);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuStyle(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
    draggedTask: Task,
  ) => {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedTask.id);
    event.dataTransfer.setDragImage(createTransparentDragImage(), 0, 0);
    const rect = event.currentTarget.getBoundingClientRect();
    beginDrag(
      {
        taskId: draggedTask.id,
        title: draggedTask.title,
        kind: 'subtask',
        width: rect.width,
        height: rect.height,
      },
      event.clientX,
      event.clientY,
    );
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    if (!dragOver) {
      setDragOver(true);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    const taskId = event.dataTransfer.getData('text/plain');
    if (taskId && taskId !== task.id) {
      onMoveTask(taskId, task.id);
    }
  };

  const handleIndicatorDrop = (taskId: string, index: number) => {
    let target = index;
    const currentIndex = children.findIndex((child) => child.id === taskId);
    if (currentIndex !== -1 && currentIndex < index) {
      target = index - 1;
    }
    onMoveTask(taskId, task.id, target);
  };

  const pct = stats && stats.total > 1
    ? Math.round((stats.complete / stats.total) * 100)
    : 0;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      data-drop-target
      className={`transition-colors ${
        variant === 'card'
          ? `rounded-xl border bg-white p-2.5 shadow-sm ${
              dragOver ? 'border-brand ring-1 ring-brand' : 'border-slate-200'
            }`
          : `rounded-xl border bg-white ${
              dragOver
                ? 'border-brand bg-brand-light ring-1 ring-brand'
                : 'border-slate-200'
            }`
      }`}
    >
      <div
        draggable
        onDragStart={(event) => handleDragStart(event, task)}
        className={`group transition-colors active:cursor-grabbing ${
          variant === 'card'
            ? 'flex cursor-grab flex-col gap-1.5 rounded-lg'
            : `flex cursor-grab items-center gap-1.5 rounded-lg py-1.5 hover:bg-slate-50 ${
                dragOver ? 'bg-brand-light' : ''
              }`
        } ${draggedId === task.id ? 'opacity-40' : ''}`}
        style={{ paddingLeft: variant === 'card' ? 0 : `${4 + depth * 14}px` }}
      >
        <div className="flex w-full items-center gap-1.5">
          <button
            type="button"
            onClick={() => onCycleStatus(task)}
            className="flex h-6 w-6 shrink-0 items-center justify-center"
            title={`Cambiar estado: ${STATUS_LABELS[task.status]}`}
          >
            <StatusDot status={task.status} size="sm" />
          </button>

          <button
            type="button"
            onClick={() => onOpen(task)}
            className={`min-w-0 flex-1 text-left ${
              variant === 'card' ? 'font-display text-sm font-semibold' : ''
            } ${
              task.status === TaskStatus.COMPLETE
                ? 'text-ink-faint'
                : 'text-ink'
            }`}
          >
            <span
              className={`block truncate ${
                task.status === TaskStatus.COMPLETE ? 'line-through' : ''
              }`}
            >
              {task.title}
            </span>
            {variant !== 'card' && children.length > 0 ? (
              <span className="block truncate text-xs text-ink-faint">
                {pluralize(children.length, 'subtarea')}
              </span>
            ) : null}
          </button>

          {task.kind === TaskKind.MAIN && variant === 'card' ? (
            <span className="shrink-0">
              <PriorityBadge priority={task.priority} />
            </span>
          ) : null}

          {children.length > 0 ? (
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="flex h-6 w-6 shrink-0 items-center justify-center text-ink-faint hover:text-ink"
              title={collapsed ? 'Expandir' : 'Contraer'}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {collapsed ? (
                  <path d="m9 6 6 6-6 6" />
                ) : (
                  <path d="m6 9 6 6 6-6" />
                )}
              </svg>
            </button>
          ) : null}

          <div
            ref={menuRef}
            className={`relative mr-1 shrink-0 transition-opacity group-hover:opacity-100 ${
              variant === 'card' ? '' : 'opacity-0'
            }`}
          >
            <button
              type="button"
              onClick={toggleMenu}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-soft hover:bg-slate-100"
              title="Acciones"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <circle cx="5" cy="12" r="1.6" />
                <circle cx="12" cy="12" r="1.6" />
                <circle cx="19" cy="12" r="1.6" />
              </svg>
            </button>
            {menuStyle ? (
              <div
                className="fixed z-50 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                style={{
                  top: menuStyle.up ? menuStyle.top - 4 : menuStyle.top + 28,
                  right: menuStyle.right,
                  transform: menuStyle.up ? 'translateY(-100%)' : undefined,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuStyle(null);
                    onEdit(task);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-slate-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuStyle(null);
                    setShowAddForm(true);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-slate-50"
                >
                  Añadir subtarea
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuStyle(null);
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

        {variant === 'card' && children.length > 0 ? (
          <div className="flex w-full items-center px-1 text-xs text-ink-faint">
            {pluralize(children.length, 'subtarea')} · {pct}%
          </div>
        ) : null}

        {variant === 'card' && stats && stats.total > 1 ? (
          <div className="flex w-full items-center gap-2 px-1">
            <ProgressBar
              complete={stats.complete}
              total={stats.total}
              className="flex-1"
            />
            <span className="shrink-0 text-xs font-semibold tabular-nums text-ink">
              {pct}%
            </span>
          </div>
        ) : null}
      </div>

      {showAddForm ? (
        <div
          className="mt-3 w-full pb-2"
          style={{
            paddingLeft: `${4 + (depth + 1) * 14}px`,
            paddingRight: `${4 + (depth + 1) * 14}px`,
          }}
        >
          <InlineSubtaskForm
            onSubmit={(input) => {
              void onCreateSubtask(task.id, input);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      ) : null}

      {!collapsed && children.length > 0 ? (
        <div className="ml-3 mb-2 mt-1 flex flex-col border-l border-slate-100 pl-1 pr-2">
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
                depth={depth + 1}
                variant={child.kind === TaskKind.MAIN ? 'card' : 'row'}
                stats={
                  child.kind === TaskKind.MAIN
                    ? subtreeStats?.get(child.id) ?? { total: 0, complete: 0 }
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
  );
}