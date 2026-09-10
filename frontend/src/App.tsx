import { useState } from 'react';
import { Sidebar } from './components/Sidebar.js';
import { Dashboard } from './pages/Dashboard.js';
import { useTasks } from './hooks/useTasks.js';
import { CreateTaskInput, Task, TaskKind, TaskPriority, TaskStatus, UpdateTaskInput } from './types/task.js';
import { PriorityFilter, SortBy, ViewFilter } from './utils/labels.js';

export function App() {
  const { tasks, loading, error, refresh, createTask, updateTask, deleteTask } =
    useTasks();
  const [view, setView] = useState<ViewFilter>('board');
  const [sortBy, setSortBy] = useState<SortBy>('position');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [navOpen, setNavOpen] = useState(false);

  const handleCreateTask = async (input: CreateTaskInput): Promise<Task> =>
    createTask({ ...input, kind: TaskKind.MAIN });

  const handleUpdateTask = async (
    id: string,
    input: UpdateTaskInput,
  ): Promise<void> => {
    await updateTask(id, input);
    if (input.status === TaskStatus.COMPLETE) {
      await completeSubtree(id);
    } else if (input.status !== undefined) {
      await clearCompletedAncestors(id);
    }
  };

  const handleCreateSubtask = async (
    parentId: string,
    input: CreateTaskInput,
  ): Promise<Task> => {
    return createTask({ ...input, parentTaskId: parentId, kind: TaskKind.SUBTASK });
  };

  const handleDeleteTask = async (id: string): Promise<void> => {
    await deleteTask(id);
  };

  const handleCycleStatus = async (task: Task): Promise<void> => {
    if (task.status === TaskStatus.COMPLETE) {
      await completeSubtree(task.id);
    } else {
      await updateTask(task.id, { status: TaskStatus.PENDING });
      await clearCompletedAncestors(task.id);
    }
  };

  const handleMoveTask = async (
    taskId: string,
    newParentId: string | null,
    position?: number,
  ): Promise<void> => {
    const current = tasks.find((task) => task.id === taskId);
    const input: UpdateTaskInput = { parentTaskId: newParentId };
    if (position !== undefined) {
      input.position = position;
    }
    if (current?.parentTaskId && newParentId === null) {
      input.priority = TaskPriority.MEDIUM;
    }
    await updateTask(taskId, input);
  };

  const completeSubtree = async (rootId: string): Promise<void> => {
    const childrenMap = new Map<string, Task[]>();
    for (const t of tasks) {
      if (t.parentTaskId) {
        const list = childrenMap.get(t.parentTaskId);
        if (list) {
          list.push(t);
        } else {
          childrenMap.set(t.parentTaskId, [t]);
        }
      }
    }
    const ids = [rootId];
    for (let i = 0; i < ids.length; i += 1) {
      for (const child of childrenMap.get(ids[i]) ?? []) {
        ids.push(child.id);
      }
    }
    for (const id of ids) {
      await updateTask(id, { status: TaskStatus.COMPLETE });
    }
  };

  const clearCompletedAncestors = async (taskId: string): Promise<void> => {
    const byId = new Map(tasks.map((t) => [t.id, t]));
    let parentId = byId.get(taskId)?.parentTaskId ?? null;
    while (parentId) {
      const parent = byId.get(parentId);
      if (!parent || parent.status !== TaskStatus.COMPLETE) {
        break;
      }
      await updateTask(parent.id, { status: TaskStatus.PENDING });
      parentId = parent.parentTaskId;
    }
  };

  const sidebarProps = {
    view,
    onViewChange: setView,
    tasks,
  };

  return (
    <div className="relative flex min-h-screen bg-board text-ink">
      <Sidebar
        className="hidden w-64 lg:sticky lg:top-6 lg:ml-16 lg:flex"
        {...sidebarProps}
      />

      {navOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-board"
            onClick={() => setNavOpen(false)}
          />
          <Sidebar
            className="absolute inset-0 w-full overflow-y-auto bg-board p-6"
            onClose={() => setNavOpen(false)}
            {...sidebarProps}
          />
        </div>
      ) : null}

      <main className="flex min-w-0 flex-1">
        <Dashboard
          tasks={tasks}
          loading={loading}
          error={error}
          view={view}
          sortBy={sortBy}
          priorityFilter={priorityFilter}
          onSortChange={setSortBy}
          onPriorityChange={setPriorityFilter}
          onOpenNav={() => setNavOpen(true)}
          onRetry={() => void refresh()}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onCreateSubtask={handleCreateSubtask}
          onDeleteTask={handleDeleteTask}
          onCycleStatus={handleCycleStatus}
          onMoveTask={handleMoveTask}
        />
      </main>
    </div>
  );
}

export default App;