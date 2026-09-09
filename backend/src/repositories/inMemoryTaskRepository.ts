import type { Task } from '../models/task.js';
import type { UpdateTaskInput } from '../types/task.js';
import type { TaskRepository } from './taskRepository.js';

export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<string, Task>();

  async insert(task: Task): Promise<Task> {
    this.tasks.set(task.id, { ...task });
    return task;
  }

  async findById(id: string): Promise<Task | null> {
    const task = this.tasks.get(id);
    return task ? { ...task } : null;
  }

  async findAll(): Promise<Task[]> {
    return [...this.tasks.values()].map((task) => ({ ...task }));
  }

  async findByParentId(parentId: string | null): Promise<Task[]> {
    return [...this.tasks.values()]
      .filter((task) => task.parentTaskId === parentId)
      .map((task) => ({ ...task }));
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task | null> {
    const current = this.tasks.get(id);
    if (!current) {
      return null;
    }
    const updated: Task = {
      ...current,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.estimate !== undefined ? { estimate: input.estimate } : {}),
      ...(input.position !== undefined ? { position: input.position } : {}),
      updatedAt: new Date(),
    };
    this.tasks.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id);
  }
}