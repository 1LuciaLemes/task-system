import { useCallback, useEffect, useState } from 'react';
import * as api from '../services/taskApi.js';
import { CreateTaskInput, Task, UpdateTaskInput } from '../types/task.js';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createTask = useCallback(async (input: CreateTaskInput): Promise<Task> => {
    const created = await api.createTask(input);
    await refresh();
    return created;
  }, [refresh]);

  const updateTask = useCallback(
    async (id: string, input: UpdateTaskInput): Promise<Task> => {
      const updated = await api.updateTask(id, input);
      await refresh();
      return updated;
    },
    [refresh],
  );

  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      await api.deleteTask(id);
      await refresh();
    },
    [refresh],
  );

  return { tasks, loading, error, refresh, createTask, updateTask, deleteTask };
}