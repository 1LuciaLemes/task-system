import { DragEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { CreateTaskInput, Task, TaskStatus } from '../types/task.js';
import { STATUS_LABELS } from '../utils/labels.js';
import { pluralize } from '../utils/plural.js';
import { TaskNode } from '../utils/tree.js';
import { InlineSubtaskForm } from './InlineSubtaskForm.js';
import { StatusDot } from './StatusDot.js';

interface SubtaskRowProps {
  task: Task;
  children: TaskNode[];
  depth: number;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onCycleStatus: (task: Task) => void;
  onCreateSubtask: (parentId: string, input: CreateTaskInput) => void;
  onRequestDelete: (task: Task) => void;
  onMoveTask: (taskId: string, newParentId: string | null) => void;
}

export function SubtaskRow({
  task,
  children,
  depth,
  onOpen,
  onEdit,
  onCycleStatus,
  onCreateSubtask,
  onRequestDelete,
  onMoveTask,
}: SubtaskRowProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    right: number;
    up: boolean;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (event: MouseEvent<HTMLButtonElement>) => {
    if (menuStyle) {
      setMenuStyle(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setMenuStyle({
      top: rect.top,
      right: window.innerWidth - rect.right,
      up: spaceBelow < 190,
    });
  };

  useEffect(() => {
    if (!menuStyle) {
      return;
    }
    const close = () => setMenuStyle(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menuStyle]);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuStyle(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
    draggedTask: Task,
  ) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, input')) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedTask.id);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes('text/plain')) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      if (!dragOver) {
        setDragOver(true);
      }
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const taskId = event.dataTransfer.getData('text/plain');
    if (taskId && taskId !== task.id) {
      onMoveTask(taskId, task.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`rounded-xl border border-slate-200 bg-white transition-colors ${
        dragOver ? 'bg-brand-light ring-1 ring-brand' : ''
      }`}
    >
      <div
        draggable
        onDragStart={(event) => handleDragStart(event, task)}
        className="group flex cursor-grab items-center gap-1.5 rounded-lg py-1.5 transition-colors hover:bg-slate-50 active:cursor-grabbing"
        style={{ paddingLeft: `${4 + depth * 14}px` }}
      >
        <button
          type="button"
          onClick={() => onCycleStatus(task)}
          className="flex h-6 w-6 shrink-0 items-center justify-center"
          title={`Cambiar estado: ${STATUS_LABELS[task.status]}`}
        >
          <StatusDot status={task.status} size="sm" />
        </button>

        {children.length > 0 ? (
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="flex h-6 w-6 shrink-0 items-center justify-center text-ink-faint hover:text-ink"
            title={collapsed ? 'Expandir' : 'Contraer'}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {collapsed ? (
                <path d="m9 6 6 6-6 6" />
              ) : (
                <path d="m6 9 6 6 6-6" />
              )}
            </svg>
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => onEdit(task)}
          className={`min-w-0 flex-1 text-left ${
            task.status === TaskStatus.COMPLETE ? 'text-ink-faint' : 'text-ink'
          }`}
        >
          <span className={`block truncate text-sm ${task.status === TaskStatus.COMPLETE ? 'line-through' : ''}`}>
            {task.title}
          </span>
          {children.length > 0 ? (
            <span className="block truncate text-xs text-ink-faint">
              {pluralize(children.length, 'subtarea')}
            </span>
          ) : null}
        </button>

        <div
          ref={menuRef}
          className="relative mr-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <button
            type="button"
            onClick={toggleMenu}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-soft hover:bg-slate-100"
            title="Acciones"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <circle cx="5" cy="12" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="19" cy="12" r="1.6" />
            </svg>
          </button>
          {menuStyle ? (
            <div
              className="fixed z-50 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
              style={{
                top: menuStyle.up ? menuStyle.top - 4 : menuStyle.top + 28,
                right: menuStyle.right,
                transform: menuStyle.up ? 'translateY(-100%)' : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMenuStyle(null);
                  onEdit(task);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-slate-50"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuStyle(null);
                  setShowAddForm(true);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-slate-50"
              >
                Añadir subtarea
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuStyle(null);
                  onRequestDelete(task);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {showAddForm ? (
        <div className="mt-1 w-full" style={{ paddingLeft: `${4 + (depth + 1) * 14}px` }}>
          <InlineSubtaskForm
            onSubmit={(input) => onCreateSubtask(task.id, input)}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      ) : null}

      {!collapsed && children.length > 0 ? (
        <div className="ml-3 mb-1 mt-2 flex flex-col gap-2 border-l border-slate-100 pl-1">
          {children.map((child) => (
            <SubtaskRow
              key={child.id}
              task={child}
              children={child.children}
              depth={depth + 1}
              onOpen={onOpen}
              onEdit={onEdit}
              onCycleStatus={onCycleStatus}
              onCreateSubtask={onCreateSubtask}
              onRequestDelete={onRequestDelete}
              onMoveTask={onMoveTask}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}