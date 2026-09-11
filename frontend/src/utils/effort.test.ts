import { describe, expect, it } from 'vitest';
import { Task, TaskKind, TaskStatus } from '../types/task.js';
import { getEffortSummary, getSubtreeEstimate, getWeightedProgress } from './effort.js';

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

  it('incluye las estimaciones de todos los niveles de la jerarquía', () => {
    const tasks = [
      makeTask({ id: 'a', status: TaskStatus.PENDING, estimate: 10 }),
      makeTask({ id: 'a1', parentTaskId: 'a', status: TaskStatus.IN_PROGRESS, estimate: 5 }),
      makeTask({ id: 'a11', parentTaskId: 'a1', status: TaskStatus.COMPLETE, estimate: 3 }),
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

  it('acumula las horas del padre con las de sus subtareas', () => {
    const tasks = [
      makeTask({ id: 'a', status: TaskStatus.IN_PROGRESS, estimate: 10 }),
      makeTask({ id: 'a1', parentTaskId: 'a', status: TaskStatus.PENDING, estimate: 5 }),
    ];
    expect(getEffortSummary(tasks)).toEqual({
      total: 15,
      pending: 5,
      inProgress: 10,
      complete: 0,
    });
  });

  it('una subtarea sin estimación incrementa 0', () => {
    const tasks = [
      makeTask({ id: 'a', status: TaskStatus.PENDING, estimate: 10 }),
      makeTask({ id: 'a1', parentTaskId: 'a', status: TaskStatus.PENDING, estimate: null }),
    ];
    expect(getEffortSummary(tasks)).toEqual({
      total: 10,
      pending: 10,
      inProgress: 0,
      complete: 0,
    });
  });
});

describe('getWeightedProgress', () => {
  it('pesa las tareas con horas y completa al 100% solo con todas completadas', () => {
    const tasks = [
      makeTask({ id: 'a', status: TaskStatus.COMPLETE, estimate: 5 }),
      makeTask({ id: 'b', status: TaskStatus.COMPLETE, estimate: null }),
      makeTask({ id: 'c', status: TaskStatus.PENDING, estimate: 1 }),
    ];
    expect(getWeightedProgress(tasks)).toEqual({ total: 7, complete: 6 });
  });

  it('pesa 1 cuando no hay estimación', () => {
    const tasks = [
      makeTask({ id: 'a', status: TaskStatus.COMPLETE, estimate: null }),
      makeTask({ id: 'b', status: TaskStatus.PENDING, estimate: null }),
      makeTask({ id: 'c', status: TaskStatus.PENDING, estimate: null }),
    ];
    expect(getWeightedProgress(tasks)).toEqual({ total: 3, complete: 1 });
  });

  it('al completar todas las tareas llega a 100%', () => {
    const tasks = [
      makeTask({ id: 'a', status: TaskStatus.COMPLETE, estimate: 8 }),
      makeTask({ id: 'b', status: TaskStatus.COMPLETE, estimate: null }),
    ];
    const { total, complete } = getWeightedProgress(tasks);
    expect(complete).toBe(total);
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

  it('ignora estimaciones nulas en el subárbol (suma 0)', () => {
    const tasks = [
      makeTask({ id: 'a', estimate: 10 }),
      makeTask({ id: 'a1', parentTaskId: 'a', estimate: null }),
      makeTask({ id: 'a2', parentTaskId: 'a', estimate: 3 }),
    ];
    expect(getSubtreeEstimate(tasks, 'a')).toBe(13);
  });
});