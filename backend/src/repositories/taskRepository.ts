import type { Task } from '../models/task.js';
import type { UpdateTaskInput } from '../types/task.js';

export interface TaskRepository {
  insert(task: Task): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  findByParentId(parentId: string | null): Promise<Task[]>;
  update(id: string, input: UpdateTaskInput): Promise<Task | null>;
  delete(id: string): Promise<void>;
}