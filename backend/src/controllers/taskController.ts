import type { Request, Response } from 'express';
import type { TaskService } from '../services/taskService.js';

export class TaskController {
  constructor(private readonly service: TaskService) {}

  async listTasks(_req: Request, res: Response): Promise<void> {
    const tasks = await this.service.getAllTasks();
    res.json(tasks);
  }

  async getTask(req: Request, res: Response): Promise<void> {
    const task = await this.service.getTask(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Tarea no encontrada' });
      return;
    }
    res.json(task);
  }

  async createTask(req: Request, res: Response): Promise<void> {
    const task = await this.service.createTask(req.body);
    res.status(201).json(task);
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    const task = await this.service.updateTask(req.params.id, req.body);
    if (!task) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Tarea no encontrada' });
      return;
    }
    res.json(task);
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    const task = await this.service.getTask(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Tarea no encontrada' });
      return;
    }
    await this.service.deleteTask(req.params.id);
    res.status(204).end();
  }
}