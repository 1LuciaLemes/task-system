import { Task } from '../types/task.js';

export type SearchField = 'createdAt' | 'updatedAt';

export interface SearchResult {
  task: Task;
  field: SearchField;
}

export interface TitleQuery {
  type: 'title';
}

export interface TodayQuery {
  type: 'today';
}

export interface DateQuery {
  type: 'date';
  day: number;
  month: number;
}

export interface TimeQuery {
  type: 'time';
  hours: number;
  minutes: number;
}

export type TaskQuery = TitleQuery | TodayQuery | DateQuery | TimeQuery;

const MONTHS: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u0302\u0304-\u036f]/g, '')
    .normalize('NFC');
}

export function interpretQuery(raw: string): TaskQuery {
  const text = raw.trim().toLowerCase();
  if (!text) {
    return { type: 'title' };
  }
  if (text === 'hoy' || text === 'el dia de hoy' || text === 'el día de hoy') {
    return { type: 'today' };
  }
  const timeMatch = text.match(/^(\d{1,2})[:.]([0-5]\d)$/);
  if (timeMatch) {
    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    if (hours >= 0 && hours <= 23) {
      return { type: 'time', hours, minutes };
    }
  }
  const dateMatch = text.match(/^(\d{1,2})\s+(?:de\s+)?([a-záéíóúñ]+)$/);
  if (dateMatch) {
    const month = MONTHS[normalizeText(dateMatch[2])];
    const day = Number(dateMatch[1]);
    if (month && day >= 1 && day <= 31) {
      return { type: 'date', day, month };
    }
  }
  const inlineDate = text.match(/^(\d{1,2})[\/-](\d{1,2})$/);
  if (inlineDate) {
    const day = Number(inlineDate[1]);
    const month = Number(inlineDate[2]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return { type: 'date', day, month };
    }
  }
  return { type: 'title' };
}

function sameMonthDay(a: Date, b: Date): boolean {
  return a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function sameClock(a: Date, hours: number, minutes: number): boolean {
  return a.getHours() === hours && a.getMinutes() === minutes;
}

function matchByDate(
  task: Task,
  match: (date: Date) => boolean,
): SearchResult | null {
  const createdAt = new Date(task.createdAt);
  const updatedAt = new Date(task.updatedAt);
  if (match(createdAt)) {
    return { task, field: 'createdAt' };
  }
  if (match(updatedAt)) {
    return { task, field: 'updatedAt' };
  }
  return null;
}

export function searchTasks(tasks: Task[], rawQuery: string): SearchResult[] {
  const query = interpretQuery(rawQuery);
  let results: SearchResult[];
  if (query.type === 'title') {
    const normalized = normalizeText(rawQuery.trim());
    if (!normalized) {
      return [];
    }
    const unique = new Set<string>();
    results = tasks
      .filter((task) => {
        if (unique.has(task.id)) {
          return false;
        }
        unique.add(task.id);
        return normalizeText(task.title).includes(normalized);
      })
      .map((task) => ({ task, field: 'createdAt' as SearchField }));
  } else {
    const matcher =
      query.type === 'today'
        ? (date: Date) => sameMonthDay(date, new Date())
        : query.type === 'date'
          ? (date: Date) =>
              date.getDate() === query.day &&
              date.getMonth() === query.month - 1
          : (date: Date) => sameClock(date, query.hours, query.minutes);
    results = [];
    for (const task of tasks) {
      const match = matchByDate(task, matcher);
      if (match) {
        results.push(match);
      }
    }
  }
  return results.sort((a, b) => {
    if (a.task.kind !== b.task.kind) {
      return a.task.kind === 'MAIN' ? -1 : 1;
    }
    const timeA = new Date(a.task.createdAt).getTime();
    const timeB = new Date(b.task.createdAt).getTime();
    return timeA - timeB;
  });
}