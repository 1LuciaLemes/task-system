import { TaskPriority, TaskStatus } from '../models/task.js';

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimate?: number | null;
  parentTaskId?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimate?: number | null;
  position?: number;
  parentTaskId?: string | null;
}

export interface EffortSummary {
  total: number;
  pending: number;
  inProgress: number;
  complete: number;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}