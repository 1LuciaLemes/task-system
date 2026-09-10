import { DragEvent, Fragment, PointerEvent, UIEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  CreateTaskInput,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
} from '../types/task.js';
import { TaskCard } from '../components/TaskCard.js';
import { MobileTaskCard } from '../components/MobileTaskCard.js';
import { GlobalSearch } from '../components/GlobalSearch.js';
import { ConfirmDialog } from '../components/ConfirmDialog.js';
import { DetailModal } from '../components/DetailModal.js';
import { CreateTaskModal } from '../components/CreateTaskModal.js';
import { computeSubtreeStats, buildTaskTree, findNodeById } from '../utils/tree.js';
import type { TaskNode } from '../utils/tree.js';
import { buildDeleteMessage } from '../utils/confirm.js';
import { PRIORITY_DOT_CLASSES, PRIORITY_LABELS, PriorityFilter, SortBy, SORT_LABELS, ViewFilter } from '../utils/labels.js';
import { DropIndicator } from '../components/DropIndicator.js';
import { useDragState } from '../state/DragState.js';
import { searchTasks } from '../utils/taskSearch.js';

interface BoardLeadingDropZoneProps {
  over: boolean;
  onOverChange: (over: boolean) => void;
  onDrop: (taskId: string) => void;
}

function BoardLeadingDropZone({
  over,
  onOverChange,
  onDrop,
}: BoardLeadingDropZoneProps) {
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes('text/plain')) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    if (!over) {
      onOverChange(true);
    }
  };

  const handleDragLeave = () => onOverChange(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onOverChange(false);
    const taskId = event.dataTransfer.getData('text/plain');
    if (taskId) {
      onDrop(taskId);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`absolute inset-y-0 left-0 z-10 hidden lg:block ${
        over ? 'w-[320px]' : 'w-4'
      }`}
    />
  );
}

const PAGE_SIZE = 6;

interface DashboardProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  view: ViewFilter;
  sortBy: SortBy;
  priorityFilter: PriorityFilter;
  onSortChange: (sortBy: SortBy) => void;
  onPriorityChange: (priority: PriorityFilter) => void;
  onOpenNav: () => void;
  onRetry: () => void;
  onCreateTask: (input: CreateTaskInput) => Promise<Task>;
  onUpdateTask: (id: string, input: UpdateTaskInput) => Promise<void>;
  onCreateSubtask: (parentId: string, input: CreateTaskInput) => Promise<Task>;
  onDeleteTask: (id: string) => Promise<void>;
  onCycleStatus: (task: Task) => Promise<void>;
  onMoveTask: (
    taskId: string,
    newParentId: string | null,
    position?: number,
  ) => Promise<void>;
}

