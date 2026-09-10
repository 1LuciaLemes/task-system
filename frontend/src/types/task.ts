export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETE = 'COMPLETE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  estimate: number | null;
  parentTaskId: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

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
  parentTaskId?: string | null;
}

export interface EffortSummary {
  total: number;
  pending: number;
  inProgress: number;
  complete: number;
}

export interface SubtreeStats {
  total: number;
  complete: number;
}

export interface ApiErrorPayload {
  error: string;
  message: string;
}