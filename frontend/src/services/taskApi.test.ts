import { afterEach, describe, expect, it, vi } from 'vitest';
import { Task, TaskPriority, TaskStatus } from '../types/task.js';
import { ApiError, createTask, deleteTask, getTasks, updateTask } from './taskApi.js';

const TASK: Task = {
  id: '1',
  title: 'Tarea',
  description: null,
  status: TaskStatus.PENDING,
  priority: TaskPriority.MEDIUM,
  estimate: 2,
  parentTaskId: null,
  position: 0,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('taskApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getTasks retorna el listado', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => [TASK],
      }),
    );
    await expect(getTasks()).resolves.toEqual([TASK]);
  });

  it('createTask envía POST con JSON y retorna la tarea creada', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: { get: () => 'application/json' },
      json: async () => TASK,
    });
    vi.stubGlobal('fetch', fetchMock);

    await createTask({ title: 'Tarea', priority: TaskPriority.HIGH });

    expect(fetchMock).toHaveBeenCalledWith('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Tarea', priority: TaskPriority.HIGH }),
    });
  });

  it('updateTask envía PATCH con el id en la URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => TASK,
    });
    vi.stubGlobal('fetch', fetchMock);

    await updateTask('1', { status: TaskStatus.COMPLETE });

    expect(fetchMock).toHaveBeenCalledWith('/tasks/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: TaskStatus.COMPLETE }),
    });
  });

  it('deleteTask maneja respuesta 204 sin cuerpo', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: { get: () => 'application/json' },
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(deleteTask('1')).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith('/tasks/1', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('lanza ApiError con mensaje y código de la API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: { get: () => 'application/json' },
        json: async () => ({ error: 'VALIDATION_ERROR', message: 'El título es obligatorio' }),
      }),
    );

    await expect(getTasks()).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'El título es obligatorio',
    });
  });

  it('lanza ApiError 404 con mensaje por defecto de la API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: { get: () => 'application/json' },
        json: async () => ({ error: 'NOT_FOUND', message: 'Tarea no encontrada' }),
      }),
    );

    const promise = getTasks();
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
  });
});