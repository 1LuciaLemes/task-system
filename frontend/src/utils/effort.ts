import { EffortSummary, Task, TaskStatus } from '../types/task.js';
import { getDescendantIds } from './tree.js';

export function getEffortSummary(tasks: Task[]): EffortSummary {
  const summary: EffortSummary = { total: 0, pending: 0, inProgress: 0, complete: 0 };
  for (const task of tasks) {
    const estimate = task.estimate ?? 0;
    summary.total += estimate;
    if (task.status === TaskStatus.PENDING) {
      summary.pending += estimate;
    } else if (task.status === TaskStatus.IN_PROGRESS) {
      summary.inProgress += estimate;
    } else if (task.status === TaskStatus.COMPLETE) {
      summary.complete += estimate;
    }
  }
  return summary;
}

export function getSubtreeEstimate(tasks: Task[], taskId: string): number {
  const sums = new Map<string, number>();

  const accumulated = (task: Task): number => {
    const children = tasks
      .filter((t) => t.parentTaskId === task.id)
      .sort(
        (a, b) =>
          a.position - b.position || a.createdAt.localeCompare(b.createdAt),
      );
    const total = (task.estimate ?? 0) + children.reduce((acc, c) => acc + accumulated(c), 0);
    sums.set(task.id, total);
    return total;
  };

  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    return 0;
  }
  accumulated(task);
  return sums.get(taskId) ?? 0;
}

export function getCompletedSubtreeEstimate(tasks: Task[], taskId: string): number {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  let total = 0;
  const task = byId.get(taskId);
  if (task?.status === TaskStatus.COMPLETE) {
    total += task.estimate ?? 0;
  }
  for (const id of getDescendantIds(tasks, taskId)) {
    const descendant = byId.get(id);
    if (descendant?.status === TaskStatus.COMPLETE) {
      total += descendant.estimate ?? 0;
    }
  }
  return total;
}