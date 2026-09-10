import { describe, expect, it } from 'vitest';
import { Task, TaskKind, TaskPriority, TaskStatus } from '../types/task.js';
import {
  buildChildrenMap,
  buildTaskTree,
  computeSubtreeStats,
  findNodeById,
  getDescendantIds,
  getRootTasks,
  getSubtreeStats,
  hasIncompleteSubtasks,
} from './tree.js';

function makeTask(overrides: Partial<Task> & Pick<Task, 'id'>): Task {
  return {
    kind: TaskKind.MAIN,
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

describe('buildChildrenMap', () => {
  it('agrupa hijos por parentTaskId ordenados por posición', () => {
    const tasks = [
      makeTask({ id: 'a', position: 0 }),
      makeTask({ id: 'b', parentTaskId: 'a', position: 1 }),
      makeTask({ id: 'c', parentTaskId: 'a', position: 0 }),
    ];
    const map = buildChildrenMap(tasks);
    expect(map.get('a')?.map((task) => task.id)).toEqual(['c', 'b']);
  });

  it('retorna lista vacía si no hay tareas', () => {
    expect(buildChildrenMap([]).get(null)).toBeUndefined();
  });
});

describe('getRootTasks', () => {
  it('retorna solo tareas sin padre', () => {
    const tasks = [
      makeTask({ id: 'a' }),
      makeTask({ id: 'b' }),
      makeTask({ id: 'c', parentTaskId: 'a' }),
    ];
    expect(getRootTasks(tasks).map((task) => task.id)).toEqual(['a', 'b']);
  });
});

describe('buildTaskTree', () => {
  it('construye un árbol de N niveles', () => {
    const tasks = [
      makeTask({ id: 'a' }),
      makeTask({ id: 'a1', parentTaskId: 'a' }),
      makeTask({ id: 'a11', parentTaskId: 'a1' }),
      makeTask({ id: 'a2', parentTaskId: 'a' }),
    ];
    const tree = buildTaskTree(tasks);
    expect(tree).toHaveLength(1);
    expect(tree[0].children.map((node) => node.id)).toEqual(['a1', 'a2']);
    expect(tree[0].children[0].children.map((node) => node.id)).toEqual(['a11']);
  });
});

describe('findNodeById', () => {
  it('encuentra nodos en cualquier nivel del árbol', () => {
    const tasks = [
      makeTask({ id: 'a' }),
      makeTask({ id: 'a1', parentTaskId: 'a' }),
      makeTask({ id: 'a11', parentTaskId: 'a1' }),
    ];
    const tree = buildTaskTree(tasks);
    expect(findNodeById(tree, 'a11')?.id).toBe('a11');
    expect(findNodeById(tree, 'a')?.id).toBe('a');
  });

  it('retorna null si el id no existe', () => {
    const tree: ReturnType<typeof buildTaskTree> = [];
    expect(findNodeById(tree, 'missing')).toBeNull();
  });
});

describe('computeSubtreeStats', () => {
  it('cuenta total y completadas por subárbol', () => {
    const tasks = [
      makeTask({ id: 'a' }),
      makeTask({ id: 'b', parentTaskId: 'a', status: TaskStatus.COMPLETE }),
      makeTask({ id: 'c', parentTaskId: 'a' }),
      makeTask({ id: 'd', parentTaskId: 'c', status: TaskStatus.COMPLETE }),
    ];
    const stats = computeSubtreeStats(tasks);
    expect(getSubtreeStats(tasks, 'a', stats)).toEqual({ total: 4, complete: 2 });
    expect(getSubtreeStats(tasks, 'c', stats)).toEqual({ total: 2, complete: 1 });
    expect(getSubtreeStats(tasks, 'b', stats)).toEqual({ total: 1, complete: 1 });
  });
});

describe('getDescendantIds', () => {
  it('retorna todos los descendientes en orden', () => {
    const tasks = [
      makeTask({ id: 'a' }),
      makeTask({ id: 'a1', parentTaskId: 'a' }),
      makeTask({ id: 'a11', parentTaskId: 'a1' }),
      makeTask({ id: 'a2', parentTaskId: 'a' }),
    ];
    expect(getDescendantIds(tasks, 'a')).toEqual(['a1', 'a2', 'a11']);
  });
});

describe('hasIncompleteSubtasks', () => {
  it('detecta descendientes incompletos', () => {
    const tasks = [
      makeTask({ id: 'a' }),
      makeTask({ id: 'b', parentTaskId: 'a', status: TaskStatus.COMPLETE }),
      makeTask({ id: 'c', parentTaskId: 'a' }),
    ];
    expect(hasIncompleteSubtasks(tasks, 'a')).toBe(true);
  });

  it('retorna false si todos los descendientes están completos', () => {
    const tasks = [
      makeTask({ id: 'a', status: TaskStatus.COMPLETE }),
      makeTask({ id: 'b', parentTaskId: 'a', status: TaskStatus.COMPLETE }),
    ];
    expect(hasIncompleteSubtasks(tasks, 'a')).toBe(false);
  });

  it('retorna false si no hay descendientes', () => {
    const tasks = [makeTask({ id: 'a' })];
    expect(hasIncompleteSubtasks(tasks, 'a')).toBe(false);
  });
});