export function formatEstimate(estimate: number | null): string {
  if (estimate === null || estimate === undefined) {
    return '';
  }
  return `${estimate}h`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const elapsed = Date.now() - date.getTime();
  if (elapsed >= 0 && elapsed < 24 * 60 * 60 * 1000) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `creada hoy ${hours}:${minutes}`;
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `creada ${day}/${month}`;
}

export function truncateDescription(description: string | null, maxLength = 90): string {
  if (!description) {
    return '';
  }
  if (description.length <= maxLength) {
    return description;
  }
  return `${description.slice(0, maxLength).trimEnd()}...`;
}