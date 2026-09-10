import { DragEvent, Fragment, useEffect, useRef, useState } from 'react';
import { CreateTaskInput, Task, TaskKind, TaskStatus } from '../types/task.js';
import { getAncestorIds, isPartiallyComplete, SubtreeStats, TaskNode } from '../utils/tree.js';
import { STATUS_LABELS } from '../utils/labels.js';
import { formatRelativeDate, truncateDescription } from '../utils/format.js';
import { pluralize } from '../utils/plural.js';
import { DropIndicator } from './DropIndicator.js';
import { PriorityBadge } from './PriorityBadge.js';
import { ProgressBar } from './ProgressBar.js';
import { StatusDot } from './StatusDot.js';
import { SubtaskRow } from './SubtaskRow.js';
import { InlineSubtaskForm } from './InlineSubtaskForm.js';
import { createTransparentDragImage, useDragState } from '../state/DragState.js';

interface TaskCardProps {
  task: Task;
  tasks: Task[];
  children: TaskNode[];
  subtreeStats: Map<string, SubtreeStats>;
  focused?: boolean;
  highlightedIds?: string[] | null;
  searchHighlighted?: boolean;
  onFocusConsumed?: () => void;
  onOpen: (task: Task) => void;
  onRequestEdit: (task: Task) => void;
  onEdit: (task: Task) => void;
  onCycleStatus: (task: Task) => void;
  onCreateSubtask: (parentId: string, input: CreateTaskInput) => Promise<Task>;
  onRequestDelete: (task: Task) => void;
  onMoveTask: (
    taskId: string,
    newParentId: string | null,
    position?: number,
  ) => void;
}

export function TaskCard({
  task,
  tasks,
  children,
  subtreeStats,
  focused = false,
  highlightedIds = null,
  searchHighlighted = false,
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
  const [scrollVisible, setScrollVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const scrollHideTimer = useRef<number | null>(null);
  const { draggedId, beginDrag } = useDragState();

  useEffect(() => {
    return () => {
      if (scrollHideTimer.current) {
        window.clearTimeout(scrollHideTimer.current);
      }
    };
  }, []);

  const handleChildrenScroll = () => {
    setScrollVisible(true);
    if (scrollHideTimer.current) {
      window.clearTimeout(scrollHideTimer.current);
    }
    scrollHideTimer.current = window.setTimeout(() => {
      setScrollVisible(false);
    }, 2500);
  };

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

  const MAX_CHILDREN_VISIBLE = 4;
  const ROW_HEIGHT = 44;
  const CARD_ROW_HEIGHT = 120;
  const INDICATOR_HEIGHT = 8;
  const CHILDREN_PADDING = 32;
  const childrenMaxHeight =
    children.length > MAX_CHILDREN_VISIBLE
      ? CHILDREN_PADDING +
        children
          .slice(0, MAX_CHILDREN_VISIBLE)
          .reduce(
            (sum, child) =>
              sum +
              INDICATOR_HEIGHT +
              (child.kind === TaskKind.MAIN ? CARD_ROW_HEIGHT : ROW_HEIGHT),
            0,
          ) +
        INDICATOR_HEIGHT
      : undefined;
  const childrenScrollable = childrenMaxHeight !== undefined;

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', task.id);
    event.dataTransfer.setDragImage(createTransparentDragImage(), 0, 0);
    const rect = event.currentTarget.getBoundingClientRect();
    beginDrag(
      {
        taskId: task.id,
        title: task.title,
        kind: 'root',
        width: rect.width,
        height: rect.height,
      },
      event.clientX,
      event.clientY,
    );
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
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
      const isAncestor = getAncestorIds(tasks, task.id).includes(taskId);
      if (!isAncestor) {
        onMoveTask(taskId, task.id);
      }
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

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={handleDragStart}
      data-drop-target
      className={`flex max-h-full w-[300px] shrink-0 flex-col rounded-2xl border bg-white shadow-sm transition-shadow ${
        searchHighlighted || dragOver ? 'border-brand ring-2 ring-brand' : 'border-slate-300'
      } ${
        draggedId === task.id ? 'opacity-40' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="cursor-pointer p-4" onClick={() => onOpen(task)}>
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
            {task.kind === TaskKind.MAIN ? (
              <PriorityBadge priority={task.priority} />
            ) : null}
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
                pct === 100 ? 'text-brand' : 'text-ink'
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
        <div
          className={`min-h-0 flex-1 overflow-y-auto rounded-b-2xl border-t border-slate-200 bg-slate-50 p-4 ${
            childrenScrollable ? 'card-scroll' : ''
          } ${childrenScrollable && scrollVisible ? 'card-scroll-visible' : ''}`}
          style={childrenMaxHeight ? { maxHeight: childrenMaxHeight } : undefined}
          onScroll={childrenScrollable ? handleChildrenScroll : undefined}
        >
          <div className="flex flex-col">
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
                  highlightedIds={highlightedIds}
                  highlightScrollOnMount={false}
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
        </div>
      ) : null}

      <div
        className={`relative border-t border-slate-100 p-4 ${
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