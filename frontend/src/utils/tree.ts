import type { Task } from '../types/task.js';
import { TaskStatus } from '../types/task.js';

export type TaskNode = Task & { children: TaskNode[] };

export function buildChildrenMap(tasks: Task[]): Map<string | null, Task[]> {
  const map = new Map<string | null, Task[]>();
  for (const task of tasks) {
    const key = task.parentTaskId ?? null;
    const siblings = map.get(key) ?? [];
    siblings.push(task);
    map.set(key, siblings);
  }
  for (const siblings of map.values()) {
    siblings.sort(
      (a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt),
    );
  }
  return map;
}

export function getRootTasks(tasks: Task[]): Task[] {
  return buildChildrenMap(tasks).get(null) ?? [];
}

export function buildTaskTree(tasks: Task[]): TaskNode[] {
  const childrenMap = buildChildrenMap(tasks);
  const buildNode = (task: Task): TaskNode => ({
    ...task,
    children: (childrenMap.get(task.id) ?? []).map(buildNode),
  });
  return (childrenMap.get(null) ?? []).map(buildNode);
}

export function findNodeById(nodes: TaskNode[], id: string): TaskNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const found = findNodeById(node.children, id);
    if (found) {
      return found;
    }
  }
  return null;
}

export function getNodeById(tasks: Task[], id: string): TaskNode | null {
  return findNodeById(buildTaskTree(tasks), id);
}

export interface SubtreeStats {
  total: number;
  complete: number;
}

export function isPartiallyComplete(
  task: Task,
  stats: { total: number; complete: number },
): boolean {
  return (
    task.status !== TaskStatus.COMPLETE &&
    stats.complete > 0 &&
    stats.complete < stats.total
  );
}

export function computeSubtreeStats(tasks: Task[]): Map<string, SubtreeStats> {
  const childrenMap = buildChildrenMap(tasks);
  const stats = new Map<string, SubtreeStats>();

  const compute = (task: Task): SubtreeStats => {
    const children = childrenMap.get(task.id) ?? [];
    let total = 1;
    let complete = task.status === 'COMPLETE' ? 1 : 0;
    for (const child of children) {
      const childStats = compute(child);
      total += childStats.total;
      complete += childStats.complete;
    }
    const result: SubtreeStats = { total, complete };
    stats.set(task.id, result);
    return result;
  };

  for (const root of childrenMap.get(null) ?? []) {
    compute(root);
  }
  return stats;
}

export function getSubtreeStats(
  tasks: Task[],
  taskId: string,
  computed?: Map<string, SubtreeStats>,
): SubtreeStats {
  const stats = computed ?? computeSubtreeStats(tasks);
  return stats.get(taskId) ?? { total: 0, complete: 0 };
}

export function hasIncompleteSubtasks(tasks: Task[], taskId: string): boolean {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  return getDescendantIds(tasks, taskId).some(
    (id) => byId.get(id)?.status !== 'COMPLETE',
  );
}

export function getAncestorIds(tasks: Task[], taskId: string): string[] {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const result: string[] = [];
  let current = byId.get(taskId);
  while (current?.parentTaskId) {
    result.push(current.parentTaskId);
    current = byId.get(current.parentTaskId);
  }
  return result;
}

export function getDescendantIds(tasks: Task[], taskId: string): string[] {
  const childrenMap = buildChildrenMap(tasks);
  const result: string[] = [];
  const queue = [...(childrenMap.get(taskId) ?? [])];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    result.push(current.id);
    queue.push(...(childrenMap.get(current.id) ?? []));
  }
  return result;
}