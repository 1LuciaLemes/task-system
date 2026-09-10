import { useState } from 'react';
import { Sidebar } from './components/Sidebar.js';
import { Dashboard } from './pages/Dashboard.js';
import { useTasks } from './hooks/useTasks.js';
import { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from './types/task.js';
import { PriorityFilter, SortBy, ViewFilter } from './utils/labels.js';

export function App() {
  const { tasks, loading, error, refresh, createTask, updateTask, deleteTask } =
    useTasks();
  const [view, setView] = useState<ViewFilter>('board');
  const [sortBy, setSortBy] = useState<SortBy>('position');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [navOpen, setNavOpen] = useState(false);

  const handleCreateTask = async (input: CreateTaskInput): Promise<Task> =>
    createTask(input);

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
    return createTask({ ...input, parentTaskId: parentId });
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
  ): Promise<void> => {
    await updateTask(taskId, { parentTaskId: newParentId });
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
    sortBy,
    onSortChange: setSortBy,
    tasks,
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-board text-ink">
      <Sidebar className="hidden lg:ml-16 lg:flex" {...sidebarProps} />

      {navOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setNavOpen(false)}
          />
          <Sidebar
            className="absolute inset-y-0 left-0 w-72 shadow-xl"
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