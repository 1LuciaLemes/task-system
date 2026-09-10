import { describe, expect, it } from 'vitest';
import { Task, TaskPriority, TaskStatus } from '../types/task.js';
import { buildDeleteMessage } from './confirm.js';

function makeTask(id: string, overrides: Partial<Task> = {}): Task {
  return {
    id,
    title: 'Tarea',
    description: null,
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    estimate: null,
    parentTaskId: null,
    position: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('buildDeleteMessage', () => {
  it('confirma simple si no hay descendientes', () => {
    const tasks = [makeTask('a', { title: 'Bug' })];
    const result = buildDeleteMessage(tasks, tasks[0]);
    expect(result.message).toBe('¿Deseas eliminar la tarea "Bug"?');
  });

  it('advierte sobre descendientes incompletos', () => {
    const tasks = [
      makeTask('a', { title: 'Bug' }),
      makeTask('b', { parentTaskId: 'a', status: TaskStatus.COMPLETE }),
      makeTask('c', { parentTaskId: 'a', status: TaskStatus.PENDING }),
    ];
    const result = buildDeleteMessage(tasks, tasks[0]);
    expect(result.message).toBe(
      'Tienes tareas incompletas, ¿aún así deseas eliminar la tarea "Bug"?',
    );
  });

  it('informa que las subtareas también se eliminarán', () => {
    const tasks = [
      makeTask('a', { title: 'Bug', status: TaskStatus.COMPLETE }),
      makeTask('b', { parentTaskId: 'a', status: TaskStatus.COMPLETE }),
    ];
    const result = buildDeleteMessage(tasks, tasks[0]);
    expect(result.message).toBe(
      '¿Deseas eliminar la tarea "Bug"? Las subtareas también se eliminarán.',
    );
  });
});