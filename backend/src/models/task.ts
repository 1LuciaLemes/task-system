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

export enum TaskKind {
  MAIN = 'MAIN',
  SUBTASK = 'SUBTASK',
}

export interface Task {
  id: string;
  kind: TaskKind;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  estimate: number | null;
  parentTaskId: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}