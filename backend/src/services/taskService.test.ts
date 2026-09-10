import { describe, expect, it } from 'vitest';
import { TaskPriority, TaskStatus } from '../models/task.js';
import { InMemoryTaskRepository } from '../repositories/inMemoryTaskRepository.js';
import { TaskService } from './taskService.js';
import { ValidationError } from '../types/task.js';

function setup() {
  const repository = new InMemoryTaskRepository();
  const service = new TaskService(repository);
  return { repository, service };
}

describe('TaskService - creación', () => {
  it('crea una tarea con valores por defecto', async () => {
    const { service } = setup();
    const task = await service.createTask({ title: 'Task A' });

    expect(task.id).toBeDefined();
    expect(task.title).toBe('Task A');
    expect(task.description).toBeNull();
    expect(task.status).toBe(TaskStatus.PENDING);
    expect(task.priority).toBe(TaskPriority.MEDIUM);
    expect(task.estimate).toBeNull();
    expect(task.parentTaskId).toBeNull();
    expect(task.position).toBe(0);
    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.updatedAt).toBeInstanceOf(Date);
  });

  it('rechaza un título vacío', async () => {
    const { service } = setup();
    await expect(service.createTask({ title: '' })).rejects.toThrow(ValidationError);
  });

  it('rechaza un título compuesto solo por espacios', async () => {
    const { service } = setup();
    await expect(service.createTask({ title: '   ' })).rejects.toThrow(ValidationError);
  });

  it('acepta una estimación en cero', async () => {
    const { service } = setup();
    const task = await service.createTask({ title: 'Task', estimate: 0 });
    expect(task.estimate).toBe(0);
  });

  it('rechaza una estimación negativa', async () => {
    const { service } = setup();
    await expect(service.createTask({ title: 'Task', estimate: -1 })).rejects.toThrow(
      ValidationError,
    );
  });

  it('rechaza un estado inválido', async () => {
    const { service } = setup();
    await expect(
      service.createTask({ title: 'Task', status: 'INVALID' as TaskStatus }),
    ).rejects.toThrow(ValidationError);
  });

  it('rechaza una prioridad inválida', async () => {
    const { service } = setup();
    await expect(
      service.createTask({ title: 'Task', priority: 'INVALID' as TaskPriority }),
    ).rejects.toThrow(ValidationError);
  });

  it('rechaza una subtarea con padre inexistente', async () => {
    const { service } = setup();
    await expect(
      service.createTask({ title: 'Subtask', parentTaskId: 'missing' }),
    ).rejects.toThrow(ValidationError);
  });

  it('asigna posiciones secuenciales entre hermanas', async () => {
    const { service } = setup();
    await service.createTask({ title: 'A' });
    await service.createTask({ title: 'B' });
    const c = await service.createTask({ title: 'C' });

    expect(c.position).toBe(2);
  });

  it('asigna posiciones de forma independiente entre grupos de hermanas', async () => {
    const { service } = setup();
    const root = await service.createTask({ title: 'Root' });
    await service.createTask({ title: 'Root 2' });
    const sub = await service.createTask({ title: 'Sub', parentTaskId: root.id });

    expect(sub.position).toBe(0);
  });
});

describe('TaskService - jerarquía', () => {
  it('devuelve solo tareas raíz ordenadas por posición', async () => {
    const { service } = setup();
    const a = await service.createTask({ title: 'A' });
    const b = await service.createTask({ title: 'B' });
    await service.createTask({ title: 'Sub of A', parentTaskId: a.id });
    await service.createTask({ title: 'Sub of B', parentTaskId: b.id });

    const roots = await service.getRootTasks();
    expect(roots.map((task) => task.title)).toEqual(['A', 'B']);
  });

  it('devuelve las subtareas de un padre ordenadas por posición', async () => {
    const { service } = setup();
    const root = await service.createTask({ title: 'Root' });
    await service.createTask({ title: 'Sub 1', parentTaskId: root.id });
    const sub2 = await service.createTask({ title: 'Sub 2', parentTaskId: root.id });

    const subtasks = await service.getSubtasks(root.id);
    expect(subtasks.map((task) => task.title)).toEqual(['Sub 1', 'Sub 2']);
    expect(subtasks.every((task) => task.parentTaskId === root.id)).toBe(true);
  });
});

