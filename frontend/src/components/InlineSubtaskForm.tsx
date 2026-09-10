import { FormEvent, useState } from 'react';
import { CreateTaskInput } from '../types/task.js';
import { validateTitleInput } from '../utils/validate.js';

interface InlineSubtaskFormProps {
  onSubmit: (input: CreateTaskInput) => void | Promise<void>;
  onCancel?: () => void;
}

export function InlineSubtaskForm({ onSubmit, onCancel }: InlineSubtaskFormProps) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (titleError && value.trim()) {
      setTitleError(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validation = validateTitleInput(title);
    setTitleError(validation);
    if (validation) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ title: title.trim() });
      setTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div>
        <input
          type="text"
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
          placeholder="Título de la subtarea"
        />
        {titleError ? (
          <p className="mt-1 text-xs text-red-600">{titleError}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-1.5">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-ink-soft hover:bg-slate-50"
          >
            Ocultar
          </button>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-deep disabled:opacity-60"
        >
          Confirmar
        </button>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}