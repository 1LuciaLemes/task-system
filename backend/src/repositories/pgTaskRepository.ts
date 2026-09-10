import type { Pool } from 'pg';
import { Task, TaskKind, TaskPriority, TaskStatus } from '../models/task.js';
import type { UpdateTaskInput } from '../types/task.js';
import type { TaskRepository } from './taskRepository.js';

interface TaskRow {
  id: string;
  kind: TaskKind;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  estimate: number | null;
  parent_task_id: string | null;
  position: number;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: TaskRow): Task {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    estimate: row.estimate,
    parentTaskId: row.parent_task_id,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PgTaskRepository implements TaskRepository {
  constructor(private readonly pool: Pool) {}

  async insert(task: Task): Promise<Task> {
    const result = await this.pool.query<TaskRow>(
      `INSERT INTO tasks (
        id, kind, title, description, status, priority, estimate,
        parent_task_id, position, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        task.id,
        task.kind,
        task.title,
        task.description,
        task.status,
        task.priority,
        task.estimate,
        task.parentTaskId,
        task.position,
        task.createdAt,
        task.updatedAt,
      ],
    );
    return mapRow(result.rows[0]);
  }

  async findById(id: string): Promise<Task | null> {
    const result = await this.pool.query<TaskRow>(
      'SELECT * FROM tasks WHERE id = $1',
      [id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async findAll(): Promise<Task[]> {
    const result = await this.pool.query<TaskRow>('SELECT * FROM tasks');
    return result.rows.map(mapRow);
  }

  async findByParentId(parentId: string | null): Promise<Task[]> {
    const result = await this.pool.query<TaskRow>(
      'SELECT * FROM tasks WHERE parent_task_id IS NOT DISTINCT FROM $1 ORDER BY position, created_at',
      [parentId],
    );
    return result.rows.map(mapRow);
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task | null> {
    const columns: { column: string; value: unknown }[] = [];
    if (input.title !== undefined) {
      columns.push({ column: 'title', value: input.title });
    }
    if (input.description !== undefined) {
      columns.push({ column: 'description', value: input.description });
    }
    if (input.status !== undefined) {
      columns.push({ column: 'status', value: input.status });
    }
    if (input.priority !== undefined) {
      columns.push({ column: 'priority', value: input.priority });
    }
    if (input.estimate !== undefined) {
      columns.push({ column: 'estimate', value: input.estimate });
    }
    if (input.position !== undefined) {
      columns.push({ column: 'position', value: input.position });
    }
    if (input.parentTaskId !== undefined) {
      columns.push({ column: 'parent_task_id', value: input.parentTaskId });
    }

    const values: unknown[] = columns.map((column) => column.value);
    values.push(id);
    values.push(new Date());

    const sets = columns.map((column, index) => `${column.column} = $${index + 1}`);
    sets.push(`updated_at = $${columns.length + 1}`);

    const result = await this.pool.query<TaskRow>(
      `UPDATE tasks SET ${sets.join(', ')} WHERE id = $${columns.length + 2} RETURNING *`,
      values,
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  }
}