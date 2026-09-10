import { PointerEvent, UIEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  CreateTaskInput,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
} from '../types/task.js';
import { TaskCard } from '../components/TaskCard.js';
import { MobileTaskCard } from '../components/MobileTaskCard.js';
import { ConfirmDialog } from '../components/ConfirmDialog.js';
import { DetailModal } from '../components/DetailModal.js';
import { CreateTaskModal } from '../components/CreateTaskModal.js';
import { computeSubtreeStats, buildTaskTree, findNodeById } from '../utils/tree.js';
import { buildDeleteMessage } from '../utils/confirm.js';
import { PRIORITY_DOT_CLASSES, PRIORITY_LABELS, PriorityFilter, SortBy, ViewFilter } from '../utils/labels.js';

interface DashboardProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  view: ViewFilter;
  sortBy: SortBy;
  priorityFilter: PriorityFilter;
  onPriorityChange: (priority: PriorityFilter) => void;
  onOpenNav: () => void;
  onRetry: () => void;
  onCreateTask: (input: CreateTaskInput) => Promise<Task>;
  onUpdateTask: (id: string, input: UpdateTaskInput) => Promise<void>;
  onCreateSubtask: (parentId: string, input: CreateTaskInput) => Promise<Task>;
  onDeleteTask: (id: string) => Promise<void>;
  onCycleStatus: (task: Task) => Promise<void>;
  onMoveTask: (taskId: string, newParentId: string | null) => Promise<void>;
}

