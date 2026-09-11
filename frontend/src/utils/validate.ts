export function validateTitleInput(title: string): string | null {
  return title.trim() ? null : 'El título es obligatorio';
}

export function validateEstimateLive(raw: string): string | null {
  if (raw.trim().startsWith('-')) {
    return 'La estimación no puede ser negativa';
  }
  return null;
}

export function validateEstimateInput(raw: string): string | null {
  const value = raw.trim().replace(',', '.');
  if (value === '') {
    return null;
  }
  if (value.startsWith('-')) {
    return 'La estimación no puede ser negativa';
  }
  if (!/^\d+(\.\d+)?$/.test(value)) {
    return 'La estimación debe ser un número positivo';
  }
  return null;
}

export function parseEstimate(raw: string): number | null {
  const value = raw.trim().replace(',', '.');
  if (value === '') {
    return null;
  }
  return Number(value);
}