import { describe, expect, it } from 'vitest';
import { parseEstimate, validateEstimateInput, validateTitleInput } from './validate.js';

describe('validateTitleInput', () => {
  it('devuelve null para un título válido', () => {
    expect(validateTitleInput('Escribir tests')).toBeNull();
    expect(validateTitleInput('  Escribir tests  ')).toBeNull();
  });

  it('rechaza un título vacío o solo espacios', () => {
    expect(validateTitleInput('')).toBe('El título es obligatorio');
    expect(validateTitleInput('   ')).toBe('El título es obligatorio');
  });
});

describe('validateEstimateInput', () => {
  it('acepta vacío, enteros y decimales', () => {
    expect(validateEstimateInput('')).toBeNull();
    expect(validateEstimateInput('0')).toBeNull();
    expect(validateEstimateInput('5')).toBeNull();
    expect(validateEstimateInput('4.5')).toBeNull();
  });

  it('acepta coma como separador decimal', () => {
    expect(validateEstimateInput('4,5')).toBeNull();
  });

  it('rechaza negativos incluso con solo el signo', () => {
    expect(validateEstimateInput('-')).toBe('La estimación no puede ser negativa');
    expect(validateEstimateInput('-1')).toBe('La estimación no puede ser negativa');
    expect(validateEstimateInput('-0.5')).toBe('La estimación no puede ser negativa');
  });

  it('rechaza valores no numéricos', () => {
    expect(validateEstimateInput('abc')).toBe('La estimación debe ser un número positivo');
    expect(validateEstimateInput('5h')).toBe('La estimación debe ser un número positivo');
  });
});

describe('parseEstimate', () => {
  it('convierte texto a número o null', () => {
    expect(parseEstimate('')).toBeNull();
    expect(parseEstimate('3')).toBe(3);
    expect(parseEstimate('4,5')).toBe(4.5);
  });
});