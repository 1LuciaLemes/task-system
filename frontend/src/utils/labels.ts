import { TaskPriority, TaskStatus } from '../types/task.js';

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Baja',
  [TaskPriority.MEDIUM]: 'Media',
  [TaskPriority.HIGH]: 'Alta',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'Pendiente',
  [TaskStatus.IN_PROGRESS]: 'En progreso',
  [TaskStatus.COMPLETE]: 'Completada',
};

export const PRIORITY_BADGE_CLASSES: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'bg-emerald-100 text-emerald-800',
  [TaskPriority.MEDIUM]: 'bg-amber-100 text-amber-800',
  [TaskPriority.HIGH]: 'bg-red-100 text-red-800',
};

export const PRIORITY_DOT_CLASSES: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'bg-slate-400',
  [TaskPriority.MEDIUM]: 'bg-amber-500',
  [TaskPriority.HIGH]: 'bg-red-500',
};

export const VIEW_LABELS = {
  board: 'Tablero',
  pending: 'Pendientes',
  completed: 'Completadas',
} as const;

export type ViewFilter = keyof typeof VIEW_LABELS;

export const SORT_LABELS = {
  position: 'Por orden',
  recent: 'Más reciente',
} as const;

export type SortBy = keyof typeof SORT_LABELS;

export type PriorityFilter = TaskPriority | 'all';