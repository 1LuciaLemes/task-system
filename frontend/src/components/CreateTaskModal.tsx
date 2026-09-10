import { FormEvent, useEffect, useRef, useState } from 'react';
import { CreateTaskInput, Task, TaskPriority, TaskStatus } from '../types/task.js';
import { PRIORITY_DOT_CLASSES, PRIORITY_LABELS, STATUS_LABELS } from '../utils/labels.js';
import { validateTitleInput } from '../utils/validate.js';
import { Select } from './Select.js';

interface PendingSubtask {
  key: number;
  title: string;
  description: string | null;
}

interface CreateTaskModalProps {
  onCreateTask: (input: CreateTaskInput) => Promise<Task>;
  onCreateSubtask: (parentId: string, input: CreateTaskInput) => Promise<Task>;
  onClose: () => void;
}

const inputClasses =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand';

interface SubtaskAdderProps {
  initial?: { title: string; description: string | null } | null;
  onConfirm: (input: CreateTaskInput) => void;
  onCancel: () => void;
}

function SubtaskAdder({ initial, onConfirm, onCancel }: SubtaskAdderProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(initial?.title ?? '');
    setDescription(initial?.description ?? '');
    setTitleError(null);
  }, [initial]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (titleError && value.trim()) {
      setTitleError(null);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const titleValidation = validateTitleInput(title);
    setTitleError(titleValidation);
    if (titleValidation) {
      return;
    }

    onConfirm({
      title: title.trim(),
      description: description.trim() || null,
    });
    setTitle('');
    setDescription('');
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

      <div>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
          rows={2}
          placeholder="Descripción de la subtarea"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-ink-soft hover:bg-slate-50"
        >
          Ocultar
        </button>
        <button
          type="submit"
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-deep"
        >
          Confirmar
        </button>
      </div>
    </form>
  );
}

export function CreateTaskModal({
  onCreateTask,
  onCreateSubtask,
  onClose,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.PENDING);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<PendingSubtask[]>([]);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextKey = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (titleError && value.trim()) {
      setTitleError(null);
    }
  };

  const handleAddSubtask = (input: CreateTaskInput) => {
    setSubtasks((list) => [
      ...list,
      {
        key: nextKey.current++,
        title: input.title,
        description: input.description ?? null,
      },
    ]);
    setAddingSubtask(false);
    setEditingKey(null);
  };

  const handleEditSubtask = (key: number, input: CreateTaskInput) => {
    setSubtasks((list) =>
      list.map((subtask) =>
        subtask.key === key
          ? { ...subtask, title: input.title, description: input.description ?? null }
          : subtask,
      ),
    );
    setAddingSubtask(false);
    setEditingKey(null);
  };

  const handleRemoveSubtask = (key: number) => {
    setSubtasks((list) => list.filter((subtask) => subtask.key !== key));
    if (editingKey === key) {
      setEditingKey(null);
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
      const root = await onCreateTask({
        title: trimmedTitle,
        description: description.trim() || null,
        status,
        priority,
      });
      for (const subtask of subtasks) {
        await onCreateSubtask(root.id, {
          title: subtask.title,
          description: subtask.description,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Nueva tarea</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="new-task-title" className="mb-1 block text-xs font-medium text-ink-soft">
              Título *
            </label>
            <input
              id="new-task-title"
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
            <label htmlFor="new-task-description" className="mb-1 block text-xs font-medium text-ink-soft">
              Descripción
            </label>
            <textarea
              id="new-task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={`${inputClasses} resize-none`}
              rows={3}
              placeholder="Descripción de la tarea"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
          </div>
        </form>

        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Subtareas
            </p>
            {!addingSubtask ? (
              <button
                type="button"
                onClick={() => setAddingSubtask(true)}
                className="rounded-lg px-2 py-1 text-sm font-medium text-brand hover:bg-brand-light"
              >
                + Añadir subtarea
              </button>
            ) : null}
          </div>

          {addingSubtask ? (
            <div className="flex flex-col gap-2">
              <SubtaskAdder
                initial={
                  editingKey != null
                    ? subtasks.find((subtask) => subtask.key === editingKey) ?? null
                    : null
                }
                onConfirm={
                  editingKey != null
                    ? (input) => handleEditSubtask(editingKey, input)
                    : handleAddSubtask
                }
                onCancel={() => {
                  setAddingSubtask(false);
                  setEditingKey(null);
                }}
              />
            </div>
          ) : null}

          {subtasks.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1">
              {subtasks.map((subtask) => (
                <li
                  key={subtask.key}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {subtask.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingKey(subtask.key);
                      setAddingSubtask(true);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-ink-soft hover:bg-slate-100"
                    title="Editar subtarea"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(subtask.key)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                    title="Quitar subtarea"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-ink-soft hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={submitting}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-deep disabled:opacity-60"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}