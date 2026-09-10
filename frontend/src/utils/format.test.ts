import { describe, expect, it } from 'vitest';
import { formatRelativeDate } from './format.js';

describe('formatRelativeDate', () => {
  it('muestra la hora si la creación tiene menos de 24 horas', () => {
    const iso = new Date().toISOString();
    expect(formatRelativeDate(iso)).toMatch(/^creada hoy \d{2}:\d{2}$/);
  });

  it('muestra día y mes si la creación tiene más de 24 horas', () => {
    const iso = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeDate(iso)).toMatch(/^creada \d{2}\/\d{2}$/);
  });

  it('devuelve vacío para fechas inválidas', () => {
    expect(formatRelativeDate('no-es-una-fecha')).toBe('');
  });
});