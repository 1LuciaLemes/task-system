import { describe, expect, it } from 'vitest';
import { Task, TaskKind, TaskStatus } from '../types/task.js';
import { getEffortSummary, getSubtreeEstimate } from './effort.js';

function makeTask(overrides: Partial<Task> & Pick<Task, 'id'>): Task {
  return {
    kind: TaskKind.MAIN,
    title: 'Tarea',
    description: null,
    status: TaskStatus.PENDING,
    priority: 'MEDIUM' as Task['priority'],
    estimate: null,
    parentTaskId: null,
    position: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('getEffortSummary', () => {
  it('suma estimaciones por estado tratando null como 0', () => {
    const tasks = [
      makeTask({ id: 'a', status: TaskStatus.PENDING, estimate: 10 }),
      makeTask({ id: 'b', status: TaskStatus.IN_PROGRESS, estimate: 5 }),
      makeTask({ id: 'c', status: TaskStatus.COMPLETE, estimate: 3 }),
      makeTask({ id: 'd', status: TaskStatus.PENDING, estimate: null }),
    ];
    expect(getEffortSummary(tasks)).toEqual({
      total: 18,
      pending: 10,
      inProgress: 5,
      complete: 3,
    });
  });

  it('retorna ceros si no hay tareas', () => {
    expect(getEffortSummary([])).toEqual({
      total: 0,
      pending: 0,
      inProgress: 0,
      complete: 0,
    });
  });
});

describe('getSubtreeEstimate', () => {
  it('considera la tarea y todos sus descendientes', () => {
    const tasks = [
      makeTask({ id: 'a', estimate: 10 }),
      makeTask({ id: 'a1', parentTaskId: 'a', estimate: 5 }),
      makeTask({ id: 'a11', parentTaskId: 'a1', estimate: 2 }),
      makeTask({ id: 'a2', parentTaskId: 'a', estimate: 3 }),
    ];
    expect(getSubtreeEstimate(tasks, 'a')).toBe(20);
    expect(getSubtreeEstimate(tasks, 'a1')).toBe(7);
    expect(getSubtreeEstimate(tasks, 'a2')).toBe(3);
  });

  it('retorna 0 si la tarea no existe', () => {
    expect(getSubtreeEstimate([], 'nope')).toBe(0);
  });
});