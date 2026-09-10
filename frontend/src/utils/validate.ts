export function validateTitleInput(title: string): string | null {
  return title.trim() ? null : 'El título es obligatorio';
}

export function validateEstimateInput(raw: string): string | null {
  const value = raw.trim().replace(',', '.');
  if (value === '') {
    return null;
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