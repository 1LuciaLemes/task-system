import { describe, expect, it } from 'vitest';
import { Task, TaskKind, TaskPriority, TaskStatus } from '../types/task.js';
import { interpretQuery, normalizeText, searchTasks } from './taskSearch.js';

const makeDate = (
  year: number,
  monthIndex: number,
  day: number,
  hours: number,
  minutes: number,
): string => new Date(year, monthIndex, day, hours, minutes).toISOString();

const baseTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  kind: TaskKind.MAIN,
  title: 'Escribir informe',
  description: null,
  status: TaskStatus.PENDING,
  priority: TaskPriority.MEDIUM,
  estimate: null,
  parentTaskId: null,
  position: 0,
  createdAt: makeDate(2026, 8, 5, 14, 30),
  updatedAt: makeDate(2026, 8, 5, 14, 30),
  ...overrides,
});

describe('normalizeText', () => {
  it('quita acentos y pasa a minúsculas', () => {
    expect(normalizeText('ÁÉÍÓÚÑ')).toBe('aeiouñ');
    expect(normalizeText('Tarea Pendiente')).toBe('tarea pendiente');
  });
});

describe('interpretQuery', () => {
  it('detecta "hoy"', () => {
    expect(interpretQuery('hoy')).toEqual({ type: 'today' });
  });

  it('detecta una hora', () => {
    expect(interpretQuery('14:30')).toEqual({ type: 'time', hours: 14, minutes: 30 });
    expect(interpretQuery('9.05')).toEqual({ type: 'time', hours: 9, minutes: 5 });
  });

  it('rechaza horas inválidas', () => {
    expect(interpretQuery('25:30')).toEqual({ type: 'title' });
    expect(interpretQuery('12:99')).toEqual({ type: 'title' });
  });

  it('detecta día con nombre de mes', () => {
    expect(interpretQuery('5 septiembre')).toEqual({ type: 'date', day: 5, month: 9 });
    expect(interpretQuery('5 de septiembre')).toEqual({ type: 'date', day: 5, month: 9 });
    expect(interpretQuery('1 enero')).toEqual({ type: 'date', day: 1, month: 1 });
  });

  it('detecta fecha numérica dd/mm', () => {
    expect(interpretQuery('05/09')).toEqual({ type: 'date', day: 5, month: 9 });
  });

  it('trata el resto como título', () => {
    expect(interpretQuery('informe')).toEqual({ type: 'title' });
    expect(interpretQuery('')).toEqual({ type: 'title' });
  });
});

describe('searchTasks', () => {
  const tasks: Task[] = [
    baseTask({
      id: 'root',
      kind: TaskKind.MAIN,
      title: 'Informe mensual',
      createdAt: makeDate(2026, 8, 5, 14, 30),
    }),
    baseTask({
      id: 'sub',
      kind: TaskKind.SUBTASK,
      title: 'Recolectar datos',
      parentTaskId: 'root',
      createdAt: makeDate(2026, 8, 6, 9, 0),
    }),
    baseTask({
      id: 'other',
      kind: TaskKind.MAIN,
      title: 'Preparar reunión',
      createdAt: makeDate(2026, 2, 10, 18, 45),
    }),
  ];

  it('busca por título sin importar mayúsculas ni acentos', () => {
    const results = searchTasks(tasks, 'INFÓRME');
    expect(results.map((result) => result.task.id)).toEqual(['root']);
  });

  it('ignora acentos en el título', () => {
    const withAccent = baseTask({
      id: 'acc',
      title: 'Música y reunión',
      createdAt: '2026-01-01T08:00:00.000Z',
    });
    const results = searchTasks([...tasks, withAccent], 'MUSICA');
    expect(results.map((result) => result.task.id)).toEqual(['acc']);
  });

  it('devuelve vacío con consulta vacía', () => {
    expect(searchTasks(tasks, '   ')).toEqual([]);
    expect(searchTasks(tasks, '')).toEqual([]);
  });

  it('matchea "hoy" contra la fecha actual', () => {
    const today = new Date();
    const isoToday = makeDate(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0);
    const tasksToday = [
      baseTask({ id: 'a', title: 'De hoy', createdAt: isoToday }),
      baseTask({
        id: 'b',
        title: 'De otro día',
        createdAt: makeDate(2020, 0, 1, 10, 0),
      }),
    ];
    const results = searchTasks(tasksToday, 'hoy');
    expect(results.map((result) => result.task.id)).toEqual(['a']);
  });

  it('matchea un día y mes sin importar el año', () => {
    const results = searchTasks(tasks, '6 septiembre');
    expect(results.map((result) => result.task.id)).toEqual(['sub']);
  });

  it('matchea una hora exacta de creación o actualización', () => {
    const results = searchTasks(tasks, '18:45');
    expect(results.map((result) => result.task.id)).toEqual(['other']);
  });

  it('no matchea si la hora no coincide', () => {
    expect(searchTasks(tasks, '01:00')).toEqual([]);
  });

  it('ordena primero raíces y luego por fecha de creación', () => {
    const late = baseTask({
      id: 'late',
      kind: TaskKind.SUBTASK,
      title: 'Informe final',
      parentTaskId: 'root',
      createdAt: '2026-09-07T10:00:00.000Z',
    });
    const results = searchTasks([...tasks, late], 'informe');
    expect(results.map((result) => result.task.id)).toEqual(['root', 'late']);
  });
});