describe('TaskService - actualización', () => {
  it('actualiza los campos permitidos y conserva el padre', async () => {
    const { service } = setup();
    const root = await service.createTask({ title: 'Root' });
    const sub = await service.createTask({ title: 'Sub', parentTaskId: root.id });

    const updated = await service.updateTask(sub.id, {
      title: 'Sub updated',
      status: TaskStatus.COMPLETE,
    });

    expect(updated?.title).toBe('Sub updated');
    expect(updated?.status).toBe(TaskStatus.COMPLETE);
    expect(updated?.parentTaskId).toBe(root.id);
    expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(sub.updatedAt.getTime());
  });

  it('devuelve null cuando la tarea no existe', async () => {
    const { service } = setup();
    const updated = await service.updateTask('missing', { title: 'X' });
    expect(updated).toBeNull();
  });

  it('valida título y estimación al actualizar', async () => {
    const { service } = setup();
    const task = await service.createTask({ title: 'Task' });

    await expect(service.updateTask(task.id, { title: '   ' })).rejects.toThrow(ValidationError);
    await expect(service.updateTask(task.id, { estimate: -5 })).rejects.toThrow(ValidationError);
  });

  it('mueve una subtarea a otro padre y asigna posición al final', async () => {
    const { service } = setup();
    const a = await service.createTask({ title: 'A' });
    const b = await service.createTask({ title: 'B' });
    const sub = await service.createTask({ title: 'Sub', parentTaskId: a.id });
    await service.createTask({ title: 'Sibling', parentTaskId: b.id });

    const updated = await service.updateTask(sub.id, { parentTaskId: b.id });

    expect(updated?.parentTaskId).toBe(b.id);
    const siblings = await service.getSubtasks(b.id);
    expect(siblings.map((task) => task.id)).toEqual(expect.arrayContaining([updated?.id]));
    expect(updated?.position).toBe(Math.max(...siblings.map((task) => task.position)));
  });

  it('mueve una subtarea a la raíz con parentTaskId null', async () => {
    const { service } = setup();
    const a = await service.createTask({ title: 'A' });
    const sub = await service.createTask({ title: 'Sub', parentTaskId: a.id });

    const updated = await service.updateTask(sub.id, { parentTaskId: null });

    expect(updated?.parentTaskId).toBeNull();
    expect((await service.getRootTasks()).map((task) => task.id)).toContain(sub.id);
  });

  it('rechaza mover una tarea a un padre inexistente', async () => {
    const { service } = setup();
    const root = await service.createTask({ title: 'Root' });
    const sub = await service.createTask({ title: 'Sub', parentTaskId: root.id });

    await expect(service.updateTask(sub.id, { parentTaskId: 'missing' })).rejects.toThrow(
      ValidationError,
    );
  });

  it('rechaza que una tarea sea su propio padre', async () => {
    const { service } = setup();
    const root = await service.createTask({ title: 'Root' });

    await expect(service.updateTask(root.id, { parentTaskId: root.id })).rejects.toThrow(
      ValidationError,
    );
  });

  it('rechaza mover una tarea a un descendiente propio (ciclo)', async () => {
    const { service } = setup();
    const a = await service.createTask({ title: 'A' });
    const b = await service.createTask({ title: 'B', parentTaskId: a.id });
    const c = await service.createTask({ title: 'C', parentTaskId: b.id });

    await expect(service.updateTask(a.id, { parentTaskId: c.id })).rejects.toThrow(
      ValidationError,
    );
  });
});

