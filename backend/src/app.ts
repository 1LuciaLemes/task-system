import express, { NextFunction, Request, Response } from 'express';
import type { TaskRepository } from './repositories/taskRepository.js';
import { InMemoryTaskRepository } from './repositories/inMemoryTaskRepository.js';
import { TaskService } from './services/taskService.js';
import { TaskController } from './controllers/taskController.js';
import { createTaskRouter } from './routes/taskRoutes.js';
import { ValidationError } from './types/task.js';

export function createApp(repository: TaskRepository = new InMemoryTaskRepository()) {
  const app = express();
  app.use(express.json());

  const service = new TaskService(repository);
  const controller = new TaskController(service);
  app.use('/tasks', createTaskRouter(controller));

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ValidationError) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: err.message });
      return;
    }
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error interno del servidor' });
  });

  return app;
}

export const app = createApp();