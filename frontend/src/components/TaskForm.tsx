import { FormEvent, useState } from 'react';
import {
  CreateTaskInput,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
} from '../types/task.js';
import { PRIORITY_DOT_CLASSES, PRIORITY_LABELS, STATUS_LABELS } from '../utils/labels.js';
import { validateTitleInput } from '../utils/validate.js';
import { Select } from './Select.js';

interface TaskFormProps {
  task?: Task;
  submitLabel: string;
  onSubmit: (input: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  onCancel: () => void;
}

const inputClasses =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand';

export function TaskForm({ task, submitLabel, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? TaskStatus.PENDING);
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? TaskPriority.MEDIUM,
  );
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
    const trimmedTitle = title.trim();
    const titleValidation = validateTitleInput(trimmedTitle);
    setTitleError(titleValidation);
    if (titleValidation) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const input: CreateTaskInput | UpdateTaskInput = {
        title: trimmedTitle,
        description: description.trim() || null,
        status,
        priority,
      };
      await onSubmit(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label htmlFor="title" className="mb-1 block text-xs font-medium text-ink-soft">
          Título *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          className={inputClasses}
          placeholder="Nombre de la tarea"
        />
        {titleError ? (
          <p className="mt-1 text-xs text-red-600">{titleError}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-xs font-medium text-ink-soft">
          Descripción
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={`${inputClasses} resize-none`}
          rows={4}
          placeholder="Descripción de la tarea"
        />
      </div>

      <div className={`grid gap-3 ${task?.parentTaskId ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">
            Estado
          </label>
          <Select
            value={status}
            ariaLabel="Estado"
            onChange={setStatus}
            options={Object.values(TaskStatus).map((value) => ({
              value,
              label: STATUS_LABELS[value],
            }))}
          />
        </div>
        {task?.parentTaskId ? null : (
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">
            Prioridad
          </label>
          <Select
            value={priority}
            ariaLabel="Prioridad"
            onChange={setPriority}
            options={Object.values(TaskPriority).map((value) => ({
              value,
              label: PRIORITY_LABELS[value],
            }))}
            renderValue={(option) => (
              <>
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    option ? PRIORITY_DOT_CLASSES[option.value] : ''
                  }`}
                />
                <span>{option?.label}</span>
              </>
            )}
            renderOption={(option) => (
              <>
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${PRIORITY_DOT_CLASSES[option.value]}`}
                />
                <span>{option.label}</span>
              </>
            )}
          />
        </div>
        )}
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-ink-soft hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-deep disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}