describe('TaskService - eliminación', () => {
  it('elimina una tarea sin descendientes', async () => {
    const { service } = setup();
    const task = await service.createTask({ title: 'Task' });

    await service.deleteTask(task.id);

    expect(await service.getTask(task.id)).toBeNull();
  });

  it('elimina todos los descendientes en cascada (varios niveles)', async () => {
    const { service } = setup();
    const root = await service.createTask({ title: 'Root' });
    const sub = await service.createTask({ title: 'Sub', parentTaskId: root.id });
    const leaf = await service.createTask({ title: 'Leaf', parentTaskId: sub.id });

    await service.deleteTask(root.id);

    expect(await service.getTask(root.id)).toBeNull();
    expect(await service.getTask(sub.id)).toBeNull();
    expect(await service.getTask(leaf.id)).toBeNull();
  });

  it('no elimina tareas hermanas', async () => {
    const { service } = setup();
    const a = await service.createTask({ title: 'A' });
    const b = await service.createTask({ title: 'B' });

    await service.deleteTask(a.id);

    expect(await service.getTask(b.id)).not.toBeNull();
  });
});

describe('TaskService - descendientes incompletos', () => {
  it('devuelve true cuando un descendiente está pendiente', async () => {
    const { service } = setup();
    const root = await service.createTask({ title: 'Root', status: TaskStatus.COMPLETE });
    await service.createTask({ title: 'Sub', parentTaskId: root.id });

    expect(await service.hasIncompleteDescendants(root.id)).toBe(true);
  });

  it('devuelve true para un descendiente incompleto en lo profundo del árbol', async () => {
    const { service } = setup();
    const root = await service.createTask({ title: 'Root', status: TaskStatus.COMPLETE });
    const sub = await service.createTask({
      title: 'Sub',
      parentTaskId: root.id,
      status: TaskStatus.COMPLETE,
    });
    await service.createTask({
      title: 'Leaf',
      parentTaskId: sub.id,
      status: TaskStatus.IN_PROGRESS,
    });

    expect(await service.hasIncompleteDescendants(root.id)).toBe(true);
  });

  it('devuelve false cuando todos los descendientes están completos', async () => {
    const { service } = setup();
    const root = await service.createTask({ title: 'Root', status: TaskStatus.COMPLETE });
    await service.createTask({
      title: 'Sub',
      parentTaskId: root.id,
      status: TaskStatus.COMPLETE,
    });

    expect(await service.hasIncompleteDescendants(root.id)).toBe(false);
  });

  it('devuelve false cuando la tarea no tiene descendientes', async () => {
    const { service } = setup();
    const task = await service.createTask({ title: 'Task' });

    expect(await service.hasIncompleteDescendants(task.id)).toBe(false);
  });
});

describe('TaskService - estimaciones', () => {
  it('calcula la estimación del subárbol recursivamente', async () => {
    const { service } = setup();
    const root = await service.createTask({ title: 'Root', estimate: 10 });
    const sub = await service.createTask({ title: 'Sub', estimate: 2, parentTaskId: root.id });
    await service.createTask({ title: 'Leaf', estimate: 5, parentTaskId: sub.id });

    expect(await service.getSubtreeEstimate(root.id)).toBe(17);
    expect(await service.getSubtreeEstimate(sub.id)).toBe(7);
  });

  it('ignora estimaciones nulas en el total del subárbol', async () => {
    const { service } = setup();
    const root = await service.createTask({ title: 'Root', estimate: 10 });
    await service.createTask({ title: 'Sub', parentTaskId: root.id });

    expect(await service.getSubtreeEstimate(root.id)).toBe(10);
  });

  it('calcula el resumen de esfuerzo en toda la jerarquía', async () => {
    const { service } = setup();
    const root = await service.createTask({ title: 'Root', estimate: 10, status: TaskStatus.PENDING });
    await service.createTask({
      title: 'Frontend',
      estimate: 5,
      parentTaskId: root.id,
      status: TaskStatus.IN_PROGRESS,
    });
    await service.createTask({
      title: 'Navbar',
      estimate: 2,
      parentTaskId: root.id,
      status: TaskStatus.COMPLETE,
    });
    const other = await service.createTask({ title: 'Other', estimate: 20, status: TaskStatus.PENDING });

    const summary = await service.getEffortSummary();

    expect(summary.total).toBe(37);
    expect(summary.pending).toBe(30);
    expect(summary.inProgress).toBe(5);
    expect(summary.complete).toBe(2);
    expect(summary.pending + summary.inProgress + summary.complete).toBe(summary.total);
  });
});