export function Dashboard({
  tasks,
  loading,
  error,
  view,
  sortBy,
  priorityFilter,
  onPriorityChange,
  onOpenNav,
  onRetry,
  onCreateTask,
  onUpdateTask,
  onCreateSubtask,
  onDeleteTask,
  onCycleStatus,
  onMoveTask,
}: DashboardProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const tree = useMemo(() => buildTaskTree(tasks), [tasks]);
  const subtreeStats = useMemo(() => computeSubtreeStats(tasks), [tasks]);

  const visibleRoots = useMemo(() => {
    let roots = tree;
    if (view === 'pending') {
      roots = roots.filter((node) => node.status !== TaskStatus.COMPLETE);
    } else if (view === 'completed') {
      roots = roots.filter((node) => node.status === TaskStatus.COMPLETE);
    }
    if (priorityFilter !== 'all') {
      roots = roots.filter((node) => node.priority === priorityFilter);
    }
    if (sortBy === 'recent') {
      roots = [...roots].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    return roots;
  }, [tree, view, priorityFilter, sortBy]);

  const selectedTask = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId) ?? null
    : null;

  const boardRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ x: 0, left: 0, active: false });
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [boardScroll, setBoardScroll] = useState({ left: 0, max: 0, view: 0 });
  const [barVisible, setBarVisible] = useState(false);
  const barHideTimer = useRef<number | null>(null);

  const showBar = () => {
    setBarVisible(true);
    if (barHideTimer.current) {
      window.clearTimeout(barHideTimer.current);
    }
    barHideTimer.current = window.setTimeout(() => setBarVisible(false), 2500);
  };

  const handleBoardScroll = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    setBoardScroll({
      left: el.scrollLeft,
      max: Math.max(0, el.scrollWidth - el.clientWidth),
      view: el.clientWidth,
    });
    showBar();
  };

  useEffect(() => {
    const el = boardRef.current;
    if (!el) {
      return;
    }
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    setBoardScroll({ left: el.scrollLeft, max, view: el.clientWidth });
    if (max > 0) {
      showBar();
    }
  }, [visibleRoots]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    if ((event.target as HTMLElement).closest('[draggable]')) {
      return;
    }
    const el = boardRef.current;
    if (!el) {
      return;
    }
    dragState.current = { x: event.clientX, left: el.scrollLeft, active: true };
    draggingRef.current = false;
    setDragging(false);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = boardRef.current;
    const state = dragState.current;
    if (!el || !state.active) {
      return;
    }
    const dx = event.clientX - state.x;
    if (Math.abs(dx) > 4 && !draggingRef.current) {
      el.setPointerCapture(event.pointerId);
      draggingRef.current = true;
      setDragging(true);
    }
    if (draggingRef.current) {
      el.scrollLeft = state.left - dx;
    }
  };

  const stopDragging = () => {
    dragState.current.active = false;
    draggingRef.current = false;
    setDragging(false);
  };

  const handleOpenDetail = (task: Task, edit: boolean) => {
    if (draggingRef.current) {
      return;
    }
    setSelectedTaskId(task.id);
    setEditMode(edit);
  };

  const handleCreateTask = async (input: CreateTaskInput): Promise<Task> => {
    const created = await onCreateTask(input);
    setFocusedId(created.id);
    return created;
  };

  const handleCycleStatus = async (task: Task) => {
    const nextStatus =
      task.status === TaskStatus.COMPLETE
        ? TaskStatus.PENDING
        : TaskStatus.COMPLETE;

    await onCycleStatus({ ...task, status: nextStatus });
  };

  const handleDelete = async () => {
    if (!pendingDelete) {
      return;
    }
    await onDeleteTask(pendingDelete.id);
    if (selectedTaskId === pendingDelete.id) {
      setSelectedTaskId(null);
    }
    setPendingDelete(null);
  };

  const emptyMessage = useMemo(() => {
    if (view === 'pending') {
      return 'No hay tareas pendientes para mostrar.';
    }
    if (view === 'completed') {
      return 'Todavía no hay tareas completadas.';
    }
    return 'No hay tareas para mostrar. Creá una nueva para empezar.';
  }, [view]);

  const completeCount = tasks.filter(
    (task) => task.status === TaskStatus.COMPLETE,
  ).length;
  const pendingCount = tasks.length - completeCount;

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-board">
      <header className="flex items-center justify-between gap-3 pb-6 pl-4 pr-4 pt-10 sm:px-8 lg:pl-4 lg:pr-16">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenNav}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-ink-soft hover:bg-slate-100 lg:hidden"
            aria-label="Abrir panel"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Mi Tablero</h1>
            <p className="text-sm text-ink-soft">
              {tasks.length} tareas • {pendingCount} pendientes • {completeCount} completadas
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="rounded-xl bg-ink px-5 py-2.5 text-base font-medium text-white shadow-sm hover:bg-black"
        >
          + Nueva tarea
        </button>
      </header>

      <div className="px-4 pb-5 sm:px-8 lg:pl-4 lg:pr-16">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
          {(['all', 'LOW', 'MEDIUM', 'HIGH'] as PriorityFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onPriorityChange(value)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                priorityFilter === value
                  ? 'border-brand bg-brand-light text-brand-deep'
                  : 'border-slate-200 bg-slate-50 text-ink-soft hover:bg-slate-100'
              }`}
            >
              {value === 'all' ? null : (
                <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT_CLASSES[value]}`} />
              )}
              {value === 'all' ? 'Todas' : PRIORITY_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {showCreateModal ? (
        <CreateTaskModal
          onCreateTask={handleCreateTask}
          onCreateSubtask={onCreateSubtask}
          onClose={() => setShowCreateModal(false)}
        />
      ) : null}

      {error ? (
        <div className="mx-6 mb-4 flex items-center justify-between rounded-xl bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Reintentar
          </button>
        </div>
      ) : null}

      <div
        className={`min-h-0 flex-1 overflow-y-auto px-4 pb-8 sm:px-8 lg:overflow-hidden lg:pl-4 lg:pr-16 ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {loading && tasks.length === 0 ? (
          <p className="text-sm text-ink-faint">Cargando tareas...</p>
        ) : visibleRoots.length === 0 ? (
          <p className="text-sm text-ink-faint">{emptyMessage}</p>
        ) : (
          <>
            <div className="flex flex-col gap-3 pb-4 lg:hidden">
              {visibleRoots.map((root) => (
                <MobileTaskCard
                  key={root.id}
                  task={root}
                  stats={subtreeStats.get(root.id) ?? { total: 0, complete: 0 }}
                  onOpen={(task) => handleOpenDetail(task, false)}
                />
              ))}
            </div>
            <div
              ref={boardRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
              onScroll={handleBoardScroll}
              className={`board-scroll hidden h-full select-none touch-pan-y items-start gap-5 py-1 px-1 lg:flex lg:overflow-x-auto ${
                dragging ? 'pointer-events-none' : ''
              }`}
            >
              {visibleRoots.map((root) => (
                <TaskCard
                  key={root.id}
                  task={root}
                  children={root.children}
                  subtreeStats={subtreeStats}
                  focused={focusedId === root.id}
                  onFocusConsumed={() => setFocusedId(null)}
                  onOpen={(task) => handleOpenDetail(task, false)}
                  onRequestEdit={(task) => handleOpenDetail(task, true)}
                  onEdit={(task) => handleOpenDetail(task, true)}
                  onCycleStatus={handleCycleStatus}
                  onCreateSubtask={onCreateSubtask}
                  onRequestDelete={setPendingDelete}
                  onMoveTask={onMoveTask}
                />
              ))}
            </div>

            {boardScroll.max > 0 ? (
              <div
                className={`hidden px-4 pb-2 pt-3 transition-opacity duration-300 lg:block ${
                  barVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
              >
                <div className="h-1 w-full rounded-full bg-slate-200/70">
                  {(() => {
                    const widthPct = Math.max(
                      12,
                      (boardScroll.view / (boardScroll.view + boardScroll.max)) * 100,
                    );
                    return (
                      <div
                        className="h-1 rounded-full bg-brand/60"
                        style={{
                          width: `${widthPct}%`,
                          marginLeft: `${(boardScroll.left / boardScroll.max) * (100 - widthPct)}%`,
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      {selectedTask ? (
        <DetailModal
          task={selectedTask}
          children={
            findNodeById(tree, selectedTask.id)?.children ?? []
          }
          allTasks={tasks}
          subtreeStats={subtreeStats}
          initialEdit={editMode}
          onClose={() => setSelectedTaskId(null)}
          onOpen={(task) => handleOpenDetail(task, false)}
          onEdit={(task) => handleOpenDetail(task, true)}
          onUpdate={onUpdateTask}
          onCreateSubtask={onCreateSubtask}
          onCycleStatus={handleCycleStatus}
          onRequestDelete={setPendingDelete}
          onMoveTask={onMoveTask}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title={buildDeleteMessage(tasks, pendingDelete).title}
          message={buildDeleteMessage(tasks, pendingDelete).message}
          onConfirm={() => void handleDelete()}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  );
}