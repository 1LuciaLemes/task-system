import { randomUUID } from 'node:crypto';
import { Task, TaskPriority, TaskStatus } from '../models/task.js';
import type { TaskRepository } from '../repositories/taskRepository.js';
import { CreateTaskInput, EffortSummary, UpdateTaskInput, ValidationError } from '../types/task.js';

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  async createTask(input: CreateTaskInput): Promise<Task> {
    this.validateTitle(input.title);
    this.validateEstimate(input.estimate);
    if (input.status !== undefined && !this.isValidEnum(TaskStatus, input.status)) {
      throw new ValidationError(`Estado inválido: ${input.status}`);
    }
    if (input.priority !== undefined && !this.isValidEnum(TaskPriority, input.priority)) {
      throw new ValidationError(`Prioridad inválida: ${input.priority}`);
    }

    const parentId = input.parentTaskId ?? null;
    if (parentId !== null && !(await this.repository.findById(parentId))) {
      throw new ValidationError(`Tarea padre no encontrada: ${parentId}`);
    }

    const siblings = await this.repository.findByParentId(parentId);
    const position = this.nextPosition(siblings);

    const task: Task = {
      id: randomUUID(),
      title: input.title.trim(),
      description: input.description ?? null,
      status: input.status ?? TaskStatus.PENDING,
      priority: input.priority ?? TaskPriority.MEDIUM,
      estimate: input.estimate ?? null,
      parentTaskId: parentId,
      position,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.repository.insert(task);
  }

  async getTask(id: string): Promise<Task | null> {
    return this.repository.findById(id);
  }

  async getAllTasks(): Promise<Task[]> {
    const tasks = await this.repository.findAll();
    return [...tasks].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id),
    );
  }

  async getRootTasks(): Promise<Task[]> {
    const roots = await this.repository.findByParentId(null);
    return this.sortByPosition(roots);
  }

  async getSubtasks(parentId: string): Promise<Task[]> {
    const subtasks = await this.repository.findByParentId(parentId);
    return this.sortByPosition(subtasks);
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
    const current = await this.repository.findById(id);
    if (!current) {
      return null;
    }
    if (input.title !== undefined) {
      this.validateTitle(input.title);
    }
    if (input.estimate !== undefined) {
      this.validateEstimate(input.estimate);
    }
    if (input.status !== undefined && !this.isValidEnum(TaskStatus, input.status)) {
      throw new ValidationError(`Estado inválido: ${input.status}`);
    }
    if (input.priority !== undefined && !this.isValidEnum(TaskPriority, input.priority)) {
      throw new ValidationError(`Prioridad inválida: ${input.priority}`);
    }

    let positionOverride: number | undefined;
    if (input.parentTaskId !== undefined) {
      const newParentId = input.parentTaskId ?? null;
      const parentChanged = newParentId !== current.parentTaskId;
      if (newParentId !== null) {
        if (newParentId === current.id) {
          throw new ValidationError('Una tarea no puede ser su propio padre');
        }
        if (!(await this.repository.findById(newParentId))) {
          throw new ValidationError(`Tarea padre no encontrada: ${newParentId}`);
        }
        const descendants = await this.getDescendantTasks(current.id);
        if (descendants.some((task) => task.id === newParentId)) {
          throw new ValidationError('El padre no puede ser un descendiente de la tarea');
        }
      }
      if (parentChanged) {
        const siblings = await this.repository.findByParentId(newParentId);
        positionOverride = this.nextPosition(siblings);
      }
    }

    const cleanerInput: UpdateTaskInput = {
      ...input,
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(positionOverride !== undefined ? { position: positionOverride } : {}),
    };

    return this.repository.update(id, cleanerInput);
  }

  async deleteTask(id: string): Promise<void> {
    const descendants = await this.getDescendantTasks(id);
    const idsToDelete = [...descendants.map((task) => task.id), id];
    for (const taskId of idsToDelete) {
      await this.repository.delete(taskId);
    }
  }

  async hasIncompleteDescendants(id: string): Promise<boolean> {
    const descendants = await this.getDescendantTasks(id);
    return descendants.some((task) => task.status !== TaskStatus.COMPLETE);
  }

  async getSubtreeEstimate(id: string): Promise<number> {
    const task = await this.repository.findById(id);
    if (!task) {
      return 0;
    }
    const descendants = await this.getDescendantTasks(id);
    const subtreeTasks = [task, ...descendants];
    return subtreeTasks.reduce((acc, current) => acc + (current.estimate ?? 0), 0);
  }

  async getEffortSummary(): Promise<EffortSummary> {
    const tasks = await this.repository.findAll();
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

  private async getDescendantTasks(id: string): Promise<Task[]> {
    const all = await this.repository.findAll();
    const byId = new Map<string, Task>(all.map((task) => [task.id, task]));
    const childrenByParent = new Map<string, Task[]>();

    for (const task of all) {
      if (task.parentTaskId === null) {
        continue;
      }
      const children = childrenByParent.get(task.parentTaskId) ?? [];
      children.push(task);
      childrenByParent.set(task.parentTaskId, children);
    }

    const result: Task[] = [];
    const queue = [...(childrenByParent.get(id) ?? [])];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        continue;
      }
      const fullTask = byId.get(current.id);
      if (!fullTask) {
        continue;
      }
      result.push(fullTask);
      queue.push(...(childrenByParent.get(current.id) ?? []));
    }

    return result;
  }

  private nextPosition(siblings: Task[]): number {
    if (siblings.length === 0) {
      return 0;
    }
    return Math.max(...siblings.map((task) => task.position)) + 1;
  }

  private sortByPosition(tasks: Task[]): Task[] {
    return [...tasks].sort(
      (a, b) => a.position - b.position || a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }

  private validateTitle(title: string): void {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new ValidationError('El título es obligatorio');
    }
  }

  private validateEstimate(estimate: number | null | undefined): void {
    if (estimate === undefined || estimate === null) {
      return;
    }
    if (typeof estimate !== 'number' || Number.isNaN(estimate) || estimate < 0) {
      throw new ValidationError('La estimación debe ser un número no negativo');
    }
  }

  private isValidEnum<T extends Record<string, string>>(enumObject: T, value: string): boolean {
    return Object.values(enumObject).includes(value);
  }
}