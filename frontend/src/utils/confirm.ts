import { Task } from '../types/task.js';
import { getDescendantIds, hasIncompleteSubtasks } from './tree.js';

export function buildDeleteMessage(tasks: Task[], task: Task): { title: string; message: string } {
  const descendants = getDescendantIds(tasks, task.id);
  if (descendants.length === 0) {
    return {
      title: 'Eliminar tarea',
      message: `¿Deseas eliminar la tarea "${task.title}"?`,
    };
  }
  if (hasIncompleteSubtasks(tasks, task.id)) {
    return {
      title: 'Eliminar tarea',
      message: `Tienes tareas incompletas, ¿aún así deseas eliminar la tarea "${task.title}"?`,
    };
  }
  return {
    title: 'Eliminar tarea',
    message: `¿Deseas eliminar la tarea "${task.title}"? Las subtareas también se eliminarán.`,
  };
}