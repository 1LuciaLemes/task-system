import {
  ApiErrorPayload,
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '../types/task.js';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json')
    ? ((await response.json()) as T | ApiErrorPayload)
    : null;

  if (!response.ok) {
    const error = body as ApiErrorPayload | null;
    throw new ApiError(error?.message ?? 'Error de red', response.status, error?.error);
  }

  return body as T;
}

export async function getTasks(): Promise<Task[]> {
  return request<Task[]>('/tasks');
}

export async function getTask(id: string): Promise<Task> {
  return request<Task>(`/tasks/${id}`);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  return request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) });
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  return request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export async function deleteTask(id: string): Promise<void> {
  return request<void>(`/tasks/${id}`, { method: 'DELETE' });
}