export function Dashboard({
  tasks,
  loading,
  error,
  view,
  sortBy,
  priorityFilter,
  onSortChange,
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
  const [highlightSubtaskId, setHighlightSubtaskId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

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

  const pageCount = Math.max(1, Math.ceil(visibleRoots.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const renderedRoots = visibleRoots.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const searchActive = searchQuery.trim().length > 0;

  const searchMatches = useMemo(
    () => (searchActive ? searchTasks(tasks, searchQuery) : []),
    [tasks, searchQuery, searchActive],
  );

  const taskById = useMemo(
    () => new Map(tasks.map((task) => [task.id, task])),
    [tasks],
  );

  const matchesByRoot = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const { task } of searchMatches) {
      let current: Task | undefined = task;
      while (current?.parentTaskId) {
        const next = taskById.get(current.parentTaskId);
        if (!next) {
          break;
        }
        current = next;
      }
      if (!current) {
        continue;
      }
      const list = map.get(current.id) ?? [];
      list.push(task.id);
      map.set(current.id, list);
    }
    return map;
  }, [searchMatches, taskById]);

  const searchRoots = useMemo(() => {
    const seen = new Set<string>();
    const roots: TaskNode[] = [];
    for (const { task } of searchMatches) {
      let current: Task | undefined = task;
      while (current?.parentTaskId) {
        const next = taskById.get(current.parentTaskId);
        if (!next) {
          break;
        }
        current = next;
      }
      if (!current || seen.has(current.id)) {
        continue;
      }
      seen.add(current.id);
      const node = tree.find((item) => item.id === current.id);
      if (node) {
        roots.push(node);
      }
    }
    return roots;
  }, [searchMatches, taskById, tree]);

  const boardRoots = searchActive ? searchRoots : renderedRoots;

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
  }, [visibleRoots, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [visibleRoots]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [pageCount]);

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

  const [boardDragOver, setBoardDragOver] = useState(false);
  const [leadingOver, setLeadingOver] = useState(false);
  const { drag: activeDrag } = useDragState();

  const handleBoardDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const overDropTarget = (event.target as HTMLElement).closest(
      '[data-drop-target]',
    );
    setBoardDragOver(!overDropTarget);
  };

  const handleBoardDragLeave = () => {
    setBoardDragOver(false);
  };

  const handleBoardDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setBoardDragOver(false);
    const taskId = event.dataTransfer.getData('text/plain');
    if (!taskId) {
      return;
    }
    const task = tasks.find((item) => item.id === taskId);
    if (task?.parentTaskId) {
      void onMoveTask(taskId, null);
    }
  };

  const handleRootIndicatorDrop = (taskId: string, index: number) => {
    const allRootIds = tree.map((node) => node.id);
    const draggedRootIndex = allRootIds.indexOf(taskId);
    let target: number;
    if (index >= visibleRoots.length) {
      if (visibleRoots.length === 0) {
        target = 0;
      } else {
        const lastId = visibleRoots[visibleRoots.length - 1].id;
        const lastRootIndex = allRootIds.indexOf(lastId);
        target =
          lastRootIndex -
          (draggedRootIndex !== -1 && draggedRootIndex < lastRootIndex ? 1 : 0) +
          1;
      }
    } else {
      const nextId = visibleRoots[index].id;
      const nextIndex = allRootIds.indexOf(nextId);
      target =
        nextIndex -
        (draggedRootIndex !== -1 && draggedRootIndex < nextIndex ? 1 : 0);
    }
    void onMoveTask(taskId, null, target);
  };

  const handleOpenDetail = (task: Task, edit: boolean) => {
    if (draggingRef.current) {
      return;
    }
    setSelectedTaskId(task.id);
    setEditMode(edit);
    if (searchActive && !task.parentTaskId) {
      const matches = matchesByRoot.get(task.id);
      const firstMatch = matches?.find((id) => id !== task.id);
      setHighlightSubtaskId(firstMatch ?? null);
    } else {
      setHighlightSubtaskId(null);
    }
  };

  const goToPage = (target: number) => {
    setPage(Math.min(Math.max(1, target), pageCount));
  };

  const pageNumbers = useMemo(() => {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, index) => index + 1);
    }
    const list: (number | 'ellipsis')[] = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(pageCount - 1, currentPage + 1);
    if (start > 2) {
      list.push('ellipsis');
    }
    for (let number = start; number <= end; number += 1) {
      list.push(number);
    }
    if (end < pageCount - 1) {
      list.push('ellipsis');
    }
    list.push(pageCount);
    return list;
  }, [pageCount, currentPage]);

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

  const pageNumberButtons = (
    <div className="ml-auto flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-sm text-ink-soft hover:bg-slate-100 disabled:opacity-40"
        aria-label="Página anterior"
      >
        ‹
      </button>
      {pageNumbers.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-1 text-xs text-ink-faint">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => goToPage(item)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium tabular-nums transition-colors ${
              item === currentPage
                ? 'bg-brand text-white'
                : 'text-ink-soft hover:bg-slate-100'
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === pageCount}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-sm text-ink-soft hover:bg-slate-100 disabled:opacity-40"
        aria-label="Página siguiente"
      >
        ›
      </button>
    </div>
  );

  const navigateButton = (target: number, label: string, icon: string) => (
    <button
      type="button"
      onClick={() => goToPage(target)}
      disabled={target === currentPage}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-ink-soft hover:bg-slate-100 disabled:opacity-40"
      aria-label={label}
    >
      {icon}
    </button>
  );

  const mobilePageNav = (
    <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
      <span className="text-xs text-ink-faint">
        Página {currentPage} de {pageCount}
      </span>
      <div className="flex items-center gap-1">
        {navigateButton(currentPage - 1, 'Página anterior', '‹')}
        {navigateButton(currentPage + 1, 'Página siguiente', '›')}
      </div>
    </div>
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-board">
      <header className="flex flex-col gap-3 pb-6 pl-4 pr-4 pt-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:pl-4 lg:pr-16 lg:pt-6">
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <GlobalSearch
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full lg:w-64"
          />
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="w-full rounded-xl bg-ink px-5 py-2.5 text-base font-medium text-white shadow-sm hover:bg-black lg:w-auto lg:shrink-0"
          >
            + Nueva tarea
          </button>
        </div>
      </header>

      <div className="px-4 pb-5 sm:px-8 lg:pl-4 lg:pr-16">
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
          <div className="lg:hidden">
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(SORT_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSortChange(key as SortBy)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    sortBy === key
                      ? 'border-brand bg-brand-light text-brand-deep'
                      : 'border-slate-200 bg-slate-50 text-ink-soft hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2">
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
            {pageCount > 1 && !searchActive ? mobilePageNav : null}
          </div>
          <div className="hidden flex-wrap items-center gap-2 lg:flex">
            {Object.entries(SORT_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => onSortChange(key as SortBy)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  sortBy === key
                    ? 'border-brand bg-brand-light text-brand-deep'
                    : 'border-slate-200 bg-slate-50 text-ink-soft hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
            <span className="mx-1 h-5 w-px shrink-0 bg-slate-200" />
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
            {pageCount > 1 && !searchActive ? pageNumberButtons : null}
          </div>
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
        className={`relative flex min-h-0 flex-1 flex-col px-4 pb-8 sm:px-8 lg:pl-4 lg:pr-16 ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {!searchActive && sortBy === 'position' && visibleRoots.length > 0 ? (
          <BoardLeadingDropZone
            over={leadingOver}
            onOverChange={setLeadingOver}
            onDrop={(taskId) => void onMoveTask(taskId, null, 0)}
          />
        ) : null}
        {loading && tasks.length === 0 ? (
          <p className="text-sm text-ink-faint">Cargando tareas...</p>
        ) : boardRoots.length === 0 ? (
          <p className="text-sm text-ink-faint">
            {searchActive
              ? `Sin resultados para "${searchQuery.trim()}".`
              : emptyMessage}
          </p>
        ) : (
          <>
            {searchActive ? (
              <p className="pb-3 text-sm text-ink-soft">
                {searchMatches.length === 1
                  ? `1 resultado para "${searchQuery.trim()}"`
                  : `${searchMatches.length} resultados para "${searchQuery.trim()}"`}
              </p>
            ) : null}
            <div className="flex flex-col gap-3 pb-4 lg:hidden">
              {boardRoots.map((root) => (
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
              onDragOver={handleBoardDragOver}
              onDragLeave={handleBoardDragLeave}
              onDrop={handleBoardDrop}
              className={`board-scroll hidden min-h-0 flex-1 select-none touch-pan-y items-start py-1 pl-1 pr-1 lg:flex lg:overflow-x-auto ${
                dragging ? 'pointer-events-none' : ''
              } ${
                boardDragOver
                  ? 'rounded-2xl outline-2 outline-dashed outline-brand/50'
                  : ''
              }`}
            >
              {boardRoots.map((root, index) => (
                <Fragment key={root.id}>
                  {!searchActive && index === 0 && sortBy === 'position' ? (
                    <div
                      className={`shrink-0 py-1 transition-[width] duration-150 ${
                        leadingOver ? 'w-[300px]' : 'w-0'
                      }`}
                    >
                      {leadingOver ? (
                        <div
                          className="w-full rounded-xl border-2 border-dashed border-brand bg-brand-light/50"
                          style={{ height: 300 }}
                        />
                      ) : null}
                    </div>
                  ) : null}
                  {index > 0 ? (
                    sortBy === 'position' && !searchActive ? (
                      <DropIndicator
                        index={index}
                        onDrop={handleRootIndicatorDrop}
                        block
                        blockHeight={300}
                        blockClassName="shrink-0 self-stretch px-1 py-1 w-[300px]"
                        className={`shrink-0 self-stretch py-1 ${
                          activeDrag ? 'mx-1 w-1.5' : 'w-4'
                        }`}
                        lineClassName="h-full w-0.5"
                      />
                    ) : (
                      <div className="w-4 shrink-0" />
                    )
                  ) : null}
                  <TaskCard
                    task={root}
                    tasks={tasks}
                    children={root.children}
                    subtreeStats={subtreeStats}
                    focused={focusedId === root.id}
                    onFocusConsumed={() => setFocusedId(null)}
                    highlightedIds={
                      searchActive
                        ? (matchesByRoot.get(root.id) ?? null)
                        : null
                    }
                    searchHighlighted={
                      searchActive &&
                      (matchesByRoot.get(root.id)?.includes(root.id) ?? false)
                    }
                    onOpen={(task) => handleOpenDetail(task, false)}
                    onRequestEdit={(task) => handleOpenDetail(task, true)}
                    onEdit={(task) => handleOpenDetail(task, true)}
                    onCycleStatus={handleCycleStatus}
                    onCreateSubtask={onCreateSubtask}
                    onRequestDelete={setPendingDelete}
                    onMoveTask={onMoveTask}
                  />
                </Fragment>
              ))}
              {!searchActive && sortBy === 'position' ? (
                <DropIndicator
                  index={visibleRoots.length}
                  onDrop={handleRootIndicatorDrop}
                  block
                  blockHeight={300}
                  blockClassName="shrink-0 self-stretch px-1 py-1 w-[300px]"
                  className={`ml-1 w-1.5 shrink-0 self-stretch py-1 ${
                    activeDrag ? '' : 'hidden'
                  }`}
                  lineClassName="h-full w-0.5"
                />
              ) : null}
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
          highlightSubtaskId={highlightSubtaskId}
          onClose={() => {
            setSelectedTaskId(null);
            setHighlightSubtaskId(null);
          }}
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